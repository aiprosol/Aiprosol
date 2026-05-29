// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · AGENTS · ARORA-AUTONOMOUS (Phase 3)
// Once per day (right after the digest), Arora reviews KPIs + peer state +
// backlog and proposes 0–2 projects she thinks the C-Suite should run next.
//
// Output: zero or more rows in the `projects` table with assigned_by='arora'
// and status='briefed'. NO routing is fired automatically — the Chairman
// reviews each proposal in /studio and clicks Dispatch (or Cancel) before
// any tasks get created.
// ─────────────────────────────────────────────────────────────────────────

import { ARORA_AUTONOMOUS_PROMPT } from './prompts';
import { AutonomousProposalSchema, type AutonomousProposal, ROLES, type Role } from './types';
import { isSupabaseConfigured, requireSupabaseAdmin } from '@/lib/db/supabase';
import { readKpiTimeseries } from './kpi-rollup';

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

export type AutonomousResult = {
  ok: boolean;
  proposal?: AutonomousProposal;
  projectIds?: string[];
  error?: string;
};

export async function runAutonomousProposal(): Promise<AutonomousResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: 'supabase-not-configured' };
  }
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return { ok: false, error: 'no-groq-key' };
  }

  const userMessage = await buildAutonomousContext();
  let content: string;
  try {
    content = await callAutonomous(apiKey, userMessage);
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return { ok: false, error: 'autonomous-output-not-json' };
  }
  const validation = AutonomousProposalSchema.safeParse(parsed);
  if (!validation.success) {
    return {
      ok: false,
      error: `autonomous-schema-failed: ${validation.error.issues.slice(0, 3).map((i) => i.path.join('.') + ' ' + i.message).join('; ')}`,
    };
  }
  const proposal = validation.data;

  if (proposal.projects.length === 0) {
    return { ok: true, proposal, projectIds: [] };
  }

  // Persist as briefed projects — Chairman approves before routing.
  const db = requireSupabaseAdmin();
  const rows = proposal.projects.map((p) => ({
    title: p.title,
    brief: `${p.brief}\n\n— Proposed by Arora (urgency: ${p.urgency}). Rationale: ${proposal.rationale}`,
    target_outcome: p.target_outcome,
    assigned_by: 'arora' as const,
    status: 'briefed' as const,
  }));
  const { data, error } = await db.from('projects').insert(rows).select('id');
  if (error) {
    return { ok: false, error: `project-insert: ${error.message}` };
  }
  return {
    ok: true,
    proposal,
    projectIds: (data ?? []).map((r: { id: string }) => r.id),
  };
}

async function buildAutonomousContext(): Promise<string> {
  const db = requireSupabaseAdmin();
  const now = new Date().toISOString();

  // 1. Open project backlog
  const { data: openProjects } = await db
    .from('projects')
    .select('id, title, brief, assigned_by, status, created_at')
    .in('status', ['briefed', 'routing', 'in_progress', 'review'])
    .order('created_at', { ascending: false })
    .limit(12);

  // 2. KPI deltas (last 2 days)
  const kpis = await readKpiTimeseries(2);
  const kpiLines = kpis
    .filter((k) => k.delta !== 0)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 8);

  // 3. Each peer's most recent next_focus
  const { data: states } = await db.from('agent_state').select('role, last_output, last_run_at');
  const peerFocus: string[] = [];
  for (const role of ROLES) {
    if (role === 'arora') continue;
    const s = (states ?? []).find((x: { role: string }) => x.role === role);
    const focus = (s?.last_output as { next_focus?: string } | null)?.next_focus;
    if (focus) {
      peerFocus.push(`- ${role.toUpperCase()}: ${focus.slice(0, 280)}`);
    }
  }

  // 4. Operational backlog highlights — tasks NOT yet tied to a project
  const { data: looseTasks } = await db
    .from('tasks')
    .select('id, title, priority, owner_role, source')
    .in('status', ['todo'])
    .is('project_id', null)
    .order('priority', { ascending: false })
    .limit(10);

  const projectsBlock = (openProjects ?? []).length
    ? (openProjects ?? [])
        .map((p) => `- [${p.status}] (${p.assigned_by}) "${p.title}"`)
        .join('\n')
    : '_(no open projects)_';

  const kpiBlock = kpiLines.length
    ? kpiLines
        .map((k) => {
          const sym = k.delta > 0 ? '↑' : '↓';
          const sign = k.delta > 0 ? '+' : '';
          return `- ${k.metric}: ${k.latest}${k.unit ? ' ' + k.unit : ''} (${sym}${sign}${k.delta} vs yesterday)`;
        })
        .join('\n')
    : '_(no day-over-day movement yet)_';

  const focusBlock = peerFocus.length ? peerFocus.join('\n') : '_(no peer next_focus available)_';

  const looseBlock = (looseTasks ?? []).length
    ? (looseTasks ?? [])
        .map((t) => `- [${t.priority?.toUpperCase()}] (${t.owner_role || '?'}, ${t.source || '?'}) ${t.title.slice(0, 100)}`)
        .join('\n')
    : '_(no standalone backlog items)_';

  return `# AUTONOMOUS CONTEXT (UTC ${now})

## Open project backlog
${projectsBlock}

## KPI movement (24h)
${kpiBlock}

## Peer next_focus from latest cycle
${focusBlock}

## Operational backlog (project-less tasks)
${looseBlock}

# YOUR JOB
Per your system prompt: review the above and propose 0–2 new projects (max 2). Return STRICT JSON only.`;
}

async function callAutonomous(apiKey: string, userMessage: string): Promise<string> {
  const model = process.env.GROQ_MODEL || DEFAULT_MODEL;
  const FALLBACK_MODELS = [model, 'llama-3.1-8b-instant'];
  let lastErr = '';
  for (const tryModel of FALLBACK_MODELS) {
    const res = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: tryModel,
        messages: [
          { role: 'system', content: ARORA_AUTONOMOUS_PROMPT },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.5,
        max_tokens: 1200,
        response_format: { type: 'json_object' },
      }),
    });
    if (res.ok) {
      const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const content = json.choices?.[0]?.message?.content;
      if (content) return content;
      lastErr = `${tryModel}: empty content`;
      continue;
    }
    if (res.status === 429) {
      const body = await res.text();
      const m = body.match(/try again in ([\d.]+)s/i);
      const waitS = m ? Math.min(parseFloat(m[1]) + 0.5, 12) : 5;
      await new Promise((r) => setTimeout(r, waitS * 1000));
      lastErr = `${tryModel}: 429 after ${waitS}s wait`;
      continue;
    }
    lastErr = `${tryModel}: HTTP ${res.status}`;
    throw new Error(`Arora-autonomous ${lastErr}: ${(await res.text()).slice(0, 150)}`);
  }
  throw new Error(`All Groq models exhausted (autonomous). Last error: ${lastErr}`);
}

// Helper for the daily digest: list Arora-proposed projects from today
// that the Chairman hasn't actioned yet.
export async function readTodaysAroraProposals(): Promise<Array<{
  id: string;
  title: string;
  brief: string;
  target_outcome: string | null;
  created_at: string;
}>> {
  if (!isSupabaseConfigured()) return [];
  const db = requireSupabaseAdmin();
  const since = new Date(Date.now() - 24 * 3600_000).toISOString();
  const { data } = await db
    .from('projects')
    .select('id, title, brief, target_outcome, created_at, status')
    .eq('assigned_by', 'arora')
    .eq('status', 'briefed')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(4);
  return (data ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    brief: p.brief,
    target_outcome: p.target_outcome,
    created_at: p.created_at,
  }));
}
