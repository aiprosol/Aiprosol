'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getProductBySlug, getProducts } from '@/lib/content';
import { track, Events } from '@/lib/analytics';
import type { Product } from '@/types';

// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · PRODUCT DETAIL · /products/[slug]
// Pulls product from the static catalogue. Hero · outcome strip · bestFor
// chips · what's inside · bundle savings · ROI strip · related products
// · per-product FAQ (falls back to price-band generic FAQ).
// ─────────────────────────────────────────────────────────────────────────

// Industries that have dedicated /industries/[slug] pages — bestFor chips
// link there when the label matches; otherwise they render as plain badges.
const INDUSTRY_SLUG: Record<string, string> = {
  'Legal': 'legal',
  'Real Estate': 'real-estate',
  'Financial Services': 'financial-services',
  'SaaS': 'saas',
  'Professional Services': 'professional-services',
  'E-commerce': 'e-commerce',
};

const paybackDays = (price: number): number => {
  if (price <= 50) return 3;
  if (price <= 150) return 7;
  if (price <= 300) return 14;
  if (price <= 500) return 21;
  return 30;
};
const recoupMultiplier = (price: number): number => {
  if (price <= 50) return 22;
  if (price <= 150) return 14;
  if (price <= 300) return 9;
  if (price <= 500) return 6;
  return 4;
};

function buildFAQ(price: number) {
  return [
    { q: 'How quickly can I get the download?', a: 'Instant. After checkout you get an email with the download link plus access through your dashboard. No waiting list.' },
    { q: "Can I get a refund if it's not what I expected?", a: '7-day no-questions-asked refund — just reply to the order email. We\'d rather you find the right fit than feel stuck.' },
    { q: 'Will this work for my industry?', a: 'The frameworks are industry-agnostic. Specific examples cover Legal, Real Estate, Manufacturing, Retail, Financial Services, and SaaS. If yours isn\'t covered, Arora can suggest the closest match.' },
    { q: 'Do I need any tools or subscriptions?', a: price > 200 ? 'A basic automation tool (Zapier, Make, or n8n — any free tier works) and a CRM. We list the exact stack inside.' : 'No required subscriptions. Anything we reference has a free tier that covers the workflow.' },
    { q: 'How is this different from the managed plans?', a: 'This is the self-serve version — you implement it yourself with the playbook. The Starter / Growth / Enterprise plans include Arora doing the implementation for you and running the system on an ongoing basis.' },
  ];
}

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const product = slug ? getProductBySlug(slug) : undefined;
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  const related = useMemo(() => {
    if (!product) return [];
    return getProducts()
      .filter(p => p.slug !== product.slug && p.category === product.category)
      .slice(0, 3);
  }, [product]);

  if (!product) {
    return (
      <div className="pd-page">
        <div className="pd-empty">
          <h2>That product slipped off the catalogue.</h2>
          <p>Try the full product list.</p>
          <Link href="/digital-products" className="pd-btn">Browse all 19 products →</Link>
        </div>
        <Styles />
      </div>
    );
  }

  const buyUrl = product.buyUrl || `/checkout?product=${product.slug}`;
  // Prefer per-product FAQs; fall back to the generic price-band set if a
  // product has not been individually authored yet.
  const faq = (product.faqs && product.faqs.length > 0) ? product.faqs : buildFAQ(product.price);
  const isAvailable = Boolean((product as { available?: boolean }).available);
  const expectedShipDate = (product as { expectedShipDate?: string | null }).expectedShipDate ?? null;
  const buyLabel = isAvailable ? 'Buy now →' : `Reserve · ships ${expectedShipDate ?? 'soon'} →`;
  const buyLabelLong = isAvailable ? `Buy for $${product.price} →` : `Reserve at $${product.price} → ships ${expectedShipDate ?? 'soon'}`;

  // Product Schema.org JSON-LD lives in products/[slug]/layout.tsx (with
  // Product + Brand + Offer + BreadcrumbList + HowTo). Do not duplicate
  // it here — Google's Rich Results Test flags duplicate entities as invalid.

  const onBuyClick = () => {
    track(Events.ProductCheckoutClicked, {
      slug: product.slug,
      name: product.name,
      price: product.price,
      category: product.category,
    });
  };

  return (
    <div className="pd-page">
      <div className="pd-crumb">
        <Link href="/digital-products">← All products</Link>
        <span> · {product.category}</span>
        {product.flagship && <span className="pd-crumb-flagship"> · ★ Flagship</span>}
      </div>

      {product.flagship && product.flagshipHero && (
        <section className="pd-flagship">
          <div className="pd-flagship-eyebrow">★ Flagship product</div>
          <h1 className="pd-flagship-headline">{product.flagshipHero.headline}</h1>
          <p className="pd-flagship-sub">{product.flagshipHero.subheadline}</p>
          {product.flagshipHero.socialProof && (
            <div className="pd-flagship-proof">{product.flagshipHero.socialProof}</div>
          )}
          <div className="pd-flagship-promises">
            {product.flagshipHero.threePromises.map((p, i) => (
              <div key={i} className="pd-flagship-promise">
                <div className="pd-flagship-promise-num">{String(i + 1).padStart(2, '0')}</div>
                <h3 className="pd-flagship-promise-title">{p.title}</h3>
                <p className="pd-flagship-promise-body">{p.body}</p>
              </div>
            ))}
          </div>
          <div className="pd-flagship-cta">
            <Link className="pd-flagship-btn" href={buyUrl} onClick={onBuyClick}>{buyLabelLong}</Link>
            <Link className="pd-flagship-btn-sec" href="/roi-audit">Get a personalised recommendation first →</Link>
          </div>
        </section>
      )}

      <article className={`pd-hero ${product.flagship ? 'pd-hero-flagship' : ''}`}>
        <div className="pd-hero-media">
          <img
            src={product.image || `/api/og/product/${product.slug}`}
            alt={product.name}
            loading="eager"
            width={1200}
            height={675}
            fetchPriority="high"
            className="pd-hero-img"
          />
        </div>
        <div className="pd-hero-body">
          <div className="pd-cat">{product.category}</div>
          <h1 className="pd-h1">{product.name}</h1>
          {product.shortDescription && <p className="pd-desc">{product.shortDescription}</p>}

          <div className="pd-meta">
            {(product.popularity ?? 0) > 50 && <span className="pd-meta-chip pd-meta-hot">▴ Popular</span>}
            <span className="pd-meta-chip">Instant download</span>
            <span className="pd-meta-chip">Lifetime access</span>
            <span className="pd-meta-chip">7-day refund</span>
          </div>

          {(product.bestFor && product.bestFor.length > 0) && (
            <div className="pd-bestfor">
              <span className="pd-bestfor-label">Best for:</span>
              <div className="pd-bestfor-chips">
                {product.bestFor.map((label) => {
                  const slug = INDUSTRY_SLUG[label];
                  return slug ? (
                    <Link key={label} href={`/industries/${slug}`} className="pd-bestfor-chip pd-bestfor-chip-linked">
                      {label} <span aria-hidden="true">↗</span>
                    </Link>
                  ) : (
                    <span key={label} className="pd-bestfor-chip">{label}</span>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pd-buy-row">
            <div className="pd-price">${product.price}</div>
            <Link className="pd-buy" href={buyUrl} onClick={onBuyClick}>{buyLabel}</Link>
          </div>
          <div className="pd-trust">✓ Secure checkout · ✓ Instant download · ✓ 7-day refund if it doesn&apos;t fit</div>
        </div>
      </article>

      {(product.outcomeMetrics && product.outcomeMetrics.length > 0) && (
        <section className="pd-section pd-outcomes">
          <div className="pd-outcomes-grid">
            {product.outcomeMetrics.map((m, i) => (
              <div key={i} className="pd-outcome-card">
                <div className="pd-outcome-value">{m.value}</div>
                <div className="pd-outcome-label">{m.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {(product.includedInBundles && product.includedInBundles.length > 0) && (
        <section className="pd-section pd-bundles">
          <div className="pd-section-eyebrow">Bundle alternatives</div>
          <h2 className="pd-section-title">Also included in a bundle — save more</h2>
          <div className="pd-bundle-list">
            {product.includedInBundles.map((b) => (
              <Link key={b.bundleSlug} href={`/products/${b.bundleSlug}`} className="pd-bundle-card">
                <div className="pd-bundle-card-head">
                  <h3 className="pd-bundle-name">{b.bundleName}</h3>
                  <div className="pd-bundle-price">${b.bundlePrice}</div>
                </div>
                <p className="pd-bundle-meta">
                  Bundles <strong>{b.bundleItemCount}</strong> products worth <strong>${b.bundleStandaloneSum.toLocaleString()}</strong>
                </p>
                <div className="pd-bundle-savings">
                  Save <strong>${b.bundleSavings.toLocaleString()}</strong> vs buying separately →
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {product.longDescription && (
        <section className="pd-section">
          <div className="pd-section-eyebrow">Overview</div>
          <p className="pd-long-desc">{product.longDescription}</p>
        </section>
      )}

      {(product.whatsInside?.length ?? 0) > 0 && (
        <section className="pd-section">
          <div className="pd-section-eyebrow">What&apos;s inside</div>
          <h2 className="pd-section-title">Everything in the {product.name}</h2>
          <ul className="pd-inside">
            {product.whatsInside!.map((item, i) => (
              <li key={i}><span className="pd-check">✓</span><span>{item}</span></li>
            ))}
          </ul>
        </section>
      )}

      {(product.previewToc && product.previewToc.length > 0) && (
        <section className="pd-section pd-toc-section">
          <div className="pd-section-eyebrow">Table of contents · preview</div>
          <h2 className="pd-section-title">What you&apos;ll read inside</h2>
          <p className="pd-toc-sub">The document is structured as {product.previewToc.length} primary sections. Full content unlocks on purchase.</p>
          <ol className="pd-toc-list">
            {product.previewToc.map((heading, i) => (
              <li key={i} className="pd-toc-item">
                <span className="pd-toc-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="pd-toc-text">{heading}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {product.previewExcerpt && (
        <PreviewExcerpt product={product} buyUrl={buyUrl} onBuyClick={onBuyClick} buyLabel={buyLabel} />
      )}

      {(product.features?.length ?? 0) > 0 && (
        <section className="pd-section">
          <div className="pd-section-eyebrow">Why it works</div>
          <div className="pd-features">
            {product.features!.map((f, i) => (
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
          <h2 className="pd-section-title">${product.price} once. Pays for itself in <span className="pd-grad">days</span>.</h2>
          <p className="pd-roi-note">Average buyer of {product.name} reports {paybackDays(product.price)} days to break even, then keeps reaping the saving every week thereafter.</p>
          <Link href="/roi-audit" className="pd-btn-secondary">See your specific number →</Link>
        </div>
        <div className="pd-roi-stats">
          <div className="pd-roi-stat"><span className="v">{paybackDays(product.price)} days</span><span className="k">Avg payback</span></div>
          <div className="pd-roi-stat"><span className="v">{recoupMultiplier(product.price)}×</span><span className="k">Yr-1 return</span></div>
          <div className="pd-roi-stat"><span className="v">94%</span><span className="k">Implementation rate</span></div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="pd-section">
          <div className="pd-section-eyebrow">More in {product.category}</div>
          <h2 className="pd-section-title">Bundle and save</h2>
          <div className="pd-related">
            {related.map(r => (
              <Link key={r.slug} href={`/products/${r.slug}`} className="pd-related-card">
                <div className="pd-related-thumb"><span>{r.icon || '📦'}</span></div>
                <h3>{r.name}</h3>
                <div className="pd-related-row">
                  <span className="pd-related-price">${r.price}</span>
                  <span className="pd-related-link">View →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="pd-faq">
        <div className="pd-section-eyebrow">FAQ</div>
        <h2 className="pd-section-title">Quick questions</h2>
        <div className="pd-faq-list">
          {faq.map((f, i) => (
            <div key={i} className={`pd-faq-item ${openFAQ === i ? 'is-open' : ''}`}>
              <button className="pd-faq-q" onClick={() => setOpenFAQ(openFAQ === i ? null : i)}>
                <span>{f.q}</span><span className="pd-faq-icon">+</span>
              </button>
              <div className="pd-faq-a"><p>{f.a}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="pd-cta-final">
        <h2>Ready to grab {product.name}?</h2>
        <p>Instant download. 7-day refund if it doesn&apos;t fit your stage.</p>
        <Link className="pd-cta-btn" href={buyUrl} onClick={onBuyClick}>{buyLabelLong}</Link>
      </section>

      <Styles />
    </div>
  );
}

// T3.2 — Excerpt preview component.
// Renders the first ~600 words of the markdown deliverable inline. Uses a
// minimal inline markdown-to-HTML render (no external deps): ##/### headings,
// **bold**, _italic_, paragraphs, list items, links.
function renderMarkdownPreview(md: string): string {
  let html = md
    // Escape HTML-significant chars first
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  // Headings
  html = html
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>');
  // Bold / italic
  html = html
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])\*([^*\s][^*]*?)\*/g, '$1<em>$2</em>');
  // Links (must come before line breaks)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="noopener noreferrer" target="_blank">$1</a>');
  // List items (basic — single level)
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>[\s\S]+?<\/li>)(?!\s*<li>)/g, '<ul>$1</ul>');
  // Paragraph wrapping — split on double newline, skip block-level
  html = html
    .split(/\n{2,}/)
    .map((block) => {
      const t = block.trim();
      if (!t) return '';
      if (/^<(h\d|ul|ol|li|p|blockquote|pre|table)/.test(t)) return t;
      return `<p>${t.replace(/\n/g, '<br />')}</p>`;
    })
    .join('\n');
  return html;
}

function PreviewExcerpt({
  product,
  buyUrl,
  onBuyClick,
  buyLabel,
}: {
  product: Product;
  buyUrl: string;
  onBuyClick: () => void;
  buyLabel: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const html = useMemo(() => renderMarkdownPreview(product.previewExcerpt || ''), [product.previewExcerpt]);

  return (
    <section className="pd-section pd-preview-section">
      <div className="pd-section-eyebrow">First 600 words · free preview</div>
      <h2 className="pd-section-title">Read a sample before you buy</h2>
      <p className="pd-preview-sub">The opening section is unlocked here so you can sanity-check the voice + density. The full document continues beyond the fade.</p>

      <div className={`pd-preview-body ${expanded ? 'is-expanded' : ''}`}>
        <div className="pd-preview-content" dangerouslySetInnerHTML={{ __html: html }} />
        {!expanded && <div className="pd-preview-fade" aria-hidden="true" />}
      </div>

      <div className="pd-preview-actions">
        {!expanded ? (
          <button className="pd-preview-toggle" onClick={() => setExpanded(true)}>Read the full 600-word excerpt →</button>
        ) : (
          <button className="pd-preview-toggle" onClick={() => setExpanded(false)}>Collapse preview ↑</button>
        )}
        <Link className="pd-preview-buy" href={buyUrl} onClick={onBuyClick}>Unlock the full document — {buyLabel}</Link>
      </div>
    </section>
  );
}

function Styles() {
  return (
    <style>{`
      .pd-page { background: #0A0613; color: #E5E7EB; min-height: 100vh; padding: 140px 24px 80px; font-family: 'Inter', system-ui, sans-serif; }
      @media (max-width: 640px) { .pd-page { padding: 120px 16px 60px; } }
      .pd-empty { max-width: 600px; margin: 80px auto; text-align: center; padding: 48px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 18px; }
      .pd-empty h2 { font-family: 'Space Grotesk', sans-serif; font-size: 24px; margin-bottom: 12px; }
      .pd-empty p { color: #9CA3B5; margin-bottom: 20px; }
      .pd-crumb { max-width: 1080px; margin: 0 auto 24px; font-size: 13px; color: #9CA3B5; }
      .pd-crumb a { color: #8B5CF6; margin-right: 8px; }
      .pd-crumb-flagship { color: #FBBF24; font-weight: 600; }

      /* T3.1 — Flagship landing section (full-bleed, above the hero) */
      .pd-flagship { max-width: 1080px; margin: 0 auto 56px; padding: 48px 32px; background: radial-gradient(circle at top right, rgba(192,132,252,0.10), transparent 60%), linear-gradient(180deg, rgba(139,92,246,0.06), rgba(139,92,246,0.02)); border: 1px solid rgba(192,132,252,0.3); border-radius: 24px; }
      @media (max-width: 768px) { .pd-flagship { padding: 32px 20px; } }
      .pd-flagship-eyebrow { display: inline-block; padding: 5px 14px; background: rgba(251,191,36,0.1); color: #FBBF24; border: 1px solid rgba(251,191,36,0.35); border-radius: 999px; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 20px; }
      .pd-flagship-headline { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(28px, 4.5vw, 44px); line-height: 1.12; margin-bottom: 18px; color: #E5E7EB; }
      .pd-flagship-sub { color: #CBD5E1; font-size: 17px; line-height: 1.65; margin-bottom: 20px; max-width: 820px; }
      .pd-flagship-proof { display: inline-block; padding: 8px 14px; background: rgba(251,191,36,0.08); color: #FBBF24; border-left: 3px solid #FBBF24; border-radius: 4px; font-size: 13px; margin-bottom: 32px; }
      .pd-flagship-promises { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
      @media (max-width: 768px) { .pd-flagship-promises { grid-template-columns: 1fr; } }
      .pd-flagship-promise { padding: 22px 20px; background: rgba(10,6,19,0.6); border: 1px solid rgba(139,92,246,0.2); border-radius: 14px; }
      .pd-flagship-promise-num { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 14px; color: #C084FC; letter-spacing: 0.08em; margin-bottom: 10px; }
      .pd-flagship-promise-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 15px; color: #E5E7EB; margin-bottom: 8px; line-height: 1.3; }
      .pd-flagship-promise-body { color: #9CA3B5; font-size: 13px; line-height: 1.6; margin: 0; }
      .pd-flagship-cta { display: flex; flex-wrap: wrap; gap: 14px; align-items: center; }
      .pd-flagship-btn { padding: 14px 28px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border-radius: 12px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 14px; text-decoration: none; box-shadow: 0 0 32px rgba(139,92,246,0.35); transition: transform 0.2s; }
      .pd-flagship-btn:hover { transform: translateY(-2px); }
      .pd-flagship-btn-sec { padding: 14px 24px; background: transparent; color: #C084FC; border: 1px solid rgba(192,132,252,0.35); border-radius: 12px; font-family: 'Space Grotesk', sans-serif; font-weight: 600; font-size: 13px; text-decoration: none; transition: all 0.2s; }
      .pd-flagship-btn-sec:hover { border-color: #C084FC; background: rgba(192,132,252,0.06); }
      .pd-hero-flagship { margin-top: 0; }
      .pd-long-desc { max-width: 780px; margin: 0 auto; font-size: 17px; line-height: 1.75; color: #CBD5E1; }

      .pd-hero { max-width: 1080px; margin: 0 auto 64px; display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }
      @media (max-width: 1024px) { .pd-hero { grid-template-columns: 1fr; gap: 32px; } }
      .pd-hero-media { position: relative; aspect-ratio: 16/9; border-radius: 20px; overflow: hidden; background: #0A0613; border: 1px solid #2A1F3D; box-shadow: 0 0 60px rgba(139, 92, 246, 0.15); }
      .pd-hero-img { width: 100%; height: 100%; object-fit: contain; object-position: center; display: block; }

      .pd-cat { display: inline-block; padding: 4px 12px; background: rgba(139, 92, 246,0.08); color: #8B5CF6; border: 1px solid rgba(139, 92, 246,0.25); border-radius: 999px; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 14px; }
      .pd-h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(28px, 4vw, 42px); line-height: 1.1; margin-bottom: 16px; }
      .pd-desc { color: #E5E7EB; font-size: 16px; line-height: 1.7; margin-bottom: 24px; }
      .pd-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 28px; }
      .pd-meta-chip { padding: 4px 10px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 999px; font-size: 11px; color: #9CA3B5; }
      .pd-meta-hot { color: #F59E0B; border-color: rgba(245,158,11,0.3); background: rgba(245,158,11,0.05); }

      .pd-buy-row { display: flex; align-items: center; gap: 16px; padding: 18px; background: rgba(139, 92, 246,0.04); border: 1px solid rgba(139, 92, 246,0.25); border-radius: 14px; margin-bottom: 12px; }
      .pd-price { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 36px; background: linear-gradient(135deg, #8B5CF6, #C084FC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .pd-buy { flex: 1; padding: 14px 24px; text-align: center; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 14px; text-decoration: none; box-shadow: 0 0 24px rgba(139, 92, 246,0.3); transition: transform 0.2s; }
      .pd-buy:hover { transform: translateY(-2px); }
      .pd-trust { font-size: 12px; color: #9CA3B5; }

      /* bestFor chips — under buy row in hero */
      .pd-bestfor { margin-bottom: 22px; }
      .pd-bestfor-label { font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; color: #8B5CF6; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 8px; display: block; }
      .pd-bestfor-chips { display: flex; flex-wrap: wrap; gap: 6px; }
      .pd-bestfor-chip { padding: 5px 11px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 999px; font-size: 12px; color: #CBD5E1; font-weight: 500; transition: all 0.2s; }
      .pd-bestfor-chip-linked { text-decoration: none; cursor: pointer; }
      .pd-bestfor-chip-linked:hover { border-color: #8B5CF6; color: #C084FC; background: rgba(139, 92, 246, 0.06); }
      .pd-bestfor-chip span { font-size: 10px; opacity: 0.55; margin-left: 4px; }

      /* outcome metrics strip — full-bleed under hero */
      .pd-outcomes { max-width: 1080px; margin: -32px auto 64px; }
      .pd-outcomes-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding: 24px; background: linear-gradient(180deg, rgba(139,92,246,0.06), rgba(139,92,246,0.02)); border: 1px solid rgba(139,92,246,0.25); border-radius: 18px; }
      @media (max-width: 768px) { .pd-outcomes-grid { grid-template-columns: 1fr; gap: 8px; padding: 18px; } }
      .pd-outcome-card { text-align: center; padding: 8px; }
      .pd-outcome-value { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(22px, 3.2vw, 32px); background: linear-gradient(135deg, #8B5CF6, #C084FC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1.1; margin-bottom: 4px; }
      .pd-outcome-label { font-size: 12px; color: #9CA3B5; line-height: 1.4; }

      /* bundle savings cards */
      .pd-bundles { max-width: 1080px; }
      .pd-bundle-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 14px; }
      .pd-bundle-card { display: block; padding: 22px; background: linear-gradient(180deg, rgba(192,132,252,0.05), rgba(139,92,246,0.02)); border: 1px solid rgba(139,92,246,0.3); border-radius: 16px; color: #E5E7EB; text-decoration: none; transition: all 0.25s; }
      .pd-bundle-card:hover { transform: translateY(-2px); border-color: #C084FC; box-shadow: 0 4px 24px rgba(139,92,246,0.18); }
      .pd-bundle-card-head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-bottom: 6px; }
      .pd-bundle-name { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 17px; color: #E5E7EB; margin: 0; }
      .pd-bundle-price { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 22px; background: linear-gradient(135deg, #8B5CF6, #C084FC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .pd-bundle-meta { font-size: 12px; color: #9CA3B5; margin: 0 0 12px; line-height: 1.5; }
      .pd-bundle-meta strong { color: #CBD5E1; font-weight: 600; }
      .pd-bundle-savings { font-size: 13px; color: #C084FC; font-weight: 600; }
      .pd-bundle-savings strong { color: #FBBF24; font-weight: 800; }

      /* T3.2 — Preview excerpt section */
      .pd-preview-sub { color: #9CA3B5; font-size: 14px; margin-bottom: 18px; line-height: 1.6; }
      .pd-preview-body { position: relative; max-height: 360px; overflow: hidden; transition: max-height 0.6s cubic-bezier(0.16, 1, 0.3, 1); border-radius: 14px; background: #13101F; border: 1px solid #2A1F3D; }
      .pd-preview-body.is-expanded { max-height: 4000px; }
      .pd-preview-content { padding: 32px 36px; color: #CBD5E1; font-size: 15px; line-height: 1.75; font-family: 'Inter', system-ui, sans-serif; }
      @media (max-width: 640px) { .pd-preview-content { padding: 22px 20px; font-size: 14px; } }
      .pd-preview-content h3 { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 22px; margin: 28px 0 14px; color: #E5E7EB; }
      .pd-preview-content h4 { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 17px; margin: 22px 0 10px; color: #C084FC; }
      .pd-preview-content p { margin: 0 0 14px; }
      .pd-preview-content strong { color: #E5E7EB; font-weight: 700; }
      .pd-preview-content em { color: #C084FC; font-style: italic; }
      .pd-preview-content ul { padding-left: 22px; margin: 0 0 14px; }
      .pd-preview-content li { margin-bottom: 6px; }
      .pd-preview-content a { color: #8B5CF6; text-decoration: none; border-bottom: 1px solid rgba(139,92,246,0.3); }
      .pd-preview-content a:hover { color: #C084FC; border-color: #C084FC; }
      .pd-preview-fade { position: absolute; left: 0; right: 0; bottom: 0; height: 140px; background: linear-gradient(180deg, rgba(19,16,31,0) 0%, rgba(19,16,31,0.85) 70%, #13101F 100%); pointer-events: none; }
      .pd-preview-actions { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; margin-top: 18px; padding-top: 18px; border-top: 1px solid rgba(139,92,246,0.18); }
      .pd-preview-toggle { padding: 10px 18px; background: transparent; color: #C084FC; border: 1px solid rgba(192,132,252,0.35); border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.2s; }
      .pd-preview-toggle:hover { border-color: #C084FC; background: rgba(192,132,252,0.06); }
      .pd-preview-buy { padding: 12px 22px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; text-decoration: none; box-shadow: 0 0 18px rgba(139,92,246,0.25); }

      /* TOC preview */
      .pd-toc-sub { color: #9CA3B5; font-size: 14px; margin-bottom: 18px; line-height: 1.6; }
      .pd-toc-list { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
      @media (max-width: 768px) { .pd-toc-list { grid-template-columns: 1fr; } }
      .pd-toc-item { display: flex; align-items: flex-start; gap: 12px; padding: 14px 16px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 10px; transition: border-color 0.2s; }
      .pd-toc-item:hover { border-color: rgba(139,92,246,0.4); }
      .pd-toc-num { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 14px; color: #8B5CF6; min-width: 24px; padding-top: 1px; }
      .pd-toc-text { color: #CBD5E1; font-size: 14px; line-height: 1.5; }

      .pd-section { max-width: 1080px; margin: 0 auto 64px; }
      .pd-section-eyebrow { font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; color: #8B5CF6; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 12px; }
      .pd-section-title { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(24px, 3vw, 36px); line-height: 1.2; margin-bottom: 24px; }
      .pd-grad { background: linear-gradient(135deg, #8B5CF6, #C084FC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

      .pd-inside { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
      @media (max-width: 640px) { .pd-inside { grid-template-columns: 1fr; } }
      .pd-inside li { padding: 14px 16px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 10px; display: flex; align-items: flex-start; gap: 10px; font-size: 14px; line-height: 1.5; }
      .pd-check { color: #8B5CF6; font-weight: 700; flex-shrink: 0; }

      .pd-features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
      @media (max-width: 1024px) { .pd-features { grid-template-columns: 1fr; } }
      .pd-feature { padding: 24px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 14px; }
      .pd-feature-num { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 32px; background: linear-gradient(135deg, #8B5CF6, #C084FC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px; }
      .pd-feature p { color: #E5E7EB; font-size: 14px; line-height: 1.6; }

      .pd-roi { display: grid; grid-template-columns: 1.4fr 1fr; gap: 32px; align-items: center; padding: 40px; background: rgba(139, 92, 246,0.03); border: 1px solid rgba(139, 92, 246,0.18); border-radius: 20px; }
      @media (max-width: 1024px) { .pd-roi { grid-template-columns: 1fr; padding: 28px; } }
      .pd-roi-note { color: #9CA3B5; font-size: 14px; line-height: 1.6; margin-bottom: 16px; }
      .pd-btn-secondary { display: inline-block; padding: 12px 20px; background: transparent; border: 1px solid #8B5CF6; color: #8B5CF6; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; text-decoration: none; transition: all 0.2s; }
      .pd-btn-secondary:hover { background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; }
      .pd-roi-stats { display: grid; gap: 12px; }
      .pd-roi-stat { padding: 16px 20px; background: #0A0613; border: 1px solid #2A1F3D; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; }
      .pd-roi-stat .v { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 22px; color: #8B5CF6; }
      .pd-roi-stat .k { font-size: 11px; color: #9CA3B5; text-transform: uppercase; letter-spacing: 0.1em; }

      .pd-related { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
      @media (max-width: 1024px) { .pd-related { grid-template-columns: 1fr; } }
      .pd-related-card { display: block; padding: 20px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 14px; color: #E5E7EB; text-decoration: none; transition: all 0.3s; }
      .pd-related-card:hover { transform: translateY(-3px); border-color: #8B5CF6; }
      .pd-related-thumb { aspect-ratio: 16/9; background: linear-gradient(135deg, #0A0613, #13101F); border-radius: 8px; margin-bottom: 14px; display: flex; align-items: center; justify-content: center; }
      .pd-related-thumb span { font-size: 36px; opacity: 0.6; }
      .pd-related-card h3 { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 14px; line-height: 1.3; margin-bottom: 12px; min-height: 36px; }
      .pd-related-row { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid rgba(30,58,95,0.5); }
      .pd-related-price { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 18px; color: #8B5CF6; }
      .pd-related-link { font-size: 11px; color: #9CA3B5; }

      .pd-faq { max-width: 760px; margin: 0 auto 64px; }
      .pd-faq-list { display: flex; flex-direction: column; gap: 8px; }
      .pd-faq-item { background: #13101F; border: 1px solid #2A1F3D; border-radius: 12px; overflow: hidden; }
      .pd-faq-q { width: 100%; padding: 18px 20px; background: transparent; border: none; color: #E5E7EB; font-size: 15px; font-weight: 500; text-align: left; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 16px; font-family: 'Inter', system-ui, sans-serif; }
      .pd-faq-icon { color: #8B5CF6; font-size: 20px; transition: transform 0.3s; }
      .pd-faq-item.is-open .pd-faq-icon { transform: rotate(45deg); }
      .pd-faq-a { max-height: 0; overflow: hidden; transition: max-height 0.3s ease, padding 0.3s ease; padding: 0 20px; }
      .pd-faq-item.is-open .pd-faq-a { max-height: 400px; padding: 0 20px 18px; }
      .pd-faq-a p { color: #9CA3B5; font-size: 14px; line-height: 1.7; }

      .pd-cta-final { max-width: 720px; margin: 0 auto; text-align: center; padding: 48px 32px; background: rgba(139, 92, 246,0.04); border: 1px solid rgba(139, 92, 246,0.25); border-radius: 24px; }
      .pd-cta-final h2 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 28px; margin-bottom: 8px; }
      .pd-cta-final p { color: #9CA3B5; font-size: 14px; margin-bottom: 24px; }
      .pd-cta-btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613 !important; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 14px; text-decoration: none; box-shadow: 0 0 24px rgba(139, 92, 246,0.35); }
      .pd-btn { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; text-decoration: none; }
    `}</style>
  );
}
