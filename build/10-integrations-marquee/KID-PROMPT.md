# KID PROMPT — Phase 2.4 · Integrations Marquee

**Reusable component** that auto-scrolls a horizontal logo strip with pause-on-hover. Drop it under the homepage hero, on the services page, or anywhere else trust-signal real estate matters.

## What ships

- Pulls integrations from the `integrations` CMS collection on mount
- Falls back to a built-in list of 15 (Zapier, Make, n8n, HubSpot, Pipedrive, ActiveCampaign, Salesforce, Calendly, Slack, Notion, Airtable, Stripe, Xero, Google Workspace, Microsoft 365) if CMS is empty
- Linear infinite scroll · 40s default loop · pause-on-hover
- Edge fade-out so logos don't pop in/out abruptly
- Respects `prefers-reduced-motion` (animation off)
- Accessible (`aria-label`, lazy image loading, semantic markup)
- Inline styles · zero dependencies

## Configuration

```tsx
<IntegrationsMarquee />
<IntegrationsMarquee title="Plays nicely with your stack" />
<IntegrationsMarquee speed={60} /> {/* slower */}
<IntegrationsMarquee bare />        {/* skip the title block */}
```

## Paste this into Kid

> **Goal:** Add a reusable IntegrationsMarquee component and embed it on the homepage and services list page.
>
> **Steps:**
> 1. Create `src/components/IntegrationsMarquee.tsx` and paste the body below.
> 2. Import and embed in HomePage.tsx — between the bento grid and the testimonials section, like:
>    ```tsx
>    import { IntegrationsMarquee } from '../components/IntegrationsMarquee';
>    // ...
>    <BentoTeaser />
>    <IntegrationsMarquee />
>    {/* next section */}
>    ```
> 3. Optionally embed under the services hero too: `<IntegrationsMarquee bare title="Connects to your existing stack" />`
> 4. Do not modify any other file beyond imports.
>
> **Critical:**
> - The `integrations` CMS schema may use `logo`, `logoUrl`, `name`, `title`, `url`, `category` fields — the component handles all variants.
> - Keep the fallback list intact — never let the marquee render empty.
>
> ```tsx
> // ─── PASTE THE ENTIRE CONTENTS OF IntegrationsMarquee.tsx HERE ───
> // (copy from /Users/user/Airprosol/build/10-integrations-marquee/IntegrationsMarquee.tsx)
> ```

## After Kid finishes

- Hover the marquee — animation pauses
- Move mouse away — animation resumes
- On a phone, swipe-friendly (animation continues)
- DevTools mobile + reduced-motion preference — strip is static, still readable
