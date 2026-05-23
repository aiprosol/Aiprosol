# The Aiprosol Workflow Automation Playbook

**The strategic and tactical guide to designing, building, and running automated workflows in any business. Principles, patterns, anti-patterns, and 25 production-grade workflow templates.**

Version 1.0 · 2026 · © Aiprosol Ltd

---

## Why this playbook exists

Most automation guides are one of two kinds:

1. **Tool-centric:** "Here's how to use Zapier." Useful for Day 1, useless when your needs grow past the tool's idioms.
2. **Hype-centric:** "AI will run your business." Inspiring, but won't help you build a working invoice-routing workflow on Tuesday.

This is the third kind: a **principles + patterns + templates** playbook for operators. We start with how to think about workflow design, give you the patterns that work in practice, name the patterns that fail, and end with 25 templates you can implement directly.

The audience: ops leaders, COOs, founders, automation engineers running 10-200-person businesses.

---

## Part 1 · Principles (the non-negotiable rules)

### Principle 1 — **A workflow has one job**

The single most common mistake: building one mega-workflow that "handles everything for new leads." It triggers on form submission, validates the email, looks up the company, scores the lead, drafts an email, books a call, creates a CRM record, posts to Slack, generates a brief, sends Slack DM to the rep, updates a Google Sheet.

When that workflow breaks (and it will), you don't know why. Was it the form? The validation? The CRM? The Slack message?

**Rule:** every workflow does ONE thing. If you need to do five things, build five workflows that hand off via webhooks or shared state.

### Principle 2 — **Every workflow has an observable success state**

A workflow you can't tell is working ≠ a workflow that's working. Every workflow needs:

- A way to see **the last 24 hours of runs** (success/failure/skip)
- A way to see **what triggered each run**
- A way to see **what each step output**

Make and n8n give you this for free. Zapier hides it behind upgrade tiers. Pay for it.

### Principle 3 — **Failure is data**

When a step fails, the workflow should:

1. Retry with backoff (3 attempts at 30s/2min/10min)
2. If still failing → post to a `#automations-errors` Slack channel with the input data
3. Continue if possible, OR halt and flag for human review

Workflows that silently fail are worse than no workflow at all — you build false confidence in a system that doesn't actually work.

### Principle 4 — **Idempotency is required**

Run the same workflow twice with the same input → exactly the same outcome. Build for retries, build for "what if this fires twice from a webhook glitch."

How: include a `unique_id` field in your trigger data. Every destination action checks "have I seen this id?" before acting. Most CRMs / databases support upsert (insert-or-update) operations. Use them.

### Principle 5 — **Humans in the loop until you trust it**

Every new automation goes through three phases:

- **Phase 1 (week 1-2):** Output → human review → human action
- **Phase 2 (week 3-4):** Output → human review → automatic action (human can intercept)
- **Phase 3 (month 2+):** Fully automatic, human only sees errors

Skipping straight to Phase 3 is how organisations end up with embarrassing AI-generated emails sent to customers.

### Principle 6 — **The data shape is the contract**

The hardest debugging session of your career is when a workflow worked yesterday and broke today because an upstream tool changed its JSON shape.

Mitigation: use a **schema validation step** early in every workflow. Reject inputs that don't match. Log what was rejected. This catches breaking changes before they cascade.

Example in Make: a `JSON parse + filter` step that requires specific field names, types, and value ranges before allowing the rest of the workflow to run.

### Principle 7 — **Workflow cost is real cost**

A workflow you build "free" today on Make's free tier will become $X/month at scale. Model the cost up front:

```
runs_per_month × ops_per_run × $/op + ai_runs × $/ai_call = monthly_cost
```

A workflow that does 3 ops per run, runs 5,000 times/month, costs ~$15 on Make Pro. Add 1 OpenAI step per run at $0.005 = $25 more. = $40/month for one workflow.

If the workflow saves 10 hrs/wk of operator time at $50/hr loaded cost → $2,167/month. ROI = 54×. But run that math before you build.

---

## Part 2 · The 7 patterns that work

These are the 7 architectural patterns Aiprosol uses to compose workflows. Memorise them; everything else is variation.

### Pattern 1 — Linear pipeline

```
trigger → validate → enrich → process → store → notify
```

The workhorse. ~70% of business workflows are this shape. Examples: form submission → CRM record. Stripe payment → revenue logger. Email → categorised filing.

### Pattern 2 — Branching by classifier

```
trigger → AI classifier → router → [branch A | branch B | branch C]
```

When the same trigger needs different handling. Inbound email is the canonical example: classify into sales / support / billing / vendor → route to the right downstream workflow.

Critical: the classifier's accuracy determines the workflow's value. Validate classification accuracy on a sample of 50+ real examples before going live.

### Pattern 3 — Fan-out

```
trigger → [parallel: action A · action B · action C] → aggregator → notify
```

When one event needs to trigger several independent actions. New customer signs up → simultaneously: provision their account, send welcome email, post to team channel, create project workspace, schedule kickoff. Aggregator collects results to confirm everything completed.

### Pattern 4 — Scheduled aggregation

```
schedule (e.g., daily 8am) → query multiple sources → aggregate → format → distribute
```

The "weekly business review" pattern. Pulls from Stripe + HubSpot + Slack + GA4 → assembles a single report → emails it.

### Pattern 5 — Polling-with-state

```
schedule → query "what's new since {last_run}" → process new items → save {last_run}
```

When the source doesn't have a webhook (or webhooks are unreliable). You poll on a schedule, track what you've already seen via a state store (Google Sheet, Make Data Store, simple DB), only act on new items.

### Pattern 6 — Approval gate

```
trigger → AI draft → human approval (Slack button / Notion review) → execute on approval
```

For workflows where automatic action is too risky. AI drafts the email / contract / report → posts to Slack with `Approve` / `Edit` / `Reject` buttons → only sends when approved.

### Pattern 7 — Long-running orchestrator

```
trigger (e.g., contract signed) → schedule N delayed actions over weeks/months
```

Customer onboarding. Day 0: welcome email. Day 1: kickoff scheduling. Day 7: first deliverable. Day 30: check-in. Day 90: NPS request. Each scheduled action is its own workflow that runs at the right time.

Make handles this via the "Sleep" module + state in a Google Sheet. Don't actually use Make's sleep for >24hr — it's wasteful. Better: schedule a future job using Google Calendar or a cron-style scheduler.

---

## Part 3 · The 5 anti-patterns to never use

### Anti-pattern 1 — "Stack of band-aids"

Three different tools doing the same job because each was added when the previous one frustrated you. Standardise. Pick ONE workflow tool as primary, ONE LLM as primary. Migrate the others.

### Anti-pattern 2 — "The mystery monolith"

A 30-step workflow nobody fully understands. When it breaks, nobody can debug. Refactor into 5-10 step workflows that hand off cleanly.

### Anti-pattern 3 — "Set and forget"

A workflow that ran for 18 months, you never looked at it. Now it has 12% silent failure rate, your CRM has 8,000 duplicate records. Fix: every workflow has a weekly health check (auto-generated: "Workflow X ran 312 times this week, 3 failures, average duration 4.2s, estimated cost $11").

### Anti-pattern 4 — "AI as the trigger"

Using an LLM as the FIRST step in a workflow. Don't. LLMs are slow, non-deterministic, and expensive. Use a deterministic trigger (webhook, schedule, form submission), THEN use the LLM for classification or content generation in the middle.

### Anti-pattern 5 — "Silent automation"

Automations the rest of the team doesn't know exist. When you go on holiday, the team can't troubleshoot. Solution: a single shared spreadsheet listing every automation with what it does, its trigger, its owner, where the source-of-truth config lives.

---

## Part 4 · 25 production-grade templates

Each template is documented with: trigger, steps, expected output, failure modes, recommended phase 1-3 progression.

### Templates 1-5 · Sales

1. **Inbound lead → CRM + lead score + Slack** *(Pattern 1)*
2. **Discovery-call recording → action items + draft proposal** *(Pattern 1 + AI)*
3. **Stale-deal radar** *(Pattern 4)*
4. **Pipeline review prep auto-doc** *(Pattern 4)*
5. **Deal stage change → next-step email draft** *(Pattern 1)*

### Templates 6-10 · Customer success

6. **Welcome packet (60-second send)** *(Pattern 3 — fan-out)*
7. **Onboarding milestone tracker** *(Pattern 7 — long-running)*
8. **At-risk early-warning** *(Pattern 4)*
9. **QBR auto-draft from usage data** *(Pattern 4)*
10. **NPS detractor recovery loop** *(Pattern 2 — classify response)*

### Templates 11-15 · Operations

11. **Slack daily summariser** *(Pattern 4)*
12. **Meeting → action items extraction** *(Pattern 1 + AI)*
13. **Vendor renewal radar** *(Pattern 4)*
14. **Document filing auto-router** *(Pattern 2)*
15. **Team standup async aggregator** *(Pattern 4)*

### Templates 16-20 · Documents & finance

16. **Invoice OCR → accounting** *(Pattern 1 + vision)*
17. **Receipt photo → categorised expense** *(Pattern 1 + vision)*
18. **Contract redline assistant** *(Pattern 6 — approval gate)*
19. **Tax document auto-collator** *(Pattern 4)*
20. **Cash position daily snapshot** *(Pattern 4)*

### Templates 21-25 · Marketing & content

21. **Inbound customer question → blog idea** *(Pattern 4)*
22. **Competitor changelog monitor** *(Pattern 5 — polling)*
23. **Cross-channel content distribution** *(Pattern 3 — fan-out)*
24. **SEO auto-audit weekly** *(Pattern 4)*
25. **User-generated content sentiment digest** *(Pattern 4 + AI)*

> **For each template:** the playbook (full PDF) includes the Make scenario JSON export, the OpenAI prompts used, and the failure-mode runbook. Pages 28-94.

---

## Part 5 · The migration map (existing workflow → automated workflow)

If you already have manual processes and want to automate them, the order is:

1. **Document the manual process** — write what happens today, step by step, by whom, when
2. **Find the automation candidates** — steps that are predictable + recurring + bounded
3. **Build the AI-as-suggestion version first** — automate the work but keep human approval
4. **Measure for 2 weeks** — quality, edge cases, false positives
5. **Move to AI-as-action** — remove the human-in-the-loop where confidence is high
6. **Keep humans in for** — edge cases, escalations, anything customer-facing where tone is critical

---

## Part 6 · The "build vs. buy vs. service" decision framework

For any automation, ask:

| If true... | Then... |
|---|---|
| The pattern is generic + stable + commodity | **Buy** an off-the-shelf tool (e.g., Cal.com for booking) |
| The pattern is specific to your business + bounded | **Build** with Make/Zapier/n8n |
| The pattern requires deep integration + scale + audit | **Service** (hire Aiprosol or equivalent) |

The mistake: trying to build something that should be bought, OR buying something that needs to be built. Roughly: tools cover the bottom 60% of needs, custom workflows the next 30%, services the top 10%.

---

## Part 7 · How to know your automation portfolio is healthy

Quarterly review questions:

1. How many automations do we have? (If you can't say, that's the answer.)
2. How many ran successfully last week? (Should be > 95%.)
3. How many hours/week are we estimated to be saving? (Re-measure quarterly.)
4. How many cost more than they save? (Should be 0.)
5. How many would survive your departure? (If <80%, document NOW.)
6. What's the next one to build? (Always have an answer.)

---

## Part 8 · Common debugging patterns

When something breaks, work through in this order:

1. **Trigger side:** did the upstream actually fire? Check source's event log.
2. **Auth/permission:** silent OAuth expiry is the #1 hidden killer. Re-auth the connection.
3. **Data shape:** did the upstream change its JSON? Add a schema validation step.
4. **Rate limit:** Slack 1 msg/sec, Twitter 50/15min, etc. Add backoff.
5. **AI step output format:** if you expected JSON and got prose, your prompt is loose. Tighten with `Return only valid JSON in the format {…}, no commentary.`
6. **Destination side:** did the destination accept it? Look at the destination tool's recent log.

If still stuck, post the workflow URL + what it should do + what it does to `hello@aiprosol.com` — we have a 7-day post-purchase free debugging policy.

---

## Licensing

Licensed for unlimited internal use within the purchaser's organisation. Resale, republication, or use as derivative training material requires written permission. © 2026 Aiprosol Ltd.
