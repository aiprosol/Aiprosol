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
  owner_role: z
    .preprocess((v) => (typeof v === 'string' ? v.toLowerCase() : v),
      z.enum(['arora', 'coo', 'cmo', 'cco', 'cto', 'cro', 'clo', 'cpo', 'cpm', 'da']))
    .optional(),
  priority: z
    .preprocess((v) => (v === 'urgent' || v === 'NOW' ? 'now' : (typeof v === 'string' ? v.toLowerCase() : v)),
      z.enum(['low', 'normal', 'high', 'now']))
    .optional()
    .default('normal'),
  notes: z.string().max(500).optional(),
});

export const AgentRunOutputSchema = z.object({
  summary: z.string().min(1).max(500),
  items: z.array(AgentItemSchema).max(20),
  alerts: z.array(AgentAlertSchema).max(10).default([]),
  kpis: z.array(AgentKpiSchema).max(10).default([]),
  proposed_tasks: z.array(ProposedTaskSchema).max(5).default([]),
  next_focus: z.string().max(400).optional(),
});

export type AgentItem = z.infer<typeof AgentItemSchema>;
export type AgentAlert = z.infer<typeof AgentAlertSchema>;
export type AgentKpi = z.infer<typeof AgentKpiSchema>;
export type ProposedTask = z.infer<typeof ProposedTaskSchema>;
export type AgentRunOutput = z.infer<typeof AgentRunOutputSchema>;

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
