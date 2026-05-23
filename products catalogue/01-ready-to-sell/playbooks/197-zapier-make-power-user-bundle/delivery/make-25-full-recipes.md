# Make.com Power User — 25 Full Production Recipes

Version 2.0 · 25 fully-detailed recipes · © 2026 Aiprosol Ltd

Every recipe has the complete step-by-step. Substitute trigger, intermediate steps, and destination to fit your stack.

## 1. HubSpot lead → enrichment → routing
   1. Trigger: HubSpot · Watch contacts (created or updated)
   2. Module: HTTP · Make a Request to Clearbit /v2/combined/find
   3. Module: OpenAI · Create Completion to compute lead score
   4. Module: Router with 3 paths: hot, warm, cold
   5. Hot: Slack · Send a Message to #sales + HubSpot · Update Contact
   6. Warm: Mailchimp · Add Member to List + HubSpot · Update Contact
   7. Cold: HubSpot · Update Contact only
   8. Error handler: dead-letter to Google Sheets

## 2. Stripe payment → multi-step CRM + accounting
   1. Trigger: Stripe · Watch Events filtered to payment_intent.succeeded
   2. Module: HubSpot · Search Contacts by email
   3. Router: contact exists / new contact
   4. Module: HubSpot · Create Deal (existing) OR Create Contact then Deal (new)
   5. Module: Xero · Create Invoice (status=PAID)
   6. Module: Slack · Send a Message #revenue
   7. Iterator: For each line item → Sheet log

## 3. Daily 8am cron → pipeline aggregation → Slack
   1. Trigger: Schedule · 0 8 * * 1-5
   2. Module: HubSpot · Search deals (last 7 days)
   3. Module: Aggregator · Group by deal stage
   4. Module: Tools · Set Multiple Variables (totals per stage)
   5. Module: OpenAI · Chat Completion for 3-bullet narrative
   6. Module: Slack · Send a Message #sales-leadership
   7. Module: Google Sheets · Add a Row to weekly archive

## 4. Meeting transcript → action items → Linear
   1. Trigger: Webhook · Catch Hook from Fireflies
   2. Module: OpenAI · Chat Completion to extract action items as JSON
   3. Module: Tools · Parse JSON
   4. Module: Iterator · Loop over action items
   5. Module: Linear · Create Issue per item
   6. Module: Slack · Send a Message with summary count

## 5. Drive new file → AI category → folder routing
   1. Trigger: Google Drive · Watch Files in Folder (Inbox)
   2. Module: Google Drive · Download a File
   3. Module: OpenAI Vision · Classify document
   4. Module: Router by category: invoice/contract/receipt/other
   5. Each path: Google Drive · Move a File to destination folder
   6. Module: Slack · Send a Message #automations-log

## 6. Typeform with iterators → Airtable batch
   1. Trigger: Typeform · Watch responses
   2. Module: Iterator · Loop over answers array
   3. Module: Tools · Compose key-value pairs
   4. Module: Aggregator · Collect into single record
   5. Module: Airtable · Create a Record
   6. Error: dead-letter sheet

## 7. Shopify order → multi-vendor split routing
   1. Trigger: Shopify · Watch orders
   2. Module: Iterator · Loop over line_items
   3. Module: Router · By vendor
   4. Each vendor: Webhook · Send to vendor fulfillment API
   5. Module: Aggregator · Wait for all dispatches
   6. Module: Slack · Send confirmation summary

## 8. Salesforce opportunity → orchestrator with delays
   1. Trigger: Salesforce · Watch opportunity stage changes
   2. Router: stage = 'Qualified' / 'Demo Scheduled' / 'Closed Won'
   3. Qualified path: schedule 7-day check-in workflow via Make Sleep
   4. Demo path: send pre-demo brief
   5. Closed Won path: trigger onboarding orchestrator (own scenario)
   6. Module: Data Store · Track active orchestrations

## 9. Stripe webhook → idempotent CRM upsert
   1. Trigger: Webhook · Custom (signed by Stripe)
   2. Module: Tools · Verify signature
   3. Module: Data Store · Check if event_id processed
   4. Router: new / duplicate
   5. New path: HubSpot upsert + Data Store add
   6. Duplicate path: log + skip

## 10. Notion cross-DB sync with state store
   1. Trigger: Schedule · Every 10 min
   2. Module: Notion · Search DB-A items modified since last_run
   3. Module: Iterator · For each updated item
   4. Module: Notion · Find matching item in DB-B by external_id
   5. Router: exists / new
   6. Each path: Update or Create DB-B item
   7. Module: Data Store · Update last_run timestamp

## 11. GitHub PR → Slack + Linear with router
   1. Trigger: GitHub · Watch new pull requests
   2. Module: GitHub · Get diff stats
   3. Module: Router · By size: small / medium / large
   4. Small: Slack only
   5. Medium: Slack + Linear linked issue
   6. Large: Slack + Linear + tag senior reviewer

## 12. Mailchimp metrics → BigQuery daily ETL
   1. Trigger: Schedule · 0 4 * * * (daily 4am)
   2. Module: Mailchimp · List Campaigns sent yesterday
   3. Module: Iterator · For each campaign
   4. Module: Mailchimp · Get Report data
   5. Module: BigQuery · Insert Row into campaigns_daily table
   6. Module: Tools · Aggregator + log daily total

## 13. Calendly bulk bookings → parallel AI briefs
   1. Trigger: Calendly · Watch new bookings
   2. Module: Iterator · For each booking (if batch)
   3. Module: HTTP · Clearbit lookup (parallel)
   4. Module: OpenAI · Generate brief (parallel)
   5. Module: Google Docs · Create one doc per booking
   6. Module: Slack · DM all reps with batch summary

## 14. Support tickets → AI classify → router
   1. Trigger: Zendesk · Watch new tickets
   2. Module: OpenAI · Classify {urgency, category, sentiment}
   3. Module: Router · By urgency
   4. Urgent: Slack ping on-call + assign to lead
   5. High: Add to high-priority queue
   6. Normal: Default routing
   7. Module: Zendesk · Update ticket with classification tags

## 15. Stripe MRR daily aggregation
   1. Trigger: Schedule · Daily 1am
   2. Module: Stripe · List subscriptions (active)
   3. Module: Iterator · For each
   4. Module: Stripe · Get amount + interval
   5. Module: Aggregator · Sum monthly normalized
   6. Module: Google Sheets · Append MRR row with date
   7. Module: Slack · Post MRR change if > 5%

## 16. Multi-source data merge with data stores
   1. Trigger: Schedule · Hourly
   2. Parallel modules: HubSpot · Get contacts, Stripe · Get customers, Intercom · Get users
   3. Module: Data Store · Read existing master
   4. Module: Tools · Merge keys (email)
   5. Module: Data Store · Write merged master
   6. Module: BigQuery · Sync to warehouse

## 17. Long-running customer onboarding orchestrator
   1. Trigger: Webhook from Stripe new customer
   2. Day 0: Email welcome + Slack + Notion workspace (fan-out)
   3. Sleep: 7 days
   4. Day 7: Check Notion for first activity
   5. Branch: if active continue, if dormant ping CS
   6. Sleep: 23 days more
   7. Day 30: NPS request email

## 18. Idempotent webhook processor with dedupe
   1. Trigger: Webhook · Custom
   2. Module: Tools · Compute hash of body
   3. Module: Data Store · Check hash exists
   4. Router: new / duplicate
   5. New: process + add to store with 24h TTL
   6. Duplicate: log + 200 OK

## 19. Rate-limited API consumer with backoff
   1. Trigger: Schedule · Every 5 min
   2. Module: Data Store · Get queue items
   3. Module: Iterator · Process N items max
   4. Module: HTTP · Call API
   5. Router: 200 / 429 / error
   6. 429: Update Data Store with backoff schedule
   7. Error: Sentry + dead-letter

## 20. Approval gate with Slack buttons
   1. Trigger: Webhook from form/system
   2. Module: OpenAI · Generate proposed action
   3. Module: Slack · Post message with 'Approve/Edit/Reject' buttons
   4. Module: Webhook · Listen for button response
   5. Router: approved / edited / rejected
   6. Each path: execute / log / archive

## 21. Slack thread reply → external API
   1. Trigger: Slack · Watch messages in specific thread
   2. Module: Tools · Filter to non-bot messages
   3. Module: OpenAI · Extract structured intent
   4. Module: HTTP · POST to internal API with intent
   5. Module: Slack · React with ✅ or ❌

## 22. Twilio voicemail → AI transcript → ticket
   1. Trigger: Twilio · Voicemail recorded
   2. Module: Twilio · Get recording URL
   3. Module: OpenAI Whisper · Transcribe via Audio API
   4. Module: OpenAI · Summarize + classify urgency
   5. Module: Zendesk · Create ticket with transcript
   6. Module: Slack · Ping if urgent

## 23. Cron-driven QBR document assembly
   1. Trigger: Schedule · Quarterly (1st of Jan/Apr/Jul/Oct)
   2. Module: HubSpot · List active customers
   3. Module: Iterator · For each customer
   4. Module: HTTP · Get usage data from product analytics
   5. Module: OpenAI · Generate QBR markdown
   6. Module: Google Docs · Create one per customer
   7. Module: Slack · CS team notification

## 24. Vendor renewal radar (60-day forward)
   1. Trigger: Schedule · Daily 9am
   2. Module: Notion · Get Vendors DB
   3. Module: Iterator · For each vendor
   4. Module: Tools · Compute days_to_renewal
   5. Router: renewing in 60 days / not
   6. Renewing: OpenAI assess keep/cut + Slack #finance
   7. Log to weekly sheet

## 25. AI content moderation pipeline
   1. Trigger: Webhook on user-generated content
   2. Module: OpenAI Moderation · Score content
   3. Router: safe / borderline / unsafe
   4. Safe: publish
   5. Borderline: queue for human review
   6. Unsafe: block + log to incidents
