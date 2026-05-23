# Aiprosol — AI Tools Stack Starter Kit

18 workflows · © 2026 Aiprosol Ltd

### 1. Slack message → OpenAI → Notion page
`01-slack-openai-notion.json` (4 nodes) · stack, slack, openai, notion
When a message with a 📝 reaction is added in Slack, the message text is sent to OpenAI for summarisation and a new Notion page is created with the result.

### 2. Gmail meeting request → Claude → Calendar suggestion
`02-gmail-claude-calendar.json` (4 nodes) · stack, gmail, claude, calendar
Email with 'meeting' or 'call' in the body triggers Claude to detect intent, propose 3 calendar slots from your availability, and reply with a Calendly link.

### 3. Stripe new customer → LLM kickoff brief → CS workspace
`03-stripe-llm-cs.json` (4 nodes) · stack, stripe, openai, notion
Every new Stripe customer triggers an LLM-generated welcome brief (with their industry context) and creates a Notion CS workspace page with the brief embedded.

### 4. Typeform → enrich → Airtable
`04-typeform-zapier-airtable.json` (3 nodes) · stack, typeform, airtable
New Typeform submission → AI infers missing fields (size, industry) → row written to Airtable with full context.

### 5. Shopify order → OpenAI → Klaviyo segment
`05-shopify-openai-klaviyo.json` (3 nodes) · stack, shopify, klaviyo
New Shopify order → AI categorises customer behaviour → adds to right Klaviyo segment for post-purchase email.

### 6. Calendly booking → Claude → HubSpot deal
`06-calendly-claude-hubspot.json` (3 nodes) · stack, calendly, hubspot, claude
New Calendly booking → Claude extracts meeting context → creates HubSpot deal with stage='discovery'.

### 7. Typeform survey → OpenAI synthesis → Mailchimp
`07-typeform-openai-mailchimp.json` (3 nodes) · stack, typeform, mailchimp
Survey responses → AI synthesises themes → personalised follow-up email sequence in Mailchimp.

### 8. Stripe failed payment → Claude → Slack escalation
`08-stripe-anthropic-slack.json` (3 nodes) · stack, stripe, claude, slack
Stripe payment.failed → Claude drafts customer-friendly recovery email + risk assessment → Slack ping the CS lead.

### 9. Airtable record → OpenAI → Mailchimp campaign
`09-airtable-openai-mailchimp.json` (3 nodes) · stack, airtable, mailchimp
Airtable record update → OpenAI generates campaign copy → creates draft Mailchimp campaign for review.

### 10. ClickUp task overdue → OpenAI → Slack nudge
`10-clickup-openai-slack.json` (4 nodes) · stack, clickup, slack
Daily check: ClickUp tasks past due → OpenAI drafts a kind reminder per task → DM to the assignee.

### 11. Google Form intake → Claude triage → Zendesk ticket
`11-googleforms-claude-zendesk.json` (3 nodes) · stack, google-forms, zendesk, claude
New Google Forms intake → Claude classifies (bug/feature/billing/other) → creates Zendesk ticket with right priority.

### 12. Discord message → OpenAI sentiment → Airtable log
`12-discord-openai-airtable.json` (3 nodes) · stack, discord, airtable
Community Discord channel messages → OpenAI extracts sentiment + topic → logs to Airtable for weekly review.

### 13. Google Sheets row → OpenAI → Mailgun send
`13-googleSheets-openai-mailgun.json` (3 nodes) · stack, sheets, mailgun
New row in 'send-list' Google Sheet → OpenAI personalises body using row data → Mailgun sends.

### 14. Twilio SMS reply → Claude → HubSpot note
`14-twilio-claude-hubspot.json` (3 nodes) · stack, twilio, hubspot, claude
Customer SMS reply → Claude extracts intent + drafts response → response sent + activity logged on HubSpot contact.

### 15. Google Doc → OpenAI → Google Slides deck
`15-googleDocs-openai-googleSlides.json` (4 nodes) · stack, drive, openai, slides
Long-form Google Doc → OpenAI structures into slide-by-slide outline → creates a new Google Slides deck.

### 16. Pipedrive deal won → OpenAI → Gmail kickoff email
`16-pipedrive-openai-gmail.json` (3 nodes) · stack, pipedrive, gmail
Deal moves to 'won' in Pipedrive → OpenAI drafts an onboarding kickoff email → Gmail draft created.

### 17. Monday.com status change → OpenAI summary → Slack
`17-monday-openai-slack.json` (3 nodes) · stack, monday, slack
Status column changes in Monday.com → OpenAI generates a 1-paragraph context summary → posts to relevant Slack channel.

### 18. GA4 anomaly → Claude analysis → Notion entry
`18-googleAnalytics-claude-notion.json` (4 nodes) · stack, ga4, claude, notion
Daily GA4 check for traffic anomalies → Claude analyses cause hypothesis → creates Notion 'incidents' database entry for the marketing team.
