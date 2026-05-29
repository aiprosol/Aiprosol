// ─────────────────────────────────────────────────────────────────────────
// GET|POST /api/cron/decision-inbox — the Decision Inbox email.
// Composes the operator brief + the queue of decisions needing them, each with
// one-tap Approve/Reject links (signed tokens → /api/decide confirm page).
// Triggered by GitHub Actions (Bearer CRON_SECRET), Vercel cron, or manually
// (signed-in admin). Emails RESEND_DIGEST_TO / BRIEF_EMAIL.
// ─────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { isStudioAdmin } from '@/lib/studio/auth';
import { composeBrief } from '@/lib/assistant/brief';
import { getPendingDecisions, type PendingDecision } from '@/lib/studio/decisions';
import { sendEmail, isResendConfigured } from '@/lib/resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function decisionRowHtml(d: PendingDecision): string {
  const buttons = d.action
    ? `<div style="margin-top:10px;">
         <a href="${d.approveUrl}" style="display:inline-block;padding:9px 18px;background:linear-gradient(135deg,#7C3AED,#8B5CF6);color:#fff;border-radius:8px;font-weight:700;font-size:13px;text-decoration:none;">${d.approveLabel || 'Approve'}</a>
         <a href="${d.rejectUrl}" style="display:inline-block;padding:9px 16px;margin-left:8px;color:#9CA3B5;border:1px solid #2A1F3D;border-radius:8px;font-size:13px;text-decoration:none;">${d.rejectLabel || 'Reject'}</a>
       </div>`
    : `<div style="margin-top:8px;"><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://aiprosol.com'}/studio" style="color:#C084FC;font-size:13px;text-decoration:none;">Review in studio →</a></div>`;
  return `<tr><td style="padding:14px 0;border-bottom:1px solid #2A1F3D;">
    <div style="font-weight:700;font-size:14px;color:#E5E7EB;">${d.title}</div>
    <div style="font-size:13px;color:#9CA3B5;margin-top:4px;line-height:1.5;">${d.summary}</div>
    ${buttons}
  </td></tr>`;
}

function emailHtml(brief: string | null, decisions: PendingDecision[]): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://aiprosol.com';
  const briefBlock = brief
    ? `<p style="font-family:'Space Grotesk',Arial,sans-serif;font-weight:700;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#C084FC;margin:0 0 8px;">Morning brief</p>
       <div style="font-size:14px;line-height:1.65;color:#C7CEDB;white-space:pre-wrap;margin:0 0 28px;">${brief.replace(/</g, '&lt;')}</div>`
    : '';
  const queueBlock = decisions.length === 0
    ? `<div style="font-size:14px;color:#9CA3B5;">Nothing needs you right now. The company is running itself. ✦</div>`
    : `<p style="font-family:'Space Grotesk',Arial,sans-serif;font-weight:700;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#C084FC;margin:0 0 4px;">${decisions.length} ${decisions.length === 1 ? 'decision needs' : 'decisions need'} you</p>
       <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${decisions.map(decisionRowHtml).join('')}</table>`;
  return `<!DOCTYPE html><html><body style="margin:0;padding:32px 16px;background:#0A0613;font-family:Inter,Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td align="center">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background:#13101F;border:1px solid #2A1F3D;border-radius:16px;padding:32px;">
      <tr><td>
        <div style="font-family:'Space Grotesk',Arial,sans-serif;font-weight:800;font-size:20px;color:#E5E7EB;margin:0 0 20px;">Aiprosol · your desk</div>
        ${briefBlock}
        ${queueBlock}
        <div style="margin-top:28px;border-top:1px solid #2A1F3D;padding-top:16px;font-size:12px;color:#9CA3B5;">
          Approve or decline right here — no login. Or open the <a href="${site}/studio" style="color:#C084FC;text-decoration:none;">full studio →</a>
        </div>
      </td></tr>
    </table>
  </td></tr></table></body></html>`;
}

async function run(req: NextRequest) {
  const isVercelCron = req.headers.get('x-vercel-cron') !== null;
  const secret = process.env.CRON_SECRET;
  const bearer = req.headers.get('authorization');
  const auth = await isStudioAdmin();
  const ok = isVercelCron || auth.ok || (Boolean(secret) && bearer === `Bearer ${secret}`);
  if (!ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const [brief, decisions] = await Promise.all([
    composeBrief(Date.now()).then((b) => b?.content ?? null).catch(() => null),
    getPendingDecisions(),
  ]);

  const to = process.env.RESEND_DIGEST_TO || process.env.BRIEF_EMAIL || null;
  let emailed = false;
  if (to && isResendConfigured()) {
    const r = await sendEmail({
      to,
      subject: decisions.length > 0 ? `Aiprosol · ${decisions.length} decision${decisions.length === 1 ? '' : 's'} need you` : 'Aiprosol · all clear',
      html: emailHtml(brief, decisions),
      text: `${brief ? brief + '\n\n' : ''}${decisions.length} decisions need you. Open ${process.env.NEXT_PUBLIC_SITE_URL || 'https://aiprosol.com'}/studio`,
      tags: [{ name: 'category', value: 'decision-inbox' }],
    });
    emailed = r.ok;
  }

  return NextResponse.json({ ok: true, emailed, to, decisions: decisions.length, hasBrief: Boolean(brief) });
}

export const GET = run;
export const POST = run;
