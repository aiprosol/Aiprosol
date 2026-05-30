// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · AGENTS — types
// 10 AI agents + 1 human chairman (Srijan). Each non-human agent runs on
// a schedule, reads shared context, calls Groq with its system prompt,
// produces structured JSON output, and persists state to disk.
// ─────────────────────────────────────────────────────────────────────────

import { z } from 'zod';

// Canonical role list — order matters: matches /about page + AgentConstellation
// Agents are named purely by C-suite role to keep the brand model-independent
// (no co-branding with the underlying LLM provider). Arora is the only named
// persona — the AI CEO + customer-facing chat widget.
export const ROLES = [
  'arora',    // CEO (also the chat widget)
  'coo',      // COO — Operations
  'cmo',      // CMO — Marketing
  'cco',      // CCO — Customer Success
  'cto',      // CTO — Technology
  'cro',      // CRO — Revenue Ops
  'clo',      // CLO — Legal
  'cpo',      // CPO — Partnerships
  'cpm',      // CPM — Product
  'da',       // Data + Analytics
] as const;

export type Role = (typeof ROLES)[number];

// LLM outputs (especially the lighter fallback model) occasionally hallucinate
// or typo a role — e.g. "ccco", "ceo", "sales", "marketing". A strict z.enum
// would reject it and fail the ENTIRE agent run on one bad suggestion (this was
// the root cause of CRO's daily `invalid_enum_value: "ccco"` error). normalizeRole
// repairs common variants and maps anything still-unknown to undefined, so a
// malformed owner_role drops the assignment instead of crashing the run.
const ROLE_REPAIR: Record<string, Role> = {
  ceo: 'arora', founder: 'arora', chairman: 'arora', cao: 'arora',
  ccco: 'cco', cso: 'cco', success: 'cco', 'customer success': 'cco', support: 'cco',
  cfo: 'da', analyst: 'da', data: 'da', analytics: 'da',
  ops: 'coo', operations: 'coo',
  marketing: 'cmo', brand: 'cmo', content: 'cmo',
  growth: 'cro', sales: 'cro', revenue: 'cro',
  legal: 'clo', compliance: 'clo',
  product: 'cpm', catalog: 'cpm', catalogue: 'cpm', pricing: 'cpm',
  partnerships: 'cpo', partners: 'cpo', partnership: 'cpo',
  engineering: 'cto', tech: 'cto', technology: 'cto', eng: 'cto',
};

export function normalizeRole(v: unknown): Role | undefined {
  if (typeof v !== 'string') return undefined;
  const s = v.toLowerCase().trim();
  if ((ROLES as readonly string[]).includes(s)) return s as Role;
  return ROLE_REPAIR[s];
}

// Public-facing metadata for each role — shown on /agents + /about
export const ROLE_META: Record<Role, {
  title: string;
  fullName: string;
  domain: string;
  emoji: string;
  color: string; // hex
  ownsKpis: string[];
  cadenceHrs: number; // how often this agent runs
}> = {
  arora: {
    title: 'CEO',
    fullName: 'Arora',
    domain: 'Strategy, coordination, customer-facing chat',
    emoji: '◉',
    color: '#C084FC',
    ownsKpis: ['decisions/day', 'p95 reply time', 'visitor conversations'],
    cadenceHrs: 6, // hourly summary; the chat widget itself is real-time
  },
  coo: {
    title: 'COO',
    fullName: 'COO',
    domain: 'Operations health, workflow monitoring, anomalies',
    emoji: '◧',
    color: '#8B5CF6',
    ownsKpis: ['uptime', 'queue depth', 'workflows/day'],
    cadenceHrs: 6,
  },
  cmo: {
    title: 'CMO',
    fullName: 'CMO',
    domain: 'Brand voice, content drafts, campaign briefs',
    emoji: '◑',
    color: '#F472B6',
    ownsKpis: ['drafts produced', 'campaign briefs', 'voice consistency'],
    cadenceHrs: 12,
  },
  cco: {
    title: 'CCO',
    fullName: 'CCO',
    domain: 'Customer onboarding, support triage, retention',
    emoji: '◐',
    color: '#22D3EE',
    ownsKpis: ['onboardings/wk', 'support resolved', 'NPS trend'],
    cadenceHrs: 12,
  },
  cto: {
    title: 'CTO',
    fullName: 'CTO',
    domain: 'Code health, integration design, tech debt',
    emoji: '◇',
    color: '#67E8F9',
    ownsKpis: ['routes ok', 'p95 latency', 'tech-debt count'],
    cadenceHrs: 12,
  },
  cro: {
    title: 'CRO',
    fullName: 'CRO',
    domain: 'Cold outreach drafts, pipeline hygiene',
    emoji: '◭',
    color: '#FB923C',
    ownsKpis: ['drafts ready', 'pipeline value', 'win rate'],
    cadenceHrs: 12,
  },
  clo: {
    title: 'CLO',
    fullName: 'CLO',
    domain: 'Legal reviews, doc drafts, compliance',
    emoji: '◊',
    color: '#FBBF24',
    ownsKpis: ['docs reviewed', 'flags raised', 'compliance gaps'],
    cadenceHrs: 24,
  },
  cpo: {
    title: 'CPO',
    fullName: 'CPO',
    domain: 'Partnerships, affiliate pipeline',
    emoji: '◆',
    color: '#10B981',
    ownsKpis: ['partners researched', 'outreach drafts', 'qualified leads'],
    cadenceHrs: 24,
  },
  cpm: {
    title: 'CPM',
    fullName: 'CPM',
    domain: 'Product catalog, pricing, descriptions',
    emoji: '◈',
    color: '#A78BFA',
    ownsKpis: ['products audited', 'pricing flags', 'description quality'],
    cadenceHrs: 24,
  },
  da: {
    title: 'DA',
    fullName: 'Data + Analytics',
    domain: 'KPIs, lead scoring, weekly dashboard',
    emoji: '◬',
    color: '#34D399',
    ownsKpis: ['KPIs tracked', 'anomalies flagged', 'forecast accuracy'],
    cadenceHrs: 6,
  },
};

// What an agent emits on each run — structured, validated.
// Optional fields are nullable too — some models return null instead of undefined.
const nullableOptString = (max: number) =>
  z.preprocess((v) => (v == null || v === '' ? undefined : v), z.string().max(max).optional());

export const AgentItemSchema = z.object({
  action: z.preprocess(
    (v) => (v == null || v === '' ? '(no action specified)' : v),
    z.string().min(1).max(280),
  ),
  result: z.preprocess(
    (v) => (v == null || v === '' ? '(no result specified)' : v),
    z.string().min(1).max(400),
  ),
  impact: nullableOptString(200),
  tools: z.preprocess(
    (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string') : undefined),
    z.array(z.string().max(40)).max(8).optional(),
  ),
});

export const AgentAlertSchema = z.object({
  level: z.preprocess(
    (v) => (v === 'info' || v === 'warn' || v === 'warning' || v === 'error' ? (v === 'warning' ? 'warn' : v) : 'info'),
    z.enum(['info', 'warn', 'error']),
  ),
  message: z.string().min(1).max(400),
});

export const AgentKpiSchema = z.object({
  metric: z.string().min(1).max(60),
  // Allow null/undefined/empty for value too — some models return null when
  // they don't have a concrete number; coerce to "—" rather than failing.
  value: z.preprocess(
    (v) => (v == null || v === '' ? '—' : v),
    z.union([z.number(), z.string()]),
  ),
  // Allow LLM to send "N/A", "stable", null, etc. — coerce anything outside
  // the canonical enum to undefined rather than failing the whole parse.
  trend: z.preprocess(
    (v) => (v === 'up' || v === 'down' || v === 'flat' ? v : undefined),
    z.enum(['up', 'down', 'flat']).optional(),
  ),
  // delta can also come back null — preprocess to undefined.
  delta: z.preprocess(
    (v) => (v == null || v === '' ? undefined : v),
    z.string().max(40).optional(),
  ),
});

// Tasks an agent wants to propose for human review.
// Inserted into the `tasks` table with source='agent', source_role=<role>.
// Status starts as 'todo' — admin can Accept (no-op), Block, or mark Done in /studio.
export const ProposedTaskSchema = z.object({
  title: z.string().min(3).max(280),
  // Tolerant: repair/drop bad roles instead of failing the whole agent run.
  // normalizeRole returns undefined for the unknown rest; the inner .optional()
  // accepts that, so the task is still created — just unassigned.
  owner_role: z.preprocess(normalizeRole,
    z.enum(['arora', 'coo', 'cmo', 'cco', 'cto', 'cro', 'clo', 'cpo', 'cpm', 'da']).optional()),
  priority: z
    .preprocess(
      (v) => {
        if (typeof v !== 'string') return 'normal';
        const s = v.toLowerCase().trim();
        if (s === 'urgent' || s === 'asap' || s === 'critical') return 'now';
        return ['low', 'normal', 'high', 'now'].includes(s) ? s : 'normal';
      },
      z.enum(['low', 'normal', 'high', 'now']))
    .default('normal'),
  notes: z.string().max(500).optional(),
});

// ─── Deliverables — concrete artifacts produced when executing a project task ──
// Each deliverable has a polymorphic payload shaped by its `type`. The runner
// uses `type` to route the row into the correct table (outreach_drafts /
// linkedin_posts / sops / project_artifacts). The agent populates `task_id`
// with the UUID of the assigned task this deliverable fulfills — the runner
// validates the task exists, is owned by this role, and is non-terminal
// before inserting; mismatched task_ids are logged + skipped (no insert).

export const OutreachDraftPayloadSchema = z.object({
  channel: z.preprocess(
    (v) => (typeof v === 'string' ? v.toLowerCase() : v),
    z.enum(['gmail', 'linkedin', 'other'])
  ).optional().default('gmail'),
  target_segment: z.string().min(1).max(160),
  recipient_name: z.string().max(160).optional(),
  recipient_email: z.string().max(200).optional(),
  subject: z.string().min(1).max(240),
  body: z.string().min(20).max(6000),
});

export const LinkedInPostPayloadSchema = z.object({
  title: z.string().max(200).optional(),
  hook: z.string().max(360).optional(),
  body: z.string().min(20).max(6000),
  industry: z.string().max(80).optional(),
  scheduled_for: z.string().max(40).optional(), // ISO-ish; runner is tolerant
});

export const SopNotePayloadSchema = z.object({
  slug: z.string().min(2).max(160),
  title: z.string().min(2).max(240),
  category: z.string().max(80).optional(),
  content_markdown: z.string().min(20).max(20000),
  owner_role: z.string().max(40).optional(),
});

export const AnalysisPayloadSchema = z.object({
  title: z.string().min(2).max(240),
  body_markdown: z.string().min(20).max(20000),
  data_json: z.record(z.string(), z.unknown()).optional(),
});

export const DeliverableSchema = z.discriminatedUnion('type', [
  z.object({
    task_id: z.string().min(8).max(64), // tolerant: validate UUID shape downstream
    type: z.literal('outreach_draft'),
    payload: OutreachDraftPayloadSchema,
  }),
  z.object({
    task_id: z.string().min(8).max(64),
    type: z.literal('linkedin_post'),
    payload: LinkedInPostPayloadSchema,
  }),
  z.object({
    task_id: z.string().min(8).max(64),
    type: z.literal('sop_note'),
    payload: SopNotePayloadSchema,
  }),
  z.object({
    task_id: z.string().min(8).max(64),
    type: z.literal('analysis'),
    payload: AnalysisPayloadSchema,
  }),
]);

export const AgentRunOutputSchema = z.object({
  summary: z.string().min(1).max(500),
  items: z.array(AgentItemSchema).max(20),
  alerts: z.array(AgentAlertSchema).max(10).default([]),
  kpis: z.array(AgentKpiSchema).max(10).default([]),
  proposed_tasks: z.array(ProposedTaskSchema).max(5).default([]),
  // NEW — structured deliverables tied back to assigned project tasks.
  deliverables: z.array(DeliverableSchema).max(8).default([]),
  next_focus: z.string().max(400).optional(),
});

export type AgentItem = z.infer<typeof AgentItemSchema>;
export type AgentAlert = z.infer<typeof AgentAlertSchema>;
export type AgentKpi = z.infer<typeof AgentKpiSchema>;
export type ProposedTask = z.infer<typeof ProposedTaskSchema>;
export type Deliverable = z.infer<typeof DeliverableSchema>;
export type OutreachDraftPayload = z.infer<typeof OutreachDraftPayloadSchema>;
export type LinkedInPostPayload = z.infer<typeof LinkedInPostPayloadSchema>;
export type SopNotePayload = z.infer<typeof SopNotePayloadSchema>;
export type AnalysisPayload = z.infer<typeof AnalysisPayloadSchema>;
export type AgentRunOutput = z.infer<typeof AgentRunOutputSchema>;

// ─── Arora-as-router (Chairman briefs a project; Arora decomposes) ──────
export const RoutingDecisionSchema = z.object({
  rationale: z.string().min(10).max(1500),
  tasks: z
    .array(
      z.object({
        title: z.string().min(3).max(280),
        // Required here (a routed task must have an owner) — repair bad roles,
        // and default the unknown rest to 'coo' so routing never crashes on a
        // hallucinated role.
        owner_role: z.preprocess((v) => normalizeRole(v) ?? 'coo',
          z.enum(['arora', 'coo', 'cmo', 'cco', 'cto', 'cro', 'clo', 'cpo', 'cpm', 'da'])),
        priority: z
          .preprocess(
            (v) => {
              if (typeof v !== 'string') return 'normal';
              const s = v.toLowerCase().trim();
              if (s === 'urgent' || s === 'asap' || s === 'critical') return 'now';
              return ['low', 'normal', 'high', 'now'].includes(s) ? s : 'normal';
            },
            z.enum(['low', 'normal', 'high', 'now']))
          .default('normal'),
        deliverable_type: z
          .preprocess((v) => {
            if (typeof v !== 'string') return 'none';
            const s = v.toLowerCase().trim();
            return ['outreach_draft', 'linkedin_post', 'sop_note', 'analysis', 'none'].includes(s) ? s : 'none';
          },
            z.enum(['outreach_draft', 'linkedin_post', 'sop_note', 'analysis', 'none']))
          .default('none'),
        notes: z.string().min(5).max(1500),
      }),
    )
    .min(1)
    .max(6),
});

export type RoutingDecision = z.infer<typeof RoutingDecisionSchema>;

// ─── Arora-autonomous (Phase 3: daily proposals at 09:00 cron) ──────────
export const AutonomousProposalSchema = z.object({
  rationale: z.string().min(10).max(1500),
  projects: z
    .array(
      z.object({
        title: z.string().min(3).max(200),
        brief: z.string().min(20).max(3000),
        target_outcome: z.string().min(5).max(800),
        urgency: z
          .preprocess((v) => (typeof v === 'string' ? v.toLowerCase() : v),
            z.enum(['now', 'this_week', 'when_capacity']))
          .optional()
          .default('this_week'),
      }),
    )
    .max(2)
    .default([]),
});

export type AutonomousProposal = z.infer<typeof AutonomousProposalSchema>;

// ─── Project + ProjectArtifact (matches Supabase migration projects_v1) ──
export type ProjectStatus = 'briefed' | 'routing' | 'in_progress' | 'review' | 'shipped' | 'cancelled';
export type ProjectAssignedBy = 'chairman' | 'arora';

export type Project = {
  id: string;
  title: string;
  brief: string;
  target_outcome: string | null;
  assigned_by: ProjectAssignedBy;
  status: ProjectStatus;
  decomposition: { rationale: string; tasks: Array<Record<string, unknown>> } | null;
  created_at: string;
  kicked_off_at: string | null;
  completed_at: string | null;
};

export type ProjectArtifact = {
  id: string;
  project_id: string;
  task_id: string | null;
  role: Role;
  type: 'analysis' | 'report' | 'spec' | 'memo';
  title: string;
  body_markdown: string;
  data_json: Record<string, unknown> | null;
  created_at: string;
};

// Persisted state file — public/agents/<role>/state.json
export type AgentState = {
  role: Role;
  lastRunAt: string; // ISO
  nextRunAt: string; // ISO
  runs: number;
  lastOutput: AgentRunOutput;
  health: 'ok' | 'degraded' | 'offline';
  modelLastUsed: string;
};

// Log entry — public/agents/<role>/log.jsonl (append-only, newline-delimited)
export type AgentLogEntry = {
  at: string;
  role: Role;
  status: 'ok' | 'error' | 'fallback';
  durationMs: number;
  itemsCount: number;
  alertsCount: number;
  error?: string;
};
