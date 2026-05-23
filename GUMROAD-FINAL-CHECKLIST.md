# Gumroad upload — 5-minute checklist (manual, browser-only)

Three steps per SKU. Gumroad has no file-upload API, so each must be done in the browser. You're logged in already.

---

## Step 1 — Attach delivery files (9 SKUs need this)

For each of the 9 disabled SKUs, open the Content tab and drag the file(s) from `/Users/user/Airprosol/products catalogue/01-ready-to-sell/.../delivery/` into the upload zone.

| Gumroad URL | Local delivery folder |
|---|---|
| https://srijan07.gumroad.com/products/starter-bundle/edit | `01-ready-to-sell/bundles/070-the-starter-bundle/delivery/` |
| https://srijan07.gumroad.com/products/enterprise-readiness/edit | `01-ready-to-sell/templates/044-enterprise-ai-readiness-assessment-kit/delivery/` |
| https://srijan07.gumroad.com/products/zapier-make-power/edit | `01-ready-to-sell/templates/098-zapier-make-power-user-bundle/delivery/` |
| https://srijan07.gumroad.com/products/stack-starter-kit/edit | `01-ready-to-sell/toolkits/099-ai-tools-stack-starter-kit/delivery/` |
| https://srijan07.gumroad.com/products/tools-vault/edit | `01-ready-to-sell/bundles/068-the-ai-tools-vault/delivery/` |
| https://srijan07.gumroad.com/products/lead-gen-playbook/edit | `01-ready-to-sell/playbooks/096-lead-generation-automation-playbook/delivery/` |
| https://srijan07.gumroad.com/products/workflow-playbook/edit | `01-ready-to-sell/playbooks/097-workflow-automation-playbook/delivery/` |
| https://srijan07.gumroad.com/products/starter-pack/edit | `01-ready-to-sell/toolkits/043-global-business-automation-starter-pack/delivery/` |
| https://srijan07.gumroad.com/products/30-day-challenge/edit | `01-ready-to-sell/challenges/047-30-day-business-automation-challenge/delivery/` |

---

## Step 2 — Set cover image (19 SKUs)

For each product, open the Edit tab → drag the matching cover from `/Users/user/Airprosol/products catalogue/_covers/<slug>-cover-1280x720.png` into the cover slot.

All covers are named `<slug>-cover-1280x720.png` so they match the Gumroad product URL slug.

---

## Step 3 — Re-enable disabled SKUs

After files are attached, run from the project root:

```bash
bash /Users/user/Airprosol/scripts/gumroad-publish-all.sh
```

The script reads each product's `file_info` and only re-publishes SKUs that have at least one file attached. Safe to run multiple times — idempotent.

---

## After all three: smoke test

1. Open one Gumroad product page in an incognito browser
2. Verify the cover renders, price is correct, "Buy this" works
3. Click Buy, enter test card `4242 4242 4242 4242`, any future expiry, any CVC
4. Confirm the download email arrives at the test address
5. Open the downloaded files and confirm they aren't empty

---

## What I (Arora) did on my side

- ✅ `/api/checkout` auth gate removed — anonymous Stripe checkout is now possible (whenever Stripe keys are added to Vercel)
- ✅ `products.json` filled with `longDescription` + `features` + `whatsInside` for all 19 products (the 4 pre-order bundles now have rich "What's coming" content)
- ✅ 19 cover images + 19 thumbnails generated and deployed to `/products/<slug>.png`
- ✅ Product detail page renders the Overview section + "Everything in the X" bullets
- ✅ Build passed, deployed to prod
- ⚠️ Stripe keys not pushed — `.env.local` has them as empty placeholders. Drop your `sk_live_*` + `pk_live_*` + `whsec_*` from Stripe dashboard into `.env.local`, then run:
  ```bash
  cd /Users/user/Airprosol/web
  ./node_modules/.bin/vercel env add STRIPE_SECRET_KEY production
  ./node_modules/.bin/vercel env add STRIPE_PUBLISHABLE_KEY production
  ./node_modules/.bin/vercel env add STRIPE_WEBHOOK_SECRET production
  ./node_modules/.bin/vercel --prod
  ```
  (Until then, /checkout falls back gracefully to /contact — products on Gumroad keep working.)
