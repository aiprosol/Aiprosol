// ─────────────────────────────────────────────────────────────────────────
// GET /api/agents/arora/propose-projects
// Fires Arora's autonomous proposal cycle. Inserts 0–2 'briefed' projects
// with assigned_by='arora'. Chairman must dispatch them via /studio before
// any router/agent work fires.
//
// Auth: CRON_SECRET (same as run-all). Triggered from run-all after the
// digest finishes, but can also be invoked manually via ?secret= for
// testing.
// ─────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { runAutonomousProposal } from '@/lib/agents/arora-autonomous';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

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

  const result = await runAutonomousProposal();
  return NextResponse.json({
    ok: result.ok,
    projectIds: result.projectIds ?? [],
    rationale: result.proposal?.rationale ?? null,
    proposedCount: result.proposal?.projects.length ?? 0,
    error: result.error,
  });
}
