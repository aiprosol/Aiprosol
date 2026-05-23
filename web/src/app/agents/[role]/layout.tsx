// ─────────────────────────────────────────────────────────────────────────
// /agents/[role] — schema layout
// Emits a SoftwareApplication entity for each individual AI agent, plus a
// BreadcrumbList. Each agent becomes its own indexable entity that LLMs
// and search engines can resolve directly — e.g. "Aiprosol's AI CMO"
// becomes a structured fact rather than a marketing claim.
// ─────────────────────────────────────────────────────────────────────────

import { ROLES, ROLE_META, type Role } from '@/lib/agents/types';

type Params = { role: string };

export default async function AgentRoleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<Params>;
}) {
  const { role } = await params;
  if (!ROLES.includes(role as Role)) return <>{children}</>;

  const meta = ROLE_META[role as Role];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aiprosol.com';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        '@id': `${siteUrl}/agents/${role}#agent`,
        name: `${meta.fullName} — AI ${meta.title} at Aiprosol`,
        alternateName: [meta.fullName, `AI ${meta.title}`, meta.title],
        applicationCategory: 'BusinessApplication',
        applicationSubCategory: meta.title,
        operatingSystem: 'Web',
        description: `${meta.fullName} is the AI ${meta.title} on Aiprosol's 10-agent C-suite. Domain: ${meta.domain}. Runs on a ${meta.cadenceHrs}-hour cron. Owns KPIs: ${meta.ownsKpis.join(', ')}. Live activity log and run history at /agents/${role}.`,
        url: `${siteUrl}/agents/${role}`,
        image: `${siteUrl}/api/og/agent/${role}`,
        creator: { '@id': `${siteUrl}/#organization` },
        provider: { '@id': `${siteUrl}/#organization` },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          description: 'Customer-facing chat (Arora) is free; other agents operate Aiprosol internally and back the managed plans.',
        },
        featureList: meta.ownsKpis,
        softwareVersion: '1.0',
        about: { '@id': `${siteUrl}/#organization` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'AI C-Suite', item: `${siteUrl}/agents` },
          { '@type': 'ListItem', position: 3, name: `${meta.fullName} · ${meta.title}`, item: `${siteUrl}/agents/${role}` },
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
