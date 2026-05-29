'use client';

import { useEffect, useState } from 'react';

// Decision Inbox — the operator's action queue. Same list that goes out in the
// daily email; here you act in-app. Approve/Reject POST the signed token to
// /api/decide (which executes), then we refresh.

type Decision = {
  kind: string; id: string; title: string; summary: string;
  action: string | null; approveToken?: string; rejectToken?: string; approveLabel?: string; rejectLabel?: string;
};

export function InboxTab({ refresh }: { refresh: () => void }) {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/studio/decisions');
      const json = await res.json();
      if (json.ok) setDecisions(json.decisions as Decision[]);
    } catch { /* ignore */ }
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  async function decide(d: Decision, token: string | undefined, label: string) {
    if (!token) return;
    setBusy(d.id + label);
    try {
      const res = await fetch('/api/decide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `token=${encodeURIComponent(token)}`,
      });
      if (res.ok) {
        setFlash(`✓ ${label}: ${d.title.slice(0, 50)}`);
        setDecisions((list) => list.filter((x) => x.id !== d.id));
        refresh();
      } else {
        setFlash(`× ${label} failed`);
      }
    } catch {
      setFlash('× network error');
    }
    setBusy(null);
    setTimeout(() => setFlash(null), 5000);
  }

  if (loading && decisions.length === 0) return <div className="st-card"><div className="st-empty">Loading your inbox…</div></div>;

  return (
    <div>
      <div className="st-kpi-head">
        <h3 className="st-h3" style={{ margin: 0 }}>Decision inbox · {decisions.length} need{decisions.length === 1 ? 's' : ''} you</h3>
        <button className="st-btn" onClick={() => void load()}>Refresh</button>
      </div>
      {flash && <div className="st-flash">{flash}</div>}

      {decisions.length === 0 ? (
        <div className="st-card"><div className="st-empty">Nothing needs you right now — the company is running itself. ✦</div></div>
      ) : (
        <div className="st-card">
          <ul className="st-list">
            {decisions.map((d) => (
              <li key={`${d.kind}-${d.id}`} className="st-list-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
                <div className="st-item-body">
                  <div className="st-item-title">{d.title} <span className="st-tag">{d.kind}</span></div>
                  <div className="st-item-notes">{d.summary}</div>
                </div>
                {d.action ? (
                  <div className="st-actions">
                    <button className="st-btn st-btn-success" disabled={busy === d.id + (d.approveLabel || 'Approve')} onClick={() => decide(d, d.approveToken, d.approveLabel || 'Approve')}>
                      {d.approveLabel || 'Approve'}
                    </button>
                    <button className="st-btn st-btn-warn" disabled={busy === d.id + (d.rejectLabel || 'Reject')} onClick={() => decide(d, d.rejectToken, d.rejectLabel || 'Reject')}>
                      {d.rejectLabel || 'Reject'}
                    </button>
                  </div>
                ) : (
                  <div className="st-item-notes" style={{ fontStyle: 'italic' }}>Review this in its tab — judgment call, no one-tap.</div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
