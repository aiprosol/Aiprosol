// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · Visitor personalisation
//
// Read a `aiprosol_segment` cookie set by middleware and produce a typed
// "segment" the homepage uses to reorder services + case studies.
//
// Signal sources (set by middleware on Vercel; falls through gracefully
// in dev / when missing):
//   - geo.country  → 'GB' | 'US' | 'IN' | …  (regional case-study priority)
//   - utm_source   → 'linkedin' | 'twitter' | 'organic' | …
//   - utm_industry → 'legal' | 'real-estate' | 'manufacturing' | …  (set
//                    by us in outbound link tags from industry-specific
//                    LinkedIn DM campaigns)
//   - hour-of-day  → 'business' | 'after-hours'  (changes CTA copy)
//
// We deliberately use only soft signals — no IP fingerprinting, no
// third-party trackers. Cookie is non-personal, expires in 7 days.
// ─────────────────────────────────────────────────────────────────────────

import { cookies } from 'next/headers';

export type Region = 'GB' | 'EU' | 'US' | 'CA' | 'IN' | 'AU' | 'OTHER';
export type IndustryHint =
  | 'legal'
  | 'real-estate'
  | 'manufacturing'
  | 'e-commerce'
  | 'financial-services'
  | 'healthcare'
  | 'saas'
  | 'professional-services'
  | 'unknown';
export type Source = 'linkedin' | 'twitter' | 'community' | 'organic' | 'direct' | 'unknown';
export type Daypart = 'business' | 'after-hours';

export interface VisitorSegment {
  region: Region;
  industry: IndustryHint;
  source: Source;
  daypart: Daypart;
  // True when middleware actually populated the cookie (not localhost fallback)
  populated: boolean;
}

const DEFAULT_SEGMENT: VisitorSegment = {
  region: 'OTHER',
  industry: 'unknown',
  source: 'unknown',
  daypart: 'business',
  populated: false,
};

export const COOKIE_NAME = 'aiprosol_segment';
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Encode for cookie value (compact + URL-safe)
export function encodeSegment(seg: VisitorSegment): string {
  return [seg.region, seg.industry, seg.source, seg.daypart].join('|');
}

export function decodeSegment(raw: string): VisitorSegment {
  const [region, industry, source, daypart] = raw.split('|');
  if (!region || !industry || !source || !daypart) return DEFAULT_SEGMENT;
  return {
    region: (region as Region) || 'OTHER',
    industry: (industry as IndustryHint) || 'unknown',
    source: (source as Source) || 'unknown',
    daypart: (daypart as Daypart) || 'business',
    populated: true,
  };
}

// Server component / route handler entry point
export async function getVisitorSegment(): Promise<VisitorSegment> {
  try {
    const c = await cookies();
    const raw = c.get(COOKIE_NAME)?.value;
    if (!raw) return DEFAULT_SEGMENT;
    return decodeSegment(raw);
  } catch {
    return DEFAULT_SEGMENT;
  }
}

// ─── Region from country code (ISO 3166-1 alpha-2) ───
const EU_COUNTRIES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
  'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
  'SI', 'ES', 'SE', 'IS', 'NO', 'CH', 'LI',
]);

export function regionFromCountry(country: string | undefined | null): Region {
  if (!country) return 'OTHER';
  const c = country.toUpperCase();
  if (c === 'GB' || c === 'UK') return 'GB';
  if (c === 'US') return 'US';
  if (c === 'CA') return 'CA';
  if (c === 'IN') return 'IN';
  if (c === 'AU' || c === 'NZ') return 'AU';
  if (EU_COUNTRIES.has(c)) return 'EU';
  return 'OTHER';
}

// ─── Industry hint from a UTM/referrer string (lenient match) ───
export function industryFromString(s: string | undefined | null): IndustryHint {
  if (!s) return 'unknown';
  const t = s.toLowerCase();
  if (/legal|law|attorney|solicitor/.test(t)) return 'legal';
  if (/real.?estate|property|realtor|estate.agent/.test(t)) return 'real-estate';
  if (/manuf|factory|industrial|production/.test(t)) return 'manufacturing';
  if (/ecom|shopify|retail|d2c|woocommerce/.test(t)) return 'e-commerce';
  if (/finance|banking|fintech|accounting/.test(t)) return 'financial-services';
  if (/health|medical|clinic|hospital|hipaa/.test(t)) return 'healthcare';
  if (/saas|software|app|tech.startup/.test(t)) return 'saas';
  if (/consult|services|professional|agency/.test(t)) return 'professional-services';
  return 'unknown';
}

export function sourceFromUtm(utm: string | undefined | null): Source {
  if (!utm) return 'organic';
  const t = utm.toLowerCase();
  if (t.includes('linkedin') || t.includes('li.')) return 'linkedin';
  if (t.includes('twitter') || t === 'x' || t === 'x.com') return 'twitter';
  if (t.includes('reddit') || t.includes('community') || t.includes('discord')) return 'community';
  if (t === 'direct') return 'direct';
  return 'organic';
}

// Hour from UTC; treat 8am-7pm caller-local as "business" (rough approx).
// We don't actually know caller TZ at the edge; use UTC + region offset best-guess.
export function daypartFromUtc(date: Date, region: Region): Daypart {
  const utcHour = date.getUTCHours();
  // crude offsets — purely cosmetic, drives CTA copy only
  const offsetByRegion: Record<Region, number> = {
    GB: 0, EU: 1, US: -5, CA: -5, IN: 5.5, AU: 10, OTHER: 0,
  };
  const local = (utcHour + offsetByRegion[region] + 24) % 24;
  return local >= 8 && local < 19 ? 'business' : 'after-hours';
}

// ─────────────────────────────────────────────────────────────────────────
// REORDER HELPERS — used by HomeCases / HomeServices
// ─────────────────────────────────────────────────────────────────────────

// Map our case-studies.json `industry` field → IndustryHint enum
const CASE_INDUSTRY_TO_HINT: Record<string, IndustryHint> = {
  'Legal': 'legal',
  'Real Estate': 'real-estate',
  'Manufacturing': 'manufacturing',
  'E-commerce': 'e-commerce',
  'Ecommerce': 'e-commerce',
  'Financial Services': 'financial-services',
  'Healthcare': 'healthcare',
  'SaaS': 'saas',
  'Professional Services': 'professional-services',
};

// Per-service industry affinity (services.json doesn't tag this, so we map
// by slug heuristic — these are the industries each service typically lands).
const SERVICE_INDUSTRY_AFFINITY: Record<string, IndustryHint[]> = {
  'intelligent-workflow-automation':       ['professional-services', 'legal', 'financial-services'],
  'custom-ai-chatbot-development':         ['e-commerce', 'saas', 'professional-services'],
  'ai-powered-lead-generation':            ['real-estate', 'saas', 'professional-services'],
  'document-processing-automation':        ['legal', 'financial-services', 'healthcare'],
  'computer-vision-quality-control':       ['manufacturing'],
  'predictive-analytics-engineering':      ['e-commerce', 'manufacturing', 'saas'],
  'arora-ceo-deployment':                  ['saas', 'professional-services'],
  'enterprise-ai-transformation':          ['financial-services', 'manufacturing'],
  'ai-customer-intelligence':              ['e-commerce', 'saas'],
  'process-mining-and-audit':              ['professional-services', 'manufacturing'],
  'voice-agent-deployment':                ['real-estate', 'healthcare', 'professional-services'],
};

interface CaseLike { slug: string; industry?: string; featured?: boolean }
interface ServiceLike { slug: string }

export function reorderCases<T extends CaseLike>(cases: T[], segment: VisitorSegment): T[] {
  if (segment.industry === 'unknown') return cases;
  return [...cases].sort((a, b) => {
    const aHint = CASE_INDUSTRY_TO_HINT[a.industry || ''] || 'unknown';
    const bHint = CASE_INDUSTRY_TO_HINT[b.industry || ''] || 'unknown';
    const aMatch = aHint === segment.industry ? 1 : 0;
    const bMatch = bHint === segment.industry ? 1 : 0;
    if (aMatch !== bMatch) return bMatch - aMatch;
    // tiebreak: featured first
    return (Number(b.featured ?? 0)) - (Number(a.featured ?? 0));
  });
}

export function reorderServices<T extends ServiceLike>(services: T[], segment: VisitorSegment): T[] {
  if (segment.industry === 'unknown') return services;
  return [...services].sort((a, b) => {
    const aMatch = (SERVICE_INDUSTRY_AFFINITY[a.slug] || []).includes(segment.industry) ? 1 : 0;
    const bMatch = (SERVICE_INDUSTRY_AFFINITY[b.slug] || []).includes(segment.industry) ? 1 : 0;
    return bMatch - aMatch;
  });
}

// Pretty label for the visitor (used in headline / banners)
export function industryLabel(h: IndustryHint): string {
  switch (h) {
    case 'legal':                  return 'legal teams';
    case 'real-estate':            return 'estate agents';
    case 'manufacturing':          return 'manufacturers';
    case 'e-commerce':             return 'e-commerce operators';
    case 'financial-services':     return 'finance teams';
    case 'healthcare':             return 'healthcare ops';
    case 'saas':                   return 'SaaS teams';
    case 'professional-services':  return 'professional services firms';
    default:                       return 'operators';
  }
}
