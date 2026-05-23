# KID PROMPT — Phase 2.3 · Service Detail Page

**Creates** `/services/:slug` for all 11 AI services. Each route renders a hero with service-specific icon, benefits grid, numbered process, plan match card, related case studies, and a service-tailored FAQ.

## Why a built-in fallback map

The 11 services are listed in the `aiservices` CMS, but full long-form copy may not be in there yet. The component carries a fallback `SERVICE_MAP` keyed by slug — so every URL renders polished content immediately, even before the CMS is fully populated. When CMS data arrives, it wins.

## Slugs supported

```
/services/intelligent-workflow-automation
/services/custom-ai-chatbot-development
/services/ai-powered-lead-generation
/services/business-process-audit-roadmap
/services/seamless-system-integration
/services/ai-sales-automation
/services/ai-driven-customer-intelligence
/services/zapier-make-automation-setup
/services/intelligent-document-processing
/services/ai-content-marketing-automation
/services/ai-training-enablement
```

The fallback map mirrors these. Make sure your CMS `aiservices` records use the same slug values so CMS content overrides cleanly.

## Acceptance

- [ ] All 11 slugs render with hero + benefits + process + plan card + cases + FAQ
- [ ] Plan match card shows the correct tier (Starter/Growth/Enterprise) per service
- [ ] Case studies linked to the right industry per service
- [ ] FAQ adapts to plan tier (Enterprise mentions 3–4 wk rollout; Starter/Growth says 14 days)
- [ ] Mobile (320px): everything stacks; hero icon stays centred

## Paste this into Kid

> **Goal:** Add a dynamic service detail route at `/services/:slug` with the matching component.
>
> **Steps:**
> 1. Create `src/pages/ServiceDetailPage.tsx` and paste the entire body below.
> 2. Register `/services/:slug` mapped to this component.
> 3. From the existing services list page, ensure each service card links to `/services/<slug>`.
> 4. Do not modify any other file.
>
> **Critical:**
> - Slug parsing uses `window.location.pathname.split('/').pop()` — works with any router.
> - Do not remove the built-in `SERVICE_MAP` or `CASE_STUDIES` fallback objects — they're the safety net for missing CMS content.
> - Inline `<Styles />` at the bottom — do not extract.
>
> ```tsx
> // ─── PASTE THE ENTIRE CONTENTS OF ServiceDetailPage.tsx HERE ───
> // (copy from /Users/user/Airprosol/build/09-service-detail/ServiceDetailPage.tsx)
> ```

## After Kid finishes

- Visit each of the 11 slugs and confirm content renders
- Click "See full plan details" on the plan card → goes to `/pricing`
- Click "See ROI for your business" → goes to `/roi-audit`
- Click a case study card → goes to `/case-studies/<slug>` (those pages ship in Phase 3.2)
