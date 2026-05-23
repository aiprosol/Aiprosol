# PHASE 0 · README

You're looking at the kickoff folder for the Aiprosol V2.0 rebuild.

## What's in this folder

```
build/
├── MASTER-TRACKER.md           ← phase-by-phase progress, decision log
├── PHASE-0-README.md           ← you are here
├── _design/
│   └── tokens.css              ← LOCKED design tokens · paste into Wix Global CSS
├── 01-cms-audit/
│   ├── AuditPage.tsx           ← React component to deploy at /_audit
│   └── KID-PROMPT.md           ← exact prompt to give Kid
├── 02-products-filter/         ← (Phase 0 wave 2 · awaiting audit output)
└── 03-blog-coverimage/         ← (Phase 0 wave 2 · awaiting audit output)
```

## Your next 3 actions

### 1. Apply design tokens (5 min)

Open Wix Vibe → **Global CSS**. Paste the contents of `_design/tokens.css` at the top. Save.

This unlocks `var(--cyan)`, `var(--grad)`, `.btn-primary`, `.glass`, etc. across every page. Existing pages won't visually break — but every new V2.0 component will use these tokens.

### 2. Deploy the CMS audit page (5 min)

Open Kid in the Wix Vibe editor. Paste the prompt from `01-cms-audit/KID-PROMPT.md` (replacing the `<!-- PASTE -->` block with the full contents of `AuditPage.tsx`).

Kid creates the route `/_audit` and the component. Save and publish.

### 3. Run the audit (60 sec)

Visit `https://<your-wix-site>/_audit`.

The audit runs automatically. When it finishes:
- Click **Copy as JSON**
- Paste it back to me in chat

That's it. Once the JSON lands in chat, I unblock the next two Phase 0 deliverables (Digital Products filter fix + Blog `coverImage` bulk fix), produce them with the exact field names from your CMS, and we close Phase 0.

## What I'm doing while you deploy

Nothing yet. I'm waiting on your audit output. The next deliverables are schema-dependent and writing them blind would risk silent failures. Wait + verify > guess + retry.

## Once Phase 0 is done

We move to Phase 1 (Conversion Spine): the homepage hero, the ROI audit V2, the pricing page, the checkout test, and the Wix Velo backend functions. That's the path to first sale.

## Reminders (from the locked rules)

- Don't paste anything into Notion / Gmail / Calendly without asking me first — chat-first rule.
- Don't approve any Kid suggestion that uses a colour outside the locked palette — Kid sometimes drifts.
- If Kid offers to "modernise the design" or "use a different framework", reject and re-paste the original prompt.
