// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · STUDIO COPILOT — agentic loop driver
// Provider-agnostic. Sends history+tools to the model; executes SAFE tools
// server-side and loops; any CONFIRM tool in a turn STOPS the whole batch and
// returns a pending-confirmation (the server never runs a confirm tool until
// the operator approves via the resume path in the chat route).
// Bounded by MAX_ITERS and a wall-clock budget to fit Vercel's 60s ceiling.
// ─────────────────────────────────────────────────────────────────────────

import type { ChatMsg, Provider, ToolCall, ToolResultMsg } from './providers/types';
import { PROVIDER_TOOLS, TOOL_MAP, type ToolContext, type ToolResult } from './tools';

const MAX_ITERS = 5;
const TIME_BUDGET_MS = 50_000;
const MAX_TOKENS = 4096;

export type ToolEvent = { name: string; ok: boolean; summary: string };
export type PendingAction = { toolCallId: string; name: string; args: Record<string, unknown>; preview: string };

export type NewMessage = {
  role: 'assistant' | 'tool';
  content?: string;
  toolCallsJson?: { calls?: ToolCall[]; pending?: PendingAction[] };
  toolResultsJson?: ToolResultMsg[];
  status: 'complete' | 'pending';
  provider?: string;
};

export type LoopResult =
  | { kind: 'final'; text: string; newMessages: NewMessage[]; toolEvents: ToolEvent[] }
  | { kind: 'pending_confirmation'; text: string; pending: PendingAction[]; newMessages: NewMessage[]; toolEvents: ToolEvent[] };

function resultToText(r: ToolResult): string {
  let t = r.summary;
  if (r.data !== undefined) {
    const json = JSON.stringify(r.data);
    if (json && json !== '{}' && json !== 'null' && json !== '[]') t += `\n${json.slice(0, 2500)}`;
  }
  return t;
}

/** Validate + run one tool call, always returning a tool_result (never throws). */
export async function executeToolCall(call: ToolCall, ctx: ToolContext): Promise<ToolResultMsg> {
  const tool = TOOL_MAP.get(call.name);
  if (!tool) return { toolCallId: call.id, name: call.name, content: `Unknown tool: ${call.name}`, isError: true };
  const parsed = tool.parameters.safeParse(call.args);
  if (!parsed.success) {
    return {
      toolCallId: call.id,
      name: call.name,
      content: `Invalid arguments: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`,
      isError: true,
    };
  }
  try {
    const r = await tool.run(parsed.data, ctx);
    return { toolCallId: call.id, name: call.name, content: resultToText(r), isError: !r.ok };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { toolCallId: call.id, name: call.name, content: `Tool error: ${msg}`, isError: true };
  }
}

export function toEvent(tr: ToolResultMsg): ToolEvent {
  return { name: tr.name, ok: !tr.isError, summary: (tr.content ?? '').split('\n')[0].slice(0, 160) };
}

export async function runLoop(opts: {
  provider: Provider;
  system: string;
  grounding?: string;
  history: ChatMsg[];
  ctx: ToolContext;
}): Promise<LoopResult> {
  const { provider, system, grounding, ctx } = opts;
  const newMessages: NewMessage[] = [];
  const toolEvents: ToolEvent[] = [];
  const history = [...opts.history];
  const started = Date.now();

  for (let i = 0; i < MAX_ITERS; i++) {
    if (Date.now() - started > TIME_BUDGET_MS) {
      const text = 'Stopped — this turn hit the time budget. Ask me to continue.';
      newMessages.push({ role: 'assistant', content: text, status: 'complete', provider: provider.id });
      return { kind: 'final', text, newMessages, toolEvents };
    }

    const res = await provider.send({ system, grounding, messages: history, tools: PROVIDER_TOOLS, maxTokens: MAX_TOKENS });

    // No tools → final answer.
    if (res.toolCalls.length === 0) {
      const text = res.assistantText || '(no response)';
      newMessages.push({ role: 'assistant', content: text, status: 'complete', provider: provider.id });
      return { kind: 'final', text, newMessages, toolEvents };
    }

    // Any confirm tool → stop the whole batch and await operator approval.
    const hasConfirm = res.toolCalls.some((c) => TOOL_MAP.get(c.name)?.risk === 'confirm');
    if (hasConfirm) {
      const pending: PendingAction[] = res.toolCalls
        .filter((c) => TOOL_MAP.get(c.name)?.risk === 'confirm')
        .map((c) => ({ toolCallId: c.id, name: c.name, args: c.args, preview: TOOL_MAP.get(c.name)?.preview?.(c.args) ?? c.name }));
      newMessages.push({
        role: 'assistant',
        content: res.assistantText,
        status: 'pending',
        provider: provider.id,
        toolCallsJson: { calls: res.toolCalls, pending },
      });
      return { kind: 'pending_confirmation', text: res.assistantText, pending, newMessages, toolEvents };
    }

    // All safe → record the assistant turn, execute, append results, loop.
    newMessages.push({
      role: 'assistant',
      content: res.assistantText,
      status: 'complete',
      provider: provider.id,
      toolCallsJson: { calls: res.toolCalls },
    });
    history.push({ role: 'assistant', content: res.assistantText, toolCalls: res.toolCalls });

    const results: ToolResultMsg[] = [];
    for (const c of res.toolCalls) {
      const tr = await executeToolCall(c, ctx);
      results.push(tr);
      toolEvents.push(toEvent(tr));
    }
    newMessages.push({ role: 'tool', status: 'complete', toolResultsJson: results });
    history.push({ role: 'tool', results });
  }

  const text = 'Reached the step limit for one turn. Want me to keep going?';
  newMessages.push({ role: 'assistant', content: text, status: 'complete', provider: provider.id });
  return { kind: 'final', text, newMessages, toolEvents };
}
