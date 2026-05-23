# RUNBOOK · First Paying Customer

The strict-order, time-boxed run from "site is built" to "first £ in the bank". Each step has a hard "do not skip" reason. Stop after Step 8 if you only have an evening — that's enough to take a card.

`LAUNCH-V3.md` is the full checklist. **This file is the order to do them in.**

---

## Prereqs (assume done; if not, do these first)

- [ ] Stripe account verified for GBP payouts
- [ ] Resend account created
- [ ] Groq API key in hand
- [ ] Vercel account linked to the GitHub repo (or `vercel link` run locally)
- [ ] Domain `aiprosol.com` purchased and DNS access confirmed

---

## Tonight (≈90 min)

### Step 1 · Local sanity (10 min)

```bash
cd /Users/user/Airprosol/web
npm install
npm run typecheck   # must exit 0
npm run dev         # http://localhost:3000
```

Walk these routes and confirm they render: `/`, `/pricing`, `/roi-audit`, `/digital-products`, `/services`, `/blog`, `/faqs`, `/about`, `/terms`, `/privacy`, `/cookies`, `/refund-policy`, `/anything-random` (404).

**Don't skip:** if anything errors locally, it errors on Vercel — just slower and harder to debug there.

---

### Step 2 · Vercel env vars (10 min)

Vercel Dashboard → your project → Settings → Environment Variables. Set these in **Production**:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://aiprosol.com` |
| `GROQ_API_KEY` | from console.groq.com |
| `STRIPE_SECRET_KEY` | live key from dashboard.stripe.com/apikeys |
| `STRIPE_PUBLISHABLE_KEY` | same place |
| `RESEND_API_KEY` | from resend.com/api-keys |
| `RESEND_FROM_EMAIL` | `Arora at Aiprosol <hello@aiprosol.com>` |

Skip `STRIPE_WEBHOOK_SECRET`, KV vars, and `ZAPIER_LEAD_WEBHOOK` for now — they get filled in later steps or are post-launch.

**Don't skip:** missing `STRIPE_SECRET_KEY` = no checkout. Missing `RESEND_API_KEY` = no order confirmation emails = chargebacks.

---

### Step 3 · Stripe seed (5 min)

```bash
# In your shell, with the same STRIPE_SECRET_KEY
export STRIPE_SECRET_KEY=sk_live_...
npm run seed:stripe
```

This creates 19 product+price pairs (£17–£997 one-time) and 3 plan+price pairs (£997/£2,997/£7,997 monthly) in your live Stripe account. Output: `src/content/stripe-prices.json`.

```bash
git add src/content/stripe-prices.json
git commit -m "seed: stripe price IDs"
git push
```

**Don't skip:** the checkout API reads `stripe-prices.json` to map slug→priceId. Without this, every "Buy" button 500s.

---

### Step 4 · Domain on Vercel (15 min, mostly DNS propagation)

Vercel → Project → Domains → Add `aiprosol.com` and `www.aiprosol.com`.

In your DNS provider:
- `aiprosol.com` (apex) → A record `76.76.21.21`  *(or ALIAS to `cname.vercel-dns.com`)*
- `www.aiprosol.com` → CNAME `cname.vercel-dns.com`

Vercel auto-issues SSL within ~5–60 min. Refresh the Domains tab; both should show green.

**Don't skip:** Stripe webhooks, Resend DKIM, Calendly OG cards all hard-need a real domain.

---

### Step 5 · Resend domain verification (10 min, then 30 min wait)

Resend Dashboard → Domains → Add Domain → `aiprosol.com`.

Add the 3 DNS records Resend gives you (SPF TXT, DKIM CNAME × 2, DMARC TXT). Save in DNS, then click "Verify". Status flips to "Verified" within 5–30 min.

Send a test:

```bash
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":"Arora at Aiprosol <hello@aiprosol.com>","to":["srijanpaudel219@gmail.com"],"subject":"Resend live","html":"It works."}'
```

If it lands in inbox (not spam), DKIM is right.

**Don't skip:** unverified domain = order confirmation emails go to spam = "did my payment go through?" support tickets.

---

### Step 6 · Production deploy (5 min)

If GitHub is wired up, just push to `main`:

```bash
git push origin main
```

Otherwise:

```bash
vercel --prod
```

Watch the build in the Vercel UI. ~2 min. When it's done, hit `https://aiprosol.com` — homepage should load.

---

### Step 7 · Stripe webhook (10 min)

Stripe Dashboard → Developers → Webhooks → Add endpoint.

- URL: `https://aiprosol.com/api/stripe/webhook`
- Events:
  - `checkout.session.completed`
  - `invoice.paid`
  - `customer.subscription.deleted`
  - `payment_intent.payment_failed`

Copy the **Signing secret** (starts `whsec_`) → Vercel → add `STRIPE_WEBHOOK_SECRET` in Production env. Trigger a redeploy (Vercel → Deployments → "..." → Redeploy) so the new env is picked up.

Click "Send test webhook" in Stripe → check Vercel function logs → you should see the `[stripe-webhook]` line.

**Don't skip:** without the webhook, paid orders never get a "thanks, here's your download" email and never write to the order log. Customer pays, gets nothing, refunds.

---

### Step 8 · The £17 dry run (10 min)

Buy `/products/the-complete-vault` (or any £17 item) with your own card.

Check:
- [ ] Stripe Checkout opens, charges the card
- [ ] You land on `/checkout/success`
- [ ] Confirmation email arrives in your inbox within 60s
- [ ] If it's a digital product, the download link works

If all four pass, **the site can take money**. That's the bar for tonight.

---

## This week — turn on the traffic

### Step 9 · Activate the 5 Zaps

Email sequences are written and inert. Copy and merge tags live in `build/21-email-sequences/Email-Sequences.md`. Set `ZAPIER_LEAD_WEBHOOK` in Vercel to your Zap's catch-hook URL, then activate these flows:

1. ROI Audit follow-up (3 emails over 7 days)
2. Newsletter welcome (1 email)
3. Product fulfilment (1 email + download link)
4. Plan onboarding (5 emails over 14 days)
5. Cart abandon (2 emails over 48h)

### Step 10 · First traffic source

Send the cold outreach drafts (`build/20-cold-outreach/Cold-Outreach-Drafts.md`):
- 25 accountancy firms (Tier-1 ICP)
- 25 boutique web agencies (Tier-2 ICP)
- 25 business coaches (Tier-3 ICP)

Use Gmail's "Snooze + send later" so all 75 land Tue-Thu morning UK time. The +3 and +10 follow-ups are pre-written.

In parallel, post the first 5 LinkedIn pieces from `build/19-linkedin-posts/LinkedIn-29-Posts.md` on Mon/Wed/Fri schedule. Pin the highest-signal one to your profile.

### Step 11 · Submit sitemap + analytics

- [ ] Google Search Console → add `aiprosol.com`, submit `/sitemap.xml`
- [ ] Bing Webmaster Tools → same
- [ ] Vercel Analytics ON in dashboard (or PostHog if you've got the key)
- [ ] Update LinkedIn company page → website = `https://aiprosol.com`

---

## Definition of done

| Milestone | Bar |
|---|---|
| **Tonight** | Steps 1–8 green. Site can take a card and email a receipt. |
| **This week** | Steps 9–11 green. Outreach sent, posts up, sitemap indexed. |
| **First sale** | One stranger pays for one digital product. Phase 7 begins. |

---

## What I (Arora) cannot do for you

I can write code, copy, and runbooks. I cannot:
- Touch Vercel / Stripe / Resend / DNS dashboards (no credentials)
- Send Gmail (chat-first rule + no OAuth)
- Activate Zapier flows
- Make the actual £ purchase

Everything in this runbook with a checkbox is yours. Everything in `web/src/` is mine.

If any step here errors in a way the runbook doesn't cover, paste the error in chat — I'll diagnose and ship the fix.
