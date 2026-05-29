'use client';

import { useEffect, useState } from 'react';

// System status tab — what's configured, what's healthy, recent deploys.
// Fetches /api/studio/system on mount (kept off the initial studio load).

type EnvItem = { name: string; set: boolean; unlocks: string; group: string };
type Snapshot = {
  env: EnvItem[];
  supabase: { configured: boolean; serviceRole: boolean; ok: boolean; latencyMs: number | null; error?: string };
  agents: { agents: Array<{ role: string; health: string | null; lastRunAt: string | null }>; errors24h: number; fallbacks24h: number; lastRunAt: string | null };
  digest: { day: string | null; ageHours: number | null; stale: boolean };
  deploys: Array<{ state: string; createdAt: number; sha: string; message: string; url: string }> | null;
  fetchedAt: string;
};

const GROUP_LABEL: Record<string, string> = {
  core: 'Core', copilot: 'Copilot', growth: 'Growth', outbound: 'Outbound', ops: 'Ops',
};

export function SystemTab() {
  const [data, setData] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch('/api/studio/system');
      const json = await res.json();
      if (json.ok) setData(json as Snapshot);
      else setErr(json.error || 'failed');
    } catch {
      setErr('network error');
    }
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  if (loading && !data) return <div className="st-card"><div className="st-empty">Loading system status…</div></div>;
  if (err) return <div className="st-card"><div className="st-empty">Couldn&apos;t load system status: {err}</div></div>;
  if (!data) return null;

  const groups = Array.from(new Set(data.env.map((e) => e.group)));
  const setCount = data.env.filter((e) => e.set).length;

  return (
    <div>
      <div className="st-kpi-head">
        <h3 className="st-h3" style={{ margin: 0 }}>System · {setCount}/{data.env.length} keys configured</h3>
        <button className="st-btn" onClick={() => void load()}>Refresh</button>
      </div>

      {/* Health row */}
      <div className="st-kpi-row" style={{ marginBottom: 8 }}>
        <Kpi label="Database" value={data.supabase.ok ? `OK · ${data.supabase.latencyMs}ms` : 'DOWN'} bad={!data.supabase.ok} />
        <Kpi label="Service role" value={data.supabase.serviceRole ? 'set' : 'MISSING'} bad={!data.supabase.serviceRole} />
        <Kpi label="Agent errors (24h)" value={data.agents.errors24h} bad={data.agents.errors24h > 0} />
        <Kpi label="Fallback runs (24h)" value={data.agents.fallbacks24h} bad={data.agents.fallbacks24h > 0} />
        <Kpi label="Last agent run" value={data.agents.lastRunAt ? `${data.agents.lastRunAt.slice(11, 16)} ${data.agents.lastRunAt.slice(5, 10)}` : '—'} />
        <Kpi label="Daily digest" value={data.digest.day ?? 'none'} bad={data.digest.stale} />
      </div>

      {/* Env checklist */}
      <h3 className="st-h3">Configuration</h3>
      {groups.map((g) => (
        <div key={g} className="st-card">
          <div className="st-card-hdr"><strong>{GROUP_LABEL[g] ?? g.toUpperCase()}</strong></div>
          <ul className="st-list">
            {data.env.filter((e) => e.group === g).map((e) => (
              <li key={e.name} className="st-list-item">
                <div className="st-item-body">
                  <div className="st-item-title">
                    <span className="st-mono">{e.name}</span>
                    <span className={`st-status ${e.set ? 'st-status-ok' : 'st-status-warn'}`}>{e.set ? 'set' : 'not set'}</span>
                  </div>
                  <div className="st-item-notes">{e.unlocks}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* Agent health */}
      <h3 className="st-h3">Agent health</h3>
      <div className="st-card">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {data.agents.agents.length === 0 ? (
            <div className="st-empty">No agent state yet.</div>
          ) : (
            data.agents.agents.map((a) => (
              <span key={a.role} className="st-tag" style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: a.health === 'ok' ? '#34D399' : a.health === 'degraded' ? '#FCD34D' : '#F87171' }} />
                {a.role.toUpperCase()}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Deploys */}
      <h3 className="st-h3">Recent deploys</h3>
      <div className="st-card">
        {data.deploys === null ? (
          <div className="st-item-notes">
            Set <span className="st-mono">VERCEL_TOKEN</span> (+ <span className="st-mono">VERCEL_PROJECT_ID</span>) to see deploys here, or{' '}
            <a href="https://vercel.com/patricorpglobal-6175s-projects/aiprosol" target="_blank" rel="noreferrer" style={{ color: '#C084FC' }}>open Vercel →</a>
          </div>
        ) : data.deploys.length === 0 ? (
          <div className="st-empty">No deploys returned.</div>
        ) : (
          <table className="st-table">
            <thead><tr><th>State</th><th>Commit</th><th>Message</th></tr></thead>
            <tbody>
              {data.deploys.map((d, i) => (
                <tr key={i}>
                  <td><span className={`st-status ${d.state === 'READY' ? 'st-status-ok' : d.state === 'ERROR' ? 'st-status-err' : 'st-status-warn'}`}>{d.state}</span></td>
                  <td className="st-mono">{d.sha}</td>
                  <td><a href={d.url} target="_blank" rel="noreferrer" style={{ color: '#C084FC', textDecoration: 'none' }}>{d.message || '(no message)'}</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Kpi({ label, value, bad }: { label: string; value: number | string; bad?: boolean }) {
  return (
    <div className="st-kpi">
      <div className="st-kpi-label">{label}</div>
      <div className="st-kpi-value" style={bad ? { color: '#F87171' } : undefined}>{value}</div>
    </div>
  );
}
