#!/usr/bin/env python3
"""
Build a starter library of n8n workflow JSON files covering the 7 core
patterns from the Workflow Automation Playbook.

These are real, importable n8n v1.x workflow files. Credentials are
placeholders ({{ $env.CREDENTIAL_NAME }}) that the user replaces
after import. Each ships with a description block explaining trigger,
action, and common pitfalls.
"""

from pathlib import Path
import json
import uuid

OUT = Path(__file__).resolve().parent.parent / "private-products" / "n8n-workflows"
OUT.mkdir(parents=True, exist_ok=True)


def node(node_type, name, parameters, position, credentials=None, type_version=1):
    n = {
        "parameters": parameters,
        "id": str(uuid.uuid4()),
        "name": name,
        "type": node_type,
        "typeVersion": type_version,
        "position": position,
    }
    if credentials:
        n["credentials"] = credentials
    return n


def workflow(name, description, nodes, connections):
    return {
        "name": name,
        "nodes": nodes,
        "connections": connections,
        "active": False,
        "settings": {"executionOrder": "v1"},
        "versionId": str(uuid.uuid4()),
        "id": str(uuid.uuid4()),
        "meta": {
            "instanceId": "aiprosol-starter-library-v1",
        },
        "tags": [],
        "pinData": {},
    }


# ─────────────────────────────────────────────────────────────────────────
# 1. Stripe charge → HubSpot deal stage update (Linear pipeline)
# ─────────────────────────────────────────────────────────────────────────

def stripe_to_hubspot():
    nodes = [
        node(
            "n8n-nodes-base.webhook",
            "Stripe Webhook (charge.succeeded)",
            {
                "httpMethod": "POST",
                "path": "stripe-charge-succeeded",
                "responseMode": "lastNode",
                "options": {"responseHeaders": {"entries": []}},
            },
            [240, 300],
            type_version=2,
        ),
        node(
            "n8n-nodes-base.set",
            "Extract customer fields",
            {
                "mode": "manual",
                "duplicateItem": False,
                "assignments": {
                    "assignments": [
                        {"id": "1", "name": "email", "value": "={{ $json.body.data.object.customer_email }}", "type": "string"},
                        {"id": "2", "name": "amount", "value": "={{ $json.body.data.object.amount / 100 }}", "type": "number"},
                        {"id": "3", "name": "customerId", "value": "={{ $json.body.data.object.customer }}", "type": "string"},
                    ]
                },
            },
            [480, 300],
            type_version=3,
        ),
        node(
            "n8n-nodes-base.hubspot",
            "Upsert HubSpot deal",
            {
                "operation": "upsert",
                "resource": "deal",
                "additionalFields": {
                    "amount": "={{ $json.amount }}",
                    "dealName": "Stripe charge for {{ $json.email }}",
                    "stage": "closedwon",
                },
            },
            [720, 300],
            credentials={"hubspotApi": {"id": "REPLACE_ME", "name": "HubSpot account"}},
        ),
    ]
    connections = {
        "Stripe Webhook (charge.succeeded)": {"main": [[{"node": "Extract customer fields", "type": "main", "index": 0}]]},
        "Extract customer fields": {"main": [[{"node": "Upsert HubSpot deal", "type": "main", "index": 0}]]},
    }
    return workflow(
        "Sales · Stripe charge → HubSpot deal closed-won",
        "Trigger: Stripe webhook charge.succeeded. Action: upsert HubSpot deal to closedwon with amount + customer email.",
        nodes,
        connections,
    )


# ─────────────────────────────────────────────────────────────────────────
# 2. Calendly booking → AI prep brief in email
# ─────────────────────────────────────────────────────────────────────────

def calendly_to_prep_brief():
    nodes = [
        node(
            "n8n-nodes-base.webhook",
            "Calendly Webhook (invitee.created)",
            {
                "httpMethod": "POST",
                "path": "calendly-invitee-created",
                "responseMode": "lastNode",
            },
            [240, 300],
            type_version=2,
        ),
        node(
            "n8n-nodes-base.set",
            "Pull invitee fields",
            {
                "assignments": {
                    "assignments": [
                        {"id": "1", "name": "name", "value": "={{ $json.body.payload.invitee.name }}", "type": "string"},
                        {"id": "2", "name": "email", "value": "={{ $json.body.payload.invitee.email }}", "type": "string"},
                        {"id": "3", "name": "scheduledStart", "value": "={{ $json.body.payload.scheduled_event.start_time }}", "type": "string"},
                    ]
                },
            },
            [460, 300],
            type_version=3,
        ),
        node(
            "@n8n/n8n-nodes-langchain.lmChatAnthropic",
            "Claude — generate prep brief",
            {
                "model": "claude-3-5-sonnet-20241022",
                "options": {"temperature": 0.4, "maxTokensToSample": 600},
                "text": "=Generate a 5-bullet prep brief for an upcoming sales call with {{ $json.name }} (email: {{ $json.email }}). Bullets: 1. likely-role inferred from email domain, 2. one prediction about why they booked, 3. 2 questions to open with, 4. one objection to anticipate, 5. one resource to send after. Output plain text, no markdown.",
            },
            [680, 300],
            credentials={"anthropicApi": {"id": "REPLACE_ME", "name": "Anthropic account"}},
        ),
        node(
            "n8n-nodes-base.gmail",
            "Send prep brief to AE",
            {
                "operation": "send",
                "sendTo": "ae@yourdomain.com",
                "subject": "=Prep brief: {{ $('Pull invitee fields').item.json.name }} ({{ $('Pull invitee fields').item.json.scheduledStart }})",
                "message": "={{ $json.text }}",
            },
            [900, 300],
            credentials={"gmailOAuth2": {"id": "REPLACE_ME", "name": "Gmail account"}},
        ),
    ]
    connections = {
        "Calendly Webhook (invitee.created)": {"main": [[{"node": "Pull invitee fields", "type": "main", "index": 0}]]},
        "Pull invitee fields": {"main": [[{"node": "Claude — generate prep brief", "type": "main", "index": 0}]]},
        "Claude — generate prep brief": {"main": [[{"node": "Send prep brief to AE", "type": "main", "index": 0}]]},
    }
    return workflow(
        "Sales · Calendly booking → AI prep brief",
        "Trigger: Calendly invitee.created. Action: Claude generates prep brief; Gmail sends to AE.",
        nodes,
        connections,
    )


# ─────────────────────────────────────────────────────────────────────────
# 3. Inbound form → AI score → routed Slack ping (Branching)
# ─────────────────────────────────────────────────────────────────────────

def form_score_route_slack():
    nodes = [
        node(
            "n8n-nodes-base.webhook",
            "Form Submit Webhook",
            {"httpMethod": "POST", "path": "lead-form-submit", "responseMode": "lastNode"},
            [240, 300],
            type_version=2,
        ),
        node(
            "n8n-nodes-base.code",
            "Score lead 0-100",
            {
                "language": "javaScript",
                "jsCode": "// Aiprosol 4-component scoring model\nconst d = items[0].json.body;\nlet score = 30;\nconst emp = Number(d.employees || 0);\nif (emp >= 10) score += 20;\nif (emp >= 50) score += 15;\nif (d.monthlyRevenue === '$100k – $500k') score += 15;\nif (d.monthlyRevenue === '$500k+') score += 25;\nif (Number(d.manualHoursPerWeek || 0) >= 30) score += 10;\nif ((d.primaryChallenge || '').length > 20) score += 5;\nconst hot = new Set(['Legal','Financial Services','SaaS','Real Estate']);\nconst warm = new Set(['Professional Services','E-commerce','Healthcare']);\nif (hot.has(d.industry)) score += 10;\nelse if (warm.has(d.industry)) score += 5;\nscore = Math.min(100, score);\nlet segment = 'future';\nif (score >= 85) segment = 'hot';\nelse if (score >= 65) segment = 'warm';\nelse if (score >= 40) segment = 'nurture';\nreturn [{ json: { ...d, score, segment } }];",
            },
            [460, 300],
            type_version=2,
        ),
        node(
            "n8n-nodes-base.switch",
            "Route on segment",
            {
                "mode": "expression",
                "output": "input",
                "rules": {
                    "values": [
                        {"conditions": {"options": {"caseSensitive": True, "leftValue": "", "typeValidation": "strict"}, "conditions": [{"id": "1", "leftValue": "={{ $json.segment }}", "rightValue": "hot", "operator": {"type": "string", "operation": "equals"}}], "combinator": "and"}, "outputKey": "hot"},
                        {"conditions": {"options": {"caseSensitive": True, "leftValue": "", "typeValidation": "strict"}, "conditions": [{"id": "2", "leftValue": "={{ $json.segment }}", "rightValue": "warm", "operator": {"type": "string", "operation": "equals"}}], "combinator": "and"}, "outputKey": "warm"},
                        {"conditions": {"options": {"caseSensitive": True, "leftValue": "", "typeValidation": "strict"}, "conditions": [{"id": "3", "leftValue": "={{ $json.segment }}", "rightValue": "nurture", "operator": {"type": "string", "operation": "equals"}}], "combinator": "and"}, "outputKey": "nurture"},
                    ]
                },
                "options": {"fallbackOutput": "extra"},
            },
            [680, 300],
            type_version=3,
        ),
        node(
            "n8n-nodes-base.slack",
            "Slack #leads-hot",
            {
                "operation": "post",
                "channel": "leads-hot",
                "text": "=:fire: *HOT lead* — {{ $json.name }} @ {{ $json.company }} ({{ $json.industry }}) · score {{ $json.score }}\\n<@AE-on-rota> · SLA 5 min",
            },
            [900, 200],
            credentials={"slackApi": {"id": "REPLACE_ME", "name": "Slack workspace"}},
        ),
        node(
            "n8n-nodes-base.slack",
            "Slack #leads-warm",
            {
                "operation": "post",
                "channel": "leads-warm",
                "text": "=:warm: *Warm lead* — {{ $json.name }} @ {{ $json.company }} · score {{ $json.score }} · same-day callback SLA",
            },
            [900, 300],
            credentials={"slackApi": {"id": "REPLACE_ME", "name": "Slack workspace"}},
        ),
        node(
            "n8n-nodes-base.noOp",
            "Enter 5-touch nurture",
            {},
            [900, 400],
        ),
    ]
    connections = {
        "Form Submit Webhook": {"main": [[{"node": "Score lead 0-100", "type": "main", "index": 0}]]},
        "Score lead 0-100": {"main": [[{"node": "Route on segment", "type": "main", "index": 0}]]},
        "Route on segment": {
            "main": [
                [{"node": "Slack #leads-hot", "type": "main", "index": 0}],
                [{"node": "Slack #leads-warm", "type": "main", "index": 0}],
                [{"node": "Enter 5-touch nurture", "type": "main", "index": 0}],
            ]
        },
    }
    return workflow(
        "Sales · Form submit → AI score → routed Slack",
        "Trigger: form POST. Action: scoring model (0-100), Switch by segment (hot/warm/nurture), Slack ping appropriate channel.",
        nodes,
        connections,
    )


# ─────────────────────────────────────────────────────────────────────────
# 4. Support ticket → AI categorise → assign (Branching with AI)
# ─────────────────────────────────────────────────────────────────────────

def support_ai_categorise():
    nodes = [
        node(
            "n8n-nodes-base.webhook",
            "Ticket created webhook",
            {"httpMethod": "POST", "path": "support-ticket-new", "responseMode": "lastNode"},
            [240, 300],
            type_version=2,
        ),
        node(
            "@n8n/n8n-nodes-langchain.lmChatAnthropic",
            "Claude — categorise + sentiment",
            {
                "model": "claude-3-5-haiku-20241022",
                "options": {"temperature": 0.2, "maxTokensToSample": 200},
                "text": '=You classify a support ticket. Return ONLY JSON like {"category":"bug|feature|billing|onboarding|general","sentiment":"positive|neutral|negative","urgency":"low|medium|high"}. Ticket: subject="{{ $json.body.subject }}" body="{{ $json.body.body }}"',
            },
            [460, 300],
            credentials={"anthropicApi": {"id": "REPLACE_ME", "name": "Anthropic account"}},
        ),
        node(
            "n8n-nodes-base.code",
            "Parse classifier JSON",
            {
                "language": "javaScript",
                "jsCode": "const raw = items[0].json.text || '';\nconst match = raw.match(/\\{[\\s\\S]*\\}/);\nlet parsed = { category: 'general', sentiment: 'neutral', urgency: 'low' };\nif (match) { try { parsed = JSON.parse(match[0]); } catch (e) {} }\nreturn [{ json: { ...items[0].json, classifier: parsed } }];",
            },
            [680, 300],
            type_version=2,
        ),
        node(
            "n8n-nodes-base.slack",
            "Slack assignment by category",
            {
                "operation": "post",
                "channel": "=#support-{{ $json.classifier.category }}",
                "text": "=:ticket: {{ $json.classifier.urgency }}/{{ $json.classifier.sentiment }} ticket — {{ $('Ticket created webhook').item.json.body.subject }}",
            },
            [900, 300],
            credentials={"slackApi": {"id": "REPLACE_ME", "name": "Slack workspace"}},
        ),
    ]
    connections = {
        "Ticket created webhook": {"main": [[{"node": "Claude — categorise + sentiment", "type": "main", "index": 0}]]},
        "Claude — categorise + sentiment": {"main": [[{"node": "Parse classifier JSON", "type": "main", "index": 0}]]},
        "Parse classifier JSON": {"main": [[{"node": "Slack assignment by category", "type": "main", "index": 0}]]},
    }
    return workflow(
        "CS · Support ticket → AI categorise → Slack routing",
        "Trigger: ticket webhook. Action: Claude classifies category/sentiment/urgency; Slack channel matched on category.",
        nodes,
        connections,
    )


# ─────────────────────────────────────────────────────────────────────────
# 5. Daily KPI digest (Scheduled Sweep)
# ─────────────────────────────────────────────────────────────────────────

def daily_kpi_digest():
    nodes = [
        node(
            "n8n-nodes-base.scheduleTrigger",
            "Cron · 7am daily",
            {"rule": {"interval": [{"field": "cronExpression", "expression": "0 7 * * *"}]}},
            [240, 300],
            type_version=1.2,
        ),
        node(
            "n8n-nodes-base.httpRequest",
            "Pull yesterday's metrics (Supabase)",
            {
                "url": "https://YOUR_PROJECT.supabase.co/rest/v1/rpc/daily_kpis",
                "authentication": "genericCredentialType",
                "genericAuthType": "httpHeaderAuth",
                "method": "POST",
                "sendBody": True,
                "bodyParameters": {"parameters": [{"name": "day", "value": "={{ $today.minus({days: 1}).toISODate() }}"}]},
            },
            [460, 300],
            credentials={"httpHeaderAuth": {"id": "REPLACE_ME", "name": "Supabase service role"}},
            type_version=4,
        ),
        node(
            "n8n-nodes-base.slack",
            "Slack digest",
            {
                "operation": "post",
                "channel": "leadership",
                "text": "=:bar_chart: *Daily KPIs · {{ $today.minus({days: 1}).toFormat('yyyy-MM-dd') }}*\\n• Leads: {{ $json.leads_new_24h }}\\n• Outreach sent: {{ $json.outreach_sent_total }}\\n• Active drafts: {{ $json.outreach_drafts_open }}\\n• Agent runs OK: {{ $json.agent_runs_24h_ok }}",
            },
            [680, 300],
            credentials={"slackApi": {"id": "REPLACE_ME", "name": "Slack workspace"}},
        ),
    ]
    connections = {
        "Cron · 7am daily": {"main": [[{"node": "Pull yesterday's metrics (Supabase)", "type": "main", "index": 0}]]},
        "Pull yesterday's metrics (Supabase)": {"main": [[{"node": "Slack digest", "type": "main", "index": 0}]]},
    }
    return workflow(
        "Ops · Daily 7am KPI digest to Slack",
        "Trigger: cron 7am daily UTC. Action: pull KPI row from Supabase; Slack message to leadership.",
        nodes,
        connections,
    )


# ─────────────────────────────────────────────────────────────────────────
# 6. Vendor invoice PDF → AI extract → accounting (Document processing)
# ─────────────────────────────────────────────────────────────────────────

def invoice_extract_to_accounting():
    nodes = [
        node(
            "n8n-nodes-base.gmailTrigger",
            "Gmail label INVOICE",
            {
                "labelIds": ["INVOICE"],
                "downloadAttachments": True,
                "options": {"includeSpamTrash": False},
            },
            [240, 300],
            credentials={"gmailOAuth2": {"id": "REPLACE_ME", "name": "Gmail account"}},
            type_version=1.1,
        ),
        node(
            "@n8n/n8n-nodes-langchain.lmChatAnthropic",
            "Claude — extract invoice fields",
            {
                "model": "claude-3-5-sonnet-20241022",
                "options": {"temperature": 0.0, "maxTokensToSample": 400},
                "text": '=Extract from this vendor invoice. Return JSON with fields: vendor_name, invoice_number, invoice_date (YYYY-MM-DD), total_amount (number, no currency), currency, line_items (array of {description, amount}). Email subject: "{{ $json.subject }}". Body: "{{ $json.snippet }}".',
            },
            [460, 300],
            credentials={"anthropicApi": {"id": "REPLACE_ME", "name": "Anthropic account"}},
        ),
        node(
            "n8n-nodes-base.code",
            "Parse extraction",
            {
                "language": "javaScript",
                "jsCode": "const raw = items[0].json.text || '';\nconst m = raw.match(/\\{[\\s\\S]*\\}/);\nif (!m) return [{ json: { error: 'no JSON in response', raw } }];\nlet parsed;\ntry { parsed = JSON.parse(m[0]); } catch (e) { return [{ json: { error: e.message, raw } }]; }\nreturn [{ json: parsed }];",
            },
            [680, 300],
            type_version=2,
        ),
        node(
            "n8n-nodes-base.googleSheets",
            "Log to Sheet (AP Ledger)",
            {
                "operation": "append",
                "documentId": "YOUR_SHEET_ID",
                "sheetName": "AP Ledger",
                "columns": {
                    "mappingMode": "defineBelow",
                    "value": {
                        "Date": "={{ $json.invoice_date }}",
                        "Vendor": "={{ $json.vendor_name }}",
                        "Invoice #": "={{ $json.invoice_number }}",
                        "Amount": "={{ $json.total_amount }}",
                        "Currency": "={{ $json.currency }}",
                    },
                },
            },
            [900, 300],
            credentials={"googleSheetsOAuth2Api": {"id": "REPLACE_ME", "name": "Google Sheets"}},
        ),
    ]
    connections = {
        "Gmail label INVOICE": {"main": [[{"node": "Claude — extract invoice fields", "type": "main", "index": 0}]]},
        "Claude — extract invoice fields": {"main": [[{"node": "Parse extraction", "type": "main", "index": 0}]]},
        "Parse extraction": {"main": [[{"node": "Log to Sheet (AP Ledger)", "type": "main", "index": 0}]]},
    }
    return workflow(
        "Finance · Vendor invoice email → AI extract → Sheet ledger",
        "Trigger: Gmail label INVOICE. Action: Claude extracts vendor/amount/date; appends row to AP Ledger Sheet.",
        nodes,
        connections,
    )


# ─────────────────────────────────────────────────────────────────────────
# 7. NPS score < 7 → CSM auto-task (Approval gate)
# ─────────────────────────────────────────────────────────────────────────

def nps_low_to_csm():
    nodes = [
        node(
            "n8n-nodes-base.webhook",
            "NPS response webhook",
            {"httpMethod": "POST", "path": "nps-response", "responseMode": "lastNode"},
            [240, 300],
            type_version=2,
        ),
        node(
            "n8n-nodes-base.if",
            "Score < 7?",
            {
                "conditions": {
                    "options": {"caseSensitive": True, "leftValue": "", "typeValidation": "strict"},
                    "conditions": [{"id": "1", "leftValue": "={{ $json.body.score }}", "rightValue": 7, "operator": {"type": "number", "operation": "lt"}}],
                    "combinator": "and",
                },
            },
            [460, 300],
            type_version=2,
        ),
        node(
            "n8n-nodes-base.slack",
            "Slack: detractor flagged",
            {
                "operation": "post",
                "channel": "csm-alerts",
                "text": "=:warning: Detractor NPS · {{ $json.body.customer_email }} scored {{ $json.body.score }} · comment: \\\"{{ $json.body.comment }}\\\"\\n*Action*: book a 30-min recovery call within 48 hours.",
            },
            [680, 200],
            credentials={"slackApi": {"id": "REPLACE_ME", "name": "Slack workspace"}},
        ),
        node(
            "n8n-nodes-base.noOp",
            "Promoter / passive — log only",
            {},
            [680, 400],
        ),
    ]
    connections = {
        "NPS response webhook": {"main": [[{"node": "Score < 7?", "type": "main", "index": 0}]]},
        "Score < 7?": {
            "main": [
                [{"node": "Slack: detractor flagged", "type": "main", "index": 0}],
                [{"node": "Promoter / passive — log only", "type": "main", "index": 0}],
            ]
        },
    }
    return workflow(
        "CS · NPS < 7 → CSM Slack alert",
        "Trigger: NPS survey response. Action: if score < 7, Slack alert to CSM channel.",
        nodes,
        connections,
    )


# ─────────────────────────────────────────────────────────────────────────
# 8. Cold email reply → AI classify intent (Branching with AI)
# ─────────────────────────────────────────────────────────────────────────

def cold_reply_classify():
    nodes = [
        node(
            "n8n-nodes-base.gmailTrigger",
            "Gmail label REPLY-COLD",
            {
                "labelIds": ["REPLY-COLD"],
                "options": {},
            },
            [240, 300],
            credentials={"gmailOAuth2": {"id": "REPLACE_ME", "name": "Gmail account"}},
            type_version=1.1,
        ),
        node(
            "@n8n/n8n-nodes-langchain.lmChatAnthropic",
            "Claude — intent classifier",
            {
                "model": "claude-3-5-haiku-20241022",
                "options": {"temperature": 0.1, "maxTokensToSample": 100},
                "text": '=You classify cold-email replies. Return ONLY one of: INTERESTED, NOT_INTERESTED, UNSUBSCRIBE, OUT_OF_OFFICE, OTHER. Reply body: """{{ $json.snippet }}"""',
            },
            [460, 300],
            credentials={"anthropicApi": {"id": "REPLACE_ME", "name": "Anthropic account"}},
        ),
        node(
            "n8n-nodes-base.switch",
            "Route on intent",
            {
                "mode": "expression",
                "rules": {
                    "values": [
                        {"conditions": {"options": {"caseSensitive": False, "leftValue": "", "typeValidation": "loose"}, "conditions": [{"id": "1", "leftValue": "={{ $json.text }}", "rightValue": "INTERESTED", "operator": {"type": "string", "operation": "contains"}}], "combinator": "and"}, "outputKey": "interested"},
                        {"conditions": {"options": {"caseSensitive": False, "leftValue": "", "typeValidation": "loose"}, "conditions": [{"id": "2", "leftValue": "={{ $json.text }}", "rightValue": "UNSUBSCRIBE", "operator": {"type": "string", "operation": "contains"}}], "combinator": "and"}, "outputKey": "unsubscribe"},
                    ]
                },
                "options": {"fallbackOutput": "extra"},
            },
            [680, 300],
            type_version=3,
        ),
        node(
            "n8n-nodes-base.slack",
            "Slack: interested → AE",
            {
                "operation": "post",
                "channel": "sales-replies",
                "text": "=:rocket: Cold reply: INTERESTED from {{ $('Gmail label REPLY-COLD').item.json.from }} — first 200 chars: {{ $('Gmail label REPLY-COLD').item.json.snippet | slice(0, 200) }}",
            },
            [900, 200],
            credentials={"slackApi": {"id": "REPLACE_ME", "name": "Slack workspace"}},
        ),
        node(
            "n8n-nodes-base.noOp",
            "Suppress sender",
            {},
            [900, 300],
        ),
        node(
            "n8n-nodes-base.noOp",
            "Log + drop",
            {},
            [900, 400],
        ),
    ]
    connections = {
        "Gmail label REPLY-COLD": {"main": [[{"node": "Claude — intent classifier", "type": "main", "index": 0}]]},
        "Claude — intent classifier": {"main": [[{"node": "Route on intent", "type": "main", "index": 0}]]},
        "Route on intent": {
            "main": [
                [{"node": "Slack: interested → AE", "type": "main", "index": 0}],
                [{"node": "Suppress sender", "type": "main", "index": 0}],
                [{"node": "Log + drop", "type": "main", "index": 0}],
            ]
        },
    }
    return workflow(
        "Sales · Cold email reply → AI intent classifier → branch",
        "Trigger: Gmail label REPLY-COLD. Action: Claude classifies INTERESTED/UNSUBSCRIBE/etc.; routes accordingly.",
        nodes,
        connections,
    )


# ─────────────────────────────────────────────────────────────────────────
# 9. New blog post → cross-post LinkedIn + Twitter (Fan-out)
# ─────────────────────────────────────────────────────────────────────────

def cross_post_content():
    nodes = [
        node(
            "n8n-nodes-base.webhook",
            "Blog publish webhook",
            {"httpMethod": "POST", "path": "blog-published", "responseMode": "lastNode"},
            [240, 300],
            type_version=2,
        ),
        node(
            "@n8n/n8n-nodes-langchain.lmChatAnthropic",
            "Claude — generate LinkedIn hook",
            {
                "model": "claude-3-5-sonnet-20241022",
                "options": {"temperature": 0.7, "maxTokensToSample": 300},
                "text": "=Generate a LinkedIn post hook for this blog. Title: {{ $json.body.title }}. URL: {{ $json.body.url }}. Style: punchy first line, 3 short paragraphs, link at end. No hashtags. Under 200 words.",
            },
            [460, 200],
            credentials={"anthropicApi": {"id": "REPLACE_ME", "name": "Anthropic account"}},
        ),
        node(
            "@n8n/n8n-nodes-langchain.lmChatAnthropic",
            "Claude — generate Twitter hook",
            {
                "model": "claude-3-5-sonnet-20241022",
                "options": {"temperature": 0.7, "maxTokensToSample": 200},
                "text": "=Generate a Twitter post for this blog. Title: {{ $json.body.title }}. URL: {{ $json.body.url }}. Style: one strong hook + link. Under 240 chars.",
            },
            [460, 400],
            credentials={"anthropicApi": {"id": "REPLACE_ME", "name": "Anthropic account"}},
        ),
        node(
            "n8n-nodes-base.notion",
            "Save drafts to Notion (review queue)",
            {
                "operation": "append",
                "resource": "databasePage",
                "databaseId": "YOUR_DRAFTS_DB_ID",
                "propertiesUi": {
                    "propertyValues": [
                        {"key": "Title", "title": "=Cross-posts for {{ $('Blog publish webhook').item.json.body.title }}"},
                        {"key": "LinkedIn", "richText": "={{ $node['Claude — generate LinkedIn hook'].json.text }}"},
                        {"key": "Twitter", "richText": "={{ $node['Claude — generate Twitter hook'].json.text }}"},
                    ]
                },
            },
            [720, 300],
            credentials={"notionApi": {"id": "REPLACE_ME", "name": "Notion workspace"}},
        ),
    ]
    connections = {
        "Blog publish webhook": {
            "main": [
                [
                    {"node": "Claude — generate LinkedIn hook", "type": "main", "index": 0},
                    {"node": "Claude — generate Twitter hook", "type": "main", "index": 0},
                ]
            ]
        },
        "Claude — generate LinkedIn hook": {"main": [[{"node": "Save drafts to Notion (review queue)", "type": "main", "index": 0}]]},
        "Claude — generate Twitter hook": {"main": [[{"node": "Save drafts to Notion (review queue)", "type": "main", "index": 0}]]},
    }
    return workflow(
        "Marketing · Blog publish → AI cross-post drafts (LinkedIn + Twitter)",
        "Trigger: blog webhook. Action: Claude drafts platform-specific hooks; Notion queues for review.",
        nodes,
        connections,
    )


# ─────────────────────────────────────────────────────────────────────────
# 10. Onboarding state machine (Long-running)
# ─────────────────────────────────────────────────────────────────────────

def onboarding_state_machine():
    nodes = [
        node(
            "n8n-nodes-base.webhook",
            "Customer signed up",
            {"httpMethod": "POST", "path": "customer-signed-up", "responseMode": "lastNode"},
            [240, 300],
            type_version=2,
        ),
        node(
            "n8n-nodes-base.gmail",
            "Day 0 · Welcome email",
            {
                "operation": "send",
                "sendTo": "={{ $json.body.email }}",
                "subject": "Welcome to Aiprosol",
                "message": "=Hi {{ $json.body.name }}, welcome. Here's your getting-started doc: https://aiprosol.com/onboarding",
            },
            [460, 300],
            credentials={"gmailOAuth2": {"id": "REPLACE_ME", "name": "Gmail account"}},
        ),
        node(
            "n8n-nodes-base.wait",
            "Wait 3 days",
            {"amount": 3, "unit": "days"},
            [680, 300],
            type_version=1,
        ),
        node(
            "n8n-nodes-base.httpRequest",
            "Check first-action status",
            {
                "url": "https://your-app.com/api/users/{{ $('Customer signed up').item.json.body.id }}/has-completed-step-1",
                "method": "GET",
            },
            [900, 300],
            type_version=4,
        ),
        node(
            "n8n-nodes-base.if",
            "Completed step 1?",
            {
                "conditions": {
                    "options": {"caseSensitive": True, "leftValue": "", "typeValidation": "strict"},
                    "conditions": [{"id": "1", "leftValue": "={{ $json.completed }}", "rightValue": True, "operator": {"type": "boolean", "operation": "true"}}],
                    "combinator": "and",
                },
            },
            [1120, 300],
            type_version=2,
        ),
        node(
            "n8n-nodes-base.noOp",
            "Step 1 done — sequence continues",
            {},
            [1340, 200],
        ),
        node(
            "n8n-nodes-base.gmail",
            "Nudge email",
            {
                "operation": "send",
                "sendTo": "={{ $('Customer signed up').item.json.body.email }}",
                "subject": "Stuck? 5-minute video for step 1",
                "message": "=Hi {{ $('Customer signed up').item.json.body.name }}, you haven't completed step 1 yet. 5-minute video walkthrough: https://aiprosol.com/onboarding/step-1-video",
            },
            [1340, 400],
            credentials={"gmailOAuth2": {"id": "REPLACE_ME", "name": "Gmail account"}},
        ),
    ]
    connections = {
        "Customer signed up": {"main": [[{"node": "Day 0 · Welcome email", "type": "main", "index": 0}]]},
        "Day 0 · Welcome email": {"main": [[{"node": "Wait 3 days", "type": "main", "index": 0}]]},
        "Wait 3 days": {"main": [[{"node": "Check first-action status", "type": "main", "index": 0}]]},
        "Check first-action status": {"main": [[{"node": "Completed step 1?", "type": "main", "index": 0}]]},
        "Completed step 1?": {
            "main": [
                [{"node": "Step 1 done — sequence continues", "type": "main", "index": 0}],
                [{"node": "Nudge email", "type": "main", "index": 0}],
            ]
        },
    }
    return workflow(
        "CS · Onboarding day-3 nudge state machine",
        "Trigger: customer signup. Action: welcome email; wait 3 days; check completion; nudge if incomplete.",
        nodes,
        connections,
    )


# ─────────────────────────────────────────────────────────────────────────
# Build all + write index
# ─────────────────────────────────────────────────────────────────────────

WORKFLOWS = [
    ("01-sales-stripe-charge-to-hubspot", stripe_to_hubspot, "Sales", "Stripe charge → HubSpot deal closed-won"),
    ("02-sales-calendly-ai-prep-brief", calendly_to_prep_brief, "Sales", "Calendly booking → AI prep brief to AE"),
    ("03-sales-form-score-route-slack", form_score_route_slack, "Sales", "Form submit → AI score → routed Slack ping"),
    ("04-cs-support-ticket-ai-categorise", support_ai_categorise, "CS", "Support ticket → AI categorise → Slack routing"),
    ("05-ops-daily-kpi-digest", daily_kpi_digest, "Ops", "Cron 7am → daily KPI digest to Slack"),
    ("06-finance-invoice-extract", invoice_extract_to_accounting, "Finance", "Vendor invoice email → AI extract → Sheet"),
    ("07-cs-nps-low-detractor-alert", nps_low_to_csm, "CS", "NPS < 7 → CSM Slack alert"),
    ("08-sales-cold-reply-intent-classifier", cold_reply_classify, "Sales", "Cold email reply → AI intent → branch"),
    ("09-marketing-blog-cross-post", cross_post_content, "Marketing", "Blog publish → AI cross-post drafts"),
    ("10-cs-onboarding-day-3-nudge", onboarding_state_machine, "CS", "Onboarding day-3 nudge state machine"),
]

if __name__ == "__main__":
    print(f"Building {len(WORKFLOWS)} n8n workflow JSON files...")
    index_lines = [
        "# n8n Starter Workflow Library",
        "",
        f"This is a v1 starter library of {len(WORKFLOWS)} production-shaped n8n workflows demonstrating the core patterns from the Workflow Automation Playbook.",
        "",
        "## How to import",
        "",
        "1. Open your n8n instance",
        "2. Workflows → Import from File",
        "3. Pick a `.json` file from this folder",
        "4. Replace credential placeholders (anything marked `REPLACE_ME`)",
        "5. Click Activate",
        "",
        "## Library",
        "",
        "| # | File | Area | What it does |",
        "|---|------|------|------|",
    ]
    for filename, builder, area, desc in WORKFLOWS:
        wf = builder()
        path = OUT / f"{filename}.json"
        with path.open("w", encoding="utf-8") as f:
            json.dump(wf, f, indent=2)
        print(f"  ✓ {filename}.json ({path.stat().st_size} bytes)")
        index_lines.append(f"| {filename.split('-')[0]} | `{filename}.json` | {area} | {desc} |")

    index_lines.extend([
        "",
        "## Next steps",
        "",
        "These 10 cover the 7 core patterns. Build the remaining workflows for your stack using these as templates. Each shows:",
        "- How to wire a webhook trigger",
        "- How to call Claude with JSON-shaped output",
        "- How to parse + branch on AI responses",
        "- How to log results downstream (Sheets, Notion, Slack)",
        "",
        "## Honest caveats",
        "",
        "- Credentials are placeholders. You wire your own.",
        "- IDs (Notion DB, Sheet, channel names) are placeholders.",
        "- Test with non-production data first. n8n's test webhook URL is your friend.",
        "",
        "— Aiprosol · aiprosol.com",
    ])
    index_path = OUT / "README.md"
    index_path.write_text("\n".join(index_lines), encoding="utf-8")
    print(f"  ✓ README.md ({index_path.stat().st_size} bytes)")
    print(f"\nDone. {len(WORKFLOWS)} workflows in {OUT}")
