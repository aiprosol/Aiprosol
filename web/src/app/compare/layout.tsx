// /compare index — CollectionPage + ItemList JSON-LD.
import comparisons from '@/content/comparisons.json';

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aiprosol.com';
  const items = comparisons as Array<{ slug: string; title: string; summary?: string }>;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${siteUrl}/compare#page`,
        url: `${siteUrl}/compare`,
        name: 'Aiprosol vs… honest comparisons',
        description: 'Side-by-side honest comparisons of Aiprosol vs. alternative AI automation paths — Zapier consultants, in-house build, Big 4, HubSpot Operations Hub, Salesforce Einstein, Microsoft Copilot Studio, DIY AI tools.',
        about: { '@id': `${siteUrl}/#organization` },
        publisher: { '@id': `${siteUrl}/#organization` },
        inLanguage: 'en',
      },
      {
        '@type': 'ItemList',
        '@id': `${siteUrl}/compare#itemlist`,
        name: 'Aiprosol comparison pages',
        numberOfItems: items.length,
        // ListItem inner `item` uses lighter @type WebPage — full Article
        // entity lives on /compare/[slug] with author + datePublished.
        itemListElement: items.map((c, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: c.title,
          url: `${siteUrl}/compare/${c.slug}`,
          item: {
            '@type': 'WebPage',
            '@id': `${siteUrl}/compare/${c.slug}`,
            name: c.title,
            url: `${siteUrl}/compare/${c.slug}`,
            ...(c.summary && { description: c.summary.slice(0, 200) }),
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'Compare', item: `${siteUrl}/compare` },
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
