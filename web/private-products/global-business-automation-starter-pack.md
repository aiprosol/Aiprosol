# Global Business Automation Starter Pack

**The opening kit for any business taking automation seriously. 30+ workflow templates, integration map, and the audit framework Aiprosol uses with paying clients.**

Version 1.0 · 2026

---

## What's in the box

| Asset | Format | Purpose |
|------|------|------|
| 5-step process audit framework | This document (Part 1) | Same audit we run with Enterprise clients |
| 30+ workflow blueprints | This document (Part 2) | Step-by-step builds across 6 areas |
| 10 importable n8n starter workflows | `n8n-workflows/` folder | Real `.json` covering the 7 core patterns |
| Tool cost comparison spreadsheet | `tool-cost-comparison.xlsx` | Zapier vs Make vs n8n at your volume |
| Integration architecture mental model | This document (Part 3) | How the typical SMB stack connects |
| 30-day onboarding checklist | This document (Part 5) | What to set up in your first 30 days |

Buy once. Refer to it for the lifetime of your business.

---

## How to start (15 minutes)

1. **Read Part 1** — the 5-step audit. (5 min)
2. **Pick your worst-leak workflow** — the one you waste hours on weekly. (1 min)
3. **Find the matching blueprint in Part 2** by area: Sales · CS · Ops · Finance · Marketing · People. (3 min)
4. **Open the matching n8n starter** in `n8n-workflows/` and import to your n8n instance. (5 min)
5. **Run with one test payload.** Adjust ONE thing. Ship. (1 min)

You don't have to build the whole stack today. You have to ship ONE automation today.

---

## Part 1 · The 5-Step Audit Framework

Same framework we use with Enterprise clients. Apply it to your business.

### Step 1 — Map every recurring task to a frequency × duration grid

For the last 30 days, list every task you do >3 times. Note frequency (daily/weekly/monthly) and duration (minutes per occurrence).

| Task | Frequency | Duration | Total hours/month |
|------|------|------|------|
| Reply to new lead emails | Daily | 8 min | 4 hrs |
| Process Stripe refunds | Weekly | 15 min | 1 hr |
| Update CRM after meetings | Daily | 10 min | 5 hrs |
| ... | ... | ... | ... |

Pareto cut: the top 5 tasks usually consume 60-80% of the manual hours.

### Step 2 — Triage each task into one of 4 buckets

- **Automate now**: rule-based, no judgement needed (e.g. "log Stripe charge to sheet")
- **Augment with AI**: judgement needed but pattern-recognition (e.g. "categorise inbound email")  
- **Human-only**: relationship, creativity, strategic (e.g. "negotiate enterprise contract")
- **Eliminate**: doing this at all is the bug (e.g. "weekly status report nobody reads")

The "Eliminate" bucket is the cheapest win and the most under-noticed. Often 10-15% of recurring work simply shouldn't be done.

### Step 3 — Score each automate-now / augment task on impact × ease

**Impact** = hours/month reclaimed × $hourly cost × 12 (annual savings)  
**Ease** = build hours × 1 (high if <4 hrs), 3 (medium if 4-16 hrs), 9 (low if >16 hrs)

Sort: impact/ease descending. The top 5 are your first month of builds.

### Step 4 — Decide build tool per task

Use the tool selection grid in `tool-cost-comparison.xlsx`. Generally:
- Under 100 runs/day, custom logic light → Zapier
- 100–10k runs/day, branching/iterators → Make
- >10k runs/day, or you need state machines → n8n self-hosted
- Long-running drip / state machines → dedicated SaaS (Customer.io, Userlist)

### Step 5 — Ship one workflow per week for the next 12 weeks

After the audit, you have 12+ candidates. Pick the top of the impact/ease ranking. Ship one. Tune for a week. Ship the next.

Resist the temptation to "build them all in parallel." You'll launch fewer total in 12 weeks because you'll spend more time fighting context-switching than building.

---

## Part 2 · 30+ Workflow Blueprints

Each blueprint = trigger + transform + action + observability. The 10 starters in `n8n-workflows/` cover the highest-leverage 10 of these as real importable JSON. The other 20+ below are documented patterns to extend yourself using the same n8n structure:

### Sales (6)
1. Stripe charge → CRM deal stage update
2. Calendly event → AI prep brief in email
3. Inbound form → AI score → routed Slack ping
4. HubSpot closed-won → onboarding email + Drive folder
5. Lead inactive 14d → re-engagement email
6. Hot lead → 5-min SLA Slack with @AE-on-rota

### Customer Success (6)
7. Support ticket → AI categorize → assign right pod
8. NPS < 7 → CSM auto-call scheduled
9. Renewal 60d out → health score check → retention play branch
10. Customer Slack message → AI summary → log in Notion
11. Onboarding day-7 → first-action check → nudge or escalate
12. Churn risk detected → executive Slack alert

### Operations (6)
13. Daily 7am → KPI digest to Slack
14. Vendor invoice → AI extract → push to accounting
15. Calendly no-show → auto-rebook link
16. New employee → Google + Slack + Notion provisioned
17. Weekly Friday → who's overdue on tasks → manager Slack
18. Equipment / SaaS purchase → approval gate workflow

### Finance (6)
19. Stripe subscription → MRR change → dashboard update
20. Refund issued → GL adjustment entry
21. Failed payment → 3-touch dunning
22. Monthly close trigger → P&L draft → Slack to CFO
23. Expense receipt photo → OCR → categorise → ledger
24. Revenue forecast model → updated weekly from CRM stage data

### Marketing (3)
25. New blog → cross-post LinkedIn + Twitter with custom hooks
26. Lead magnet download → 5-email nurture sequence
27. Webinar registration → reminder cadence + post-event follow-up

### People (3)
28. Job application → AI summary → recruiting Slack
29. New hire offer accepted → onboarding doc + 90-day plan generated
30. PTO request → auto-Slack to manager + calendar block

(+ 3 bonus cross-cutting templates inside the zip)

---

## Part 3 · The Integration Architecture Mental Model

Imagine your stack as a graph. Three layers:

**Upstream sources** (where events originate)
- Stripe (billing events) · Calendly (scheduling) · Gmail (inbound mail)
- LinkedIn / form submissions (lead capture) · Slack (team comms)

**Orchestrator layer** (where workflows live)
- n8n self-hosted OR Make.com OR Zapier (pick one per the cost spreadsheet)

**Downstream sinks** (where data lands)
- HubSpot / Pipedrive (CRM) · Notion (docs + databases) · Drive (files)
- Google Sheets (logs / ledger) · Slack (notifications) · Twilio (SMS)

Use the mental model to:
- Spot redundant integrations ("Slack and email both notify on this — pick one")
- Spot missing integrations ("nothing currently logs to Notion")
- Plan the order of automation builds (build the upstream node before the downstream)

---

## Part 4 · The Tool Cost Comparison Spreadsheet

Open `tool-cost-comparison.xlsx`. Plug in:
- Number of workflows in production
- Average runs/day per workflow

The spreadsheet calculates:
- Monthly + annual cost on Zapier Team, Make Core, n8n self-hosted, n8n Cloud Pro
- Cost per 1000 runs on each
- A recommendation for which tool wins at your scale

For most 10-50 person businesses, the break-even from Zapier to Make is ~15 workflows × 50 runs/day. From Make to n8n self-hosted is ~30 workflows × 200 runs/day.

---

## Part 5 · 30-Day Onboarding Checklist

A self-contained list of what to set up in your first 30 days with this starter pack:

**Week 1 — Foundations**
- [ ] Read Part 1 (audit framework) end-to-end
- [ ] Complete the audit for your top 5 recurring tasks
- [ ] Pick your orchestrator (Zapier / Make / n8n) using `tool-cost-comparison.xlsx`
- [ ] Import 1 starter workflow from `n8n-workflows/`
- [ ] Run it with a test payload end-to-end

**Week 2 — First production workflow**
- [ ] Pick the highest-impact item from your audit
- [ ] Find a matching pattern in Part 2 or an n8n starter
- [ ] Build it in your tool
- [ ] Replace placeholder credentials
- [ ] Ship to production with a 1-week monitoring window

**Week 3 — Second production workflow**
- [ ] Pick next-highest item from audit
- [ ] Build using lessons from week 2
- [ ] Add failure-notification step
- [ ] Document owner of record in workflow description

**Week 4 — Compound**
- [ ] Add 1 more workflow (now you have 3 live)
- [ ] Add weekly KPI digest (use starter `05-ops-daily-kpi-digest.json`)
- [ ] Audit cost-per-run vs spreadsheet predictions
- [ ] Plan next month's 4 workflows from remaining audit items

By Day 30 you should have 4 workflows live, a weekly KPI digest, and a real number for hours reclaimed.

---

## Ship Today

Open `n8n-workflows/`. Pick one starter that matches a task you did >3 times last week. Import it. Run it.

That's it. The audit can wait until tomorrow. The compounding starts when you ship.

---

*If you want this entire setup done for you, see the Aiprosol Starter Plan at $997/mo: aiprosol.com/pricing.*
