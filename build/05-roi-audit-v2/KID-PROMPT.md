# KID PROMPT — Phase 1.2 · ROI Audit V2

**Replaces** the existing `/roi-audit` page (the one in `roi-audit.jsx`) with a 4-step animated wizard, live preview, animated bar-chart report, and tier-routed CTAs that read from the locked Master Blueprint logic.

## What's new vs V1

| V1 (current) | V2 (this prompt) |
|---|---|
| Single-page form with all 10 fields visible | 4-step wizard (Identity → Business → Pain → Report) with slide animations |
| Static report numbers | Animated counters (cubic ease-out) |
| Plain text recommendations | Animated bar chart visualising "before vs after" hours |
| "Buy product" CTA only | Tier-routed CTA: Digital → /digital-products · Plan → /pricing · Enterprise → Calendly |
| Generic copy | Industry-specific note (Legal / Real Estate / Manufacturing / etc.) |
| Direct CMS write | Calls `backend/captureLead.web.js` (which calls `calcROI` server-side, scores the lead, fires Zapier) — falls back gracefully if backend isn't deployed |
| No live preview | Live preview appears on Step 3 as soon as hours + cost are entered |
| No "email me" option | Checkbox to email the report (writes flag to `leads`) |
| No progress indicator | Step dots + connecting lines, animated as user advances |

## Acceptance criteria

- [ ] Visiting `/roi-audit` shows Step 1 with name/email/company fields
- [ ] Step 1 → 2 button is disabled until email validates
- [ ] Step transitions slide in from the right (forward) and left (back)
- [ ] Step 3 shows live "£X annual saving" preview the moment hours + cost are filled
- [ ] "Generate My Report" button writes to `leads` CMS (or falls back to local calc if `backend/captureLead.web.js` isn't deployed yet)
- [ ] Report screen shows: animated annual saving + hrs/wk in headline · 4-metric grid · animated bar chart · plan + product recs · tier badge top-right · email-me checkbox · tier-routed CTA
- [ ] Enterprise tier (200+ employees OR £500k+ revenue) shows the Calendly CTA
- [ ] Plan tier (10–200 employees, £5k–£100k revenue) shows the /pricing CTA
- [ ] Digital tier (<10 employees OR Under £5k) shows the /digital-products CTA — Calendly is hidden
- [ ] On a 320px-wide phone, the wizard is fully usable (steps stack, chips wrap)

---

## Paste this into Kid

> **Goal:** Replace the existing ROI Audit page with the V2 wizard.
>
> **Steps:**
> 1. Find the existing ROI Audit page file (currently `roi-audit.jsx` per the master blueprint).
> 2. Replace the ENTIRE file contents with the code below (full replacement, never patch).
> 3. Confirm route `/roi-audit` still maps to this component.
> 4. Do not modify any other file.
>
> **Critical rules:**
> - Keep the import name `captureLead` from `backend/captureLead.web` — that's the canonical entry point.
> - The component falls back to a local calc if the backend file isn't yet present, so it works either way during phased deployment.
> - All styles are inline in the `<Styles />` component at the bottom of the file. Do not extract to a separate CSS file.
> - Do not change the tier logic — it's locked from the Master Blueprint.
> - Do not add Calendly to the Plan or Digital tier CTAs.
>
> ```tsx
> // ─── PASTE THE ENTIRE CONTENTS OF ROIAuditPage.tsx HERE ───
> // (copy from /Users/user/Airprosol/build/05-roi-audit-v2/ROIAuditPage.tsx)
> ```

---

## After Kid finishes

Test 3 personas to verify tier routing:

| Inputs | Expected tier | Expected CTA |
|---|---|---|
| 5 employees · "Under £5k" revenue | **Digital** | Browse digital products → /digital-products |
| 25 employees · "£5k – £25k" revenue | **Plan** | See pricing plans → /pricing |
| 250 employees · "£500k+" revenue | **Enterprise** | Book a strategy call → calendly.com |

Also confirm in the CMS: every test submission creates a row in `leads` with `tier`, `leadScore`, `recommendedPlan`, `recommendedProducts` populated.

## What's next after this ships

Phase 1.3 — **Pricing V2** (3-tier comparison with feature table, embedded ROI strip, ROI Audit cross-link). Already shipped in `build/06-pricing-v2/`.

Phase 1.5 — the three Velo backend functions in `build/07-backend-functions/` (`calcROI.web.js`, `aroraChat.web.js`, `captureLead.web.js`) — required for this V2 to use the server-side scoring path.
