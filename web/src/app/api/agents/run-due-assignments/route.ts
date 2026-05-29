// ─────────────────────────────────────────────────────────────────────────
// GET /api/agents/run-due-assignments
// 30-min cron entry point. Runs ONLY the agents who have at least one
// open project-linked task in their inbox. Keeps the team feeling alive
// without burning 10 LLM calls every 30 minutes for no reason.
//
// Auth: same CRON_SECRET as /api/agents/run-all.
// ─────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { ROLES, type Role } from '@/lib/agents/types';
import { runAgent } from '@/lib/agents/runner';
import { isSupabaseConfigured, requireSupabaseAdmin } from '@/lib/db/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: 'server-misconfigured', detail: 'CRON_SECRET not set' },
      { status: 503 },
    );
  }
  const headerOk = auth === `Bearer ${cronSecret}`;
  const queryOk = req.nextUrl.searchParams.get('secret') === cronSecret;
  if (!headerOk && !queryOk) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      ok: true,
      ran: [],
      skipped: ROLES.map((r) => ({ role: r, reason: 'supabase-not-configured' })),
    });
  }

  // Find roles with at least one open project-linked task.
  const db = requireSupabaseAdmin();
  const { data: openTasks, error } = await db
    .from('tasks')
    .select('owner_role')
    .in('status', ['todo', 'in_progress'])
    .not('project_id', 'is', null)
    .not('owner_role', 'is', null);
  if (error) {
    return NextResponse.json(
      { error: 'task-lookup-failed', detail: error.message },
      { status: 500 },
    );
  }

  const rolesWithWork = new Set<Role>();
  for (const t of openTasks ?? []) {
    const r = (t as { owner_role: string | null }).owner_role;
    if (r && (ROLES as readonly string[]).includes(r)) {
      rolesWithWork.add(r as Role);
    }
  }

  if (rolesWithWork.size === 0) {
    return NextResponse.json({
      ok: true,
      ran: [],
      skipped: ROLES.map((r) => ({ role: r, reason: 'no-open-assignments' })),
    });
  }

  // Run sequentially with the same 10s delay used by run-all to keep Groq
  // RPM happy. Order: keep ROLES canonical order.
  const DELAY_MS = 10_000;
  const results: Array<{ role: Role; ok: boolean; durationMs: number; error?: string }> = [];
  let firstRun = true;
  for (const role of ROLES) {
    if (!rolesWithWork.has(role)) continue;
    if (!firstRun) await new Promise((res) => setTimeout(res, DELAY_MS));
    firstRun = false;
    const r = await runAgent(role);
    results.push({
      role,
      ok: r.ok,
      durationMs: r.durationMs,
      error: r.error,
    });
  }

  return NextResponse.json({
    ok: true,
    ranCount: results.length,
    okCount: results.filter((r) => r.ok).length,
    ran: results,
    skipped: ROLES.filter((r) => !rolesWithWork.has(r)).map((r) => ({
      role: r,
      reason: 'no-open-assignments',
    })),
  });
}
