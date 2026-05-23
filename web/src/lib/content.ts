// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · Content loaders
// Reads the JSON catalogue files in src/content. These replace the Wix CMS
// queries from the V2.0 build. Server-side imports are statically analysed
// at build time (zero runtime fetch).
// ─────────────────────────────────────────────────────────────────────────

import productsData from '@/content/products.json';
import servicesData from '@/content/services.json';
import pricingData from '@/content/pricing-plans.json';
import caseStudiesData from '@/content/case-studies.json';
import blogData from '@/content/blog.json';
import faqsData from '@/content/faqs.json';
import testimonialsData from '@/content/testimonials.json';
import integrationsData from '@/content/integrations.json';
import type { Product, Service, PricingPlan, CaseStudy, BlogPost, FAQ, Testimonial, Integration } from '@/types';

// ─── Products ───
export function getProducts(): Product[] {
  return productsData as Product[];
}

export function getProductBySlug(slug: string): Product | undefined {
  return getProducts().find(p => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  if (category === 'All') return getProducts();
  return getProducts().filter(p => p.category === category);
}

export function getProductCategories(): Array<{ name: string; count: number }> {
  const counts: Record<string, number> = {};
  for (const p of getProducts()) {
    counts[p.category] = (counts[p.category] || 0) + 1;
  }
  return Object.entries(counts).map(([name, count]) => ({ name, count }));
}

// ─── Services ───
export function getServices(): Service[] {
  return servicesData as Service[];
}

export function getServiceBySlug(slug: string): Service | undefined {
  return getServices().find(s => s.slug === slug);
}

// ─── Pricing ───
export function getPricingPlans(): PricingPlan[] {
  return pricingData as PricingPlan[];
}

export function getPricingPlan(id: 'starter' | 'growth' | 'enterprise'): PricingPlan | undefined {
  return getPricingPlans().find(p => p.id === id);
}

// ─── Case studies ───
export function getCaseStudies(): CaseStudy[] {
  return caseStudiesData as CaseStudy[];
}

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return getCaseStudies().find(c => c.slug === slug);
}

export function getCaseStudiesByIndustry(industry: string): CaseStudy[] {
  if (industry === 'All') return getCaseStudies();
  return getCaseStudies().filter(c => c.industry === industry);
}

export function getRelatedCaseStudies(slug: string, limit = 2): CaseStudy[] {
  const target = getCaseStudyBySlug(slug);
  if (!target) return [];
  // Same industry first, otherwise just other cases
  const sameIndustry = getCaseStudies().filter(c => c.slug !== slug && c.industry === target.industry);
  const others = getCaseStudies().filter(c => c.slug !== slug && c.industry !== target.industry);
  return [...sameIndustry, ...others].slice(0, limit);
}

// ─── Blog ───
export function getBlogPosts(): BlogPost[] {
  return blogData as BlogPost[];
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return getBlogPosts().find(p => p.slug === slug);
}

export function getBlogCategories(): string[] {
  const set = new Set<string>();
  for (const p of getBlogPosts()) if (p.category) set.add(p.category);
  return Array.from(set).sort();
}

// ─── FAQs ───
export function getFaqs(): FAQ[] {
  return (faqsData as FAQ[]).slice().sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
}

export function getFaqCategories(): string[] {
  const set = new Set<string>();
  for (const f of getFaqs()) set.add(f.category);
  return Array.from(set);
}

// ─── Testimonials ───
export function getTestimonials(): Testimonial[] {
  return testimonialsData as Testimonial[];
}

// ─── Integrations ───
export function getIntegrations(): Integration[] {
  return integrationsData as Integration[];
}
