# Make.com Power User — 50 Production Recipes

Version 1.0 · 50 recipes · © 2026 Aiprosol Ltd

## Format

First 5 recipes are FULL recipes with every step.
Recipes 6-50 are 1-line patterns — apply the templates from recipes 1-5.

## Full recipes (1-5)

### 1. HubSpot lead → enrichment → routing
   1. Trigger: HubSpot · Watch contacts (created or updated)
   2. Module: HTTP · Make a Request to Clearbit /v2/combined/find
   3. Module: OpenAI · Create Completion to compute lead score
   4. Module: Router with 3 paths: hot, warm, cold
   5. Hot: Slack · Send a Message to #sales + HubSpot · Update Contact
   6. Warm: Mailchimp · Add Member to List + HubSpot · Update Contact
   7. Cold: HubSpot · Update Contact only
   8. Error handler: dead-letter to Google Sheets

### 2. Stripe payment → multi-step CRM + accounting
   1. Trigger: Stripe · Watch Events filtered to payment_intent.succeeded
   2. Module: HubSpot · Search Contacts by email
   3. Router: contact exists / new contact
   4. Module: HubSpot · Create Deal (existing) OR Create Contact then Deal (new)
   5. Module: Xero · Create Invoice (status=PAID)
   6. Module: Slack · Send a Message #revenue
   7. Iterator: For each line item → Sheet log

### 3. Daily 8am cron → pipeline aggregation → Slack
   1. Trigger: Schedule · 0 8 * * 1-5
   2. Module: HubSpot · Search deals (last 7 days)
   3. Module: Aggregator · Group by deal stage
   4. Module: Tools · Set Multiple Variables (totals per stage)
   5. Module: OpenAI · Chat Completion for 3-bullet narrative
   6. Module: Slack · Send a Message #sales-leadership
   7. Module: Google Sheets · Add a Row to weekly archive

### 4. Meeting transcript → action items → Linear
   1. Trigger: Webhook · Catch Hook from Fireflies
   2. Module: OpenAI · Chat Completion to extract action items as JSON
   3. Module: Tools · Parse JSON
   4. Module: Iterator · Loop over action items
   5. Module: Linear · Create Issue per item
   6. Module: Slack · Send a Message with summary count

### 5. Drive new file → AI category → folder routing
   1. Trigger: Google Drive · Watch Files in Folder (Inbox)
   2. Module: Google Drive · Download a File
   3. Module: OpenAI Vision · Classify document
   4. Module: Router by category: invoice/contract/receipt/other
   5. Each path: Google Drive · Move a File to destination folder
   6. Module: Slack · Send a Message #automations-log

## Pattern list (6-50)

6. Typeform → Airtable with iterators
7. Shopify order → multi-vendor split routing
8. Salesforce opportunity stage → orchestrator with delays
9. Stripe webhook → idempotent CRM upsert
10. Notion DB → cross-DB sync with state store
11. GitHub PR → Slack + Linear with router
12. Mailchimp campaign metrics → BigQuery daily ETL
13. Calendly bulk bookings → AI prep briefs in parallel
14. Customer support tickets → AI classify → router
15. Stripe MRR daily aggregation
16. Multi-source data merge with data stores
17. Long-running customer onboarding orchestrator
18. Idempotent webhook processor with dedupe
19. Rate-limited API consumer with backoff
20. Conditional approval gate (Slack buttons)
21. Cross-org Notion → Google Workspace sync
22. Slack thread reply → external API webhook
23. Twilio voicemail → AI transcript → ticket
24. Cron-driven QBR document assembly
25. Vendor renewal radar (60-day forward)
26. Async standup aggregator (DMs in parallel)
27. Document approval workflow with audit log
28. Multi-step e-commerce post-purchase
29. AI content moderation pipeline
30. Self-healing flow with retry policies
31. Cost monitoring + spike alerts
32. Workflow health check meta-automation
33. Customer success signals aggregator
34. Multi-channel publishing fan-out
35. Survey response → AI sentiment → segments
36. Inventory sync across Shopify + WMS
37. Lead-to-meeting scheduling chain
38. Renewal forecast workflow
39. ChatGPT response auto-improver
40. GitHub release → multi-channel announcement
41. Daily error log aggregator
42. AI-assisted refund decision workflow
43. Customer churn prediction pipeline
44. Pricing change notification cascade
45. Compliance audit trail recorder
46. Multi-language customer support router
47. Dynamic content personalization workflow
48. Vendor invoice multi-approval chain
49. Recruiting pipeline orchestrator
50. AI-driven A/B test analysis
51. Sales territory rebalancer

## How to apply
Each title maps to one of the 7 patterns from the Aiprosol Workflow Playbook:
- Linear pipeline · Branching by classifier · Fan-out · Scheduled aggregation
- Polling-with-state · Approval gate · Long-running orchestrator

Use the first 5 full recipes as templates — substitute trigger, intermediate steps, and destination.