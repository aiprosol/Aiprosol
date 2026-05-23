# The AI Tools Stack Starter Kit

**8 pre-built, opinionated AI tool stacks for different business shapes. Each stack: tools, monthly cost, integration map, MVP path, scale-up path. Ship in a week.**

Version 1.0 · 2026 · © Aiprosol Ltd

---

## How this differs from the AI Tools Comparison Guide

The Comparison Guide ($67) tells you **what every tool does**. This kit tells you **which exact stack to assemble** for your specific business shape, and how to wire it together.

If you bought the Comparison Guide first and want to act, this is the next step.

---

## How to use this kit

1. Find the stack closest to your business in §1-§8 below
2. Read the **rationale** — why these tools and not others
3. Read the **MVP path** — start with the smallest version, add complexity as you grow
4. Use the **integration map** to wire the tools together
5. Use the **monthly-cost model** to forecast spend as you scale

Each stack has been built and run inside real Aiprosol client engagements. Costs and tools are accurate as of release date.

---

# §1 · The 8-person services agency

**Shape:** consulting / dev shop / design studio. 8 people. ~£40-80k MRR.

### The stack

| Layer | Tool | Monthly cost |
|---|---|---|
| Primary LLM | Claude.ai Pro Team (5 seats) | £90 |
| Workflow runner | Make Pro | £18 |
| CRM | HubSpot Free | £0 |
| Inbox | Gmail (existing) + Front Pro 5 seats | £295 |
| Calendar | Cal.com | £0 |
| Project mgmt | Notion Plus | £40 |
| Time tracking | Toggl | £45 |
| Voice agent | (none yet) | £0 |
| Coding | Cursor Pro × 3 | £48 |
| **Total** | | **£536/mo** |

### The 5 automations to build

1. **Inbound enquiry → AI-classified → assigned to right partner** — Make + OpenAI + HubSpot
2. **Discovery call recording → action items + draft proposal** — Fathom + Make + Claude API + Google Docs
3. **Project status weekly digest** — Make + Notion + Gmail
4. **Invoice OCR for incoming bills** — Make + Claude vision + Xero
5. **Client weekly progress email auto-draft** — Make + Notion + Gmail

### MVP path (week 1)

If you can only do one thing this week: build automation #1 (inbound enquiry classifier). It pays for the entire stack within 30 days.

### Scale-up triggers

- Past £150k MRR → add Vapi voice agent for inbound qualifier (£100-200/mo)
- Past £250k MRR → migrate from HubSpot Free to Pipedrive Pro (£35/seat) for better pipeline reporting
- Past 15 people → add Linear (£8/seat) for engineering, separate from project mgmt

---

# §2 · The 12-person SaaS startup (post-seed, pre-Series A)

**Shape:** product-led SaaS. 12 people. £15-50k MRR.

### The stack

| Layer | Tool | Monthly cost |
|---|---|---|
| LLM (in-product) | OpenAI API + Claude API | £200-500 (variable) |
| LLM (internal) | ChatGPT Team × 12 | £240 |
| Workflow | Make Pro | £18 |
| CRM | Attio | £350 |
| Customer support | Intercom Essential + Fin AI | £175 + per-resolution |
| Analytics | PostHog (free tier) | £0 |
| Coding | Cursor Pro × 8 | £128 |
| Voice (sales calls) | Fathom | £0 |
| Email (transactional) | Resend | £0-25 |
| **Total** | | **£1,136 + variable** |

### The 6 automations to build

1. **Trial signup → activation tracking → at-risk alerting** (PostHog + Make + Slack)
2. **Customer support email → AI classifier → Fin AI auto-response or human** (Intercom Fin)
3. **Churn risk early-warning** (PostHog + Attio)
4. **Investor update auto-draft from numbers** (Make + Stripe + PostHog + Claude)
5. **Feature-request triage from support tickets** (Intercom + Make + Notion)
6. **Onboarding email sequence based on first-action signals** (Make + Resend)

### MVP path

Week 1: support classifier (#2). Highest immediate value.
Week 2: trial activation tracker (#1).
Week 3-4: churn early-warning (#3).

### Scale-up triggers

- Past £100k MRR → add a dedicated growth engineer or Aiprosol managed plan
- Past 25 people → swap Make for n8n (self-hosted) or step up to Make Enterprise
- Past £500k ARR → custom CDP layer instead of off-the-shelf analytics

---

# §3 · The 30-person e-commerce / D2C brand

**Shape:** Shopify or WooCommerce. £200k-1M MRR. Heavy on customer support and stock management.

### The stack

| Layer | Tool | Monthly cost |
|---|---|---|
| LLM | Claude API + GPT-4o API | £300 |
| Workflow | Make Enterprise | £190 |
| Customer support | Gorgias + Concierge AI | £350 |
| Inventory | InflowInventory or Shopify native | £0-89 |
| Email marketing | Klaviyo | £350-1,000 (volume) |
| Reviews | Junip | £80 |
| Shipping | ShipStation | £100 |
| BI | Glew.io | £150 |
| **Total** | | **~£1,500-2,500/mo** |

### The 8 automations to build

1. **Order anomaly detection** (refund spikes, fraud, stock-outs) → Slack alert
2. **Support ticket categoriser** → Gorgias auto-route + auto-reply for FAQ-shape
3. **Abandoned cart recovery** → Klaviyo flow with AI-personalised opening line
4. **Post-purchase upsell email** → Klaviyo + Make + Claude
5. **Review → AI sentiment + theme extraction** → product-team weekly digest
6. **Stock-out predictor** (90-day forecast vs incoming PO)
7. **Customer LTV scoring** → segment for Klaviyo
8. **Daily P&L digest** to founder (revenue vs ad spend vs COGS)

---

# §4 · The 50-person professional services firm (legal / accounting / consulting)

| Layer | Tool | Monthly cost |
|---|---|---|
| LLM | Claude API + on-prem option | £400-800 |
| Workflow | Make Enterprise + n8n self-hosted | £190 + £40 hosting |
| CRM / matter mgmt | Industry-specific (Clio, Karbon, etc.) | £400-1,000 |
| Doc AI | Reducto or Hyperscience | £500-2,000 |
| Inbox | Outlook / Gmail enterprise | (existing) |
| BI | Power BI or Tableau | £140-700 |
| Voice agent | Vapi (inbound qualifier) | £150-400 |
| **Total** | | **~£2,000-5,000/mo** |

### Critical considerations

- **Data residency** — UK / EU clients require UK / EU LLM hosting. Use Claude on AWS Bedrock (eu-west-1) or self-host Mistral.
- **Audit trail** — every AI output that touches client work logged with input + output + model version for 6 years.
- **Privilege** — confidential client data NEVER routed through OpenAI / Anthropic without explicit DPA + data-not-trained guarantee.

### The 6 automations to build

1. **Document review (contracts / filings)** — Claude + Reducto with confidence-thresholded human review
2. **Time-recording auto-capture** from calendar + email + matter activity
3. **Client intake automation** — webform → matter created + conflict check + welcome packet
4. **Billing reconciliation** — auto-match expenses to matters
5. **Compliance deadline radar** — calendar entries auto-flag for review
6. **Knowledge management** — internal RAG over historical matters

---

# §5 · The solo operator / 2-person consultancy

**Shape:** you, possibly one helper. £5-30k MRR. Deeply manual still.

### The stack (kept tight)

| Layer | Tool | Monthly cost |
|---|---|---|
| LLM | Claude.ai Pro | £18 |
| Workflow | Make Free or Pro | £0-9 |
| CRM | Notion (free tier) | £0 |
| Email | Gmail | £0 |
| Calendar | Cal.com Free | £0 |
| Voice agent | (none yet) | £0 |
| Coding | Cursor Pro | £16 |
| **Total** | | **£43-65/mo** |

### The 3 automations that buy you back the most time

1. **Inbound contact form → AI brief + Slack/email ping** — 30 min/week saved on prospect research
2. **Recurring client check-in auto-draft** — 90 min/week saved on follow-up writing
3. **Daily metric digest** (Stripe revenue + new leads) at 8am — 15 min/day saved on dashboard checking

Total: ~10-15 hrs/wk reclaimed for ~£60/mo. ROI > 100×.

### Scale-up trigger

- Past £30k MRR → take a serious look at hiring a Chief of Staff or stepping up to Aiprosol Starter plan ($997/mo). The complexity of YOU as a single point of failure exceeds what Make/Zapier can paper over.

---

# §6 · The 15-person manufacturing SMB

**Shape:** physical goods, 8-50 employees, factory + warehouse + small admin team.

### The stack

| Layer | Tool | Monthly cost |
|---|---|---|
| LLM | Claude API + Vision | £200 |
| Workflow | Make Pro | £18 |
| ERP | Existing (Xero / SAP Business One) | (existing) |
| Vision QC | Custom on AWS Rekognition or Roboflow | £200-500 |
| Predictive maintenance | Tulip or custom | £400-1,000 |
| Customer comms | Front | £80 |
| **Total** | | **~£900-1,800/mo** |

### The 5 automations

1. **Vision QC on production line** (defect detection at 99%+ accuracy)
2. **Inventory reorder triggering** (forecast + auto-PO drafts)
3. **Customer order acknowledgement automation**
4. **Quality complaint → root-cause classifier + RCA template auto-draft**
5. **Daily production report from line data → Slack digest**

---

# §7 · The 10-person real estate brand

| Layer | Tool | Monthly cost |
|---|---|---|
| LLM | Claude API | £100 |
| Workflow | Make Pro | £18 |
| CRM | LionDesk or Hubspot Free | £0-30 |
| Voice agent (inbound) | Bland.ai | £200 |
| Listing portal | Rightmove + OnTheMarket integrations | (per portal) |
| Tour booking | Cal.com | £0 |
| Drone / property media | Matterport | £80 |
| **Total** | | **~£500-700/mo + portal fees** |

### The 5 automations

1. **Inbound enquiry → instant AI qualifier on call** (Bland.ai answering before a human picks up)
2. **Lead → property match → personalised listings email**
3. **Viewing booked → reminder day before + AI-drafted post-viewing follow-up**
4. **Vendor weekly update auto-compiled** from market activity + viewing count
5. **Offer → contract → automated handover to solicitor**

---

# §8 · The 25-person healthcare ops team

**Shape:** clinic, telehealth provider, or medical-services SMB. Heavy on patient intake + records + compliance.

### The stack — HIPAA / NHS-compliant

| Layer | Tool | Monthly cost |
|---|---|---|
| LLM | Claude on AWS Bedrock (HIPAA) | £300 |
| Workflow | n8n self-hosted (no third-party data exposure) | £40 |
| EHR | (existing — Epic / Athenahealth / SystemOne) | (existing) |
| Patient comms | Klara or Spruce | £150-400 |
| Voice agent | Hippocratic AI or in-house | £400+ |
| BI | Power BI with healthcare connectors | £140 |
| **Total** | | **~£1,000-1,500/mo** |

### Critical compliance notes

- All AI processing of patient data through HIPAA-eligible / NHS-DSP-certified vendors only
- BAA signed with every vendor processing PHI
- Audit log retention 7 years minimum
- No patient data through general-purpose ChatGPT / Claude.ai consumer tier

### The 5 automations

1. **Patient intake form → triage + appointment slot proposal** (no PHI sent to non-HIPAA AI)
2. **Insurance verification** (auto-poll payor APIs, flag mismatches)
3. **Appointment reminder cascade** (24h, 2h, 30min — reduces no-shows 60-80%)
4. **Clinical note auto-draft from session recording** (HIPAA-compliant transcription only)
5. **Claims status digest** (daily, not real-time, to staff)

---

# Cross-stack: integration patterns

Every stack uses some version of these connection patterns:

### Pattern A — CRM as the source of truth

All customer data flows through the CRM. Other tools READ from it, write summaries back. Avoid the trap of "CRM has half the data, Notion has the other half, nobody knows where to look."

### Pattern B — Workflow runner as the orchestrator

Make / Zapier / n8n is your central "glue." Avoid hard-coded API calls between tools — always route through the orchestrator so you have one place to debug.

### Pattern C — LLM as a service, not a tool

Don't pick "ChatGPT" or "Claude" — pick API access. Then you can swap models without re-architecting. Best practice: an internal proxy that routes requests to the right model based on task type.

### Pattern D — Single dashboard

One Notion page or Power BI dashboard pulling from all sources. Three things visible above the fold: revenue this week, active customers, pipeline value. Everything else is one click down.

---

# Cost forecasting — the formula

For any stack, model the cost as:

```
fixed_monthly + (variable_per_request × requests_per_month)

where:
  fixed_monthly = sum of seat-licensed tools
  variable_per_request = LLM API cost + workflow runner per-op cost
  requests_per_month = automated transactions × steps per transaction
```

For a 10-person services firm running 1,000 automated transactions/month at 3 steps each (3,000 ops):

- Make Pro: £18 (10k ops included)
- LLM: 1,000 × $0.005 = £4
- Total: £22 + your seat-licensed tools (£200-400)

So **roughly £250-400/month for a 10-person firm fully automated**. This holds for ~95% of SMBs we've worked with.

---

# Migration order — recommended

If you're starting from zero, build in this order:

1. **Pick the foundation LLM and the workflow runner.** Standardise. Don't add anything else until these are running.
2. **CRM as source of truth.** Get every existing customer record into one CRM. De-dupe.
3. **First automation: lead capture → CRM record.** Foundation that everything else builds on.
4. **Second automation: support / customer email triage.** Highest immediate time saving.
5. **Third automation: weekly metrics digest.** Forces visibility.
6. From here, follow the stack-specific automation list for your shape.

---

# What to avoid

- **Buying tools you don't have a plan to use.** Common mistake: subscribing to 4 AI tools "to try" → forget to cancel → £300/mo bleed.
- **Building automations before processes.** If the manual process is broken, automating it makes it broken faster.
- **Over-fitting the stack to a single use case.** Each tool should serve at least 2-3 use cases.
- **Skipping the dashboard.** A stack you can't see is a stack you can't trust.

---

## Licensing

Licensed for unlimited internal use. Stack templates may be implemented within the purchaser's organisation. Resale or republication of the stack designs requires written permission. © 2026 Aiprosol Ltd.
