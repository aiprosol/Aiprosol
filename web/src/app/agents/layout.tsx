// ─────────────────────────────────────────────────────────────────────────
// /agents — schema layout
// Emits an ItemList JSON-LD that explicitly enumerates Aiprosol's ten AI
// agents. Each item is a SoftwareApplication referenced by canonical URL,
// so Google's Knowledge Graph + every LLM consumer can resolve "Aiprosol's
// AI C-suite" to a concrete, ordered list rather than a marketing claim.
// ─────────────────────────────────────────────────────────────────────────

import { ROLES, ROLE_META } from '@/lib/agents/types';

export default function AgentsLayout({ children }: { children: React.ReactNode }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aiprosol.com';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${siteUrl}/agents#page`,
        url: `${siteUrl}/agents`,
        name: 'The AI C-Suite running Aiprosol',
        description:
          'Live dashboard of the ten AI agents that operate Aiprosol day-to-day, coordinated by Arora (AI CEO) under Srijan Paudel (Human Chairman). Auto-refreshes every minute.',
        about: { '@id': `${siteUrl}/#organization` },
        publisher: { '@id': `${siteUrl}/#organization` },
        inLanguage: 'en',
      },
      {
        '@type': 'ItemList',
        '@id': `${siteUrl}/agents#itemlist`,
        name: 'Aiprosol AI C-Suite',
        numberOfItems: ROLES.length,
        itemListOrder: 'https://schema.org/ItemListOrderAscending',
        itemListElement: ROLES.map((role, idx) => {
          const meta = ROLE_META[role];
          return {
            '@type': 'ListItem',
            position: idx + 1,
            url: `${siteUrl}/agents/${role}`,
            item: {
              '@type': 'SoftwareApplication',
              '@id': `${siteUrl}/agents/${role}#agent`,
              name: `${meta.fullName} — AI ${meta.title}`,
              alternateName: [meta.fullName, `AI ${meta.title}`, meta.title],
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              description: `${meta.fullName} (AI ${meta.title}) — domain: ${meta.domain}. Runs on a ${meta.cadenceHrs}-hour cron. Owns KPIs: ${meta.ownsKpis.join(', ')}.`,
              url: `${siteUrl}/agents/${role}`,
              creator: { '@id': `${siteUrl}/#organization` },
              provider: { '@id': `${siteUrl}/#organization` },
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
              },
            },
          };
        }),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'AI C-Suite', item: `${siteUrl}/agents` },
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
