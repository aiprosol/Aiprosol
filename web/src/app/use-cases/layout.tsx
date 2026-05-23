// /use-cases index — CollectionPage + ItemList JSON-LD.
import useCases from '@/content/use-cases.json';

export default function UseCasesLayout({ children }: { children: React.ReactNode }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aiprosol.com';
  const items = useCases as Array<{ slug: string; name: string; tagline?: string }>;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${siteUrl}/use-cases#page`,
        url: `${siteUrl}/use-cases`,
        name: 'AI Automation Use Cases · Aiprosol',
        description: 'High-leverage AI automation use cases that consistently produce ROI — lead generation, customer support, document processing, sales pipeline.',
        about: { '@id': `${siteUrl}/#organization` },
        publisher: { '@id': `${siteUrl}/#organization` },
        inLanguage: 'en',
      },
      {
        '@type': 'ItemList',
        '@id': `${siteUrl}/use-cases#itemlist`,
        name: 'Aiprosol AI Use Cases',
        numberOfItems: items.length,
        // ListItem inner `item` is lighter @type WebPage (not Service) — the
        // full Service entity lives on /use-cases/[slug] with its own offers/
        // areaServed/provider/audience. The index just enumerates the pages.
        itemListElement: items.map((u, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: u.name,
          url: `${siteUrl}/use-cases/${u.slug}`,
          item: {
            '@type': 'WebPage',
            '@id': `${siteUrl}/use-cases/${u.slug}`,
            name: u.name,
            url: `${siteUrl}/use-cases/${u.slug}`,
            ...(u.tagline && { description: u.tagline }),
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'Use Cases', item: `${siteUrl}/use-cases` },
        ],
      },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}
