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

import { ROLE_META, type Role, type AgentState, type AgentRunOutput, AgentRunOutputSchema } from './types';
import { AGENT_PROMPTS } from './prompts';
import { readAllStates, writeState, appendLog } from './store';
import { loadContext, renderContext } from './context';
import { runKpiRollup } from './kpi-rollup';
import { getProducts, getServices } from '@/lib/content';

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

// Build the per-run context an agent sees as its "user" message
async function buildContext(role: Role, otherStates: Record<Role, AgentState | null>): Promise<string> {
  const now = new Date();
  const utc = now.toISOString();

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
1. Reference actual items from "YOUR LIVE DATA" by name/ID/slug when relevant — don't invent fictional ones.
2. If your live data shows an empty table, say so honestly in the summary and propose what to seed it with.
3. If a task in the backlog is yours to action, mention it explicitly in items[].
4. Specific dollar amounts and time estimates — but ground them in the catalogue (the price range above) and the peer activity, not random numbers.
`;
}

// Single-cycle agent run
export async function runAgent(role: Role): Promise<{
  ok: boolean;
  state: AgentState | null;
  error?: string;
  durationMs: number;
}> {
  const t0 = Date.now();
  const systemPrompt = AGENT_PROMPTS[role];
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

async function persistProposedTasks(role: Role, tasks: AgentRunOutput['proposed_tasks']): Promise<void> {
  if (!tasks || tasks.length === 0) return;
  try {
    const { requireSupabaseAdmin, isSupabaseConfigured } = await import('@/lib/db/supabase');
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
    next_focus: 'Resume normal cycle when LLM is back online.',
  };
}
