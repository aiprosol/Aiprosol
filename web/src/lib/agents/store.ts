// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · AGENTS — Supabase-backed state store
// Migrated from filesystem (read-only on Vercel) to Supabase Postgres.
// Tables: agent_state (upsert by role) + agent_log (append-only).
//
// Both tables have permissive RLS for the anon key (route-level secret
// guards the writes). Reads are public so the /agents page can render.
// ─────────────────────────────────────────────────────────────────────────

import { ROLES, type Role, type AgentState, type AgentLogEntry } from './types';
import { isSupabaseConfigured, requireSupabaseAdmin } from '@/lib/db/supabase';

export async function readState(role: Role): Promise<AgentState | null> {
  if (!isSupabaseConfigured()) return null;
  const db = requireSupabaseAdmin();
  const { data, error } = await db
    .from('agent_state')
    .select('*')
    .eq('role', role)
    .maybeSingle();
  if (error) {
    console.error(`[agents/store] readState(${role}):`, error.message);
    return null;
  }
  if (!data) return null;
  return rowToState(data);
}

export async function writeState(role: Role, state: AgentState): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const db = requireSupabaseAdmin();
  const { error } = await db
    .from('agent_state')
    .upsert({
      role,
      last_run_at: state.lastRunAt,
      next_run_at: state.nextRunAt,
      runs: state.runs,
      last_output: state.lastOutput,
      health: state.health,
      model_last_used: state.modelLastUsed,
    });
  if (error) console.error(`[agents/store] writeState(${role}):`, error.message);
}

export async function appendLog(role: Role, entry: AgentLogEntry): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const db = requireSupabaseAdmin();
  const { error } = await db
    .from('agent_log')
    .insert({
      at: entry.at,
      role: entry.role,
      status: entry.status,
      duration_ms: entry.durationMs,
      items_count: entry.itemsCount,
      alerts_count: entry.alertsCount,
      error: entry.error,
    });
  if (error) console.error(`[agents/store] appendLog(${role}):`, error.message);
}

export async function readRecentLog(role: Role, limit = 50): Promise<AgentLogEntry[]> {
  if (!isSupabaseConfigured()) return [];
  const db = requireSupabaseAdmin();
  const { data, error } = await db
    .from('agent_log')
    .select('*')
    .eq('role', role)
    .order('at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error(`[agents/store] readRecentLog(${role}):`, error.message);
    return [];
  }
  return (data || []).map(rowToLog);
}

/**
 * Cross-agent log query — every run by every agent within the given window.
 * Used by the /transparency page to render an aggregate activity feed.
 */
export async function readAllLogsSince(sinceIsoOrMs: string | number): Promise<AgentLogEntry[]> {
  if (!isSupabaseConfigured()) return [];
  const since = typeof sinceIsoOrMs === 'number' ? new Date(sinceIsoOrMs).toISOString() : sinceIsoOrMs;
  const db = requireSupabaseAdmin();
  const { data, error } = await db
    .from('agent_log')
    .select('*')
    .gte('at', since)
    .order('at', { ascending: false })
    .limit(500);
  if (error) {
    console.error('[agents/store] readAllLogsSince:', error.message);
    return [];
  }
  return (data || []).map(rowToLog);
}

export async function readAllStates(): Promise<Record<Role, AgentState | null>> {
  const empty = Object.fromEntries(ROLES.map((r) => [r, null])) as Record<Role, AgentState | null>;
  if (!isSupabaseConfigured()) return empty;

  const db = requireSupabaseAdmin();
  const { data, error } = await db.from('agent_state').select('*');
  if (error) {
    console.error('[agents/store] readAllStates:', error.message);
    return empty;
  }
  const out = { ...empty };
  for (const row of data || []) {
    if ((ROLES as readonly string[]).includes(row.role)) {
      out[row.role as Role] = rowToState(row);
    }
  }
  return out;
}

// ─── row mappers ────────────────────────────────────────────────────────
function rowToState(row: Record<string, unknown>): AgentState {
  return {
    role: row.role as Role,
    lastRunAt: row.last_run_at as string,
    nextRunAt: row.next_run_at as string,
    runs: row.runs as number,
    lastOutput: row.last_output as AgentState['lastOutput'],
    health: row.health as AgentState['health'],
    modelLastUsed: (row.model_last_used as string) ?? 'unknown',
  };
}

function rowToLog(row: Record<string, unknown>): AgentLogEntry {
  return {
    at: row.at as string,
    role: row.role as Role,
    status: row.status as AgentLogEntry['status'],
    durationMs: (row.duration_ms as number) ?? 0,
    itemsCount: (row.items_count as number) ?? 0,
    alertsCount: (row.alerts_count as number) ?? 0,
    error: (row.error as string) ?? undefined,
  };
}
