# The Aiprosol Lead Generation Automation Playbook

**The complete automated lead-generation system: capture, score, route, nurture, convert. Email templates, scoring formulas, sequence specs, dashboard designs.**

Version 1.0 · 2026 · © Aiprosol Ltd

---

## What you'll have at the end

If you implement this playbook end-to-end (~3 weekends of work), you'll have:

1. A **lead-capture surface** that converts visitors into structured leads (form, chatbot, AI qualifier)
2. An **automated scoring system** that ranks every new lead 1-100 within seconds
3. A **smart routing layer** that sends hot leads to humans, warm to nurture, cold to suppression
4. A **5-touch nurture sequence** for warm leads — fully automated, personalised
5. A **conversion-optimised handoff** to the human selling team for hot leads
6. A **dashboard** showing source attribution, score distribution, conversion rates
7. An **iteration loop** that reads what's converting and updates the scoring weekly

The whole stack runs on $50-$100/month at SMB scale.

---

## Part 1 · The model — what "good" lead gen looks like

### The funnel

```
Awareness     → Visitor lands on your site / sees your post
Capture       → They give you contact info (form, chat, demo request)
Qualification → You learn enough to score them 1-100
Routing       → You decide: human-now, nurture, or suppress
Engagement    → Email/LinkedIn/call sequence based on score
Conversion    → Booked call → demo → contract
Iteration     → Closed-won data feeds back into scoring
```

### The decisions you must make BEFORE building

These are the strategic decisions that determine everything else. Make them now, write them down, share with the team.

1. **What's a qualified lead for us?** — write a 1-paragraph definition with industry, size, role, intent signals. Hot, warm, cold definitions.
2. **What's our response SLA for hot leads?** — answer in seconds: 5 min, 15 min, 1 hour, 24 hours. This determines the architecture.
3. **What's our stance on automation in the conversation?** — fully automated until close? Human-touch from first reply? Hybrid based on score? No right answer; pick one.
4. **What's our cold-email policy?** — total opt-in only, or do we send cold? Affects every downstream choice and your CAN-SPAM/GDPR posture.

If you can't answer these in writing, stop reading. Go answer them. Then come back.

---

## Part 2 · Capture — the inbound surface

### The 4 capture mechanisms (use 2-3, never 1)

#### 1. Lead-magnet form

Visitor lands on a landing page → fills a form to get a free thing → enters your funnel.

**The free thing matters.** It should be:
- **Specific** to your ideal customer's problem (not "ultimate guide to [broad topic]")
- **Time-bound** — implementable in 60 minutes max
- **Substantive** — they should feel they got more than they paid (which is just an email)

**Form length:** 3-7 fields. Below 3 = you don't know enough to score. Above 7 = you'll lose 40-60% of submissions.

**Required fields:** name, business email, company, employee count, industry, primary problem.

**Honest pricing field:** *"What's your monthly revenue range?"* — buyers self-select if you ask politely.

#### 2. AI chat qualifier

Bottom-right widget. Visitor asks anything. After 3 messages exchanged, the bot offers: *"Want me to email you a personalised plan?"* — captures email + key context.

Aiprosol's own Arora chat is exactly this pattern. We use it as Lead Capture #2 alongside the static form.

**Why it works:** lower commitment than a form. Visitor talks first, gives info second.

#### 3. Demo / discovery booking

Calendar embed → visitor picks a slot → fills 3-field form on booking → lead in your CRM.

**Best for:** higher-intent traffic (above-fold "Book a demo" CTA, retargeting traffic, paid search).

**Worst for:** cold traffic that doesn't know your brand yet — too high a commitment.

#### 4. Newsletter signup with intent capture

Below-the-fold "Get our weekly automation tips" signup. ASK what they want help with on the second screen — that's your lead context.

### Capture page design rules

- **Headline = the outcome they want, not the feature you have.** "Reclaim 35 hrs/wk" > "AI Automation Toolkit"
- **Subhead = who it's for.** "For ops leaders at 10-200-person businesses"
- **CTA visible above fold** on every viewport size
- **One CTA per page.** If you have 4 buttons, you have 4 pages.
- **Social proof within 1 scroll** — even one strong customer quote
- **Form labels above fields, not as placeholders.** Placeholders disappear, labels persist.

---

## Part 3 · Scoring — turning raw leads into 1-100

### The scoring formula

Every lead gets a score 0-100, computed at capture time and recomputed every 24 hrs as new signals arrive.

**Composite formula:**

```
score = 0.40 × FIT      (do they match our ICP?)
      + 0.30 × INTENT   (signals of buying intent)
      + 0.20 × ENGAGEMENT (interactions with our content)
      + 0.10 × URGENCY   (time-bounded signals)
```

#### FIT (40 points possible)

- **Industry match** (0-15): exact match = 15, adjacent = 10, off = 0
- **Size match** (0-15): in our sweet spot = 15, too small or too large = 5, way off = 0
- **Role of contact** (0-10): decision-maker = 10, influencer = 6, end-user = 3

#### INTENT (30 points)

- **What they downloaded / which page** (0-10): pricing page = 10, blog = 4, case study = 8
- **Specificity of stated problem** (0-10): "we waste 12 hrs/wk on X" = 10, "we want efficiency" = 3
- **Budget signal** (0-10): they checked "$1k+/month" = 10, "<$100" = 2

#### ENGAGEMENT (20 points)

- **Pages visited in first session** (0-5): >5 = 5, 1 = 1
- **Time on site** (0-5): >5 min = 5, <30 sec = 0
- **Email opens** (0-5): opened all 5 nurture emails = 5
- **Email clicks** (0-5): clicked through to pricing or case study = 5

#### URGENCY (10 points)

- **Stated timeline** (0-7): "this quarter" = 7, "this year" = 4, "exploring" = 0
- **Recent trigger event** (0-3): just hired, just funded, just lost a customer mentioned = 3

### Score → action

| Score | Label | Action |
|---|---|---|
| 80-100 | 🔥 Hot | Slack ping the rep within 60 sec; SLA: contact within 5 min |
| 60-79 | 🌡 Warm | Auto-enrol in 5-touch nurture; rep follows up after touch 3 |
| 40-59 | 🌱 Watch | Newsletter only; re-score quarterly |
| 0-39 | ❌ Out-of-fit | Suppress from outbound; static email auto-replied with a "wrong fit" template + referral to better-fit alternative |

### Implementation

Build the scoring as a single Make / Zapier scenario triggered on lead creation. Each scoring sub-component is an OpenAI prompt that returns a number. Aggregate and write back to the CRM record.

Example AI prompt for FIT scoring:

```
ROLE: B2B sales operations analyst.
TASK: Score the FIT of this lead from 0-40 against our ICP.
ICP: 10-200 employee professional services / SaaS firms in UK / EU / US.
LEAD: {company_name} {employee_count} {industry} {role}
SCORING:
  Industry exact match: 15 points (professional services or SaaS)
  Industry adjacent: 10 points (consulting, agency, software)
  Industry off: 0 points
  Size in sweet spot (10-200): 15 points
  Size 5-9 or 200-500: 5 points
  Size other: 0 points
  Decision-maker role: 10 points
  Influencer role: 6 points
  Other role: 3 points
RETURN: a single integer between 0 and 40.
```

---

## Part 4 · Routing — the smart layer between capture and action

### The routing decision tree

On every new scored lead, the workflow:

1. **Suppression check** — is the email on our suppression list (manual unsub, prior NEVER reply, blacklist domain)? If yes, halt.
2. **Geographic check** — outside our service area? Auto-reply with "wrong region" + referrer link.
3. **Size check** — way too big or way too small? Auto-route to a different sequence (enterprise track or self-serve track).
4. **Score gate** — apply the score table above.
5. **Round-robin assignment** — for hot leads, assign to a rep based on territory + workload.

### The routing infrastructure

This is where most lead-gen automations break. You need:

- A **suppression list** (Google Sheet or DB) with at least: email · domain · added_date · reason
- A **rep assignment table** with: rep · territory · max_active_leads · current_count
- A **routing log** for debugging — every routing decision recorded with reason

---

## Part 5 · The 5-touch nurture sequence (warm leads)

For warm leads (score 60-79), this is the canonical sequence. Each email is short, useful, and ends with one specific question.

### Email 1 — Day 0 (immediately after capture)

**Subject:** What you asked for · {LeadMagnetTitle}

**Body:**
- Deliver the lead magnet in the first paragraph (link)
- One short paragraph: "Here's the question I'd ask first if I were in your shoes…"
- One specific tactical tip relevant to their stated problem
- Sign-off + expectation: *"Tomorrow I'll send a 4-min read on [specific problem they mentioned]."*

### Email 2 — Day 2

**Subject:** {The specific problem they mentioned}

- Open with a one-line acknowledgement of their context (use AI to personalise based on their submitted role + industry)
- One concrete framework or insight (300-500 words)
- One real example with numbers
- CTA: *"What's your version of this look like? Reply with one sentence."*

### Email 3 — Day 5

**Subject:** The one thing most people miss about {topic}

- Counter-intuitive angle on their problem
- Cite one specific case study (with permission, by name)
- 90-second video link if you have one
- CTA: book a 15-min call (link)

### Email 4 — Day 10

**Subject:** Three options if you want help

- Acknowledge they may not be ready
- List three paths: self-serve product, managed plan, "stay subscribed for now"
- Make the no-action option easy and not awkward
- CTA: pick one

### Email 5 — Day 21

**Subject:** Closing your file?

- Honest, direct: "I'm going to stop reaching out unless you say otherwise"
- One last CTA: book a call or unsubscribe
- Tone: warm, not guilt-trippy

### After the sequence

Lead either responded (route to sales) or didn't. If didn't, move to "newsletter only" status. Re-score quarterly — they may become hot later when their context changes.

---

## Part 6 · Conversion — handing hot leads to humans

### The 5-min SLA architecture

Hot lead lands → Slack ping fires within 30 seconds. The ping includes:

- 🔥 SCORE/100
- Lead summary (name, company, role, stated problem)
- Estimated deal size (computed from size × revenue band × industry multiplier)
- 1-line "open with this" — AI-generated talking point
- Calendar link (if they didn't book at capture)
- Phone number (if they provided it)

The rep gets paged in their notification settings. SLA: contact within 5 min.

**Why 5 min:** Harvard Business Review 2011 and every replication since shows lead-to-contact under 5 minutes is 7× more likely to convert than 1-hour delay. This is the single highest-ROI architecture decision in lead gen.

### The 24-hour safety net

If a hot lead has no logged activity 24 hours after the Slack ping, the workflow:

1. Pings the rep again (escalation)
2. Cc's the sales lead
3. Auto-drafts a "we got your enquiry" email from the rep's inbox so the lead doesn't think they were ignored

---

## Part 7 · Iteration — making your scoring smarter weekly

### The closed-loop

Every week, the workflow:

1. Pulls all closed deals (won + lost) from the past 90 days
2. For each, looks up the lead's original score
3. Computes: average score for closed-won, average for closed-lost
4. Identifies which scoring components were predictive vs. noise
5. Suggests adjustments to the scoring weights

Output: a Slack message every Monday morning saying *"Closed-won avg score: 78. Closed-lost avg score: 64. INTENT-component is the strongest predictor (+12 score for closed-won). Consider re-weighting from 0.30 → 0.35."*

### When to actually adjust

Don't change weights on a single week's data. Trends only. Adjust quarterly with at least 50 closed deals as the basis.

---

## Part 8 · The dashboard

A single Notion page (or BI tool) showing:

| Metric | Value | Target | Δ vs last week |
|---|---|---|---|
| New leads | X | Y | +Z% |
| Hot leads | X | — | — |
| Hot lead 5-min SLA hit rate | 92% | 95% | -2% |
| Lead → meeting booked | 18% | 20% | +1% |
| Meeting → opportunity | 65% | 60% | +5% |
| Opportunity → close | 28% | 30% | -2% |
| Average days lead-to-close | 24 | 21 | +1 |

Plus three stack-ranked tables:

- Top 10 lead sources by volume (and by conversion)
- Top 10 industries by deal size
- Top 5 recent closed-won deals (so the team sees wins)

The whole dashboard auto-updates from Make pulling data from CRM + Stripe + analytics.

---

## Part 9 · Cold-email side (if you do outbound)

Inbound is what this playbook focuses on, but most lead-gen practices include some outbound. Quick rules:

1. **Total opt-in for marketing emails. Cold = sales prospecting.** Don't conflate.
2. **Personalise the opening line.** Not "Dear [first name]" — actual research about their company.
3. **One ask per email.** Not "would you like to chat OR check this out OR reply OR…"
4. **3-touch maximum cold sequences.** Never more.
5. **Every cold email has a 1-click unsubscribe** even when not legally required (UK: required for B2C, optional for B2B sole-trader / partnership outreach but recommended).
6. **Never buy lists.** Build your own from public data + intent signals.
7. **Track reply rate, not open rate.** Open rate is dominated by Apple Mail Privacy noise. Replies tell you the truth.

For the full cold-email tactics, see the **ChatGPT Business Prompt Vault** (separate product).

---

## Part 10 · Pitfalls we see operators hit

1. **Building before defining.** Building scoring without defining the ICP. Result: scoring that scores nothing.
2. **Over-segmenting too early.** 14 different nurture sequences for 14 different sub-personas before you have product-market fit. One sequence per major segment.
3. **Tracking everything, acting on nothing.** Dashboards that nobody uses. Pick 3 metrics, watch them weekly, ignore the rest.
4. **Cold-email burning your domain.** Sending volume from your primary domain. Always use a dedicated cold-outreach domain (e.g., `outreach.aiprosol.com`).
5. **Not retiring stale leads.** Watching 50,000 leads who haven't engaged in 18 months. Routinely retire below threshold; healthier list = better sender reputation = better deliverability.

---

## Implementation roadmap (recommended)

**Week 1:** Define ICP, hot/warm/cold definitions, response SLA. Document and share.

**Week 2:** Build the lead-capture form + AI chat qualifier. Connect both to a CRM.

**Week 3:** Build the scoring workflow. Test on 50 historical leads to validate accuracy.

**Week 4:** Build the routing workflow + 5-touch nurture sequence.

**Week 5:** Build the dashboard. Connect to live data.

**Week 6:** Run live for 30 days, measure, iterate.

By month 3 you have a self-improving lead-gen system. By month 6 the data refines weights automatically.

---

## Implementation help

If implementing this in-house feels overwhelming, the Aiprosol Growth plan ($2,997/mo) builds and runs the entire stack as a service. ROI is measured before scope expands. 90-day reclaim guarantee.

For self-implementers, post questions to `hello@aiprosol.com` — 7-day post-purchase free troubleshooting included.

---

## Licensing

Licensed for unlimited internal use. Sequences, scoring formulas, and dashboards may be implemented within the purchaser's organisation. Resale or republication requires written permission. © 2026 Aiprosol Ltd.
