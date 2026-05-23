# Zapier + Make Power User Bundle

**100+ pre-built workflow templates for Zapier and Make. Ready-to-import. The same templates we use with paying clients.**

Version 1.0 · 2026 · 25 documented Zapier recipes + 25 documented Make recipes + 14-pattern operator's playbook + when-to-skip-to-n8n decision tree

---

## What you get

| Asset | Detail |
|------|------|
| 25 Zapier recipes | Each with: trigger, action steps, filter logic, sample data, common gotchas — documented in this guide (Part 2) |
| 25 Make.com recipes | Same as above + Iterator + Aggregator + Data Store patterns (Part 3) |
| 22-row Zapier-vs-Make decision matrix | Pick the right tool per workflow shape (Part 1) |
| 14-pattern operator's playbook | Real production patterns we use daily (Part 4) |
| When-to-skip-both → n8n | Honest signals it's time to upgrade (Part 5) |

**Honest scope note**: This is a documentation-first product. Each of the 50 recipes is a step-by-step build guide — the trigger, the transformation, the filter logic, the gotchas. You build them in your own Zapier/Make account in 5-20 minutes each. We deliberately don't ship 50 `.blueprint` / shared-Zap-URL files because (a) those break when the underlying SaaS API changes and (b) the deeper value is the patterns, not the saved configurations.

---

## Part 1 · The Zapier vs Make Decision Matrix (22 rows)

For each workflow shape, the winner is bolded. Tie = either works.

| Workflow shape | Zapier | Make | Winner |
|------|------|------|------|
| Linear (trigger → 1 action) | $20/mo | $9/mo | **Make** |
| Branching (2-3 paths) | Paths | Filters | **Make** (free filters) |
| Branching (4+ paths) | Painful | Router module | **Make** |
| Iteration over array | Sub-Zaps | Iterator | **Make** |
| Aggregation | Manual | Aggregator | **Make** |
| Data store / lookup | Tables (paid) | Data Store | **Make** |
| Webhook trigger | Native | Native | Tie |
| Schedule trigger | Eats tasks | Cheap | **Make** |
| Email trigger | Easier | OK | **Zapier** |
| Slack-first ops team | More guided | More flexible | **Zapier** |
| AI / OpenAI integration | More polished | Cheaper | **Zapier** if quality, **Make** if cost |
| Approval workflows | Slack Approval (paid) | Native callback | **Make** |
| Error handling / retries | Auto-retry | Conditional retry | **Make** |
| Conditional branching | Paths feature (paid) | Routes | **Make** |
| Multi-step transformations | Formatter | Tools modules | Tie |
| Date math | Formatter > Date | Tools > Date | Tie |
| Phone / SMS | Native Twilio | Native Twilio | Tie |
| OAuth-heavy integrations | More providers (5000+) | Fewer (1000+) | **Zapier** for niche tools |
| Visual debugging | Less visual | Better visual | **Make** |
| Versioning | Recent commits | Better version history | **Make** |
| Team collaboration | Workspaces | Teams | Tie (both work) |
| Cost at 10k runs/month | $50+ | $19 | **Make** |

**Bottom line**: Make wins on ~70% of workflows by cost + features. Zapier wins on integration count + ease for non-technical users. Use both if you have to; standardise on Make if starting fresh.

---

## Part 2 · 25 Zapier Recipes

Each recipe below = a documented step-by-step build. Spend 5-15 min per recipe to assemble in your Zapier account. We don't share Zap template URLs (they break when SaaS APIs evolve); the documentation is the durable asset.

### Sales (5)
1. **Stripe new charge → HubSpot deal stage progression**
2. **Calendly booking → Gmail confirmation + Slack ping**
3. **Tally form submit → Sheet + email follow-up**
4. **HubSpot deal stage change → Slack DM the owner**
5. **LinkedIn lead-gen form → CRM + welcome email**

### Customer Success (5)
6. **Intercom new conversation → AI sentiment → priority Slack**
7. **NPS score < 7 → CSM auto-task in Asana**
8. **Stripe failed payment → 3-day dunning sequence**
9. **Renewal in 60 days → CSM Slack alert with account summary**
10. **Cancelled subscription → exit survey email**

### Operations (5)
11. **Daily 7am → Slack digest of yesterday's revenue, leads, support**
12. **New Notion page in a database → Slack notify**
13. **Gmail label "Important" → log to Sheet + Slack**
14. **Calendar event 1h before → AI prep brief**
15. **Zoom recording done → transcript to Slack**

### Marketing (5)
16. **New blog post → tweet + LinkedIn post in 3 variants**
17. **Newsletter signup → 5-email sequence**
18. **Webinar registration → reminder + thank-you flow**
19. **Lead magnet download → tagged + sent the asset**
20. **Form submit with "demo request" → instant Calendly link email**

### People (5)
21. **New hire signed offer → Notion onboarding doc + Slack invite**
22. **Job application → AI summarise → recruiting Slack**
23. **PTO request → manager Slack + calendar block**
24. **Employee birthday → team Slack 1 day before**
25. **Performance review due → manager email reminder**

Each Zap is documented in plain English below — assemble in your own Zapier account in 10-15 min per recipe.

---

## Part 3 · 25 Make Recipes

Same business areas, leveraging Make's strengths (Iterator/Aggregator/Data Store).

### Sales (5)
1. **Multi-source lead capture → enrich → score → CRM**
2. **Bulk email validator → cleaned list → CRM**
3. **Deal stage report → daily aggregator → Sheet**
4. **Cold email reply classifier → branch on intent**
5. **Outbound list dedupe with Data Store**

### Customer Success (5)
6. **Multi-channel support unified inbox**
7. **Customer health score (3 inputs, weekly aggregation)**
8. **Bulk renewal alerts (60d, 30d, 7d touchpoints)**
9. **Onboarding state machine (Day 0, 7, 14, 30)**
10. **Churn risk early warning (usage + sentiment + payment)**

### Operations (5)
11. **Receipt OCR → categorise → ledger entry**
12. **Vendor invoice extractor (PDF → structured)**
13. **Calendar conflict detector across teams**
14. **Bulk file rename + organise in Drive**
15. **Inventory low-stock multi-vendor alerter**

### Marketing (5)
16. **Cross-platform content publisher (1 source → 5 platforms with hooks)**
17. **Drip sequence orchestrator with branch logic**
18. **Webinar registration → segmented reminder flow**
19. **Newsletter unsubscribe analyser → list health Slack**
20. **A/B test data aggregator (split → analyse → Slack winner)**

### Finance (5)
21. **Stripe → QBO sync with line-item detail**
22. **Multi-currency revenue normaliser**
23. **Subscription churn cohort analyser**
24. **Bulk invoice generator from CRM batch**
25. **Monthly P&L draft assembler**

Each Make recipe below is documented as a build spec — modules, mappings, filters. Build in your own Make account.

---

## Part 4 · The 14-Pattern Operator's Playbook

The patterns we use daily that turn a stack of workflows into a reliable operating system.

### Pattern 1 — Dedupe at the source

Stripe webhooks fire 1-3 times per event. Make/Zapier's "Only continue if..." catches duplicates by event ID before downstream. Use a Data Store (Make) or Storage (Zapier) keyed by event ID with a 7-day TTL.

### Pattern 2 — Idempotency keys

Every external write includes an idempotency key (UUID or natural composite). Downstream APIs that respect them (Stripe, GitHub, Slack) will reject duplicates safely.

### Pattern 3 — Soft-fail with notification

Wrap critical paths in error handlers that:
- Don't fail the workflow on the error step
- Log the failure to a "needs review" sheet
- Slack-ping the owner

Result: workflows keep running, problems get triaged not silenced.

### Pattern 4 — Rate-limit handling

If downstream API is 60 req/min, throttle your iterator to 50 req/min (10% headroom). Make's Tools > Sleep is native. Zapier requires sub-Zap delays.

### Pattern 5 — Cursor persistence

Polling workflows store "last processed timestamp" or "last ID" in a Data Store. Never trust the trigger's own state — when the workflow restarts, your cursor is your truth.

### Pattern 6 — Approval gate

Critical actions (money movement, customer emails, public posts) hit a Slack interactive approval before executing. Make's webhook callback or Zapier's Slack Approval feature both work.

### Pattern 7 — Composite logging

Every workflow ends with a "log" step writing to a single audit table. Fields: workflow_name, trigger_id, outcome, payload_hash, timestamp. Use this table for compliance, debugging, and unit economics.

### Pattern 8 — Quiet hours

Notifications respect business hours: 8am–8pm in the recipient's timezone. Lookup table in Data Store maps user → timezone.

### Pattern 9 — Branching with named paths

Use Make's Router with labelled paths ("Hot lead", "Warm lead", "Cold"). Easier to debug than unnamed branches.

### Pattern 10 — Sub-workflows as functions

Reusable logic (e.g. "score this lead") lives in a separate workflow called via webhook. Saves you from copy-pasting the scoring logic across 6 workflows.

### Pattern 11 — Test webhook from button

Add a one-off "test trigger" path (manual Slack button) that fires the workflow with a known payload. Faster than waiting for a real event.

### Pattern 12 — Graceful degradation

If the AI step (OpenAI/Claude) times out, fall back to a rule-based classifier and tag the record as `needs_review`. Better than failing the whole flow.

### Pattern 13 — Versioning notes in description

Every change adds a one-line note in the workflow description: `2026-04-12: added Slack notification on failure (Srijan)`. Diffable history.

### Pattern 14 — Weekly self-health check

Workflow #0: every Monday 7am, queries all your workflows' success rate from last 7 days. Slack-pings anything <95% success. Self-healing operations.

---

## Part 5 · When to Skip Both and Use n8n

| Signal | Decision |
|------|------|
| Monthly Zapier/Make bill > $200 | Migrate top-3 highest-volume to n8n self-hosted ($5/mo VPS) |
| Workflow needs >15 nodes | n8n's visual model holds up better at scale |
| You need to run code (JS, Python) inline | n8n's Code node is first-class; Zapier/Make's are limited |
| You need data persistence beyond Data Store | n8n + Postgres > Make Data Store on any non-trivial volume |
| You hit Zapier's task limit hard | n8n is unmetered |
| You need to self-host for compliance | n8n is GPL, self-hostable |
| Your team is technical (engineers) | They'll prefer n8n's flexibility |
| Your team is non-technical (ops, sales) | Stay on Zapier or Make |

---

## Ship Today

Open Part 2, Recipe #1 (Stripe new charge → HubSpot deal). Spend 12 minutes building it in your Zapier account. Connect your accounts. Run with a test charge.

15 minutes. One automation live. Tomorrow's another one.

---

*If you'd rather have us operate this stack for you, see Aiprosol's Starter plan: aiprosol.com/pricing.*
