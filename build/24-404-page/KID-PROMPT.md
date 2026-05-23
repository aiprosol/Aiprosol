# KID PROMPT — Phase 5.10 · 404 Page

**Creates** the 404 fallback at any unmatched route. Animated CSS sphere (no Three.js — fast load), random witty quip, blog/product search, top 5 popular destinations, back-to-home link.

## Paste this into Kid

> **Goal:** Add a 404 page mapped to all unmatched routes.
>
> **Steps:**
> 1. Create `src/pages/NotFoundPage.tsx`, paste body below.
> 2. Configure your router so any unmatched route renders this component (typically the catch-all `*` route).
> 3. Do not modify any other file.
>
> ```tsx
> // ─── PASTE NotFoundPage.tsx HERE ───
> // (copy from /Users/user/Airprosol/build/24-404-page/NotFoundPage.tsx)
> ```

## After Kid finishes

- Visit `/random-nonsense-url` — should show the 404 with the animated orb
- Reload — quip text should rotate randomly
- Click any popular destination — confirm it navigates
- Search bar → submitting any term goes to `/blog?q=...`
