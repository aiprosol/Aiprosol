# AIPROSOL · CAROUSEL #2 · "5 workflows every services business should automate first"
## Instagram + LinkedIn carousel — Pillar C tactical playbook · Canva-ready

The first Pillar C entry per `CONTENT-PACK-IG-TIKTOK.md` — tactical listicle in carousel form. Designed for high "save" rate (listicles save 3-5× the brand-story average). Repeatable template — you can ship one of these every 7-10 days for months without re-thinking the format.

- **Format:** Instagram Carousel · 8 slides · 1080×1350 (4:5)
- **Production tool:** Canva (free tier). Re-use the brand template from `CAROUSEL-01-org-chart.md`.
- **Time to assemble:** ~30 min from the template, ~10 min for each subsequent listicle that reuses the design
- **No Higgsfield / no video render needed**
- **Cross-post strategy:** Identical assets work on LinkedIn (as "document" post). LinkedIn carousels get 4-5× a regular post's reach.
- **Primary CTA on slide 8:** `aiprosol.com/services` (deeper than ROI Audit — listicle audience is in research mode)
- **Posting day:** Tuesday Week 3 per the content pack pillar cadence

---

## Brand parameters · same tokens as Carousel #1

| Token | Hex |
|---|---|
| Background | `#0A0613` |
| Surface | `#13101F` |
| Border | `#2A1F3D` |
| Primary violet | `#8B5CF6` |
| Accent violet | `#C084FC` |
| Display font | Space Grotesk 800 |
| Body font | Inter 500 |

**Visual frame (repeating across slides):** violet eyebrow chip top, content centre, Aiprosol "A" mark bottom-left + `aiprosol.com` bottom-right.

---

## SLIDE 1 · COVER (the swipe trigger)

**Background:** Solid `#0A0613`. Soft violet radial glow centred behind text.

**Eyebrow chip (top-left, 40pt):**
`PILLAR C · TACTICAL PLAYBOOK` — Inter 600, violet, all caps.

**Headline (centred, three lines):**
- Line 1: **5 WORKFLOWS** — Space Grotesk 800, 110pt, white `#E5E7EB`
- Line 2: **EVERY SERVICES** — same style, 84pt
- Line 3: **BUSINESS SHOULD AUTOMATE FIRST** — gradient, 72pt

**Sub-line (Inter 500, 26pt, muted):**
> Built and tested at Aiprosol. Receipts inside →

**Footer:** A-mark bottom-left, `aiprosol.com` bottom-right.

---

## SLIDE 2 · WORKFLOW #1 · LEAD RESPONSE

**Eyebrow chip:** `WORKFLOW · 01`

**Big number (top, Space Grotesk 800, 96pt, gradient):**
> 01

**Title (Space Grotesk 800, 56pt):**
> Lead response.

**Visual diagram (centred, ~600px tall):**
```
[Lead lands]  →  [Score + enrich]  →  [Personalised reply]  →  [CRM update]  →  [Calendar slot held]  →  [Slack ping to owner]
```
Each step in its own small dark card (`#13101F` fill, violet border), connector arrows in violet between them. Whole flow fits on one row, with the cards small enough to read.

**Bottom row (3 lines, Inter 500, 22pt):**
- **Cost to wire:** ~2-3 days of an n8n / Make build
- **Tools:** Webhook → Claude → CRM → Calendar → Slack
- **Real result:** Meridian Property cut response from 6h → 3min. +28% conversion.

---

## SLIDE 3 · WORKFLOW #2 · DOCUMENT INTAKE

**Eyebrow chip:** `WORKFLOW · 02`

**Big number:** `02`

**Title:**
> Document intake.

**Visual diagram:**
```
[PDF / email lands]  →  [OCR + extract]  →  [Classify]  →  [Check against playbook]  →  [Auto-log]  →  [Exception queue (1%)]
```

**Bottom row:**
- **Cost to wire:** ~1-2 weeks for a domain-specific IDP layer
- **Tools:** Document AI → Claude (classification) → Notion → exception flag
- **Real result:** Hargreaves & Sterling reclaimed 45 hrs/wk per partner. 3-wk ROI. 99% IDP accuracy.

---

## SLIDE 4 · WORKFLOW #3 · CUSTOMER SUPPORT TRIAGE

**Eyebrow chip:** `WORKFLOW · 03`

**Big number:** `03`

**Title:**
> Support triage.

**Visual diagram:**
```
[Inbound ticket]  →  [Classify intent]  →  [Match KB article]  →  [Draft reply]  →  [Auto-send (low risk) OR human review (high risk)]
```

**Bottom row:**
- **Cost to wire:** ~3-5 days starting from a clean help-centre
- **Tools:** Help desk webhook → Claude → KB embeddings → human-review queue
- **Real result:** Aiprosol's own support — 73% of tickets resolved without human touch. P95 reply 2.4 min.

---

## SLIDE 5 · WORKFLOW #4 · QUOTING + INVOICING

**Eyebrow chip:** `WORKFLOW · 04`

**Big number:** `04`

**Title:**
> Quote → invoice.

**Visual diagram:**
```
[Scoped requirements]  →  [Auto-quote]  →  [E-sign envelope sent]  →  [Stripe invoice on sign]  →  [Slack to ops on payment]
```

**Bottom row:**
- **Cost to wire:** ~2-4 days for a 3-tier quoting flow
- **Tools:** Form/CRM → quote engine → DocuSign → Stripe → Slack
- **Real result:** Quote-to-invoice cycle 4-7 days → 22 hours at one client. Cash flow win.

---

## SLIDE 6 · WORKFLOW #5 · INTERNAL REPORTING

**Eyebrow chip:** `WORKFLOW · 05`

**Big number:** `05`

**Title:**
> Internal reporting.

**Visual diagram:**
```
[Multi-source data pull]  →  [Anomaly detection]  →  [Auto-narrative]  →  [Weekly digest in Slack]  →  [Drill-down dashboard]
```

**Bottom row:**
- **Cost to wire:** ~1-2 weeks (data plumbing is the heavy lift, not the AI)
- **Tools:** Warehouse + BI tool → Claude (narrative gen) → Slack
- **Real result:** Aiprosol's own weekly KPI digest. Used to need 3-4 human hours; now 0.

---

## SLIDE 7 · THE PATTERN

**Eyebrow chip:** `THE PATTERN`

**Headline (Space Grotesk 800, 56pt, centred):**
> Notice anything?

**Three vertical cards (each 920×180px):**

**Card 1 (Space Grotesk 700, 28pt title + Inter 500, 22pt body):**
> **They all start with a webhook.**
> Trigger-driven flows beat scheduled batches every time. The first thing to wire is *what causes work to arrive*, not *what we do with it once it's arrived*.

**Card 2:**
> **They all have a human-review slot.**
> Even the most automated of the five has a 1% exception path. Volume × low touch beats volume × no touch.

**Card 3:**
> **They all replace a coordination tax, not a creative task.**
> The AI handles the routing, drafting, and logging. The human still owns the judgment.

---

## SLIDE 8 · THE CTA

**Eyebrow chip:** `WHERE TO START`

**Headline (Space Grotesk 800, 80pt, centred):**
> Pick one.

**Sub-line (Inter 500, 28pt, muted, centred):**
> The ROI Audit will tell you which of the five is highest-leverage for your business.

**Big button (gradient, 720×120px):**
> aiprosol.com/roi-audit →

**Three small icons + labels (Inter 500, 18pt):**
- 🔵 60 seconds
- 🔵 Free
- 🔵 No signup

**Footer (Inter 500, 18pt, centred, muted):**
> Or DM "workflow" — I'll send the full breakdown of any of the five.

---

## Caption · paste-ready (Instagram + LinkedIn)

```
5 workflows every services business should automate first.

Built and tested inside Aiprosol — the AI-led automation consultancy. Each one with cost-to-wire, tool stack, and a real customer result.

01 · Lead response — 6h → 3min, +28% conversion
02 · Document intake — 45 hrs/wk per partner reclaimed
03 · Support triage — 73% tickets resolved without human touch
04 · Quote → invoice — 7 days → 22 hours
05 · Internal reporting — 4 hrs/wk → 0

The pattern? All five start with a webhook. All five have a human-review slot. All five replace a *coordination* tax, not a creative one.

Save this. Tap save on slide 7 — that's the principles slide.

Free 60-second ROI Audit at aiprosol.com tells you which of the five is highest-leverage for your business 🟣

—

Hashtags:
#WorkflowAutomation #BusinessAutomation #AIAutomation #NoCodeAI #ServicesBusiness #SmallBusinessGrowth #OperationalExcellence #SaaSFounder #FoundersJourney #BuildInPublic
```

---

## Why this carousel works (and why it's repeatable)

- **Listicles save 3-5× brand-story posts.** "Save" is the second-strongest reach driver on Instagram after "share." Lists are the highest-save format.
- **Every slide is a frame people will screenshot.** Each workflow slide is self-contained — someone can screenshot slide 3 to send to their ops lead.
- **Receipt-anchored.** Every workflow ties to a real customer case study (or Aiprosol's own internal use). Numbers do the persuasion; design just gets out of the way.
- **Repeatable template.** Future tactical-playbook carousels (Pillar C):
  - "7 signs you've outgrown Zapier" (Carousel #3)
  - "5 ways to wire IDP into your firm in under 3 weeks" (Carousel #4)
  - "The 3-minute response stack — exact tools" (Carousel #5)
  - "Stripe + Calendly + a chatbot = $10k/mo sales engine" (Carousel #6)

Same visual frame, swap content. Ship one a week for two months → 8 carousels deep.

---

## Cross-post · LinkedIn document carousel

Export the 8 PNGs → drag into LinkedIn → "Document" post. The LinkedIn algorithm rewards document carousels 4-5× over single-image posts because they keep viewers on-platform longer.

**LinkedIn caption (slightly different from IG):**
```
The 5 workflows we built first when we set up Aiprosol — the consultancy where the CEO is an AI.

Each one starts with a webhook. Each one has a human-review slot. Each one replaces a *coordination tax*, not a creative task.

01 · Lead response — Meridian cut 6h → 3min, +28% conversion
02 · Document intake — Hargreaves reclaimed 45 hrs/wk per partner
03 · Support triage — 73% resolved without human touch
04 · Quote → invoice — 7 days → 22 hours cycle time
05 · Internal reporting — 4 hrs/wk → 0

Slide 7 is the principles slide. Save that one.

If you're running a services business and trying to figure out where to start, run the 60-second ROI Audit at aiprosol.com — it'll tell you which of these five is the highest-leverage for your specific ops.

Or DM "workflow" and I'll send the full breakdown of any one of them.
```

---

## Common Canva pitfalls (specific to this carousel)

| Pitfall | Fallback |
|---|---|
| The flow-diagram boxes don't fit cleanly in 1080px width | Reduce each box to 130px wide, shrink the connector arrows. If still too tight, stack the flow into 2 rows for that slide. |
| Step labels read fine on desktop but blur on mobile | Set minimum body font to 18pt on the flow diagrams. Test by viewing the export on your phone before posting. |
| Per-workflow customer name is wrong / not yet permissioned | Use anonymised form: "(Real estate agency · UK)" instead of "Meridian Property." See `SINGLE-POST-01-95k-stockout.md` for the anonymised template pattern. |
| Slide 7 cards feel cramped | The slide tolerates exactly three cards. Don't add a fourth. Move "fourth" content to a slide 7-B if essential. |

---

## Ship cadence

Post Carousel #2 on **Tuesday Week 3** per the content-pack pillar rotation. Cross-post to LinkedIn the same day. Re-share to X on Wednesday as an image attachment to a hook tweet ("5 workflows every services business should automate first. Pattern in slide 7. ↓").

---

## When you ship it

Just need a single afternoon of Canva work. The visual frame from Carousel #1 (`CAROUSEL-01-org-chart.md`) is reusable — duplicate that file's saved template, swap the content per the spec above, export 8 PNGs.

After this one's shipped, the Pillar C cadence is locked: one tactical-playbook carousel per fortnight, alternating with the Pillar B single-post ROI receipts. That gives you a sustainable content engine through the end of the quarter without burning rendering time on every piece.
