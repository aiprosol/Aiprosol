// ─────────────────────────────────────────────────────────────────────────
// /compare/[slug] — head-to-head comparison pages.
// High GEO cite-rate: AI engines cite "X vs Y" pages disproportionately
// because they answer comparison queries directly with structured tables.
// Each page ships Comparison + FAQ + BreadcrumbList schema.
// ─────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import comparisons from '@/content/comparisons.json';

type Comparison = (typeof comparisons)[number];
type Params = { slug: string };

const BASE = 'https://aiprosol.com';

function getBySlug(slug: string): Comparison | undefined {
  return comparisons.find((c) => c.slug === slug);
}

export function generateStaticParams() {
  return comparisons.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const c = getBySlug(slug);
  if (!c) return { title: 'Comparison not found' };
  return {
    title: c.title,
    description: c.metaDescription,
    alternates: { canonical: `/compare/${c.slug}` },
    openGraph: {
      title: c.title,
      description: c.metaDescription,
      url: `/compare/${c.slug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: c.title,
      description: c.metaDescription,
    },
  };
}

export default async function ComparePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const c = getBySlug(slug);
  if (!c) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${BASE}/compare/${c.slug}#article`,
        headline: c.h1,
        description: c.metaDescription,
        url: `${BASE}/compare/${c.slug}`,
        datePublished: '2026-05-15',
        dateModified: '2026-05-15',
        author: { '@id': `${BASE}/#srijan-paudel` },
        publisher: { '@id': `${BASE}/#organization` },
        mainEntityOfPage: `${BASE}/compare/${c.slug}`,
        articleSection: 'Comparison',
        about: { '@id': `${BASE}/#organization` },
      },
      {
        '@type': 'FAQPage',
        mainEntity: c.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
          { '@type': 'ListItem', position: 2, name: 'Compare', item: `${BASE}/compare` },
          { '@type': 'ListItem', position: 3, name: c.title, item: `${BASE}/compare/${c.slug}` },
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
      <article className="cmp-page">
        <header className="cmp-header">
          <nav className="cmp-bc">
            <Link href="/">Home</Link> · <Link href="/compare">Compare</Link> · <span>{c.title}</span>
          </nav>
          <h1 className="cmp-h1">{c.h1}</h1>
          <p className="cmp-sub">{c.summary}</p>
        </header>

        <section>
          <h2 className="cmp-h2">Side-by-side comparison</h2>
          <div className="cmp-tbl-wrap">
            <table className="cmp-tbl">
              <thead>
                <tr>{c.table.headers.map((h) => (<th key={h}>{h}</th>))}</tr>
              </thead>
              <tbody>
                {c.table.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} className={j === 0 ? 'cmp-tbl-label' : 'cmp-tbl-cell'}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="cmp-verdict">
          <h2 className="cmp-h2">The verdict</h2>
          <p className="cmp-verdict-text">{c.verdict}</p>
        </section>

        <section>
          <h2 className="cmp-h2">FAQs</h2>
          <div className="cmp-faqs">
            {c.faqs.map((f, i) => (
              <details key={i} className="cmp-faq">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <aside className="cmp-cta">
          <h3>Want a tailored answer for your business?</h3>
          <p>The free 60-second ROI Audit picks the right option for your stack + scale + revenue model.</p>
          <Link href="/roi-audit" className="cmp-cta-btn">Get your free ROI Audit →</Link>
        </aside>

        <nav className="cmp-related">
          <h3>Other comparisons</h3>
          <ul>
            {comparisons.filter((x) => x.slug !== c.slug).map((x) => (
              <li key={x.slug}>
                <Link href={`/compare/${x.slug}`}>{x.title}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <Styles />
      </article>
    </>
  );
}

function Styles() {
  return (
    <style>{`
      .cmp-page { max-width: 880px; margin: 0 auto; padding: 140px 24px 80px; font-family: 'Inter', system-ui, sans-serif; color: var(--color-text); }
      @media (max-width: 640px) { .cmp-page { padding: 110px 16px 60px; } }
      .cmp-header { margin-bottom: 48px; }
      .cmp-bc { font-size: 12px; color: var(--color-muted); margin-bottom: 18px; }
      .cmp-bc a { color: var(--color-cyan); text-decoration: none; }
      .cmp-bc a:hover { color: var(--color-text); }
      .cmp-h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(28px, 4vw, 42px); line-height: 1.1; letter-spacing: -0.02em; margin: 0 0 18px; }
      .cmp-sub { font-size: 16px; line-height: 1.7; color: var(--color-text-dim); max-width: 740px; }
      .cmp-h2 { font-family: 'Space Grotesk', sans-serif; font-size: 22px; font-weight: 700; margin: 56px 0 18px; }
      .cmp-tbl-wrap { overflow-x: auto; border: 1px solid var(--color-border); border-radius: 12px; background: rgba(19,16,31,0.5); }
      .cmp-tbl { width: 100%; border-collapse: collapse; font-size: 14px; }
      .cmp-tbl th, .cmp-tbl td { padding: 14px 18px; text-align: left; vertical-align: top; border-bottom: 1px solid var(--color-border); }
      .cmp-tbl thead th { background: rgba(139,92,246,0.08); font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-cyan); }
      .cmp-tbl tbody tr:last-child td { border-bottom: 0; }
      .cmp-tbl-label { font-weight: 600; color: var(--color-text); }
      .cmp-tbl-cell { color: var(--color-text-dim); }
      .cmp-verdict { padding: 24px 28px; background: rgba(139,92,246,0.05); border-left: 3px solid var(--color-cyan); border-radius: 8px; margin: 40px 0; }
      .cmp-verdict-text { font-size: 16px; line-height: 1.7; margin: 0; color: var(--color-text); font-style: italic; }
      .cmp-faqs { display: flex; flex-direction: column; gap: 8px; }
      .cmp-faq { padding: 16px 20px; background: rgba(19,16,31,0.5); border: 1px solid var(--color-border); border-radius: 10px; }
      .cmp-faq summary { cursor: pointer; font-weight: 600; color: var(--color-text); font-size: 15px; }
      .cmp-faq summary:hover { color: var(--color-cyan); }
      .cmp-faq p { margin: 14px 0 0; color: var(--color-text-dim); line-height: 1.7; font-size: 14px; }
      .cmp-cta { margin: 56px 0 36px; padding: 28px 32px; background: linear-gradient(135deg, rgba(139,92,246,0.10), rgba(192,132,252,0.10)); border: 1px solid rgba(139,92,246,0.3); border-radius: 14px; text-align: center; }
      .cmp-cta h3 { font-family: 'Space Grotesk', sans-serif; font-size: 20px; margin: 0 0 8px; font-weight: 700; }
      .cmp-cta p { color: var(--color-text-dim); margin: 0 0 18px; font-size: 14px; }
      .cmp-cta-btn { display: inline-block; padding: 12px 22px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; text-decoration: none; font-size: 14px; box-shadow: 0 0 24px rgba(139,92,246,0.25); }
      .cmp-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 0 32px rgba(139,92,246,0.4); }
      .cmp-related { margin-top: 56px; padding-top: 24px; border-top: 1px solid var(--color-border); }
      .cmp-related h3 { font-family: 'Space Grotesk', sans-serif; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--color-muted); margin: 0 0 12px; }
      .cmp-related ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
      .cmp-related a { color: var(--color-cyan); text-decoration: none; font-size: 14px; }
      .cmp-related a:hover { color: var(--color-text); }
    `}</style>
  );
}
