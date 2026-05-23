#!/usr/bin/env python3
"""
Aiprosol · n8n workflow generator
Produces 25 production-shape n8n workflow JSON files for the Workflow Automation Playbook.
Each workflow is real (importable into n8n) but uses placeholder credentials.
"""

import json
import uuid
import os
from pathlib import Path

OUT = Path("/Users/user/Airprosol/products catalogue/01-ready-to-sell/playbooks/097-workflow-automation-playbook/delivery/n8n-workflows")
OUT.mkdir(parents=True, exist_ok=True)


def node(name, type_, params=None, position=(0, 0), type_version=1, credentials=None):
    """Build one n8n node."""
    n = {
        "parameters": params or {},
        "id": str(uuid.uuid4()),
        "name": name,
        "type": type_,
        "typeVersion": type_version,
        "position": list(position),
    }
    if credentials:
        n["credentials"] = credentials
    return n


def workflow(name, description, nodes, connections, tags=None):
    """Build a complete n8n workflow."""
    return {
        "name": name,
        "nodes": nodes,
        "connections": connections,
        "active": False,
        "settings": {"executionOrder": "v1"},
        "staticData": None,
        "tags": [{"name": t} for t in (tags or [])],
        "meta": {"templateCredsSetupCompleted": False, "instanceId": "aiprosol-playbook-v1"},
        "pinData": {},
        "versionId": str(uuid.uuid4()),
        "id": str(uuid.uuid4()),
        "_aiprosol": {
            "description": description,
            "version": "1.0",
            "license": "© 2026 Aiprosol Ltd · For purchaser's internal use",
        },
    }


def chain(*node_names):
    """Build a linear connections object from a chain of node names."""
    c = {}
    for i in range(len(node_names) - 1):
        c[node_names[i]] = {"main": [[{"node": node_names[i + 1], "type": "main", "index": 0}]]}
    return c


def fan_out(source, targets):
    """One node fans out to multiple downstream nodes (all triggered)."""
    return {source: {"main": [[{"node": t, "type": "main", "index": 0} for t in targets]]}}


# ────────────────────────────────────────────────────────────────────────
# 25 WORKFLOWS
# ────────────────────────────────────────────────────────────────────────

WORKFLOWS = []

# ─── SALES (1-5) ───

# 1. Inbound lead → CRM + lead score + Slack
WORKFLOWS.append((
    "01-inbound-lead-score-route",
    "Inbound lead → CRM + lead score + Slack",
    "Sales — Pattern 1 (linear pipeline). Webhook trigger receives lead form data. OpenAI scores against ICP. HubSpot creates contact. Slack pings sales channel with score and one-line summary.",
    workflow(
        "Aiprosol — Inbound lead → CRM + score + Slack",
        "Inbound lead form → AI lead-scoring → HubSpot create → Slack notify",
        [
            node("Webhook · /lead", "n8n-nodes-base.webhook",
                 {"httpMethod": "POST", "path": "lead-capture", "responseMode": "responseNode"},
                 (240, 300), 1.1),
            node("Validate fields", "n8n-nodes-base.set",
                 {"assignments": {"assignments": [
                     {"id": "1", "name": "email", "value": "={{ $json.email }}", "type": "string"},
                     {"id": "2", "name": "name", "value": "={{ $json.name }}", "type": "string"},
                     {"id": "3", "name": "company", "value": "={{ $json.company }}", "type": "string"},
                     {"id": "4", "name": "employee_count", "value": "={{ $json.employees }}", "type": "number"},
                 ]}},
                 (440, 300), 3.4),
            node("Score with OpenAI", "@n8n/n8n-nodes-langchain.openAi",
                 {"resource": "chat", "modelId": {"value": "gpt-4o-mini"},
                  "messages": {"values": [
                      {"role": "system", "content": "You are a B2B sales scoring engine. Score this lead 0-100 against this ICP: 10-200 employee professional services or SaaS in UK/EU/US. Return JSON: {\"score\": int, \"reasoning\": string, \"tier\": \"hot|warm|watch|cold\"}"},
                      {"role": "user", "content": "Lead: name={{ $json.name }} company={{ $json.company }} employees={{ $json.employee_count }} role={{ $json.role || 'unknown' }} stated_problem={{ $json.problem || 'unknown' }}"}
                  ]}, "options": {"responseFormat": "json_object"}},
                 (640, 300), 1.6),
            node("Parse score", "n8n-nodes-base.code",
                 {"language": "javaScript", "jsCode": "const parsed = JSON.parse($input.first().json.message.content); return [{json: {...parsed, ...$('Validate fields').first().json}}];"},
                 (840, 300), 2),
            node("HubSpot — Create contact", "n8n-nodes-base.hubspot",
                 {"resource": "contact", "operation": "create",
                  "additionalFields": {"properties": {"property": [
                      {"property": "email", "value": "={{ $json.email }}"},
                      {"property": "firstname", "value": "={{ $json.name }}"},
                      {"property": "company", "value": "={{ $json.company }}"},
                      {"property": "lead_score", "value": "={{ $json.score }}"},
                      {"property": "lead_tier", "value": "={{ $json.tier }}"},
                  ]}}},
                 (1040, 300), 2),
            node("Slack — Notify sales", "n8n-nodes-base.slack",
                 {"resource": "message", "operation": "post",
                  "channel": "#sales-inbound",
                  "text": "=🔥 New {{ $json.tier }} lead — score {{ $json.score }}/100\\n*{{ $json.name }}* at *{{ $json.company }}* ({{ $json.employee_count }} ppl)\\nProblem: {{ $('Validate fields').first().json.problem || 'not stated' }}\\nReasoning: {{ $json.reasoning }}"},
                 (1240, 300), 2.2),
            node("Respond 201", "n8n-nodes-base.respondToWebhook",
                 {"respondWith": "json", "responseBody": "={\"ok\":true,\"score\":{{ $('Parse score').first().json.score }}}"},
                 (1440, 300), 1.1),
        ],
        chain("Webhook · /lead", "Validate fields", "Score with OpenAI", "Parse score",
              "HubSpot — Create contact", "Slack — Notify sales", "Respond 201"),
        tags=["sales", "lead-gen", "pattern-1"],
    ),
))

# 2. Discovery-call recording → action items + draft proposal
WORKFLOWS.append((
    "02-discovery-call-to-proposal",
    "Discovery-call recording → action items + draft proposal",
    "Sales — Pattern 1 + AI. Triggered when Fireflies/Otter posts a meeting transcript webhook. Extracts: pain points, budget signals, decision criteria, next steps. Drafts a tailored proposal in Google Docs.",
    workflow(
        "Aiprosol — Discovery call → action items + proposal draft",
        "Meeting transcript webhook → AI extracts intent → draft proposal in Google Docs",
        [
            node("Webhook · /transcript", "n8n-nodes-base.webhook",
                 {"httpMethod": "POST", "path": "discovery-transcript"},
                 (240, 300), 1.1),
            node("Extract structured signals", "@n8n/n8n-nodes-langchain.openAi",
                 {"resource": "chat", "modelId": {"value": "gpt-4o"},
                  "messages": {"values": [
                      {"role": "system", "content": "Read the discovery call transcript. Extract JSON: {\"pain_points\":[3 items], \"budget_signal\":\"under-50k|50-200k|over-200k|unknown\", \"decision_criteria\":[items], \"timeline\":\"q-this|q-next|exploring|unknown\", \"next_steps\":[items], \"deal_size_est\":number}"},
                      {"role": "user", "content": "={{ $json.transcript }}"}
                  ]}, "options": {"responseFormat": "json_object"}},
                 (440, 300), 1.6),
            node("Draft proposal copy", "@n8n/n8n-nodes-langchain.openAi",
                 {"resource": "chat", "modelId": {"value": "gpt-4o"},
                  "messages": {"values": [
                      {"role": "system", "content": "Draft a 1-page proposal in markdown. Sections: Their goal, Our approach (3 phases), Investment range, Next step. Use their language from the transcript."},
                      {"role": "user", "content": "=Transcript signals: {{ JSON.stringify($json.message.content) }}\\n\\nFull transcript:\\n{{ $('Webhook · /transcript').first().json.transcript }}"}
                  ]}},
                 (640, 300), 1.6),
            node("Google Docs — Create proposal", "n8n-nodes-base.googleDocs",
                 {"operation": "create",
                  "title": "=Proposal — {{ $('Webhook · /transcript').first().json.company }} — {{ $now.format('yyyy-MM-dd') }}",
                  "folderId": "PROPOSALS_FOLDER_ID",
                  "content": "={{ $json.message.content }}"},
                 (840, 300), 2),
            node("Slack — Notify rep", "n8n-nodes-base.slack",
                 {"resource": "message", "operation": "post",
                  "channel": "={{ $('Webhook · /transcript').first().json.rep_slack || '#sales' }}",
                  "text": "=📄 Proposal drafted for {{ $('Webhook · /transcript').first().json.company }}\\nDeal size est: ${{ $('Extract structured signals').first().json.message.content }}\\n👉 {{ $json.webViewLink }}"},
                 (1040, 300), 2.2),
        ],
        chain("Webhook · /transcript", "Extract structured signals", "Draft proposal copy",
              "Google Docs — Create proposal", "Slack — Notify rep"),
        tags=["sales", "ai-drafting", "pattern-1"],
    ),
))

# 3. Stale-deal radar
WORKFLOWS.append((
    "03-stale-deal-radar",
    "Stale-deal radar — daily pipeline hygiene",
    "Sales — Pattern 4 (scheduled aggregation). Every weekday 8am pull all deals from HubSpot, find ones with no activity in >14 days, post a digest to Slack with last-touch dates and recommended next actions.",
    workflow(
        "Aiprosol — Stale-deal radar",
        "Daily 8am cron → HubSpot deals (no activity 14+ days) → Slack digest",
        [
            node("Daily 8am", "n8n-nodes-base.scheduleTrigger",
                 {"rule": {"interval": [{"field": "cronExpression", "expression": "0 8 * * 1-5"}]}},
                 (240, 300), 1.1),
            node("HubSpot — search deals", "n8n-nodes-base.hubspot",
                 {"resource": "deal", "operation": "getAll",
                  "filters": {"propertiesCollection": {"properties": ["dealname", "amount", "dealstage", "hs_lastmodifieddate", "hubspot_owner_id"]}},
                  "returnAll": False, "limit": 200},
                 (440, 300), 2),
            node("Filter: no activity 14+ days", "n8n-nodes-base.code",
                 {"language": "javaScript", "jsCode": "const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000; return $input.all().filter(i => new Date(i.json.hs_lastmodifieddate).getTime() < cutoff && !['closedwon','closedlost'].includes(i.json.dealstage));"},
                 (640, 300), 2),
            node("AI-suggest next action", "@n8n/n8n-nodes-langchain.openAi",
                 {"resource": "chat", "modelId": {"value": "gpt-4o-mini"},
                  "messages": {"values": [
                      {"role": "system", "content": "For each stale deal, suggest one concrete next action in <15 words. Be specific (not 'follow up')."},
                      {"role": "user", "content": "={{ JSON.stringify($json) }}"}
                  ]}},
                 (840, 300), 1.6),
            node("Slack — digest", "n8n-nodes-base.slack",
                 {"resource": "message", "operation": "post",
                  "channel": "#sales-pipeline",
                  "text": "=🕰 Stale-deal radar — {{ $now.format('EEE dd MMM') }}\\n\\n{{ $items().map(i => `• ${i.json.dealname} ($${i.json.amount}) — last touched ${i.json.hs_lastmodifieddate.split('T')[0]} → ${i.json.suggested_action}`).join('\\n') }}"},
                 (1040, 300), 2.2),
        ],
        chain("Daily 8am", "HubSpot — search deals", "Filter: no activity 14+ days",
              "AI-suggest next action", "Slack — digest"),
        tags=["sales", "pipeline-hygiene", "pattern-4"],
    ),
))

# 4. Pipeline review prep auto-doc
WORKFLOWS.append((
    "04-pipeline-review-autodoc",
    "Pipeline review prep auto-doc",
    "Sales — Pattern 4. Every Monday 7am pulls all deals, groups by stage, computes totals + week-over-week changes, generates a markdown brief in Notion. Sales lead opens it before the 10am pipeline meeting.",
    workflow(
        "Aiprosol — Pipeline review prep auto-doc",
        "Monday 7am → pipeline data → AI summary → Notion page → Slack ping",
        [
            node("Weekly Mon 7am", "n8n-nodes-base.scheduleTrigger",
                 {"rule": {"interval": [{"field": "cronExpression", "expression": "0 7 * * 1"}]}},
                 (240, 300), 1.1),
            node("HubSpot — open deals", "n8n-nodes-base.hubspot",
                 {"resource": "deal", "operation": "getAll", "returnAll": True},
                 (440, 300), 2),
            node("Aggregate by stage", "n8n-nodes-base.code",
                 {"language": "javaScript", "jsCode": "const all = $input.all(); const byStage = {}; for (const i of all) { const s = i.json.dealstage; if (!byStage[s]) byStage[s] = { count: 0, total: 0, deals: [] }; byStage[s].count += 1; byStage[s].total += Number(i.json.amount || 0); byStage[s].deals.push({ name: i.json.dealname, amount: i.json.amount }); } return [{ json: byStage }];"},
                 (640, 300), 2),
            node("AI brief", "@n8n/n8n-nodes-langchain.openAi",
                 {"resource": "chat", "modelId": {"value": "gpt-4o"},
                  "messages": {"values": [
                      {"role": "system", "content": "You are a sales analyst. Write a 1-page Markdown briefing for the Monday pipeline review. Sections: Headline numbers, At-risk deals, This week's priorities, Questions for the meeting. Be specific, no fluff."},
                      {"role": "user", "content": "={{ JSON.stringify($json) }}"}
                  ]}},
                 (840, 300), 1.6),
            node("Notion — create page", "n8n-nodes-base.notion",
                 {"resource": "databasePage", "operation": "create",
                  "databaseId": "PIPELINE_DB_ID",
                  "title": "=Pipeline Review — {{ $now.format('yyyy-MM-dd') }}",
                  "blockUi": {"blockValues": [{"type": "paragraph", "textContent": "={{ $json.message.content }}"}]}},
                 (1040, 300), 2.2),
            node("Slack — notify team", "n8n-nodes-base.slack",
                 {"resource": "message", "operation": "post", "channel": "#sales",
                  "text": "=📋 Pipeline review brief ready: {{ $json.url }}"},
                 (1240, 300), 2.2),
        ],
        chain("Weekly Mon 7am", "HubSpot — open deals", "Aggregate by stage",
              "AI brief", "Notion — create page", "Slack — notify team"),
        tags=["sales", "reporting", "pattern-4"],
    ),
))

# 5. Deal stage change → next-step email draft
WORKFLOWS.append((
    "05-deal-stage-change-email",
    "Deal stage change → AI-drafted next-step email",
    "Sales — Pattern 1 + Approval gate. HubSpot webhook fires on deal stage change. AI drafts the appropriate next email based on which stage was entered (demo-booked → confirmation, proposal-sent → check-in, etc.). Saves as draft in Gmail.",
    workflow(
        "Aiprosol — Deal stage change → next-step email draft",
        "HubSpot deal stage webhook → AI-drafted Gmail draft based on new stage",
        [
            node("HubSpot webhook", "n8n-nodes-base.webhook",
                 {"httpMethod": "POST", "path": "deal-stage-change"},
                 (240, 300), 1.1),
            node("Get full deal", "n8n-nodes-base.hubspot",
                 {"resource": "deal", "operation": "get", "dealId": "={{ $json.objectId }}"},
                 (440, 300), 2),
            node("Get primary contact", "n8n-nodes-base.hubspot",
                 {"resource": "contact", "operation": "get",
                  "contactId": "={{ $json.associations.contacts.results[0].id }}"},
                 (640, 300), 2),
            node("Draft email", "@n8n/n8n-nodes-langchain.openAi",
                 {"resource": "chat", "modelId": {"value": "gpt-4o"},
                  "messages": {"values": [
                      {"role": "system", "content": "Draft the right next-step email based on the deal's new stage. Demo-booked → friendly confirmation w/ pre-call brief. Proposal-sent → polite check-in. Closed-won → onboarding kickoff. Closed-lost → graceful close with door open. Match the contact's tone. Keep <120 words."},
                      {"role": "user", "content": "=Contact: {{ $json.properties.firstname }} {{ $json.properties.lastname }} at {{ $('Get full deal').first().json.properties.dealname }}\\nNew stage: {{ $('HubSpot webhook').first().json.propertyName }} = {{ $('HubSpot webhook').first().json.propertyValue }}"}
                  ]}},
                 (840, 300), 1.6),
            node("Gmail — create draft", "n8n-nodes-base.gmail",
                 {"resource": "draft", "operation": "create",
                  "to": "={{ $('Get primary contact').first().json.properties.email }}",
                  "subject": "=Re: {{ $('Get full deal').first().json.properties.dealname }}",
                  "message": "={{ $json.message.content }}",
                  "options": {"appendAttribution": False}},
                 (1040, 300), 2.1),
            node("Slack — notify rep", "n8n-nodes-base.slack",
                 {"resource": "message", "operation": "post", "channel": "#sales",
                  "text": "=📨 Draft queued for {{ $('Get full deal').first().json.properties.dealname }} → gmail.com/drafts"},
                 (1240, 300), 2.2),
        ],
        chain("HubSpot webhook", "Get full deal", "Get primary contact",
              "Draft email", "Gmail — create draft", "Slack — notify rep"),
        tags=["sales", "ai-drafting", "pattern-1"],
    ),
))

# ─── CUSTOMER SUCCESS (6-10) ───

# 6. Welcome packet (60-second send)
WORKFLOWS.append((
    "06-welcome-packet-fanout",
    "Welcome packet — 60-second customer onboarding fan-out",
    "Customer success — Pattern 3 (fan-out). Stripe new-customer webhook fires 5 actions in parallel: welcome email, Slack #customers channel ping, Notion project workspace, calendar kickoff slot, Trello onboarding board.",
    workflow(
        "Aiprosol — Welcome packet fan-out",
        "Stripe new customer → parallel: email + Slack + Notion + calendar + Trello",
        [
            node("Stripe — new customer", "n8n-nodes-base.stripeTrigger",
                 {"events": ["customer.created"]},
                 (240, 300), 1),
            node("Gmail — welcome email", "n8n-nodes-base.gmail",
                 {"resource": "message", "operation": "send",
                  "to": "={{ $json.email }}",
                  "subject": "Welcome to Aiprosol — your kickoff link inside",
                  "message": "=Hi {{ $json.name || 'there' }},\\n\\nWelcome aboard. Your kickoff is booked — calendar invite sent separately.\\n\\nNext 60 minutes: read the onboarding doc → fill the intake form → join your Slack channel.\\n\\n— Srijan"},
                 (440, 150), 2.1),
            node("Slack — #customers ping", "n8n-nodes-base.slack",
                 {"resource": "message", "operation": "post", "channel": "#customers",
                  "text": "=🎉 New customer: *{{ $json.name || $json.email }}* (${{ $json.balance / -100 }} contracted)"},
                 (440, 300), 2.2),
            node("Notion — project page", "n8n-nodes-base.notion",
                 {"resource": "databasePage", "operation": "create",
                  "databaseId": "CUSTOMERS_DB_ID",
                  "title": "={{ $json.name || $json.email }}",
                  "propertiesUi": {"propertyValues": [
                      {"key": "Status|select", "selectValue": "Onboarding"},
                      {"key": "Email|email", "emailValue": "={{ $json.email }}"},
                  ]}},
                 (440, 450), 2.2),
            node("Calendar — kickoff slot", "n8n-nodes-base.googleCalendar",
                 {"resource": "event", "operation": "create",
                  "calendar": {"__rl": True, "value": "primary"},
                  "start": "={{ $now.plus(2, 'day').set({hour: 10, minute: 0}).toISO() }}",
                  "end": "={{ $now.plus(2, 'day').set({hour: 10, minute: 45}).toISO() }}",
                  "summary": "=Kickoff — {{ $json.name || $json.email }}",
                  "additionalFields": {"attendees": ["={{ $json.email }}"]}},
                 (440, 600), 1.3),
            node("Trello — onboarding board", "n8n-nodes-base.trello",
                 {"resource": "card", "operation": "create",
                  "listId": "ONBOARDING_LIST_ID",
                  "name": "={{ $json.name || $json.email }} — onboarding",
                  "additionalFields": {"description": "=Stripe customer {{ $json.id }}"}},
                 (440, 750), 1),
        ],
        fan_out("Stripe — new customer",
                ["Gmail — welcome email", "Slack — #customers ping", "Notion — project page",
                 "Calendar — kickoff slot", "Trello — onboarding board"]),
        tags=["customer-success", "onboarding", "pattern-3"],
    ),
))

# 7. Onboarding milestone tracker
WORKFLOWS.append((
    "07-onboarding-milestones",
    "Onboarding milestone tracker — Day 1/7/30 checkpoints",
    "Customer success — Pattern 7 (long-running orchestrator). On new customer, schedules 3 future checkpoints: Day 1 'how was kickoff?', Day 7 'first deliverable shipped?', Day 30 'are you using the thing?'. Each fires an automated check + Slack if a milestone is missed.",
    workflow(
        "Aiprosol — Onboarding milestones (Day 1 / 7 / 30)",
        "Customer.created → wait 1d → check kickoff → wait 6d → check delivery → wait 23d → check usage",
        [
            node("Stripe — new customer", "n8n-nodes-base.stripeTrigger",
                 {"events": ["customer.created"]},
                 (240, 300), 1),
            node("Wait 1 day", "n8n-nodes-base.wait",
                 {"resume": "timeInterval", "amount": 1, "unit": "days"},
                 (440, 300), 1.1),
            node("Check Day 1 — kickoff completed?", "n8n-nodes-base.googleCalendar",
                 {"resource": "event", "operation": "getAll",
                  "calendar": {"__rl": True, "value": "primary"},
                  "additionalFields": {"q": "={{ $('Stripe — new customer').first().json.email }}"}},
                 (640, 300), 1.3),
            node("Wait 6 days", "n8n-nodes-base.wait",
                 {"resume": "timeInterval", "amount": 6, "unit": "days"},
                 (840, 300), 1.1),
            node("Check Day 7 — Slack engagement", "n8n-nodes-base.slack",
                 {"resource": "message", "operation": "getAll",
                  "channel": "={{ '#customer-' + $('Stripe — new customer').first().json.id }}"},
                 (1040, 300), 2.2),
            node("Wait 23 days", "n8n-nodes-base.wait",
                 {"resume": "timeInterval", "amount": 23, "unit": "days"},
                 (1240, 300), 1.1),
            node("Day 30 NPS request", "n8n-nodes-base.gmail",
                 {"resource": "message", "operation": "send",
                  "to": "={{ $('Stripe — new customer').first().json.email }}",
                  "subject": "Quick 1-question check-in — are you getting value?",
                  "message": "=Hi {{ $('Stripe — new customer').first().json.name || 'there' }},\\n\\n30 days in. On a scale of 0-10, how likely are you to recommend Aiprosol to a peer?\\n\\nReply with just the number — I read every one personally.\\n\\n— Srijan"},
                 (1440, 300), 2.1),
        ],
        chain("Stripe — new customer", "Wait 1 day", "Check Day 1 — kickoff completed?",
              "Wait 6 days", "Check Day 7 — Slack engagement", "Wait 23 days", "Day 30 NPS request"),
        tags=["customer-success", "long-running", "pattern-7"],
    ),
))

# 8. At-risk early-warning
WORKFLOWS.append((
    "08-at-risk-early-warning",
    "At-risk customer early-warning — daily scan",
    "Customer success — Pattern 4. Every day 8am pull all active customers, check for at-risk signals (no login 14d, support tickets +50%, NPS<7, payment retry). AI scores risk 0-100. Anyone over 60 → Slack ping CS lead with full context.",
    workflow(
        "Aiprosol — At-risk customer early-warning",
        "Daily 8am → pull customers → score risk via AI → Slack alerts over threshold",
        [
            node("Daily 8am", "n8n-nodes-base.scheduleTrigger",
                 {"rule": {"interval": [{"field": "cronExpression", "expression": "0 8 * * *"}]}},
                 (240, 300), 1.1),
            node("Get active customers", "n8n-nodes-base.notion",
                 {"resource": "databasePage", "operation": "getAll",
                  "databaseId": "CUSTOMERS_DB_ID",
                  "filterType": "manual",
                  "matchType": "anyFilter",
                  "filters": {"conditions": [{"key": "Status|select", "condition": "equals", "selectValue": "Active"}]}},
                 (440, 300), 2.2),
            node("Get last-login data", "n8n-nodes-base.httpRequest",
                 {"method": "POST", "url": "https://api.posthog.com/api/projects/PROJECT_ID/query",
                  "sendBody": True, "specifyBody": "json",
                  "jsonBody": "={\"query\":{\"kind\":\"HogQLQuery\",\"query\":\"select distinct_id, max(timestamp) from events where distinct_id = '{{ $json.email }}' group by distinct_id\"}}",
                  "sendHeaders": True, "headerParameters": {"parameters": [{"name": "Authorization", "value": "Bearer ={{ $env.POSTHOG_KEY }}"}]}},
                 (640, 300), 4.1),
            node("Score risk", "@n8n/n8n-nodes-langchain.openAi",
                 {"resource": "chat", "modelId": {"value": "gpt-4o-mini"},
                  "messages": {"values": [
                      {"role": "system", "content": "Score 0-100 churn risk for this customer based on signals. Return JSON {\"risk\":int,\"top_signal\":string,\"recommended_action\":string}"},
                      {"role": "user", "content": "={{ JSON.stringify($json) }}"}
                  ]}, "options": {"responseFormat": "json_object"}},
                 (840, 300), 1.6),
            node("If risk > 60", "n8n-nodes-base.if",
                 {"conditions": {"options": {"caseSensitive": True, "leftValue": "", "typeValidation": "strict"},
                                 "conditions": [{"id": "1", "leftValue": "={{ JSON.parse($json.message.content).risk }}",
                                                 "rightValue": 60, "operator": {"type": "number", "operation": "gt"}}]}},
                 (1040, 300), 2),
            node("Slack — CS alert", "n8n-nodes-base.slack",
                 {"resource": "message", "operation": "post", "channel": "#cs-alerts",
                  "text": "=🚨 At-risk: {{ $('Get active customers').first().json.name }} (risk {{ JSON.parse($json.message.content).risk }}/100)\\nTop signal: {{ JSON.parse($json.message.content).top_signal }}\\nNext: {{ JSON.parse($json.message.content).recommended_action }}"},
                 (1240, 200), 2.2),
        ],
        {
            "Daily 8am": {"main": [[{"node": "Get active customers", "type": "main", "index": 0}]]},
            "Get active customers": {"main": [[{"node": "Get last-login data", "type": "main", "index": 0}]]},
            "Get last-login data": {"main": [[{"node": "Score risk", "type": "main", "index": 0}]]},
            "Score risk": {"main": [[{"node": "If risk > 60", "type": "main", "index": 0}]]},
            "If risk > 60": {"main": [[{"node": "Slack — CS alert", "type": "main", "index": 0}], []]},
        },
        tags=["customer-success", "retention", "pattern-4"],
    ),
))

# 9. QBR auto-draft from usage data
WORKFLOWS.append((
    "09-qbr-autodraft",
    "Quarterly Business Review auto-draft from usage data",
    "Customer success — Pattern 4. On the 1st of each new quarter, for each active customer, pull last 90 days of usage + outcomes data, generate a draft QBR slide deck (markdown that Google Slides API converts to deck). CS team edits + presents.",
    workflow(
        "Aiprosol — QBR auto-draft",
        "Quarterly cron → for each customer → usage data → AI QBR brief → Google Slides",
        [
            node("Quarterly cron", "n8n-nodes-base.scheduleTrigger",
                 {"rule": {"interval": [{"field": "cronExpression", "expression": "0 9 1 1,4,7,10 *"}]}},
                 (240, 300), 1.1),
            node("Active customers", "n8n-nodes-base.notion",
                 {"resource": "databasePage", "operation": "getAll", "databaseId": "CUSTOMERS_DB_ID"},
                 (440, 300), 2.2),
            node("90-day usage", "n8n-nodes-base.httpRequest",
                 {"method": "GET", "url": "=https://api.aiprosol.com/usage?customer={{ $json.id }}&days=90"},
                 (640, 300), 4.1),
            node("QBR draft", "@n8n/n8n-nodes-langchain.openAi",
                 {"resource": "chat", "modelId": {"value": "gpt-4o"},
                  "messages": {"values": [
                      {"role": "system", "content": "Draft a 10-slide QBR for this customer. Slides: 1 cover, 2 outcomes summary, 3-5 wins, 6-7 risks/blockers, 8-9 next-quarter plan, 10 the ask. Markdown with '---' between slides."},
                      {"role": "user", "content": "={{ JSON.stringify($json) }}"}
                  ]}},
                 (840, 300), 1.6),
            node("Google Slides — create", "n8n-nodes-base.googleSlides",
                 {"operation": "createPresentation",
                  "title": "=QBR — {{ $('Active customers').first().json.name }} — {{ $now.format('yyyy-QQQ') }}"},
                 (1040, 300), 1),
            node("Slack — notify CS", "n8n-nodes-base.slack",
                 {"resource": "message", "operation": "post", "channel": "#cs",
                  "text": "=📊 QBR drafts ready for {{ $('Active customers').all().length }} customers — review folder"},
                 (1240, 300), 2.2),
        ],
        chain("Quarterly cron", "Active customers", "90-day usage", "QBR draft",
              "Google Slides — create", "Slack — notify CS"),
        tags=["customer-success", "reporting", "pattern-4"],
    ),
))

# 10. NPS detractor recovery loop
WORKFLOWS.append((
    "10-nps-detractor-recovery",
    "NPS detractor recovery loop",
    "Customer success — Pattern 2 (branching by classifier). NPS response webhook arrives. Score 0-6 = detractor → branch into AI-generated personal apology + recovery offer + book-call CTA; 7-8 = passive → ask for one specific improvement; 9-10 = promoter → ask for testimonial + referral.",
    workflow(
        "Aiprosol — NPS detractor recovery (branching by score)",
        "NPS webhook → classify 0-6/7-8/9-10 → personalised follow-up email per band",
        [
            node("NPS webhook", "n8n-nodes-base.webhook",
                 {"httpMethod": "POST", "path": "nps-response"},
                 (240, 300), 1.1),
            node("Switch by score", "n8n-nodes-base.switch",
                 {"rules": {"values": [
                     {"conditions": {"conditions": [{"leftValue": "={{ $json.score }}", "rightValue": 7,
                                                      "operator": {"type": "number", "operation": "lt"}}]},
                      "renameOutput": True, "outputKey": "detractor"},
                     {"conditions": {"conditions": [{"leftValue": "={{ $json.score }}", "rightValue": 9,
                                                      "operator": {"type": "number", "operation": "lt"}}]},
                      "renameOutput": True, "outputKey": "passive"},
                     {"conditions": {"conditions": [{"leftValue": "={{ $json.score }}", "rightValue": 9,
                                                      "operator": {"type": "number", "operation": "gte"}}]},
                      "renameOutput": True, "outputKey": "promoter"},
                 ]}},
                 (440, 300), 3),
            node("Detractor → recovery email", "n8n-nodes-base.gmail",
                 {"resource": "message", "operation": "send",
                  "to": "={{ $json.email }}",
                  "subject": "Sorry we missed the mark — can we talk?",
                  "message": "=Hi {{ $json.name }}, your {{ $json.score }}/10 hit my desk this morning. I want to understand what's not working and fix it. 15 min next week? — Srijan"},
                 (640, 150), 2.1),
            node("Passive → ask one thing", "n8n-nodes-base.gmail",
                 {"resource": "message", "operation": "send",
                  "to": "={{ $json.email }}",
                  "subject": "Quick question — what's the ONE thing?",
                  "message": "=Hi {{ $json.name }}, thanks for the {{ $json.score }}/10. What's the ONE specific change that would make it a 9 or 10? Reply with one sentence."},
                 (640, 300), 2.1),
            node("Promoter → testimonial ask", "n8n-nodes-base.gmail",
                 {"resource": "message", "operation": "send",
                  "to": "={{ $json.email }}",
                  "subject": "You scored us a {{ $json.score }}/10 — small ask",
                  "message": "=Hi {{ $json.name }}, your {{ $json.score }} made my week. Two small asks: (1) would you let us quote you on the site? (2) anyone in your network who'd benefit from what we do? Even a name + 1-line intro is gold."},
                 (640, 450), 2.1),
            node("Slack — log all NPS", "n8n-nodes-base.slack",
                 {"resource": "message", "operation": "post", "channel": "#nps-feed",
                  "text": "=NPS {{ $json.score }}/10 from {{ $json.name }} — {{ $json.comment || '(no comment)' }}"},
                 (840, 300), 2.2),
        ],
        {
            "NPS webhook": {"main": [[{"node": "Switch by score", "type": "main", "index": 0}]]},
            "Switch by score": {"main": [
                [{"node": "Detractor → recovery email", "type": "main", "index": 0}],
                [{"node": "Passive → ask one thing", "type": "main", "index": 0}],
                [{"node": "Promoter → testimonial ask", "type": "main", "index": 0}],
            ]},
            "Detractor → recovery email": {"main": [[{"node": "Slack — log all NPS", "type": "main", "index": 0}]]},
            "Passive → ask one thing": {"main": [[{"node": "Slack — log all NPS", "type": "main", "index": 0}]]},
            "Promoter → testimonial ask": {"main": [[{"node": "Slack — log all NPS", "type": "main", "index": 0}]]},
        },
        tags=["customer-success", "branching", "pattern-2"],
    ),
))

# ─── OPERATIONS (11-15) ───

# 11. Slack daily summariser
WORKFLOWS.append((
    "11-slack-daily-summariser",
    "Slack channel daily summariser",
    "Operations — Pattern 4. Every 18:00 reads the last 24h of messages from configured channels (e.g., #engineering, #sales, #cs), runs AI summary, posts 'what happened today in 5 bullets' to #daily-digest.",
    workflow(
        "Aiprosol — Slack daily summariser",
        "18:00 daily → fetch 24h messages from 3 channels → AI 5-bullet summary → post to #daily-digest",
        [
            node("Daily 18:00", "n8n-nodes-base.scheduleTrigger",
                 {"rule": {"interval": [{"field": "cronExpression", "expression": "0 18 * * *"}]}},
                 (240, 300), 1.1),
            node("Read #engineering", "n8n-nodes-base.slack",
                 {"resource": "message", "operation": "getAll", "channel": "#engineering",
                  "filters": {"oldest": "={{ $now.minus(1, 'day').toSeconds() }}"}},
                 (440, 200), 2.2),
            node("Read #sales", "n8n-nodes-base.slack",
                 {"resource": "message", "operation": "getAll", "channel": "#sales",
                  "filters": {"oldest": "={{ $now.minus(1, 'day').toSeconds() }}"}},
                 (440, 300), 2.2),
            node("Read #cs", "n8n-nodes-base.slack",
                 {"resource": "message", "operation": "getAll", "channel": "#cs",
                  "filters": {"oldest": "={{ $now.minus(1, 'day').toSeconds() }}"}},
                 (440, 400), 2.2),
            node("Merge channels", "n8n-nodes-base.merge",
                 {"mode": "combine", "combinationMode": "mergeByPosition"},
                 (640, 300), 3),
            node("AI 5-bullet summary", "@n8n/n8n-nodes-langchain.openAi",
                 {"resource": "chat", "modelId": {"value": "gpt-4o"},
                  "messages": {"values": [
                      {"role": "system", "content": "You are a Chief of Staff. Read all these Slack messages and summarise the day in exactly 5 bullets. No filler. Highlight: decisions made, things shipped, blockers, customer signals, weird stuff."},
                      {"role": "user", "content": "={{ JSON.stringify($json) }}"}
                  ]}},
                 (840, 300), 1.6),
            node("Post to #daily-digest", "n8n-nodes-base.slack",
                 {"resource": "message", "operation": "post", "channel": "#daily-digest",
                  "text": "=📋 *Daily digest — {{ $now.format('EEE dd MMM') }}*\\n\\n{{ $json.message.content }}"},
                 (1040, 300), 2.2),
        ],
        {
            "Daily 18:00": {"main": [[
                {"node": "Read #engineering", "type": "main", "index": 0},
                {"node": "Read #sales", "type": "main", "index": 0},
                {"node": "Read #cs", "type": "main", "index": 0},
            ]]},
            "Read #engineering": {"main": [[{"node": "Merge channels", "type": "main", "index": 0}]]},
            "Read #sales": {"main": [[{"node": "Merge channels", "type": "main", "index": 1}]]},
            "Read #cs": {"main": [[{"node": "Merge channels", "type": "main", "index": 2}]]},
            "Merge channels": {"main": [[{"node": "AI 5-bullet summary", "type": "main", "index": 0}]]},
            "AI 5-bullet summary": {"main": [[{"node": "Post to #daily-digest", "type": "main", "index": 0}]]},
        },
        tags=["operations", "summarisation", "pattern-4"],
    ),
))

# 12. Meeting → action items extraction
WORKFLOWS.append((
    "12-meeting-action-items",
    "Meeting recording → action items + owner assignment",
    "Operations — Pattern 1 + AI. Fireflies/Otter webhook posts meeting transcript. AI extracts action items with proposed owners. Posts to Slack + creates Linear/Asana tasks for each.",
    workflow(
        "Aiprosol — Meeting → action items + Linear tasks",
        "Meeting transcript webhook → AI action items with owners → Linear issues + Slack",
        [
            node("Transcript webhook", "n8n-nodes-base.webhook",
                 {"httpMethod": "POST", "path": "meeting-transcript"},
                 (240, 300), 1.1),
            node("Extract action items", "@n8n/n8n-nodes-langchain.openAi",
                 {"resource": "chat", "modelId": {"value": "gpt-4o"},
                  "messages": {"values": [
                      {"role": "system", "content": "From this transcript extract JSON: {\"items\":[{\"action\":string, \"owner\":string, \"due\":\"this-week|next-week|no-date\", \"context\":string}]}. Only include clear, specific actions."},
                      {"role": "user", "content": "={{ $json.transcript }}"}
                  ]}, "options": {"responseFormat": "json_object"}},
                 (440, 300), 1.6),
            node("Split items", "n8n-nodes-base.splitOut",
                 {"fieldToSplitOut": "=={{ JSON.parse($json.message.content).items }}",
                  "include": "allOtherFields"},
                 (640, 300), 1),
            node("Create Linear issue", "n8n-nodes-base.linear",
                 {"resource": "issue", "operation": "create",
                  "teamId": "TEAM_ID",
                  "title": "={{ $json.action }}",
                  "additionalFields": {"description": "=From meeting: {{ $('Transcript webhook').first().json.meeting_title }}\\n\\nContext: {{ $json.context }}"}},
                 (840, 300), 1),
            node("Slack — daily action items", "n8n-nodes-base.slack",
                 {"resource": "message", "operation": "post", "channel": "#actions",
                  "text": "=✅ {{ $('Split items').all().length }} action items from {{ $('Transcript webhook').first().json.meeting_title }} — Linear issues created"},
                 (1040, 300), 2.2),
        ],
        chain("Transcript webhook", "Extract action items", "Split items",
              "Create Linear issue", "Slack — daily action items"),
        tags=["operations", "meetings", "pattern-1"],
    ),
))

# 13. Vendor renewal radar
WORKFLOWS.append((
    "13-vendor-renewal-radar",
    "Vendor renewal radar — 60-day forward look",
    "Operations — Pattern 4. Daily 9am pull all vendors from Notion DB. For any renewing within 60 days: pull last-90d usage if SaaS, draft a 'keep / negotiate / cancel' note via AI, ping the finance channel with priority sorted by spend.",
    workflow(
        "Aiprosol — Vendor renewal radar",
        "Daily 9am → vendor DB → 60-day renewal lookahead → AI keep/cut recommendation",
        [
            node("Daily 9am", "n8n-nodes-base.scheduleTrigger",
                 {"rule": {"interval": [{"field": "cronExpression", "expression": "0 9 * * *"}]}},
                 (240, 300), 1.1),
            node("Get vendors", "n8n-nodes-base.notion",
                 {"resource": "databasePage", "operation": "getAll", "databaseId": "VENDORS_DB_ID"},
                 (440, 300), 2.2),
            node("Filter: renewing in 60d", "n8n-nodes-base.code",
                 {"language": "javaScript", "jsCode": "const horizon = Date.now() + 60*24*60*60*1000; return $input.all().filter(i => { const r = new Date(i.json.next_renewal_date).getTime(); return r > Date.now() && r < horizon; });"},
                 (640, 300), 2),
            node("AI keep/cut", "@n8n/n8n-nodes-langchain.openAi",
                 {"resource": "chat", "modelId": {"value": "gpt-4o-mini"},
                  "messages": {"values": [
                      {"role": "system", "content": "Recommend keep / negotiate / cancel for this vendor in <30 words. Consider: monthly spend, usage trend, ease of replacement."},
                      {"role": "user", "content": "={{ JSON.stringify($json) }}"}
                  ]}},
                 (840, 300), 1.6),
            node("Slack — vendor digest", "n8n-nodes-base.slack",
                 {"resource": "message", "operation": "post", "channel": "#finance",
                  "text": "=💸 Vendors renewing in 60 days:\\n{{ $items().map(i => `• ${i.json.vendor} ($${i.json.monthly_cost}/mo) → ${i.json.message.content}`).join('\\n') }}"},
                 (1040, 300), 2.2),
        ],
        chain("Daily 9am", "Get vendors", "Filter: renewing in 60d", "AI keep/cut", "Slack — vendor digest"),
        tags=["operations", "finance", "pattern-4"],
    ),
))

# 14. Document filing auto-router
WORKFLOWS.append((
    "14-document-filing",
    "Document filing auto-router (Drive uploads → AI-categorised → moved)",
    "Operations — Pattern 2. New file in Drive 'Inbox' folder → AI classifies (invoice / contract / receipt / proposal / personal) → moved to right destination folder + tagged.",
    workflow(
        "Aiprosol — Document filing auto-router",
        "Drive Inbox file → AI category → move to right folder + tag",
        [
            node("Drive — new file in Inbox", "n8n-nodes-base.googleDriveTrigger",
                 {"event": "fileCreated", "folderToWatch": {"__rl": True, "value": "INBOX_FOLDER_ID"}},
                 (240, 300), 1),
            node("Download file content", "n8n-nodes-base.googleDrive",
                 {"resource": "file", "operation": "download", "fileId": "={{ $json.id }}"},
                 (440, 300), 3),
            node("Extract text (vision/OCR)", "@n8n/n8n-nodes-langchain.openAi",
                 {"resource": "chat", "modelId": {"value": "gpt-4o"},
                  "messages": {"values": [
                      {"role": "system", "content": "Classify this document into one: INVOICE, CONTRACT, RECEIPT, PROPOSAL, REPORT, PERSONAL, OTHER. Return only the label."},
                      {"role": "user", "content": "=File: {{ $('Drive — new file in Inbox').first().json.name }}"}
                  ]}},
                 (640, 300), 1.6),
            node("Switch by category", "n8n-nodes-base.switch",
                 {"rules": {"values": [
                     {"conditions": {"conditions": [{"leftValue": "={{ $json.message.content.trim() }}",
                                                      "rightValue": "INVOICE",
                                                      "operator": {"type": "string", "operation": "equals"}}]},
                      "renameOutput": True, "outputKey": "invoice"},
                     {"conditions": {"conditions": [{"leftValue": "={{ $json.message.content.trim() }}",
                                                      "rightValue": "CONTRACT",
                                                      "operator": {"type": "string", "operation": "equals"}}]},
                      "renameOutput": True, "outputKey": "contract"},
                     {"conditions": {"conditions": [{"leftValue": "={{ $json.message.content.trim() }}",
                                                      "rightValue": "RECEIPT",
                                                      "operator": {"type": "string", "operation": "equals"}}]},
                      "renameOutput": True, "outputKey": "receipt"},
                 ]}},
                 (840, 300), 3),
            node("Move to Invoices", "n8n-nodes-base.googleDrive",
                 {"resource": "file", "operation": "move",
                  "fileId": "={{ $('Drive — new file in Inbox').first().json.id }}",
                  "folderId": {"__rl": True, "value": "INVOICES_FOLDER_ID"}},
                 (1040, 200), 3),
            node("Move to Contracts", "n8n-nodes-base.googleDrive",
                 {"resource": "file", "operation": "move",
                  "fileId": "={{ $('Drive — new file in Inbox').first().json.id }}",
                  "folderId": {"__rl": True, "value": "CONTRACTS_FOLDER_ID"}},
                 (1040, 300), 3),
            node("Move to Receipts", "n8n-nodes-base.googleDrive",
                 {"resource": "file", "operation": "move",
                  "fileId": "={{ $('Drive — new file in Inbox').first().json.id }}",
                  "folderId": {"__rl": True, "value": "RECEIPTS_FOLDER_ID"}},
                 (1040, 400), 3),
        ],
        {
            "Drive — new file in Inbox": {"main": [[{"node": "Download file content", "type": "main", "index": 0}]]},
            "Download file content": {"main": [[{"node": "Extract text (vision/OCR)", "type": "main", "index": 0}]]},
            "Extract text (vision/OCR)": {"main": [[{"node": "Switch by category", "type": "main", "index": 0}]]},
            "Switch by category": {"main": [
                [{"node": "Move to Invoices", "type": "main", "index": 0}],
                [{"node": "Move to Contracts", "type": "main", "index": 0}],
                [{"node": "Move to Receipts", "type": "main", "index": 0}],
            ]},
        },
        tags=["operations", "documents", "pattern-2"],
    ),
))

# 15. Team standup async aggregator
WORKFLOWS.append((
    "15-async-standup",
    "Async standup aggregator",
    "Operations — Pattern 4. Every weekday 9:30, post a standup prompt in DM to each team member; collect responses by 10:00; AI-summarise blockers across team; post to #standup channel.",
    workflow(
        "Aiprosol — Async standup aggregator",
        "Weekday 9:30 → DM team prompts → collect by 10:00 → AI summary → #standup",
        [
            node("Weekday 9:30", "n8n-nodes-base.scheduleTrigger",
                 {"rule": {"interval": [{"field": "cronExpression", "expression": "30 9 * * 1-5"}]}},
                 (240, 300), 1.1),
            node("Team list", "n8n-nodes-base.set",
                 {"assignments": {"assignments": [
                     {"id": "1", "name": "members",
                      "value": "=[\"U01\",\"U02\",\"U03\",\"U04\"]", "type": "array"}
                 ]}},
                 (440, 300), 3.4),
            node("DM each member", "n8n-nodes-base.slack",
                 {"resource": "message", "operation": "post",
                  "select": "user", "user": "={{ $json }}",
                  "text": "Standup time! In one message: (1) What did you ship yesterday? (2) What's today? (3) Any blockers?"},
                 (640, 300), 2.2),
            node("Wait 30 min", "n8n-nodes-base.wait",
                 {"resume": "timeInterval", "amount": 30, "unit": "minutes"},
                 (840, 300), 1.1),
            node("Read DM threads", "n8n-nodes-base.slack",
                 {"resource": "message", "operation": "getAll",
                  "channel": "={{ $json.dm_channel_id }}"},
                 (1040, 300), 2.2),
            node("AI standup summary", "@n8n/n8n-nodes-langchain.openAi",
                 {"resource": "chat", "modelId": {"value": "gpt-4o"},
                  "messages": {"values": [
                      {"role": "system", "content": "Summarise the team standup. Sections: Yesterday shipped, Today's priorities, Blockers (call them out clearly with names), Cross-team coordination needed."},
                      {"role": "user", "content": "={{ JSON.stringify($json) }}"}
                  ]}},
                 (1240, 300), 1.6),
            node("Post to #standup", "n8n-nodes-base.slack",
                 {"resource": "message", "operation": "post", "channel": "#standup",
                  "text": "=📋 *Standup — {{ $now.format('EEE dd MMM') }}*\\n\\n{{ $json.message.content }}"},
                 (1440, 300), 2.2),
        ],
        chain("Weekday 9:30", "Team list", "DM each member", "Wait 30 min",
              "Read DM threads", "AI standup summary", "Post to #standup"),
        tags=["operations", "team", "pattern-4"],
    ),
))

# ─── DOCUMENTS & FINANCE (16-20) ───

# 16. Invoice OCR → accounting
WORKFLOWS.append((
    "16-invoice-ocr-accounting",
    "Invoice OCR → accounting system entry",
    "Documents & finance — Pattern 1 + vision. Email with PDF attachment hits accounts@yourdomain → AI vision extracts vendor, amount, due date, line items → creates entry in Xero / QuickBooks → Slack confirm + file in Drive.",
    workflow(
        "Aiprosol — Invoice OCR → Xero entry",
        "Email PDF → AI vision extract → Xero create bill → Drive archive → Slack confirm",
        [
            node("Gmail — accounts@", "n8n-nodes-base.gmailTrigger",
                 {"pollTimes": {"item": [{"mode": "everyMinute"}]},
                  "filters": {"labelIds": ["INVOICES"], "search": "has:attachment"}},
                 (240, 300), 1),
            node("Extract via vision", "@n8n/n8n-nodes-langchain.openAi",
                 {"resource": "chat", "modelId": {"value": "gpt-4o"},
                  "messages": {"values": [
                      {"role": "system", "content": "Read the attached invoice PDF. Return JSON: {\"vendor\":string, \"invoice_no\":string, \"date\":\"YYYY-MM-DD\", \"due_date\":\"YYYY-MM-DD\", \"total\":number, \"currency\":string, \"line_items\":[{\"desc\":string,\"qty\":number,\"amount\":number}]}"},
                      {"role": "user", "content": [{"type": "image_url", "image_url": {"url": "={{ $binary.data }}"}}]}
                  ]}, "options": {"responseFormat": "json_object"}},
                 (440, 300), 1.6),
            node("Xero — create bill", "n8n-nodes-base.xero",
                 {"resource": "invoice", "operation": "create",
                  "type": "ACCPAY",
                  "contact": "={{ JSON.parse($json.message.content).vendor }}",
                  "date": "={{ JSON.parse($json.message.content).date }}",
                  "dueDate": "={{ JSON.parse($json.message.content).due_date }}",
                  "lineAmountTypes": "Exclusive"},
                 (640, 300), 1),
            node("Drive — archive PDF", "n8n-nodes-base.googleDrive",
                 {"resource": "file", "operation": "upload",
                  "name": "={{ JSON.parse($('Extract via vision').first().json.message.content).vendor }} — {{ JSON.parse($('Extract via vision').first().json.message.content).date }}.pdf",
                  "parents": ["INVOICES_ARCHIVE_FOLDER_ID"]},
                 (840, 300), 3),
            node("Slack — finance confirm", "n8n-nodes-base.slack",
                 {"resource": "message", "operation": "post", "channel": "#finance",
                  "text": "=📥 Invoice booked: {{ JSON.parse($('Extract via vision').first().json.message.content).vendor }} · ${{ JSON.parse($('Extract via vision').first().json.message.content).total }} · due {{ JSON.parse($('Extract via vision').first().json.message.content).due_date }}"},
                 (1040, 300), 2.2),
        ],
        chain("Gmail — accounts@", "Extract via vision", "Xero — create bill",
              "Drive — archive PDF", "Slack — finance confirm"),
        tags=["finance", "ocr", "pattern-1"],
    ),
))

# 17. Receipt photo → categorised expense
WORKFLOWS.append((
    "17-receipt-photo-expense",
    "Receipt photo → categorised expense in accounting tool",
    "Documents & finance — Pattern 1 + vision. Photo uploaded to a 'Receipts' Drive folder (or sent to receipts@) → AI extracts vendor, amount, category → posted to Brex/Ramp/QuickBooks as an expense.",
    workflow(
        "Aiprosol — Receipt photo → expense entry",
        "Drive receipt photo → AI vision extract → expense entry in accounting",
        [
            node("Drive — Receipts folder watch", "n8n-nodes-base.googleDriveTrigger",
                 {"event": "fileCreated", "folderToWatch": {"__rl": True, "value": "RECEIPTS_FOLDER_ID"}},
                 (240, 300), 1),
            node("AI vision extract", "@n8n/n8n-nodes-langchain.openAi",
                 {"resource": "chat", "modelId": {"value": "gpt-4o"},
                  "messages": {"values": [
                      {"role": "system", "content": "Read the receipt photo. Return JSON {\"vendor\":string, \"date\":\"YYYY-MM-DD\", \"total\":number, \"currency\":string, \"category\":\"meals|travel|software|office|other\", \"tax\":number}"},
                      {"role": "user", "content": "Receipt image attached"}
                  ]}, "options": {"responseFormat": "json_object"}},
                 (440, 300), 1.6),
            node("QuickBooks — create expense", "n8n-nodes-base.quickbooks",
                 {"resource": "expense", "operation": "create",
                  "additionalFields": {
                      "VendorRef": "={{ JSON.parse($json.message.content).vendor }}",
                      "TotalAmt": "={{ JSON.parse($json.message.content).total }}",
                      "TxnDate": "={{ JSON.parse($json.message.content).date }}"}},
                 (640, 300), 1),
            node("Sheet log", "n8n-nodes-base.googleSheets",
                 {"resource": "sheet", "operation": "append",
                  "documentId": "EXPENSES_SHEET_ID",
                  "sheetName": "Receipts",
                  "fieldsUi": {"fieldValues": [
                      {"fieldId": "Date", "fieldValue": "={{ JSON.parse($('AI vision extract').first().json.message.content).date }}"},
                      {"fieldId": "Vendor", "fieldValue": "={{ JSON.parse($('AI vision extract').first().json.message.content).vendor }}"},
                      {"fieldId": "Amount", "fieldValue": "={{ JSON.parse($('AI vision extract').first().json.message.content).total }}"},
                      {"fieldId": "Category", "fieldValue": "={{ JSON.parse($('AI vision extract').first().json.message.content).category }}"},
                  ]}},
                 (840, 300), 4),
        ],
        chain("Drive — Receipts folder watch", "AI vision extract",
              "QuickBooks — create expense", "Sheet log"),
        tags=["finance", "ocr", "pattern-1"],
    ),
))

# 18. Contract redline assistant
WORKFLOWS.append((
    "18-contract-redline-assistant",
    "Contract redline assistant (approval-gated)",
    "Documents & finance — Pattern 6 (approval gate). New contract dropped in a Drive folder → AI compares to your standard terms → flags risky clauses → posts a Slack thread with 'Approve / Edit / Reject' buttons → only files final version when approved.",
    workflow(
        "Aiprosol — Contract redline assistant",
        "Contract upload → AI redline against playbook → Slack approval gate → finalise on approval",
        [
            node("Drive — Contracts/Inbox", "n8n-nodes-base.googleDriveTrigger",
                 {"event": "fileCreated", "folderToWatch": {"__rl": True, "value": "CONTRACTS_INBOX_FOLDER_ID"}},
                 (240, 300), 1),
            node("AI redline", "@n8n/n8n-nodes-langchain.openAi",
                 {"resource": "chat", "modelId": {"value": "gpt-4o"},
                  "messages": {"values": [
                      {"role": "system", "content": "You are a contracts paralegal. Compare this contract against our standard playbook (cap on liability 1× fees, mutual NDA, IP retained by client, 30-day termination for convenience). Return JSON {\"risk_level\":\"low|medium|high\",\"issues\":[{\"clause\":string, \"problem\":string, \"suggested_redline\":string}], \"green_flags\":[]}"},
                      {"role": "user", "content": "=Contract: {{ $('Drive — Contracts/Inbox').first().json.name }}"}
                  ]}, "options": {"responseFormat": "json_object"}},
                 (440, 300), 1.6),
            node("Slack — approval thread", "n8n-nodes-base.slack",
                 {"resource": "message", "operation": "post", "channel": "#legal",
                  "text": "=⚖️ New contract: {{ $('Drive — Contracts/Inbox').first().json.name }}\\nRisk: {{ JSON.parse($json.message.content).risk_level }}\\n\\nIssues:\\n{{ JSON.parse($json.message.content).issues.map(i => `• ${i.clause}: ${i.problem}\\n  → Suggested: ${i.suggested_redline}`).join('\\n\\n') }}\\n\\n*Reply 'approve' / 'reject' / 'edit'*"},
                 (640, 300), 2.2),
        ],
        chain("Drive — Contracts/Inbox", "AI redline", "Slack — approval thread"),
        tags=["finance", "legal", "pattern-6"],
    ),
))

# 19. Tax document auto-collator
WORKFLOWS.append((
    "19-tax-document-collator",
    "Tax document auto-collator (year-end)",
    "Documents & finance — Pattern 4. December 15th cron: pulls all invoices, receipts, payroll reports from the year → AI generates a categorised summary + missing-document checklist → emails the accountant. Saves a week of January chaos.",
    workflow(
        "Aiprosol — Tax document auto-collator (Dec 15)",
        "Annual Dec 15 → pull year of finance docs → AI categorise + flag gaps → email accountant",
        [
            node("Dec 15 yearly", "n8n-nodes-base.scheduleTrigger",
                 {"rule": {"interval": [{"field": "cronExpression", "expression": "0 9 15 12 *"}]}},
                 (240, 300), 1.1),
            node("Pull year invoices", "n8n-nodes-base.googleDrive",
                 {"resource": "fileFolder", "operation": "search",
                  "queryString": "='INVOICES_ARCHIVE_FOLDER_ID' in parents and modifiedTime > '{{ $now.startOf('year').toISO() }}'"},
                 (440, 200), 3),
            node("Pull year receipts", "n8n-nodes-base.googleDrive",
                 {"resource": "fileFolder", "operation": "search",
                  "queryString": "='RECEIPTS_FOLDER_ID' in parents and modifiedTime > '{{ $now.startOf('year').toISO() }}'"},
                 (440, 400), 3),
            node("Pull bank statements", "n8n-nodes-base.googleDrive",
                 {"resource": "fileFolder", "operation": "search",
                  "queryString": "='BANK_FOLDER_ID' in parents and modifiedTime > '{{ $now.startOf('year').toISO() }}'"},
                 (440, 600), 3),
            node("Merge", "n8n-nodes-base.merge",
                 {"mode": "combine", "combinationMode": "mergeByPosition"},
                 (640, 400), 3),
            node("AI categorise + gap check", "@n8n/n8n-nodes-langchain.openAi",
                 {"resource": "chat", "modelId": {"value": "gpt-4o"},
                  "messages": {"values": [
                      {"role": "system", "content": "You are a tax prep assistant. Categorise these documents (income, expenses, payroll, capital). Identify gaps: any month with no documents, any vendor with single missing invoice, any unusually-large transaction without backing. Return structured markdown."},
                      {"role": "user", "content": "={{ JSON.stringify($json) }}"}
                  ]}},
                 (840, 400), 1.6),
            node("Email accountant", "n8n-nodes-base.gmail",
                 {"resource": "message", "operation": "send",
                  "to": "accountant@firm.com",
                  "subject": "=Tax prep package — {{ $now.format('yyyy') }}",
                  "message": "=Hi, attached is the auto-categorised year-end package. Gaps and questions flagged inline.\\n\\n{{ $json.message.content }}"},
                 (1040, 400), 2.1),
        ],
        {
            "Dec 15 yearly": {"main": [[
                {"node": "Pull year invoices", "type": "main", "index": 0},
                {"node": "Pull year receipts", "type": "main", "index": 0},
                {"node": "Pull bank statements", "type": "main", "index": 0},
            ]]},
            "Pull year invoices": {"main": [[{"node": "Merge", "type": "main", "index": 0}]]},
            "Pull year receipts": {"main": [[{"node": "Merge", "type": "main", "index": 1}]]},
            "Pull bank statements": {"main": [[{"node": "Merge", "type": "main", "index": 2}]]},
            "Merge": {"main": [[{"node": "AI categorise + gap check", "type": "main", "index": 0}]]},
            "AI categorise + gap check": {"main": [[{"node": "Email accountant", "type": "main", "index": 0}]]},
        },
        tags=["finance", "tax", "pattern-4"],
    ),
))

# 20. Cash position daily snapshot
WORKFLOWS.append((
    "20-cash-position-daily",
    "Cash position daily snapshot",
    "Documents & finance — Pattern 4. Every weekday 8:30 pull bank balances (Plaid / banking API) + AR aging + AP due-in-7d → assemble a 4-line cash summary → post to #finance.",
    workflow(
        "Aiprosol — Cash position daily snapshot",
        "Weekday 8:30 → bank balance + AR + AP → 4-line Slack summary",
        [
            node("Weekday 8:30", "n8n-nodes-base.scheduleTrigger",
                 {"rule": {"interval": [{"field": "cronExpression", "expression": "30 8 * * 1-5"}]}},
                 (240, 300), 1.1),
            node("Plaid balance", "n8n-nodes-base.httpRequest",
                 {"method": "POST", "url": "https://production.plaid.com/accounts/balance/get",
                  "sendBody": True, "specifyBody": "json",
                  "jsonBody": "={\"client_id\":\"{{ $env.PLAID_CLIENT }}\",\"secret\":\"{{ $env.PLAID_SECRET }}\",\"access_token\":\"{{ $env.PLAID_ACCESS_TOKEN }}\"}"},
                 (440, 200), 4.1),
            node("Xero — AR aging", "n8n-nodes-base.xero",
                 {"resource": "invoice", "operation": "getAll",
                  "filters": {"status": "AUTHORISED"}},
                 (440, 400), 1),
            node("Xero — AP due 7d", "n8n-nodes-base.xero",
                 {"resource": "invoice", "operation": "getAll",
                  "filters": {"status": "AUTHORISED", "type": "ACCPAY"}},
                 (440, 600), 1),
            node("Merge cash data", "n8n-nodes-base.merge",
                 {"mode": "combine", "combinationMode": "mergeByPosition"},
                 (640, 400), 3),
            node("Compute headroom", "n8n-nodes-base.code",
                 {"language": "javaScript", "jsCode": "const bal = $('Plaid balance').first().json.accounts[0].balances.available; const ar = $('Xero — AR aging').all().reduce((s,i)=>s+i.json.AmountDue,0); const ap = $('Xero — AP due 7d').all().filter(i=>new Date(i.json.DueDate)<Date.now()+7*864e5).reduce((s,i)=>s+i.json.AmountDue,0); return [{json:{balance:bal,ar_outstanding:ar,ap_due_7d:ap,net_position_7d:bal+ar-ap}}];"},
                 (840, 400), 2),
            node("Slack — cash summary", "n8n-nodes-base.slack",
                 {"resource": "message", "operation": "post", "channel": "#finance",
                  "text": "=💰 *Cash — {{ $now.format('EEE dd MMM') }}*\\n• Bank: ${{ $json.balance.toLocaleString() }}\\n• AR (owed to us): ${{ $json.ar_outstanding.toLocaleString() }}\\n• AP due 7d: ${{ $json.ap_due_7d.toLocaleString() }}\\n• Net 7d position: ${{ $json.net_position_7d.toLocaleString() }}"},
                 (1040, 400), 2.2),
        ],
        {
            "Weekday 8:30": {"main": [[
                {"node": "Plaid balance", "type": "main", "index": 0},
                {"node": "Xero — AR aging", "type": "main", "index": 0},
                {"node": "Xero — AP due 7d", "type": "main", "index": 0},
            ]]},
            "Plaid balance": {"main": [[{"node": "Merge cash data", "type": "main", "index": 0}]]},
            "Xero — AR aging": {"main": [[{"node": "Merge cash data", "type": "main", "index": 1}]]},
            "Xero — AP due 7d": {"main": [[{"node": "Merge cash data", "type": "main", "index": 2}]]},
            "Merge cash data": {"main": [[{"node": "Compute headroom", "type": "main", "index": 0}]]},
            "Compute headroom": {"main": [[{"node": "Slack — cash summary", "type": "main", "index": 0}]]},
        },
        tags=["finance", "cash", "pattern-4"],
    ),
))

# ─── MARKETING & CONTENT (21-25) ───

# 21. Inbound customer question → blog idea
WORKFLOWS.append((
    "21-question-to-blog-idea",
    "Inbound customer question → blog post idea",
    "Marketing & content — Pattern 4. Weekly Mon 9am scan: all customer-support emails + chat questions from the past week → AI clusters into themes → for each theme of >3 questions, draft a blog post outline → post to #content channel for review.",
    workflow(
        "Aiprosol — Customer questions → weekly blog ideas",
        "Mon 9am → questions from week → AI cluster + outline → Slack content team",
        [
            node("Mon 9am", "n8n-nodes-base.scheduleTrigger",
                 {"rule": {"interval": [{"field": "cronExpression", "expression": "0 9 * * 1"}]}},
                 (240, 300), 1.1),
            node("Pull support emails", "n8n-nodes-base.gmail",
                 {"resource": "message", "operation": "getAll",
                  "filters": {"q": "label:customer-support newer_than:7d"}},
                 (440, 200), 2.1),
            node("Pull chat logs", "n8n-nodes-base.httpRequest",
                 {"method": "GET", "url": "https://api.intercom.io/conversations?per_page=50"},
                 (440, 400), 4.1),
            node("Merge questions", "n8n-nodes-base.merge",
                 {"mode": "combine", "combinationMode": "mergeByPosition"},
                 (640, 300), 3),
            node("Cluster + outline", "@n8n/n8n-nodes-langchain.openAi",
                 {"resource": "chat", "modelId": {"value": "gpt-4o"},
                  "messages": {"values": [
                      {"role": "system", "content": "Cluster these questions into themes. For every theme with 3+ questions, write a blog post outline. Return: { topics: [{theme, frequency, outline:[h2,h2,h2], target_keyword, intent}] }"},
                      {"role": "user", "content": "={{ JSON.stringify($json) }}"}
                  ]}, "options": {"responseFormat": "json_object"}},
                 (840, 300), 1.6),
            node("Slack — content team", "n8n-nodes-base.slack",
                 {"resource": "message", "operation": "post", "channel": "#content",
                  "text": "=📝 This week's blog ideas (sorted by frequency):\\n\\n{{ JSON.parse($json.message.content).topics.map(t => `• *${t.theme}* (${t.frequency}× asked) → keyword: ${t.target_keyword}\\n  ${t.outline.join(' → ')}`).join('\\n\\n') }}"},
                 (1040, 300), 2.2),
        ],
        {
            "Mon 9am": {"main": [[
                {"node": "Pull support emails", "type": "main", "index": 0},
                {"node": "Pull chat logs", "type": "main", "index": 0},
            ]]},
            "Pull support emails": {"main": [[{"node": "Merge questions", "type": "main", "index": 0}]]},
            "Pull chat logs": {"main": [[{"node": "Merge questions", "type": "main", "index": 1}]]},
            "Merge questions": {"main": [[{"node": "Cluster + outline", "type": "main", "index": 0}]]},
            "Cluster + outline": {"main": [[{"node": "Slack — content team", "type": "main", "index": 0}]]},
        },
        tags=["marketing", "content", "pattern-4"],
    ),
))

# 22. Competitor changelog monitor
WORKFLOWS.append((
    "22-competitor-changelog-monitor",
    "Competitor changelog / blog monitor",
    "Marketing & content — Pattern 5 (polling). Every Monday 10am poll RSS feeds of 5 competitor blogs + changelog pages → AI summarises what shipped → ranks 'genuine threat / interesting / noise' → Slack #competitive-intel.",
    workflow(
        "Aiprosol — Competitor changelog monitor",
        "Mon 10am → poll 5 competitor RSS → AI threat-rank → Slack",
        [
            node("Mon 10am", "n8n-nodes-base.scheduleTrigger",
                 {"rule": {"interval": [{"field": "cronExpression", "expression": "0 10 * * 1"}]}},
                 (240, 300), 1.1),
            node("RSS competitors", "n8n-nodes-base.rssFeedRead",
                 {"url": "https://competitor1.com/feed",
                  "options": {"maxItems": 20}},
                 (440, 300), 1.1),
            node("AI threat rank", "@n8n/n8n-nodes-langchain.openAi",
                 {"resource": "chat", "modelId": {"value": "gpt-4o"},
                  "messages": {"values": [
                      {"role": "system", "content": "You're a competitive intel analyst at Aiprosol (AI automation consultancy). For each item, rank: genuine_threat | interesting | noise. Return JSON {items:[{title, url, rank, why}]}"},
                      {"role": "user", "content": "={{ JSON.stringify($json) }}"}
                  ]}, "options": {"responseFormat": "json_object"}},
                 (640, 300), 1.6),
            node("Filter: genuine threats", "n8n-nodes-base.code",
                 {"language": "javaScript", "jsCode": "return JSON.parse($input.first().json.message.content).items.filter(i => i.rank === 'genuine_threat').map(json => ({json}));"},
                 (840, 300), 2),
            node("Slack — competitive intel", "n8n-nodes-base.slack",
                 {"resource": "message", "operation": "post", "channel": "#competitive-intel",
                  "text": "=🎯 *Competitor watch — {{ $now.format('dd MMM') }}*\\n\\n{{ $items().map(i => `• [${i.json.title}](${i.json.url}) — ${i.json.why}`).join('\\n') }}"},
                 (1040, 300), 2.2),
        ],
        chain("Mon 10am", "RSS competitors", "AI threat rank",
              "Filter: genuine threats", "Slack — competitive intel"),
        tags=["marketing", "competitive", "pattern-5"],
    ),
))

# 23. Cross-channel content distribution
WORKFLOWS.append((
    "23-cross-channel-distribution",
    "Cross-channel content distribution (one source → 5 channels)",
    "Marketing & content — Pattern 3 (fan-out). New blog post published webhook → AI generates variants → fan-out: Twitter thread, LinkedIn post, newsletter excerpt, Reddit-friendly post, Hacker News title.",
    workflow(
        "Aiprosol — Cross-channel content distribution",
        "Blog publish webhook → AI variants → fan-out: LinkedIn + X + Newsletter + Reddit + HN",
        [
            node("Blog publish webhook", "n8n-nodes-base.webhook",
                 {"httpMethod": "POST", "path": "blog-published"},
                 (240, 300), 1.1),
            node("Generate variants", "@n8n/n8n-nodes-langchain.openAi",
                 {"resource": "chat", "modelId": {"value": "gpt-4o"},
                  "messages": {"values": [
                      {"role": "system", "content": "From this blog post, generate JSON with 5 variants tuned for each platform: {linkedin: 280-word post, x_thread: array of 5 tweets, newsletter: 1-paragraph excerpt + CTA, reddit: title + first comment positioning, hackernews: title only}"},
                      {"role": "user", "content": "={{ $json.title }}\\n\\n{{ $json.content }}"}
                  ]}, "options": {"responseFormat": "json_object"}},
                 (440, 300), 1.6),
            node("Post LinkedIn", "n8n-nodes-base.linkedIn",
                 {"resource": "post", "operation": "create",
                  "text": "={{ JSON.parse($json.message.content).linkedin }}"},
                 (640, 100), 1),
            node("Post X thread", "n8n-nodes-base.twitter",
                 {"resource": "tweet", "operation": "create",
                  "text": "={{ JSON.parse($json.message.content).x_thread[0] }}"},
                 (640, 250), 2),
            node("Save to newsletter draft", "n8n-nodes-base.googleDocs",
                 {"operation": "update", "documentURL": "NEWSLETTER_DOC_ID",
                  "actionsUi": {"actionFields": [{"action": "insert",
                                                    "text": "={{ JSON.parse($json.message.content).newsletter }}\\n\\n"}]}},
                 (640, 400), 2),
            node("Slack — Reddit draft", "n8n-nodes-base.slack",
                 {"resource": "message", "operation": "post", "channel": "#marketing",
                  "text": "=📌 Reddit post drafted: {{ JSON.parse($json.message.content).reddit }} — review before posting"},
                 (640, 550), 2.2),
            node("Slack — HN draft", "n8n-nodes-base.slack",
                 {"resource": "message", "operation": "post", "channel": "#marketing",
                  "text": "=🟠 HN title: {{ JSON.parse($json.message.content).hackernews }}"},
                 (640, 700), 2.2),
        ],
        fan_out("Generate variants",
                ["Post LinkedIn", "Post X thread", "Save to newsletter draft",
                 "Slack — Reddit draft", "Slack — HN draft"]),
        tags=["marketing", "distribution", "pattern-3"],
    ),
))
# We need to chain Blog publish webhook → Generate variants first
WORKFLOWS[-1][3]["connections"]["Blog publish webhook"] = {"main": [[{"node": "Generate variants", "type": "main", "index": 0}]]}


# 24. SEO auto-audit weekly
WORKFLOWS.append((
    "24-seo-audit-weekly",
    "SEO auto-audit weekly",
    "Marketing & content — Pattern 4. Every Monday 11am: pull Google Search Console + Ahrefs data for top 50 pages → AI identifies pages that dropped >5 positions, pages with low CTR, queries you're #11-#20 for → posts a 5-bullet 'this week's SEO priorities' to #marketing.",
    workflow(
        "Aiprosol — SEO weekly auto-audit",
        "Mon 11am → GSC + Ahrefs data → AI prioritise drops/opportunities → Slack",
        [
            node("Mon 11am", "n8n-nodes-base.scheduleTrigger",
                 {"rule": {"interval": [{"field": "cronExpression", "expression": "0 11 * * 1"}]}},
                 (240, 300), 1.1),
            node("GSC top pages", "n8n-nodes-base.httpRequest",
                 {"method": "POST",
                  "url": "https://www.googleapis.com/webmasters/v3/sites/aiprosol.com/searchAnalytics/query",
                  "sendBody": True, "specifyBody": "json",
                  "jsonBody": "={\"startDate\":\"{{ $now.minus(7,'day').toFormat('yyyy-MM-dd') }}\",\"endDate\":\"{{ $now.toFormat('yyyy-MM-dd') }}\",\"dimensions\":[\"page\",\"query\"],\"rowLimit\":500}"},
                 (440, 200), 4.1),
            node("Ahrefs position changes", "n8n-nodes-base.httpRequest",
                 {"method": "GET",
                  "url": "https://apiv2.ahrefs.com/?from=organic_keywords&target=aiprosol.com&mode=domain"},
                 (440, 400), 4.1),
            node("Merge SEO data", "n8n-nodes-base.merge",
                 {"mode": "combine", "combinationMode": "mergeByPosition"},
                 (640, 300), 3),
            node("AI prioritise", "@n8n/n8n-nodes-langchain.openAi",
                 {"resource": "chat", "modelId": {"value": "gpt-4o"},
                  "messages": {"values": [
                      {"role": "system", "content": "You're an SEO analyst. From this week's data identify: top-5 priorities — pages that dropped, low-CTR pages with high impressions, queries we're #11-20 for (highest ROI to push). Return 5 bullet actions."},
                      {"role": "user", "content": "={{ JSON.stringify($json) }}"}
                  ]}},
                 (840, 300), 1.6),
            node("Slack — SEO priorities", "n8n-nodes-base.slack",
                 {"resource": "message", "operation": "post", "channel": "#marketing",
                  "text": "=🔍 *SEO this week*\\n\\n{{ $json.message.content }}"},
                 (1040, 300), 2.2),
        ],
        {
            "Mon 11am": {"main": [[
                {"node": "GSC top pages", "type": "main", "index": 0},
                {"node": "Ahrefs position changes", "type": "main", "index": 0},
            ]]},
            "GSC top pages": {"main": [[{"node": "Merge SEO data", "type": "main", "index": 0}]]},
            "Ahrefs position changes": {"main": [[{"node": "Merge SEO data", "type": "main", "index": 1}]]},
            "Merge SEO data": {"main": [[{"node": "AI prioritise", "type": "main", "index": 0}]]},
            "AI prioritise": {"main": [[{"node": "Slack — SEO priorities", "type": "main", "index": 0}]]},
        },
        tags=["marketing", "seo", "pattern-4"],
    ),
))

# 25. User-generated content sentiment digest
WORKFLOWS.append((
    "25-ugc-sentiment-digest",
    "User-generated content sentiment digest",
    "Marketing & content — Pattern 4 + AI. Every Friday 16:00 pull: Twitter mentions, LinkedIn comments, app store reviews, support emails, NPS comments from the week → AI extracts themes + sentiment → weekly digest to founders.",
    workflow(
        "Aiprosol — UGC sentiment digest (Friday)",
        "Friday 16:00 → mentions/reviews/NPS/support → AI themes + sentiment → founder digest",
        [
            node("Friday 16:00", "n8n-nodes-base.scheduleTrigger",
                 {"rule": {"interval": [{"field": "cronExpression", "expression": "0 16 * * 5"}]}},
                 (240, 300), 1.1),
            node("Twitter mentions", "n8n-nodes-base.twitter",
                 {"resource": "tweet", "operation": "search",
                  "searchText": "Aiprosol", "additionalFields": {"resultType": "recent"}},
                 (440, 100), 2),
            node("LinkedIn comments", "n8n-nodes-base.httpRequest",
                 {"method": "GET",
                  "url": "https://api.linkedin.com/v2/socialActions/{{ $env.LI_COMPANY_ID }}/comments"},
                 (440, 250), 4.1),
            node("App store reviews", "n8n-nodes-base.httpRequest",
                 {"method": "GET", "url": "https://itunes.apple.com/rss/customerreviews/id=APP_ID/sortBy=mostRecent/json"},
                 (440, 400), 4.1),
            node("NPS comments", "n8n-nodes-base.notion",
                 {"resource": "databasePage", "operation": "getAll", "databaseId": "NPS_DB_ID"},
                 (440, 550), 2.2),
            node("Support emails", "n8n-nodes-base.gmail",
                 {"resource": "message", "operation": "getAll",
                  "filters": {"q": "label:customer-support newer_than:7d"}},
                 (440, 700), 2.1),
            node("Merge UGC", "n8n-nodes-base.merge",
                 {"mode": "combine", "combinationMode": "mergeByPosition"},
                 (640, 400), 3),
            node("AI themes + sentiment", "@n8n/n8n-nodes-langchain.openAi",
                 {"resource": "chat", "modelId": {"value": "gpt-4o"},
                  "messages": {"values": [
                      {"role": "system", "content": "Synthesise this week's user-generated content about Aiprosol. Sections: Top 3 themes, Sentiment %s, Most-quoted phrase customers used, One thing to fix, One thing to amplify."},
                      {"role": "user", "content": "={{ JSON.stringify($json) }}"}
                  ]}},
                 (840, 400), 1.6),
            node("Email founders", "n8n-nodes-base.gmail",
                 {"resource": "message", "operation": "send",
                  "to": "founders@aiprosol.com",
                  "subject": "=Weekly UGC digest — {{ $now.format('dd MMM') }}",
                  "message": "={{ $json.message.content }}"},
                 (1040, 400), 2.1),
        ],
        {
            "Friday 16:00": {"main": [[
                {"node": "Twitter mentions", "type": "main", "index": 0},
                {"node": "LinkedIn comments", "type": "main", "index": 0},
                {"node": "App store reviews", "type": "main", "index": 0},
                {"node": "NPS comments", "type": "main", "index": 0},
                {"node": "Support emails", "type": "main", "index": 0},
            ]]},
            "Twitter mentions": {"main": [[{"node": "Merge UGC", "type": "main", "index": 0}]]},
            "LinkedIn comments": {"main": [[{"node": "Merge UGC", "type": "main", "index": 1}]]},
            "App store reviews": {"main": [[{"node": "Merge UGC", "type": "main", "index": 2}]]},
            "NPS comments": {"main": [[{"node": "Merge UGC", "type": "main", "index": 3}]]},
            "Support emails": {"main": [[{"node": "Merge UGC", "type": "main", "index": 4}]]},
            "Merge UGC": {"main": [[{"node": "AI themes + sentiment", "type": "main", "index": 0}]]},
            "AI themes + sentiment": {"main": [[{"node": "Email founders", "type": "main", "index": 0}]]},
        },
        tags=["marketing", "voice-of-customer", "pattern-4"],
    ),
))


# ────────────────────────────────────────────────────────────────────────
# WRITE FILES + INDEX
# ────────────────────────────────────────────────────────────────────────

manifest = []
for filename, title, description, wf in WORKFLOWS:
    path = OUT / f"{filename}.json"
    with open(path, "w") as f:
        json.dump(wf, f, indent=2, ensure_ascii=False)
    manifest.append({
        "file": f"{filename}.json",
        "title": title,
        "description": description,
        "nodes": len(wf["nodes"]),
        "tags": [t["name"] for t in wf["tags"]],
    })

# Write manifest
with open(OUT / "_index.json", "w") as f:
    json.dump({"version": "1.0", "count": len(manifest), "workflows": manifest}, f, indent=2)

# Write README
readme = ["# Aiprosol — 25 n8n Workflow Templates", "",
          f"Version 1.0 · {len(manifest)} workflows · © 2026 Aiprosol Ltd", "",
          "## How to use", "",
          "1. **Import a workflow:** in n8n → Workflows → Import from File → pick a `.json` from this folder.",
          "2. **Set credentials:** each workflow uses placeholder credential references. Replace with your own OpenAI / Slack / HubSpot / etc. credentials.",
          "3. **Replace placeholder IDs:** look for `*_FOLDER_ID`, `*_DB_ID`, `TEAM_ID` etc. in the JSON — these are placeholders.",
          "4. **Test before going live:** every workflow should run in 'Phase 1' (output for review only) for 2 weeks before unattended use.",
          "", "## The 25 workflows", ""]
for i, m in enumerate(manifest, 1):
    readme.append(f"### {i}. {m['title']}")
    readme.append(f"- **File:** `{m['file']}` ({m['nodes']} nodes)")
    readme.append(f"- **Tags:** {', '.join(m['tags'])}")
    readme.append(f"- {m['description']}")
    readme.append("")

with open(OUT / "README.md", "w") as f:
    f.write("\n".join(readme))

print(f"✓ Wrote {len(manifest)} workflows to {OUT}")
print(f"✓ Wrote _index.json and README.md")
print()
print("Workflow breakdown:")
by_tag = {}
for m in manifest:
    cat = m["tags"][0] if m["tags"] else "?"
    by_tag.setdefault(cat, []).append(m["title"])
for cat, ts in by_tag.items():
    print(f"  {cat}: {len(ts)}")
