"""Generate the Aiprosol website review PDF."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    KeepTogether, HRFlowable,
)

OUT = "/Users/user/Airprosol/aiprosol-website-review-2026-05-09.pdf"

# Brand palette (matches Aiprosol site)
PURPLE = HexColor("#8B5CF6")
PURPLE_DARK = HexColor("#6D28D9")
CYAN = HexColor("#22D3EE")
INK = HexColor("#0F172A")
MUTED = HexColor("#64748B")
LINE = HexColor("#E2E8F0")
BG_RED = HexColor("#FEE2E2")
BG_AMBER = HexColor("#FEF3C7")
BG_GREEN = HexColor("#DCFCE7")

styles = getSampleStyleSheet()

H1 = ParagraphStyle(
    "H1", parent=styles["Heading1"], fontName="Helvetica-Bold",
    fontSize=24, leading=30, textColor=INK, spaceBefore=0, spaceAfter=4,
)
SUBTITLE = ParagraphStyle(
    "Sub", parent=styles["Normal"], fontName="Helvetica",
    fontSize=11, leading=16, textColor=MUTED, spaceAfter=18,
)
H2 = ParagraphStyle(
    "H2", parent=styles["Heading2"], fontName="Helvetica-Bold",
    fontSize=15, leading=20, textColor=PURPLE_DARK, spaceBefore=18, spaceAfter=8,
)
H3 = ParagraphStyle(
    "H3", parent=styles["Heading3"], fontName="Helvetica-Bold",
    fontSize=12, leading=16, textColor=INK, spaceBefore=10, spaceAfter=4,
)
BODY = ParagraphStyle(
    "Body", parent=styles["Normal"], fontName="Helvetica",
    fontSize=10, leading=15, textColor=INK, spaceAfter=8, alignment=TA_LEFT,
)
SMALL = ParagraphStyle(
    "Small", parent=styles["Normal"], fontName="Helvetica",
    fontSize=8.5, leading=12, textColor=MUTED, spaceAfter=4,
)
CODE = ParagraphStyle(
    "Code", parent=styles["Normal"], fontName="Courier",
    fontSize=9, leading=13, textColor=PURPLE_DARK, spaceAfter=4,
)
PILL = ParagraphStyle(
    "Pill", parent=styles["Normal"], fontName="Helvetica-Bold",
    fontSize=8, leading=10, textColor=INK,
)

def b(text):
    return f"<b>{text}</b>"

def code(text):
    return f'<font name="Courier" color="#6D28D9">{text}</font>'


def header_footer(canvas, doc):
    canvas.saveState()
    # Header bar
    canvas.setFillColor(PURPLE)
    canvas.rect(0, A4[1] - 4 * mm, A4[0], 4 * mm, stroke=0, fill=1)
    # Footer
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(20 * mm, 12 * mm,
                      "Aiprosol website review · prepared by Arora · 2026-05-09")
    canvas.drawRightString(A4[0] - 20 * mm, 12 * mm, f"Page {doc.page}")
    canvas.restoreState()


def severity_pill(label, bg, text_color=INK):
    t = Table([[Paragraph(f'<b>{label}</b>', PILL)]],
              colWidths=[28 * mm], rowHeights=[6.5 * mm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("TEXTCOLOR", (0, 0), (-1, -1), text_color),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ("ROUNDEDCORNERS", [3, 3, 3, 3]),
    ]))
    return t


def finding(num, title, severity_label, severity_bg, body_html, refs=None):
    """Render one finding as a tight block."""
    severity = severity_pill(severity_label, severity_bg)
    title_para = Paragraph(f'<font color="#8B5CF6"><b>{num}.</b></font> &nbsp;{b(title)}', H3)
    head = Table([[severity, title_para]],
                 colWidths=[30 * mm, 130 * mm])
    head.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    blocks = [head, Spacer(1, 4), Paragraph(body_html, BODY)]
    if refs:
        blocks.append(Paragraph(refs, SMALL))
    blocks.append(Spacer(1, 4))
    blocks.append(HRFlowable(width="100%", thickness=0.4, color=LINE))
    return KeepTogether(blocks)


def section_header(text):
    return [Spacer(1, 6), Paragraph(text, H2)]


def build():
    doc = SimpleDocTemplate(
        OUT, pagesize=A4,
        leftMargin=20 * mm, rightMargin=20 * mm,
        topMargin=20 * mm, bottomMargin=22 * mm,
        title="Aiprosol Website Review · 2026-05-09",
        author="Arora · AI CEO, Aiprosol",
        subject="Website review and prioritised punch list",
    )

    story = []

    # ─────── Cover block ───────
    story.append(Spacer(1, 6))
    story.append(Paragraph("Aiprosol website review", H1))
    story.append(Paragraph(
        "Prepared by Arora · 2026-05-09 · scope: live domain, Wix V2 site, "
        "Next.js V3 build at <font face='Courier'>/web/</font>",
        SUBTITLE,
    ))

    # Summary callout
    summary_rows = [
        [Paragraph("<b>Reviewed</b>", BODY),
         Paragraph(
             "Live domain (aiprosol.com), local Next.js V3 build (28 routes), "
             "all main pages walked and screenshotted at 1440 × 900.",
             BODY)],
        [Paragraph("<b>Headline</b>", BODY),
         Paragraph(
             "The V3 build is high-craft and structurally complete. The single "
             "most damaging issue is that <b>aiprosol.com still resolves to a "
             "GoDaddy parking page saying \"LIVE BY 15th April\"</b> — that is "
             "what every prospect Googling Aiprosol currently sees.",
             BODY)],
        [Paragraph("<b>Findings</b>", BODY),
         Paragraph(
             "1 critical · 4 high-impact · 3 claim-substantiation · "
             "4 UX/structural · 3 polish.",
             BODY)],
    ]
    summary = Table(summary_rows, colWidths=[28 * mm, 132 * mm])
    summary.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), HexColor("#F5F3FF")),
        ("BOX", (0, 0), (-1, -1), 0.6, PURPLE),
        ("INNERGRID", (0, 0), (-1, -1), 0.3, HexColor("#E9D5FF")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(summary)
    story.append(Spacer(1, 16))

    # Severity legend
    legend = Table([[
        severity_pill("CRITICAL", BG_RED),
        Paragraph("Public-facing crisis · fix today", SMALL),
        severity_pill("HIGH", BG_AMBER),
        Paragraph("Visible credibility leak", SMALL),
        severity_pill("MED", BG_GREEN),
        Paragraph("UX or polish", SMALL),
    ]], colWidths=[24 * mm, 30 * mm, 22 * mm, 32 * mm, 22 * mm, 30 * mm])
    legend.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(legend)
    story.append(Spacer(1, 12))

    # ─────── Critical ───────
    story += section_header("Most urgent · do today")

    story.append(finding(
        1, "Domain is parked on GoDaddy",
        "CRITICAL", BG_RED,
        "<b>aiprosol.com</b> currently resolves to a GoDaddy under-construction page "
        'with "LIVE BY 15th April" — about a month stale. Anyone searching for '
        "Aiprosol sees this. The Next.js V3 build is locally complete but never "
        "deployed; the Wix V2 site never had the domain pointed at it either. "
        "<br/><br/>"
        "<b>Fix:</b> deploy the V3 build to Vercel and point the apex + www at it, "
        "or put up a single styled <i>Coming soon · join the list</i> page. "
        "Anything is better than the GoDaddy default.",
    ))

    # ─────── High-impact ───────
    story += section_header("High-impact fixes · visible credibility leaks")

    story.append(finding(
        2, "Number inconsistency: 6 vs 7 industries",
        "HIGH", BG_AMBER,
        "The bento grid hard-codes <i>“The numbers, across 6 industries”</i>, "
        "but the stats banner and the persistent status orb both say 7 — and "
        "<font face='Courier'>case-studies.json</font> actually contains "
        "7 cases across 7 unique industries. Bento line is stale.",
        refs="Files: web/src/components/BentoGrid.tsx:44 · "
             "web/src/components/home/StatsBanner.tsx:9 · "
             "web/src/components/StatusOrb.tsx:26",
    ))

    story.append(finding(
        3, "Cycling headline reads broken for ~350 ms",
        "HIGH", BG_AMBER,
        'When the cycling word fully erases, the hero headline reads '
        '<i>“Automate the&nbsp;|. Scale the important.”</i> — a half-sentence with '
        "a floating period. <br/><br/>"
        "<b>Fix:</b> never let the variable word reach empty — pause on the full "
        "word, then swap directly to the next, or keep one phrase visible at all "
        "times. Constant lives in <font face='Courier'>PAUSE_AT_EMPTY = 350</font>.",
        refs="File: web/src/components/CyclingHeadline.tsx:14",
    ))

    story.append(finding(
        4, "Product and blog cover art look placeholder",
        "HIGH", BG_AMBER,
        "Every one of the 19 product cards and 6 blog posts uses the same "
        "template: black tile, “Aiprosol” wordmark, single emoji/icon. It reads "
        "as AI-generated mockups, which actively undermines the “real, working "
        "products” claim. <br/><br/>"
        "<b>Fix:</b> 19 real product covers is the single highest-leverage "
        "visual upgrade. Even a varied palette per category would help.",
    ))

    story.append(finding(
        5, "No social proof above the fold",
        "HIGH", BG_AMBER,
        "Hero is beautiful but has zero client logos, zero quoted testimonial, "
        "zero “as featured in”. The testimonials section only appears 7+ scrolls "
        "down. <br/><br/>"
        "<b>Fix:</b> a logo strip immediately under the CTAs would do real work — "
        "even four logos beats none. If real client logos aren’t signable yet, "
        "lead with the strongest case-study metric as a quote bar.",
    ))

    # ─────── Claims ───────
    story += section_header("Claims that need substantiation")

    story.append(finding(
        6, "“340% Avg ROI” and “35+ Hrs/Wk Saved” — no source",
        "HIGH", BG_AMBER,
        "Repeated 4× across the homepage with no footnote, no <i>“based on N "
        "engagements”</i>, no methodology link. Given current revenue state, "
        "these read as aspirational. <br/><br/>"
        "<b>Fix:</b> either asterisk them with “based on Stage 1 audit "
        "projections, N=…”, or scale to ranges (“200–400% projected ROI”).",
    ))

    story.append(finding(
        7, "“LIVE · 42,383 automations running globally”",
        "MED", BG_GREEN,
        "If real, label the time window (“since launch”). If a vanity counter, "
        "anyone refreshing will spot it — that becomes a trust hit. Decide now "
        "before traffic arrives.",
    ))

    story.append(finding(
        8, "“Money-back if we miss” has no terms",
        "MED", BG_GREEN,
        "Strong guarantee in Hero Phase 2, but no link, no detail, no terms. "
        "Either link to the spec page or soften the wording.",
    ))

    # ─────── UX / structural ───────
    story += section_header("UX and structural")

    story.append(finding(
        9, "Hero is 280 vh — three full screens before workflow visualizer",
        "MED", BG_GREEN,
        "Scroll-jacked 3-phase hero is high-craft, but on mobile and impatient "
        "B2B visitors this <i>will</i> cause bounces. Consider 200 vh max, or "
        "add a <i>Skip to content ↓</i> affordance for keyboard and touch.",
    ))

    story.append(finding(
        10, "Pricing page shows a stand-alone “£49,000” without context",
        "MED", BG_GREEN,
        "Likely the annual savings figure from the slider, but it is not "
        "labelled clearly enough — a first-time visitor will read it as a price.",
    ))

    story.append(finding(
        11, "Pricing CTAs go straight to /checkout?plan=…",
        "MED", BG_GREEN,
        "No consult interstitial for £997 or £2,997 managed plans. That is a "
        "big single-click commitment for a B2B service. Add a <i>Talk to us "
        "first</i> secondary CTA, or a 15-min discovery call gate.",
    ))

    story.append(finding(
        12, "All 6 blog posts attributed to “Arora”",
        "MED", BG_GREEN,
        "Consistent with the brand (the AI CEO writes the field notes), but "
        "reads as one-author. If any guest contributors or human co-authors "
        "exist, surface them — even one breaks the monotone.",
    ))

    # ─────── Polish ───────
    story += section_header("Smaller polish")

    story.append(finding(
        13, "Persistent StatusOrb in the bottom-left",
        "MED", BG_GREEN,
        "“Computing ROI / Reading proof / Catalogue ready” follows the user on "
        "every page. Novel, but borderline debug-looking. Confirm intentional, "
        "otherwise it’s clutter.",
    ))

    story.append(finding(
        14, "Footer microcopy repeats the hero verbatim",
        "MED", BG_GREEN,
        "<i>“Automate the boring. Scale the important.”</i> appears in both "
        "places. Fine, but a separate line in the footer would feel less echoey.",
    ))

    story.append(finding(
        15, "Counts line up across the site",
        "MED", BG_GREEN,
        "11 services / 19 products / 7 cases / 6 blog / 21 FAQs are all "
        "consistent across nav, page counts, stat banners, and JSON content "
        "seeds. That is where most sites drift first — yours doesn’t. Keep it "
        "that way once the bento line is fixed.",
    ))

    # ─────── What's working ───────
    story += section_header("What is already working")
    bullets = [
        "Three.js sphere and the scroll-jacked 3-phase hero is genuinely high-craft.",
        "GBP throughout — no USD slipped in anywhere.",
        "Hard-numbers case studies (78%↓, 6hr→3min, 4.1%→0.6%) are the strongest section by far.",
        "Workflow visualizer and the synthetic “Arora at work” demo are real differentiators.",
        "Footer information architecture is clean.",
        "All 28 routes return HTTP 200 · zero client-side console errors.",
        "Stripe + Resend + Vercel KV are wired in — checkout is technically ready (see web/LAUNCH-V3.md).",
    ]
    for line in bullets:
        story.append(Paragraph("•&nbsp;&nbsp;" + line, BODY))

    # ─────── Recommendation ───────
    story.append(Spacer(1, 14))
    rec_box = Table(
        [[Paragraph(
            "<b>Recommended next 24 hours</b><br/><br/>"
            "<b>1.</b> Deploy the V3 build to Vercel and point aiprosol.com at "
            "it (or stand up a holding page) — closes the parking-page leak.<br/>"
            "<b>2.</b> Edit one line in BentoGrid.tsx: 6 → 7 industries.<br/>"
            "<b>3.</b> Tweak CyclingHeadline so it never empties — eliminates "
            "the broken-headline flash.<br/><br/>"
            "Three changes, &lt;30 min of work, materially closes the "
            "credibility gap.",
            BODY)]],
        colWidths=[160 * mm],
    )
    rec_box.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), HexColor("#F0FDFA")),
        ("BOX", (0, 0), (-1, -1), 0.8, CYAN),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    story.append(rec_box)

    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    build()
