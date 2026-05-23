# MIGRATION · Wix Vibe → Next.js 15 on Vercel

## What carries over (≈80% of the build)

### 1 · Design tokens · 100% portable
- `build/_design/tokens.css` → ported into `web/src/app/globals.css` as Tailwind v4 `@theme` tokens
- Same locked palette · same fonts · same motion scale
- Now consumable as Tailwind utilities (`bg-bg`, `text-cyan`, `font-display`)

### 2 · React components · ~95% portable
All 14 components in `build/` are React/TypeScript already. The migration per component is:

| Change | Before (Wix) | After (Next.js) |
|---|---|---|
| Data import | `import { items } from '@wix/data'` | `import { getProducts } from '@/lib/content'` |
| Data hook | `useWixModules(items)` + `query(...)` | `await getProducts()` (Server Component) or `useEffect + fetch` (Client) |
| Image hosts | Inline URLs from Wix | `next/image` with `remotePatterns` allowlist |
| Backend calls | `import { fn } from 'backend/foo.web'` | `await fetch('/api/foo', ...)` |
| Inline `<style>{}` | Works in client components | Same — keep as-is for now, optionally convert to Tailwind later |

Estimated time per component: 15-30 minutes of mechanical edits.

### 3 · Content (Wix CMS → JSON / MDX) · all data carries over
| Wix Collection | New location | Format |
|---|---|---|
| `digitalproducts` | `web/src/content/products.json` | JSON array |
| `aiservices` | `web/src/content/services.json` | JSON array |
| `pricingplans` | `web/src/content/pricing-plans.json` | JSON array |
| `casestudies` | `web/src/content/case-studies.json` | JSON array |
| `blog` | `web/src/content/blog/*.mdx` | One MDX file per post |
| `faqs` | `web/src/content/faqs.json` | JSON array |
| `testimonials` | `web/src/content/testimonials.json` | JSON array |
| `integrations` | `web/src/content/integrations.json` | JSON array |
| `teammembers` | `web/src/content/team.json` | JSON array |
| `leads` | Vercel KV / Postgres | Real DB (no longer static) |
| `bookings` | Calendly API direct | No local store needed |
| `newsletter` | Vercel KV + Resend audiences | Real DB + email service |
| `affiliatepartners` | Vercel KV / Postgres | Real DB |
| `chatbotconversations` | Vercel KV with TTL | Real KV with auto-expire |

### 4 · Content artefacts · 100% portable
- 13 emails (`build/21-email-sequences/Email-Sequences.md`) → wired into Resend templates
- 29 LinkedIn posts (`build/19-linkedin-posts/`) → published by you
- 3 cold-outreach drafts (`build/20-cold-outreach/`) → sent by you
- 50-partner outreach (`build/23-affiliate/Affiliate-Outreach.md`) → sent by you
- Legal copy (`build/25-legal-pages/`) → ported into `app/(legal)/*/page.tsx`

## What needs rewriting (≈20%)

### 1 · Backend (3 Velo files → Vercel Route Handlers)
| Was | Now |
|---|---|
| `backend/calcROI.web.js` | `app/api/calc-roi/route.ts` (POST → returns ROI shape) |
| `backend/aroraChat.web.js` | `app/api/arora-chat/route.ts` (POST → Groq proxy) |
| `backend/captureLead.web.js` | `app/api/capture-lead/route.ts` (POST → KV write + Zapier fire) |

The pure JS logic (math, prompts, scoring) is identical — just the request handler shape changes.

### 2 · Wix-specific patterns
- `wix-secrets-backend` → `process.env.GROQ_API_KEY` (set in Vercel Dashboard)
- `wix-fetch` → native `fetch` (Node 20+)
- `wix-data` → JSON imports (build-time) or KV (runtime mutations)
- `suppressAuth: true` → not needed (everything is public by default)

### 3 · Things removed (no longer relevant)
- `build/01-cms-audit/AuditPage.tsx` — was diagnostic for Wix CMS; no longer needed
- `build/03-blog-coverimage/` — Wix-specific PUT-vs-PATCH issue doesn't exist anywhere else

## How to run the migration

### Step 1 · Pull data from Wix
```bash
cd web
# Set WIX_API_KEY in .env.local first
npm run migrate:wix
# → produces migrate/exports/*.json (one per collection)
```

### Step 2 · Transform to content files
```bash
# Helper script reads exports and writes src/content/*.json
node migrate/transform.ts
```

### Step 3 · Sanity-check
```bash
npm run dev
# Browse to localhost:3000 — confirm content shows up
npm run build
# Confirm production build succeeds
```

### Step 4 · Set up services
- **Stripe**: create products/prices for the 19 digital products + 3 plans
- **Resend**: set up domain + 6 email templates from `build/21-email-sequences/`
- **Groq**: ensure API key works (test the chat widget)
- **Vercel KV**: provision (Vercel Dashboard) for `leads`, `chatbotconversations`, etc.

### Step 5 · Domain cutover
1. Deploy to Vercel preview, smoke-test
2. Update Stripe / Calendly webhooks to point at new domain
3. In DNS, change A/CNAME records from Wix to Vercel
4. Verify SSL provisions
5. Set up redirects from Wix subdomain to apex (if you used it for soft-launch)

## Risk map

| Risk | Mitigation |
|---|---|
| Data loss during export | Wix Data API is read-only by default · script writes to local `migrate/exports/` first · we never delete from Wix |
| Catalogue drift between platforms | Run the export weekly during the transition · single source of truth is the new system once cutover |
| Stripe products mismatch | Build a one-shot script (`migrate/seed-stripe.ts`) that creates Stripe products from the catalogue JSON · idempotent |
| SEO drop on cutover | Match every old URL to a new one · 301 redirects in `next.config.ts` if any URL changes · submit new sitemap to GSC immediately |
| Email deliverability | Use Resend with verified domain · SPF/DKIM/DMARC set correctly · warm up sending volume |
| Three.js bundle weight | Already dynamic-imported in the Hero component · further code-split if needed via `next/dynamic` |

## Rollback plan

If anything goes critically wrong post-cutover:
1. Revert DNS to Wix (one record change · ~5 min propagation)
2. The Wix V2.0 build artefacts in `build/` are still valid — Kid prompts ship them onto the existing Wix site
3. Fix the issue on Vercel preview, re-cut over

The Wix site stays in cold standby for at least 90 days post-launch.
