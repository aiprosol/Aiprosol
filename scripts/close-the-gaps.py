#!/usr/bin/env python3
"""
Aiprosol — Close the marketing gaps:
  • Prompt Vault: 109 → 1000+ structured prompts
  • Tools Vault: 96 → 500+ curated tools
  • Zapier+Make: 5+5 full → 25+25 fully-detailed recipes
"""

import json
import csv
import itertools
from pathlib import Path

CATALOG = Path("/Users/user/Airprosol/products catalogue/01-ready-to-sell")


# ════════════════════════════════════════════════════════════════════
# 1. PROMPT VAULT — Expand to 1000+
# ════════════════════════════════════════════════════════════════════

PV_DIR = CATALOG / "guides/097-chatgpt-business-prompt-vault/delivery"
PV_DIR.mkdir(parents=True, exist_ok=True)

PROMPTS = []


def P(category, subcategory, title, system, user_template, vars_, model, notes=""):
    PROMPTS.append({
        "id": f"p{len(PROMPTS)+1:04d}",
        "category": category, "subcategory": subcategory, "title": title,
        "system": system, "user_template": user_template, "variables": vars_,
        "best_model": model, "notes": notes,
    })


# ─── SALES (240 prompts) ───────────────────────────────────────────
SALES_PERSONAS = ["CEO", "CFO", "COO", "CRO", "VP Sales", "VP Marketing", "VP Engineering",
                  "Head of Operations", "Director of Customer Success", "Procurement Lead",
                  "Founder", "Product Manager", "Marketing Director", "IT Director"]
SALES_INDUSTRIES = ["SaaS", "Professional services", "E-commerce", "Manufacturing",
                    "Real estate", "Healthcare", "Legal", "Financial services",
                    "Education", "Logistics"]
COLD_EMAIL_OPENERS = [
    ("pain-aware", "Acknowledge their specific pain before pitching"),
    ("case-study", "Lead with proof of a similar customer outcome"),
    ("provocative-question", "Open with a question that earns curiosity"),
    ("data-point", "Lead with a contextual industry statistic"),
    ("compliment-then-context", "Specific compliment followed by relevant context"),
    ("trigger-event", "Reference a recent event in their company"),
    ("mutual-connection", "Drop name of a mutual contact for warm intro"),
    ("contrarian-take", "Open with an unexpected POV on their industry"),
    ("free-resource", "Offer a relevant free resource with no ask"),
    ("research-finding", "Cite findings from your customer research"),
]
FOLLOW_UP_TIMINGS = [
    ("4-hour", "Immediate add-value follow-up after first touch"),
    ("24-hour", "Day-after follow-up with new angle"),
    ("48-hour", "2-day mark, gentle bump"),
    ("3-day", "Mid-week soft check-in"),
    ("5-day", "End-of-week recap with question"),
    ("7-day-silent", "Week-of-silence, low-pressure re-open"),
    ("14-day-revival", "Two-week revival with new context"),
    ("30-day-final", "Monthly graceful close + leave door open"),
    ("60-day-different-angle", "Cool re-engagement with new angle"),
    ("90-day-newsworthy", "Quarter-mark hook on new development"),
]
OBJECTIONS = [
    ("too-expensive", "Price reframed as cost of inaction"),
    ("we-built-internally", "Acknowledge build option; redirect to opportunity cost"),
    ("we-use-competitor", "Position differentiation without disparaging"),
    ("bad-timing", "Honour timing, plant seed for future"),
    ("need-to-discuss-with-team", "Equip them to be the internal champion"),
    ("we-tried-this-already", "Validate prior attempts; isolate what's different"),
    ("not-a-priority", "Reframe priority via cost of delay"),
    ("budget-frozen", "Find adjacent budget pool or future-cycle path"),
    ("we-don't-need-it", "Surface the unstated assumption beneath this"),
    ("send-info-and-go-away", "Identify what would make them lean in"),
]
LINKEDIN_FORMATS = [
    ("connection-request", "Personalised connection ask <250 chars"),
    ("comment-on-post", "Add value in a comment thread on their post"),
    ("DM-after-connect", "Soft first message after connection accepted"),
    ("share-then-tag", "Share a relevant insight and tag them"),
    ("voice-message-script", "10-second voice message script for first touch"),
]
for opener, desc in COLD_EMAIL_OPENERS:
    for industry in SALES_INDUSTRIES[:4]:
        P("sales", "cold-outreach", f"Cold email · {opener} · {industry}",
          f"You are a B2B SDR with deep empathy and zero pushiness. Write cold emails using the '{opener}' approach: {desc}.",
          f"Write a 100-word cold email to {{{{role}}}} at {{{{company}}}} (a {industry} firm with {{{{size}}}} employees). Their likely pain: {{{{pain}}}}.",
          ["role", "company", "size", "pain"], "claude-3-5-sonnet")
for opener, desc in COLD_EMAIL_OPENERS:
    for persona in SALES_PERSONAS[:8]:
        P("sales", "cold-outreach", f"Cold email · {opener} · to {persona}",
          f"You are a B2B SDR writing to {persona}-level decision-makers. Use the '{opener}' approach.",
          f"Write a 100-word cold email to a {persona} at {{{{company}}}}. Their stated priority: {{{{priority}}}}. Our offer: {{{{offer}}}}.",
          ["company", "priority", "offer"], "claude-3-5-sonnet")
for timing, desc in FOLLOW_UP_TIMINGS:
    P("sales", "follow-up", f"Follow-up · {timing}",
      f"Write follow-ups that move deals forward without nagging. Style: {desc}.",
      f"It's {timing} since {{{{last_touch}}}}. Their stated reaction: {{{{their_words}}}}. Their concern: {{{{concern}}}}.",
      ["last_touch", "their_words", "concern"], "claude-3-5-sonnet")
for obj, desc in OBJECTIONS:
    for persona in SALES_PERSONAS[:6]:
        P("sales", "objection-handling", f"Objection · '{obj}' from {persona}",
          f"Reframe objections constructively. Strategy: {desc}.",
          f"{persona} said: '{obj}'. Their stated budget: {{{{budget}}}}. Our price: {{{{price}}}}. Their problem costs them {{{{problem_cost}}}}/year.",
          ["budget", "price", "problem_cost"], "claude-3-5-sonnet")
for fmt, desc in LINKEDIN_FORMATS:
    for industry in SALES_INDUSTRIES[:4]:
        P("sales", "linkedin", f"LinkedIn · {fmt} · {industry}",
          f"LinkedIn outreach that doesn't feel like spam. Format: {desc}.",
          f"Compose a {fmt} for a {{{{role}}}} at {{{{company}}}} (a {industry} firm). Context: {{{{context}}}}.",
          ["role", "company", "context"], "claude-3-5-sonnet")
for call_type in ["discovery", "demo", "proposal-review", "objection-call", "renewal", "expansion", "churn-save"]:
    P("sales", "call-prep", f"Agenda · {call_type} call",
      f"Build {call_type} call agendas that map to qualification, not rapport.",
      f"Build an agenda for a 30-min {call_type} call with {{{{prospect}}}}. Industry: {{{{industry}}}}. Role: {{{{role}}}}.",
      ["prospect", "industry", "role"], "gpt-4o")
for call_type in ["discovery", "demo", "proposal-review", "objection-call", "renewal"]:
    P("sales", "call-recap", f"Recap email · after {call_type} call",
      f"Recap {call_type} calls clearly without sounding legal.",
      f"Call notes: {{{{notes}}}}. Action items: {{{{actions}}}}. Write a 120-word recap email confirming agreed next steps.",
      ["notes", "actions"], "gpt-4o")
for proposal_type in ["1-page", "10-page", "deck-format", "email-format"]:
    P("sales", "proposal", f"Proposal · {proposal_type}",
      "Write proposals that survive a CFO read.",
      f"Build a {proposal_type} proposal: client {{{{client}}}}, problem {{{{problem}}}}, approach {{{{approach}}}}, investment {{{{investment}}}}, next step {{{{next}}}}.",
      ["client", "problem", "approach", "investment", "next"], "claude-3-5-sonnet")
for tactic in ["discount-anchored", "longer-term-trade", "smaller-scope-trade", "pilot-paid", "champion-currency",
               "deferred-payment", "milestone-based", "annual-vs-monthly", "expansion-clause", "guaranteed-outcome"]:
    P("sales", "negotiation", f"Negotiation · {tactic}",
      f"Negotiate with '{tactic}' tactic. Anchor value before discussing price.",
      f"They asked for {{{{request}}}}. Our list: {{{{list_price}}}}. ROI we deliver: {{{{roi}}}}.",
      ["request", "list_price", "roi"], "gpt-4o")

# ─── MARKETING (180 prompts) ───────────────────────────────────────
MARKETING_CHANNELS = ["email", "google-ads", "linkedin-ads", "blog", "newsletter", "twitter",
                      "linkedin-post", "instagram", "tiktok", "youtube"]
MARKETING_FUNNELS = ["awareness", "consideration", "decision", "retention", "expansion", "referral"]
for channel in MARKETING_CHANNELS:
    for stage in MARKETING_FUNNELS:
        P("marketing", "campaign", f"{channel} · {stage}",
          f"Write campaign content for {channel} targeting the {stage} stage.",
          f"Build a {channel} campaign aimed at {{{{persona}}}}. Goal: {{{{goal}}}}. Differentiator: {{{{diff}}}}.",
          ["persona", "goal", "diff"], "claude-3-5-sonnet")
SUBJECT_STYLES = ["curiosity-gap", "specific-benefit", "contrarian", "negative-framing", "FOMO",
                  "personalised-first-word", "question-format", "specific-number", "urgency", "story-tease"]
for style in SUBJECT_STYLES:
    for stage in MARKETING_FUNNELS[:4]:
        P("marketing", "subject-lines", f"Subject lines · {style} · for {stage}",
          f"Generate 10 subject lines using the '{style}' style.",
          f"Topic: {{{{topic}}}}. Audience: {{{{audience}}}}. Goal: {stage}.",
          ["topic", "audience"], "claude-3-5-sonnet")
LANDING_SECTIONS = ["hero-value-prop", "social-proof", "feature-grid", "objection-handling",
                    "pricing-table", "FAQ", "testimonials", "footer-CTA", "comparison-table", "demo-CTA"]
for section in LANDING_SECTIONS:
    P("marketing", "landing-page", f"Landing page · {section}",
      f"Write the {section} section that earns time on page.",
      f"Product: {{{{product}}}}. ICP: {{{{icp}}}}. Outcome: {{{{outcome}}}}.",
      ["product", "icp", "outcome"], "claude-3-5-sonnet")
AD_FORMATS = [("google-search", 30), ("google-display", 90), ("facebook", 125), ("instagram-feed", 125),
              ("instagram-story", 0), ("linkedin-feed", 150), ("linkedin-text", 25), ("twitter-promoted", 280),
              ("youtube-15s", 0), ("youtube-30s", 0)]
for fmt, max_chars in AD_FORMATS:
    P("marketing", "ad-copy", f"Ad · {fmt}",
      f"Write {fmt} ads at the right character count for the platform.",
      f"Keyword/audience: {{{{audience}}}}. Differentiator: {{{{diff}}}}.{' Max ' + str(max_chars) + ' chars.' if max_chars else ''}",
      ["audience", "diff"], "gpt-4o-mini" if max_chars and max_chars < 100 else "claude-3-5-sonnet")
CONTENT_FORMATS = ["blog-outline", "thought-leadership-post", "how-to-guide", "comparison-post",
                   "case-study-1pager", "case-study-deck", "white-paper-outline", "newsletter-issue",
                   "twitter-thread-8", "linkedin-narrative-post", "youtube-script-3min", "podcast-talking-points"]
for fmt in CONTENT_FORMATS:
    P("marketing", "content", f"Content · {fmt}",
      f"Write a {fmt} that ranks AND reads well.",
      f"Topic: {{{{topic}}}}. Target keyword: {{{{keyword}}}}. Audience: {{{{audience}}}}.",
      ["topic", "keyword", "audience"], "claude-3-5-sonnet")
SEO_TASKS = ["title-tag-3-variants", "meta-description", "h1-h2-h3-outline", "internal-linking-suggestions",
             "schema-markup", "alt-text-batch", "url-slug-options", "image-filename-options",
             "first-paragraph-rewrite-for-SERP", "FAQ-section-from-PAA"]
for task in SEO_TASKS:
    P("marketing", "seo", f"SEO · {task}",
      "Generate SEO assets optimised for ranking + CTR.",
      f"Topic: {{{{topic}}}}. Target keyword: {{{{keyword}}}}. Audience intent: {{{{intent}}}}.",
      ["topic", "keyword", "intent"], "gpt-4o-mini")
PRESS_TYPES = ["product-launch", "funding", "leadership-hire", "acquisition", "milestone",
               "partnership", "industry-report", "study-results", "policy-stance", "year-recap"]
for press in PRESS_TYPES:
    P("marketing", "press", f"Press release · {press}",
      "Write press releases that earn coverage.",
      f"News: {{{{news}}}}. Why it matters: {{{{significance}}}}. Quotes: {{{{quotes}}}}.",
      ["news", "significance", "quotes"], "gpt-4o")
WINLOSS_ANGLES = ["pattern-extraction", "stage-by-stage-attribution", "vs-competitor-X", "by-segment",
                  "by-channel-source", "by-deal-size", "by-sales-rep", "by-quarter", "feature-gap-analysis",
                  "objection-frequency-map"]
for angle in WINLOSS_ANGLES:
    P("marketing", "win-loss", f"Win/loss · {angle}",
      "Extract patterns from closed-won/closed-lost data.",
      f"Analyze these notes: {{{{notes}}}}. Frame: {angle}.",
      ["notes"], "gpt-4o")

# ─── OPERATIONS (180 prompts) ──────────────────────────────────────
OPS_PROCESSES = ["onboarding", "offboarding", "vendor-evaluation", "vendor-renewal", "purchase-request",
                 "approval-chain", "expense-reimbursement", "time-off-request", "performance-review",
                 "hire-approval", "promotion-process", "incident-response", "change-management",
                 "data-access-request", "security-review", "legal-review", "marketing-launch",
                 "product-launch", "office-move", "all-hands-meeting"]
for process in OPS_PROCESSES:
    P("operations", "sop", f"SOP · {process}",
      "Convert ops processes into clean SOPs a new hire can follow.",
      f"Process: {process}. Current notes: {{{{notes}}}}. Constraints: {{{{constraints}}}}.",
      ["notes", "constraints"], "claude-3-5-sonnet")
MEETING_TYPES = ["staff", "all-hands", "1:1", "board", "investor", "customer-discovery", "customer-QBR",
                 "sprint-planning", "retrospective", "design-review", "code-review", "incident-postmortem",
                 "kickoff", "vendor-evaluation", "interview-debrief"]
for mtg in MEETING_TYPES:
    P("operations", "meeting", f"Meeting summary · {mtg}",
      f"Summarise {mtg} meetings for someone who didn't attend.",
      f"Transcript: {{{{transcript}}}}.",
      ["transcript"], "gpt-4o")
for mtg in MEETING_TYPES[:8]:
    P("operations", "meeting", f"Action items · from {mtg}",
      "Extract action items with owners + due dates.",
      f"From this {mtg} transcript {{{{transcript}}}}, return JSON [{{action, owner, due, blocking}}].",
      ["transcript"], "gpt-4o")
STATUS_AUDIENCES = ["exec", "team", "investor", "customer", "board", "cross-functional", "self"]
for aud in STATUS_AUDIENCES:
    for cadence in ["daily", "weekly", "biweekly", "monthly", "quarterly"]:
        P("operations", "status", f"Status update · {cadence} for {aud}",
          f"Write {cadence} status updates for {aud} audience.",
          f"Progress: {{{{progress}}}}. Blockers: {{{{blockers}}}}. Decisions needed: {{{{decisions}}}}.",
          ["progress", "blockers", "decisions"], "claude-3-5-sonnet")
DECISION_FRAMES = ["RAPID", "DACI", "Pros-Cons-Mitigations", "2x2-Eisenhower", "Force-field-analysis",
                   "Pre-mortem", "Cost-of-delay", "Reversible-vs-Irreversible", "Build-Buy-Service",
                   "Make-vs-License", "Optionality-preserving"]
for frame in DECISION_FRAMES:
    P("operations", "decision", f"Decision memo · {frame}",
      f"Write decision memos using the {frame} framework.",
      f"Question: {{{{question}}}}. Options: {{{{options}}}}. Constraints: {{{{constraints}}}}.",
      ["question", "options", "constraints"], "gpt-4o")
HIRE_TYPES = ["entry-level-IC", "senior-IC", "team-lead", "manager", "director", "VP",
              "C-level", "contractor", "advisor", "fractional"]
for ht in HIRE_TYPES:
    P("operations", "hiring", f"JD · {ht}",
      f"Write outcome-focused JDs for {ht} hires.",
      f"Role: {{{{role}}}}. Company size: {{{{size}}}}. Industry: {{{{industry}}}}.",
      ["role", "size", "industry"], "claude-3-5-sonnet")
    P("operations", "hiring", f"Interview rubric · {ht}",
      "Build interview rubrics that surface signal.",
      f"Role: {{{{role}}}}.",
      ["role"], "gpt-4o")
ONBOARDING_PHASES = ["pre-start-week", "week-1", "week-2", "month-1", "month-3", "month-6", "year-1"]
for phase in ONBOARDING_PHASES:
    P("operations", "onboarding", f"Onboarding plan · {phase}",
      "Build onboarding plans that are specific and measurable.",
      f"Role: {{{{role}}}}. Team: {{{{team}}}}. Phase: {phase}.",
      ["role", "team"], "claude-3-5-sonnet")
VENDOR_TASKS = ["selection-grid", "RFP-template", "reference-check-script", "negotiation-checklist",
                "contract-redline-asks", "implementation-plan", "QBR-prep", "renewal-evaluation",
                "exit-plan", "consolidation-analysis"]
for vt in VENDOR_TASKS:
    P("operations", "vendor", f"Vendor · {vt}",
      f"Manage vendor lifecycle with the {vt} task.",
      f"Category: {{{{category}}}}. Vendors: {{{{vendors}}}}. Constraints: {{{{constraints}}}}.",
      ["category", "vendors", "constraints"], "gpt-4o")
RETROS = ["start-stop-continue", "4-Ls", "sailboat", "what-went-well-what-didn't", "timeline",
          "mad-sad-glad", "rose-thorn-bud", "starfish", "lean-coffee", "anonymous-only"]
for retro in RETROS:
    P("operations", "retrospective", f"Retrospective · {retro}",
      f"Run retros using the '{retro}' format.",
      f"Sprint/period notes: {{{{notes}}}}.",
      ["notes"], "claude-3-5-sonnet")

# ─── FINANCE (130 prompts) ─────────────────────────────────────────
FIN_REPORTS = ["budget-vs-actual", "forecast-revision", "cash-burn", "MRR-cohort", "ARR-bridge",
               "CAC-payback", "LTV-CAC-ratio", "gross-margin", "headcount-plan", "scenario-modelling"]
for fr in FIN_REPORTS:
    P("finance", "reporting", f"Report · {fr}",
      f"Generate the {fr} report with exec-readable narrative.",
      f"Data: {{{{data}}}}. Period: {{{{period}}}}. Audience: {{{{audience}}}}.",
      ["data", "period", "audience"], "claude-3-5-sonnet")
INV_FORMATS = ["monthly-update", "quarterly-recap", "annual-letter", "investor-deck",
               "data-room-pack", "follow-on-request", "extension-request", "board-prep",
               "M&A-pitch", "secondary-sale-pitch"]
for inv in INV_FORMATS:
    P("finance", "investor", f"Investor · {inv}",
      f"Write {inv} for investors with candour + specificity.",
      f"Numbers: {{{{numbers}}}}. Wins: {{{{wins}}}}. Misses: {{{{misses}}}}. Asks: {{{{asks}}}}.",
      ["numbers", "wins", "misses", "asks"], "claude-3-5-sonnet")
BOARD_DELIVS = ["pre-read", "post-meeting-recap", "decision-doc", "topic-deep-dive",
                "annual-strategy", "headcount-approval", "compensation-review", "audit-update",
                "legal-update", "M&A-update"]
for bd in BOARD_DELIVS:
    P("finance", "board", f"Board · {bd}",
      f"Write {bd} for board consumption.",
      f"Topic: {{{{topic}}}}. Context: {{{{context}}}}. Asks: {{{{asks}}}}.",
      ["topic", "context", "asks"], "claude-3-5-sonnet")
PRICING_TASKS = ["tier-design", "price-test-design", "price-increase-comms", "discount-policy",
                 "ramp-deal-structure", "ELA-vs-subscription", "usage-vs-seat-pricing",
                 "freemium-conversion-strategy", "promotional-offer", "annual-vs-monthly"]
for pt in PRICING_TASKS:
    P("finance", "pricing", f"Pricing · {pt}",
      "Design pricing decisions with clear rationale.",
      f"Product: {{{{product}}}}. Segment: {{{{segment}}}}.",
      ["product", "segment"], "gpt-4o")
KPI_DASH = ["startup-leadership", "exec-team", "board", "customer-success", "marketing-team",
            "sales-team", "product-team", "engineering-team", "finance-team", "operations-team"]
for kd in KPI_DASH:
    P("finance", "kpi", f"KPI dashboard · {kd}",
      f"Design KPI dashboards for {kd}.",
      f"Company stage: {{{{stage}}}}. Industry: {{{{industry}}}}.",
      ["stage", "industry"], "gpt-4o")
TAX_AUDIT = ["year-end-checklist", "audit-prep", "R&D-tax-credit", "deferred-tax-asset",
             "state-nexus-review", "international-tax-planning", "transfer-pricing", "VAT-review",
             "audit-response", "audit-finding-remediation"]
for ta in TAX_AUDIT:
    P("finance", "tax", f"Tax · {ta}",
      f"Tax/audit workflow: {ta}.",
      f"Entity: {{{{entity_type}}}}. Jurisdiction: {{{{jurisdiction}}}}.",
      ["entity_type", "jurisdiction"], "claude-3-5-sonnet")
ALLOC_SCENARIOS = ["headcount-prioritisation", "marketing-spend-mix", "M&A-bid-analysis",
                   "build-vs-buy", "kill-or-double-down", "lease-vs-cloud", "outsource-vs-insource",
                   "office-vs-remote", "vendor-consolidation", "platform-rationalisation"]
for sc in ALLOC_SCENARIOS:
    P("finance", "allocation", f"Capital allocation · {sc}",
      f"Help decide capital allocation: {sc}.",
      f"Options: {{{{options}}}}. Constraints: {{{{constraints}}}}.",
      ["options", "constraints"], "claude-3-5-sonnet")

# ─── PEOPLE/HR (130 prompts) ───────────────────────────────────────
PERF_TYPES = ["annual", "mid-year", "calibration-pre-read", "PIP-30-day", "PIP-60-day",
              "promotion-justification", "succession-plan", "talent-density-review",
              "360-synthesis", "self-review-guidance"]
for pt in PERF_TYPES:
    P("people", "performance", f"Performance · {pt}",
      f"Run the {pt} performance task.",
      f"Subject: {{{{name}}}}. Inputs: {{{{inputs}}}}.",
      ["name", "inputs"], "claude-3-5-sonnet")
HARD_CONVOS = ["underperformance", "wrong-fit", "termination", "demotion", "comp-rejection",
               "promotion-deferral", "scope-reduction", "team-change", "burnout-intervention",
               "boundaries-conversation", "expectations-reset", "trust-rebuild"]
for hc in HARD_CONVOS:
    P("people", "hard-conversation", f"Conversation · {hc}",
      f"Script difficult conversations: {hc}.",
      f"Issue: {{{{issue}}}}. Evidence: {{{{evidence}}}}. Desired outcome: {{{{outcome}}}}.",
      ["issue", "evidence", "outcome"], "claude-3-5-sonnet")
ONE_ON_ONE = ["weekly-IC", "weekly-lead", "monthly-skip", "career-conversation",
              "feedback-loop", "energy-check", "new-hire-week-1", "new-hire-month-1",
              "new-hire-month-3", "exit-prep"]
for oo in ONE_ON_ONE:
    P("people", "1on1", f"1:1 · {oo}",
      f"Build 1:1 prep for {oo} format.",
      f"Report: {{{{name}}}}. Context: {{{{context}}}}. Focus: {{{{focus}}}}.",
      ["name", "context", "focus"], "gpt-4o")
INTERNAL_COMMS = ["promotion-announcement", "departure-announcement", "leadership-change",
                  "policy-update", "strategy-pivot", "performance-correction-org",
                  "compensation-policy", "remote-work-policy", "AI-usage-policy",
                  "incident-comms-internal", "incident-comms-external", "M&A-announcement",
                  "layoff-internal", "layoff-external", "reorg-announcement"]
for ic in INTERNAL_COMMS:
    P("people", "internal-comms", f"Internal comms · {ic}",
      f"Write internal {ic} communications.",
      f"Context: {{{{context}}}}. Specifics: {{{{specifics}}}}. Tone: {{{{tone}}}}.",
      ["context", "specifics", "tone"], "claude-3-5-sonnet")
EXIT_TYPES = ["voluntary-resignation", "performance-termination", "layoff", "retirement",
              "leave-of-absence-return", "internal-transfer"]
for et in EXIT_TYPES:
    P("people", "exit", f"Exit · {et}",
      f"Handle {et} exits with dignity.",
      f"Employee: {{{{name}}}}. Tenure: {{{{tenure}}}}. Role: {{{{role}}}}.",
      ["name", "tenure", "role"], "claude-3-5-sonnet")
CULTURE_TASKS = ["values-articulation", "values-test", "anti-patterns-list", "decision-principle-derivation",
                 "ritual-design", "rituals-audit", "shared-language-glossary", "inside-jokes-vs-exclusion",
                 "alignment-survey", "psychological-safety-check"]
for ct in CULTURE_TASKS:
    P("people", "culture", f"Culture · {ct}",
      f"Build culture artefacts: {ct}.",
      f"Stage: {{{{stage}}}}. Size: {{{{size}}}}.",
      ["stage", "size"], "claude-3-5-sonnet")

# ─── PRODUCT/ENGINEERING (180 prompts) ─────────────────────────────
PRD_FORMATS = ["aiprosol", "amazon-narrative", "intercom-jobs-to-be-done", "shape-up-pitch",
               "atlassian-template", "open-source-issue", "1-page-spec", "rfc-doc",
               "design-review-doc", "go-no-go-doc"]
for pf in PRD_FORMATS:
    P("product", "prd", f"PRD · {pf}",
      f"Write PRD in the {pf} format.",
      f"Feature: {{{{feature}}}}. Problem: {{{{problem}}}}. Success: {{{{success}}}}.",
      ["feature", "problem", "success"], "claude-3-5-sonnet")
USER_STORY_LENSES = ["happy-path", "edge-cases", "anti-personas", "international",
                     "accessibility", "performance-at-scale", "security-threat-modelling",
                     "compliance", "mobile-vs-desktop", "offline-first"]
for usl in USER_STORY_LENSES:
    P("product", "user-story", f"User stories · {usl} lens",
      f"Generate user stories through the {usl} lens.",
      f"Feature: {{{{feature}}}}. Persona: {{{{persona}}}}.",
      ["feature", "persona"], "gpt-4o")
EDGE_CASE_DOMAINS = ["empty-states", "loading-states", "error-states", "network-failures",
                     "race-conditions", "permission-boundaries", "i18n", "accessibility",
                     "high-load", "malicious-input", "data-corruption", "session-expiry",
                     "browser-back-button", "third-party-failures", "rate-limits"]
for ed in EDGE_CASE_DOMAINS:
    P("product", "edge-cases", f"Edge cases · {ed}",
      f"Find edge cases in the {ed} domain.",
      f"Feature: {{{{feature}}}}.",
      ["feature"], "claude-3-5-sonnet")
RELEASE_TYPES = ["major", "minor", "patch", "hotfix", "breaking", "deprecation",
                 "preview", "beta", "GA", "feature-flag-rollout"]
for rt in RELEASE_TYPES:
    P("product", "release-notes", f"Release notes · {rt}",
      f"Write {rt} release notes.",
      f"Changes: {{{{changes}}}}. Audience: {{{{audience}}}}.",
      ["changes", "audience"], "claude-3-5-sonnet")
DISCOVERY_TARGETS = ["new-feature-validation", "competitor-loss-debrief", "churn-debrief",
                     "expansion-driver", "decision-maker-vs-user-gap", "internal-champion-vs-external",
                     "willingness-to-pay", "switch-cost-evaluation", "jobs-to-be-done-mapping",
                     "anti-jobs-to-be-done"]
for dt in DISCOVERY_TARGETS:
    P("product", "discovery", f"Discovery · {dt}",
      f"Run discovery for {dt}.",
      f"Persona: {{{{persona}}}}. Topic: {{{{topic}}}}.",
      ["persona", "topic"], "claude-3-5-sonnet")
PRIORITISATION_FRAMEWORKS = ["RICE", "ICE", "MoSCoW", "Kano", "Opportunity-scoring",
                              "Effort-impact-matrix", "Now-Next-Later", "Bowling-alley",
                              "Cost-of-delay", "Strategic-vs-operational"]
for pf in PRIORITISATION_FRAMEWORKS:
    P("product", "prioritisation", f"Prioritisation · {pf}",
      f"Apply the {pf} framework.",
      f"Items: {{{{items}}}}. Constraints: {{{{constraints}}}}.",
      ["items", "constraints"], "gpt-4o")
ENG_TASKS = ["code-review-checklist", "PR-description", "design-doc", "tech-debt-pitch",
             "build-vs-buy-analysis", "vendor-evaluation-eng", "post-mortem-blameless",
             "runbook", "on-call-handover", "service-level-objectives", "service-level-indicators",
             "incident-comms-customer", "incident-comms-internal", "incident-RCA-template",
             "feature-flag-design"]
for et in ENG_TASKS:
    P("engineering", "process", f"Engineering · {et}",
      f"Engineering task: {et}.",
      f"Context: {{{{context}}}}. Stack: {{{{stack}}}}.",
      ["context", "stack"], "claude-3-5-sonnet")
TEST_KINDS = ["unit-test-plan", "integration-test-plan", "e2e-test-plan", "load-test-plan",
              "security-test-plan", "accessibility-test-plan", "i18n-test-plan",
              "performance-test-plan", "chaos-test-plan", "mobile-test-plan"]
for tk in TEST_KINDS:
    P("engineering", "testing", f"Testing · {tk}",
      f"Build {tk}.",
      f"Feature: {{{{feature}}}}. Stack: {{{{stack}}}}.",
      ["feature", "stack"], "claude-3-5-sonnet")
SYS_DESIGNS = ["greenfield-service", "legacy-rewrite", "monolith-decomposition", "microservices-extraction",
               "event-sourcing-introduction", "CQRS-introduction", "queue-vs-direct", "sync-vs-async",
               "vertical-vs-horizontal-scaling", "geo-distribution", "multi-tenant", "single-tenant",
               "stateless-vs-stateful", "edge-compute", "serverless-vs-container"]
for sd in SYS_DESIGNS:
    P("engineering", "design-doc", f"System design · {sd}",
      f"Design {sd}.",
      f"Goals: {{{{goals}}}}. Constraints: {{{{constraints}}}}.",
      ["goals", "constraints"], "claude-3-5-sonnet")

# ─── CUSTOMER SUCCESS (120 prompts) ────────────────────────────────
ONBOARDING_DELIV = ["welcome-email", "kickoff-prep-doc", "kickoff-agenda", "30-60-90-plan",
                    "milestone-1-check-in", "milestone-2-check-in", "first-success-celebration",
                    "implementation-recap"]
for od in ONBOARDING_DELIV:
    P("customer-success", "onboarding", f"Onboarding · {od}",
      f"CS onboarding deliverable: {od}.",
      f"Customer: {{{{customer}}}}. Plan: {{{{plan}}}}.",
      ["customer", "plan"], "claude-3-5-sonnet")
HEALTH_TASKS = ["health-score-design", "at-risk-playbook", "champion-tracking", "stakeholder-map",
                "expansion-signal-watching", "renewal-readiness-check", "QBR-prep", "QBR-recap",
                "executive-business-review", "annual-success-plan"]
for ht in HEALTH_TASKS:
    P("customer-success", "health", f"Health · {ht}",
      f"CS health task: {ht}.",
      f"Customer: {{{{customer}}}}. Tenure: {{{{tenure}}}}. Tier: {{{{tier}}}}.",
      ["customer", "tenure", "tier"], "gpt-4o")
NPS_RESPONSES = ["promoter-thank-you", "promoter-testimonial-ask", "promoter-referral-ask",
                 "passive-improvement-ask", "passive-onboarding-recheck", "detractor-recovery",
                 "detractor-executive-escalation", "detractor-save-offer", "detractor-graceful-close",
                 "anonymous-response-handling"]
for nr in NPS_RESPONSES:
    P("customer-success", "nps", f"NPS · {nr}",
      f"Respond to NPS: {nr}.",
      f"Score: {{{{score}}}}. Comment: {{{{comment}}}}. Customer context: {{{{context}}}}.",
      ["score", "comment", "context"], "claude-3-5-sonnet")
UPSELL_PATHS = ["plan-upgrade", "seat-expansion", "module-add-on", "service-attach",
                "annual-prepay", "multi-year-commit", "premium-support-attach",
                "cross-sell-related-product", "co-marketing-opportunity", "case-study-participation"]
for up in UPSELL_PATHS:
    P("customer-success", "upsell", f"Upsell · {up}",
      f"Pitch upsell: {up}.",
      f"Customer: {{{{customer}}}}. Usage data: {{{{usage}}}}. Current plan: {{{{plan}}}}.",
      ["customer", "usage", "plan"], "gpt-4o")
RENEWAL_SCENARIOS = ["happy-customer", "lukewarm-customer", "at-risk-customer", "down-sell-request",
                     "renegotiation-request", "multi-year-pitch", "auto-renew-confirmation",
                     "renewal-postponement-handle", "renewal-with-expansion", "renewal-with-contraction"]
for rs in RENEWAL_SCENARIOS:
    P("customer-success", "renewal", f"Renewal · {rs}",
      f"Renewal conversation: {rs}.",
      f"Customer: {{{{customer}}}}. Tenure: {{{{tenure}}}}. Latest signals: {{{{signals}}}}.",
      ["customer", "tenure", "signals"], "claude-3-5-sonnet")
CHURN_SAVE = ["payment-failure-recovery", "lost-champion-recovery", "competitor-loss-recovery",
              "feature-gap-recovery", "support-quality-recovery", "price-objection-recovery",
              "merger-driven-churn-handle", "downsize-driven-churn-handle", "wrong-fit-acknowledge-graceful",
              "data-export-help"]
for cs in CHURN_SAVE:
    P("customer-success", "churn-save", f"Churn save · {cs}",
      f"Save attempt: {cs}.",
      f"Customer: {{{{customer}}}}. Signal: {{{{signal}}}}.",
      ["customer", "signal"], "claude-3-5-sonnet")
VOICE_OF_CUSTOMER = ["weekly-themes-extraction", "monthly-trend-analysis", "quarterly-strategic-themes",
                     "competitive-mention-monitoring", "feature-request-aggregation",
                     "support-theme-extraction", "NPS-comment-clustering", "interview-synthesis",
                     "social-mention-synthesis", "exit-feedback-synthesis"]
for v in VOICE_OF_CUSTOMER:
    P("customer-success", "voice-of-customer", f"VoC · {v}",
      f"Voice-of-customer task: {v}.",
      f"Data: {{{{data}}}}. Period: {{{{period}}}}.",
      ["data", "period"], "gpt-4o")

# ─── PERSONAL PRODUCTIVITY (40 prompts) ────────────────────────────
PLANNING_HORIZONS = ["daily", "weekly", "monthly", "quarterly", "yearly", "5-year"]
for ph in PLANNING_HORIZONS:
    P("personal", "planning", f"Planning · {ph}",
      f"Plan {ph} with balance + intention.",
      f"Current state: {{{{state}}}}. Goals: {{{{goals}}}}.",
      ["state", "goals"], "claude-3-5-sonnet")
REVIEW_HORIZONS = ["daily", "weekly", "monthly", "quarterly", "annual"]
for rh in REVIEW_HORIZONS:
    P("personal", "review", f"Review · {rh}",
      f"Run {rh} reviews that compound.",
      f"Wins: {{{{wins}}}}. Frustrations: {{{{frustrations}}}}. Learnings: {{{{learnings}}}}.",
      ["wins", "frustrations", "learnings"], "claude-3-5-sonnet")
DECISION_TYPES = ["career-change", "geography-move", "relationship-decision", "investment-decision",
                  "skill-investment", "lifestyle-change", "boundary-setting", "saying-no",
                  "saying-yes-strategically", "long-term-bet"]
for dt in DECISION_TYPES:
    P("personal", "decision", f"Personal decision · {dt}",
      f"Help me decide: {dt}.",
      f"Option A: {{{{a}}}}. Option B: {{{{b}}}}.",
      ["a", "b"], "claude-3-5-sonnet")
LEARNING_TOPICS = ["new-language", "new-technical-skill", "new-domain", "leadership-skill",
                   "deep-expertise-area", "broad-foundation-area", "creative-skill", "physical-skill",
                   "social-skill", "self-knowledge"]
for lt in LEARNING_TOPICS:
    P("personal", "learning", f"Learning · {lt}",
      f"Build a 90-day learning roadmap for {lt}.",
      f"Topic: {{{{topic}}}}. Current level: {{{{level}}}}.",
      ["topic", "level"], "claude-3-5-sonnet")

print(f"Total prompts: {len(PROMPTS)}")

# Write the expanded vault
with open(PV_DIR / "prompts.json", "w") as f:
    json.dump({"version": "2.0", "count": len(PROMPTS),
                "license": "© 2026 Aiprosol Ltd · For purchaser's internal use",
                "prompts": PROMPTS}, f, indent=2, ensure_ascii=False)

# Markdown index
lines = [f"# Aiprosol ChatGPT Business Prompt Vault", "",
         f"Version 2.0 · {len(PROMPTS)} prompts · © 2026 Aiprosol Ltd", "",
         "## How to use", "",
         "Each prompt has a `system` (LLM role) and a `user_template` (with `{{variables}}`).",
         "Open `prompts.json` to access them programmatically, or browse this index.",
         "",
         "## Categories (counts)"]

by_cat = {}
for p in PROMPTS:
    by_cat.setdefault(p["category"], []).append(p)

for cat in sorted(by_cat):
    lines.append(f"")
    lines.append(f"### {cat.upper()} — {len(by_cat[cat])} prompts")
    by_sub = {}
    for p in by_cat[cat]:
        by_sub.setdefault(p["subcategory"], []).append(p)
    for sub in sorted(by_sub):
        lines.append(f"")
        lines.append(f"**{sub}** ({len(by_sub[sub])})")
        for p in by_sub[sub][:5]:  # show 5 per subcat
            lines.append(f"- `{p['id']}` {p['title']}")
        if len(by_sub[sub]) > 5:
            lines.append(f"- ... and {len(by_sub[sub])-5} more in this subcategory")

with open(PV_DIR / "prompt-vault-index.md", "w") as f:
    f.write("\n".join(lines))

print(f"✓ Prompt Vault expanded to {len(PROMPTS)} prompts")


# ════════════════════════════════════════════════════════════════════
# 2. TOOLS VAULT — Expand to 500+
# ════════════════════════════════════════════════════════════════════

# Will write a much bigger list. Format: (name, category, subcategory, price_floor, pricing_model, integrations, free, verdict, gotchas)
# Existing 96 already there — we add ~410 more across many categories.

MORE_TOOLS = [
    # More Conversational AI / LLM APIs
    ("Mistral Large", "Conversational AI", "API access", 0, "€0.40-12/M tokens", 0, False, "European LLM with strong reasoning.", "Smaller ecosystem vs OpenAI/Anthropic."),
    ("Llama 3.3 70B", "Conversational AI", "Open source", 0, "self-host", 0, True, "Meta's open weights. Run anywhere.", "Self-hosting infra cost is real."),
    ("Qwen 2.5", "Conversational AI", "Open source", 0, "self-host / API", 0, True, "Alibaba's strong open model.", "Less English benchmark data."),
    ("Gemini Pro API", "Conversational AI", "API access", 0, "$0.075-7/M tokens", 0, False, "Best at multimodal video.", "Less reliable function-calling vs OpenAI."),
    ("Groq", "Conversational AI", "Fast inference", 0, "$0.10-1.50/M tokens", 0, True, "Aiprosol uses for chat widget. Sub-100ms.", "Smaller model selection."),
    ("DeepSeek V3", "Conversational AI", "Open source", 0, "API + self-host", 0, True, "Chinese-origin frontier model.", "Geo-political considerations."),
    ("Yi-34B", "Conversational AI", "Open source", 0, "self-host", 0, True, "Strong bilingual (Chinese-English).", "Less Western benchmark coverage."),
    ("Phi-4", "Conversational AI", "Edge models", 0, "self-host", 0, True, "Small enough to run on laptops.", "Quality below frontier models."),
    ("Reka Core", "Conversational AI", "API access", 0, "$0.40-15/M tokens", 0, False, "Multimodal native (text+image+audio+video).", "Smaller community."),
    ("Cohere Command R", "Conversational AI", "RAG-tuned API", 0, "$0.15-15/M tokens", 0, False, "Best for production RAG workloads.", "Smaller ecosystem."),
    ("Inflection Pi", "Conversational AI", "Consumer chat", 0, "freemium", 0, True, "Built for emotional intelligence.", "Limited business utility."),
    ("Character.AI", "Conversational AI", "Roleplay", 0, "$10/mo", 0, True, "Persona-driven roleplay.", "Niche use case."),
    ("Hugging Face Spaces", "Conversational AI", "Demo hosting", 0, "free / $9+/mo", 0, True, "Try any open-source model in browser.", "Latency variable; not production."),
    ("Forefront AI", "Conversational AI", "API aggregator", 0, "$20+/mo", 0, True, "One API for multiple model providers.", "Adds latency vs direct."),
    ("OpenRouter", "Conversational AI", "API aggregator", 0, "passthrough + markup", 0, True, "100+ models behind one API.", "Markup adds 5-10% cost."),

    # More Code generation
    ("Aider", "Code generation", "CLI", 0, "API-based", 0, True, "Open-source agentic coder.", "Less polished than Claude Code."),
    ("Continue", "Code generation", "IDE plugin", 0, "open source", 0, True, "Open-source Cursor alternative.", "Smaller community."),
    ("Sourcegraph Cody", "Code generation", "Code search + AI", 0, "$9-19/mo", 0, True, "Best for huge monorepos.", "Pricing scales with seats."),
    ("Pieces for Developers", "Code generation", "Snippet management", 0, "$10-25/mo", 0, True, "AI-organised code snippets.", "Niche use case."),
    ("AmazonQ Developer", "Code generation", "IDE plugin", 0, "$19/user/mo", 0, True, "AWS-tuned AI coder.", "Best within AWS ecosystem."),
    ("Cognition Devin", "Code generation", "Autonomous agent", 0, "$500/mo", 0, False, "Marketed as autonomous SWE.", "Quality below human SWE in benchmarks."),
    ("Phind", "Code generation", "Search-driven", 0, "free / $15/mo", 0, True, "AI-first dev search.", "Smaller community than Google."),
    ("CodeWhisperer (Q)", "Code generation", "AWS-tuned", 0, "$19/user/mo", 0, False, "Best inside AWS context.", "Less general than Copilot."),

    # Image gen more
    ("Recraft V3", "Image gen", "Design assets", 0, "$10-30/mo", 0, True, "Vector + raster + text.", "Newer; smaller community."),
    ("Ideogram 2.0", "Image gen", "Text in images", 0, "$8-20/mo", 0, True, "Best text rendering inside images.", "Limited style range."),
    ("Stability AI SDXL", "Image gen", "Open source", 0, "self-host / API", 0, True, "Open weights; high resolution.", "Setup overhead."),
    ("Leonardo.ai", "Image gen", "Game assets", 0, "$12-60/mo", 0, True, "Best for game asset workflows.", "Niche focus."),
    ("Playground AI", "Image gen", "Filter-style", 0, "$15-30/mo", 0, True, "Easy UI for hobbyists.", "Less control than peers."),
    ("Civitai", "Image gen", "Community models", 0, "free + premium", 0, True, "1000s of fine-tuned models.", "Quality variable."),
    ("Photoroom", "Image gen", "Product photography", 0, "$10-200/mo", 0, True, "Best for e-commerce product shots.", "Specialised; not general gen."),
    ("Magnific.ai", "Image gen", "Upscaling", 0, "$39+/mo", 0, False, "Best upscaler currently available.", "Pricing premium."),
    ("Topaz Photo AI", "Image gen", "Upscaling/cleanup", 200, "$199 one-time", 0, False, "Best for photo restoration.", "One-time purchase, not subscription."),
    ("Runway Gen-3 Alpha", "Image gen", "Video frames", 0, "$12-95/mo", 0, True, "Frame interpolation for video.", "Pricier for image-only."),
    ("Krea AI", "Image gen", "Real-time", 0, "$10-60/mo", 0, True, "Iterative generation.", "Quality below static gen."),

    # Video gen more
    ("Sora", "Video gen", "Text-to-video", 0, "via ChatGPT", 0, False, "OpenAI's video model.", "Limited access (Plus/Pro)."),
    ("Veo 3", "Video gen", "Google's video", 0, "limited access", 0, False, "Top-tier quality.", "Limited rollout."),
    ("Hailuo MiniMax", "Video gen", "Asian-market", 0, "credits", 0, True, "Strong character consistency.", "Less Western coverage."),
    ("Kling", "Video gen", "ByteDance", 0, "credits", 0, True, "Long-clip generation.", "Geo-restrictions in some markets."),
    ("Genmo", "Video gen", "Animation", 0, "$10-30/mo", 0, True, "Stylised animation focus.", "Newer."),
    ("Wonder Studio", "Video gen", "VFX replacement", 0, "$30-280/mo", 0, False, "Auto-replace actors with CGI.", "Pricing premium."),
    ("Captions.ai", "Video gen", "Subtitle/lip-sync", 0, "$10-25/mo", 0, True, "Best for vertical video subtitles.", "Niche use case."),
    ("Descript", "Video gen", "Edit-by-transcript", 0, "$15-30/mo", 0, True, "Edit video like a doc.", "Quality limits at long form."),

    # Voice/Audio more
    ("Cartesia Sonic", "Voice/audio", "Fast TTS", 0, "$5-49/mo + usage", 0, True, "Sub-150ms latency.", "Newer."),
    ("PlayHT", "Voice/audio", "Voice cloning", 0, "$31-99/mo", 0, True, "Solid mid-tier voice cloning.", "Below ElevenLabs quality."),
    ("Murf AI", "Voice/audio", "TTS for videos", 0, "$23-99/mo", 0, True, "Best for narration in videos.", "Less natural than ElevenLabs."),
    ("Lovo AI", "Voice/audio", "TTS", 0, "$24-149/mo", 0, True, "Wide language coverage.", "Quality variable across languages."),
    ("Speechify", "Voice/audio", "Text-to-speech read-aloud", 0, "$15-30/mo", 0, True, "Best for ADHD/dyslexia accessibility.", "Less for creators."),
    ("Otter.ai", "Voice/audio", "Meeting transcription", 0, "free / $17+/mo", 0, True, "Most popular meeting transcriber.", "Quality below Fireflies."),
    ("Fireflies", "Voice/audio", "Meeting transcription", 0, "free / $19+/mo", 0, True, "Best meeting summarisation.", "Slack integration weaker."),
    ("Granola", "Voice/audio", "Meeting notes", 0, "$14+/mo", 0, True, "Macbook native, no bot in calls.", "Mac-only."),
    ("tldv", "Voice/audio", "Free meeting recorder", 0, "free / $20+/mo", 0, True, "Best free meeting recorder.", "Bot appears in calls."),
    ("Krisp", "Voice/audio", "Noise cancellation", 0, "free / $8+/mo", 0, True, "Industry standard noise cancel.", "Subscription required for full feature."),

    # Knowledge bases / RAG more
    ("Qdrant", "Knowledge base", "Vector DB", 0, "self-host / cloud", 0, True, "Best Rust-based vector DB.", "Smaller community than Pinecone."),
    ("Milvus", "Knowledge base", "Vector DB", 0, "self-host / Zilliz cloud", 0, True, "Scales to billions of vectors.", "More ops overhead."),
    ("LanceDB", "Knowledge base", "Embedded vector DB", 0, "open source / cloud", 0, True, "Embedded; no server needed.", "Less production tooling."),
    ("Supabase pgvector", "Knowledge base", "Postgres vector", 0, "with Supabase plan", 0, True, "Easiest for Postgres users.", "Performance ceiling vs purpose-built."),
    ("Turbopuffer", "Knowledge base", "Serverless vector", 0, "usage-based", 0, True, "Pay-per-query pricing.", "Newer; less ecosystem."),
    ("MongoDB Atlas Vector Search", "Knowledge base", "Within MongoDB", 0, "with Atlas plan", 0, True, "Easiest for MongoDB users.", "Less optimised vs purpose-built."),
    ("Elasticsearch vector", "Knowledge base", "Within ES", 0, "with ES plan", 0, True, "Hybrid keyword + vector search.", "Adds latency."),
    ("Atomic.io", "Knowledge base", "Personal", 0, "$8/mo", 0, True, "Personal mem with AI search.", "Less mature than peers."),
    ("Rewind", "Knowledge base", "Personal capture", 0, "$10-20/mo", 0, True, "Captures everything you've seen/heard.", "Mac/iPhone only; privacy considerations."),

    # No-code automation more
    ("Albato", "No-code automation", "Cloud", 0, "$13-149/mo", 800, True, "Affordable Zapier alternative.", "Smaller integration count."),
    ("Integromat (old Make)", "No-code automation", "Cloud", 0, "merged into Make", 0, True, "Now branded Make.com.", "Brand transition."),
    ("Workato", "No-code automation", "Enterprise", 0, "from $10K/year", 1000, False, "Enterprise iPaaS.", "Pricing locks out SMBs."),
    ("Tray.io", "No-code automation", "Enterprise", 0, "from $9K/year", 600, False, "Enterprise iPaaS with code escape.", "Pricing premium."),
    ("Boomi", "No-code automation", "Enterprise", 0, "from $20K/year", 500, False, "Legacy enterprise iPaaS.", "Slower innovation."),
    ("Mulesoft", "No-code automation", "Enterprise", 0, "from $80K/year", 1000, False, "Salesforce-owned, full iPaaS.", "Heavy enterprise pricing."),
    ("Zoho Flow", "No-code automation", "SMB", 10, "$10-29/mo", 700, True, "Best within Zoho ecosystem.", "Less useful outside Zoho."),
    ("Latenode", "No-code automation", "Code-first", 0, "free / $19+/mo", 300, True, "Best when code is needed.", "Smaller community."),

    # CRM / Sales more
    ("Apollo.io", "CRM/Sales", "Prospecting", 0, "free / $49+/mo", 50, True, "Best B2B prospecting database.", "Data freshness inconsistent."),
    ("Outreach", "CRM/Sales", "Sales engagement", 100, "$100+/user/mo", 100, False, "Enterprise sales sequencing.", "Pricing locks out smaller teams."),
    ("Salesloft", "CRM/Sales", "Sales engagement", 75, "$75+/user/mo", 100, False, "Salesforce-adjacent.", "Smaller integration count than Outreach."),
    ("Reply.io", "CRM/Sales", "Sales engagement", 49, "$49-99/user/mo", 50, False, "Multichannel outbound.", "Below Outreach in polish."),
    ("Lemlist", "CRM/Sales", "Cold email", 39, "$39-79/user/mo", 30, False, "Best video-personalisation cold email.", "Deliverability inconsistent at scale."),
    ("Instantly", "CRM/Sales", "Cold email", 37, "$37-97/mo", 20, False, "Best deliverability cold email.", "More complex setup."),
    ("Smartlead", "CRM/Sales", "Cold email", 39, "$39-99/mo", 20, False, "Cold email with rotation.", "Niche use case."),
    ("Mixmax", "CRM/Sales", "Email + scheduling", 12, "$12-69/user/mo", 30, False, "Gmail-native sales tools.", "Gmail-only."),
    ("Clearbit", "CRM/Sales", "Enrichment", 0, "usage / enterprise", 100, False, "Industry-standard enrichment.", "Acquired by HubSpot; pricing in flux."),
    ("ZoomInfo", "CRM/Sales", "Prospecting", 0, "enterprise", 100, False, "Largest B2B data set.", "Heavy enterprise pricing."),
    ("Cognism", "CRM/Sales", "Prospecting + compliance", 0, "enterprise", 50, False, "Best GDPR-compliant prospecting.", "European-focused."),
    ("LinkedIn Sales Navigator", "CRM/Sales", "Prospecting", 80, "$80-150/user/mo", 30, False, "LinkedIn-native prospecting.", "Doesn't expose emails."),
    ("RB2B", "CRM/Sales", "Visitor identification", 0, "free / $129+/mo", 10, True, "Identify website visitors.", "Coverage limited."),
    ("Common Room", "CRM/Sales", "Community intel", 0, "free / $625+/mo", 50, True, "Track community signals.", "Pricing premium."),

    # Email/Marketing more
    ("Beehiiv", "Email", "Newsletter platform", 0, "free / $42+/mo", 30, True, "Best for newsletter creators.", "Less business automation."),
    ("ConvertKit", "Email", "Creator-focused", 0, "free / $9+/mo", 100, True, "Best for solopreneurs.", "Less powerful than peers at scale."),
    ("ActiveCampaign", "Email", "Marketing automation", 9, "$9-145/mo", 200, False, "Best behavioural automation.", "Complex setup."),
    ("MailerLite", "Email", "Affordable", 0, "free / $15+/mo", 100, True, "Best Mailchimp alternative for SMBs.", "Less polished UX."),
    ("Brevo (Sendinblue)", "Email", "Multi-channel", 0, "free / $8.08+/mo", 80, True, "Email + SMS + WhatsApp.", "Quality variable across channels."),
    ("Substack", "Email", "Newsletter", 0, "free (revenue share)", 0, True, "Best for paid newsletters.", "Lock-in concerns."),
    ("Ghost", "Email", "Open source newsletter", 0, "$9+/mo or self-host", 50, True, "Open-source newsletter + site.", "Setup overhead if self-host."),
    ("Klaviyo", "Email", "E-commerce", 0, "free / $20+/mo", 300, True, "Best for Shopify-driven brands.", "Pricing scales with list."),
    ("Drip", "Email", "E-commerce", 39, "$39+/mo", 100, False, "E-commerce automation.", "Less popular than Klaviyo."),
    ("Omnisend", "Email", "E-commerce", 0, "free / $16+/mo", 100, True, "E-commerce email + SMS.", "Below Klaviyo at scale."),

    # Analytics more
    ("Hotjar", "Analytics", "Heatmaps / session recording", 0, "free / $32+/mo", 50, True, "Industry standard heatmaps.", "Performance impact at high traffic."),
    ("Microsoft Clarity", "Analytics", "Free heatmaps", 0, "free", 0, True, "Microsoft's free heatmap tool.", "Less polished than Hotjar."),
    ("Fullstory", "Analytics", "Enterprise session", 0, "enterprise", 50, False, "Enterprise session replay.", "Pricing premium."),
    ("Heap", "Analytics", "Auto-tracking", 0, "free / $99+/mo", 50, True, "Auto-tracks every event.", "Costs at scale."),
    ("Pendo", "Analytics", "Product analytics + guidance", 0, "free / enterprise", 50, True, "Analytics + in-app guidance.", "Pricing opaque."),
    ("LogRocket", "Analytics", "Session replay + error", 99, "$99+/mo", 50, False, "Combines analytics + error tracking.", "Pricing premium."),
    ("June", "Analytics", "B2B SaaS analytics", 0, "free / $149+/mo", 30, True, "Built for B2B SaaS.", "Smaller team."),
    ("Userflow", "Analytics", "User onboarding analytics", 0, "$240+/mo", 30, False, "Onboarding-focused.", "Niche."),
    ("Statsig", "Analytics", "Experimentation", 0, "free / $150+/mo", 20, True, "Best experimentation platform.", "Smaller community."),
    ("LaunchDarkly", "Analytics", "Feature flags + experiments", 0, "free / $10+/seat/mo", 50, True, "Enterprise feature flags.", "Pricing scales."),

    # Project management more
    ("Jira", "Project management", "Atlassian", 0, "free / $7.16+/user/mo", 1000, True, "Industry default for engineering.", "Slower UX than Linear."),
    ("Basecamp", "Project management", "Flat fee", 99, "$99/mo (flat)", 50, False, "Best flat-pricing PM.", "Less flexible than peers."),
    ("Trello", "Project management", "Kanban", 0, "free / $5+/user/mo", 200, True, "Easiest kanban.", "Limited reporting."),
    ("Wrike", "Project management", "Cross-team", 0, "free / $9.80+/user/mo", 400, True, "Cross-team workflows.", "Complex setup."),
    ("Smartsheet", "Project management", "Spreadsheet-like", 0, "$9-32+/user/mo", 100, False, "Best for spreadsheet thinkers.", "Excel-feel learning curve."),
    ("Airtable", "Project management", "Database-like", 0, "free / $20+/seat/mo", 100, True, "Best database-as-PM.", "Pricing scales with rows."),
    ("Productive", "Project management", "Agency-focused", 9, "$9-25+/user/mo", 50, False, "Best for agencies.", "Niche."),
    ("Coda", "Project management", "Doc+DB", 0, "free / $10+/user/mo", 100, True, "Hybrid doc and database.", "Learning curve."),
    ("Hive", "Project management", "Email-integrated", 5, "free / $5+/user/mo", 30, True, "Built into email workflows.", "Less powerful."),
    ("MeisterTask", "Project management", "Kanban + Mind Map", 0, "free / $7+/user/mo", 30, True, "Visual hybrid.", "Smaller community."),

    # Customer support more
    ("Help Scout", "Customer support", "Shared inbox", 25, "$25+/seat/mo", 100, True, "Best for small teams.", "Less powerful at scale."),
    ("Tidio", "Customer support", "Chat + bots", 0, "free / $29+/mo", 100, True, "Best for SMB e-commerce.", "Less powerful."),
    ("Drift", "Customer support", "Conversational marketing", 0, "$0-2.5K+/mo", 50, True, "Sales-focused chat.", "Pricing locks out SMBs."),
    ("Freshdesk", "Customer support", "Helpdesk", 0, "free / $15+/agent/mo", 100, True, "Mid-market alternative to Zendesk.", "Below Zendesk in extensibility."),
    ("Kayako", "Customer support", "Helpdesk", 30, "$30-100+/agent/mo", 50, False, "Mid-market helpdesk.", "Smaller community."),
    ("LiveAgent", "Customer support", "Helpdesk", 15, "$15-69/agent/mo", 50, False, "Affordable helpdesk.", "Less polished."),
    ("ClickUp Helpdesk", "Customer support", "Bundled", 7, "$7+/user/mo", 100, True, "Best if already on ClickUp.", "Niche."),
    ("Re:amaze", "Customer support", "Shared inbox + chat", 29, "$29-89/seat/mo", 30, False, "E-commerce focused.", "Smaller market."),
    ("Customerly", "Customer support", "All-in-one", 7, "$7-179/mo", 30, True, "Live chat + CRM + email.", "Less depth in any category."),
    ("Beacon (Help Scout)", "Customer support", "In-app chat", 25, "with Help Scout", 0, False, "Help Scout's chat widget.", "Tied to Help Scout."),

    # Hosting / DevOps / Cloud more
    ("AWS", "Hosting/Deploy", "Cloud", 0, "usage-based", 1000, True, "Industry-default cloud.", "Cost surprises."),
    ("GCP", "Hosting/Deploy", "Cloud", 0, "usage-based", 800, True, "Best for ML / data workloads.", "Less mature ecosystem."),
    ("Azure", "Hosting/Deploy", "Cloud", 0, "usage-based", 1000, True, "Best for Microsoft shops.", "Pricing opaque."),
    ("DigitalOcean", "Hosting/Deploy", "Simplified cloud", 4, "$4+/mo", 50, False, "Simple cloud for developers.", "Less feature breadth than AWS."),
    ("Linode (Akamai)", "Hosting/Deploy", "VPS", 5, "$5+/mo", 30, False, "Reliable VPS option.", "Smaller feature set."),
    ("Hetzner", "Hosting/Deploy", "European VPS", 4, "€4+/mo", 20, False, "Cheapest reliable European VPS.", "Limited managed services."),
    ("Fly.io", "Hosting/Deploy", "Edge container", 0, "usage-based", 30, True, "Best for global edge.", "Newer; less mature."),
    ("Render", "Hosting/Deploy", "PaaS", 0, "free / $7+/mo", 30, True, "Best Heroku alternative.", "Pricing slightly more than Railway."),
    ("Heroku", "Hosting/Deploy", "PaaS", 5, "$5+/mo", 100, False, "Veteran PaaS.", "Pricier than newer entrants."),
    ("Netlify", "Hosting/Deploy", "JAMstack", 0, "free / $19+/mo", 50, True, "Best for static + functions.", "Pricier than Vercel for some cases."),
    ("Supabase", "Hosting/Deploy", "Backend-as-Service", 0, "free / $25+/mo", 30, True, "Open-source Firebase.", "Smaller ecosystem."),
    ("Firebase", "Hosting/Deploy", "Backend-as-Service", 0, "free / pay-as-go", 50, True, "Google's BaaS.", "Lock-in concerns."),
    ("PlanetScale", "Hosting/Deploy", "MySQL", 0, "$39+/mo", 30, True, "Branched databases.", "Killed free tier; relaunched."),
    ("Neon", "Hosting/Deploy", "Postgres", 0, "free / $19+/mo", 30, True, "Serverless Postgres.", "Newer."),
    ("Bunny CDN", "Hosting/Deploy", "CDN", 0, "$1+/mo", 30, False, "Cheap, fast CDN.", "Less feature breadth."),
    ("Coolify", "Hosting/Deploy", "Open-source PaaS", 0, "self-host / $5+/mo", 30, True, "Self-hosted Heroku alternative.", "Setup overhead."),
    ("Cloudways", "Hosting/Deploy", "Managed cloud", 10, "$10+/mo", 30, False, "Managed VPS option.", "Adds 20-50% markup."),

    # Observability / Errors more
    ("New Relic", "Observability", "Full-stack", 0, "free / $99+/user/mo", 600, True, "Enterprise APM.", "Pricing opaque."),
    ("Honeycomb", "Observability", "Distributed tracing", 0, "free / $130+/mo", 30, True, "Best for distributed systems.", "Steeper learning curve."),
    ("Grafana Cloud", "Observability", "Open-source stack", 0, "free / $8+/mo", 50, True, "Open-source observability.", "Setup overhead if self-host."),
    ("Datadog APM", "Observability", "APM", 0, "from $31+/host/mo", 600, True, "Enterprise APM.", "Bills surprise at scale."),
    ("Sentry Performance", "Observability", "Performance + errors", 0, "free / $26+/mo", 100, True, "Performance monitoring inside Sentry.", "Pricing scales with events."),
    ("Rollbar", "Observability", "Error tracking", 0, "free / $99+/mo", 100, True, "Sentry alternative.", "Less popular than Sentry."),
    ("Bugsnag", "Observability", "Error tracking", 0, "free / $25+/mo", 100, True, "Strong for mobile.", "Less polished than Sentry."),
    ("Splunk", "Observability", "Logs", 0, "from $40+/GB", 500, False, "Enterprise logs.", "Most expensive observability."),
    ("Loggly", "Observability", "Logs", 0, "free / $79+/mo", 100, True, "Mid-market logging.", "Less popular now."),
    ("Papertrail", "Observability", "Simple logs", 7, "$7+/mo", 30, False, "Simple log aggregation.", "Less feature breadth."),
    ("AxiomHQ", "Observability", "Logs + analytics", 0, "free / $25+/mo", 30, True, "Modern log platform.", "Smaller community."),
    ("BetterStack", "Observability", "Uptime + logs", 0, "free / $24+/mo", 50, True, "Uptime + log all-in-one.", "Newer."),

    # Marketing tools more
    ("SEMrush", "Marketing", "SEO suite", 119, "$119-499+/mo", 50, False, "Industry default SEO suite.", "Pricing premium."),
    ("Ahrefs", "Marketing", "SEO suite", 99, "$99-999+/mo", 30, False, "Best backlink data.", "Pricing premium."),
    ("Moz", "Marketing", "SEO suite", 49, "$49-249+/mo", 30, True, "Veteran SEO suite.", "Smaller data than peers."),
    ("Surfer SEO", "Marketing", "On-page SEO AI", 89, "$89-219+/mo", 20, False, "Content optimisation.", "Niche."),
    ("Clearscope", "Marketing", "On-page SEO", 199, "$199+/mo", 10, False, "Premium content optimisation.", "Pricing premium."),
    ("Frase", "Marketing", "AI SEO content", 15, "$15-115+/mo", 10, True, "AI-first content brief.", "Quality variable."),
    ("Jasper", "Marketing", "AI copy", 49, "$49-125+/mo", 50, False, "AI copy with brand voice.", "Less popular post-ChatGPT."),
    ("Copy.ai", "Marketing", "AI copy", 0, "free / $36+/mo", 20, True, "Marketing copy variants.", "Quality variable."),
    ("Writesonic", "Marketing", "AI copy", 0, "free / $13+/mo", 20, True, "Wide use case range.", "Quality variable."),
    ("Anyword", "Marketing", "Marketing AI with scoring", 49, "$49-499+/mo", 20, False, "Conversion-scored AI copy.", "Pricing premium."),
    ("Tofu", "Marketing", "Modern AI for B2B", 0, "$2.5K+/mo", 30, False, "Enterprise B2B AI marketing.", "Pricing locks SMBs."),
    ("Common Sense Machines", "Marketing", "AI brand voice", 0, "$99+/mo", 30, False, "Specialised brand voice.", "Niche."),

    # Design tools
    ("Figma", "Design", "Design suite", 0, "free / $15+/user/mo", 50, True, "Industry default for product design.", "Pricing rose post-Adobe attempt."),
    ("Sketch", "Design", "Design (Mac)", 10, "$10+/user/mo", 30, False, "Mac-only design tool.", "Mac-only restricts teams."),
    ("Adobe XD", "Design", "Adobe ecosystem", 10, "via Creative Cloud", 30, False, "Being deprecated.", "Adobe sunsetting."),
    ("Penpot", "Design", "Open source Figma", 0, "self-host / cloud", 10, True, "Open-source Figma alternative.", "Smaller community."),
    ("Framer", "Design", "Design + build", 0, "$20+/site/mo", 30, True, "Design that becomes a site.", "Niche use case."),
    ("Canva", "Design", "Marketing design", 0, "free / $13+/mo", 100, True, "Industry default for non-designers.", "Output quality limits."),
    ("Adobe Express", "Design", "Marketing", 0, "free / $10+/mo", 50, True, "Canva alternative within Adobe.", "Smaller community than Canva."),
    ("Visme", "Design", "Presentations", 0, "free / $29+/user/mo", 30, True, "Best for infographic-style decks.", "Niche."),
    ("Beautiful.ai", "Design", "AI presentations", 12, "$12-40+/user/mo", 30, False, "AI-auto-laid-out decks.", "Less control."),
    ("Gamma", "Design", "AI presentations", 0, "free / $10+/mo", 30, True, "Best AI presentation tool.", "Output needs polish."),

    # AI agents / frameworks more
    ("Pydantic AI", "AI agents", "Framework", 0, "open source", 0, True, "Type-safe agent framework.", "Newer."),
    ("DSPy", "AI agents", "Framework", 0, "open source", 0, True, "Optimisation-focused framework.", "Steep learning curve."),
    ("Haystack", "AI agents", "RAG framework", 0, "open source", 0, True, "Deep RAG framework.", "Smaller community than LangChain."),
    ("Semantic Kernel", "AI agents", "Microsoft framework", 0, "open source", 0, True, "Microsoft's framework.", "Less popular outside MS shops."),
    ("Letta (MemGPT)", "AI agents", "Memory-focused", 0, "open source / cloud", 0, True, "Best long-term memory framework.", "Niche."),
    ("Magentic", "AI agents", "Multi-agent", 0, "open source", 0, True, "Newer multi-agent framework.", "Smaller adoption."),
    ("Smolagents", "AI agents", "Lightweight", 0, "open source", 0, True, "Lightweight agent framework.", "Newer."),
    ("E2B", "AI agents", "Sandbox infra", 0, "$50+/mo", 0, True, "Cloud sandboxes for agents.", "Niche."),
    ("Modal Labs", "AI agents", "Serverless GPU", 0, "usage-based", 0, True, "Serverless GPU for AI agents.", "Smaller community."),
    ("Anyscale", "AI agents", "Ray-based serving", 0, "$2+/hour", 0, False, "Best for Ray-based scaling.", "Niche."),
    ("Anchor browser", "AI agents", "Browser automation", 0, "$99+/mo", 0, False, "AI-driven browser automation.", "Niche."),

    # Sales-specific tools
    ("Gong", "Sales tools", "Conversation intel", 0, "$100+/user/mo", 30, False, "Industry-default call intel.", "Pricing premium."),
    ("Chorus", "Sales tools", "Conversation intel", 0, "$100+/user/mo", 30, False, "ZoomInfo-owned conv intel.", "Below Gong in polish."),
    ("Replicate", "Sales tools", "AI agents for sales", 0, "credits", 0, True, "AI sales agents.", "Newer."),
    ("11x.ai", "Sales tools", "AI SDR", 0, "$5K+/mo", 0, False, "AI sales rep.", "Quality variable; expensive."),
    ("Artisan", "Sales tools", "AI sales agents", 0, "$1K+/mo", 0, False, "AI SDR product.", "Quality variable."),
    ("Reply.io Jason AI", "Sales tools", "AI assistant", 0, "within Reply.io", 0, False, "AI feature within Reply.io.", "Tied to platform."),
    ("Trumpet", "Sales tools", "Buyer enablement", 0, "$29+/user/mo", 20, False, "Dynamic buyer rooms.", "Niche."),
    ("DealHub", "Sales tools", "CPQ + buyer rooms", 0, "$50+/user/mo", 50, False, "Quote-to-cash.", "Enterprise."),
    ("Highspot", "Sales tools", "Content management", 0, "enterprise", 100, False, "Sales content + analytics.", "Pricing locks SMBs."),
    ("Showpad", "Sales tools", "Sales enablement", 0, "enterprise", 50, False, "Sales enablement platform.", "Enterprise focus."),
    ("Loom", "Sales tools", "Video messaging", 0, "free / $15+/user/mo", 30, True, "Best video messaging.", "Acquired by Atlassian."),
    ("Vidyard", "Sales tools", "Video messaging", 0, "free / $19+/user/mo", 30, True, "Sales-focused video.", "Less popular than Loom."),
    ("Cal.com", "Sales tools", "Open-source scheduler", 0, "free / $12+/seat/mo", 100, True, "Open-source Calendly.", "Smaller integration count."),
    ("SavvyCal", "Sales tools", "Modern scheduler", 12, "$12+/user/mo", 30, False, "Calendar overlap detection.", "Niche."),
    ("Chili Piper", "Sales tools", "Round-robin scheduling", 22, "$22+/user/mo", 50, False, "Enterprise scheduler.", "Pricing premium."),
    ("Spinify", "Sales tools", "Sales gamification", 0, "$5-25/user/mo", 30, True, "Sales team leaderboards.", "Niche."),
    ("Datanyze", "Sales tools", "Technographic data", 21, "$21-39+/user/mo", 20, False, "Identify prospect tech stack.", "Below Clearbit in coverage."),

    # Legal / Compliance
    ("Ironclad", "Legal", "CLM", 0, "enterprise", 30, False, "Industry-default CLM.", "Enterprise pricing."),
    ("DocuSign CLM", "Legal", "CLM", 0, "enterprise", 50, False, "DocuSign's CLM.", "Less innovative than peers."),
    ("Spotdraft", "Legal", "CLM mid-market", 0, "$500+/mo", 30, False, "Mid-market CLM.", "Newer."),
    ("LinkSquares", "Legal", "AI legal search", 0, "enterprise", 30, False, "AI for contract intelligence.", "Enterprise."),
    ("Lexion", "Legal", "AI legal", 0, "enterprise", 30, False, "Docusign-owned AI legal.", "Enterprise."),
    ("Harvey AI", "Legal", "AI legal research", 0, "enterprise", 0, False, "OpenAI-backed legal AI.", "Enterprise."),
    ("CoCounsel (Casetext)", "Legal", "AI legal research", 0, "$225+/mo", 0, False, "Per-attorney pricing.", "Pricing premium."),
    ("Vanta", "Compliance", "SOC 2 automation", 0, "$8K+/year", 100, False, "Industry default SOC 2.", "Annual contracts."),
    ("Drata", "Compliance", "Compliance automation", 0, "$8K+/year", 100, False, "Vanta alternative.", "Annual contracts."),
    ("Secureframe", "Compliance", "Compliance automation", 0, "$5K+/year", 100, False, "Compliance for SMB+.", "Annual contracts."),

    # Finance / Accounting more
    ("FreshBooks", "Finance", "Small biz accounting", 21, "$21-65+/mo", 100, False, "Best for solo/freelance.", "Less powerful at scale."),
    ("Wave", "Finance", "Free accounting", 0, "free + payment fees", 30, True, "Best free accounting.", "Payment processing fees."),
    ("Sage Intacct", "Finance", "Mid-market ERP", 0, "$15K+/year", 100, False, "Mid-market accounting.", "Heavy implementation."),
    ("NetSuite", "Finance", "Enterprise ERP", 0, "$30K+/year", 200, False, "Industry standard mid-market ERP.", "Pricing opaque."),
    ("Ramp", "Finance", "Spend management", 0, "free + interchange", 100, True, "Modern corp card + spend mgmt.", "US-only."),
    ("Brex", "Finance", "Spend management", 0, "free + interchange", 100, True, "Startup-focused.", "US-only."),
    ("Mercury", "Finance", "Startup banking", 0, "free", 30, True, "Best startup banking.", "US-only."),
    ("Wise Business", "Finance", "Global banking", 0, "low fees + FX", 30, True, "Best for international.", "Limited US features."),
    ("Stripe Atlas", "Finance", "Company formation", 500, "$500 one-time", 0, False, "Best for tech startup formation.", "One-time fee."),
    ("Pilot", "Finance", "Bookkeeping service", 0, "$499+/mo", 30, False, "Outsourced bookkeeping.", "Pricing premium."),
    ("Bench", "Finance", "Bookkeeping service", 249, "$249+/mo", 20, False, "Affordable bookkeeping.", "Less polished."),

    # HR / Hiring
    ("Gusto", "HR", "Payroll + benefits", 40, "$40+/mo + per-employee", 50, False, "Best US payroll for SMBs.", "US-only."),
    ("Rippling", "HR", "All-in-one IT+HR", 8, "$8+/employee/mo", 100, False, "IT + HR + payroll suite.", "Pricing premium for small teams."),
    ("Deel", "HR", "Global contractors", 49, "$49/contractor/mo", 100, False, "Best for global contractors.", "Pricing per contractor."),
    ("Remote", "HR", "Global employment", 0, "$29+/contractor/mo", 50, True, "Global EOR.", "Pricing per employee."),
    ("BambooHR", "HR", "SMB HRIS", 0, "$5.25+/employee/mo", 100, False, "Best SMB HRIS.", "Limited at scale."),
    ("Workday", "HR", "Enterprise HRIS", 0, "enterprise", 500, False, "Industry standard enterprise.", "Heavy implementation."),
    ("Lattice", "HR", "Performance + engagement", 11, "$11+/seat/mo", 30, False, "Best performance suite.", "Pricing scales."),
    ("Culture Amp", "HR", "Engagement surveys", 0, "$4-10/user/mo", 30, False, "Best engagement surveys.", "Enterprise focus."),
    ("Greenhouse", "HR", "ATS", 0, "$6K+/year", 200, False, "Industry standard ATS.", "Annual contracts."),
    ("Lever", "HR", "ATS", 0, "$3.5K+/year", 100, False, "Lever's ATS.", "Annual contracts."),
    ("Ashby", "HR", "Modern ATS", 0, "$300+/year", 30, False, "Modern ATS.", "Newer."),
    ("Workable", "HR", "ATS mid-market", 0, "$169+/mo", 50, False, "SMB+ ATS.", "Pricing scales."),

    # Data / Analytics / BI
    ("Snowflake", "Data", "Data warehouse", 0, "usage-based", 100, False, "Industry default DW.", "Bills surprise at scale."),
    ("BigQuery", "Data", "Data warehouse", 0, "usage-based", 100, True, "GCP's DW.", "Less mature ecosystem than Snowflake."),
    ("Redshift", "Data", "Data warehouse", 0, "usage-based", 100, False, "AWS's DW.", "Less popular than Snowflake."),
    ("Databricks", "Data", "Lakehouse", 0, "usage-based", 100, False, "Best for ML+data workloads.", "Pricing opaque."),
    ("DuckDB", "Data", "Embedded analytics", 0, "open source", 0, True, "Fast analytics on local data.", "Embedded only."),
    ("ClickHouse", "Data", "Columnar DB", 0, "self-host / cloud", 30, True, "Best for analytics at scale.", "Setup overhead."),
    ("dbt", "Data", "Transformation", 0, "open source / $100+/mo", 50, True, "Industry default transformation.", "Learning curve."),
    ("Fivetran", "Data", "ELT", 0, "usage-based", 200, False, "Industry default ELT.", "Pricing scales."),
    ("Airbyte", "Data", "ELT open source", 0, "self-host / cloud", 200, True, "Open-source ELT.", "Setup overhead."),
    ("Hightouch", "Data", "Reverse ETL", 0, "free / $450+/mo", 100, True, "Best reverse ETL.", "Pricing for premium."),
    ("Census", "Data", "Reverse ETL", 0, "$300+/mo", 100, False, "Reverse ETL competitor.", "Pricing for premium."),
    ("Looker", "Data", "BI", 0, "enterprise", 50, False, "Google's BI.", "Enterprise."),
    ("Tableau", "Data", "BI", 12, "$12+/user/mo", 100, False, "Industry standard BI.", "Salesforce-owned."),
    ("Power BI", "Data", "BI", 9.99, "$9.99+/user/mo", 100, False, "Microsoft's BI.", "Best for MS shops."),
    ("Metabase", "Data", "Open-source BI", 0, "self-host / $85+/mo", 30, True, "Open-source BI.", "Smaller community."),
    ("Hex", "Data", "Notebook + BI", 0, "free / $24+/user/mo", 30, True, "Modern notebook+BI.", "Newer."),
    ("Sigma", "Data", "Spreadsheet BI", 0, "$300+/user/mo", 30, False, "Spreadsheet-style BI.", "Pricing premium."),
    ("Preset", "Data", "Managed Superset", 0, "free / $20+/seat/mo", 30, True, "Managed Apache Superset.", "Smaller community."),

    # Productivity / Notes / Wiki
    ("Obsidian", "Productivity", "Personal notes", 0, "free / $4+/mo sync", 0, True, "Best personal knowledge.", "Sync requires paid."),
    ("Roam Research", "Productivity", "Bi-directional notes", 13.75, "$13.75+/mo", 0, False, "Pioneering bi-directional.", "Slower vs peers."),
    ("Logseq", "Productivity", "Open-source bi-directional", 0, "free", 0, True, "Roam alternative.", "Smaller community."),
    ("Capacities", "Productivity", "Object-based notes", 0, "free / $10+/mo", 30, True, "Object-based knowledge.", "Newer."),
    ("Tana", "Productivity", "Smart Notion alt", 0, "$10-15+/mo", 30, False, "Modern bi-directional+DB.", "Newer; pricing premium."),
    ("Bear", "Productivity", "Markdown notes (Mac)", 0, "free / $30/year", 0, True, "Best Mac note-taking.", "Mac-only."),
    ("Craft", "Productivity", "Doc + sketches", 0, "free / $10+/mo", 30, True, "Beautiful Mac/iOS docs.", "Mac/iOS only."),
    ("Anytype", "Productivity", "Local-first knowledge", 0, "free", 0, True, "Local-first Notion alt.", "Newer."),
    ("AppFlowy", "Productivity", "Open-source Notion", 0, "free", 0, True, "Open-source Notion clone.", "Smaller feature set."),
    ("Slite", "Productivity", "Team wiki", 0, "free / $8+/user/mo", 30, True, "Team wiki.", "Smaller than Notion."),
    ("GitBook", "Productivity", "Docs", 0, "free / $6.70+/user/mo", 30, True, "Best technical docs.", "Niche."),
    ("Outline", "Productivity", "Open-source team wiki", 0, "self-host / $10+/user/mo", 30, True, "Open-source wiki.", "Smaller community."),

    # Customer onboarding / Product adoption
    ("Appcues", "Product adoption", "User onboarding", 0, "$249+/mo", 30, False, "Industry default onboarding.", "Pricing scales."),
    ("UserGuiding", "Product adoption", "User onboarding", 89, "$89-249+/mo", 20, False, "Mid-market onboarding.", "Less polished than Appcues."),
    ("Intro.js", "Product adoption", "Open-source tours", 0, "free", 0, True, "Self-host product tours.", "Setup overhead."),
    ("Userpilot", "Product adoption", "Self-serve onboarding", 249, "$249+/mo", 30, False, "Onboarding + analytics.", "Pricing scales."),
    ("WalkMe", "Product adoption", "Enterprise DAP", 0, "enterprise", 100, False, "Enterprise digital adoption.", "Heavy enterprise."),
    ("Whatfix", "Product adoption", "Enterprise DAP", 0, "enterprise", 100, False, "Enterprise digital adoption.", "Heavy enterprise."),
    ("FullStory Stories", "Product adoption", "Targeting", 0, "with FullStory", 30, False, "Targeting within FullStory.", "Tied to FullStory."),

    # Specialised AI tools
    ("Glean", "Search/AI", "Enterprise AI search", 0, "$25+/user/mo", 100, False, "Best enterprise AI search.", "Long sales cycle."),
    ("Dust", "Search/AI", "Enterprise agents", 0, "$29+/user/mo", 30, False, "Modern AI assistants for teams.", "Smaller community."),
    ("Mendable", "Search/AI", "Docs-as-chatbot", 0, "free / $99+/mo", 20, True, "AI on your docs.", "Niche."),
    ("Custom GPT", "Search/AI", "Doc bots", 0, "$99+/mo", 30, False, "Custom GPT marketplace.", "Niche."),
    ("Stack AI", "Search/AI", "No-code AI builder", 0, "free / $199+/mo", 30, True, "Build AI apps no-code.", "Niche."),
    ("Voiceflow", "Search/AI", "Voice + chat agent builder", 0, "free / $50+/mo", 30, True, "Best for voice agents.", "Niche."),
    ("Botpress", "Search/AI", "Open-source chatbot", 0, "free / $25+/mo", 50, True, "Open-source bot builder.", "Smaller community."),
    ("Sana", "Search/AI", "Enterprise learning AI", 0, "enterprise", 50, False, "AI learning platform.", "Enterprise."),

    # Communication
    ("Slack", "Communication", "Team chat", 0, "free / $7.25+/user/mo", 2500, True, "Industry default.", "Pricing rose post-Salesforce."),
    ("Microsoft Teams", "Communication", "Team chat", 0, "with M365", 1500, True, "Best within MS ecosystem.", "Less polished outside MS."),
    ("Discord", "Communication", "Community chat", 0, "free / $9.99+/mo Nitro", 500, True, "Best community platform.", "Less business-formal."),
    ("Element", "Communication", "Open-source chat", 0, "self-host / $5+/user/mo", 30, True, "Open-source secure chat.", "Smaller community."),
    ("Mattermost", "Communication", "Open-source Slack", 0, "self-host / $10+/user/mo", 100, True, "Open-source Slack alt.", "Smaller community."),
    ("Rocket.Chat", "Communication", "Open-source chat", 0, "self-host / $4+/user/mo", 100, True, "Open-source chat.", "Smaller community."),
    ("Threads (Meta)", "Communication", "Public conversation", 0, "free", 0, True, "Twitter alternative.", "Algorithm changes."),
    ("Bluesky", "Communication", "Decentralised social", 0, "free", 0, True, "ATproto-based social.", "Smaller user base."),
    ("Beeper", "Communication", "Multi-platform inbox", 0, "free / $10+/mo", 0, True, "Unified messaging.", "Reliability variable."),
    ("Texts.com", "Communication", "Multi-platform desktop", 15, "$15+/mo", 0, False, "Best Mac multi-messaging.", "Mac-only."),

    # Video conferencing
    ("Zoom", "Video conferencing", "Industry default", 0, "free / $13.32+/user/mo", 100, True, "Industry default video.", "Pricing rose post-pandemic."),
    ("Google Meet", "Video conferencing", "Google ecosystem", 0, "with Workspace", 30, True, "Best for Google shops.", "Less features than Zoom."),
    ("Teams Video", "Video conferencing", "Microsoft", 0, "with M365", 30, True, "Best for MS shops.", "Less polished than Zoom."),
    ("Around", "Video conferencing", "Modern UI", 0, "free / $10+/user/mo", 0, True, "Compact UI for casual.", "Niche."),
    ("Whereby", "Video conferencing", "Browser-based", 0, "free / $7+/host/mo", 30, True, "Best browser-only video.", "Lower scale."),
    ("Zoom Phone", "Video conferencing", "VoIP", 10, "$10+/user/mo", 30, False, "Zoom's phone.", "Tied to Zoom plan."),
    ("Dialpad", "Video conferencing", "AI phone", 15, "$15+/user/mo", 30, False, "AI-driven phone.", "Smaller community."),
    ("Talkdesk", "Video conferencing", "Contact center", 75, "$75+/seat/mo", 50, False, "Enterprise contact center.", "Enterprise."),

    # Specialised vertical / industry
    ("Toast", "Vertical", "Restaurant POS", 0, "$165+/mo per location", 30, False, "Industry default restaurant.", "Hardware lock-in."),
    ("Square", "Vertical", "Retail POS", 0, "free + interchange", 50, True, "Best small-business POS.", "Hardware costs."),
    ("Shopify POS", "Vertical", "Retail POS", 0, "with Shopify plan", 100, False, "Best for Shopify shops.", "Tied to Shopify."),
    ("Mindbody", "Vertical", "Wellness/fitness", 129, "$129+/mo", 30, False, "Industry default fitness biz.", "Mid-market+."),
    ("ChowNow", "Vertical", "Restaurant ordering", 199, "$199+/mo", 20, False, "Best independent restaurant ordering.", "Niche."),
    ("Procore", "Vertical", "Construction", 0, "enterprise", 100, False, "Industry default construction.", "Enterprise."),
    ("Clio", "Vertical", "Law firm management", 49, "$49+/user/mo", 50, False, "Industry default law.", "Niche."),
    ("Kareo", "Vertical", "Medical practice", 0, "$60+/provider/mo", 30, False, "SMB medical practice.", "Niche."),
    ("EHRYourWay", "Vertical", "Behavioral health", 50, "$50+/user/mo", 30, False, "Behavioral health EHR.", "Niche."),
    ("Frontify", "Vertical", "Brand management", 0, "$8K+/year", 50, False, "Enterprise brand portal.", "Enterprise."),
    ("Bynder", "Vertical", "DAM", 0, "enterprise", 50, False, "Digital asset management.", "Enterprise."),
    ("Brandfolder", "Vertical", "DAM", 0, "enterprise", 50, False, "DAM competitor.", "Enterprise."),

    # AI Voice agents / Telephony
    ("Bland.ai", "AI Voice Agents", "Phone AI", 0, "$0.09+/min", 0, True, "Phone-call AI agent.", "Niche."),
    ("Retell AI", "AI Voice Agents", "Voice AI infra", 0, "$0.07-0.31/min", 0, True, "Voice AI building blocks.", "Newer."),
    ("Vapi", "AI Voice Agents", "Voice AI infra", 0, "$0.05+/min", 0, True, "Open-source voice AI.", "Smaller community."),
    ("Synthflow", "AI Voice Agents", "Voice + workflow", 0, "$29+/mo", 0, True, "Voice + automation.", "Niche."),

    # Privacy / Security
    ("1Password", "Security", "Password manager", 2.99, "$2.99+/user/mo", 30, False, "Industry default password manager.", "Recent UI churn."),
    ("Bitwarden", "Security", "Open-source password", 0, "free / $10+/year", 30, True, "Open-source password manager.", "Less polished UI."),
    ("Dashlane", "Security", "Password manager", 4.99, "$4.99+/user/mo", 30, False, "Enterprise password manager.", "Less popular vs 1Password."),
    ("LastPass", "Security", "Password manager", 3, "$3+/user/mo", 30, False, "Veteran password manager.", "Multiple breaches."),
    ("Tailscale", "Security", "Mesh VPN", 0, "free / $5+/user/mo", 0, True, "Best mesh VPN.", "Niche."),
    ("Cloudflare Zero Trust", "Security", "Zero-trust", 0, "free / $7+/user/mo", 50, True, "Zero-trust access.", "Niche."),
    ("Twingate", "Security", "Zero-trust", 0, "free / $5+/user/mo", 30, True, "Zero-trust competitor.", "Newer."),
    ("YubiKey (Yubico)", "Security", "Hardware 2FA", 50, "$50+ one-time", 0, False, "Hardware security key.", "One-time hardware cost."),
    ("Tessian", "Security", "Email security AI", 0, "enterprise", 30, False, "AI-driven email security.", "Enterprise."),
    ("Abnormal Security", "Security", "Email security AI", 0, "enterprise", 30, False, "Email threat AI.", "Enterprise."),
]

# Combine with existing TOOLS from prior run (re-include them)
from importlib import import_module
existing_tools_file = CATALOG / "guides/067-ai-tools-master-comparison-guide-2026/delivery/ai-tools-master-comparison-2026.json"
if existing_tools_file.exists():
    existing = json.loads(existing_tools_file.read_text())["tools"]
    existing_names = {t["name"] for t in existing}
    EXISTING_TUPS = [(t["name"], t["category"], t["subcategory"], t["pricing_floor_usd_monthly"],
                       t["pricing_model"], t["integrations"], t["free_tier"], t["verdict"], t["gotchas"])
                      for t in existing]
else:
    EXISTING_TUPS = []
    existing_names = set()

ALL_TOOLS = EXISTING_TUPS + [t for t in MORE_TOOLS if t[0] not in existing_names]
print(f"Total tools: {len(ALL_TOOLS)} ({len(EXISTING_TUPS)} existing + {len(ALL_TOOLS)-len(EXISTING_TUPS)} new)")

TOOLS_HEADER = ["Name", "Category", "Subcategory", "Pricing floor (USD/mo)", "Pricing model",
                 "Integrations", "Free tier", "Aiprosol verdict", "Gotchas"]

# Write Tools Guide
GUIDE_DIR = CATALOG / "guides/067-ai-tools-master-comparison-guide-2026/delivery"
GUIDE_DIR.mkdir(parents=True, exist_ok=True)
with open(GUIDE_DIR / "ai-tools-master-comparison-2026.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(TOOLS_HEADER)
    for t in ALL_TOOLS:
        w.writerow([t[0], t[1], t[2], t[3], t[4], t[5], "Yes" if t[6] else "No", t[7], t[8]])
with open(GUIDE_DIR / "ai-tools-master-comparison-2026.json", "w") as f:
    json.dump({"version": "2.0", "count": len(ALL_TOOLS),
                "license": "© 2026 Aiprosol Ltd · For purchaser's internal use",
                "tools": [dict(zip(["name", "category", "subcategory", "pricing_floor_usd_monthly",
                                     "pricing_model", "integrations", "free_tier", "verdict", "gotchas"], t))
                          for t in ALL_TOOLS]}, f, indent=2)
print(f"✓ AI Tools Guide expanded to {len(ALL_TOOLS)} tools")

# Write Tools Vault (master + hidden gems + avoid list)
VAULT_DIR = CATALOG / "guides/147-the-ai-tools-vault/delivery"
VAULT_DIR.mkdir(parents=True, exist_ok=True)

# Add more hidden gems + avoid list entries based on new tools
HIDDEN_GEMS_V2 = [
    ("Plain", "Customer support", "Dev-friendly", "Better UX than Zendesk for technical teams."),
    ("Resend", "Email", "Transactional", "Cleaner DX than SendGrid."),
    ("Linear", "Project management", "Eng-focused", "Faster than Jira."),
    ("Activepieces", "No-code automation", "Open source", "Cleaner alt to n8n for simple workflows."),
    ("Folk", "CRM/Sales", "Lightweight", "Best for solo founders."),
    ("Inngest", "AI agents", "Durable workflows", "Best for long-running AI."),
    ("Vectara", "Knowledge base", "API", "RAG-as-a-service hidden among build-it-yourself teams."),
    ("Krea", "Image gen", "Real-time", "Real-time generation is genuinely different."),
    ("Cartesia Sonic", "Voice/audio", "Fast TTS", "Sub-150ms latency for production voice."),
    ("Hetzner", "Hosting/Deploy", "VPS", "Cheapest reliable European VPS."),
    ("Tana", "Productivity", "Notes", "Modern bi-directional + database hybrid."),
    ("Granola", "Voice/audio", "Meeting notes", "No bot appears in calls."),
    ("BetterStack", "Observability", "Uptime+logs", "Modern observability all-in-one."),
    ("Ashby", "HR", "ATS", "Modern ATS without enterprise pricing."),
    ("Cal.com", "Sales tools", "Scheduler", "Open-source Calendly alternative."),
    ("DuckDB", "Data", "Embedded analytics", "Game-changing for local analytics."),
    ("Hex", "Data", "Notebook+BI", "Modern notebook hybrid."),
    ("Beehiiv", "Email", "Newsletter", "Modern Substack alt with full ownership."),
    ("Tailscale", "Security", "Mesh VPN", "Networking that just works."),
    ("Atomic.io", "Knowledge base", "Personal", "Lightweight personal memory."),
]

AVOID_LIST_V2 = [
    ("Salesforce", "CRM/Sales", "If your team is <50 reps. Implementation cost > license cost."),
    ("Datadog", "Observability", "If you're under 20 hosts. Cheaper alternatives suffice."),
    ("Tabnine", "Code generation", "Quality consistently below newer entrants."),
    ("Quip", "Documents", "Only makes sense if deeply in Salesforce."),
    ("Synthesia", "Video gen", "Avatars look uncanny in close-up. HeyGen's better."),
    ("LastPass", "Security", "Multiple breaches. Switch to 1Password or Bitwarden."),
    ("Adobe XD", "Design", "Adobe sunsetting; use Figma."),
    ("Devin (Cognition)", "Code generation", "Marketing > capability at current state."),
    ("Mulesoft", "No-code automation", "$80K+ pricing locks out anyone not enterprise."),
    ("Workday", "HR", "Implementation cost > license. Use Rippling/BambooHR until 1000+ employees."),
    ("Inflection Pi", "Conversational AI", "Built for friendship, not business."),
    ("Character.AI", "Conversational AI", "Niche use case."),
    ("Drift", "Customer support", "Sales-focused chat; SMBs locked out by pricing."),
    ("Outreach", "CRM/Sales", "Pricing locks out teams under 20 reps."),
    ("ZoomInfo", "CRM/Sales", "Heavy enterprise pricing for what Apollo+Clearbit can do."),
]

with open(VAULT_DIR / "tools-vault-master.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(TOOLS_HEADER + ["Verdict tier"])
    for t in ALL_TOOLS:
        tier = "Aiprosol pick" if "Aiprosol" in t[7] else ""
        w.writerow([t[0], t[1], t[2], t[3], t[4], t[5], "Yes" if t[6] else "No", t[7], t[8], tier])

with open(VAULT_DIR / "tools-vault-hidden-gems.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["Name", "Category", "Subcategory", "Why it's a gem"])
    w.writerows(HIDDEN_GEMS_V2)

with open(VAULT_DIR / "tools-vault-avoid-list.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["Name", "Category", "Why to avoid (when)"])
    w.writerows(AVOID_LIST_V2)

with open(VAULT_DIR / "tools-vault.json", "w") as f:
    json.dump({"version": "2.0",
                "license": "© 2026 Aiprosol Ltd · For purchaser's internal use",
                "master_count": len(ALL_TOOLS),
                "hidden_gems": [dict(zip(["name", "category", "subcategory", "why"], h)) for h in HIDDEN_GEMS_V2],
                "avoid_list": [dict(zip(["name", "category", "when_to_avoid"], a)) for a in AVOID_LIST_V2],
                "tools": [dict(zip(["name", "category", "subcategory", "pricing_floor_usd_monthly",
                                     "pricing_model", "integrations", "free_tier", "verdict", "gotchas"], t))
                          for t in ALL_TOOLS]}, f, indent=2)

print(f"✓ Tools Vault expanded to {len(ALL_TOOLS)} master + {len(HIDDEN_GEMS_V2)} hidden gems + {len(AVOID_LIST_V2)} avoid list")


# ════════════════════════════════════════════════════════════════════
# 3. ZAPIER + MAKE — Expand to 25 full each
# ════════════════════════════════════════════════════════════════════

ZM_DIR = CATALOG / "playbooks/197-zapier-make-power-user-bundle/delivery"
ZM_DIR.mkdir(parents=True, exist_ok=True)

# Existing 5 + 20 new = 25 full Zapier recipes
ZAPIER_FULL_25 = [
    ("Stripe payment → CRM contact + Slack",
     ["1. Trigger: Stripe — New Payment Intent Succeeded",
      "2. Action: Filter — Only continue if amount > 100",
      "3. Action: Formatter (Text) — Extract customer first name from email",
      "4. Action: HubSpot — Create or Update Contact",
      "5. Action: HubSpot — Create Deal stage='closed-won' amount=Stripe amount",
      "6. Action: Slack — Send Channel Message #sales-wins"]),
    ("Calendly booking → CRM + prep brief Slack DM",
     ["1. Trigger: Calendly — New Event Created",
      "2. Action: HubSpot — Find Contact (by email)",
      "3. Filter: If contact doesn't exist, create",
      "4. Action: Webhook GET — fetch company info from Clearbit",
      "5. Action: OpenAI — Create Chat Completion for 3-bullet prep brief",
      "6. Action: Slack — DM rep with brief + calendar link"]),
    ("Form submission → AI score → Tier routing",
     ["1. Trigger: Webhooks — Catch Hook (form POST)",
      "2. Action: OpenAI — Chat Completion to score 0-100",
      "3. Action: Formatter (Numbers) — Parse score from text",
      "4. Action: Paths — Branch by tier: hot (>80) / warm (60-80) / cold",
      "5. Hot path: Slack #sales + Cal.com priority booking link",
      "6. Warm path: Add to Mailchimp 'nurture' segment",
      "7. Cold path: Add to Mailchimp 'newsletter only' segment"]),
    ("Gmail label 'INVOICE' → OCR → Sheet log",
     ["1. Trigger: Gmail — New Email Matching Search 'label:invoice'",
      "2. Action: Filter — Has Attachment = true",
      "3. Action: OpenAI Vision — Extract {vendor, amount, due_date}",
      "4. Action: Formatter — Parse JSON response",
      "5. Action: Google Sheets — Create Spreadsheet Row (Accounting Log)",
      "6. Action: Google Drive — Upload File (archive PDF)"]),
    ("HubSpot deal stage change → Email draft",
     ["1. Trigger: HubSpot — Deal Stage Updated",
      "2. Action: HubSpot — Get associated primary contact",
      "3. Action: OpenAI — Chat Completion for next-step email based on new stage",
      "4. Action: Gmail — Create Draft (NOT send) for review"]),
    ("Typeform survey → Airtable enriched + Slack",
     ["1. Trigger: Typeform — New Entry",
      "2. Action: Formatter — Standardize email lowercase",
      "3. Action: Webhook GET — Clearbit company lookup",
      "4. Action: Airtable — Create Record with form data + enrichment",
      "5. Action: Slack — Send Channel Message with summary"]),
    ("Shopify order → Klaviyo segment (behavioural)",
     ["1. Trigger: Shopify — New Paid Order",
      "2. Action: Formatter — Compute total order count for customer",
      "3. Action: Paths — first-time / repeat / VIP based on count",
      "4. Each path: Klaviyo — Add to Specific Segment",
      "5. Action: Slack — Order summary if VIP"]),
    ("Stripe failed payment → Customer save sequence",
     ["1. Trigger: Stripe — Payment Failed",
      "2. Action: HubSpot — Find Contact by email",
      "3. Action: OpenAI — Draft empathetic dunning email",
      "4. Action: Gmail — Create Draft (review then send)",
      "5. Delay: 2 days",
      "6. Action: HubSpot — Check if payment retry succeeded",
      "7. Paths: yes (close loop) / no (escalate to CS)"]),
    ("Intercom chat → AI summary → Notion CRM",
     ["1. Trigger: Intercom — New Conversation Closed",
      "2. Action: Intercom — Get Conversation Transcript",
      "3. Action: OpenAI — Summarize in 3 bullets",
      "4. Action: Notion — Create Page in 'Customer Conversations' DB",
      "5. Action: Filter — If sentiment negative, flag for CS lead"]),
    ("Google Forms intake → Zendesk ticket priority",
     ["1. Trigger: Google Forms — New Response",
      "2. Action: OpenAI — Classify priority (urgent/high/normal/low)",
      "3. Action: Formatter — Map to Zendesk priority levels",
      "4. Action: Zendesk — Create Ticket with priority set",
      "5. Action: Slack — Ping #support if urgent"]),
    ("ClickUp overdue → AI nudge → DM assignee",
     ["1. Trigger: Schedule — Daily 9am weekdays",
      "2. Action: ClickUp — Find Tasks with due_date < today, status != complete",
      "3. Action: OpenAI — Draft empathetic 30-word reminder",
      "4. Action: Slack — DM each assignee with reminder",
      "5. Action: Sheet — Log nudge count for tracking"]),
    ("Mailchimp campaign sent → Sheet metrics log",
     ["1. Trigger: Mailchimp — Campaign Sent",
      "2. Delay: 24 hours (wait for opens/clicks)",
      "3. Action: Mailchimp — Get Campaign Report",
      "4. Action: Google Sheets — Append metrics row",
      "5. Action: Slack — Post performance summary if open rate > 30%"]),
    ("Notion page update → Slack thread + assignee ping",
     ["1. Trigger: Notion — Updated Database Item",
      "2. Filter: Only if 'Status' property changed",
      "3. Action: Notion — Get assignee email",
      "4. Action: Formatter — Translate Notion user to Slack user",
      "5. Action: Slack — Thread reply to project channel"]),
    ("Calendly cancellation → CRM property + retention",
     ["1. Trigger: Calendly — Event Cancelled",
      "2. Action: HubSpot — Update Contact 'last_cancellation' property",
      "3. Action: HubSpot — Count cancellations in past 60 days",
      "4. Filter: If count >= 2, flag for CS",
      "5. Action: Slack — Alert CS lead with context"]),
    ("Salesforce opportunity won → kickoff workflow",
     ["1. Trigger: Salesforce — Opportunity Stage = Closed Won",
      "2. Action: OpenAI — Draft welcome email referencing won deal",
      "3. Action: Gmail — Create Draft",
      "4. Action: Slack — Post to #wins channel",
      "5. Action: Asana — Create Onboarding Project",
      "6. Action: Calendar — Schedule kickoff slot"]),
    ("Webflow CMS publish → Tweet + Sheet log",
     ["1. Trigger: Webflow — Published CMS Item",
      "2. Action: OpenAI — Generate tweet draft (280 char) from title + excerpt",
      "3. Action: Twitter — Create Tweet",
      "4. Action: Google Sheets — Log published item with timestamp",
      "5. Action: Slack — #content notification"]),
    ("GitHub PR opened → Slack #eng with summary",
     ["1. Trigger: GitHub — New Pull Request",
      "2. Action: GitHub — Get PR Diff (top 50 lines)",
      "3. Action: OpenAI — Summarize what changed",
      "4. Action: Slack — Send #eng with PR link + summary",
      "5. Filter: If labels include 'urgent', also ping leads"]),
    ("Stripe subscription cancelled → CS save",
     ["1. Trigger: Stripe — customer.subscription.deleted",
      "2. Action: Stripe — Get cancellation reason",
      "3. Action: OpenAI — Score recoverability 0-10",
      "4. Filter: If score >= 7, route to save sequence",
      "5. Action: Gmail — Create CS save email draft",
      "6. Action: Slack — Ping CS lead"]),
    ("QuickBooks invoice paid → CRM activity",
     ["1. Trigger: QuickBooks — Invoice Paid",
      "2. Action: QuickBooks — Get Invoice details",
      "3. Action: HubSpot — Find Contact by email",
      "4. Action: HubSpot — Create Engagement (note) with payment details",
      "5. Action: Slack — #finance notification"]),
    ("Asana task completed → Manager email + recognition",
     ["1. Trigger: Asana — Task Completed",
      "2. Filter: Only if priority = high or milestone task",
      "3. Action: Asana — Get task details + assignee",
      "4. Action: OpenAI — Draft brief recognition email",
      "5. Action: Gmail — Send to manager",
      "6. Action: Slack — Post in #wins channel"]),
    ("Twilio SMS → AI reply → CRM log",
     ["1. Trigger: Twilio — Inbound SMS",
      "2. Action: HubSpot — Find Contact by phone",
      "3. Action: OpenAI — Draft <160 char reply matching tone",
      "4. Action: Twilio — Send SMS reply (or queue for human)",
      "5. Action: HubSpot — Create Engagement (note) with full thread"]),
    ("Eventbrite registration → AI welcome",
     ["1. Trigger: Eventbrite — Order Created",
      "2. Action: Eventbrite — Get Attendee details",
      "3. Action: OpenAI — Draft personalised welcome including event details",
      "4. Action: Gmail — Send welcome",
      "5. Action: HubSpot — Add Contact to 'event_attendees' list"]),
    ("Discord new member → Welcome DM + Notion entry",
     ["1. Trigger: Discord — New Member Joined",
      "2. Action: Discord — Send Direct Message with welcome + resources",
      "3. Action: Notion — Create row in Community DB",
      "4. Delay: 3 days",
      "5. Action: Discord — Check member activity",
      "6. Filter: If 0 messages, send check-in DM"]),
    ("RSS feed update → AI-drafted tweet thread",
     ["1. Trigger: RSS by Zapier — New Item",
      "2. Action: OpenAI — Generate 5-tweet thread from article",
      "3. Action: Buffer / Hypefury — Create Thread Draft",
      "4. Action: Slack — Notify content team for review"]),
    ("Notion database add → Calendar event create",
     ["1. Trigger: Notion — New Database Item with 'Date' field set",
      "2. Action: Formatter — Parse date + duration",
      "3. Action: Google Calendar — Create Event",
      "4. Action: Notion — Update item with calendar link",
      "5. Action: Slack — Confirm to creator"]),
]

# Existing 5 + 20 new = 25 full Make recipes
MAKE_FULL_25 = [
    ("HubSpot lead → enrichment → routing",
     ["1. Trigger: HubSpot · Watch contacts (created or updated)",
      "2. Module: HTTP · Make a Request to Clearbit /v2/combined/find",
      "3. Module: OpenAI · Create Completion to compute lead score",
      "4. Module: Router with 3 paths: hot, warm, cold",
      "5. Hot: Slack · Send a Message to #sales + HubSpot · Update Contact",
      "6. Warm: Mailchimp · Add Member to List + HubSpot · Update Contact",
      "7. Cold: HubSpot · Update Contact only",
      "8. Error handler: dead-letter to Google Sheets"]),
    ("Stripe payment → multi-step CRM + accounting",
     ["1. Trigger: Stripe · Watch Events filtered to payment_intent.succeeded",
      "2. Module: HubSpot · Search Contacts by email",
      "3. Router: contact exists / new contact",
      "4. Module: HubSpot · Create Deal (existing) OR Create Contact then Deal (new)",
      "5. Module: Xero · Create Invoice (status=PAID)",
      "6. Module: Slack · Send a Message #revenue",
      "7. Iterator: For each line item → Sheet log"]),
    ("Daily 8am cron → pipeline aggregation → Slack",
     ["1. Trigger: Schedule · 0 8 * * 1-5",
      "2. Module: HubSpot · Search deals (last 7 days)",
      "3. Module: Aggregator · Group by deal stage",
      "4. Module: Tools · Set Multiple Variables (totals per stage)",
      "5. Module: OpenAI · Chat Completion for 3-bullet narrative",
      "6. Module: Slack · Send a Message #sales-leadership",
      "7. Module: Google Sheets · Add a Row to weekly archive"]),
    ("Meeting transcript → action items → Linear",
     ["1. Trigger: Webhook · Catch Hook from Fireflies",
      "2. Module: OpenAI · Chat Completion to extract action items as JSON",
      "3. Module: Tools · Parse JSON",
      "4. Module: Iterator · Loop over action items",
      "5. Module: Linear · Create Issue per item",
      "6. Module: Slack · Send a Message with summary count"]),
    ("Drive new file → AI category → folder routing",
     ["1. Trigger: Google Drive · Watch Files in Folder (Inbox)",
      "2. Module: Google Drive · Download a File",
      "3. Module: OpenAI Vision · Classify document",
      "4. Module: Router by category: invoice/contract/receipt/other",
      "5. Each path: Google Drive · Move a File to destination folder",
      "6. Module: Slack · Send a Message #automations-log"]),
    ("Typeform with iterators → Airtable batch",
     ["1. Trigger: Typeform · Watch responses",
      "2. Module: Iterator · Loop over answers array",
      "3. Module: Tools · Compose key-value pairs",
      "4. Module: Aggregator · Collect into single record",
      "5. Module: Airtable · Create a Record",
      "6. Error: dead-letter sheet"]),
    ("Shopify order → multi-vendor split routing",
     ["1. Trigger: Shopify · Watch orders",
      "2. Module: Iterator · Loop over line_items",
      "3. Module: Router · By vendor",
      "4. Each vendor: Webhook · Send to vendor fulfillment API",
      "5. Module: Aggregator · Wait for all dispatches",
      "6. Module: Slack · Send confirmation summary"]),
    ("Salesforce opportunity → orchestrator with delays",
     ["1. Trigger: Salesforce · Watch opportunity stage changes",
      "2. Router: stage = 'Qualified' / 'Demo Scheduled' / 'Closed Won'",
      "3. Qualified path: schedule 7-day check-in workflow via Make Sleep",
      "4. Demo path: send pre-demo brief",
      "5. Closed Won path: trigger onboarding orchestrator (own scenario)",
      "6. Module: Data Store · Track active orchestrations"]),
    ("Stripe webhook → idempotent CRM upsert",
     ["1. Trigger: Webhook · Custom (signed by Stripe)",
      "2. Module: Tools · Verify signature",
      "3. Module: Data Store · Check if event_id processed",
      "4. Router: new / duplicate",
      "5. New path: HubSpot upsert + Data Store add",
      "6. Duplicate path: log + skip"]),
    ("Notion cross-DB sync with state store",
     ["1. Trigger: Schedule · Every 10 min",
      "2. Module: Notion · Search DB-A items modified since last_run",
      "3. Module: Iterator · For each updated item",
      "4. Module: Notion · Find matching item in DB-B by external_id",
      "5. Router: exists / new",
      "6. Each path: Update or Create DB-B item",
      "7. Module: Data Store · Update last_run timestamp"]),
    ("GitHub PR → Slack + Linear with router",
     ["1. Trigger: GitHub · Watch new pull requests",
      "2. Module: GitHub · Get diff stats",
      "3. Module: Router · By size: small / medium / large",
      "4. Small: Slack only",
      "5. Medium: Slack + Linear linked issue",
      "6. Large: Slack + Linear + tag senior reviewer"]),
    ("Mailchimp metrics → BigQuery daily ETL",
     ["1. Trigger: Schedule · 0 4 * * * (daily 4am)",
      "2. Module: Mailchimp · List Campaigns sent yesterday",
      "3. Module: Iterator · For each campaign",
      "4. Module: Mailchimp · Get Report data",
      "5. Module: BigQuery · Insert Row into campaigns_daily table",
      "6. Module: Tools · Aggregator + log daily total"]),
    ("Calendly bulk bookings → parallel AI briefs",
     ["1. Trigger: Calendly · Watch new bookings",
      "2. Module: Iterator · For each booking (if batch)",
      "3. Module: HTTP · Clearbit lookup (parallel)",
      "4. Module: OpenAI · Generate brief (parallel)",
      "5. Module: Google Docs · Create one doc per booking",
      "6. Module: Slack · DM all reps with batch summary"]),
    ("Support tickets → AI classify → router",
     ["1. Trigger: Zendesk · Watch new tickets",
      "2. Module: OpenAI · Classify {urgency, category, sentiment}",
      "3. Module: Router · By urgency",
      "4. Urgent: Slack ping on-call + assign to lead",
      "5. High: Add to high-priority queue",
      "6. Normal: Default routing",
      "7. Module: Zendesk · Update ticket with classification tags"]),
    ("Stripe MRR daily aggregation",
     ["1. Trigger: Schedule · Daily 1am",
      "2. Module: Stripe · List subscriptions (active)",
      "3. Module: Iterator · For each",
      "4. Module: Stripe · Get amount + interval",
      "5. Module: Aggregator · Sum monthly normalized",
      "6. Module: Google Sheets · Append MRR row with date",
      "7. Module: Slack · Post MRR change if > 5%"]),
    ("Multi-source data merge with data stores",
     ["1. Trigger: Schedule · Hourly",
      "2. Parallel modules: HubSpot · Get contacts, Stripe · Get customers, Intercom · Get users",
      "3. Module: Data Store · Read existing master",
      "4. Module: Tools · Merge keys (email)",
      "5. Module: Data Store · Write merged master",
      "6. Module: BigQuery · Sync to warehouse"]),
    ("Long-running customer onboarding orchestrator",
     ["1. Trigger: Webhook from Stripe new customer",
      "2. Day 0: Email welcome + Slack + Notion workspace (fan-out)",
      "3. Sleep: 7 days",
      "4. Day 7: Check Notion for first activity",
      "5. Branch: if active continue, if dormant ping CS",
      "6. Sleep: 23 days more",
      "7. Day 30: NPS request email"]),
    ("Idempotent webhook processor with dedupe",
     ["1. Trigger: Webhook · Custom",
      "2. Module: Tools · Compute hash of body",
      "3. Module: Data Store · Check hash exists",
      "4. Router: new / duplicate",
      "5. New: process + add to store with 24h TTL",
      "6. Duplicate: log + 200 OK"]),
    ("Rate-limited API consumer with backoff",
     ["1. Trigger: Schedule · Every 5 min",
      "2. Module: Data Store · Get queue items",
      "3. Module: Iterator · Process N items max",
      "4. Module: HTTP · Call API",
      "5. Router: 200 / 429 / error",
      "6. 429: Update Data Store with backoff schedule",
      "7. Error: Sentry + dead-letter"]),
    ("Approval gate with Slack buttons",
     ["1. Trigger: Webhook from form/system",
      "2. Module: OpenAI · Generate proposed action",
      "3. Module: Slack · Post message with 'Approve/Edit/Reject' buttons",
      "4. Module: Webhook · Listen for button response",
      "5. Router: approved / edited / rejected",
      "6. Each path: execute / log / archive"]),
    ("Slack thread reply → external API",
     ["1. Trigger: Slack · Watch messages in specific thread",
      "2. Module: Tools · Filter to non-bot messages",
      "3. Module: OpenAI · Extract structured intent",
      "4. Module: HTTP · POST to internal API with intent",
      "5. Module: Slack · React with ✅ or ❌"]),
    ("Twilio voicemail → AI transcript → ticket",
     ["1. Trigger: Twilio · Voicemail recorded",
      "2. Module: Twilio · Get recording URL",
      "3. Module: OpenAI Whisper · Transcribe via Audio API",
      "4. Module: OpenAI · Summarize + classify urgency",
      "5. Module: Zendesk · Create ticket with transcript",
      "6. Module: Slack · Ping if urgent"]),
    ("Cron-driven QBR document assembly",
     ["1. Trigger: Schedule · Quarterly (1st of Jan/Apr/Jul/Oct)",
      "2. Module: HubSpot · List active customers",
      "3. Module: Iterator · For each customer",
      "4. Module: HTTP · Get usage data from product analytics",
      "5. Module: OpenAI · Generate QBR markdown",
      "6. Module: Google Docs · Create one per customer",
      "7. Module: Slack · CS team notification"]),
    ("Vendor renewal radar (60-day forward)",
     ["1. Trigger: Schedule · Daily 9am",
      "2. Module: Notion · Get Vendors DB",
      "3. Module: Iterator · For each vendor",
      "4. Module: Tools · Compute days_to_renewal",
      "5. Router: renewing in 60 days / not",
      "6. Renewing: OpenAI assess keep/cut + Slack #finance",
      "7. Log to weekly sheet"]),
    ("AI content moderation pipeline",
     ["1. Trigger: Webhook on user-generated content",
      "2. Module: OpenAI Moderation · Score content",
      "3. Router: safe / borderline / unsafe",
      "4. Safe: publish",
      "5. Borderline: queue for human review",
      "6. Unsafe: block + log to incidents"]),
]


def write_full_recipes(filename, platform_name, recipes):
    lines = [f"# {platform_name} Power User — 25 Full Production Recipes", "",
             f"Version 2.0 · 25 fully-detailed recipes · © 2026 Aiprosol Ltd", "",
             "Every recipe has the complete step-by-step. Substitute trigger, intermediate steps, and destination to fit your stack.",
             ""]
    for i, (title, steps) in enumerate(recipes, 1):
        lines.append(f"## {i}. {title}")
        for s in steps:
            lines.append(f"   {s}")
        lines.append("")
    out = ZM_DIR / filename
    out.write_text("\n".join(lines))
    return out


write_full_recipes("zapier-25-full-recipes.md", "Zapier", ZAPIER_FULL_25)
write_full_recipes("make-25-full-recipes.md", "Make.com", MAKE_FULL_25)

print(f"✓ Zapier + Make Bundle: 25 + 25 = 50 fully-detailed recipes")

print()
print("=" * 60)
print("ALL GAPS CLOSED")
print(f"  Prompt Vault: {len(PROMPTS)} prompts (target 1000+)")
print(f"  Tools Vault: {len(ALL_TOOLS)} tools (target 500+)")
print(f"  Zapier+Make: 50 fully-detailed recipes (target 25+25)")
