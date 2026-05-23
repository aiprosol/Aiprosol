# The Lead Generation Automation Playbook

**The most-bought Aiprosol product. Sub-3-minute response architecture, lead scoring engine, CRM sync. Pays back in week 1.**

Version 1.0 · 2026 · Includes scoring model + 5-touch email sequence + cold outreach library + the lead-relevant n8n workflow starters from the shared `n8n-workflows/` folder

---

## Why this exists

Most B2B lead-gen automations leak money for one reason: **slow response time**. The data is brutal:

- Respond inside 3 minutes → 21x more likely to qualify the lead
- Respond inside 5 minutes → 9x more likely  
- Respond inside 30 minutes → baseline
- Respond after 24 hours → competitor already in the room

Yet 67% of B2B companies take >24h to respond to inbound leads. The reason isn't capacity — it's that nobody has built the system. This playbook is the system.

---

## Part 1 · The 4-Component Scoring Model (100 points)

Every inbound lead gets scored on four axes. Total 0–100. Score drives routing.

### FIT (40 points)
*Is this the kind of customer who'd succeed with us?*

| Signal | Points |
|------|------|
| Company size 10–500 employees | +15 |
| Revenue band $1M–$50M annual | +10 |
| Industry in our top-7 ICP (Legal, Finance, RE, SaaS, Pro Services, E-com, Health) | +10 |
| Title is decision-maker (Founder, COO, Head of Ops, CTO) | +5 |

### INTENT (30 points)
*How explicitly are they asking for what we sell?*

| Signal | Points |
|------|------|
| Filled the ROI Audit form (vs. newsletter) | +15 |
| Reported manual hours/week ≥ 30 | +10 |
| Wrote >100 chars in primary-challenge field | +5 |

### ENGAGEMENT (20 points)
*Behavioural breadcrumbs.*

| Signal | Points |
|------|------|
| Visited ≥ 3 pages in same session | +5 |
| Viewed pricing page | +5 |
| Returned within 7 days | +5 |
| Engaged with prior email (open + click) | +5 |

### URGENCY (10 points)
*Are they buying now, or in 6 months?*

| Signal | Points |
|------|------|
| Mentioned "next quarter," "this week," "ASAP" | +5 |
| Currently on a competitor's tool (switch signal) | +5 |

### Routing thresholds

| Score | Route | SLA |
|------|------|------|
| 85–100 | "Hot": SDR Slack ping + Calendly book link | 5 minutes |
| 65–84 | "Warm": SDR queue with same-day call SLA | 4 hours |
| 40–64 | "Nurture": 5-touch email sequence | Auto |
| 0–39 | "Future": archive to long-term nurture, quarterly re-score | Auto |

---

## Part 2 · The Sub-3-Minute Response Architecture

The goal: from form submission → first acknowledgment in the lead's inbox in <180 seconds.

```
[Form submit]
     ↓
[Validate + enrich] (Clearbit/Apollo, 5-15s)
     ↓
[Score using model above] (1s)
     ↓
[Decision]
   ├── Hot (≥85) → personalised email + Calendly link + Slack to AE (45s)
   ├── Warm (65-84) → personalised email + 4h SLA queue (45s)
   ├── Nurture (40-64) → enter 5-touch sequence (5s)
   └── Future (<40) → archive (1s)
     ↓
[Log to CRM with score, segment, source attribution] (3s)
```

Total: ~60-90 seconds. Well inside the 3-minute window.

**Critical infrastructure:**
- Form posts directly to your serverless function or workflow tool — NOT to a CRM that processes async
- Enrichment is fire-and-forget if it takes >15s
- The acknowledgment email is templated; only the personalisation tokens are dynamic
- The CRM log is the LAST step, never blocking the response

---

## Part 3 · The 5-Touch Nurture Sequence

For Warm leads (65–84) who don't book a call within 48 hours, and for Nurture (40–64) automatically.

### Touch 1 — Immediate (within minutes of form)

**Subject:** Your {{industry}} automation audit is ready

**Body:**
> Hi {{firstName}},
> 
> Thanks for spending 60 seconds on the ROI Audit. Based on what you shared, here's what I'd prioritise:
> 
> **Your top opportunity**: {{topOpportunity}}
> **Estimated weekly hours reclaimable**: {{weeklyHrs}}
> **Annual saving at your hourly cost**: ${{annualSaving}}
> 
> If you want to walk through this together, my calendar is at {{calendlyLink}}.
> 
> Otherwise, hit reply with one question and I'll send back a tailored answer within 24 hours.
> 
> — Srijan, Founder

**Send timing**: immediately. Personalisation tokens come from form payload + scoring model.

### Touch 2 — Day 3 — Relevant case study

**Subject:** {{competitorOrSimilar}} reclaimed 38 hrs/week. Here's how they did it.

**Body**: 2-paragraph snapshot of an anonymised, industry-matched case study. CTA to read full version.

### Touch 3 — Day 7 — A specific objection killer

**Subject:** "Won't the AI just hallucinate?" — and other things people ask

**Body**: Direct, plain-language answer to the most common objection in their industry. Link to /how-we-measure.

### Touch 4 — Day 14 — Permission-based check-in

**Subject:** Should I keep these emails coming, or pause?

**Body**: 3-button respond: Keep going · Pause 30 days · Unsubscribe. Hit "Keep going" → continues sequence. The pause button matters more than you'd think — it builds trust and saves your domain reputation.

### Touch 5 — Day 21 — Lo-fi offer

**Subject:** Want me to draft 1 automation for you this week — free?

**Body**: Offer a 30-min "build one with you" session. Free, no pitch. Open conversations that book paid plans later.

---

## Part 4 · n8n workflow starters (in the `n8n-workflows/` folder)

The shared starter library includes the 4 lead-relevant flows you can extend:

| File | What it does | Map to this playbook |
|------|------|------|
| `03-sales-form-score-route-slack.json` | Form submit → score → Slack route | Sub-3-min architecture (Part 2) |
| `08-sales-cold-reply-intent-classifier.json` | Cold reply → AI intent → branch | Reply triage post-sequence |
| `02-sales-calendly-ai-prep-brief.json` | Calendly booking → AE prep brief | Convert step |
| `01-sales-stripe-charge-to-hubspot.json` | Closed-won → deal stage update | Convert step + downstream CRM sync |

The 4 above are the production-shaped starters. The other 8 lead-gen workflows referenced in this playbook (capture-multi-source, score-only sub-workflow, score-to-segment router, round-robin SDR, 5-touch orchestrator, pause/unsubscribe handler, 90-day re-engagement, closed-won onboarding kickoff) are documented as extensions you build on top of the same patterns. Build the master capture workflow first — the others fall out naturally.

### Honest scope

You're paying $127 for the **system** (scoring model, sequence copy, routing tree, dashboard spec, cold outreach library) — not 12 prebuilt workflows. The 4 starters above are the seed; the patterns are universally applicable to extend.

---

## Part 5 · The Routing Decision Tree

```
New lead in
    ↓
[Email valid?] → No → archive ("bad data")
    ↓ Yes
[Score]
    ↓
[Score ≥ 85?] → Yes → HOT branch
    ↓ No
[Score 65-84?] → Yes → WARM branch
    ↓ No
[Score 40-64?] → Yes → NURTURE (auto-enter sequence)
    ↓ No
[Archive as FUTURE]

HOT branch:
    → Send acknowledgment email
    → Slack #leads-hot with @AE-on-rota
    → Open Calendly link in email body
    → SLA: AE responds within 5 min
    → If no AE response in 10 min → escalate to founder

WARM branch:
    → Send acknowledgment email
    → Add to SDR daily queue
    → SLA: SDR responds same business day
    → If no SDR response in 4 hr → escalate to manager
```

---

## Part 6 · The Dashboard Spec

Leading + lagging indicators. Refresh daily. Source of truth for whether the system is working.

**Leading (responsive — predicts next week's revenue)**
- Leads/day by source (form / LinkedIn / referral / cold reply)
- Median + p95 time-to-first-response (target: median < 3 min, p95 < 5 min)
- Score distribution: % in each segment (Hot/Warm/Nurture/Future)
- Sequence step-through rate per touch (Touch 1 → 2 → 3 → 4 → 5 conversion)

**Lagging (definitive — what actually happened)**
- Leads → SQL (sales-qualified) %
- SQL → Won % (and avg sales cycle)
- Revenue/lead by source
- Best-converting score range (validate the scoring model is right)
- Worst-converting score range (the holes in your model)

**Weekly closed-loop iteration**
- Every Monday: 30 minutes reviewing the dashboard
- Did any segment over- or under-perform vs. expectation?
- Tune scoring weights, edit copy, change routing thresholds — one change/week
- After 12 weeks of weekly tuning, you have a system that out-converts anything off-the-shelf

---

## Part 7 · The Bonus — 8-Pattern Cold Outreach Library

Eight cold-outreach templates that have actually booked meetings for Aiprosol clients. Each comes with:
- Subject line (A + B variants)
- Body copy
- Personalisation token map
- Reply-rate baseline + when to use this template vs. another

Patterns covered (full templates in the included `cold-outreach-library.md`):
1. The 30-second value claim
2. The competitor switch
3. The peer reference
4. The mutual connection
5. The "I noticed" trigger event
6. The contrarian opinion
7. The pure question
8. The PS-only

Each with subject A/B variants, full body copy, personalisation token map, reply-rate baseline.

---

## Ship Today

Build the master capture flow (workflow #1 above) for ONE entry source — your ROI Audit form. Set the score thresholds. Wire the acknowledgment email. Test with 3 real-shaped payloads.

That's a 60-minute build. From tomorrow you're responding in under 3 minutes while your competitors are sleeping on it.

---

*Aiprosol designs, builds, and operates lead-gen automation for clients. If you'd rather have us build this for you, see aiprosol.com/services/ai-powered-lead-generation.*
