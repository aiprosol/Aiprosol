# KID PROMPT — Phase 1.1 · Homepage Hero V2

**The centrepiece.** This is the single most-viewed page; the futuristic identity has to land here first.

## What ships in this prompt

- **Three.js sphere** · 5,000 Fibonacci dots · cursor-tracked X+Y rotation · click-pulse ripple · 2 orbital rings · 300-particle starfield · auto-paused when off-screen · auto-disabled on `prefers-reduced-motion` · DPR cap at 2 for mobile GPU safety · particle count auto-reduced to 1,800 below 768px
- **Arora avatar** · 3 spinning rings · gradient orb with monogram · "Online · 24/7" status pill · 2 floating glassmorphism stat cards
- **Magnetic CTAs** · buttons translate toward cursor within 100px · auto-disabled on touch + reduced-motion
- **Animated stat counters** · 4 stats animate from 0 → target on viewport-enter using cubic ease-out
- **Aurora gradient blobs** · 2 radial blurs drifting in CSS for depth
- **Bento features grid** · 5-card asymmetric teaser linking ROI / Services / Products / Cases / Pricing
- **Reduced-motion fallback** · canvas hidden, gradient bg only, all animations stopped
- **Locked palette + Syne/DM Sans** · zero off-brand colours

## Acceptance criteria

- [ ] `/` loads in < 3s on 4G
- [ ] Sphere is visible immediately and responds to cursor within 100ms
- [ ] Clicking anywhere triggers a sphere pulse ripple
- [ ] Stats animate from 0 → target on first scroll into view
- [ ] Hovering "Get Your Free ROI Audit" pulls the button toward the cursor
- [ ] On a 320px-wide phone, layout stacks cleanly with no overflow
- [ ] DevTools network tab shows Three.js loaded once (CDN, cached)
- [ ] DevTools rendering panel: paint count drops to 0 when scrolled past hero (sphere paused)
- [ ] No off-palette colours anywhere

---

## Paste this into Kid

> **Goal:** Replace the existing Homepage with the V2 hero + bento teaser.
>
> **Steps:**
> 1. Find the existing homepage file (likely `src/pages/HomePage.tsx`).
> 2. Replace the ENTIRE file contents with the code below (full replacement, never patch).
> 3. Confirm route `/` still maps to this component.
> 4. Do not add or remove other files.
>
> **Critical rules:**
> - The Three.js script tag is injected by the component itself — do NOT add it to `index.html`.
> - All styles are inline at the bottom of the file inside `<style>{`...`}</style>` — do not extract to a separate CSS file.
> - Do not change category buttons, headlines, or palette values. The copy is locked.
> - Do not introduce any new dependency. The component uses only React + the Three.js CDN.
>
> ```tsx
> // ─── PASTE THE ENTIRE CONTENTS OF HomePage.tsx HERE ───
> // (copy from /Users/user/Airprosol/build/04-homepage-hero/HomePage.tsx)
> ```

---

## After Kid finishes

1. Hard-refresh the homepage
2. Check the sphere renders, cursor moves it, click pulses it
3. Scroll past the hero — sphere should freeze (you can verify in DevTools Performance tab — frame count drops)
4. Test on a phone or DevTools mobile emulation (375px) — layout stacks, sphere uses 1,800 dots
5. Toggle "reduce motion" in OS settings — sphere disappears, everything else still works

If anything regresses or Kid replaces my code with a "modern" alternative, just paste the prompt again — full replacement always wins over partial Kid drift.

## What the next phase brings

Phase 1.2 is the ROI Audit V2 (4-step wizard with animated transitions and a live-calculation report). That comes after you confirm the Hero V2 looks right.
