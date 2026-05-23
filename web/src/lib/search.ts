// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · Site-wide search index
// Aggregates products, services, blog, case studies, FAQs into a single
// searchable list. Pure includes() match for now — can swap to Fuse.js
// later if we need fuzzy matching.
// ─────────────────────────────────────────────────────────────────────────

import {
  getProducts,
  getServices,
  getBlogPosts,
  getCaseStudies,
  getFaqs,
} from './content';

export type SearchKind = 'product' | 'service' | 'blog' | 'case' | 'faq';

export interface SearchHit {
  kind: SearchKind;
  href: string;
  title: string;
  excerpt: string;
  meta?: string;
}

/**
 * Returns a single flat array of every searchable item across the site.
 * Build it lazily on first call (cheap — just object construction).
 */
let _index: SearchHit[] | null = null;
function buildIndex(): SearchHit[] {
  if (_index) return _index;

  const items: SearchHit[] = [];

  for (const p of getProducts()) {
    items.push({
      kind: 'product',
      href: `/products/${p.slug}`,
      title: p.name,
      excerpt: p.shortDescription || '',
      meta: `$${p.price} · ${p.category}`,
    });
  }

  for (const s of getServices()) {
    items.push({
      kind: 'service',
      href: `/services/${s.slug}`,
      title: s.title,
      excerpt: s.shortDescription,
      meta: `${s.planMatch} tier`,
    });
  }

  for (const b of getBlogPosts()) {
    items.push({
      kind: 'blog',
      href: `/blog/${b.slug}`,
      title: b.title || '',
      excerpt: b.excerpt || '',
      meta: b.category || '',
    });
  }

  for (const c of getCaseStudies()) {
    items.push({
      kind: 'case',
      href: `/case-studies/${c.slug}`,
      title: c.companyName,
      excerpt: c.headline,
      meta: c.industry,
    });
  }

  for (const f of getFaqs()) {
    items.push({
      kind: 'faq',
      href: `/faqs#${slugify(f.question)}`,
      title: f.question,
      excerpt: f.answer,
      meta: f.category,
    });
  }

  _index = items;
  return items;
}

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export function searchAll(query: string): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const items = buildIndex();
  return items
    .filter(
      it =>
        it.title.toLowerCase().includes(q) ||
        it.excerpt.toLowerCase().includes(q) ||
        (it.meta || '').toLowerCase().includes(q),
    )
    .slice(0, 50);
}

export function searchAllByKind(query: string): Record<SearchKind, SearchHit[]> {
  const all = searchAll(query);
  const out: Record<SearchKind, SearchHit[]> = {
    product: [], service: [], blog: [], case: [], faq: [],
  };
  for (const hit of all) out[hit.kind].push(hit);
  return out;
}

export const KIND_LABELS: Record<SearchKind, string> = {
  product: 'Products',
  service: 'Services',
  blog: 'Articles',
  case: 'Case studies',
  faq: 'FAQs',
};

export const KIND_ICONS: Record<SearchKind, string> = {
  product: '📦',
  service: '⚙️',
  blog: '▾',
  case: '◆',
  faq: '?',
};
