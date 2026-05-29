// ─────────────────────────────────────────────────────────────────────────
// GET|POST /api/cron/decision-inbox — the Decision Inbox email.
// Thin wrapper over runDecisionInbox() (web/src/lib/studio/decision-inbox.ts),
// which composes the brief + decision queue + ops strip and emails it.
// Triggered by GitHub Actions / Vercel cron (Bearer CRON_SECRET) or a signed-in
// admin. The same composer is also folded into the daily run-all cron, so the
// inbox auto-sends even without this route being scheduled separately.
// ─────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { isStudioAdmin } from '@/lib/studio/auth';
import { runDecisionInbox } from '@/lib/studio/decision-inbox';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

async function run(req: NextRequest) {
  const isVercelCron = req.headers.get('x-vercel-cron') !== null;
  const secret = process.env.CRON_SECRET;
  const bearer = req.headers.get('authorization');
  const auth = await isStudioAdmin();
  const ok = isVercelCron || auth.ok || (Boolean(secret) && bearer === `Bearer ${secret}`);
  if (!ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const result = await runDecisionInbox();
  return NextResponse.json(result);
}

export const GET = run;
export const POST = run;
