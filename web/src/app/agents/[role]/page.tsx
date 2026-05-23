// ─────────────────────────────────────────────────────────────────────────
// /agents/[role] — Per-agent deep dive
// Public, read-only. Shows everything about a single AI agent:
//   • Header card with role meta + current health
//   • Latest run output (summary, items, alerts, KPIs)
//   • Last 30 agent_log entries (run history)
//   • Tasks this agent has proposed (source=agent, source_role=role)
// ─────────────────────────────────────────────────────────────────────────

import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ROLES, ROLE_META, type Role } from '@/lib/agents/types';
import { readState } from '@/lib/agents/store';
import { isSupabaseConfigured, requireSupabaseAdmin } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

type Params = { role: string };

export async function generateMetadata(
  { params }: { params: Promise<Params> },
): Promise<Metadata> {
  const { role } = await params;
  if (!ROLES.includes(role as Role)) return { title: 'Agent not found' };
  const meta = ROLE_META[role as Role];
  return {
    title: `${meta.fullName} · ${meta.title} · Aiprosol`,
    description: `Live history + current state of ${meta.fullName}, the AI ${meta.title} on Aiprosol's 10-agent C-suite. Domain: ${meta.domain}.`,
    alternates: { canonical: `/agents/${role}` },
  };
}

export async function generateStaticParams() {
  return ROLES.map((role) => ({ role }));
}

type LogRow = {
  at: string;
  status: string;
  duration_ms: number | null;
  items_count: number | null;
  alerts_count: number | null;
  error: string | null;
};

type AgentTask = {
  id: string;
  title: string;
  status: string;
  priority: string | null;
  created_at: string;
};

async function loadAgentDeep(role: Role) {
  const state = await readState(role);
  if (!isSupabaseConfigured()) {
    return { state, logs: [] as LogRow[], proposedTasks: [] as AgentTask[] };
  }
  const db = requireSupabaseAdmin();
  const [logsRes, tasksRes] = await Promise.all([
    db
      .from('agent_log')
      .select('at, status, duration_ms, items_count, alerts_count, error')
      .eq('role', role)
      .order('at', { ascending: false })
      .limit(30),
    db
      .from('tasks')
      .select('id, title, status, priority, created_at')
      .eq('source_role', role)
      .eq('source', 'agent')
      .order('created_at', { ascending: false })
      .limit(10),
  ]);
  return {
    state,
    logs: (logsRes.data ?? []) as LogRow[],
    proposedTasks: (tasksRes.data ?? []) as AgentTask[],
  };
}

export default async function AgentDeepPage({ params }: { params: Promise<Params> }) {
  const { role } = await params;
  if (!ROLES.includes(role as Role)) notFound();
  const r = role as Role;
  const meta = ROLE_META[r];
  const { state, logs, proposedTasks } = await loadAgentDeep(r);
  const isOnline = state?.health === 'ok';

  // Run stats from log
  const okRuns = logs.filter((l) => l.status === 'ok').length;
  const errRuns = logs.filter((l) => l.status === 'error').length;
  const fallbackRuns = logs.filter((l) => l.status === 'fallback').length;
  const avgDuration = logs.length
    ? Math.round(logs.reduce((n, l) => n + (l.duration_ms || 0), 0) / logs.length)
    : 0;

  return (
    <div className="agd-page">
      <header className="agd-hero">
        <div className="agd-back">
          <Link href="/agents">← All agents</Link>
        </div>
        <div className="agd-hero-card" style={{ borderColor: meta.color }}>
          <div className="agd-hero-mark" style={{ color: meta.color, borderColor: meta.color }}>
            {meta.emoji}
          </div>
          <div className="agd-hero-info">
            <div className="agd-hero-eyebrow" style={{ color: meta.color }}>
              {meta.title} · {isOnline ? <span className="agd-on">ONLINE</span> : <span className="agd-off">OFFLINE</span>}
            </div>
            <h1 className="agd-h1">{meta.fullName}</h1>
            <p className="agd-sub">{meta.domain}</p>
            <div className="agd-pills">
              <span className="agd-pill">Cadence: every {meta.cadenceHrs}h</span>
              {meta.ownsKpis.map((k) => (
                <span key={k} className="agd-pill">{k}</span>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="agd-grid">
        <div className="agd-col-main">
          {/* Latest run output */}
          <section className="agd-card">
            <h2 className="agd-h2">Latest run</h2>
            {state ? (
              <>
                <div className="agd-summary">{state.lastOutput.summary}</div>
                <div className="agd-meta-row">
                  <span>Model: <code>{state.modelLastUsed}</code></span>
                  <span>Ran: {new Date(state.lastRunAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  <span>Next: {new Date(state.nextRunAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </div>

                <h3 className="agd-h3">Items shipped ({state.lastOutput.items.length})</h3>
                <ul className="agd-items">
                  {state.lastOutput.items.map((it, i) => (
                    <li key={i}>
                      <span className="agd-bullet" style={{ background: meta.color }} />
                      <div>
                        <div className="agd-it-action">{it.action}</div>
                        <div className="agd-it-result">→ {it.result}</div>
                        {it.impact && <div className="agd-it-impact">{it.impact}</div>}
                        {it.tools?.length ? (
                          <div className="agd-it-tools">
                            {it.tools.map((t) => (<span key={t} className="agd-tool">{t}</span>))}
                          </div>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>

                {state.lastOutput.kpis.length > 0 && (
                  <>
                    <h3 className="agd-h3">KPIs reported</h3>
                    <div className="agd-kpis">
                      {state.lastOutput.kpis.map((k, i) => (
                        <div className="agd-kpi" key={i}>
                          <div className="agd-kpi-metric">{k.metric}</div>
                          <div className="agd-kpi-value" style={{ color: meta.color }}>
                            {k.value}
                            {k.trend === 'up' && ' ▴'}
                            {k.trend === 'down' && ' ▾'}
                          </div>
                          {k.delta && <div className="agd-kpi-delta">{k.delta}</div>}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {state.lastOutput.alerts.length > 0 && (
                  <>
                    <h3 className="agd-h3">Alerts</h3>
                    {state.lastOutput.alerts.map((a, i) => (
                      <div key={i} className={`agd-alert level-${a.level}`}>
                        <span className="agd-alert-tag">{a.level}</span>
                        {a.message}
                      </div>
                    ))}
                  </>
                )}

                {state.lastOutput.next_focus && (
                  <>
                    <h3 className="agd-h3">Next focus</h3>
                    <div className="agd-focus">{state.lastOutput.next_focus}</div>
                  </>
                )}
              </>
            ) : (
              <div className="agd-empty">
                Not activated yet. Will run on the next cron tick (every {meta.cadenceHrs}h).
              </div>
            )}
          </section>

          {/* Proposed tasks */}
          {proposedTasks.length > 0 && (
            <section className="agd-card">
              <h2 className="agd-h2">Tasks {meta.fullName} has proposed</h2>
              <ul className="agd-tasks">
                {proposedTasks.map((t) => (
                  <li key={t.id}>
                    <span className={`agd-tbadge status-${t.status}`}>{t.status}</span>
                    {t.priority && t.priority !== 'normal' && (
                      <span className={`agd-tbadge prio-${t.priority}`}>{t.priority}</span>
                    )}
                    <span className="agd-ttitle">{t.title}</span>
                    <span className="agd-ttime">{new Date(t.created_at).toLocaleDateString('en-GB')}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="agd-col-side">
          {/* Run stats */}
          <section className="agd-card">
            <h2 className="agd-h2">Run stats · last 30</h2>
            <div className="agd-statgrid">
              <div className="agd-stat"><strong>{okRuns}</strong><span>OK</span></div>
              <div className="agd-stat"><strong>{fallbackRuns}</strong><span>fallback</span></div>
              <div className="agd-stat"><strong>{errRuns}</strong><span>errors</span></div>
              <div className="agd-stat"><strong>{avgDuration}</strong><span>avg ms</span></div>
            </div>
          </section>

          {/* Log */}
          <section className="agd-card">
            <h2 className="agd-h2">Run log</h2>
            {logs.length === 0 ? (
              <div className="agd-empty">No runs logged yet.</div>
            ) : (
              <ul className="agd-log">
                {logs.map((l, i) => (
                  <li key={i} className={`status-${l.status}`}>
                    <span className="agd-log-time">{l.at.slice(11, 16)} <em>{l.at.slice(5, 10)}</em></span>
                    <span className={`agd-log-status status-${l.status}`}>{l.status}</span>
                    <span className="agd-log-mini">
                      {l.duration_ms !== null && `${l.duration_ms}ms · `}
                      {l.items_count !== null && `${l.items_count} items`}
                      {l.alerts_count ? ` · ${l.alerts_count} alerts` : ''}
                    </span>
                    {l.error && <span className="agd-log-err" title={l.error}>{l.error.slice(0, 60)}</span>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>

      <Styles />
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      .agd-page { background: #0A0613; color: #E5E7EB; min-height: 100vh; padding: 140px 24px 80px; font-family: 'Inter', system-ui, sans-serif; }
      @media (max-width: 640px) { .agd-page { padding: 110px 16px 60px; } }

      .agd-hero { max-width: 1180px; margin: 0 auto 32px; }
      .agd-back { font-size: 12px; margin-bottom: 14px; }
      .agd-back a { color: #C084FC; text-decoration: none; }
      .agd-back a:hover { color: #fff; }

      .agd-hero-card { display: flex; gap: 24px; align-items: center; padding: 24px 28px; background: rgba(19, 16, 31, 0.7); border: 1.5px solid; border-radius: 16px; backdrop-filter: blur(8px); }
      .agd-hero-mark { width: 70px; height: 70px; border: 2px solid; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 38px; flex-shrink: 0; }
      .agd-hero-info { flex: 1; min-width: 0; }
      .agd-hero-eyebrow { font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 8px; }
      .agd-on { color: #34D399; }
      .agd-off { color: #6B7280; }
      .agd-h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(28px, 4vw, 40px); line-height: 1.1; margin: 0 0 8px; }
      .agd-sub { color: #9CA3B5; font-size: 14px; line-height: 1.5; margin: 0 0 14px; max-width: 700px; }
      .agd-pills { display: flex; flex-wrap: wrap; gap: 6px; }
      .agd-pill { padding: 4px 10px; background: rgba(10, 6, 19, 0.6); border: 1px solid #2A1F3D; border-radius: 999px; font-size: 11px; color: #9CA3B5; }

      .agd-grid { max-width: 1180px; margin: 0 auto; display: grid; grid-template-columns: 1.7fr 1fr; gap: 18px; }
      @media (max-width: 900px) { .agd-grid { grid-template-columns: 1fr; } }
      .agd-col-main, .agd-col-side { display: flex; flex-direction: column; gap: 18px; }

      .agd-card { padding: 22px 24px; background: rgba(19, 16, 31, 0.7); border: 1px solid #2A1F3D; border-radius: 14px; backdrop-filter: blur(8px); }
      .agd-h2 { font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #C084FC; margin: 0 0 14px; }
      .agd-h3 { font-family: 'Space Grotesk', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #6B7280; margin: 18px 0 8px; }

      .agd-summary { font-size: 14px; line-height: 1.6; color: #E5E7EB; padding-bottom: 12px; border-bottom: 1px solid #2A1F3D; margin-bottom: 12px; }
      .agd-meta-row { display: flex; flex-wrap: wrap; gap: 14px; font-size: 11px; color: #9CA3B5; }
      .agd-meta-row code { font-family: 'JetBrains Mono', monospace; color: #C084FC; background: rgba(192, 132, 252, 0.08); padding: 1px 6px; border-radius: 3px; }

      .agd-items { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
      .agd-items > li { display: flex; gap: 10px; align-items: flex-start; }
      .agd-bullet { width: 6px; height: 6px; border-radius: 50%; margin-top: 7px; flex-shrink: 0; box-shadow: 0 0 6px currentColor; }
      .agd-it-action { font-size: 13px; color: #E5E7EB; line-height: 1.5; }
      .agd-it-result { font-size: 12px; color: #9CA3B5; line-height: 1.45; margin-top: 2px; }
      .agd-it-impact { font-size: 11px; color: #34D399; margin-top: 4px; font-weight: 600; }
      .agd-it-tools { display: flex; gap: 4px; margin-top: 5px; flex-wrap: wrap; }
      .agd-tool { padding: 2px 6px; background: rgba(10, 6, 19, 0.6); border: 1px solid #2A1F3D; border-radius: 3px; font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 700; letter-spacing: 0.06em; color: #9CA3B5; }

      .agd-kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
      .agd-kpi { padding: 12px 14px; background: rgba(10, 6, 19, 0.5); border: 1px solid #2A1F3D; border-radius: 8px; }
      .agd-kpi-metric { font-size: 10px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
      .agd-kpi-value { font-family: 'Space Grotesk', sans-serif; font-size: 20px; font-weight: 800; line-height: 1; }
      .agd-kpi-delta { font-size: 10px; color: #34D399; margin-top: 4px; }

      .agd-alert { padding: 8px 12px; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 6px; font-size: 12px; color: #FCD34D; line-height: 1.45; display: flex; gap: 6px; align-items: flex-start; margin-bottom: 6px; }
      .agd-alert.level-info { background: rgba(34, 211, 238, 0.06); border-color: rgba(34, 211, 238, 0.3); color: #67E8F9; }
      .agd-alert.level-error { background: rgba(248, 113, 113, 0.08); border-color: rgba(248, 113, 113, 0.3); color: #F87171; }
      .agd-alert-tag { font-family: 'Space Grotesk', sans-serif; font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 2px 6px; background: currentColor; color: #0A0613; border-radius: 3px; flex-shrink: 0; }

      .agd-focus { font-size: 13px; color: #E5E7EB; padding: 12px 14px; background: rgba(192, 132, 252, 0.06); border-left: 3px solid #C084FC; border-radius: 4px; font-style: italic; }
      .agd-empty { font-size: 12px; color: #6B7280; padding: 20px 0; text-align: center; font-style: italic; }

      .agd-tasks { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
      .agd-tasks > li { display: flex; gap: 8px; align-items: center; padding: 6px 8px; background: rgba(10, 6, 19, 0.4); border-radius: 6px; flex-wrap: wrap; }
      .agd-tbadge { padding: 2px 6px; border-radius: 3px; font-family: 'Space Grotesk', sans-serif; font-size: 9px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
      .agd-tbadge.status-todo { background: rgba(192, 132, 252, 0.14); color: #C084FC; }
      .agd-tbadge.status-in_progress { background: rgba(34, 211, 238, 0.14); color: #67E8F9; }
      .agd-tbadge.status-done { background: rgba(52, 211, 153, 0.14); color: #34D399; }
      .agd-tbadge.status-blocked { background: rgba(248, 113, 113, 0.14); color: #F87171; }
      .agd-tbadge.prio-high { background: rgba(245, 158, 11, 0.14); color: #FCD34D; }
      .agd-tbadge.prio-now { background: rgba(248, 113, 113, 0.18); color: #F87171; }
      .agd-ttitle { flex: 1; font-size: 12px; color: #E5E7EB; }
      .agd-ttime { font-size: 10px; color: #6B7280; font-family: 'JetBrains Mono', monospace; }

      .agd-statgrid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
      .agd-stat { padding: 12px 10px; background: rgba(10, 6, 19, 0.5); border-radius: 8px; text-align: center; }
      .agd-stat strong { display: block; font-family: 'Space Grotesk', sans-serif; font-size: 22px; font-weight: 800; color: #E5E7EB; line-height: 1; margin-bottom: 4px; }
      .agd-stat span { font-size: 10px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.08em; }

      .agd-log { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; max-height: 540px; overflow-y: auto; }
      .agd-log > li { display: grid; grid-template-columns: 78px 70px 1fr; gap: 8px; align-items: center; padding: 5px 8px; background: rgba(10, 6, 19, 0.4); border-radius: 4px; font-size: 11px; }
      .agd-log-time { font-family: 'JetBrains Mono', monospace; color: #9CA3B5; }
      .agd-log-time em { font-style: normal; color: #6B7280; font-size: 9px; margin-left: 2px; }
      .agd-log-status { font-family: 'Space Grotesk', sans-serif; font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 1px 5px; border-radius: 3px; text-align: center; }
      .agd-log-status.status-ok { background: rgba(52, 211, 153, 0.14); color: #34D399; }
      .agd-log-status.status-fallback { background: rgba(245, 158, 11, 0.14); color: #FCD34D; }
      .agd-log-status.status-error { background: rgba(248, 113, 113, 0.14); color: #F87171; }
      .agd-log-mini { color: #9CA3B5; font-family: 'JetBrains Mono', monospace; font-size: 10px; }
      .agd-log-err { grid-column: 1 / -1; font-size: 10px; color: #F87171; font-family: 'JetBrains Mono', monospace; margin-top: 2px; padding-left: 4px; }
    `}</style>
  );
}
