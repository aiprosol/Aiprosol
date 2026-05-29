// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · AGENTS · ARORA-AS-ROUTER
// Takes a project brief (already persisted to the projects table) and asks
// Arora to decompose it into 1–6 role-assigned tasks. Persists the tasks,
// stores the decomposition, advances project.status briefed → in_progress.
//
// Used by:
//   - POST /api/studio/projects (auto-route on chairman submission)
//   - PATCH /api/studio/projects/[id] (when chairman dispatches an
//     Arora-proposed project)
// ─────────────────────────────────────────────────────────────────────────

import { ARORA_ROUTER_PROMPT } from './prompts';
import { RoutingDecisionSchema, type RoutingDecision } from './types';
import { isSupabaseConfigured, requireSupabaseAdmin } from '@/lib/db/supabase';

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

export type RouteProjectResult = {
  ok: boolean;
  decomposition?: RoutingDecision;
  taskIds?: string[];
  error?: string;
};

export async function routeProject(projectId: string): Promise<RouteProjectResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: 'supabase-not-configured' };
  }
  const db = requireSupabaseAdmin();

  // 1. Load + validate project
  const { data: project, error: loadErr } = await db
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .maybeSingle();

  if (loadErr) return { ok: false, error: `load-project: ${loadErr.message}` };
  if (!project) return { ok: false, error: 'project-not-found' };
  if (!['briefed', 'routing'].includes(project.status)) {
    return { ok: false, error: `project-not-routable (status=${project.status})` };
  }

  // 2. Mark routing in flight (best-effort; nothing fatal if it races)
  await db.from('projects').update({ status: 'routing' }).eq('id', projectId);

  // 3. Build user message + call Groq
  const userMessage = buildRouterUserMessage(project);
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    await db.from('projects').update({ status: 'briefed' }).eq('id', projectId);
    return { ok: false, error: 'no-groq-key (router cannot decompose)' };
  }

  let content: string;
  try {
    content = await callRouter(apiKey, userMessage);
  } catch (err) {
    await db.from('projects').update({ status: 'briefed' }).eq('id', projectId);
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }

  // 4. Parse + validate decomposition
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    await db.from('projects').update({ status: 'briefed' }).eq('id', projectId);
    return { ok: false, error: 'router-output-not-json' };
  }
  const validation = RoutingDecisionSchema.safeParse(parsed);
  if (!validation.success) {
    await db.from('projects').update({ status: 'briefed' }).eq('id', projectId);
    return {
      ok: false,
      error: `router-schema-failed: ${validation.error.issues.slice(0, 3).map((i) => i.path.join('.') + ' ' + i.message).join('; ')}`,
    };
  }
  const decomposition = validation.data;

  // 5. Persist tasks
  const taskRows = decomposition.tasks.map((t) => ({
    title: t.title,
    status: 'todo' as const,
    owner_role: t.owner_role,
    priority: t.priority,
    notes: t.notes,
    source: 'agent' as const,
    source_role: 'arora' as const,
    project_id: projectId,
    deliverable_type: t.deliverable_type,
  }));
  const { data: insertedTasks, error: taskErr } = await db
    .from('tasks')
    .insert(taskRows)
    .select('id');
  if (taskErr) {
    await db.from('projects').update({ status: 'briefed' }).eq('id', projectId);
    return { ok: false, error: `task-insert: ${taskErr.message}` };
  }

  // 6. Advance project + store decomposition
  await db
    .from('projects')
    .update({
      status: 'in_progress',
      decomposition: decomposition as unknown as Record<string, unknown>,
    })
    .eq('id', projectId);

  return {
    ok: true,
    decomposition,
    taskIds: (insertedTasks ?? []).map((r: { id: string }) => r.id),
  };
}

function buildRouterUserMessage(project: {
  id: string;
  title: string;
  brief: string;
  target_outcome: string | null;
  assigned_by: string;
}): string {
  return `# PROJECT BRIEF FROM ${project.assigned_by === 'arora' ? 'YOURSELF (autonomous proposal — now dispatched by the Chairman)' : 'THE CHAIRMAN (Srijan)'}

Project ID: ${project.id}
Title:      ${project.title}

Brief:
${project.brief}

${project.target_outcome ? `Target outcome:\n${project.target_outcome}\n` : ''}

# YOUR JOB
Decompose the brief into 1–6 concrete tasks per the OUTPUT FORMAT in your system prompt. Each task assigned to ONE role, each with the deliverable type that role will ship.

Return STRICT JSON only.
`;
}

// ─── Groq call with fallback chain (mirrors runner.ts pattern) ──────────
async function callRouter(apiKey: string, userMessage: string): Promise<string> {
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
          { role: 'system', content: ARORA_ROUTER_PROMPT },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.4, // router benefits from steadier output than agents
        max_tokens: 1500,
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
      const retry = await fetch(GROQ_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: tryModel,
          messages: [
            { role: 'system', content: ARORA_ROUTER_PROMPT },
            { role: 'user', content: userMessage },
          ],
          temperature: 0.4,
          max_tokens: 1500,
          response_format: { type: 'json_object' },
        }),
      });
      if (retry.ok) {
        const json = (await retry.json()) as { choices?: Array<{ message?: { content?: string } }> };
        const content = json.choices?.[0]?.message?.content;
        if (content) return content;
      }
      lastErr = `${tryModel}: 429 after ${waitS}s wait`;
      continue;
    }
    lastErr = `${tryModel}: HTTP ${res.status}`;
    throw new Error(`Arora-router ${lastErr}: ${(await res.text()).slice(0, 150)}`);
  }
  throw new Error(`All Groq models exhausted (router). Last error: ${lastErr}`);
}
