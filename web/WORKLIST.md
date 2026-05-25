# Aiprosol — Worklist

**Last updated:** 2026-05-21
**Owner:** Srijan Paudel
**How to use:** Top → bottom. Higher items unlock more downstream value. Tick the boxes as you go. Re-read this doc at the end of each week and update.

---

## 🔴 BLOCK 1 — Do today (highest leverage × shortest time)

Each item under 15 minutes. Unlocks queued work worth hours.

- [ ] **`npx vercel login`** (~30 sec)
  - **Path:** `cd /Users/user/Airprosol/web && npx vercel login` → pick patricorpglobal account
  - **Unlocks:** Round 2 deploy (Speakable, Dataset, Org-FAQ, mentions, Place-name fixes, datePublished fixes, accessibility Field labels, flagship h1 demotion). ~620 schema warnings disappear.

- [ ] **`npx vercel deploy --prod --yes`** (after login, ~3 min)
  - **Verify after:** `curl -sL https://aiprosol.com/ | grep -c SpeakableSpecification` should return ≥1.

- [ ] **Register Aiprosol Ltd at Companies House** (£12, 10 min)
  - **Path:** [find-and-update.company-information.service.gov.uk/start-a-new-company](https://find-and-update.company-information.service.gov.uk/start-a-new-company)
  - **Why now:** Closes the "Aiprosol Ltd" accuracy gap across press kit, Wikidata, Wikipedia draft, llms.txt, /about, /press.
  - **After registration:** Send the company number — I'll add P5297 (Companies House ID) to Wikidata Q139821891.

- [ ] **Bing Webmaster verification** (~5 min)
  - **Path:** [bing.com/webmasters](https://www.bing.com/webmasters) → add aiprosol.com → choose HTML meta tag → copy `content="..."`
  - **Send me:** the token string. I add the env var + redeploy.
  - **Why:** Unlocks ChatGPT browse + Bing AI Overviews discovery. ~5 min of your time, days of indexer warm-up.

---

## 🟠 BLOCK 2 — Do this week

Higher effort but still high impact. Pair with Block 1 to compound.

- [ ] **Send a headshot file** (10 min — pick one)
  - **Requirements:** JPG or PNG, ≥500×500, you're identifiable, CC-BY-SA licensable (you took it or have rights)
  - **What I do:** Upload to Wikimedia Commons + claim P18 on Wikidata Q139821959. Fills the Google Knowledge Panel photo slot when it generates.

- [ ] **Approve or skip n8n open-source repo** (5 min decision)
  - **Path:** Reply "go" or "skip" — content is staged at `/tmp/aiprosol-n8n-workflows/` (10 workflow JSONs + README + MIT license)
  - **Why:** Creates `github.com/aiprosol/n8n-workflows` — discoverable via GitHub topic search; each star/fork is an organic backlink.

- [ ] **Pick first press pitch** (15 min review + send)
  - **Options in `OUTREACH-DRAFTS.md`:** Sifted (UK angle), The Information (technical), Forbes 30U30 (nomination), Show HN (community), Reddit (community)
  - **Recommended order:** Sifted first (easiest pitch, no customer evidence required), Show HN second (~Day 30 per `30-60-90-DAY-PLAN.md`).

- [ ] **Send Month 1 monthly update** (30 min)
  - **Template:** `MONTHLY-UPDATE-TEMPLATE.md` (first-month variant near the bottom)
  - **Audience:** the 5-15 advisor-equivalents you already have
  - **Why:** Starts the monthly-update habit. Cadence > content quality.

---

## 🟡 BLOCK 3 — Do this month

Operational + content rhythm. Less urgent, still important.

- [ ] **Activate cold outreach sequence** (`COLD-OUTREACH-SEQUENCE.md`)
  - **First batch:** 25 researched prospects via the pre-send checklist
  - **Cadence:** 5 touches over 14 days per prospect, all Srijan-sent for first 50

- [ ] **Submit Show HN** (per `30-60-90-DAY-PLAN.md` ~Day 30)
  - **Window:** Tuesday-Thursday 9am-noon Pacific
  - **Draft ready in:** `OUTREACH-DRAFTS.md` § 4
  - **Block 2 hours** to respond to comments live

- [ ] **Pitch Tier 1 podcasts** (~5 hours of pitching effort)
  - **List + per-show angle:** `PODCAST-PITCH-LIST.md`
  - **Target:** 2-3 confirmed bookings within 60 days
  - **Tier 1:** Indie Hackers, Latent Space, Cognitive Revolution, Knowledge Project, Practical AI

- [ ] **Publish first Substack post** (30 min — paste + publish)
  - **Draft ready in:** `SUBSTACK-DRAFT-001-chairmans-log.md`
  - **When:** Day after Show HN run so HN traffic finds substantive personal essay

- [ ] **LinkedIn launch post** (30 min draft + post)
  - Use brand voice from `BRAND-VOICE-STYLE-GUIDE.md`
  - Lead with the specific (number / failure / conclusion). Three paragraphs max.
  - Link to /agents and /blog/we-built-a-consultancy-run-by-ai-agents

---

## 🟢 BLOCK 4 — Recurring / monthly rhythm

Set a calendar reminder for each. Consistency is the asset.

- [ ] **End of every month:** Send monthly update (template ready)
- [ ] **End of every month:** Run `node scripts/validate-schema.mjs` + `node scripts/audit-internal-links.mjs` + `node scripts/audit-a11y.mjs` — three monitoring scripts
- [ ] **Every Friday:** Quick check of /agents and /transparency dashboards (anything that an outside visitor would find embarrassing?)
- [ ] **Quarterly:** Re-read `WIKIPEDIA-DRAFT.md` notability scorecard — when source count ≥3 with substantive coverage, submit the draft

---

## 🔵 BLOCK 5 — Triggered (only when X happens)

Don't proactively do these. Wait for the trigger.

- [ ] **Customer #1 signs** → activate `CUSTOMER-ONBOARDING-EMAILS.md` (Day 0 email within 15 min of payment)
- [ ] **Forbes 30 Under 30 cycle opens** (July-September) → submit nomination from `OUTREACH-DRAFTS.md` § 3
- [ ] **First MSA signed by a customer** → trademark filings (UK first, EU + US to follow)
- [ ] **5+ paying customers in flight** → consider 11th seat hire (likely CFO/COO)
- [ ] **3+ secondary press sources accumulated** → submit Wikipedia draft via AfC
- [ ] **First named customer agreement** → write the first non-anonymous case study
- [ ] **Aiprosol.au legal contact (if any)** → pause public outreach, get UK counsel involved

---

## 🟣 BLOCK 6 — Future / Year 1+ horizons

Long-term, lower urgency.

- [ ] **April 14 2027:** Year 1 anniversary content (manifesto retrospective + 12-month numbers)
- [ ] **Q4 2026:** Consider product #20 launch (only if existing 19 hit catalogue-completion benchmarks)
- [ ] **When budget allows:** Open up paid acquisition tests (Google + LinkedIn) — only after 10+ organic conversions analysed
- [ ] **When ready:** Replace bootstrapped framing if pursuing capital — currently the AI-led-ops story depends on staying lean

---

## 📋 Reference — everything already shipped

You can ignore everything below unless you need to remind yourself what's been done. (No actions here.)

### Code + infrastructure (in repo)

- ✓ Pure C-suite agent names (Claude/Anthropic/Groq stripped from all customer-facing copy)
- ✓ Anti-leakage clause in agent prompts
- ✓ 25 references on Wikidata Q139821959 (Srijan), 34 on Q139821891 (Aiprosol) — both 100% referenced
- ✓ 11-language descriptions on both entities + multilingual aliases on Aiprosol
- ✓ Person + Organization + AboutPage + FAQPage + ProfilePage + Course + Dataset + Speakable schemas
- ✓ Tier 1, 2, 3 product enhancements (FAQs, bestFor, outcomes, bundles, TOC previews, flagship landing, embedded previews, comparison view, post-purchase upsell, filter/sort)
- ✓ ROI Audit → product recommendation engine
- ✓ Internal link audit (0 broken across 280 internal targets)
- ✓ Schema validator (0 errors, ~750 warnings expected after Round 2 deploy)
- ✓ Accessibility audit (231 errors → fixed in code, awaiting deploy)
- ✓ SECURITY.txt + /.well-known/security.txt (RFC 9116)
- ✓ IndexNow ping submitted 200 URLs to Bing + Yandex

### Docs in repo (no actions needed unless you want to reference)

| File | Purpose |
|---|---|
| `BRAND-VOICE-STYLE-GUIDE.md` | Voice + tone + vocabulary rules |
| `COLD-OUTREACH-SEQUENCE.md` | 5-touch prospect sequence |
| `CUSTOMER-ONBOARDING-EMAILS.md` | Day 0-90 customer onboarding |
| `MONTHLY-UPDATE-TEMPLATE.md` | Monthly investor/advisor update |
| `OUTREACH-DRAFTS.md` | 5 press pitch drafts |
| `PODCAST-PITCH-LIST.md` | 18 shows ranked by fit |
| `30-60-90-DAY-PLAN.md` | Strategic sequencing |
| `WIKIPEDIA-DRAFT.md` | Company + founder articles draft |
| `SUBSTACK-DRAFT-001-chairmans-log.md` | First Substack post |
| `DIRECTORY-SUBMISSION-KIT.md` | Canonical company facts |
| `OUTRANK-PLAYBOOK.md` | SEO/GEO playbook |
| `X-LAUNCH-KIT.md` | X manifesto + follow list |
| `BING-WEBMASTER-SETUP.md` | Bing verify guide |
| `scripts/audit-internal-links.mjs` | Link health monitor |
| `scripts/audit-a11y.mjs` | Accessibility monitor |
| `scripts/validate-schema.mjs` | Schema validator |

---

## How to update this worklist

When you finish an item, tick the box. When new work appears, add it to the right block. When this doc gets stale (> 30 days without an update), do a full review.

When a block clears completely, move it to "shipped" at the bottom of this file and start a fresh empty block at the top.

This is the single source of truth for "what's left." If you're confused about priority, re-read Block 1.
