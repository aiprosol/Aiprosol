#!/usr/bin/env node
// Accessibility audit — walks sitemap URLs, parses HTML, checks:
//   1. <img> tags missing alt attribute (a11y violation)
//   2. <button> / <a> tags with no accessible name (text + aria-label both empty)
//   3. Heading hierarchy: exactly one <h1> per page; H2-H6 sequential
//   4. <form> + form controls missing labels
//   5. <html lang> attribute present
//   6. Skip-link present (per-site convention check)
//
// Run from project root: node scripts/audit-a11y.mjs
import { writeFileSync } from 'fs';

const SITE = 'https://aiprosol.com';
const CONCURRENCY = 6;
const FETCH_TIMEOUT_MS = 12000;

async function fetchWithTimeout(url, init = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

async function getSitemapUrls() {
  const res = await fetchWithTimeout(`${SITE}/sitemap.xml`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

// Naive HTML inspection (no DOM lib — keep dependency-free). Tag-regex
// matching is intentionally simple; flags false-positives over false-negatives.
function inspect(html, url) {
  const issues = [];

  // 1. <html lang>
  if (!/<html[^>]+\blang\s*=/.test(html)) {
    issues.push({ severity: 'error', rule: 'html-lang', message: '<html> missing lang attribute' });
  }

  // 2. <img> missing alt
  const imgMatches = [...html.matchAll(/<img\b([^>]*?)\/?>/gi)];
  let missingAlt = 0;
  for (const m of imgMatches) {
    const attrs = m[1] || '';
    if (!/\balt\s*=/.test(attrs)) missingAlt++;
  }
  if (missingAlt > 0) {
    issues.push({
      severity: 'error', rule: 'img-alt', count: missingAlt,
      message: `${missingAlt} <img> tag(s) missing alt attribute (decorative images should use alt="")`,
    });
  }

  // 3. <a> / <button> with no accessible name
  // Pattern: opening tag, then inner content up to closing tag.
  const linkMatches = [...html.matchAll(/<(a|button)\b([^>]*)>([\s\S]*?)<\/\1>/gi)];
  let emptyControls = 0;
  for (const m of linkMatches) {
    const attrs = m[2] || '';
    const inner = (m[3] || '').replace(/<[^>]+>/g, '').trim();
    const hasAriaLabel = /aria-label\s*=\s*["'][^"']+["']/.test(attrs);
    const hasAriaLabelledby = /aria-labelledby\s*=/.test(attrs);
    const hasTitle = /\btitle\s*=\s*["'][^"']+["']/.test(attrs);
    // Allow <a> with <img alt="X"> inside
    const innerHasImageAlt = /<img[^>]+alt\s*=\s*["'][^"']+["']/.test(m[3] || '');
    if (!inner && !hasAriaLabel && !hasAriaLabelledby && !hasTitle && !innerHasImageAlt) {
      emptyControls++;
    }
  }
  if (emptyControls > 0) {
    issues.push({
      severity: 'error', rule: 'control-name', count: emptyControls,
      message: `${emptyControls} <a>/<button> with no accessible name (no text, no aria-label, no title)`,
    });
  }

  // 4. Heading hierarchy: should have ONE h1 + h2-h6 in roughly increasing order
  const headings = [...html.matchAll(/<h([1-6])\b/gi)].map((m) => parseInt(m[1], 10));
  const h1Count = headings.filter((h) => h === 1).length;
  if (h1Count === 0) {
    issues.push({ severity: 'warning', rule: 'h1-missing', message: 'No <h1> on page' });
  } else if (h1Count > 1) {
    issues.push({
      severity: 'warning', rule: 'h1-multiple', count: h1Count,
      message: `${h1Count} <h1> tags on page — should be exactly 1`,
    });
  }
  // Heading hierarchy: flag jumps of >1 level
  let prev = 0;
  let skipCount = 0;
  for (const h of headings) {
    if (prev && h > prev + 1) skipCount++;
    prev = h;
  }
  if (skipCount > 0) {
    issues.push({
      severity: 'warning', rule: 'heading-skip', count: skipCount,
      message: `${skipCount} heading level skip(s) (e.g. h2 → h4 without h3 in between)`,
    });
  }

  // 5. Form controls without labels (simple version — count <input>/<select>/<textarea> that don't have id+matching label)
  const formControls = [...html.matchAll(/<(input|select|textarea)\b([^>]*?)\/?>/gi)];
  const labelFor = new Set([...html.matchAll(/<label[^>]+for\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1]));
  let unlabelled = 0;
  for (const m of formControls) {
    const attrs = m[2] || '';
    const idMatch = attrs.match(/\bid\s*=\s*["']([^"']+)["']/);
    const hasAriaLabel = /aria-label\s*=\s*["'][^"']+["']/.test(attrs);
    const hasAriaLabelledby = /aria-labelledby\s*=/.test(attrs);
    const typeMatch = attrs.match(/\btype\s*=\s*["']([^"']+)["']/);
    const type = typeMatch ? typeMatch[1] : 'text';
    // hidden inputs + submit buttons with visible value don't need a label
    if (type === 'hidden' || type === 'submit' || type === 'button') continue;
    if (hasAriaLabel || hasAriaLabelledby) continue;
    if (idMatch && labelFor.has(idMatch[1])) continue;
    unlabelled++;
  }
  if (unlabelled > 0) {
    issues.push({
      severity: 'error', rule: 'form-label', count: unlabelled,
      message: `${unlabelled} form control(s) missing labels (no <label for>, no aria-label, no aria-labelledby)`,
    });
  }

  // 6. Skip-link (per-site convention — we expect "Skip to main content")
  if (!/(skip[- ]link|skip[- ]to[- ]main)/i.test(html)) {
    issues.push({ severity: 'info', rule: 'skip-link', message: 'No skip-to-main-content link detected' });
  }

  return issues;
}

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
  console.log('[a11y] fetching sitemap…');
  const urls = await getSitemapUrls();
  console.log(`[a11y] ${urls.length} URLs in sitemap`);

  const results = await inBatches(urls, async (u) => {
    try {
      const r = await fetchWithTimeout(u);
      if (!r.ok) return { url: u, fetchStatus: r.status, issues: [] };
      const html = await r.text();
      return { url: u, fetchStatus: r.status, issues: inspect(html, u) };
    } catch (e) {
      return { url: u, fetchStatus: 0, issues: [{ severity: 'error', rule: 'fetch', message: String(e) }] };
    }
  });

  // Aggregate
  const totals = { urls: results.length, errors: 0, warnings: 0, infos: 0 };
  const byRule = {};
  for (const r of results) {
    for (const i of r.issues) {
      if (i.severity === 'error') totals.errors += i.count || 1;
      else if (i.severity === 'warning') totals.warnings += i.count || 1;
      else if (i.severity === 'info') totals.infos += i.count || 1;
      byRule[i.rule] = (byRule[i.rule] || 0) + (i.count || 1);
    }
  }

  const report = {
    site: SITE,
    generatedAt: new Date().toISOString(),
    totals,
    byRule,
    pages: results.filter((r) => r.issues.length > 0).map((r) => ({
      url: r.url,
      issues: r.issues,
    })),
  };

  writeFileSync('a11y-audit-report.json', JSON.stringify(report, null, 2));
  console.log('[a11y] wrote a11y-audit-report.json');
  console.log();
  console.log(`  URLs scanned:                ${totals.urls}`);
  console.log(`  Errors:                      ${totals.errors}`);
  console.log(`  Warnings:                    ${totals.warnings}`);
  console.log(`  Info:                        ${totals.infos}`);
  console.log();
  console.log('  By rule:');
  Object.entries(byRule)
    .sort((a, b) => b[1] - a[1])
    .forEach(([rule, n]) => console.log(`    ${rule.padEnd(20)} ${n}`));
}

main().catch((e) => {
  console.error('[a11y] failed:', e);
  process.exit(1);
});
