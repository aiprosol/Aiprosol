# KID PROMPT — Phase 3.1 · Case Studies Index

**Creates** `/case-studies` — pulls all 8 from the `casestudies` CMS, masonry-style grid (featured top card spans full width), industry filter chips with counts, falls back to 4 hero cases if CMS is empty.

## Acceptance

- [ ] `/case-studies` renders all 8 cases as cards
- [ ] First card on "All" view spans both columns and shows summary text
- [ ] Industry filter chips show counts and filter the grid in place
- [ ] Each card links to `/case-studies/<slug>`
- [ ] Mobile (320px): cards stack, filter chips wrap, featured collapses to single column

## Paste this into Kid

> **Goal:** Add `/case-studies` index page.
>
> **Steps:**
> 1. Create `src/pages/CaseStudiesPage.tsx` and paste the body below.
> 2. Register the route `/case-studies` mapped to this component.
> 3. Do not modify any other file.
>
> **Critical:** Keep the `FALLBACK` array — it's the safety net for empty CMS.
>
> ```tsx
> // ─── PASTE ProductDetailPage.tsx (file body) HERE ───
> // (copy from /Users/user/Airprosol/build/11-case-studies-index/CaseStudiesPage.tsx)
> ```
