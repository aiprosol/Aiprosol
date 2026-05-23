'use client';

import { useEffect, useState } from 'react';

interface Lead {
  leadId?: string;
  email?: string;
  fullName?: string;
  companyName?: string;
  industry?: string;
  monthlyRevenue?: string;
  source?: string;
  tier?: string;
  leadScore?: number;
  recommendedPlan?: string;
  annualSavingProjection?: number;
  capturedAt?: string;
}

interface Subscriber {
  email?: string;
  source?: string;
  subscribedAt?: string;
}

interface ApiResponse {
  leads: Lead[];
  subscribers: Subscriber[];
  counts?: { leads: number; subscribers: number };
  notice?: string;
  configured?: boolean;
  error?: string;
}

export function AdminLeadsTable() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState<'leads' | 'subscribers'>('leads');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/leads', { cache: 'no-store' })
      .then(r => r.json())
      .then((j: ApiResponse) => { if (!cancelled) setData(j); })
      .catch(e => { if (!cancelled) setErr(e instanceof Error ? e.message : 'load failed'); });
    return () => { cancelled = true; };
  }, []);

  if (err) {
    return <div className="alt-error">Couldn&apos;t load leads: {err}</div>;
  }
  if (!data) {
    return <div className="alt-loading">Loading…</div>;
  }

  if (data.notice && !data.configured) {
    return (
      <div className="alt-notice">
        <strong>Vercel KV not configured.</strong>
        <p>{data.notice}</p>
        <p className="alt-notice-hint">
          Once KV is connected, this page will show every lead captured by{' '}
          <code>/api/capture-lead</code> and every subscriber from{' '}
          <code>/api/newsletter/subscribe</code>. Until then, leads still log
          to Vercel function logs and fire Zapier webhooks (when set).
        </p>
        <Styles />
      </div>
    );
  }

  return (
    <div>
      <div className="alt-tabs">
        <button
          className={`alt-tab ${tab === 'leads' ? 'is-active' : ''}`}
          onClick={() => setTab('leads')}
        >
          Leads <span className="alt-tab-count">{data.counts?.leads ?? data.leads.length}</span>
        </button>
        <button
          className={`alt-tab ${tab === 'subscribers' ? 'is-active' : ''}`}
          onClick={() => setTab('subscribers')}
        >
          Newsletter <span className="alt-tab-count">{data.counts?.subscribers ?? data.subscribers.length}</span>
        </button>
      </div>

      {tab === 'leads' ? <LeadsTable leads={data.leads} /> : <SubsTable subs={data.subscribers} />}

      <Styles />
    </div>
  );
}

function LeadsTable({ leads }: { leads: Lead[] }) {
  if (leads.length === 0) {
    return <div className="alt-empty">No leads captured yet. Once the cold outreach goes out, they&apos;ll land here.</div>;
  }
  return (
    <div className="alt-table-wrap">
      <table className="alt-table">
        <thead>
          <tr>
            <th>When</th>
            <th>Email</th>
            <th>Name</th>
            <th>Company</th>
            <th>Source</th>
            <th>Tier</th>
            <th>Score</th>
            <th>Projection</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((l, i) => (
            <tr key={l.leadId || i}>
              <td className="alt-time">{l.capturedAt ? new Date(l.capturedAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }) : '—'}</td>
              <td>{l.email ? <a href={`mailto:${l.email}`}>{l.email}</a> : '—'}</td>
              <td>{l.fullName || '—'}</td>
              <td>{l.companyName || '—'}</td>
              <td><span className="alt-pill">{l.source || 'Unknown'}</span></td>
              <td>{l.tier ? <span className={`alt-tier alt-tier-${l.tier.toLowerCase()}`}>{l.tier}</span> : '—'}</td>
              <td className="alt-score">{l.leadScore ?? '—'}</td>
              <td className="alt-num">{typeof l.annualSavingProjection === 'number' ? `$${l.annualSavingProjection.toLocaleString()}` : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SubsTable({ subs }: { subs: Subscriber[] }) {
  if (subs.length === 0) {
    return <div className="alt-empty">No newsletter subscribers yet.</div>;
  }
  return (
    <div className="alt-table-wrap">
      <table className="alt-table">
        <thead>
          <tr>
            <th>When</th>
            <th>Email</th>
            <th>Source</th>
          </tr>
        </thead>
        <tbody>
          {subs.map((s, i) => (
            <tr key={s.email || i}>
              <td className="alt-time">{s.subscribedAt ? new Date(s.subscribedAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }) : '—'}</td>
              <td>{s.email ? <a href={`mailto:${s.email}`}>{s.email}</a> : '—'}</td>
              <td><span className="alt-pill">{s.source || 'Footer'}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      .alt-tabs { display: flex; gap: 6px; margin-bottom: 16px; }
      .alt-tab { padding: 9px 16px; background: #13101F; color: #9CA3B5; border: 1px solid #2A1F3D; border-radius: 999px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 12px; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px; }
      .alt-tab:hover { color: #E5E7EB; border-color: #8B5CF6; }
      .alt-tab.is-active { background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border-color: transparent; }
      .alt-tab-count { display: inline-flex; min-width: 18px; height: 18px; padding: 0 6px; background: rgba(0,0,0,0.2); border-radius: 999px; font-size: 10px; font-weight: 700; align-items: center; justify-content: center; }
      .alt-tab.is-active .alt-tab-count { background: rgba(10, 22, 40, 0.2); }
      .alt-loading, .alt-empty, .alt-error, .alt-notice { padding: 24px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 14px; color: #C7CEDB; font-size: 14px; }
      .alt-error { border-color: #EF4444; color: #FCA5A5; }
      .alt-notice strong { display: block; font-family: 'Space Grotesk', sans-serif; color: #F59E0B; margin-bottom: 8px; }
      .alt-notice p { margin: 6px 0; color: #C7CEDB; }
      .alt-notice-hint { font-size: 12px; color: #9CA3B5; }
      .alt-notice code { background: #0A0613; padding: 2px 6px; border-radius: 4px; font-size: 12px; color: #C084FC; }
      .alt-table-wrap { background: #13101F; border: 1px solid #2A1F3D; border-radius: 14px; overflow: hidden; overflow-x: auto; }
      .alt-table { width: 100%; border-collapse: collapse; font-size: 13px; }
      .alt-table th { text-align: left; padding: 14px 16px; background: rgba(139, 92, 246, 0.06); font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #9CA3B5; border-bottom: 1px solid #2A1F3D; }
      .alt-table td { padding: 12px 16px; border-bottom: 1px solid rgba(42, 31, 61, 0.5); color: #E5E7EB; vertical-align: top; }
      .alt-table tr:last-child td { border-bottom: none; }
      .alt-table tr:hover td { background: rgba(139, 92, 246, 0.03); }
      .alt-time { color: #9CA3B5; white-space: nowrap; font-size: 12px; }
      .alt-pill { display: inline-block; padding: 2px 8px; background: rgba(139, 92, 246, 0.08); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 999px; font-size: 11px; color: #C084FC; }
      .alt-tier { display: inline-block; padding: 2px 8px; border-radius: 999px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 10px; letter-spacing: 0.05em; text-transform: uppercase; }
      .alt-tier-digital { background: rgba(156, 163, 181, 0.12); color: #C7CEDB; border: 1px solid rgba(156, 163, 181, 0.25); }
      .alt-tier-plan { background: rgba(139, 92, 246, 0.12); color: #C084FC; border: 1px solid rgba(139, 92, 246, 0.35); }
      .alt-tier-enterprise { background: rgba(16, 185, 129, 0.12); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.35); }
      .alt-score { font-family: 'Space Grotesk', sans-serif; font-weight: 700; color: #C084FC; }
      .alt-num { font-family: 'Space Grotesk', sans-serif; font-weight: 700; color: #C7CEDB; }
      .alt-table a { color: #8B5CF6; text-decoration: none; }
      .alt-table a:hover { color: #C084FC; }
    `}</style>
  );
}
