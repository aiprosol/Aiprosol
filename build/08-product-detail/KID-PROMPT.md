# KID PROMPT — Phase 2.2 · Product Detail Page

**Creates** the dynamic route `/products/:slug` and the component that renders any of the 19 products by slug. Defensive field resolvers mean the page works whether your CMS uses `category` / `productCategory` / `image` / `productImage` / etc.

## What ships

- Hero with image (zoomable on click), category chip, name, description, meta chips (file type, page count, popularity, instant download, lifetime access), price block, big buy CTA, trust line
- "What's inside" — list rendered from `whatsInside` (string with line breaks OR string array)
- "Why it works" — numbered features rendered from `features` array
- ROI strip — illustrative payback days + Yr-1 multiplier based on price band, with "see your specific number" link to /roi-audit
- Related products — same category, up to 3
- 5-question dynamic FAQ scoped to this product's price + category
- Final CTA at bottom
- Image zoom modal · keyboard-friendly · click outside to close
- Loading + error + not-found states

## Acceptance

- [ ] `/products/<slug>` for any of the 19 slugs renders the matching product
- [ ] Buying flow lands on `/checkout?product=<slug>` (or `buyUrl` if set in the CMS)
- [ ] Related products are filtered by same category, exclude the current
- [ ] FAQ adapts: products under £200 say "no required subscriptions"; products over £200 mention Zapier/Make/n8n
- [ ] Image zoom opens on click and closes on click-outside or Escape
- [ ] Mobile (320px): hero stacks, all sections readable, buy button full-width

## Paste this into Kid

> **Goal:** Add a dynamic product detail route at `/products/:slug` and the matching component.
>
> **Steps:**
> 1. Create `src/pages/ProductDetailPage.tsx` and paste the entire file body below.
> 2. Register the route `/products/:slug` (or `/products/[slug]` depending on your router) mapped to this component.
> 3. From the existing Digital Products page, ensure each card's "Buy now" / "View" link routes to `/products/<slug>` (the V2 page from `02-products-filter` already does this).
> 4. Do not modify any other file.
>
> **Critical:**
> - The slug is parsed from `window.location.pathname.split('/').pop()` so it works regardless of which router Wix Vibe is using. Do not refactor to `useParams` unless you confirm the router exposes it.
> - Inline `<Styles />` component at the bottom — do not extract to a separate CSS file.
> - The `payback` and `recoupMultiplier` values are intentionally illustrative for marketing copy; the real per-customer ROI lives only in the `/roi-audit` form.
>
> ```tsx
> // ─── PASTE THE ENTIRE CONTENTS OF ProductDetailPage.tsx HERE ───
> // (copy from /Users/user/Airprosol/build/08-product-detail/ProductDetailPage.tsx)
> ```

## After Kid finishes

Test 3 product slugs across price bands (`the-complete-vault`, `lead-generation-automation-playbook`, `automation-roi-pitch-deck-template` — or whatever your slugs are). Confirm each loads, related products differ per category, and the FAQ adapts to the price band.

## What's next

Phase 2.3 — Service Detail Pages (`/services/:slug`) — already shipped in [09-service-detail/](build/09-service-detail/).
