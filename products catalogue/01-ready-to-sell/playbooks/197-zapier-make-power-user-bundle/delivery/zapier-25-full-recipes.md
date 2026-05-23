# Zapier Power User — 25 Full Production Recipes

Version 2.0 · 25 fully-detailed recipes · © 2026 Aiprosol Ltd

Every recipe has the complete step-by-step. Substitute trigger, intermediate steps, and destination to fit your stack.

## 1. Stripe payment → CRM contact + Slack
   1. Trigger: Stripe — New Payment Intent Succeeded
   2. Action: Filter — Only continue if amount > 100
   3. Action: Formatter (Text) — Extract customer first name from email
   4. Action: HubSpot — Create or Update Contact
   5. Action: HubSpot — Create Deal stage='closed-won' amount=Stripe amount
   6. Action: Slack — Send Channel Message #sales-wins

## 2. Calendly booking → CRM + prep brief Slack DM
   1. Trigger: Calendly — New Event Created
   2. Action: HubSpot — Find Contact (by email)
   3. Filter: If contact doesn't exist, create
   4. Action: Webhook GET — fetch company info from Clearbit
   5. Action: OpenAI — Create Chat Completion for 3-bullet prep brief
   6. Action: Slack — DM rep with brief + calendar link

## 3. Form submission → AI score → Tier routing
   1. Trigger: Webhooks — Catch Hook (form POST)
   2. Action: OpenAI — Chat Completion to score 0-100
   3. Action: Formatter (Numbers) — Parse score from text
   4. Action: Paths — Branch by tier: hot (>80) / warm (60-80) / cold
   5. Hot path: Slack #sales + Cal.com priority booking link
   6. Warm path: Add to Mailchimp 'nurture' segment
   7. Cold path: Add to Mailchimp 'newsletter only' segment

## 4. Gmail label 'INVOICE' → OCR → Sheet log
   1. Trigger: Gmail — New Email Matching Search 'label:invoice'
   2. Action: Filter — Has Attachment = true
   3. Action: OpenAI Vision — Extract {vendor, amount, due_date}
   4. Action: Formatter — Parse JSON response
   5. Action: Google Sheets — Create Spreadsheet Row (Accounting Log)
   6. Action: Google Drive — Upload File (archive PDF)

## 5. HubSpot deal stage change → Email draft
   1. Trigger: HubSpot — Deal Stage Updated
   2. Action: HubSpot — Get associated primary contact
   3. Action: OpenAI — Chat Completion for next-step email based on new stage
   4. Action: Gmail — Create Draft (NOT send) for review

## 6. Typeform survey → Airtable enriched + Slack
   1. Trigger: Typeform — New Entry
   2. Action: Formatter — Standardize email lowercase
   3. Action: Webhook GET — Clearbit company lookup
   4. Action: Airtable — Create Record with form data + enrichment
   5. Action: Slack — Send Channel Message with summary

## 7. Shopify order → Klaviyo segment (behavioural)
   1. Trigger: Shopify — New Paid Order
   2. Action: Formatter — Compute total order count for customer
   3. Action: Paths — first-time / repeat / VIP based on count
   4. Each path: Klaviyo — Add to Specific Segment
   5. Action: Slack — Order summary if VIP

## 8. Stripe failed payment → Customer save sequence
   1. Trigger: Stripe — Payment Failed
   2. Action: HubSpot — Find Contact by email
   3. Action: OpenAI — Draft empathetic dunning email
   4. Action: Gmail — Create Draft (review then send)
   5. Delay: 2 days
   6. Action: HubSpot — Check if payment retry succeeded
   7. Paths: yes (close loop) / no (escalate to CS)

## 9. Intercom chat → AI summary → Notion CRM
   1. Trigger: Intercom — New Conversation Closed
   2. Action: Intercom — Get Conversation Transcript
   3. Action: OpenAI — Summarize in 3 bullets
   4. Action: Notion — Create Page in 'Customer Conversations' DB
   5. Action: Filter — If sentiment negative, flag for CS lead

## 10. Google Forms intake → Zendesk ticket priority
   1. Trigger: Google Forms — New Response
   2. Action: OpenAI — Classify priority (urgent/high/normal/low)
   3. Action: Formatter — Map to Zendesk priority levels
   4. Action: Zendesk — Create Ticket with priority set
   5. Action: Slack — Ping #support if urgent

## 11. ClickUp overdue → AI nudge → DM assignee
   1. Trigger: Schedule — Daily 9am weekdays
   2. Action: ClickUp — Find Tasks with due_date < today, status != complete
   3. Action: OpenAI — Draft empathetic 30-word reminder
   4. Action: Slack — DM each assignee with reminder
   5. Action: Sheet — Log nudge count for tracking

## 12. Mailchimp campaign sent → Sheet metrics log
   1. Trigger: Mailchimp — Campaign Sent
   2. Delay: 24 hours (wait for opens/clicks)
   3. Action: Mailchimp — Get Campaign Report
   4. Action: Google Sheets — Append metrics row
   5. Action: Slack — Post performance summary if open rate > 30%

## 13. Notion page update → Slack thread + assignee ping
   1. Trigger: Notion — Updated Database Item
   2. Filter: Only if 'Status' property changed
   3. Action: Notion — Get assignee email
   4. Action: Formatter — Translate Notion user to Slack user
   5. Action: Slack — Thread reply to project channel

## 14. Calendly cancellation → CRM property + retention
   1. Trigger: Calendly — Event Cancelled
   2. Action: HubSpot — Update Contact 'last_cancellation' property
   3. Action: HubSpot — Count cancellations in past 60 days
   4. Filter: If count >= 2, flag for CS
   5. Action: Slack — Alert CS lead with context

## 15. Salesforce opportunity won → kickoff workflow
   1. Trigger: Salesforce — Opportunity Stage = Closed Won
   2. Action: OpenAI — Draft welcome email referencing won deal
   3. Action: Gmail — Create Draft
   4. Action: Slack — Post to #wins channel
   5. Action: Asana — Create Onboarding Project
   6. Action: Calendar — Schedule kickoff slot

## 16. Webflow CMS publish → Tweet + Sheet log
   1. Trigger: Webflow — Published CMS Item
   2. Action: OpenAI — Generate tweet draft (280 char) from title + excerpt
   3. Action: Twitter — Create Tweet
   4. Action: Google Sheets — Log published item with timestamp
   5. Action: Slack — #content notification

## 17. GitHub PR opened → Slack #eng with summary
   1. Trigger: GitHub — New Pull Request
   2. Action: GitHub — Get PR Diff (top 50 lines)
   3. Action: OpenAI — Summarize what changed
   4. Action: Slack — Send #eng with PR link + summary
   5. Filter: If labels include 'urgent', also ping leads

## 18. Stripe subscription cancelled → CS save
   1. Trigger: Stripe — customer.subscription.deleted
   2. Action: Stripe — Get cancellation reason
   3. Action: OpenAI — Score recoverability 0-10
   4. Filter: If score >= 7, route to save sequence
   5. Action: Gmail — Create CS save email draft
   6. Action: Slack — Ping CS lead

## 19. QuickBooks invoice paid → CRM activity
   1. Trigger: QuickBooks — Invoice Paid
   2. Action: QuickBooks — Get Invoice details
   3. Action: HubSpot — Find Contact by email
   4. Action: HubSpot — Create Engagement (note) with payment details
   5. Action: Slack — #finance notification

## 20. Asana task completed → Manager email + recognition
   1. Trigger: Asana — Task Completed
   2. Filter: Only if priority = high or milestone task
   3. Action: Asana — Get task details + assignee
   4. Action: OpenAI — Draft brief recognition email
   5. Action: Gmail — Send to manager
   6. Action: Slack — Post in #wins channel

## 21. Twilio SMS → AI reply → CRM log
   1. Trigger: Twilio — Inbound SMS
   2. Action: HubSpot — Find Contact by phone
   3. Action: OpenAI — Draft <160 char reply matching tone
   4. Action: Twilio — Send SMS reply (or queue for human)
   5. Action: HubSpot — Create Engagement (note) with full thread

## 22. Eventbrite registration → AI welcome
   1. Trigger: Eventbrite — Order Created
   2. Action: Eventbrite — Get Attendee details
   3. Action: OpenAI — Draft personalised welcome including event details
   4. Action: Gmail — Send welcome
   5. Action: HubSpot — Add Contact to 'event_attendees' list

## 23. Discord new member → Welcome DM + Notion entry
   1. Trigger: Discord — New Member Joined
   2. Action: Discord — Send Direct Message with welcome + resources
   3. Action: Notion — Create row in Community DB
   4. Delay: 3 days
   5. Action: Discord — Check member activity
   6. Filter: If 0 messages, send check-in DM

## 24. RSS feed update → AI-drafted tweet thread
   1. Trigger: RSS by Zapier — New Item
   2. Action: OpenAI — Generate 5-tweet thread from article
   3. Action: Buffer / Hypefury — Create Thread Draft
   4. Action: Slack — Notify content team for review

## 25. Notion database add → Calendar event create
   1. Trigger: Notion — New Database Item with 'Date' field set
   2. Action: Formatter — Parse date + duration
   3. Action: Google Calendar — Create Event
   4. Action: Notion — Update item with calendar link
   5. Action: Slack — Confirm to creator
