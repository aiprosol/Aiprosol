# Aiprosol · V3.0

The new home for Aiprosol — migrated off Wix Vibe to **Next.js 15 + React 19 + Tailwind v4 on Vercel**, with **Stripe** for payments, **Resend** for email, and **Groq** for the Arora chat widget.

> **Locked palette · never change:** `#0A1628` bg · `#0D1F3C` card · `#1E3A5F` border · `#00D4FF` cyan · `#00FFE5` cyan-2 · `#8899AA` muted · `#D4E8F7` text. Syne (display) · DM Sans (body).

> **Self-serve first.** Primary CTA everywhere = ROI Audit. Calendly only on Enterprise tier. GBP only. Global, no UK references.

---

## Quick start

```bash
cd web
npm install
cp .env.example .env.local
# Fill in GROQ_API_KEY, STRIPE_*, RESEND_API_KEY in .env.local
npm run dev
# → http://localhost:3000
```

## Project structure

```
web/
├── package.json              # Next 15 · React 19 · Tailwind v4 · Stripe · Three · Framer
├── next.config.ts            # Image domains, security headers
├── tsconfig.json             # Path aliases (@/*)
├── postcss.config.mjs        # Tailwind v4 plugin
├── .env.example              # All env vars documented
│
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── layout.tsx        # Root layout · fonts · metadata · widgets
│   │   ├── page.tsx          # / Homepage
│   │   ├── globals.css       # @theme tokens · base styles · utility classes
│   │   ├── digital-products/page.tsx
│   │   ├── products/[slug]/page.tsx
│   │   ├── services/page.tsx
│   │   ├── services/[slug]/page.tsx
│   │   ├── pricing/page.tsx
│   │   ├── roi-audit/page.tsx
│   │   ├── case-studies/page.tsx
│   │   ├── case-studies/[slug]/page.tsx
│   │   ├── blog/page.tsx
│   │   ├── blog/[slug]/page.tsx
│   │   ├── faqs/page.tsx
│   │   ├── about/page.tsx
│   │   ├── affiliate/page.tsx
│   │   ├── (legal)/          # route group: terms, privacy, cookies, refund
│   │   ├── api/
│   │   │   ├── calc-roi/route.ts        # Replaces Velo calcROI.web.js
│   │   │   ├── arora-chat/route.ts      # Replaces Velo aroraChat.web.js
│   │   │   ├── capture-lead/route.ts    # Replaces Velo captureLead.web.js
│   │   │   └── stripe/webhook/route.ts  # Stripe webhooks for orders/subscriptions
│   │   └── not-found.tsx     # Animated 404
│   │
│   ├── components/
│   │   ├── Nav.tsx · Footer.tsx
│   │   ├── Hero.tsx          # Three.js sphere + Arora avatar + magnetic CTAs
│   │   ├── AroraChatWidget.tsx
│   │   ├── ExitIntentModal.tsx
│   │   ├── IntegrationsMarquee.tsx
│   │   ├── TestimonialsSection.tsx
│   │   └── ...               # all ported from /Users/user/Airprosol/build/*
│   │
│   ├── content/              # Static content as JSON / MDX (replaces Wix CMS)
│   │   ├── products.json     # 19
│   │   ├── services.json     # 11
│   │   ├── pricing-plans.json
│   │   ├── case-studies.json # 8 (4 fallback today)
│   │   ├── faqs.json         # 21
│   │   ├── testimonials.json
│   │   ├── integrations.json
│   │   └── blog/             # 19 MDX articles
│   │
│   ├── lib/
│   │   ├── tokens.ts         # Design tokens as TS constants
│   │   ├── content.ts        # Loaders for products, services, etc.
│   │   ├── calc-roi.ts       # Pure ROI math (used by API + frontend)
│   │   ├── arora-prompt.ts   # System prompt for Groq
│   │   ├── stripe.ts         # Stripe client wrapper
│   │   ├── analytics.ts      # GA helpers
│   │   └── site-config.ts    # Nav links, social, brand metadata
│   │
│   └── types/                # Shared TS types
│
└── migrate/
    ├── README.md             # Migration plan from Wix CMS
    ├── export-wix.ts         # Pull all 14 collections from Wix Data API
    └── exports/              # JSON dumps land here (gitignored)
```

## Routes (parity with Wix V2.0 build)

| Route | Status | Source |
|---|---|---|
| `/` | ✅ shipped | this turn |
| `/digital-products` | ⏳ next | port `build/02-products-filter/` |
| `/products/[slug]` | ⏳ next | port `build/08-product-detail/` |
| `/services` | ⏳ next | new (was minimal on Wix) |
| `/services/[slug]` | ⏳ next | port `build/09-service-detail/` |
| `/pricing` | ⏳ next | port `build/06-pricing-v2/` |
| `/roi-audit` | ⏳ next | port `build/05-roi-audit-v2/` |
| `/case-studies` | ⏳ next | port `build/11-case-studies-index/` |
| `/case-studies/[slug]` | ⏳ next | port `build/12-case-study-detail/` |
| `/blog` | ⏳ next | port `build/13-blog-list/` |
| `/blog/[slug]` | ⏳ next | port `build/14-blog-detail/` |
| `/faqs` | ⏳ next | port `build/16-faq-page/` |
| `/about` | ⏳ next | port `build/22-about-page/` |
| `/affiliate` | ⏳ next | port `build/23-affiliate/` |
| `/terms` `/privacy` `/cookies` `/refund-policy` | ⏳ next | port `build/25-legal-pages/` |
| `/not-found` | ⏳ next | port `build/24-404-page/` |

API routes:
| Route | Replaces |
|---|---|
| `/api/calc-roi` | `backend/calcROI.web.js` |
| `/api/arora-chat` | `backend/aroraChat.web.js` |
| `/api/capture-lead` | `backend/captureLead.web.js` |
| `/api/stripe/webhook` | new — Stripe events for orders/subscriptions |

## Migration from Wix

See [MIGRATION.md](./MIGRATION.md). TL;DR: run `npm run migrate:wix`, drop the resulting JSON files into `src/content/`, and the existing 14 components in `/Users/user/Airprosol/build/` port across with their data layer swapped from `@wix/data` to `@/lib/content`.

## Deployment

```bash
# Production
vercel --prod

# Preview (any branch)
vercel
```

Environment variables go in **Vercel Dashboard → Settings → Environment Variables**. Match the keys in `.env.example`.

DNS: point `aiprosol.com` apex + `www` at Vercel via the Domains panel.

## Locked principles

1. **Self-serve first** — ROI Audit is the primary CTA everywhere
2. **Numbers, not hype** — every claim ships with a measurable number
3. **Global · borderless** — no UK refs, GBP only
4. **Operators serving operators** — every automation we ship is something we run inside Aiprosol itself
5. **AI-led, human-overseen** — Arora makes most operational calls; Srijan reviews the strategic ones
6. **Money-back if we miss** — 90-day reclaim guarantee on managed plans
