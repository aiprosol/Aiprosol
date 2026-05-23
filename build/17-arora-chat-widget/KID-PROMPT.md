# KID PROMPT — Phase 4.1 · Arora Chat Widget

**Floating chat widget** that lives on every page. Cyan orb bottom-right opens a 380px chat panel. Calls `backend/aroraChat.web.js` (already shipped in Phase 1.5) for real Groq-powered responses. Falls back to canned intent-routed replies if the backend isn't reachable, so the widget never feels broken.

## What ships

- Floating cyan orb bottom-right with pulse + first-time tooltip
- Click to expand 380×580 chat panel with header, message list, quick prompts, input
- Session persisted across pages via `localStorage` (`aiprosol_arora_session`)
- Message history persisted (last 30) — survives page reloads
- Greeting auto-fires on first open, never re-fires
- Quick-prompt chips for fresh sessions
- Lead-capture modal triggers after 4 user messages (once per visitor)
- Typing indicator (3 bouncing dots) during async backend call
- Smooth open/close animations · slide-in messages
- Mobile responsive (panel collapses to 100% width minus 32px)
- Reduced-motion respected

## Acceptance

- [ ] Orb appears bottom-right on every page
- [ ] Clicking opens panel with greeting from Arora
- [ ] Quick prompts populate input on click
- [ ] Send button + Enter both submit
- [ ] If `backend/aroraChat.web.js` is deployed: real Groq responses arrive
- [ ] If not: canned intent-routed replies still feel coherent
- [ ] After 4 user messages, lead modal pops once; subsequent sessions don't re-trigger
- [ ] History persists after reload — old messages still visible

## Paste this into Kid

> **Goal:** Add the AroraChatWidget component and mount it globally.
>
> **Steps:**
> 1. Create `src/components/AroraChatWidget.tsx`, paste the body below.
> 2. In your root layout / `App.tsx` / equivalent global component, import and mount it once (it self-positions fixed bottom-right):
>    ```tsx
>    import { AroraChatWidget } from './components/AroraChatWidget';
>    // Inside your top-level layout, after your routes:
>    <AroraChatWidget />
>    ```
> 3. Do not add it to individual pages — it must mount once globally.
> 4. Do not modify any other file beyond imports.
>
> **Critical:**
> - Keep the `aroraChatFn` import wrapped in a try/catch — that's what lets the widget work before the backend is deployed.
> - Do not change the locked palette, fonts, or copy.
>
> ```tsx
> // ─── PASTE AroraChatWidget.tsx (file body) HERE ───
> // (copy from /Users/user/Airprosol/build/17-arora-chat-widget/AroraChatWidget.tsx)
> ```

## After Kid finishes

1. Open any page — confirm orb appears bottom-right
2. Click orb — panel slides in with greeting
3. Type "how much does it cost" → confirm response references the £997 / £2,997 / £7,997 plans
4. Send 4 messages → lead capture modal should appear once
5. Hard refresh — message history should restore from localStorage
6. Test on mobile (375px) — panel fits viewport with side margin

If the backend Velo function isn't yet deployed, every reply comes from the canned `FALLBACK_REPLIES` table — that's by design. Once you deploy `backend/aroraChat.web.js` with the `GROQ_API_KEY` secret, replies upgrade to Groq automatically.
