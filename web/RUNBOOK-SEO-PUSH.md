# RUNBOOK · 30-Day SEO push

Goal: replace Google's stale "AI Pro Solutions" snippet with the real Aiprosol metadata, and start ranking for branded + intent queries.

Estimated total work: **90 minutes spread over 3 days, then ~15 min/week.**

---

## Why this matters right now

Google's index currently shows the previous owner's content for `aiprosol.com`. This happens with every re-registered domain. Without active prompting, refresh takes 4–8 weeks. With the steps below, expect refresh within **3–7 days**.

---

## Day 1 — Google Search Console (15 min)

### Step 1 · Verify the domain (5 min)

1. Go to **[search.google.com/search-console](https://search.google.com/search-console)**
2. Sign in with **`srijanpaudelofficial@gmail.com`** (or whichever Google account you'll keep)
3. Click **Add property** → pick **"Domain"** (not "URL prefix") → enter `aiprosol.com` → **Continue**
4. Google shows a TXT record like:
   ```
   google-site-verification=XXXXXXXXXXXXXXXXXXXXXXXX
   ```
5. Open Vercel: **vercel.com/dashboard → Domains → aiprosol.com → DNS Records → Add Record**
   - **Type:** TXT
   - **Name:** `@`
   - **Value:** paste the entire `google-site-verification=XXX...` string
   - **TTL:** 60
   - Save.
6. Back in GSC, wait 1–10 min for DNS propagation. Click **Verify**.
7. Success message → you're now the verified owner.

### Step 2 · Submit the sitemap (1 min)

In GSC, left sidebar → **Sitemaps** → enter `https://aiprosol.com/sitemap.xml` → **Submit**.

Status should flip to **Success** within a couple of hours (59 URLs detected).

### Step 3 · Force-reindex the top pages (5 min)

GSC has a "URL Inspection" tool at the top. For each of these URLs:

1. Paste URL
2. Click "Test live URL" → wait ~10s
3. Click **Request indexing**
4. Confirm

Do this for:
- `https://aiprosol.com`
- `https://aiprosol.com/pricing`
- `https://aiprosol.com/services`
- `https://aiprosol.com/about`
- `https://aiprosol.com/roi-audit`
- `https://aiprosol.com/digital-products`

GSC limits ~10 reindex requests per day. Spread the rest over Days 2–3 if you want.

### Step 4 · Bing (bonus, 5 min)

Same flow at **[bing.com/webmasters](https://www.bing.com/webmasters)**. Bing now powers ChatGPT search. Worth it.

You can import from Google Search Console directly — one click.

---

## Day 2 — Social profile + bio updates (30 min)

Each of these is a high-authority backlink and a place visitors will look you up. The more places `aiprosol.com` appears, the faster Google trusts it.

### LinkedIn personal profile (5 min)
- **Headline:** "Founder · Aiprosol — Automate the boring. Scale the important."
- **About section:** add `aiprosol.com` link
- **Experience:** add "Founder & Chairman · Aiprosol · 2026 – present", with company logo + website link
- **Featured section:** pin the homepage + the ROI Audit

### LinkedIn company page (10 min)
- Go to **linkedin.com/company/setup/new**
- Name: `Aiprosol`
- Public URL: `linkedin.com/company/aiprosol`
- Website: `https://aiprosol.com`
- Industry: `Information Technology and Services`
- Company size: 11–50
- Type: Privately Held
- Tagline: `Automate the boring. Scale the important.`
- Upload: logo (use `/Users/user/Airprosol/Aiprosol.png`)
- Cover image: use the same OG image (export from `https://aiprosol.com/opengraph-image`)

Once live, the URL `linkedin.com/company/aiprosol` should match the `sameAs` in your Organization JSON-LD.

### X / Twitter bio (3 min)
- If `@aiprosol` is available: claim it
- Bio: `Global AI automation consultancy · 35+ hrs/wk reclaimed · ROI Audit at aiprosol.com`
- Pinned post: a thread teasing the first cold-outreach campaign

### GitHub profile (2 min)
- **github.com/settings/profile** → set Website to `https://aiprosol.com`
- Create org: `github.com/organizations/new` → name `aiprosol`
- Add `aiprosol.com` to the org page

### Bluesky (3 min)
- Sign up at **bsky.app**
- Set custom domain handle: `srijan.aiprosol.com` or just keep `aiprosol.bsky.social`
- Bio: same as X
- Pin: same content

### Product Hunt placeholder (2 min)
- Don't submit yet. Just create the profile at **producthunt.com**
- Add `aiprosol.com` to your maker profile
- Save the Aiprosol page draft for when you launch

### Indie Hackers (3 min)
- Sign up, add `aiprosol.com` to your profile
- Write a short intro post in the Founders section

### "About me" footer + email signature (2 min)
- Personal email signature: add `aiprosol.com`
- Every reply to a cold-outreach response = another implicit link

---

## Day 3 — Content seeding (45 min)

### Send the first 25 cold outreach emails (30 min)
The drafts are in `build/20-cold-outreach/Cold-Outreach-Drafts.md`. Each email mentions `aiprosol.com` — that's 25 fresh "this domain is mentioned in the wild" signals to Google.

### Post first 3 LinkedIn pieces (15 min)
From `build/19-linkedin-posts/LinkedIn-29-Posts.md`. Each post links back to a relevant Aiprosol page. Engagement signals authority to LinkedIn's algorithm, which feeds back into Google's view of the domain.

Pin the strongest post to your profile.

---

## Week 2-4 — Maintenance (15 min/week)

### Each Monday
- Post 2 LinkedIn pieces from the queue
- Send 25 more cold outreach (the +3 day follow-ups + new batch)

### Each Wednesday
- Check GSC → Performance → see which queries are starting to bring impressions
- Check GSC → Coverage → fix any "Page not indexed" issues

### Each Friday
- Re-share whatever LinkedIn post performed best as an X thread
- Submit any new product / case study URL to GSC for reindexing

---

## How you'll know it's working

### Week 1 milestones
- [ ] GSC shows 50+ URLs indexed (out of 59 in sitemap)
- [ ] Searching `site:aiprosol.com` in Google returns more than 5 results
- [ ] LinkedIn company page is live and showing your logo
- [ ] X / Bluesky bios linked
- [ ] At least 1 cold-outreach reply

### Week 2 milestones
- [ ] Google's `aiprosol.com` snippet now reads "Aiprosol · Automate the boring..."  (NOT "AI Pro Solutions")
- [ ] GSC Performance tab shows queries appearing — even small ones
- [ ] Your LinkedIn posts are getting >100 impressions each

### Week 4 milestones
- [ ] Branded search "aiprosol" returns your site at position 1
- [ ] At least 1 long-tail query (e.g. "free ROI audit automation") bringing impressions
- [ ] FAQ rich snippet starts appearing for `/faqs` (the FAQPage schema is already deployed)
- [ ] First paying customer (this is the real metric)

---

## What I (Arora / code) have already done for you

You don't need to think about any of this — it shipped in the last few sessions:

- ✅ `aiprosol.com/sitemap.xml` exposes all 59 URLs
- ✅ `aiprosol.com/robots.txt` allows good crawlers, blocks AI training crawlers
- ✅ Every page has unique canonical, title, description, og:image
- ✅ FAQPage / Product / BlogPosting JSON-LD on the right routes
- ✅ Organization JSON-LD names "Aiprosol" with `alternateName: ['Aiprosol Ltd', 'Aiprosol AI', 'Aiprosol Automation']` so Google can distinguish from "AI Pro Solutions"
- ✅ `sameAs` array in the Organization schema points at where the LinkedIn / X / GitHub profiles will live
- ✅ Per-page OG images (`/pricing`, `/services`, `/about`, `/faqs`, `/digital-products` all generate their own social preview now)
- ✅ `aiprosol.com/.well-known/security.txt` and `aiprosol.com/humans.txt` — small signals that this is a real operated company
- ✅ Site loads in <30 KB gzipped HTML, CSP-protected, HTTPS-enforced, lazy-loaded images with explicit dimensions

The technical groundwork is done. What follows is the people-side: showing up, sending the emails, posting the posts. **That's the part I can't do for you.**

---

## Don't bother with these (yet)

People will tell you to do these. They're not worth your time at zero revenue:

| Trap | Why to skip |
|---|---|
| **Paid SEO tools (Ahrefs, SEMrush)** | You have nothing to track yet — wait until 1k visits/month |
| **Backlink-building services** | Toxic links hurt; organic outreach beats fiver gigs |
| **Schema markup for every imaginable type** | The 4 you have (Organization, Product, BlogPosting, FAQPage) cover 95% of value |
| **Writing 50 blog posts** | Quality > quantity at this stage — 3 great posts beat 50 mediocre ones |
| **Google Ads** | Until your funnel converts, you'll just burn cash on traffic that bounces |
| **Hiring an "SEO consultant"** | Most of what they'd recommend is already done. Money is better spent on outreach copy or ads later. |

---

## TL;DR

1. **Today**: Verify GSC + submit sitemap (10 min)
2. **Tomorrow**: Update LinkedIn personal + create company page (15 min)
3. **Day after**: Send first 25 cold emails + post 3 LinkedIn pieces (45 min)

Total time: **~70 minutes over 3 days**. After that, ~15 min/week to maintain.

In 30 days, your Google search results page should show YOUR content — not "AI Pro Solutions".
