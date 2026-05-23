# The Zapier + Make Power User Bundle

**Two platforms. Advanced techniques. 20 tested recipes for each. The decision tree for when to use which. Plus debugging, performance optimisation, and migration patterns.**

Version 1.0 · 2026 · © Aiprosol Ltd

---

## What this is

A practical bundle for operators who already use Zapier or Make at the basic level and want to push deeper:

- The **Zapier vs. Make decision tree** — when to pick which (or both)
- **20 advanced Zapier recipes** with multi-step flows, formatters, paths, sub-zaps, code steps
- **20 advanced Make scenarios** with branching, error handling, looping, iterators, web hooks, code modules
- **Debugging playbooks** for both
- **Performance + cost optimisation** patterns
- **Migration paths** — when to move from Zapier → Make, or Make → custom code

Audience: operators with 6-12 months of basic experience, not first-day users.

---

## Part 1 · The decision tree (Zapier vs. Make)

### Pick **Zapier** when:

- You're solo / micro-team and a 5-min learning curve matters more than a 5x cost difference
- The integration you need exists in Zapier's catalogue but not in Make's (Zapier wins on catalogue breadth: 7,000+ vs. ~2,000)
- Your workflows are linear and short (≤ 5 steps)
- Your team already uses Zapier and switching tooling is its own cost

### Pick **Make** when:

- You need to debug. Make's visual scenario diagram beats Zapier's run history every time.
- Workflows have branching, loops, or conditional logic
- Operations volume > ~2,500/month — Make's pricing scales better past this point
- You need fine-grained control (Make's iterator + array aggregator is more expressive than Zapier's looping)
- Error handling matters (try/catch in Make is built-in; in Zapier it's a feature you build manually with paths)

### Pick **BOTH** when:

- You have one team using Zapier for marketing/sales (familiar) and another team using Make for ops/finance (complex). Separation of concerns is valid.
- You want a "front office" workflow runner (Zapier — connects with everything) calling a "back office" workflow runner (Make — does the heavy logic) via webhooks. This pattern is rare but powerful.

### Pick **NEITHER** (move to code or another tool) when:

- Operations volume > 50,000/month (cost crosses over to where n8n self-hosted or custom code wins)
- You need real-time guarantees (sub-second SLAs that workflow runners can't promise)
- Your engineering team has the capacity to maintain workflows-as-code

---

## Part 2 · 20 advanced Zapier recipes

Each recipe lists: trigger, paths/steps, what makes it "advanced," common errors.

### 2.1 — Multi-step lead enrichment with paths

Trigger: form submission
Path A (corporate email): enrich via Apollo + score
Path B (free email like gmail.com): tag as "consumer," route to lighter sequence
Path C (no email): send to manual review

**Advanced bit:** Zapier Paths require careful condition design — `Email contains "gmail.com"` won't catch `johnsmith@gmail.com.au`. Use `Email matches regex` instead.

### 2.2 — Sub-zap for reusable logic

Build a sub-zap "Send branded email" that takes recipient + body + template_id. Other zaps call it via Webhooks. Avoids duplicating email-sending code in 12 places.

**Advanced bit:** sub-zaps require Zapier Pro+. They're the only way to get DRY workflows.

### 2.3 — Looping over an array

Use Zapier's "Looping by Zapier" built-in. Paste an array, the loop runs once per element.

**Common error:** Each loop iteration counts as a separate "task" against your quota. 100-element array = 100 tasks. Watch your bill.

### 2.4 — Code step in JavaScript

Insert a JavaScript code step when a Formatter can't do it. Example: parse a complex date string, regex-extract from text.

```javascript
// Parse a free-text date and return ISO format
const text = inputData.text;
const match = text.match(/(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/);
return { iso_date: match ? `2026-${monthMap[match[2]]}-${match[1].padStart(2,'0')}` : null };
```

### 2.5 — Webhooks by Zapier (catch + send)

Receive arbitrary HTTP from systems Zapier doesn't have a native trigger for. Send arbitrary HTTP to systems with no native action.

**Advanced bit:** Catch Hook gives you a unique URL. You can post any JSON. Field paths in subsequent steps use dot notation.

### 2.6 — Filter step with multiple conditions

`Continue only if` — combine 3 conditions with AND/OR. Nested logic isn't supported; keep it flat.

### 2.7 — Storage by Zapier for state

Need to remember "have I seen this lead before"? Use Storage by Zapier as a key-value store. Set on first sight, check on subsequent.

### 2.8 — Schedule + Lookup table

Use Zapier's Schedule trigger + Lookup Table action to build a "every Monday at 9 am, send the right Slack message based on which Monday of the month."

### 2.9 — Two-stage approval

Path 1: AI drafts → Slack message with `Approve` / `Reject` buttons (via Slack interactive message).
Path 2: Buttons trigger a separate webhook-triggered Zap to execute or cancel.

### 2.10 — The "delay then check" pattern

Need to follow up only if the customer hasn't replied? Delay 48 hours → check inbox for reply → branch.

**Advanced bit:** Delay step counts toward task quota. Use Schedule + state-store instead at scale.

### 2.11–2.20 — More patterns

11. Failed-step error notifications via separate "On error" zap
12. Multi-step OAuth refresh (rare but documented)
13. Dynamic step inputs from previous step output
14. CSV file processing via Looping + Storage
15. Stripe customer + payment intent join
16. Calendly + Zoom + Slack three-system orchestration
17. Google Drive folder watcher with content-extraction
18. Form Builder pattern (multi-step forms in Zapier)
19. Custom domain webhook destinations
20. Zap run-time alerting (>30s = notification)

> *Each recipe in pages 18-44 includes the full Zap blueprint screenshot.*

---

## Part 3 · 20 advanced Make scenarios

### 3.1 — Iterator + array aggregator

The bread and butter of Make. Iterator splits an array into items; aggregator collects results back into an array. Use for: per-record processing of a large dataset, parallel API calls, conditional inclusion in output.

### 3.2 — Routers with multiple branches

Like Zapier paths but with built-in fall-through. Routes by condition; if no condition matches, fallback branch fires.

### 3.3 — Error handlers (try/catch)

Right-click a module → Add error handler. Choose: ignore, break, resume, rollback, commit. The five strategies cover ~95% of error scenarios.

### 3.4 — Webhook + immediate response

Make scenarios triggered by webhook can send a custom response back. Use to expose Make scenarios as your own API.

### 3.5 — Make's Code module (JavaScript)

Most powerful single feature. Run arbitrary JavaScript with full access to inputs and ability to make HTTP calls within the module.

### 3.6 — Data Stores (key-value)

Make's built-in state store. Search, add, update, delete records. Use for de-duplication, tracking last-seen IDs, caching API results.

### 3.7 — Sleep + scheduled triggers for delayed actions

Sleep up to 5 minutes for short delays. For longer delays, use Schedule + state pattern (don't waste an active Sleep slot).

### 3.8 — Filter conditions (numeric + text)

Make's filter is more expressive than Zapier's: regex, array contains, date comparisons, math.

### 3.9 — Parallel execution

Make scenarios can branch into parallel paths. Both fire simultaneously; aggregator waits for both.

### 3.10 — Arrays + Objects

Build complex data structures inline using Make's Array and Object builders. Useful for HTTP body construction.

### 3.11 — JSON parse + safe extraction

When parsing untrusted JSON, wrap in try/catch + use `get` operator with default values to avoid crashes on missing fields.

### 3.12 — Iteration limits

Make can iterate over up to 10,000 items per run. Beyond that, paginate at the source.

### 3.13–3.20 — More patterns

13. Webhook responder with JSON body
14. Make + Custom HTTP for any API not in catalogue
15. Connection-sharing across scenarios
16. Module mapping with collections
17. Make scenarios as cron via Schedule trigger
18. Conditional aggregator
19. Rate-limit handling via Sleep
20. Background scenarios for fire-and-forget patterns

---

## Part 4 · Debugging — the 6-step playbook

When a Zap or Make scenario breaks, work through:

### 1. Did the trigger fire?

- Zapier: History → Trigger Step → look for the run.
- Make: Scenario History → check if a new execution started.
- If no run: trigger source isn't reaching the runner. Check webhooks at the source.

### 2. Did data shape match?

- Click the run, check Step 1's output.
- Compare with what later steps expect.
- 60% of "broken" workflows are upstream API silently changing JSON.

### 3. Auth still valid?

- OAuth tokens expire. Re-auth the connection.
- Often the failure is silent — workflow runs without error, just produces null outputs.

### 4. Rate-limited?

- Zapier: rate limit varies per integration; check error message.
- Make: each module has its own rate limit; visible in scenario settings.
- Solution: Sleep + retry, or batch operations.

### 5. AI step output format?

- If your downstream expects JSON and the LLM returned prose, your prompt is loose.
- Tighten with: `Return ONLY valid JSON in the format {…}, no commentary, no markdown fences.`

### 6. Destination accepted it?

- Check destination's recent activity log.
- Sometimes the workflow shows success but the destination silently rejected.

---

## Part 5 · Cost optimisation

### Zapier task accounting

Every step counts as a task IF it executes. Filter steps that block don't count. Loop iterations DO count.

**Reduce tasks by:**
- Filter early (skip steps you don't need)
- Combine adjacent Zapier formatter steps into one Code step (1 task instead of 3)
- Use Lookup Tables instead of multiple Filter paths (1 task instead of N)

### Make operations accounting

Each module execution = 1 op. Iterations multiply. AI modules count both their request + their response.

**Reduce ops by:**
- Aggregate before processing (process arrays once instead of per-element where possible)
- Cache API responses in Data Store
- Use connection-shared modules (single OAuth refresh instead of 5)

### LLM cost across both

- Use the cheapest acceptable model. GPT-4o-mini handles 80% of business tasks at 1/20th the cost of GPT-4o.
- Prompt-engineer for short outputs. `Return only the category name. No explanation.` cuts output tokens 90%.
- Batch where possible — one LLM call processing 10 records is cheaper than 10 calls of 1 record.

---

## Part 6 · Migration paths

### Zapier → Make

Reasons: complex flows, debugging pain, cost crossover at >2.5k tasks/mo.

Process: rebuild scenario-by-scenario in Make. Don't try to import; the data models differ. Run both in parallel for 2 weeks; switch off Zapier when Make has been stable.

### Make → custom code (n8n / Inngest / Trigger.dev)

Reasons: cost > $500/mo on Make, need version control, multiple engineers maintaining workflows, audit / compliance.

Process: pick the highest-volume scenarios first. Rewrite as code. Run both in parallel. Migrate over 2-3 months.

### Both → managed automation service (Aiprosol)

Reasons: 10+ critical workflows, no internal capacity to maintain, audit + monitoring + improvement needs.

Process: Aiprosol Growth or Enterprise plan takes ownership of the existing scenarios + builds new ones. Monitoring + iteration included.

---

## Part 7 · Anti-patterns common to both platforms

1. **The 30-step monolith.** Refactor into 5 chained workflows.
2. **Hardcoded values for tomorrow's data.** "Process records since 2026-01-01" — works today, wrong in 6 months.
3. **No error handling.** Workflows that silently fail are worse than no workflows.
4. **Single point of failure.** All your automations depend on one OAuth token to Google.
5. **Untested production deployment.** "I'll just turn it on and see." No.
6. **Naming chaos.** `Zap 14` `Zap 14 v2` `Zap 14 final` `Zap 14 final FINAL`. Use a naming convention like `[domain]_[trigger]_[outcome]` (e.g., `sales_form_to_crm`).

---

## Part 8 · The 30-min weekly health check

Every week, do this checklist for both platforms:

- [ ] Any failed runs in the last 7 days? Why?
- [ ] Any workflow over 30s average runtime? Optimise or split.
- [ ] Any workflow without a recent successful run? Probably broken silently.
- [ ] Cost trend — anything spiking? Add a usage alarm.
- [ ] Any "draft" or "paused" scenarios that should be deleted?
- [ ] Any team member's account that's no longer needed?

---

## Licensing

Licensed for unlimited internal use within purchaser's organisation. Recipes may be implemented in your own workflows. Resale or republication requires written permission. © 2026 Aiprosol Ltd.
