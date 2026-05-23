# KID PROMPT — Phase 3.2 · Case Study Detail

**Creates** `/case-studies/:slug` with hero · 3-metric grid (with before/after deltas) · the challenge · the architecture (with stack-used chips) · the result · pull-quote · related cases.

CMS-first; falls back to four built-in cases (`hargreaves-sterling`, `meridian`, `vortex`, `thornfield`).

## Acceptance

- [ ] All 4 fallback slugs render rich content immediately
- [ ] Each metric shows the before/after delta below the headline number
- [ ] Stack-used chips render as horizontal pill list
- [ ] Pull quote is centred with attribution
- [ ] Related cases (2 per page) navigate cleanly to other case pages

## Paste this into Kid

> **Goal:** Add `/case-studies/:slug` route + component.
>
> **Steps:**
> 1. Create `src/pages/CaseStudyDetailPage.tsx`, paste the body below.
> 2. Register `/case-studies/:slug` route mapped to this component.
> 3. Do not modify any other file.
>
> **Critical:** Keep the `FALLBACK` and `RELATED` maps. They guarantee polished content even with empty CMS.
>
> ```tsx
> // ─── PASTE CaseStudyDetailPage.tsx (file body) HERE ───
> // (copy from /Users/user/Airprosol/build/12-case-study-detail/CaseStudyDetailPage.tsx)
> ```
