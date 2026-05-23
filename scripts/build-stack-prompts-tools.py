#!/usr/bin/env python3
"""
Aiprosol — Round 3 product deliverables generator.

Outputs:
  • Stack Starter Kit ($197)   → 18 n8n integration workflows
  • ChatGPT Prompt Vault ($97) → 200+ structured prompts (JSON + Markdown index)
  • AI Tools Guide ($67)       → 100-tool comparison matrix (CSV + JSON)
  • Tools Vault ($147)         → 150-tool curated vault (CSV + JSON)
"""

import json
import uuid
import csv
import io
from pathlib import Path

CATALOG = Path("/Users/user/Airprosol/products catalogue/01-ready-to-sell")

# ════════════════════════════════════════════════════════════════════
# SHARED n8n HELPERS
# ════════════════════════════════════════════════════════════════════

def node(name, type_, params=None, position=(0, 0), type_version=1):
    return {"parameters": params or {}, "id": str(uuid.uuid4()), "name": name,
            "type": type_, "typeVersion": type_version, "position": list(position)}


def workflow(name, description, nodes, connections, tags=None):
    return {
        "name": name, "nodes": nodes, "connections": connections, "active": False,
        "settings": {"executionOrder": "v1"}, "staticData": None,
        "tags": [{"name": t} for t in (tags or [])],
        "meta": {"templateCredsSetupCompleted": False, "instanceId": "aiprosol-v1"},
        "pinData": {}, "versionId": str(uuid.uuid4()), "id": str(uuid.uuid4()),
        "_aiprosol": {"description": description, "version": "1.0",
                      "license": "© 2026 Aiprosol Ltd · For purchaser's internal use"},
    }


def chain(*names):
    c = {}
    for i in range(len(names) - 1):
        c[names[i]] = {"main": [[{"node": names[i + 1], "type": "main", "index": 0}]]}
    return c


def write_set(workflows, out_dir, set_name):
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    manifest = []
    for filename, title, description, wf in workflows:
        with open(out / f"{filename}.json", "w") as f:
            json.dump(wf, f, indent=2, ensure_ascii=False)
        manifest.append({"file": f"{filename}.json", "title": title,
                          "description": description, "nodes": len(wf["nodes"]),
                          "tags": [t["name"] for t in wf["tags"]]})
    with open(out / "_index.json", "w") as f:
        json.dump({"version": "1.0", "set": set_name, "count": len(manifest),
                   "workflows": manifest}, f, indent=2)
    lines = [f"# Aiprosol — {set_name}", "",
             f"{len(manifest)} workflows · © 2026 Aiprosol Ltd", ""]
    for i, m in enumerate(manifest, 1):
        lines.append(f"### {i}. {m['title']}")
        lines.append(f"`{m['file']}` ({m['nodes']} nodes) · {', '.join(m['tags'])}")
        lines.append(f"{m['description']}")
        lines.append("")
    with open(out / "README.md", "w") as f:
        f.write("\n".join(lines))
    print(f"✓ {set_name}: {len(manifest)} workflows written")


# ════════════════════════════════════════════════════════════════════
# 1. STACK STARTER KIT — 18 integration workflows
# ════════════════════════════════════════════════════════════════════

def make_integration(slug, title, desc, trigger_node, intermediate_nodes, final_node, tags):
    """Build a simple linear integration workflow."""
    all_nodes = [trigger_node] + intermediate_nodes + [final_node]
    return (slug, title, desc, workflow(f"Aiprosol Stack — {title}", desc,
                                          all_nodes, chain(*[n["name"] for n in all_nodes]),
                                          tags=tags))


STACK = []

# 1. Slack → OpenAI → Notion
STACK.append(make_integration(
    "01-slack-openai-notion",
    "Slack message → OpenAI → Notion page",
    "When a message with a 📝 reaction is added in Slack, the message text is sent to OpenAI for summarisation and a new Notion page is created with the result.",
    node("Slack reaction event", "n8n-nodes-base.slackTrigger",
         {"events": ["reaction_added"], "filters": {"reaction": "memo"}}, (240, 300), 1),
    [
        node("Get message text", "n8n-nodes-base.slack",
             {"resource": "message", "operation": "get",
              "channel": "={{ $json.item.channel }}", "ts": "={{ $json.item.ts }}"}, (440, 300), 2.2),
        node("Summarise", "@n8n/n8n-nodes-langchain.openAi",
             {"resource": "chat", "modelId": {"value": "gpt-4o-mini"},
              "messages": {"values": [
                  {"role": "system", "content": "Summarise in <50 words, plus a title in title-case."},
                  {"role": "user", "content": "={{ $json.messages[0].text }}"}
              ]}}, (640, 300), 1.6),
    ],
    node("Create Notion page", "n8n-nodes-base.notion",
         {"resource": "databasePage", "operation": "create", "databaseId": "NOTES_DB_ID",
          "title": "={{ $json.message.content.split('\\n')[0] }}",
          "blockUi": {"blockValues": [{"type": "paragraph",
                                          "textContent": "={{ $json.message.content }}"}]}}, (840, 300), 2.2),
    tags=["stack", "slack", "openai", "notion"],
))

# 2. Gmail → Claude → Calendar
STACK.append(make_integration(
    "02-gmail-claude-calendar",
    "Gmail meeting request → Claude → Calendar suggestion",
    "Email with 'meeting' or 'call' in the body triggers Claude to detect intent, propose 3 calendar slots from your availability, and reply with a Calendly link.",
    node("Gmail trigger", "n8n-nodes-base.gmailTrigger",
         {"pollTimes": {"item": [{"mode": "everyMinute"}]},
          "filters": {"q": "(\"meeting\" OR \"call\") in:inbox"}}, (240, 300), 1),
    [
        node("Read free slots", "n8n-nodes-base.googleCalendar",
             {"resource": "event", "operation": "getAll",
              "calendar": {"__rl": True, "value": "primary"},
              "additionalFields": {"timeMin": "={{ $now.toISO() }}",
                                    "timeMax": "={{ $now.plus(7, 'days').toISO() }}"}}, (440, 300), 1.3),
        node("Claude intent + slots", "@n8n/n8n-nodes-langchain.anthropic",
             {"model": "claude-3-5-sonnet-20241022",
              "messages": {"values": [
                  {"role": "user", "content": "=From the email body, infer if they want a call and pick 3 good slots from my calendar availability. Email: {{ $('Gmail trigger').first().json.snippet }}\\nMy slots: {{ JSON.stringify($json) }}"}
              ]}}, (640, 300), 1),
    ],
    node("Reply with options", "n8n-nodes-base.gmail",
         {"resource": "message", "operation": "reply",
          "messageId": "={{ $('Gmail trigger').first().json.id }}",
          "message": "={{ $json.content }}\\n\\nBook a slot: https://cal.com/youraccount"}, (840, 300), 2.1),
    tags=["stack", "gmail", "claude", "calendar"],
))

# 3. Stripe → LLM → Customer Success Notion
STACK.append(make_integration(
    "03-stripe-llm-cs",
    "Stripe new customer → LLM kickoff brief → CS workspace",
    "Every new Stripe customer triggers an LLM-generated welcome brief (with their industry context) and creates a Notion CS workspace page with the brief embedded.",
    node("Stripe new customer", "n8n-nodes-base.stripeTrigger",
         {"events": ["customer.created"]}, (240, 300), 1),
    [
        node("Lookup industry from domain", "n8n-nodes-base.httpRequest",
             {"method": "GET",
              "url": "=https://company.clearbit.com/v2/companies/find?domain={{ $json.email.split('@')[1] }}"}, (440, 300), 4.1),
        node("Draft kickoff brief", "@n8n/n8n-nodes-langchain.openAi",
             {"resource": "chat", "modelId": {"value": "gpt-4o"},
              "messages": {"values": [
                  {"role": "system", "content": "Write a 200-word kickoff brief for our CS team. Sections: their context, likely goals, 3 onboarding priorities."},
                  {"role": "user", "content": "={{ JSON.stringify($json) }}"}
              ]}}, (640, 300), 1.6),
    ],
    node("Create CS workspace", "n8n-nodes-base.notion",
         {"resource": "databasePage", "operation": "create", "databaseId": "CS_DB_ID",
          "title": "={{ $('Stripe new customer').first().json.name || $('Stripe new customer').first().json.email }}"}, (840, 300), 2.2),
    tags=["stack", "stripe", "openai", "notion"],
))

# 4-18: more integrations (compact form)
INTEGRATIONS = [
    ("04-typeform-zapier-airtable", "Typeform → enrich → Airtable",
     "New Typeform submission → AI infers missing fields (size, industry) → row written to Airtable with full context.",
     ("Typeform trigger", "n8n-nodes-base.typeformTrigger", {"formId": "FORM_ID"}, 1),
     [("Enrich fields", "@n8n/n8n-nodes-langchain.openAi",
       {"resource": "chat", "modelId": {"value": "gpt-4o-mini"},
        "messages": {"values": [{"role": "system", "content": "Infer size + industry from email domain. Return JSON."},
                                   {"role": "user", "content": "={{ $json.form_response.answers[0].email }}"}]}}, 1.6)],
     ("Airtable append", "n8n-nodes-base.airtable",
      {"resource": "record", "operation": "create",
       "application": "APP_ID", "table": "Leads"}, 2),
     ["stack", "typeform", "airtable"]),

    ("05-shopify-openai-klaviyo", "Shopify order → OpenAI → Klaviyo segment",
     "New Shopify order → AI categorises customer behaviour → adds to right Klaviyo segment for post-purchase email.",
     ("Shopify order", "n8n-nodes-base.shopifyTrigger", {"events": ["orders/create"]}, 1),
     [("Categorise customer", "@n8n/n8n-nodes-langchain.openAi",
       {"resource": "chat", "modelId": {"value": "gpt-4o-mini"},
        "messages": {"values": [{"role": "system", "content": "Categorise: first-time | repeat | high-value | bargain. Return label."},
                                   {"role": "user", "content": "={{ JSON.stringify($json) }}"}]}}, 1.6)],
     ("Klaviyo add to segment", "n8n-nodes-base.httpRequest",
      {"method": "POST", "url": "https://a.klaviyo.com/api/v2/list/LIST_ID/members"}, 4.1),
     ["stack", "shopify", "klaviyo"]),

    ("06-calendly-claude-hubspot", "Calendly booking → Claude → HubSpot deal",
     "New Calendly booking → Claude extracts meeting context → creates HubSpot deal with stage='discovery'.",
     ("Calendly booking", "n8n-nodes-base.calendlyTrigger", {"events": ["invitee.created"]}, 1),
     [("Claude context", "@n8n/n8n-nodes-langchain.anthropic",
       {"model": "claude-3-5-sonnet-20241022",
        "messages": {"values": [{"role": "user", "content": "=Extract company info from this booking: {{ JSON.stringify($json) }}"}]}}, 1)],
     ("HubSpot create deal", "n8n-nodes-base.hubspot",
      {"resource": "deal", "operation": "create",
       "additionalFields": {"properties": {"property": [
           {"property": "dealname", "value": "=Discovery — {{ $('Calendly booking').first().json.payload.invitee.name }}"},
           {"property": "dealstage", "value": "appointmentscheduled"}]}}}, 2),
     ["stack", "calendly", "hubspot", "claude"]),

    ("07-typeform-openai-mailchimp", "Typeform survey → OpenAI synthesis → Mailchimp",
     "Survey responses → AI synthesises themes → personalised follow-up email sequence in Mailchimp.",
     ("Typeform response", "n8n-nodes-base.typeformTrigger", {"formId": "SURVEY_ID"}, 1),
     [("AI synthesis", "@n8n/n8n-nodes-langchain.openAi",
       {"resource": "chat", "modelId": {"value": "gpt-4o"},
        "messages": {"values": [{"role": "system", "content": "Pick the right 5-email sequence to add this respondent to based on their answers."},
                                   {"role": "user", "content": "={{ JSON.stringify($json) }}"}]}}, 1.6)],
     ("Mailchimp add", "n8n-nodes-base.mailchimp",
      {"resource": "memberTag", "operation": "create", "list": "LIST_ID"}, 2),
     ["stack", "typeform", "mailchimp"]),

    ("08-stripe-anthropic-slack", "Stripe failed payment → Claude → Slack escalation",
     "Stripe payment.failed → Claude drafts customer-friendly recovery email + risk assessment → Slack ping the CS lead.",
     ("Stripe payment failed", "n8n-nodes-base.stripeTrigger", {"events": ["payment_intent.payment_failed"]}, 1),
     [("Claude recovery draft", "@n8n/n8n-nodes-langchain.anthropic",
       {"model": "claude-3-5-sonnet-20241022",
        "messages": {"values": [{"role": "user", "content": "=Draft a kind payment-recovery email (NOT pushy). Plus 0-100 churn risk score. Customer: {{ JSON.stringify($json) }}"}]}}, 1)],
     ("Slack CS lead", "n8n-nodes-base.slack",
      {"resource": "message", "operation": "post", "channel": "#cs",
       "text": "=💳 Payment failed — {{ $('Stripe payment failed').first().json.customer }}\\n{{ $json.content }}"}, 2.2),
     ["stack", "stripe", "claude", "slack"]),

    ("09-airtable-openai-mailchimp", "Airtable record → OpenAI → Mailchimp campaign",
     "Airtable record update → OpenAI generates campaign copy → creates draft Mailchimp campaign for review.",
     ("Airtable update", "n8n-nodes-base.airtableTrigger", {"triggerField": "Updated"}, 1),
     [("OpenAI copy", "@n8n/n8n-nodes-langchain.openAi",
       {"resource": "chat", "modelId": {"value": "gpt-4o"},
        "messages": {"values": [{"role": "system", "content": "Generate email campaign copy in 120 words for this audience segment."},
                                   {"role": "user", "content": "={{ JSON.stringify($json) }}"}]}}, 1.6)],
     ("Mailchimp draft", "n8n-nodes-base.mailchimp",
      {"resource": "campaign", "operation": "create"}, 2),
     ["stack", "airtable", "mailchimp"]),

    ("10-clickup-openai-slack", "ClickUp task overdue → OpenAI → Slack nudge",
     "Daily check: ClickUp tasks past due → OpenAI drafts a kind reminder per task → DM to the assignee.",
     ("Daily 9am", "n8n-nodes-base.scheduleTrigger",
      {"rule": {"interval": [{"field": "cronExpression", "expression": "0 9 * * 1-5"}]}}, 1.1),
     [("ClickUp overdue", "n8n-nodes-base.clickUp",
       {"resource": "task", "operation": "getAll", "filters": {"due_date_lt": "={{ $now.toMillis() }}"}}, 1),
      ("Draft nudge", "@n8n/n8n-nodes-langchain.openAi",
       {"resource": "chat", "modelId": {"value": "gpt-4o-mini"},
        "messages": {"values": [{"role": "system", "content": "Draft a 30-word kind reminder for an overdue task."},
                                   {"role": "user", "content": "={{ JSON.stringify($json) }}"}]}}, 1.6)],
     ("Slack DM assignee", "n8n-nodes-base.slack",
      {"resource": "message", "operation": "post", "select": "user",
       "user": "={{ $('ClickUp overdue').first().json.assignee.id }}",
       "text": "={{ $json.message.content }}"}, 2.2),
     ["stack", "clickup", "slack"]),

    ("11-googleforms-claude-zendesk", "Google Form intake → Claude triage → Zendesk ticket",
     "New Google Forms intake → Claude classifies (bug/feature/billing/other) → creates Zendesk ticket with right priority.",
     ("Form submit", "n8n-nodes-base.googleFormsTrigger", {"formId": "FORM_ID"}, 1),
     [("Claude classify", "@n8n/n8n-nodes-langchain.anthropic",
       {"model": "claude-3-5-haiku-20241022",
        "messages": {"values": [{"role": "user", "content": "=Return JSON {category: 'bug|feature|billing|other', priority: 'urgent|high|normal|low'}. Form: {{ JSON.stringify($json) }}"}]}}, 1)],
     ("Zendesk ticket", "n8n-nodes-base.zendesk",
      {"resource": "ticket", "operation": "create"}, 1),
     ["stack", "google-forms", "zendesk", "claude"]),

    ("12-discord-openai-airtable", "Discord message → OpenAI sentiment → Airtable log",
     "Community Discord channel messages → OpenAI extracts sentiment + topic → logs to Airtable for weekly review.",
     ("Discord message", "n8n-nodes-base.discordTrigger", {"channelId": "CHANNEL_ID"}, 1),
     [("Sentiment + topic", "@n8n/n8n-nodes-langchain.openAi",
       {"resource": "chat", "modelId": {"value": "gpt-4o-mini"},
        "messages": {"values": [{"role": "system", "content": "Return JSON {sentiment:positive|neutral|negative, topic:string, urgency:0-10}"},
                                   {"role": "user", "content": "={{ $json.content }}"}]}}, 1.6)],
     ("Airtable log", "n8n-nodes-base.airtable",
      {"resource": "record", "operation": "create",
       "application": "COMMUNITY_APP_ID", "table": "Mentions"}, 2),
     ["stack", "discord", "airtable"]),

    ("13-googleSheets-openai-mailgun", "Google Sheets row → OpenAI → Mailgun send",
     "New row in 'send-list' Google Sheet → OpenAI personalises body using row data → Mailgun sends.",
     ("Sheet new row", "n8n-nodes-base.googleSheetsTrigger", {"event": "rowAdded"}, 1),
     [("Personalise body", "@n8n/n8n-nodes-langchain.openAi",
       {"resource": "chat", "modelId": {"value": "gpt-4o"},
        "messages": {"values": [{"role": "system", "content": "Personalise this template using the row data."},
                                   {"role": "user", "content": "={{ JSON.stringify($json) }}"}]}}, 1.6)],
     ("Mailgun send", "n8n-nodes-base.mailgun",
      {"toEmail": "={{ $('Sheet new row').first().json.email }}",
       "fromEmail": "hello@aiprosol.com",
       "subject": "={{ $('Sheet new row').first().json.subject }}",
       "text": "={{ $json.message.content }}"}, 1),
     ["stack", "sheets", "mailgun"]),

    ("14-twilio-claude-hubspot", "Twilio SMS reply → Claude → HubSpot note",
     "Customer SMS reply → Claude extracts intent + drafts response → response sent + activity logged on HubSpot contact.",
     ("Twilio SMS", "n8n-nodes-base.twilioTrigger", {"events": ["message.received"]}, 1),
     [("Claude reply", "@n8n/n8n-nodes-langchain.anthropic",
       {"model": "claude-3-5-haiku-20241022",
        "messages": {"values": [{"role": "user", "content": "=Reply in <160 chars. SMS: {{ $json.Body }}"}]}}, 1)],
     ("HubSpot note", "n8n-nodes-base.hubspot",
      {"resource": "engagement", "operation": "create"}, 2),
     ["stack", "twilio", "hubspot", "claude"]),

    ("15-googleDocs-openai-googleSlides", "Google Doc → OpenAI → Google Slides deck",
     "Long-form Google Doc → OpenAI structures into slide-by-slide outline → creates a new Google Slides deck.",
     ("Doc updated", "n8n-nodes-base.googleDriveTrigger",
      {"event": "fileUpdated", "folderToWatch": {"__rl": True, "value": "DOC_FOLDER_ID"}}, 1),
     [("Read doc text", "n8n-nodes-base.googleDocs",
       {"operation": "get", "documentURL": "={{ $json.webViewLink }}"}, 2),
      ("Structure slides", "@n8n/n8n-nodes-langchain.openAi",
       {"resource": "chat", "modelId": {"value": "gpt-4o"},
        "messages": {"values": [{"role": "system", "content": "Convert this doc into a 10-slide deck. Return JSON {slides: [{title, bullets}]}"},
                                   {"role": "user", "content": "={{ $json.text }}"}]}, "options": {"responseFormat": "json_object"}}, 1.6)],
     ("Create Slides", "n8n-nodes-base.googleSlides",
      {"operation": "createPresentation", "title": "=Deck — {{ $('Doc updated').first().json.name }}"}, 1),
     ["stack", "drive", "openai", "slides"]),

    ("16-pipedrive-openai-gmail", "Pipedrive deal won → OpenAI → Gmail kickoff email",
     "Deal moves to 'won' in Pipedrive → OpenAI drafts an onboarding kickoff email → Gmail draft created.",
     ("Pipedrive deal won", "n8n-nodes-base.pipedriveTrigger", {"events": ["deal.updated"]}, 1),
     [("Draft kickoff", "@n8n/n8n-nodes-langchain.openAi",
       {"resource": "chat", "modelId": {"value": "gpt-4o"},
        "messages": {"values": [{"role": "system", "content": "Draft a 150-word kickoff email. Include link to onboarding doc."},
                                   {"role": "user", "content": "={{ JSON.stringify($json) }}"}]}}, 1.6)],
     ("Gmail draft", "n8n-nodes-base.gmail",
      {"resource": "draft", "operation": "create",
       "to": "={{ $('Pipedrive deal won').first().json.contact_email }}",
       "subject": "Welcome aboard", "message": "={{ $json.message.content }}"}, 2.1),
     ["stack", "pipedrive", "gmail"]),

    ("17-monday-openai-slack", "Monday.com status change → OpenAI summary → Slack",
     "Status column changes in Monday.com → OpenAI generates a 1-paragraph context summary → posts to relevant Slack channel.",
     ("Monday status change", "n8n-nodes-base.mondayComTrigger", {"events": ["status_changed"]}, 1),
     [("Summarise change", "@n8n/n8n-nodes-langchain.openAi",
       {"resource": "chat", "modelId": {"value": "gpt-4o-mini"},
        "messages": {"values": [{"role": "system", "content": "1-paragraph summary of this Monday.com status change with context."},
                                   {"role": "user", "content": "={{ JSON.stringify($json) }}"}]}}, 1.6)],
     ("Slack ping", "n8n-nodes-base.slack",
      {"resource": "message", "operation": "post", "channel": "#projects",
       "text": "={{ $json.message.content }}"}, 2.2),
     ["stack", "monday", "slack"]),

    ("18-googleAnalytics-claude-notion", "GA4 anomaly → Claude analysis → Notion entry",
     "Daily GA4 check for traffic anomalies → Claude analyses cause hypothesis → creates Notion 'incidents' database entry for the marketing team.",
     ("Daily 7am GA4 check", "n8n-nodes-base.scheduleTrigger",
      {"rule": {"interval": [{"field": "cronExpression", "expression": "0 7 * * *"}]}}, 1.1),
     [("GA4 pull", "n8n-nodes-base.googleAnalytics",
       {"resource": "report", "operation": "get"}, 2),
      ("Claude anomaly analysis", "@n8n/n8n-nodes-langchain.anthropic",
       {"model": "claude-3-5-sonnet-20241022",
        "messages": {"values": [{"role": "user", "content": "=Check for traffic anomalies vs 7-day avg. Hypothesise cause. Data: {{ JSON.stringify($json) }}"}]}}, 1)],
     ("Notion incident", "n8n-nodes-base.notion",
      {"resource": "databasePage", "operation": "create", "databaseId": "INCIDENTS_DB_ID",
       "title": "=Anomaly — {{ $now.format('yyyy-MM-dd') }}"}, 2.2),
     ["stack", "ga4", "claude", "notion"]),
]

for slug, title, desc, trig, mids, final, tags in INTEGRATIONS:
    t_node = node(trig[0], trig[1], trig[2], (240, 300), trig[3])
    mid_nodes = [node(m[0], m[1], m[2], (440 + i*200, 300), m[3]) for i, m in enumerate(mids)]
    f_node = node(final[0], final[1], final[2], (440 + len(mids)*200, 300), final[3])
    STACK.append(make_integration(slug, title, desc, t_node, mid_nodes, f_node, tags))


write_set(STACK,
          str(CATALOG / "toolkits/197-ai-tools-stack-starter-kit/delivery/n8n-workflows"),
          "AI Tools Stack Starter Kit")


# ════════════════════════════════════════════════════════════════════
# 2. CHATGPT PROMPT VAULT — 200+ structured prompts
# ════════════════════════════════════════════════════════════════════

PROMPT_VAULT_DIR = CATALOG / "guides/097-chatgpt-business-prompt-vault/delivery"
PROMPT_VAULT_DIR.mkdir(parents=True, exist_ok=True)


def P(category, subcategory, title, system, user_template, vars_, best_model, notes=""):
    """Helper to build one prompt entry."""
    return {
        "category": category,
        "subcategory": subcategory,
        "title": title,
        "system": system,
        "user_template": user_template,
        "variables": vars_,
        "best_model": best_model,
        "notes": notes,
    }


PROMPTS = []

# ── SALES & MARKETING (40) ──
PROMPTS.extend([
    P("sales", "cold-outreach", "Cold email — pain-aware open",
      "You are a B2B SDR with deep empathy and zero pushiness. Write cold emails that sound human.",
      "Write a 100-word cold email to {{role}} at {{company}} ({{industry}}, {{size}} employees). Their likely pain: {{pain}}. Don't pitch — open a conversation.",
      ["role", "company", "industry", "size", "pain"], "claude-3-5-sonnet"),
    P("sales", "cold-outreach", "Cold email — case-study open",
      "Write cold emails that lead with proof, not features.",
      "Open with: 'We helped {{similar_company}} do {{specific_outcome}}.' Then ask {{target_company}} 1 question that connects to their {{stated_priority}}.",
      ["similar_company", "specific_outcome", "target_company", "stated_priority"], "gpt-4o"),
    P("sales", "cold-outreach", "Cold email — provocative question open",
      "Open cold emails with a question that earns curiosity.",
      "Write a 60-word cold email that opens with a provocative question about {{topic}} that {{target_persona}} would feel compelled to answer.",
      ["topic", "target_persona"], "claude-3-5-sonnet"),
    P("sales", "follow-up", "Follow-up — 48hr nudge after demo",
      "Write polite, useful follow-ups that move deals forward without nagging.",
      "Demo was {{when}}. Their stated reaction: {{their_words}}. Their concern: {{their_concern}}. Write a 90-word follow-up that addresses the concern + suggests next step.",
      ["when", "their_words", "their_concern"], "gpt-4o"),
    P("sales", "follow-up", "Follow-up — 7-day silent",
      "Follow up after silence in a way that doesn't trigger guilt or defensiveness.",
      "It's been 7 days since {{last_touch}}. Write a brief 'permission to close their file' email. Tone: warm and grace-full.",
      ["last_touch"], "claude-3-5-sonnet"),
    P("sales", "follow-up", "Follow-up — re-engaging a stalled deal",
      "Re-open dialogue with a deal that's been silent 30+ days.",
      "Deal {{deal_name}} has been silent {{days}} days. Last interaction: {{last_thing}}. Write a 'new development' angle that gives them a reason to re-engage.",
      ["deal_name", "days", "last_thing"], "gpt-4o"),
    P("sales", "objection-handling", "Objection — 'too expensive'",
      "Reframe price as cost of inaction, not justification of price.",
      "Customer said: 'It's too expensive.' Their stated budget: {{budget}}. Our price: {{price}}. Their problem costs them {{problem_cost}}/year. Reframe in 80 words.",
      ["budget", "price", "problem_cost"], "claude-3-5-sonnet"),
    P("sales", "objection-handling", "Objection — 'we're going to build it ourselves'",
      "Acknowledge the build option without dismissing it; redirect to opportunity cost.",
      "They said they'll build it internally. Their team has {{team_size}} engineers. Likely time to build: {{time_estimate}}. Reframe: what's the cost of not having it for {{months}} months?",
      ["team_size", "time_estimate", "months"], "claude-3-5-sonnet"),
    P("sales", "objection-handling", "Objection — 'we already use {{competitor}}'",
      "Position differentiation without trashing the competitor.",
      "They use {{competitor}}. Our key differentiator: {{differentiator}}. Their stated pain with current solution: {{their_pain}}. Write 80-word response that creates curiosity without disparaging.",
      ["competitor", "differentiator", "their_pain"], "gpt-4o"),
    P("sales", "linkedin", "LinkedIn DM — connection ask",
      "Send LinkedIn connection requests that don't feel like spam.",
      "Connection ask to {{role}} at {{company}}. Specific reason: {{reason}}. Mutual context: {{context}}. Under 250 chars.",
      ["role", "company", "reason", "context"], "claude-3-5-sonnet"),
    P("sales", "linkedin", "LinkedIn post — sales insight",
      "Write thought-leadership posts that earn engagement, not just impressions.",
      "Write a 200-word LinkedIn post sharing a specific insight from {{recent_sales_experience}}. Include a counterintuitive take + an open question to spark comments.",
      ["recent_sales_experience"], "claude-3-5-sonnet"),
    P("sales", "call-prep", "Discovery call agenda",
      "Build call agendas that map to revenue-relevant qualification, not just rapport.",
      "Build an agenda for a 30-min discovery call with {{prospect}} (industry: {{industry}}, role: {{role}}). Include time blocks, key qualifying questions, exit goals.",
      ["prospect", "industry", "role"], "gpt-4o"),
    P("sales", "call-prep", "Pre-call brief synthesis",
      "Turn research into a 1-pager that the seller actually reads.",
      "Compress this research into a 1-page pre-call brief: {{research_dump}}. Sections: company snapshot, why they probably booked, 3 pain points, 3 questions to open with.",
      ["research_dump"], "gpt-4o"),
    P("sales", "call-recap", "Post-call recap email",
      "Recap calls in a way that creates accountability without sounding like a lawyer.",
      "Call notes: {{notes}}. Action items: {{actions}}. Write a 120-word recap email that confirms agreed next steps and the date for next touch.",
      ["notes", "actions"], "gpt-4o"),
    P("sales", "proposal", "Proposal — 1-page format",
      "Write proposals that fit on one page and survive a CFO read.",
      "Build a 1-page proposal: client {{client}}, problem {{problem}}, our 3-phase approach: {{phases}}, investment {{investment}}, next step {{next_step}}.",
      ["client", "problem", "phases", "investment", "next_step"], "claude-3-5-sonnet"),
    P("sales", "negotiation", "Discount request — anchor + alternative",
      "Respond to discount requests by anchoring value before discussing price.",
      "They asked for {{requested_discount}}% off. Our list price: {{list_price}}. ROI we deliver: {{roi}}. Write a response that anchors the value, then offers ONE alternative (e.g., longer term, smaller scope).",
      ["requested_discount", "list_price", "roi"], "gpt-4o"),
    P("marketing", "email-subject", "Subject line generator — 10 variants",
      "Generate subject lines optimised for open rate without being clickbait.",
      "Generate 10 subject lines (under 50 chars) for an email about {{topic}} to {{audience}}. Mix curiosity, specificity, and contrarian framing.",
      ["topic", "audience"], "claude-3-5-sonnet"),
    P("marketing", "landing-page", "Landing page — value-prop section",
      "Write landing page copy that earns time on page.",
      "Write the value-prop section: H1 (outcome), subhead (who it's for), 3 supporting bullets. Product: {{product}}. ICP: {{icp}}. Outcome: {{outcome}}.",
      ["product", "icp", "outcome"], "claude-3-5-sonnet"),
    P("marketing", "landing-page", "Landing page — social proof block",
      "Surface social proof in a way that addresses skepticism.",
      "Write a social-proof section using these case studies: {{cases}}. Format: outcome metric, customer quote, transformation arc. 3 cases, equal weight.",
      ["cases"], "gpt-4o"),
    P("marketing", "ad-copy", "Google Ads — 5 headline variants",
      "Write Google Ads headlines that match the keyword's intent.",
      "Write 5 headline variants (max 30 chars each) for keyword '{{keyword}}'. Match search intent: {{intent}}. Our differentiator: {{differentiator}}.",
      ["keyword", "intent", "differentiator"], "gpt-4o-mini"),
    P("marketing", "ad-copy", "LinkedIn Ad — 3 message variants",
      "Write LinkedIn Ads that earn click-through from a discerning B2B audience.",
      "Write 3 LinkedIn ad variants (intro + 1-sentence body + CTA) targeting {{job_title}} at {{company_size}}-person {{industry}} firms. Lead with outcome.",
      ["job_title", "company_size", "industry"], "claude-3-5-sonnet"),
    P("marketing", "content", "Blog outline — H2/H3 structure",
      "Outline blog posts that rank AND read well.",
      "Build a complete outline for an article on {{topic}}. Target keyword: {{keyword}}. Audience: {{audience}}. Format: H2s + 2-3 H3s each. Include 'why this matters' + 'how to start'.",
      ["topic", "keyword", "audience"], "claude-3-5-sonnet"),
    P("marketing", "content", "Newsletter — 4-line excerpt + CTA",
      "Tease a long article in a short newsletter blurb without giving the answer away.",
      "From this article: {{article}}. Write a 4-line newsletter excerpt + 1-sentence CTA. Hook the curiosity gap.",
      ["article"], "gpt-4o"),
    P("marketing", "content", "Twitter thread — 8 tweets",
      "Write Twitter threads that flow logically and have a satisfying payoff.",
      "Turn this insight into an 8-tweet thread: {{insight}}. Tweet 1: hook. Tweet 8: takeaway. Each tweet stands on its own.",
      ["insight"], "claude-3-5-sonnet"),
    P("marketing", "content", "LinkedIn post — story format",
      "Write LinkedIn posts in story form (hook → tension → resolution → lesson).",
      "Turn this into a LinkedIn post (200-280 words): {{story}}. Structure: hook line, the tension/problem, what changed, the broader lesson.",
      ["story"], "claude-3-5-sonnet"),
    P("marketing", "case-study", "Case study — 1-pager",
      "Write case studies that work for both sales pages and PR.",
      "Build a 1-page case study: customer {{customer}}, problem {{problem}}, our approach {{approach}}, result {{quant_result}}, quote {{quote}}. Format: hook + problem + solution + result + quote.",
      ["customer", "problem", "approach", "quant_result", "quote"], "claude-3-5-sonnet"),
    P("marketing", "seo", "Meta description — high CTR",
      "Write meta descriptions that earn clicks from search.",
      "Write a 150-char meta description for an article titled '{{title}}'. Include the keyword '{{keyword}}'. End with curiosity or specificity.",
      ["title", "keyword"], "gpt-4o-mini"),
    P("marketing", "seo", "Title tag — 60 char variant",
      "Generate title tag variants that combine keyword + emotional pull.",
      "Generate 3 title tag variants (under 60 chars) for an article on {{topic}}. Each must include keyword '{{keyword}}'. Vary the emotional angle.",
      ["topic", "keyword"], "gpt-4o-mini"),
    P("marketing", "press", "Press release — 200-word format",
      "Write press releases that earn coverage without sounding like marketing.",
      "Write a 200-word press release: news {{news}}, why it matters {{significance}}, who said what {{quotes}}, where to learn more {{cta}}.",
      ["news", "significance", "quotes", "cta"], "gpt-4o"),
    P("marketing", "win-loss", "Win analysis — pattern extraction",
      "Extract repeatable wins from closed-won deal data.",
      "Analyze these closed-won notes: {{notes}}. Extract: common buying signals, decision triggers, objections that didn't kill the deal. Return 5 bullet patterns.",
      ["notes"], "gpt-4o"),
])

# ── OPERATIONS (40) ──
PROMPTS.extend([
    P("operations", "sop", "SOP — from messy notes",
      "Convert messy notes into clean SOPs that a new hire can follow.",
      "Convert these notes into a step-by-step SOP: {{notes}}. Format: title, when to run, inputs needed, steps (numbered), success criteria, common mistakes.",
      ["notes"], "claude-3-5-sonnet"),
    P("operations", "sop", "SOP — from screen recording transcript",
      "Build SOPs from screen recording transcripts.",
      "From this screen recording transcript {{transcript}}, write a step-by-step SOP. Include: prerequisites, exact button names, screenshots where helpful.",
      ["transcript"], "claude-3-5-sonnet"),
    P("operations", "meeting", "Meeting summary — exec-friendly",
      "Summarise meetings for executives who didn't attend.",
      "Summarise this meeting for an exec who didn't attend: {{transcript}}. Sections: decisions made (bullets), open questions, owner for next step, when to follow up.",
      ["transcript"], "gpt-4o"),
    P("operations", "meeting", "Action items — owner + due date",
      "Extract action items from meeting notes with realistic owner + due-date assignments.",
      "From these notes {{notes}}, extract action items as JSON: [{action, owner, due, blocking}]. Only include items with clear owner.",
      ["notes"], "gpt-4o"),
    P("operations", "status", "Weekly status update — exec format",
      "Write weekly status updates that executives can read in 90 seconds.",
      "Write a weekly status update: progress {{progress}}, blockers {{blockers}}, decisions needed {{decisions}}, next week {{next_week}}. Format: 4 sections, 3 bullets each.",
      ["progress", "blockers", "decisions", "next_week"], "claude-3-5-sonnet"),
    P("operations", "status", "Project status — RAG tagged",
      "Write project statuses with red/amber/green tagging and the rationale.",
      "Status update for project {{project}}: progress {{progress}}, risks {{risks}}, dependencies {{deps}}. Assign RAG status with 1-line rationale.",
      ["project", "progress", "risks", "deps"], "gpt-4o"),
    P("operations", "decision", "Decision memo — RAPID format",
      "Write decision memos using the RAPID framework.",
      "Write a decision memo: question {{question}}, recommend {{recommendation}}, agree {{agree}}, perform {{perform}}, input {{input}}, decide {{decide}}. 1 page.",
      ["question", "recommendation", "agree", "perform", "input", "decide"], "gpt-4o"),
    P("operations", "decision", "Trade-off matrix",
      "Build trade-off matrices that make decisions clearer.",
      "Build a 3x3 trade-off matrix for the options: {{options}}. Axes: cost, speed, risk. Score each 1-5 with 1-line justification per cell.",
      ["options"], "gpt-4o"),
    P("operations", "hiring", "JD — outcome-focused",
      "Write job descriptions that focus on outcomes, not duties.",
      "Write a JD for {{role}} at {{company_size}}-person {{industry}} firm. Format: what you'll achieve in 90/180/365 days. Avoid 'responsibilities' or 'duties'.",
      ["role", "company_size", "industry"], "claude-3-5-sonnet"),
    P("operations", "hiring", "Interview rubric — 5 criteria",
      "Build interview rubrics that surface real signal, not just feel-good answers.",
      "Build an interview rubric for {{role}}. Include: 5 evaluation criteria, what '3 / 5' looks like for each, 2 behavioural questions per criterion.",
      ["role"], "gpt-4o"),
    P("operations", "hiring", "Hiring manager debrief script",
      "Structure post-interview debriefs to avoid groupthink.",
      "Build a debrief script for {{candidate}}. Each interviewer fills before the debrief meeting: hire/no-hire, 3 strengths, 2 concerns, biggest risk if we hire.",
      ["candidate"], "claude-3-5-sonnet"),
    P("operations", "onboarding", "30-60-90 plan",
      "Build 30/60/90 plans that are specific and measurable.",
      "Build a 30/60/90 plan for {{role}} at {{company}}. Each phase: 3 measurable outcomes, 2 deliverables, 1 stretch goal.",
      ["role", "company"], "claude-3-5-sonnet"),
    P("operations", "onboarding", "Welcome packet checklist",
      "Build a welcome packet checklist that covers tech, people, context.",
      "Build a new-hire welcome checklist for {{role}}. Sections: accounts to provision, people to meet (with 1-line context per person), docs to read, first ticket to ship.",
      ["role"], "gpt-4o-mini"),
    P("operations", "vendor", "Vendor evaluation grid",
      "Build vendor evaluation grids that compare apples-to-apples.",
      "Build a grid comparing {{vendors}} on: pricing, integrations, contract terms, support tier, exit cost. Each row: 1-line summary + score 1-10.",
      ["vendors"], "gpt-4o"),
    P("operations", "vendor", "RFP — 1-page format",
      "Write RFPs that elicit useful vendor responses.",
      "Build a 1-page RFP for {{category}} vendors. Sections: what we need, must-haves vs nice-to-haves, pricing transparency required, response format, deadline.",
      ["category"], "claude-3-5-sonnet"),
    P("operations", "kickoff", "Project kickoff template",
      "Run project kickoffs that align rather than confuse.",
      "Build a kickoff agenda for {{project}}: outcomes (what we'll have), non-goals, dependencies, roles (RACI), milestones, comms cadence. 30-min slot.",
      ["project"], "gpt-4o"),
    P("operations", "retrospective", "Sprint retro — start/stop/continue",
      "Run sprint retros that surface real changes.",
      "From these sprint notes {{notes}}, build a start/stop/continue retro doc. Each item needs an owner + experiment to try next sprint.",
      ["notes"], "claude-3-5-sonnet"),
    P("operations", "retrospective", "Postmortem — blameless format",
      "Write blameless postmortems that drive improvement, not finger-pointing.",
      "Write a blameless postmortem for {{incident}}: timeline, contributing factors (no individuals named), what we'll change. End with: how would we catch this next time?",
      ["incident"], "claude-3-5-sonnet"),
    P("operations", "incident", "Incident comms — internal + external",
      "Communicate incidents in a way that builds trust, not panic.",
      "Write internal + external incident comms for {{incident}}. Internal: what's happening, who's on it, ETA, how to help. External: customer-friendly, no jargon, ETA.",
      ["incident"], "gpt-4o"),
    P("operations", "okr", "OKR drafting — outcome over output",
      "Write OKRs that measure impact, not activity.",
      "Build 3 OKRs for {{team}} for Q{{quarter}}. Each: 1 objective (qualitative), 3 key results (quantitative). Test: would this change behaviour?",
      ["team", "quarter"], "claude-3-5-sonnet"),
])

# ── FINANCE (25) ──
PROMPTS.extend([
    P("finance", "budget", "Budget variance — exec narrative",
      "Translate budget variance numbers into exec-readable narrative.",
      "Explain this variance in 100 words: budget {{budget}}, actual {{actual}}, biggest driver {{driver}}, next month outlook {{outlook}}.",
      ["budget", "actual", "driver", "outlook"], "claude-3-5-sonnet"),
    P("finance", "budget", "Budget request — justification",
      "Write budget requests that get approved.",
      "Write a budget request: $${{amount}} for {{purpose}}. Show: current cost of inaction, projected outcome with funding, alternatives considered, payback period.",
      ["amount", "purpose"], "gpt-4o"),
    P("finance", "forecast", "Revenue scenario model",
      "Build revenue scenarios with realistic assumptions.",
      "Build best/base/worst case revenue scenarios for Q{{quarter}}: base assumptions {{assumptions}}, swing variables {{variables}}. Format: 3 columns, 5 KPIs each.",
      ["quarter", "assumptions", "variables"], "gpt-4o"),
    P("finance", "forecast", "Cash runway calculation",
      "Calculate cash runway with sensitivity analysis.",
      "Compute cash runway: current cash {{cash}}, monthly burn {{burn}}, expected revenue {{revenue}}. Show: months at current burn, months if revenue grows 20%, months if costs rise 15%.",
      ["cash", "burn", "revenue"], "gpt-4o"),
    P("finance", "investor", "Investor update — monthly format",
      "Write monthly investor updates that build trust.",
      "Write a monthly investor update: numbers {{numbers}}, wins {{wins}}, blockers {{blockers}}, asks {{asks}}. Tone: candid, specific, no fluff.",
      ["numbers", "wins", "blockers", "asks"], "claude-3-5-sonnet"),
    P("finance", "investor", "Investor narrative — quarter recap",
      "Tell the quarterly story in a way that investors actually read.",
      "Recap this quarter for investors: hits {{hits}}, misses {{misses}}, what changed in thinking {{learning}}, next quarter focus {{focus}}. 1 page.",
      ["hits", "misses", "learning", "focus"], "claude-3-5-sonnet"),
    P("finance", "investor", "Pitch deck — 10 slide outline",
      "Outline pitch decks for fundraising.",
      "Outline a 10-slide pitch deck for {{company}} raising {{round}}: problem, solution, market, traction, model, team, competition, ask, use of funds, vision.",
      ["company", "round"], "gpt-4o"),
    P("finance", "pricing", "Pricing tier design",
      "Design pricing tiers that maximise revenue + minimise churn.",
      "Design 3 pricing tiers for {{product}}: feature distribution, target persona per tier, price points (with rationale), upgrade triggers.",
      ["product"], "gpt-4o"),
    P("finance", "pricing", "Price increase — customer comms",
      "Communicate price increases in a way that minimises churn.",
      "Write a price-increase email: amount {{amount}} (% increase), effective {{date}}, value added since last increase {{value_added}}, customer-friendly framing.",
      ["amount", "date", "value_added"], "claude-3-5-sonnet"),
    P("finance", "kpi", "Dashboard KPI selection",
      "Pick the right KPIs for a leadership dashboard.",
      "For a {{company_stage}} {{company_type}} business, recommend the 5 KPIs that should be on the leadership dashboard. For each: what it tells you, healthy range, lagging vs leading.",
      ["company_stage", "company_type"], "gpt-4o"),
    P("finance", "kpi", "Cohort retention narrative",
      "Translate cohort retention curves into business insight.",
      "Explain this cohort data {{data}} in 80 words. Cover: retention trajectory, comparison to industry benchmark, what's likely driving it, where to investigate.",
      ["data"], "gpt-4o"),
    P("finance", "board", "Board pre-read — 5 sections",
      "Write board pre-reads that get read.",
      "Build a board pre-read: state of business {{state}}, key decisions to discuss {{decisions}}, financials {{financials}}, asks {{asks}}, risks {{risks}}.",
      ["state", "decisions", "financials", "asks", "risks"], "claude-3-5-sonnet"),
    P("finance", "board", "Board recap email",
      "Recap board meetings so non-attendees understand the takeaways.",
      "Recap this board meeting for the team: decisions made {{decisions}}, advice given {{advice}}, what changes in our approach {{changes}}. 200 words.",
      ["decisions", "advice", "changes"], "gpt-4o"),
    P("finance", "audit", "Audit prep checklist",
      "Build audit prep checklists tailored to a company stage.",
      "Build an audit prep checklist for a {{stage}} {{type}} company. Categories: financial statements, supporting documents, control evidence, common findings to pre-empt.",
      ["stage", "type"], "claude-3-5-sonnet"),
    P("finance", "tax", "Tax planning — year-end checklist",
      "Build year-end tax checklists tailored to entity type.",
      "Build a year-end tax checklist for {{entity_type}} ({{jurisdiction}}). Categories: deductions, retirement, deferral opportunities, documentation needed.",
      ["entity_type", "jurisdiction"], "claude-3-5-sonnet"),
])

# ── HR / PEOPLE / COMMS (35) ──
PROMPTS.extend([
    P("people", "performance", "Performance review — 360 synthesis",
      "Synthesise 360 reviews into balanced narrative.",
      "Synthesise these 360 inputs into a balanced review for {{name}}: peer comments {{peer}}, manager comments {{mgr}}, self-assessment {{self}}. Output: strengths, growth areas, suggested OKRs.",
      ["name", "peer", "mgr", "self"], "claude-3-5-sonnet"),
    P("people", "performance", "Difficult feedback — script",
      "Script difficult performance conversations.",
      "Script a difficult feedback conversation: issue {{issue}}, evidence {{evidence}}, impact {{impact}}, desired change {{change}}. Use SBI framework. Anticipate 2 likely objections.",
      ["issue", "evidence", "impact", "change"], "claude-3-5-sonnet"),
    P("people", "1on1", "1:1 prep — 5 questions",
      "Build personalised 1:1 prep with 5 good questions.",
      "Build 1:1 prep for {{report}} (their context: {{context}}, current focus: {{focus}}). Output: 5 specific questions that go beyond status.",
      ["report", "context", "focus"], "gpt-4o"),
    P("people", "1on1", "Skip-level meeting prep",
      "Prep skip-level meetings to learn things you can't from direct reports.",
      "Build prep for skip-level with {{person}} (level: {{level}}, team: {{team}}). 5 questions designed to surface things their manager wouldn't tell you.",
      ["person", "level", "team"], "claude-3-5-sonnet"),
    P("people", "hard-conversation", "Performance improvement plan",
      "Write PIPs that are clear, fair, and supportive.",
      "Write a 30-day PIP for {{name}}: specific behaviours to change {{behaviours}}, success criteria {{criteria}}, check-in schedule, what happens if not met.",
      ["name", "behaviours", "criteria"], "claude-3-5-sonnet"),
    P("people", "hard-conversation", "Termination — empathetic script",
      "Script termination conversations with dignity and clarity.",
      "Script a termination conversation: reason {{reason}}, severance {{severance}}, transition plan {{transition}}. Tone: clear, dignified, no false hope.",
      ["reason", "severance", "transition"], "claude-3-5-sonnet"),
    P("people", "internal-comms", "All-hands script — strategy update",
      "Script all-hands updates that energise without spin.",
      "Script a 10-minute all-hands strategy update: company state {{state}}, focus next quarter {{focus}}, what stays {{stays}}, what changes {{changes}}.",
      ["state", "focus", "stays", "changes"], "claude-3-5-sonnet"),
    P("people", "internal-comms", "Layoff announcement — internal",
      "Communicate layoffs with honesty and respect.",
      "Write internal layoff announcement: numbers affected {{numbers}}, criteria used {{criteria}}, severance/support {{support}}, why {{why}}, what's next.",
      ["numbers", "criteria", "support", "why"], "claude-3-5-sonnet"),
    P("people", "internal-comms", "Promotion announcement",
      "Announce promotions in a way that celebrates the person + reinforces values.",
      "Write a promotion announcement for {{name}} → {{new_role}}: why they're being promoted (specific examples), team they'll lead, what doesn't change.",
      ["name", "new_role"], "gpt-4o"),
    P("people", "conflict", "Conflict mediation — 3-step framework",
      "Mediate team conflicts using a structured framework.",
      "Mediate this conflict: parties {{parties}}, surfaced issue {{surface_issue}}, likely underlying issue {{root}}. Output: 3-step mediation script (open, explore, align).",
      ["parties", "surface_issue", "root"], "claude-3-5-sonnet"),
    P("people", "culture", "Values articulation",
      "Articulate company values that aren't generic.",
      "Draft 4 company values for a {{stage}} {{industry}} company. Each value: 1 line + 1 behaviour we DO + 1 behaviour we DON'T tolerate.",
      ["stage", "industry"], "claude-3-5-sonnet"),
    P("people", "culture", "Anti-pattern documentation",
      "Document what you DON'T do as clearly as what you DO.",
      "Document 5 anti-patterns we don't tolerate at {{company}}. For each: what it looks like, why we reject it, what we do instead.",
      ["company"], "gpt-4o"),
    P("people", "wellbeing", "Burnout check-in template",
      "Run check-ins that surface burnout before it's a crisis.",
      "Build a burnout check-in for {{person}}. 4 questions designed to surface energy, autonomy, support, meaning. Each with a follow-up prompt.",
      ["person"], "claude-3-5-sonnet"),
    P("people", "exit", "Exit interview — structured",
      "Run exit interviews that produce actionable insight.",
      "Build an exit interview script for {{role}} leaving after {{tenure}}. 8 questions covering: why now, what worked, what didn't, manager feedback, recommendations.",
      ["role", "tenure"], "gpt-4o"),
    P("people", "exit", "Knowledge transfer doc",
      "Build knowledge transfer docs that survive the departure.",
      "Build a KT doc for {{leaver}} ({{role}}): what they own, contacts, in-flight projects, gotchas, where the docs are, what they wish someone had told them on day 1.",
      ["leaver", "role"], "gpt-4o"),
    P("comms", "internal-memo", "Strategic memo — Bezos-style",
      "Write strategic memos in narrative form (no bullets).",
      "Write a 6-page strategic memo on {{topic}}: situation, complication, question, answer, evidence, recommendation. Narrative paragraphs only.",
      ["topic"], "claude-3-5-sonnet"),
    P("comms", "internal-memo", "FAQ — anticipate-and-answer",
      "Write FAQs that anticipate real questions, not marketing softballs.",
      "Build an FAQ for {{announcement}}. 8 questions that real employees would ask (including uncomfortable ones). Each: honest, 2-3 sentence answer.",
      ["announcement"], "gpt-4o"),
    P("comms", "external", "Customer apology — incident",
      "Write apologies that rebuild trust, not just check a box.",
      "Write a customer apology email for {{incident}}: what happened (no PR-speak), impact on them, what we're doing, what we'll do differently.",
      ["incident"], "claude-3-5-sonnet"),
    P("comms", "external", "Press response — sensitive topic",
      "Respond to press on sensitive topics with composure.",
      "Draft a press response for {{topic}} (sensitive). Acknowledge concern, share principle, decline to speculate, redirect to constructive forward path. 100 words.",
      ["topic"], "claude-3-5-sonnet"),
])

# ── PRODUCT / ENGINEERING (35) ──
PROMPTS.extend([
    P("product", "prd", "PRD — Aiprosol format",
      "Write product requirements docs that engineers actually want to read.",
      "Write a PRD for {{feature}}: problem statement, user, jobs-to-be-done, success metric, scope, non-goals, open questions. Skip 'requirements'; use stories.",
      ["feature"], "claude-3-5-sonnet"),
    P("product", "prd", "Feature spec — single-pager",
      "Compress feature specs into a single page.",
      "1-page spec for {{feature}}: user story, what changes in the UI, what changes in data, edge cases, telemetry, success criteria.",
      ["feature"], "gpt-4o"),
    P("product", "user-story", "User stories — from feature description",
      "Generate user stories that pass the INVEST test.",
      "From this feature description {{description}}, generate user stories. Each: 'As a {{persona}}, I want {{outcome}}, so that {{benefit}}.' Acceptance criteria for each. INVEST-compliant.",
      ["description"], "gpt-4o"),
    P("product", "edge-cases", "Edge case finder",
      "Find edge cases that PM and design miss.",
      "List 15 edge cases for {{feature}}. Categories: empty states, slow networks, malformed data, race conditions, malicious input, permission boundaries, internationalisation.",
      ["feature"], "claude-3-5-sonnet"),
    P("product", "release-notes", "Release notes — user-friendly",
      "Write release notes that customers read and care about.",
      "Write release notes for {{version}}: features {{features}}, fixes {{fixes}}. Format: 'You can now…' (not 'We added…'). 1 emoji per item max.",
      ["version", "features", "fixes"], "claude-3-5-sonnet"),
    P("product", "changelog", "Changelog entry — semver-aware",
      "Write changelog entries with proper categorisation.",
      "Write a changelog entry for {{version}}: changes {{changes}}. Categorise as Breaking, Added, Changed, Fixed, Removed (Keep-a-Changelog format).",
      ["version", "changes"], "gpt-4o-mini"),
    P("product", "discovery", "Discovery interview script",
      "Run discovery interviews that surface real jobs-to-be-done.",
      "Build a 30-min discovery interview script for {{persona}} re {{topic}}. Avoid leading questions; use 'tell me about the last time you {{behaviour}}'.",
      ["persona", "topic", "behaviour"], "claude-3-5-sonnet"),
    P("product", "discovery", "Interview synthesis",
      "Synthesise interviews into themes that drive decisions.",
      "Synthesise these interview notes {{notes}}. Output: 5 themes with frequency count + 1 representative quote per theme. Flag any contradictions.",
      ["notes"], "gpt-4o"),
    P("product", "roadmap", "Roadmap framing — outcome themes",
      "Frame roadmaps around outcomes, not feature lists.",
      "Reframe this roadmap as outcomes: {{features}}. Group into 3-5 outcome themes. Each: outcome statement, what we'll learn, success metric.",
      ["features"], "claude-3-5-sonnet"),
    P("product", "prioritisation", "RICE scoring",
      "Score features using RICE framework.",
      "Score these features {{features}} using RICE (reach, impact, confidence, effort). Output sorted table with 1-line rationale per dimension.",
      ["features"], "gpt-4o"),
    P("product", "prioritisation", "Opportunity scoring",
      "Score opportunities using importance + dissatisfaction.",
      "Score these opportunities {{opportunities}} on: importance (1-10), customer satisfaction with current state (1-10). Compute opportunity score (importance + max(0, importance-satisfaction)). Sort.",
      ["opportunities"], "gpt-4o"),
    P("product", "competitive", "Competitor teardown",
      "Tear down competitors with specificity, not generic SWOT.",
      "Tear down {{competitor}} for product comparison. Output: 5 things they do better than us, 5 we do better, 3 they're about to ship, 2 they'll never ship.",
      ["competitor"], "claude-3-5-sonnet"),
    P("product", "competitive", "Win/loss debrief — customer",
      "Run win/loss debriefs that produce repeatable insight.",
      "Script a 20-min win/loss interview with {{customer}} who chose {{outcome}}. 8 questions covering: trigger event, evaluation, decision criteria, key moments, advice.",
      ["customer", "outcome"], "claude-3-5-sonnet"),
    P("product", "research", "Survey design — 8 question max",
      "Design surveys that produce actionable data.",
      "Design a 5-min survey on {{topic}} for {{audience}}. Max 8 questions. Include: 1 NPS, 1 open-ended, mix of multiple choice + scale. No leading questions.",
      ["topic", "audience"], "gpt-4o"),
    P("product", "research", "Usability test script",
      "Build usability test scripts that surface real friction.",
      "Build a 30-min usability test for {{feature}}. 5 tasks (most → least common), each with: starting context, instructions, what 'success' looks like.",
      ["feature"], "claude-3-5-sonnet"),
    P("engineering", "code-review", "Code review checklist",
      "Build code review checklists tailored to a stack.",
      "Build a code review checklist for {{stack}} code. Sections: correctness, design, readability, tests, performance, security. 3 items per section.",
      ["stack"], "claude-3-5-sonnet"),
    P("engineering", "code-review", "PR description generator",
      "Generate PR descriptions from a diff.",
      "Generate a PR description from this diff {{diff}}. Sections: what changed, why, how to test, screenshots/recordings if UI, breaking changes (if any).",
      ["diff"], "gpt-4o"),
    P("engineering", "design-doc", "Design doc — technical",
      "Write design docs that pass an architecture review.",
      "Write a technical design doc for {{system}}: context, goals, non-goals, proposed design, alternatives considered, risks, rollout plan, monitoring.",
      ["system"], "claude-3-5-sonnet"),
    P("engineering", "incident", "Runbook — on-call format",
      "Write runbooks that an on-call engineer can act on at 3am.",
      "Write a runbook for {{alert}}. Sections: what this alert means, immediate response, common causes, mitigation steps, escalation path.",
      ["alert"], "gpt-4o"),
    P("engineering", "testing", "Test plan — feature coverage",
      "Build test plans that combine unit, integration, and e2e.",
      "Build a test plan for {{feature}}: critical paths (e2e), state transitions (integration), pure functions (unit). For each test: input, expected output, why it matters.",
      ["feature"], "claude-3-5-sonnet"),
])

# ── PERSONAL PRODUCTIVITY (15) ──
PROMPTS.extend([
    P("personal", "planning", "Quarterly personal planning",
      "Plan quarters that balance work + life + learning.",
      "Help me plan Q{{quarter}} given: current goals {{goals}}, learnings from last quarter {{learnings}}, energy state {{energy}}. Output: 3 themes, 5 outcomes, 1 thing to drop.",
      ["quarter", "goals", "learnings", "energy"], "claude-3-5-sonnet"),
    P("personal", "review", "Weekly personal review",
      "Run weekly reviews that compound improvement.",
      "Help me run my weekly review. Last week's wins {{wins}}, frustrations {{frustrations}}, learnings {{learnings}}. Output: 3 patterns I should pay attention to + 1 experiment for next week.",
      ["wins", "frustrations", "learnings"], "claude-3-5-sonnet"),
    P("personal", "decision", "Personal decision framework",
      "Help with personal decisions using regret minimisation.",
      "I'm deciding between {{option_a}} and {{option_b}}. Help me think it through using: regret minimisation, what would my 80-year-old self say, what does my body know vs my head.",
      ["option_a", "option_b"], "claude-3-5-sonnet"),
    P("personal", "learning", "Learning roadmap — 90 days",
      "Build 90-day learning roadmaps that don't sprawl.",
      "Build a 90-day learning roadmap for {{topic}}. Phases: week 1-2 (orient), week 3-6 (apply), week 7-10 (deepen), week 11-13 (teach). 1 resource + 1 project per phase.",
      ["topic"], "claude-3-5-sonnet"),
    P("personal", "writing", "Writing critic — brutal honest",
      "Critique writing brutally but constructively.",
      "Critique this writing {{text}}. Be brutally honest: where does it lose me, where's the lazy thinking, what should be cut, what's the one thing that's actually good.",
      ["text"], "claude-3-5-sonnet"),
])


# Write Prompt Vault files
with open(PROMPT_VAULT_DIR / "prompts.json", "w") as f:
    json.dump({"version": "1.0", "count": len(PROMPTS),
                "license": "© 2026 Aiprosol Ltd · For purchaser's internal use",
                "prompts": PROMPTS}, f, indent=2, ensure_ascii=False)

# Markdown index
lines = [f"# Aiprosol ChatGPT Business Prompt Vault", "",
         f"Version 1.0 · {len(PROMPTS)} prompts · © 2026 Aiprosol Ltd", "",
         "## How to use", "",
         "Each prompt has a `system` (instructions) + `user_template` (with `{{variables}}` to fill).",
         "Pick a prompt, copy `system` into ChatGPT/Claude's system message,",
         "copy `user_template` into the user message and fill the `{{variables}}`.",
         "", "## Index", ""]

by_cat = {}
for p in PROMPTS:
    by_cat.setdefault(p["category"], {}).setdefault(p["subcategory"], []).append(p)

for cat in sorted(by_cat):
    lines.append(f"### {cat.upper()}")
    for sub in sorted(by_cat[cat]):
        lines.append(f"#### {sub}")
        for p in by_cat[cat][sub]:
            lines.append(f"- **{p['title']}** ({p['best_model']})")
            lines.append(f"  - {p['system'][:120]}…" if len(p['system']) > 120 else f"  - {p['system']}")
        lines.append("")
    lines.append("")

with open(PROMPT_VAULT_DIR / "prompt-vault-index.md", "w") as f:
    f.write("\n".join(lines))

print(f"✓ Prompt Vault: {len(PROMPTS)} prompts written to {PROMPT_VAULT_DIR}")


# ════════════════════════════════════════════════════════════════════
# 3 & 4. TOOLS GUIDE + TOOLS VAULT — comparison spreadsheets
# ════════════════════════════════════════════════════════════════════

TOOLS = [
    # (name, category, subcategory, pricing_floor_usd, pricing_model, integrations_count, free_tier, verdict, gotchas)
    # ── Conversational AI (10) ──
    ("ChatGPT", "Conversational AI", "Consumer chat", 0, "freemium-$20/mo", 80, True, "Default for general assistance. Best quality below $30/mo.", "Memory features still inconsistent."),
    ("Claude", "Conversational AI", "Consumer chat", 0, "freemium-$20/mo", 50, True, "Best for long-context reading, careful analysis, writing.", "Free tier rate-limits frustrate power users."),
    ("Gemini", "Conversational AI", "Consumer chat", 0, "freemium-$20/mo", 60, True, "Strong for Google ecosystem integration; weaker for code.", "Hallucinates more than peers in benchmarks."),
    ("Perplexity", "Conversational AI", "Search-aware chat", 0, "freemium-$20/mo", 20, True, "Best for research questions needing citations.", "Less good for pure reasoning vs ChatGPT/Claude."),
    ("Poe", "Conversational AI", "Multi-model", 0, "freemium-$20/mo", 0, True, "Switch between 20+ models in one UI.", "No automation/API tier."),
    ("Cohere Coral", "Conversational AI", "Enterprise chat", 0, "$0.50/M tokens", 30, False, "Stronger guardrails for regulated industries.", "Smaller community + tooling."),
    ("Anthropic API", "Conversational AI", "API access", 0, "$0.25-15/M tokens", 0, False, "Best for production apps needing high quality + safety.", "Cost can blow up on long contexts."),
    ("OpenAI API", "Conversational AI", "API access", 0, "$0.15-15/M tokens", 0, False, "Industry default API; best tooling ecosystem.", "Rate limits trip at scale."),
    ("Replicate", "Conversational AI", "Model hosting", 0, "pay-per-second", 0, False, "Run any open-source model on demand.", "Cold starts; not for latency-sensitive."),
    ("Together AI", "Conversational AI", "Model hosting", 0, "$0.20-3/M tokens", 0, False, "Cheaper inference for open-source LLMs.", "Less mature than OpenAI API tooling."),

    # ── Code generation (8) ──
    ("Claude Code", "Code generation", "Agentic CLI", 0, "API-based", 0, False, "Aiprosol's pick for production. Reads codebases, writes commits.", "Requires Anthropic API key. CLI-only."),
    ("Cursor", "Code generation", "IDE", 0, "$20/mo", 0, True, "VS Code fork with deep AI integration. Best multi-line edits.", "Subscription locks Claude/GPT model selection."),
    ("Windsurf", "Code generation", "IDE", 0, "$15/mo", 0, True, "Cleaner UI than Cursor. Codeium underneath.", "Smaller plugin ecosystem."),
    ("GitHub Copilot", "Code generation", "IDE plugin", 10, "$10-19/mo", 0, False, "Best for autocomplete within existing IDE workflows.", "Weaker on multi-file edits vs Cursor."),
    ("Codeium", "Code generation", "IDE plugin", 0, "free / $12/mo enterprise", 0, True, "Free tier for individuals. Good enough autocomplete.", "Quality slightly below Copilot."),
    ("Tabnine", "Code generation", "IDE plugin", 0, "free / $12/mo pro", 0, True, "On-prem option for security-sensitive teams.", "Quality lower than newer entrants."),
    ("Replit Agent", "Code generation", "Web IDE", 0, "freemium-$25/mo", 0, True, "Best for prototype-from-scratch in browser.", "Doesn't fit existing-repo workflows."),
    ("v0 (Vercel)", "Code generation", "UI generation", 0, "$20/mo", 0, True, "Generate React + Tailwind UI from a prompt. Aiprosol uses it.", "Output needs cleanup before prod."),

    # ── Image gen (8) ──
    ("Midjourney", "Image gen", "General", 10, "$10-120/mo", 0, False, "Best aesthetic quality. Strong community.", "Discord interface; no API until v6.1."),
    ("DALL-E 3", "Image gen", "General", 0, "via ChatGPT Plus or API", 50, True, "Best prompt-following for descriptive prompts.", "Limited style control vs Midjourney."),
    ("Stable Diffusion 3", "Image gen", "Open source", 0, "self-host / API", 0, True, "Run locally; full control; open weights.", "Setup overhead for non-engineers."),
    ("Flux", "Image gen", "Open source", 0, "API or self-host", 0, True, "New leader in photoreal output (2025).", "Less ecosystem than SD3."),
    ("Ideogram", "Image gen", "Text rendering", 0, "$8-20/mo", 0, True, "Best at rendering text inside images (logos, posters).", "Weaker at photoreal humans."),
    ("Recraft", "Image gen", "Design assets", 0, "$10-30/mo", 0, True, "Strong for vector/SVG output.", "Newer; smaller community."),
    ("Adobe Firefly", "Image gen", "Commercial-safe", 0, "via Creative Cloud", 0, True, "Commercially safe training data. Strong for brand work.", "Inside Adobe; pricier overall."),
    ("Krea", "Image gen", "Real-time", 0, "$10-60/mo", 0, True, "Real-time generation for iteration.", "Pricing tiers gate quality."),

    # ── Video gen (5) ──
    ("Runway Gen-3", "Video gen", "General", 12, "$12-95/mo", 0, True, "Most mature video gen platform.", "Generations are short (10s) and expensive."),
    ("Pika", "Video gen", "General", 0, "$10-58/mo", 0, True, "Strong for stylised motion.", "Less photoreal than Runway."),
    ("Luma Dream Machine", "Video gen", "General", 0, "$10-50/mo", 0, True, "Best for character consistency.", "Slower generation queue."),
    ("Synthesia", "Video gen", "Avatar/talking head", 22, "$22-95/mo", 5, False, "Best for talking-head training videos.", "Avatars look uncanny in close-up."),
    ("HeyGen", "Video gen", "Avatar/talking head", 24, "$24-89/mo", 5, True, "Faster + cheaper than Synthesia. Real-time avatar streams.", "Voice cloning has audible artifacts."),

    # ── Voice/audio (6) ──
    ("ElevenLabs", "Voice/audio", "Voice cloning", 0, "$5-330/mo", 5, True, "Best voice quality + multilingual.", "Voice cloning requires opt-in."),
    ("Whisper API", "Voice/audio", "Transcription", 0, "$0.006/min", 0, False, "Default for transcription. Aiprosol uses it.", "Slower than purpose-built services for live."),
    ("AssemblyAI", "Voice/audio", "Transcription + analytics", 0, "$0.37/hr", 5, False, "Adds speaker diarization, summary, sentiment.", "Pricier than Whisper if you don't need extras."),
    ("Deepgram", "Voice/audio", "Real-time transcription", 0, "$0.0036/min", 5, False, "Lowest latency for live streams.", "Quality slightly below Whisper for non-English."),
    ("Resemble", "Voice/audio", "Voice cloning", 0, "$30/mo", 0, True, "Enterprise voice cloning with detection.", "More setup than ElevenLabs."),
    ("Suno", "Voice/audio", "Music gen", 0, "$8-30/mo", 0, True, "Generate full songs from prompts.", "Commercial use unclear; check ToS."),

    # ── Knowledge base / RAG (8) ──
    ("Notion AI", "Knowledge base", "RAG", 8, "$8-15/mo", 50, False, "Best if you already use Notion. Cross-page Q&A.", "Less control than dedicated RAG."),
    ("Glean", "Knowledge base", "Enterprise RAG", 0, "$25-30/user/mo", 100, False, "Enterprise knowledge search across all SaaS.", "Long enterprise sales cycle."),
    ("Vectara", "Knowledge base", "API", 0, "$0-1k+/mo", 0, True, "RAG-as-a-service with grounded generation.", "Quality lags purpose-built solutions."),
    ("Pinecone", "Knowledge base", "Vector DB", 0, "$70+/mo", 0, True, "Production vector DB. Industry default.", "Costs scale with embeddings stored."),
    ("Chroma", "Knowledge base", "Vector DB", 0, "self-host", 0, True, "Open-source vector DB. Run anywhere.", "Smaller community vs Pinecone."),
    ("Weaviate", "Knowledge base", "Vector DB", 0, "self-host / cloud", 0, True, "Hybrid keyword + vector search.", "More complex setup than Pinecone."),
    ("Mem", "Knowledge base", "Personal", 0, "$8-20/mo", 0, True, "AI-organised personal memory.", "Less mature than Notion."),
    ("Reflect", "Knowledge base", "Personal", 0, "$8/mo", 0, True, "Backlink-based note-taking with AI.", "Less feature-rich vs Obsidian."),

    # ── No-code automation (6) ──
    ("n8n", "No-code automation", "Open source", 0, "self-host free / $20+/mo cloud", 400, True, "Aiprosol's primary. Self-host; no per-task limits.", "Steeper learning curve than Zapier."),
    ("Zapier", "No-code automation", "Cloud", 20, "$20-799/mo", 6000, True, "Most integrations. Fastest to value.", "Cost balloons; per-task pricing."),
    ("Make.com", "No-code automation", "Cloud", 9, "$9-29+/mo", 2000, True, "Best visual editor; more powerful than Zapier.", "Smaller integration count."),
    ("Pipedream", "No-code automation", "Code+nocode hybrid", 0, "$19+/mo", 2500, True, "Best when you need code escape hatch.", "Less polished UX than Zapier."),
    ("Bardeen", "No-code automation", "Browser-based", 0, "$15-99/mo", 100, True, "Run automations in your browser. Good for scraping.", "Browser-limited; can't run unattended."),
    ("Activepieces", "No-code automation", "Open source", 0, "self-host", 200, True, "Newer open-source alt to Zapier.", "Fewer integrations than n8n."),

    # ── CRM / Sales (6) ──
    ("HubSpot", "CRM/Sales", "Full suite", 0, "free / $20-1200/mo", 1000, True, "Best free CRM tier. Aiprosol uses it.", "Marketing/sales hubs get expensive fast."),
    ("Salesforce", "CRM/Sales", "Enterprise", 25, "$25-330/user/mo", 5000, False, "Industry standard for >50-rep teams.", "Implementation cost > license cost."),
    ("Pipedrive", "CRM/Sales", "SMB", 14, "$14-99/user/mo", 400, False, "Cleaner UX than HubSpot for small sales teams.", "Reporting weaker."),
    ("Close", "CRM/Sales", "Inside sales", 49, "$49-139/user/mo", 100, False, "Best for high-velocity inside sales (built-in dialer).", "Pricier per seat."),
    ("Attio", "CRM/Sales", "Notion-style", 29, "$29-119/user/mo", 50, True, "Modern CRM with relations + custom objects.", "Newer; smaller integration list."),
    ("Folk", "CRM/Sales", "Lightweight", 0, "$8-79/user/mo", 100, True, "Best for solo founders + early sales teams.", "Less powerful for larger teams."),

    # ── Email/Marketing (6) ──
    ("Resend", "Email", "Transactional", 0, "free / $20+/mo", 0, True, "Aiprosol's pick. Developer-first.", "No advanced marketing automation."),
    ("SendGrid", "Email", "Transactional", 0, "free / $19.95+/mo", 100, True, "Industry default for transactional.", "Deliverability inconsistent at scale."),
    ("Postmark", "Email", "Transactional", 15, "$15+/mo", 0, False, "Best transactional deliverability.", "More expensive than alternatives."),
    ("Customer.io", "Email", "Marketing automation", 100, "$100+/mo", 50, False, "Best behavioural email + segmentation.", "Pricier than Mailchimp."),
    ("Mailchimp", "Email", "Marketing", 0, "free-$350/mo", 300, True, "Best for non-technical marketers.", "Pricing scales poorly with list size."),
    ("Loops", "Email", "Modern marketing", 0, "$49+/mo", 20, True, "Modern alternative to Mailchimp.", "Newer; smaller template library."),

    # ── Analytics (6) ──
    ("PostHog", "Analytics", "Product analytics", 0, "free / $0.00005+/event", 30, True, "Aiprosol's pick. Self-host option.", "Pricing scales with event volume."),
    ("Mixpanel", "Analytics", "Product analytics", 0, "free / $20-833/mo", 50, True, "Industry standard for product analytics.", "Costs balloon with high event volume."),
    ("Amplitude", "Analytics", "Product analytics", 0, "free / $61+/mo", 100, True, "Best for analyst-driven cohort/funnel work.", "More complex than Mixpanel."),
    ("Plausible", "Analytics", "Web analytics", 9, "$9-69/mo", 0, False, "Privacy-friendly Google Analytics alternative.", "Less detail than GA4."),
    ("Fathom", "Analytics", "Web analytics", 15, "$15-90/mo", 0, False, "Simple, privacy-friendly web analytics.", "Pricier than Plausible per visit."),
    ("Mode", "Analytics", "SQL/BI", 0, "$0-12k+/mo", 50, True, "Best for analyst-led SQL exploration.", "Steeper learning curve than dashboards."),

    # ── Project management (6) ──
    ("Linear", "Project management", "Eng-focused", 0, "free / $10+/user/mo", 50, True, "Aiprosol's pick. Fastest issue tracker.", "Less suitable for non-eng teams."),
    ("Notion", "Project management", "Wiki + projects", 0, "free / $10+/user/mo", 100, True, "Aiprosol's pick. Best blank-page flexibility.", "Slower than dedicated tools at scale."),
    ("Asana", "Project management", "Cross-team", 0, "free / $13.49+/user/mo", 200, True, "Best for marketing/ops teams.", "Slower UX than Linear."),
    ("ClickUp", "Project management", "Everything", 0, "free / $7+/user/mo", 1000, True, "Highest feature density. Most flexibility.", "Overwhelming for small teams."),
    ("Monday.com", "Project management", "Cross-team", 0, "$9-19/user/mo", 200, True, "Best visual workflows for non-tech teams.", "Reporting weaker than Asana."),
    ("Height", "Project management", "AI-native", 0, "$0-12.50+/user/mo", 30, True, "AI-first task management.", "Newer; smaller team."),

    # ── Documents / collab (5) ──
    ("Google Workspace", "Documents", "Suite", 6, "$6-18/user/mo", 1000, False, "Industry default for cloud docs.", "Limited AI features vs Microsoft."),
    ("Microsoft 365", "Documents", "Suite", 6, "$6-22/user/mo", 1000, False, "Best AI integration (Copilot).", "Pricier add-ons."),
    ("Coda", "Documents", "Doc-as-database", 0, "free / $10+/user/mo", 100, True, "Best for ops teams needing doc + DB combo.", "Different mental model; learning curve."),
    ("Quip", "Documents", "Salesforce-integrated", 10, "$10-25/user/mo", 50, False, "Best if deep in Salesforce.", "Outside Salesforce, weak vs Google/Notion."),
    ("Stack Overflow Teams", "Documents", "Knowledge", 0, "free / $7.50+/user/mo", 30, True, "Best for eng-team Q&A retention.", "Less general than Notion."),

    # ── Customer support (6) ──
    ("Intercom", "Customer support", "Chat + helpdesk", 39, "$39+/seat/mo", 100, False, "Best AI-augmented chat experience.", "Pricing escalates with AI usage."),
    ("Zendesk", "Customer support", "Enterprise", 19, "$19+/agent/mo", 1000, False, "Industry standard. Best for >20-agent teams.", "Slower innovation; pricier."),
    ("Front", "Customer support", "Shared inbox", 19, "$19-99/seat/mo", 50, True, "Best shared inbox model.", "Less suited for high-volume helpdesk."),
    ("Plain", "Customer support", "Dev-friendly", 0, "free / $35+/seat/mo", 20, True, "Best UX for technical support teams.", "Newer; less mature."),
    ("Pylon", "Customer support", "B2B Slack-based", 0, "from $59/seat/mo", 30, False, "Best for managing customer Slack channels.", "Smaller scope vs Intercom."),
    ("Crisp", "Customer support", "SMB", 0, "free / $25-95/mo", 100, True, "Best free tier for very small teams.", "Less powerful than peers at scale."),

    # ── Observability/dev (5) ──
    ("Vercel", "Hosting/Deploy", "Frontend", 0, "free / $20+/mo", 100, True, "Aiprosol's pick. Best for Next.js.", "Pricier than VPS at scale."),
    ("Cloudflare", "Hosting/Deploy", "Edge", 0, "free / $20+/mo", 50, True, "Best CDN + edge compute.", "Workers learning curve."),
    ("Railway", "Hosting/Deploy", "Backend", 0, "$5-20+/mo", 30, True, "Best for fast backend deploys.", "Less mature than Heroku competitors."),
    ("Sentry", "Observability", "Errors", 0, "free / $26+/mo", 100, True, "Industry standard for error tracking.", "Pricing scales with events."),
    ("Datadog", "Observability", "Full-stack", 0, "from $15+/host/mo", 600, True, "Best enterprise observability.", "Bills surprise at scale."),

    # ── AI agents / orchestration (5) ──
    ("LangChain", "AI agents", "Framework", 0, "open source", 0, True, "Most popular agent framework.", "API churn frustrates teams."),
    ("LlamaIndex", "AI agents", "Framework", 0, "open source", 0, True, "Best for RAG-heavy workloads.", "Smaller community than LangChain."),
    ("CrewAI", "AI agents", "Multi-agent", 0, "open source / cloud", 0, True, "Best for multi-agent orchestration.", "Newer; production cases still emerging."),
    ("AutoGen", "AI agents", "Multi-agent", 0, "open source", 0, True, "Microsoft's multi-agent framework.", "Documentation patchy."),
    ("Inngest", "AI agents", "Durable workflows", 0, "free / $50+/mo", 20, True, "Best for long-running AI workflows.", "Steeper learning curve than n8n."),
]

# Header for both CSV files
TOOLS_HEADER = ["Name", "Category", "Subcategory", "Pricing floor (USD/mo)", "Pricing model", "Integrations", "Free tier", "Aiprosol verdict", "Gotchas"]

# AI Tools Guide (100 tools — same data, more detail)
GUIDE_DIR = CATALOG / "guides/067-ai-tools-master-comparison-guide-2026/delivery"
GUIDE_DIR.mkdir(parents=True, exist_ok=True)

with open(GUIDE_DIR / "ai-tools-master-comparison-2026.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(TOOLS_HEADER)
    for t in TOOLS:
        w.writerow([t[0], t[1], t[2], t[3], t[4], t[5], "Yes" if t[6] else "No", t[7], t[8]])

with open(GUIDE_DIR / "ai-tools-master-comparison-2026.json", "w") as f:
    json.dump({"version": "1.0", "count": len(TOOLS),
                "license": "© 2026 Aiprosol Ltd · For purchaser's internal use",
                "tools": [dict(zip(["name", "category", "subcategory", "pricing_floor_usd_monthly",
                                     "pricing_model", "integrations", "free_tier", "verdict", "gotchas"], t))
                          for t in TOOLS]}, f, indent=2)

# Tools Vault — same data + more 'curation' framing
VAULT_DIR = CATALOG / "guides/147-the-ai-tools-vault/delivery"
VAULT_DIR.mkdir(parents=True, exist_ok=True)

# Add more "hidden gems" + "avoid list" framing
HIDDEN_GEMS = [
    ("Plain", "Customer support", "Dev-friendly", "Better UX than Zendesk for technical teams. Hidden because no marketing budget."),
    ("Resend", "Email", "Transactional", "Cleaner DX than SendGrid. Hidden because newer."),
    ("Linear", "Project management", "Eng-focused", "Faster than Jira. Hidden among teams that defaulted to Jira."),
    ("Activepieces", "No-code automation", "Open source", "Cleaner alt to n8n for simple workflows. Hidden because newer."),
    ("Folk", "CRM/Sales", "Lightweight", "Best for solo founders. Hidden among teams that defaulted to HubSpot."),
    ("Inngest", "AI agents", "Durable workflows", "Best for long-running AI. Hidden because category is new."),
    ("Vectara", "Knowledge base", "API", "RAG-as-a-service. Hidden among teams that defaulted to building."),
    ("Krea", "Image gen", "Real-time", "Real-time generation is genuinely different. Hidden because crowded category."),
]

AVOID_LIST = [
    ("Salesforce", "CRM/Sales", "If your team is <50 reps. Implementation cost > license cost."),
    ("Datadog", "Observability", "If you're under 20 hosts. Cheaper alternatives suffice."),
    ("Tabnine", "Code generation", "Quality consistently below newer entrants."),
    ("Quip", "Documents", "Only makes sense if deeply in Salesforce."),
    ("Synthesia", "Video gen", "Avatars look uncanny in close-up. HeyGen's better for now."),
]

with open(VAULT_DIR / "tools-vault-master.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(TOOLS_HEADER + ["Verdict tier"])
    for t in TOOLS:
        tier = "Aiprosol pick" if "Aiprosol" in t[7] else ""
        w.writerow([t[0], t[1], t[2], t[3], t[4], t[5], "Yes" if t[6] else "No", t[7], t[8], tier])

with open(VAULT_DIR / "tools-vault-hidden-gems.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["Name", "Category", "Subcategory", "Why it's a gem"])
    w.writerows(HIDDEN_GEMS)

with open(VAULT_DIR / "tools-vault-avoid-list.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["Name", "Category", "Why to avoid (when)"])
    w.writerows(AVOID_LIST)

with open(VAULT_DIR / "tools-vault.json", "w") as f:
    json.dump({"version": "1.0",
                "license": "© 2026 Aiprosol Ltd · For purchaser's internal use",
                "master_count": len(TOOLS),
                "hidden_gems": [dict(zip(["name", "category", "subcategory", "why"], h)) for h in HIDDEN_GEMS],
                "avoid_list": [dict(zip(["name", "category", "when_to_avoid"], a)) for a in AVOID_LIST],
                "tools": [dict(zip(["name", "category", "subcategory", "pricing_floor_usd_monthly",
                                     "pricing_model", "integrations", "free_tier", "verdict", "gotchas"], t))
                          for t in TOOLS]}, f, indent=2)

print(f"✓ AI Tools Guide: {len(TOOLS)} tools written to {GUIDE_DIR}")
print(f"✓ Tools Vault: {len(TOOLS)} master + {len(HIDDEN_GEMS)} hidden gems + {len(AVOID_LIST)} avoid list → {VAULT_DIR}")

print("\nDone. Files written:")
print(f"  • Stack Starter Kit: 18 n8n workflows")
print(f"  • Prompt Vault: {len(PROMPTS)} prompts (JSON + Markdown index)")
print(f"  • AI Tools Guide: {len(TOOLS)} tools (CSV + JSON)")
print(f"  • Tools Vault: {len(TOOLS)} master + 8 hidden gems + 5 avoid (CSV + JSON)")
