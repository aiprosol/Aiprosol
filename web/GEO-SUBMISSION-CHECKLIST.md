# GEO Submission Checklist · Aiprosol

Generated 2026-05-15 after running the Chrome MCP audit. Status of every external action that needs Srijan's hands (Chrome MCP can map paths but can't create accounts or post on your behalf).

---

## 🚨 Two critical findings from the audit

### Finding 1 — Perplexity confuses Aiprosol with "ApiraSol"

Query "What is Aiprosol and what do they do?" on perplexity.ai returns:
> "Aiprosol most likely refers to **ApiraSol**, a brand-protection and supply-chain intelligence company…"

10 sources cited, **none of which are aiprosol.com**. This is because Perplexity (and most AI engines) had no crawler access to aiprosol.com until today's robots.txt fix. Pattern-matching to nearest-named entity.

**Expected fix timeline**: 3-7 days after re-crawl. To accelerate: see Action #1 below.

### Finding 2 — Google has only 1 stale page indexed

`site:aiprosol.com` returns exactly **one** result — and it's titled "AI Pro Solutions" with "Drop us a line! Sign up for our email list" — **content from the previous domain owner**, not Aiprosol. None of the current 75+ Aiprosol pages are indexed yet.

**Expected fix timeline**: 1-7 days after sitemap re-submission via Search Console. To accelerate: see Action #2 below.

### ✅ What did land cleanly

- Schema.org structured data verified by Google Rich Results Test:
  - Homepage: 3 valid items (Organization, Local Business, Software Apps)
  - Service page: 4 valid items (above + Breadcrumbs)
- `/llms.txt` + `/llms-full.txt` deployed (5.8 KB + 10.2 KB)
- `robots.txt` rewritten to invite 19 AI crawlers

---

## Actions Srijan needs to take (ordered by impact)

### 🔥 Action 1 · Submit sitemap to Google Search Console (10 min, free)

This is the **single highest-leverage action**. Without it, the existing schema + content is invisible.

1. Go to https://search.google.com/search-console
2. Add property: `https://aiprosol.com` (URL prefix)
3. Verify via the DNS TXT record method (Vercel domain → DNS) or HTML tag method
4. After verification: Sitemaps → Submit `https://aiprosol.com/sitemap.xml`
5. URL Inspection → paste `https://aiprosol.com/` → Request indexing
6. Repeat for /agents, /digital-products, /services, /pricing (4 most-important pages)

After this lands, you'll have visibility into:
- How many of your 75+ pages are indexed
- Which AI bots are crawling (Search Console shows bot-by-bot)
- Whether the schema is actually triggering rich results

---

### 🔥 Action 2 · Submit sitemap to Bing Webmaster Tools (5 min, free)

Why this matters: Bing's index feeds **ChatGPT browse + Copilot**. So Bing indexing = ChatGPT visibility.

1. Go to https://www.bing.com/webmasters
2. Sign in (or sign up if you don't have an account — uses Microsoft account)
3. Add site: `https://aiprosol.com`
4. Verify (XML file, DNS, or meta tag)
5. Submit sitemap: `https://aiprosol.com/sitemap.xml`
6. URL Inspection → request indexing on homepage + /agents

After this lands: ChatGPT (with browse) should start citing aiprosol.com when asked relevant questions.

---

### 🟢 Action 3 · Submit to AI Directories (45 min total — free, no PR needed)

These are the highest-cite-rate AI tool directories. Pick a Saturday morning, work through the list:

| # | Directory | URL | Free? | Account needed? | Notes |
|---|------|------|------|------|------|
| 1 | **Future Tools** | https://www.futuretools.io/submit-a-tool | ✅ Free | No | Matt's curated list — high-quality signal |
| 2 | **Toolify.ai** | https://www.toolify.ai/submit | ✅ Free + paid tiers | No | 8M page views / 5.1M monthly visits |
| 3 | **Aixploria** | https://www.aixploria.com/en/featured-on-aixploria/ | ✅ Fast Listing free | No | 500K+ monthly visitors, 200+ countries |
| 4 | **Awesome AI Tools** (GitHub) | https://github.com/mahseema/awesome-ai-tools | ✅ Free | GitHub account | PR submission, 5.2k stars |
| 5 | **Awesome Generative AI** (GitHub) | https://github.com/steven2358/awesome-generative-ai | ✅ Free | GitHub account | PR submission, 12k stars |
| 6 | **There's An AI For That** | https://theresanaiforthat.com/submit/ | 💰 Paid ($300+ "Early Launch Bonus") | Yes | 4M monthly visitors — pay-to-play |
| 7 | **Product Hunt** | https://www.producthunt.com/posts/new | ✅ Free | Personal account + 1-week wait | Branded accounts can't post — use Srijan's personal account |

**Suggested submission copy** (paste into each form):

- **Tool Name**: Aiprosol
- **URL**: https://aiprosol.com
- **Category**: AI Automation Consultancy / AI Agents / Business Automation
- **Pricing**: Freemium ($17 self-serve → $7,997/mo managed)
- **Short description** (≤140 chars): "AI automation consultancy run by 10 AI agents + 1 human Chairman. Reclaim 35+ hours/week per team. Plans from $17."
- **Long description**: Copy the `> Global AI automation consultancy…` block from `/llms.txt`.
- **Tags**: AI automation, AI agents, workflow automation, business automation, n8n, Zapier, AI consultancy

---

### 🟡 Action 4 · Activate the 30 LinkedIn drafts you already have queued (30 min/week)

These are already drafted in your `linkedin_posts` Supabase table. Per the catalog they sit ready. Daily posts under Srijan's name = consistent "Srijan Paudel + Aiprosol + AI automation" co-mention → next-gen LLMs learn the association.

1. Open /studio Content tab
2. Pick today's draft
3. Copy to LinkedIn (manual post — keeps you in control of voice)
4. Mark as `published` in /studio
5. Repeat tomorrow

---

### 🟡 Action 5 · Reach out to 3 podcasts (1 hr — one-time)

Each podcast appearance → web citation → AI training data. Top targets given your niche:
- **The Indie Hackers Podcast** (Courtland Allen)
- **The Twenty Minute VC** (Harry Stebbings) — for the "AI-led consultancy" angle
- **My First Million** (Sam Parr / Shaan Puri) — for the founder story
- **Business Made Easy** (Troy Trewin AU)
- **The Productivityist** (Mike Vardy) — closer to your ICP

Pitch angle: "First AI-led consultancy with a 10-agent AI C-suite running real ops. Public live state at aiprosol.com/agents."

Use the SAL-029 podcast guest pitch prompt from your Prompt Vault to draft each one.

---

## Status of GEO foundation (already shipped, deployed at aiprosol.com)

| Layer | Status |
|------|------|
| robots.txt — AI bots invited | ✅ live |
| /llms.txt | ✅ live (5.8 KB) |
| /llms-full.txt | ✅ live (10.2 KB) |
| Organization schema | ✅ valid |
| WebSite + SearchAction schema | ✅ valid |
| ProfessionalService schema | ✅ valid |
| Person schema (Srijan) | ✅ valid |
| SoftwareApplication schema (Arora AI CEO) | ✅ valid |
| Service schema (per /services/<slug>) | ✅ valid |
| BreadcrumbList schema | ✅ valid |
| Product schema (per /products/<slug>) | ✅ pre-existing |
| FAQPage schema | ✅ pre-existing on /faqs |
| Article schema (per /blog/<slug>) | ✅ pre-existing |

## What I deliberately did NOT do (would need explicit permission)

- Create Product Hunt account (account creation = user-only per safety rules)
- Submit to any directory (account creation typically required)
- Sign in to LinkedIn (OAuth flow needs explicit approval)
- Post to LinkedIn on your behalf (irreversible public action)
- Open GitHub PRs (account auth + public commit)
- Verify Search Console (domain ownership verification needs DNS access)

All of the above are documented above with direct URLs.

---

## Verification — run these in 7 days

After bots re-crawl, you should see:

| Test | Expected outcome 7d post-deploy |
|------|------|
| `site:aiprosol.com` on Google | Many pages indexed (homepage, /agents, products, services) — NOT just the stale "AI Pro Solutions" page |
| `site:aiprosol.com` on Bing | Same |
| Perplexity: "What is Aiprosol?" | Cites aiprosol.com directly; describes AI automation consultancy + 10-agent C-suite |
| Perplexity: "Best AI automation consultancy for SMBs" | Aiprosol appears in the cited sources |
| ChatGPT (browse mode): "How does Aiprosol's AI C-suite work?" | Direct answer with /agents URL citation |
| Claude (web search): same | Same |

If any of these don't fire, the next layer is content — comparison pages + glossary + cite-worthy original research. I can build those.

---

*Generated by Aiprosol Chrome MCP audit · 2026-05-15*
