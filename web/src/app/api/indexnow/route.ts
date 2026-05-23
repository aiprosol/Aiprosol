// ─────────────────────────────────────────────────────────────────────────
// /api/indexnow — fire IndexNow ping at every deploy to Bing.
//
// IndexNow is a free protocol (api.indexnow.org) that lets sites notify
// search engines instantly when URLs change. Bing + Yandex respect it
// natively. Google doesn't, but their crawler picks it up via shared
// signals from the broader index.
//
// Usage:
//   1. Vercel deploy hook calls this endpoint after every successful deploy
//   2. Or hit it manually: curl https://aiprosol.com/api/indexnow
//
// Auth: Cron-secret header OR query param.
// ─────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { getProducts, getServices, getCaseStudies, getBlogPosts } from '@/lib/content';
import comparisons from '@/content/comparisons.json';
import glossary from '@/content/glossary.json';
import industries from '@/content/industries.json';
import useCases from '@/content/use-cases.json';
import howtos from '@/content/how-to.json';
import { getGuides } from '@/lib/guides';
import { ROLES } from '@/lib/agents/types';

const INDEXNOW_KEY = '571b0579b3a7183844df31c74485075637a5a919c5237a439671653bca4a45dd';
const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://aiprosol.com';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function allUrls(): string[] {
  const staticRoutes = [
    '', '/digital-products', '/services', '/pricing', '/roi-audit',
    '/roi-simulator', '/case-studies', '/blog', '/faqs', '/about', '/founder',
    '/contact', '/agents', '/transparency', '/how-we-measure',
    '/press', '/search', '/compare', '/glossary', '/industries', '/use-cases',
    '/how-to', '/guides',
  ];
  const urls: string[] = [
    ...staticRoutes.map((p) => `${BASE}${p}`),
    ...getProducts().map((p) => `${BASE}/products/${p.slug}`),
    ...getServices().map((s) => `${BASE}/services/${s.slug}`),
    ...getCaseStudies().map((c) => `${BASE}/case-studies/${c.slug}`),
    ...getBlogPosts().map((p) => `${BASE}/blog/${p.slug}`),
    ...comparisons.map((c) => `${BASE}/compare/${c.slug}`),
    ...glossary.map((g) => `${BASE}/glossary/${g.slug}`),
    ...industries.map((i) => `${BASE}/industries/${i.slug}`),
    ...useCases.map((u) => `${BASE}/use-cases/${u.slug}`),
    ...howtos.map((h) => `${BASE}/how-to/${h.slug}`),
    ...getGuides().map((g) => `${BASE}/guides/${g.slug}`),
    ...ROLES.map((r) => `${BASE}/agents/${r}`),
  ];
  // Dedupe + trim
  return Array.from(new Set(urls));
}

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const auth = req.headers.get('authorization');
  const querySecret = req.nextUrl.searchParams.get('secret');

  if (cronSecret && auth !== `Bearer ${cronSecret}` && querySecret !== cronSecret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const urls = allUrls();
  const host = new URL(BASE).hostname;

  // IndexNow can take up to 10,000 URLs per request, but Bing recommends
  // batching at ~10 URLs per call for fastest indexing. We submit all in
  // a single batch since the count is well under 10,000.
  try {
    const body = {
      host,
      key: INDEXNOW_KEY,
      keyLocation: `${BASE}/${INDEXNOW_KEY}.txt`,
      urlList: urls,
    };

    // Submit to multiple endpoints for redundancy (all use the same protocol)
    const endpoints = [
      'https://api.indexnow.org/IndexNow',
      'https://www.bing.com/IndexNow',
    ];

    const results = await Promise.all(
      endpoints.map(async (endpoint) => {
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify(body),
          });
          return { endpoint, status: res.status, ok: res.ok };
        } catch (e) {
          return { endpoint, error: e instanceof Error ? e.message : String(e) };
        }
      }),
    );

    return NextResponse.json({
      ok: true,
      submitted: urls.length,
      key: INDEXNOW_KEY.slice(0, 8) + '…',
      results,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'unknown' },
      { status: 500 },
    );
  }
}
