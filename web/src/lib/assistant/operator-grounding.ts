// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · STUDIO COPILOT — live operator grounding
// A compact "what's true right now" digest injected each turn so the assistant
// answers from real studio state. In-module cache (60s) mirrors arora-grounding;
// it's global studio state (not per-operator) so a shared cache is fine.
// ─────────────────────────────────────────────────────────────────────────

import { isSupabaseConfigured, requireSupabaseAdmin } from '@/lib/db/supabase';

let CACHE: { fetchedAt: number; text: string } | null = null;
const TTL_MS = 60_000;

export async function getOperatorGrounding(nowMs: number): Promise<string> {
  if (CACHE && nowMs - CACHE.fetchedAt < TTL_MS) return CACHE.text;
  const text = await build();
  CACHE = { fetchedAt: nowMs, text };
  return text;
}

async function count(db: ReturnType<typeof requireSupabaseAdmin>, table: string, col: string, val: string): Promise<number> {
  const { count: c } = await db.from(table).select('id', { count: 'exact', head: true }).eq(col, val);
  return c ?? 0;
}

async function build(): Promise<string> {
  if (!isSupabaseConfigured()) {
    return '# LIVE STUDIO STATE\n_(Supabase not configured — query tools will return nothing.)_';
  }
  try {
    const db = requireSupabaseAdmin();
    const [tasksTodo, tasksInProgress, tasksBlocked, draftsOpen, postsQueued, projectsActive, leadsTotal, latestDigest, recentRuns] =
      await Promise.all([
        count(db, 'tasks', 'status', 'todo'),
        count(db, 'tasks', 'status', 'in_progress'),
        count(db, 'tasks', 'status', 'blocked'),
        count(db, 'outreach_drafts', 'status', 'draft'),
        db.from('linkedin_posts').select('id', { count: 'exact', head: true }).in('status', ['draft', 'scheduled']),
        db.from('projects').select('id', { count: 'exact', head: true }).in('status', ['briefed', 'routing', 'in_progress', 'review']),
        db.from('leads').select('id', { count: 'exact', head: true }),
        db.from('daily_digest').select('day, subject').order('day', { ascending: false }).limit(1).maybeSingle(),
        db.from('agent_log').select('role, status, at').order('at', { ascending: false }).limit(6),
      ]);

    const lines: string[] = [];
    lines.push('# LIVE STUDIO STATE (from Supabase)');
    lines.push(`Updated: ${new Date(CACHE?.fetchedAt ?? Date.now()).toISOString()}`);
    lines.push('');
    lines.push('## Work in flight');
    lines.push(`- Tasks: ${tasksTodo} todo · ${tasksInProgress} in progress · ${tasksBlocked} blocked`);
    lines.push(`- Projects active (briefed→review): ${projectsActive.count ?? 0}`);
    lines.push(`- Outreach drafts awaiting send: ${draftsOpen}`);
    lines.push(`- Content posts queued (draft/scheduled): ${postsQueued.count ?? 0}`);
    lines.push(`- Leads in pipeline (total): ${leadsTotal.count ?? 0}`);

    if (latestDigest.data) {
      lines.push('');
      lines.push(`## Latest daily digest · ${latestDigest.data.day}`);
      lines.push(`- ${latestDigest.data.subject}`);
    }

    const runs = (recentRuns.data ?? []) as Array<{ role: string; status: string; at: string }>;
    if (runs.length) {
      lines.push('');
      lines.push('## Most recent agent runs');
      for (const r of runs) lines.push(`- ${r.role.toUpperCase()} · ${r.status} · ${r.at?.slice(0, 16)?.replace('T', ' ')}`);
    }

    lines.push('');
    lines.push('These are the real current numbers — cite them, do not invent. Use query_studio for row-level detail and ids.');
    return lines.join('\n');
  } catch (err) {
    console.warn('[operator-grounding] failed:', err);
    return '# LIVE STUDIO STATE\n_(data fetch failed — use query_studio for live reads.)_';
  }
}
