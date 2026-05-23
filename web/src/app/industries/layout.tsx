// /industries index — CollectionPage + ItemList JSON-LD.
import industries from '@/content/industries.json';

export default function IndustriesLayout({ children }: { children: React.ReactNode }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aiprosol.com';
  const items = industries as Array<{ slug: string; name: string; hero?: { tagline?: string } }>;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${siteUrl}/industries#page`,
        url: `${siteUrl}/industries`,
        name: 'AI Automation by Industry · Aiprosol',
        description: 'Aiprosol AI automation tailored to specific industries — legal, real estate, financial services, SaaS, professional services, e-commerce.',
        about: { '@id': `${siteUrl}/#organization` },
        publisher: { '@id': `${siteUrl}/#organization` },
        inLanguage: 'en',
      },
      {
        '@type': 'ItemList',
        '@id': `${siteUrl}/industries#itemlist`,
        name: 'Aiprosol Industry Verticals',
        numberOfItems: items.length,
        // ListItem inner `item` is lighter @type WebPage — full Service +
        // BusinessAudience + Offer entity lives on /industries/[slug].
        itemListElement: items.map((i, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: `AI Automation for ${i.name}`,
          url: `${siteUrl}/industries/${i.slug}`,
          item: {
            '@type': 'WebPage',
            '@id': `${siteUrl}/industries/${i.slug}`,
            name: `AI Automation for ${i.name}`,
            url: `${siteUrl}/industries/${i.slug}`,
            ...(i.hero?.tagline && { description: i.hero.tagline }),
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'Industries', item: `${siteUrl}/industries` },
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
