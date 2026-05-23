# KID PROMPT — Phase 3.4 · Blog Detail V2

**Creates** `/blog/:slug` with reading-progress bar (sticky top, cyan gradient), sticky table of contents (auto-built from h2/h3 in article), cover hero, plain-prose or HTML body rendering, related posts at the end, ROI Audit CTA.

Article body parser handles both pre-rendered HTML and plain markdown-lite text — auto-detects.

## Acceptance

- [ ] Reading progress bar fills as you scroll the article body
- [ ] TOC auto-builds from h2/h3 — clicking a TOC link scrolls smoothly
- [ ] Active TOC item highlights as you scroll
- [ ] Cover image renders whether stored as string or stringValue-wrapped object
- [ ] Related posts: same category if available, else any 3
- [ ] Mobile (<1024px): TOC sidebar hidden, article full-width

## Paste this into Kid

> **Goal:** Add `/blog/:slug` route + component.
>
> **Steps:**
> 1. Create `src/pages/BlogDetailPage.tsx`, paste the body below.
> 2. Register `/blog/:slug` mapped to this component.
> 3. Do not modify any other file.
>
> ```tsx
> // ─── PASTE BlogDetailPage.tsx (file body) HERE ───
> // (copy from /Users/user/Airprosol/build/14-blog-detail/BlogDetailPage.tsx)
> ```
