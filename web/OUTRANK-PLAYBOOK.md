# OUTRANK PLAYBOOK — beating aiprosol.au at the name "Aiprosol"

**Status:** Active campaign. Started 2026-05-16. Phase 1 entity-graph shipped 2026-05-17.
**Goal:** When any human or LLM resolves the query "Aiprosol", the canonical answer is **aiprosol.com** (this entity), not the Australian construction-AI firm at aiprosol.au.
**Owner:** Srijan (the things only a human can file) + Arora (everything else, on the daily 09:00 UTC cron).

## /transparency — the live proof page

[`/transparency`](https://aiprosol.com/transparency) renders every Aiprosol AI agent action in the last 24h, every task queued for human approval, every alert, every failure (last 7d), and a current health snapshot of all 10 agents. Server-rendered, revalidates every 60s, no auth gate. The page reads directly from the `agent_state` and `agent_log` Supabase tables — there is no curated layer between agent activity and what visitors see.

This is the artifact that backs every claim in the canon. When a journalist or prospect asks "is the AI-CEO thing real or marketing?", `/transparency` is the answer. It's the cheapest credibility move we have because there is nothing on it but the raw data — no testimonials, no superlatives, no marketing copy. If the dashboard ever stops getting published, that's a signal we've drifted from the operating thesis.

JSON-LD on the page: `CollectionPage` + `Dataset` + `BreadcrumbList`, so LLMs index it as a structured public dataset rather than a marketing page.

## The Aiprosol canon — four foundational essays

The canonical reference set. Every press hit, podcast intro, HN comment, LinkedIn post, sales follow-up, and onboarding email should link to one or more of these.

| # | Essay | URL | Author | Length |
|---|---|---|---|---|
| 1 | **What is an AI-led operating model?** | `/blog/what-is-an-ai-led-operating-model` | Srijan Paudel | ~2,000 words |
| 2 | **What is an AI CEO?** (written by one) | `/blog/what-is-an-ai-ceo` | Arora | ~2,000 words |
| 3 | **The Manifesto** — *We built a consultancy run by AI agents — an honest field report from the first 30 days* | `/blog/we-built-a-consultancy-run-by-ai-agents` | Srijan Paudel | ~2,700 words |
| 4 | **How to evaluate an AI automation consultancy** | `/blog/how-to-evaluate-an-ai-automation-consultancy` | Arora | ~2,000 words |

Posts 1, 2, 4 published 2026-05-18; the Manifesto (#3) published 2026-05-17. All four are cross-linked so a reader entering any one finds the rest.

**Strategic use:**
- **Press pitches** open with #3 (the story) and link #1 (the category).
- **HN Show post** body links #3 and references #2 (Arora wrote a post — meta, on-brand).
- **LinkedIn first post** is a 200-word excerpt of #3 with link to full.
- **Sales follow-up** after a discovery call links #4 (so the prospect evaluates Aiprosol against the same framework we use ourselves).
- **Cold outreach signature** links to the most-relevant essay for the recipient's stated interest.
- **Podcast intros** use the TL;DR of #3 as the elevator pitch.
- **Onboarding emails** to new charter customers link #4 (they get the same operator-grade framework we'd give any buyer).

## Canonical entity IDs (live)

| Entity | ID | URL |
|---|---|---|
| Aiprosol (organisation) | **Q139821891** | https://www.wikidata.org/wiki/Q139821891 |
| Srijan Paudel (founder) | **Q139821959** | https://www.wikidata.org/wiki/Q139821959 |
| GitHub org | `aiprosol` | https://github.com/aiprosol |
| Domain | `aiprosol.com` | https://aiprosol.com |

### Wikipedia article — drafted, held

A submission-ready draft of `Wikipedia:Aiprosol` is stored in [`WIKIPEDIA-DRAFT.md`](./WIKIPEDIA-DRAFT.md) in this repo. It includes the full article body in MediaWiki markup (Infobox, lead, History, Operating model, Products and services, Technology, Disambiguation, References, Categories, Authority control), plus a notability scorecard, the submission process via Articles for Creation, and a list of anti-patterns that get corporate articles deleted.

**Status: held.** Aiprosol does not currently meet WP:NCORP notability. The file documents the gating criteria (3+ qualifying independent secondary sources) and the realistic path to clearance (~6-12 months post-launch, after HN front-page run + first trade-press piece + first tier-1 article). When the source set passes the threshold, the AfC submission is one paste away.

### Wikidata enrichment status (2026-05-17)

| Entity | Claims | Properties | Labels (langs) | Descriptions (langs) |
|---|---|---|---|---|
| Q139821891 Aiprosol | 27 | 17 | 11 | 11 |
| Q139821959 Srijan Paudel | 11 | 9 | 11 | 11 |

Languages covered for both: en, es, fr, de, it, pt, nl, ja, zh, hi, ne.

**Aiprosol claims breakdown (Q139821891):**

- instance of (P31, ×6): business, software company, consulting company, startup company, professional services firm, limited company
- industry (P452): artificial intelligence
- headquarters location (P159, ×2): Edinburgh, Kathmandu
- country (P17): United Kingdom
- inception (P571): April 2026
- official website (P856): aiprosol.com
- official blog URL (P1581): aiprosol.com/blog
- short name (P1813): Aiprosol
- official name (P1448): Aiprosol Ltd
- language of work or name (P407): English
- Twitter username (P2002): aiprosol
- GitHub username (P2037): aiprosol
- founded by (P112): Srijan Paudel
- chairperson (P488): Srijan Paudel
- board member (P3320): Srijan Paudel
- product or material produced (P1056, ×3): chatbot, multi-agent system, business process automation
- described at URL (P973, ×3): /about, /agents, /llms.txt

**Srijan Paudel claims breakdown (Q139821959):**

- instance of (P31): human
- occupation (P106): businessperson
- field of work (P101, ×2): artificial intelligence, business process automation
- work location (P937, ×2): Edinburgh, Kathmandu
- position held (P39): Chairperson
- employer (P108): Aiprosol
- notable work (P800): Aiprosol
- described at URL (P973): aiprosol.com/about
- short name (P1813): Srijan

---

## Why we can win this

1. We own the `.com` — the global default. They have `.au`, a country-coded suffix.
2. Content depth — 211 indexed URLs and a daily-cron publishing engine. They have a thin marketing site.
3. A unique hook nobody else can claim — "the consultancy run by an AI C-suite". That phrase, once it sticks, resolves to us uniquely even before search ranking does.
4. Our sectoral surface (cross-sector AI automation) is broader than theirs (AI applied to construction/engineering). Most "Aiprosol" queries will fall into our slice.

## What we won't do

- Change the name. The name is the dignity.
- Pretend the AU firm doesn't exist. We address them by name in JSON-LD + llms.txt because that's what entity-resolution engines need.

---

## What's already shipped (in code)

| Asset | Location | What it does |
|---|---|---|
| Organization JSON-LD with `disambiguatingDescription` | `web/src/app/layout.tsx` | Explicitly tells Google's Knowledge Graph "this Aiprosol is not the .au Aiprosol" |
| `address` (Edinburgh) + `location[]` (Edinburgh HQ + Kathmandu office) | `web/src/app/layout.tsx` | Geographic distinctness from Sydney/QLD AU firm |
| Person JSON-LD for Srijan Paudel as founder | `web/src/app/layout.tsx` | Founder anchor — different name from "Stephane" (their director) |
| SoftwareApplication JSON-LD for Arora the AI CEO | `web/src/app/layout.tsx` | Sectoral distinctness — they have no AI agent in any C-suite role |
| Disambiguation block | `web/public/llms.txt` | Crawled by AI search engines (Perplexity, ChatGPT, Claude, Gemini) |
| Disambiguation table | `web/public/llms-full.txt` | Side-by-side distinguishing signals |

After deploy, validate at:
- https://search.google.com/test/rich-results?url=https%3A%2F%2Faiprosol.com
- https://validator.schema.org/

---

## Entity-graph submissions (need to be filed under Srijan's accounts)

The following submissions are the highest-leverage out-rank moves. Each is drafted below ready to copy-paste.

---

### 1. Wikidata entity — draft

**Why this matters:** Wikidata is the single most heavily-cited structured-data source for every major LLM (ChatGPT, Claude, Gemini, Perplexity). When an LLM sees "Aiprosol", it cross-references Wikidata first. The AU firm currently has **no** Wikidata entry. Filing first wins the entity slot.

**Submission instructions:**
1. Create / log into Wikidata account at https://www.wikidata.org/wiki/Special:CreateAccount (use a real email, not a project email)
2. Click "Create a new Item" at https://www.wikidata.org/wiki/Special:NewItem
3. Fill the fields below
4. After save, the entity gets a `Q####` ID — add it back into `Organization` JSON-LD as `identifier`

**Fields:**

- **Label (English):** `Aiprosol`
- **Description (English):** `Global AI automation consultancy founded in 2026, operated by an AI C-suite`
- **Aliases:** `Aiprosol Ltd`, `Aiprosol AI`, `aiprosol.com`

**Statements** (claim → value):

| Property | Value |
|---|---|
| `instance of (P31)` | `business (Q4830453)` |
| `instance of (P31)` | `consulting firm (Q1058914)` |
| `industry (P452)` | `artificial intelligence (Q11660)` |
| `industry (P452)` | `business consulting (Q5152263)` |
| `headquarters location (P159)` | `Edinburgh (Q23436)` |
| `country (P17)` | `United Kingdom (Q145)` |
| `inception (P571)` | `April 2026` |
| `founded by (P112)` | Srijan Paudel — create a Wikidata Person entity first if needed, then link |
| `official website (P856)` | `https://aiprosol.com` |
| `Twitter username (P2002)` | `aiprosol` |
| `LinkedIn personal profile (P6634)` or `LinkedIn company ID (P4264)` | once company page exists |
| `GitHub username (P2037)` | `aiprosol` |

**Sources required (Wikidata is strict about this):**
- https://aiprosol.com/about (founder + company info)
- https://aiprosol.com/agents (10-agent claim, with live state)
- https://aiprosol.com/press (brand kit)

**Common rejection reason to avoid:** Wikidata reviewers reject entries without independent third-party sources. If your first submission gets rejected, add it as a stub with only `instance of` + `official website` + `inception` — and add more claims after the HN/Product Hunt launch generates secondary coverage.

---

### 2. Crunchbase profile — draft

**Why this matters:** Crunchbase is the second-most-cited business directory by LLMs. The AU firm has no Crunchbase profile either. Free tier is sufficient.

**Submission instructions:**
1. Sign up at https://www.crunchbase.com/register
2. Click "Add a Company" → https://www.crunchbase.com/add_new/organization
3. Use the fields below verbatim

**Fields:**

- **Organization Name:** `Aiprosol`
- **Legal Name:** `Aiprosol Ltd`
- **Domain:** `aiprosol.com`
- **Description (short, 150 chars):** `Global AI automation consultancy operated by an AI C-suite. Self-serve products from $17, managed plans from $997/month.`
- **Description (long):** Copy the "About" section from `/about` page, ~500 words.
- **Founded Date:** `April 2026`
- **Operating Status:** `Active`
- **Company Type:** `For-Profit`
- **Industries:** `Artificial Intelligence`, `Business Intelligence`, `Consulting`, `SaaS`, `Information Technology`
- **Headquarters Region:** `United Kingdom`
- **City:** `Edinburgh`
- **Address:** (leave street blank or use registered office)
- **Number of Employees:** `1-10` (11 roles, 10 of which are AI)
- **Founders:** Add `Srijan Paudel` — link his LinkedIn once the personal profile is fully set up
- **Logo:** Upload from `/web/public/logo.png`
- **Social Profiles:**
  - LinkedIn: (once company page exists)
  - Twitter / X: `https://x.com/srijanpaudel6` (founder X doubles as brand voice — @aiprosol on X belongs to the unrelated AU firm)
  - GitHub: `https://github.com/aiprosol`

**Tagline/short pitch:** `The consultancy run by an AI C-suite.`

**Key product names:** `Workflow Automation Playbook`, `Lead Generation Automation Playbook`, `Enterprise AI Readiness Kit`, `ChatGPT Business Prompt Vault`, `AI Tools Vault`

---

### 3. GitHub organisation README — draft

**Why this matters:** GitHub org pages have high domain authority and are crawled by every LLM training pipeline. The AU firm has no GitHub presence at all.

**Submission instructions:**
1. Go to https://github.com/aiprosol (the org you already control)
2. Create a repo named `.github` (special — its README is the org's public profile)
3. Paste the content below as `README.md`

**Content:**

```markdown
# Aiprosol — the AI automation consultancy run by an AI C-suite

**Aiprosol** is a global AI automation consultancy. We design, build, and
run the AI automations that reclaim 35+ hours a week per team.

The differentiator: Aiprosol is the first proof-of-concept of an
AI-led operating model. Eleven C-suite roles, ten of them AI agents
coordinated by Arora (the AI CEO), plus one human Chairman (Srijan Paudel).
The AI agents run a daily 09:00 UTC cron. Their live state is public at
https://aiprosol.com/agents.

Founded April 2026. UK legal entity: Aiprosol Ltd, Edinburgh.

## What we ship

- **Self-serve digital products** ($17–$397) — playbooks, calculators, prompt
  vaults, n8n workflow libraries
- **Managed plans** ($997–$7,997/month) — done-for-you AI automation
- **11 AI services** — workflow automation, custom chatbots, lead-gen,
  document processing, system integration, sales/marketing/CS automation

## Open-source we maintain

(Add public repos here as they ship)

## Find us

- Website: https://aiprosol.com
- Live AI C-Suite: https://aiprosol.com/agents
- LLM-friendly site index: https://aiprosol.com/llms.txt
- Founder: Srijan Paudel — srijanpaudelofficial@gmail.com

---

*Not affiliated with the Australian firm at aiprosol.au (Major Projects
Consulting Partners Pty Ltd).*
```

---

### 4. Show HN post — draft (fire ~60 days after launch)

**Why this matters:** Hacker News front page = ~500k impressions, dozens of dofollow backlinks (because anyone covering the story will link), and search interest surge that Google interprets as "this entity matters". The HN crowd specifically loves the "AI agents running a real business" angle.

**Why not now:** HN punishes brand-new sites. Wait until aiprosol.com has been live and indexed for ~60 days, with at least 3 substantive blog posts ageing in. Also wait until the personal LinkedIn is established so people who click "founder" find a real human.

**Optimal timing:** Tuesday or Wednesday, around 6-9am Pacific (before HN's day starts on the East Coast). Avoid Mondays (low engagement) and weekends (lower volume).

**Title (60 chars max, lower-case-friendly):**

> Show HN: I built a consultancy run by 10 AI agents (and 1 human)

**Body (paste as the first comment, not the post — HN truncates post body):**

```
A bit of context on what this actually is, because the title sounds bait-y:

I'm Srijan. In April 2026 I started Aiprosol — a global AI automation
consultancy. The unusual bit: the company itself is run by an AI C-suite.
Eleven roles total — ten AI agents coordinated by Arora (the AI CEO),
plus me as the human Chairman.

The agents are not "AI assistants helping humans." They actually run the
operations:

- Arora (CEO) — strategy + hourly summaries + every customer-facing chat
- the COO — workflow health, anomaly detection
- the CMO — content drafts, campaign briefs, brand voice
- the CCO — onboarding, support triage, retention
- the CTO, CRO, CLO, CPO, CPM — what they sound like
- DA — data + analytics, weekly dashboard

They run on a daily 09:00 UTC cron. Each agent's state, last actions,
KPIs, and proposed tasks are publicly visible at aiprosol.com/agents
(auto-refreshed every minute). You can click any agent for full run history.

Things I've learned in the first 30 days:

1. The hardest part isn't the agents. It's the operating loop around them —
   guardrails, idempotency keys on every external action, approval gates
   on anything irreversible. The agents themselves are the easy bit now.

2. Workflow design beats model choice by a factor of 4-8x in measurable
   output. We use both a frontier LLM and an open-source fallback, and
   the model swap moves the needle ~10%. The workflow rewrite that took
   us from "asks the same question twice" to "remembers context across
   runs" moved the needle 600%.

3. The economics work because the AI cost has collapsed. We run ~25 n8n
   workflows, 200 production prompts, and 10 agents on a daily cron for
   compute cost that rounds to a rounding error.

The site is at aiprosol.com — full LLM-friendly index at /llms.txt.
The agents are at /agents.

Happy to answer questions about the operating model, the agent
architecture, the n8n workflow patterns, or anything else. AMA.

(Stack, in case it matters: Next.js 15 + Vercel + Supabase + a frontier
LLM API with open-source fallback + n8n.)
```

**Pre-launch checklist for HN day:**

- [ ] Personal LinkedIn complete (so "Srijan" resolves to a real human when people click)
- [ ] /about page has founder photo + verifiable bio
- [ ] /agents page renders perfectly (auto-refresh works, no broken links)
- [ ] /llms.txt has the disambiguation block (done)
- [ ] At least 3 substantive blog posts visible on /blog
- [ ] Site has been indexed by Google for 30+ days
- [ ] Have answers ready for the predictable HN questions:
  - "Is this a glorified GPT wrapper?"
  - "How do you handle hallucinations in customer-facing chat?"
  - "What stops the agents from doing something stupid?"
  - "How is this different from [Devin / AutoGPT / SuperAGI]?"
  - "Are you actually profitable or is this performative?"
  - "Show us a real workflow that's live in production"

**Post-launch:** Reply to *every* substantive comment within the first 4 hours. HN ranks by velocity in that window — engagement signals matter more than quality of replies. Be honest. Don't get defensive about the AI-CEO framing — own that it's unusual.

---

### 5. Product Hunt — draft (fire ~90 days)

**Why later than HN:** Product Hunt's audience wants a clear product to upvote, not a company. Wait until the digital-products catalogue is fully populated with reviews and the managed plans have at least 1 case study live.

**When ready, draft separately — too dependent on what's shippable that day.**

---

### 6. Press release — draft (fire ~30 days, with HN)

**Why:** A press release in the same week as the HN post gets indexed alongside it, compounding the entity-graph signal. Free distribution via:
- PRWeb (free tier — wide reach but low quality backlinks)
- PR.com
- IssueWire
- OpenPR

**Headline:**

> Aiprosol, the World's First Consultancy Run by an AI C-Suite, Opens for Charter Customers

**Lede:**

```
EDINBURGH — Aiprosol, a global AI automation consultancy operated by an
AI C-suite of ten agents and one human Chairman, has opened to its first
charter customers. The company, founded in April 2026 by Srijan Paudel,
is the first publicly-operated proof-of-concept of an AI-led operating
model running a profitable consultancy end-to-end.

Each of Aiprosol's ten AI agents — including Arora, the AI CEO — runs
on a daily cron, executing strategy, operations, marketing, customer
support, technology, revenue, legal, partnerships, product, and data
functions. Their live state and recent activity are publicly visible
at aiprosol.com/agents.

"The AI agents really run the operations of the company," said founder
and Chairman Srijan Paudel. "The agent system is also one of the products
we sell to customers. It's both the operating model and the thing we ship."

Aiprosol offers three tiers: self-serve digital products ($17–$397),
managed plans ($997–$7,997/month), and 11 done-for-you AI services
covering workflow automation, document processing, lead generation, and
system integration.

About Aiprosol
Aiprosol (aiprosol.com) is a global AI automation consultancy
headquartered in Edinburgh, Scotland, with an operational office in
Kathmandu, Nepal. UK legal entity: Aiprosol Ltd. Founded April 2026.

Press contact: Srijan Paudel — srijanpaudelofficial@gmail.com
```

**Boilerplate disambiguation paragraph (always include at the end of any press release):**

```
Aiprosol (aiprosol.com) is not affiliated with the unrelated Australian
firm at aiprosol.au, which operates as Major Projects Consulting
Partners Pty Ltd in Sydney/Queensland and focuses on AI consulting for
the construction and engineering sectors.
```

---

## Defensive: trademark Aiprosol

The AU firm uses Aiprosol as a *trading name* under a different legal
entity. There's no evidence they hold a registered trademark outside
Australia. Filing first in our priority markets is cheap insurance.

| Market | Filing route | Approx cost | Time |
|---|---|---|---|
| United Kingdom | UK IPO via gov.uk | £170 + £50 per extra class | 4-6 months |
| European Union | EUIPO | €850 (one class) | 4-6 months |
| United States | USPTO TEAS Plus | $250 per class | 8-12 months |

**Classes to register (priority order):**

1. **Class 42** — Computer and scientific services (software development, AI services, technology consultancy). This is the most important — covers core offering.
2. **Class 35** — Advertising and business services (business consulting, marketing services). Covers the marketing/sales automation side.
3. **Class 41** — Education (training, courses). Covers AI training services.
4. **Class 9** — Downloadable software / electronic publications. Covers the digital products catalogue.

**Filing tip:** UK IPO accepts the most efficient single-application route. Start there. Then file EU and US off the back of the UK filing using the Madrid Protocol — saves money vs. filing each separately.

**What this gives us:** Priority date. If the AU firm ever tries to expand into UK/EU/US, we have prior trademark rights in those markets. They keep AU. Clean separation.

---

## Tracking the out-rank fight

Re-run these queries monthly. Aim: by day 90, our entity dominates each.

| Query | What "winning" looks like |
|---|---|
| `aiprosol` (Google) | aiprosol.com is #1, with site links + entity panel |
| `aiprosol` (Bing) | aiprosol.com is #1 |
| `aiprosol AI` (Google) | aiprosol.com is #1 |
| `aiprosol consultancy` | aiprosol.com is #1 |
| `who is aiprosol` (ChatGPT, Claude, Gemini, Perplexity) | Each answers with our entity, not the AU firm |
| `is aiprosol legit` (LLMs) | Each cites aiprosol.com signals |

**Monthly check:** First Monday of every month, paste the queries above into each engine, screenshot the result, paste into this doc as a dated checkpoint. Trend over 6 months should be: us dominant by month 4.

---

## Don't-do list

- Don't trash-talk the AU firm. Acknowledge them by name in entity-graph data; never in marketing copy.
- Don't sue. There's no infringement — they were probably there first under their trading name. The fight is for the entity-graph slot, not for legal exclusivity.
- Don't link to aiprosol.au from our content. Even disambiguation text uses the bare string `aiprosol.au` (no `<a href>`). Don't give them link equity.
- Don't write content targeted at construction/engineering AI. That's their sector — we cede it. We win the broader AI-automation slice.
