# KID PROMPT — Phase 0 · CMS Audit Page

**What:** Create a temporary admin route at `/_audit` that scans every CMS collection and prints schema + counts + issues. After Phase 0 ships we delete this route.

**Why this needs to be a full file replacement (not a diff):** Kid reverts on partial edits, per the master blueprint. Always paste the full file.

---

## Paste this into Kid, exactly as-is

> **Goal:** Create a new page route at `/_audit` for a CMS audit tool.
>
> **Steps:**
> 1. Create a new file at `src/pages/AuditPage.tsx` — paste the full code below.
> 2. Add the route `/_audit` mapped to `AuditPage` in the router/page registry.
> 3. Do NOT add it to the navbar or footer — it is a temporary admin-only route.
> 4. Do not modify any other file.
>
> **Acceptance:** Visiting `/_audit` runs the audit on mount, shows a header, summary stat grid, per-collection rows with field chips, an issues list, and a "Copy as JSON" button. Console also logs the full report.
>
> ```tsx
> // ─── PASTE THE ENTIRE CONTENTS OF AuditPage.tsx HERE ───
> // (copy from /Users/user/Airprosol/build/01-cms-audit/AuditPage.tsx)
> ```

---

## After Kid finishes

1. Visit `https://<your-wix-site>/_audit` in a browser.
2. The audit runs automatically on page load.
3. Click **"Copy as JSON"** to copy the full report.
4. Paste the JSON back into chat with me.

I'll read the report and immediately produce:
- The Digital Products filter fix Kid prompt (with the exact category field name + values)
- The Blog `coverImage` bulk fix script (with the exact field structure)

---

## Why this matters

The Phase 0 fixes need to know:
- **Exact field names** in each collection (so the filter and PUT scripts target the right keys)
- **Exact category values** in `digitalproducts` (so filter buttons match — currently broken)
- **Exact shape of `blog.coverImage`** (so the bulk fix unwraps `stringValue` correctly)

Writing the fixes blind would mean a 50% chance Kid silently fails or the script no-ops. The audit is 60 seconds of work for 100% certainty on the fixes.
