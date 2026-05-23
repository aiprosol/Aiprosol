import type { Metadata } from 'next';
import { getServices, getServiceBySlug } from '@/lib/content';

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const svc = getServiceBySlug(slug);
  if (!svc) {
    return {
      title: 'Service not found',
      description: 'This service is no longer available. Browse Aiprosol services.',
    };
  }
  const description =
    (svc as { shortDescription?: string }).shortDescription ||
    (svc as { description?: string }).description ||
    '';
  return {
    title: `${svc.title} · Aiprosol`,
    description: description.slice(0, 200),
    alternates: { canonical: `/services/${svc.slug}` },
    openGraph: {
      title: `${svc.title} · Aiprosol`,
      description: description.slice(0, 200),
      url: `/services/${svc.slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: svc.title,
      description: description.slice(0, 200),
    },
  };
}

export function generateStaticParams() {
  return getServices().map((s) => ({ slug: s.slug }));
}

export default async function ServiceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const svc = getServiceBySlug(slug);
  if (!svc) return <>{children}</>;

  // Schema.org Service + BreadcrumbList — primary GEO signals for AI answer
  // engines. Service tells crawlers "this is a buyable consulting service";
  // BreadcrumbList helps them place this URL in site hierarchy.
  const description =
    (svc as { shortDescription?: string }).shortDescription ||
    (svc as { description?: string }).description ||
    '';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `https://aiprosol.com/services/${svc.slug}#service`,
        name: svc.title,
        description: description,
        provider: { '@id': 'https://aiprosol.com/#organization' },
        serviceType: 'AI Automation Consulting',
        areaServed: { '@type': 'Place', name: 'Worldwide' },
        url: `https://aiprosol.com/services/${svc.slug}`,
        category: 'Business Consulting',
        audience: {
          '@type': 'BusinessAudience',
          audienceType: 'Small and Mid-sized Businesses',
          name: 'Small and Mid-sized Businesses',
        },
        // Services are engagement-priced (no fixed Offer.price) — use a
        // priceSpecification with a price range floor instead. schema.org's
        // Offer.price is required when an Offer is present; the cleanest
        // valid shape for "starts at $997/mo" pricing is PriceSpecification
        // nested under Offer rather than a bare price string.
        offers: {
          '@type': 'Offer',
          availability: 'https://schema.org/InStock',
          price: '997',
          priceCurrency: 'USD',
          priceSpecification: {
            '@type': 'PriceSpecification',
            price: '997',
            priceCurrency: 'USD',
            description: 'Starting price — most engagements are scoped per-project; pricing varies with scope and volume',
          },
          url: `https://aiprosol.com/services/${svc.slug}`,
          eligibleRegion: { '@type': 'Place', name: 'Worldwide' },
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://aiprosol.com' },
          { '@type': 'ListItem', position: 2, name: 'AI Services', item: 'https://aiprosol.com/services' },
          { '@type': 'ListItem', position: 3, name: svc.title, item: `https://aiprosol.com/services/${svc.slug}` },
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
