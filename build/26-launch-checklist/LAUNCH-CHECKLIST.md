# LAUNCH CHECKLIST · AIPROSOL V2.0

The full pre-launch run that turns the build into a live product. Tick each item.

---

## 1 · INFRASTRUCTURE (Srijan)

- [ ] Connect `aiprosol.com` domain in Wix Dashboard → Settings → Domains
- [ ] Set up `hello@aiprosol.com` (Google Workspace or GoDaddy email)
- [ ] Set up `srijan@aiprosol.com` as the primary outbound sender
- [ ] Configure SPF + DKIM + DMARC records on aiprosol.com (mail provider docs)
- [ ] Add Google Analytics 4 tracking ID to Wix → Marketing → Tracking Tools
- [ ] Submit XML sitemap to Google Search Console
- [ ] Submit XML sitemap to Bing Webmaster Tools
- [ ] Verify Wix Payments is configured (GBP, the 3 plans, the 19 products)
- [ ] Run a test purchase on one product (£17 ROI Pitch Deck) — confirm the order, the receipt, and the download link land

## 2 · BACKEND DEPLOYMENT (Kid + Wix Vibe)

- [ ] Drop `backend/calcROI.web.js` into the project
- [ ] Drop `backend/aroraChat.web.js` into the project
- [ ] Drop `backend/captureLead.web.js` into the project
- [ ] Drop `backend/blogCoverImageFix.web.js` into the project
- [ ] Add `GROQ_API_KEY` to Wix Secrets Manager (required for chat widget Groq mode)
- [ ] Optional: add `GROQ_MODEL` secret if overriding the `llama3-8b-8192` default
- [ ] Optional: add `ZAPIER_LEAD_WEBHOOK` secret once the Zap is live

## 3 · FRONTEND DEPLOYMENT (Kid prompts in order)

Phase 0:
- [ ] Apply [tokens.css](../_design/tokens.css) to Wix Global CSS

Phase 1:
- [ ] Deploy [HomePage.tsx](../04-homepage-hero/HomePage.tsx) → `/`
- [ ] Deploy [DigitalProductsPage.tsx](../02-products-filter/DigitalProductsPage.tsx) → `/digital-products`
- [ ] Deploy [ROIAuditPage.tsx](../05-roi-audit-v2/ROIAuditPage.tsx) → `/roi-audit`
- [ ] Deploy [PricingPage.tsx](../06-pricing-v2/PricingPage.tsx) → `/pricing`

Phase 2:
- [ ] Deploy [ProductDetailPage.tsx](../08-product-detail/ProductDetailPage.tsx) → `/products/:slug`
- [ ] Deploy [ServiceDetailPage.tsx](../09-service-detail/ServiceDetailPage.tsx) → `/services/:slug`
- [ ] Embed [IntegrationsMarquee.tsx](../10-integrations-marquee/IntegrationsMarquee.tsx) into HomePage

Phase 3:
- [ ] Deploy [CaseStudiesPage.tsx](../11-case-studies-index/CaseStudiesPage.tsx) → `/case-studies`
- [ ] Deploy [CaseStudyDetailPage.tsx](../12-case-study-detail/CaseStudyDetailPage.tsx) → `/case-studies/:slug`
- [ ] Deploy [BlogListPage.tsx](../13-blog-list/BlogListPage.tsx) → `/blog`
- [ ] Deploy [BlogDetailPage.tsx](../14-blog-detail/BlogDetailPage.tsx) → `/blog/:slug`
- [ ] Embed [TestimonialsSection.tsx](../15-testimonials/TestimonialsSection.tsx) into HomePage
- [ ] Deploy [FAQPage.tsx](../16-faq-page/FAQPage.tsx) → `/faqs`

Phase 4:
- [ ] Mount [AroraChatWidget.tsx](../17-arora-chat-widget/AroraChatWidget.tsx) globally in app root
- [ ] Mount [ExitIntentModal.tsx](../18-exit-intent/ExitIntentModal.tsx) globally in app root

Phase 5:
- [ ] Deploy [AboutPage.tsx](../22-about-page/AboutPage.tsx) → `/about`
- [ ] Deploy [AffiliatePage.tsx](../23-affiliate/AffiliatePage.tsx) → `/affiliate`
- [ ] Deploy [NotFoundPage.tsx](../24-404-page/NotFoundPage.tsx) → 404 fallback
- [ ] Deploy [LegalPages.tsx](../25-legal-pages/LegalPages.tsx) → `/terms`, `/privacy`, `/cookies`, `/refund-policy`

## 4 · CMS DATA (Srijan + Kid)

- [ ] Run audit at `/_audit` and confirm collection counts match expectations
- [ ] Run blog `coverImage` bulk fix via `previewBlogCoverImageFix()` then `fixAllBlogCoverImages()`
- [ ] Confirm `digitalproducts` filter categories match the 11 from the Master Blueprint
- [ ] Add `casestudies` slugs (`hargreaves-sterling`, `meridian`, `vortex`, `thornfield`) if not present
- [ ] Add `aiservices` slugs to match the 11 keys in the ServiceDetailPage fallback map
- [ ] Add the 2 new fields to `leads` schema: `annualSavingProjection` (Number), `weeklyHoursReclaimable` (Number)
- [ ] Replace placeholder copy in `LegalPages.tsx` with the actual CLO drafts from Notion

## 5 · CONTENT (Srijan via copy-paste from build/)

- [ ] Schedule the 29 LinkedIn posts ([build/19-linkedin-posts/](../19-linkedin-posts/LinkedIn-29-Posts.md)) in Notion or Buffer
- [ ] Send the 3 cold-outreach drafts ([build/20-cold-outreach/](../20-cold-outreach/Cold-Outreach-Drafts.md)) to the first 30 prospects
- [ ] Configure email sequences in Zapier from [build/21-email-sequences/](../21-email-sequences/Email-Sequences.md)
- [ ] Send the 50 affiliate outreach emails from [build/23-affiliate/Affiliate-Outreach.md](../23-affiliate/Affiliate-Outreach.md)

## 6 · ZAPIER ACTIVATION (Srijan)

- [ ] Activate Zap 1: `leads` → ROI report follow-up sequence (3 emails)
- [ ] Activate Zap 2: `newsletter` → welcome sequence (3 emails)
- [ ] Activate Zap 3: `orders` → fulfilment + 7-day check-in
- [ ] Activate Zap 4: `subscriptions` → onboarding sequence (3 emails)
- [ ] Activate Zap 5: cart abandonment (2 emails) — requires Wix Payments webhook
- [ ] Test each Zap with a real submission

## 7 · QA — DESKTOP (run after deployment)

Lighthouse targets: Performance ≥ 90 · Accessibility ≥ 95 · SEO ≥ 95 · Best Practices ≥ 95.

Run Lighthouse on:
- [ ] `/` (homepage with Three.js — most demanding)
- [ ] `/digital-products` (CMS-heavy)
- [ ] `/blog/:slug` (longest article)
- [ ] `/roi-audit` (form interactions)

For each: fix any flagged issue scoring below 85.

## 8 · QA — MOBILE (320 → 1920 px)

Test on a real iPhone / Android, not just DevTools:

- [ ] Hero sphere is visible but doesn't tank FPS (< 30 fps acceptable on entry-level phones)
- [ ] Filter chips wrap on Digital Products
- [ ] ROI Audit wizard slides between steps without overflow
- [ ] Pricing cards stack
- [ ] Case Study detail metrics stack
- [ ] Blog ToC sidebar hides on mobile
- [ ] Chat widget panel collapses to viewport width minus margin
- [ ] Exit-intent modal centred and dismissable

## 9 · ACCESSIBILITY

- [ ] Tab through every page with keyboard — every interactive reachable
- [ ] Focus rings visible (cyan outline) on every interactive
- [ ] Screen reader (VoiceOver/NVDA) reads page hierarchy correctly
- [ ] Every image has alt text
- [ ] Every form field has a `<label>`
- [ ] Colour contrast: cyan on navy passes WCAG AA for body text; muted text passes for non-essential
- [ ] `prefers-reduced-motion` test: enable in OS settings → confirm sphere/marquee/scroll animations disable

## 10 · SECURITY & PRIVACY

- [ ] HTTPS enforced (Wix default — verify)
- [ ] No hard-coded API keys in any frontend file
- [ ] Cookie consent banner present on first visit (Wix native)
- [ ] Privacy policy + cookie policy linked in footer
- [ ] Form validation prevents XSS (no `dangerouslySetInnerHTML` on user input)
- [ ] Rate limiting on `/_functions/aroraChat` (Velo throttle)

## 11 · ANALYTICS WIRE-UP

Track at minimum:
- [ ] Page view (every page)
- [ ] ROI Audit submitted (form completed event)
- [ ] Product purchase (with `productName` + `price`)
- [ ] Plan signup (with `planName`)
- [ ] Affiliate application
- [ ] Newsletter signup
- [ ] Chat widget opened
- [ ] Exit intent fired

## 12 · LAUNCH DAY

- [ ] Final pass through every page on desktop + mobile
- [ ] One full ROI Audit submission with a real email — confirm the email lands
- [ ] One real product purchase — confirm receipt + download work
- [ ] Post LinkedIn launch announcement (Post #29 from the bank)
- [ ] Send launch email to existing newsletter (if any)
- [ ] Send 5 highest-priority cold outreach emails

## 13 · POST-LAUNCH (week 1)

- [ ] Daily check on `leads` CMS for new submissions
- [ ] Daily reply to any chat widget conversation that requested follow-up
- [ ] Lighthouse re-run + fix any drift
- [ ] Conversion-rate baseline: ROI submissions / unique visitors
- [ ] Funnel analysis: what % go from homepage → ROI Audit → product/plan
- [ ] Iterate on biggest drop-off

---

# Done = first sale

That's the bar. Everything in this checklist is in service of one outcome: **first paying customer**.

Once that's in, we open Phase 6 — scaling what's working.
