import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing · Plans from $997/mo',
  // Trimmed from 171ch. The full plan-price list is still in the H1 + cards.
  description:
    'Three managed AI automation plans: Starter $997/mo · Growth $2,997 · Enterprise $7,997. Live ROI calculator. 14-day onboarding. Cancel any month.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Pricing · Aiprosol Managed Automation',
    description:
      'Starter $997 · Growth $2,997 · Enterprise $7,997. 14-day onboarding. Cancel any month. Live ROI calculator on the page.',
    url: '/pricing',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aiprosol Pricing — managed automation plans',
    description: 'Three plans. Live ROI calculator. Cancel any month.',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  const BASE = 'https://aiprosol.com';
  // Per-plan Offer schema — unlocks Google rich-snippet pricing display
  // for the SaaS-style "Managed AI Automation" product offered as 3 tiers.
  // Each plan declares price, billingDuration, eligibleRegion, and the
  // benefits it includes (HasOfferCatalog itemListElement → Offer).
  const plans = [
    {
      slug: 'starter',
      name: 'Starter',
      price: 997,
      audience: '5-15 person businesses',
      includes: [
        'Design + build top-3 automations (Phase 0 → Phase 1)',
        'Monthly health check + quarterly roadmap review',
        '90-day reclaim guarantee — 35+ hrs/week or we work for free',
        'Direct Slack / email support',
      ],
    },
    {
      slug: 'growth',
      name: 'Growth',
      price: 2997,
      audience: '15-50 person businesses',
      includes: [
        'Everything in Starter',
        'Dedicated CSM',
        'Weekly optimisation cycle',
        'Custom n8n workflow library',
        'Direct Slack channel',
      ],
    },
    {
      slug: 'enterprise',
      name: 'Enterprise',
      price: 7997,
      audience: '50-5,000 person organisations',
      includes: [
        'Everything in Growth',
        '24h SLA · on-prem option · custom integrations',
        'Compliance (SOC2 / GDPR / DPA)',
        'Quarterly QBR with founder',
        'Named account team',
      ],
    },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${BASE}/pricing#service`,
        name: 'Aiprosol Managed AI Automation',
        description: 'Done-for-you AI automation: design, build, and operate workflows that reclaim 35+ hours/week per team. Three plans.',
        provider: { '@id': `${BASE}/#organization` },
        serviceType: 'AI Automation Consulting',
        areaServed: { '@type': 'Place', name: 'Worldwide' },
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'USD',
          lowPrice: 997,
          highPrice: 7997,
          offerCount: 3,
          availability: 'https://schema.org/InStock',
        },
        url: `${BASE}/pricing`,
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Managed plans',
          itemListElement: plans.map((p) => ({
            '@type': 'Offer',
            '@id': `${BASE}/pricing#${p.slug}`,
            name: `Aiprosol ${p.name}`,
            description: `${p.audience}. ${p.includes.join(' · ')}`,
            url: `${BASE}/pricing#${p.slug}`,
            priceCurrency: 'USD',
            price: p.price,
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: p.price,
              priceCurrency: 'USD',
              billingDuration: 'P1M',
              billingIncrement: 1,
              unitText: 'MONTH',
              referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'MON' },
            },
            availability: 'https://schema.org/InStock',
            eligibleRegion: { '@type': 'Place', name: 'Worldwide' },
            seller: { '@id': `${BASE}/#organization` },
          })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
          { '@type': 'ListItem', position: 2, name: 'Pricing', item: `${BASE}/pricing` },
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
