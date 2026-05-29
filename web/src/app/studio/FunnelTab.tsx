'use client';

import { useEffect, useState } from 'react';

type Stage = { event: string; label: string; count: number };
type Funnel =
  | { configured: false }
  | { configured: true; windowDays: number; stages: Stage[]; topPages: Array<{ path: string; views: number }>; fetchedAt: string };

export function FunnelTab() {
  const [data, setData] = useState<Funnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [err, setErr] = useState<string | null>(null);

  async function load(d: number) {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/studio/funnel?days=${d}`);
      const json = await res.json();
      if (json.ok) setData(json as Funnel);
      else setErr(json.error || 'failed');
    } catch {
      setErr('network error');
    }
    setLoading(false);
  }
  useEffect(() => { void load(days); }, [days]);

  if (loading && !data) return <div className="st-card"><div className="st-empty">Loading funnel…</div></div>;
  if (err) return <div className="st-card"><div className="st-empty">Couldn&apos;t load funnel: {err}</div></div>;
  if (!data) return null;

  if (!data.configured) {
    return (
      <div className="st-card">
        <div className="st-item-notes">
          Funnel analytics needs PostHog read access. Set <span className="st-mono">POSTHOG_API_KEY</span> (a personal API key) and{' '}
          <span className="st-mono">POSTHOG_PROJECT_ID</span> in Vercel. Events are already being tracked client-side — this just reads them back.
        </div>
      </div>
    );
  }

  const top = data.stages[0]?.count || 0;

  return (
    <div>
      <div className="st-kpi-head">
        <h3 className="st-h3" style={{ margin: 0 }}>Conversion funnel · last {data.windowDays} days</h3>
        <div style={{ display: 'flex', gap: 6 }}>
          {[7, 30, 90].map((d) => (
            <button key={d} className={`st-btn ${days === d ? 'st-btn-primary' : ''}`} onClick={() => setDays(d)}>{d}d</button>
          ))}
        </div>
      </div>

      <div className="st-card">
        {data.stages.map((s, i) => {
          const pctOfTop = top > 0 ? Math.round((s.count / top) * 100) : 0;
          const prev = i > 0 ? data.stages[i - 1].count : null;
          const stepPct = prev && prev > 0 ? Math.round((s.count / prev) * 100) : null;
          return (
            <div key={s.event} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span><strong>{s.label}</strong> {stepPct !== null && <span style={{ color: '#9CA3B5' }}>· {stepPct}% from prev</span>}</span>
                <span className="st-mono">{s.count.toLocaleString()} · {pctOfTop}%</span>
              </div>
              <div style={{ height: 22, background: 'rgba(148,163,184,0.1)', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ width: `${Math.max(pctOfTop, 1)}%`, height: '100%', background: 'linear-gradient(90deg,#7C3AED,#8B5CF6)', borderRadius: 6 }} />
              </div>
            </div>
          );
        })}
        <div className="st-item-notes" style={{ marginTop: 8 }}>
          Purchase completion happens server-side (Stripe) — see the Revenue tab. This funnel ends at checkout intent.
        </div>
      </div>

      <h3 className="st-h3">Top pages</h3>
      <div className="st-card">
        {data.topPages.length === 0 ? (
          <div className="st-empty">No pageviews in window.</div>
        ) : (
          <table className="st-table">
            <thead><tr><th>Path</th><th>Views</th></tr></thead>
            <tbody>
              {data.topPages.map((p, i) => (
                <tr key={i}><td className="st-mono">{p.path}</td><td>{p.views.toLocaleString()}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
