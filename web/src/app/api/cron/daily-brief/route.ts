// ─────────────────────────────────────────────────────────────────────────
// GET|POST /api/cron/daily-brief — generate the operator brief, store it, and
// email it (if RESEND_DIGEST_TO is set). Authorized for: Vercel Cron
// (x-vercel-cron header), the signed-in admin (manual run), or a CRON_SECRET
// bearer. NOT wired into vercel.json yet — Hobby caps crons at 2 (both used).
// To automate daily: upgrade to Pro + add a cron entry, or call this from the
// existing /api/agents/run-all cron.
// ─────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { isStudioAdmin } from '@/lib/studio/auth';
import { composeBrief, saveBrief } from '@/lib/assistant/brief';
import { sendEmail, isResendConfigured } from '@/lib/resend';

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

  const brief = await composeBrief(Date.now());
  if (!brief) return NextResponse.json({ ok: false, error: 'no-provider' }, { status: 503 });

  const to = process.env.RESEND_DIGEST_TO || process.env.BRIEF_EMAIL || null;
  let emailed = false;
  if (to && isResendConfigured()) {
    const r = await sendEmail({
      to,
      subject: 'Aiprosol · operator brief',
      text: brief.content,
      html: `<pre style="font-family:Inter,Arial,sans-serif;white-space:pre-wrap;font-size:14px;line-height:1.6;color:#E5E7EB;background:#13101F;padding:24px;border-radius:12px;">${brief.content.replace(/</g, '&lt;')}</pre>`,
    });
    emailed = r.ok;
  }
  await saveBrief(brief.content, brief.provider, to, emailed);

  return NextResponse.json({ ok: true, emailed, provider: brief.provider, preview: brief.content.slice(0, 240) });
}

export const GET = run;
export const POST = run;
