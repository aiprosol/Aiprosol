import type { Metadata } from 'next';
import { getCaseStudies } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Case Studies · Real ROI stories from Aiprosol engagements',
  description:
    'Anonymised before/after engagement stories from Aiprosol AI automation deployments — legal, real estate, e-commerce, professional services. Architecture, measured outcomes, payback period.',
  alternates: { canonical: '/case-studies' },
  openGraph: {
    title: 'Aiprosol Case Studies',
    description: 'Anonymised before/after engagement reports from Aiprosol AI automation deployments.',
    url: '/case-studies',
    type: 'website',
  },
};

export default function CaseStudiesLayout({ children }: { children: React.ReactNode }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aiprosol.com';
  const cases = getCaseStudies();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${siteUrl}/case-studies#page`,
        url: `${siteUrl}/case-studies`,
        name: 'Aiprosol Case Studies',
        description: 'Anonymised before/after engagement reports — measured outcomes from Aiprosol AI automation deployments.',
        about: { '@id': `${siteUrl}/#organization` },
        publisher: { '@id': `${siteUrl}/#organization` },
        inLanguage: 'en',
      },
      {
        '@type': 'ItemList',
        '@id': `${siteUrl}/case-studies#itemlist`,
        name: 'Aiprosol Case Studies',
        numberOfItems: cases.length,
        // ListItem inner `item` is lighter @type WebPage — full Article entity
        // lives on /case-studies/[slug] with author + datePublished etc.
        itemListElement: cases.map((c, idx) => {
          const title = (c as { headline?: string }).headline || c.companyName;
          return {
            '@type': 'ListItem',
            position: idx + 1,
            name: title,
            url: `${siteUrl}/case-studies/${c.slug}`,
            item: {
              '@type': 'WebPage',
              '@id': `${siteUrl}/case-studies/${c.slug}`,
              name: title,
              url: `${siteUrl}/case-studies/${c.slug}`,
            },
          };
        }),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'Case Studies', item: `${siteUrl}/case-studies` },
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
