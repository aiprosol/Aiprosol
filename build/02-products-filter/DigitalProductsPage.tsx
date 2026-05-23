// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · DIGITAL PRODUCTS PAGE V2
// Phase 0.4 — fixes the "No products found" filter bug
// Categories sourced from Master Blueprint (locked).
// Defensive field-name handling: works whether CMS uses category /
// productCategory / cat / type, so a CMS schema mismatch can't kill the page.
// ─────────────────────────────────────────────────────────────────────────

import { items } from '@wix/data';
import { useWixModules } from '@wix/sdk-react';
import { useEffect, useMemo, useState } from 'react';

const CATEGORIES = [
  'All',
  'Bundle',
  'Toolkits',
  'Templates',
  'Checklists',
  'Challenge',
  'Guides',
  'Sales',
  'AI Tools',
  'Masterclass',
  'Enterprise',
  'Agency',
] as const;

interface Product {
  _id: string;
  title?: string;
  name?: string;
  productName?: string;
  category?: string;
  productCategory?: string;
  cat?: string;
  type?: string;
  price?: number;
  description?: string;
  shortDescription?: string;
  image?: string;
  productImage?: string;
  thumbnail?: string;
  downloadUrl?: string;
  buyUrl?: string;
  slug?: string;
  icon?: string;
}

const getName = (p: Product) => p.title || p.name || p.productName || 'Untitled';
const getCategory = (p: Product) => p.category || p.productCategory || p.cat || p.type || '';
const getImage = (p: Product) => p.image || p.productImage || p.thumbnail || '';
const getDesc = (p: Product) => p.description || p.shortDescription || '';
const getSlug = (p: Product) => p.slug || p._id;
const getIcon = (p: Product) => p.icon || '📦';

type SortKey = 'default' | 'price-asc' | 'price-desc' | 'name-asc';

export function DigitalProductsPage() {
  const { query } = useWixModules(items);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCat, setActiveCat] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('default');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await query('digitalproducts').limit(100).find({ suppressAuth: true });
        if (mounted) setProducts((res.items as Product[]) || []);
      } catch (err: any) {
        if (mounted) setError(err?.message || 'Failed to load products.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: products.length };
    for (const p of products) {
      const c = getCategory(p);
      if (c) map[c] = (map[c] || 0) + 1;
    }
    return map;
  }, [products]);

  const filtered = useMemo(() => {
    let out = products;
    if (activeCat !== 'All') {
      out = out.filter(p => getCategory(p) === activeCat);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      out = out.filter(
        p =>
          getName(p).toLowerCase().includes(q) ||
          getDesc(p).toLowerCase().includes(q) ||
          getCategory(p).toLowerCase().includes(q),
      );
    }
    if (sort === 'price-asc') out = [...out].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    else if (sort === 'price-desc') out = [...out].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    else if (sort === 'name-asc') out = [...out].sort((a, b) => getName(a).localeCompare(getName(b)));
    return out;
  }, [products, activeCat, search, sort]);

  return (
    <div className="dp-page">
      <header className="dp-hero">
        <div className="dp-eyebrow">19 Digital Products · £17 – £997</div>
        <h1 className="dp-h1">
          Self-serve toolkits that <span className="dp-grad">pay for themselves</span>
        </h1>
        <p className="dp-sub">
          Instant download. Immediate value. Every product is engineered to deliver measurable
          ROI before you ever consider stepping up to a managed plan.
        </p>
      </header>

      <div className="dp-controls">
        <div className="dp-tabs" role="tablist">
          {CATEGORIES.map(cat => {
            const n = counts[cat] || 0;
            const disabled = cat !== 'All' && n === 0 && !loading;
            return (
              <button
                key={cat}
                role="tab"
                aria-selected={activeCat === cat}
                disabled={disabled}
                className={`dp-tab ${activeCat === cat ? 'is-active' : ''} ${disabled ? 'is-empty' : ''}`}
                onClick={() => setActiveCat(cat)}
              >
                {cat}
                {n > 0 && <span className="dp-tab-count">{n}</span>}
              </button>
            );
          })}
        </div>

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
          <select
            className="dp-sort"
            value={sort}
            onChange={e => setSort(e.target.value as SortKey)}
            aria-label="Sort products"
          >
            <option value="default">Featured</option>
            <option value="price-asc">Price · low to high</option>
            <option value="price-desc">Price · high to low</option>
            <option value="name-asc">Name · A → Z</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="dp-state">
          <div className="dp-spinner" />
          <p>Loading products…</p>
        </div>
      )}

      {error && (
        <div className="dp-state dp-error">
          <p>Couldn't load products. {error}</p>
          <button className="dp-btn" onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="dp-state">
          <div className="dp-empty-icon">⌕</div>
          <h3>Nothing matches that filter.</h3>
          <p>Try clearing the search or picking another category.</p>
          <button className="dp-btn" onClick={() => { setActiveCat('All'); setSearch(''); }}>
            Show all 19 products
          </button>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="dp-grid">
          {filtered.map(p => (
            <article key={p._id} className="dp-card" onClick={() => p.slug && (window.location.href = `/products/${getSlug(p)}`)}>
              <div className="dp-thumb">
                {getImage(p) ? (
                  <img src={getImage(p)} alt={getName(p)} loading="lazy" />
                ) : (
                  <span className="dp-thumb-emoji">{getIcon(p)}</span>
                )}
                <div className="dp-thumb-glow" />
              </div>
              {getCategory(p) && <span className="dp-cat">{getCategory(p)}</span>}
              <h3 className="dp-name">{getName(p)}</h3>
              {getDesc(p) && <p className="dp-desc">{getDesc(p)}</p>}
              <div className="dp-row">
                <div className="dp-price">£{p.price ?? '—'}</div>
                <button
                  className="dp-buy"
                  onClick={e => {
                    e.stopPropagation();
                    if (p.buyUrl) window.location.href = p.buyUrl;
                    else if (p.slug) window.location.href = `/products/${getSlug(p)}`;
                  }}
                >
                  Buy now →
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <style>{`
        .dp-page { background: #0A1628; color: #D4E8F7; min-height: 100vh; padding: 100px 48px 80px; font-family: 'DM Sans', system-ui, sans-serif; }
        @media (max-width: 640px) { .dp-page { padding: 80px 20px 60px; } }

        .dp-hero { max-width: 720px; margin: 0 auto 56px; text-align: center; }
        .dp-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(0, 212, 255, 0.08); border: 1px solid rgba(0, 212, 255, 0.25); border-radius: 999px; color: #00D4FF; font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; }
        .dp-h1 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(32px, 5vw, 48px); line-height: 1.1; margin-bottom: 16px; }
        .dp-grad { background: linear-gradient(135deg, #00D4FF, #00FFE5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .dp-sub { color: #8899AA; font-size: 17px; line-height: 1.6; }

        .dp-controls { max-width: 1280px; margin: 0 auto 32px; display: flex; flex-direction: column; gap: 20px; }

        .dp-tabs { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
        .dp-tab { padding: 8px 16px; background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 999px; color: #8899AA; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; display: inline-flex; align-items: center; gap: 8px; }
        .dp-tab:hover:not(:disabled) { color: #D4E8F7; border-color: #00D4FF; }
        .dp-tab.is-active { background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628; border-color: transparent; font-weight: 700; box-shadow: 0 0 14px rgba(0, 212, 255, 0.25); }
        .dp-tab.is-empty { opacity: 0.4; cursor: not-allowed; }
        .dp-tab-count { display: inline-flex; min-width: 18px; height: 18px; padding: 0 6px; background: rgba(0,0,0,0.2); border-radius: 999px; font-size: 10px; font-weight: 700; align-items: center; justify-content: center; }
        .dp-tab.is-active .dp-tab-count { background: rgba(10, 22, 40, 0.2); }

        .dp-tools { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .dp-search { position: relative; flex: 1; max-width: 360px; }
        .dp-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #8899AA; font-size: 16px; pointer-events: none; }
        .dp-search input { width: 100%; padding: 12px 14px 12px 38px; background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 10px; color: #D4E8F7; font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; transition: border 0.2s; }
        .dp-search input:focus { border-color: #00D4FF; box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.15); }
        .dp-search input::placeholder { color: #4a6280; }

        .dp-sort { padding: 12px 14px; background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 10px; color: #D4E8F7; font-size: 14px; font-family: 'DM Sans', sans-serif; cursor: pointer; outline: none; }
        .dp-sort:focus { border-color: #00D4FF; }

        .dp-grid { max-width: 1280px; margin: 0 auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        @media (max-width: 1024px) { .dp-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .dp-grid { grid-template-columns: 1fr; } }

        .dp-card { background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 16px; padding: 24px; cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column; gap: 14px; position: relative; overflow: hidden; }
        .dp-card:hover { transform: translateY(-4px); border-color: #00D4FF; box-shadow: 0 0 32px rgba(0, 212, 255, 0.25); }

        .dp-thumb { position: relative; width: 100%; aspect-ratio: 16/9; background: linear-gradient(135deg, #0A1628, #0D1F3C); border: 1px solid #1E3A5F; border-radius: 10px; overflow: hidden; display: flex; align-items: center; justify-content: center; }
        .dp-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .dp-thumb-emoji { font-size: 48px; opacity: 0.7; }
        .dp-thumb-glow { position: absolute; inset: 0; background: radial-gradient(circle at 70% 30%, rgba(0, 212, 255, 0.18), transparent 60%); pointer-events: none; }

        .dp-cat { display: inline-block; padding: 3px 10px; background: rgba(0, 212, 255, 0.08); color: #00D4FF; border-radius: 999px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; width: fit-content; font-family: 'Syne', sans-serif; }
        .dp-name { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 16px; line-height: 1.3; min-height: 42px; color: #D4E8F7; }
        .dp-desc { color: #8899AA; font-size: 13px; line-height: 1.6; flex: 1; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

        .dp-row { display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 8px; border-top: 1px solid rgba(30, 58, 95, 0.5); }
        .dp-price { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; background: linear-gradient(135deg, #00D4FF, #00FFE5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .dp-buy { padding: 8px 14px; background: transparent; border: 1px solid #00D4FF; color: #00D4FF; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: 'Syne', sans-serif; }
        .dp-buy:hover { background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628; box-shadow: 0 0 14px rgba(0, 212, 255, 0.25); }

        .dp-state { max-width: 480px; margin: 80px auto; padding: 48px 24px; text-align: center; background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 16px; }
        .dp-state h3 { font-family: 'Syne', sans-serif; font-size: 20px; margin-bottom: 8px; }
        .dp-state p { color: #8899AA; font-size: 14px; margin-bottom: 16px; }
        .dp-empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.3; }
        .dp-error { border-color: #F59E0B; }
        .dp-btn { margin-top: 8px; padding: 10px 20px; background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628; border: none; border-radius: 10px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; cursor: pointer; }

        .dp-spinner { width: 36px; height: 36px; border: 2px solid #1E3A5F; border-top-color: #00D4FF; border-radius: 50%; margin: 0 auto 16px; animation: dp-spin 0.8s linear infinite; }
        @keyframes dp-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default DigitalProductsPage;
