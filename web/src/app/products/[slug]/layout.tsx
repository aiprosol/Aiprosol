import type { Metadata } from 'next';
import { getProductBySlug, getProducts } from '@/lib/content';

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) {
    return {
      title: 'Product not found',
      description: 'This product is no longer available. Browse the full Aiprosol catalogue.',
    };
  }
  const description = (product.shortDescription || product.longDescription || '').slice(0, 200);
  const image = product.image || `/api/og/product/${product.slug}`;
  return {
    title: `${product.name} · $${product.price}`,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: `${product.name} · Aiprosol`,
      description,
      url: `/products/${product.slug}`,
      type: 'website',
      images: [{ url: image, width: 1280, height: 720, alt: product.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description,
      images: [image],
    },
  };
}

export function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
}

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) return <>{children}</>;

  // Product JSON-LD — unlocks Google rich-snippet pricing in SERP.
  // Also includes BreadcrumbList for hierarchy + HowTo schema for
  // playbook-shaped products (LLMs cite HowTo content heavily).
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aiprosol.com';
  const description = product.shortDescription || product.longDescription || '';
  const image = product.image
    ? (product.image.startsWith('http') ? product.image : `${siteUrl}${product.image}`)
    : `${siteUrl}/api/og/product/${product.slug}`;

  // Is this a playbook / how-to-style product? Add HowTo schema for those —
  // a major GEO signal for "how do I X" queries in AI engines.
  const playbookSlugs = new Set([
    'workflow-automation-playbook',
    'lead-generation-automation-playbook',
    '30-day-business-automation-challenge',
    'business-process-audit-checklist',
    'zapier-make-power-user-bundle',
    'ai-tools-stack-starter-kit',
    'global-business-automation-starter-pack',
    'enterprise-ai-readiness-assessment-kit',
  ]);
  const isPlaybook = playbookSlugs.has(product.slug);
  const isAvailable = (product as { available?: boolean }).available;

  const graph: Array<Record<string, unknown>> = [
    {
      '@type': 'Product',
      '@id': `${siteUrl}/products/${product.slug}#product`,
      name: product.name,
      description,
      sku: product.slug,
      category: product.category,
      image,
      url: `${siteUrl}/products/${product.slug}`,
      brand: { '@type': 'Brand', name: 'Aiprosol' },
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: 'USD',
        availability: isAvailable
          ? 'https://schema.org/InStock'
          : 'https://schema.org/PreOrder',
        url: `${siteUrl}/products/${product.slug}`,
        seller: { '@id': `${siteUrl}/#organization` },
        priceValidUntil: '2027-12-31',
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: 'Digital Products', item: `${siteUrl}/digital-products` },
        { '@type': 'ListItem', position: 3, name: product.name, item: `${siteUrl}/products/${product.slug}` },
      ],
    },
  ];

  if (isPlaybook && Array.isArray(product.whatsInside) && product.whatsInside.length > 0) {
    graph.push({
      '@type': 'HowTo',
      '@id': `${siteUrl}/products/${product.slug}#howto`,
      name: `How to use ${product.name}`,
      description,
      totalTime: 'PT2H',
      step: product.whatsInside.slice(0, 8).map((bullet, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: `Step ${i + 1}`,
        text: typeof bullet === 'string' ? bullet : String(bullet),
      })),
      tool: ['n8n', 'Zapier', 'Make', 'LLM', 'Gmail', 'Slack', 'Notion'].map((t) => ({
        '@type': 'HowToTool',
        name: t,
      })),
    });
  }

  // Course schema for the AI Workflow Architecture Masterclass.
  // Unlocks Google's Course rich-result carousel — high-CTR for
  // "course" / "training" / "masterclass" queries.
  if (product.slug === 'ai-workflow-architecture-masterclass') {
    graph.push({
      '@type': 'Course',
      '@id': `${siteUrl}/products/${product.slug}#course`,
      name: product.name,
      description,
      provider: { '@id': `${siteUrl}/#organization` },
      url: `${siteUrl}/products/${product.slug}`,
      inLanguage: 'en',
      educationalLevel: 'Professional',
      audience: { '@type': 'EducationalAudience', educationalRole: 'Operations Lead, Founder, Engineer' },
      hasCourseInstance: {
        '@type': 'CourseInstance',
        courseMode: 'Online',
        courseWorkload: 'PT5H',
        instructor: { '@id': `${siteUrl}/#srijan-paudel` },
      },
      offers: {
        '@type': 'Offer',
        category: 'Paid',
        price: product.price,
        priceCurrency: 'USD',
        availability: isAvailable ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
      },
    });
  }

  // Dataset schema for products that are genuinely structured datasets, not
  // narrative playbooks. Google Dataset Search indexes these, and AI engines
  // weight Dataset entities heavily when answering "best AI tools" / "best
  // ChatGPT prompts" queries because the format implies curated, queryable
  // structure (CSV/JSON files with documented fields).
  const DATASET_PRODUCTS: Record<string, { keywords: string[]; size: string; recordCount: number; license: string }> = {
    'the-ai-tools-vault': {
      keywords: ['AI tools', 'AI tool comparison', 'AI productivity', 'AI tool verdict', 'curated AI directory'],
      size: '105 tools across 23 categories',
      recordCount: 105,
      license: 'Commercial — purchaseable license',
    },
    'ai-tools-master-comparison-guide-2026': {
      keywords: ['AI tools', 'AI tool comparison', 'AI directory', '2026 AI landscape'],
      size: '105 tools across 23 categories',
      recordCount: 105,
      license: 'Commercial — purchaseable license',
    },
    'chatgpt-business-prompt-vault': {
      keywords: ['ChatGPT prompts', 'AI prompts', 'business prompts', 'prompt engineering', 'AI prompt library'],
      size: '200 production-tested prompts + 76 inline',
      recordCount: 276,
      license: 'Commercial — purchaseable license',
    },
  };

  const datasetMeta = DATASET_PRODUCTS[product.slug];
  if (datasetMeta) {
    graph.push({
      '@type': 'Dataset',
      '@id': `${siteUrl}/products/${product.slug}#dataset`,
      name: product.name,
      description,
      keywords: datasetMeta.keywords,
      creator: { '@id': `${siteUrl}/#organization` },
      publisher: { '@id': `${siteUrl}/#organization` },
      datePublished: '2026-04-15',
      license: datasetMeta.license,
      isAccessibleForFree: false,
      variableMeasured: datasetMeta.size,
      sameAs: `${siteUrl}/products/${product.slug}`,
      distribution: [
        { '@type': 'DataDownload', encodingFormat: 'application/json', contentUrl: `${siteUrl}/products/${product.slug}` },
        { '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: `${siteUrl}/products/${product.slug}` },
      ],
      isPartOf: { '@id': `${siteUrl}/#organization` },
    });
  }

  const jsonLd = { '@context': 'https://schema.org', '@graph': graph };

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
