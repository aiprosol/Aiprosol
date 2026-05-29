// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · STUDIO COPILOT — Groq provider adapter
// OpenAI-compatible chat/completions with function calling. Raw fetch, matching
// the house pattern in api/arora-chat/route.ts and lib/agents/runner.ts.
// ─────────────────────────────────────────────────────────────────────────

import type { ChatMsg, Provider, ProviderResult, SendArgs, StopReason } from './types';

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

type OpenAIMessage =
  | { role: 'system'; content: string }
  | { role: 'user'; content: string }
  | {
      role: 'assistant';
      content: string | null;
      tool_calls?: Array<{ id: string; type: 'function'; function: { name: string; arguments: string } }>;
    }
  | { role: 'tool'; tool_call_id: string; content: string };

function toOpenAIMessages(system: string, grounding: string | undefined, messages: ChatMsg[]): OpenAIMessage[] {
  const out: OpenAIMessage[] = [
    { role: 'system', content: grounding ? `${system}\n\n${grounding}` : system },
  ];
  for (const m of messages) {
    if (m.role === 'user') {
      out.push({ role: 'user', content: m.content });
    } else if (m.role === 'assistant') {
      out.push({
        role: 'assistant',
        content: m.content || null,
        ...(m.toolCalls && m.toolCalls.length
          ? {
              tool_calls: m.toolCalls.map((c) => ({
                id: c.id,
                type: 'function' as const,
                function: { name: c.name, arguments: JSON.stringify(c.args ?? {}) },
              })),
            }
          : {}),
      });
    } else {
      // tool results → one OpenAI `tool` message per result
      for (const r of m.results) {
        out.push({ role: 'tool', tool_call_id: r.toolCallId, content: r.content });
      }
    }
  }
  return out;
}

function mapStop(finish: string | undefined): StopReason {
  if (finish === 'tool_calls') return 'tool_use';
  if (finish === 'stop') return 'end';
  if (finish === 'length') return 'length';
  return 'other';
}

export function createGroqProvider(): Provider {
  return {
    id: 'groq',
    available: () => Boolean(process.env.GROQ_API_KEY),
    modelId: () => process.env.GROQ_MODEL || DEFAULT_MODEL,
    async send({ system, grounding, messages, tools, maxTokens }: SendArgs): Promise<ProviderResult> {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) throw new Error('GROQ_API_KEY not configured');
      const model = process.env.GROQ_MODEL || DEFAULT_MODEL;

      const res = await fetch(GROQ_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          messages: toOpenAIMessages(system, grounding, messages),
          tools: tools.map((t) => ({
            type: 'function',
            function: { name: t.name, description: t.description, parameters: t.parameters },
          })),
          tool_choice: 'auto',
          max_tokens: maxTokens,
          temperature: 0.4,
        }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`groq-${res.status}: ${txt.slice(0, 300)}`);
      }

      const data = (await res.json()) as {
        choices?: Array<{
          finish_reason?: string;
          message?: {
            content?: string | null;
            tool_calls?: Array<{ id: string; function?: { name?: string; arguments?: string } }>;
          };
        }>;
        usage?: { prompt_tokens?: number; completion_tokens?: number };
      };

      const choice = data.choices?.[0];
      const msg = choice?.message;
      const toolCalls = (msg?.tool_calls ?? []).map((tc) => {
        let args: Record<string, unknown> = {};
        try {
          args = tc.function?.arguments ? (JSON.parse(tc.function.arguments) as Record<string, unknown>) : {};
        } catch {
          args = {};
        }
        return { id: tc.id, name: tc.function?.name ?? '', args };
      });

      return {
        assistantText: (msg?.content ?? '').trim(),
        toolCalls,
        stopReason: mapStop(choice?.finish_reason),
        usage: {
          inputTokens: data.usage?.prompt_tokens ?? 0,
          outputTokens: data.usage?.completion_tokens ?? 0,
        },
      };
    },
  };
}
