// ─────────────────────────────────────────────────────────────────────────
// POST /api/agents/arora/route
// Standalone endpoint to (re-)route an existing project. Used by /studio
// to dispatch Arora-proposed projects and to retry router failures.
// Admin-gated. Body: { projectId: string }
// ─────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { isStudioAdmin } from '@/lib/studio/auth';
import { routeProject } from '@/lib/agents/arora-router';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const auth = await isStudioAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: { projectId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const projectId = (body.projectId ?? '').trim();
  if (!projectId) {
    return NextResponse.json({ error: 'projectId required' }, { status: 400 });
  }

  const result = await routeProject(projectId);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }
  return NextResponse.json({
    ok: true,
    decomposition: result.decomposition,
    taskIds: result.taskIds,
  });
}
