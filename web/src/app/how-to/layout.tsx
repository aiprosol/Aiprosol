// /how-to index — CollectionPage + ItemList JSON-LD.
import howtos from '@/content/how-to.json';

export default function HowToLayout({ children }: { children: React.ReactNode }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aiprosol.com';
  const items = howtos as Array<{ slug: string; h1: string; summary?: string }>;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${siteUrl}/how-to#page`,
        url: `${siteUrl}/how-to`,
        name: 'How-To Guides · Aiprosol',
        description: 'Step-by-step how-to guides on AI automation — lead routing, lead scoring, business process audits, ROI calculation, n8n deployment.',
        about: { '@id': `${siteUrl}/#organization` },
        publisher: { '@id': `${siteUrl}/#organization` },
        inLanguage: 'en',
      },
      {
        '@type': 'ItemList',
        '@id': `${siteUrl}/how-to#itemlist`,
        name: 'Aiprosol How-To Guides',
        numberOfItems: items.length,
        // List items use @type: WebPage (the page that hosts the HowTo)
        // rather than @type: HowTo — schema.org's HowTo requires a step[]
        // array, which only makes sense on the individual /how-to/[slug]
        // page that has the full instructions. The index just lists the
        // pages, so WebPage is the correct lighter reference type.
        itemListElement: items.map((h, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          url: `${siteUrl}/how-to/${h.slug}`,
          name: h.h1,
          item: {
            '@type': 'WebPage',
            '@id': `${siteUrl}/how-to/${h.slug}`,
            name: h.h1,
            url: `${siteUrl}/how-to/${h.slug}`,
            ...(h.summary && { description: h.summary.slice(0, 200) }),
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'How-To Guides', item: `${siteUrl}/how-to` },
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
