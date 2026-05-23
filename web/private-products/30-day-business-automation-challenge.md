# The 30-Day Business Automation Challenge

**Daily prompt + action for 30 days. Most participants ship 5+ automations by day 20 and reclaim 32–48 hours/week by day 30.**

Version 1.0 · 2026 · 30 daily exercises · Includes 25 starter n8n workflows

---

## How this works

Each day is one 15–25 minute exercise. No "watch a 4-hour lecture" days. You do something concrete.

Each exercise has:
- **The action** (what to do)
- **Success criterion** (how you know it's done)
- **Common pitfall** (what people get wrong)
- **Ship cue** (do this before closing your laptop)

If you fall behind, don't restart — pick up where you left off. The compounding is what matters, not the calendar.

---

## Week 1 · Foundation (Days 1–7)

### Day 1 — Build your control panel

**Action**: Create a single Notion/Airtable page titled "Automation Control Panel." Add four sections: Workflows Live, Tools In Use, Numbers I Track Weekly, This Week's One Build.

**Success**: You can see in 10 seconds what's running in your business.

**Pitfall**: Trying to populate it perfectly before moving on. Sketch quickly, refine over the 30 days.

**Ship cue**: Bookmark the page. Pin it.

### Day 2 — Stripe → spreadsheet revenue log

**Action**: Use Zapier/Make/n8n to log every `charge.succeeded` event to a Google Sheet. Columns: timestamp, customer, amount, product, currency.

**Success**: A new row appears in the sheet within 60s of a real charge.

**Pitfall**: Skipping the "currency" column. You'll regret it the first time you process a non-USD charge.

**Ship cue**: Set the sheet as your phone's home-screen widget. Watch the row count climb.

### Day 3 — Gmail inbox classifier

**Action**: Build a workflow that reads new Gmail messages, sends the subject + first 200 chars to OpenAI/Claude, asks "Is this: (a) customer, (b) vendor, (c) recruiter, (d) other?" — and applies a Gmail label.

**Success**: 80%+ of incoming mail gets correctly labelled within 5 minutes of arrival.

**Pitfall**: Trying to use AI to AUTO-REPLY on day 3. Just label for now. Reply manually for a week to see the labelling accuracy.

**Ship cue**: Check the Promotions label tomorrow. Anything obviously misclassified? Adjust prompt.

### Day 4 — CRM auto-create on form submit

**Action**: Your contact / ROI audit / demo form should write directly to your CRM (HubSpot Free, Pipedrive, or Notion CRM). No manual paste.

**Success**: A test submission appears as a new CRM contact in <30s.

**Pitfall**: Letting the form do nothing while you "plan the integration." If you have a form, it must write somewhere automated. If you don't have a form, build one in Tally/Typeform in 10 minutes.

**Ship cue**: Submit a test entry yourself. Confirm the CRM record.

### Day 5 — One-touch follow-up

**Action**: When a new CRM contact lands, send a templated welcome email automatically within 60 seconds. Include name personalisation.

**Success**: Test entry triggers a real email to your test address inside 60s.

**Pitfall**: Spending an hour writing the "perfect" welcome. Use 5 sentences. Improve over weeks.

**Ship cue**: Add yourself to the test path so you experience every email you send.

### Day 6 — Daily KPI digest

**Action**: Every morning at 7am UTC, a workflow gathers yesterday's stripe revenue, new leads, completed tasks, and posts it to your personal Slack DM (or email).

**Success**: Tomorrow morning, at 7am, you'll see the message.

**Pitfall**: Including 20 metrics. Start with 4. Add only after you've referenced the digest for a week.

**Ship cue**: Schedule the workflow. Walk away.

### Day 7 — Audit yesterday's manual work

**Action**: Open your calendar + browser history from Day 6. Write down 10 tasks you did manually that took >10 minutes. Rank them by frequency.

**Success**: A ranked list of 10 candidate automations sitting in your Control Panel from Day 1.

**Pitfall**: Skipping this step because it feels unproductive. This list is the entire month's roadmap. Without it, weeks 2-4 are aimless.

**Ship cue**: Top of the list is your Week 2 build. Decide now.

---

## Week 2 · Sales + Customer (Days 8–14)

### Day 8 — Attribution: where leads come from

**Action**: Add UTM tracking to every link you control (email signatures, social bios, ad links). Log first-touch source on every new CRM contact.

**Success**: Open CRM, sort by created-date, see source column populated.

**Pitfall**: Building beautiful UTM strings then forgetting to USE them in your links.

**Ship cue**: Update your LinkedIn URL today.

### Day 9 — No-show prevention

**Action**: When someone books a meeting (Calendly/Cal.com), trigger:
- 24h reminder email
- 1h reminder SMS
- 10-minute pre-call AI prep brief in Slack (researched account context)

**Success**: Tomorrow's bookings get the full sequence.

**Pitfall**: Skipping the SMS leg ("nobody reads SMS"). No-show rate drops 30-40% with SMS reminders. Pay for Twilio's $0.01/SMS.

**Ship cue**: Book a test slot with yourself, verify all 3 touches fire.

### Day 10 — Multi-touch follow-up sequence

**Action**: Anyone who hits your ROI audit / demo form goes into a 5-email sequence over 21 days. Use the patterns from the Lead Generation Playbook (Day 1, 3, 7, 14, 21).

**Success**: A test lead enters the sequence and you receive all 5 emails on the correct days.

**Pitfall**: Writing all 5 emails before launching. Write Touch 1 only. Launch. Write Touch 2 tomorrow. Ship → iterate.

**Ship cue**: Touch 1 live by end of day.

### Day 11 — Renewal alert

**Action**: 60 days before each customer's renewal date, trigger a Slack alert with: account name, current MRR, last 30 days product usage, last support interaction.

**Success**: Test alert fires for a real customer 60 days out.

**Pitfall**: Sending the alert to your team without an action ("now what?"). Pair the alert with a 5-minute "health-check call to book if usage trending down" runbook.

**Ship cue**: Document the runbook in the same Slack channel.

### Day 12 — AI ticket categoriser

**Action**: New support ticket → AI classifies as: bug, feature request, billing, onboarding, general. Auto-assigns to the right person.

**Success**: 80%+ of tickets land on the right desk first time.

**Pitfall**: Letting the AI close tickets. Categorise + route only. Humans close.

**Ship cue**: Misroutings logged for week-2 model tuning.

### Day 13 — Customer health score (light)

**Action**: For each customer, compute a 3-input health score weekly: usage trend (vs. last 30 days), support sentiment (last 5 tickets), invoice payment timeliness. Score 1-10.

**Success**: A weekly Slack message showing score trend per customer.

**Pitfall**: Trying to build a real CS health platform. Three inputs. Done. Iterate later.

**Ship cue**: Eyeball the bottom 3 scores. Schedule outreach.

### Day 14 — Week 2 review

**Action**: Open your Control Panel. Count workflows live. Note 1 thing that worked. Note 1 thing that broke. Note 1 thing you'll fix next week.

**Success**: Three lines written.

**Pitfall**: Skipping retros. Retros compound. Skipping them is the difference between operators who keep building and operators who quietly abandon the 30-day challenge by Day 22.

**Ship cue**: Take Saturday off the automation. You've earned it.

---

## Week 3 · Operations (Days 15–21)

### Day 15 — Invoice auto-generation

**Action**: New customer in CRM → auto-create invoice in your billing system (Stripe, QBO, Xero) with line items matched to their plan.

**Success**: Test signup creates a draft invoice ready to send.

**Pitfall**: Auto-sending invoices on day 15. Draft first. Manual review for first 2 weeks. Then automate the send.

**Ship cue**: Today's test invoice in draft state.

### Day 16 — Expense receipt OCR

**Action**: Forward expense receipts to a dedicated email. Workflow: OCR → extract amount + vendor + date → log to expense tracking spreadsheet.

**Success**: Email a real receipt photo. See the row appear in the sheet.

**Pitfall**: Trying to integrate with your accounting GL on day 16. Just log to a sheet. Reconcile monthly until the AI accuracy is proven.

**Ship cue**: Forward 3 old receipts. Spot-check the OCR.

### Day 17 — Content cross-posting

**Action**: When you publish a blog post / YouTube video / podcast, auto-create LinkedIn + Twitter + IG drafts with platform-appropriate hooks.

**Success**: Test post creates 3 drafts queued for your review.

**Pitfall**: Auto-PUBLISHING the cross-posts. Draft them. Manually approve. Better engagement, no brand-tone drift.

**Ship cue**: Publish one piece this week using the new pipeline.

### Day 18 — Meeting action items

**Action**: Every Calendly meeting auto-records (Fathom/Otter/Granola) → transcript → AI extracts action items → email summary to attendees.

**Success**: After today's first call, every attendee gets the summary within 15 min of hang-up.

**Pitfall**: Sending raw transcripts. AI-summarise THEN send. Two-step rule: extract action items, group by owner.

**Ship cue**: First post-call summary today. Note what's missing for tomorrow's prompt tweak.

### Day 19 — Weekly review trigger

**Action**: Every Friday 3pm: workflow aggregates the week's KPIs, biggest customer wins (CRM stage moves), open ops issues (any task >14d). Email digest to you.

**Success**: Friday 3pm tomorrow you'll see it.

**Pitfall**: Making the digest a wall of text. 5 numbers + 3 bullets. That's it.

**Ship cue**: Schedule it. Don't read it until Friday — that's the point.

### Day 20 — One thing you said you'd automate but didn't

**Action**: Pull up your Day-7 list. Pick the item you've been avoiding. Spend 25 minutes building a v1. Ship it ugly.

**Success**: A workflow runs at least once in production.

**Pitfall**: This day is the test. Most people give up here. The reason they give up: the next workflow felt harder than the first 19. It isn't — it just lacks novelty. Ship it ugly anyway.

**Ship cue**: One. More. Build.

### Day 21 — Week 3 review

**Action**: Same as Day 14. Three lines.

**Pitfall**: Discounting the review. The retros are the actual compounding.

**Ship cue**: Plan next week. One big thing.

---

## Week 4 · Compounding (Days 22–30)

### Day 22 — Customer research extraction

**Action**: Every customer email / support ticket / call transcript → AI extracts: pain mentioned, feature request, competitor mentioned, sentiment. Aggregates weekly to product Slack.

**Success**: A weekly "voice of customer" digest lands automatically.

### Day 23 — Feedback loop on automations

**Action**: For each workflow you've built, log: trigger count, success rate, average runtime. Surface anomalies (success rate dropped >10%).

**Success**: A "workflow health" dashboard.

### Day 24 — Monitoring + alerts

**Action**: Every critical workflow has: a failure notification, a weekly success report, a named human owner.

**Success**: One alert fires today (intentionally — kill a credential to test).

### Day 25 — Hiring screen automation

**Action**: New job application → AI summary (skills match, location, salary expectation, top concern). Manual decision stays human.

**Success**: Test application generates a summary in <60s.

### Day 26 — Annual review prep

**Action**: Pull every Stripe charge of the year. Bucket by product, customer, month. AI-generate the "wins / losses / questions" doc.

**Success**: A draft doc you'd actually use in your year-end planning.

### Day 27 — Documentation push

**Action**: Every workflow you've built this month gets a 3-line README in the Control Panel: trigger, action, owner. Done.

**Success**: 25+ workflows documented in <90 minutes.

### Day 28 — Cost audit

**Action**: Add up Zapier/Make/n8n + OpenAI/Claude + Twilio + Resend costs. Divide by automation count. Cost-per-workflow.

**Success**: A number. (If it's >$50/automation, you're using the wrong tool for your scale.)

### Day 29 — Pick the next 30 days

**Action**: Open your Day-7 list. What's left? Top 5 goes into next month's queue.

**Success**: A roadmap, not a wishlist.

### Day 30 — Reclaim audit

**Action**: For each workflow, estimate: hours/week reclaimed × $hourly cost = monthly $ saved.

**Total it up.** This is the number you tell your board, your spouse, yourself.

**Most participants reach: 32–48 hours/week reclaimed.** Some hit 60+.

**Success**: A real number. Real automations. 30 days. You did it.

---

## Bonus · The 10 Starter n8n Workflows

Includes the 10-workflow starter library (in the `n8n-workflows/` folder) covering the 7 core automation patterns from the Workflow Automation Playbook. Each is a real, importable n8n v1 `.json` file with placeholder credentials. Use them as scaffolds for your own builds.

See `n8n-workflows/README.md` for the file-by-file index.

---

## Ship Today (if you haven't started)

Day 1: build the Control Panel. 10 minutes. Open Notion. Title the page. Add the four sections. Close laptop.

The hardest part of this challenge is starting Day 1.

---

*If you reach Day 30 and want to compound the next layer, see aiprosol.com/services. We design + run automation systems for clients full-time.*
