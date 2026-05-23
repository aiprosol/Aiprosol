// ─────────────────────────────────────────────────────────────────────────
// POST /api/agents/run/[role]
// Trigger a single agent's run cycle. Used by:
//   - Local development (manual triggers)
//   - The cron fan-out endpoint (/api/agents/run-all)
//   - The /agents page "run now" button
//
// Auth: requires ?secret=$AGENT_CRON_SECRET when present; otherwise open
// in dev. The cron route validates separately via Vercel's CRON_SECRET.
// ─────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { ROLES, type Role } from '@/lib/agents/types';
import { runAgent } from '@/lib/agents/runner';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isValidRole(r: string): r is Role {
  return (ROLES as readonly string[]).includes(r);
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ role: string }> },
) {
  return handle(req, ctx);
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ role: string }> },
) {
  return handle(req, ctx);
}

async function handle(
  req: NextRequest,
  ctx: { params: Promise<{ role: string }> },
) {
  const { role } = await ctx.params;
  if (!isValidRole(role)) {
    return NextResponse.json({ error: `Unknown role: ${role}` }, { status: 404 });
  }

  // Soft auth — require secret in production
  const secret = process.env.AGENT_CRON_SECRET;
  const provided = req.nextUrl.searchParams.get('secret') ||
                   req.headers.get('x-cron-secret');
  if (secret && provided !== secret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const result = await runAgent(role);
  return NextResponse.json({
    ok: result.ok,
    role,
    durationMs: result.durationMs,
    error: result.error,
    state: result.state,
  });
}
