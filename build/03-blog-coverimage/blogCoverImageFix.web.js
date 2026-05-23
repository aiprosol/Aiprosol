// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · BLOG COVERIMAGE BULK FIX
// Phase 0.5 — fixes 19 blog posts where coverImage is stored as
// { stringValue: "https://..." } instead of a plain string URL.
//
// Cause: at some point a PATCH was used instead of PUT, and Wix Data API v2
// PATCH wraps string values in { stringValue: "..." }, which the Wix
// frontend image renderer can't parse.
//
// Fix strategy:
//   1. Query ALL blog items.
//   2. For each: detect if coverImage is the wrapped object form.
//   3. Unwrap to plain string URL.
//   4. Update the entire item back (Wix's update() preserves all fields).
//
// Run from Wix Vibe editor:
//   - Place this file at: backend/blogCoverImageFix.web.js
//   - From a frontend page or the editor's HTTP function caller, invoke
//     fixAllBlogCoverImages() — see USAGE.md alongside this file.
//
// Output: returns { fixed, skipped, errored, durationMs } and console.logs
// the same. Idempotent — safe to run repeatedly.
// ─────────────────────────────────────────────────────────────────────────

import wixData from 'wix-data';

const COLLECTION = 'blog';
const FIELD = 'coverImage';

/**
 * Walk every blog item and rewrite stringValue-wrapped coverImages
 * to plain string URLs.
 */
export async function fixAllBlogCoverImages() {
  const startedAt = Date.now();
  const out = {
    startedAt: new Date(startedAt).toISOString(),
    durationMs: 0,
    total: 0,
    fixed: [],
    skippedAlreadyOk: [],
    skippedNoUrl: [],
    errored: [],
  };

  // Pull every item. limit(1000) covers up to 1000; bump if catalogue grows.
  const res = await wixData.query(COLLECTION).limit(1000).find({ suppressAuth: true });
  const all = res.items || [];
  out.total = all.length;

  for (const item of all) {
    const cov = item[FIELD];

    // CASE 1: already a clean URL string — no change needed.
    if (typeof cov === 'string' && /^https?:\/\//i.test(cov)) {
      out.skippedAlreadyOk.push({ id: item._id, title: item.title || item.name });
      continue;
    }

    // CASE 2: wrapped { stringValue: "url" } — unwrap.
    let url = null;
    if (cov && typeof cov === 'object') {
      if (typeof cov.stringValue === 'string') url = cov.stringValue;
      else if (typeof cov.url === 'string') url = cov.url;
      else if (typeof cov.src === 'string') url = cov.src;
    }

    if (!url || !/^https?:\/\//i.test(url)) {
      out.skippedNoUrl.push({
        id: item._id,
        title: item.title || item.name,
        rawValue: cov,
      });
      continue;
    }

    // Apply fix. wixData.update sends the WHOLE item back, satisfying the
    // "PUT replaces the entire item" rule from the Master Blueprint.
    try {
      const fixed = { ...item, [FIELD]: url };
      await wixData.update(COLLECTION, fixed, { suppressAuth: true });
      out.fixed.push({ id: item._id, title: item.title || item.name, url });
    } catch (err) {
      out.errored.push({
        id: item._id,
        title: item.title || item.name,
        error: err && err.message ? err.message : String(err),
      });
    }
  }

  out.durationMs = Date.now() - startedAt;

  console.log('═══════════════════════════════════════════════════════════');
  console.log('AIPROSOL BLOG COVERIMAGE FIX — ' + out.startedAt);
  console.log('───────────────────────────────────────────────────────────');
  console.log('Total items:      ' + out.total);
  console.log('Fixed:            ' + out.fixed.length);
  console.log('Already OK:       ' + out.skippedAlreadyOk.length);
  console.log('Skipped (no URL): ' + out.skippedNoUrl.length);
  console.log('Errored:          ' + out.errored.length);
  console.log('Duration:         ' + out.durationMs + 'ms');
  console.log('───────────────────────────────────────────────────────────');
  if (out.fixed.length) console.log('Fixed sample:', out.fixed[0]);
  if (out.errored.length) console.log('First error:', out.errored[0]);
  console.log('═══════════════════════════════════════════════════════════');

  return out;
}

/**
 * Optional: dry-run that reports what WOULD change without writing.
 * Call this first if you want to preview the impact.
 */
export async function previewBlogCoverImageFix() {
  const out = { wouldFix: [], alreadyOk: [], noUrl: [] };
  const res = await wixData.query(COLLECTION).limit(1000).find({ suppressAuth: true });
  for (const item of res.items || []) {
    const cov = item[FIELD];
    if (typeof cov === 'string' && /^https?:\/\//i.test(cov)) {
      out.alreadyOk.push(item._id);
      continue;
    }
    if (cov && typeof cov === 'object') {
      const url = cov.stringValue || cov.url || cov.src;
      if (url && /^https?:\/\//i.test(url)) {
        out.wouldFix.push({ id: item._id, title: item.title || item.name, url });
        continue;
      }
    }
    out.noUrl.push({ id: item._id, title: item.title || item.name, rawValue: cov });
  }
  console.log('PREVIEW — would fix ' + out.wouldFix.length + ' items, ' + out.alreadyOk.length + ' already ok, ' + out.noUrl.length + ' missing url');
  return out;
}
