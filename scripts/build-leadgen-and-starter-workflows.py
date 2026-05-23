#!/usr/bin/env python3
"""
Aiprosol — n8n workflow generators for:
  • Lead Generation Automation Playbook ($127) — 12 lead-gen specific workflows
  • Global Business Automation Starter Pack ($97) — 10 SMB starter workflows

Same JSON shape as build-n8n-workflows.py — importable into n8n.
"""

import json
import uuid
from pathlib import Path


def node(name, type_, params=None, position=(0, 0), type_version=1):
    return {
        "parameters": params or {},
        "id": str(uuid.uuid4()),
        "name": name,
        "type": type_,
        "typeVersion": type_version,
        "position": list(position),
    }


def workflow(name, description, nodes, connections, tags=None):
    return {
        "name": name,
        "nodes": nodes,
        "connections": connections,
        "active": False,
        "settings": {"executionOrder": "v1"},
        "staticData": None,
        "tags": [{"name": t} for t in (tags or [])],
        "meta": {"templateCredsSetupCompleted": False, "instanceId": "aiprosol-v1"},
        "pinData": {},
        "versionId": str(uuid.uuid4()),
        "id": str(uuid.uuid4()),
        "_aiprosol": {"description": description, "version": "1.0",
                      "license": "© 2026 Aiprosol Ltd · For purchaser's internal use"},
    }


def chain(*node_names):
    c = {}
    for i in range(len(node_names) - 1):
        c[node_names[i]] = {"main": [[{"node": node_names[i + 1], "type": "main", "index": 0}]]}
    return c


def fan_out(source, targets):
    return {source: {"main": [[{"node": t, "type": "main", "index": 0} for t in targets]]}}


# ═══════════════════════════════════════════════════════════════════════
# LEAD GENERATION AUTOMATION PLAYBOOK — 12 workflows
# ═══════════════════════════════════════════════════════════════════════

LEADGEN = []

# 1. Form submission → 4-component lead score
LEADGEN.append((
    "01-lead-form-4-component-scoring",
    "Lead form → 4-component ICP scoring (FIT/INTENT/ENGAGEMENT/URGENCY)",
    "The canonical lead-scoring workflow. Form webhook → 4 parallel AI scorers (FIT, INTENT, ENGAGEMENT, URGENCY) → composite score 0-100 → write to CRM + Slack alert if hot.",
    workflow(
        "Aiprosol — Lead 4-component scoring",
        "Webhook → 4 parallel AI scorers → composite → CRM + Slack",
        [
            node("Webhook · /lead", "n8n-nodes-base.webhook",
                 {"httpMethod": "POST", "path": "lead-score"}, (240, 400), 1.1),
            node("FIT score 0-40", "@n8n/n8n-nodes-langchain.openAi",
                 {"resource": "chat", "modelId": {"value": "gpt-4o-mini"},
                  "messages": {"values": [
                      {"role": "system", "content": "Score FIT 0-40. ICP: 10-200 employees, professional services/SaaS, UK/EU/US. Return integer."},
                      {"role": "user", "content": "={{ JSON.stringify($json) }}"}
                  ]}}, (440, 200), 1.6),
            node("INTENT score 0-30", "@n8n/n8n-nodes-langchain.openAi",
                 {"resource": "chat", "modelId": {"value": "gpt-4o-mini"},
                  "messages": {"values": [
                      {"role": "system", "content": "Score INTENT 0-30. Signals: page visited (pricing=10, blog=4), specificity of stated problem, budget signal. Return integer."},
                      {"role": "user", "content": "={{ JSON.stringify($json) }}"}
                  ]}}, (440, 350), 1.6),
            node("ENGAGEMENT score 0-20", "@n8n/n8n-nodes-langchain.openAi",
                 {"resource": "chat", "modelId": {"value": "gpt-4o-mini"},
                  "messages": {"values": [
                      {"role": "system", "content": "Score ENGAGEMENT 0-20. Pages, time, opens, clicks. Return integer."},
                      {"role": "user", "content": "={{ JSON.stringify($json) }}"}
                  ]}}, (440, 500), 1.6),
            node("URGENCY score 0-10", "@n8n/n8n-nodes-langchain.openAi",
                 {"resource": "chat", "modelId": {"value": "gpt-4o-mini"},
                  "messages": {"values": [
                      {"role": "system", "content": "Score URGENCY 0-10. Stated timeline + recent trigger events. Return integer."},
                      {"role": "user", "content": "={{ JSON.stringify($json) }}"}
                  ]}}, (440, 650), 1.6),
            node("Merge scores", "n8n-nodes-base.merge",
                 {"mode": "combine", "combinationMode": "mergeByPosition"}, (640, 400), 3),
            node("Composite + tier", "n8n-nodes-base.code",
                 {"language": "javaScript",
                  "jsCode": "const fit=Number($('FIT score 0-40').first().json.message.content); const intent=Number($('INTENT score 0-30').first().json.message.content); const eng=Number($('ENGAGEMENT score 0-20').first().json.message.content); const urg=Number($('URGENCY score 0-10').first().json.message.content); const total=fit+intent+eng+urg; const tier=total>=80?'hot':total>=60?'warm':total>=40?'watch':'cold'; return [{json:{...$('Webhook · /lead').first().json, fit, intent, engagement:eng, urgency:urg, total, tier}}];"},
                 (840, 400), 2),
            node("HubSpot — upsert", "n8n-nodes-base.hubspot",
                 {"resource": "contact", "operation": "upsert",
                  "email": "={{ $json.email }}",
                  "additionalFields": {"properties": {"property": [
                      {"property": "lead_score", "value": "={{ $json.total }}"},
                      {"property": "lead_tier", "value": "={{ $json.tier }}"},
                      {"property": "fit_score", "value": "={{ $json.fit }}"},
                  ]}}},
                 (1040, 400), 2),
            node("Slack if hot", "n8n-nodes-base.if",
                 {"conditions": {"options": {"caseSensitive": True, "typeValidation": "strict"},
                                 "conditions": [{"id": "1", "leftValue": "={{ $json.tier }}",
                                                  "rightValue": "hot",
                                                  "operator": {"type": "string", "operation": "equals"}}]}},
                 (1240, 400), 2),
            node("Slack hot ping", "n8n-nodes-base.slack",
                 {"resource": "message", "operation": "post", "channel": "#sales-hot",
                  "text": "=🔥 HOT LEAD — score {{ $json.total }} ({{ $json.fit }}/40 fit, {{ $json.intent }}/30 intent)\\n{{ $json.email }} at {{ $json.company }}"},
                 (1440, 350), 2.2),
        ],
        {
            "Webhook · /lead": {"main": [[
                {"node": "FIT score 0-40", "type": "main", "index": 0},
                {"node": "INTENT score 0-30", "type": "main", "index": 0},
                {"node": "ENGAGEMENT score 0-20", "type": "main", "index": 0},
                {"node": "URGENCY score 0-10", "type": "main", "index": 0},
            ]]},
            "FIT score 0-40": {"main": [[{"node": "Merge scores", "type": "main", "index": 0}]]},
            "INTENT score 0-30": {"main": [[{"node": "Merge scores", "type": "main", "index": 1}]]},
            "ENGAGEMENT score 0-20": {"main": [[{"node": "Merge scores", "type": "main", "index": 2}]]},
            "URGENCY score 0-10": {"main": [[{"node": "Merge scores", "type": "main", "index": 3}]]},
            "Merge scores": {"main": [[{"node": "Composite + tier", "type": "main", "index": 0}]]},
            "Composite + tier": {"main": [[{"node": "HubSpot — upsert", "type": "main", "index": 0}]]},
            "HubSpot — upsert": {"main": [[{"node": "Slack if hot", "type": "main", "index": 0}]]},
            "Slack if hot": {"main": [[{"node": "Slack hot ping", "type": "main", "index": 0}], []]},
        },
        tags=["lead-gen", "scoring", "pattern-3"],
    ),
))

# 2. AI chat qualifier → email capture
LEADGEN.append((
    "02-chat-qualifier-to-email-capture",
    "AI chat qualifier → email capture after 3 exchanges",
    "Chat widget webhook fires after every visitor message. Workflow tracks conversation depth — when 3+ messages exchanged, AI generates 'want me to email you a personalised plan?' prompt + captures email. Lead written to CRM.",
    workflow(
        "Aiprosol — Chat qualifier → email capture",
        "Chat message webhook → conversation memory → trigger capture at depth 3",
        [
            node("Chat webhook", "n8n-nodes-base.webhook",
                 {"httpMethod": "POST", "path": "chat-message"}, (240, 300), 1.1),
            node("Get conversation history", "n8n-nodes-base.googleSheets",
                 {"resource": "sheet", "operation": "read",
                  "documentId": "CHAT_LOG_SHEET_ID",
                  "filters": {"values": [{"lookupColumn": "session_id", "lookupValue": "={{ $json.session_id }}"}]}},
                 (440, 300), 4),
            node("Append this message", "n8n-nodes-base.googleSheets",
                 {"resource": "sheet", "operation": "append",
                  "documentId": "CHAT_LOG_SHEET_ID",
                  "fieldsUi": {"fieldValues": [
                      {"fieldId": "session_id", "fieldValue": "={{ $json.session_id }}"},
                      {"fieldId": "role", "fieldValue": "user"},
                      {"fieldId": "content", "fieldValue": "={{ $json.content }}"},
                      {"fieldId": "timestamp", "fieldValue": "={{ $now.toISO() }}"},
                  ]}},
                 (640, 300), 4),
            node("AI reply + intent", "@n8n/n8n-nodes-langchain.openAi",
                 {"resource": "chat", "modelId": {"value": "gpt-4o"},
                  "messages": {"values": [
                      {"role": "system", "content": "You're Arora, Aiprosol's AI CEO. Help the visitor. After ~3 substantive exchanges, naturally offer to email a personalised plan. Return JSON {reply:string, ready_for_capture:boolean}"},
                      {"role": "user", "content": "=History: {{ JSON.stringify($('Get conversation history').all()) }}\\n\\nNew message: {{ $('Chat webhook').first().json.content }}"}
                  ]}, "options": {"responseFormat": "json_object"}},
                 (840, 300), 1.6),
            node("If ready_for_capture", "n8n-nodes-base.if",
                 {"conditions": {"options": {"caseSensitive": True}, "conditions": [
                     {"id": "1", "leftValue": "={{ JSON.parse($json.message.content).ready_for_capture }}",
                      "rightValue": True, "operator": {"type": "boolean", "operation": "true"}}]}},
                 (1040, 300), 2),
            node("Capture email step", "n8n-nodes-base.httpRequest",
                 {"method": "POST", "url": "https://aiprosol.com/api/capture-lead",
                  "sendBody": True, "specifyBody": "json",
                  "jsonBody": "={\"name\":\"{{ $('Chat webhook').first().json.visitor_name }}\",\"email\":\"{{ $('Chat webhook').first().json.visitor_email }}\",\"source\":\"chat\"}"},
                 (1240, 250), 4.1),
            node("Respond to widget", "n8n-nodes-base.respondToWebhook",
                 {"respondWith": "json",
                  "responseBody": "={\"reply\":\"{{ JSON.parse($('AI reply + intent').first().json.message.content).reply }}\"}"},
                 (1240, 400), 1.1),
        ],
        {
            "Chat webhook": {"main": [[{"node": "Get conversation history", "type": "main", "index": 0}]]},
            "Get conversation history": {"main": [[{"node": "Append this message", "type": "main", "index": 0}]]},
            "Append this message": {"main": [[{"node": "AI reply + intent", "type": "main", "index": 0}]]},
            "AI reply + intent": {"main": [[{"node": "If ready_for_capture", "type": "main", "index": 0}]]},
            "If ready_for_capture": {"main": [
                [{"node": "Capture email step", "type": "main", "index": 0}],
                [{"node": "Respond to widget", "type": "main", "index": 0}]]},
            "Capture email step": {"main": [[{"node": "Respond to widget", "type": "main", "index": 0}]]},
        },
        tags=["lead-gen", "chat", "pattern-2"],
    ),
))

# 3. Demo booking → instant prep brief
LEADGEN.append((
    "03-demo-booking-prep-brief",
    "Demo booking → instant prep brief auto-research",
    "Cal.com/Calendly webhook on booking. Workflow pulls attendee email → enriches via Clearbit/Apollo → scrapes their site → drafts 1-page sales prep brief in Google Doc → DMs the rep with link 60 seconds after booking.",
    workflow(
        "Aiprosol — Demo booking → prep brief",
        "Booking webhook → enrich → scrape site → AI brief → Slack DM to rep",
        [
            node("Booking webhook", "n8n-nodes-base.webhook",
                 {"httpMethod": "POST", "path": "demo-booked"}, (240, 300), 1.1),
            node("Enrich via Clearbit", "n8n-nodes-base.httpRequest",
                 {"method": "GET",
                  "url": "=https://person-stream.clearbit.com/v2/combined/find?email={{ $json.attendee_email }}",
                  "authentication": "genericCredentialType"},
                 (440, 200), 4.1),
            node("Scrape homepage", "n8n-nodes-base.httpRequest",
                 {"method": "GET", "url": "=https://{{ $json.company_domain }}"},
                 (440, 400), 4.1),
            node("Merge enrichment", "n8n-nodes-base.merge",
                 {"mode": "combine", "combinationMode": "mergeByPosition"}, (640, 300), 3),
            node("AI prep brief", "@n8n/n8n-nodes-langchain.openAi",
                 {"resource": "chat", "modelId": {"value": "gpt-4o"},
                  "messages": {"values": [
                      {"role": "system", "content": "Write a 1-page sales prep brief. Sections: Company snapshot, Why they probably booked us, 3 likely pain points, 3 good opening questions, deal-size estimate."},
                      {"role": "user", "content": "={{ JSON.stringify($json) }}"}
                  ]}}, (840, 300), 1.6),
            node("Google Docs — brief", "n8n-nodes-base.googleDocs",
                 {"operation": "create",
                  "title": "=Prep — {{ $('Booking webhook').first().json.attendee_email }} — {{ $now.format('yyyy-MM-dd') }}",
                  "folderId": "PREP_FOLDER_ID",
                  "content": "={{ $json.message.content }}"}, (1040, 300), 2),
            node("DM rep", "n8n-nodes-base.slack",
                 {"resource": "message", "operation": "post", "select": "user",
                  "user": "={{ $('Booking webhook').first().json.rep_slack_id }}",
                  "text": "=📄 Prep brief ready for your call with {{ $('Booking webhook').first().json.attendee_email }}: {{ $json.webViewLink }}"},
                 (1240, 300), 2.2),
        ],
        {
            "Booking webhook": {"main": [[
                {"node": "Enrich via Clearbit", "type": "main", "index": 0},
                {"node": "Scrape homepage", "type": "main", "index": 0}]]},
            "Enrich via Clearbit": {"main": [[{"node": "Merge enrichment", "type": "main", "index": 0}]]},
            "Scrape homepage": {"main": [[{"node": "Merge enrichment", "type": "main", "index": 1}]]},
            "Merge enrichment": {"main": [[{"node": "AI prep brief", "type": "main", "index": 0}]]},
            "AI prep brief": {"main": [[{"node": "Google Docs — brief", "type": "main", "index": 0}]]},
            "Google Docs — brief": {"main": [[{"node": "DM rep", "type": "main", "index": 0}]]},
        },
        tags=["lead-gen", "enrichment", "pattern-1"],
    ),
))

# 4. Suppression check + geographic routing
LEADGEN.append((
    "04-suppression-geo-routing",
    "Suppression list + geographic routing gate",
    "Every new lead goes through this pre-routing workflow. Checks suppression list (Google Sheet) → checks blocked countries → checks size band → routes to correct downstream sequence (or halts).",
    workflow(
        "Aiprosol — Suppression + geo routing",
        "Lead → check suppression → geo check → size check → route to right sequence",
        [
            node("Lead webhook", "n8n-nodes-base.webhook",
                 {"httpMethod": "POST", "path": "lead-pre-route"}, (240, 300), 1.1),
            node("Check suppression list", "n8n-nodes-base.googleSheets",
                 {"resource": "sheet", "operation": "read",
                  "documentId": "SUPPRESSION_SHEET_ID",
                  "filters": {"values": [{"lookupColumn": "email", "lookupValue": "={{ $json.email }}"}]}},
                 (440, 300), 4),
            node("If suppressed", "n8n-nodes-base.if",
                 {"conditions": {"options": {"caseSensitive": True}, "conditions": [
                     {"id": "1", "leftValue": "={{ $items().length }}", "rightValue": 0,
                      "operator": {"type": "number", "operation": "gt"}}]}},
                 (640, 300), 2),
            node("Halt — suppressed", "n8n-nodes-base.set",
                 {"assignments": {"assignments": [{"id": "1", "name": "action", "value": "halted-suppression", "type": "string"}]}},
                 (840, 200), 3.4),
            node("Switch by region", "n8n-nodes-base.switch",
                 {"rules": {"values": [
                     {"conditions": {"conditions": [{"leftValue": "={{ $json.country_code }}", "rightValue": "US,UK,GB,CA,AU,NZ,IE,DE,FR,NL,SE,NO,DK,FI",
                                                      "operator": {"type": "string", "operation": "regex"}}]},
                      "renameOutput": True, "outputKey": "core-market"},
                     {"conditions": {"conditions": [{"leftValue": "={{ $json.country_code }}", "rightValue": "IN,SG,JP,AE,SA,BR,MX",
                                                      "operator": {"type": "string", "operation": "regex"}}]},
                      "renameOutput": True, "outputKey": "secondary-market"},
                 ]}},
                 (840, 400), 3),
            node("Route to main scoring", "n8n-nodes-base.httpRequest",
                 {"method": "POST", "url": "https://aiprosol.com/api/internal/lead-score",
                  "sendBody": True, "specifyBody": "json", "jsonBody": "={{ JSON.stringify($json) }}"},
                 (1040, 350), 4.1),
            node("Route to slow nurture", "n8n-nodes-base.httpRequest",
                 {"method": "POST", "url": "https://aiprosol.com/api/internal/lead-nurture-slow",
                  "sendBody": True, "specifyBody": "json", "jsonBody": "={{ JSON.stringify($json) }}"},
                 (1040, 450), 4.1),
        ],
        {
            "Lead webhook": {"main": [[{"node": "Check suppression list", "type": "main", "index": 0}]]},
            "Check suppression list": {"main": [[{"node": "If suppressed", "type": "main", "index": 0}]]},
            "If suppressed": {"main": [
                [{"node": "Halt — suppressed", "type": "main", "index": 0}],
                [{"node": "Switch by region", "type": "main", "index": 0}]]},
            "Switch by region": {"main": [
                [{"node": "Route to main scoring", "type": "main", "index": 0}],
                [{"node": "Route to slow nurture", "type": "main", "index": 0}]]},
        },
        tags=["lead-gen", "routing", "pattern-2"],
    ),
))

# 5-9: The 5-touch nurture sequence
NURTURE_DAYS = [
    (0, "Email 1 (Day 0) — instant value", "instant-value", "What you asked for · {LeadMagnetTitle}",
     "Deliver the lead magnet in para 1. Para 2: 'Here's the question I'd ask first if I were you'. Para 3: one tactical tip relevant to their stated problem. Sign-off + 'tomorrow I'll send a 4-min read on [their problem]'."),
    (2, "Email 2 (Day 2) — applied insight", "applied-insight", "{Their specific problem}",
     "One-line context acknowledgement (AI-personalised). 300-500 word framework. One real example with numbers. CTA: 'What's your version of this look like? Reply with one sentence.'"),
    (5, "Email 3 (Day 5) — counter-intuitive", "counter-intuitive", "The one thing most people miss about {topic}",
     "Counter-intuitive angle on their problem. One specific case study by name. 90-sec video link. CTA: book a 15-min call."),
    (10, "Email 4 (Day 10) — three options", "three-options", "Three options if you want help",
     "Acknowledge they may not be ready. Three paths: self-serve product, managed plan, 'stay subscribed'. Make no-action easy. CTA: pick one."),
    (21, "Email 5 (Day 21) — graceful close", "graceful-close", "Closing your file?",
     "'I'm going to stop reaching out unless you say otherwise.' Last CTA. Warm tone, not guilt."),
]

for i, (day_offset, day_title, slug, subject, body_brief) in enumerate(NURTURE_DAYS, start=5):
    LEADGEN.append((
        f"{i:02d}-nurture-{slug}",
        f"5-touch nurture — {day_title}",
        f"Part of the 5-email warm-lead nurture sequence. Fires {day_offset} days after lead capture. AI personalises the body based on the lead's submitted role + industry + stated problem.",
        workflow(
            f"Aiprosol — Nurture {day_title}",
            f"Day {day_offset} trigger → AI-personalised body → Gmail send → log",
            [
                node("Wait until day " + str(day_offset), "n8n-nodes-base.scheduleTrigger",
                     {"rule": {"interval": [{"field": "cronExpression", "expression": "0 9 * * *"}]}},
                     (240, 300), 1.1),
                node("Find leads at day " + str(day_offset), "n8n-nodes-base.hubspot",
                     {"resource": "contact", "operation": "getAll",
                      "filters": {"propertiesCollection": {"properties": ["email", "captured_at", "role", "industry", "primary_problem"]}}},
                     (440, 300), 2),
                node("Filter to today's send batch", "n8n-nodes-base.code",
                     {"language": "javaScript",
                      "jsCode": f"const cutoff = Date.now() - {day_offset}*24*60*60*1000; return $input.all().filter(i => Math.abs(new Date(i.json.captured_at).getTime() - cutoff) < 24*60*60*1000 && i.json.lead_tier === 'warm');"},
                     (640, 300), 2),
                node("AI-personalise body", "@n8n/n8n-nodes-langchain.openAi",
                     {"resource": "chat", "modelId": {"value": "gpt-4o"},
                      "messages": {"values": [
                          {"role": "system", "content": f"Write Email {i-4} of a 5-touch nurture sequence. Brief: {body_brief}. Tone: warm, specific, no marketing fluff. 150-250 words."},
                          {"role": "user", "content": "=Lead: role={{ $json.role }}, industry={{ $json.industry }}, stated problem={{ $json.primary_problem }}"}
                      ]}}, (840, 300), 1.6),
                node("Gmail send", "n8n-nodes-base.gmail",
                     {"resource": "message", "operation": "send",
                      "to": "={{ $('Find leads at day ' + str({}) + ').first().json.email }}".format(day_offset).replace("'", "'"),
                      "subject": f"={subject}",
                      "message": "={{ $json.message.content }}"},
                     (1040, 300), 2.1),
                node("Log send", "n8n-nodes-base.hubspot",
                     {"resource": "contact", "operation": "update",
                      "contactId": "={{ $('Find leads at day ' + str({}) + ').first().json.id }}".format(day_offset).replace("'", "'"),
                      "additionalFields": {"properties": {"property": [
                          {"property": f"nurture_email_{i-4}_sent", "value": "={{ $now.toISO() }}"}]}}},
                     (1240, 300), 2),
            ],
            chain(f"Wait until day {day_offset}", f"Find leads at day {day_offset}", "Filter to today's send batch",
                  "AI-personalise body", "Gmail send", "Log send"),
            tags=["lead-gen", "nurture", f"day-{day_offset}"],
        ),
    ))


# 10. Round-robin rep assignment
LEADGEN.append((
    "10-round-robin-assignment",
    "Round-robin rep assignment with territory + workload",
    "Hot lead arrives → check territory map → check rep current load → assign to next eligible rep → Slack the rep with 5-min SLA → 24h escalation if no contact.",
    workflow(
        "Aiprosol — Round-robin rep assignment",
        "Hot lead → territory + workload check → assign rep → Slack with SLA",
        [
            node("Hot lead webhook", "n8n-nodes-base.webhook",
                 {"httpMethod": "POST", "path": "hot-lead-assign"}, (240, 300), 1.1),
            node("Get rep table", "n8n-nodes-base.googleSheets",
                 {"resource": "sheet", "operation": "read",
                  "documentId": "REPS_SHEET_ID",
                  "filters": {"values": [{"lookupColumn": "territory", "lookupValue": "={{ $json.country_code }}"}]}},
                 (440, 300), 4),
            node("Pick lowest-load rep", "n8n-nodes-base.code",
                 {"language": "javaScript",
                  "jsCode": "const sorted = $input.all().sort((a,b) => a.json.current_count - b.json.current_count); return [sorted[0]];"},
                 (640, 300), 2),
            node("Update rep load", "n8n-nodes-base.googleSheets",
                 {"resource": "sheet", "operation": "update",
                  "documentId": "REPS_SHEET_ID",
                  "fieldsUi": {"fieldValues": [
                      {"fieldId": "current_count", "fieldValue": "={{ $json.current_count + 1 }}"},
                      {"fieldId": "last_assigned", "fieldValue": "={{ $now.toISO() }}"}]}},
                 (840, 300), 4),
            node("Slack DM rep — 5min SLA", "n8n-nodes-base.slack",
                 {"resource": "message", "operation": "post", "select": "user",
                  "user": "={{ $json.slack_user_id }}",
                  "text": "=🔥 *Hot lead — 5 min SLA*\\n{{ $('Hot lead webhook').first().json.name }} at {{ $('Hot lead webhook').first().json.company }}\\nScore: {{ $('Hot lead webhook').first().json.total }}/100\\nProblem: {{ $('Hot lead webhook').first().json.problem }}\\nPhone: {{ $('Hot lead webhook').first().json.phone || 'not provided' }}\\nCalendar: {{ $('Hot lead webhook').first().json.calendar_link }}"},
                 (1040, 300), 2.2),
            node("Wait 24h", "n8n-nodes-base.wait",
                 {"resume": "timeInterval", "amount": 24, "unit": "hours"}, (1240, 300), 1.1),
            node("Check if contacted", "n8n-nodes-base.hubspot",
                 {"resource": "contact", "operation": "get",
                  "contactId": "={{ $('Hot lead webhook').first().json.contact_id }}"}, (1440, 300), 2),
            node("Escalate if no contact", "n8n-nodes-base.if",
                 {"conditions": {"options": {"caseSensitive": True}, "conditions": [
                     {"id": "1", "leftValue": "={{ $json.properties.last_outreach_at || '' }}",
                      "rightValue": "", "operator": {"type": "string", "operation": "equals"}}]}}, (1640, 300), 2),
            node("Escalate to manager", "n8n-nodes-base.slack",
                 {"resource": "message", "operation": "post", "channel": "#sales-leadership",
                  "text": "=⚠️ 24h SLA breach: {{ $('Hot lead webhook').first().json.name }} not yet contacted by {{ $('Pick lowest-load rep').first().json.name }}"},
                 (1840, 250), 2.2),
        ],
        {
            "Hot lead webhook": {"main": [[{"node": "Get rep table", "type": "main", "index": 0}]]},
            "Get rep table": {"main": [[{"node": "Pick lowest-load rep", "type": "main", "index": 0}]]},
            "Pick lowest-load rep": {"main": [[{"node": "Update rep load", "type": "main", "index": 0}]]},
            "Update rep load": {"main": [[{"node": "Slack DM rep — 5min SLA", "type": "main", "index": 0}]]},
            "Slack DM rep — 5min SLA": {"main": [[{"node": "Wait 24h", "type": "main", "index": 0}]]},
            "Wait 24h": {"main": [[{"node": "Check if contacted", "type": "main", "index": 0}]]},
            "Check if contacted": {"main": [[{"node": "Escalate if no contact", "type": "main", "index": 0}]]},
            "Escalate if no contact": {"main": [[{"node": "Escalate to manager", "type": "main", "index": 0}], []]},
        },
        tags=["lead-gen", "sla", "routing"],
    ),
))

# 11. Weekly scoring iteration loop
LEADGEN.append((
    "11-weekly-scoring-iteration",
    "Weekly closed-loop: scoring iteration based on closed deals",
    "Every Monday: pull closed-won + closed-lost deals from past 90 days → look up original lead scores → identify which scoring components predicted outcomes → Slack a recommendation to adjust weights.",
    workflow(
        "Aiprosol — Weekly scoring iteration",
        "Mon 9am → 90d closed deals → score-vs-outcome analysis → adjustment recommendation",
        [
            node("Mon 9am", "n8n-nodes-base.scheduleTrigger",
                 {"rule": {"interval": [{"field": "cronExpression", "expression": "0 9 * * 1"}]}}, (240, 300), 1.1),
            node("Closed-won 90d", "n8n-nodes-base.hubspot",
                 {"resource": "deal", "operation": "getAll",
                  "filters": {"propertiesCollection": {"properties": ["lead_score", "fit_score", "intent_score", "engagement_score", "urgency_score", "amount"]}}},
                 (440, 200), 2),
            node("Closed-lost 90d", "n8n-nodes-base.hubspot",
                 {"resource": "deal", "operation": "getAll",
                  "filters": {"propertiesCollection": {"properties": ["lead_score", "fit_score", "intent_score", "engagement_score", "urgency_score", "amount"]}}},
                 (440, 400), 2),
            node("Merge + analyse", "n8n-nodes-base.merge",
                 {"mode": "combine", "combinationMode": "mergeByPosition"}, (640, 300), 3),
            node("Compute predictiveness", "n8n-nodes-base.code",
                 {"language": "javaScript",
                  "jsCode": "const won = $('Closed-won 90d').all().map(i => i.json); const lost = $('Closed-lost 90d').all().map(i => i.json); const avg = (a,f) => a.reduce((s,i)=>s+Number(i[f]||0),0)/a.length; return [{json: {won_avg_score: avg(won,'lead_score'), lost_avg_score: avg(lost,'lead_score'), won_avg_fit: avg(won,'fit_score'), lost_avg_fit: avg(lost,'fit_score'), won_avg_intent: avg(won,'intent_score'), lost_avg_intent: avg(lost,'intent_score'), spread_fit: avg(won,'fit_score')-avg(lost,'fit_score'), spread_intent: avg(won,'intent_score')-avg(lost,'intent_score')}}];"},
                 (840, 300), 2),
            node("AI recommendation", "@n8n/n8n-nodes-langchain.openAi",
                 {"resource": "chat", "modelId": {"value": "gpt-4o"},
                  "messages": {"values": [
                      {"role": "system", "content": "You're a sales-ops analyst. Based on which scoring components have the biggest spread between won and lost deals, recommend a weight adjustment. Don't recommend changes for <50 deals."},
                      {"role": "user", "content": "={{ JSON.stringify($json) }}"}
                  ]}}, (1040, 300), 1.6),
            node("Slack Monday", "n8n-nodes-base.slack",
                 {"resource": "message", "operation": "post", "channel": "#sales-ops",
                  "text": "=📊 *Weekly scoring review*\\n\\nWon avg: {{ $('Compute predictiveness').first().json.won_avg_score }}\\nLost avg: {{ $('Compute predictiveness').first().json.lost_avg_score }}\\n\\n{{ $json.message.content }}"},
                 (1240, 300), 2.2),
        ],
        {
            "Mon 9am": {"main": [[
                {"node": "Closed-won 90d", "type": "main", "index": 0},
                {"node": "Closed-lost 90d", "type": "main", "index": 0}]]},
            "Closed-won 90d": {"main": [[{"node": "Merge + analyse", "type": "main", "index": 0}]]},
            "Closed-lost 90d": {"main": [[{"node": "Merge + analyse", "type": "main", "index": 1}]]},
            "Merge + analyse": {"main": [[{"node": "Compute predictiveness", "type": "main", "index": 0}]]},
            "Compute predictiveness": {"main": [[{"node": "AI recommendation", "type": "main", "index": 0}]]},
            "AI recommendation": {"main": [[{"node": "Slack Monday", "type": "main", "index": 0}]]},
        },
        tags=["lead-gen", "iteration", "pattern-4"],
    ),
))

# 12. Lead-gen dashboard daily refresh
LEADGEN.append((
    "12-leadgen-dashboard-daily",
    "Lead-gen dashboard daily refresh",
    "Daily 8am: pull lead volume, score distribution, by-source attribution, conversion rate, time-to-first-contact → update a Notion (or Google Sheets) dashboard → Slack a daily 4-line summary.",
    workflow(
        "Aiprosol — Lead-gen daily dashboard",
        "Daily 8am → metrics aggregation → dashboard refresh + Slack summary",
        [
            node("Daily 8am", "n8n-nodes-base.scheduleTrigger",
                 {"rule": {"interval": [{"field": "cronExpression", "expression": "0 8 * * *"}]}}, (240, 300), 1.1),
            node("Yesterday's leads", "n8n-nodes-base.hubspot",
                 {"resource": "contact", "operation": "getAll",
                  "filters": {"propertiesCollection": {"properties": ["email", "lead_score", "lead_tier", "utm_source", "captured_at", "first_contact_at"]}}},
                 (440, 300), 2),
            node("Aggregate metrics", "n8n-nodes-base.code",
                 {"language": "javaScript",
                  "jsCode": "const leads = $input.all().map(i => i.json); const total = leads.length; const hot = leads.filter(l => l.lead_tier==='hot').length; const bySource = {}; leads.forEach(l => { const s = l.utm_source||'organic'; bySource[s] = (bySource[s]||0)+1; }); const ttfc = leads.filter(l => l.first_contact_at).map(l => new Date(l.first_contact_at)-new Date(l.captured_at)); const avg_ttfc = ttfc.length ? ttfc.reduce((s,t)=>s+t,0)/ttfc.length/60000 : null; return [{json:{total, hot, hot_pct: (hot/total*100).toFixed(1), by_source: bySource, avg_ttfc_min: avg_ttfc ? avg_ttfc.toFixed(0) : 'n/a'}}];"},
                 (640, 300), 2),
            node("Notion — update dashboard", "n8n-nodes-base.notion",
                 {"resource": "databasePage", "operation": "create",
                  "databaseId": "DASHBOARD_DB_ID",
                  "title": "=Lead metrics — {{ $now.format('yyyy-MM-dd') }}",
                  "propertiesUi": {"propertyValues": [
                      {"key": "Total|number", "numberValue": "={{ $json.total }}"},
                      {"key": "Hot|number", "numberValue": "={{ $json.hot }}"},
                      {"key": "Avg TTFC (min)|number", "numberValue": "={{ $json.avg_ttfc_min }}"}]}},
                 (840, 300), 2.2),
            node("Slack 4-line summary", "n8n-nodes-base.slack",
                 {"resource": "message", "operation": "post", "channel": "#leads",
                  "text": "=📈 Yesterday: {{ $('Aggregate metrics').first().json.total }} leads · {{ $('Aggregate metrics').first().json.hot }} hot ({{ $('Aggregate metrics').first().json.hot_pct }}%)\\nTop source: {{ Object.entries($('Aggregate metrics').first().json.by_source).sort((a,b)=>b[1]-a[1])[0][0] }}\\nAvg time-to-first-contact: {{ $('Aggregate metrics').first().json.avg_ttfc_min }} min"},
                 (1040, 300), 2.2),
        ],
        chain("Daily 8am", "Yesterday's leads", "Aggregate metrics",
              "Notion — update dashboard", "Slack 4-line summary"),
        tags=["lead-gen", "dashboard", "pattern-4"],
    ),
))


# ═══════════════════════════════════════════════════════════════════════
# STARTER PACK — 10 SMB-friendly workflows
# ═══════════════════════════════════════════════════════════════════════

STARTER = []

starter_specs = [
    ("01-starter-contact-form-to-email",
     "Contact form → instant email reply + log",
     "The simplest possible: webhook from your site contact form → AI generates a personalised acknowledgement reply → sends via Gmail → logs to a Google Sheet. 4 nodes.",
     [
         ("Form webhook", "n8n-nodes-base.webhook", {"httpMethod": "POST", "path": "contact-form"}, 1.1),
         ("AI acknowledgement", "@n8n/n8n-nodes-langchain.openAi",
          {"resource": "chat", "modelId": {"value": "gpt-4o-mini"},
           "messages": {"values": [
               {"role": "system", "content": "Write a 60-word warm acknowledgement reply. Use the visitor's name. Promise a human reply within 24 hours."},
               {"role": "user", "content": "=Name: {{ $json.name }}\\nMessage: {{ $json.message }}"}
           ]}}, 1.6),
         ("Send reply", "n8n-nodes-base.gmail",
          {"resource": "message", "operation": "send", "to": "={{ $('Form webhook').first().json.email }}",
           "subject": "Thanks for getting in touch", "message": "={{ $json.message.content }}"}, 2.1),
         ("Log to Sheet", "n8n-nodes-base.googleSheets",
          {"resource": "sheet", "operation": "append", "documentId": "CONTACTS_SHEET_ID",
           "fieldsUi": {"fieldValues": [
               {"fieldId": "Name", "fieldValue": "={{ $('Form webhook').first().json.name }}"},
               {"fieldId": "Email", "fieldValue": "={{ $('Form webhook').first().json.email }}"},
               {"fieldId": "Message", "fieldValue": "={{ $('Form webhook').first().json.message }}"},
               {"fieldId": "Date", "fieldValue": "={{ $now.toISO() }}"}]}}, 4),
     ], ["starter", "lead-capture"]),

    ("02-starter-stripe-revenue-log",
     "Stripe payment → Sheet log + Slack",
     "Every Stripe payment writes a row to a Sales Log sheet and pings #sales channel. The Day-2 challenge automation.",
     [
         ("Stripe trigger", "n8n-nodes-base.stripeTrigger", {"events": ["payment_intent.succeeded"]}, 1),
         ("Append sale", "n8n-nodes-base.googleSheets",
          {"resource": "sheet", "operation": "append", "documentId": "SALES_SHEET_ID",
           "fieldsUi": {"fieldValues": [
               {"fieldId": "Date", "fieldValue": "={{ $now.toISO() }}"},
               {"fieldId": "Customer", "fieldValue": "={{ $json.customer_email }}"},
               {"fieldId": "Amount", "fieldValue": "={{ $json.amount / 100 }}"},
               {"fieldId": "Country", "fieldValue": "={{ $json.country }}"}]}}, 4),
         ("Slack sale", "n8n-nodes-base.slack",
          {"resource": "message", "operation": "post", "channel": "#sales",
           "text": "=🎉 New sale: ${{ $('Stripe trigger').first().json.amount/100 }} from {{ $('Stripe trigger').first().json.customer_email }}"}, 2.2),
     ], ["starter", "revenue"]),

    ("03-starter-gmail-classifier",
     "Gmail inbox → AI auto-label",
     "Every new email gets AI-classified into 7 categories and the matching Gmail label is applied. Saves 30 min/day of inbox triage.",
     [
         ("Gmail trigger", "n8n-nodes-base.gmailTrigger",
          {"pollTimes": {"item": [{"mode": "everyMinute"}]}, "filters": {}}, 1),
         ("Skip self", "n8n-nodes-base.if",
          {"conditions": {"options": {"caseSensitive": False}, "conditions": [
              {"id": "1", "leftValue": "={{ $json.from }}", "rightValue": "@yourdomain.com",
               "operator": {"type": "string", "operation": "notContains"}}]}}, 2),
         ("AI classify", "@n8n/n8n-nodes-langchain.openAi",
          {"resource": "chat", "modelId": {"value": "gpt-4o-mini"},
           "messages": {"values": [
               {"role": "system", "content": "Classify into: SALES_LEAD, CUSTOMER_SUPPORT, BILLING, VENDOR, PERSONAL, NEWSLETTER, OTHER. Return only label."},
               {"role": "user", "content": "=Subject: {{ $json.subject }}\\nFrom: {{ $json.from }}\\nBody: {{ $json.snippet }}"}
           ]}}, 1.6),
         ("Apply label", "n8n-nodes-base.gmail",
          {"resource": "label", "operation": "add",
           "messageId": "={{ $('Gmail trigger').first().json.id }}",
           "labelIds": "={{ $json.message.content.trim() }}"}, 2.1),
     ], ["starter", "inbox", "pattern-2"]),

    ("04-starter-calendar-prep-brief",
     "Calendar event → prep brief 2hrs before",
     "Two hours before any calendar event with an external attendee, AI scrapes their domain and posts a one-line summary to Slack.",
     [
         ("Schedule check", "n8n-nodes-base.scheduleTrigger",
          {"rule": {"interval": [{"field": "minutes", "minutesInterval": 30}]}}, 1.1),
         ("Get upcoming events", "n8n-nodes-base.googleCalendar",
          {"resource": "event", "operation": "getAll",
           "calendar": {"__rl": True, "value": "primary"},
           "additionalFields": {"timeMin": "={{ $now.plus(1.5, 'hours').toISO() }}",
                                "timeMax": "={{ $now.plus(2.5, 'hours').toISO() }}"}}, 1.3),
         ("Extract domain", "n8n-nodes-base.code",
          {"language": "javaScript",
           "jsCode": "const att = $input.first().json.attendees?.find(a => !a.email.endsWith('@yourdomain.com')); return [{json: {domain: att?.email?.split('@')[1], event_title: $input.first().json.summary}}];"}, 2),
         ("AI brief", "@n8n/n8n-nodes-langchain.openAi",
          {"resource": "chat", "modelId": {"value": "gpt-4o-mini"},
           "messages": {"values": [
               {"role": "system", "content": "In <80 words, what does this company do and what's one good opening question?"},
               {"role": "user", "content": "={{ $json.domain }}"}
           ]}}, 1.6),
         ("Slack brief", "n8n-nodes-base.slack",
          {"resource": "message", "operation": "post", "select": "user", "user": "USER_ID",
           "text": "=📋 In 2 hours: {{ $('Extract domain').first().json.event_title }}\\n\\n{{ $json.message.content }}"}, 2.2),
     ], ["starter", "calendar"]),

    ("05-starter-instagram-to-slack",
     "New social mention → Slack ping",
     "Polls Twitter/X (and optional Instagram) for new mentions of your brand → Slack ping with sentiment label so you can engage in real-time.",
     [
         ("Every 15 min", "n8n-nodes-base.scheduleTrigger",
          {"rule": {"interval": [{"field": "minutes", "minutesInterval": 15}]}}, 1.1),
         ("Twitter search", "n8n-nodes-base.twitter",
          {"resource": "tweet", "operation": "search", "searchText": "YourBrand",
           "additionalFields": {"resultType": "recent"}}, 2),
         ("AI sentiment", "@n8n/n8n-nodes-langchain.openAi",
          {"resource": "chat", "modelId": {"value": "gpt-4o-mini"},
           "messages": {"values": [
               {"role": "system", "content": "Score sentiment: positive/neutral/negative. Return only label."},
               {"role": "user", "content": "={{ $json.text }}"}
           ]}}, 1.6),
         ("Slack mention", "n8n-nodes-base.slack",
          {"resource": "message", "operation": "post", "channel": "#mentions",
           "text": "=🔔 [{{ $json.message.content }}] {{ $('Twitter search').first().json.user.screen_name }}: {{ $('Twitter search').first().json.text }}"}, 2.2),
     ], ["starter", "social", "pattern-5"]),

    ("06-starter-invoice-to-accountant",
     "Invoice email → forward + log to accounting sheet",
     "Vendor invoice arrives via email → AI extracts vendor + amount + due date → row appended to Accounting Log → original PDF auto-filed in Drive.",
     [
         ("Email trigger — INVOICES label", "n8n-nodes-base.gmailTrigger",
          {"pollTimes": {"item": [{"mode": "everyMinute"}]},
           "filters": {"labelIds": ["INVOICES"], "search": "has:attachment"}}, 1),
         ("AI extract", "@n8n/n8n-nodes-langchain.openAi",
          {"resource": "chat", "modelId": {"value": "gpt-4o"},
           "messages": {"values": [
               {"role": "system", "content": "From this invoice email, return JSON {vendor:string, amount:number, due_date:YYYY-MM-DD, currency:string}"},
               {"role": "user", "content": "=Subject: {{ $json.subject }}\\nBody: {{ $json.snippet }}"}
           ]}, "options": {"responseFormat": "json_object"}}, 1.6),
         ("Append accounting log", "n8n-nodes-base.googleSheets",
          {"resource": "sheet", "operation": "append", "documentId": "ACCOUNTING_SHEET_ID",
           "fieldsUi": {"fieldValues": [
               {"fieldId": "Date received", "fieldValue": "={{ $now.toISO() }}"},
               {"fieldId": "Vendor", "fieldValue": "={{ JSON.parse($json.message.content).vendor }}"},
               {"fieldId": "Amount", "fieldValue": "={{ JSON.parse($json.message.content).amount }}"},
               {"fieldId": "Due", "fieldValue": "={{ JSON.parse($json.message.content).due_date }}"}]}}, 4),
         ("File PDF in Drive", "n8n-nodes-base.googleDrive",
          {"resource": "file", "operation": "upload",
           "name": "=Invoice — {{ JSON.parse($('AI extract').first().json.message.content).vendor }}.pdf",
           "parents": ["INVOICES_FOLDER_ID"]}, 3),
     ], ["starter", "finance", "pattern-1"]),

    ("07-starter-website-form-to-crm",
     "Website form → simple CRM entry",
     "Form submission → AI extracts company + role from email signature → row appended to a Leads sheet (basic CRM). No HubSpot needed.",
     [
         ("Form webhook", "n8n-nodes-base.webhook",
          {"httpMethod": "POST", "path": "lead-form-simple"}, 1.1),
         ("AI extract company/role", "@n8n/n8n-nodes-langchain.openAi",
          {"resource": "chat", "modelId": {"value": "gpt-4o-mini"},
           "messages": {"values": [
               {"role": "system", "content": "Guess company name and likely role from this email address. Return JSON {company:string, likely_role:string}"},
               {"role": "user", "content": "={{ $json.email }}"}
           ]}, "options": {"responseFormat": "json_object"}}, 1.6),
         ("Append lead", "n8n-nodes-base.googleSheets",
          {"resource": "sheet", "operation": "append", "documentId": "LEADS_SHEET_ID",
           "fieldsUi": {"fieldValues": [
               {"fieldId": "Email", "fieldValue": "={{ $('Form webhook').first().json.email }}"},
               {"fieldId": "Name", "fieldValue": "={{ $('Form webhook').first().json.name }}"},
               {"fieldId": "Company", "fieldValue": "={{ JSON.parse($json.message.content).company }}"},
               {"fieldId": "Role guess", "fieldValue": "={{ JSON.parse($json.message.content).likely_role }}"},
               {"fieldId": "Status", "fieldValue": "New"},
               {"fieldId": "Date", "fieldValue": "={{ $now.toISO() }}"}]}}, 4),
         ("Slack new lead", "n8n-nodes-base.slack",
          {"resource": "message", "operation": "post", "channel": "#leads",
           "text": "=📝 New lead: {{ $('Form webhook').first().json.name }} ({{ JSON.parse($('AI extract company/role').first().json.message.content).company }})"}, 2.2),
     ], ["starter", "lead-capture", "pattern-1"]),

    ("08-starter-weekly-stripe-summary",
     "Weekly Stripe revenue summary",
     "Every Friday 17:00: aggregates this week's Stripe revenue + customer count + biggest sale → emails the founder a 4-line summary.",
     [
         ("Friday 17:00", "n8n-nodes-base.scheduleTrigger",
          {"rule": {"interval": [{"field": "cronExpression", "expression": "0 17 * * 5"}]}}, 1.1),
         ("Stripe — week's payments", "n8n-nodes-base.httpRequest",
          {"method": "GET",
           "url": "=https://api.stripe.com/v1/payment_intents?created[gte]={{ $now.minus(7,'days').toSeconds() }}&limit=100"}, 4.1),
         ("Aggregate", "n8n-nodes-base.code",
          {"language": "javaScript",
           "jsCode": "const ps = $input.first().json.data.filter(p=>p.status==='succeeded'); const total = ps.reduce((s,p)=>s+p.amount,0)/100; const biggest = ps.sort((a,b)=>b.amount-a.amount)[0]; return [{json:{count: ps.length, total, biggest_amount: biggest?.amount/100, biggest_customer: biggest?.receipt_email}}];"}, 2),
         ("Email founder", "n8n-nodes-base.gmail",
          {"resource": "message", "operation": "send", "to": "founder@yourdomain.com",
           "subject": "=Week: ${{ $json.total }} · {{ $json.count }} sales",
           "message": "=Total: ${{ $json.total }}\\nSales: {{ $json.count }}\\nBiggest: ${{ $json.biggest_amount }} from {{ $json.biggest_customer }}"}, 2.1),
     ], ["starter", "reporting", "pattern-4"]),

    ("09-starter-nps-pulse",
     "30-day NPS pulse — single-question email",
     "30 days after every Stripe customer is created, send them a 1-question NPS email. Responses logged in a Sheet.",
     [
         ("Stripe new customer", "n8n-nodes-base.stripeTrigger",
          {"events": ["customer.created"]}, 1),
         ("Wait 30 days", "n8n-nodes-base.wait",
          {"resume": "timeInterval", "amount": 30, "unit": "days"}, 1.1),
         ("Send NPS email", "n8n-nodes-base.gmail",
          {"resource": "message", "operation": "send",
           "to": "={{ $('Stripe new customer').first().json.email }}",
           "subject": "Quick — 1 question",
           "message": "=Hi {{ $('Stripe new customer').first().json.name || 'there' }},\\n\\n30 days in. On 0-10, how likely are you to recommend us to a peer?\\n\\nReply with just the number.\\n\\nThanks — Srijan"}, 2.1),
     ], ["starter", "feedback", "pattern-7"]),

    ("10-starter-meta-automation-monitor",
     "Meta-automation — daily health check on your other workflows",
     "Every morning 7am: queries n8n API for executions of all your workflows in the past 24h → flags any with >5% failure rate → Slack ping. The starter version of automation-monitoring.",
     [
         ("Daily 7am", "n8n-nodes-base.scheduleTrigger",
          {"rule": {"interval": [{"field": "cronExpression", "expression": "0 7 * * *"}]}}, 1.1),
         ("List executions", "n8n-nodes-base.httpRequest",
          {"method": "GET",
           "url": "=https://yourdomain.app.n8n.cloud/api/v1/executions?limit=200"}, 4.1),
         ("Aggregate per workflow", "n8n-nodes-base.code",
          {"language": "javaScript",
           "jsCode": "const all = $input.first().json.data; const cut = Date.now() - 24*60*60*1000; const recent = all.filter(e => new Date(e.startedAt).getTime() > cut); const byWf = {}; for (const e of recent) { byWf[e.workflowId] = byWf[e.workflowId] || {total:0, failed:0, name: e.workflowName}; byWf[e.workflowId].total++; if (e.finished === false || e.status === 'error') byWf[e.workflowId].failed++; } const flagged = Object.values(byWf).filter(w => w.total>0 && (w.failed/w.total)>0.05); return [{json: {total_workflows: Object.keys(byWf).length, flagged}}];"}, 2),
         ("Slack health digest", "n8n-nodes-base.slack",
          {"resource": "message", "operation": "post", "channel": "#automations-log",
           "text": "=🩺 Daily automation health · {{ $json.total_workflows }} workflows ran in 24h\\n{{ $json.flagged.length === 0 ? '✅ All healthy' : '⚠️ Flagged:\\n' + $json.flagged.map(w => `• ${w.name}: ${w.failed}/${w.total} failed`).join('\\n') }}"}, 2.2),
     ], ["starter", "meta-monitoring", "pattern-4"]),
]


for fname, title, desc, nodes_spec, tags in starter_specs:
    nodes = []
    for i, (n_name, n_type, n_params, n_ver) in enumerate(nodes_spec):
        nodes.append(node(n_name, n_type, n_params, (240 + i * 200, 300), n_ver))
    conns = chain(*[n["name"] for n in nodes]) if len(nodes) > 1 else {}
    STARTER.append((fname, title, desc, workflow(
        f"Aiprosol Starter — {title}", desc, nodes, conns, tags=tags
    )))


# ═══════════════════════════════════════════════════════════════════════
# WRITE FILES
# ═══════════════════════════════════════════════════════════════════════

def write_set(workflows, out_dir, set_name):
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    manifest = []
    for filename, title, description, wf in workflows:
        path = out / f"{filename}.json"
        with open(path, "w") as f:
            json.dump(wf, f, indent=2, ensure_ascii=False)
        manifest.append({
            "file": f"{filename}.json", "title": title, "description": description,
            "nodes": len(wf["nodes"]), "tags": [t["name"] for t in wf["tags"]],
        })
    with open(out / "_index.json", "w") as f:
        json.dump({"version": "1.0", "set": set_name, "count": len(manifest), "workflows": manifest}, f, indent=2)
    # README
    lines = [f"# Aiprosol — {set_name} n8n Workflow Templates", "",
             f"Version 1.0 · {len(manifest)} workflows · © 2026 Aiprosol Ltd", "",
             "## How to use", "",
             "1. **Import a workflow:** n8n → Workflows → Import from File.",
             "2. **Set credentials:** placeholder credentials need to be replaced with your own.",
             "3. **Replace placeholder IDs:** look for `*_SHEET_ID`, `*_FOLDER_ID`, `USER_ID` etc.",
             "4. **Test before going live** — Phase 1 (output for review) for 2 weeks first.",
             "", "## Workflows", ""]
    for i, m in enumerate(manifest, 1):
        lines.append(f"### {i}. {m['title']}")
        lines.append(f"- File: `{m['file']}` ({m['nodes']} nodes) · Tags: {', '.join(m['tags'])}")
        lines.append(f"- {m['description']}")
        lines.append("")
    with open(out / "README.md", "w") as f:
        f.write("\n".join(lines))
    print(f"✓ {set_name}: {len(manifest)} workflows → {out}")


write_set(LEADGEN,
          "/Users/user/Airprosol/products catalogue/01-ready-to-sell/playbooks/127-lead-generation-automation-playbook/delivery/n8n-workflows",
          "Lead Generation Automation")
write_set(STARTER,
          "/Users/user/Airprosol/products catalogue/01-ready-to-sell/toolkits/097-global-business-automation-starter-pack/delivery/n8n-workflows",
          "Global Business Starter Pack")
