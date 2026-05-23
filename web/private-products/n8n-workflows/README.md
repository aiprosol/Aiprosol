# n8n Starter Workflow Library

**25 production-shaped n8n workflows** demonstrating every core pattern from the Workflow Automation Playbook.

## How to import

1. Open your n8n instance
2. Workflows → Import from File
3. Pick a `.json` file from this folder
4. Replace credential placeholders (anything marked `REPLACE_ME`)
5. Click Activate

## Library — 25 workflows across 6 areas

### Sales (8)
- `01-sales-stripe-charge-to-hubspot.json` — Stripe charge → HubSpot deal closed-won
- `02-sales-calendly-ai-prep-brief.json` — Calendly booking → AI prep brief → email
- `03-sales-form-score-route-slack.json` — Form submit → AI score → Slack
- `08-sales-cold-reply-intent-classifier.json` — Cold reply → AI intent classifier
- `11-sales-lead-inactive-reengagement.json` — Lead inactive 14d → re-engagement
- `12-sales-closed-won-onboarding.json` — Closed-won → onboarding kickoff
- `13-sales-hot-lead-5min-sla.json` — Hot lead → 5-min SLA + escalation

### Customer Success (5)
- `04-cs-support-ticket-ai-categorise.json` — Ticket → Claude classify → Slack
- `07-cs-nps-low-detractor-alert.json` — NPS < 7 → CSM Slack
- `10-cs-onboarding-day-3-nudge.json` — Onboarding state machine
- `14-cs-renewal-health-check.json` — Renewal 60d → health score → retention
- `15-cs-customer-slack-summarise.json` — Customer Slack → AI summary → Notion
- `16-cs-churn-signal-warning.json` — Churn signal early warning

### Operations (4)
- `05-ops-daily-kpi-digest.json` — Cron 7am → daily KPI digest to Slack
- `17-ops-calendly-no-show-rebook.json` — No-show → auto-rebook email
- `18-ops-new-employee-provisioning.json` — New hire → Google + Slack + Notion
- `19-ops-weekly-overdue-tasks.json` — Friday overdue tasks → owner DMs

### Finance (3)
- `06-finance-invoice-extract.json` — Vendor invoice → AI extract → Sheet
- `20-finance-stripe-subscription-mrr.json` — Stripe new sub → MRR log → Slack
- `21-finance-failed-payment-dunning.json` — Failed payment → 3-touch dunning

### Marketing (3)
- `09-marketing-blog-cross-post.json` — Blog publish → AI cross-post drafts
- `22-marketing-lead-magnet-nurture.json` — Lead magnet → 5-email nurture
- `23-marketing-webinar-reminder.json` — Webinar registration → reminder cadence

### People (2)
- `24-people-job-application-ai-summary.json` — Application → AI summary → recruiting Slack
- `25-people-pto-request-approval.json` — PTO request → manager Slack + calendar

## Honest notes

- Credentials are placeholders. Replace `REPLACE_ME` in each workflow's credentials section.
- IDs (Notion DB, Sheet, channel names, supabase URLs) are placeholders. Replace before activating.
- Test in n8n's test mode with sample payloads before activating. Production-ready ≠ no testing.
- These are scaffolds covering the patterns — extend to your specific stack.

— Aiprosol · aiprosol.com