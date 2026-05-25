# Cold Outreach Sequence — Prospect → Customer

**Owner:** Srijan Paudel + the CRO agent
**Use:** 5-touch sequence for outbound cold prospects (the CRO agent's primary workflow). Different from `CUSTOMER-ONBOARDING-EMAILS.md` which is for after they buy.

**Sender:** Srijan personally for first 50 prospects; thereafter agent-drafted with human approval gate.

**Cadence:** 14 days total. T+0 / T+3 / T+7 / T+10 / T+14. Stop sequence immediately if they reply (positive, negative, or "not now").

**Brand-voice locked:** Every email follows `BRAND-VOICE-STYLE-GUIDE.md`. ≤7 sentences body, one ask only, no banned hype words.

**Substitution conventions:**
- `{first_name}` — first name only
- `{company}` — their company
- `{specific_pain}` — the specific operational pain we've inferred from research
- `{trigger_event}` — recent thing that prompted us to reach out (LinkedIn post, hire, funding, etc.)
- `{relevant_metric}` — one number from their industry that anchors the value prop
- `{specific_product}` — the Aiprosol product or service most relevant to their pain

---

## Pre-send research checklist (the CRO agent runs this before T+0)

For each prospect, before any email is drafted:

- [ ] Company size + revenue band confirmed from public sources (LinkedIn, Crunchbase, company website)
- [ ] Decision-maker identified (must be VP+/founder/COO — not an analyst or coordinator)
- [ ] Specific pain inferred from 2+ data points (job posting, LinkedIn post, podcast appearance, company blog, recent funding announcement)
- [ ] Trigger event identified (something that happened in the last 30 days — hire, launch, layoff, funding round, expansion)
- [ ] Their tech stack identified to ≥3 components (CRM, comms, billing)
- [ ] Not on suppression list (no current customer, no prior pitch in last 90 days, no LinkedIn block / unfollow)

If any check fails: skip this prospect. Wrong prospect costs 3× more than no prospect.

---

## T+0 — First-touch email

**Subject:** {first_name}, {relevant_metric} sitting on the table?

**Body:**

{first_name},

Noticed {trigger_event} — congrats / interesting timing.

Most companies at {company}'s stage lose {relevant_metric} hours per week to {specific_pain}. We've shipped {specific_product} to solve exactly that. Three customers in your industry are running it now.

Worth a 20-min call this week? If now isn't the right time, just reply "later" and I'll re-surface in a quarter.

— Srijan
Founder & Chairman, Aiprosol · [aiprosol.com](https://aiprosol.com)

P.S. If you'd rather just see the numbers first, the free 60-second ROI audit is at [aiprosol.com/roi-audit](https://aiprosol.com/roi-audit).

---

### Why this email works

- **Subject** uses their name + a specific number — gets opens
- **Trigger event** in line 1 proves we did the work; not spray-and-pray
- **Inferred pain** in line 2 names something they actually face
- **Social proof** ("three customers in your industry") is allowed; we don't name them
- **Single ask** with a graceful exit ramp ("later" is an acceptable answer)
- **P.S. with self-serve path** — if they don't want a call, they can still go in the funnel

---

## T+3 — Value-add (case-study angle)

**Subject:** {first_name} — quick case study from a {company}-shaped customer

**Body:**

{first_name},

Quick share — one of our customers in {industry} was losing roughly {hours} hours/week to {specific_pain}. We shipped {specific_workflow_name} for them; they're now at {result} on that workflow within {timeframe}.

Anonymised write-up here: [aiprosol.com/case-studies/{slug}](https://aiprosol.com/case-studies/{slug})

Not pitching a call this time. Just thought the parallel was close enough to be useful for whoever owns this at {company}.

— Srijan

---

### Why this email works

- No ask (literally says "not pitching"). Builds trust.
- Links to a real case study so they can verify
- Frames the share as a courtesy, not a pitch
- The "whoever owns this" framing is permission to forward — they often will

---

## T+7 — Social-proof + soft ask

**Subject:** Re: {first_name}, {relevant_metric} sitting on the table?

**Body:**

{first_name},

Bumping the thread — happy if this isn't the right time.

In case useful context: we now have {N} customers in {their_segment} running the {specific_workflow} you'd most likely need. The aggregate they reclaim is {N} hours/week per team. Numbers + agent dashboard are public at [aiprosol.com/agents](https://aiprosol.com/agents).

If "yes but not now" — what's the right month to circle back?

— Srijan

---

### Why this email works

- "Re:" subject continues the same thread, doesn't claim new attention
- "Happy if this isn't the right time" releases pressure
- Updated number (N customers, N hours) gives them new info, not the same pitch
- Public agent dashboard is the highest-signal credibility link
- Soft ask ("right month to circle back?") gets a yes/no/timing answer

---

## T+10 — Direct ask (one-sentence)

**Subject:** {first_name} — last bump on this

**Body:**

{first_name},

Last note from me. If 20 minutes makes sense, my Calendly is here: [calendly.com/srijanpaudel219/30min](https://calendly.com/srijanpaudel219/30min). If not, I'll close the loop and circle back in Q{next_quarter}.

Either way — best of luck with {company}.

— Srijan

---

### Why this email works

- "Last note from me" — relieves pressure, signals end
- Calendly link in the body (no hunting)
- "Either way — best of luck" — closes warm even on no-response
- Names the company by name; shows we still care after 10 days

---

## T+14 — Break-up email (the close)

**Subject:** Closing the loop, {first_name}

**Body:**

{first_name},

Closing the loop on this thread. I'll re-surface in Q{next_quarter} unless you tell me otherwise.

If anything changes — new hire, new pressure, new initiative where automation could help — my reply is fast: srijanpaudelofficial@gmail.com.

— Srijan

P.S. If you found anything from any of these emails useful, a quick "useful but not relevant" reply genuinely helps me calibrate. The CRO agent who drafts the first version of these is learning from every reply.

---

### Why this email works

- Honest "closing the loop" — not the fake "should I close your file?" gambit
- Names Q{next_quarter} explicitly — not "later" or "sometime"
- Direct personal email is the warm escape valve
- P.S. is honest about the AI agent's learning loop — fits Aiprosol's brand transparency
- The "useful but not relevant" prompt gets meaningful replies even from no-buy prospects

---

## Stop conditions (interrupt sequence immediately)

| Condition | Action |
|---|---|
| They reply positively | Drop the sequence, jump to discovery call booking |
| They reply "not now" or "later" | Drop the sequence, add to a 90-day re-surface queue |
| They reply negatively | Drop the sequence, add to suppression list permanently |
| They unsubscribe | Drop the sequence, suppression permanent, remove from CRM marketing |
| They book a Calendly slot | Drop the sequence, prep for the call |
| They open ≥5 times without replying | Drop the sequence at T+10, suppress for 60 days — they're not ignoring you, they're not the right person |
| Email bounces hard | Suppress permanently, log the email for the CRO agent's deliverability monitoring |

---

## What NOT to do in this sequence

- ❌ Send to anyone who hasn't been research-checked above
- ❌ Reference their LinkedIn post by paraphrasing the obvious — they know what they posted, they want the relevant insight, not the recap
- ❌ Use first-name personalisation tokens without a fallback (broken tokens make us look like spam)
- ❌ Reference funding, layoffs, or sensitive moves without proven respect for context — these are easy to get wrong
- ❌ Send all 5 even after a reply — the most expensive mistake is staying in the cadence after the conversation has moved
- ❌ Add a tracking pixel that's visible — modern operators recognise these and they hurt our brand
- ❌ CC a teammate (the email is from Srijan personally; CCing breaks the personal frame)
- ❌ A/B test subject lines until N > 100 — signal is too noisy below that

---

## Compliance + send-side hygiene

- All emails sent from `srijanpaudelofficial@gmail.com` (for first 50 prospects); thereafter `outreach@aiprosol.com` once we have the dedicated mailbox
- DKIM + SPF + DMARC all aligned (already configured per humans.txt)
- Resend (or equivalent) for the sending infra, with per-send open + reply tracking
- Unsubscribe link in T+10 onward (legal requirement varies by jurisdiction; safer to include)
- Suppression list is shared between CRO agent + Srijan + any future SDR
- No purchased lists ever. All targeting is research-derived from public sources.

---

## Per-segment customisation

The base sequence works for everyone. These overrides land best per segment:

### Real Estate (high-fit segment)
- {specific_pain} = "30+ min lead response time"
- {relevant_metric} = "21x qualification lift from sub-3-min response"
- {specific_workflow} = "the sub-3-minute lead-response system from our Lead Generation Automation Playbook"

### SaaS
- {specific_pain} = "manual PQL scoring"
- {relevant_metric} = "5-10 hours/week per AE on CRM hygiene"
- {specific_workflow} = "the 4-component scoring model"

### Legal
- {specific_pain} = "contract intake + initial review"
- {relevant_metric} = "30-45 partner hours/week on document review"
- {specific_workflow} = "our intelligent document processing pipeline with 99%+ accuracy + full audit trail"

### Professional Services (consulting, agencies)
- {specific_pain} = "non-billable admin (timesheets, proposals, project comms)"
- {relevant_metric} = "70% of rep time on non-selling work"
- {specific_workflow} = "the Sales Pipeline Automation system"

### Financial Services
- {specific_pain} = "manual document processing with audit-trail requirements"
- {relevant_metric} = "99%+ accuracy + full audit trail required"
- {specific_workflow} = "intelligent document processing with confidence-scored output"

### E-commerce
- {specific_pain} = "support deflection + cart-abandonment recovery"
- {relevant_metric} = "60% ticket deflection achievable; cart abandonment 60-80% recoverable"
- {specific_workflow} = "the customer support automation + cart-abandonment workflow combo"

---

## Versioning

| v | Date | Changes |
|---|---|---|
| 0.1 | 2026-05-21 | Initial 5-touch sequence for CRO agent + Srijan |
