# KID PROMPT — Phase 0.4 · Digital Products Filter Fix

**What broke:** the existing filter showed "No products found" even when the CMS had 19 products. Root cause: filter category strings didn't match CMS values, AND the existing component didn't handle field-name variations.

**What this fixes:**
- Aligns the 11 filter buttons with the locked Master Blueprint categories
- Adds defensive field-name resolution (works whether the CMS uses `category`, `productCategory`, `cat`, or `type`)
- Adds search bar + sort dropdown (price asc/desc, name)
- Adds proper loading/empty/error states
- Per-tab counts so empty categories are auto-disabled
- Hover-glow product cards · cyan/navy palette · Syne + DM Sans

**Acceptance:**
- `/digital-products` loads in < 2s
- All 19 products visible on "All" tab
- Clicking "Bundle" shows the 5 bundle products, "Toolkits" shows 2, "Templates" shows 3, etc.
- Search "vault" returns 3 results
- Sort by price asc puts the £17 Pitch Deck first

---

## Paste this into Kid

> **Goal:** Replace the Digital Products page with a filter-fix V2.
>
> **Steps:**
> 1. Find the existing Digital Products page file (likely `src/pages/DigitalProductsPage.tsx` or similar).
> 2. Replace the ENTIRE file contents with the code below (do not patch — full replacement only).
> 3. Confirm the route `/digital-products` still maps to this component.
> 4. Do not modify any other file.
>
> **Critical rules:**
> - Use the locked palette (#0A1628 / #0D1F3C / #1E3A5F / #00D4FF / #00FFE5 / #8899AA / #D4E8F7). The styles are inline at the bottom of the component.
> - Do not change any category names — these match the CMS values from the Master Blueprint.
> - Keep the `useWixModules(items)` pattern from the existing codebase.
>
> ```tsx
> // ─── PASTE THE ENTIRE CONTENTS OF DigitalProductsPage.tsx HERE ───
> // (copy from /Users/user/Airprosol/build/02-products-filter/DigitalProductsPage.tsx)
> ```

---

## After Kid finishes

1. Visit `/digital-products` and click each filter tab — count badges should show how many products are in each.
2. Try the search bar (e.g., "vault" or "playbook").
3. Try the sort dropdown.
4. If any tab shows zero products despite the CMS having items, the field name is non-standard (not `category` / `productCategory` / `cat` / `type`). In that case, run the audit at `/_audit` and tell me the exact field name — I'll patch the resolver.

## Why field-name resolution matters

The existing `roi-audit.jsx` uses standard names like `industry` and `monthlyRevenue`. The Digital Products schema may have been set up with `category` (most likely), but I haven't seen the schema directly. The defensive resolver tries 4 names so the page works regardless. Worst-case, the audit confirms the truth.
