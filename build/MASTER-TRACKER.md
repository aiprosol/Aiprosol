# AIPROSOL V2.0 BUILD · MASTER TRACKER

Lives in `/Users/user/Airprosol/build/`. Updated every checkpoint.

> **PIVOT 2026-05-07:** Srijan decided to migrate off Wix Vibe to Next.js 15 on Vercel. The V2.0 build artefacts in this folder become **reference material** — most components port over to `/Users/user/Airprosol/web/` (the new Next.js project). See `web/MIGRATION.md` for the migration plan. Phase tasks below stay marked ✅ for what shipped on Wix, but the active build is now in `web/`.

> Status legend: 🟦 not started · 🟧 in progress · ✅ shipped · 🔒 blocked · 🔄 migrating to Next.js

---

## Phase 0 · Foundation

| # | Task | Owner | Status | Notes |
|---|------|-------|--------|-------|
| 0.1 | Design tokens (CSS) | Arora | ✅ shipped | `_design/tokens.css` — paste into Wix Global CSS |
| 0.2 | CMS audit page | Arora | ✅ shipped | `01-cms-audit/AuditPage.tsx` + Kid prompt |
| 0.3 | Run audit & share output | Srijan | 🟦 awaiting | Visit `/_audit`, copy JSON, paste in chat |
| 0.4 | Digital Products filter fix | Arora | ✅ shipped | `02-products-filter/DigitalProductsPage.tsx` + Kid prompt · uses defensive field-name resolver since audit not yet run |
| 0.5 | Blog `coverImage` bulk fix | Arora | ✅ shipped | `03-blog-coverimage/blogCoverImageFix.web.js` + USAGE.md · idempotent · preview function included |

---

## Phase 1 · Conversion Spine

| # | Task | Owner | Status |
|---|------|-------|--------|
| 1.1 | Homepage hero V2 (Three.js + Arora avatar + bento) | Arora | ✅ shipped | `04-homepage-hero/HomePage.tsx` + Kid prompt · 5k dots, cursor + click pulse, magnetic CTAs, animated counters, bento teaser, reduced-motion fallback |
| 1.2 | ROI Audit V2 (4-step wizard + animated report) | Arora | ✅ shipped | `05-roi-audit-v2/ROIAuditPage.tsx` + Kid prompt · 4-step wizard, live preview, animated bars, tier-routed CTA, calls captureLead with local fallback |
| 1.3 | Pricing page V2 (3 tiers, feature table, ROI embed) | Arora | ✅ shipped | `06-pricing-v2/PricingPage.tsx` + Kid prompt · 3 cards, ROI slider strip, 12-row compare table, 6-Q FAQ, Calendly only on Enterprise |
| 1.4 | Checkout flow test (Wix Payments, GBP) | Srijan | 🟦 | Run a test purchase end-to-end after Phase 1 deploys |
| 1.5 | Wix Velo backend: `calcROI`, `aroraChat`, `captureLead` | Arora | ✅ shipped | `07-backend-functions/` · 3 .web.js files + SETUP.md · requires Wix Secrets (`GROQ_API_KEY`, optional `ZAPIER_LEAD_WEBHOOK`) |

---

## Phase 2 · Catalogue & Discovery

| # | Task | Owner | Status |
|---|------|-------|--------|
| 2.1 | Digital Products page V2 (filter + sort + search) | Arora | ✅ shipped | Covered by Phase 0.4 — same `02-products-filter/DigitalProductsPage.tsx` already includes filter + sort + search + counts |
| 2.2 | Product detail pages `/products/:slug` | Arora | ✅ shipped | `08-product-detail/ProductDetailPage.tsx` + Kid prompt · zoomable hero, what's inside, ROI strip, related products, dynamic FAQ |
| 2.3 | Service detail pages V2 `/services/:slug` | Arora | ✅ shipped | `09-service-detail/ServiceDetailPage.tsx` + Kid prompt · 11 service slugs · CMS-first with built-in fallback map · plan match card · case study links |
| 2.4 | Integrations marquee | Arora | ✅ shipped | `10-integrations-marquee/IntegrationsMarquee.tsx` + Kid prompt · auto-scroll, pause-on-hover, CMS-pulled with 15-logo fallback, reusable |

---

## Phase 3 · Proof Layer

| # | Task | Owner | Status |
|---|------|-------|--------|
| 3.1 | Case Studies V2 (8 wired from CMS) | Arora | ✅ shipped | `11-case-studies-index/CaseStudiesPage.tsx` + Kid prompt · industry filter, masonry grid, featured top card, 4-case fallback |
| 3.2 | Case study detail pages | Arora | ✅ shipped | `12-case-study-detail/CaseStudyDetailPage.tsx` + Kid prompt · before/after metrics, stack-used chips, pull-quote, related cases, 4-slug fallback |
| 3.3 | Blog list V2 (filter + search + pagination) | Arora | ✅ shipped | `13-blog-list/BlogListPage.tsx` + Kid prompt · featured post hero, category chips, search, 9-per-page pagination, image-format-agnostic |
| 3.4 | Blog detail V2 (progress bar + ToC + related) | Arora | ✅ shipped | `14-blog-detail/BlogDetailPage.tsx` + Kid prompt · reading progress, sticky auto-built ToC, related posts, plain/HTML body parser |
| 3.5 | Testimonials section on homepage | Arora | ✅ shipped | `15-testimonials/TestimonialsSection.tsx` + Kid prompt · auto-scroll track, pause-on-hover, 6-quote fallback, embeddable anywhere |
| 3.6 | FAQ page (21 FAQs from CMS) | Arora | ✅ shipped | `16-faq-page/FAQPage.tsx` + Kid prompt · real-time search, category-grouped accordion, 12-Q fallback |

---

## Phase 4 · Intelligence Layer

| # | Task | Owner | Status |
|---|------|-------|--------|
| 4.1 | Arora chat widget (Groq via Velo proxy) | Arora | ✅ shipped | `17-arora-chat-widget/AroraChatWidget.tsx` + Kid prompt · floating orb, session persistence, 12-pattern fallback, lead modal after 4 msgs |
| 4.2 | Lead scoring engine | Arora | ✅ shipped | Already in `07-backend-functions/calcROI.web.js` + `captureLead.web.js` — 0–100 score, used everywhere |
| 4.3 | Exit-intent capture | Arora | ✅ shipped | `18-exit-intent/ExitIntentModal.tsx` + Kid prompt · once-per-session, route blacklist, touch-device guard, captures via captureLead with fallback |
| 4.4 | ROI report email delivery (Zapier) | Srijan | 🟦 | Activate Zap when ready · `ZAPIER_LEAD_WEBHOOK` secret already wired in `captureLead.web.js` |
| 4.5 | Refine 29 LinkedIn posts | Arora | ✅ shipped | `19-linkedin-posts/LinkedIn-29-Posts.md` · 29 posts in Arora voice + 6-week posting schedule, mixed themes |
| 4.6 | Refine 3 Gmail cold outreach drafts | Arora | ✅ shipped | `20-cold-outreach/Cold-Outreach-Drafts.md` · accountancy firms · web agencies · coaches · each with +3 and +10 follow-ups + reply triage table |

---

## Phase 5 · Automation & Polish

| # | Task | Owner | Status |
|---|------|-------|--------|
| 5.1 | Activate 5 Zapier flows | Srijan | 🟦 | All 5 sequence copy ready in `21-email-sequences/Email-Sequences.md` with merge-tag glossary |
| 5.2 | Email sequence: welcome / nurture | Arora | ✅ shipped | `21-email-sequences/Email-Sequences.md` · 13 emails across 6 sequences (ROI follow-up, newsletter welcome, product fulfilment, plan onboarding, cart abandon, 30-day re-engage) |
| 5.3 | Sitemap submission to GSC | Srijan | 🟦 | After domain connects |
| 5.4 | Lighthouse 95+ pass | Arora + Srijan | 🟦 | Test plan in `26-launch-checklist/LAUNCH-CHECKLIST.md` |
| 5.5 | Mobile QA pass (320 → 1920px) | Arora + Srijan | 🟦 | Test plan in launch checklist |
| 5.6 | Connect `aiprosol.com` domain | Srijan | 🟦 | Wix Dashboard → Settings → Domains |
| 5.7 | Set up `hello@aiprosol.com` email | Srijan | 🟦 | Google Workspace recommended; SPF/DKIM/DMARC all required |
| 5.8 | Affiliate page + 50 partner outreach | Arora | ✅ shipped | `23-affiliate/AffiliatePage.tsx` + Kid prompt + `Affiliate-Outreach.md` (4 templates × 50 partners + sending discipline) |
| 5.9 | About page (Arora origin + C-suite + Srijan mission) | Arora | ✅ shipped | `22-about-page/AboutPage.tsx` + Kid prompt · 11-role C-suite, 6 principles, founder block, reveal-on-scroll |
| 5.10 | 404 page (animated sphere + popular links) | Arora | ✅ shipped | `24-404-page/NotFoundPage.tsx` + Kid prompt · pure-CSS animated orb with 5 orbiting particles, 4-quip rotator, search + popular links |
| 5.11 | Legal pages (11 docs from CLO) | Arora | ✅ shipped | `25-legal-pages/LegalPages.tsx` + Kid prompt · 4 routes (terms, privacy, cookies, refund) from a single slug-routed component · placeholder copy to be replaced with CLO drafts |

---

## Decision defaults locked at Phase 0 kickoff

These were open questions in the plan; I picked sensible defaults so the build can start. Override any by saying so.

| # | Decision | Default | Reason |
|---|----------|---------|--------|
| D1 | Phase order | 0 → 5 as planned | Revenue impact ranked |
| D2 | Futuristic design system | Full (glassmorphism + 3D + cursor + magnetic + parallax) | Brief said "highest tier" |
| D3 | Wix Velo backend functions | Yes | Required for Groq proxy + lead scoring + ROI engine |
| D4 | Custom animated cursor | Yes, with auto-disable on touch + reduced-motion | Strong futuristic signal, low risk |
| D5 | Pricing monthly/annual toggle | Monthly only at launch; annual added in Phase 5 | Reduces Phase 1 surface |
| D6 | First Phase 0 task | Tokens + audit (parallel) | Audit unblocks all schema-dependent fixes |
| D7 | Refine LinkedIn / Gmail drafts | Phase 4 | First sale path matters more in Phases 1–3 |
| D8 | Figma-grade design spec | Skipping — live build only | "Highest tier" referred to the build, not extra docs |

---

## Logbook

| Date | Phase | Event |
|------|-------|-------|
| 2026-05-07 | 0 | Build engagement kicked off. Tokens + Audit shipped. Awaiting Srijan to run audit at `/_audit`. |
| 2026-05-07 | 0,1 | Srijan said "Start" — pushed forward in parallel. Shipped Phase 0.4 (filter fix), 0.5 (blog fix), and Phase 1.1 (Homepage Hero V2). Audit becomes verification rather than blocker. |
| 2026-05-07 | 1 | Phase 1 conversion spine: shipped ROI Audit V2 (1.2), Pricing V2 (1.3), and the three Velo backend functions (1.5). Only 1.4 (Srijan's checkout test) remains. |
| 2026-05-07 | 2 | Phase 2 Catalogue & Discovery: shipped 2.1 (covered by 0.4), 2.2 (Product Detail), 2.3 (Service Detail with 11-service fallback map), 2.4 (Integrations Marquee). Phase 2 complete. |
| 2026-05-07 | 3 | Phase 3 Proof Layer: shipped all six — 3.1 Case Studies index, 3.2 Case Study detail (with before/after deltas), 3.3 Blog list, 3.4 Blog detail (reading progress + sticky auto-ToC), 3.5 Testimonials, 3.6 FAQ page. Phase 3 complete. |
| 2026-05-07 | 4 | Phase 4 Intelligence Layer: shipped 4.1 Arora chat widget (with backend fallback), 4.3 Exit-intent modal, 4.5 29 LinkedIn posts + 6-week schedule, 4.6 3 cold-outreach Gmail drafts with follow-up sequences and reply triage. 4.2 already done in Phase 1.5; 4.4 awaiting Srijan to activate the Zap. |
| 2026-05-07 | 5 | Phase 5 Automation & Polish: shipped 5.2 (13 emails across 6 sequences), 5.8 (Affiliate page + 50-partner outreach), 5.9 (About page with 11-role C-suite), 5.10 (animated 404 page), 5.11 (legal pages — 4 routes from one component). Plus the master Launch Checklist. Build is structurally complete; remaining items (5.1, 5.3, 5.4, 5.5, 5.6, 5.7) are Srijan's deployment + activation tasks. |
| 2026-05-07 | PIVOT | Srijan decided to migrate off Wix Vibe to Next.js 15 on Vercel. New build root: `/Users/user/Airprosol/web/`. This folder becomes reference material. Most components port over with data layer swap (`@wix/data` → `@/lib/content`); 3 Velo backend files rewritten as Next.js API routes. Foundation shipped: package.json, next.config.ts, Tailwind v4 with locked tokens, root layout, homepage hero (Three.js + Arora avatar + magnetic CTAs + counters), bento grid, nav, footer, content seeds for 19 products + 11 services + 3 plans + 4 case studies, Wix export migration script, full README + MIGRATION.md. |
