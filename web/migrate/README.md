# Wix → Next.js Migration

This folder contains scripts that pull existing Wix CMS data into the new Next.js build.

## What you get

```bash
npm run migrate:wix
# → migrate/exports/digitalproducts.json
# → migrate/exports/aiservices.json
# → migrate/exports/blog.json
# → migrate/exports/casestudies.json
# → migrate/exports/faqs.json
# → migrate/exports/_summary.json (counts + status)
# (and 8 more collections)
```

## Prerequisites

1. **Wix API key** — generate at https://manage.wix.com/account/api-keys
2. **Site ID** — `fb912f58-d70f-4919-bb13-a4b5761de943` (from the Master Blueprint)
3. **Account ID** — visible in your Wix Dashboard URL or Account settings

Add these to `.env.local`:

```
WIX_API_KEY=...
WIX_SITE_ID=fb912f58-d70f-4919-bb13-a4b5761de943
WIX_ACCOUNT_ID=...
```

## Run the export

```bash
cd web
npm run migrate:wix
```

If it errors, the most common causes:

| Error | Cause | Fix |
|---|---|---|
| `401 Unauthorized` | API key missing or wrong | Regenerate key, copy exactly |
| `403 Forbidden` | Key doesn't have data permission | In Wix Dashboard → API Key → enable "Wix Data" scope |
| `404` on a collection | Collection ID typo | Check the COLLECTIONS array in `export-wix.ts` |

## Transform the exports

The raw exports are unstructured JSON — they need to be reshaped into the format the new components expect.

For collections that already match (digitalproducts, aiservices, casestudies):

```bash
# Simple: copy and rename
cp migrate/exports/digitalproducts.json src/content/products.json
cp migrate/exports/aiservices.json src/content/services.json
cp migrate/exports/casestudies.json src/content/case-studies.json
```

You may need to:
- Rename `_id` → `slug` if your Wix items don't have explicit slugs
- Map `productImage` / `productCategory` field names if the schema differs
- Convert blog posts from a single field to MDX files (one per post)

## Blog → MDX

Blog posts are best as MDX files (one per post) rather than a single JSON. The transform:

```bash
node migrate/blog-to-mdx.ts  # write this if needed
```

Each post becomes `src/content/blog/{slug}.mdx`:

```mdx
---
title: "Post title"
slug: "post-slug"
publishedDate: "2026-01-15"
category: "Automation"
author: "Arora"
readTime: 8
coverImage: "https://static.wixstatic.com/..."
---

# Post title

Body content here...
```

## What stays on Wix

These collections become **runtime data** (Vercel KV / Postgres), not static files:

- `leads` — written by every form submission
- `bookings` — Calendly webhook events
- `newsletter` — written by signups, synced to Resend
- `affiliatepartners` — written by /affiliate page applications
- `chatbotconversations` — written by every chat session

After migration, you can stop writing to the Wix versions of these collections. The historical data stays in Wix as cold archive.

## Cutover

Once `src/content/*` is populated:

1. `npm run dev` → confirm pages render with real data
2. `npm run build` → confirm production build succeeds
3. Deploy to Vercel preview
4. QA the preview against the Wix site
5. Update DNS (one A record change)
6. Wix site stays in standby for 90 days as rollback insurance
