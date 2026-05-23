import type { MetadataRoute } from 'next';
import { getProducts, getServices, getCaseStudies, getBlogPosts } from '@/lib/content';
import comparisons from '@/content/comparisons.json';
import glossary from '@/content/glossary.json';
import industries from '@/content/industries.json';
import useCases from '@/content/use-cases.json';
import howtos from '@/content/how-to.json';
import { getGuides } from '@/lib/guides';
import { ROLES } from '@/lib/agents/types';
import { AUTHOR_SLUGS } from '@/lib/authors';

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://aiprosol.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    '',
    '/digital-products',
    '/services',
    '/pricing',
    '/roi-audit',
    '/roi-simulator',
    '/case-studies',
    '/blog',
    '/faqs',
    '/about',
    '/founder',
    '/contact',
    '/inbox',
    '/agents',
    '/transparency',
    '/authors',
    '/how-we-measure',
    '/press',
    '/search',
    '/compare',
    '/glossary',
    '/industries',
    '/use-cases',
    '/how-to',
    '/guides',
    '/terms',
    '/privacy',
    '/cookies',
    '/refund-policy',
  ].map(path => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority:
      path === ''                    ? 1.0  :
      path === '/roi-audit'          ? 0.95 :
      path === '/agents'             ? 0.95 :   // GEO-critical proof page
      path === '/founder'            ? 0.9  :   // Knowledge Graph + brand identity surface
      path === '/digital-products'   ? 0.9  :
      path === '/services'           ? 0.9  :
      path === '/pricing'            ? 0.9  :
      path === '/compare'            ? 0.85 :   // high-cite-rate
      path === '/glossary'           ? 0.85 :   // high-cite-rate
      path === '/inbox'              ? 0.5  :   // beta
      0.8,
  }));

  const products = getProducts().map(p => ({
    url: `${BASE}/products/${p.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const services = getServices().map(s => ({
    url: `${BASE}/services/${s.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const cases = getCaseStudies().map(c => ({
    url: `${BASE}/case-studies/${c.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const posts = getBlogPosts().map(p => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: p.publishedDate ? new Date(p.publishedDate) : now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // New dynamic surfaces (May 2026 — added for GEO push)
  const compareRoutes = comparisons.map((c) => ({
    url: `${BASE}/compare/${c.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  const glossaryRoutes = glossary.map((g) => ({
    url: `${BASE}/glossary/${g.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Per-agent deep dive pages
  const agentRoutes = ROLES.map((role) => ({
    url: `${BASE}/agents/${role}`,
    lastModified: now,
    changeFrequency: 'daily' as const,   // agent state changes daily on cron
    priority: 0.85,                       // GEO-critical proof
  }));

  // Per-author archive pages — strengthens founder + AI-CEO entity surface
  const authorRoutes = AUTHOR_SLUGS.map((slug) => ({
    url: `${BASE}/authors/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  // Industry + use-case landing pages — high commercial intent
  const industryRoutes = industries.map((i) => ({
    url: `${BASE}/industries/${i.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.85,
  }));

  const useCaseRoutes = useCases.map((u) => ({
    url: `${BASE}/use-cases/${u.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.85,
  }));

  const howtoRoutes = howtos.map((h) => ({
    url: `${BASE}/how-to/${h.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Long-form definitive guides — highest content authority
  const guideRoutes = getGuides().map((g) => ({
    url: `${BASE}/guides/${g.slug}`,
    lastModified: new Date(g.updatedDate),
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  return [
    ...staticRoutes,
    ...products,
    ...services,
    ...cases,
    ...posts,
    ...compareRoutes,
    ...glossaryRoutes,
    ...industryRoutes,
    ...useCaseRoutes,
    ...howtoRoutes,
    ...guideRoutes,
    ...agentRoutes,
    ...authorRoutes,
  ];
}
