# AI Tools Stack Starter Kit

**The complete AI tool stack for a 10-50 person business. Tools, integrations, and the spreadsheet that tracks total cost of ownership.**

Version 1.0 · 2026 · 18 importable n8n integration workflows + recommended-stack guide + TCO calculator

---

## What you get

| Asset | Format | Purpose |
|------|------|------|
| Recommended stack (14 tools × 7 categories) | This document (Part 1) | Verdict + rationale per pick |
| Budget calculator | `tco-calculator.xlsx` | Monthly cost based on your usage volume |
| 10 integration workflow starters | `n8n-workflows/` folder | Real `.json` covering common patterns |
| Migration playbook | This document (Part 4) | Layer alongside existing tools without rip-and-replace |

---

## Part 1 · The Recommended Stack (14 tools × 7 categories)

For a 10-50 person business shipping product, selling B2B, and serving SMB customers.

### LLM (2)
- **Claude (Anthropic)** — primary for: long-context, accuracy-sensitive reasoning, tool use. ~$3-15/1M tokens. Best at: legal, support triage, code review.
- **GPT-4o-mini (OpenAI)** — secondary for: bulk classification, summarisation, agent loops with high call count. ~$0.15/1M tokens. Best at: high-volume, low-stakes routing.

**Verdict**: Use Claude for anything customer-facing or judgement-laden. Use GPT-4o-mini for backend grunt work where volume matters. Avoid sticking entirely with one provider — duplicate paths give you 30% cost arbitrage opportunities.

### Workflow orchestration (1)
- **n8n self-hosted** ($5/mo VPS) — unmetered, code-first, AI nodes built in. Beats Zapier/Make at >100 runs/day per workflow.

**Verdict**: Standardise on n8n if your team has even one engineer. Stay on Zapier/Make if 100% non-technical.

### CRM (1)
- **HubSpot Free** ($0) or **Pipedrive Essential** ($19/mo) — both fine for 10-50 person. Spend the savings on AI tools, not CRM premium tiers.

**Verdict**: HubSpot Free for marketing-heavy teams (forms, sequences). Pipedrive for sales-pipeline-heavy teams. Don't pay HubSpot Pro until $5M+ ARR.

### Vector DB / RAG (1)
- **Supabase pgvector** (~$25/mo Pro) — Postgres + vectors in one place. Saves cognitive overhead vs. Pinecone or Weaviate.

**Verdict**: pgvector wins for 90% of SMB RAG use cases. Pinecone is only better if you're processing 100M+ vectors.

### Email / Outreach (1)
- **Resend** ($20/mo + usage) — modern API, good deliverability. Bring your own domain.

**Verdict**: Resend if technical team, Mailgun if you need enterprise SLAs. Avoid SendGrid (deliverability has slipped).

### Calendar / Booking (1)
- **Cal.com self-hosted** ($0) or **Calendly Standard** ($10/mo)

**Verdict**: Cal.com if technical, Calendly if you need it working tomorrow. Calendly's API + n8n triggers are excellent.

### Observability (1)
- **PostHog Cloud** (free up to 1M events/mo) — product analytics + session recordings + feature flags in one.

**Verdict**: PostHog is the right tool for SMBs. Don't fragment into Mixpanel + Hotjar + LaunchDarkly.

### Customer support (1)
- **Plain ($79/mo)** or **Intercom Essential ($39/mo)** — both wire well to AI triage workflows.

**Verdict**: Plain for B2B / technical product. Intercom for B2C / mass-market.

### File / docs (2)
- **Notion ($10/mo)** — wiki + databases + light project tracking
- **Google Workspace ($14/mo)** — gmail + drive + calendar

**Verdict**: This pairing is the most common at SMB scale. Avoid the temptation to add Coda, Slite, or another wiki on top.

### Comms (1)
- **Slack ($8/mo)** — defaults around Slack, not your inbox. AI notification routing is much easier with Slack as the surface.

### Finance + billing (2)
- **Stripe Standard** (2.9% + 30c) — billing, invoicing, subscription mgmt
- **Mercury** ($0) — banking + treasury for US incorporated; **Wise Business** ($0) for international

**Verdict**: Stripe + Mercury is the modern SMB pair in the US. Avoid Brex for early-stage (the rewards stop making sense below $250k/mo spend).

---

## Total cost per month at 25-person scale

| Tool | Monthly |
|------|------|
| Claude API (10M tokens/mo) | $30 |
| GPT-4o-mini (50M tokens/mo) | $8 |
| n8n self-hosted | $5 |
| HubSpot Free | $0 |
| Supabase Pro | $25 |
| Resend | $35 |
| Cal.com self-hosted | $0 |
| PostHog free tier | $0 |
| Plain | $79 |
| Notion (25 seats) | $250 |
| Google Workspace (25 seats) | $350 |
| Slack (25 seats) | $200 |
| Stripe (passthrough) | varies |
| **Total fixed** | **~$1,000/mo** |

For a 25-person business doing $200k MRR, this is <0.5% of revenue. Most SMBs spend 5-10x this on the wrong stack.

---

## Part 2 · n8n Integration Starters

The `n8n-workflows/` folder includes 10 production-shaped starter workflows demonstrating the common AI integration patterns. They're not full coverage of every integration you might need — they're the proven scaffolds you adapt:

### Real importable workflows in `n8n-workflows/`
- `01-sales-stripe-charge-to-hubspot.json` — Stripe charge → HubSpot deal stage update
- `02-sales-calendly-ai-prep-brief.json` — Calendly booking → Claude prep brief → email
- `03-sales-form-score-route-slack.json` — Form submit → AI score → routed Slack
- `04-cs-support-ticket-ai-categorise.json` — Ticket → Claude classify → Slack channel
- `05-ops-daily-kpi-digest.json` — Cron 7am → KPI digest to Slack
- `06-finance-invoice-extract.json` — Vendor invoice email → AI extract → Sheet
- `07-cs-nps-low-detractor-alert.json` — NPS < 7 → CSM Slack alert
- `08-sales-cold-reply-intent-classifier.json` — Cold reply → AI intent → branch
- `09-marketing-blog-cross-post.json` — Blog publish → AI cross-post drafts → Notion
- `10-cs-onboarding-day-3-nudge.json` — Onboarding state machine (day 0, 3, conditional nudge)

### Other patterns documented (build from the above as scaffolds)
- Slack message in #leads → Claude classify → route → Notion
- Gmail with attachment → OCR → Claude extract → Sheet
- Receipt photo email → OCR + Claude → expense ledger
- Vendor invoice PDF → Claude extract → QBO
- New hire offer accepted → Notion onboarding doc generated
- PTO request → manager Slack + calendar block
- Newsletter unsubscribes → Claude analyse reason → list-health Slack
- Job application → Claude summary → recruiting Slack

---

## Part 3 · The TCO Calculator

Plug in for each tool: monthly volume, current plan, scaling expectations.

Spreadsheet returns:
- Total monthly + annual cost
- Cost per user
- Cost per workflow
- Break-even points (e.g. "at 25 employees, n8n self-hosted saves $340/mo vs Zapier")
- Cost projection at 6 / 12 / 24 month volume forecast

Most users find their stack is 1.5-2x more expensive than necessary. The calculator highlights which tools to downgrade or replace.

---

## Part 4 · The Migration Playbook

The whole point of this kit is **layering, not ripping out**. If you have Salesforce, keep it. If you have Zapier, keep it. The kit slots alongside.

### Layer 1 (week 1) — n8n self-hosted
Install on a $5/mo VPS. Connect to your existing tools via API. n8n doesn't replace Zapier — it complements it for high-volume workflows.

### Layer 2 (week 2) — Claude/GPT integration
Wire n8n's AI nodes into your existing flows. Replace rule-based decisions with AI judgement only where rules were already failing.

### Layer 3 (week 3) — PostHog
Drop one snippet on your marketing site. You'll see whether anyone visits within a day.

### Layer 4 (week 4) — Plain (if you have a support channel)
Migrate inbox-only support to Plain. Wire to n8n for AI triage on day 1.

### Layer 5 (month 2 onwards) — Decommission overlap
After 6-8 weeks, audit the old stack. What's no longer used? What's redundant? Cancel only after the new system has proven itself for 30 days.

---

## Migration Anti-patterns

- **Don't rip and replace.** Most "modernisation" projects fail because they switch everything at once. Layer.
- **Don't add tools to "see what they do."** Every tool you add takes 30-60 minutes/week of cognitive overhead.
- **Don't standardise on one LLM.** Always have a fallback. APIs go down.
- **Don't pick tools by hype.** The tools above are boring on purpose — they work.

---

## Ship Today

Pick ONE workflow from `n8n-workflows/` that maps to a problem you have. Import it. Wire one credential. Run it.

You don't need to build the whole stack tomorrow. You need one workflow live today.

---

*If you'd rather have us pick + integrate the stack for you, see aiprosol.com/services/seamless-system-integration.*
