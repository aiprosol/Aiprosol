# Customer Onboarding Email Sequence — Day 0 through Day 90

**Owner:** Srijan Paudel
**Use:** Drop these into the CRM (HubSpot / Customer.io / Resend, wherever the send infra is) the moment customer #1 signs a managed plan. Pre-drafted so the first 90 days of customer experience are operator-grade from email #1.

**Important:** Every email below should be reviewed + sent by Srijan personally for customer #1. Once the cadence is calibrated against a real customer's response patterns, the sequence becomes Arora-driven (with continued human approval before send).

**Substitution conventions:**
- `{first_name}` — first name only
- `{company}` — their company name
- `{plan_tier}` — "Starter" / "Growth" / "Enterprise"
- `{audit_hours}` — hours/week they reported in the ROI Audit
- `{audit_savings}` — projected annual savings from the ROI Audit
- `{primary_pain}` — the one-line pain they wrote in the audit form
- `{kickoff_slot}` — Calendly link to book their kickoff call
- `{shared_workspace}` — the Slack channel / Notion page we set up

---

## Email 1 — Welcome (Day 0, within 15 min of payment)

**Subject:** You're in, {first_name} — here's the next 90 days

**From:** Srijan Paudel <srijanpaudelofficial@gmail.com>

**Body:**

{first_name},

You just bought the {plan_tier} plan. Thanks. The 90-day reclaim guarantee starts the moment your kickoff call wraps.

What happens in the next 24 hours:

1. **Today** — I'll personally review what you wrote in your ROI Audit. You said {primary_pain}. I want to make sure the right agent in our C-suite is paired with that. I'll send you the agent assignment within 24 hours of this email.

2. **Tomorrow** — you'll get an automated kickoff doc from my CCO agent that walks through what we need from you (credentials, access, success-criteria sign-off). It's structured so you should be able to complete it in under 30 minutes.

3. **This week** — you book your kickoff call here: {kickoff_slot} — pick a time in the next 5 business days. Tactical 45-minute call, no slides, just scope + access + the success-criteria sign-off.

I want to flag two things upfront:

**One** — you bought a service, but Aiprosol's operating model is mostly AI agents. The CCO agent is doing your onboarding. The CTO agent is reviewing your stack. I'm the human Chairman, and I'm in the loop for anything material — but the day-to-day operator you're working with is Arora (our AI CEO) and her team. Some customers love this; some find it weird at first. If you'd prefer more human touchpoints, just tell me and we'll adjust.

**Two** — the 90-day reclaim guarantee is real. {audit_hours} hours/week is the target. If we haven't freed up {audit_hours}+ hours/week within 90 days of go-live, we work for free until we do. Mark this email so you can hold us to it.

Reply directly to this email with any questions. I personally read every reply.

— Srijan
Founder & Chairman, Aiprosol
[aiprosol.com](https://aiprosol.com) · [@srijanpaudel6](https://x.com/srijanpaudel6)

---

## Email 2 — Kickoff doc (Day 1, automated from CCO)

**Subject:** Aiprosol kickoff — your {plan_tier} plan setup doc

**From:** Aiprosol CCO <srijanpaudelofficial@gmail.com>

**Body:**

{first_name},

Welcome again. This is your kickoff doc. It's the same structure we use with every {plan_tier} plan engagement. Complete it before your kickoff call — most teams take 25-35 minutes.

**Step 1 — Confirm scope**

Based on your ROI Audit, the primary workflow we'll automate first is:

> *{primary_pain}*

Reply yes / no / tweak — and if tweak, write the corrected version. This is the only piece we need before the kickoff call.

**Step 2 — Stack access**

We'll need read + write access to (whichever apply):

- [ ] Your CRM (HubSpot / Pipedrive / Salesforce / Attio / Close)
- [ ] Your email (Gmail / Outlook — read for thread context, send-as for replies)
- [ ] Your calendar (Cal.com / Calendly / Google Calendar)
- [ ] Your communications (Slack / Teams workspace)
- [ ] Your payments (Stripe — read for revenue context)
- [ ] Your support (Plain / Intercom / Help Scout / Zendesk)
- [ ] Your data warehouse / analytics (PostHog / Mixpanel / Snowflake — read)

We use the principle of least privilege. We can also work with scoped read-only access and have a human approve every write — slower but appropriate for regulated industries.

**Step 3 — Success criteria sign-off**

In your own words: what would make you say at Day 90 that this engagement worked?

(Don't write "more leads" or "more revenue" — write something we can measure. "37 hours/week reclaimed across my team", "first-response time under 3 minutes on inbound", "support ticket deflection above 50%". Specific is better than ambitious.)

**Step 4 — Kickoff call**

Book your slot here: {kickoff_slot} — 45 minutes, video, this week.

**Step 5 — Shared workspace**

We've set up a private Slack channel for your engagement: {shared_workspace}

Join it now. Every agent run that touches your account will post a digest there. You'll always know what we're doing.

That's it. Reply to this email with any questions.

— The CCO
*(an AI agent in Aiprosol's C-suite. Reviewed by Srijan Paudel before sending.)*

---

## Email 3 — Week 1 check-in (Day 7)

**Subject:** Week 1 — what's running, what's next

**From:** Srijan Paudel <srijanpaudelofficial@gmail.com>

**Body:**

{first_name},

Week 1 status:

**What's running for you:**

- ✓ [List the 1-3 workflows that went live this week. Be specific. "Stripe charge → HubSpot deal closed-won, running since Tuesday — 12 deals progressed."]
- ✓ [Same for workflow #2 if applicable]

**What we caught in the first week:**

[1-2 sentences on something we learned from your data that you didn't know. This is the value flag — the customer should feel like the engagement is paying for itself by the end of week 1.]

**What's next (Week 2):**

[Concrete next deliverables, ranked. Usually: "build out the second workflow", "calibrate the agent's voice against 50 of your historical emails", "set up the dashboard so you can see daily KPIs".]

**Anything that needs your input:**

[List the 1-2 things blocked on the customer. Be polite, be specific. "We need you to confirm whether overdue invoices >30 days should auto-pause service or just alert."]

Hit reply anytime. The Slack channel is faster for tactical questions; this email is for "let's reconsider X" questions.

— Srijan

---

## Email 4 — First-30 review (Day 30)

**Subject:** Your 30-day review — {audit_hours} hrs/week target check-in

**From:** Srijan Paudel <srijanpaudelofficial@gmail.com>

**Body:**

{first_name},

30 days in. Here's where we are vs the {audit_hours} hours/week target.

**Hours/week reclaimed this week (week 4):** [N hours]
**Average across weeks 1-4:** [N hours/week]
**Pace toward 90-day target ({audit_hours} hrs/wk):** [On track / Behind / Ahead]

Specifically, the time savings broke down as:

- [Workflow 1]: ~[N] hours/week
- [Workflow 2]: ~[N] hours/week
- [Other gains we caught (deflected support tickets, removed manual data entry, etc.)]: ~[N] hours/week

**What's working:**

[1-2 sentences on what's clicking. Be specific and use the customer's data, not generic platitudes.]

**What needs adjustment:**

[1-2 sentences on what's slower than expected and what we're doing about it. Be honest. Customers reward honesty here.]

**What's queued for the next 30 days:**

- [Concrete deliverable 1]
- [Concrete deliverable 2]
- [Concrete deliverable 3]

If you'd like a 30-min call to walk through any of this, book here: {kickoff_slot}. Otherwise, business as usual.

— Srijan

P.S. The agents have learned your brand voice now. Customer-facing drafts (cold replies, support responses) are reading much closer to your tone than they were week 1. You can spot-check in the Slack channel.

---

## Email 5 — Mid-point ROI snapshot (Day 45)

**Subject:** Halfway — {audit_savings} projection vs reality

**From:** Aiprosol Data + Analytics <srijanpaudelofficial@gmail.com>

**Body:**

{first_name},

Halfway through your {plan_tier} engagement. This is an automated snapshot from our DA (Data + Analytics) agent. Numbers are pulled directly from your shared analytics / billing / CRM.

**Hours/week reclaimed (current run rate):** [N hours]
**Annualised savings (extrapolated):** ${N}
**vs ROI Audit projection (${audit_savings}/year):** [+/-X%]

**Top three workflows by hours-saved contribution:**

| # | Workflow | Hours/week | Annualised savings |
|---|---|---|---|
| 1 | [name] | [N] | ${N} |
| 2 | [name] | [N] | ${N} |
| 3 | [name] | [N] | ${N} |

**Anomalies the agent flagged (for your awareness):**

- [Anything unusual the data shows. Could be positive (workflow X is performing 2× projection) or worth investigating (workflow Y is throttled by a manual review step that's blocked).]

**What this means for the 90-day reclaim guarantee:**

[One-paragraph honest assessment. If on track to hit/exceed the guarantee, say so. If at risk, say so AND what we're changing this week to fix the gap. The reclaim guarantee is the floor, not the ceiling — most customers exceed it.]

— The DA agent
*(an AI agent in Aiprosol's C-suite. Reviewed by Srijan Paudel before sending.)*

---

## Email 6 — 60-day pulse (Day 60)

**Subject:** 60-day pulse — anything we're missing?

**From:** Srijan Paudel <srijanpaudelofficial@gmail.com>

**Body:**

{first_name},

Sixty days in. Three quick things:

**1. NPS.** On a scale of 0-10, how likely are you to recommend Aiprosol to a peer? Reply with just a number — that's all I need.

**2. The thing you'd change.** What's the one piece of how we operate (the agent dispatch, the email cadence, the response time, the way drafts are reviewed) that you'd change if you could? Brief is fine.

**3. What's next on your roadmap that AI automation could touch?** We're 30 days from the 90-day reclaim milestone. If there's a Q3/Q4 initiative where you've been thinking "we'd automate this if we had the headcount" — tell me. We'll scope it before the contract anniversary.

I read every reply personally.

— Srijan

P.S. I'm at [X / LinkedIn / Calendly] if you want a no-agenda 15-min call — sometimes those reveal more than email surveys.

---

## Email 7 — 90-day reclaim audit (Day 90)

**Subject:** 90-day reclaim audit — {audit_hours} hrs target

**From:** Srijan Paudel <srijanpaudelofficial@gmail.com>

**Body:**

{first_name},

We're at Day 90. Time for the reclaim guarantee accounting.

**Target you signed up for:** {audit_hours}+ hours/week reclaimed across your team
**Actual (averaged across the last 4 weeks):** [N hours/week]
**Annual savings, extrapolated:** ${N} (vs the ${audit_savings} projection from your ROI Audit)
**Guarantee status:** [Met / Missed / Exceeded]

[Pick one of three paragraphs below based on outcome.]

**(If MET or EXCEEDED):**
We hit it. The {audit_hours}-hour reclaim was the floor; you're currently at [N]/week and our analysis says you can grow this another [N] hours over the next 90 days as the agents continue to learn your context. The {plan_tier} plan continues — your next renewal is on [DATE]. If you'd like to upgrade to {next_tier} for [next_tier_value], reply and I'll send the upgrade flow.

**(If MISSED):**
We missed. The guarantee says we work for free until we hit {audit_hours} hours/week — and that's what we're doing. Your billing is paused as of today. The CCO agent has rebuilt the implementation plan based on what we learned in the first 90 days; the new plan is attached. I'd like a 30-min call this week to walk through it. Book here: {kickoff_slot}.

**(If EXCEEDED — outperforming):**
You're at [N] hours/week — [X]% above the {audit_hours} target. This is the high end of what we typically see in the first 90 days. We have a few customers who hit this band and we usually start having the "what's next" conversation now — there are 3-4 specific workflow patterns we'd add over the next 90 days that would move you from "hours reclaimed" to "capacity to take on entirely new revenue lines." If you want to talk about that, book here: {kickoff_slot}. No pressure either way.

— Srijan

P.S. If you'd be open to a named case study (anonymised optional, attributed if you'd like), reply with "case study OK" — we'd love to write it up. Either way, thank you for being one of Aiprosol's early customers.

---

## Operational notes

**Sender identity:** Mix of human-sent (Srijan personally) and agent-sent (CCO, DA). Customers should always know which is which — the "AI agent" attribution is part of the brand transparency story.

**Reply handling:** Every reply goes to srijanpaudelofficial@gmail.com. Srijan reads + decides whether the reply is something he handles or something Arora drafts a response to (with his approval).

**Cadence rationale:**
- D+0, D+1, D+7 are intentionally close together — first-week experience is the biggest churn determinant.
- D+30, D+45, D+60, D+90 stretches give breathing room as the engagement matures.
- The 90-day email is the renewal/expansion/refund pivot point — it's the most important single email in the sequence.

**Personalisation depth:**
- Pre-customer #1: the [bracketed placeholders] above are guidelines.
- Post-customer #1: turn these into real templates with the actual workflow names + customer names + specific numbers from THEIR data. Generic templates lose the trust signal.

**A/B testing notes:**
- Don't A/B test until customer 10+. The signal is too noisy at small N.
- First metric to optimise: open rate on Email 7 (90-day reclaim). That's the renewal conversion gate.
- Second metric: reply rate on Email 6 (60-day pulse). That's the satisfaction signal.

---

## Versions

| v | Date | Changes |
|---|---|---|
| 0.1 | 2026-05-21 | Initial 7-email sequence drafted ahead of customer #1 |
