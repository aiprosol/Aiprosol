// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · STUDIO COPILOT — tool registry
// One provider-agnostic source of truth for every action the operator's
// assistant can take. Each tool carries:
//   - a Zod schema (validates the MODEL's args at execution time)
//   - a hand-authored JSON Schema (what the model sees — kept tiny)
//   - a risk level: 'safe' runs server-side immediately; 'confirm' is gated
//     behind explicit operator approval in the UI (loop.ts enforces this).
//
// Handlers reuse the existing studio plumbing so behaviour can't drift:
//   - the shared RESOURCES field whitelist (same as the human PATCH route)
//   - runAgent() (same runner as the cron + manual triggers)
//   - the outward-action lib fns (Gmail / LinkedIn / Resend), called in-process.
// ─────────────────────────────────────────────────────────────────────────

import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ROLES } from '@/lib/agents/types';
import { runAgent } from '@/lib/agents/runner';
import { RESOURCES } from '@/lib/studio/resources';
import { sendViaGmail } from '@/lib/gmail/send';
import { publishToLinkedIn, isLinkedInConfigured } from '@/lib/linkedin/publish';
import { sendEmail, isResendConfigured } from '@/lib/resend';
import type { ProviderTool } from './providers/types';
import { getFunnel } from '@/lib/studio/funnel';
import { getRevenue } from '@/lib/studio/revenue';
import { getSystemSnapshot } from '@/lib/studio/system';
import { composeBrief, saveBrief, getLatestBrief } from './brief';
import { applyContentEdit } from '@/lib/studio/content-edit';

export type ToolRisk = 'safe' | 'confirm';

export type ToolContext = {
  operatorEmail: string;
  db: SupabaseClient;
};

export type ToolResult = {
  ok: boolean;
  summary: string;
  data?: unknown;
  error?: string;
};

export type ToolDef = {
  name: string;
  description: string;
  parameters: z.ZodType;
  jsonSchema: Record<string, unknown>;
  risk: ToolRisk;
  run: (args: unknown, ctx: ToolContext) => Promise<ToolResult>;
  /** Short human-readable preview of a pending confirm action. */
  preview?: (args: Record<string, unknown>) => string;
};

const ROLE_VALUES = ROLES as readonly string[];

// ─── query_studio (safe) ─────────────────────────────────────────────────
const QUERY_TABLES = {
  tasks: { cols: 'id,title,status,priority,owner_role,due_date,project_id', order: 'created_at' },
  leads: { cols: 'id,name,company,industry,status,score,email', order: 'created_at' },
  outreach_drafts: { cols: 'id,subject,status,target_segment,recipient_email', order: 'created_at' },
  linkedin_posts: { cols: 'id,title,status,industry,scheduled_for', order: 'created_at' },
  affiliate_partners: { cols: 'id,name,category,status,contact_email', order: 'created_at' },
  projects: { cols: 'id,title,status,assigned_by,target_outcome', order: 'created_at' },
  sops: { cols: 'id,slug,title,category', order: 'updated_at' },
} as const;
type QueryTable = keyof typeof QUERY_TABLES;

const queryStudioSchema = z.object({
  resource: z.enum(Object.keys(QUERY_TABLES) as [QueryTable, ...QueryTable[]]),
  status: z.string().max(40).optional(),
  limit: z.number().int().min(1).max(50).optional(),
});

// ─── create_task (safe) ──────────────────────────────────────────────────
const createTaskSchema = z.object({
  title: z.string().min(3).max(280),
  priority: z.enum(['low', 'normal', 'high', 'now']).optional(),
  owner_role: z.enum(ROLE_VALUES as [string, ...string[]]).optional(),
  notes: z.string().max(1000).optional(),
  due_date: z.string().max(40).optional(),
});

// ─── update_resource (safe) ──────────────────────────────────────────────
const RESOURCE_KEYS = Object.keys(RESOURCES) as [string, ...string[]];
const updateResourceSchema = z.object({
  resource: z.enum(RESOURCE_KEYS),
  id: z.string().min(8).max(64),
  fields: z.record(z.string(), z.unknown()),
});

// ─── run_agent (safe) ────────────────────────────────────────────────────
const runAgentSchema = z.object({
  role: z.enum(ROLE_VALUES as [string, ...string[]]),
});

// ─── create_project (safe) ───────────────────────────────────────────────
const createProjectSchema = z.object({
  title: z.string().min(3).max(200),
  brief: z.string().min(20).max(5000),
  target_outcome: z.string().max(800).optional(),
});

// ─── outward actions (confirm) ───────────────────────────────────────────
const idOnlySchema = z.object({ id: z.string().min(8).max(64) });
const sendOutreachSchema = z.object({
  id: z.string().min(8).max(64),
  to: z.string().email().max(200).optional(),
  toName: z.string().max(160).optional(),
});

// ─── Copilot v2 read/memory/brief tool schemas ───
const getFunnelSchema = z.object({ days: z.number().int().min(1).max(90).optional() });
const emptySchema = z.object({});
const rememberSchema = z.object({ key: z.string().min(1).max(80), value: z.string().min(1).max(1000) });
const recallSchema = z.object({ key: z.string().max(80).optional() });
const editContentSchema = z.object({ type: z.enum(['product', 'service']), slug: z.string().min(1).max(120), fields: z.record(z.string(), z.unknown()) });

export const TOOLS: ToolDef[] = [
  {
    name: 'query_studio',
    description:
      'Read current studio data so you can answer questions and find row IDs before acting. ' +
      'resource is one of: tasks, leads, outreach_drafts, linkedin_posts, affiliate_partners, projects, sops. ' +
      'Optionally filter by status. Returns up to `limit` recent rows (default 15).',
    parameters: queryStudioSchema,
    risk: 'safe',
    jsonSchema: {
      type: 'object',
      properties: {
        resource: { type: 'string', enum: Object.keys(QUERY_TABLES) },
        status: { type: 'string', description: 'Optional status filter, e.g. "draft", "todo".' },
        limit: { type: 'integer', description: 'Max rows (1-50, default 15).' },
      },
      required: ['resource'],
      additionalProperties: false,
    },
    async run(raw, ctx) {
      const { resource, status, limit } = queryStudioSchema.parse(raw);
      const conf = QUERY_TABLES[resource];
      let q = ctx.db.from(resource).select(conf.cols).order(conf.order, { ascending: false }).limit(limit ?? 15);
      if (status && resource !== 'sops') q = q.eq('status', status);
      const { data, error } = await q;
      if (error) return { ok: false, summary: `Query failed: ${error.message}`, error: error.message };
      const rows = data ?? [];
      return { ok: true, summary: `${rows.length} ${resource} row(s).`, data: rows };
    },
  },

  {
    name: 'create_task',
    description:
      'Create a new internal task in the studio (status starts as "todo", source "human"). ' +
      'Use for to-dos the operator asks you to capture. Internal only — sends nothing externally.',
    parameters: createTaskSchema,
    risk: 'safe',
    jsonSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Short task title (3-280 chars).' },
        priority: { type: 'string', enum: ['low', 'normal', 'high', 'now'] },
        owner_role: { type: 'string', enum: [...ROLE_VALUES], description: 'C-suite role that owns it.' },
        notes: { type: 'string' },
        due_date: { type: 'string', description: 'ISO date, optional.' },
      },
      required: ['title'],
      additionalProperties: false,
    },
    async run(raw, ctx) {
      const a = createTaskSchema.parse(raw);
      const { data, error } = await ctx.db
        .from('tasks')
        .insert({
          title: a.title,
          status: 'todo',
          priority: a.priority ?? 'normal',
          owner_role: a.owner_role ?? null,
          notes: a.notes ?? null,
          due_date: a.due_date ?? null,
          source: 'human',
          source_role: null,
        })
        .select('id,title')
        .maybeSingle();
      if (error) return { ok: false, summary: `Create failed: ${error.message}`, error: error.message };
      return { ok: true, summary: `Created task "${a.title}".`, data };
    },
  },

  {
    name: 'update_resource',
    description:
      'Update fields on one studio row. resource is one of: ' +
      `${RESOURCE_KEYS.join(', ')}. Only whitelisted fields are accepted (e.g. status, priority, notes). ` +
      'NOTE: setting a "status" field here does NOT publish or send anything — outward delivery is separate ' +
      '(publish_linkedin / publish_substack / send_outreach).',
    parameters: updateResourceSchema,
    risk: 'safe',
    jsonSchema: {
      type: 'object',
      properties: {
        resource: { type: 'string', enum: [...RESOURCE_KEYS] },
        id: { type: 'string' },
        fields: { type: 'object', description: 'Field/value pairs to update (whitelisted per resource).' },
      },
      required: ['resource', 'id', 'fields'],
      additionalProperties: false,
    },
    async run(raw, ctx) {
      const a = updateResourceSchema.parse(raw);
      const conf = RESOURCES[a.resource];
      if (!conf) return { ok: false, summary: `Unknown resource: ${a.resource}`, error: 'unknown-resource' };
      const update: Record<string, unknown> = {};
      for (const key of conf.allowed) if (key in a.fields) update[key] = a.fields[key];
      if (Object.keys(update).length === 0) {
        return {
          ok: false,
          summary: `No updatable fields. Allowed for ${a.resource}: ${conf.allowed.join(', ')}.`,
          error: 'no-fields',
        };
      }
      if (a.resource === 'outreach' && update.status === 'sent' && !update.sent_at) update.sent_at = new Date().toISOString();
      if (a.resource === 'linkedin' && update.status === 'published' && !update.published_at) update.published_at = new Date().toISOString();
      const { data, error } = await ctx.db.from(conf.table).update(update).eq('id', a.id).select('*').maybeSingle();
      if (error) return { ok: false, summary: `Update failed: ${error.message}`, error: error.message };
      if (!data) return { ok: false, summary: 'Row not found.', error: 'not-found' };
      return { ok: true, summary: `Updated ${a.resource} ${a.id} (${Object.keys(update).join(', ')}).`, data };
    },
  },

  {
    name: 'run_agent',
    description:
      `Trigger one C-suite agent to run now. role is one of: ${ROLE_VALUES.join(', ')}. ` +
      'Agents produce drafts/analysis internally — they never publish or email on their own.',
    parameters: runAgentSchema,
    risk: 'safe',
    jsonSchema: {
      type: 'object',
      properties: { role: { type: 'string', enum: [...ROLE_VALUES] } },
      required: ['role'],
      additionalProperties: false,
    },
    async run(raw) {
      const { role } = runAgentSchema.parse(raw);
      try {
        const result = await runAgent(role as (typeof ROLES)[number]);
        const summary = result.state?.lastOutput?.summary;
        return {
          ok: result.ok,
          summary: result.ok ? `Ran ${role}: ${summary ?? 'done'}` : `Agent ${role} failed: ${result.error ?? 'unknown'}`,
          data: { durationMs: result.durationMs, summary },
          error: result.ok ? undefined : result.error,
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { ok: false, summary: `Agent ${role} threw: ${msg}`, error: msg };
      }
    },
  },

  {
    name: 'create_project',
    description:
      'Create a new chairman-briefed project (status "briefed"). Does NOT auto-route into tasks — ' +
      'the operator dispatches it from the Projects tab afterwards.',
    parameters: createProjectSchema,
    risk: 'safe',
    jsonSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        brief: { type: 'string', description: 'The substance the C-suite reads (20-5000 chars).' },
        target_outcome: { type: 'string' },
      },
      required: ['title', 'brief'],
      additionalProperties: false,
    },
    async run(raw, ctx) {
      const a = createProjectSchema.parse(raw);
      const { data, error } = await ctx.db
        .from('projects')
        .insert({
          title: a.title,
          brief: a.brief,
          target_outcome: a.target_outcome ?? null,
          assigned_by: 'chairman',
          status: 'briefed',
        })
        .select('id,title,status')
        .maybeSingle();
      if (error) return { ok: false, summary: `Create failed: ${error.message}`, error: error.message };
      return { ok: true, summary: `Briefed project "${a.title}" (dispatch it from the Projects tab).`, data };
    },
  },

  {
    name: 'get_funnel',
    description: 'Read the conversion funnel (PostHog) for the last N days (default 7): visits → ROI audit → product view → checkout intent, plus top pages.',
    parameters: getFunnelSchema,
    risk: 'safe',
    jsonSchema: {
      type: 'object',
      properties: { days: { type: 'integer', description: 'Window in days (1-90, default 7).' } },
      additionalProperties: false,
    },
    async run(raw) {
      const { days } = getFunnelSchema.parse(raw);
      const f = await getFunnel(days ?? 7);
      if (!f.configured) return { ok: false, summary: 'Funnel not configured (PostHog key missing).', error: 'not-configured' };
      return { ok: true, summary: `Funnel ${f.windowDays}d: ${f.stages.map((s) => `${s.label} ${s.count}`).join(' → ')}`, data: { stages: f.stages, topPages: f.topPages } };
    },
  },

  {
    name: 'get_revenue',
    description: 'Read live revenue from Stripe: today, month-to-date, MRR, active subscriptions, by-product, recent orders.',
    parameters: emptySchema,
    risk: 'safe',
    jsonSchema: { type: 'object', properties: {}, additionalProperties: false },
    async run() {
      const r = await getRevenue();
      if (!r.configured) return { ok: false, summary: 'Revenue not configured (Stripe key missing).', error: 'not-configured' };
      return { ok: true, summary: `Today ${r.currency} ${r.today} · MTD ${r.mtd} · MRR ${r.mrr} · ${r.orderCount} recent orders`, data: r };
    },
  },

  {
    name: 'system_status',
    description: 'Check system health: which API keys are configured, agent errors (24h), and database status.',
    parameters: emptySchema,
    risk: 'safe',
    jsonSchema: { type: 'object', properties: {}, additionalProperties: false },
    async run() {
      const s = await getSystemSnapshot();
      const missing = s.env.filter((e) => !e.set).map((e) => e.name);
      return {
        ok: true,
        summary: `${s.env.length - missing.length}/${s.env.length} keys set · ${s.agents.errors24h} agent errors 24h · db ${s.supabase.ok ? 'ok' : 'down'}`,
        data: { missingKeys: missing, agents: s.agents, supabase: s.supabase, digest: s.digest },
      };
    },
  },

  {
    name: 'remember',
    description: 'Save a standing fact or preference so you recall it in future conversations (e.g. preferred tone, a recurring instruction).',
    parameters: rememberSchema,
    risk: 'safe',
    jsonSchema: {
      type: 'object',
      properties: { key: { type: 'string', description: 'Short label, e.g. "tone" or "weekly_focus".' }, value: { type: 'string' } },
      required: ['key', 'value'],
      additionalProperties: false,
    },
    async run(raw, ctx) {
      const { key, value } = rememberSchema.parse(raw);
      const { error } = await ctx.db
        .from('assistant_memory')
        .upsert({ operator_email: ctx.operatorEmail, key, value, updated_at: new Date().toISOString() }, { onConflict: 'operator_email,key' });
      if (error) return { ok: false, summary: `Couldn't save: ${error.message}`, error: error.message };
      return { ok: true, summary: `Remembered "${key}".` };
    },
  },

  {
    name: 'recall',
    description: 'Recall saved operator memory — all items, or one by key.',
    parameters: recallSchema,
    risk: 'safe',
    jsonSchema: { type: 'object', properties: { key: { type: 'string', description: 'Optional specific key.' } }, additionalProperties: false },
    async run(raw, ctx) {
      const { key } = recallSchema.parse(raw);
      let q = ctx.db.from('assistant_memory').select('key, value').eq('operator_email', ctx.operatorEmail);
      if (key) q = q.eq('key', key);
      const { data } = await q.limit(50);
      return { ok: true, summary: `${(data ?? []).length} memory item(s).`, data: data ?? [] };
    },
  },

  {
    name: 'get_latest_brief',
    description: 'Get the most recent operator brief.',
    parameters: emptySchema,
    risk: 'safe',
    jsonSchema: { type: 'object', properties: {}, additionalProperties: false },
    async run() {
      const b = await getLatestBrief();
      return { ok: Boolean(b), summary: b ? `Latest brief (${b.created_at.slice(0, 16).replace('T', ' ')})` : 'No brief yet — use generate_brief.', data: b };
    },
  },

  {
    name: 'generate_brief',
    description: "Generate a fresh operator brief now from live revenue, funnel, agent and system state. Use when asked for a 'brief', 'summary', or 'how are we doing'.",
    parameters: emptySchema,
    risk: 'safe',
    jsonSchema: { type: 'object', properties: {}, additionalProperties: false },
    async run(_raw, ctx) {
      const b = await composeBrief(Date.now());
      if (!b) return { ok: false, summary: 'No model configured for the brief.', error: 'no-provider' };
      await saveBrief(b.content, b.provider, ctx.operatorEmail, false);
      return { ok: true, summary: 'Brief generated.', data: { content: b.content } };
    },
  },

  {
    name: 'publish_linkedin',
    description: 'Publish a linkedin_posts row to LinkedIn. OUTWARD ACTION — requires operator confirmation.',
    parameters: idOnlySchema,
    risk: 'confirm',
    preview: (a) => `Publish LinkedIn post ${String(a.id).slice(0, 12)}… to LinkedIn`,
    jsonSchema: {
      type: 'object',
      properties: { id: { type: 'string', description: 'linkedin_posts row id.' } },
      required: ['id'],
      additionalProperties: false,
    },
    async run(raw, ctx) {
      const { id } = idOnlySchema.parse(raw);
      if (!isLinkedInConfigured()) {
        return { ok: false, summary: 'LinkedIn not configured (LINKEDIN_ACCESS_TOKEN / LINKEDIN_AUTHOR_URN).', error: 'linkedin-not-configured' };
      }
      const { data: post, error: loadErr } = await ctx.db.from('linkedin_posts').select('*').eq('id', id).maybeSingle();
      if (loadErr || !post) return { ok: false, summary: 'Post not found.', error: 'post-not-found' };
      if (post.status === 'published') return { ok: false, summary: 'Already published.', error: 'already-published' };
      const parts = [post.title, post.hook, post.body].filter((s): s is string => Boolean(s?.trim()));
      const result = await publishToLinkedIn({ body: parts.join('\n\n').slice(0, 3000), visibility: 'PUBLIC' });
      if (!result.ok) return { ok: false, summary: `LinkedIn publish failed: ${result.error}`, error: result.error };
      await ctx.db.from('linkedin_posts').update({ status: 'published', published_at: new Date().toISOString() }).eq('id', id);
      return { ok: true, summary: `Published to LinkedIn${result.postUrl ? ` — ${result.postUrl}` : ''}.`, data: { postUrl: result.postUrl } };
    },
  },

  {
    name: 'publish_substack',
    description: 'Email a linkedin_posts row to Substack for publishing. OUTWARD ACTION — requires operator confirmation.',
    parameters: idOnlySchema,
    risk: 'confirm',
    preview: (a) => `Send post ${String(a.id).slice(0, 12)}… to Substack`,
    jsonSchema: {
      type: 'object',
      properties: { id: { type: 'string', description: 'linkedin_posts row id (long-form draft).' } },
      required: ['id'],
      additionalProperties: false,
    },
    async run(raw, ctx) {
      const { id } = idOnlySchema.parse(raw);
      const substackTo = process.env.SUBSTACK_PUBLISH_EMAIL;
      if (!isResendConfigured()) return { ok: false, summary: 'Resend not configured.', error: 'resend-not-configured' };
      if (!substackTo) return { ok: false, summary: 'SUBSTACK_PUBLISH_EMAIL not set.', error: 'substack-not-configured' };
      const { data: post, error: loadErr } = await ctx.db.from('linkedin_posts').select('*').eq('id', id).maybeSingle();
      if (loadErr || !post) return { ok: false, summary: 'Post not found.', error: 'post-not-found' };
      if (post.status === 'published') return { ok: false, summary: 'Already published.', error: 'already-published' };
      const subject = post.title?.trim() || '(untitled)';
      const bodyText = [post.hook, post.body].filter((s): s is string => Boolean(s?.trim())).join('\n\n');
      const bodyHtml = bodyText.split('\n\n').map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
      const result = await sendEmail({ to: substackTo, subject, html: bodyHtml, text: bodyText, tags: [{ name: 'category', value: 'substack-publish' }] });
      if (!result.ok) return { ok: false, summary: `Substack send failed: ${result.error}`, error: result.error };
      await ctx.db.from('linkedin_posts').update({ status: 'published', published_at: new Date().toISOString() }).eq('id', id);
      return { ok: true, summary: `Sent to Substack (${substackTo}). Confirm it became a draft.`, data: { sentTo: substackTo } };
    },
  },

  {
    name: 'send_outreach',
    description:
      'Send an outreach_drafts row via Gmail. OUTWARD ACTION — requires operator confirmation. ' +
      'Optionally pass `to` to override the recipient.',
    parameters: sendOutreachSchema,
    risk: 'confirm',
    preview: (a) => `Send outreach ${String(a.id).slice(0, 12)}…${a.to ? ` to ${a.to}` : ''} via Gmail`,
    jsonSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'outreach_drafts row id.' },
        to: { type: 'string', description: 'Override recipient email (optional).' },
        toName: { type: 'string' },
      },
      required: ['id'],
      additionalProperties: false,
    },
    async run(raw, ctx) {
      const a = sendOutreachSchema.parse(raw);
      const { data: draft, error: loadErr } = await ctx.db.from('outreach_drafts').select('*').eq('id', a.id).maybeSingle();
      if (loadErr || !draft) return { ok: false, summary: 'Draft not found.', error: 'draft-not-found' };
      if (draft.status === 'sent') return { ok: false, summary: 'Already sent.', error: 'already-sent' };

      let to = a.to?.trim() || draft.recipient_email?.trim() || '';
      let toName = a.toName?.trim() || draft.recipient_name?.trim() || undefined;
      if (!to && typeof draft.notion_id === 'string' && draft.notion_id.startsWith('lead:')) {
        const { data: lead } = await ctx.db.from('leads').select('email,name').eq('id', draft.notion_id.slice(5)).maybeSingle();
        if (lead?.email) {
          to = lead.email;
          toName = toName || lead.name || undefined;
        }
      }
      if (!to) return { ok: false, summary: 'No recipient — pass `to` or set the draft recipient.', error: 'no-recipient' };

      const result = await sendViaGmail({
        to,
        toName,
        subject: draft.subject || '(no subject)',
        bodyText: draft.body,
        clientMessageId: `draft-${draft.id}`,
      });
      if (!result.ok) return { ok: false, summary: `Gmail send failed: ${result.error}`, error: result.error };

      await ctx.db
        .from('outreach_drafts')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          recipient_email: to,
          recipient_name: toName ?? null,
          gmail_message_id: result.messageId,
          gmail_thread_id: result.threadId,
          sent_by: ctx.operatorEmail,
        })
        .eq('id', a.id);
      return { ok: true, summary: `Sent to ${to} via Gmail.`, data: { messageId: result.messageId, to } };
    },
  },

  {
    name: 'edit_content',
    description:
      'Edit a product or service in the catalog (price, availability, copy). OUTWARD ACTION — commits to the repo and deploys the site, so it requires operator confirmation.',
    parameters: editContentSchema,
    risk: 'confirm',
    preview: (a) => `Edit ${String(a.type)} "${String(a.slug)}" (${Object.keys((a.fields as Record<string, unknown>) || {}).join(', ')}) → commit + deploy`,
    jsonSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['product', 'service'] },
        slug: { type: 'string' },
        fields: { type: 'object', description: 'Whitelisted: products[price, available, shortDescription, longDescription, name, expectedShipDate]; services[title, shortDescription, longDescription].' },
      },
      required: ['type', 'slug', 'fields'],
      additionalProperties: false,
    },
    async run(raw) {
      const a = editContentSchema.parse(raw);
      const res = await applyContentEdit(a);
      if (!res.ok) return { ok: false, summary: `Content edit failed: ${res.error}`, error: res.error };
      return { ok: true, summary: `Committed ${a.type} ${a.slug} (${Object.keys(res.applied || {}).join(', ')}) — deploys in ~70s.`, data: { sha: res.sha } };
    },
  },
];

export const TOOL_MAP: Map<string, ToolDef> = new Map(TOOLS.map((t) => [t.name, t]));

/** The tool surface as the providers want it (name/description/JSON schema). */
export const PROVIDER_TOOLS: ProviderTool[] = TOOLS.map((t) => ({
  name: t.name,
  description: t.description,
  parameters: t.jsonSchema,
}));
