// ─────────────────────────────────────────────────────────────────────────
// /products → /digital-products (308 permanent redirect)
// The canonical catalogue index lives at /digital-products. /products had
// no index page (only /products/[slug] + /products/compare existed), so the
// bare /products URL returned 404 — bad for crawlers + anyone guessing the
// path. permanentRedirect emits a 308 so search engines transfer authority
// to the canonical URL.
// ─────────────────────────────────────────────────────────────────────────

import { permanentRedirect } from 'next/navigation';

export default function ProductsIndexRedirect() {
  permanentRedirect('/digital-products');
}
