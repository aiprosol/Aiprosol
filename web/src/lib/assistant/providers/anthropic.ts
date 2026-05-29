// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · STUDIO COPILOT — Anthropic (Claude) provider adapter
// Messages API via @anthropic-ai/sdk, with tool use + prompt caching.
//
// Caching strategy (see claude-api skill / shared/prompt-caching.md):
//   render order is tools → system → messages. We cache the STABLE prefix:
//   a cache_control breakpoint on the last tool def + on the stable system
//   block. The live `grounding` digest changes ~every 60s, so it goes in a
//   SECOND, uncached system block AFTER the cached one — otherwise it would
//   invalidate the whole cached prefix on every request.
// ─────────────────────────────────────────────────────────────────────────

import Anthropic from '@anthropic-ai/sdk';
import type { ChatMsg, Provider, ProviderResult, SendArgs, StopReason } from './types';

const DEFAULT_MODEL = 'claude-sonnet-4-6';

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic(); // reads ANTHROPIC_API_KEY
  return client;
}

function toAnthropicMessages(messages: ChatMsg[]): Anthropic.MessageParam[] {
  const out: Anthropic.MessageParam[] = [];
  for (const m of messages) {
    if (m.role === 'user') {
      out.push({ role: 'user', content: m.content });
    } else if (m.role === 'assistant') {
      const blocks: Anthropic.ContentBlockParam[] = [];
      if (m.content) blocks.push({ type: 'text', text: m.content });
      for (const c of m.toolCalls ?? []) {
        blocks.push({ type: 'tool_use', id: c.id, name: c.name, input: c.args ?? {} });
      }
      // An assistant turn must be non-empty; fall back to a single space.
      out.push({ role: 'assistant', content: blocks.length ? blocks : ' ' });
    } else {
      // tool results → a single user turn carrying all tool_result blocks
      out.push({
        role: 'user',
        content: m.results.map((r) => ({
          type: 'tool_result' as const,
          tool_use_id: r.toolCallId,
          content: r.content,
          ...(r.isError ? { is_error: true } : {}),
        })),
      });
    }
  }
  return out;
}

function mapStop(reason: string | null): StopReason {
  if (reason === 'tool_use') return 'tool_use';
  if (reason === 'end_turn' || reason === 'stop_sequence') return 'end';
  if (reason === 'max_tokens') return 'length';
  return 'other';
}

export function createAnthropicProvider(): Provider {
  return {
    id: 'anthropic',
    available: () => Boolean(process.env.ANTHROPIC_API_KEY),
    modelId: () => process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
    async send({ system, grounding, messages, tools, maxTokens }: SendArgs): Promise<ProviderResult> {
      if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not configured');
      const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;

      // Tool defs — cache the whole array via a breakpoint on the last one.
      const toolParams: Anthropic.Tool[] = tools.map((t, i) => ({
        name: t.name,
        description: t.description,
        input_schema: t.parameters as Anthropic.Tool.InputSchema,
        ...(i === tools.length - 1 ? { cache_control: { type: 'ephemeral' as const } } : {}),
      }));

      // System: stable block (cached) + optional volatile grounding (uncached).
      const systemBlocks: Anthropic.TextBlockParam[] = [
        { type: 'text', text: system, cache_control: { type: 'ephemeral' } },
      ];
      if (grounding) systemBlocks.push({ type: 'text', text: grounding });

      const resp = await getClient().messages.create({
        model,
        max_tokens: maxTokens,
        system: systemBlocks,
        ...(toolParams.length ? { tools: toolParams } : {}),
        messages: toAnthropicMessages(messages),
      });

      let assistantText = '';
      const toolCalls: ProviderResult['toolCalls'] = [];
      for (const block of resp.content) {
        if (block.type === 'text') {
          assistantText += block.text;
        } else if (block.type === 'tool_use') {
          toolCalls.push({
            id: block.id,
            name: block.name,
            args: (block.input ?? {}) as Record<string, unknown>,
          });
        }
      }

      return {
        assistantText: assistantText.trim(),
        toolCalls,
        stopReason: mapStop(resp.stop_reason),
        usage: {
          inputTokens: resp.usage.input_tokens,
          outputTokens: resp.usage.output_tokens,
          cacheReadTokens: resp.usage.cache_read_input_tokens ?? 0,
        },
      };
    },
  };
}
