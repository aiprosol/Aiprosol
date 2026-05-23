// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · AGENTS — daily KPI roll-up
// Computes a snapshot of every table the agents touch and writes it as
// idempotent rows in `kpi_log` (one row per metric per day).
//
// Wired into DA's run() so it fires once per cadence cycle. Anyone reading
// /studio's KPI tab sees the most-recent values plus a trend vs yesterday.
// ─────────────────────────────────────────────────────────────────────────

import { isSupabaseConfigured, requireSupabaseAdmin } from '@/lib/db/supabase';

// What we measure. Adding a new metric? Add a row here.
const METRICS: Array<{
  key: string;
  unit: string;
  describe: string;
  query: (db: ReturnType<typeof requireSupabaseAdmin>) => Promise<number>;
}> = [
  {
    key: 'leads_total',
    unit: 'leads',
    describe: 'Total leads ever captured',
    query: async (db) => (await db.from('leads').select('id', { count: 'exact', head: true })).count ?? 0,
  },
  {
    key: 'leads_new_24h',
    unit: 'leads',
    describe: 'Leads created in the last 24h',
    query: async (db) => {
      const since = new Date(Date.now() - 24 * 3600_000).toISOString();
      return (await db.from('leads').select('id', { count: 'exact', head: true }).gte('created_at', since)).count ?? 0;
    },
  },
  {
    key: 'outreach_drafts_open',
    unit: 'drafts',
    describe: 'Outreach drafts still in "draft" status',
    query: async (db) => (await db.from('outreach_drafts').select('id', { count: 'exact', head: true }).eq('status', 'draft')).count ?? 0,
  },
  {
    key: 'outreach_sent_total',
    unit: 'emails',
    describe: 'Outreach emails sent via Gmail to date',
    query: async (db) => (await db.from('outreach_drafts').select('id', { count: 'exact', head: true }).eq('status', 'sent')).count ?? 0,
  },
  {
    key: 'linkedin_posts_queued',
    unit: 'posts',
    describe: 'LinkedIn posts in draft/scheduled state',
    query: async (db) => (await db.from('linkedin_posts').select('id', { count: 'exact', head: true }).in('status', ['draft', 'scheduled'])).count ?? 0,
  },
  {
    key: 'linkedin_posts_published',
    unit: 'posts',
    describe: 'LinkedIn posts already published',
    query: async (db) => (await db.from('linkedin_posts').select('id', { count: 'exact', head: true }).eq('status', 'published')).count ?? 0,
  },
  {
    key: 'tasks_open',
    unit: 'tasks',
    describe: 'Backlog tasks (todo + in_progress + blocked)',
    query: async (db) => (await db.from('tasks').select('id', { count: 'exact', head: true }).in('status', ['todo', 'in_progress', 'blocked'])).count ?? 0,
  },
  {
    key: 'tasks_agent_proposed',
    unit: 'tasks',
    describe: 'Tasks proposed by agents (source=agent)',
    query: async (db) => (await db.from('tasks').select('id', { count: 'exact', head: true }).eq('source', 'agent')).count ?? 0,
  },
  {
    key: 'partners_total',
    unit: 'partners',
    describe: 'Affiliate partner pipeline size',
    query: async (db) => (await db.from('affiliate_partners').select('id', { count: 'exact', head: true })).count ?? 0,
  },
  {
    key: 'sops_total',
    unit: 'sops',
    describe: 'Playbooks / SOPs in the library',
    query: async (db) => (await db.from('sops').select('id', { count: 'exact', head: true })).count ?? 0,
  },
  {
    key: 'agent_runs_24h_ok',
    unit: 'runs',
    describe: 'Agent runs that completed cleanly in last 24h',
    query: async (db) => {
      const since = new Date(Date.now() - 24 * 3600_000).toISOString();
      return (await db.from('agent_log').select('id', { count: 'exact', head: true }).eq('status', 'ok').gte('at', since)).count ?? 0;
    },
  },
  {
    key: 'agent_runs_24h_err',
    unit: 'runs',
    describe: 'Agent runs that errored in last 24h',
    query: async (db) => {
      const since = new Date(Date.now() - 24 * 3600_000).toISOString();
      return (await db.from('agent_log').select('id', { count: 'exact', head: true }).eq('status', 'error').gte('at', since)).count ?? 0;
    },
  },
];

// Today's date as YYYY-MM-DD in UTC (the week_starting bucket key)
function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

// Idempotent upsert: every metric gets at most one row per day.
// We model the kpi_log "week_starting" column as a daily bucket (not weekly)
// so the same query works for daily AND weekly aggregations later.
export async function runKpiRollup(): Promise<{
  ok: boolean;
  rowsWritten: number;
  snapshot: Record<string, number>;
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return { ok: false, rowsWritten: 0, snapshot: {}, error: 'supabase not configured' };
  }

  try {
    const db = requireSupabaseAdmin();
    const day = todayUTC();
    const snapshot: Record<string, number> = {};

    // Resolve every metric in parallel
    const values = await Promise.all(
      METRICS.map(async (m) => {
        try {
          const v = await m.query(db);
          snapshot[m.key] = v;
          return { key: m.key, unit: m.unit, value: v, notes: m.describe };
        } catch (err) {
          // One bad metric shouldn't break the whole rollup
          console.warn(`[kpi-rollup] ${m.key} failed:`, err);
          return null;
        }
      }),
    );

    const valid = values.filter((v): v is NonNullable<typeof v> => v !== null);

    // Delete-then-insert to keep the (day, metric) row unique without needing
    // a Postgres unique constraint. Cheaper than ON CONFLICT here because the
    // metric list is small (~12) and the kpi_log row count is tiny.
    await db
      .from('kpi_log')
      .delete()
      .eq('week_starting', day)
      .in(
        'metric',
        valid.map((v) => v.key),
      );

    const { error: insertErr } = await db.from('kpi_log').insert(
      valid.map((v) => ({
        week_starting: day,
        metric: v.key,
        value: v.value,
        unit: v.unit,
        notes: v.notes,
      })),
    );

    if (insertErr) {
      return { ok: false, rowsWritten: 0, snapshot, error: insertErr.message };
    }

    return { ok: true, rowsWritten: valid.length, snapshot };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, rowsWritten: 0, snapshot: {}, error: msg };
  }
}

// Build a markdown summary the DA agent can reference in its run output.
// Includes day-over-day delta where the previous day's row exists.
export async function buildKpiContextMarkdown(): Promise<string> {
  if (!isSupabaseConfigured()) return '';
  const db = requireSupabaseAdmin();
  const today = todayUTC();
  const yesterday = new Date(Date.now() - 24 * 3600_000).toISOString().slice(0, 10);

  const { data: rows } = await db
    .from('kpi_log')
    .select('week_starting, metric, value, unit')
    .in('week_starting', [today, yesterday]);

  if (!rows?.length) {
    return '_(kpi_log empty — DA run will seed today\'s baseline)_';
  }

  const byMetric = new Map<string, { today?: number; yesterday?: number; unit?: string }>();
  for (const r of rows) {
    const entry = byMetric.get(r.metric) ?? {};
    if (r.week_starting === today) entry.today = Number(r.value);
    else if (r.week_starting === yesterday) entry.yesterday = Number(r.value);
    entry.unit = r.unit || undefined;
    byMetric.set(r.metric, entry);
  }

  const lines: string[] = [];
  for (const [metric, { today: t, yesterday: y, unit }] of byMetric) {
    const tv = t ?? 0;
    const yv = y ?? 0;
    const delta = tv - yv;
    const sym = delta > 0 ? '↑' : delta < 0 ? '↓' : '→';
    lines.push(`- ${metric}: ${tv}${unit ? ' ' + unit : ''} (${sym}${delta >= 0 ? '+' : ''}${delta} vs ${yesterday})`);
  }
  return lines.join('\n');
}

// Read the full timeseries for the /studio KPI tab.
// Returns the last N days of every metric we track.
export async function readKpiTimeseries(days = 14): Promise<
  Array<{
    metric: string;
    unit: string | null;
    series: Array<{ day: string; value: number }>;
    latest: number;
    delta: number; // vs first day in window
  }>
> {
  if (!isSupabaseConfigured()) return [];
  const db = requireSupabaseAdmin();
  const since = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);

  const { data: rows } = await db
    .from('kpi_log')
    .select('week_starting, metric, value, unit')
    .gte('week_starting', since)
    .order('week_starting', { ascending: true });

  if (!rows?.length) return [];

  type Group = { unit: string | null; series: Array<{ day: string; value: number }> };
  const grouped = new Map<string, Group>();
  for (const r of rows) {
    let g = grouped.get(r.metric);
    if (!g) {
      g = { unit: r.unit, series: [] };
      grouped.set(r.metric, g);
    }
    g.series.push({ day: r.week_starting, value: Number(r.value) });
  }

  return Array.from(grouped.entries()).map(([metric, g]) => {
    const latest = g.series[g.series.length - 1]?.value ?? 0;
    const earliest = g.series[0]?.value ?? 0;
    return {
      metric,
      unit: g.unit,
      series: g.series,
      latest,
      delta: latest - earliest,
    };
  });
}
