'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { getProducts } from '@/lib/content';
import type { Product } from '@/types';

// Chip groups — 5 meaningful buckets instead of 12 single-item chips.
// Single-item filters are noise; grouping by intent ("what am I shopping for?")
// is faster for the visitor. Each chip resolves to one or more raw categories
// from the products.json data.
const CHIP_GROUPS: Array<{ label: string; categories: string[] | null }> = [
  { label: 'All',       categories: null }, // null = no filter
  { label: 'Bundles',   categories: ['Bundle'] },
  { label: 'Playbooks', categories: ['Sales', 'Guides'] },
  { label: 'Templates', categories: ['Templates', 'Checklists'] },
  { label: 'Toolkits',  categories: ['Toolkits', 'AI Tools'] },
  { label: 'Premium',   categories: ['Masterclass', 'Enterprise', 'Agency', 'Challenge'] },
];

type SortKey = 'default' | 'price-asc' | 'price-desc' | 'name-asc';

// Industries that have dedicated /industries/[slug] pages — used to power
// the secondary industry filter using each product's new `bestFor` field.
const INDUSTRY_FILTERS = [
  'All industries',
  'Legal',
  'Real Estate',
  'Financial Services',
  'SaaS',
  'Professional Services',
  'E-commerce',
] as const;

export default function DigitalProductsPage() {
  const allProducts = getProducts();
  const [activeCat, setActiveCat] = useState<string>('All');
  const [activeIndustry, setActiveIndustry] = useState<string>('All industries');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('default');

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: allProducts.length };
    for (const group of CHIP_GROUPS) {
      if (!group.categories) continue;
      map[group.label] = allProducts.filter(p => group.categories!.includes(p.category)).length;
    }
    return map;
  }, [allProducts]);

  const filtered = useMemo(() => {
    let out: Product[] = allProducts;
    const activeGroup = CHIP_GROUPS.find(g => g.label === activeCat);
    if (activeGroup?.categories) {
      out = out.filter(p => activeGroup.categories!.includes(p.category));
    }
    if (activeIndustry !== 'All industries') {
      // Tier-1 `bestFor` array carries product → industry mapping.
      // A product without bestFor (older entries) survives — we don't penalise unenriched products.
      out = out.filter(p => {
        if (!p.bestFor || p.bestFor.length === 0) return true;
        return p.bestFor.includes(activeIndustry);
      });
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      out = out.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.shortDescription || '').toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.bestFor || []).some(b => b.toLowerCase().includes(q)) ||
        (p.outcomeMetrics || []).some(m => m.label.toLowerCase().includes(q)),
      );
    }
    if (sort === 'price-asc') out = [...out].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    else if (sort === 'price-desc') out = [...out].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    else if (sort === 'name-asc') out = [...out].sort((a, b) => a.name.localeCompare(b.name));
    return out;
  }, [allProducts, activeCat, activeIndustry, search, sort]);

  return (
    <div className="dp-page">
      <header className="dp-hero">
        <div className="dp-eyebrow">19 Digital Products · $17 – $997</div>
        <h1 className="dp-h1">
          Self-serve toolkits that <span className="dp-grad">pay for themselves</span>
        </h1>
        <p className="dp-sub">
          Instant download. Immediate value. Every product is engineered to deliver measurable
          ROI before you ever consider stepping up to a managed plan.
        </p>
        <div className="dp-hero-actions">
          <Link href="/products/compare" className="dp-hero-link">Compare two products side-by-side →</Link>
          <Link href="/roi-audit" className="dp-hero-link">Get an audit + personalised recommendation →</Link>
        </div>
      </header>

      <div className="dp-controls">
        {/* Search + sort first — most visitors look for a keyword before they
            browse by category, so it's a faster path to a result. */}
        <div className="dp-tools">
          <div className="dp-search">
            <span className="dp-search-icon">⌕</span>
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="dp-sort" value={activeIndustry} onChange={e => setActiveIndustry(e.target.value)} aria-label="Filter by industry">
            {INDUSTRY_FILTERS.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
          <select className="dp-sort" value={sort} onChange={e => setSort(e.target.value as SortKey)} aria-label="Sort products">
            <option value="default">Featured</option>
            <option value="price-asc">Price · low to high</option>
            <option value="price-desc">Price · high to low</option>
            <option value="name-asc">Name · A → Z</option>
          </select>
        </div>

        {/* Category chips below — 6 groups instead of 12 single-item filters. */}
        <div className="dp-tabs" role="tablist">
          {CHIP_GROUPS.map(group => {
            const n = counts[group.label] || 0;
            const disabled = group.label !== 'All' && n === 0;
            return (
              <button
                key={group.label}
                role="tab"
                aria-selected={activeCat === group.label}
                disabled={disabled}
                className={`dp-tab ${activeCat === group.label ? 'is-active' : ''} ${disabled ? 'is-empty' : ''}`}
                onClick={() => setActiveCat(group.label)}
              >
                {group.label}
                {n > 0 && <span className="dp-tab-count">{n}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="dp-state">
          <div className="dp-empty-icon">⌕</div>
          <h3>Nothing matches that filter.</h3>
          <p>Try clearing the search or picking another category.</p>
          <button className="dp-btn" onClick={() => { setActiveCat('All'); setActiveIndustry('All industries'); setSearch(''); }}>
            Show all 19 products
          </button>
        </div>
      ) : (
        <div className="dp-grid">
          {filtered.map(p => {
            const available = (p as { available?: boolean }).available;
            const expectedShip = (p as { expectedShipDate?: string | null }).expectedShipDate;
            return (
              <Link key={p.slug} href={`/products/${p.slug}`} className={`dp-card ${available ? 'dp-card-available' : 'dp-card-pending'}`}>
                <div className="dp-thumb">
                  <img
                    src={p.image ? p.image.replace(/\.png$/, '-thumb.png') : `/api/og/product/${p.slug}`}
                    alt={p.name}
                    loading="lazy"
                    width={640}
                    height={360}
                    className="dp-thumb-img"
                  />
                  {available && <span className="dp-badge dp-badge-available">⤓ Instant download</span>}
                  {!available && <span className="dp-badge dp-badge-pending">Coming soon · {expectedShip ?? 'soon'}</span>}
                </div>
                <span className="dp-cat">{p.category}</span>
                <h3 className="dp-name">{p.name}</h3>
                {p.shortDescription && <p className="dp-desc">{p.shortDescription}</p>}
                <div className="dp-row">
                  <div className="dp-price">${p.price}</div>
                  <span className="dp-buy">{available ? 'Buy now →' : 'Reserve →'}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <Styles />
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      .dp-page { background: #0A0613; color: #E5E7EB; min-height: 100vh; padding: 140px 24px 80px; font-family: 'Inter', system-ui, sans-serif; }
      @media (max-width: 640px) { .dp-page { padding: 120px 16px 60px; } }

      .dp-hero { max-width: 720px; margin: 0 auto 56px; text-align: center; }
      .dp-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(139, 92, 246,0.08); border: 1px solid rgba(139, 92, 246,0.25); border-radius: 999px; color: #8B5CF6; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; }
      .dp-h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(32px, 5vw, 48px); line-height: 1.1; margin-bottom: 16px; }
      .dp-grad { background: linear-gradient(135deg, #8B5CF6, #C084FC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .dp-sub { color: #9CA3B5; font-size: 17px; line-height: 1.6; margin-bottom: 18px; }
      .dp-hero-actions { display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; }
      .dp-hero-link { color: #C084FC; font-size: 13px; font-weight: 600; text-decoration: none; border-bottom: 1px solid rgba(192,132,252,0.3); transition: border-color 0.2s; }
      .dp-hero-link:hover { border-color: #C084FC; }

      .dp-controls { max-width: 1280px; margin: 0 auto 32px; display: flex; flex-direction: column; gap: 20px; }

      .dp-tabs { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
      .dp-tab { padding: 8px 16px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 999px; color: #9CA3B5; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; font-family: 'Inter', system-ui, sans-serif; display: inline-flex; align-items: center; gap: 8px; }
      .dp-tab:hover:not(:disabled) { color: #E5E7EB; border-color: #8B5CF6; }
      .dp-tab.is-active { background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border-color: transparent; font-weight: 700; box-shadow: 0 0 14px rgba(139, 92, 246, 0.25); }
      .dp-tab.is-empty { opacity: 0.4; cursor: not-allowed; }
      .dp-tab-count { display: inline-flex; min-width: 18px; height: 18px; padding: 0 6px; background: rgba(0,0,0,0.2); border-radius: 999px; font-size: 10px; font-weight: 700; align-items: center; justify-content: center; }
      .dp-tab.is-active .dp-tab-count { background: rgba(10, 22, 40, 0.2); }

      .dp-tools { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
      .dp-search { position: relative; flex: 1; max-width: 360px; }
      .dp-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #9CA3B5; font-size: 16px; pointer-events: none; }
      .dp-search input { width: 100%; padding: 12px 14px 12px 38px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 10px; color: #E5E7EB; font-size: 14px; font-family: 'Inter', system-ui, sans-serif; outline: none; transition: border 0.2s; }
      .dp-search input:focus { border-color: #8B5CF6; box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15); }
      .dp-search input::placeholder { color: #4a6280; }
      .dp-sort { padding: 12px 14px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 10px; color: #E5E7EB; font-size: 14px; font-family: 'Inter', system-ui, sans-serif; cursor: pointer; outline: none; }
      .dp-sort:focus { border-color: #8B5CF6; }

      .dp-grid { max-width: 1280px; margin: 0 auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
      @media (max-width: 1024px) { .dp-grid { grid-template-columns: repeat(2, 1fr); } }
      @media (max-width: 640px) { .dp-grid { grid-template-columns: 1fr; } }

      .dp-card { background: #13101F; border: 1px solid #2A1F3D; border-radius: 16px; padding: 24px; cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column; gap: 14px; position: relative; overflow: hidden; text-decoration: none; color: inherit; }
      .dp-card:hover { transform: translateY(-4px); border-color: #8B5CF6; box-shadow: 0 0 32px rgba(139, 92, 246, 0.25); }
      .dp-thumb { position: relative; width: 100%; aspect-ratio: 16/9; background: #0A0613; border: 1px solid #2A1F3D; border-radius: 10px; overflow: hidden; }
      .dp-thumb-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
      .dp-card:hover .dp-thumb-img { transform: scale(1.05); }
      .dp-cat { display: inline-block; padding: 3px 10px; background: rgba(139, 92, 246, 0.08); color: #8B5CF6; border-radius: 999px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; width: fit-content; font-family: 'Space Grotesk', sans-serif; }
      .dp-name { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 16px; line-height: 1.3; min-height: 42px; color: #E5E7EB; }
      .dp-desc { color: #9CA3B5; font-size: 13px; line-height: 1.6; flex: 1; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
      .dp-row { display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 8px; border-top: 1px solid rgba(30, 58, 95, 0.5); }
      .dp-price { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 22px; background: linear-gradient(135deg, #8B5CF6, #C084FC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .dp-buy { padding: 8px 14px; background: transparent; border: 1px solid #8B5CF6; color: #8B5CF6; border-radius: 8px; font-size: 12px; font-weight: 700; transition: all 0.2s; font-family: 'Space Grotesk', sans-serif; }
      .dp-card:hover .dp-buy { background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; box-shadow: 0 0 14px rgba(139, 92, 246, 0.25); }
      .dp-card-pending { opacity: 0.92; }
      .dp-card-pending:hover { opacity: 1; }
      .dp-badge { position: absolute; top: 10px; right: 10px; padding: 4px 10px; border-radius: 999px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 10px; letter-spacing: 0.06em; backdrop-filter: blur(8px); z-index: 2; }
      .dp-badge-available { background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #10B981; }
      .dp-badge-pending { background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); color: #F59E0B; }

      .dp-state { max-width: 480px; margin: 80px auto; padding: 48px 24px; text-align: center; background: #13101F; border: 1px solid #2A1F3D; border-radius: 16px; }
      .dp-state h3 { font-family: 'Space Grotesk', sans-serif; font-size: 20px; margin-bottom: 8px; }
      .dp-state p { color: #9CA3B5; font-size: 14px; margin-bottom: 16px; }
      .dp-empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.3; }
      .dp-btn { margin-top: 8px; padding: 10px 20px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border: none; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; cursor: pointer; }
    `}</style>
  );
}
