// ─────────────────────────────────────────────────────────────────────────
// POST /api/studio/run-agent/[role]
// Admin-gated trigger to run a single agent immediately.
// Proxies to the underlying runner so we get the same model fallback +
// 429 retry behaviour as the cron path.
// ─────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { isStudioAdmin } from '@/lib/studio/auth';
import { ROLES, type Role } from '@/lib/agents/types';
import { runAgent } from '@/lib/agents/runner';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ role: string }> },
) {
  const auth = await isStudioAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { role } = await ctx.params;
  if (!(ROLES as readonly string[]).includes(role)) {
    return NextResponse.json({ error: `Unknown role: ${role}` }, { status: 404 });
  }

  const result = await runAgent(role as Role);
  return NextResponse.json({
    ok: result.ok,
    role,
    durationMs: result.durationMs,
    error: result.error,
    summary: result.state?.lastOutput?.summary,
  });
}
