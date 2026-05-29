'use client';

import { useEffect, useState } from 'react';

// Catalog CMS — edit product/service price + copy. Save commits the JSON to
// main via GitHub → live in ~70s. Read-only if GITHUB_TOKEN isn't set.

type Product = { slug: string; name: string; price: number; available: boolean; category?: string; shortDescription?: string };
type Service = { slug: string; title: string; shortDescription?: string };
type Catalog = { githubConfigured: boolean; products: Product[]; services: Service[] };

export function CatalogTab() {
  const [data, setData] = useState<Catalog | null>(null);
  const [draft, setDraft] = useState<Record<string, Record<string, unknown>>>({});
  const [flash, setFlash] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/studio/content');
      const json = await res.json();
      if (json.ok) setData(json as Catalog);
    } catch { /* ignore */ }
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  function edit(slug: string, field: string, value: unknown) {
    setDraft((d) => ({ ...d, [slug]: { ...d[slug], [field]: value } }));
  }

  async function save(type: 'product' | 'service', slug: string) {
    const fields = draft[slug];
    if (!fields || Object.keys(fields).length === 0) { setFlash('Nothing changed for ' + slug); return; }
    if (!confirm(`Commit changes to "${slug}" and deploy? Goes live in ~70s.`)) return;
    setBusy(slug);
    try {
      const res = await fetch('/api/studio/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, slug, fields }),
      });
      const json = await res.json();
      if (json.ok) {
        setFlash(`✓ Committed ${slug} (${Object.keys(json.applied || {}).join(', ')}) — live in ~70s`);
        setDraft((d) => { const n = { ...d }; delete n[slug]; return n; });
      } else {
        setFlash(`× ${json.error || 'commit failed'}`);
      }
    } catch {
      setFlash('× network error');
    }
    setBusy(null);
    setTimeout(() => setFlash(null), 8000);
  }

  if (loading && !data) return <div className="st-card"><div className="st-empty">Loading catalog…</div></div>;
  if (!data) return null;

  return (
    <div>
      <div className="st-kpi-head">
        <h3 className="st-h3" style={{ margin: 0 }}>Catalog · {data.products.length} products · {data.services.length} services</h3>
        <button className="st-btn" onClick={() => void load()}>Reload</button>
      </div>

      {!data.githubConfigured && (
        <div className="st-card"><div className="st-item-notes">
          Read-only — set <span className="st-mono">GITHUB_TOKEN</span> (fine-grained PAT, Contents: read+write) in Vercel to edit. Edits commit to main and deploy automatically.
        </div></div>
      )}
      {flash && <div className="st-flash">{flash}</div>}

      <h3 className="st-h3">Products</h3>
      <div className="st-card">
        <ul className="st-list">
          {data.products.map((p) => {
            const d = draft[p.slug] || {};
            const dirty = Object.keys(d).length > 0;
            return (
              <li key={p.slug} className="st-list-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
                <div className="st-item-title">{p.name} <span className="st-tag">{p.slug}</span> {p.category && <span className="st-tag">{p.category}</span>}</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <label style={{ fontSize: 11, color: '#9CA3B5' }}>Price $
                    <input type="number" defaultValue={p.price} disabled={!data.githubConfigured}
                      onChange={(e) => edit(p.slug, 'price', Number(e.target.value))}
                      style={inputStyle(90)} />
                  </label>
                  <label style={{ fontSize: 11, color: '#9CA3B5', display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                    <input type="checkbox" defaultChecked={p.available} disabled={!data.githubConfigured}
                      onChange={(e) => edit(p.slug, 'available', e.target.checked)} />
                    available
                  </label>
                </div>
                <input type="text" defaultValue={p.shortDescription || ''} disabled={!data.githubConfigured}
                  placeholder="short description" onChange={(e) => edit(p.slug, 'shortDescription', e.target.value)}
                  style={inputStyle('100%')} />
                {dirty && (
                  <div><button className="st-btn st-btn-success" disabled={busy === p.slug} onClick={() => save('product', p.slug)}>
                    {busy === p.slug ? 'Committing…' : 'Save & deploy'}
                  </button></div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <h3 className="st-h3">Services</h3>
      <div className="st-card">
        <ul className="st-list">
          {data.services.map((s) => {
            const d = draft[s.slug] || {};
            const dirty = Object.keys(d).length > 0;
            return (
              <li key={s.slug} className="st-list-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
                <div className="st-item-title">{s.title} <span className="st-tag">{s.slug}</span></div>
                <input type="text" defaultValue={s.shortDescription || ''} disabled={!data.githubConfigured}
                  placeholder="short description" onChange={(e) => edit(s.slug, 'shortDescription', e.target.value)}
                  style={inputStyle('100%')} />
                {dirty && (
                  <div><button className="st-btn st-btn-success" disabled={busy === s.slug} onClick={() => save('service', s.slug)}>
                    {busy === s.slug ? 'Committing…' : 'Save & deploy'}
                  </button></div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function inputStyle(width: number | string): React.CSSProperties {
  return {
    width, padding: '6px 10px', background: 'rgba(10,6,19,0.6)', border: '1px solid rgba(148,163,184,0.2)',
    borderRadius: 6, color: '#E5E7EB', fontFamily: 'inherit', fontSize: 13, marginLeft: 6,
  };
}
