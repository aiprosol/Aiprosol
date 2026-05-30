'use client';

// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · PRODUCT COMPARE · /products/compare?a=slug-1&b=slug-2
// Side-by-side feature matrix for two products. Reuses Tier-1 fields:
// outcomeMetrics, bestFor, whatsInside, faqs, includedInBundles.
// Both `a` and `b` params are optional — empty slots get a product picker.
// ─────────────────────────────────────────────────────────────────────────

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { getProductBySlug, getProducts } from '@/lib/content';
import type { Product } from '@/types';

function CompareImpl() {
  const params = useSearchParams();
  const router = useRouter();
  const aSlug = params?.get('a') || '';
  const bSlug = params?.get('b') || '';

  const a = aSlug ? getProductBySlug(aSlug) : undefined;
  const b = bSlug ? getProductBySlug(bSlug) : undefined;

  const all = useMemo(() => getProducts(), []);

  const setSlot = (slot: 'a' | 'b') => (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = new URLSearchParams(params?.toString() || '');
    if (e.target.value) next.set(slot, e.target.value);
    else next.delete(slot);
    router.push(`/products/compare?${next.toString()}`);
  };

  const onSwap = () => {
    if (!aSlug && !bSlug) return;
    const next = new URLSearchParams();
    if (bSlug) next.set('a', bSlug);
    if (aSlug) next.set('b', aSlug);
    router.push(`/products/compare?${next.toString()}`);
  };

  return (
    <>
      <div className="cmp-pickers">
        <Picker label="Product A" value={aSlug} onChange={setSlot('a')} products={all} disable={bSlug} />
        <button className="cmp-swap" onClick={onSwap} disabled={!aSlug && !bSlug} aria-label="Swap A and B">⇄</button>
        <Picker label="Product B" value={bSlug} onChange={setSlot('b')} products={all} disable={aSlug} />
      </div>

      {(a || b) ? (
        <ComparisonTable a={a} b={b} />
      ) : (
        <div className="cmp-empty">
          <p>Pick a product in each slot above to start.</p>
          <Link href="/digital-products" className="cmp-btn">Browse all 19 products →</Link>
        </div>
      )}
    </>
  );
}

function Picker({
  label, value, onChange, products, disable,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  products: Product[];
  disable: string;
}) {
  return (
    <div className="cmp-picker">
      <label className="cmp-picker-label">{label}</label>
      <select className="cmp-picker-select" value={value} onChange={onChange}>
        <option value="">— Pick a product —</option>
        {products.map(p => (
          <option key={p.slug} value={p.slug} disabled={p.slug === disable}>
            {p.name} · ${p.price}
          </option>
        ))}
      </select>
    </div>
  );
}

function ComparisonTable({ a, b }: { a?: Product; b?: Product }) {
  const ROWS: { label: string; render: (p?: Product) => React.ReactNode }[] = [
    {
      label: 'Price',
      render: (p) => p ? <strong className="cmp-cell-price">${p.price}</strong> : <span className="cmp-cell-empty">—</span>,
    },
    {
      label: 'Category',
      render: (p) => p?.category ?? '—',
    },
    {
      label: 'Tagline',
      render: (p) => p?.shortDescription ?? '—',
    },
    {
      label: 'Best for',
      render: (p) => p?.bestFor && p.bestFor.length ? (
        <div className="cmp-chips">{p.bestFor.map((b) => <span key={b} className="cmp-chip">{b}</span>)}</div>
      ) : <span className="cmp-cell-empty">—</span>,
    },
    {
      label: 'Outcome metrics',
      render: (p) => p?.outcomeMetrics && p.outcomeMetrics.length ? (
        <ul className="cmp-metrics">
          {p.outcomeMetrics.map((m, i) => (
            <li key={i}><strong>{m.value}</strong> · <span>{m.label}</span></li>
          ))}
        </ul>
      ) : <span className="cmp-cell-empty">—</span>,
    },
    {
      label: "What's inside",
      render: (p) => p?.whatsInside && p.whatsInside.length ? (
        <ul className="cmp-bullets">
          {p.whatsInside.slice(0, 6).map((bullet, i) => <li key={i}>{bullet}</li>)}
          {p.whatsInside.length > 6 && <li className="cmp-more">+{p.whatsInside.length - 6} more</li>}
        </ul>
      ) : <span className="cmp-cell-empty">—</span>,
    },
    {
      label: 'Bundled in',
      render: (p) => p?.includedInBundles && p.includedInBundles.length ? (
        <ul className="cmp-bundles">
          {p.includedInBundles.map((bundle) => (
            <li key={bundle.bundleSlug}>
              <Link href={`/products/${bundle.bundleSlug}`}>{bundle.bundleName}</Link>
              <span> · save ${bundle.bundleSavings.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      ) : <span className="cmp-cell-empty">—</span>,
    },
    {
      label: 'Availability',
      render: (p) => p ? (p.available ? <span className="cmp-avail-yes">⤓ Instant download</span> : <span className="cmp-avail-pre">Coming soon · {p.expectedShipDate || 'soon'}</span>) : '—',
    },
  ];

  return (
    <div className="cmp-table-wrap">
      <table className="cmp-table">
        <thead>
          <tr>
            <th className="cmp-th-label" aria-hidden="true"></th>
            <th>{a ? <Link href={`/products/${a.slug}`} className="cmp-th-product">{a.name}</Link> : <span className="cmp-th-empty">Slot A empty</span>}</th>
            <th>{b ? <Link href={`/products/${b.slug}`} className="cmp-th-product">{b.name}</Link> : <span className="cmp-th-empty">Slot B empty</span>}</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.label}>
              <td className="cmp-td-label">{row.label}</td>
              <td className="cmp-td-cell">{row.render(a)}</td>
              <td className="cmp-td-cell">{row.render(b)}</td>
            </tr>
          ))}
          <tr>
            <td className="cmp-td-label">&nbsp;</td>
            <td className="cmp-td-cell">
              {a && <Link className="cmp-buy" href={`/products/${a.slug}`}>View {a.name} →</Link>}
            </td>
            <td className="cmp-td-cell">
              {b && <Link className="cmp-buy" href={`/products/${b.slug}`}>View {b.name} →</Link>}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      .cmp-page { background: #0A0613; color: #E5E7EB; min-height: 100vh; padding: 140px 24px 80px; font-family: 'Inter', system-ui, sans-serif; }
      @media (max-width: 640px) { .cmp-page { padding: 120px 16px 60px; } }
      .cmp-crumb { max-width: 1080px; margin: 0 auto 24px; font-size: 13px; color: #9CA3B5; }
      .cmp-crumb a { color: #8B5CF6; }

      .cmp-header { max-width: 720px; margin: 0 auto 36px; text-align: center; }
      .cmp-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.25); border-radius: 999px; color: #8B5CF6; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 14px; }
      .cmp-h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(28px, 4vw, 42px); line-height: 1.1; margin-bottom: 14px; }
      .cmp-sub { color: #9CA3B5; font-size: 16px; line-height: 1.6; }

      .cmp-pickers { max-width: 1080px; margin: 0 auto 32px; display: flex; align-items: end; gap: 12px; }
      @media (max-width: 760px) { .cmp-pickers { flex-direction: column; align-items: stretch; } }
      .cmp-picker { flex: 1; display: flex; flex-direction: column; gap: 6px; }
      .cmp-picker-label { font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; color: #8B5CF6; letter-spacing: 0.1em; text-transform: uppercase; }
      .cmp-picker-select { padding: 12px 14px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 10px; color: #E5E7EB; font-size: 14px; font-family: 'Inter', system-ui, sans-serif; cursor: pointer; outline: none; }
      .cmp-picker-select:focus { border-color: #8B5CF6; }
      .cmp-swap { padding: 12px 14px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 10px; color: #C084FC; font-size: 18px; cursor: pointer; height: fit-content; align-self: end; transition: all 0.2s; }
      .cmp-swap:hover:not(:disabled) { border-color: #C084FC; color: #fff; }
      .cmp-swap:disabled { opacity: 0.3; cursor: not-allowed; }

      .cmp-empty { max-width: 720px; margin: 80px auto; text-align: center; padding: 48px 24px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 16px; color: #9CA3B5; }
      .cmp-empty p { font-size: 15px; margin-bottom: 20px; }
      .cmp-btn { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; text-decoration: none; }

      .cmp-table-wrap { max-width: 1080px; margin: 0 auto; overflow-x: auto; }
      .cmp-table { width: 100%; border-collapse: separate; border-spacing: 0; background: #13101F; border: 1px solid #2A1F3D; border-radius: 16px; overflow: hidden; }
      .cmp-table th, .cmp-table td { padding: 18px 20px; vertical-align: top; border-top: 1px solid #2A1F3D; text-align: left; font-size: 14px; line-height: 1.5; }
      .cmp-table thead th { background: rgba(139,92,246,0.06); border-top: none; font-family: 'Space Grotesk', sans-serif; font-weight: 700; color: #E5E7EB; font-size: 15px; }
      .cmp-th-label { width: 160px; }
      .cmp-th-product { color: #E5E7EB; text-decoration: none; border-bottom: 1px solid rgba(139,92,246,0.4); }
      .cmp-th-product:hover { color: #C084FC; }
      .cmp-th-empty { color: #4a6280; font-weight: 400; }
      .cmp-td-label { font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; color: #8B5CF6; text-transform: uppercase; letter-spacing: 0.1em; vertical-align: top; }
      .cmp-td-cell { color: #CBD5E1; }
      .cmp-cell-empty { color: #4a6280; }
      .cmp-cell-price { font-family: 'Space Grotesk', sans-serif; font-size: 22px; background: linear-gradient(135deg, #8B5CF6, #C084FC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .cmp-chips { display: flex; flex-wrap: wrap; gap: 6px; }
      .cmp-chip { padding: 3px 10px; background: rgba(139,92,246,0.08); color: #C084FC; border: 1px solid rgba(139,92,246,0.25); border-radius: 999px; font-size: 11px; }
      .cmp-metrics, .cmp-bullets, .cmp-bundles { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
      .cmp-metrics li strong { color: #8B5CF6; font-family: 'Space Grotesk', sans-serif; }
      .cmp-bullets li { padding-left: 18px; position: relative; }
      .cmp-bullets li::before { content: '✓'; position: absolute; left: 0; color: #8B5CF6; font-weight: 700; }
      .cmp-bullets .cmp-more { color: #9CA3B5; font-size: 12px; padding-left: 0; }
      .cmp-bullets .cmp-more::before { content: ''; }
      .cmp-bundles li a { color: #C084FC; text-decoration: none; border-bottom: 1px solid rgba(192,132,252,0.3); }
      .cmp-bundles li span { color: #9CA3B5; font-size: 12px; }
      .cmp-avail-yes { display: inline-block; padding: 3px 10px; background: rgba(16,185,129,0.12); color: #10B981; border: 1px solid rgba(16,185,129,0.4); border-radius: 999px; font-size: 11px; font-weight: 600; }
      .cmp-avail-pre { display: inline-block; padding: 3px 10px; background: rgba(245,158,11,0.12); color: #F59E0B; border: 1px solid rgba(245,158,11,0.4); border-radius: 999px; font-size: 11px; font-weight: 600; }
      .cmp-buy { display: inline-block; padding: 10px 18px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 12px; text-decoration: none; box-shadow: 0 0 16px rgba(139,92,246,0.2); }
    `}</style>
  );
}

export default function CompareProductsPage() {
  // Static SSR shell — page header + ID/SEO are rendered without waiting for
  // useSearchParams hydration. The dynamic compare table lives inside the
  // Suspense boundary (Next 15 requires it for useSearchParams).
  return (
    <div className="cmp-page">
      <div className="cmp-crumb"><Link href="/digital-products">← All products</Link></div>
      <header className="cmp-header">
        <div className="cmp-eyebrow">Compare</div>
        <h1 className="cmp-h1">Side-by-side product comparison</h1>
        <p className="cmp-sub">Pick two products from the catalogue to see them next to each other. Pricing, deliverables, outcomes, FAQs.</p>
      </header>
      <Suspense fallback={<div className="cmp-empty">Loading the catalogue…</div>}>
        <CompareImpl />
      </Suspense>
      <Styles />
    </div>
  );
}
