#!/usr/bin/env python3
"""
Aiprosol — Generate branded cover images + thumbnails for every product,
update products.json with rich descriptions, write to web/public/products/.
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import json
import os
import textwrap

WEB = Path("/Users/user/Airprosol/web")
PUBLIC = WEB / "public" / "products"
PUBLIC.mkdir(parents=True, exist_ok=True)
GUMROAD_COVERS = Path("/Users/user/Airprosol/products catalogue/_covers")
GUMROAD_COVERS.mkdir(parents=True, exist_ok=True)

# Aiprosol brand palette
VIOLET = (139, 92, 246)         # #8B5CF6
LIGHT_VIOLET = (192, 132, 252)  # #C084FC
DEEP_PURPLE = (88, 28, 135)     # #581C87
BG_DARK = (10, 6, 19)           # #0A0613
BG_VIOLET = (26, 20, 40)        # #1A1428
TEXT_LIGHT = (250, 248, 255)    # #FAF8FF
TEXT_DIM = (203, 213, 225)      # #CBD5E1
TEXT_MUTED = (148, 163, 184)    # #94A3B8

# Find system fonts
def find_font(names, size):
    candidates = [
        "/System/Library/Fonts/SFNS.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/Arial.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Avenir Next.ttc",
        "/Library/Fonts/Roboto-Bold.ttf",
        "/Library/Fonts/Roboto-Regular.ttf",
    ]
    for name in names:
        for ext in ['.ttf', '.ttc', '.otf']:
            for prefix in ['/System/Library/Fonts/', '/Library/Fonts/', '/System/Library/Fonts/Supplemental/']:
                path = prefix + name + ext
                if os.path.exists(path):
                    try:
                        return ImageFont.truetype(path, size)
                    except Exception:
                        pass
    for c in candidates:
        if os.path.exists(c):
            try:
                return ImageFont.truetype(c, size)
            except Exception:
                pass
    return ImageFont.load_default()


def get_fonts():
    return {
        "huge": find_font(["Helvetica Bold", "Arial Bold", "Roboto-Bold"], 72),
        "title": find_font(["Helvetica Bold", "Arial Bold", "Roboto-Bold"], 60),
        "title_med": find_font(["Helvetica Bold", "Arial Bold", "Roboto-Bold"], 48),
        "subtitle": find_font(["Helvetica", "Arial", "Roboto-Regular"], 32),
        "body": find_font(["Helvetica", "Arial", "Roboto-Regular"], 22),
        "small": find_font(["Helvetica Bold", "Arial Bold", "Roboto-Bold"], 18),
        "tiny": find_font(["Helvetica", "Arial", "Roboto-Regular"], 14),
        "price": find_font(["Helvetica Bold", "Arial Bold", "Roboto-Bold"], 38),
    }


def make_gradient(width, height, top, bottom):
    """Create vertical gradient image."""
    img = Image.new("RGB", (width, height), top)
    draw = ImageDraw.Draw(img)
    for y in range(height):
        ratio = y / height
        r = int(top[0] * (1 - ratio) + bottom[0] * ratio)
        g = int(top[1] * (1 - ratio) + bottom[1] * ratio)
        b = int(top[2] * (1 - ratio) + bottom[2] * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b))
    return img


def make_diagonal_gradient(width, height, c1, c2):
    """Diagonal gradient for more interesting backgrounds."""
    img = Image.new("RGB", (width, height), c1)
    pixels = img.load()
    for y in range(height):
        for x in range(width):
            ratio = (x + y) / (width + height)
            r = int(c1[0] * (1 - ratio) + c2[0] * ratio)
            g = int(c1[1] * (1 - ratio) + c2[1] * ratio)
            b = int(c1[2] * (1 - ratio) + c2[2] * ratio)
            pixels[x, y] = (r, g, b)
    return img


def add_radial_glow(img, center, radius, color, intensity=0.3):
    """Add a radial color glow at a position (simulates light)."""
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    cx, cy = center
    for r in range(int(radius), 0, -8):
        alpha = int(intensity * 255 * (1 - r / radius))
        overlay_draw.ellipse((cx - r, cy - r, cx + r, cy + r),
                             fill=(*color, alpha))
    blurred = overlay.filter(ImageFilter.GaussianBlur(radius=12))
    img_rgba = img.convert("RGBA")
    img_rgba.alpha_composite(blurred)
    return img_rgba.convert("RGB")


def draw_aiprosol_mark(draw, x, y, size=28):
    """Draw the diamond/lozenge Aiprosol mark."""
    # Two overlapping rotated squares — gradient feel
    half = size // 2
    diamond_pts = [(x, y - half), (x + half, y), (x, y + half), (x - half, y)]
    draw.polygon(diamond_pts, fill=VIOLET, outline=LIGHT_VIOLET)
    # Smaller inner diamond
    s2 = size // 3
    inner = [(x, y - s2), (x + s2, y), (x, y + s2), (x - s2, y)]
    draw.polygon(inner, fill=LIGHT_VIOLET)


def draw_aiprosol_logo(draw, x, y, fonts):
    """Draw 'Aiprosol' wordmark with diamond mark."""
    draw_aiprosol_mark(draw, x + 18, y + 18, 30)
    draw.text((x + 50, y + 2), "Aiprosol", font=fonts["small"], fill=TEXT_LIGHT)


def wrap_text(text, font, max_width, draw):
    """Word-wrap text to fit max_width pixels."""
    words = text.split()
    lines = []
    current = []
    for word in words:
        test = " ".join(current + [word])
        bbox = draw.textbbox((0, 0), test, font=font)
        if bbox[2] - bbox[0] <= max_width:
            current.append(word)
        else:
            if current:
                lines.append(" ".join(current))
            current = [word]
    if current:
        lines.append(" ".join(current))
    return lines


def make_cover(product, fonts, size=(1280, 720)):
    """Build a 1280x720 product cover image."""
    width, height = size
    # Diagonal gradient background
    img = make_diagonal_gradient(width, height, BG_DARK, BG_VIOLET)

    # Add a violet glow in the top-right
    img = add_radial_glow(img, (width - 200, 200), 400, VIOLET, 0.25)
    # Add a lighter violet glow bottom-left
    img = add_radial_glow(img, (200, height - 100), 300, LIGHT_VIOLET, 0.15)

    draw = ImageDraw.Draw(img)

    # Top-left: logo
    draw_aiprosol_logo(draw, 60, 50, fonts)

    # Top-right: category badge
    cat = product["category"].upper()
    bbox = draw.textbbox((0, 0), cat, font=fonts["tiny"])
    cat_w = bbox[2] - bbox[0] + 24
    cat_h = 30
    bx = width - cat_w - 60
    by = 50
    draw.rounded_rectangle((bx, by, bx + cat_w, by + cat_h), radius=15,
                            outline=VIOLET, width=2, fill=BG_DARK)
    draw.text((bx + 12, by + 7), cat, font=fonts["tiny"], fill=LIGHT_VIOLET)

    # Big icon on top-right (emoji from product["icon"])
    if product.get("icon"):
        icon_font = find_font(["Apple Color Emoji"], 120)
        try:
            # Apple emoji font handling
            draw.text((width - 180, 100), product["icon"], font=icon_font, embedded_color=True)
        except Exception:
            pass

    # Main title (centred-left)
    title = product["name"]
    title_font = fonts["title"]
    title_lines = wrap_text(title, title_font, 800, draw)
    # If too many lines, switch to medium
    if len(title_lines) > 2:
        title_font = fonts["title_med"]
        title_lines = wrap_text(title, title_font, 900, draw)

    y_pos = height // 2 - (len(title_lines) * 64) // 2
    for line in title_lines:
        # Draw with gradient effect by stamping the same text in two colours
        # First the darker behind for depth
        draw.text((62, y_pos + 4), line, font=title_font, fill=DEEP_PURPLE)
        draw.text((60, y_pos), line, font=title_font, fill=TEXT_LIGHT)
        y_pos += int(title_font.size * 1.05)

    # Subtitle / shortDescription wrapped to 700px
    sd = product.get("shortDescription", "")
    if sd:
        sub_lines = wrap_text(sd, fonts["body"], 950, draw)[:3]  # max 3 lines
        sy = y_pos + 20
        for line in sub_lines:
            draw.text((60, sy), line, font=fonts["body"], fill=TEXT_DIM)
            sy += 28

    # Price tag bottom-left
    price = f"${product['price']}"
    draw.rounded_rectangle((60, height - 80, 220, height - 30), radius=25,
                            fill=VIOLET)
    draw.text((90, height - 70), price, font=fonts["price"], fill=TEXT_LIGHT)

    # Bottom-right: Aiprosol URL
    url = "aiprosol.com"
    bbox = draw.textbbox((0, 0), url, font=fonts["small"])
    uw = bbox[2] - bbox[0]
    draw.text((width - uw - 60, height - 55), url, font=fonts["small"], fill=TEXT_MUTED)

    return img


def make_thumbnail(product, fonts, size=(800, 500)):
    """Build smaller card image — clean layout."""
    width, height = size
    img = make_diagonal_gradient(width, height, BG_VIOLET, BG_DARK)
    img = add_radial_glow(img, (width // 2, height // 3), 300, VIOLET, 0.20)
    draw = ImageDraw.Draw(img)

    # Top: icon
    if product.get("icon"):
        icon_font = find_font(["Apple Color Emoji"], 90)
        try:
            draw.text((40, 30), product["icon"], font=icon_font, embedded_color=True)
        except Exception:
            pass

    # Top-right: price
    price = f"${product['price']}"
    bbox = draw.textbbox((0, 0), price, font=fonts["price"])
    pw = bbox[2] - bbox[0]
    draw.rounded_rectangle((width - pw - 80, 30, width - 30, 90), radius=22, fill=VIOLET)
    draw.text((width - pw - 55, 36), price, font=fonts["price"], fill=TEXT_LIGHT)

    # Title
    title_font = fonts["title_med"]
    title_lines = wrap_text(product["name"], title_font, 720, draw)
    if len(title_lines) > 2:
        title_font = find_font(["Helvetica Bold", "Arial Bold"], 36)
        title_lines = wrap_text(product["name"], title_font, 720, draw)

    y = height // 2 - 30
    for line in title_lines:
        draw.text((42, y + 3), line, font=title_font, fill=DEEP_PURPLE)
        draw.text((40, y), line, font=title_font, fill=TEXT_LIGHT)
        y += int(title_font.size * 1.05)

    # Category badge bottom-left
    cat = product["category"]
    cat_bbox = draw.textbbox((0, 0), cat, font=fonts["tiny"])
    cw = cat_bbox[2] - cat_bbox[0] + 24
    by = height - 55
    draw.rounded_rectangle((40, by, 40 + cw, by + 28), radius=14,
                            outline=LIGHT_VIOLET, width=2)
    draw.text((52, by + 6), cat, font=fonts["tiny"], fill=LIGHT_VIOLET)

    # Logo bottom-right
    draw_aiprosol_mark(draw, width - 50, height - 35, 24)

    return img


# ────────────────────────────────────────────────────────────────────────
# Load products + define richer long descriptions
# ────────────────────────────────────────────────────────────────────────

PRODUCTS_JSON = WEB / "src" / "content" / "products.json"
products = json.loads(PRODUCTS_JSON.read_text())

# Map of slug → enriched longDescription + features list
ENRICHMENTS = {
    "automation-roi-pitch-deck-template": {
        "longDescription": "A 25-slide PowerPoint template for justifying automation investment to your board, exec team, or finance partner. Comes with pre-built financial slots (current state, projected savings, payback), customisable case-study slides (5 slots), and complete speaker notes including the two hardest questions you'll get on each slide — with answers. Drop your numbers into the {{Variable}} placeholders and present in 24 hours. Includes a 1-page output companion that summarises the case in 5 numbers — print it, screenshot it, attach to a Slack DM.",
        "features": [
            "25 slides covering cover, agenda, problem, current state, approach, savings, payback, sensitivity, 3 case studies, implementation, risks, vendor decisions, security, measurement, year-2 vision, the ask, next steps, 4 appendices, glossary",
            "Aiprosol dark-violet brand theme (re-skin in 10 minutes if you have a corporate brand)",
            "Speaker notes on every slide with the 2 hardest questions + answers",
            "{{Variable}} placeholders for Your Company, Revenue, Headcount, Implementation Cost, Projected Savings, Payback Months",
            "5 pre-formatted case-study slides with green-metric callouts",
            "PowerPoint + Keynote + Google Slides compatible",
        ],
    },
    "business-process-audit-checklist": {
        "longDescription": "A 50-question audit that finds your highest-ROI automation candidates in under 90 minutes. Built for operators who suspect they have automation opportunities but don't know where to start. Includes the interactive HTML checklist (open in any browser, score yourself, export results as JSON), a scoring worksheet that maps answers to an automation-readiness tier per dimension, a 1-page Opportunity Map output template ready to share with stakeholders, and reference notes on the 12 patterns seen in 80% of audits.",
        "features": [
            "50 questions across 5 dimensions (10 each): People, Process, Data, Tools, Outcomes",
            "Interactive HTML checklist with auto-scoring + visual bars + tier badges",
            "Maps each highest-scoring dimension to the matching Aiprosol product",
            "Export results as JSON for sharing or quarter-over-quarter comparison",
            "12 common findings reference with recommended automation pattern per finding",
            "1-page Opportunity Map template (stakeholder-ready)",
            "Includes a 15-minute clarifying-call credit",
        ],
    },
    "ai-automation-roi-calculator": {
        "longDescription": "The model that turns 'this would save us a bunch of time' into a defensible board-ready financial case. Excel + Google Sheets compatible. Project savings, payback period, and 12-month NPV for any automation project. 22 inputs (volume, time, fully-loaded labour cost, tool cost, implementation cost, adoption ramp, risk-adjusted confidence) drive live formulas that auto-update charts and a 1-page output summary.",
        "features": [
            "4 sheets: Inputs, Calculations, 12-Month Projection, Output (1-page)",
            "22 input cells (yellow-highlighted) with notes column",
            "Live formulas: hours saved, monthly $ saved, payback months, 12-month NPV at 8% discount, ROI multiple, sensitivity",
            "Adoption ramp curve modelling (Month 1-3, 3-6, 6+)",
            "Auto-updating cumulative cash flow line chart",
            "1-page output worksheet — print/screenshot for executive review",
            "Worked example using a real Aiprosol case study",
        ],
    },
    "30-day-business-automation-challenge": {
        "longDescription": "30 daily 15-minute exercises that compound into 30 working business automations and ~32-48 hours/week reclaimed by Day 30. Every day has a full recipe with steps, success criteria, common pitfalls, and a measurable saving. Days 1-7 set up your control panel and ship the first few automations. Days 8-21 stack operations, sales, and customer automations. Days 22-30 build the meta-layer that monitors all your automations. Now includes the 25 importable n8n workflow JSON files from the Workflow Playbook as a starter library.",
        "features": [
            "30 daily recipes, each 15-25 minutes, with success criteria + pitfalls",
            "Week 1: Foundation (control panel, Stripe log, Gmail classifier, FAQ responder, CRM auto-create, meeting auto-book, daily metrics digest)",
            "Week 2: Sales + customer (attribution, no-show prevention, post-call follow-up, stale-deal nudge, onboarding kickoff, renewal reminders, health digest)",
            "Week 3: Operations (invoice routing, expense receipts, content scheduling, channel summary, action item extraction, document filing, weekly review)",
            "Week 4: Compounding (contact research, customer feedback loop, competitor monitoring, content generation, vendor renewals, hire triage, cross-sell triggers, annual review, meta-automation)",
            "References specific n8n workflow JSONs from the included library",
            "Private Slack channel for participants",
        ],
    },
    "ai-tools-master-comparison-guide-2026": {
        "longDescription": "Side-by-side comparison of 545+ AI tools across 23 categories. Each tool rated on capability dimensions (prompt control, model quality, speed, cost, integrations, team features, compliance), with real pricing (not marketing pricing), free tier availability, integrations count, the Aiprosol verdict (1-line opinion), and the gotchas the marketing pages won't tell you. CSV + JSON format. Quarterly refresh schedule.",
        "features": [
            "545 AI tools curated and rated",
            "23 categories: Conversational AI, Code gen, Image gen, Video gen, Voice, Knowledge/RAG, No-code, CRM, Email, Analytics, PM, Docs, Support, Hosting, Observability, AI agents, Storage, Marketing, Design, HR, Finance, Legal, Communication, and more",
            "CSV format for spreadsheet manipulation, JSON for programmatic use",
            "Per-tool fields: name, category, subcategory, pricing floor (USD/mo), pricing model, integrations count, free tier yes/no, Aiprosol verdict, gotchas",
            "2026 trend notes: emerging, plateauing, consolidating segments",
            "Quarterly refreshes through 2026",
        ],
    },
    "the-starter-bundle": {
        "longDescription": "Three foundation tools for justifying and tracking automation ROI. Bundled at $79 — saves $22 vs the $101 you'd pay buying separately. The ROI Pitch Deck Template ($17) gives you a 25-slide presentation framework. The Business Process Audit Checklist ($37) finds your top opportunities in 90 minutes. The AI Automation ROI Calculator ($47) turns those opportunities into a defensible financial case with payback periods and 12-month NPV.",
        "features": [
            "1. Automation ROI Pitch Deck Template ($17 standalone) — 25-slide PowerPoint with branded theme, speaker notes, variable placeholders",
            "2. Business Process Audit Checklist ($37 standalone) — 50-question interactive HTML audit with auto-scoring",
            "3. AI Automation ROI Calculator ($47 standalone) — XLSX with 22 inputs, live formulas, payback analysis, charts",
            "How to sequence: Run the Audit → Plug top 3 into the Calculator → Drop winning numbers into the Pitch Deck",
            "Total reading + setup time: ~3 hours; total time-to-board-presentation: 24 hours",
        ],
    },
    "global-business-automation-starter-pack": {
        "longDescription": "Your first 30 days of business automation, no consultants required. Built for solo founders, small agencies, and traditional SMBs with under $5M revenue. Recommends a specific $60-$200/month tool stack (5 tools, with exact rationale for each pick), gives you 10 importable n8n workflow JSONs covering the most common SMB use cases, and a day-by-day playbook for the first 30 days.",
        "features": [
            "10 importable n8n workflows: contact form → email + log, Stripe → Sheet + Slack, Gmail AI classifier, calendar prep brief, social mentions → Slack, invoice → accounting, form → simple CRM, weekly Stripe summary, 30-day NPS pulse, meta-automation monitor",
            "Quick-Start Audit (15-min self-diagnosis)",
            "Recommended 5-tool starter stack with rationale per pick + monthly cost transparency",
            "30-day playbook: Day 1 setup → Day 30 fully-handed-off automation library",
            "Failure-mode reference: 8 ways small-business automation typically breaks + the monitoring to catch each",
            "Sized for solo founders, agencies under 20 people, traditional SMBs",
        ],
    },
    "workflow-automation-playbook": {
        "longDescription": "The strategic and tactical guide to designing, building, and running automated workflows that survive a year in production. Built for founders, ops leads, and engineers building their first or fifth production automation. Now includes 25 importable n8n workflow JSON files — one per template promised in the playbook.",
        "features": [
            "7 core patterns documented: Linear pipeline · Branching by classifier · Fan-out · Scheduled aggregation · Polling-with-state · Approval gate · Long-running orchestrator",
            "5 anti-patterns: Stack of band-aids · Mystery monolith · Set and forget · AI as the trigger · Silent automation",
            "25 importable n8n workflow JSON files (Sales 5 · Customer Success 5 · Operations 5 · Finance 5 · Marketing 5)",
            "Operator's checklist: 23 questions to ask before shipping any automation",
            "Migration map: existing manual process → automated workflow in 6 steps",
            "Build vs buy vs service decision framework",
            "Health-check questions for quarterly review",
        ],
    },
    "lead-generation-automation-playbook": {
        "longDescription": "The complete automated lead-generation system: capture, score, route, nurture, convert. Email templates, scoring formulas, sequence specs, dashboard designs. Plus 12 importable n8n workflow JSON files that automate every layer of the system. If you implement it end-to-end (~3 weekends of work), you'll have: a lead-capture surface, an automated scoring engine, a smart routing layer, a 5-touch nurture sequence, a conversion-optimised handoff to sales, and a dashboard.",
        "features": [
            "12 importable n8n workflows: 4-component scoring (FIT/INTENT/ENGAGEMENT/URGENCY), AI chat qualifier → email capture, demo booking → prep brief, suppression + geographic routing, 5-touch nurture sequence (each day separately), round-robin rep assignment with SLA, weekly scoring iteration loop, daily lead-gen dashboard",
            "4-component scoring model with concrete point allocations (40 FIT + 30 INTENT + 20 ENGAGEMENT + 10 URGENCY)",
            "5-touch nurture sequence with subjects, body, and send-time data for each email",
            "Routing decision tree + 5-min SLA infrastructure",
            "Weekly closed-loop iteration system to make scoring smarter over time",
            "Dashboard spec with key metrics, leading indicators, targets",
            "Whole stack runs on $50-$100/month at SMB scale",
        ],
    },
    "chatgpt-business-prompt-vault": {
        "longDescription": "1,008+ production-tested prompts for sales, marketing, operations, finance, HR, product, customer success, and personal productivity. Not novelty prompts — prompts that turn into real outputs you'd actually use at work. Each prompt is tested in ChatGPT (4o + 4.5) and Claude (Sonnet + Opus), comes with input variables you fill in, the exact phrasing that triggers the best output, and notes on which model handles it best. JSON for programmatic use + Markdown index for browsing.",
        "features": [
            "1,008 prompts (target was 1000+) across 8 main categories and 80+ subcategories",
            "Sales (~250 prompts): cold outreach × multiple openers/personas/industries, follow-ups by timing, objection handling, LinkedIn outreach, call prep, proposals, negotiation, vertical-specific",
            "Marketing (~200): channel-specific campaigns, subject lines, landing pages, ads, content formats, SEO, press, win/loss",
            "Operations (~200): SOPs, meetings, status updates, decisions, hiring, onboarding, vendor management, retrospectives",
            "Finance (~130) · People/HR (~165) · Product/Engineering (~165) · Customer Success (~130) · Personal (~50)",
            "Structured JSON format: id, category, subcategory, title, system, user_template (with {{variables}}), best_model, notes",
            "Markdown index for browsing categories",
            "Quarterly additions for 12 months",
        ],
    },
    "the-ai-tools-vault": {
        "longDescription": "545+ AI tools curated by Aiprosol, categorized by use case, with real pricing, integration counts, free tier availability, and the gotchas the marketing pages won't tell you. Plus 20 Hidden Gems — tools that genuinely outperform popular incumbents but get drowned in SEO noise — and 15 Avoid Listings with specific when-not-to-use rationale. Quarterly refreshes for 12 months.",
        "features": [
            "545+ tools across 23 categories with full attribute set per tool",
            "20 Hidden Gems with rationale: Plain · Resend · Linear · Folk · Inngest · Vectara · Krea · Cartesia Sonic · Hetzner · Tana · Granola · BetterStack · Ashby · Cal.com · DuckDB · Hex · Beehiiv · Tailscale · Atomic.io · Activepieces",
            "15 Avoid Listings: Salesforce <50 reps · Datadog <20 hosts · Tabnine · Quip · Synthesia · LastPass · Adobe XD · Devin · Mulesoft · Workday <1000 emp · Inflection Pi · Character.AI · Drift · Outreach · ZoomInfo",
            "Per-tool fields: pricing floor, pricing model, integrations count, free tier, Aiprosol verdict, gotchas",
            "Filter views: by category, by free tier, by integrations, by pricing band, by 'Aiprosol pick'",
            "Quarterly auto-emailed updates for 12 months",
        ],
    },
    "ai-tools-stack-starter-kit": {
        "longDescription": "The curated AI toolkit + integration patterns that take a business from zero to a working AI stack in 14 days. A specific recommended stack, with the patterns that connect them. 18 importable n8n workflow JSON files covering the most useful cross-tool integrations. No generic 'top 50 AI tools' listicles — a specific recommended stack with the patterns that connect them.",
        "features": [
            "18 importable n8n integration workflows — every recipe maps two common SaaS tools through an AI layer",
            "Sample integrations: Slack → OpenAI → Notion · Gmail → Claude → Calendar · Stripe → LLM → CS workspace · Typeform → enrich → Airtable · Calendly → Claude → HubSpot · Drive → AI → folder routing · Twilio → Claude → CRM · GA4 → Claude → Notion",
            "Recommended stack: 14 tools across 7 categories with the Aiprosol verdict per pick",
            "Budget calculator spreadsheet — estimate monthly cost based on volume",
            "Migration playbook: how to integrate this stack with existing Zapier/Make/n8n setups, or alongside legacy SaaS (Salesforce/HubSpot/Zendesk)",
            "Built for ops leads and founders evaluating AI tools but drowning in listicles",
        ],
    },
    "zapier-make-power-user-bundle": {
        "longDescription": "Master both leading no-code automation platforms with 25 fully-detailed Zapier recipes + 25 fully-detailed Make.com recipes. Each recipe has the complete step-by-step. Plus the 22-row decision matrix that tells you exactly when to use which platform, the operator's playbook of 14 patterns that survive 12 months in production, and notes on when to skip both platforms and use n8n.",
        "features": [
            "25 fully-detailed Zapier recipes covering: Stripe → CRM + Slack · Calendly → CRM + prep brief · Form → AI score → tier routing · Gmail invoice → OCR → Sheet · HubSpot deal change → email draft · Typeform → Airtable · Shopify → Klaviyo · Stripe failed → save sequence · Intercom → AI summary → Notion · Google Forms → Zendesk · ClickUp overdue → AI nudge · Mailchimp campaign metrics · Notion → Slack · Calendly cancel → CRM · Salesforce won → kickoff · Webflow publish → tweet · GitHub PR → Slack · Stripe cancel → CS save · QuickBooks → CRM · Asana → recognition · Twilio SMS → AI reply · Eventbrite → welcome · Discord new member · RSS → thread · Notion → calendar",
            "25 fully-detailed Make.com recipes covering analogous + more complex flows using iterators, aggregators, data stores",
            "22-row Zapier vs Make decision matrix",
            "14-pattern operator's playbook (dedupe, idempotency, soft-fail, rate-limit handling, etc.)",
            "When to skip both and use n8n",
        ],
    },
    "enterprise-ai-readiness-assessment-kit": {
        "longDescription": "The diagnostic toolkit for evaluating AI automation maturity across the 12 dimensions that actually predict ROI. Built for CIOs, COOs, and transformation leads at mid-market and enterprise organisations. Includes the 120-question Readiness Scorecard XLSX (auto-aggregating per dimension, with bar chart and conditional formatting), the Vendor Selection RFP DOCX (40-criteria grid, 10-item contract red-flag checklist), and the 14-slide 90-Day Implementation Plan PPTX.",
        "features": [
            "Readiness Scorecard XLSX: 120 questions across 12 dimensions (Data Hygiene · Process Documentation · Change Management · Governance · Integration Debt · Talent · Vendor Strategy · Security · Finance Operations · Customer Operations · Product Engineering · Strategic Alignment) — auto-aggregating per dimension with bar chart + Action Map",
            "Vendor Selection RFP DOCX: 40-criteria evaluation grid, 10-item contract red-flag checklist, 8-week timeline, buyer profile template",
            "90-Day Implementation Plan PPTX (14 slides): Phase 0 (Foundation, Days 1-30) → Phase 1 (Pilot, Days 31-60) → Phase 2 (Scale, Days 61-90)",
            "Built for organisations with 100-5,000 employees · $10M-$500M revenue · already on cloud · with at least one ERP or CRM",
            "Includes a 30-minute scoring-call credit with the Aiprosol team (redeem within 90 days)",
        ],
    },
    "the-playbook-pack": {
        "longDescription": "Three operator-grade playbooks bundled at $197 (saves $74 vs $271 separately). Workflow Automation Playbook + Lead Generation Automation Playbook + 30-Day Business Automation Challenge. Plus 47 importable n8n workflow JSON files (25 + 12 + 10) spanning workflow patterns, lead-gen automation, and SMB starter workflows.",
        "features": [
            "1. Workflow Automation Playbook ($97 standalone) — 7 patterns + 5 anti-patterns + 25 importable n8n workflows",
            "2. Lead Generation Automation Playbook ($127 standalone) — capture/score/route/nurture/convert system + 12 importable n8n workflows",
            "3. 30-Day Business Automation Challenge ($47 standalone) — daily 15-min exercises, 30 working automations by Day 30",
            "Recommended sequence: Read Workflow Playbook first (foundation) → Lead Gen Playbook (applied) → Run the 30-Day Challenge (daily implementation)",
            "Total: 47 importable n8n workflows + 30 day-by-day recipes + 200+ pages of operator-grade content",
            "Savings: $74 vs buying separately ($271 total)",
        ],
    },
}


# Apply enrichments + generate images
print(f"Processing {len(products)} products...")
fonts = get_fonts()

manifest = []
for p in products:
    slug = p["slug"]
    # Add image fields
    p["image"] = f"/products/{slug}.png"
    # Apply enrichment if available
    if slug in ENRICHMENTS:
        e = ENRICHMENTS[slug]
        p["longDescription"] = e["longDescription"]
        p["features"] = e["features"]

    # Generate cover (1280x720)
    try:
        cover = make_cover(p, fonts, size=(1280, 720))
        cover_path = PUBLIC / f"{slug}.png"
        cover.save(cover_path, "PNG", optimize=True)
        # Also save Gumroad-spec cover
        gumroad_path = GUMROAD_COVERS / f"{slug}-cover-1280x720.png"
        cover.save(gumroad_path, "PNG", optimize=True)

        # Generate thumbnail (800x500)
        thumb = make_thumbnail(p, fonts, size=(800, 500))
        thumb.save(PUBLIC / f"{slug}-thumb.png", "PNG", optimize=True)

        manifest.append({"slug": slug, "cover": str(cover_path), "thumb": str(PUBLIC / f"{slug}-thumb.png")})
        print(f"  ✓ {slug:40} → cover {cover_path.stat().st_size//1024} KB · thumb {(PUBLIC / f'{slug}-thumb.png').stat().st_size//1024} KB")
    except Exception as e:
        print(f"  ✗ {slug}: {e}")

# Save updated products.json
PRODUCTS_JSON.write_text(json.dumps(products, indent=2, ensure_ascii=False))
print(f"\n✓ Updated products.json with image paths + enriched descriptions for {sum(1 for p in products if p['slug'] in ENRICHMENTS)} products")
print(f"✓ Generated {len(manifest)*2} images total (cover + thumb per product)")
print(f"✓ Gumroad-spec covers saved to {GUMROAD_COVERS}")
