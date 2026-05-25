#!/usr/bin/env node
// Internal link audit — walks every URL in the live sitemap, extracts internal
// hrefs, checks each for 200/404. Outputs a JSON report + a markdown summary.
//
// Run from project root: node scripts/audit-internal-links.mjs
import { writeFileSync } from 'fs';

const SITE = 'https://aiprosol.com';
const CONCURRENCY = 8;
const FETCH_TIMEOUT_MS = 12000;

async function fetchWithTimeout(url, init = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal, redirect: 'manual' });
  } finally {
    clearTimeout(t);
  }
}

async function getSitemapUrls() {
  const res = await fetchWithTimeout(`${SITE}/sitemap.xml`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

function extractInternalHrefs(html, baseUrl) {
  const out = new Set();
  // Match href attribute values
  const hrefRe = /\s(?:href|action)\s*=\s*["']([^"']+)["']/g;
  let m;
  while ((m = hrefRe.exec(html))) {
    const raw = m[1];
    if (!raw || raw.startsWith('#') || raw.startsWith('mailto:') || raw.startsWith('tel:') || raw.startsWith('javascript:')) continue;
    let abs;
    try {
      abs = new URL(raw, baseUrl).toString();
    } catch {
      continue;
    }
    // Internal only: same host as SITE
    const u = new URL(abs);
    if (u.host !== new URL(SITE).host) continue;
    // Strip hash + trailing slash for normalised dedup
    u.hash = '';
    let norm = u.toString();
    if (norm.endsWith('/') && norm !== `${SITE}/`) norm = norm.replace(/\/$/, '');
    out.add(norm);
  }
  return [...out];
}

async function head(url) {
  try {
    const r = await fetchWithTimeout(url, { method: 'HEAD' });
    return r.status;
  } catch {
    return 0;
  }
}

async function get(url) {
  try {
    const r = await fetchWithTimeout(url);
    return r.status;
  } catch {
    return 0;
  }
}

// Process N URLs at a time
async function inBatches(items, fn) {
  const out = [];
  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const chunk = items.slice(i, i + CONCURRENCY);
    const results = await Promise.all(chunk.map(fn));
    out.push(...results);
  }
  return out;
}

async function main() {
  console.log('[audit] fetching sitemap…');
  const sitemapUrls = await getSitemapUrls();
  console.log(`[audit] ${sitemapUrls.length} URLs in sitemap`);

  // For each sitemap URL, fetch HTML + extract internal hrefs
  const allInternal = new Set();
  const seenOnPage = {};
  await inBatches(sitemapUrls, async (u) => {
    try {
      const r = await fetchWithTimeout(u);
      if (!r.ok) return;
      const html = await r.text();
      const hrefs = extractInternalHrefs(html, u);
      seenOnPage[u] = hrefs;
      hrefs.forEach((h) => allInternal.add(h));
    } catch {
      /* ignore */
    }
  });
  console.log(`[audit] ${allInternal.size} unique internal href targets`);

  // Probe each unique URL via HEAD (fall back to GET if HEAD returns weird code)
  console.log('[audit] probing status codes…');
  const statuses = {};
  await inBatches([...allInternal], async (u) => {
    let s = await head(u);
    // Some hosts don't implement HEAD properly — retry with GET on 405 / 0
    if (s === 405 || s === 0 || s === 501) s = await get(u);
    statuses[u] = s;
  });

  // Categorize
  const broken = [];
  const redirects = [];
  const ok = [];
  for (const [u, code] of Object.entries(statuses)) {
    if (code >= 200 && code < 300) ok.push({ url: u, code });
    else if (code >= 300 && code < 400) redirects.push({ url: u, code });
    else broken.push({ url: u, code });
  }

  // Trace where each broken/redirect is linked FROM
  function tracebacks(target) {
    const found = [];
    for (const [src, links] of Object.entries(seenOnPage)) {
      if (links.includes(target)) found.push(src);
    }
    return found;
  }

  const report = {
    site: SITE,
    generatedAt: new Date().toISOString(),
    totals: {
      sitemapUrls: sitemapUrls.length,
      uniqueInternalTargets: allInternal.size,
      ok: ok.length,
      redirects: redirects.length,
      broken: broken.length,
    },
    broken: broken
      .map((b) => ({ ...b, linkedFrom: tracebacks(b.url) }))
      .sort((a, b) => b.linkedFrom.length - a.linkedFrom.length),
    redirects: redirects
      .map((r) => ({ ...r, linkedFrom: tracebacks(r.url) }))
      .sort((a, b) => b.linkedFrom.length - a.linkedFrom.length),
  };

  writeFileSync('internal-link-audit.json', JSON.stringify(report, null, 2));
  console.log('[audit] wrote internal-link-audit.json');
  console.log();
  console.log(`  Total internal href targets:  ${report.totals.uniqueInternalTargets}`);
  console.log(`  ✓ 2xx:                        ${report.totals.ok}`);
  console.log(`  ↻ 3xx (redirects):            ${report.totals.redirects}`);
  console.log(`  ✗ broken (4xx/5xx/error):     ${report.totals.broken}`);
  if (broken.length) {
    console.log();
    console.log('  Top broken links:');
    broken.slice(0, 10).forEach((b) => {
      console.log(`    [${b.code}] ${b.url}`);
    });
  }
}

main().catch((e) => {
  console.error('[audit] failed:', e);
  process.exit(1);
});
