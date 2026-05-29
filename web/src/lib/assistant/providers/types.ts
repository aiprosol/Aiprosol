// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · STUDIO COPILOT — provider-agnostic chat/tool-use types
// The agentic loop (loop.ts) only ever speaks these normalized shapes.
// Each provider adapter (anthropic.ts / groq.ts) translates them to/from its
// own wire format, so the loop stays identical across Claude and Groq.
// ─────────────────────────────────────────────────────────────────────────

/** A model's request to call one tool, normalized across providers. */
export type ToolCall = {
  id: string;
  name: string;
  args: Record<string, unknown>;
};

/** The outcome of executing one tool, fed back to the model next turn. */
export type ToolResultMsg = {
  toolCallId: string;
  name: string;
  content: string;
  isError?: boolean;
};

/**
 * Normalized conversation message. Persisted in this shape (see store.ts) and
 * replayed to either provider. A `tool` message bundles ALL results answering
 * the immediately-preceding assistant turn's tool calls — Anthropic expands it
 * to one user turn with N tool_result blocks; Groq expands it to N tool msgs.
 */
export type ChatMsg =
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string; toolCalls?: ToolCall[] }
  | { role: 'tool'; results: ToolResultMsg[] };

/** The minimal tool shape a provider needs — decoupled from the full ToolDef. */
export type ProviderTool = {
  name: string;
  description: string;
  parameters: Record<string, unknown>; // JSON Schema
};

export type StopReason = 'tool_use' | 'end' | 'length' | 'other';

export type ProviderResult = {
  assistantText: string;
  toolCalls: ToolCall[];
  stopReason: StopReason;
  usage?: { inputTokens: number; outputTokens: number; cacheReadTokens?: number };
};

export type ProviderId = 'anthropic' | 'groq';

export type SendArgs = {
  /** Stable system prompt — cached by Anthropic. */
  system: string;
  /** Volatile live-state digest — NOT cached (changes ~every 60s). */
  grounding?: string;
  messages: ChatMsg[];
  tools: ProviderTool[];
  maxTokens: number;
};

export interface Provider {
  id: ProviderId;
  /** True when the provider's API key is configured. */
  available(): boolean;
  /** The resolved model id this provider will use. */
  modelId(): string;
  send(args: SendArgs): Promise<ProviderResult>;
}
