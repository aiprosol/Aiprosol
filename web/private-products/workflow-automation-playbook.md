# The Workflow Automation Playbook

**When to use Zapier vs Make vs n8n vs custom. The decision framework behind every Aiprosol architecture.**

Version 1.0 · 2026 · The full framework (this guide) + 10 importable n8n workflow starters covering the 7 core patterns

---

## How to use this playbook

Read once end-to-end (35 min). Bookmark the **Operator's Checklist** at the back. Refer to the **Pattern Library** every time you're about to build an automation.

Every section ends with a "Ship Today" cue — a concrete thing you can do inside 30 minutes.

---

## Part 1 · The 7 Core Patterns

Every automation in production at every company we've audited is one of these seven shapes — or a stack of them. Get fluent in the shapes and most "complicated" workflows resolve into 1-2 patterns chained together.

### Pattern 1 — Linear Pipeline

**Shape**: Trigger → Transform → Sink. No branches, no loops.

**Use when**: Single-source data needs single-destination delivery with light transformation.

**Real example**: Stripe charge.succeeded → format customer record → upsert into HubSpot. Six steps, no logic gates.

**Build in**: Zapier (10 min), Make (12 min), n8n (15 min). Cost-per-run differs by 4x; for high volume use n8n self-hosted.

**Gotchas**: 90% of "linear" requirements turn into branching within 60 days. Build with branching headroom — don't assume single-path forever.

### Pattern 2 — Branching Conditional

**Shape**: Trigger → Decision → Branch A | Branch B | Branch C → Sink.

**Use when**: Same trigger, different downstream actions based on payload state.

**Real example**: New lead arrives → score → if score ≥ 70 send to sales Slack + book Calendly; if 40–69 send to nurture sequence; if < 40 archive to "future" segment.

**Build in**: Make excels (visual filters), Zapier OK (Paths), n8n best for >5 branches (IF + Switch nodes).

**Gotchas**: Each branch is its own debugging surface. Test every branch with a real payload, not happy-path only.

### Pattern 3 — Fan-Out (1-to-Many)

**Shape**: Trigger → Iterator → For each item: Action → Aggregate → Sink.

**Use when**: A single event spawns N downstream actions where N varies.

**Real example**: New invoice with line items → for each line item, post to accounting GL; aggregate posted entries; alert if any failed.

**Build in**: Make's Iterator+Aggregator pair (native). n8n's Split In Batches + Merge. Zapier requires Sub-Zaps for >100 items.

**Gotchas**: Rate limits hit hardest here. If downstream API is 60 req/min and you're iterating 500 items, you need a queue, not a fan-out.

### Pattern 4 — Scheduled Sweep

**Shape**: Cron → Query batch → For each row: process → Mark complete.

**Use when**: You don't have a real-time trigger; you poll for "new since last sweep."

**Real example**: Every 15 min: query Postgres for tickets with status='new', dispatch each to AI classifier, update status='classified'.

**Build in**: n8n (best — Cron node + DB nodes), Make (works but pricey on high frequency), Zapier (last resort — schedule trigger eats tasks).

**Gotchas**: The "since last sweep" cursor is where everything goes wrong. Store the cursor in your DB or in a key-value table inside the workflow tool; never trust the trigger's own state.

### Pattern 5 — Polling Wrapper

**Shape**: Trigger or Cron → API call → Compare to last seen → Emit delta → Sink.

**Use when**: The upstream system has no webhook and no real-time API. You poll and diff.

**Real example**: Poll Google My Business reviews every hour. Diff against last seen ID. New review → classify sentiment → alert if negative.

**Build in**: Same as Scheduled Sweep, but the "diff" logic is the hard part. Persist last-seen IDs in a data store (Make Data Store, n8n key-value via Postgres).

**Gotchas**: Off-by-one on the cursor will either miss records or replay them forever. Test with synthetic backfills before production.

### Pattern 6 — Approval Gate (Human-in-the-loop)

**Shape**: Trigger → Compose → Pause → Wait for human approval → Branch on approve/reject.

**Use when**: AI outputs need human sign-off, or a workflow has financial/legal stakes.

**Real example**: AI drafts cold outreach email → Slack message with Approve/Edit/Reject buttons → on approve, send via Gmail; on edit, open editor; on reject, archive draft.

**Build in**: n8n (best — Wait node + Slack approval pattern), Make (works with custom webhook callback), Zapier (Slack Approval is paid + flaky).

**Gotchas**: How long do you wait? Add a 24h auto-archive so abandoned approvals don't pile up. Track approval rate as a KPI — if approvers are bulk-approving without reading, the gate is theatre.

### Pattern 7 — Long-Running State Machine

**Shape**: Multi-step process spread across days/weeks. Each step persists state and waits for either a time or an external event.

**Use when**: Onboarding flows, drip sequences, multi-day approval chains, lifecycle workflows.

**Real example**: 30-day customer onboarding. Day 0: welcome email. Day 3: check first-action; if no action send nudge. Day 7: schedule call. Day 14: pulse survey. Day 30: NPS request. State persists in your CRM or a dedicated table.

**Build in**: n8n with persisted state OR a dedicated tool (Customer.io, Userlist). Zapier "Delay Until" works for ≤7 day flows. Make's "Sleep" module similar.

**Gotchas**: If you build this in pure Zapier/Make, you lose visibility — you can't see "who's on day 12 of which sequence." Use a CRM stage or a workflow state table to keep auditable state.

---

## Part 2 · 5 Anti-Patterns

These break in production. Refuse to ship them.

### Anti-pattern 1 — Stack of band-aids

> 9 Zaps, each handling a tiny piece of a workflow that should be one flow.

**Symptom**: You can't draw the data path on a napkin in <60s.

**Fix**: Consolidate into a single workflow with branching. Saves 60-80% of your task quota.

### Anti-pattern 2 — Mystery monolith

> One workflow with 47 steps, no comments, no tests, owned by the founder.

**Symptom**: Nobody touches it because nobody understands it. When it breaks, the business stops.

**Fix**: Decompose into named sub-workflows. Add a README in the workflow's description field. Tag steps with intent comments.

### Anti-pattern 3 — Set-and-forget

> Built once 14 months ago. Nobody monitors it. Has been silently failing 12% of the time for 6 months.

**Symptom**: Customer churn or revenue leakage you can't explain.

**Fix**: Every production workflow needs:
1. A failed-run notification (Slack/email)
2. A weekly success-rate report
3. An owner of record (named human)

### Anti-pattern 4 — AI-as-trigger

> "When AI thinks the email is important, send it to Slack." Hallucination risk is now ops risk.

**Symptom**: False positives wake people up at 3am. False negatives lose deals.

**Fix**: AI classifies + scores. A rule-based threshold (not AI) decides the action. Always have a manual override.

### Anti-pattern 5 — Silent automation

> No logs, no audit trail, no way to answer "what did this workflow do at 2:47pm on Tuesday?"

**Symptom**: Customer asks "did you send X?" and you can't answer.

**Fix**: Log every meaningful action to a single table (Postgres, Airtable, Notion). Include workflow name, trigger ID, outcome, timestamp, payload hash.

---

## Part 3 · Tool Selection Framework

| Workflow shape | < 100 runs/day | 100 – 10k runs/day | > 10k runs/day |
|------|------|------|------|
| Linear pipeline | Zapier | Make | n8n self-hosted |
| Branching conditional | Make | Make or n8n | n8n |
| Fan-out (1-many) | Make | n8n | n8n |
| Scheduled sweep | n8n (cron is cheap) | n8n | n8n or custom |
| Polling wrapper | n8n | n8n | n8n |
| Approval gate | n8n | n8n | n8n |
| Long-running state machine | n8n + DB | Customer.io or dedicated tool | Dedicated tool |

**The rule of thumb**: under 100 runs/day, optimise for build speed (Zapier or Make). Above that, optimise for cost-per-run (n8n self-hosted). Above 100k runs/day, you're writing custom code; the orchestrator is just the dispatcher.

---

## Part 4 · The Operator's Checklist (23 questions)

Before shipping any workflow, every "yes" is required:

**Functional (6)**
1. Tested with at least 3 real-payload examples?
2. Tested with at least 1 malformed payload? (missing field, wrong type, empty)
3. Tested with rate-limit failure response from each downstream API?
4. Tested idempotency? (replay same trigger twice — does nothing duplicate?)
5. Tested with the bigger volume? (10x expected daily)
6. Does the workflow exit cleanly on every branch? (no orphan executions)

**Operational (8)**
7. Named owner of record documented in workflow description?
8. Failed-run notification configured (Slack / email)?
9. Workflow named clearly: `[area]-[trigger]-[primary-action]` (e.g. `sales-stripe-charge-to-hubspot`)?
10. Steps tagged with intent comments?
11. Versioned: previous version archived, not deleted?
12. Secrets stored in tool's credential manager (not pasted into URL/body)?
13. Rate limits documented (X req/min for each external API)?
14. Average + p95 runtime baselined for first week of production?

**Risk (5)**
15. What happens if the trigger fires 1000 times in 60 seconds? (DOS yourself, downstream blowup, runaway cost?)
16. What happens if the LLM step times out? (default action?)
17. What happens if the credential expires? (notification path?)
18. Personal data: where does it sit? GDPR/CCPA compliant?
19. Financial side-effects (charges, refunds): require approval gate?

**Cost (4)**
20. Cost-per-run × expected daily volume = monthly tool cost. Is that in budget?
21. LLM-token cost: same calc. Logged separately for finance.
22. Hidden costs: data-store reads/writes, API overages on the downstream side?
23. Build-vs-buy: would a $20/mo SaaS replace this entire workflow?

---

## Part 5 · Build vs Buy vs Service

Three decisions, in order:

1. **Build**: you (or a team member) construct + maintain the workflow in Zapier/Make/n8n yourself. Best for: stable processes, in-house expertise, low complexity.

2. **Buy**: a vertical SaaS already does this (Customer.io for nurture, Pipefy for approvals, Retool for internal tools). Best for: complex requirements, low in-house expertise, premium support needed.

3. **Service**: Aiprosol (or another consultancy) builds + operates it for you on a managed retainer. Best for: critical workflows, fast time-to-value, in-house team strapped.

**Default to Buy** for any workflow that's commodity (lead routing, NPS, scheduling). Build only where you genuinely need custom logic. Service when the workflow is critical AND you don't have an in-house specialist.

---

## Part 6 · Migration: Manual Process → Automated Workflow (6 steps)

1. **Document the manual flow.** Walk it. Time it. Note every tool touched. Note every decision made.
2. **Find the 80%-case.** What payload shape applies to 80% of work? Automate THAT first. Edge cases stay manual or get escalation rules.
3. **Build the happy path.** Trigger → Transform → Sink. Skip branching for v1.
4. **Add edge-case branches.** What payloads hit the 20%? Add a branch for each common one.
5. **Add observability.** Failure notifications. Weekly success-rate. An "I went looking and found X" report.
6. **Hand off.** Document. Train the human owner. Schedule a 30-day post-launch review.

---

## Part 7 · The 10 Importable n8n Workflow Starters

You'll find these in the `n8n-workflows/` folder. Each is a real, importable n8n v1 `.json` file. Each covers one of the 7 core patterns above so you can extend them yourself for your specific stack.

| File | Pattern | Area | What it does |
|------|------|------|------|
| `01-sales-stripe-charge-to-hubspot.json` | Linear pipeline | Sales | Stripe charge → HubSpot deal closed-won |
| `02-sales-calendly-ai-prep-brief.json` | Linear + AI | Sales | Calendly booking → Claude prep brief → email |
| `03-sales-form-score-route-slack.json` | Branching | Sales | Form submit → AI score → routed Slack ping (hot/warm/nurture) |
| `04-cs-support-ticket-ai-categorise.json` | Branching with AI | CS | Ticket → Claude classify → Slack channel routing |
| `05-ops-daily-kpi-digest.json` | Scheduled sweep | Ops | Cron 7am → pull KPIs → Slack digest |
| `06-finance-invoice-extract.json` | Polling + AI | Finance | Gmail invoice label → AI extract → Sheet ledger |
| `07-cs-nps-low-detractor-alert.json` | Branching | CS | NPS < 7 → CSM Slack alert |
| `08-sales-cold-reply-intent-classifier.json` | Branching with AI | Sales | Cold reply → AI intent → branch on interested/unsubscribe |
| `09-marketing-blog-cross-post.json` | Fan-out + AI | Marketing | Blog publish → AI drafts LinkedIn + Twitter → Notion review |
| `10-cs-onboarding-day-3-nudge.json` | Long-running state | CS | Welcome email → wait 3d → check action → nudge if needed |

### How to import

1. Open your n8n instance
2. Workflows → Import from File
3. Pick one of the `.json` files
4. Replace placeholder credentials (anything marked `REPLACE_ME`)
5. Activate

### Honest scope note

This is a **v1 starter library**. It demonstrates the 7 core patterns so you can build the workflows specific to your stack. We deliberately ship 10 carefully-built workflows, not 50 brittle ones — quality of pattern-demonstration matters more than count.

Folder index: `n8n-workflows/README.md`.

---

## Ship Today

Pick ONE workflow from the 25 above. Import it. Configure one credential. Replace one piece of hardcoded data with your own. Run it once with a test payload.

That's it. 30 minutes from now you have a working automation in production. Most operators stall here for weeks "planning the architecture." Don't.

---

*Aiprosol designs, builds, and operates the AI automation that reclaims 35+ hours a week for your team. If you'd rather not build any of this yourself, see our managed plans at aiprosol.com/pricing.*
