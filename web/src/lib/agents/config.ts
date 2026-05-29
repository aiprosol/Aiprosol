// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · AGENTS — per-role config overrides (edited from the studio)
// The runner reads loadAgentConfig() and falls back to the code defaults
// (AGENT_PROMPTS / ROLE_META) when there's no row or Supabase is down.
// A prompt override replaces the *persona*; the runner re-appends the strict
// OUTPUT_FORMAT, so an override can never break the agent's JSON output.
// ─────────────────────────────────────────────────────────────────────────

import { isSupabaseConfigured, requireSupabaseAdmin } from '@/lib/db/supabase';
import type { Role } from './types';

export type AgentConfigRow = {
  role: string;
  system_prompt_override: string | null;
  cadence_hours: number | null;
  enabled: boolean;
};

export async function loadAgentConfig(role: Role): Promise<{ systemPromptOverride: string | null; enabled: boolean } | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const db = requireSupabaseAdmin();
    const { data } = await db.from('agent_config').select('system_prompt_override, enabled').eq('role', role).maybeSingle();
    if (!data) return null;
    return { systemPromptOverride: data.system_prompt_override ?? null, enabled: data.enabled !== false };
  } catch {
    return null;
  }
}

export async function listAgentConfigs(): Promise<Record<string, AgentConfigRow>> {
  const out: Record<string, AgentConfigRow> = {};
  if (!isSupabaseConfigured()) return out;
  try {
    const db = requireSupabaseAdmin();
    const { data } = await db.from('agent_config').select('*');
    for (const r of (data ?? []) as AgentConfigRow[]) out[r.role] = r;
  } catch {
    /* ignore */
  }
  return out;
}
