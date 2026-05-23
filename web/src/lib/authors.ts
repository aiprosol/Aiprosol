// ─────────────────────────────────────────────────────────────────────────
// Authors — slug + identity mapping for blog post authors.
// Used by /authors/[slug] archive page and per-post twitter:creator.
// Two authors at Aiprosol: Srijan (human Chairman) + Arora (AI CEO).
// Both have schema.org entities declared in root layout (#srijan-paudel
// + #arora-ai-ceo) and corresponding Wikidata entities where applicable.
// ─────────────────────────────────────────────────────────────────────────

import { getBlogPosts } from './content';
import type { BlogPost } from '@/types';

export type AuthorSlug = 'srijan-paudel' | 'arora';

export interface Author {
  slug: AuthorSlug;
  name: string;            // exact name in blog.json `author` field
  displayName: string;     // for headlines
  type: 'Person' | 'SoftwareApplication';
  role: string;
  bio: string;
  longBio: string;
  twitter: string;         // handle without @
  homepage: string;        // relative path on aiprosol.com
  jsonLdId: string;        // matches the @id in root layout
  wikidataId?: string;     // Q-number on wikidata.org
  image: string;           // OG/avatar
  externalLinks: Array<{ label: string; url: string }>;
}

export const AUTHORS: Record<AuthorSlug, Author> = {
  'srijan-paudel': {
    slug: 'srijan-paudel',
    name: 'Srijan Paudel',
    displayName: 'Srijan Paudel',
    type: 'Person',
    role: 'Founder & Chairman',
    bio: 'Founder and Chairman of Aiprosol. The one human in a company of ten AI agents.',
    longBio:
      'Srijan Paudel is the founder and Chairman of Aiprosol — the global AI automation consultancy operated by an AI C-suite of ten AI agents plus one human Chairman. He started Aiprosol in April 2026 to build the first publicly-operating proof-of-concept of an AI-led operating model. Based in Edinburgh, Scotland with an operational office in Kathmandu, Nepal. Nepali by citizenship; undergraduate alumnus of Edinburgh Napier University. Writes on AI-led operating models, agentic AI systems, and the practical economics of AI automation for SMBs.',
    twitter: 'srijanpaudel6',
    homepage: '/founder',
    jsonLdId: 'https://aiprosol.com/#srijan-paudel',
    wikidataId: 'Q139821959',
    // Uses the dynamic Next.js OG route at /founder/opengraph-image —
    // the static /og/founder-srijan-paudel.png file does not exist.
    image: '/founder/opengraph-image',
    externalLinks: [
      { label: 'Wikidata', url: 'https://www.wikidata.org/wiki/Q139821959' },
      { label: 'LinkedIn', url: 'https://www.linkedin.com/in/srijan-paudel' },
      { label: 'X', url: 'https://x.com/srijanpaudel6' },
      { label: 'GitHub', url: 'https://github.com/srijanpaudel' },
      { label: 'Aiprosol — Founder page', url: 'https://aiprosol.com/founder' },
      { label: 'Aiprosol — Press', url: 'https://aiprosol.com/press' },
      { label: 'Edinburgh Napier University (alma mater)', url: 'https://www.napier.ac.uk' },
    ],
  },
  arora: {
    slug: 'arora',
    name: 'Arora',
    displayName: 'Arora · AI CEO',
    type: 'SoftwareApplication',
    role: 'AI Chief Executive Officer',
    bio: 'The AI CEO of Aiprosol. Coordinates the other nine agents, fronts customer chat, writes most of the operator-grade content.',
    longBio:
      'Arora is the AI CEO of Aiprosol. Running on a frontier LLM with an open-source fallback model, Arora executes on a 6-hour cron, coordinates the other nine AI agents in the Aiprosol C-suite, and is the customer-facing chat widget on aiprosol.com. Every customer-facing output drafted by Arora passes through Srijan Paudel (human Chairman) for approval before shipping.',
    // No dedicated @aiprosol handle exists yet (the Twitter @aiprosol belongs
    // to the unrelated Australian firm aiprosol.au). Until a brand handle is
    // claimed, Arora-authored posts credit @srijanpaudel6 — the dual founder
    // + brand voice account.
    twitter: 'srijanpaudel6',
    homepage: '/agents/arora',
    jsonLdId: 'https://aiprosol.com/#arora-ai-ceo',
    image: '/api/og/agent/arora',
    externalLinks: [
      { label: 'Live activity', url: 'https://aiprosol.com/agents/arora' },
      { label: 'AI C-Suite', url: 'https://aiprosol.com/agents' },
      { label: 'Operational transparency', url: 'https://aiprosol.com/transparency' },
    ],
  },
};

export const AUTHOR_SLUGS = Object.keys(AUTHORS) as AuthorSlug[];

/** Resolve a free-text author string from blog.json to an Author record. */
export function findAuthor(name: string | undefined): Author | null {
  if (!name) return null;
  const trimmed = name.trim().toLowerCase();
  if (/srijan/i.test(trimmed) || /paudel/i.test(trimmed)) return AUTHORS['srijan-paudel'];
  if (/arora/i.test(trimmed)) return AUTHORS.arora;
  return null;
}

/** Slug → Author. */
export function getAuthor(slug: string): Author | null {
  return AUTHORS[slug as AuthorSlug] ?? null;
}

/** All posts authored by `slug`, newest first. */
export function postsByAuthor(slug: AuthorSlug): BlogPost[] {
  const author = AUTHORS[slug];
  if (!author) return [];
  return getBlogPosts()
    .filter((p) => findAuthor(p.author)?.slug === slug)
    .sort((a, b) => {
      const da = a.publishedDate ? new Date(a.publishedDate).getTime() : 0;
      const db = b.publishedDate ? new Date(b.publishedDate).getTime() : 0;
      return db - da;
    });
}
