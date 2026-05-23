// ─────────────────────────────────────────────────────────────────────────
// /industries/[slug] — industry-specific landing pages.
// High commercial intent: "AI automation for [industry]" queries convert.
// Each page ships: Service + FAQ + BreadcrumbList + Speakable schema.
// ─────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import industries from '@/content/industries.json';

type Industry = (typeof industries)[number];
type Params = { slug: string };
const BASE = 'https://aiprosol.com';

function getBySlug(slug: string): Industry | undefined {
  return industries.find((i) => i.slug === slug);
}

export function generateStaticParams() {
  return industries.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const ind = getBySlug(slug);
  if (!ind) return { title: 'Industry not found' };
  return {
    title: ind.pageTitle,
    description: ind.metaDescription,
    alternates: { canonical: `/industries/${ind.slug}` },
    openGraph: {
      title: ind.pageTitle,
      description: ind.metaDescription,
      url: `/industries/${ind.slug}`,
      type: 'website',
    },
  };
}

export default async function IndustryPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const ind = getBySlug(slug);
  if (!ind) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${BASE}/industries/${ind.slug}#service`,
        name: `AI Automation for ${ind.name}`,
        description: ind.metaDescription,
        provider: { '@id': `${BASE}/#organization` },
        serviceType: 'AI Automation Consulting',
        audience: {
          '@type': 'BusinessAudience',
          audienceType: `${ind.name} firms`,
          name: `${ind.name} firms`,
        },
        areaServed: { '@type': 'Place', name: 'Worldwide' },
        url: `${BASE}/industries/${ind.slug}`,
        // Offer.price is required by schema.org. Services are engagement-priced
        // ranging $997–$7,997/mo across managed plans — use the floor as the
        // explicit price and the priceSpecification for the full range.
        offers: {
          '@type': 'Offer',
          availability: 'https://schema.org/InStock',
          price: '997',
          priceCurrency: 'USD',
          url: `${BASE}/industries/${ind.slug}`,
          priceSpecification: {
            '@type': 'PriceSpecification',
            minPrice: 997,
            maxPrice: 7997,
            priceCurrency: 'USD',
            description: 'Managed plan tiers: Starter $997/mo · Growth $2,997/mo · Enterprise $7,997/mo',
          },
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: ind.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
          { '@type': 'ListItem', position: 2, name: 'Industries', item: `${BASE}/industries` },
          { '@type': 'ListItem', position: 3, name: ind.name, item: `${BASE}/industries/${ind.slug}` },
        ],
      },
      {
        '@type': 'WebPage',
        '@id': `${BASE}/industries/${ind.slug}`,
        url: `${BASE}/industries/${ind.slug}`,
        name: ind.pageTitle,
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['.ind-h1', '.ind-tagline', '.ind-intro'],
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="ind-page">
        <header className="ind-hero">
          <nav className="ind-bc">
            <Link href="/">Home</Link> · <Link href="/industries">Industries</Link> · <span>{ind.name}</span>
          </nav>
          <div className="ind-eyebrow">Industry · {ind.name}</div>
          <h1 className="ind-h1">{ind.hero.h1}</h1>
          <p className="ind-tagline">{ind.hero.tagline}</p>
          <p className="ind-intro">{ind.hero.intro}</p>
        </header>

        <section className="ind-metrics">
          {ind.metrics.map((m, i) => (
            <div key={i} className="ind-metric">
              <div className="ind-metric-value">{m.value}</div>
              <div className="ind-metric-label">{m.label}</div>
            </div>
          ))}
        </section>

        <section>
          <h2 className="ind-h2">Use cases we deliver</h2>
          <div className="ind-uc-list">
            {ind.useCases.map((u, i) => (
              <div key={i} className="ind-uc">
                <h3 className="ind-uc-title">{u.title}</h3>
                <p className="ind-uc-desc">{u.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="ind-compliance">
          <h2 className="ind-h2">Compliance + integration notes</h2>
          <p>{ind.compliance}</p>
        </section>

        <section>
          <h2 className="ind-h2">FAQs</h2>
          <div className="ind-faqs">
            {ind.faqs.map((f, i) => (
              <details key={i} className="ind-faq">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <aside className="ind-cta">
          <h3>Want a {ind.name}-specific ROI estimate?</h3>
          <p>The free 60-second ROI Audit produces a personalised reclaim estimate using {ind.name.toLowerCase()}-industry benchmarks.</p>
          <Link href="/roi-audit" className="ind-cta-btn">Get your free ROI Audit →</Link>
        </aside>

        <nav className="ind-related">
          <h3>Other industries we serve</h3>
          <ul>
            {industries.filter((x) => x.slug !== ind.slug).map((x) => (
              <li key={x.slug}><Link href={`/industries/${x.slug}`}>{x.name}</Link></li>
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
      .ind-page { max-width: 880px; margin: 0 auto; padding: 140px 24px 80px; font-family: 'Inter', system-ui, sans-serif; color: var(--color-text); }
      @media (max-width: 640px) { .ind-page { padding: 110px 16px 60px; } }
      .ind-hero { margin-bottom: 56px; }
      .ind-bc { font-size: 12px; color: var(--color-muted); margin-bottom: 18px; }
      .ind-bc a { color: var(--color-cyan); text-decoration: none; }
      .ind-eyebrow { display: inline-block; padding: 6px 14px; background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.3); border-radius: 999px; color: var(--color-cyan); font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 18px; }
      .ind-h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(32px, 4.5vw, 48px); line-height: 1.08; letter-spacing: -0.02em; margin: 0 0 14px; }
      .ind-tagline { font-size: 18px; color: var(--color-text-dim); margin: 0 0 18px; line-height: 1.6; }
      .ind-intro { font-size: 15px; color: var(--color-text-dim); margin: 0; line-height: 1.7; max-width: 740px; }
      .ind-metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin: 0 0 56px; }
      .ind-metric { padding: 20px 22px; background: rgba(19,16,31,0.5); border: 1px solid var(--color-border); border-left: 3px solid var(--color-cyan); border-radius: 10px; }
      .ind-metric-value { font-family: 'Space Grotesk', sans-serif; font-size: 22px; font-weight: 800; color: var(--color-text); margin-bottom: 6px; }
      .ind-metric-label { font-size: 12px; color: var(--color-text-dim); line-height: 1.5; }
      .ind-h2 { font-family: 'Space Grotesk', sans-serif; font-size: 22px; font-weight: 700; margin: 56px 0 18px; }
      .ind-uc-list { display: grid; grid-template-columns: 1fr; gap: 14px; }
      .ind-uc { padding: 18px 22px; background: rgba(19,16,31,0.5); border: 1px solid var(--color-border); border-radius: 10px; }
      .ind-uc-title { font-family: 'Space Grotesk', sans-serif; font-size: 15px; font-weight: 700; color: var(--color-cyan); margin: 0 0 8px; }
      .ind-uc-desc { color: var(--color-text-dim); font-size: 14px; line-height: 1.6; margin: 0; }
      .ind-compliance { padding: 22px 26px; background: rgba(139,92,246,0.05); border-left: 3px solid var(--color-cyan); border-radius: 8px; margin: 24px 0; }
      .ind-compliance p { margin: 0; color: var(--color-text-dim); font-size: 14px; line-height: 1.7; }
      .ind-faqs { display: flex; flex-direction: column; gap: 8px; }
      .ind-faq { padding: 16px 20px; background: rgba(19,16,31,0.5); border: 1px solid var(--color-border); border-radius: 10px; }
      .ind-faq summary { cursor: pointer; font-weight: 600; color: var(--color-text); font-size: 15px; }
      .ind-faq summary:hover { color: var(--color-cyan); }
      .ind-faq p { margin: 14px 0 0; color: var(--color-text-dim); line-height: 1.7; font-size: 14px; }
      .ind-cta { margin: 56px 0 36px; padding: 28px 32px; background: linear-gradient(135deg, rgba(139,92,246,0.10), rgba(192,132,252,0.10)); border: 1px solid rgba(139,92,246,0.3); border-radius: 14px; text-align: center; }
      .ind-cta h3 { font-family: 'Space Grotesk', sans-serif; font-size: 20px; margin: 0 0 8px; font-weight: 700; }
      .ind-cta p { color: var(--color-text-dim); margin: 0 0 18px; font-size: 14px; }
      .ind-cta-btn { display: inline-block; padding: 12px 22px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; text-decoration: none; font-size: 14px; }
      .ind-related { margin-top: 48px; padding-top: 24px; border-top: 1px solid var(--color-border); }
      .ind-related h3 { font-family: 'Space Grotesk', sans-serif; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--color-muted); margin: 0 0 12px; }
      .ind-related ul { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 8px; }
      .ind-related a { display: inline-block; padding: 6px 12px; background: rgba(19,16,31,0.5); border: 1px solid var(--color-border); border-radius: 999px; color: var(--color-cyan); text-decoration: none; font-size: 13px; }
      .ind-related a:hover { border-color: var(--color-cyan); color: var(--color-text); }
    `}</style>
  );
}
