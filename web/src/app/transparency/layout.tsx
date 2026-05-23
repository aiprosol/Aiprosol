// /transparency — schema layout
// Emits a CollectionPage + Dataset JSON-LD describing the live operational
// transparency artifact: a per-minute-refreshed view of every agent run.
// Surfaces the bidirectional link back to the Aiprosol Organization entity
// and the four canonical essays so LLMs can resolve the page's purpose.

export default function TransparencyLayout({ children }: { children: React.ReactNode }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aiprosol.com';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${siteUrl}/transparency#page`,
        url: `${siteUrl}/transparency`,
        name: 'Aiprosol · Live Operational Transparency',
        description:
          'Every decision the Aiprosol AI agents made in the last 24 hours. Every task queued for human approval. Every alert. Every failure. The public dashboard that backs the AI-led operating model.',
        about: { '@id': `${siteUrl}/#organization` },
        publisher: { '@id': `${siteUrl}/#organization` },
        inLanguage: 'en',
        primaryImageOfPage: `${siteUrl}/api/og/page/transparency`,
        isAccessibleForFree: true,
      },
      {
        '@type': 'Dataset',
        '@id': `${siteUrl}/transparency#dataset`,
        name: 'Aiprosol AI agent operational log',
        description:
          'Append-only log of every AI agent run at Aiprosol, including timestamp, role, status (ok / error / fallback), items produced, alerts raised, and duration. Refreshed every minute.',
        url: `${siteUrl}/transparency`,
        creator: { '@id': `${siteUrl}/#organization` },
        publisher: { '@id': `${siteUrl}/#organization` },
        license: 'https://creativecommons.org/licenses/by/4.0/',
        isAccessibleForFree: true,
        keywords: 'AI agents, operational transparency, audit log, AI-led operating model, agent runs, structured outputs',
        variableMeasured: ['agent runs per 24h', 'failure rate', 'fallback rate', 'items produced', 'alerts raised', 'tasks queued for human approval'],
        temporalCoverage: '2026-04-14/..',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'Live Operational Transparency', item: `${siteUrl}/transparency` },
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
