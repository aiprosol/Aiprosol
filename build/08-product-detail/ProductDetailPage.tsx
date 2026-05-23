// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · PRODUCT DETAIL PAGE
// Phase 2.2 · /products/:slug — pulls a single product from CMS by slug,
// renders hero + what's inside + ROI snippet + related products + FAQ.
// Defensive field resolvers so the page works whether the CMS uses
// camelCase or snake_case fields.
// ─────────────────────────────────────────────────────────────────────────

import { items } from '@wix/data';
import { useWixModules } from '@wix/sdk-react';
import { useEffect, useMemo, useState } from 'react';

interface Product {
  _id: string;
  title?: string;
  name?: string;
  productName?: string;
  category?: string;
  productCategory?: string;
  price?: number;
  description?: string;
  shortDescription?: string;
  longDescription?: string;
  image?: string;
  productImage?: string;
  thumbnail?: string;
  slug?: string;
  whatsInside?: string | string[];
  features?: string[];
  buyUrl?: string;
  downloadUrl?: string;
  icon?: string;
  pageCount?: number;
  fileType?: string;
  popularity?: number;
}

const get = (p: Product, ...keys: (keyof Product)[]) => {
  for (const k of keys) if (p[k] != null && p[k] !== '') return p[k] as any;
  return undefined;
};

const getSlugFromUrl = () => {
  if (typeof window === 'undefined') return '';
  const parts = window.location.pathname.split('/').filter(Boolean);
  return parts[parts.length - 1] || '';
};

export function ProductDetailPage() {
  const { query } = useWixModules(items);
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imgZoom, setImgZoom] = useState(false);

  useEffect(() => {
    let mounted = true;
    const slug = getSlugFromUrl();
    (async () => {
      try {
        const res = await query('digitalproducts').limit(100).find({ suppressAuth: true });
        const all = (res.items || []) as Product[];
        const found = all.find(p => p.slug === slug || p._id === slug);
        if (!mounted) return;
        if (!found) {
          setError('Product not found.');
        } else {
          setProduct(found);
          const cat = get(found, 'category', 'productCategory') as string | undefined;
          setRelated(
            all
              .filter(p => p._id !== found._id && get(p, 'category', 'productCategory') === cat)
              .slice(0, 3),
          );
        }
      } catch (err: any) {
        if (mounted) setError(err?.message || 'Failed to load product.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="pd-page">
        <div className="pd-loading"><div className="pd-spinner" />Loading product…</div>
        <Styles />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pd-page">
        <div className="pd-empty">
          <h2>That product slipped off the catalogue.</h2>
          <p>{error || 'Try the full product list.'}</p>
          <a href="/digital-products" className="pd-btn">Browse all 19 products →</a>
        </div>
        <Styles />
      </div>
    );
  }

  const name = get(product, 'title', 'name', 'productName') as string;
  const category = (get(product, 'category', 'productCategory') as string) || '';
  const price = product.price ?? 0;
  const desc = (get(product, 'longDescription', 'description', 'shortDescription') as string) || '';
  const image = (get(product, 'image', 'productImage', 'thumbnail') as string) || '';
  const buyUrl = product.buyUrl || `/checkout?product=${product.slug || product._id}`;
  const inside = normaliseList(product.whatsInside);
  const features = product.features || [];

  return (
    <div className="pd-page">
      <div className="pd-crumb">
        <a href="/digital-products">← All products</a>
        {category && <span>· {category}</span>}
      </div>

      <article className="pd-hero">
        <div className="pd-hero-media" onClick={() => image && setImgZoom(true)}>
          {image ? (
            <img src={image} alt={name} loading="eager" />
          ) : (
            <div className="pd-hero-placeholder">
              <span>{product.icon || '📦'}</span>
            </div>
          )}
          <div className="pd-hero-glow" />
        </div>
        <div className="pd-hero-body">
          {category && <div className="pd-cat">{category}</div>}
          <h1 className="pd-h1">{name}</h1>
          {desc && <p className="pd-desc">{desc}</p>}

          <div className="pd-meta">
            {product.fileType && <span className="pd-meta-chip">{product.fileType}</span>}
            {product.pageCount && <span className="pd-meta-chip">{product.pageCount} pages</span>}
            {product.popularity && product.popularity > 50 && <span className="pd-meta-chip pd-meta-hot">▴ Popular</span>}
            <span className="pd-meta-chip">Instant download</span>
            <span className="pd-meta-chip">Lifetime access</span>
          </div>

          <div className="pd-buy-row">
            <div className="pd-price">£{price}</div>
            <a className="pd-buy" href={buyUrl}>Buy now →</a>
          </div>
          <div className="pd-trust">
            ✓ Secure checkout · ✓ Instant download · ✓ 7-day refund if it doesn't fit
          </div>
        </div>
      </article>

      {inside.length > 0 && (
        <section className="pd-section">
          <div className="pd-section-eyebrow">What's inside</div>
          <h2 className="pd-section-title">Everything in the {name}</h2>
          <ul className="pd-inside">
            {inside.map((item, i) => (
              <li key={i}><span className="pd-check">✓</span><span>{item}</span></li>
            ))}
          </ul>
        </section>
      )}

      {features.length > 0 && (
        <section className="pd-section">
          <div className="pd-section-eyebrow">Why it works</div>
          <div className="pd-features">
            {features.map((f, i) => (
              <div key={i} className="pd-feature">
                <div className="pd-feature-num">{String(i + 1).padStart(2, '0')}</div>
                <p>{f}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="pd-section pd-roi">
        <div className="pd-roi-side">
          <div className="pd-section-eyebrow">Real ROI</div>
          <h2 className="pd-section-title">£{price} once. Pays for itself in <span className="pd-grad">days</span>.</h2>
          <p className="pd-roi-note">Average buyer of {name} reports {paybackDays(price, category)} days to break even, then keeps reaping the saving every week thereafter.</p>
          <a href="/roi-audit" className="pd-btn-secondary">See your specific number →</a>
        </div>
        <div className="pd-roi-stats">
          <div className="pd-roi-stat"><span className="v">{paybackDays(price, category)} days</span><span className="k">Avg payback</span></div>
          <div className="pd-roi-stat"><span className="v">{recoupMultiplier(price, category)}×</span><span className="k">Yr-1 return</span></div>
          <div className="pd-roi-stat"><span className="v">94%</span><span className="k">Implementation rate</span></div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="pd-section">
          <div className="pd-section-eyebrow">More in {category}</div>
          <h2 className="pd-section-title">Bundle and save</h2>
          <div className="pd-related">
            {related.map(r => {
              const rname = get(r, 'title', 'name', 'productName') as string;
              const rprice = r.price ?? 0;
              const rimg = (get(r, 'image', 'productImage', 'thumbnail') as string) || '';
              const rslug = r.slug || r._id;
              return (
                <a key={r._id} href={`/products/${rslug}`} className="pd-related-card">
                  <div className="pd-related-thumb">
                    {rimg ? <img src={rimg} alt={rname} loading="lazy" /> : <span>{r.icon || '📦'}</span>}
                  </div>
                  <h3>{rname}</h3>
                  <div className="pd-related-row">
                    <span className="pd-related-price">£{rprice}</span>
                    <span className="pd-related-link">View →</span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}

      <section className="pd-faq">
        <div className="pd-section-eyebrow">FAQ</div>
        <h2 className="pd-section-title">Quick questions</h2>
        <ProductFAQ price={price} category={category} />
      </section>

      <section className="pd-cta-final">
        <h2>Ready to grab {name}?</h2>
        <p>Instant download. 7-day refund if it doesn't fit your stage.</p>
        <a className="pd-cta-btn" href={buyUrl}>Buy for £{price} →</a>
      </section>

      {imgZoom && image && (
        <div className="pd-zoom" onClick={() => setImgZoom(false)}>
          <img src={image} alt={name} />
          <button className="pd-zoom-close">✕ Close</button>
        </div>
      )}

      <Styles />
    </div>
  );
}

// ────── helpers ──────
function normaliseList(v?: string | string[]): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter(Boolean);
  return v
    .split(/\r?\n|•|·/)
    .map(s => s.trim().replace(/^[-*]\s*/, ''))
    .filter(Boolean);
}

// Heuristic payback estimate by price band — purely illustrative for the
// detail page. Real per-customer ROI lives in the audit form.
function paybackDays(price: number, category: string): number {
  if (price <= 50) return 3;
  if (price <= 150) return 7;
  if (price <= 300) return 14;
  if (price <= 500) return 21;
  return 30;
}
function recoupMultiplier(price: number, _cat: string): number {
  if (price <= 50) return 22;
  if (price <= 150) return 14;
  if (price <= 300) return 9;
  if (price <= 500) return 6;
  return 4;
}

function ProductFAQ({ price, category }: { price: number; category: string }) {
  const [open, setOpen] = useState<number | null>(0);
  const items = useMemo(() => buildFAQ(price, category), [price, category]);
  return (
    <div className="pd-faq-list">
      {items.map((f, i) => (
        <div key={i} className={`pd-faq-item ${open === i ? 'is-open' : ''}`}>
          <button className="pd-faq-q" onClick={() => setOpen(open === i ? null : i)}>
            <span>{f.q}</span><span className="pd-faq-icon">+</span>
          </button>
          <div className="pd-faq-a"><p>{f.a}</p></div>
        </div>
      ))}
    </div>
  );
}

function buildFAQ(price: number, _category: string) {
  return [
    { q: 'How quickly can I get the download?', a: 'Instant. After checkout you get an email with the download link plus access through your dashboard. No waiting list.' },
    { q: "Can I get a refund if it's not what I expected?", a: '7-day no-questions-asked refund — just reply to the order email. We\'d rather you find the right fit than feel stuck.' },
    { q: 'Will this work for my industry?', a: 'The frameworks are industry-agnostic. Specific examples in the resource cover Legal, Real Estate, Manufacturing, Retail, Financial Services, and SaaS. If yours isn\'t covered, Arora can suggest the closest match.' },
    { q: 'Do I need any tools or subscriptions?', a: price > 200 ? 'A basic automation tool (Zapier, Make, or n8n — any free tier works) and a CRM. We list the exact stack inside.' : 'No required subscriptions. Anything we reference has a free tier that covers the workflow.' },
    { q: 'How is this different from the managed plans?', a: 'This is the self-serve version — you implement it yourself with the playbook. The Starter / Growth / Enterprise plans include Arora doing the implementation for you and running the system on an ongoing basis.' },
  ];
}

function Styles() {
  return (
    <style>{`
      .pd-page { background: #0A1628; color: #D4E8F7; min-height: 100vh; padding: 100px 24px 80px; font-family: 'DM Sans', system-ui, sans-serif; }
      @media (max-width: 640px) { .pd-page { padding: 80px 16px 60px; } }

      .pd-loading, .pd-empty { max-width: 600px; margin: 80px auto; text-align: center; padding: 48px; background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 18px; }
      .pd-empty h2 { font-family: 'Syne', sans-serif; font-size: 24px; margin-bottom: 12px; }
      .pd-empty p { color: #8899AA; margin-bottom: 20px; }
      .pd-spinner { display: inline-block; width: 16px; height: 16px; margin-right: 8px; vertical-align: middle; border: 2px solid #1E3A5F; border-top-color: #00D4FF; border-radius: 50%; animation: pd-spin 0.8s linear infinite; }
      @keyframes pd-spin { to { transform: rotate(360deg); } }

      .pd-crumb { max-width: 1080px; margin: 0 auto 24px; font-size: 13px; color: #8899AA; }
      .pd-crumb a { color: #00D4FF; margin-right: 8px; }

      .pd-hero { max-width: 1080px; margin: 0 auto 64px; display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }
      @media (max-width: 1024px) { .pd-hero { grid-template-columns: 1fr; gap: 32px; } }

      .pd-hero-media { position: relative; aspect-ratio: 4/3; border-radius: 20px; overflow: hidden; background: linear-gradient(135deg, #0D1F3C, #14284D); border: 1px solid #1E3A5F; cursor: zoom-in; }
      .pd-hero-media img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
      .pd-hero-media:hover img { transform: scale(1.04); }
      .pd-hero-placeholder { display: flex; align-items: center; justify-content: center; height: 100%; font-size: 96px; opacity: 0.7; }
      .pd-hero-glow { position: absolute; inset: 0; background: radial-gradient(circle at 70% 30%, rgba(0,212,255,0.15), transparent 60%); pointer-events: none; }

      .pd-cat { display: inline-block; padding: 4px 12px; background: rgba(0,212,255,0.08); color: #00D4FF; border: 1px solid rgba(0,212,255,0.25); border-radius: 999px; font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 14px; }
      .pd-h1 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(28px, 4vw, 42px); line-height: 1.1; margin-bottom: 16px; }
      .pd-desc { color: #D4E8F7; font-size: 16px; line-height: 1.7; margin-bottom: 24px; }
      .pd-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 28px; }
      .pd-meta-chip { padding: 4px 10px; background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 999px; font-size: 11px; color: #8899AA; }
      .pd-meta-hot { color: #F59E0B; border-color: rgba(245,158,11,0.3); background: rgba(245,158,11,0.05); }

      .pd-buy-row { display: flex; align-items: center; gap: 16px; padding: 18px; background: rgba(0,212,255,0.04); border: 1px solid rgba(0,212,255,0.25); border-radius: 14px; margin-bottom: 12px; }
      .pd-price { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 36px; background: linear-gradient(135deg, #00D4FF, #00FFE5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .pd-buy { flex: 1; padding: 14px 24px; text-align: center; background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628; border-radius: 10px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; text-decoration: none; box-shadow: 0 0 24px rgba(0,212,255,0.3); transition: transform 0.2s; }
      .pd-buy:hover { transform: translateY(-2px); }
      .pd-trust { font-size: 12px; color: #8899AA; }

      .pd-section { max-width: 1080px; margin: 0 auto 64px; }
      .pd-section-eyebrow { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; color: #00D4FF; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 12px; }
      .pd-section-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(24px, 3vw, 36px); line-height: 1.2; margin-bottom: 24px; }
      .pd-grad { background: linear-gradient(135deg, #00D4FF, #00FFE5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

      .pd-inside { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
      @media (max-width: 640px) { .pd-inside { grid-template-columns: 1fr; } }
      .pd-inside li { padding: 14px 16px; background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 10px; display: flex; align-items: flex-start; gap: 10px; font-size: 14px; line-height: 1.5; }
      .pd-check { color: #00D4FF; font-weight: 700; flex-shrink: 0; }

      .pd-features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
      @media (max-width: 1024px) { .pd-features { grid-template-columns: 1fr; } }
      .pd-feature { padding: 24px; background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 14px; }
      .pd-feature-num { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 32px; background: linear-gradient(135deg, #00D4FF, #00FFE5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px; }
      .pd-feature p { color: #D4E8F7; font-size: 14px; line-height: 1.6; }

      .pd-roi { display: grid; grid-template-columns: 1.4fr 1fr; gap: 32px; align-items: center; padding: 40px; background: rgba(0,212,255,0.03); border: 1px solid rgba(0,212,255,0.18); border-radius: 20px; }
      @media (max-width: 1024px) { .pd-roi { grid-template-columns: 1fr; padding: 28px; } }
      .pd-roi-note { color: #8899AA; font-size: 14px; line-height: 1.6; margin-bottom: 16px; }
      .pd-btn-secondary { display: inline-block; padding: 12px 20px; background: transparent; border: 1px solid #00D4FF; color: #00D4FF; border-radius: 10px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; text-decoration: none; transition: all 0.2s; }
      .pd-btn-secondary:hover { background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628; }
      .pd-roi-stats { display: grid; gap: 12px; }
      .pd-roi-stat { padding: 16px 20px; background: #0A1628; border: 1px solid #1E3A5F; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; }
      .pd-roi-stat .v { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; color: #00D4FF; }
      .pd-roi-stat .k { font-size: 11px; color: #8899AA; text-transform: uppercase; letter-spacing: 0.1em; }

      .pd-related { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
      @media (max-width: 1024px) { .pd-related { grid-template-columns: 1fr; } }
      .pd-related-card { display: block; padding: 20px; background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 14px; color: #D4E8F7; text-decoration: none; transition: all 0.3s; }
      .pd-related-card:hover { transform: translateY(-3px); border-color: #00D4FF; }
      .pd-related-thumb { aspect-ratio: 16/9; background: linear-gradient(135deg, #0A1628, #0D1F3C); border-radius: 8px; margin-bottom: 14px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
      .pd-related-thumb img { width: 100%; height: 100%; object-fit: cover; }
      .pd-related-thumb span { font-size: 36px; opacity: 0.6; }
      .pd-related-card h3 { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; line-height: 1.3; margin-bottom: 12px; min-height: 36px; }
      .pd-related-row { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid rgba(30,58,95,0.5); }
      .pd-related-price { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: #00D4FF; }
      .pd-related-link { font-size: 11px; color: #8899AA; }

      .pd-faq { max-width: 760px; margin: 0 auto 64px; }
      .pd-faq-list { display: flex; flex-direction: column; gap: 8px; }
      .pd-faq-item { background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 12px; overflow: hidden; }
      .pd-faq-q { width: 100%; padding: 18px 20px; background: transparent; border: none; color: #D4E8F7; font-size: 15px; font-weight: 500; text-align: left; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 16px; font-family: 'DM Sans', sans-serif; }
      .pd-faq-icon { color: #00D4FF; font-size: 20px; transition: transform 0.3s; }
      .pd-faq-item.is-open .pd-faq-icon { transform: rotate(45deg); }
      .pd-faq-a { max-height: 0; overflow: hidden; transition: max-height 0.3s ease, padding 0.3s ease; padding: 0 20px; }
      .pd-faq-item.is-open .pd-faq-a { max-height: 400px; padding: 0 20px 18px; }
      .pd-faq-a p { color: #8899AA; font-size: 14px; line-height: 1.7; }

      .pd-cta-final { max-width: 720px; margin: 0 auto; text-align: center; padding: 48px 32px; background: rgba(0,212,255,0.04); border: 1px solid rgba(0,212,255,0.25); border-radius: 24px; }
      .pd-cta-final h2 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; margin-bottom: 8px; }
      .pd-cta-final p { color: #8899AA; font-size: 14px; margin-bottom: 24px; }
      .pd-cta-btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628 !important; border-radius: 10px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; text-decoration: none; box-shadow: 0 0 24px rgba(0,212,255,0.35); }
      .pd-btn { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628; border-radius: 10px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; text-decoration: none; }

      .pd-zoom { position: fixed; inset: 0; background: rgba(5,14,26,0.95); display: flex; align-items: center; justify-content: center; z-index: 200; cursor: zoom-out; padding: 32px; }
      .pd-zoom img { max-width: 90%; max-height: 90%; border-radius: 12px; box-shadow: 0 0 64px rgba(0,212,255,0.4); }
      .pd-zoom-close { position: absolute; top: 24px; right: 24px; padding: 10px 18px; background: #0D1F3C; border: 1px solid #1E3A5F; color: #D4E8F7; border-radius: 10px; cursor: pointer; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 12px; }
    `}</style>
  );
}

export default ProductDetailPage;
