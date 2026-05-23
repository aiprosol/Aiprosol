# Aiprosol — 25 n8n Workflow Templates

Version 1.0 · 25 workflows · © 2026 Aiprosol Ltd

## How to use

1. **Import a workflow:** in n8n → Workflows → Import from File → pick a `.json` from this folder.
2. **Set credentials:** each workflow uses placeholder credential references. Replace with your own OpenAI / Slack / HubSpot / etc. credentials.
3. **Replace placeholder IDs:** look for `*_FOLDER_ID`, `*_DB_ID`, `TEAM_ID` etc. in the JSON — these are placeholders.
4. **Test before going live:** every workflow should run in 'Phase 1' (output for review only) for 2 weeks before unattended use.

## The 25 workflows

### 1. Inbound lead → CRM + lead score + Slack
- **File:** `01-inbound-lead-score-route.json` (7 nodes)
- **Tags:** sales, lead-gen, pattern-1
- Sales — Pattern 1 (linear pipeline). Webhook trigger receives lead form data. OpenAI scores against ICP. HubSpot creates contact. Slack pings sales channel with score and one-line summary.

### 2. Discovery-call recording → action items + draft proposal
- **File:** `02-discovery-call-to-proposal.json` (5 nodes)
- **Tags:** sales, ai-drafting, pattern-1
- Sales — Pattern 1 + AI. Triggered when Fireflies/Otter posts a meeting transcript webhook. Extracts: pain points, budget signals, decision criteria, next steps. Drafts a tailored proposal in Google Docs.

### 3. Stale-deal radar — daily pipeline hygiene
- **File:** `03-stale-deal-radar.json` (5 nodes)
- **Tags:** sales, pipeline-hygiene, pattern-4
- Sales — Pattern 4 (scheduled aggregation). Every weekday 8am pull all deals from HubSpot, find ones with no activity in >14 days, post a digest to Slack with last-touch dates and recommended next actions.

### 4. Pipeline review prep auto-doc
- **File:** `04-pipeline-review-autodoc.json` (6 nodes)
- **Tags:** sales, reporting, pattern-4
- Sales — Pattern 4. Every Monday 7am pulls all deals, groups by stage, computes totals + week-over-week changes, generates a markdown brief in Notion. Sales lead opens it before the 10am pipeline meeting.

### 5. Deal stage change → AI-drafted next-step email
- **File:** `05-deal-stage-change-email.json` (6 nodes)
- **Tags:** sales, ai-drafting, pattern-1
- Sales — Pattern 1 + Approval gate. HubSpot webhook fires on deal stage change. AI drafts the appropriate next email based on which stage was entered (demo-booked → confirmation, proposal-sent → check-in, etc.). Saves as draft in Gmail.

### 6. Welcome packet — 60-second customer onboarding fan-out
- **File:** `06-welcome-packet-fanout.json` (6 nodes)
- **Tags:** customer-success, onboarding, pattern-3
- Customer success — Pattern 3 (fan-out). Stripe new-customer webhook fires 5 actions in parallel: welcome email, Slack #customers channel ping, Notion project workspace, calendar kickoff slot, Trello onboarding board.

### 7. Onboarding milestone tracker — Day 1/7/30 checkpoints
- **File:** `07-onboarding-milestones.json` (7 nodes)
- **Tags:** customer-success, long-running, pattern-7
- Customer success — Pattern 7 (long-running orchestrator). On new customer, schedules 3 future checkpoints: Day 1 'how was kickoff?', Day 7 'first deliverable shipped?', Day 30 'are you using the thing?'. Each fires an automated check + Slack if a milestone is missed.

### 8. At-risk customer early-warning — daily scan
- **File:** `08-at-risk-early-warning.json` (6 nodes)
- **Tags:** customer-success, retention, pattern-4
- Customer success — Pattern 4. Every day 8am pull all active customers, check for at-risk signals (no login 14d, support tickets +50%, NPS<7, payment retry). AI scores risk 0-100. Anyone over 60 → Slack ping CS lead with full context.

### 9. Quarterly Business Review auto-draft from usage data
- **File:** `09-qbr-autodraft.json` (6 nodes)
- **Tags:** customer-success, reporting, pattern-4
- Customer success — Pattern 4. On the 1st of each new quarter, for each active customer, pull last 90 days of usage + outcomes data, generate a draft QBR slide deck (markdown that Google Slides API converts to deck). CS team edits + presents.

### 10. NPS detractor recovery loop
- **File:** `10-nps-detractor-recovery.json` (6 nodes)
- **Tags:** customer-success, branching, pattern-2
- Customer success — Pattern 2 (branching by classifier). NPS response webhook arrives. Score 0-6 = detractor → branch into AI-generated personal apology + recovery offer + book-call CTA; 7-8 = passive → ask for one specific improvement; 9-10 = promoter → ask for testimonial + referral.

### 11. Slack channel daily summariser
- **File:** `11-slack-daily-summariser.json` (7 nodes)
- **Tags:** operations, summarisation, pattern-4
- Operations — Pattern 4. Every 18:00 reads the last 24h of messages from configured channels (e.g., #engineering, #sales, #cs), runs AI summary, posts 'what happened today in 5 bullets' to #daily-digest.

### 12. Meeting recording → action items + owner assignment
- **File:** `12-meeting-action-items.json` (5 nodes)
- **Tags:** operations, meetings, pattern-1
- Operations — Pattern 1 + AI. Fireflies/Otter webhook posts meeting transcript. AI extracts action items with proposed owners. Posts to Slack + creates Linear/Asana tasks for each.

### 13. Vendor renewal radar — 60-day forward look
- **File:** `13-vendor-renewal-radar.json` (5 nodes)
- **Tags:** operations, finance, pattern-4
- Operations — Pattern 4. Daily 9am pull all vendors from Notion DB. For any renewing within 60 days: pull last-90d usage if SaaS, draft a 'keep / negotiate / cancel' note via AI, ping the finance channel with priority sorted by spend.

### 14. Document filing auto-router (Drive uploads → AI-categorised → moved)
- **File:** `14-document-filing.json` (7 nodes)
- **Tags:** operations, documents, pattern-2
- Operations — Pattern 2. New file in Drive 'Inbox' folder → AI classifies (invoice / contract / receipt / proposal / personal) → moved to right destination folder + tagged.

### 15. Async standup aggregator
- **File:** `15-async-standup.json` (7 nodes)
- **Tags:** operations, team, pattern-4
- Operations — Pattern 4. Every weekday 9:30, post a standup prompt in DM to each team member; collect responses by 10:00; AI-summarise blockers across team; post to #standup channel.

### 16. Invoice OCR → accounting system entry
- **File:** `16-invoice-ocr-accounting.json` (5 nodes)
- **Tags:** finance, ocr, pattern-1
- Documents & finance — Pattern 1 + vision. Email with PDF attachment hits accounts@yourdomain → AI vision extracts vendor, amount, due date, line items → creates entry in Xero / QuickBooks → Slack confirm + file in Drive.

### 17. Receipt photo → categorised expense in accounting tool
- **File:** `17-receipt-photo-expense.json` (4 nodes)
- **Tags:** finance, ocr, pattern-1
- Documents & finance — Pattern 1 + vision. Photo uploaded to a 'Receipts' Drive folder (or sent to receipts@) → AI extracts vendor, amount, category → posted to Brex/Ramp/QuickBooks as an expense.

### 18. Contract redline assistant (approval-gated)
- **File:** `18-contract-redline-assistant.json` (3 nodes)
- **Tags:** finance, legal, pattern-6
- Documents & finance — Pattern 6 (approval gate). New contract dropped in a Drive folder → AI compares to your standard terms → flags risky clauses → posts a Slack thread with 'Approve / Edit / Reject' buttons → only files final version when approved.

### 19. Tax document auto-collator (year-end)
- **File:** `19-tax-document-collator.json` (7 nodes)
- **Tags:** finance, tax, pattern-4
- Documents & finance — Pattern 4. December 15th cron: pulls all invoices, receipts, payroll reports from the year → AI generates a categorised summary + missing-document checklist → emails the accountant. Saves a week of January chaos.

### 20. Cash position daily snapshot
- **File:** `20-cash-position-daily.json` (7 nodes)
- **Tags:** finance, cash, pattern-4
- Documents & finance — Pattern 4. Every weekday 8:30 pull bank balances (Plaid / banking API) + AR aging + AP due-in-7d → assemble a 4-line cash summary → post to #finance.

### 21. Inbound customer question → blog post idea
- **File:** `21-question-to-blog-idea.json` (6 nodes)
- **Tags:** marketing, content, pattern-4
- Marketing & content — Pattern 4. Weekly Mon 9am scan: all customer-support emails + chat questions from the past week → AI clusters into themes → for each theme of >3 questions, draft a blog post outline → post to #content channel for review.

### 22. Competitor changelog / blog monitor
- **File:** `22-competitor-changelog-monitor.json` (5 nodes)
- **Tags:** marketing, competitive, pattern-5
- Marketing & content — Pattern 5 (polling). Every Monday 10am poll RSS feeds of 5 competitor blogs + changelog pages → AI summarises what shipped → ranks 'genuine threat / interesting / noise' → Slack #competitive-intel.

### 23. Cross-channel content distribution (one source → 5 channels)
- **File:** `23-cross-channel-distribution.json` (7 nodes)
- **Tags:** marketing, distribution, pattern-3
- Marketing & content — Pattern 3 (fan-out). New blog post published webhook → AI generates variants → fan-out: Twitter thread, LinkedIn post, newsletter excerpt, Reddit-friendly post, Hacker News title.

### 24. SEO auto-audit weekly
- **File:** `24-seo-audit-weekly.json` (6 nodes)
- **Tags:** marketing, seo, pattern-4
- Marketing & content — Pattern 4. Every Monday 11am: pull Google Search Console + Ahrefs data for top 50 pages → AI identifies pages that dropped >5 positions, pages with low CTR, queries you're #11-#20 for → posts a 5-bullet 'this week's SEO priorities' to #marketing.

### 25. User-generated content sentiment digest
- **File:** `25-ugc-sentiment-digest.json` (9 nodes)
- **Tags:** marketing, voice-of-customer, pattern-4
- Marketing & content — Pattern 4 + AI. Every Friday 16:00 pull: Twitter mentions, LinkedIn comments, app store reviews, support emails, NPS comments from the week → AI extracts themes + sentiment → weekly digest to founders.
