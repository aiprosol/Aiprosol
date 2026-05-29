// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · STUDIO COPILOT — conversation titles
// v1: deterministic truncation of the first user message (zero latency/cost).
// Swap for a cheap LLM call later if richer titles are wanted.
// ─────────────────────────────────────────────────────────────────────────

export function generateTitle(firstUserMessage: string): string {
  const cleaned = firstUserMessage.replace(/\s+/g, ' ').trim();
  if (!cleaned) return 'New conversation';
  return cleaned.length <= 50 ? cleaned : `${cleaned.slice(0, 47).trimEnd()}…`;
}
