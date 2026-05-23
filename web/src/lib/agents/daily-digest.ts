// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · AGENTS — daily founder digest
// Runs at the end of the cron after every agent has finished its cycle.
// Composes a "what changed today" summary from agent states, KPI deltas,
// and recent activity, then:
//   1. Always persists it to `daily_digest` (so /studio can show it).
//   2. Tries to email it via Resend if configured.
//   3. Logs the digest body to console as a final fallback.
// ─────────────────────────────────────────────────────────────────────────

import { isSupabaseConfigured, requireSupabaseAdmin } from '@/lib/db/supabase';
import { ROLES, ROLE_META, type Role, type AgentRunOutput } from './types';
import { readKpiTimeseries } from './kpi-rollup';
import { sendEmail, isResendConfigured } from '@/lib/resend';

type StateRow = {
  role: Role;
  last_run_at: string | null;
  last_output: AgentRunOutput | null;
  health: 'ok' | 'degraded' | 'offline';
  model_last_used: string | null;
};

export type DigestPayload = {
  day: string;
  subject: string;
  bodyText: string;
  bodyHtml: string;
  agentCount: number;
  itemsCount: number;
  alertsCount: number;
};

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

// Read everything the digest needs: agent states, KPI series, recent runs.
async function gatherDigestData() {
  if (!isSupabaseConfigured()) return null;
  const db = requireSupabaseAdmin();

  const [statesRes, runsRes, tasksRes, draftsRes, leadsRes] = await Promise.all([
    db.from('agent_state').select('*'),
    db.from('agent_log').select('*').gte('at', new Date(Date.now() - 24 * 3600_000).toISOString()).order('at', { ascending: false }),
    db.from('tasks').select('id, title, owner_role, priority, source, source_role, created_at').gte('created_at', new Date(Date.now() - 24 * 3600_000).toISOString()).order('created_at', { ascending: false }),
    db.from('outreach_drafts').select('id, channel, subject, status, sent_at, created_at').gte('created_at', new Date(Date.now() - 24 * 3600_000).toISOString()),
    db.from('leads').select('id, name, company, score, status, created_at').gte('created_at', new Date(Date.now() - 24 * 3600_000).toISOString()).order('score', { ascending: false }),
  ]);

  const states = (statesRes.data ?? []) as StateRow[];
  const runs = runsRes.data ?? [];
  const newTasks = tasksRes.data ?? [];
  const newDrafts = draftsRes.data ?? [];
  const newLeads = leadsRes.data ?? [];

  const kpis = await readKpiTimeseries(2); // today vs yesterday for delta

  return { states, runs, newTasks, newDrafts, newLeads, kpis };
}

// Build the markdown + HTML bodies for the digest.
export async function composeDigest(): Promise<DigestPayload | null> {
  const data = await gatherDigestData();
  if (!data) return null;
  const day = todayUTC();
  const { states, runs, newTasks, newDrafts, newLeads, kpis } = data;

  // ─── Headline counters ────────────────────────────────────────────────
  const agentsRun24h = runs.filter((r) => r.status === 'ok').length;
  const agentsErrored24h = runs.filter((r) => r.status === 'error').length;
  const allItems = states.flatMap((s) => s.last_output?.items ?? []);
  const allAlerts = states.flatMap((s) => s.last_output?.alerts ?? []);

  // ─── KPI deltas ───────────────────────────────────────────────────────
  const kpiLines = kpis
    .filter((k) => k.delta !== 0)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 6)
    .map((k) => {
      const sym = k.delta > 0 ? '↑' : '↓';
      const sign = k.delta > 0 ? '+' : '';
      return `- ${k.metric}: ${k.latest}${k.unit ? ' ' + k.unit : ''} (${sym}${sign}${k.delta} vs yesterday)`;
    });

  // ─── Per-agent highlights ─────────────────────────────────────────────
  const agentLines: string[] = [];
  for (const role of ROLES) {
    const s = states.find((x) => x.role === role);
    if (!s?.last_output) {
      agentLines.push(`- **${role.toUpperCase()}** · idle (never run or no recent data)`);
      continue;
    }
    const summary = s.last_output.summary?.slice(0, 140) ?? '(no summary)';
    const meta = ROLE_META[role];
    agentLines.push(`- **${role.toUpperCase()}** (${meta.title}) · ${summary}`);
  }

  // ─── New activity in last 24h ─────────────────────────────────────────
  const activityLines: string[] = [];
  if (newLeads.length) {
    activityLines.push(`**${newLeads.length} new lead${newLeads.length > 1 ? 's' : ''}:**`);
    for (const l of newLeads.slice(0, 5)) {
      activityLines.push(`  · [${l.score ?? 0}] ${l.name || '?'} @ ${l.company || 'no company'} (${l.status})`);
    }
  }
  if (newDrafts.length) {
    activityLines.push(`**${newDrafts.length} new outreach draft${newDrafts.length > 1 ? 's' : ''}:** ${newDrafts.filter((d) => d.status === 'sent').length} already sent, ${newDrafts.filter((d) => d.status === 'draft').length} awaiting approval.`);
  }
  if (newTasks.length) {
    const proposed = newTasks.filter((t) => t.source === 'agent');
    activityLines.push(`**${newTasks.length} new task${newTasks.length > 1 ? 's' : ''}:** ${proposed.length} proposed by agents (${[...new Set(proposed.map((t) => (t.source_role || '').toUpperCase()))].join(', ') || 'none'}).`);
  }
  if (!activityLines.length) {
    activityLines.push('_(no new leads, drafts, or tasks in the last 24h)_');
  }

  // ─── Alerts that need Srijan's attention ──────────────────────────────
  const alertLines = allAlerts
    .filter((a) => a.level === 'warn' || a.level === 'error')
    .slice(0, 6)
    .map((a) => `- [${a.level.toUpperCase()}] ${a.message}`);

  // ─── Compose ──────────────────────────────────────────────────────────
  const subject = `Aiprosol · ${day} · ${agentsRun24h} agents ran, ${newLeads.length} new lead${newLeads.length === 1 ? '' : 's'}, ${allAlerts.length} alert${allAlerts.length === 1 ? '' : 's'}`;

  const bodyText = [
    `# Aiprosol Daily Digest — ${day}`,
    '',
    `Srijan — here's what happened in the last 24 hours.`,
    '',
    `## Snapshot`,
    `- ${agentsRun24h} agent runs OK · ${agentsErrored24h} errors`,
    `- ${newLeads.length} new lead${newLeads.length === 1 ? '' : 's'}, ${newDrafts.length} draft${newDrafts.length === 1 ? '' : 's'}, ${newTasks.length} task${newTasks.length === 1 ? '' : 's'}`,
    `- ${allItems.length} agent items shipped this cycle`,
    '',
    `## KPI movement`,
    kpiLines.length ? kpiLines.join('\n') : '_(no day-over-day movement yet — DA will compute on next run)_',
    '',
    `## Activity`,
    activityLines.join('\n'),
    '',
    `## Alerts`,
    alertLines.length ? alertLines.join('\n') : '_(no warnings or errors)_',
    '',
    `## Agent summaries`,
    agentLines.join('\n'),
    '',
    '— Arora',
    '',
    `View live: https://aiprosol.com/studio`,
  ].join('\n');

  const bodyHtml = digestHtml({
    day,
    agentsRun24h,
    agentsErrored24h,
    newLeads: newLeads.length,
    newDrafts: newDrafts.length,
    newTasks: newTasks.length,
    items: allItems.length,
    alerts: allAlerts.length,
    kpiLines,
    activityLines,
    alertLines,
    agentLines,
  });

  return {
    day,
    subject,
    bodyText,
    bodyHtml,
    agentCount: states.length,
    itemsCount: allItems.length,
    alertsCount: allAlerts.length,
  };
}

// HTML template — keeps the email readable in Gmail/Apple Mail without
// external CSS. Inline-styles only.
function digestHtml(d: {
  day: string;
  agentsRun24h: number;
  agentsErrored24h: number;
  newLeads: number;
  newDrafts: number;
  newTasks: number;
  items: number;
  alerts: number;
  kpiLines: string[];
  activityLines: string[];
  alertLines: string[];
  agentLines: string[];
}): string {
  // Cheap markdown-to-html for the body sections — bullets + bold only.
  const renderLines = (lines: string[]): string =>
    lines
      .map((l) => {
        const html = l
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/^- /, '• ')
          .replace(/^\s+·\s/, '&nbsp;&nbsp;&nbsp;&nbsp;· ')
          .replace(/^_(.+)_$/, '<em>$1</em>');
        return `<div style="margin:6px 0;line-height:1.55;color:#374151">${html}</div>`;
      })
      .join('');

  const card = (heading: string, lines: string[]): string => `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background:#F9FAFB;border:1px solid #E5E7EB;border-radius:10px">
      <tr><td style="padding:16px 22px">
        <div style="font-family:-apple-system,Segoe UI,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#7C3AED;margin-bottom:10px">${heading}</div>
        ${lines.length ? renderLines(lines) : '<div style="color:#9CA3AF;font-style:italic">(nothing this cycle)</div>'}
      </td></tr>
    </table>`;

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>Aiprosol Daily Digest</title></head>
<body style="margin:0;padding:24px 12px;background:#F3F4F6;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#1F2937">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#FFFFFF;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(17,24,39,0.06)">
    <tr><td style="padding:28px 28px 8px">
      <div style="display:inline-block;padding:6px 12px;background:linear-gradient(135deg,#8B5CF6,#C084FC);color:#fff;border-radius:6px;font-size:11px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase">Aiprosol · Daily Digest</div>
      <h1 style="margin:14px 0 4px;font-size:22px;font-weight:800;color:#111827">${d.day}</h1>
      <p style="margin:0;color:#6B7280;font-size:14px">${d.agentsRun24h} agent runs · ${d.newLeads} new leads · ${d.newDrafts} drafts · ${d.alerts} alerts</p>
    </td></tr>
    <tr><td style="padding:0 28px 28px">
      ${card('KPI movement', d.kpiLines)}
      ${card('Activity (last 24h)', d.activityLines)}
      ${card('Alerts', d.alertLines)}
      ${card('Agent summaries', d.agentLines)}

      <div style="margin-top:24px;padding-top:18px;border-top:1px solid #E5E7EB;color:#9CA3AF;font-size:12px">
        Sent by Arora · <a href="https://aiprosol.com/studio" style="color:#7C3AED;text-decoration:none">View studio →</a>
      </div>
    </td></tr>
  </table>
</body></html>`;
}

// Persist + (try to) email the digest. Idempotent on day.
export async function runDailyDigest(): Promise<{
  ok: boolean;
  digest?: DigestPayload;
  emailed: boolean;
  error?: string;
}> {
  const digest = await composeDigest();
  if (!digest) {
    return { ok: false, emailed: false, error: 'no supabase / no data' };
  }

  if (!isSupabaseConfigured()) {
    return { ok: false, emailed: false, error: 'supabase not configured' };
  }
  const db = requireSupabaseAdmin();

  // Upsert today's digest row
  const { error: upsertErr } = await db.from('daily_digest').upsert(
    {
      day: digest.day,
      subject: digest.subject,
      body_text: digest.bodyText,
      body_html: digest.bodyHtml,
      agent_count: digest.agentCount,
      items_count: digest.itemsCount,
      alerts_count: digest.alertsCount,
    },
    { onConflict: 'day' },
  );

  if (upsertErr) {
    console.warn('[daily-digest] upsert failed:', upsertErr.message);
    return { ok: false, digest, emailed: false, error: upsertErr.message };
  }

  // Optional email send. RESEND_DIGEST_TO defaults to the founder's address;
  // when domain isn't verified yet we override FROM to onboarding@resend.dev
  // (Resend's sandbox sender) which only lets us send to verified addresses.
  let emailed = false;
  const to = process.env.RESEND_DIGEST_TO || '';
  if (to && isResendConfigured()) {
    const result = await sendEmail({
      to,
      subject: digest.subject,
      html: digest.bodyHtml,
      text: digest.bodyText,
      replyTo: 'srijanpaudelofficial@gmail.com',
      tags: [
        { name: 'category', value: 'daily-digest' },
        { name: 'day', value: digest.day },
      ],
    });
    emailed = result.ok;
    if (result.ok) {
      await db.from('daily_digest').update({ emailed_to: to, emailed_at: new Date().toISOString() }).eq('day', digest.day);
    } else {
      console.warn('[daily-digest] email failed:', result.error);
    }
  } else if (!to) {
    console.log('[daily-digest] RESEND_DIGEST_TO not set — digest persisted but not emailed');
  }

  return { ok: true, digest, emailed };
}

// Read most recent digest for /studio overview
export async function readLatestDigest(): Promise<{
  day: string;
  subject: string;
  body_text: string;
  body_html: string;
  emailed_at: string | null;
  emailed_to: string | null;
} | null> {
  if (!isSupabaseConfigured()) return null;
  const db = requireSupabaseAdmin();
  const { data } = await db
    .from('daily_digest')
    .select('day, subject, body_text, body_html, emailed_at, emailed_to')
    .order('day', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ?? null;
}
