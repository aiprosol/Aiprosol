// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · AGENTS — runner
// One generic runner that drives any agent through one cycle.
//
// Flow:
//   1. Load agent's system prompt + role meta
//   2. Build context: other agents' last states, products.json, services.json
//   3. Call Groq with system + context
//   4. Parse + validate JSON output (Zod)
//   5. Persist state.json + append log.jsonl
//   6. Fallback to canned content if Groq is unavailable
// ─────────────────────────────────────────────────────────────────────────

import { ROLE_META, type Role, type AgentState, type AgentRunOutput, type Deliverable, AgentRunOutputSchema } from './types';
import { AGENT_PROMPTS, OUTPUT_FORMAT } from './prompts';
import { loadAgentConfig } from './config';
import { readAllStates, writeState, appendLog } from './store';
import { loadContext, renderContext } from './context';
import { runKpiRollup } from './kpi-rollup';
import { getProducts, getServices } from '@/lib/content';
import { isSupabaseConfigured, requireSupabaseAdmin } from '@/lib/db/supabase';

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

// Build the per-run context an agent sees as its "user" message
async function buildContext(role: Role, otherStates: Record<Role, AgentState | null>): Promise<string> {
  const now = new Date();
  const utc = now.toISOString();

  // Project assignments come FIRST in the message — this is the priority work.
  // If empty, the agent falls back to its normal operational cycle.
  const assignmentsBlock = await renderAssignments(role);

  // Compact view of what every other agent reported last
  const peerDigest = Object.entries(otherStates)
    .filter(([r]) => r !== role)
    .map(([r, s]) => {
      if (!s) return `- ${r.toUpperCase()}: never run`;
      const top = s.lastOutput.items.slice(0, 2).map((i) => `· ${i.action} → ${i.result}`).join('\n      ');
      return `- ${r.toUpperCase()} (last ${s.lastRunAt.slice(0, 16)}Z):\n      ${top || '· (idle)'}`;
    })
    .join('\n');

  // Product catalogue snapshot
  const products = getProducts();
  const productSummary = `${products.length} products in catalogue, prices $${Math.min(...products.map((p) => p.price))} → $${Math.max(...products.map((p) => p.price))}, ${products.filter((p) => (p as { available?: boolean }).available).length} sellable now.`;
  const services = getServices();
  const serviceSummary = `${services.length} managed services across plan tiers (Starter $997, Growth $2,997, Enterprise $7,997 monthly).`;

  // Role-specific Supabase data
  const roleCtx = await loadContext(role);
  const ctxMarkdown = renderContext(roleCtx);

  return `# CONTEXT FOR THIS RUN
Current UTC time: ${utc}
You are running as: ${role.toUpperCase()} (${ROLE_META[role].title} · ${ROLE_META[role].fullName})
Your cadence: every ${ROLE_META[role].cadenceHrs} hours
Your KPIs to track: ${ROLE_META[role].ownsKpis.join(', ')}

${assignmentsBlock}

# CATALOGUE SNAPSHOT
${productSummary}
${serviceSummary}

# WHAT YOUR PEERS REPORTED LAST RUN
${peerDigest}

# YOUR LIVE DATA (from the Aiprosol Supabase — this is real, not seed)
${ctxMarkdown || '(no role-specific data loaded yet — operate from system prompt + peer context only)'}

# YOUR TASK
Run your cycle now. Generate the JSON output per the OUTPUT FORMAT in your system prompt.

**HARD RULES for this cycle:**
1. **Project assignments come first.** If "YOUR CURRENT ASSIGNMENTS" is non-empty, populate deliverables[] to ship those tasks before doing anything else.
2. Reference actual items from "YOUR LIVE DATA" by name/ID/slug when relevant — don't invent fictional ones.
3. If your live data shows an empty table, say so honestly in the summary and propose what to seed it with.
4. If a task in the backlog is yours to action, mention it explicitly in items[].
5. Specific dollar amounts and time estimates — but ground them in the catalogue (the price range above) and the peer activity, not random numbers.
`;
}

// ─── Project assignments fetch + render ─────────────────────────────────
// Returns a markdown block listing every open project-linked task assigned
// to this role. Each entry exposes the task UUID so the agent can reference
// it in deliverables[].task_id. Empty block when nothing is assigned.
async function renderAssignments(role: Role): Promise<string> {
  if (!isSupabaseConfigured()) {
    return '# YOUR CURRENT ASSIGNMENTS\n(Supabase not configured — no assignments to surface.)';
  }
  try {
    const db = requireSupabaseAdmin();
    const { data, error } = await db
      .from('tasks')
      .select('id, title, status, priority, deliverable_type, notes, project_id, projects(title, brief, target_outcome)')
      .eq('owner_role', role)
      .in('status', ['todo', 'in_progress'])
      .not('project_id', 'is', null)
      .order('priority', { ascending: false })
      .limit(4);
    if (error) {
      console.warn(`[agents/runner] renderAssignments(${role}) failed:`, error.message);
      return '# YOUR CURRENT ASSIGNMENTS\n(Could not load assignments — fall back to your normal cycle.)';
    }
    if (!data || data.length === 0) {
      return '# YOUR CURRENT ASSIGNMENTS\n(No project tasks assigned to you right now — run your normal cycle and populate deliverables: [].)';
    }
    const lines = data.map((t) => {
      const proj = (t as { projects?: { title?: string; brief?: string; target_outcome?: string | null } | null }).projects;
      const projTitle = proj?.title ?? '(unlinked)';
      const projBrief = (proj?.brief ?? '').slice(0, 400);
      const target = (proj?.target_outcome ?? '').slice(0, 200);
      const notes = (t.notes ?? '').slice(0, 400);
      return `- [Project: "${projTitle}"] Task ${t.id}
    Title:           ${t.title}
    Deliverable:     ${t.deliverable_type || 'none'}
    Priority:        ${t.priority || 'normal'}
    Status:          ${t.status}
    Notes:           ${notes || '(none)'}
    Project brief:   ${projBrief || '(no brief)'}
    Target outcome:  ${target || '(none)'}`;
    });
    return `# YOUR CURRENT ASSIGNMENTS (Projects from Chairman/CEO — execute these FIRST)\nFor each task here, produce a deliverables[] entry with payload type matching the Deliverable column.\nUse the exact Task UUID as deliverables[].task_id.\n\n${lines.join('\n\n')}`;
  } catch (err) {
    console.warn(`[agents/runner] renderAssignments(${role}) threw:`, err);
    return '# YOUR CURRENT ASSIGNMENTS\n(Error loading assignments — fall back to your normal cycle.)';
  }
}

// Single-cycle agent run
export async function runAgent(role: Role): Promise<{
  ok: boolean;
  state: AgentState | null;
  error?: string;
  durationMs: number;
}> {
  const t0 = Date.now();

  // Studio overrides (C-Suite control): a disabled agent no-ops; a prompt
  // override replaces the persona, with OUTPUT_FORMAT re-appended so the JSON
  // contract can't be broken. Falls back to code defaults on any miss.
  const cfg = await loadAgentConfig(role);
  if (cfg?.enabled === false) {
    return { ok: true, state: null, error: 'agent-disabled', durationMs: Date.now() - t0 };
  }
  const systemPrompt = cfg?.systemPromptOverride && cfg.systemPromptOverride.trim()
    ? `${cfg.systemPromptOverride.trim()}\n\n${OUTPUT_FORMAT}`
    : AGENT_PROMPTS[role];

  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || DEFAULT_MODEL;

  // Load peer states (read-only)
  const peers = await readAllStates();

  const userContext = await buildContext(role, peers);

  // Graceful fallback if no API key
  if (!apiKey) {
    const fallback = fallbackOutput(role);
    const state = persistableState(role, fallback, 'fallback-no-key');
    await writeState(role, state);
    await appendLog(role, {
      at: new Date().toISOString(),
      role,
      status: 'fallback',
      durationMs: Date.now() - t0,
      itemsCount: fallback.items.length,
      alertsCount: fallback.alerts.length,
    });
    return { ok: true, state, durationMs: Date.now() - t0 };
  }

  // Models in fallback order — try the smarter one first, drop down if
  // rate-limited. Each model has its own daily quota on Groq free tier.
  // mixtral + gemma2-9b were decommissioned (Groq sunsets Apr–May 2026).
  // We now stick to llama-3.3-70b (primary) → llama-3.1-8b (fallback).
  // Two retries is plenty — anything further hits the canned fallback.
  const FALLBACK_MODELS = [
    model,
    'llama-3.1-8b-instant',
  ];

  async function callGroqOnce(useModel: string): Promise<Response> {
    return fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: useModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContext },
        ],
        temperature: 0.6,
        max_tokens: 900,
        response_format: { type: 'json_object' },
      }),
    });
  }

  async function callGroq(): Promise<{ content: string; usedModel: string }> {
    let lastErr = '';
    for (const tryModel of FALLBACK_MODELS) {
      const res = await callGroqOnce(tryModel);
      if (res.ok) {
        const json = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
        const content = json.choices?.[0]?.message?.content;
        if (content) return { content, usedModel: tryModel };
        lastErr = `${tryModel}: empty content`;
        continue;
      }
      if (res.status === 429) {
        // For 429, try short wait + 1 retry on same model; if still failing, fall through to next model
        const body = await res.text();
        const m = body.match(/try again in ([\d.]+)s/i);
        const waitS = m ? Math.min(parseFloat(m[1]) + 0.5, 12) : 5;
        await new Promise((r) => setTimeout(r, waitS * 1000));
        const retry = await callGroqOnce(tryModel);
        if (retry.ok) {
          const json = await retry.json() as { choices?: Array<{ message?: { content?: string } }> };
          const content = json.choices?.[0]?.message?.content;
          if (content) return { content, usedModel: tryModel };
        }
        lastErr = `${tryModel}: 429 after ${waitS}s wait — falling back to next model`;
        continue;
      }
      lastErr = `${tryModel}: HTTP ${res.status}`;
      // Non-429 errors → don't try other models, fail fast
      throw new Error(`Groq ${lastErr}: ${(await res.text()).slice(0, 150)}`);
    }
    throw new Error(`All Groq models exhausted. Last error: ${lastErr}`);
  }

  try {
    const { content, usedModel } = await callGroq();

    const parsed = JSON.parse(content);
    const validated = AgentRunOutputSchema.parse(parsed);

    const state = persistableState(role, validated, usedModel);
    await writeState(role, state);
    await appendLog(role, {
      at: new Date().toISOString(),
      role,
      status: 'ok',
      durationMs: Date.now() - t0,
      itemsCount: validated.items.length,
      alertsCount: validated.alerts.length,
    });

    // ─── Persist agent-proposed tasks into the backlog ──────────────
    // Each proposal becomes a row in `tasks` with source='agent' so the
    // /studio Tasks tab can render them with a distinct "proposed by X" tag.
    if (validated.proposed_tasks?.length) {
      await persistProposedTasks(role, validated.proposed_tasks);
    }

    // ─── Persist agent deliverables ─────────────────────────────────
    // Each deliverable fans out into the right table (outreach_drafts /
    // linkedin_posts / sops / project_artifacts) and marks the originating
    // task as status='review' with deliverable_id pointing at the artifact.
    if (validated.deliverables?.length) {
      await persistDeliverables(role, validated.deliverables);
    }

    // ─── DA runs the daily KPI roll-up after its LLM cycle ──────────
    // We do this for DA only — the other agents shouldn't be writing
    // analytics. Failures don't kill the run; they just go in the log.
    if (role === 'da') {
      try {
        const rollup = await runKpiRollup();
        if (rollup.ok) {
          console.log(`[agents] DA kpi-rollup wrote ${rollup.rowsWritten} rows`);
        } else {
          console.warn(`[agents] DA kpi-rollup failed: ${rollup.error}`);
        }
      } catch (err) {
        console.warn('[agents] DA kpi-rollup threw:', err);
      }
    }
    return { ok: true, state, durationMs: Date.now() - t0 };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // Fall back to canned output on any error
    const fallback = fallbackOutput(role);
    const state = persistableState(role, fallback, `${model} (fallback)`);
    state.health = 'degraded';
    await writeState(role, state);
    await appendLog(role, {
      at: new Date().toISOString(),
      role,
      status: 'error',
      durationMs: Date.now() - t0,
      itemsCount: fallback.items.length,
      alertsCount: fallback.alerts.length,
      error: message,
    });
    return { ok: false, state, error: message, durationMs: Date.now() - t0 };
  }
}

// ─────────────────────────────────────────────────────────────────────────
// persistDeliverables — fan out structured deliverables into the right table
// + mark the originating task as 'review' so the chairman sees it in /studio.
//
// Safety checks per deliverable:
//   1. task_id must look like a UUID
//   2. The task row must exist, be owned by this role, have a project_id,
//      and be in a non-terminal status (todo|in_progress).
//   3. Mismatched task_ids are warn-logged + skipped (no insert).
// ─────────────────────────────────────────────────────────────────────────
async function persistDeliverables(role: Role, deliverables: Deliverable[]): Promise<void> {
  if (!deliverables || deliverables.length === 0) return;
  if (!isSupabaseConfigured()) return;
  const db = requireSupabaseAdmin();

  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  for (const d of deliverables) {
    try {
      if (!uuidRe.test(d.task_id)) {
        console.warn(`[agents/runner] ${role}: deliverable rejected — task_id not a UUID: ${d.task_id}`);
        continue;
      }
      const { data: task, error: taskErr } = await db
        .from('tasks')
        .select('id, owner_role, status, project_id, deliverable_type')
        .eq('id', d.task_id)
        .maybeSingle();
      if (taskErr) {
        console.warn(`[agents/runner] ${role}: deliverable rejected — task lookup failed:`, taskErr.message);
        continue;
      }
      if (!task) {
        console.warn(`[agents/runner] ${role}: deliverable rejected — task ${d.task_id} not found`);
        continue;
      }
      if (task.owner_role !== role) {
        console.warn(`[agents/runner] ${role}: deliverable rejected — task ${d.task_id} owned by ${task.owner_role}, not ${role}`);
        continue;
      }
      if (!task.project_id) {
        console.warn(`[agents/runner] ${role}: deliverable rejected — task ${d.task_id} has no project_id`);
        continue;
      }
      if (task.status !== 'todo' && task.status !== 'in_progress') {
        console.warn(`[agents/runner] ${role}: deliverable rejected — task ${d.task_id} in terminal status ${task.status}`);
        continue;
      }

      let deliverableId: string | null = null;

      if (d.type === 'outreach_draft') {
        const p = d.payload;
        const { data: row, error } = await db
          .from('outreach_drafts')
          .insert({
            channel: p.channel ?? 'gmail',
            target_segment: p.target_segment,
            recipient_name: p.recipient_name ?? null,
            recipient_email: p.recipient_email ?? null,
            subject: p.subject,
            body: p.body,
            status: 'draft',
            sent_by: role,
          })
          .select('id')
          .maybeSingle();
        if (error) {
          console.warn(`[agents/runner] ${role}: outreach_drafts insert failed:`, error.message);
          continue;
        }
        deliverableId = row?.id ?? null;
      } else if (d.type === 'linkedin_post') {
        const p = d.payload;
        const { data: row, error } = await db
          .from('linkedin_posts')
          .insert({
            title: p.title ?? null,
            body: p.body,
            hook: p.hook ?? null,
            industry: p.industry ?? null,
            scheduled_for: p.scheduled_for ?? null,
            status: 'draft',
          })
          .select('id')
          .maybeSingle();
        if (error) {
          console.warn(`[agents/runner] ${role}: linkedin_posts insert failed:`, error.message);
          continue;
        }
        deliverableId = row?.id ?? null;
      } else if (d.type === 'sop_note') {
        const p = d.payload;
        const safeSlug = `${p.slug}-${Date.now().toString(36)}`; // sops.slug is likely unique
        const { data: row, error } = await db
          .from('sops')
          .insert({
            slug: safeSlug,
            title: p.title,
            category: p.category ?? null,
            content_markdown: p.content_markdown,
            owner_role: p.owner_role ?? role,
          })
          .select('id')
          .maybeSingle();
        if (error) {
          console.warn(`[agents/runner] ${role}: sops insert failed:`, error.message);
          continue;
        }
        deliverableId = row?.id ?? null;
      } else if (d.type === 'analysis') {
        const p = d.payload;
        const { data: row, error } = await db
          .from('project_artifacts')
          .insert({
            project_id: task.project_id,
            task_id: task.id,
            role,
            type: 'analysis',
            title: p.title,
            body_markdown: p.body_markdown,
            data_json: p.data_json ?? null,
          })
          .select('id')
          .maybeSingle();
        if (error) {
          console.warn(`[agents/runner] ${role}: project_artifacts insert failed:`, error.message);
          continue;
        }
        deliverableId = row?.id ?? null;
      }

      if (!deliverableId) {
        console.warn(`[agents/runner] ${role}: deliverable persisted but no id returned (skip task update)`);
        continue;
      }

      // Mark task as 'review' (ready for chairman approval) with FK to artifact.
      const { error: updErr } = await db
        .from('tasks')
        .update({
          status: 'review',
          deliverable_type: d.type,
          deliverable_id: deliverableId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', d.task_id);
      if (updErr) {
        console.warn(`[agents/runner] ${role}: task ${d.task_id} update failed:`, updErr.message);
      }
    } catch (err) {
      console.warn(`[agents/runner] ${role}: deliverable processing threw:`, err);
    }
  }
}

async function persistProposedTasks(role: Role, tasks: AgentRunOutput['proposed_tasks']): Promise<void> {
  if (!tasks || tasks.length === 0) return;
  try {
    if (!isSupabaseConfigured()) return;
    const db = requireSupabaseAdmin();

    // Idempotency: skip any title this agent has already proposed and that's
    // still open (status='todo' or 'in_progress'). Without this, every cron
    // tick adds the same "Bulk-import LinkedIn drafts" task again → the
    // backlog fills with duplicates until human triages.
    const titles = tasks.map((t) => t.title);
    const { data: existing } = await db
      .from('tasks')
      .select('title')
      .eq('source', 'agent')
      .eq('source_role', role)
      .in('status', ['todo', 'in_progress'])
      .in('title', titles);
    const skip = new Set((existing ?? []).map((r) => r.title));

    const fresh = tasks.filter((t) => !skip.has(t.title));
    if (fresh.length === 0) return;

    const rows = fresh.map((t) => ({
      title: t.title,
      status: 'todo',
      owner_role: t.owner_role || role,
      priority: t.priority || 'normal',
      notes: t.notes || null,
      source: 'agent',
      source_role: role,
    }));
    const { error } = await db.from('tasks').insert(rows);
    if (error) console.warn(`[agents] persistProposedTasks(${role}) failed:`, error.message);
  } catch (err) {
    console.warn(`[agents] persistProposedTasks(${role}) threw:`, err);
  }
}

// Map specific model SKUs to brand-independent tier labels so /agents and
// /transparency never leak the underlying vendor to clients.
function modelTierLabel(model: string): string {
  const m = model.toLowerCase();
  // Frontier (chat/reasoning) tiers
  if (m.includes('sonnet') || m.includes('opus') || m.startsWith('claude') ||
      m.includes('gpt-4') || m.includes('o1') || m.includes('o3') ||
      m.startsWith('gemini-1.5-pro') || m.startsWith('gemini-2')) {
    return 'frontier LLM';
  }
  // Budget / small frontier
  if (m.includes('haiku') || m.includes('gpt-4o-mini') || m.includes('mini')) {
    return 'budget LLM';
  }
  // Open-source via fast inference
  if (m.includes('llama') || m.includes('mistral') || m.includes('mixtral') ||
      m.includes('gemma') || m.includes('qwen') || m.includes('deepseek')) {
    return 'open-source LLM';
  }
  return 'LLM';
}

function persistableState(role: Role, output: AgentRunOutput, model: string): AgentState {
  const now = new Date();
  const nextRun = new Date(now.getTime() + ROLE_META[role].cadenceHrs * 3600_000);
  const tier = modelTierLabel(model);
  return {
    role,
    lastRunAt: now.toISOString(),
    nextRunAt: nextRun.toISOString(),
    runs: 1, // bumped properly on next read in writeState — keeping simple for now
    lastOutput: output,
    health: 'ok',
    // Persist the brand-independent tier label, not the SKU
    modelLastUsed: model.includes('(fallback)') ? `${tier} (fallback)` : tier,
  };
}

// Canned fallback outputs — used when the API is unavailable. Honest:
// the items here are clearly system-tagged so we don't fake activity.
function fallbackOutput(role: Role): AgentRunOutput {
  return {
    summary: `${ROLE_META[role].fullName} — fallback cycle (LLM unavailable). Real activity will resume next scheduled run.`,
    items: [
      {
        action: `Agent ${role.toUpperCase()} attempted scheduled cycle`,
        result: 'LLM endpoint unavailable, fell back to system status report',
        tools: ['LLM'],
      },
    ],
    alerts: [
      { level: 'warn', message: 'LLM API unreachable — check provider credentials or rate limits' },
    ],
    kpis: [],
    proposed_tasks: [],
    deliverables: [],
    next_focus: 'Resume normal cycle when LLM is back online.',
  };
}
