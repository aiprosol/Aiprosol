#!/usr/bin/env python3
"""
Fill products.json with:
1. longDescription + features + whatsInside for the 4 pre-order bundles
2. whatsInside bullets for the 15 sellable products (lifted from delivery folders + features)

Idempotent: only writes fields that are missing.
"""
import json
from pathlib import Path

ROOT = Path("/Users/user/Airprosol/web")
PRODUCTS_JSON = ROOT / "src/content/products.json"

# ───────────────────────────────────────────────────────────
# Pre-order bundle content (4 products marked available:false)
# ───────────────────────────────────────────────────────────
PRE_ORDER_CONTENT = {
    "the-agency-launch-bundle": {
        "longDescription": (
            "Everything you need to white-label automation services for your clients — repackaged from the exact "
            "architecture Aiprosol uses on managed engagements. Includes the proposal templates, scope-of-work boilerplate, "
            "the SOW pricing calculator we use to size projects, the implementation runbooks for the 7 most common "
            "agency engagements (lead-gen, ops-automation, AI-onboarding, etc.), and the client-handoff checklist that "
            "ships every project with documentation strong enough to support without your team. Ships Q3 2026."
        ),
        "features": [
            "11 client-facing proposal templates (lead-gen, ops, customer success, finance, agency-of-record retainers)",
            "Pricing calculator: SOW sizing model based on scope × complexity × industry premium",
            "Implementation runbooks for the 7 most-common agency engagements (full step-by-step from kickoff to handoff)",
            "Client-handoff checklist + SOP set (everything a junior implementer needs to maintain the build)",
            "White-label brand kit (deck templates, email signatures, contract boilerplate)",
            "Sales playbook: discovery questions, qualifying matrix, common objections + answers",
            "Includes the Workflow Automation Playbook + Lead Generation Automation Playbook (so your team has a single source of truth)"
        ],
        "whatsInside": [
            "11 proposal templates (Word + Google Docs)",
            "SOW pricing calculator (XLSX)",
            "7 implementation runbooks (PDF + Markdown)",
            "Client-handoff checklist + ops SOPs",
            "White-label deck templates (Keynote + Google Slides)",
            "Sales playbook: discovery, qualifying, objection-handling scripts",
            "Bundled: Workflow Automation Playbook + Lead Generation Automation Playbook"
        ]
    },
    "the-complete-vault": {
        "longDescription": (
            "Every Aiprosol digital product, bundled. The Starter Bundle, the Playbook Pack, the AI Tools Vault, the Pitch Deck, "
            "the ROI Calculator, the Audit Checklist, the 30-Day Challenge, the Comparison Guide, the Lead Gen Playbook, the "
            "Prompt Vault, the Zapier+Make Bundle, the Architecture Masterclass, the Enterprise Readiness Kit, the Agency Starter "
            "Pack, the Stack Starter Kit, the Workflow Playbook — plus quarterly refreshes for 12 months. The single click that "
            "gives you the entire Aiprosol stack at less than half the standalone total. Ships Q3 2026."
        ),
        "features": [
            "All 18 standalone products included (total standalone value: $2,381)",
            "Bundle price: $997 — saves $1,384 vs buying separately",
            "Lifetime access to everything currently in the vault",
            "Quarterly refresh updates for 12 months — new prompts, new tools, new n8n workflows auto-delivered",
            "Single download bundle (one ZIP) + individual product downloads for selective use",
            "Private Slack channel for vault holders (the highest tier of buyer support)",
            "First access to every new product before public launch (founder pricing)",
            "Includes the Architecture Masterclass video series ($297 standalone) + Agency Starter Pack ($497 standalone)"
        ],
        "whatsInside": [
            "All 18 standalone Aiprosol products (toolkits, templates, playbooks, guides, challenges, masterclass)",
            "1,008 ChatGPT business prompts (Prompt Vault) + 545 AI tools (Tools Vault + Comparison Guide)",
            "65+ importable n8n workflows (Playbook Pack + Starter Pack + Stack Kit)",
            "50 fully-detailed Zapier + Make recipes",
            "30 day-by-day implementation recipes (Automation Challenge)",
            "Enterprise readiness scorecard + RFP + 90-day plan (Enterprise Kit)",
            "Quarterly refresh deliveries auto-emailed for 12 months",
            "Private vault-holder Slack + first-access to new products"
        ]
    },
    "ai-workflow-architecture-masterclass": {
        "longDescription": (
            "5-hour video masterclass on how to architect AI workflows that survive production. Built for engineers, ops leads, "
            "and senior automation architects. Covers state management for long-running flows, idempotency, retry semantics, "
            "rate-limit handling, observability, the cost economics of LLM-in-the-loop flows, and the 7 architectural patterns "
            "that handle 95% of real-world AI workflow problems. Includes a 40-page worksheet bundle and 10 reference "
            "architectures diagrammed in Mermaid + Excalidraw. Ships Q3 2026."
        ),
        "features": [
            "5 hours of structured video (10 modules of ~30 min each) — production-quality, edited, captioned",
            "Module 1-2: Foundations — state, idempotency, retries, observability",
            "Module 3-4: The 7 patterns — Linear, Branching, Fan-out, Scheduled, Polling, Approval, Long-running",
            "Module 5-6: AI-in-the-loop — prompt-versioning, eval harnesses, fallback hierarchies, cost ceilings",
            "Module 7-8: Production ops — monitoring, alerting, rollback, secrets management",
            "Module 9-10: Cost & scaling — LLM cost economics, the build/buy/service framework",
            "40-page worksheet bundle (printable PDF) + 10 reference Mermaid architectures",
            "Office hours: monthly group Q&A for 6 months",
            "Bonus: real failure-mode case studies (anonymised from real Aiprosol engagements)"
        ],
        "whatsInside": [
            "5-hour video course (10 modules × 30 min, captioned, MP4 + streaming)",
            "40-page worksheet bundle (printable PDF)",
            "10 reference architectures diagrammed in Mermaid + Excalidraw",
            "Production checklist (47 items) for every workflow you ship",
            "6 months of monthly group office hours",
            "Real failure-mode case studies from anonymised client engagements",
            "Cost-economics spreadsheet for LLM-in-the-loop workflows",
            "Private Slack channel for masterclass alumni"
        ]
    },
    "the-ai-automation-agency-starter-pack": {
        "longDescription": (
            "The complete operations stack for someone launching their own AI automation agency. Everything Aiprosol learned "
            "scaling from zero to consulting engagements, packaged. Includes the client discovery playbook, the proposal/SOW "
            "templates, the pricing calculators, the project SOPs, the client portal templates, the team onboarding kit, "
            "the financial model spreadsheet, and the marketing playbook (positioning, niche selection, content strategy, "
            "outreach scripts). Built for solo founders launching their first engagement, scaling to a 3-5 person team. Ships Q3 2026."
        ),
        "features": [
            "Discovery playbook: 47-question intake, qualifying matrix, scope-sizing model",
            "Proposal + SOW templates (Word + Google Docs) for 7 engagement types",
            "Pricing calculators: fixed-fee, T&M, retainer, success-fee — pick what fits the client",
            "Project SOPs: kickoff → discovery → build → handoff (covering the full lifecycle)",
            "Financial model spreadsheet: P&L projection, capacity model, hiring trigger thresholds",
            "Marketing playbook: positioning canvas, niche selection framework, content calendar, outreach scripts",
            "Team onboarding kit: hiring guide, first-30-days curriculum, training materials",
            "Includes the Agency Launch Bundle (everything your team needs to deliver projects) + a 60-min strategy call credit"
        ],
        "whatsInside": [
            "Discovery playbook (47-question intake + qualifying matrix)",
            "Proposal + SOW templates for 7 engagement types",
            "Pricing calculators (fixed-fee, T&M, retainer, success-fee)",
            "Project SOPs: kickoff → discovery → build → handoff",
            "Financial model spreadsheet (P&L, capacity, hiring triggers)",
            "Marketing playbook: positioning, niche, content, outreach scripts",
            "Team onboarding kit (hiring guide + first-30-days + training)",
            "60-min strategy call credit with Aiprosol founder",
            "Bundled: the Agency Launch Bundle (delivery toolkit)"
        ]
    }
}

# ───────────────────────────────────────────────────────────
# whatsInside bullets for the 15 sellable products
# Derived from delivery folder contents + features
# ───────────────────────────────────────────────────────────
WHATS_INSIDE = {
    "the-starter-bundle": [
        "1. Automation ROI Pitch Deck Template (25-slide PowerPoint)",
        "2. Business Process Audit Checklist (50-question interactive HTML)",
        "3. AI Automation ROI Calculator (XLSX with 22 inputs + live formulas)",
        "Recommended sequence: Audit → Calculator → Pitch Deck (24 hours total)",
        "Bundle saves $22 vs buying separately ($101 total)"
    ],
    "the-playbook-pack": [
        "1. Workflow Automation Playbook + 25 importable n8n workflows",
        "2. Lead Generation Automation Playbook + 12 importable n8n workflows",
        "3. 30-Day Business Automation Challenge + 10 starter n8n workflows",
        "47 total importable n8n workflows in one library",
        "200+ pages of operator-grade content",
        "Bundle saves $74 vs buying separately ($271 total)"
    ],
    "the-ai-tools-vault": [
        "545+ AI tools curated by Aiprosol",
        "23 categories covered (conversational AI, code gen, image, video, voice, RAG, no-code, etc.)",
        "20 Hidden Gems with rationale",
        "15 Avoid Listings with when-not-to-use rationale",
        "CSV + JSON format for spreadsheet + programmatic use",
        "ChatGPT Business Prompt Vault (1,008 prompts) included",
        "Quarterly auto-emailed updates for 12 months"
    ],
    "automation-roi-pitch-deck-template": [
        "25-slide PowerPoint template (cover, problem, savings, payback, 3 case studies, etc.)",
        "Aiprosol dark-violet brand theme (re-skin in 10 minutes)",
        "Speaker notes on every slide with the 2 hardest questions + answers",
        "{{Variable}} placeholders for Company, Revenue, Headcount, Cost, Savings, Payback",
        "5 pre-formatted case-study slides",
        "PowerPoint + Keynote + Google Slides compatible"
    ],
    "business-process-audit-checklist": [
        "Interactive HTML checklist (open in any browser, auto-score, export results)",
        "50 questions across 5 dimensions (10 each): People, Process, Data, Tools, Outcomes",
        "Auto-scoring with visual bars + tier badges per dimension",
        "Maps each highest-scoring dimension to the matching Aiprosol product",
        "JSON export for sharing or quarter-over-quarter comparison",
        "12 common findings reference with recommended automation pattern",
        "1-page Opportunity Map template (stakeholder-ready)"
    ],
    "30-day-business-automation-challenge": [
        "30 daily 15-25 minute recipes with success criteria + pitfalls",
        "Week 1: Foundation (control panel, Stripe log, Gmail classifier, CRM auto-create)",
        "Week 2: Sales + Customer (attribution, no-show prevention, follow-ups, renewals)",
        "Week 3: Operations (invoices, expenses, content, action items, weekly review)",
        "Week 4: Compounding (research, feedback, monitoring, hiring, annual review)",
        "25 importable n8n workflow JSON files from the Workflow Playbook (starter library)",
        "Private Slack channel for participants"
    ],
    "ai-tools-master-comparison-guide-2026": [
        "545 AI tools rated and compared",
        "23 categories covered (Conversational AI, Code, Image, Video, Voice, RAG, etc.)",
        "Per-tool fields: pricing floor, pricing model, integrations, free tier, verdict, gotchas",
        "CSV format (spreadsheet manipulation) + JSON (programmatic use)",
        "2026 trend notes: emerging, plateauing, consolidating segments",
        "HTML viewer for quick browse",
        "Quarterly refreshes through 2026"
    ],
    "lead-generation-automation-playbook": [
        "12 importable n8n workflows (capture → score → route → nurture → convert)",
        "4-component lead scoring model with point allocations (FIT 40 + INTENT 30 + ENGAGEMENT 20 + URGENCY 10)",
        "5-touch nurture email sequence with subjects + body + send timing",
        "Routing decision tree + 5-min SLA infrastructure",
        "Weekly closed-loop iteration system",
        "Dashboard spec with leading + lagging indicators",
        "Whole stack runs on $50-$100/month at SMB scale"
    ],
    "chatgpt-business-prompt-vault": [
        "1,008 production-tested prompts in JSON + Markdown format",
        "Sales (~250): outreach, follow-ups, objections, LinkedIn, call prep, proposals",
        "Marketing (~200): campaigns, subject lines, landing pages, ads, content, SEO",
        "Operations (~200): SOPs, meetings, status, decisions, hiring, vendor mgmt",
        "Finance (~130) · People/HR (~165) · Product/Eng (~165) · CS (~130) · Personal (~50)",
        "Structured JSON: id, category, subcategory, title, system, user_template, best_model, notes",
        "Quarterly additions for 12 months"
    ],
    "zapier-make-power-user-bundle": [
        "25 fully-detailed Zapier recipes (Stripe → CRM, Calendly → prep brief, Form → AI score, etc.)",
        "25 fully-detailed Make.com recipes (iterators, aggregators, data stores)",
        "22-row Zapier vs Make decision matrix",
        "14-pattern operator's playbook (dedupe, idempotency, soft-fail, rate-limit handling)",
        "When to skip both and use n8n instead",
        "50 ready-to-import workflow files"
    ],
    "enterprise-ai-readiness-assessment-kit": [
        "Readiness Scorecard XLSX (120 questions × 12 dimensions, auto-aggregating, with chart)",
        "Vendor Selection RFP DOCX (40-criteria grid + 10-item contract red-flag checklist)",
        "90-Day Implementation Plan PPTX (14 slides covering Phase 0 → Phase 2)",
        "Built for orgs with 100-5,000 employees · $10M-$500M revenue",
        "30-minute scoring-call credit with the Aiprosol team (redeem within 90 days)"
    ],
    "ai-tools-stack-starter-kit": [
        "18 importable n8n integration workflows",
        "Sample integrations: Slack→OpenAI→Notion, Gmail→Claude→Calendar, Stripe→LLM→CS",
        "Recommended stack: 14 tools across 7 categories with verdict per pick",
        "Budget calculator spreadsheet (monthly cost based on volume)",
        "Migration playbook (integrate with existing Zapier/Make/n8n, alongside Salesforce/HubSpot)",
        "Built for 10-50 person businesses"
    ],
    "workflow-automation-playbook": [
        "7 core patterns documented (Linear, Branching, Fan-out, Scheduled, Polling, Approval, Long-running)",
        "5 anti-patterns to avoid (Stack of band-aids, Mystery monolith, Set-and-forget, AI-as-trigger, Silent automation)",
        "25 importable n8n workflow JSON files (Sales 5 · CS 5 · Ops 5 · Finance 5 · Marketing 5)",
        "Operator's checklist: 23 questions to ask before shipping",
        "Migration map: manual process → automated workflow in 6 steps",
        "Build vs buy vs service decision framework",
        "Quarterly health-check questions"
    ],
    "ai-automation-roi-calculator": [
        "4 sheets: Inputs · Calculations · 12-Month Projection · Output (1-page)",
        "22 input cells (yellow-highlighted) with notes column",
        "Live formulas: hours saved, $ saved, payback months, 12-month NPV at 8% discount, ROI multiple",
        "Adoption ramp curve modelling (Month 1-3, 3-6, 6+)",
        "Auto-updating cumulative cash flow line chart",
        "1-page output worksheet (print/screenshot for execs)",
        "Worked example using a real Aiprosol case study"
    ]
}


def main():
    data = json.loads(PRODUCTS_JSON.read_text())
    updated = 0
    added_long = 0
    added_features = 0
    added_inside = 0

    for prod in data:
        slug = prod["slug"]
        changed = False

        # Pre-order content
        if slug in PRE_ORDER_CONTENT:
            content = PRE_ORDER_CONTENT[slug]
            if not prod.get("longDescription"):
                prod["longDescription"] = content["longDescription"]
                added_long += 1
                changed = True
            if not prod.get("features"):
                prod["features"] = content["features"]
                added_features += 1
                changed = True
            if not prod.get("whatsInside"):
                prod["whatsInside"] = content["whatsInside"]
                added_inside += 1
                changed = True

        # whatsInside for sellable products
        if slug in WHATS_INSIDE and not prod.get("whatsInside"):
            prod["whatsInside"] = WHATS_INSIDE[slug]
            added_inside += 1
            changed = True

        if changed:
            updated += 1
            print(f"  ✓ {slug}")

    PRODUCTS_JSON.write_text(json.dumps(data, indent=2) + "\n")
    print(f"\n{updated} products updated:")
    print(f"  longDescription added: {added_long}")
    print(f"  features added:        {added_features}")
    print(f"  whatsInside added:     {added_inside}")


if __name__ == "__main__":
    main()
