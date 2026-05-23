# Aiprosol — Global Business Starter Pack n8n Workflow Templates

Version 1.0 · 10 workflows · © 2026 Aiprosol Ltd

## How to use

1. **Import a workflow:** n8n → Workflows → Import from File.
2. **Set credentials:** placeholder credentials need to be replaced with your own.
3. **Replace placeholder IDs:** look for `*_SHEET_ID`, `*_FOLDER_ID`, `USER_ID` etc.
4. **Test before going live** — Phase 1 (output for review) for 2 weeks first.

## Workflows

### 1. Contact form → instant email reply + log
- File: `01-starter-contact-form-to-email.json` (4 nodes) · Tags: starter, lead-capture
- The simplest possible: webhook from your site contact form → AI generates a personalised acknowledgement reply → sends via Gmail → logs to a Google Sheet. 4 nodes.

### 2. Stripe payment → Sheet log + Slack
- File: `02-starter-stripe-revenue-log.json` (3 nodes) · Tags: starter, revenue
- Every Stripe payment writes a row to a Sales Log sheet and pings #sales channel. The Day-2 challenge automation.

### 3. Gmail inbox → AI auto-label
- File: `03-starter-gmail-classifier.json` (4 nodes) · Tags: starter, inbox, pattern-2
- Every new email gets AI-classified into 7 categories and the matching Gmail label is applied. Saves 30 min/day of inbox triage.

### 4. Calendar event → prep brief 2hrs before
- File: `04-starter-calendar-prep-brief.json` (5 nodes) · Tags: starter, calendar
- Two hours before any calendar event with an external attendee, AI scrapes their domain and posts a one-line summary to Slack.

### 5. New social mention → Slack ping
- File: `05-starter-instagram-to-slack.json` (4 nodes) · Tags: starter, social, pattern-5
- Polls Twitter/X (and optional Instagram) for new mentions of your brand → Slack ping with sentiment label so you can engage in real-time.

### 6. Invoice email → forward + log to accounting sheet
- File: `06-starter-invoice-to-accountant.json` (4 nodes) · Tags: starter, finance, pattern-1
- Vendor invoice arrives via email → AI extracts vendor + amount + due date → row appended to Accounting Log → original PDF auto-filed in Drive.

### 7. Website form → simple CRM entry
- File: `07-starter-website-form-to-crm.json` (4 nodes) · Tags: starter, lead-capture, pattern-1
- Form submission → AI extracts company + role from email signature → row appended to a Leads sheet (basic CRM). No HubSpot needed.

### 8. Weekly Stripe revenue summary
- File: `08-starter-weekly-stripe-summary.json` (4 nodes) · Tags: starter, reporting, pattern-4
- Every Friday 17:00: aggregates this week's Stripe revenue + customer count + biggest sale → emails the founder a 4-line summary.

### 9. 30-day NPS pulse — single-question email
- File: `09-starter-nps-pulse.json` (3 nodes) · Tags: starter, feedback, pattern-7
- 30 days after every Stripe customer is created, send them a 1-question NPS email. Responses logged in a Sheet.

### 10. Meta-automation — daily health check on your other workflows
- File: `10-starter-meta-automation-monitor.json` (4 nodes) · Tags: starter, meta-monitoring, pattern-4
- Every morning 7am: queries n8n API for executions of all your workflows in the past 24h → flags any with >5% failure rate → Slack ping. The starter version of automation-monitoring.
