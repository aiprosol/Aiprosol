// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · STUDIO COPILOT — provider registry
// ─────────────────────────────────────────────────────────────────────────

import type { Provider, ProviderId } from './types';
import { createAnthropicProvider } from './anthropic';
import { createGroqProvider } from './groq';

const PROVIDERS: Record<ProviderId, Provider> = {
  anthropic: createAnthropicProvider(),
  groq: createGroqProvider(),
};

export function getProvider(id: ProviderId): Provider {
  const p = PROVIDERS[id];
  if (!p) throw new Error(`Unknown provider: ${id}`);
  return p;
}

/** Which providers have a configured API key — drives the UI model toggle. */
export function availableProviders(): Array<{ id: ProviderId; model: string }> {
  return (Object.keys(PROVIDERS) as ProviderId[])
    .filter((id) => PROVIDERS[id].available())
    .map((id) => ({ id, model: PROVIDERS[id].modelId() }));
}

export function isProviderId(v: unknown): v is ProviderId {
  return v === 'anthropic' || v === 'groq';
}

export type { Provider, ProviderId } from './types';
