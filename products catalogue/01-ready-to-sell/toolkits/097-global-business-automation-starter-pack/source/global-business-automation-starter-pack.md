# The Global Business Automation Starter Pack

**30+ ready-to-deploy automation recipes covering lead intake, sales, customer success, ops, documents, reporting, and HR. Each recipe: trigger, AI logic, outputs, tools, time saved.**

Version 1.0 · 2026 · © Aiprosol Ltd

---

## What this is

This is the recipe library Aiprosol uses with paying clients on Day 1 of every engagement. We turned the same 30+ patterns into self-serve recipes you can implement yourself, in a weekend, on free / cheap tools.

**Each recipe follows the same eight-field structure:**

- **Name** — the canonical name for the automation
- **Problem** — what manual work it replaces
- **Trigger** — the event that fires it
- **AI logic** — what the LLM step does (where applicable)
- **Outputs** — what the automation produces
- **Tools** — the stack (defaults to Make + free tiers)
- **Time to build** — realistic estimate for a non-engineer
- **Time saved** — per week, for a typical SMB

**Stack assumed throughout:** Make.com (free or $9/mo), OpenAI API (~$0.001-$0.005/run), Google Workspace, Slack (free tier OK).

---

# §1 · Lead intake & qualification (5 recipes)

## 1.1 — Inbound form → CRM record + Slack ping + ROI score

- **Problem:** Web-form submissions sit in your inbox unread for hours. Manual CRM entry takes 12 min/lead.
- **Trigger:** Form submission (Typeform, Tally, Webflow form, contact-page POST).
- **AI logic:** OpenAI scores the lead 1-100 based on submitted fields + your scoring rubric (paste it in the prompt). Higher than 70 = "hot".
- **Outputs:** CRM record created, Slack ping with score badge (`🔥 HOT 87/100`), assigned to the right rep based on territory.
- **Tools:** Form provider · Make · OpenAI · HubSpot/Notion CRM · Slack.
- **Time to build:** 45 min.
- **Time saved:** 3.5 hrs/wk per 50 leads.

## 1.2 — Lead-magnet download → 5-email nurture sequence

- **Problem:** Someone downloads your free guide, then you forget about them for 3 weeks.
- **Trigger:** Form submission with `lead_magnet_id`.
- **AI logic:** None for trigger — but emails 2-5 use AI to personalise opening line based on submitted role/industry.
- **Outputs:** Auto-enrolled in a 5-email sequence (immediately, day 2, day 5, day 10, day 21). Email 5 is a clear "ready to talk?" CTA.
- **Tools:** Resend or Mailchimp · Make.
- **Time to build:** 90 min (mostly writing the 5 emails once).
- **Time saved:** 4 hrs/wk + 2-3× higher conversion vs. manual nurture.

## 1.3 — LinkedIn lead → enriched profile + outreach draft

- **Problem:** You connect with someone on LinkedIn → losing their context within 48 hrs.
- **Trigger:** New LinkedIn connection (via Phantombuster or LinkedIn Sales Navigator export).
- **AI logic:** OpenAI reads their LinkedIn `about` + recent posts + role → drafts a personal opening message referencing something specific.
- **Outputs:** Notion record + queued draft message in your LinkedIn inbox (manual send by you).
- **Tools:** Phantombuster · Make · OpenAI · Notion.
- **Time to build:** 2 hrs.
- **Time saved:** 6 hrs/wk for active LinkedIn outbound.

## 1.4 — Calendar booking → confirmation email + research brief + Slack channel

- **Problem:** Someone books a call → you scramble to research them 5 min before.
- **Trigger:** Cal.com / Calendly / SavvyCal booking event.
- **AI logic:** OpenAI compiles a 1-page brief from public data on the prospect (LinkedIn + company website + recent news).
- **Outputs:** Email confirmation to prospect, brief PDF in your prep folder, Slack channel created if it's a multi-stakeholder deal.
- **Tools:** Cal.com · Make · OpenAI · Google Drive · Slack.
- **Time to build:** 90 min.
- **Time saved:** 1.5 hrs/wk + measurably better calls.

## 1.5 — Cold-email reply → AI-classified + auto-routed

- **Problem:** Replies to cold-email campaigns mix interested, not-now, unsubscribe, out-of-office. Each needs different handling.
- **Trigger:** Reply received in cold-email inbox.
- **AI logic:** Classify into `INTERESTED · NOT_NOW · NEVER · OOO · OTHER`. For `INTERESTED`, draft a personalised follow-up. For `NEVER`, auto-add to suppression list.
- **Outputs:** Routed to the right downstream automation.
- **Tools:** Smartlead/Instantly · Make · OpenAI.
- **Time to build:** 1 hr.
- **Time saved:** 5 hrs/wk for active outbound.

---

# §2 · Sales pipeline & deal flow (5 recipes)

## 2.1 — Deal stage change → drafts the next-step email

- **Problem:** Each pipeline stage has standard "what do I send next" needs (proposal sent → contract; signed → onboarding; etc.). Reps forget or under-write.
- **Trigger:** Deal stage changes in CRM.
- **AI logic:** Reads the deal context (industry, deal size, last note) + the new stage → drafts the appropriate next email (proposal, contract send, kickoff scheduling, etc.).
- **Outputs:** Draft queued in rep's inbox for one-click send.
- **Tools:** HubSpot/Pipedrive · Make · OpenAI · Gmail.
- **Time to build:** 2 hrs.
- **Time saved:** 3 hrs/wk per rep.

## 2.2 — Stale-deal radar (no activity > N days)

- **Problem:** Deals quietly die in the pipeline because no-one followed up.
- **Trigger:** Daily 9 am scan of all open deals.
- **AI logic:** Filter: deals with no logged activity in 14 days. AI drafts a "checking in, no pressure" email tailored to the deal's last context.
- **Outputs:** Slack list to the rep, drafts queued.
- **Tools:** CRM · Make · OpenAI.
- **Time to build:** 1.5 hrs.
- **Time saved:** Indirect — typically recovers 8-15% of stale-deal pipeline.

## 2.3 — Proposal generated from a sales-call transcript

- **Problem:** Hour-long discovery call → reps spend 90 min writing a proposal.
- **Trigger:** Call recording uploaded to Fathom/Otter/Granola.
- **AI logic:** OpenAI reads the transcript → extracts customer pain points, stated KPIs, budget range, decision criteria → fills a proposal template.
- **Outputs:** Filled proposal in Google Docs, ready for review.
- **Tools:** Fathom · Make · OpenAI · Google Docs.
- **Time to build:** 3 hrs.
- **Time saved:** 6-8 hrs/wk per rep.

## 2.4 — Contract signed → handover everything in 60 sec

- **Problem:** Signed contract → 4 manual steps (welcome email, project workspace, kickoff scheduling, internal team announcement). Routinely takes 24-48 hrs.
- **Trigger:** DocuSign / PandaDoc / Stripe Tax signature event.
- **AI logic:** Lightweight — pulls customer name + plan + start date + assigned PM.
- **Outputs:** Welcome email sent, Notion/Asana project created, kickoff slot proposed, Slack #customers channel announces.
- **Tools:** DocuSign · Make · multiple destinations.
- **Time to build:** 2 hrs.
- **Time saved:** 2 hrs per signed deal.

## 2.5 — Lost deal post-mortem auto-prompt

- **Problem:** Closed-lost deals don't get analysed → same patterns of loss repeat.
- **Trigger:** Deal moved to `Closed Lost` stage.
- **AI logic:** Drafts 5 questions for the rep based on deal context (industry, deal size, who they lost to). Forwards to email or Notion form.
- **Outputs:** Rep gets a 5-question reflection prompt within 24 hrs of loss. Responses aggregate to a quarterly loss-pattern dashboard.
- **Tools:** CRM · Make · OpenAI · Notion form.
- **Time to build:** 1 hr.
- **Time saved:** Indirect — pattern detection across 6+ months.

---

# §3 · Customer success & onboarding (4 recipes)

## 3.1 — Welcome packet auto-send (within 60 sec of signup)
## 3.2 — Onboarding milestone tracker (auto-flag stuck customers)
## 3.3 — Quarterly business review auto-draft from usage data
## 3.4 — At-risk customer early-warning (engagement drop > 50%)

> *Each follows the eight-field recipe structure — pages 18-32.*

---

# §4 · Internal ops (5 recipes)

## 4.1 — Slack channel daily summariser
- **Trigger:** Daily 6 pm.
- **AI:** Summarise last 24 hrs of #general / #engineering / #sales into 5-bullet digest.
- **Output:** Posted to #daily-digest channel.
- **Time saved:** 4 hrs/wk for senior staff.

## 4.2 — Meeting transcript → action items + owners + due dates
## 4.3 — Standup auto-aggregator (3 questions, async)
## 4.4 — Vendor-renewal 60-day radar with cost data
## 4.5 — Time-off request auto-routing + coverage check

---

# §5 · Document automation (4 recipes)

## 5.1 — Invoice OCR → accounting tool
- **Trigger:** PDF lands in `accounts@yourdomain` or Drive folder.
- **AI:** Extract `vendor · date · amount · category · invoice_id` via OpenAI vision.
- **Output:** New entry in Xero/QuickBooks + filed in Drive folder by month.
- **Time saved:** 3-6 hrs/wk depending on volume.

## 5.2 — Contract redline assistant
## 5.3 — Receipts photo → categorised expense
## 5.4 — Compliance document auto-flagger (find clauses requiring review)

---

# §6 · Reporting & dashboards (3 recipes)

## 6.1 — Weekly board update auto-draft
- **Trigger:** Friday 4 pm scheduled.
- **AI:** Pulls Stripe revenue, CRM pipeline, support volume, NPS → drafts a 3-paragraph board update in your voice.
- **Output:** Drafted email queued for your review + send.
- **Time saved:** 90 min/wk.

## 6.2 — Customer-success monthly health report
## 6.3 — Marketing channel attribution dashboard

---

# §7 · Recruiting & HR (4 recipes)

## 7.1 — Inbound application AI-screen (against role criteria)
## 7.2 — Interview scheduling cross-panel
## 7.3 — Reference check auto-distribute (5-question form to 3 references)
## 7.4 — Onboarding 30/60/90 plan generator from role description

---

# Implementation order — recommended sequence

If you build all 30, do them in this order. The dependencies and compounding effects are real.

| Week | Recipes | Cumulative time saved (typical SMB) |
|---|---|---|
| 1 | §1.1, §1.4, §2.1, §6.1, §3.1 | 14 hrs/wk |
| 2 | §1.2, §1.5, §2.2, §2.4, §4.1 | 22 hrs/wk |
| 3 | §1.3, §2.3, §2.5, §3.2, §4.2 | 30 hrs/wk |
| 4 | §3.3, §3.4, §4.3, §4.4, §4.5 | 36 hrs/wk |
| 5 | §5.1, §5.2, §5.3, §5.4, §6.2 | 42 hrs/wk |
| 6 | §6.3, §7.1, §7.2, §7.3, §7.4 | 47 hrs/wk |

A 6-week build, ~6 hrs/week of your time, leaves you with 47 hrs/wk reclaimed forever.

---

# Tooling summary

For all 30 recipes, this is the maximum stack you'd need:

| Layer | Tool | Cost | Why |
|---|---|---|---|
| Workflow runner | Make.com | $9/mo (Core) | Best visual debugger for SMBs |
| LLM | OpenAI API | ~$15/mo | Default for AI steps; swap for Claude API for higher-quality outputs |
| Email | Gmail or Resend | $0 / $20 | Resend if you have transactional volume |
| CRM | HubSpot Free | $0 | Hits limits at 1k contacts, then $20/mo |
| Sheets / docs | Google Workspace | Existing | Where data lands |
| Slack | Slack Free | $0 | Channels for digests / pings |
| Calendar | Cal.com or Calendly | $0-$15 | Booking flows |
| Forms | Tally or Typeform | $0-$25 | Inbound capture |

**Total: ~$50-$75/month for a fully-automated 30-recipe stack.** ROI: ~50× at any reasonable hourly rate.

---

## Licensing

Licensed for unlimited internal use. Redistribution of recipes verbatim or sale of the recipe library to your own customers requires written permission. © 2026 Aiprosol Ltd. Questions: hello@aiprosol.com
