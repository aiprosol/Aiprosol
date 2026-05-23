// ─────────────────────────────────────────────────────────────────────────
// lib/guides — pillar-guide loader.
// Reads markdown files from src/content/guides/ at build time + statically
// indexes them. Each guide is a long-form (3000+ word) authority page —
// the SEO/GEO complement to the shorter how-to guides.
// ─────────────────────────────────────────────────────────────────────────

import fs from 'node:fs';
import path from 'node:path';

const GUIDES_DIR = path.join(process.cwd(), 'src/content/guides');

export type Guide = {
  slug: string;
  title: string;
  description: string;
  publishedDate: string;
  updatedDate: string;
  readTime: number;
  body: string;
};

// Hard-coded metadata for each guide so we don't need YAML frontmatter
// parsing. Updates here when new guides are added.
const GUIDE_META: Record<string, Omit<Guide, 'slug' | 'body'>> = {
  'definitive-guide-ai-automation-smbs-2026': {
    title: 'The Definitive Guide to AI Automation for SMBs in 2026',
    description: 'A 30-minute operating manual for SMB owners deciding whether and how to invest in AI automation. The 5-step audit, 7 core patterns, 5 anti-patterns, build-vs-buy framework, and 90-day deployment plan.',
    publishedDate: '2026-05-15',
    updatedDate: '2026-05-15',
    readTime: 30,
  },
  'definitive-guide-lead-generation-automation-2026': {
    title: 'The Definitive Guide to Lead Generation Automation in 2026',
    description: 'The system Aiprosol designs for sub-3-minute response time + 21x qualification lift. The 4-component scoring model, 5-touch nurture sequence, routing decision tree, dashboard spec, and the 30-day implementation plan.',
    publishedDate: '2026-05-15',
    updatedDate: '2026-05-15',
    readTime: 30,
  },
  'definitive-guide-customer-support-ai-2026': {
    title: 'The Definitive Guide to AI Customer Support in 2026',
    description: 'How to deploy AI customer support without burning CSAT. The deflection math, 5-layer escalation system, RAG over your knowledge base, 4-week phased rollout, and the dashboard you need.',
    publishedDate: '2026-05-15',
    updatedDate: '2026-05-15',
    readTime: 30,
  },
};

export function getGuides(): Guide[] {
  return Object.entries(GUIDE_META).map(([slug, meta]) => ({
    slug,
    ...meta,
    body: fs.readFileSync(path.join(GUIDES_DIR, `${slug}.md`), 'utf8'),
  }));
}

export function getGuideBySlug(slug: string): Guide | undefined {
  const meta = GUIDE_META[slug];
  if (!meta) return undefined;
  const filePath = path.join(GUIDES_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return undefined;
  return {
    slug,
    ...meta,
    body: fs.readFileSync(filePath, 'utf8'),
  };
}
