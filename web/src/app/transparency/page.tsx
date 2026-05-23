// ─────────────────────────────────────────────────────────────────────────
// /transparency — Live Operational Transparency
//
// The dashboard that backs every claim in the Aiprosol manifesto.
// Shows, for the last 24 hours: every agent run, every alert raised, every
// task proposed for human approval, every error or fallback. Plus a 7-day
// failure log so visitors can verify we're not hiding the messy ones.
//
// Server-rendered, revalidates every 60s. No auth gate — public by design.
// The thesis of the operating model is that an AI-led company should be
// inspectable in a way conventional companies aren't, and this page is
// where that promise gets cashed.
// ─────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next';
import Link from 'next/link';
import { ROLES, ROLE_META, type Role, type AgentState, type AgentLogEntry } from '@/lib/agents/types';
import { readAllStates, readAllLogsSince } from '@/lib/agents/store';

export const metadata: Metadata = {
  title: 'Live Operational Transparency · what AI did, queued, failed today',
  description:
    'Every decision the Aiprosol AI agents made in the last 24 hours. Every task queued for human approval. Every alert. Every failure. The public dashboard that backs the AI-led operating model.',
  alternates: { canonical: '/transparency' },
  openGraph: {
    title: 'Live Operational Transparency · Aiprosol',
    description:
      'Every agent run, every proposed task, every alert, every failure — public, real, refreshed every minute.',
    url: '/transparency',
    type: 'website',
  },
};

export const dynamic = 'force-dynamic';
export const revalidate = 60;

const DAY_MS = 24 * 3600_000;
const WEEK_MS = 7 * DAY_MS;

function fmtAgo(iso: string): string {
  if (!iso) return '—';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '—';
  const delta = Date.now() - t;
  if (delta < 60_000) return `${Math.max(1, Math.floor(delta / 1000))}s ago`;
  if (delta < 3600_000) return `${Math.floor(delta / 60_000)}m ago`;
  if (delta < 86_400_000) return `${Math.floor(delta / 3600_000)}h ago`;
  return `${Math.floor(delta / 86_400_000)}d ago`;
}

function fmtTime(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toISOString().replace('T', ' ').replace(/\.\d+Z$/, ' UTC');
}

export default async function TransparencyPage() {
  const [states, logs24h, logs7dErrors] = await Promise.all([
    readAllStates(),
    readAllLogsSince(Date.now() - DAY_MS),
    readAllLogsSince(Date.now() - WEEK_MS),
  ]);

  // ─── Aggregate stats (last 24h) ────────────────────────────────────
  const totalRuns = logs24h.length;
  const okRuns = logs24h.filter((l) => l.status === 'ok').length;
  const errorRuns = logs24h.filter((l) => l.status === 'error').length;
  const fallbackRuns = logs24h.filter((l) => l.status === 'fallback').length;
  const itemsProduced = logs24h.reduce((n, l) => n + (l.itemsCount || 0), 0);
  const alertsRaised = logs24h.reduce((n, l) => n + (l.alertsCount || 0), 0);

  // Tasks queued for human approval — pulled from each agent's last output
  type Q = { role: Role; title: string; priority?: string; notes?: string };
  const queued: Q[] = [];
  for (const role of ROLES) {
    const s = states[role];
    const tasks = (s?.lastOutput?.proposed_tasks ?? []) as Array<{ title: string; priority?: string; notes?: string }>;
    for (const t of tasks) queued.push({ role, title: t.title, priority: t.priority, notes: t.notes });
  }

  // Active alerts — pulled from each agent's last output, level ≥ warn
  type A = { role: Role; level: 'warn' | 'error'; message: string };
  const activeAlerts: A[] = [];
  for (const role of ROLES) {
    const s = states[role];
    const alerts = (s?.lastOutput?.alerts ?? []) as Array<{ level: 'info' | 'warn' | 'error'; message: string }>;
    for (const a of alerts) if (a.level === 'warn' || a.level === 'error') activeAlerts.push({ role, level: a.level, message: a.message });
  }

  // Recent failures — last 7d agent_log entries with status ≠ ok
  const failures7d = logs7dErrors.filter((l) => l.status !== 'ok');

  // Online count
  const onlineCount = ROLES.filter((r) => states[r]?.health === 'ok').length;
  const offlineCount = ROLES.filter((r) => states[r]?.health === 'offline').length;
  const degradedCount = ROLES.filter((r) => states[r]?.health === 'degraded').length;

  // Failure rate (24h)
  const failureRate = totalRuns > 0 ? ((errorRuns + fallbackRuns) / totalRuns) * 100 : 0;

  return (
    <div className="tp-page">
      <header className="tp-hero">
        <div className="tp-eyebrow">
          <span className="tp-pulse" />
          Live Operational Transparency · refreshes every 60s
        </div>
        <h1 className="tp-h1">
          Every decision an Aiprosol AI <span className="tp-grad">agent made today</span>.
        </h1>
        <p className="tp-sub">
          The thesis of the AI-led operating model is that an AI-run company should be inspectable in a way conventional companies aren&apos;t. This page is where that promise gets cashed.
          Every agent run in the last 24 hours, every task queued for human approval, every alert, every failure — all of it, public.
        </p>

        <div className="tp-stats">
          <div className="tp-stat">
            <strong>{totalRuns}</strong>
            <span>runs · 24h</span>
          </div>
          <div className="tp-stat">
            <strong className="tp-stat-ok">{okRuns}</strong>
            <span>successful</span>
          </div>
          <div className="tp-stat">
            <strong className={fallbackRuns > 0 ? 'tp-stat-warn' : ''}>{fallbackRuns}</strong>
            <span>fallback (model swap)</span>
          </div>
          <div className="tp-stat">
            <strong className={errorRuns > 0 ? 'tp-stat-err' : ''}>{errorRuns}</strong>
            <span>errored</span>
          </div>
          <div className="tp-stat">
            <strong>{failureRate.toFixed(1)}%</strong>
            <span>failure rate</span>
          </div>
          <div className="tp-stat">
            <strong>{itemsProduced}</strong>
            <span>items produced</span>
          </div>
          <div className="tp-stat">
            <strong>{queued.length}</strong>
            <span>queued for approval</span>
          </div>
          <div className="tp-stat">
            <strong>{alertsRaised}</strong>
            <span>alerts raised</span>
          </div>
        </div>

        <div className="tp-health">
          <span><span className="tp-dot tp-dot-ok" /> {onlineCount} online</span>
          {degradedCount > 0 && <span><span className="tp-dot tp-dot-warn" /> {degradedCount} degraded</span>}
          {offlineCount > 0 && <span><span className="tp-dot tp-dot-err" /> {offlineCount} offline</span>}
          <span className="tp-sep">·</span>
          <Link href="/agents" className="tp-link">Full agent grid →</Link>
          <Link href="/blog/we-built-a-consultancy-run-by-ai-agents" className="tp-link">The Manifesto →</Link>
        </div>
      </header>

      {/* ─── Queued for human approval ─────────────────────────────── */}
      <section className="tp-section">
        <div className="tp-section-head">
          <h2 className="tp-h2">Queued for human approval</h2>
          <p className="tp-section-sub">
            Tasks an agent has proposed in its last run. None of these have shipped — they&apos;re waiting on Srijan to approve, edit, or reject. Customer-facing outputs always route here first; that&apos;s the human gate.
          </p>
        </div>
        {queued.length === 0 ? (
          <div className="tp-empty">No tasks currently queued. Either the agents haven&apos;t run yet today, or every proposal has already been processed.</div>
        ) : (
          <div className="tp-cards">
            {queued.slice(0, 24).map((q, i) => (
              <div key={i} className="tp-card">
                <div className="tp-card-head">
                  <span className="tp-tag" style={{ borderColor: ROLE_META[q.role].color, color: ROLE_META[q.role].color }}>
                    {ROLE_META[q.role].emoji} {ROLE_META[q.role].fullName}
                  </span>
                  {q.priority && (
                    <span className={`tp-pri tp-pri-${q.priority}`}>{q.priority}</span>
                  )}
                </div>
                <div className="tp-card-title">{q.title}</div>
                {q.notes && <div className="tp-card-notes">{q.notes}</div>}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── Active alerts ─────────────────────────────────────────── */}
      {activeAlerts.length > 0 && (
        <section className="tp-section">
          <div className="tp-section-head">
            <h2 className="tp-h2">Active alerts</h2>
            <p className="tp-section-sub">
              Warnings or errors raised by any agent on its last run. Surfaced here so the operating state isn&apos;t buried in individual agent pages.
            </p>
          </div>
          <div className="tp-alerts">
            {activeAlerts.map((a, i) => (
              <div key={i} className={`tp-alert tp-alert-${a.level}`}>
                <span className="tp-alert-level">{a.level.toUpperCase()}</span>
                <span className="tp-alert-role">{ROLE_META[a.role].emoji} {ROLE_META[a.role].fullName}</span>
                <span className="tp-alert-msg">{a.message}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── Last-24h activity feed ────────────────────────────────── */}
      <section className="tp-section">
        <div className="tp-section-head">
          <h2 className="tp-h2">Activity feed · last 24 hours</h2>
          <p className="tp-section-sub">
            Every agent run logged in the last 24 hours, newest first. Each entry shows the agent, status, items produced, duration, and any error.
          </p>
        </div>
        {logs24h.length === 0 ? (
          <div className="tp-empty">No agent runs logged in the last 24 hours. Either the cron didn&apos;t fire today or Supabase isn&apos;t configured in this environment.</div>
        ) : (
          <div className="tp-feed">
            {logs24h.slice(0, 60).map((l, i) => (
              <ActivityRow key={i} log={l} />
            ))}
          </div>
        )}
      </section>

      {/* ─── 7-day failure log ─────────────────────────────────────── */}
      <section className="tp-section">
        <div className="tp-section-head">
          <h2 className="tp-h2">Failure log · last 7 days</h2>
          <p className="tp-section-sub">
            Every agent run in the last 7 days that errored or fell back to the backup model. We surface these explicitly because a transparency dashboard that only shows successes is propaganda, not transparency.
          </p>
        </div>
        {failures7d.length === 0 ? (
          <div className="tp-empty tp-empty-good">No failures logged in the last 7 days. (When this number is zero for too long, the most likely explanation isn&apos;t that the agents are perfect — it&apos;s that the cron isn&apos;t firing. The agent grid will say so first.)</div>
        ) : (
          <div className="tp-feed">
            {failures7d.slice(0, 40).map((l, i) => (
              <FailureRow key={i} log={l} />
            ))}
          </div>
        )}
      </section>

      {/* ─── Agent health snapshot ─────────────────────────────────── */}
      <section className="tp-section">
        <div className="tp-section-head">
          <h2 className="tp-h2">Agent health snapshot</h2>
          <p className="tp-section-sub">Current state of each agent — last run, next run, total runs lifetime, model. The full grid with last-output is at <Link href="/agents" className="tp-link-inline">/agents</Link>.</p>
        </div>
        <div className="tp-grid">
          {ROLES.map((role) => {
            const s = states[role];
            const meta = ROLE_META[role];
            return (
              <Link key={role} href={`/agents/${role}`} className="tp-agent-card">
                <div className="tp-agent-head">
                  <span className="tp-agent-emoji" style={{ color: meta.color }}>{meta.emoji}</span>
                  <div>
                    <div className="tp-agent-name">{meta.fullName}</div>
                    <div className="tp-agent-title">AI {meta.title}</div>
                  </div>
                  <span className={`tp-agent-health tp-agent-health-${s?.health || 'offline'}`}>
                    {s?.health || 'offline'}
                  </span>
                </div>
                <div className="tp-agent-meta">
                  <div><span>Last run</span><strong>{s?.lastRunAt ? fmtAgo(s.lastRunAt) : 'never'}</strong></div>
                  <div><span>Next run</span><strong>{s?.nextRunAt ? fmtAgo(s.nextRunAt) : '—'}</strong></div>
                  <div><span>Lifetime runs</span><strong>{s?.runs ?? 0}</strong></div>
                  <div><span>Model</span><strong>{s?.modelLastUsed ?? '—'}</strong></div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─── Why we publish this ───────────────────────────────────── */}
      <section className="tp-section tp-why">
        <h2 className="tp-h2">Why we publish this</h2>
        <p>
          The Aiprosol operating thesis is that an AI-led company should be more inspectable than a conventional one, not less. Conventional companies hide their operations behind employee badges and signed NDAs. We don&apos;t have employees behind badges — we have ten AI agents, and the only thing that makes &quot;run by AI&quot; a credible claim rather than a marketing line is that you can see them work.
        </p>
        <p>
          So we publish what they did, what they proposed, what we approved, what we rejected, and what failed. We&apos;d rather you see a noisy failure log on this page than a polished marketing claim on the homepage. If we ever stop publishing this, that&apos;s a signal we&apos;ve moved the operating model somewhere it doesn&apos;t belong.
        </p>
        <div className="tp-why-links">
          <Link href="/blog/we-built-a-consultancy-run-by-ai-agents" className="tp-cta">Read the manifesto →</Link>
          <Link href="/blog/what-is-an-ai-led-operating-model" className="tp-cta-secondary">What is an AI-led operating model? →</Link>
          <Link href="/blog/what-is-an-ai-ceo" className="tp-cta-secondary">What is an AI CEO? →</Link>
          <Link href="/blog/how-to-evaluate-an-ai-automation-consultancy" className="tp-cta-secondary">How to evaluate any AI consultancy →</Link>
        </div>
      </section>

      <Styles />
    </div>
  );
}

function statusLabel(status: AgentLogEntry['status']): string {
  if (status === 'ok') return 'OK';
  if (status === 'fallback') return 'FALLBACK';
  return 'ERROR';
}

function ActivityRow({ log }: { log: AgentLogEntry }) {
  const meta = ROLE_META[log.role];
  return (
    <div className={`tp-row tp-row-${log.status}`}>
      <span className="tp-row-time" title={fmtTime(log.at)}>{fmtAgo(log.at)}</span>
      <span className="tp-row-role" style={{ color: meta.color }}>{meta.emoji} {meta.fullName}</span>
      <span className={`tp-row-status tp-row-status-${log.status}`}>{statusLabel(log.status)}</span>
      <span className="tp-row-detail">
        {log.itemsCount > 0 && <span>{log.itemsCount} item{log.itemsCount === 1 ? '' : 's'}</span>}
        {log.alertsCount > 0 && <span className="tp-row-alert">· {log.alertsCount} alert{log.alertsCount === 1 ? '' : 's'}</span>}
        {log.durationMs > 0 && <span className="tp-row-dur">· {Math.round(log.durationMs / 100) / 10}s</span>}
      </span>
      {log.error && <span className="tp-row-err">{log.error}</span>}
    </div>
  );
}

function FailureRow({ log }: { log: AgentLogEntry }) {
  const meta = ROLE_META[log.role];
  return (
    <div className={`tp-row tp-row-${log.status} tp-row-fail`}>
      <span className="tp-row-time" title={fmtTime(log.at)}>{fmtAgo(log.at)}</span>
      <span className="tp-row-role" style={{ color: meta.color }}>{meta.emoji} {meta.fullName}</span>
      <span className={`tp-row-status tp-row-status-${log.status}`}>{statusLabel(log.status)}</span>
      <span className="tp-row-err">{log.error || '(no error message recorded)'}</span>
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      .tp-page { background: #0A0613; color: #E5E7EB; min-height: 100vh; padding: 120px 24px 80px; font-family: 'Inter', system-ui, sans-serif; }
      @media (max-width: 640px) { .tp-page { padding: 100px 16px 60px; } }
      .tp-hero { max-width: 1100px; margin: 0 auto 56px; }
      .tp-eyebrow { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; background: rgba(139, 92, 246, 0.08); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 999px; color: #C084FC; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 20px; }
      .tp-pulse { width: 8px; height: 8px; border-radius: 50%; background: #10B981; box-shadow: 0 0 8px #10B981; animation: tp-pulse 2s infinite; }
      @keyframes tp-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      .tp-h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(32px, 5vw, 56px); line-height: 1.05; letter-spacing: -0.02em; margin-bottom: 20px; }
      .tp-grad { background: linear-gradient(135deg, #8B5CF6, #C084FC); -webkit-background-clip: text; background-clip: text; color: transparent; }
      .tp-sub { font-size: 17px; line-height: 1.6; color: #9CA3B5; max-width: 800px; margin-bottom: 32px; }
      .tp-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 24px; }
      .tp-stat { background: #13101F; border: 1px solid #2A1F3D; border-radius: 12px; padding: 16px 18px; }
      .tp-stat strong { display: block; font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 28px; line-height: 1; margin-bottom: 4px; }
      .tp-stat span { font-size: 12px; color: #9CA3B5; }
      .tp-stat-ok { color: #10B981; }
      .tp-stat-warn { color: #F59E0B; }
      .tp-stat-err { color: #EF4444; }
      .tp-health { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; font-size: 13px; color: #9CA3B5; }
      .tp-health span { display: inline-flex; align-items: center; gap: 6px; }
      .tp-sep { color: #2A1F3D; }
      .tp-dot { width: 8px; height: 8px; border-radius: 50%; }
      .tp-dot-ok { background: #10B981; }
      .tp-dot-warn { background: #F59E0B; }
      .tp-dot-err { background: #EF4444; }
      .tp-link, .tp-link-inline { color: #8B5CF6; }
      .tp-link:hover, .tp-link-inline:hover { color: #C084FC; }
      .tp-section { max-width: 1100px; margin: 0 auto 56px; }
      .tp-section-head { margin-bottom: 18px; }
      .tp-h2 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 26px; line-height: 1.2; margin-bottom: 8px; }
      .tp-section-sub { color: #9CA3B5; font-size: 14px; line-height: 1.6; max-width: 800px; }
      .tp-empty { background: #13101F; border: 1px dashed #2A1F3D; border-radius: 12px; padding: 24px; color: #9CA3B5; font-size: 14px; line-height: 1.6; }
      .tp-empty-good { border-color: rgba(16, 185, 129, 0.3); color: #10B981; }
      .tp-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; }
      .tp-card { background: #13101F; border: 1px solid #2A1F3D; border-radius: 12px; padding: 16px; }
      .tp-card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; gap: 8px; }
      .tp-tag { display: inline-block; padding: 3px 10px; border-radius: 999px; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; border: 1px solid; }
      .tp-pri { padding: 3px 10px; border-radius: 999px; font-family: 'Space Grotesk', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
      .tp-pri-low { background: rgba(156, 163, 181, 0.1); color: #9CA3B5; }
      .tp-pri-normal { background: rgba(139, 92, 246, 0.1); color: #C084FC; }
      .tp-pri-high { background: rgba(245, 158, 11, 0.1); color: #F59E0B; }
      .tp-pri-now { background: rgba(239, 68, 68, 0.1); color: #EF4444; }
      .tp-card-title { font-size: 14px; line-height: 1.5; color: #E5E7EB; font-weight: 500; margin-bottom: 8px; }
      .tp-card-notes { font-size: 12px; line-height: 1.5; color: #9CA3B5; }
      .tp-alerts { display: flex; flex-direction: column; gap: 8px; }
      .tp-alert { display: grid; grid-template-columns: 80px 180px 1fr; align-items: center; gap: 12px; padding: 12px 16px; background: #13101F; border-radius: 10px; border-left: 3px solid; font-size: 13px; }
      .tp-alert-warn { border-color: #F59E0B; }
      .tp-alert-error { border-color: #EF4444; }
      .tp-alert-level { font-family: 'Space Grotesk', sans-serif; font-size: 10px; font-weight: 800; letter-spacing: 0.1em; }
      .tp-alert-warn .tp-alert-level { color: #F59E0B; }
      .tp-alert-error .tp-alert-level { color: #EF4444; }
      .tp-alert-role { color: #C084FC; font-size: 12px; }
      .tp-alert-msg { color: #E5E7EB; line-height: 1.5; }
      @media (max-width: 720px) { .tp-alert { grid-template-columns: 1fr; } }
      .tp-feed { display: flex; flex-direction: column; gap: 2px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 12px; padding: 4px; }
      .tp-row { display: grid; grid-template-columns: 80px 200px 90px 1fr; align-items: center; gap: 12px; padding: 8px 12px; border-radius: 6px; font-size: 13px; }
      .tp-row:hover { background: rgba(139, 92, 246, 0.04); }
      .tp-row-time { color: #9CA3B5; font-size: 11px; font-family: ui-monospace, monospace; }
      .tp-row-role { font-size: 12px; }
      .tp-row-status { font-family: 'Space Grotesk', sans-serif; font-size: 10px; font-weight: 800; letter-spacing: 0.1em; padding: 2px 8px; border-radius: 4px; }
      .tp-row-status-ok { background: rgba(16, 185, 129, 0.1); color: #10B981; }
      .tp-row-status-fallback { background: rgba(245, 158, 11, 0.1); color: #F59E0B; }
      .tp-row-status-error { background: rgba(239, 68, 68, 0.1); color: #EF4444; }
      .tp-row-detail { color: #9CA3B5; font-size: 12px; }
      .tp-row-alert { color: #F59E0B; }
      .tp-row-dur { color: #6B7280; }
      .tp-row-err { color: #EF4444; font-size: 12px; font-family: ui-monospace, monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .tp-row-fail { grid-template-columns: 80px 200px 90px 1fr; }
      @media (max-width: 720px) { .tp-row { grid-template-columns: 1fr; gap: 4px; } }
      .tp-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; }
      .tp-agent-card { display: block; background: #13101F; border: 1px solid #2A1F3D; border-radius: 12px; padding: 16px; text-decoration: none; color: #E5E7EB; transition: all 0.2s; }
      .tp-agent-card:hover { border-color: #8B5CF6; transform: translateY(-1px); }
      .tp-agent-head { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
      .tp-agent-emoji { font-size: 22px; }
      .tp-agent-name { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 14px; line-height: 1.2; }
      .tp-agent-title { font-size: 11px; color: #9CA3B5; }
      .tp-agent-health { margin-left: auto; padding: 3px 8px; border-radius: 999px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; font-family: 'Space Grotesk', sans-serif; }
      .tp-agent-health-ok { background: rgba(16, 185, 129, 0.1); color: #10B981; }
      .tp-agent-health-degraded { background: rgba(245, 158, 11, 0.1); color: #F59E0B; }
      .tp-agent-health-offline { background: rgba(107, 114, 128, 0.15); color: #9CA3B5; }
      .tp-agent-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; }
      .tp-agent-meta div { display: flex; flex-direction: column; }
      .tp-agent-meta span { color: #6B7280; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; }
      .tp-agent-meta strong { color: #E5E7EB; font-weight: 600; font-size: 12px; }
      .tp-why { background: linear-gradient(135deg, rgba(139, 92, 246, 0.04), rgba(192, 132, 252, 0.04)); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 18px; padding: 36px; }
      .tp-why p { color: #9CA3B5; font-size: 15px; line-height: 1.7; margin-bottom: 16px; max-width: 800px; }
      .tp-why-links { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 24px; }
      .tp-cta { display: inline-block; padding: 12px 20px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; text-decoration: none; }
      .tp-cta-secondary { display: inline-block; padding: 12px 20px; background: transparent; border: 1px solid #2A1F3D; color: #E5E7EB; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 600; font-size: 13px; text-decoration: none; transition: border-color 0.2s; }
      .tp-cta-secondary:hover { border-color: #8B5CF6; }
    `}</style>
  );
}
