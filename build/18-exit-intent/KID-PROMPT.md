# KID PROMPT — Phase 4.3 · Exit-Intent Modal

**Captures the email** of users who are about to leave. Fires once per session when the cursor moves toward the top edge of the viewport. Skipped on form-heavy pages (`/roi-audit`, `/checkout`, `/contact`) and touch devices.

## Behaviour

- 8-second arming delay (no instant pop on page load)
- Triggers on `mouseleave` toward `clientY ≤ 30` (toward tab/address bar)
- One fire per session (stored in `sessionStorage`)
- Never fires on `pointer: coarse` (touch) — mouseleave is unreliable
- Doesn't fire on the ROI/checkout/contact routes — users are already converting
- On submit: writes to `leads` via `backend/captureLead.web.js`, falls back to direct CMS write
- Source label: `"Exit Intent"` so you can filter / score these separately
- Lead score auto-set to 25 (low intent · email-only)

## Paste this into Kid

> **Goal:** Add a global ExitIntentModal component, mounted once at the app root.
>
> **Steps:**
> 1. Create `src/components/ExitIntentModal.tsx`, paste the body below.
> 2. In your root layout / `App.tsx`, import and mount once:
>    ```tsx
>    import { ExitIntentModal } from './components/ExitIntentModal';
>    // After your routes:
>    <ExitIntentModal />
>    ```
> 3. Do not modify any other file beyond imports.
>
> **Critical:**
> - Keep the route blacklist (`ROUTE_BLACKLIST`) — firing on `/roi-audit` or `/checkout` would interrupt conversions.
> - Keep the `pointer: coarse` guard — mouseleave on phones triggers on every scroll.
> - Lead score is intentionally low (25) — these are cold; they get a different email sequence.
>
> ```tsx
> // ─── PASTE ExitIntentModal.tsx (file body) HERE ───
> // (copy from /Users/user/Airprosol/build/18-exit-intent/ExitIntentModal.tsx)
> ```

## After Kid finishes

1. Open any page (not `/roi-audit`, `/checkout`, or `/contact`) on a desktop browser
2. Wait ~10 seconds, then move your cursor up toward the address bar
3. Modal should appear once
4. Submit a test email — confirm a row lands in `leads` with `leadStatus: "New Lead — Exit Intent"` and `leadScore: 25`
5. Move cursor away again — modal should NOT re-trigger this session
6. New incognito session → modal can fire again
