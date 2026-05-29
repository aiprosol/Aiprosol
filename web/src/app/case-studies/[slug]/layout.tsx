import type { Metadata } from 'next';
import { getCaseStudies, getCaseStudyBySlug } from '@/lib/content';

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const cs = getCaseStudyBySlug(slug);
  if (!cs) {
    return {
      title: 'Case study not found',
      description: 'This case study is no longer available. Browse Aiprosol case studies.',
    };
  }
  // Pick the strongest metric for the title
  const headlineMetric = (cs as { headlineMetric?: string }).headlineMetric;
  const industry = (cs as { industry?: string }).industry || '';
  const summary =
    (cs as { summary?: string }).summary ||
    (cs as { shortSummary?: string }).shortSummary ||
    (cs as { excerpt?: string }).excerpt ||
    '';
  const description = summary.slice(0, 160);
  return {
    title: `${cs.headline} · ${industry || 'Case study'}`,
    description: description ||
      `${cs.headline}: ${headlineMetric || 'automation outcome'} ${industry ? `in ${industry.toLowerCase()}.` : '.'}`,
    // Charter-customer phase: case-study pages stay out of the index until
    // they describe real, verified, named engagements. Prevents search +
    // AI engines from citing illustrative outcomes as fact.
    robots: { index: false, follow: true },
    alternates: { canonical: `/case-studies/${cs.slug}` },
    openGraph: {
      title: `${cs.headline} · Aiprosol Case Study`,
      description: description || `${cs.headline} — ${industry} case study from Aiprosol.`,
      url: `/case-studies/${cs.slug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: cs.headline,
      description: description || `${cs.headline} — case study from Aiprosol.`,
    },
  };
}

export function generateStaticParams() {
  return getCaseStudies().map((c) => ({ slug: c.slug }));
}

export default async function CaseStudyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const cs = getCaseStudyBySlug(slug);
  if (!cs) return <>{children}</>;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aiprosol.com';
  const c = cs as {
    companyName?: string;
    industry?: string;
    headline?: string;
    summary?: string;
    challenge?: string;
    approach?: string;
    result?: string;
    quote?: string;
    quoteAuthor?: string;
    quoteRole?: string;
    metric1Label?: string; metric1Value?: string;
    metric2Label?: string; metric2Value?: string;
    metric3Label?: string; metric3Value?: string;
    serviceUsed?: string;
    toolsUsed?: string[];
  };

  // Build the Article JSON-LD. Case studies are Articles whose `about` is the
  // client Organization. The customer quote becomes a Review-style entity in
  // the @graph. Metrics are flattened into keywords for rich-snippet eligibility.
  const description = (c.summary || c.headline || '').slice(0, 200);
  const image = `${siteUrl}/api/og/case/${slug}`;
  const metrics = [
    { label: c.metric1Label, value: c.metric1Value },
    { label: c.metric2Label, value: c.metric2Value },
    { label: c.metric3Label, value: c.metric3Value },
  ].filter((m) => m.label && m.value);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${siteUrl}/case-studies/${slug}#article`,
        headline: c.headline || `${c.companyName} case study`,
        description,
        image,
        url: `${siteUrl}/case-studies/${slug}`,
        // mainEntityOfPage uses a URL string (schema.org's preferred lighter
        // form). Avoids "WebPage missing name" warnings from nested objects.
        mainEntityOfPage: `${siteUrl}/case-studies/${slug}`,
        // Case studies are anonymised composite ROI projections from the
        // 2026 pilot phase. Anchored to the company-launch month so the
        // Article schema satisfies the recommended `datePublished` field.
        datePublished: '2026-04-15',
        dateModified: '2026-05-20',
        author: { '@id': `${siteUrl}/#organization` },
        publisher: { '@id': `${siteUrl}/#organization` },
        inLanguage: 'en',
        articleSection: 'Case Study',
        ...(c.companyName && {
          about: {
            '@type': 'Organization',
            name: c.companyName,
            // url is required for Organization. Customers are anonymised in
            // case studies, so we use the case study page URL itself as the
            // canonical pointer for the "about" organisation reference.
            url: `${siteUrl}/case-studies/${slug}`,
            // logo + description + sameAs are recommended for Organization;
            // for anonymised customer entities we use sensible placeholders
            // that don't misrepresent the customer (no fake URLs, no real
            // logos). The strings document the anonymisation honestly.
            logo: `${siteUrl}/opengraph-image`,
            description: `Anonymised ${c.industry || 'industry'} customer engagement (composite ROI projection)`,
            ...(c.industry && { industry: c.industry }),
          },
        }),
        mentions: [
          ...(c.serviceUsed
            ? [{
                '@type': 'Service',
                name: c.serviceUsed,
                provider: { '@id': `${siteUrl}/#organization` },
                // areaServed + offers are recommended on Service; the parent
                // Service entity lives on /services/[slug] so these refer up.
                areaServed: { '@type': 'Place', name: 'Worldwide' },
              }]
            : []),
          ...(Array.isArray(c.toolsUsed)
            ? c.toolsUsed.map((t) => ({
                '@type': 'SoftwareApplication',
                name: t,
                applicationCategory: 'BusinessApplication',
                operatingSystem: 'Web',
              }))
            : []),
        ],
        keywords: metrics.map((m) => `${m.label}: ${m.value}`).join(', '),
      },
      // NOTE: No Review / aggregateRating schema is emitted. Review markup
      // requires a genuine, verifiable customer review with a real author —
      // emitting it from an illustrative quote is fabricated structured data
      // (Google penalty + UK ASA/CMA + US FTC exposure). Re-add ONLY when a
      // real, named, consenting customer review exists.
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'Case Studies', item: `${siteUrl}/case-studies` },
          { '@type': 'ListItem', position: 3, name: c.companyName || 'Case Study', item: `${siteUrl}/case-studies/${slug}` },
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
      {children}
    </>
  );
}
