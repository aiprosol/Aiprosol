import type { Metadata } from 'next';
import Link from 'next/link';
import glossary from '@/content/glossary.json';

const BASE = 'https://aiprosol.com';

export const metadata: Metadata = {
  title: 'AI Automation Glossary · 28 terms defined',
  description:
    'Plain-English definitions of the terms used in AI automation: AI agent, RAG, vector database, lead scoring, idempotency, MRR, churn, and 21 more.',
  alternates: { canonical: '/glossary' },
  openGraph: {
    title: 'AI Automation Glossary — Aiprosol',
    description: 'Plain-English definitions of 28 terms used in modern AI automation.',
    url: '/glossary',
    type: 'website',
  },
};

export default function GlossaryIndexPage() {
  const byCategory = glossary.reduce((acc, g) => {
    if (!acc[g.category]) acc[g.category] = [];
    acc[g.category].push(g);
    return acc;
  }, {} as Record<string, typeof glossary>);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    '@id': `${BASE}/glossary#set`,
    name: 'Aiprosol AI Automation Glossary',
    description: 'Definitions of terms used in AI automation, workflow design, and the modern operator stack.',
    url: `${BASE}/glossary`,
    hasDefinedTerm: glossary.map((g) => ({
      '@type': 'DefinedTerm',
      '@id': `${BASE}/glossary/${g.slug}#term`,
      name: g.term,
      description: g.definition,
      url: `${BASE}/glossary/${g.slug}`,
      termCode: g.slug,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="glx-page">
        <header className="glx-header">
          <div className="glx-eyebrow">Glossary · {glossary.length} terms</div>
          <h1 className="glx-h1">The AI automation glossary</h1>
          <p className="glx-sub">
            Plain-English definitions of the terms you&apos;ll encounter building or buying AI
            automation. Each one is a definition, more detail, and links to related terms. Click any
            entry for the full breakdown.
          </p>
        </header>

        {Object.entries(byCategory).map(([cat, items]) => (
          <section key={cat} className="glx-section">
            <h2 className="glx-h2">{cat}</h2>
            <div className="glx-grid">
              {items.map((g) => (
                <Link key={g.slug} href={`/glossary/${g.slug}`} className="glx-card">
                  <strong>{g.term}</strong>
                  <span>{g.definition.slice(0, 110)}…</span>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <Styles />
      </div>
    </>
  );
}

function Styles() {
  return (
    <style>{`
      .glx-page { max-width: 1100px; margin: 0 auto; padding: 140px 24px 80px; font-family: 'Inter', system-ui, sans-serif; color: var(--color-text); }
      @media (max-width: 640px) { .glx-page { padding: 110px 16px 60px; } }
      .glx-header { text-align: center; margin-bottom: 64px; }
      .glx-eyebrow { display: inline-block; padding: 6px 14px; background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.3); border-radius: 999px; color: var(--color-cyan); font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 18px; }
      .glx-h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(28px, 4vw, 44px); line-height: 1.08; letter-spacing: -0.02em; margin: 0 0 18px; }
      .glx-sub { color: var(--color-text-dim); font-size: 16px; line-height: 1.7; max-width: 680px; margin: 0 auto; }
      .glx-section { margin-bottom: 48px; }
      .glx-h2 { font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--color-cyan); margin: 0 0 16px; padding-bottom: 8px; border-bottom: 1px solid rgba(139,92,246,0.2); }
      .glx-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px; }
      .glx-card { display: block; padding: 16px 18px; background: rgba(19,16,31,0.5); border: 1px solid var(--color-border); border-radius: 10px; text-decoration: none; color: inherit; transition: border 0.2s, transform 0.2s; }
      .glx-card:hover { border-color: var(--color-cyan); transform: translateY(-2px); }
      .glx-card strong { display: block; font-family: 'Space Grotesk', sans-serif; color: var(--color-text); font-size: 14px; font-weight: 700; margin-bottom: 4px; }
      .glx-card span { font-size: 12px; color: var(--color-text-dim); line-height: 1.5; }
    `}</style>
  );
}
