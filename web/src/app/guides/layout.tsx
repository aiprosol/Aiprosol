// /guides index — CollectionPage + ItemList JSON-LD.
import { getGuides } from '@/lib/guides';

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aiprosol.com';
  const guides = getGuides();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${siteUrl}/guides#page`,
        url: `${siteUrl}/guides`,
        name: 'Definitive Guides · Aiprosol',
        description: 'Long-form (~30-min) operating manuals on AI automation — SMB rollout, lead generation, AI customer support. Audit checklists, patterns, anti-patterns, deployment plans.',
        about: { '@id': `${siteUrl}/#organization` },
        publisher: { '@id': `${siteUrl}/#organization` },
        inLanguage: 'en',
      },
      {
        '@type': 'ItemList',
        '@id': `${siteUrl}/guides#itemlist`,
        name: 'Aiprosol Definitive Guides',
        numberOfItems: guides.length,
        // ListItem inner `item` is lighter @type WebPage — full Article +
        // LearningResource entity lives on /guides/[slug] with author etc.
        itemListElement: guides.map((g, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: g.title,
          url: `${siteUrl}/guides/${g.slug}`,
          item: {
            '@type': 'WebPage',
            '@id': `${siteUrl}/guides/${g.slug}`,
            name: g.title,
            url: `${siteUrl}/guides/${g.slug}`,
            description: g.description.slice(0, 200),
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'Definitive Guides', item: `${siteUrl}/guides` },
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
