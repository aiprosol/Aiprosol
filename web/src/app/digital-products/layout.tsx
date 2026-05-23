import type { Metadata } from 'next';
import { getProducts } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Digital Products · 19 toolkits from $17',
  // Trimmed from 197ch.
  description:
    '19 self-serve toolkits, playbooks, ROI calculators, and prompt vaults from Aiprosol. Instant download, lifetime access, 7-day money-back guarantee.',
  alternates: { canonical: '/digital-products' },
  openGraph: {
    title: 'Digital Products · Aiprosol',
    description:
      '19 self-serve digital products — toolkits, playbooks, ROI calculators. From $17. Instant download, lifetime access.',
    url: '/digital-products',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aiprosol Digital Products',
    description: '19 self-serve toolkits, playbooks and frameworks. From $17. Instant download.',
  },
};

export default function DigitalProductsLayout({ children }: { children: React.ReactNode }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aiprosol.com';
  const products = getProducts();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${siteUrl}/digital-products#page`,
        url: `${siteUrl}/digital-products`,
        name: 'Aiprosol Digital Products',
        description: '19 self-serve digital products — playbooks, calculators, prompt vaults, n8n workflow libraries. From $17 to $397.',
        about: { '@id': `${siteUrl}/#organization` },
        publisher: { '@id': `${siteUrl}/#organization` },
        inLanguage: 'en',
      },
      {
        '@type': 'ItemList',
        '@id': `${siteUrl}/digital-products#itemlist`,
        name: 'Aiprosol Digital Products',
        numberOfItems: products.length,
        itemListElement: products.map((p, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: p.name,
          url: `${siteUrl}/products/${p.slug}`,
          item: {
            '@type': 'Product',
            '@id': `${siteUrl}/products/${p.slug}#product`,
            name: p.name,
            url: `${siteUrl}/products/${p.slug}`,
            // image is required for Product to satisfy rich-results eligibility.
            // Products.json stores relative paths like /products/foo.png — prepend
            // siteUrl so schema.org sees an absolute URL. Fall back to the
            // dynamic per-product OG image if `image` is empty.
            image: p.image
              ? (p.image.startsWith('http') ? p.image : `${siteUrl}${p.image}`)
              : `${siteUrl}/api/og/product/${p.slug}`,
            ...(p.shortDescription && { description: p.shortDescription }),
            brand: { '@id': `${siteUrl}/#organization` },
            ...(p.price && {
              offers: {
                '@type': 'Offer',
                price: String(p.price),
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
                url: `${siteUrl}/products/${p.slug}`,
              },
            }),
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'Digital Products', item: `${siteUrl}/digital-products` },
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
