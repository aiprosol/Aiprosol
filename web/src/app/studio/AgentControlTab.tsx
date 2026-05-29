'use client';

import { useEffect, useState } from 'react';

// C-Suite control — enable/disable each agent and override its persona prompt.
// A disabled agent no-ops on the next run; an override replaces the persona
// (the runner re-appends the strict JSON OUTPUT FORMAT automatically).

type AgentCfg = { role: string; title: string; domain: string; cadenceHrs: number; enabled: boolean; override: string | null };

export function AgentControlTab() {
  const [agents, setAgents] = useState<AgentCfg[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [flash, setFlash] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/studio/agents/config');
      const json = await res.json();
      if (json.ok) setAgents(json.agents as AgentCfg[]);
    } catch { /* ignore */ }
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  async function post(role: string, payload: Record<string, unknown>) {
    setBusy(role);
    try {
      const res = await fetch('/api/studio/agents/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, ...payload }),
      });
      const json = await res.json();
      setFlash(json.ok ? `✓ ${role.toUpperCase()} updated` : `× ${json.error || 'failed'}`);
      if (json.ok) await load();
    } catch {
      setFlash('× network error');
    }
    setBusy(null);
    setTimeout(() => setFlash(null), 5000);
  }

  if (loading && agents.length === 0) return <div className="st-card"><div className="st-empty">Loading agent control…</div></div>;

  return (
    <div>
      <div className="st-kpi-head">
        <h3 className="st-h3" style={{ margin: 0 }}>Agent control · {agents.filter((a) => a.enabled).length}/{agents.length} enabled</h3>
        <button className="st-btn" onClick={() => void load()}>Reload</button>
      </div>
      <div className="st-card"><div className="st-item-notes">
        Disable to skip an agent on the next run. A prompt override replaces its persona — the JSON output format is enforced automatically, so an override can&apos;t break parsing. Cadence is fixed daily on the current plan.
      </div></div>
      {flash && <div className="st-flash">{flash}</div>}

      <div className="st-card">
        <ul className="st-list">
          {agents.map((a) => {
            const draftVal = drafts[a.role] ?? (a.override ?? '');
            return (
              <li key={a.role} className="st-list-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div className="st-item-body">
                    <div className="st-item-title">
                      {a.role.toUpperCase()} <span className="st-tag">{a.title}</span>
                      {a.override && <span className="st-tag" style={{ background: 'rgba(139,92,246,0.18)', color: '#C084FC' }}>custom prompt</span>}
                      <span className={`st-status ${a.enabled ? 'st-status-ok' : 'st-status-err'}`}>{a.enabled ? 'enabled' : 'disabled'}</span>
                    </div>
                    <div className="st-item-notes">{a.domain}</div>
                  </div>
                  <div className="st-actions" style={{ flexShrink: 0 }}>
                    <button className="st-btn" disabled={busy === a.role} onClick={() => post(a.role, { enabled: !a.enabled })}>
                      {a.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button className="st-btn" onClick={() => setOpen(open === a.role ? null : a.role)}>
                      {open === a.role ? 'Close' : 'Edit prompt'}
                    </button>
                  </div>
                </div>
                {open === a.role && (
                  <div style={{ paddingTop: 6, borderTop: '1px dashed rgba(148,163,184,0.2)' }}>
                    <textarea
                      rows={8}
                      value={draftVal}
                      placeholder="Leave blank to use the built-in persona. Write a replacement persona/instructions here — the JSON output format is appended automatically."
                      onChange={(e) => setDrafts((d) => ({ ...d, [a.role]: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px', background: 'rgba(10,6,19,0.6)', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 6, color: '#E5E7EB', fontFamily: 'ui-monospace, monospace', fontSize: 12, lineHeight: 1.5, resize: 'vertical' }}
                    />
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button className="st-btn st-btn-success" disabled={busy === a.role} onClick={() => post(a.role, { system_prompt_override: draftVal.trim() || null })}>
                        {busy === a.role ? 'Saving…' : 'Save override'}
                      </button>
                      {a.override && (
                        <button className="st-btn st-btn-warn" disabled={busy === a.role} onClick={() => { setDrafts((d) => ({ ...d, [a.role]: '' })); post(a.role, { system_prompt_override: null }); }}>
                          Reset to default
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
