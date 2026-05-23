// /services index — CollectionPage + ItemList JSON-LD.
import { getServices } from '@/lib/content';

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aiprosol.com';
  const services = getServices();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${siteUrl}/services#page`,
        url: `${siteUrl}/services`,
        name: 'Aiprosol AI Services',
        description: '11 done-for-you AI services — workflow automation, custom chatbots, AI lead-gen, document processing, system integration, sales/marketing/CS automation, AI training.',
        about: { '@id': `${siteUrl}/#organization` },
        publisher: { '@id': `${siteUrl}/#organization` },
        inLanguage: 'en',
      },
      {
        '@type': 'ItemList',
        '@id': `${siteUrl}/services#itemlist`,
        name: 'Aiprosol AI Services',
        numberOfItems: services.length,
        itemListElement: services.map((s, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: s.title,
          url: `${siteUrl}/services/${s.slug}`,
          item: {
            '@type': 'Service',
            '@id': `${siteUrl}/services/${s.slug}#service`,
            name: s.title,
            url: `${siteUrl}/services/${s.slug}`,
            ...(s.shortDescription && { description: s.shortDescription }),
            provider: { '@id': `${siteUrl}/#organization` },
            // Recommended on Service; mirrors the floor/ceiling on the
            // per-service detail page so this listing schema is complete.
            areaServed: { '@type': 'Place', name: 'Worldwide' },
            offers: {
              '@type': 'Offer',
              priceCurrency: 'USD',
              price: '997',
              priceSpecification: {
                '@type': 'PriceSpecification',
                priceCurrency: 'USD',
                minPrice: 997,
                maxPrice: 7997,
              },
              availability: 'https://schema.org/InStock',
              category: 'Subscription',
            },
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'AI Services', item: `${siteUrl}/services` },
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
