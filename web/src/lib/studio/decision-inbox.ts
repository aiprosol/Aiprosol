// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · STUDIO — Decision Inbox composer
// Builds + emails the operator's daily inbox: brief + auto-drafted lead
// follow-ups + the decision queue + an ops-health strip. Shared by the
// standalone cron route AND the daily run-all cron (so it auto-sends without a
// separate scheduler). Default recipient = the operational email so it works
// with zero env setup; override with RESEND_DIGEST_TO / BRIEF_EMAIL.
// ─────────────────────────────────────────────────────────────────────────

import { composeBrief, saveBrief } from '@/lib/assistant/brief';
import { getPendingDecisions, type PendingDecision } from '@/lib/studio/decisions';
import { draftFollowupsForNewLeads } from '@/lib/studio/revenue-loop';
import { getSystemSnapshot } from '@/lib/studio/system';
import { sendEmail, isResendConfigured } from '@/lib/resend';

const DEFAULT_RECIPIENT = 'srijanpaudelofficial@gmail.com';

function decisionRowHtml(d: PendingDecision): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://aiprosol.com';
  const buttons = d.action
    ? `<div style="margin-top:10px;">
         <a href="${d.approveUrl}" style="display:inline-block;padding:9px 18px;background:linear-gradient(135deg,#7C3AED,#8B5CF6);color:#fff;border-radius:8px;font-weight:700;font-size:13px;text-decoration:none;">${d.approveLabel || 'Approve'}</a>
         <a href="${d.rejectUrl}" style="display:inline-block;padding:9px 16px;margin-left:8px;color:#9CA3B5;border:1px solid #2A1F3D;border-radius:8px;font-size:13px;text-decoration:none;">${d.rejectLabel || 'Reject'}</a>
       </div>`
    : `<div style="margin-top:8px;"><a href="${site}/studio" style="color:#C084FC;font-size:13px;text-decoration:none;">Review in studio →</a></div>`;
  return `<tr><td style="padding:14px 0;border-bottom:1px solid #2A1F3D;">
    <div style="font-weight:700;font-size:14px;color:#E5E7EB;">${d.title}</div>
    <div style="font-size:13px;color:#9CA3B5;margin-top:4px;line-height:1.5;">${d.summary}</div>
    ${buttons}
  </td></tr>`;
}

function emailHtml(brief: string | null, decisions: PendingDecision[], opsLine: string | null): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://aiprosol.com';
  const opsBlock = opsLine
    ? `<div style="font-size:12px;color:#9CA3B5;background:rgba(148,163,184,0.06);border:1px solid #2A1F3D;border-radius:10px;padding:10px 14px;margin:0 0 24px;"><span style="color:#C084FC;font-weight:700;">Ops ·</span> ${opsLine}</div>`
    : '';
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
        ${opsBlock}
        ${queueBlock}
        <div style="margin-top:28px;border-top:1px solid #2A1F3D;padding-top:16px;font-size:12px;color:#9CA3B5;">
          Approve or decline right here — no login. Or open the <a href="${site}/studio" style="color:#C084FC;text-decoration:none;">full studio →</a>
        </div>
      </td></tr>
    </table>
  </td></tr></table></body></html>`;
}

export async function runDecisionInbox(): Promise<{ ok: boolean; emailed: boolean; to: string | null; decisions: number; followupsDrafted: number; hasBrief: boolean }> {
  // Autonomous revenue loop first, so fresh follow-ups surface in this run.
  const followups = await draftFollowupsForNewLeads(3).catch(() => ({ drafted: 0, skipped: 0 }));

  const [briefObj, decisions, system] = await Promise.all([
    composeBrief(Date.now()).catch(() => null),
    getPendingDecisions(),
    getSystemSnapshot().catch(() => null),
  ]);
  const brief = briefObj?.content ?? null;

  const opsLine = system
    ? `${system.agents.errors24h} agent error(s)/24h · DB ${system.supabase.ok ? 'ok' : 'down'} · ${system.env.filter((e) => !e.set).length} env key(s) unset`
    : null;

  const to = process.env.RESEND_DIGEST_TO || process.env.BRIEF_EMAIL || DEFAULT_RECIPIENT;
  let emailed = false;
  if (to && isResendConfigured()) {
    const r = await sendEmail({
      to,
      subject: decisions.length > 0 ? `Aiprosol · ${decisions.length} decision${decisions.length === 1 ? '' : 's'} need you` : 'Aiprosol · all clear',
      html: emailHtml(brief, decisions, opsLine),
      text: `${brief ? brief + '\n\n' : ''}${decisions.length} decisions need you. Open ${process.env.NEXT_PUBLIC_SITE_URL || 'https://aiprosol.com'}/studio`,
      tags: [{ name: 'category', value: 'decision-inbox' }],
    });
    emailed = r.ok;
  }

  // Persist the brief so the Copilot's get_latest_brief + the studio surface
  // today's brief — not just the email. Best-effort; no-op without Supabase.
  if (briefObj) await saveBrief(briefObj.content, briefObj.provider, to, emailed).catch(() => {});

  return { ok: true, emailed, to, decisions: decisions.length, followupsDrafted: followups.drafted, hasBrief: Boolean(brief) };
}
