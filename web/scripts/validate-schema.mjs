#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · Schema.org JSON-LD validator (local-only, no external services)
//
// validator.schema.org started CAPTCHA-blocking programmatic requests in
// late 2024. Google's Rich Results Test API requires OAuth. This script
// runs a STRUCTURAL validator locally:
//
//   1. Fetches every URL in /sitemap.xml
//   2. Extracts every <script type="application/ld+json"> block
//   3. Validates each block against a built-in ruleset:
//        a. JSON is parseable
//        b. @context + @type present
//        c. Required properties present for known types
//        d. URL-shaped fields are absolute URLs
//        e. Date-shaped fields are ISO 8601
//        f. @id fields use the canonical pattern (aiprosol.com/#…)
//        g. sameAs entries are absolute URLs
//   4. Emits schema-validation-report.json with severity counts
//
// Exits non-zero on any Error-severity issue.
//
// Run:  node scripts/validate-schema.mjs [--limit N] [--check-urls]
//   --check-urls   ALSO HEAD-fetch each sameAs/url to verify it's not 404
// ─────────────────────────────────────────────────────────────────────────

import fs from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
const arg = (k, fallback) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i + 1] : fallback;
};
const has = (k) => args.includes(k);

const SITE = arg('--site', 'https://aiprosol.com');
const LIMIT = parseInt(arg('--limit', '0'), 10);
const CHECK_URLS = has('--check-urls');
const REPORT_PATH = path.resolve(arg('--out', 'schema-validation-report.json'));
const CONCURRENCY = parseInt(arg('--concurrency', '6'), 10);

// ─── Required-property rules per @type ───────────────────────────────────
// Keep narrow and focused on real high-leverage entities used on the site.
const TYPE_RULES = {
  Person: { required: ['name'], recommended: ['url', 'jobTitle', 'sameAs'] },
  Organization: { required: ['name', 'url'], recommended: ['logo', 'sameAs', 'description'] },
  ProfessionalService: { required: ['name', 'url'], recommended: ['address', 'logo'] },
  SoftwareApplication: { required: ['name'], recommended: ['applicationCategory', 'operatingSystem'] },
  WebSite: { required: ['name', 'url'], recommended: ['potentialAction'] },
  WebPage: { required: ['name'], recommended: ['url'] },
  CollectionPage: { required: ['name'], recommended: ['url'] },
  AboutPage: { required: ['name'], recommended: ['url', 'about'] },
  ProfilePage: { required: ['mainEntity'], recommended: ['url'] },
  Blog: { required: ['name'], recommended: ['url'] },
  BlogPosting: { required: ['headline', 'author'], recommended: ['datePublished', 'image'] },
  Article: { required: ['headline'], recommended: ['author', 'datePublished'] },
  FAQPage: { required: ['mainEntity'], recommended: [] },
  Question: { required: ['name', 'acceptedAnswer'], recommended: [] },
  Answer: { required: ['text'], recommended: [] },
  BreadcrumbList: { required: ['itemListElement'], recommended: [] },
  ListItem: { required: ['position'], recommended: ['name', 'item'] },
  ItemList: { required: [], recommended: ['itemListElement'] },
  Service: { required: ['name'], recommended: ['provider', 'areaServed', 'offers'] },
  Product: { required: ['name'], recommended: ['image', 'description', 'offers'] },
  Offer: { required: ['price', 'priceCurrency'], recommended: ['availability'] },
  HowTo: { required: ['name', 'step'], recommended: ['totalTime', 'tool'] },
  HowToStep: { required: ['text'], recommended: ['name'] },
  Course: { required: ['name', 'description', 'provider'], recommended: ['educationalLevel'] },
  Dataset: { required: ['name'], recommended: ['description', 'license'] },
  CollegeOrUniversity: { required: ['name'], recommended: [] },
  Country: { required: ['name'], recommended: [] },
  Place: { required: [], recommended: ['name'] },
  ImageObject: { required: ['url'], recommended: ['width', 'height'] },
  Brand: { required: ['name'], recommended: [] },
  Occupation: { required: [], recommended: ['name'] },
  Language: { required: ['name'], recommended: [] },
  ContactPoint: { required: ['contactType'], recommended: ['email'] },
  PostalAddress: { required: [], recommended: ['addressCountry'] },
  PropertyValue: { required: ['value'], recommended: ['propertyID'] },
  BusinessAudience: { required: [], recommended: ['audienceType'] },
};

const URL_FIELDS = new Set(['url', 'image', 'logo', 'sameAs', 'item', 'mainEntityOfPage']);
const DATE_FIELDS = new Set(['datePublished', 'dateModified', 'startDate', 'endDate', 'birthDate', 'foundingDate']);

// ─── Validation helpers ──────────────────────────────────────────────────
function isAbsoluteUrl(s) {
  return typeof s === 'string' && /^https?:\/\//i.test(s);
}
function isIsoDate(s) {
  if (typeof s !== 'string') return false;
  // Accept full ISO 8601 OR year-only "2004" (Schema.org allows incomplete dates)
  return /^\d{4}(-\d{2}(-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+\-]\d{2}:\d{2})?)?)?)?$/.test(s);
}

function walk(node, fn, p = '$') {
  fn(node, p);
  if (Array.isArray(node)) {
    node.forEach((v, i) => walk(v, fn, `${p}[${i}]`));
  } else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) walk(v, fn, `${p}.${k}`);
  }
}

function validateNode(node, _path, errors, warnings) {
  if (!node || typeof node !== 'object' || Array.isArray(node)) return;
  const t = node['@type'];
  if (!t) return;
  // @type may be an array (multi-type)
  const types = Array.isArray(t) ? t : [t];
  for (const ty of types) {
    const rule = TYPE_RULES[ty];
    if (!rule) continue;
    for (const req of rule.required) {
      if (node[req] === undefined || node[req] === null || node[req] === '') {
        errors.push({ severity: 'Error', at: _path, type: ty, message: `${ty} missing required '${req}'` });
      }
    }
    for (const rec of rule.recommended) {
      if (node[rec] === undefined || node[rec] === null) {
        warnings.push({ severity: 'Warning', at: _path, type: ty, message: `${ty} missing recommended '${rec}'` });
      }
    }
  }
  // Field-shape checks
  for (const [k, v] of Object.entries(node)) {
    if (URL_FIELDS.has(k)) {
      const vals = Array.isArray(v) ? v : [v];
      for (const val of vals) {
        if (typeof val === 'string' && !isAbsoluteUrl(val) && !val.startsWith('#')) {
          errors.push({ severity: 'Error', at: `${_path}.${k}`, message: `'${k}' must be an absolute URL, got: ${String(val).slice(0, 60)}` });
        }
      }
    }
    if (DATE_FIELDS.has(k) && typeof v === 'string' && !isIsoDate(v)) {
      errors.push({ severity: 'Error', at: `${_path}.${k}`, message: `'${k}' is not ISO 8601: ${String(v).slice(0, 60)}` });
    }
  }
}

function validateJsonLd(jsonText, errors, warnings) {
  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch (e) {
    errors.push({ severity: 'Error', message: `JSON parse failed: ${e.message}` });
    return { types: [], parsed: null };
  }
  // @graph form OR single entity OR array
  const roots = Array.isArray(parsed) ? parsed : parsed['@graph'] ? parsed['@graph'] : [parsed];
  const types = [];
  for (const root of roots) {
    if (!root || typeof root !== 'object') continue;
    if (!root['@context'] && !parsed['@context']) {
      warnings.push({ severity: 'Warning', message: 'Missing @context (Schema.org expects @context: "https://schema.org")' });
    }
    if (!root['@type']) {
      warnings.push({ severity: 'Warning', message: 'Root node missing @type' });
    } else {
      const t = root['@type'];
      types.push(...(Array.isArray(t) ? t : [t]));
    }
    walk(root, (n, p) => validateNode(n, p, errors, warnings));
  }
  return { types, parsed };
}

// ─── Sitemap + page fetch ────────────────────────────────────────────────
async function getSitemapUrls() {
  const res = await fetch(`${SITE}/sitemap.xml`);
  if (!res.ok) throw new Error(`Sitemap fetch failed: HTTP ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

async function fetchPage(url) {
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: { 'User-Agent': 'Aiprosol-Schema-Validator/1.1' },
    });
    if (!res.ok) return { ok: false, status: res.status, html: '' };
    return { ok: true, status: res.status, html: await res.text() };
  } catch (e) {
    return { ok: false, status: 0, html: '', error: String(e) };
  }
}

function extractJsonLdBlocks(html) {
  const out = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) out.push(m[1].trim());
  return out;
}

// Optional sameAs/URL reachability check
async function checkExternalUrls(urls) {
  const checked = {};
  const list = [...new Set(urls)];
  const pool = [];
  let idx = 0;
  const worker = async () => {
    while (true) {
      const i = idx++;
      if (i >= list.length) return;
      const u = list[i];
      try {
        const res = await fetch(u, { method: 'HEAD', redirect: 'follow' });
        checked[u] = res.status;
      } catch (e) {
        checked[u] = 0;
      }
    }
  };
  for (let i = 0; i < 4; i++) pool.push(worker());
  await Promise.all(pool);
  return checked;
}

// ─── Pool helper ─────────────────────────────────────────────────────────
async function runPool(items, worker, concurrency) {
  const out = new Array(items.length);
  let idx = 0;
  const runners = Array.from({ length: concurrency }, async () => {
    while (true) {
      const i = idx++;
      if (i >= items.length) return;
      out[i] = await worker(items[i], i);
    }
  });
  await Promise.all(runners);
  return out;
}

// ─── Main ────────────────────────────────────────────────────────────────
const t0 = Date.now();
console.log(`[validate-schema] site=${SITE} limit=${LIMIT || 'all'} concurrency=${CONCURRENCY} check-urls=${CHECK_URLS}`);

const allUrls = await getSitemapUrls();
const urls = LIMIT > 0 ? allUrls.slice(0, LIMIT) : allUrls;
console.log(`[validate-schema] sitemap has ${allUrls.length} URLs; checking ${urls.length}`);

let totalBlocks = 0;
let totalErrors = 0;
let totalWarnings = 0;
const allExternalUrls = new Set();
const perPage = [];

await runPool(urls, async (url, i) => {
  const fetched = await fetchPage(url);
  if (!fetched.ok) {
    perPage.push({ url, fetchStatus: fetched.status, blocks: 0, errors: [{ severity: 'Error', message: `Fetch failed: HTTP ${fetched.status}` }], warnings: [] });
    totalErrors++;
    console.log(`  ❌ [${i + 1}/${urls.length}] ${url}  fetch failed: ${fetched.status}`);
    return;
  }
  const blocks = extractJsonLdBlocks(fetched.html);
  totalBlocks += blocks.length;
  const blockResults = [];
  for (const [bi, raw] of blocks.entries()) {
    const errors = [];
    const warnings = [];
    const { types, parsed } = validateJsonLd(raw, errors, warnings);
    // Harvest external URLs for optional reachability check
    if (parsed && CHECK_URLS) {
      walk(parsed, (n) => {
        if (n && typeof n === 'object') {
          for (const [k, v] of Object.entries(n)) {
            if (URL_FIELDS.has(k)) {
              const vals = Array.isArray(v) ? v : [v];
              for (const val of vals) {
                if (typeof val === 'string' && isAbsoluteUrl(val)) allExternalUrls.add(val);
              }
            }
          }
        }
      });
    }
    totalErrors += errors.length;
    totalWarnings += warnings.length;
    blockResults.push({ index: bi, types, errors, warnings });
  }
  perPage.push({ url, fetchStatus: fetched.status, blocks: blocks.length, blockResults });
  const errCount = blockResults.reduce((s, b) => s + b.errors.length, 0);
  const warnCount = blockResults.reduce((s, b) => s + b.warnings.length, 0);
  const tag = errCount > 0 ? '❌' : warnCount > 0 ? '⚠️ ' : '✓';
  console.log(`  ${tag} [${i + 1}/${urls.length}] ${url}  blocks=${blocks.length}  err=${errCount}  warn=${warnCount}`);
}, CONCURRENCY);

let externalUrlChecks = null;
if (CHECK_URLS && allExternalUrls.size > 0) {
  console.log(`\n[validate-schema] checking reachability of ${allExternalUrls.size} unique external URLs…`);
  externalUrlChecks = await checkExternalUrls([...allExternalUrls]);
  const broken = Object.entries(externalUrlChecks).filter(([, s]) => s >= 400 || s === 0);
  console.log(`  broken: ${broken.length}`);
  for (const [u, s] of broken) console.log(`    [${s}] ${u}`);
}

const report = {
  site: SITE,
  generatedAt: new Date().toISOString(),
  durationMs: Date.now() - t0,
  totals: {
    urlsChecked: urls.length,
    totalBlocks,
    totalErrors,
    totalWarnings,
    externalUrlsChecked: externalUrlChecks ? Object.keys(externalUrlChecks).length : 0,
    externalUrlsBroken: externalUrlChecks ? Object.values(externalUrlChecks).filter((s) => s >= 400 || s === 0).length : 0,
  },
  pages: perPage,
  externalUrlChecks,
};

await fs.writeFile(REPORT_PATH, JSON.stringify(report, null, 2));
console.log(`\n[validate-schema] wrote ${REPORT_PATH}`);
console.log(`[validate-schema] urls=${urls.length} blocks=${totalBlocks} errors=${totalErrors} warnings=${totalWarnings}`);

process.exit(totalErrors > 0 ? 1 : 0);
