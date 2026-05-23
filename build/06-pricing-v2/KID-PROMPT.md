# KID PROMPT — Phase 1.3 · Pricing V2

**What ships:**
- 3-tier card grid · Starter £997 · Growth £2,997 (featured) · Enterprise £7,997
- Live mini-ROI calculator strip (drag the sliders, the annual saving updates instantly)
- Side-by-side comparison table — 12 features × 3 plans
- 6-question FAQ accordion focused on pricing/billing concerns
- Final ROI Audit CTA at the bottom
- Calendly only on Enterprise card · zero Calendly anywhere else

## Acceptance criteria

- [ ] `/pricing` loads with 3 cards, Growth visually featured (cyan border + glow + "Most popular" badge)
- [ ] Sliders update the projected annual saving in real time
- [ ] Comparison table is readable on mobile (table scrolls horizontally if needed)
- [ ] FAQ accordion expands on click with smooth animation
- [ ] Enterprise CTA opens Calendly in a new tab; Starter/Growth go to `/checkout?plan=…`
- [ ] No off-palette colours, no Calendly on Starter or Growth, no UK refs

---

## Paste this into Kid

> **Goal:** Replace the existing Pricing page with V2.
>
> **Steps:**
> 1. Find the existing pricing page (likely `src/pages/PricingPage.tsx`).
> 2. Replace the ENTIRE file with the code below.
> 3. Confirm route `/pricing` still maps to this component.
> 4. Do not modify any other file.
>
> **Critical:**
> - Plan prices are locked: 997, 2997, 7997. Do not adjust.
> - The `Enterprise` card's CTA URL is `https://calendly.com/srijanpaudel219/30min`. The other two CTAs are internal (`/checkout?plan=…`).
> - Do not introduce a monthly/annual toggle — that's Phase 5.
>
> ```tsx
> // ─── PASTE THE ENTIRE CONTENTS OF PricingPage.tsx HERE ───
> // (copy from /Users/user/Airprosol/build/06-pricing-v2/PricingPage.tsx)
> ```

---

## After Kid finishes

- Drag both sliders on the ROI strip — saving should recompute
- Click each card's CTA — Starter and Growth go to checkout, Enterprise opens Calendly in a new tab
- Hover the comparison table rows — should highlight subtly
- Test on mobile (375px width) — cards stack, ROI strip stacks

## What's next

The conversion spine (homepage hero · ROI audit · pricing · backend functions) is now complete pending live checkout test. The next phase opens with **Catalogue & Discovery** — Digital Products page polish, product detail pages, service detail pages, integrations marquee.
