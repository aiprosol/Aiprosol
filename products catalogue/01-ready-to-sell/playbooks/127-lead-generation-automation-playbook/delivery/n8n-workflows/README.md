# Aiprosol — Lead Generation Automation n8n Workflow Templates

Version 1.0 · 12 workflows · © 2026 Aiprosol Ltd

## How to use

1. **Import a workflow:** n8n → Workflows → Import from File.
2. **Set credentials:** placeholder credentials need to be replaced with your own.
3. **Replace placeholder IDs:** look for `*_SHEET_ID`, `*_FOLDER_ID`, `USER_ID` etc.
4. **Test before going live** — Phase 1 (output for review) for 2 weeks first.

## Workflows

### 1. Lead form → 4-component ICP scoring (FIT/INTENT/ENGAGEMENT/URGENCY)
- File: `01-lead-form-4-component-scoring.json` (10 nodes) · Tags: lead-gen, scoring, pattern-3
- The canonical lead-scoring workflow. Form webhook → 4 parallel AI scorers (FIT, INTENT, ENGAGEMENT, URGENCY) → composite score 0-100 → write to CRM + Slack alert if hot.

### 2. AI chat qualifier → email capture after 3 exchanges
- File: `02-chat-qualifier-to-email-capture.json` (7 nodes) · Tags: lead-gen, chat, pattern-2
- Chat widget webhook fires after every visitor message. Workflow tracks conversation depth — when 3+ messages exchanged, AI generates 'want me to email you a personalised plan?' prompt + captures email. Lead written to CRM.

### 3. Demo booking → instant prep brief auto-research
- File: `03-demo-booking-prep-brief.json` (7 nodes) · Tags: lead-gen, enrichment, pattern-1
- Cal.com/Calendly webhook on booking. Workflow pulls attendee email → enriches via Clearbit/Apollo → scrapes their site → drafts 1-page sales prep brief in Google Doc → DMs the rep with link 60 seconds after booking.

### 4. Suppression list + geographic routing gate
- File: `04-suppression-geo-routing.json` (7 nodes) · Tags: lead-gen, routing, pattern-2
- Every new lead goes through this pre-routing workflow. Checks suppression list (Google Sheet) → checks blocked countries → checks size band → routes to correct downstream sequence (or halts).

### 5. 5-touch nurture — Email 1 (Day 0) — instant value
- File: `05-nurture-instant-value.json` (6 nodes) · Tags: lead-gen, nurture, day-0
- Part of the 5-email warm-lead nurture sequence. Fires 0 days after lead capture. AI personalises the body based on the lead's submitted role + industry + stated problem.

### 6. 5-touch nurture — Email 2 (Day 2) — applied insight
- File: `06-nurture-applied-insight.json` (6 nodes) · Tags: lead-gen, nurture, day-2
- Part of the 5-email warm-lead nurture sequence. Fires 2 days after lead capture. AI personalises the body based on the lead's submitted role + industry + stated problem.

### 7. 5-touch nurture — Email 3 (Day 5) — counter-intuitive
- File: `07-nurture-counter-intuitive.json` (6 nodes) · Tags: lead-gen, nurture, day-5
- Part of the 5-email warm-lead nurture sequence. Fires 5 days after lead capture. AI personalises the body based on the lead's submitted role + industry + stated problem.

### 8. 5-touch nurture — Email 4 (Day 10) — three options
- File: `08-nurture-three-options.json` (6 nodes) · Tags: lead-gen, nurture, day-10
- Part of the 5-email warm-lead nurture sequence. Fires 10 days after lead capture. AI personalises the body based on the lead's submitted role + industry + stated problem.

### 9. 5-touch nurture — Email 5 (Day 21) — graceful close
- File: `09-nurture-graceful-close.json` (6 nodes) · Tags: lead-gen, nurture, day-21
- Part of the 5-email warm-lead nurture sequence. Fires 21 days after lead capture. AI personalises the body based on the lead's submitted role + industry + stated problem.

### 10. Round-robin rep assignment with territory + workload
- File: `10-round-robin-assignment.json` (9 nodes) · Tags: lead-gen, sla, routing
- Hot lead arrives → check territory map → check rep current load → assign to next eligible rep → Slack the rep with 5-min SLA → 24h escalation if no contact.

### 11. Weekly closed-loop: scoring iteration based on closed deals
- File: `11-weekly-scoring-iteration.json` (7 nodes) · Tags: lead-gen, iteration, pattern-4
- Every Monday: pull closed-won + closed-lost deals from past 90 days → look up original lead scores → identify which scoring components predicted outcomes → Slack a recommendation to adjust weights.

### 12. Lead-gen dashboard daily refresh
- File: `12-leadgen-dashboard-daily.json` (5 nodes) · Tags: lead-gen, dashboard, pattern-4
- Daily 8am: pull lead volume, score distribution, by-source attribution, conversion rate, time-to-first-contact → update a Notion (or Google Sheets) dashboard → Slack a daily 4-line summary.
