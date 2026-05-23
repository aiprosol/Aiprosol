# KID PROMPT — Phase 5.8 · Affiliate Page

**Creates** `/affiliate` with hero · 3-tier commission grid · 6 perks · 5 ideal-partner cards · application form (writes to `affiliatepartners` CMS).

## Paste this into Kid

> **Goal:** Add `/affiliate` page.
>
> **Steps:**
> 1. Create `src/pages/AffiliatePage.tsx`, paste body below.
> 2. Register `/affiliate` route mapped to component.
> 3. Add `/affiliate` link to the footer (in the "Company" or "Partners" column).
>
> ```tsx
> // ─── PASTE AffiliatePage.tsx HERE ───
> // (copy from /Users/user/Airprosol/build/23-affiliate/AffiliatePage.tsx)
> ```

## After Kid finishes

- Visit `/affiliate`, fill out the form, submit
- Confirm a row lands in `affiliatepartners` CMS with `applicationStatus: "Pending Review"`
- Test on mobile (320px) — fields stack, submit button full-width
- The 50-partner outreach campaign in [build/23-affiliate/Affiliate-Outreach.md](Affiliate-Outreach.md) is what drives traffic to this page
