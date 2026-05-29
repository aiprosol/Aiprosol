'use client';

import { useEffect, useState } from 'react';

type Order = { slug: string; kind: string; amount: number; email: string | null; created: number };
type Revenue =
  | { configured: false }
  | {
      configured: true; currency: string; today: number; mtd: number; windowTotal: number; orderCount: number;
      mrr: number; activeSubs: number; byProduct: Array<{ slug: string; amount: number; count: number }>;
      recentOrders: Order[]; fetchedAt: string;
    };

export function RevenueTab() {
  const [data, setData] = useState<Revenue | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true); setErr(null);
    try {
      const res = await fetch('/api/studio/revenue');
      const json = await res.json();
      if (json.ok) setData(json as Revenue); else setErr(json.error || 'failed');
    } catch { setErr('network error'); }
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  if (loading && !data) return <div className="st-card"><div className="st-empty">Loading revenue…</div></div>;
  if (err) return <div className="st-card"><div className="st-empty">Couldn&apos;t load revenue: {err}</div></div>;
  if (!data) return null;

  if (!data.configured) {
    return (
      <div className="st-card">
        <div className="st-item-notes">
          Revenue needs Stripe. Set <span className="st-mono">STRIPE_SECRET_KEY</span> in Vercel (the same key that powers checkout).
          Revenue is read live from Stripe — no extra storage.
        </div>
      </div>
    );
  }

  const money = (n: number) => `${data.currency} ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div>
      <div className="st-kpi-head">
        <h3 className="st-h3" style={{ margin: 0 }}>Revenue</h3>
        <button className="st-btn" onClick={() => void load()}>Refresh</button>
      </div>

      <div className="st-kpi-row">
        <Kpi label="Today" value={money(data.today)} />
        <Kpi label="Month to date" value={money(data.mtd)} />
        <Kpi label="MRR (active subs)" value={money(data.mrr)} />
        <Kpi label="Active subscriptions" value={data.activeSubs} />
        <Kpi label="Recent orders" value={data.orderCount} />
      </div>

      {data.orderCount === 0 && (
        <div className="st-card"><div className="st-item-notes">No paid orders yet. When sales land, they show here live from Stripe.</div></div>
      )}

      {data.byProduct.length > 0 && (
        <>
          <h3 className="st-h3">By product (recent)</h3>
          <div className="st-card">
            <table className="st-table">
              <thead><tr><th>Product</th><th>Orders</th><th>Revenue</th></tr></thead>
              <tbody>
                {data.byProduct.map((p) => (
                  <tr key={p.slug}><td>{p.slug}</td><td>{p.count}</td><td>{money(p.amount)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {data.recentOrders.length > 0 && (
        <>
          <h3 className="st-h3">Recent orders</h3>
          <div className="st-card">
            <table className="st-table">
              <thead><tr><th>When (UTC)</th><th>Product</th><th>Kind</th><th>Email</th><th>Amount</th></tr></thead>
              <tbody>
                {data.recentOrders.map((o, i) => (
                  <tr key={i}>
                    <td className="st-mono">{new Date(o.created * 1000).toISOString().slice(0, 16).replace('T', ' ')}</td>
                    <td>{o.slug}</td>
                    <td>{o.kind}</td>
                    <td>{o.email || '—'}</td>
                    <td>{money(o.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="st-kpi">
      <div className="st-kpi-label">{label}</div>
      <div className="st-kpi-value">{value}</div>
    </div>
  );
}
