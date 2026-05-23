#!/usr/bin/env python3
"""
Aiprosol product cover + thumbnail generator (v2 — premium).

Each cover has THREE layers:
  1. Background — multi-stop radial gradient + bloom + noise + edge fade
  2. Hero mockup — a custom illustration per product (slides, charts, funnels,
     workflow nodes, calendars, prompt cards, vaults, etc.) tilted with shadow
  3. Foreground — Aiprosol mark (top-right), category chip (top-left),
     product name (InterDisplay-Black huge), tagline, badges row, price chip

Outputs:
  /Users/user/Airprosol/product-covers-v2/covers/<slug>.png   (1280×720)
  /Users/user/Airprosol/product-covers-v2/thumbs/<slug>.png   ( 800×500)
"""
from __future__ import annotations

import json
import math
import os
import random
from pathlib import Path
from typing import Callable

from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path("/Users/user/Airprosol")
OUT_COVERS = ROOT / "product-covers-v2/covers"
OUT_THUMBS = ROOT / "product-covers-v2/thumbs"
OUT_COVERS.mkdir(parents=True, exist_ok=True)
OUT_THUMBS.mkdir(parents=True, exist_ok=True)

FONT_DIR = ROOT / "fonts/extras/ttf"
PRODUCTS_JSON = ROOT / "web/src/content/products.json"

# ───────────────────────────────────────────────────────────
# Brand palette
# ───────────────────────────────────────────────────────────
BG_DEEPER = (5, 4, 14)            # almost-black bottom
BG_DARK = (10, 6, 19)             # main bg
BG_PANEL = (20, 16, 35)           # panel/card body
BG_PANEL_2 = (26, 20, 42)         # slightly lighter panel
LINE = (42, 31, 61)               # subtle line
LINE_BRIGHT = (74, 56, 110)       # brighter line
TEXT = (229, 231, 235)            # main text
TEXT_DIM = (156, 163, 181)        # muted
TEXT_VERY_DIM = (101, 102, 122)   # really muted
VIOLET = (139, 92, 246)
LIGHT_VIOLET = (192, 132, 252)
DEEP_VIOLET = (109, 40, 217)
WHITE = (255, 255, 255)
GREEN = (16, 185, 129)
AMBER = (245, 158, 11)
ACCENT_GREEN = (52, 211, 153)
ACCENT_CYAN = (34, 211, 238)
ACCENT_PINK = (244, 114, 182)


# ───────────────────────────────────────────────────────────
# Font helpers
# ───────────────────────────────────────────────────────────
def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    path = FONT_DIR / f"{name}.ttf"
    return ImageFont.truetype(str(path), size)


def measure(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont) -> tuple[int, int]:
    bbox = draw.textbbox((0, 0), text, font=fnt)
    return bbox[2] - bbox[0], bbox[3] - bbox[1]


def wrap_text(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont, max_w: int) -> list[str]:
    if not text:
        return []
    words = text.split()
    lines: list[str] = []
    cur = ""
    for w in words:
        trial = (cur + " " + w).strip()
        if measure(draw, trial, fnt)[0] <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


# ───────────────────────────────────────────────────────────
# Background composition
# ───────────────────────────────────────────────────────────
def build_background(w: int, h: int) -> Image.Image:
    """Multi-stop radial gradient with two bloom glows + edge fade + noise."""
    img = Image.new("RGB", (w, h), BG_DEEPER)
    px = img.load()

    # Linear vertical gradient base (BG_DEEPER → BG_DARK → BG_DEEPER edges)
    for y in range(h):
        t = y / h
        # Body of the gradient is BG_DARK in the middle, going slightly darker at top and bottom
        if t < 0.5:
            f = t / 0.5
        else:
            f = (1 - t) / 0.5
        r = int(BG_DEEPER[0] + (BG_DARK[0] - BG_DEEPER[0]) * f)
        g = int(BG_DEEPER[1] + (BG_DARK[1] - BG_DEEPER[1]) * f)
        b = int(BG_DEEPER[2] + (BG_DARK[2] - BG_DEEPER[2]) * f)
        for x in range(w):
            px[x, y] = (r, g, b)

    # Two big radial glows — top-left magenta-violet, bottom-right blue-violet
    glow1 = Image.new("RGB", (w, h), (0, 0, 0))
    gd1 = ImageDraw.Draw(glow1)
    gd1.ellipse((-w * 0.4, -h * 0.4, w * 0.55, h * 0.55), fill=(70, 45, 130))
    glow1 = glow1.filter(ImageFilter.GaussianBlur(radius=140))

    glow2 = Image.new("RGB", (w, h), (0, 0, 0))
    gd2 = ImageDraw.Draw(glow2)
    gd2.ellipse((w * 0.45, h * 0.5, w * 1.4, h * 1.4), fill=(60, 25, 110))
    glow2 = glow2.filter(ImageFilter.GaussianBlur(radius=160))

    img = Image.blend(img, glow1, 0.55)
    img = Image.blend(img, glow2, 0.45)

    # Subtle vignette (darker corners)
    vignette = Image.new("L", (w, h), 0)
    vd = ImageDraw.Draw(vignette)
    vd.ellipse((-w * 0.2, -h * 0.2, w * 1.2, h * 1.2), fill=255)
    vignette = vignette.filter(ImageFilter.GaussianBlur(radius=120))
    overlay = Image.new("RGB", (w, h), BG_DEEPER)
    img = Image.composite(img, overlay, vignette)

    # Fine grain noise — gentle, only top half visible
    grain = Image.effect_noise((w, h), 8)  # 0-255 noise
    grain = grain.convert("L").point(lambda v: int((v - 128) * 0.25 + 128))
    noise_overlay = Image.merge("RGB", (grain, grain, grain))
    img = Image.blend(img, noise_overlay, 0.04)

    return img


def add_top_corner_glow(img: Image.Image, color: tuple[int, int, int] = VIOLET) -> Image.Image:
    """Add a pinpoint glow that bleeds from a corner — gives the image a focal point."""
    w, h = img.size
    glow = Image.new("RGB", (w, h), (0, 0, 0))
    gd = ImageDraw.Draw(glow)
    # Place glow off-canvas top-right for a subtle rim light
    cx, cy = w * 0.92, h * 0.05
    for r in range(220, 0, -22):
        alpha = int(110 * (1 - r / 220) ** 1.8)
        gd.ellipse((cx - r, cy - r, cx + r, cy + r),
                   fill=(min(color[0] + 40, 255), min(color[1] + 25, 255), min(color[2] + 55, 255)))
    glow = glow.filter(ImageFilter.GaussianBlur(radius=70))
    return Image.blend(img.convert("RGB"), glow, 0.35)


# ───────────────────────────────────────────────────────────
# Card / mockup utilities
# ───────────────────────────────────────────────────────────
def rounded_rect(im: Image.Image, xy: tuple[int, int, int, int], radius: int,
                 fill: tuple, outline: tuple | None = None, width: int = 0) -> None:
    """Draw a rounded rect on the given image (any mode)."""
    d = ImageDraw.Draw(im)
    d.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def make_mockup_canvas(w: int, h: int) -> Image.Image:
    """A blank panel-styled card the size of the mockup. RGBA so we can composite."""
    card = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    rounded_rect(card, (0, 0, w, h), radius=18, fill=BG_PANEL + (255,),
                 outline=LINE + (255,), width=1)
    # Subtle inner highlight at top edge
    d = ImageDraw.Draw(card)
    d.line((10, 1, w - 10, 1), fill=LINE_BRIGHT + (180,), width=1)
    return card


def tilt_paste(bg: Image.Image, fg: Image.Image, center: tuple[int, int], angle: float,
               shadow: bool = True, bloom: bool = True) -> None:
    """Rotate fg by `angle` degrees, drop shadow + violet bloom halo, then paste centered."""
    rotated = fg.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True)
    rw, rh = rotated.size
    cx, cy = center

    if bloom:
        # Subtle violet bloom halo around the card (premium glow)
        sh_alpha = rotated.split()[-1]
        # Soft violet glow from the rotated card's silhouette, kept gentle
        halo_layer = Image.new("RGBA", rotated.size, VIOLET + (45,))
        halo_layer.putalpha(sh_alpha)
        halo_blur = halo_layer.filter(ImageFilter.GaussianBlur(radius=24))
        bg.paste(halo_blur, (cx - rw // 2, cy - rh // 2), halo_blur)

    if shadow:
        sh_alpha = rotated.split()[-1]
        sh_layer = Image.new("RGBA", rotated.size, (0, 0, 0, 200))
        sh_layer.putalpha(sh_alpha)
        sh_blur = sh_layer.filter(ImageFilter.GaussianBlur(radius=26))
        bg.paste(sh_blur, (cx - rw // 2 + 18, cy - rh // 2 + 30), sh_blur)

    bg.paste(rotated, (cx - rw // 2, cy - rh // 2), rotated)


def draw_corner_marks(img: Image.Image, inset: int = 28) -> None:
    """Subtle viewfinder corner marks for a premium framed feel."""
    w, h = img.size
    d = ImageDraw.Draw(img)
    arm = 12
    th = 1
    col = (139, 92, 246, 110)
    # Top-left
    d.line((inset, inset, inset + arm, inset), fill=col, width=th)
    d.line((inset, inset, inset, inset + arm), fill=col, width=th)
    # Top-right
    d.line((w - inset, inset, w - inset - arm, inset), fill=col, width=th)
    d.line((w - inset, inset, w - inset, inset + arm), fill=col, width=th)
    # Bottom-left
    d.line((inset, h - inset, inset + arm, h - inset), fill=col, width=th)
    d.line((inset, h - inset, inset, h - inset - arm), fill=col, width=th)
    # Bottom-right
    d.line((w - inset, h - inset, w - inset - arm, h - inset), fill=col, width=th)
    d.line((w - inset, h - inset, w - inset, h - inset - arm), fill=col, width=th)


# ───────────────────────────────────────────────────────────
# Per-archetype mockup illustrations
# Each function returns an RGBA Image sized to its native canvas.
# ───────────────────────────────────────────────────────────
def mockup_spreadsheet(w=560, h=400) -> Image.Image:
    """Spreadsheet card with cells, header row, highlighted row, and a mini chart."""
    card = make_mockup_canvas(w, h)
    d = ImageDraw.Draw(card)

    # Toolbar
    rounded_rect(card, (0, 0, w, 36), radius=18, fill=BG_PANEL_2 + (255,))
    d.rectangle((0, 18, w, 36), fill=BG_PANEL_2 + (255,))  # square off bottom
    for i, c in enumerate([(255, 95, 87), (255, 189, 46), (39, 201, 63)]):
        d.ellipse((14 + i * 18, 12, 24 + i * 18, 22), fill=c + (255,))
    d.text((w - 110, 12), "ROI Model.xlsx", fill=TEXT_DIM + (255,),
           font=font("Inter-Medium", 10))

    # Column headers
    col_x = [16, 130, 240, 350, 460]
    headers = ["Metric", "Current", "After", "Δ", "Annual"]
    for i, (x, hdr) in enumerate(zip(col_x, headers)):
        d.text((x, 50), hdr, fill=TEXT_DIM + (255,), font=font("Inter-SemiBold", 11))
    d.line((10, 70, w - 10, 70), fill=LINE + (255,), width=1)

    # Rows
    rows = [
        ("Hours/week", "32", "8", "−75%", "1,248"),
        ("Cost/month", "$4,200", "$650", "−$3,550", "$42,600"),
        ("Errors", "12/mo", "1/mo", "−92%", ""),
        ("NPS", "32", "67", "+35", ""),
        ("Payback", "—", "3 wks", "", ""),
    ]
    y = 84
    for i, row in enumerate(rows):
        if i == 1:  # highlight row 2
            rounded_rect(card, (8, y - 6, w - 8, y + 18), radius=4,
                         fill=(139, 92, 246, 38))
        for x, val in zip(col_x, row):
            colour = VIOLET if i == 1 and x == col_x[-1] else TEXT + (255,)
            if isinstance(colour, tuple) and len(colour) == 3:
                colour = colour + (255,)
            d.text((x, y), val, fill=colour, font=font("Inter-Medium", 11))
        y += 28

    # Bar chart bottom-right
    chart_x, chart_y, chart_w, chart_h = w - 200, h - 130, 180, 110
    rounded_rect(card, (chart_x, chart_y, chart_x + chart_w, chart_y + chart_h),
                 radius=8, fill=BG_DEEPER + (255,), outline=LINE + (255,), width=1)
    d.text((chart_x + 10, chart_y + 6), "Cumulative $ saved", fill=TEXT_DIM + (255,),
           font=font("Inter-Medium", 9))
    bar_h_list = [12, 22, 36, 52, 72, 86, 98]
    bw = 16
    for i, bh in enumerate(bar_h_list):
        bx = chart_x + 14 + i * 22
        by = chart_y + chart_h - 12 - bh
        d.rounded_rectangle((bx, by, bx + bw, chart_y + chart_h - 12),
                            radius=3, fill=VIOLET + (255,))

    return card


def mockup_slide_deck(w=560, h=380) -> Image.Image:
    """Tilted slide showing title + 3 bullets + a chart strip."""
    card = make_mockup_canvas(w, h)
    d = ImageDraw.Draw(card)

    # Slide number top-right
    d.text((w - 60, 16), "07 / 25", fill=TEXT_VERY_DIM + (255,),
           font=font("Inter-Medium", 11))

    # Slide title
    d.text((40, 50), "PROJECTED SAVINGS", fill=VIOLET + (255,),
           font=font("Inter-SemiBold", 12))
    d.text((40, 70), "$340K / year", fill=TEXT + (255,),
           font=font("InterDisplay-ExtraBold", 36))
    d.text((40, 116), "Payback period: 11 weeks", fill=TEXT_DIM + (255,),
           font=font("Inter-Medium", 14))

    # Three KPI tiles
    tile_y = 160
    tile_h = 90
    tile_w = (w - 80 - 24) // 3
    for i, (val, label) in enumerate([("32 hrs", "Saved / week"),
                                        ("9.4×", "Year-1 return"),
                                        ("94%", "Adoption rate")]):
        tx = 40 + i * (tile_w + 12)
        rounded_rect(card, (tx, tile_y, tx + tile_w, tile_y + tile_h),
                     radius=10, fill=BG_DEEPER + (255,),
                     outline=LINE + (255,), width=1)
        d.text((tx + 14, tile_y + 14), val, fill=LIGHT_VIOLET + (255,),
               font=font("InterDisplay-Bold", 22))
        d.text((tx + 14, tile_y + 50), label, fill=TEXT_DIM + (255,),
               font=font("Inter-Medium", 10))

    # Slide footer
    d.line((40, h - 50, w - 40, h - 50), fill=LINE + (255,), width=1)
    d.text((40, h - 38), "AIPROSOL · ROI Pitch Deck", fill=TEXT_VERY_DIM + (255,),
           font=font("Inter-Medium", 10))

    # Left-edge gradient strip (slide accent)
    for i in range(20):
        alpha = int(255 * (1 - i / 20))
        d.line((0 + i, 0, 0 + i, h), fill=(139, 92, 246, alpha))

    return card


def mockup_workflow_nodes(w=560, h=380) -> Image.Image:
    """7 connected workflow nodes representing n8n patterns."""
    card = make_mockup_canvas(w, h)
    d = ImageDraw.Draw(card)

    d.text((24, 16), "n8n · workflow", fill=TEXT_DIM + (255,),
           font=font("Inter-Medium", 11))
    d.text((24, 30), "Lead → Score → Route → Nurture",
           fill=TEXT + (255,), font=font("Inter-SemiBold", 13))

    # Place nodes in a flow
    nodes = [
        (90, 130, "Form"),
        (220, 130, "AI Score"),
        (350, 130, "Route"),
        (480, 130, "Nurture"),
        (220, 250, "CRM"),
        (350, 250, "Slack"),
        (480, 250, "Digest"),
    ]
    node_w, node_h = 92, 50
    for nx, ny, label in nodes:
        rounded_rect(card, (nx - node_w // 2, ny - node_h // 2, nx + node_w // 2, ny + node_h // 2),
                     radius=10, fill=BG_PANEL_2 + (255,),
                     outline=LINE_BRIGHT + (255,), width=1)
        # Indicator dot
        d.ellipse((nx - node_w // 2 + 8, ny - 4, nx - node_w // 2 + 16, ny + 4),
                  fill=VIOLET + (255,))
        d.text((nx - node_w // 2 + 24, ny - 7), label,
               fill=TEXT + (255,), font=font("Inter-SemiBold", 11))

    # Highlight the "AI Score" node
    nx, ny = nodes[1][0], nodes[1][1]
    glow = Image.new("RGBA", card.size, (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.rounded_rectangle((nx - node_w // 2 - 6, ny - node_h // 2 - 6,
                          nx + node_w // 2 + 6, ny + node_h // 2 + 6),
                         radius=14, fill=(139, 92, 246, 110))
    glow = glow.filter(ImageFilter.GaussianBlur(radius=10))
    card.paste(glow, (0, 0), glow)
    # Redraw the highlighted node on top
    rounded_rect(card, (nx - node_w // 2, ny - node_h // 2, nx + node_w // 2, ny + node_h // 2),
                 radius=10, fill=DEEP_VIOLET + (255,),
                 outline=LIGHT_VIOLET + (255,), width=1)
    d.ellipse((nx - node_w // 2 + 8, ny - 4, nx - node_w // 2 + 16, ny + 4),
              fill=LIGHT_VIOLET + (255,))
    d.text((nx - node_w // 2 + 24, ny - 7), "AI Score",
           fill=WHITE + (255,), font=font("Inter-SemiBold", 11))

    # Connections (arrows)
    def arrow(x1, y1, x2, y2):
        d.line((x1, y1, x2, y2), fill=LINE_BRIGHT + (255,), width=2)
        # arrow head
        a = math.atan2(y2 - y1, x2 - x1)
        d.polygon([(x2, y2),
                   (x2 - 8 * math.cos(a - 0.4), y2 - 8 * math.sin(a - 0.4)),
                   (x2 - 8 * math.cos(a + 0.4), y2 - 8 * math.sin(a + 0.4))],
                  fill=LINE_BRIGHT + (255,))

    arrow(nodes[0][0] + 46, nodes[0][1], nodes[1][0] - 46, nodes[1][1])
    arrow(nodes[1][0] + 46, nodes[1][1], nodes[2][0] - 46, nodes[2][1])
    arrow(nodes[2][0] + 46, nodes[2][1], nodes[3][0] - 46, nodes[3][1])
    arrow(nodes[1][0], nodes[1][1] + 25, nodes[4][0], nodes[4][1] - 25)
    arrow(nodes[2][0], nodes[2][1] + 25, nodes[5][0], nodes[5][1] - 25)
    arrow(nodes[3][0], nodes[3][1] + 25, nodes[6][0], nodes[6][1] - 25)

    return card


def mockup_funnel(w=560, h=380) -> Image.Image:
    """Sales funnel: 4 layers narrowing down with metrics."""
    card = make_mockup_canvas(w, h)
    d = ImageDraw.Draw(card)

    d.text((24, 16), "LEAD-GEN FUNNEL", fill=VIOLET + (255,),
           font=font("Inter-SemiBold", 12))

    layers = [
        ("Visitors", "12,400", 1.0),
        ("Captured", "3,720", 0.78),
        ("Qualified", "1,116", 0.56),
        ("Demo'd", "446", 0.36),
        ("Closed", "67", 0.22),
    ]
    top_y = 56
    layer_h = 50
    spacing = 4
    max_w = w - 200

    for i, (label, count, frac) in enumerate(layers):
        lw = int(max_w * frac)
        lx = (w - lw) // 2 - 30
        ly = top_y + i * (layer_h + spacing)
        # Layer trapezoid (approximated as rounded rect)
        rounded_rect(card,
                     (lx, ly, lx + lw, ly + layer_h),
                     radius=8,
                     fill=(int(139 * (1 - i * 0.13)), int(92 * (1 - i * 0.13)),
                           int(246 * (1 - i * 0.13)), 255))
        d.text((lx + 12, ly + 14), label, fill=WHITE + (255,),
               font=font("Inter-SemiBold", 13))
        d.text((lx + lw - 70, ly + 14), count, fill=WHITE + (255,),
               font=font("InterDisplay-Bold", 14))
        # Conversion label
        if i > 0:
            prev_frac = layers[i - 1][2]
            conv = int((frac / prev_frac) * 100)
            d.text((lx + lw + 14, ly + 16), f"→ {conv}%",
                   fill=TEXT_DIM + (255,), font=font("Inter-Medium", 11))

    return card


def mockup_calendar(w=560, h=380) -> Image.Image:
    """30-day calendar grid with progress."""
    card = make_mockup_canvas(w, h)
    d = ImageDraw.Draw(card)

    d.text((24, 16), "DAY-BY-DAY", fill=VIOLET + (255,),
           font=font("Inter-SemiBold", 12))
    d.text((24, 32), "30-Day Business Automation Challenge",
           fill=TEXT + (255,), font=font("Inter-Bold", 13))

    # Progress bar showing day 18 of 30
    bar_y = 60
    rounded_rect(card, (24, bar_y, w - 24, bar_y + 6), radius=3,
                 fill=BG_DEEPER + (255,))
    rounded_rect(card, (24, bar_y, 24 + int((w - 48) * 0.6), bar_y + 6),
                 radius=3, fill=VIOLET + (255,))
    d.text((24, bar_y + 14), "Day 18 of 30 · 12 automations live",
           fill=TEXT_DIM + (255,), font=font("Inter-Medium", 11))

    # 5×6 calendar grid
    grid_top = 110
    grid_left = 30
    cell = 80
    gap = 6
    for i in range(30):
        col = i % 5
        row = i // 5
        cx = grid_left + col * (cell + gap)
        cy = grid_top + row * 40
        completed = i < 18
        fill = VIOLET + (255,) if completed else BG_DEEPER + (255,)
        outline = LIGHT_VIOLET + (255,) if completed else LINE + (255,)
        d.rounded_rectangle((cx, cy, cx + cell, cy + 34), radius=6,
                            fill=fill, outline=outline, width=1)
        text_col = WHITE + (255,) if completed else TEXT_DIM + (255,)
        d.text((cx + 8, cy + 8), f"Day {i+1}", fill=text_col,
               font=font("Inter-SemiBold", 11))
        if completed:
            d.text((cx + cell - 18, cy + 8), "✓", fill=WHITE + (255,),
                   font=font("InterDisplay-Bold", 14))

    return card


def mockup_prompt_cards(w=560, h=380) -> Image.Image:
    """Stack of 3 prompt cards laid out vertically with example text."""
    card = make_mockup_canvas(w, h)
    d = ImageDraw.Draw(card)

    d.text((24, 16), "PROMPT VAULT", fill=VIOLET + (255,),
           font=font("Inter-SemiBold", 12))
    d.text((24, 32), "1,008 production-tested prompts",
           fill=TEXT_DIM + (255,), font=font("Inter-Medium", 11))

    # Three vertically-stacked cards with full content visible
    samples = [
        ("Cold outreach · SaaS Founder",
         "Write a 4-line cold email to a SaaS founder using my company name...",
         "GPT-4o", VIOLET),
        ("Objection handler · Price",
         "I'm a sales rep handling a price objection: '$197 is too much right now.'",
         "Claude", LIGHT_VIOLET),
        ("Follow-up · Demo no-show",
         "Write a casual but motivating follow-up to a prospect who didn't show.",
         "GPT-4o", ACCENT_CYAN),
    ]
    card_w = w - 48
    card_h = 80
    top = 60
    for i, (title, body, model, accent) in enumerate(samples):
        cx = 24
        cy = top + i * (card_h + 12)
        rounded_rect(card, (cx, cy, cx + card_w, cy + card_h), radius=10,
                     fill=BG_PANEL_2 + (255,), outline=LINE + (255,), width=1)
        # Left accent bar
        d.rounded_rectangle((cx, cy, cx + 4, cy + card_h), radius=2,
                            fill=accent + (255,))
        # Title row
        d.text((cx + 16, cy + 12), title, fill=TEXT + (255,),
               font=font("Inter-SemiBold", 12))
        # Body line
        d.text((cx + 16, cy + 32), body, fill=TEXT_DIM + (255,),
               font=font("Inter-Regular", 11))
        # Model chip (right side)
        mb = d.textbbox((0, 0), model, font=font("Inter-Medium", 10))
        mw, mh = mb[2] - mb[0], mb[3] - mb[1]
        chip_x = cx + card_w - mw - 28
        d.rounded_rectangle((chip_x, cy + card_h - 26, chip_x + mw + 16, cy + card_h - 10),
                            radius=6, fill=BG_DEEPER + (255,),
                            outline=LINE + (255,), width=1)
        d.text((chip_x + 8, cy + card_h - 23), model, fill=TEXT_DIM + (255,),
               font=font("Inter-Medium", 10))

    return card


def mockup_comparison_table(w=560, h=380) -> Image.Image:
    """Comparison table with 4 columns × 6 rows."""
    card = make_mockup_canvas(w, h)
    d = ImageDraw.Draw(card)

    d.text((24, 16), "AI TOOLS COMPARISON · 2026",
           fill=VIOLET + (255,), font=font("Inter-SemiBold", 12))

    cols = ["Tool", "Price", "Free?", "Integ.", "Verdict"]
    col_x = [24, 200, 290, 360, 430]
    col_widths = [170, 86, 66, 66, 105]

    # Header
    rounded_rect(card, (16, 50, w - 16, 80), radius=6, fill=BG_PANEL_2 + (255,))
    for x, c in zip(col_x, cols):
        d.text((x, 58), c, fill=TEXT_DIM + (255,),
               font=font("Inter-SemiBold", 11))

    rows = [
        ("ChatGPT Pro", "$20/mo", "Yes", "950+", "Best general"),
        ("Claude Pro", "$20/mo", "Yes", "320+", "Best writing"),
        ("Cursor", "$20/mo", "Yes", "—", "Best coding"),
        ("Notion AI", "$10/mo", "Limited", "100+", "Best docs"),
        ("Krea", "$10/mo", "Yes", "30+", "Hidden gem"),
        ("Synthesia", "$30/mo", "No", "—", "Avoid <100"),
    ]
    y = 88
    for i, row in enumerate(rows):
        if i % 2 == 0:
            rounded_rect(card, (16, y - 4, w - 16, y + 24), radius=4,
                         fill=BG_DEEPER + (180,))
        for x, val in zip(col_x, row):
            colour = TEXT + (255,)
            if val == "Yes":
                colour = ACCENT_GREEN + (255,)
            elif val == "No":
                colour = (240, 113, 113, 255)
            elif "Avoid" in str(val):
                colour = AMBER + (255,)
            elif "Hidden gem" in str(val):
                colour = ACCENT_CYAN + (255,)
            elif "Best" in str(val):
                colour = LIGHT_VIOLET + (255,)
            d.text((x, y), val, fill=colour, font=font("Inter-Medium", 11))
        y += 36

    return card


def mockup_tools_grid(w=560, h=380, n=20) -> Image.Image:
    """Grid of tool tiles (4×5)."""
    card = make_mockup_canvas(w, h)
    d = ImageDraw.Draw(card)

    d.text((24, 16), "AI TOOLS VAULT", fill=VIOLET + (255,),
           font=font("Inter-SemiBold", 12))
    d.text((24, 32), "545+ tools, ranked, vetted",
           fill=TEXT_DIM + (255,), font=font("Inter-Medium", 11))

    tile_w = (w - 24 * 2 - 4 * 8) // 5
    tile_h = 50
    top = 64
    left = 24
    # Some random tool initials
    tools = [
        "GPT", "CL", "PR", "n8", "Z", "Mk", "Cu", "Vc", "Nt", "Ai",
        "Hb", "Sl", "Ln", "Fk", "Sb", "Vr", "El", "Pn", "Kr", "Pl"
    ]
    # categorisation colours
    palette = [VIOLET, LIGHT_VIOLET, DEEP_VIOLET, ACCENT_CYAN, ACCENT_PINK]
    rng = random.Random(42)
    for i in range(n):
        col = i % 5
        row = i // 5
        tx = left + col * (tile_w + 8)
        ty = top + row * (tile_h + 8)
        clr = palette[i % len(palette)]
        rounded_rect(card, (tx, ty, tx + tile_w, ty + tile_h), radius=8,
                     fill=BG_PANEL_2 + (255,),
                     outline=LINE + (255,), width=1)
        # Coloured chip in the tile
        rounded_rect(card, (tx + 6, ty + 6, tx + 26, ty + 26), radius=4,
                     fill=clr + (255,))
        d.text((tx + 10, ty + 7), tools[i] if i < len(tools) else "?",
               fill=WHITE + (255,), font=font("Inter-Bold", 10))
        # Faux tool name
        d.text((tx + 34, ty + 8), f"Tool {i + 1}", fill=TEXT + (255,),
               font=font("Inter-SemiBold", 10))
        d.text((tx + 34, ty + 24), "$10–50", fill=TEXT_VERY_DIM + (255,),
               font=font("Inter-Regular", 9))

    # Counter at bottom
    d.text((24, h - 32), "View all 545 →", fill=LIGHT_VIOLET + (255,),
           font=font("InterDisplay-Bold", 14))

    return card


def mockup_checklist(w=560, h=380) -> Image.Image:
    """Audit checklist with checked items + progress."""
    card = make_mockup_canvas(w, h)
    d = ImageDraw.Draw(card)

    d.text((24, 16), "BUSINESS PROCESS AUDIT",
           fill=VIOLET + (255,), font=font("Inter-SemiBold", 12))
    d.text((24, 32), "50 questions across 5 dimensions",
           fill=TEXT_DIM + (255,), font=font("Inter-Medium", 11))

    # Score panel at top
    rounded_rect(card, (w - 180, 14, w - 24, 60), radius=10,
                 fill=BG_PANEL_2 + (255,), outline=LINE_BRIGHT + (255,), width=1)
    d.text((w - 170, 22), "Readiness", fill=TEXT_DIM + (255,),
           font=font("Inter-Medium", 10))
    d.text((w - 170, 36), "73 / 100", fill=ACCENT_GREEN + (255,),
           font=font("InterDisplay-Bold", 18))

    # Checklist items
    items = [
        ("People · process documentation", True),
        ("Process · cycle-time measured", True),
        ("Data · clean source-of-truth", True),
        ("Tools · stack rationalised", False),
        ("Outcomes · KPIs traced to ops", False),
    ]
    y = 92
    for label, done in items:
        # Checkbox
        if done:
            d.rounded_rectangle((24, y, 42, y + 18), radius=4,
                                fill=ACCENT_GREEN + (255,))
            d.text((28, y + 1), "✓", fill=BG_DARK + (255,),
                   font=font("InterDisplay-Bold", 14))
        else:
            d.rounded_rectangle((24, y, 42, y + 18), radius=4,
                                outline=LINE_BRIGHT + (255,), width=2,
                                fill=BG_PANEL_2 + (255,))
        d.text((54, y + 1), label, fill=TEXT + (255,),
               font=font("Inter-Medium", 13))
        y += 38

    # Progress bar at bottom
    bar_y = h - 50
    d.text((24, bar_y - 20), "Audit progress",
           fill=TEXT_DIM + (255,), font=font("Inter-Medium", 10))
    rounded_rect(card, (24, bar_y, w - 24, bar_y + 8), radius=4,
                 fill=BG_DEEPER + (255,))
    rounded_rect(card, (24, bar_y, 24 + int((w - 48) * 0.6), bar_y + 8),
                 radius=4, fill=VIOLET + (255,))
    d.text((w - 80, bar_y - 20), "30 of 50",
           fill=LIGHT_VIOLET + (255,), font=font("Inter-SemiBold", 10))

    return card


def mockup_stacked_books(w=560, h=380, n=4, labels=None) -> Image.Image:
    """Stack of tilted product cards/manuals — used for Bundles."""
    card = make_mockup_canvas(w, h)
    labels = labels or ["Workflow Playbook", "Lead Gen Playbook",
                        "30-Day Challenge", "Bundle"]

    # We draw onto a transparent overlay, then composite
    overlay = Image.new("RGBA", card.size, (0, 0, 0, 0))
    for i in range(n):
        book = Image.new("RGBA", (260, 200), (0, 0, 0, 0))
        bd = ImageDraw.Draw(book)
        # Body
        rounded_rect(book, (0, 0, 260, 200), radius=14,
                     fill=BG_PANEL_2 + (255,),
                     outline=LINE_BRIGHT + (255,), width=1)
        # Top accent stripe
        for j in range(28):
            alpha = int(255 * (1 - j / 28) * 0.75)
            bd.line((0, j, 260, j), fill=(139, 92, 246, alpha))
        bd.text((16, 6), "AIPROSOL", fill=WHITE + (255,),
                font=font("Inter-Bold", 10))
        # Title
        if i < len(labels):
            label = labels[i]
            # Wrap to 2 lines
            ld = ImageDraw.Draw(book)
            ts = font("InterDisplay-Bold", 18)
            lines = wrap_text(ld, label, ts, 230)
            for j, l in enumerate(lines[:2]):
                ld.text((16, 48 + j * 22), l, fill=TEXT + (255,), font=ts)
        # Subtitle
        bd.text((16, 110), "Operator-grade · 2026",
                fill=TEXT_DIM + (255,), font=font("Inter-Medium", 10))
        # Star rating
        for s in range(5):
            bd.text((16 + s * 14, 134), "★", fill=AMBER + (255,),
                    font=font("Inter-Bold", 14))
        bd.text((90, 138), "4.8 · 124 reviews",
                fill=TEXT_DIM + (255,), font=font("Inter-Medium", 10))
        # Price
        bd.text((16, 166), f"${ [97, 127, 47, 197][i % 4] }",
                fill=LIGHT_VIOLET + (255,),
                font=font("InterDisplay-Bold", 18))
        # Rotate
        angle = -10 + i * 5
        rotated = book.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True)
        rw, rh = rotated.size
        cx = w // 2 + (i - n / 2 + 0.5) * 70
        cy = h // 2
        overlay.paste(rotated, (int(cx - rw // 2), int(cy - rh // 2)), rotated)

    card.paste(overlay, (0, 0), overlay)
    return card


def mockup_video_play(w=560, h=380) -> Image.Image:
    """Big play button + module dots for Masterclass."""
    card = make_mockup_canvas(w, h)
    d = ImageDraw.Draw(card)

    d.text((24, 16), "MASTERCLASS · MODULE 4 OF 10",
           fill=VIOLET + (255,), font=font("Inter-SemiBold", 12))
    d.text((24, 32), "The 7 Workflow Patterns",
           fill=TEXT + (255,), font=font("Inter-Bold", 14))

    # Frame
    rounded_rect(card, (24, 70, w - 24, h - 70), radius=14,
                 fill=BG_DEEPER + (255,), outline=LINE_BRIGHT + (255,), width=1)
    # Play button
    cx, cy = w // 2, (h + 70 - 70) // 2
    # Outer glow
    for r in range(50, 0, -2):
        alpha = int(80 * (1 - r / 50) ** 2)
        d.ellipse((cx - r - 24, cy - r - 24, cx + r + 24, cy + r + 24),
                  outline=(139, 92, 246, alpha))
    d.ellipse((cx - 50, cy - 50, cx + 50, cy + 50), fill=VIOLET + (255,))
    # Triangle
    d.polygon([(cx - 14, cy - 20), (cx + 22, cy), (cx - 14, cy + 20)],
              fill=WHITE + (255,))

    # Module dots at bottom
    dots_y = h - 50
    n_modules = 10
    spacing = (w - 80) // (n_modules - 1)
    for i in range(n_modules):
        dx = 40 + i * spacing
        clr = VIOLET + (255,) if i <= 3 else LINE_BRIGHT + (255,)
        if i == 3:
            d.ellipse((dx - 7, dots_y - 7, dx + 7, dots_y + 7), fill=LIGHT_VIOLET + (255,))
        else:
            d.ellipse((dx - 5, dots_y - 5, dx + 5, dots_y + 5), fill=clr)

    d.text((24, dots_y + 18), "4 / 10 complete", fill=TEXT_DIM + (255,),
           font=font("Inter-Medium", 10))
    d.text((w - 88, dots_y + 18), "5h 12m left", fill=TEXT_DIM + (255,),
           font=font("Inter-Medium", 10))

    return card


def mockup_enterprise_phases(w=560, h=380) -> Image.Image:
    """3-phase 90-day roadmap for enterprise."""
    card = make_mockup_canvas(w, h)
    d = ImageDraw.Draw(card)

    d.text((24, 16), "ENTERPRISE READINESS",
           fill=VIOLET + (255,), font=font("Inter-SemiBold", 12))
    d.text((24, 32), "90-day implementation plan",
           fill=TEXT_DIM + (255,), font=font("Inter-Medium", 11))

    # Three phase columns
    phases = [
        ("Phase 0", "Days 1-30", "Foundation",
         ["Data audit", "Vendor RFP", "Governance setup", "12-dim scorecard"]),
        ("Phase 1", "Days 31-60", "Pilot",
         ["1 high-ROI workflow", "Cost ceiling lock", "Eval harness", "Soft-fail design"]),
        ("Phase 2", "Days 61-90", "Scale",
         ["Roll-out playbook", "Training rollout", "KPI dashboard", "Retro + iterate"]),
    ]
    col_w = (w - 48 - 16) // 3
    col_h = h - 100
    top = 64
    for i, (phase, dates, name, items) in enumerate(phases):
        x = 24 + i * (col_w + 8)
        # Column card
        rounded_rect(card, (x, top, x + col_w, top + col_h), radius=10,
                     fill=BG_PANEL_2 + (255,),
                     outline=LINE_BRIGHT + (255,), width=1)
        # Phase header
        d.text((x + 14, top + 10), phase, fill=LIGHT_VIOLET + (255,),
               font=font("InterDisplay-Bold", 16))
        d.text((x + 14, top + 34), dates, fill=TEXT_DIM + (255,),
               font=font("Inter-Medium", 10))
        d.text((x + 14, top + 50), name, fill=TEXT + (255,),
               font=font("Inter-SemiBold", 13))
        # Items
        d.line((x + 14, top + 76, x + col_w - 14, top + 76),
               fill=LINE + (255,), width=1)
        for j, item in enumerate(items):
            iy = top + 88 + j * 26
            d.ellipse((x + 14, iy + 3, x + 22, iy + 11), fill=VIOLET + (255,))
            d.text((x + 28, iy), item, fill=TEXT + (255,),
                   font=font("Inter-Medium", 11))

    return card


def mockup_zap_make(w=560, h=380) -> Image.Image:
    """Two large app icons connected by arrows."""
    card = make_mockup_canvas(w, h)
    d = ImageDraw.Draw(card)

    d.text((24, 16), "ZAPIER ⇄ MAKE",
           fill=VIOLET + (255,), font=font("Inter-SemiBold", 12))
    d.text((24, 32), "50 production recipes",
           fill=TEXT_DIM + (255,), font=font("Inter-Medium", 11))

    # Left circle — Zapier
    cx_l, cy = 150, 200
    d.ellipse((cx_l - 70, cy - 70, cx_l + 70, cy + 70), fill=(255, 142, 49, 255))
    d.text((cx_l - 26, cy - 14), "Zap", fill=WHITE + (255,),
           font=font("InterDisplay-Black", 28))

    # Right circle — Make
    cx_r = w - 150
    d.ellipse((cx_r - 70, cy - 70, cx_r + 70, cy + 70), fill=(106, 89, 247, 255))
    d.text((cx_r - 26, cy - 14), "Mk", fill=WHITE + (255,),
           font=font("InterDisplay-Black", 28))

    # Bidirectional arrow
    arrow_y = cy
    d.line((cx_l + 80, arrow_y, cx_r - 80, arrow_y), fill=LIGHT_VIOLET + (255,), width=3)
    # Arrowheads
    d.polygon([(cx_r - 80, arrow_y), (cx_r - 95, arrow_y - 8), (cx_r - 95, arrow_y + 8)],
              fill=LIGHT_VIOLET + (255,))
    d.polygon([(cx_l + 80, arrow_y), (cx_l + 95, arrow_y - 8), (cx_l + 95, arrow_y + 8)],
              fill=LIGHT_VIOLET + (255,))

    # 50 recipes label
    d.text(((w - 116) // 2, cy - 40), "50 recipes",
           fill=LIGHT_VIOLET + (255,), font=font("InterDisplay-Bold", 14))
    d.text(((w - 116) // 2 + 10, cy + 20), "+ playbook",
           fill=TEXT_DIM + (255,), font=font("Inter-Medium", 10))

    # Tool counter row at bottom
    d.text((24, h - 36), "25 Zapier", fill=ACCENT_GREEN + (255,),
           font=font("Inter-SemiBold", 12))
    d.text((140, h - 36), "+ 25 Make", fill=ACCENT_CYAN + (255,),
           font=font("Inter-SemiBold", 12))
    d.text((260, h - 36), "+ decision matrix", fill=TEXT_DIM + (255,),
           font=font("Inter-Medium", 11))

    return card


def mockup_vault(w=560, h=380) -> Image.Image:
    """A vault icon with 18 small product tiles inside (Complete Vault)."""
    card = make_mockup_canvas(w, h)
    d = ImageDraw.Draw(card)

    d.text((24, 16), "THE COMPLETE VAULT",
           fill=VIOLET + (255,), font=font("Inter-SemiBold", 12))
    d.text((24, 32), "All 18 products. $1,384 saved.",
           fill=TEXT_DIM + (255,), font=font("Inter-Medium", 11))

    # Outer vault frame
    rounded_rect(card, (50, 70, w - 50, h - 30), radius=20,
                 fill=BG_DEEPER + (255,),
                 outline=LIGHT_VIOLET + (255,), width=2)
    # Center divider lines (vault door look)
    d.line((50, 174, w - 50, 174), fill=LINE_BRIGHT + (255,), width=1)
    # Vault dial decorations - 4 corner studs
    for sx, sy in [(70, 90), (w - 70, 90), (70, h - 50), (w - 70, h - 50)]:
        d.ellipse((sx - 6, sy - 6, sx + 6, sy + 6),
                  fill=LIGHT_VIOLET + (255,))

    # 6 columns × 3 rows = 18 product tiles
    tile_w = 70
    tile_h = 60
    gap = 8
    top = 90
    left = 80
    for i in range(18):
        col = i % 6
        row = i // 6
        tx = left + col * (tile_w + gap)
        ty = top + row * (tile_h + gap)
        # Tile
        rounded_rect(card, (tx, ty, tx + tile_w, ty + tile_h), radius=6,
                     fill=BG_PANEL_2 + (255,),
                     outline=LINE + (255,), width=1)
        # Color accent strip on top
        d.line((tx + 6, ty + 6, tx + tile_w - 6, ty + 6),
               fill=VIOLET + (255,), width=2)
        # Mini tile number
        d.text((tx + 6, ty + 14), f"P{i + 1:02d}", fill=TEXT + (255,),
               font=font("Inter-Bold", 11))
        d.text((tx + 6, ty + 32), "Product",
               fill=TEXT_DIM + (255,), font=font("Inter-Regular", 8))
        d.text((tx + 6, ty + 44), f"${[17, 37, 47, 67, 97, 127][i % 6]}",
               fill=LIGHT_VIOLET + (255,),
               font=font("Inter-Bold", 9))

    return card


def mockup_agency_office(w=560, h=380) -> Image.Image:
    """Agency growth chart + business metrics."""
    card = make_mockup_canvas(w, h)
    d = ImageDraw.Draw(card)

    d.text((24, 16), "AGENCY STARTER PACK",
           fill=VIOLET + (255,), font=font("Inter-SemiBold", 12))
    d.text((24, 32), "Zero to first client in 60 days",
           fill=TEXT_DIM + (255,), font=font("Inter-Medium", 11))

    # Revenue chart
    rounded_rect(card, (24, 60, w - 24, 240), radius=12,
                 fill=BG_PANEL_2 + (255,),
                 outline=LINE + (255,), width=1)
    d.text((40, 72), "Year-1 MRR projection",
           fill=TEXT_DIM + (255,), font=font("Inter-Medium", 10))
    d.text((40, 88), "$28,400", fill=LIGHT_VIOLET + (255,),
           font=font("InterDisplay-Bold", 24))

    # Line chart
    chart_x, chart_y, chart_w, chart_h = 40, 130, w - 80, 88
    pts = [
        (chart_x + i * chart_w / 11,
         chart_y + chart_h - (chart_h - 10) * (0.05 + 0.95 * (i / 11) ** 1.3))
        for i in range(12)
    ]
    # Fill area under line
    fill_poly = pts + [(chart_x + chart_w, chart_y + chart_h),
                       (chart_x, chart_y + chart_h)]
    fill_layer = Image.new("RGBA", card.size, (0, 0, 0, 0))
    fd = ImageDraw.Draw(fill_layer)
    fd.polygon(fill_poly, fill=(139, 92, 246, 80))
    card.paste(fill_layer, (0, 0), fill_layer)
    # Line
    for i in range(len(pts) - 1):
        d.line((pts[i], pts[i + 1]), fill=LIGHT_VIOLET + (255,), width=2)
    # Dots
    for px, py in pts:
        d.ellipse((px - 3, py - 3, px + 3, py + 3), fill=LIGHT_VIOLET + (255,))

    # KPI tiles
    tiles = [("12", "Clients"), ("$2.4K", "Avg MRR"), ("82%", "Retention"),
             ("3.6m", "Avg LTV")]
    tile_w = (w - 24 * 2 - 24) // 4
    ty = 270
    for i, (val, label) in enumerate(tiles):
        tx = 24 + i * (tile_w + 8)
        rounded_rect(card, (tx, ty, tx + tile_w, ty + 70), radius=10,
                     fill=BG_DEEPER + (255,),
                     outline=LINE + (255,), width=1)
        d.text((tx + 12, ty + 12), val, fill=LIGHT_VIOLET + (255,),
               font=font("InterDisplay-Bold", 16))
        d.text((tx + 12, ty + 44), label, fill=TEXT_DIM + (255,),
               font=font("Inter-Medium", 10))

    return card


def mockup_stack_hub(w=560, h=380) -> Image.Image:
    """Stack starter kit - hub showing 14 tools connected."""
    card = make_mockup_canvas(w, h)
    d = ImageDraw.Draw(card)

    d.text((24, 16), "AI STACK · 14 TOOLS",
           fill=VIOLET + (255,), font=font("Inter-SemiBold", 12))
    d.text((24, 32), "Connected via 18 n8n workflows",
           fill=TEXT_DIM + (255,), font=font("Inter-Medium", 11))

    # Center hub
    hub_x, hub_y = w // 2, h // 2 + 10
    d.ellipse((hub_x - 50, hub_y - 50, hub_x + 50, hub_y + 50), fill=VIOLET + (255,))
    d.text((hub_x - 28, hub_y - 14), "n8n", fill=WHITE + (255,),
           font=font("InterDisplay-Black", 24))

    # Surrounding tools
    n = 14
    tool_names = ["Slack", "GPT", "Calendly", "HubSpot", "Notion", "Gmail",
                  "Linear", "Stripe", "Drive", "Twilio", "Clay", "Resend",
                  "Sheets", "Asana"]
    for i in range(n):
        angle = (2 * math.pi * i / n) - math.pi / 2
        r = 140
        tx = hub_x + r * math.cos(angle)
        ty = hub_y + r * math.sin(angle)
        # Tool circle
        d.ellipse((tx - 28, ty - 28, tx + 28, ty + 28),
                  fill=BG_PANEL_2 + (255,),
                  outline=LINE_BRIGHT + (255,), width=1)
        # Inner colored chip
        d.ellipse((tx - 10, ty - 10, tx + 10, ty + 10),
                  fill=LIGHT_VIOLET + (255,))
        # Tool name below the circle
        # Skip if too close to overlap
        name = tool_names[i]
        nb = d.textbbox((0, 0), name, font=font("Inter-Medium", 9))
        nw = nb[2] - nb[0]
        d.text((tx - nw / 2, ty + 32), name, fill=TEXT_DIM + (255,),
               font=font("Inter-Medium", 9))
        # Connection line
        # Start from hub edge, end at tool circle edge
        sx = hub_x + 50 * math.cos(angle)
        sy = hub_y + 50 * math.sin(angle)
        ex = tx - 28 * math.cos(angle)
        ey = ty - 28 * math.sin(angle)
        d.line((sx, sy, ex, ey), fill=LINE_BRIGHT + (255,), width=1)

    return card


def mockup_rocket_starter(w=560, h=380) -> Image.Image:
    """Starter pack mockup — rocket/launch motif with metrics."""
    card = make_mockup_canvas(w, h)
    d = ImageDraw.Draw(card)

    d.text((24, 16), "GLOBAL STARTER PACK",
           fill=VIOLET + (255,), font=font("Inter-SemiBold", 12))
    d.text((24, 32), "First 30 days. No consultants required.",
           fill=TEXT_DIM + (255,), font=font("Inter-Medium", 11))

    # Side panel: 5 starter components
    d.text((24, 70), "Day 1-30 starter kit", fill=TEXT + (255,),
           font=font("Inter-SemiBold", 12))
    items = [
        "10 importable n8n workflows",
        "5-tool recommended stack ($60-$200/mo)",
        "Quick-Start audit (15 min)",
        "Day 1 → Day 30 playbook",
        "Failure-mode reference (8 patterns)",
    ]
    for i, it in enumerate(items):
        y = 96 + i * 30
        d.ellipse((30, y + 5, 38, y + 13), fill=VIOLET + (255,))
        d.text((48, y), it, fill=TEXT + (255,),
               font=font("Inter-Medium", 11))

    # Mini countdown box at bottom
    countdown_y = h - 60
    rounded_rect(card, (24, countdown_y, w - 24, countdown_y + 40), radius=10,
                 fill=BG_PANEL_2 + (255,),
                 outline=LIGHT_VIOLET + (255,), width=1)
    for i, (val, label) in enumerate([("30", "Days"), ("10", "Workflows"),
                                        ("5", "Tools"), ("$60", "Stack/mo")]):
        cx = 30 + i * ((w - 60) // 4)
        d.text((cx + 10, countdown_y + 6), val,
               fill=LIGHT_VIOLET + (255,),
               font=font("InterDisplay-Bold", 14))
        d.text((cx + 10, countdown_y + 26), label,
               fill=TEXT_DIM + (255,), font=font("Inter-Medium", 8))

    return card


# ───────────────────────────────────────────────────────────
# Master per-slug mockup map
# ───────────────────────────────────────────────────────────
MOCKUP: dict[str, Callable[..., Image.Image]] = {
    "global-business-automation-starter-pack": mockup_rocket_starter,
    "the-starter-bundle": lambda w=560, h=380: mockup_stacked_books(
        w, h, n=3, labels=["ROI Pitch Deck", "Audit Checklist", "ROI Calculator"]),
    "the-playbook-pack": lambda w=560, h=380: mockup_stacked_books(
        w, h, n=3, labels=["Workflow Playbook", "Lead Gen Playbook", "30-Day Challenge"]),
    "the-ai-tools-vault": mockup_tools_grid,
    "the-agency-launch-bundle": mockup_agency_office,
    "the-complete-vault": mockup_vault,
    "automation-roi-pitch-deck-template": mockup_slide_deck,
    "business-process-audit-checklist": mockup_checklist,
    "30-day-business-automation-challenge": mockup_calendar,
    "ai-tools-master-comparison-guide-2026": mockup_comparison_table,
    "lead-generation-automation-playbook": mockup_funnel,
    "chatgpt-business-prompt-vault": mockup_prompt_cards,
    "zapier-make-power-user-bundle": mockup_zap_make,
    "ai-workflow-architecture-masterclass": mockup_video_play,
    "enterprise-ai-readiness-assessment-kit": mockup_enterprise_phases,
    "the-ai-automation-agency-starter-pack": mockup_agency_office,
    "ai-tools-stack-starter-kit": mockup_stack_hub,
    "workflow-automation-playbook": mockup_workflow_nodes,
    "ai-automation-roi-calculator": mockup_spreadsheet,
}


# ───────────────────────────────────────────────────────────
# Composer
# ───────────────────────────────────────────────────────────
def compose_cover(product: dict, target_w: int, target_h: int,
                  is_thumbnail: bool = False) -> Image.Image:
    """Compose a full cover for a product."""
    bg = build_background(target_w, target_h)
    bg = add_top_corner_glow(bg, VIOLET)
    img = bg.convert("RGBA")

    # Decorative viewfinder corner marks (premium framed feel)
    draw_corner_marks(img, inset=18 if is_thumbnail else 24)

    d = ImageDraw.Draw(img)

    slug = product["slug"]
    name = product["name"]
    short_desc = (product.get("shortDescription") or "").strip()
    category = product.get("category", "")
    price = product.get("price", 0)
    available = product.get("available", True)
    expected = product.get("expectedShipDate")
    popularity = product.get("popularity", 0) or 0

    # ── Hero mockup ──
    mockup_fn = MOCKUP.get(slug)
    if mockup_fn:
        # Generate mockup at native size, then scale for thumbnails
        native_w, native_h = (560, 380) if not is_thumbnail else (420, 280)
        mockup = mockup_fn(native_w, native_h) if callable(mockup_fn) else None
        if mockup:
            # Position: left-half centered
            mockup_cx = int(target_w * 0.32)
            mockup_cy = int(target_h * 0.50)
            # Tilt slightly
            tilt_paste(img, mockup, (mockup_cx, mockup_cy), -3.5, shadow=True)

    # ── Aiprosol mark (top-right) ──
    mark_x = target_w - 26
    mark_y = 26
    mark_font = font("InterDisplay-ExtraBold",
                     14 if is_thumbnail else 16)
    mark_text = "AIPROSOL"
    mw, mh = measure(d, mark_text, mark_font)
    # Violet square mark
    d.rounded_rectangle((mark_x - mw - 32, mark_y - 4,
                         mark_x - mw - 14, mark_y + mh + 2),
                        radius=4, fill=VIOLET + (255,))
    d.text((mark_x - mw - 28, mark_y - 2), "A", fill=WHITE + (255,),
           font=font("InterDisplay-Black", 14 if is_thumbnail else 16))
    d.text((mark_x - mw, mark_y), mark_text, fill=TEXT + (255,), font=mark_font)

    # ── Category chip (top-left) ──
    if category:
        cat_font = font("Inter-SemiBold",
                        10 if is_thumbnail else 12)
        cat_text = category.upper()
        cw, ch = measure(d, cat_text, cat_font)
        chip_x = 32 if not is_thumbnail else 24
        chip_y = 28 if not is_thumbnail else 22
        # Solid darker chip so it pops against the corner glow
        d.rounded_rectangle((chip_x, chip_y - 6, chip_x + cw + 28, chip_y + ch + 8),
                            radius=99, fill=(20, 16, 35, 235),
                            outline=LIGHT_VIOLET + (255,), width=1)
        # Inner accent dot
        d.ellipse((chip_x + 12, chip_y + ch // 2 - 1,
                   chip_x + 18, chip_y + ch // 2 + 5),
                  fill=LIGHT_VIOLET + (255,))
        # Letter-spacing the text
        d.text((chip_x + 22, chip_y + 1), cat_text,
               fill=WHITE + (255,), font=cat_font)

    # ── Name + tagline (right column) ──
    # Right column starts at 56% of width, ends at 96%
    col_x = int(target_w * 0.56)
    col_w = int(target_w * 0.40)
    col_top = int(target_h * 0.20) if is_thumbnail else int(target_h * 0.22)

    # Name (huge)
    name_size = 36 if is_thumbnail else 52
    while True:
        nf = font("InterDisplay-Black", name_size)
        lines = wrap_text(d, name, nf, col_w)
        # Fit constraints
        if len(lines) <= 3 and name_size >= 22:
            break
        name_size -= 3
        if name_size < 22:
            break
    line_h = int(name_size * 1.05)
    for i, line in enumerate(lines):
        # Text shadow
        d.text((col_x + 1, col_top + i * line_h + 2), line,
               fill=(0, 0, 0, 180), font=nf)
        d.text((col_x, col_top + i * line_h), line,
               fill=WHITE + (255,), font=nf)
    name_bottom = col_top + len(lines) * line_h

    # Hairline divider under the name (premium feel)
    div_y = name_bottom + (6 if is_thumbnail else 10)
    div_len = 60 if is_thumbnail else 80
    d.line((col_x, div_y, col_x + div_len, div_y),
           fill=LIGHT_VIOLET + (220,), width=2)

    # Tagline (shortDescription, wrapped to fit)
    if short_desc:
        tag_size = 14 if is_thumbnail else 16
        tf = font("Inter-Medium", tag_size)
        tag_lines = wrap_text(d, short_desc, tf, col_w)[:3]
        tag_y = div_y + (12 if is_thumbnail else 18)
        for i, line in enumerate(tag_lines):
            d.text((col_x, tag_y + i * int(tag_size * 1.45)),
                   line, fill=TEXT_DIM + (255,), font=tf)

    # Popularity badge (top of right column) — only for "hot" products
    if popularity >= 50 and not is_thumbnail:
        pop_text = "★ MOST POPULAR"
        pf = font("Inter-Bold", 11)
        pw, ph = measure(d, pop_text, pf)
        # Just above the name
        pop_y = col_top - 38
        d.rounded_rectangle((col_x, pop_y - 4, col_x + pw + 22, pop_y + ph + 6),
                            radius=99,
                            fill=(245, 158, 11, 35),
                            outline=AMBER + (255,), width=1)
        d.text((col_x + 11, pop_y + 1), pop_text,
               fill=AMBER + (255,), font=pf)

    # ── Bottom row: price + badges ──
    bottom_y = target_h - (50 if is_thumbnail else 56)
    # Price chip (right side)
    price_text = f"${price}"
    pf = font("InterDisplay-ExtraBold",
              22 if is_thumbnail else 32)
    pw, ph = measure(d, price_text, pf)
    price_x = target_w - 32 - pw - 24
    price_y = bottom_y - ph // 2
    # Price chip background
    d.rounded_rectangle((price_x - 14, price_y - 6, price_x + pw + 14, price_y + ph + 6),
                        radius=12, fill=(139, 92, 246, 60),
                        outline=LIGHT_VIOLET + (255,), width=1)
    d.text((price_x, price_y), price_text, fill=WHITE + (255,), font=pf)

    # Status badge (left of price)
    if available:
        badge_text = "Instant download"
        badge_color = ACCENT_GREEN
        badge_bg = (10, 6, 19, 235)
        badge_border = ACCENT_GREEN + (255,)
        dot_color = ACCENT_GREEN
    else:
        ship = expected or "soon"
        badge_text = f"Reserve · ships {ship}"
        badge_color = AMBER
        badge_bg = (10, 6, 19, 235)
        badge_border = AMBER + (255,)
        dot_color = AMBER
    bf = font("Inter-SemiBold", 11 if is_thumbnail else 12)
    bw, bh = measure(d, badge_text, bf)
    badge_x = 32 if not is_thumbnail else 24
    # Pill (more padding on both sides)
    pill_r = badge_x + bw + 38
    d.rounded_rectangle((badge_x, bottom_y - bh // 2 - 9,
                         pill_r, bottom_y + bh // 2 + 9),
                        radius=99, fill=badge_bg,
                        outline=badge_border, width=1)
    # Status dot (left)
    cy = bottom_y - bh // 2 + bh // 2
    d.ellipse((badge_x + 12, cy - 4, badge_x + 20, cy + 4),
              fill=dot_color + (255,))
    # Text
    d.text((badge_x + 26, bottom_y - bh // 2), badge_text,
           fill=badge_color + (255,), font=bf)

    # Lifetime badge (next to status)
    if not is_thumbnail:
        life_text = "Lifetime access"
        lf = font("Inter-Medium", 11)
        lw_t, lh_t = measure(d, life_text, lf)
        lx = pill_r + 10
        d.rounded_rectangle((lx, bottom_y - lh_t // 2 - 9,
                             lx + lw_t + 24, bottom_y + lh_t // 2 + 9),
                            radius=99, fill=(10, 6, 19, 235),
                            outline=LINE_BRIGHT + (255,), width=1)
        d.text((lx + 12, bottom_y - lh_t // 2), life_text,
               fill=TEXT_DIM + (255,), font=lf)

    return img.convert("RGB")


def main() -> None:
    products = json.loads(PRODUCTS_JSON.read_text())
    print(f"Generating covers for {len(products)} products...\n")

    for p in products:
        slug = p["slug"]

        cover = compose_cover(p, 1280, 720, is_thumbnail=False)
        cover_path = OUT_COVERS / f"{slug}.png"
        cover.save(cover_path, "PNG", optimize=True, quality=92)

        thumb = compose_cover(p, 800, 500, is_thumbnail=True)
        thumb_path = OUT_THUMBS / f"{slug}.png"
        thumb.save(thumb_path, "PNG", optimize=True, quality=92)

        cover_kb = cover_path.stat().st_size // 1024
        thumb_kb = thumb_path.stat().st_size // 1024
        print(f"  ✓ {slug:55} cover {cover_kb}KB · thumb {thumb_kb}KB")

    print(f"\nDone. Output:")
    print(f"  Covers: {OUT_COVERS}")
    print(f"  Thumbs: {OUT_THUMBS}")


if __name__ == "__main__":
    main()
