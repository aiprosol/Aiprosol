// ─────────────────────────────────────────────────────────────────────────
// /agents — Live dashboard of the AI C-suite
// Server component. Reads state.json for every role and renders a
// mission-control style card grid. Auto-refreshes every 60s.
// ─────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next';
import Link from 'next/link';
import { ROLES, ROLE_META, type Role, type AgentState } from '@/lib/agents/types';
import { readAllStates } from '@/lib/agents/store';

export const metadata: Metadata = {
  title: 'Agents · The AI C-Suite Running Aiprosol',
  description:
    'Eleven C-suite roles. Ten of them AI agents, coordinated by Arora. This page is live: every agent posts its own activity log here.',
  alternates: { canonical: '/agents' },
};

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export default async function AgentsPage() {
  const states = await readAllStates();
  const onlineCount = ROLES.filter((r) => states[r]?.health === 'ok').length;
  const totalItems = ROLES.reduce(
    (n, r) => n + (states[r]?.lastOutput.items.length ?? 0),
    0,
  );

  return (
    <div className="ag-page">
      <header className="ag-hero">
        <div className="ag-eyebrow">
          <span className="ag-pulse" />
          C-Suite · Live Operations
        </div>
        <h1 className="ag-h1">
          The team running <span className="ag-grad">Aiprosol</span>.
        </h1>
        <p className="ag-sub">
          Eleven C-suite roles. {onlineCount} AI agents online. One human chairman.
          Every agent posts its own activity log here — auto-refreshed every minute.
        </p>
        <div className="ag-stats">
          <div><strong>{onlineCount}</strong><span>online</span></div>
          <div><strong>10</strong><span>AI agents</span></div>
          <div><strong>1</strong><span>human (Srijan)</span></div>
          <div><strong>{totalItems}</strong><span>actions this cycle</span></div>
        </div>
      </header>

      <div className="ag-grid">
        {ROLES.map((role) => (
          <AgentCard key={role} role={role} state={states[role]} />
        ))}
        {/* Chairman card (human) */}
        <ChairmanCard />
      </div>

      <Styles />
    </div>
  );
}

function AgentCard({ role, state }: { role: Role; state: AgentState | null }) {
  const meta = ROLE_META[role];
  const isOnline = state?.health === 'ok';
  return (
    <Link href={`/agents/${role}`} className={`ag-card ag-card-link ${isOnline ? 'is-online' : 'is-offline'}`}>
      <div className="ag-card-hdr">
        <div className="ag-card-id">
          <div className="ag-card-mark" style={{ color: meta.color, borderColor: meta.color }}>
            {meta.emoji}
          </div>
          <div className="ag-card-meta">
            <div className="ag-card-title">{meta.title}</div>
            <div className="ag-card-name">{meta.fullName}</div>
          </div>
        </div>
        <div className={`ag-card-status ${isOnline ? 'on' : 'off'}`}>
          {isOnline ? <><span className="ag-pip" /> ONLINE</> : 'OFFLINE'}
        </div>
      </div>

      <div className="ag-card-body">
        {state ? (
          <>
            <div className="ag-card-summary">{state.lastOutput.summary}</div>
            <div className="ag-card-section">
              <div className="ag-card-section-label">Last actions</div>
              <ul className="ag-card-items">
                {state.lastOutput.items.slice(0, 3).map((item, i) => (
                  <li key={i}>
                    <span className="ag-bullet" style={{ background: meta.color }} />
                    <div className="ag-item-body">
                      <div className="ag-item-action">{item.action}</div>
                      <div className="ag-item-result">→ {item.result}</div>
                      {item.tools && item.tools.length > 0 && (
                        <div className="ag-item-tools">
                          {item.tools.map((t) => (
                            <span key={t} className="ag-tool">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {state.lastOutput.kpis.length > 0 && (
              <div className="ag-card-section">
                <div className="ag-card-section-label">KPIs</div>
                <div className="ag-kpis">
                  {state.lastOutput.kpis.slice(0, 3).map((k, i) => (
                    <div key={i} className="ag-kpi">
                      <div className="ag-kpi-metric">{k.metric}</div>
                      <div className="ag-kpi-value" style={{ color: meta.color }}>
                        {k.value}
                        {k.trend === 'up' && ' ▴'}
                        {k.trend === 'down' && ' ▾'}
                      </div>
                      {k.delta && <div className="ag-kpi-delta">{k.delta}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {state.lastOutput.alerts.length > 0 && (
              <div className="ag-card-section">
                {state.lastOutput.alerts.map((a, i) => (
                  <div key={i} className={`ag-alert level-${a.level}`}>
                    <span className="ag-alert-tag">{a.level}</span>
                    {a.message}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="ag-card-empty">
            Not yet activated. Will run on first cron tick (every {meta.cadenceHrs}h).
          </div>
        )}
      </div>

      <div className="ag-card-foot">
        <span>Owns: {meta.ownsKpis.slice(0, 2).join(' · ')}</span>
        {state ? (
          <span className="ag-card-foot-time">
            Last run: {new Date(state.lastRunAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
          </span>
        ) : (
          <span className="ag-card-foot-time">View history →</span>
        )}
      </div>
    </Link>
  );
}

function ChairmanCard() {
  return (
    <div className="ag-card is-chairman">
      <div className="ag-card-hdr">
        <div className="ag-card-id">
          <div className="ag-card-mark" style={{ color: '#FBBF24', borderColor: '#FBBF24' }}>
            ☼
          </div>
          <div className="ag-card-meta">
            <div className="ag-card-title">CHAIRMAN</div>
            <div className="ag-card-name">Srijan Paudel</div>
          </div>
        </div>
        <div className="ag-card-status on">
          <span className="ag-pip" style={{ background: '#FBBF24' }} /> HUMAN
        </div>
      </div>
      <div className="ag-card-body">
        <div className="ag-card-summary">
          The one human in the loop. Strategic calls, enterprise relationships,
          founder decisions. Reviews the AI agents&apos; outputs daily and approves
          anything that ships to customers.
        </div>
        <div className="ag-card-section">
          <div className="ag-card-section-label">Reach Srijan</div>
          <ul className="ag-card-items">
            <li>
              <span className="ag-bullet" style={{ background: '#FBBF24' }} />
              <div className="ag-item-body">
                <div className="ag-item-action">Strategic call (Enterprise only)</div>
                <div className="ag-item-result">→ calendly.com/srijanpaudel219/30min</div>
              </div>
            </li>
            <li>
              <span className="ag-bullet" style={{ background: '#FBBF24' }} />
              <div className="ag-item-body">
                <div className="ag-item-action">Email · 24h reply</div>
                <div className="ag-item-result">→ srijanpaudelofficial@gmail.com</div>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div className="ag-card-foot">
        <span>Owns: vision · enterprise · final approval</span>
        <span className="ag-card-foot-time">Online</span>
      </div>
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      .ag-page { background: #0A0613; color: #E5E7EB; min-height: 100vh; padding: 140px 24px 80px; font-family: 'Inter', system-ui, sans-serif; }
      @media (max-width: 640px) { .ag-page { padding: 120px 16px 60px; } }

      .ag-hero { max-width: 880px; margin: 0 auto 56px; text-align: center; }
      .ag-eyebrow { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; background: rgba(139, 92, 246, 0.08); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 999px; color: #C084FC; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 18px; }
      .ag-pulse { width: 6px; height: 6px; background: #34D399; border-radius: 50%; box-shadow: 0 0 8px #34D399; animation: ag-pulse 1.6s ease-in-out infinite; }
      @keyframes ag-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.7); } }
      .ag-h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(32px, 5vw, 52px); line-height: 1.08; margin-bottom: 16px; }
      .ag-grad { background: linear-gradient(135deg, #C084FC, #8B5CF6); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
      .ag-sub { color: #9CA3B5; font-size: 16px; line-height: 1.6; max-width: 680px; margin: 0 auto 28px; }
      .ag-stats { display: inline-flex; gap: 26px; padding: 12px 22px; background: rgba(19, 16, 31, 0.7); border: 1px solid #2A1F3D; border-radius: 999px; backdrop-filter: blur(8px); }
      .ag-stats > div { display: flex; flex-direction: column; align-items: center; line-height: 1.1; }
      .ag-stats strong { font-size: 20px; font-weight: 800; color: #E5E7EB; }
      .ag-stats span { font-size: 10px; color: #9CA3B5; text-transform: uppercase; letter-spacing: 0.12em; margin-top: 2px; }

      .ag-grid { max-width: 1280px; margin: 0 auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
      @media (max-width: 1024px) { .ag-grid { grid-template-columns: repeat(2, 1fr); } }
      @media (max-width: 640px) { .ag-grid { grid-template-columns: 1fr; } }

      .ag-card { background: rgba(19, 16, 31, 0.7); border: 1px solid #2A1F3D; border-radius: 14px; padding: 16px; display: flex; flex-direction: column; gap: 14px; backdrop-filter: blur(8px); transition: border 0.25s, transform 0.25s; }
      .ag-card-link { color: inherit; text-decoration: none; cursor: pointer; }
      .ag-card:hover { border-color: rgba(139, 92, 246, 0.45); transform: translateY(-2px); }
      .ag-card-link:hover { box-shadow: 0 8px 24px rgba(139, 92, 246, 0.18); }
      .ag-card.is-offline { opacity: 0.5; }
      .ag-card.is-chairman { background: rgba(251, 191, 36, 0.04); border-color: rgba(251, 191, 36, 0.25); }

      .ag-card-hdr { display: flex; justify-content: space-between; align-items: flex-start; }
      .ag-card-id { display: flex; gap: 12px; align-items: center; }
      .ag-card-mark { width: 38px; height: 38px; border: 1.5px solid; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
      .ag-card-title { font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.16em; color: #C084FC; text-transform: uppercase; }
      .ag-card-name { font-family: 'Space Grotesk', sans-serif; font-size: 15px; font-weight: 700; color: #E5E7EB; margin-top: 2px; }
      .ag-card-status { display: flex; align-items: center; gap: 6px; font-family: 'Space Grotesk', sans-serif; font-size: 9px; font-weight: 700; letter-spacing: 0.14em; }
      .ag-card-status.on { color: #34D399; }
      .ag-card-status.off { color: #6B7280; }
      .ag-pip { width: 5px; height: 5px; background: #34D399; border-radius: 50%; box-shadow: 0 0 6px #34D399; animation: ag-pulse 1.7s infinite; }

      .ag-card-body { display: flex; flex-direction: column; gap: 12px; flex: 1; }
      .ag-card-summary { font-size: 13px; color: #CBD5E1; line-height: 1.55; }
      .ag-card-empty { font-size: 12px; color: #6B7280; padding: 20px 0; text-align: center; font-style: italic; }
      .ag-card-section { display: flex; flex-direction: column; gap: 6px; }
      .ag-card-section-label { font-family: 'Space Grotesk', sans-serif; font-size: 9px; font-weight: 700; letter-spacing: 0.14em; color: #6B7280; text-transform: uppercase; }
      .ag-card-items { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
      .ag-card-items li { display: flex; gap: 8px; align-items: flex-start; }
      .ag-bullet { width: 5px; height: 5px; border-radius: 50%; margin-top: 6px; flex-shrink: 0; box-shadow: 0 0 6px currentColor; }
      .ag-item-body { flex: 1; min-width: 0; }
      .ag-item-action { font-size: 12px; color: #E5E7EB; line-height: 1.45; }
      .ag-item-result { font-size: 11px; color: #9CA3B5; line-height: 1.4; margin-top: 2px; }
      .ag-item-tools { display: flex; gap: 4px; margin-top: 4px; flex-wrap: wrap; }
      .ag-tool { display: inline-block; padding: 1px 5px; background: rgba(10, 6, 19, 0.6); border: 1px solid #2A1F3D; border-radius: 3px; font-family: 'JetBrains Mono', monospace; font-size: 8px; font-weight: 700; letter-spacing: 0.06em; color: #9CA3B5; }

      .ag-kpis { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
      .ag-kpi { padding: 8px 10px; background: rgba(10, 6, 19, 0.5); border-radius: 6px; }
      .ag-kpi-metric { font-size: 9px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 2px; }
      .ag-kpi-value { font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 800; }
      .ag-kpi-delta { font-size: 9px; color: #34D399; margin-top: 1px; }

      .ag-alert { padding: 6px 10px; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 6px; font-size: 11px; color: #FCD34D; line-height: 1.4; display: flex; gap: 6px; align-items: flex-start; }
      .ag-alert.level-info { background: rgba(34, 211, 238, 0.06); border-color: rgba(34, 211, 238, 0.3); color: #67E8F9; }
      .ag-alert.level-error { background: rgba(248, 113, 113, 0.08); border-color: rgba(248, 113, 113, 0.3); color: #F87171; }
      .ag-alert-tag { font-family: 'Space Grotesk', sans-serif; font-size: 8px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 2px 5px; background: currentColor; color: #0A0613; border-radius: 3px; flex-shrink: 0; margin-top: 1px; }

      .ag-card-foot { display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid rgba(42, 31, 61, 0.6); font-size: 10px; color: #6B7280; }
    `}</style>
  );
}
