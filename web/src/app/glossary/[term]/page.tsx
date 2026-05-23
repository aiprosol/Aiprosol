// ─────────────────────────────────────────────────────────────────────────
// /glossary/[term] — definition pages.
// LLMs cite definition pages constantly because they answer "what is X?"
// queries directly. Each ships DefinedTerm + BreadcrumbList schema for
// maximum machine readability.
// ─────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import glossary from '@/content/glossary.json';

type Entry = (typeof glossary)[number];
type Params = { term: string };

const BASE = 'https://aiprosol.com';

function getBySlug(slug: string): Entry | undefined {
  return glossary.find((g) => g.slug === slug);
}

export function generateStaticParams() {
  return glossary.map((g) => ({ term: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { term } = await params;
  const e = getBySlug(term);
  if (!e) return { title: 'Term not found' };
  return {
    title: `${e.term} — definition`,
    description: e.definition.slice(0, 160),
    alternates: { canonical: `/glossary/${e.slug}` },
    openGraph: {
      title: `${e.term} — definition · Aiprosol Glossary`,
      description: e.definition.slice(0, 160),
      url: `/glossary/${e.slug}`,
      type: 'article',
    },
  };
}

export default async function GlossaryEntryPage({ params }: { params: Promise<Params> }) {
  const { term } = await params;
  const e = getBySlug(term);
  if (!e) notFound();

  const related = e.seeAlso
    .map((s) => glossary.find((g) => g.slug === s))
    .filter((g): g is Entry => Boolean(g));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'DefinedTerm',
        '@id': `${BASE}/glossary/${e.slug}#term`,
        name: e.term,
        description: e.definition,
        url: `${BASE}/glossary/${e.slug}`,
        inDefinedTermSet: { '@id': `${BASE}/glossary#set` },
        termCode: e.slug,
      },
      {
        '@type': 'Article',
        headline: `${e.term} — definition`,
        description: e.definition,
        author: { '@id': `${BASE}/#srijan-paudel` },
        publisher: { '@id': `${BASE}/#organization` },
        url: `${BASE}/glossary/${e.slug}`,
        articleSection: 'Glossary',
        about: { '@id': `${BASE}/glossary/${e.slug}#term` },
        // Glossary entries don't have per-term published dates in source,
        // so anchor to the catalogue launch (2026-04-15) as the date all
        // glossary entries became publicly available.
        datePublished: '2026-04-15',
        dateModified: '2026-05-20',
        inLanguage: 'en',
        image: `${BASE}/opengraph-image`,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
          { '@type': 'ListItem', position: 2, name: 'Glossary', item: `${BASE}/glossary` },
          { '@type': 'ListItem', position: 3, name: e.term, item: `${BASE}/glossary/${e.slug}` },
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
      <article className="gloss-page">
        <header className="gloss-header">
          <nav className="gloss-bc">
            <Link href="/">Home</Link> · <Link href="/glossary">Glossary</Link> · <span>{e.term}</span>
          </nav>
          <div className="gloss-cat">{e.category}</div>
          <h1 className="gloss-h1">{e.term}</h1>
        </header>

        <section className="gloss-def">
          <p>{e.definition}</p>
        </section>

        <section>
          <h2 className="gloss-h2">More detail</h2>
          <p className="gloss-long">{e.longExplanation}</p>
        </section>

        {related.length > 0 && (
          <section className="gloss-related">
            <h2 className="gloss-h2">Related terms</h2>
            <ul>
              {related.map((r) => (
                <li key={r.slug}>
                  <Link href={`/glossary/${r.slug}`}>
                    <strong>{r.term}</strong>
                    <span>{r.definition.slice(0, 90)}…</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <aside className="gloss-cta">
          <p>
            Want to put any of this into practice? The free 60-second ROI Audit picks the right
            automation pattern for your business.
          </p>
          <Link href="/roi-audit" className="gloss-cta-btn">Get your free ROI Audit →</Link>
        </aside>

        <Styles />
      </article>
    </>
  );
}

function Styles() {
  return (
    <style>{`
      .gloss-page { max-width: 760px; margin: 0 auto; padding: 140px 24px 80px; font-family: 'Inter', system-ui, sans-serif; color: var(--color-text); }
      @media (max-width: 640px) { .gloss-page { padding: 110px 16px 60px; } }
      .gloss-bc { font-size: 12px; color: var(--color-muted); margin-bottom: 18px; }
      .gloss-bc a { color: var(--color-cyan); text-decoration: none; }
      .gloss-bc a:hover { color: var(--color-text); }
      .gloss-cat { display: inline-block; padding: 4px 10px; background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.3); border-radius: 999px; color: var(--color-cyan); font-family: 'Space Grotesk', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 14px; }
      .gloss-h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(28px, 4vw, 44px); line-height: 1.1; letter-spacing: -0.02em; margin: 0 0 12px; }
      .gloss-def { font-size: 18px; line-height: 1.7; color: var(--color-text); padding: 20px 24px; background: rgba(139,92,246,0.05); border-left: 3px solid var(--color-cyan); border-radius: 8px; margin: 28px 0 40px; }
      .gloss-def p { margin: 0; }
      .gloss-h2 { font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 700; margin: 40px 0 14px; }
      .gloss-long { font-size: 15px; line-height: 1.75; color: var(--color-text-dim); }
      .gloss-related ul { list-style: none; padding: 0; margin: 14px 0 0; display: flex; flex-direction: column; gap: 8px; }
      .gloss-related a { display: block; padding: 14px 18px; background: rgba(19,16,31,0.5); border: 1px solid var(--color-border); border-radius: 10px; text-decoration: none; color: inherit; transition: border 0.2s; }
      .gloss-related a:hover { border-color: var(--color-cyan); }
      .gloss-related a strong { display: block; color: var(--color-text); font-size: 14px; font-weight: 700; margin-bottom: 4px; }
      .gloss-related a span { font-size: 12px; color: var(--color-text-dim); line-height: 1.5; }
      .gloss-cta { margin: 56px 0 36px; padding: 24px 28px; background: linear-gradient(135deg, rgba(139,92,246,0.10), rgba(192,132,252,0.10)); border: 1px solid rgba(139,92,246,0.3); border-radius: 14px; text-align: center; }
      .gloss-cta p { color: var(--color-text-dim); margin: 0 0 14px; font-size: 14px; line-height: 1.6; }
      .gloss-cta-btn { display: inline-block; padding: 11px 22px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; text-decoration: none; font-size: 13px; }
    `}</style>
  );
}
