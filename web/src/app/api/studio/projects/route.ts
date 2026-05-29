// ─────────────────────────────────────────────────────────────────────────
// /api/studio/projects
//   GET  → list recent projects (admin-gated)
//   POST → create a new chairman-briefed project + immediately fire the
//          Arora-router to decompose it into tasks.
//
// The POST body: { title, brief, target_outcome?, autoRoute?: boolean }
//   - title:          short label, required
//   - brief:          chairman's brief, required (the substance Arora reads)
//   - target_outcome: what "done" looks like, optional
//   - autoRoute:      default true. Set false to insert a 'briefed' project
//                     and route it later (used for autonomous proposals that
//                     the chairman explicitly dispatches via PATCH).
//
// On success: { ok: true, project, decomposition?: {...} }
// ─────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { isStudioAdmin } from '@/lib/studio/auth';
import { isSupabaseConfigured, requireSupabaseAdmin } from '@/lib/db/supabase';
import { routeProject } from '@/lib/agents/arora-router';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(_req: NextRequest) {
  const auth = await isStudioAdmin();
  if (!auth.ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!isSupabaseConfigured()) return NextResponse.json({ ok: true, projects: [] });

  const db = requireSupabaseAdmin();
  const { data, error } = await db
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(80);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, projects: data ?? [] });
}

export async function POST(req: NextRequest) {
  const auth = await isStudioAdmin();
  if (!auth.ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'supabase-not-configured' }, { status: 503 });
  }

  let body: { title?: string; brief?: string; target_outcome?: string; autoRoute?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const title = (body.title ?? '').trim();
  const brief = (body.brief ?? '').trim();
  if (title.length < 3 || title.length > 200) {
    return NextResponse.json({ error: 'title must be 3–200 chars' }, { status: 400 });
  }
  if (brief.length < 20 || brief.length > 5000) {
    return NextResponse.json({ error: 'brief must be 20–5000 chars' }, { status: 400 });
  }
  const targetOutcome = (body.target_outcome ?? '').trim() || null;
  const autoRoute = body.autoRoute !== false; // default true

  const db = requireSupabaseAdmin();
  const { data: project, error } = await db
    .from('projects')
    .insert({
      title,
      brief,
      target_outcome: targetOutcome,
      assigned_by: 'chairman',
      status: 'briefed',
    })
    .select('*')
    .maybeSingle();

  if (error || !project) {
    return NextResponse.json(
      { error: error?.message ?? 'project-insert-failed' },
      { status: 500 },
    );
  }

  // Fire Arora-router right away (best-effort). On router failure, the
  // project stays at status='briefed' so the chairman can retry from /studio.
  let decomposition: unknown = null;
  let routerError: string | null = null;
  if (autoRoute) {
    try {
      const result = await routeProject(project.id);
      if (result.ok) {
        decomposition = result.decomposition;
      } else {
        routerError = result.error ?? 'router-failed';
      }
    } catch (err) {
      routerError = err instanceof Error ? err.message : String(err);
    }
  }

  return NextResponse.json({
    ok: true,
    project,
    decomposition,
    routerError,
  });
}
