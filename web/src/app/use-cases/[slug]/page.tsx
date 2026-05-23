// ─────────────────────────────────────────────────────────────────────────
// /use-cases/[slug] — problem-shaped landing pages.
// Captures "how to automate X" queries with rich Service + FAQ schema.
// ─────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import useCases from '@/content/use-cases.json';

type UseCase = (typeof useCases)[number];
type Params = { slug: string };
const BASE = 'https://aiprosol.com';

function getBySlug(slug: string): UseCase | undefined {
  return useCases.find((u) => u.slug === slug);
}

export function generateStaticParams() {
  return useCases.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const u = getBySlug(slug);
  if (!u) return { title: 'Use case not found' };
  return {
    title: u.pageTitle,
    description: u.metaDescription,
    alternates: { canonical: `/use-cases/${u.slug}` },
    openGraph: {
      title: u.pageTitle,
      description: u.metaDescription,
      url: `/use-cases/${u.slug}`,
      type: 'website',
    },
  };
}

export default async function UseCasePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const u = getBySlug(slug);
  if (!u) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${BASE}/use-cases/${u.slug}#service`,
        name: u.name,
        description: u.metaDescription,
        provider: { '@id': `${BASE}/#organization` },
        serviceType: u.name,
        areaServed: { '@type': 'Place', name: 'Worldwide' },
        url: `${BASE}/use-cases/${u.slug}`,
        // Offer.price is required by schema.org. Use the managed-plan floor
        // ($997/mo) as the explicit price; full range in priceSpecification.
        offers: {
          '@type': 'Offer',
          availability: 'https://schema.org/InStock',
          price: '997',
          priceCurrency: 'USD',
          url: `${BASE}/use-cases/${u.slug}`,
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
        mainEntity: u.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
          { '@type': 'ListItem', position: 2, name: 'Use Cases', item: `${BASE}/use-cases` },
          { '@type': 'ListItem', position: 3, name: u.name, item: `${BASE}/use-cases/${u.slug}` },
        ],
      },
      {
        '@type': 'WebPage',
        '@id': `${BASE}/use-cases/${u.slug}`,
        url: `${BASE}/use-cases/${u.slug}`,
        name: u.pageTitle,
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['.uc-h1', '.uc-tagline', '.uc-intro'],
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
      <article className="uc-page">
        <header className="uc-hero">
          <nav className="uc-bc">
            <Link href="/">Home</Link> · <Link href="/use-cases">Use Cases</Link> · <span>{u.name}</span>
          </nav>
          <div className="uc-eyebrow">Use Case</div>
          <h1 className="uc-h1">{u.h1}</h1>
          <p className="uc-tagline">{u.tagline}</p>
          <p className="uc-intro">{u.intro}</p>
        </header>

        <section className="uc-metrics">
          {u.metrics.map((m, i) => (
            <div key={i} className="uc-metric">
              <div className="uc-metric-value">{m.value}</div>
              <div className="uc-metric-label">{m.label}</div>
            </div>
          ))}
        </section>

        <section>
          <h2 className="uc-h2">What we deliver</h2>
          <ul className="uc-outcomes">
            {u.outcomes.map((o, i) => (<li key={i}>{o}</li>))}
          </ul>
        </section>

        <section className="uc-outputs">
          <h2 className="uc-h2">Tangible outputs</h2>
          <p>{u.outputs}</p>
        </section>

        <section>
          <h2 className="uc-h2">FAQs</h2>
          <div className="uc-faqs">
            {u.faqs.map((f, i) => (
              <details key={i} className="uc-faq">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <aside className="uc-cta">
          <h3>See how {u.name.toLowerCase()} would work for your business</h3>
          <p>The free 60-second ROI Audit produces a personalised plan for this use case.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/roi-audit" className="uc-cta-btn">Get free ROI Audit →</Link>
            {u.relatedProductSlug && (
              <Link href={`/products/${u.relatedProductSlug}`} className="uc-cta-btn-alt">
                Or browse the related playbook
              </Link>
            )}
          </div>
        </aside>

        <Styles />
      </article>
    </>
  );
}

function Styles() {
  return (
    <style>{`
      .uc-page { max-width: 880px; margin: 0 auto; padding: 140px 24px 80px; font-family: 'Inter', system-ui, sans-serif; color: var(--color-text); }
      @media (max-width: 640px) { .uc-page { padding: 110px 16px 60px; } }
      .uc-hero { margin-bottom: 56px; }
      .uc-bc { font-size: 12px; color: var(--color-muted); margin-bottom: 18px; }
      .uc-bc a { color: var(--color-cyan); text-decoration: none; }
      .uc-eyebrow { display: inline-block; padding: 6px 14px; background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.3); border-radius: 999px; color: var(--color-cyan); font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 18px; }
      .uc-h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(32px, 4.5vw, 48px); line-height: 1.08; letter-spacing: -0.02em; margin: 0 0 14px; }
      .uc-tagline { font-size: 18px; color: var(--color-text); margin: 0 0 18px; line-height: 1.6; }
      .uc-intro { font-size: 15px; color: var(--color-text-dim); margin: 0; line-height: 1.7; }
      .uc-metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin: 0 0 56px; }
      .uc-metric { padding: 20px 22px; background: rgba(19,16,31,0.5); border: 1px solid var(--color-border); border-left: 3px solid var(--color-cyan); border-radius: 10px; }
      .uc-metric-value { font-family: 'Space Grotesk', sans-serif; font-size: 22px; font-weight: 800; color: var(--color-text); margin-bottom: 6px; }
      .uc-metric-label { font-size: 12px; color: var(--color-text-dim); line-height: 1.5; }
      .uc-h2 { font-family: 'Space Grotesk', sans-serif; font-size: 22px; font-weight: 700; margin: 56px 0 18px; }
      .uc-outcomes { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
      .uc-outcomes li { padding: 12px 18px; background: rgba(19,16,31,0.5); border-left: 3px solid var(--color-cyan); border-radius: 6px; color: var(--color-text-dim); font-size: 14px; line-height: 1.6; }
      .uc-outputs { padding: 22px 26px; background: rgba(139,92,246,0.05); border-radius: 10px; margin: 24px 0; }
      .uc-outputs p { margin: 0; color: var(--color-text-dim); font-size: 14px; line-height: 1.7; }
      .uc-faqs { display: flex; flex-direction: column; gap: 8px; }
      .uc-faq { padding: 16px 20px; background: rgba(19,16,31,0.5); border: 1px solid var(--color-border); border-radius: 10px; }
      .uc-faq summary { cursor: pointer; font-weight: 600; color: var(--color-text); font-size: 15px; }
      .uc-faq p { margin: 14px 0 0; color: var(--color-text-dim); line-height: 1.7; font-size: 14px; }
      .uc-cta { margin: 56px 0 36px; padding: 28px 32px; background: linear-gradient(135deg, rgba(139,92,246,0.10), rgba(192,132,252,0.10)); border: 1px solid rgba(139,92,246,0.3); border-radius: 14px; text-align: center; }
      .uc-cta h3 { font-family: 'Space Grotesk', sans-serif; font-size: 20px; margin: 0 0 8px; font-weight: 700; }
      .uc-cta p { color: var(--color-text-dim); margin: 0 0 18px; font-size: 14px; }
      .uc-cta-btn { display: inline-block; padding: 12px 22px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; text-decoration: none; font-size: 14px; }
      .uc-cta-btn-alt { display: inline-block; padding: 12px 22px; background: transparent; color: var(--color-cyan); border: 1px solid var(--color-cyan); border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; text-decoration: none; font-size: 14px; }
    `}</style>
  );
}
