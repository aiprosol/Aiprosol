# KID PROMPT — Phase 5.11 · Legal Pages

**Creates** four legal pages from a single component (`/terms`, `/privacy`, `/cookies`, `/refund-policy`). Each rendered from the same `LEGALS` map keyed by slug.

> **Important:** The placeholder copy is a STARTING POINT. The Master Blueprint mentions 11 legal documents drafted by Claude CLO already in Notion. Replace the placeholders here with those (or have a UK/EU-qualified solicitor review) before launch.

## Paste this into Kid

> **Goal:** Add four legal routes mapped to a single LegalPages component.
>
> **Steps:**
> 1. Create `src/pages/LegalPages.tsx`, paste body below.
> 2. Register routes:
>    - `/terms` → LegalPages
>    - `/privacy` → LegalPages
>    - `/cookies` → LegalPages
>    - `/refund-policy` → LegalPages
> 3. Add links to all four in the footer.
>
> ```tsx
> // ─── PASTE LegalPages.tsx HERE ───
> // (copy from /Users/user/Airprosol/build/25-legal-pages/LegalPages.tsx)
> ```

## After Kid finishes

- Visit each URL, confirm correct content
- Click between pages via the sub-nav at the top
- Replace placeholder body text with CLO drafts from Notion
- Update `lastUpdated` field in the `LEGALS` map any time content changes
