// ─────────────────────────────────────────────────────────────────────────
// GET /api/agents/run-all
// Fan-out endpoint triggered by Vercel Cron. Runs every agent whose
// nextRunAt has passed. Returns a per-agent status digest.
//
// Cron schedule lives in vercel.json (every 6h). The cron runs every 6h,
// each agent then checks its own cadence (some are 12h, some 24h) and
// skips if it's not due yet.
// ─────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { ROLES } from '@/lib/agents/types';
import { runAgent } from '@/lib/agents/runner';
import { readState } from '@/lib/agents/store';
import { runDailyDigest } from '@/lib/agents/daily-digest';
import { runAutonomousProposal } from '@/lib/agents/arora-autonomous';
import { runDecisionInbox } from '@/lib/studio/decision-inbox';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 min — plenty for 10 sequential Groq calls

export async function GET(req: NextRequest) {
  // Vercel cron sends Authorization: Bearer $CRON_SECRET
  const auth = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const force = req.nextUrl.searchParams.get('force') === '1';

  // SECURITY: default-deny if CRON_SECRET isn't configured. Without it
  // the endpoint would be publicly callable — anyone could DDoS the Groq
  // quota by triggering 10 agents per request.
  if (!cronSecret) {
    return NextResponse.json(
      { error: 'server-misconfigured', detail: 'CRON_SECRET not set' },
      { status: 503 },
    );
  }

  // Auth is REQUIRED. ?force=1 only changes due-time behaviour (runs all
  // agents even if their nextRunAt hasn't elapsed); it does NOT grant
  // an auth bypass. Caller must present either:
  //   • Authorization: Bearer <CRON_SECRET>   (used by Vercel cron)
  //   • ?secret=<CRON_SECRET>                 (manual / testing)
  const headerOk = auth === `Bearer ${cronSecret}`;
  const queryOk = req.nextUrl.searchParams.get('secret') === cronSecret;
  if (!headerOk && !queryOk) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const results: Array<{
    role: string;
    ran: boolean;
    ok: boolean;
    durationMs?: number;
    reason?: string;
  }> = [];

  const now = Date.now();

  // Run agents sequentially (not parallel) — keeps Groq RPM happy + makes
  // sure later agents see earlier agents' fresh states.
  // 7s delay (up from 4.5s) accounts for the larger grounded prompts
  // that include live Supabase context. Each agent now uses ~2500 tokens.
  // Total run takes ~70s, still well within the 300s function limit.
  const DELAY_MS = 10000;
  let firstRun = true;
  for (const role of ROLES) {
    const existing = await readState(role);
    const isDue = !existing ||
                  force ||
                  new Date(existing.nextRunAt).getTime() <= now;
    if (!isDue) {
      results.push({
        role,
        ran: false,
        ok: true,
        reason: `not due (next at ${existing!.nextRunAt})`,
      });
      continue;
    }
    if (!firstRun) {
      await new Promise((res) => setTimeout(res, DELAY_MS));
    }
    firstRun = false;
    const r = await runAgent(role);
    results.push({
      role,
      ran: true,
      ok: r.ok,
      durationMs: r.durationMs,
      reason: r.error,
    });
  }

  const ranCount = results.filter((r) => r.ran).length;
  const okCount = results.filter((r) => r.ran && r.ok).length;

  // ─── Fire the founder digest after all agents have finished ───────────
  // Persists to `daily_digest` always, emails via Resend if configured.
  // Failures here don't fail the cron — the agent runs already succeeded.
  let digestStatus: { ok: boolean; emailed: boolean; error?: string } = { ok: false, emailed: false };
  try {
    const dig = await runDailyDigest();
    digestStatus = { ok: dig.ok, emailed: dig.emailed, error: dig.error };
  } catch (err) {
    digestStatus = { ok: false, emailed: false, error: err instanceof Error ? err.message : String(err) };
  }

  // ─── Autonomous Arora proposal (Phase 3) ──────────────────────────────
  // After the digest, Arora reviews backlog + KPIs + peer next_focus and
  // proposes 0–2 new projects (briefed, NOT auto-routed). Chairman approves
  // in /studio. Failures here don't fail the cron.
  let autonomousStatus: {
    ok: boolean;
    proposedCount: number;
    rationale?: string | null;
    error?: string;
  } = { ok: false, proposedCount: 0 };
  try {
    const auto = await runAutonomousProposal();
    autonomousStatus = {
      ok: auto.ok,
      proposedCount: auto.proposal?.projects.length ?? 0,
      rationale: auto.proposal?.rationale ?? null,
      error: auto.error,
    };
  } catch (err) {
    autonomousStatus = {
      ok: false,
      proposedCount: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }

  // ─── Decision Inbox (folded in so it auto-sends on the daily cron) ─────
  // Drafts follow-ups for new leads, composes the brief + decision queue, and
  // emails the operator their "desk" — one-tap Approve/Reject links inline.
  // This makes the autonomous loop reach the operator's phone with zero extra
  // scheduler/secret setup, since run-all is already authorized and daily.
  // Best-effort: failures here never fail the agent cron.
  let inboxStatus: { emailed: boolean; decisions: number; followupsDrafted: number; error?: string } = {
    emailed: false,
    decisions: 0,
    followupsDrafted: 0,
  };
  try {
    const inbox = await runDecisionInbox();
    inboxStatus = { emailed: inbox.emailed, decisions: inbox.decisions, followupsDrafted: inbox.followupsDrafted };
  } catch (err) {
    inboxStatus = { emailed: false, decisions: 0, followupsDrafted: 0, error: err instanceof Error ? err.message : String(err) };
  }

  return NextResponse.json({
    ok: true,
    ranCount,
    okCount,
    results,
    digest: digestStatus,
    autonomous: autonomousStatus,
    decisionInbox: inboxStatus,
  });
}
