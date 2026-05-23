# PHASE 1.5 · Velo Backend Functions · Setup

Three server-side functions that the rest of the V2.0 build leans on:

| File | Used by | Purpose |
|---|---|---|
| `calcROI.web.js` | ROI Audit V2, Pricing widget, chat widget | Pure ROI math — single source of truth |
| `aroraChat.web.js` | Arora chat widget | Groq proxy (hides API key) + CMS logging |
| `captureLead.web.js` | ROI form, contact form, newsletter, exit-intent | Canonical lead intake — score, write CMS, fire Zapier |

---

## 1. Drop the files into Wix Vibe

In the Wix Vibe editor file tree, place all three files at:

```
backend/
├── calcROI.web.js
├── aroraChat.web.js
└── captureLead.web.js
```

If `backend/` doesn't exist in your project, create it. Wix Vibe auto-discovers `.web.js` files and exposes them as web modules.

## 2. Configure the secrets

Wix Dashboard → **Settings → Secrets Manager** → add these keys.

| Key | Required | Value |
|---|---|---|
| `GROQ_API_KEY` | Yes (for chat) | Your Groq API key from https://console.groq.com |
| `GROQ_MODEL` | No | Override the default `llama3-8b-8192` |
| `ZAPIER_LEAD_WEBHOOK` | No (Phase 5) | The Zapier "New Lead" zap webhook URL — when ready |

> **Why secrets, not env vars or hard-coded:** anything in frontend code or `.env` ships to the browser. The Secrets Manager is the only Wix-native way to keep keys out of the bundle.

## 3. Confirm the `leads` schema

The CMS write in `captureLead.web.js` writes these fields:

```
fullName, email, companyName, companySize,
industry, monthlyRevenue, manualHoursPerWeek, avgHourlyCost,
primaryChallenge, automationExperience,
leadStatus, leadScore, tier,
recommendedPlan, recommendedProducts,
annualSavingProjection, weeklyHoursReclaimable
```

The first 13 already exist in your `leads` collection (per the Master Blueprint — 7 new fields added in the previous session). The last 2 (`annualSavingProjection`, `weeklyHoursReclaimable`) are new — add them to the collection schema as `Number` fields. If you'd rather skip them for now, the function will still succeed; Wix silently drops unknown fields.

## 4. Smoke-test each function

From a frontend page (e.g., the existing `/_audit`), add a temporary test button:

```tsx
import { calcROI } from 'backend/calcROI.web';
import { captureLead } from 'backend/captureLead.web';
import { aroraChat } from 'backend/aroraChat.web';

const test = async () => {
  // 1. calcROI
  const roi = await calcROI({
    employees: 25, monthlyRevenue: '£5k – £25k',
    manualHoursPerWeek: 40, hourlyCost: 35, industry: 'Legal',
  });
  console.log('calcROI:', roi);
  // expect: tier=Plan, planRec="Starter — £997/mo", weeklyHrs=28, annualSaving=49000

  // 2. aroraChat
  const chat = await aroraChat({
    sessionId: 'test-' + Date.now(),
    messages: [{ role: 'user', content: 'How much does the Growth plan cost?' }],
  });
  console.log('aroraChat:', chat);
  // expect: reply mentioning £2,997/mo

  // 3. captureLead (NB: writes a real test record — delete from CMS after)
  const lead = await captureLead({
    name: 'Test User', email: 'test@example.com',
    company: 'Test Ltd', employees: 25, industry: 'Legal',
    monthlyRevenue: '£5k – £25k', manualHoursPerWeek: 40, hourlyCost: 35,
    source: 'Smoke Test',
  });
  console.log('captureLead:', lead);
  // expect: leadId returned, plus the calcROI result
};
```

After confirming all three work, remove the test button.

## 5. Wire the frontend to use them

The ROI Audit V2 (`build/05-roi-audit-v2/ROIAuditPage.tsx`) already imports `captureLead` from `backend/captureLead.web`. Once the backend file is deployed, the form starts using the canonical scoring + Zapier path.

The Arora chat widget (Phase 4) will import `aroraChat`. Until then, the existing front-end Groq call (in `arora-final.html`) keeps working — no migration needed yet.

---

## Why this architecture

- **Keys never leak.** Groq, Zapier, future Anthropic — all server-side.
- **Logic lives once.** Change the ROI formula in `calcROI.web.js` and every consumer (form, chat, pricing widget) updates atomically.
- **CMS writes are atomic.** Lead → score → Zapier sequence is all in one function — no half-state if the page closes mid-submit.
- **Easy to swap providers.** Want Claude instead of Groq? Just edit `aroraChat.web.js` — no frontend changes.
