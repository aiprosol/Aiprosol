# Aiprosol

> Global AI automation consultancy operated by an AI C-suite. The first proof-of-concept of an AI-led operating model. Founded April 2026 by Srijan Paudel.

**Private monorepo.** Contains the live website, content library, founder-brand assets, and operational scripts. Not for public distribution.

- **Live site:** [aiprosol.com](https://aiprosol.com)
- **Newsletter:** [The Chairman's Log](https://srijanpaudel.substack.com)
- **Founder page:** [aiprosol.com/founder](https://aiprosol.com/founder)
- **Live AI C-suite dashboard:** [aiprosol.com/agents](https://aiprosol.com/agents)

---

## Repo layout

```
/Aiprosol
├── web/                      ← Next.js 15 production app (deployed to Vercel)
│   ├── src/app/              ← App Router pages, layouts, API routes
│   ├── src/components/       ← React components (Nav, Footer, ParticleLogo, ...)
│   ├── src/content/          ← JSON content (products, services, case studies, FAQs)
│   ├── src/lib/              ← Site config, auth, agents, OG templates
│   └── public/               ← Static assets (logo, llms.txt, indexnow key file)
│
├── build/                    ← Content library + strategy docs (paste-ready)
│   ├── SUBSTACK-ESSAY-*.md   ← 4 weekly essays for The Chairman's Log
│   ├── REEL-*.md             ← 5 Higgsfield-ready reel briefs
│   ├── CAROUSEL-*.md         ← 2 Canva-ready carousel design specs
│   ├── SINGLE-POST-*.md      ← 1 Instagram single-post spec
│   ├── FOUNDER-BRAND-CHAIRMAN.md  ← Cross-internet founder brand playbook
│   ├── CONTENT-PACK-IG-TIKTOK.md  ← Tier 1 + Tier 2 content strategy
│   ├── MASTER-TRACKER.md     ← Operational status tracker
│   ├── founder-assets/       ← 13 paste-ready files (LinkedIn / X / GitHub / Gmail)
│   └── reels/01/             ← Reel #1 production pack (overlays, captions, .srt)
│
├── audits/                   ← Historical brand + frontend audits
├── scripts/                  ← Operational scripts (Wix migration, Stripe seeding)
├── fonts/                    ← Brand-licensed font files (Space Grotesk, Inter)
├── product-covers-v2/        ← Product cover image source files
└── products catalogue/       ← Source assets for the 19 self-serve products
```

---

## Quick start

### Web app

```bash
cd web
npm install
npm run dev          # → http://localhost:3000
npm run build        # production build
npm run lint
npm run typecheck
```

### Deploy

This repo is connected to Vercel (project ID `prj_XsU0CJ60AE28b09QPD5YMgrkV2w6`).
- Push to `main` → auto-deploys to production at aiprosol.com
- PRs → preview deploys at `aiprosol-{hash}.vercel.app`
- Manual deploy: `cd web && npx vercel deploy --prod`

### IndexNow ping (post major content updates)

```bash
curl 'https://aiprosol.com/api/indexnow?secret=$CRON_SECRET'
```

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 |
| Styling | Tailwind v4 |
| Hosting | Vercel |
| Auth | HMAC-signed JWT cookies (Web Crypto, edge-safe) · Magic link + Google OAuth |
| DB | Supabase (Postgres) |
| LLM | Groq (Llama 3.3 70B) for Arora chat · Claude for other agents |
| Email | Resend (DKIM verified) |
| Payments | Stripe |
| Analytics | PostHog (EU host, GDPR-gated) |
| Workflow automation | n8n + Make.com (internal ops) |

---

## Environments

Secrets live in `web/.env.local` (NEVER committed — `.gitignore` enforces). The template is at `web/.env.example`. Required env vars are documented there.

Production secrets are managed in Vercel → Project Settings → Environment Variables.

---

## Brand locks (don't drift)

These are non-negotiable per the brand playbook at `build/FOUNDER-BRAND-CHAIRMAN.md`:

- Currency: **USD** only (no GBP/EUR/NPR in marketing voice)
- AI persona externally: **Arora** (never "Claude" or "Mama")
- Founder email: `srijanpaudelofficial@gmail.com` (NOT `patricorpglobal@gmail.com`)
- Geographic framing: **global / borderless** (no UK-only refs in marketing copy)
- Brand colour: violet `#8B5CF6` primary · `#C084FC` accent · `#0A0613` background

---

## Schema graph (live)

- Organization · `aiprosol.com/#organization` · linked to Wikidata Q139821891
- Person (Srijan) · `aiprosol.com/#srijan-paudel` · linked to Wikidata Q139821959
- SoftwareApplication (Arora) · `aiprosol.com/#arora-ai-ceo`
- `disambiguatingDescription` against the unrelated Australian firm `aiprosol.au`
- Per-page Schema in route layouts: FAQPage · BlogPosting · Product · Service · HowTo · Compare-as-FAQ
- `llms.txt` at `aiprosol.com/llms.txt` for AI-engine consumption

Validate at https://search.google.com/test/rich-results

---

## License

Proprietary. All rights reserved. Aiprosol Ltd, 2026.
