// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · STUDIO COPILOT — operator brief
// Composes a concise morning brief from live state (grounding + revenue +
// funnel + system) via whichever LLM provider is configured (prefers Claude).
// Triggered on demand (Copilot `generate_brief` tool) or via the daily-brief
// route. Stored in assistant_briefs.
// ─────────────────────────────────────────────────────────────────────────

import { availableProviders, getProvider, type ProviderId } from './providers';
import { COPILOT_SYSTEM_PROMPT } from './prompt';
import { getOperatorGrounding } from './operator-grounding';
import { getRevenue } from '@/lib/studio/revenue';
import { getFunnel } from '@/lib/studio/funnel';
import { getSystemSnapshot } from '@/lib/studio/system';
import { isSupabaseConfigured, requireSupabaseAdmin } from '@/lib/db/supabase';

export async function composeBrief(nowMs: number): Promise<{ content: string; provider: string } | null> {
  const providers = availableProviders();
  if (!providers.length) return null;
  const providerId: ProviderId = providers.find((p) => p.id === 'anthropic')?.id ?? providers[0].id;
  const provider = getProvider(providerId);

  const [grounding, revenue, funnel, system] = await Promise.all([
    getOperatorGrounding(nowMs),
    getRevenue().catch(() => null),
    getFunnel(7).catch(() => null),
    getSystemSnapshot().catch(() => null),
  ]);

  const ctx: string[] = [grounding];
  if (revenue && revenue.configured) ctx.push(`Revenue: today ${revenue.currency} ${revenue.today}, MTD ${revenue.mtd}, MRR ${revenue.mrr}, ${revenue.orderCount} recent orders.`);
  if (funnel && funnel.configured) ctx.push('Funnel (7d): ' + funnel.stages.map((s) => `${s.label} ${s.count}`).join(' → '));
  if (system) {
    const missing = system.env.filter((e) => !e.set).map((e) => e.name);
    ctx.push(`System: ${system.agents.errors24h} agent errors (24h); unconfigured keys: ${missing.join(', ') || 'none'}.`);
  }

  const userMsg =
    `Write my morning operator brief. Concise (≤180 words), prioritized, action-oriented, no preamble. Use ONLY this live context:\n\n${ctx.join('\n')}\n\n` +
    `Return 3–5 bullets: what changed, what needs my attention, and end with the single highest-leverage action for today.`;

  const res = await provider.send({ system: COPILOT_SYSTEM_PROMPT, messages: [{ role: 'user', content: userMsg }], tools: [], maxTokens: 700 });
  return { content: res.assistantText || '(no brief generated)', provider: providerId };
}

export async function saveBrief(content: string, provider: string, email: string | null, emailed: boolean): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const db = requireSupabaseAdmin();
    await db.from('assistant_briefs').insert({ content, provider, operator_email: email, emailed });
  } catch {
    /* best effort */
  }
}

export async function getLatestBrief(): Promise<{ content: string; created_at: string } | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const db = requireSupabaseAdmin();
    const { data } = await db.from('assistant_briefs').select('content, created_at').order('created_at', { ascending: false }).limit(1).maybeSingle();
    return (data as { content: string; created_at: string } | null) ?? null;
  } catch {
    return null;
  }
}
