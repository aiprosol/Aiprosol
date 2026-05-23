# EMAIL SEQUENCES · AIPROSOL

> All email is sent from `hello@aiprosol.com` (display: "Arora at Aiprosol"). Reply-to: `srijan@aiprosol.com`. GBP only · global · self-serve first · Arora voice.

> 13 emails across 6 sequences. Plug into the 5 Zapier flows already built (per the Master Blueprint).

---

## SEQUENCE 1 · ROI AUDIT FOLLOW-UP (3 emails)

**Trigger:** New row in `leads` CMS with `leadStatus = "New Lead — ROI Audit"`.

### EMAIL 1.1 · Day 0 (instant) — The report

**Subject:** Your ROI report — {{firstName}}, {{annualSaving}} a year reclaimable

**Preview:** {{weeklyHrs}} hrs/week back. Personalised by Arora.

```
Hi {{firstName}},

Your ROI report is in.

Based on the numbers you shared:

  ✦ Projected annual saving: £{{annualSaving}}
  ✦ Hrs/week reclaimable:    {{weeklyHrs}}
  ✦ Recommended path:        {{planRec}}
  ✦ Quick win:               {{productRec}}

The recommendation isn't generic. It's based on your stage ({{employees}} employees, {{monthlyRevenue}} monthly revenue) and your manual-hour load.

If {{tier}} = "Digital":
  Start with the {{productRec}} — it pays back inside the first week of implementation. Browse the full catalogue at aiprosol.com/digital-products.

If {{tier}} = "Plan":
  The {{planRec}} fits your stage. Cancel anytime, 14-day onboarding, includes me as your AI CEO. See full plan breakdown: aiprosol.com/pricing

If {{tier}} = "Enterprise":
  At your scale a 30-min call makes sense. Book directly: calendly.com/srijanpaudel219/30min — I'll join with the architecture sketch ready to discuss.

Whichever tier you're in, hit reply if you want me to send the closest case study.

— Arora
AI CEO · Aiprosol
aiprosol.com
```

### EMAIL 1.2 · Day 3 — The case

**Subject:** {{industry}} case study — same numbers as you

**Preview:** This is what {{caseCompany}} did. Same shape as your audit.

```
Hi {{firstName}},

Following up on your ROI report.

The closest match in our case studies is {{caseCompany}} — same {{industry}} sector, similar scale to {{companyName}}.

What they did:
{{caseSummary}}

The result:
{{caseMetric1}} · {{caseMetric2}} · {{caseMetric3}}

Read the full breakdown: aiprosol.com/case-studies/{{caseSlug}}

If anything in there triggers a "we have that exact problem" reaction, hit reply with one sentence and I'll point at the closest implementation path.

— Arora
```

### EMAIL 1.3 · Day 7 — The nudge

**Subject:** Last note from me on your audit

**Preview:** No follow-ups after this. Promise.

```
Hi {{firstName}},

Last note from me on your ROI audit.

If automation is genuinely not on the radar right now, no problem — I'll close the loop and stop emailing.

If it is, the easiest next step is whichever fits:

  → £37 Business Process Audit Checklist (weekend implementation)
  → Free 60-second second-look at your audit (reply with one question)
  → {{planRec}} (we build it for you)

All on aiprosol.com.

Thanks for running the audit either way.

— Arora
```

---

## SEQUENCE 2 · NEWSLETTER WELCOME (3 emails)

**Trigger:** New row in `newsletter` CMS.

### EMAIL 2.1 · Day 0 (instant) — Welcome

**Subject:** Welcome to Aiprosol — here's what to expect

**Preview:** No spam. Tactical only. Unsubscribe anytime.

```
Hi {{firstName}},

You're in. Here's what to expect.

Twice a month you'll get one of these:

  ✦ A field note from a real automation engagement (numbers + architecture)
  ✦ A tactical playbook (build vs buy, the 3-min lead rule, etc.)
  ✦ A new product release notification

That's it. No vendor pitches. No "10 ways to" listicles. No engagement-bait.

While you're here — if you haven't already, the free 60-second ROI Audit gives you your specific number: aiprosol.com/roi-audit

— Arora
AI CEO · Aiprosol
```

### EMAIL 2.2 · Day 4 — The first read

**Subject:** The 5 workflows every services business should automate first

**Preview:** Tactical first send. Implementation-ready.

```
Hi {{firstName}},

Your first proper newsletter. It's a tactical one.

If you only had time to automate five things in a services business, this is the order I'd run it:

1. Lead intake + qualification (fastest ROI — sub-3-min response triples conversion)
2. Calendar / booking flow (eliminates scheduling tag entirely)
3. Client onboarding sequence (welcome, expectations, first deliverable)
4. Recurring reporting (weekly/monthly numbers without team lift)
5. Document processing (invoices, contracts, applications)

Pick whichever has the most manual hours stacked on it. That's your fastest payback.

Full post with implementation notes: aiprosol.com/blog/5-workflows-services-business

Hit reply if you'd like the order rearranged for your specific industry.

— Arora
```

### EMAIL 2.3 · Day 14 — The product nudge

**Subject:** {{firstName}}, the 30-day Automation Challenge

**Preview:** £47, ships value before any plan. Optional.

```
Hi {{firstName}},

You've been on the list two weeks. If you're sizing up where to actually start:

  → £37 Business Process Audit Checklist — walks you through your workflows
  → £47 30-Day Automation Challenge — daily prompts, ships your first 5 automations
  → £127 Lead Generation Playbook — the most-bought product, ROI in week 1

All instant download. 7-day refund if they don't fit.

Or skip ahead to the free ROI Audit and let me recommend: aiprosol.com/roi-audit

— Arora
```

---

## SEQUENCE 3 · PRODUCT PURCHASE FULFILMENT (1 email + 1 follow-up)

**Trigger:** New `orders` row with status `paid`.

### EMAIL 3.1 · Day 0 (instant) — Receipt + download

**Subject:** Your {{productName}} is ready — {{firstName}}

**Preview:** Download link inside. Welcome.

```
Hi {{firstName}},

Your purchase of {{productName}} (£{{price}}) is confirmed.

Your download is here: {{downloadUrl}}

This link doesn't expire. You can re-download from your account at aiprosol.com/account anytime.

A few notes:

  ✦ The first 10 minutes are the most important — open it now if you can. Most clients who implement {{productName}} in week 1 see ROI in week 2; clients who let it sit on their desktop never do.

  ✦ If you hit a wall, hit reply. I'll either point at the right section or — if it's a real edge case — send you back a video walkthrough.

  ✦ 7-day refund if it doesn't fit your stage. Just reply.

Thanks for picking us.

— Arora
AI CEO · Aiprosol
```

### EMAIL 3.2 · Day 7 — Implementation check-in

**Subject:** {{firstName}}, how's the {{productName}} implementation going?

**Preview:** Quick check. One reply, no obligation.

```
Hi {{firstName}},

A week since you bought {{productName}}. Quick check.

Where are you?

  A — Implemented. Already seeing returns. (Reply "A" — I'll send the matching upgrade path.)
  B — Implemented. Stuck on a specific step. (Reply with the step and I'll send the fix.)
  C — Not started yet. (Reply "C" — no judgment, I'll send a 1-day quick-start.)
  D — Refund please. (Reply "D" — instant, no questions.)

Whichever it is, let me know.

— Arora
```

---

## SEQUENCE 4 · PLAN SIGNUP ONBOARDING (3 emails)

**Trigger:** New `subscriptions` row, plan = `starter` | `growth` | `enterprise`.

### EMAIL 4.1 · Day 0 (instant) — Welcome to the {{planName}}

**Subject:** Welcome to Aiprosol {{planName}} — here's day 1

**Preview:** Onboarding starts now. 14 days to live.

```
Hi {{firstName}},

You're on the {{planName}} plan. Welcome.

Onboarding kicks off today. Here's the 14-day rhythm:

  Day 1–3:  Process audit · we map every workflow you flagged
  Day 4–7:  Architecture design · you sign off before we build
  Day 8–12: Build + test · documented end-to-end
  Day 13–14: Go live + monitoring switch on

You'll get a Slack/email channel for daily updates. Your point of contact for the build is {{architect}} — they're on the email shortly with the audit questionnaire.

Three things to do today:

  1. Reply with the top 3 workflows you want automated (ranked by manual hours)
  2. Send across your CRM/tool stack (Pipedrive? HubSpot? Notion? List them)
  3. Block 30 mins on your calendar for the audit call (optional but speeds things up)

Talk soon.

— Arora
AI CEO · Aiprosol
```

### EMAIL 4.2 · Day 3 — Architecture preview

**Subject:** Your architecture sketch — {{firstName}}

**Preview:** First look. Sign-off needed.

```
Hi {{firstName}},

The audit's done. Here's your automation architecture.

[ARCHITECTURE DIAGRAM ATTACHED]

Three workflows live in the design:

  1. {{workflow1}} — projected {{hrs1}} hrs/week reclaimed
  2. {{workflow2}} — projected {{hrs2}} hrs/week reclaimed
  3. {{workflow3}} — projected {{hrs3}} hrs/week reclaimed

Total projected: {{totalHrs}} hrs/week. Annual saving: £{{annualSaving}}.

Two things to do:

  1. Reply with sign-off (or any change requests) on the architecture
  2. Confirm tool credentials are accessible (we'll send the secure form)

Once both are in, build starts day 8.

— Arora
```

### EMAIL 4.3 · Day 14 — Live

**Subject:** You're live, {{firstName}} — automations running

**Preview:** Day 14. Done. Monitoring on.

```
Hi {{firstName}},

You're live.

All three workflows are running. Monitoring is on. The dashboard is at aiprosol.com/dashboard.

What's tracked:

  ✦ Hours saved (running tally)
  ✦ Errors caught + auto-recovered
  ✦ Usage by team member
  ✦ Anomalies needing your attention

Most clients see their first 5 hrs of saved time within 48 hours. By day 30 you should see the full {{totalHrs}} hrs/week pattern.

Bi-weekly strategy calls start next week. {{architect}} will send the calendar.

If anything looks off in the dashboard, reply directly. I watch all client signals.

— Arora
AI CEO · Aiprosol
```

---

## SEQUENCE 5 · CART ABANDONMENT (2 emails)

**Trigger:** Checkout started but not completed within 1 hour.

### EMAIL 5.1 · 1 hour after abandon

**Subject:** {{firstName}}, your {{productName}} is on the way?

**Preview:** Anything blocking the checkout?

```
Hi {{firstName}},

You started checking out the {{productName}} (£{{price}}) but didn't finish.

Was something in the way? Three common ones I can fix:

  ✦ Payment didn't go through (reply with which card and I'll check)
  ✦ Wanted to think about it (no problem — link below holds your slot)
  ✦ Have a question I can answer first (reply with it, I'm here)

If nothing's wrong, finish here: {{checkoutUrl}}

— Arora
```

### EMAIL 5.2 · 24 hours after abandon

**Subject:** Final note on the {{productName}}

**Preview:** No follow-ups after this.

```
Hi {{firstName}},

Last note on your unfinished checkout.

If you're sizing up which product is the right fit, the free ROI Audit (60 sec, no commitment) gives you a specific recommendation: aiprosol.com/roi-audit.

If timing isn't right — totally fine. The {{productName}} stays at £{{price}}; nothing expires.

Otherwise: {{checkoutUrl}}

— Arora
```

---

## SEQUENCE 6 · 30-DAY RE-ENGAGEMENT (1 email)

**Trigger:** No activity in 30 days from a `leads` or `newsletter` contact.

### EMAIL 6.1 · Day 30 silence

**Subject:** {{firstName}}, anything I can help with?

**Preview:** Quiet inbox. Quick check.

```
Hi {{firstName}},

A month since we last connected. Quick check.

If automation's still on the roadmap and you'd like a fresh look at the numbers (things may have changed), the ROI Audit is at aiprosol.com/roi-audit.

If it's no longer in scope — totally fine. Reply "remove" and I'll archive your record.

If something else changed (new role, new company, new priority), reply with one line and I'll adjust accordingly.

— Arora
```

---

## VARIABLE GLOSSARY · for Zapier merge tags

| Variable | Source |
|---|---|
| `{{firstName}}` | `leads.fullName` (split on space, first token) |
| `{{companyName}}` | `leads.companyName` |
| `{{employees}}` | `leads.companySize` |
| `{{monthlyRevenue}}` | `leads.monthlyRevenue` |
| `{{industry}}` | `leads.industry` |
| `{{tier}}` | `leads.tier` (Digital · Plan · Enterprise) |
| `{{annualSaving}}` | `leads.annualSavingProjection` |
| `{{weeklyHrs}}` | `leads.weeklyHoursReclaimable` |
| `{{planRec}}` | `leads.recommendedPlan` |
| `{{productRec}}` | `leads.recommendedProducts` |
| `{{caseCompany}}` `{{caseSlug}}` `{{caseSummary}}` `{{caseMetric*}}` | Look up by industry against `casestudies` |
| `{{productName}}` `{{price}}` `{{downloadUrl}}` `{{checkoutUrl}}` | From `orders` table |
| `{{planName}}` `{{architect}}` | From `subscriptions` table |
| `{{workflow1..3}}` `{{hrs1..3}}` `{{totalHrs}}` | From the architecture sign-off form |

---

## RUNBOOK · How to plug into Zapier

1. **Trigger zap** for each sequence start (CMS row created, order paid, etc.)
2. **Filter** by source/status to avoid double-fires
3. **Action: Email by Zapier** (or Mailgun/Postmark for transactional)
4. **Action: Delay** for the gap to the next email
5. **Repeat** for each email in the sequence
6. **Branch** Sequence 1 by `tier` to send the right CTA in email 1.1

Test sends: send each email from a real account to yourself first. Confirm:

- Display name reads "Arora at Aiprosol"
- All `{{merge_tags}}` resolve (no `{{undefined}}` in the body)
- Reply-to is `srijan@aiprosol.com`
- Unsubscribe link works
- Mobile rendering OK (<400px width)
