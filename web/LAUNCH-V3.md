# V3 LAUNCH CHECKLIST · Aiprosol on Next.js + Vercel

The full pre-launch run for the Next.js V3 site. Tick each item.

---

## 1 · Local sanity (you, today)

- [ ] `cd web && npm install` — no errors
- [ ] `npm run dev` — homepage loads at http://localhost:3000
- [ ] Walk every route: `/`, `/digital-products`, `/products/the-complete-vault`, `/services`, `/services/intelligent-document-processing`, `/pricing`, `/roi-audit`, `/case-studies`, `/case-studies/hargreaves-sterling`, `/blog`, `/blog/5-workflows-services-business-should-automate-first`, `/faqs`, `/about`, `/affiliate`, `/terms`, `/privacy`, `/cookies`, `/refund-policy`, `/anything-random` (404)
- [ ] Submit one ROI Audit with a real email — confirm the `[capture-lead]` log fires
- [ ] Open the chat widget — confirm a canned reply comes back
- [ ] Wait 8s, swipe mouse to top → exit-intent fires once

## 2 · Environment variables (Vercel Dashboard → Project → Settings → Environment Variables)

| Key | Required | Source |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Yes | `https://aiprosol.com` (or your preview URL) |
| `GROQ_API_KEY` | For chat | https://console.groq.com |
| `STRIPE_SECRET_KEY` | For checkout | https://dashboard.stripe.com/apikeys |
| `STRIPE_PUBLISHABLE_KEY` | For checkout | Same place |
| `STRIPE_WEBHOOK_SECRET` | For webhooks | After creating the webhook endpoint (step 5) |
| `RESEND_API_KEY` | For email | https://resend.com/api-keys |
| `RESEND_FROM_EMAIL` | For email | `Arora at Aiprosol <hello@aiprosol.com>` (verify the domain in Resend first) |
| `KV_REST_API_URL` | Optional · enables lead/session storage | Vercel KV → Connect Project |
| `KV_REST_API_TOKEN` | Optional · enables lead/session storage | Same |
| `ZAPIER_LEAD_WEBHOOK` | Optional · fires the email sequence | Your Zap webhook URL |

Set each in **Production** (and **Preview** for staging).

## 3 · Stripe seed (one-time)

```bash
# Set STRIPE_SECRET_KEY in your shell (or .env.local) first
npm run seed:stripe
```

This creates:
- 19 Products + 19 one-time Prices (£17–£997)
- 3 Products + 3 monthly recurring Prices (£997 / £2,997 / £7,997 GBP)

Output: `src/content/stripe-prices.json` with the slug → priceId mapping.

Commit that file (it's safe — no secrets).

## 4 · Stripe webhook

In the Stripe Dashboard → Developers → Webhooks → **Add endpoint**:

- Endpoint URL: `https://aiprosol.com/api/stripe/webhook`
- Events to send:
  - `checkout.session.completed`
  - `invoice.paid`
  - `customer.subscription.deleted`
  - `payment_intent.payment_failed`

Copy the **Signing secret** (starts with `whsec_`) and set it as `STRIPE_WEBHOOK_SECRET` in Vercel.

Test by clicking **Send test webhook** in the Stripe Dashboard. You should see the event in your Vercel function logs.

## 5 · Resend domain verification

In Resend → Domains → **Add domain** → `aiprosol.com`:

- Add the DKIM, SPF, and DMARC DNS records as instructed.
- Wait for verification (usually 5-30 minutes).
- Send a test email via the Resend dashboard or:

```bash
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":"Arora at Aiprosol <hello@aiprosol.com>","to":["you@yourdomain.com"],"subject":"Test","html":"It works."}'
```

## 6 · Wix data migration (optional · pulls existing CMS into the new site)

```bash
# Set WIX_API_KEY in .env.local
npm run migrate:wix
# → migrate/exports/*.json
```

Then transform per `migrate/README.md`:
- `digitalproducts.json` → `src/content/products.json` (likely manual reconcile against existing seed)
- `aiservices.json` → `src/content/services.json`
- `casestudies.json` → `src/content/case-studies.json`
- `blog.json` → `src/content/blog.json`
- `faqs.json` → `src/content/faqs.json`

## 7 · Deploy to Vercel

```bash
# First time
vercel link

# Production deploy
vercel --prod
```

Or push to your `main` branch if you've connected the GitHub repo.

## 8 · Domain cutover

In Vercel → Project → Domains → **Add `aiprosol.com`** + **`www.aiprosol.com`**.

In your DNS provider:
- Apex (`aiprosol.com`) → Vercel A record (76.76.21.21) or ALIAS to `cname.vercel-dns.com`
- `www.aiprosol.com` → CNAME to `cname.vercel-dns.com`

Vercel auto-provisions SSL within 5–60 minutes.

## 9 · SEO

- [ ] Submit sitemap (`https://aiprosol.com/sitemap.xml` — Next.js auto-generates) to Google Search Console
- [ ] Submit to Bing Webmaster Tools
- [ ] Verify Google Analytics 4 is tracking — check Realtime reports
- [ ] Add `aiprosol.com` to LinkedIn company page

## 10 · Smoke test on production

- [ ] Submit ROI Audit with your real email · confirm email arrives within 60s
- [ ] Try a checkout for the £17 ROI Pitch Deck · confirm payment, email, and the success page renders
- [ ] Click each footer link · confirm they all 200
- [ ] Lighthouse score (mobile + desktop) — target Performance 90+, Accessibility 95+, SEO 95+
- [ ] Test on iPhone (375px) and Android (360px) — every page should render cleanly

## 11 · Wix decommission (after 30 days of stable production)

Don't kill the Wix site immediately. Keep it as cold standby for 30+ days post-launch in case of any unforeseen issues.

After 30 days:
- [ ] Export final Wix CMS data (one last run of `migrate:wix`)
- [ ] Cancel the Wix subscription
- [ ] Archive `/Users/user/Airprosol/build/` (rename to `build-archive-wix-v2/` so it's clear it's reference-only)

---

# Done = first paying customer on the new stack

That's the bar. Everything in this checklist is in service of one outcome: **first paying customer through the V3 site**.

Once that's in, we open Phase 7 — scaling what's working.
