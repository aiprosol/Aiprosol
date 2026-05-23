// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · STUDIO — data layer
// Server-side fetchers for the studio dashboard. All bypass RLS via the
// supabaseAdmin client (which uses anon key + permissive policies for
// agent tables; service-role key recommended in prod).
// ─────────────────────────────────────────────────────────────────────────

import { isSupabaseConfigured, requireSupabaseAdmin } from '@/lib/db/supabase';
import { ROLES, type Role, type AgentState } from '@/lib/agents/types';
import { readKpiTimeseries } from '@/lib/agents/kpi-rollup';
import { readLatestDigest } from '@/lib/agents/daily-digest';

export type Task = {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done' | 'blocked';
  owner_role: string | null;
  priority: 'low' | 'normal' | 'high' | 'now' | null;
  due_date: string | null;
  notes: string | null;
  source: 'human' | 'agent' | 'system';
  source_role: string | null;
  created_at: string;
};

export type OutreachDraft = {
  id: string;
  channel: 'gmail' | 'linkedin' | 'other';
  target_segment: string | null;
  subject: string | null;
  body: string;
  status: 'draft' | 'sent' | 'replied' | 'bounced' | 'archived';
  sent_at: string | null;
  recipient_email: string | null;
  recipient_name: string | null;
  gmail_message_id: string | null;
  sent_by: string | null;
  notion_id: string | null;
  created_at: string;
};

export type LinkedInPost = {
  id: string;
  title: string | null;
  body: string;
  hook: string | null;
  industry: string | null;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  scheduled_for: string | null;
  published_at: string | null;
  created_at: string;
};

export type Lead = {
  id: string;
  name: string | null;
  email: string | null;
  company: string | null;
  industry: string | null;
  employees: number | null;
  monthly_revenue: string | null;
  manual_hours_per_week: number | null;
  avg_hourly_cost: number | null;
  status: string;
  score: number | null;
  created_at: string;
};

export type Partner = {
  id: string;
  name: string;
  category: string | null;
  contact_email: string | null;
  contact_name: string | null;
  website: string | null;
  status: string;
  notes: string | null;
  created_at: string;
};

export type Sop = {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  content_markdown: string;
  owner_role: string | null;
  updated_at: string;
};

export type KpiSeries = {
  metric: string;
  unit: string | null;
  series: Array<{ day: string; value: number }>;
  latest: number;
  delta: number;
};

export type DailyDigest = {
  day: string;
  subject: string;
  body_text: string;
  body_html: string;
  emailed_at: string | null;
  emailed_to: string | null;
};

export type StudioSnapshot = {
  tasks: Task[];
  drafts: OutreachDraft[];
  posts: LinkedInPost[];
  leads: Lead[];
  partners: Partner[];
  sops: Sop[];
  agentStates: Record<Role, AgentState | null>;
  recentRuns: Array<{
    role: Role;
    at: string;
    status: string;
    duration_ms: number | null;
    items_count: number | null;
    alerts_count: number | null;
  }>;
  kpis: KpiSeries[];
  latestDigest: DailyDigest | null;
};

export async function loadStudioSnapshot(): Promise<StudioSnapshot> {
  const empty: StudioSnapshot = {
    tasks: [],
    drafts: [],
    posts: [],
    leads: [],
    partners: [],
    sops: [],
    agentStates: Object.fromEntries(ROLES.map((r) => [r, null])) as Record<Role, AgentState | null>,
    recentRuns: [],
    kpis: [],
    latestDigest: null,
  };
  if (!isSupabaseConfigured()) return empty;
  const db = requireSupabaseAdmin();

  const [tasksRes, draftsRes, postsRes, leadsRes, partnersRes, sopsRes, statesRes, runsRes, kpis, latestDigest] =
    await Promise.all([
      db.from('tasks').select('*').order('priority', { ascending: false }).order('created_at', { ascending: false }),
      db.from('outreach_drafts').select('*').order('created_at', { ascending: false }),
      db.from('linkedin_posts').select('*').order('created_at', { ascending: false }),
      db.from('leads').select('*').order('score', { ascending: false }).limit(50),
      db.from('affiliate_partners').select('*').order('created_at', { ascending: false }),
      db.from('sops').select('*').order('updated_at', { ascending: false }),
      db.from('agent_state').select('*'),
      db.from('agent_log').select('*').order('at', { ascending: false }).limit(30),
      readKpiTimeseries(14),
      readLatestDigest(),
    ]);

  const agentStates = { ...empty.agentStates };
  for (const row of statesRes.data || []) {
    if ((ROLES as readonly string[]).includes(row.role)) {
      agentStates[row.role as Role] = {
        role: row.role as Role,
        lastRunAt: row.last_run_at,
        nextRunAt: row.next_run_at,
        runs: row.runs,
        lastOutput: row.last_output,
        health: row.health,
        modelLastUsed: row.model_last_used ?? 'unknown',
      };
    }
  }

  return {
    tasks: (tasksRes.data ?? []) as Task[],
    drafts: (draftsRes.data ?? []) as OutreachDraft[],
    posts: (postsRes.data ?? []) as LinkedInPost[],
    leads: (leadsRes.data ?? []) as Lead[],
    partners: (partnersRes.data ?? []) as Partner[],
    sops: (sopsRes.data ?? []) as Sop[],
    agentStates,
    recentRuns: ((runsRes.data ?? []) as Array<{
      role: string;
      at: string;
      status: string;
      duration_ms: number | null;
      items_count: number | null;
      alerts_count: number | null;
    }>).map((r) => ({
      role: r.role as Role,
      at: r.at,
      status: r.status,
      duration_ms: r.duration_ms,
      items_count: r.items_count,
      alerts_count: r.alerts_count,
    })),
    kpis,
    latestDigest,
  };
}
