// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · Shared types
// ─────────────────────────────────────────────────────────────────────────

export type ProductCategory =
  | 'Bundle'
  | 'Toolkits'
  | 'Templates'
  | 'Checklists'
  | 'Challenge'
  | 'Guides'
  | 'Sales'
  | 'AI Tools'
  | 'Masterclass'
  | 'Enterprise'
  | 'Agency';

export interface Product {
  slug: string;
  name: string;
  price: number;
  category: ProductCategory;
  icon?: string;
  shortDescription?: string;
  longDescription?: string;
  whatsInside?: string[];
  features?: string[];
  image?: string;
  buyUrl?: string;
  stripePriceId?: string;
  popularity?: number;
  // Tier-1 product-page enrichments (added 2026-05-19)
  faqs?: { q: string; a: string }[];
  bestFor?: string[];
  outcomeMetrics?: { value: string; label: string }[];
  includedInBundles?: {
    bundleSlug: string;
    bundleName: string;
    bundlePrice: number;
    bundleItemCount: number;
    bundleStandaloneSum: number;
    bundleSavings: number;
  }[];
  previewToc?: string[];
  previewExcerpt?: string;
  available?: boolean;
  expectedShipDate?: string | null;
  // T3.1 — flagship treatment for the top 3 products
  flagship?: boolean;
  flagshipHero?: {
    headline: string;
    subheadline: string;
    socialProof?: string;
    threePromises: { title: string; body: string }[];
  };
}

export type PlanMatch = 'starter' | 'growth' | 'enterprise';

export interface Service {
  slug: string;
  title: string;
  icon: string;
  shortDescription: string;
  longDescription?: string;
  benefits: string[];
  process: string[];
  planMatch: PlanMatch;
  caseStudyKeys?: string[];
}

export interface PricingPlan {
  id: 'starter' | 'growth' | 'enterprise';
  name: string;
  price: number;
  tagline: string;
  target: string;
  featured?: boolean;
  highlight?: string;
  features: string[];
  cta: string;
  ctaUrl: string;
  stripePriceId?: string;
}

export interface CaseStudy {
  slug: string;
  companyName: string;
  industry: string;
  headline: string;
  summary?: string;
  challenge?: string;
  approach?: string;
  result?: string;
  quote?: string;
  quoteAuthor?: string;
  quoteRole?: string;
  toolsUsed?: string[];
  metric1Label?: string; metric1Value?: string; metric1Before?: string; metric1After?: string;
  metric2Label?: string; metric2Value?: string; metric2Before?: string; metric2After?: string;
  metric3Label?: string; metric3Value?: string; metric3Before?: string; metric3After?: string;
  serviceUsed?: string;
  coverImage?: string;
  featured?: boolean;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt?: string;
  body?: string;
  category?: string;
  author?: string;
  publishedDate?: string;
  readTime?: number;
  coverImage?: string;
  featured?: boolean;
}

export interface FAQ {
  question: string;
  answer: string;
  category: string;
  order?: number;
}

export interface Testimonial {
  quote: string;
  author: string;
  role?: string;
  company?: string;
  rating?: number;
  avatar?: string;
}

export interface Integration {
  name: string;
  category?: string;
  logo?: string;
  url?: string;
}

export interface Lead {
  fullName: string;
  email: string;
  companyName?: string;
  companySize?: number;
  industry?: string;
  monthlyRevenue?: string;
  manualHoursPerWeek?: number;
  avgHourlyCost?: number;
  primaryChallenge?: string;
  automationExperience?: string;
  leadStatus: string;
  leadScore: number;
  tier?: 'Digital' | 'Plan' | 'Enterprise';
  recommendedPlan?: string;
  recommendedProducts?: string;
  source?: string;
  capturedAt: string;
}
