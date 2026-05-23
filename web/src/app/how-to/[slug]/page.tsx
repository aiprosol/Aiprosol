// ─────────────────────────────────────────────────────────────────────────
// /how-to/[slug] — step-by-step guides.
// LLMs cite HowTo content heavily for "how do I X" queries. Each page
// ships full HowTo schema + steps + estimated time + tools list.
// ─────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import howtos from '@/content/how-to.json';

type HowTo = (typeof howtos)[number];
type Params = { slug: string };
const BASE = 'https://aiprosol.com';

function getBySlug(slug: string): HowTo | undefined {
  return howtos.find((h) => h.slug === slug);
}

export function generateStaticParams() {
  return howtos.map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const h = getBySlug(slug);
  if (!h) return { title: 'Guide not found' };
  return {
    title: h.title,
    description: h.metaDescription,
    alternates: { canonical: `/how-to/${h.slug}` },
    openGraph: {
      title: h.title,
      description: h.metaDescription,
      url: `/how-to/${h.slug}`,
      type: 'article',
    },
  };
}

export default async function HowToPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const h = getBySlug(slug);
  if (!h) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'HowTo',
        '@id': `${BASE}/how-to/${h.slug}#howto`,
        name: h.h1,
        description: h.metaDescription,
        totalTime: h.totalTime,
        estimatedCost: { '@type': 'MonetaryAmount', currency: 'USD', value: h.estCost },
        tool: h.tools.map((t) => ({ '@type': 'HowToTool', name: t })),
        step: h.steps.map((s, i) => ({
          '@type': 'HowToStep',
          position: i + 1,
          name: s.name,
          text: s.text,
          url: `${BASE}/how-to/${h.slug}#step-${i + 1}`,
        })),
        author: { '@id': `${BASE}/#srijan-paudel` },
        publisher: { '@id': `${BASE}/#organization` },
      },
      {
        '@type': 'Article',
        headline: h.h1,
        description: h.metaDescription,
        author: { '@id': `${BASE}/#srijan-paudel` },
        publisher: { '@id': `${BASE}/#organization` },
        datePublished: '2026-05-15',
        dateModified: '2026-05-15',
        url: `${BASE}/how-to/${h.slug}`,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
          { '@type': 'ListItem', position: 2, name: 'How-To Guides', item: `${BASE}/how-to` },
          { '@type': 'ListItem', position: 3, name: h.title, item: `${BASE}/how-to/${h.slug}` },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="ht-page">
        <header className="ht-header">
          <nav className="ht-bc">
            <Link href="/">Home</Link> · <Link href="/how-to">How-To Guides</Link> · <span>{h.h1}</span>
          </nav>
          <div className="ht-eyebrow">How-To Guide</div>
          <h1 className="ht-h1">{h.h1}</h1>
          <p className="ht-summary">{h.summary}</p>
          <div className="ht-meta">
            <div className="ht-meta-item"><strong>Time</strong>{prettyDuration(h.totalTime)}</div>
            <div className="ht-meta-item"><strong>Cost</strong>{h.estCost}</div>
            <div className="ht-meta-item"><strong>Steps</strong>{h.steps.length}</div>
          </div>
        </header>

        <section>
          <h2 className="ht-h2">Tools you&apos;ll need</h2>
          <div className="ht-tools">
            {h.tools.map((t, i) => (<span key={i} className="ht-tool">{t}</span>))}
          </div>
        </section>

        <section>
          <h2 className="ht-h2">Steps</h2>
          <ol className="ht-steps">
            {h.steps.map((s, i) => (
              <li key={i} className="ht-step" id={`step-${i + 1}`}>
                <div className="ht-step-num">{i + 1}</div>
                <div className="ht-step-body">
                  <h3 className="ht-step-name">{s.name}</h3>
                  <p className="ht-step-text">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <aside className="ht-cta">
          <h3>Want this built for you?</h3>
          <p>The free 60-second ROI Audit produces a personalised plan + price quote.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/roi-audit" className="ht-cta-btn">Get free ROI Audit →</Link>
            {h.relatedProduct && (
              <Link href={`/products/${h.relatedProduct}`} className="ht-cta-btn-alt">
                Or buy the related playbook →
              </Link>
            )}
          </div>
        </aside>

        {(h.relatedProduct || h.relatedComparison) && (
          <nav className="ht-related">
            <h3>Related</h3>
            <ul>
              {h.relatedProduct && (
                <li><Link href={`/products/${h.relatedProduct}`}>Related product</Link></li>
              )}
              {h.relatedComparison && (
                <li><Link href={`/compare/${h.relatedComparison}`}>Related comparison</Link></li>
              )}
              <li><Link href="/glossary">AI automation glossary</Link></li>
            </ul>
          </nav>
        )}

        <Styles />
      </article>
    </>
  );
}

function prettyDuration(iso: string): string {
  const m = iso.match(/^PT(\d+)([HM])$/);
  if (!m) return iso;
  const [, n, unit] = m;
  return unit === 'H' ? `${n}h` : `${n}min`;
}

function Styles() {
  return (
    <style>{`
      .ht-page { max-width: 860px; margin: 0 auto; padding: 140px 24px 80px; font-family: 'Inter', system-ui, sans-serif; color: var(--color-text); }
      @media (max-width: 640px) { .ht-page { padding: 110px 16px 60px; } }
      .ht-bc { font-size: 12px; color: var(--color-muted); margin-bottom: 18px; }
      .ht-bc a { color: var(--color-cyan); text-decoration: none; }
      .ht-eyebrow { display: inline-block; padding: 6px 14px; background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.3); border-radius: 999px; color: var(--color-cyan); font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 18px; }
      .ht-h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(28px, 4vw, 40px); line-height: 1.1; margin: 0 0 16px; }
      .ht-summary { font-size: 16px; color: var(--color-text-dim); line-height: 1.7; margin: 0 0 24px; }
      .ht-meta { display: flex; gap: 24px; flex-wrap: wrap; margin: 0 0 8px; padding: 16px 20px; background: rgba(19,16,31,0.5); border: 1px solid var(--color-border); border-radius: 10px; }
      .ht-meta-item { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: var(--color-text); }
      .ht-meta-item strong { font-family: 'Space Grotesk', sans-serif; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--color-cyan); }
      .ht-h2 { font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 700; margin: 48px 0 14px; }
      .ht-tools { display: flex; flex-wrap: wrap; gap: 8px; }
      .ht-tool { padding: 6px 12px; background: rgba(19,16,31,0.5); border: 1px solid var(--color-border); border-radius: 999px; font-size: 12px; color: var(--color-text-dim); font-family: 'JetBrains Mono', monospace; }
      .ht-steps { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 14px; counter-reset: step; }
      .ht-step { display: grid; grid-template-columns: 48px 1fr; gap: 16px; padding: 18px 22px; background: rgba(19,16,31,0.5); border: 1px solid var(--color-border); border-left: 3px solid var(--color-cyan); border-radius: 10px; }
      .ht-step-num { font-family: 'Space Grotesk', sans-serif; font-size: 24px; font-weight: 800; color: var(--color-cyan); line-height: 1; }
      .ht-step-name { font-family: 'Space Grotesk', sans-serif; font-size: 15px; font-weight: 700; color: var(--color-text); margin: 0 0 6px; }
      .ht-step-text { color: var(--color-text-dim); font-size: 14px; line-height: 1.7; margin: 0; }
      .ht-cta { margin: 56px 0 24px; padding: 28px 32px; background: linear-gradient(135deg, rgba(139,92,246,0.10), rgba(192,132,252,0.10)); border: 1px solid rgba(139,92,246,0.3); border-radius: 14px; text-align: center; }
      .ht-cta h3 { font-family: 'Space Grotesk', sans-serif; font-size: 18px; margin: 0 0 8px; font-weight: 700; }
      .ht-cta p { color: var(--color-text-dim); margin: 0 0 16px; font-size: 14px; }
      .ht-cta-btn { display: inline-block; padding: 11px 22px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; text-decoration: none; font-size: 13px; }
      .ht-cta-btn-alt { display: inline-block; padding: 11px 22px; background: transparent; color: var(--color-cyan); border: 1px solid var(--color-cyan); border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; text-decoration: none; font-size: 13px; }
      .ht-related { margin-top: 36px; padding-top: 20px; border-top: 1px solid var(--color-border); }
      .ht-related h3 { font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--color-muted); margin: 0 0 10px; }
      .ht-related ul { list-style: none; padding: 0; margin: 0; display: flex; gap: 12px; flex-wrap: wrap; }
      .ht-related a { font-size: 13px; color: var(--color-cyan); text-decoration: none; }
      .ht-related a:hover { color: var(--color-text); }
    `}</style>
  );
}
