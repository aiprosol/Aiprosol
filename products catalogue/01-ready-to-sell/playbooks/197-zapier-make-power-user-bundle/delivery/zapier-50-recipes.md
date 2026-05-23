# Zapier Power User — 50 Production Recipes

Version 1.0 · 50 recipes · © 2026 Aiprosol Ltd

## Format

First 5 recipes are FULL recipes with every step.
Recipes 6-50 are 1-line patterns — apply the templates from recipes 1-5.

## Full recipes (1-5)

### 1. Stripe payment → CRM contact + Slack
   1. Trigger: Stripe — New Payment Intent Succeeded
   2. Action: Filter — Only continue if amount > 100
   3. Action: Formatter (Text) — Extract customer first name from email
   4. Action: HubSpot — Create or Update Contact
   5. Action: HubSpot — Create Deal stage='closed-won' amount=Stripe amount
   6. Action: Slack — Send Channel Message #sales-wins

### 2. Calendly booking → CRM + prep brief Slack DM
   1. Trigger: Calendly — New Event Created
   2. Action: HubSpot — Find Contact (by email)
   3. Filter: If contact doesn't exist, create
   4. Action: Webhook GET — fetch company info from clearbit
   5. Action: OpenAI — Create Chat Completion for 3-bullet prep brief
   6. Action: Slack — DM rep with brief + calendar link

### 3. Form submission → AI score → Tier routing
   1. Trigger: Webhooks — Catch Hook (form POST)
   2. Action: OpenAI — Chat Completion to score 0-100
   3. Action: Formatter (Numbers) — Parse score from text
   4. Action: Paths — Branch by tier: hot (>80) / warm (60-80) / cold
   5. Hot path: Slack #sales + Cal.com priority booking link
   6. Warm path: Add to Mailchimp 'nurture' segment
   7. Cold path: Add to Mailchimp 'newsletter only' segment

### 4. Gmail label 'INVOICE' → OCR → Sheet log
   1. Trigger: Gmail — New Email Matching Search 'label:invoice'
   2. Action: Filter — Has Attachment = true
   3. Action: OpenAI Vision — Extract {vendor, amount, due_date}
   4. Action: Formatter — Parse JSON response
   5. Action: Google Sheets — Create Spreadsheet Row (Accounting Log)
   6. Action: Google Drive — Upload File (archive PDF)

### 5. HubSpot deal stage change → Email draft
   1. Trigger: HubSpot — Deal Stage Updated
   2. Action: HubSpot — Get associated primary contact
   3. Action: OpenAI — Chat Completion for next-step email based on new stage
   4. Action: Gmail — Create Draft (NOT send) for review

## Pattern list (6-50)

6. Typeform → Airtable + Slack
7. Shopify order → Klaviyo segment
8. Stripe failed payment → Slack + dunning email
9. Intercom chat → AI summary → Notion
10. Google Forms intake → Zendesk ticket
11. ClickUp overdue task → Slack DM assignee
12. Mailchimp campaign sent → Sheet log
13. Notion page update → Slack thread
14. Calendly cancellation → CRM property update
15. Salesforce opportunity → Slack #revenue
16. Trello card moved → Slack channel ping
17. Webflow CMS publish → Sheet log + tweet
18. GitHub PR opened → Slack #eng
19. Stripe subscription cancelled → CS alert
20. QuickBooks invoice paid → CRM update
21. Asana task completed → Manager email
22. Twilio SMS → AI reply → CRM note
23. Eventbrite registration → AI welcome email
24. Discord new member → AI welcome DM
25. RSS feed update → Tweet draft
26. Notion DB add → Calendar event create
27. Reddit mention → Slack ping
28. Twitter mention → CRM activity log
29. Stripe refund → CS investigation ticket
30. Calendly meeting end → Linear task
31. HubSpot form fill → AI follow-up email draft
32. Stripe subscription renewed → thank-you email
33. Slack reaction added → save to Notion
34. Google Drive new file → Sheet log
35. Outlook new email → AI classify + label
36. Square sale → revenue Sheet log
37. Pipedrive deal won → onboarding kickoff workflow
38. GitHub issue → Linear sync
39. Loom recording shared → AI transcript + summary
40. Notion comment → email author
41. Salesforce lead update → Slack notification
42. Asana new task → AI breakdown into subtasks
43. Stripe customer churn signal → CS alert
44. Calendly multi-attendee booking → Notion meeting prep
45. Twilio call missed → CRM activity log
46. Trello label change → Slack DM
47. Shopify abandoned cart → Klaviyo recovery flow
48. Mailchimp unsubscribe → CRM property update
49. GitHub release → social media post draft
50. Stripe disputed charge → finance alert

## How to apply
Each title maps to one of the 7 patterns from the Aiprosol Workflow Playbook:
- Linear pipeline · Branching by classifier · Fan-out · Scheduled aggregation
- Polling-with-state · Approval gate · Long-running orchestrator

Use the first 5 full recipes as templates — substitute trigger, intermediate steps, and destination.