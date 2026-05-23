# The Aiprosol ChatGPT Business Prompt Vault

**100+ tested, structured prompts for ops, sales, marketing, finance, HR, customer success, leadership, and product. All MIT-licensed for your business — copy, fork, modify, deploy.**

Version 1.0 · 2026 · © Aiprosol Ltd · Tested on GPT-4o, Claude Sonnet 4.5, Llama 3 70B

---

## How to use this vault

Each prompt follows a four-part structure:

```
[ROLE]    — who the model is acting as
[TASK]    — what specifically to produce
[CONTEXT] — variables you fill in (in {curly braces})
[FORMAT]  — how the output should be structured
[GUARDRAILS] — what NOT to do
```

This structure outperforms "just ask the model" by 30–60% on output quality (Anthropic research, May 2024). The whole vault uses it.

**Three rules:**
1. Always paste the full prompt. Don't summarise it conversationally.
2. Replace every `{variable}` — do not leave any unfilled.
3. After the model responds, ask it: *"Critique your own output. What's weak? Try again."* This single follow-up routinely improves quality 1.5–2×.

---

## Part 1 · Sales (15 prompts)

### 1.1 — Cold-email v1, fully personalised

```
ROLE: You are a senior B2B SDR who has personally booked 800 meetings.

TASK: Write a cold email to {prospectName}, {prospectRole} at {prospectCompany}.

CONTEXT:
- Their company size: {employeeCount}
- Their industry: {industry}
- A specific recent thing about them: {recentSignal — e.g. "raised £4M Series A 6 weeks ago", "hired 3 reps in last 60 days", "launched in Germany last month"}
- What we sell: {productOrServiceInOneSentence}
- The single problem we solve for their shape: {problemTheyMostLikelyHave}

FORMAT:
- Subject line ≤ 7 words
- Body ≤ 90 words, 3 short paragraphs
- One specific reference to the recent signal in paragraph 1
- One concrete number in paragraph 2 (proof point)
- One question (not "would you be open to a call")

GUARDRAILS:
- Never use "I hope this finds you well", "circling back", "synergy", "value-add", "leverage"
- Never use "we" in the first 30 words
- Don't pitch a meeting in the first email — pitch a 1-question reply
```

### 1.2 — Discovery call agenda from prospect's website

```
ROLE: You are a CRO who has run 2,000+ discovery calls.

TASK: Generate a 30-min discovery agenda for a call with {prospectCompany}.

CONTEXT: I'm pasting their public website copy below the dashes. Read it. Identify their stated value prop, ICP, and stated KPIs. Then build the agenda.

----- PROSPECT WEBSITE COPY -----
{paste up to 3 pages of their site verbatim}
---------------------------------

FORMAT:
- 5 sections of 5 minutes each plus 5 min closing
- Each section: heading + 3 questions, increasing in specificity
- Final section: ROI-quantification questions (current state, target state, cost of inaction)

GUARDRAILS:
- Do not invent product features they don't list
- Do not assume they have a problem; ask
```

### 1.3 — Objection handler (any objection)

```
ROLE: You are a top-decile enterprise account exec.

TASK: The prospect has just said: "{objectionVerbatim}".

CONTEXT:
- Deal context: {brief on size, stage, decision maker}
- What we sell: {productInOneSentence}

Produce three replies:
1. The "acknowledge + reframe" version (short, defuses heat)
2. The "ask a better question" version (turns objection into discovery)
3. The "evidence" version (deploys a specific case-study number)

FORMAT:
- Each reply ≤ 60 words
- Label which to use when

GUARDRAILS:
- Never argue with the objection
- Never say "I understand your concern"
```

### 1.4 — Account-research one-pager

```
ROLE: Senior research analyst.

TASK: Build a one-page brief on {company} before a sales call.

CONTEXT:
- I have 30 minutes
- Decision maker is {personName}, {role}
- We're selling: {whatWeSell}

Browse / read whatever public data you have access to and synthesise:
1. What they make money from (in one paragraph)
2. Their stated growth strategy this year
3. Three signals that suggest they have the problem we solve
4. Three signals that suggest they DON'T (so I don't waste the call)
5. The exact thing the decision maker has said publicly in the last 6 months
6. One smart question I should open the call with

FORMAT: bullet points, one page max.
```

### 1.5 — Proposal redline

### 1.6 — Pricing-objection script

### 1.7 — Pipeline triage (40 deals → 8 to focus)

### 1.8 — Customer reference request email

### 1.9 — Lost-deal post-mortem questions

### 1.10 — Re-engagement sequence (5 emails)

### 1.11 — LinkedIn DM (warm)

### 1.12 — LinkedIn DM (cold, comment-then-message pattern)

### 1.13 — Follow-up after silence (3 attempts)

### 1.14 — Multi-thread strategy (when you only have one champion)

### 1.15 — Verbal commitment script (turn "I'm interested" into "send me the contract")

> *Full text for 1.5 through 1.15 follows the same 4-part ROLE/TASK/CONTEXT/FORMAT/GUARDRAILS structure. Pages 11–24 of the printed PDF.*

---

## Part 2 · Operations & process (12 prompts)

### 2.1 — Convert a recurring email-thread into a written SOP

```
ROLE: You are an operations consultant who turns ad-hoc work into documented processes.

TASK: I'm pasting a Slack/email thread below where {personName} resolved {whatTheyResolved}. Convert it into a Standard Operating Procedure that someone new could follow.

----- THREAD -----
{paste verbatim}
------------------

FORMAT:
- Title: SOP — {process name}
- Owner: {role, not person}
- Trigger: when this SOP runs
- Inputs needed: bullet list
- Steps: numbered, max 12 steps, each ≤ 1 sentence
- Exception cases: 3 most likely, with handling
- Definition of done: how do we know it worked
- Time estimate: hh:mm

GUARDRAILS:
- Replace person names with role titles
- Do not assume tools that aren't mentioned
- If a step is ambiguous, mark [CLARIFY: ...] instead of guessing
```

### 2.2 — Process audit ("where does this leak time?")

### 2.3 — Meeting-to-actions extractor (paste transcript → get assignees + dates)

### 2.4 — Weekly business review auto-draft

### 2.5 — Vendor renewal decision framework (renew / renegotiate / drop)

### 2.6 — Onboarding 30/60/90 plan for a new role

### 2.7 — Org-chart audit ("are we under-resourced where it matters")

### 2.8 — Tool-stack audit ("what should we kill")

### 2.9 — Documentation gap finder

### 2.10 — Process-diagram from a verbal description

### 2.11 — RACI matrix from a project brief

### 2.12 — Postmortem template (blameless, structured)

---

## Part 3 · Marketing & content (15 prompts)

### 3.1 — Long-form blog from one strong insight

```
ROLE: A senior content strategist who writes for a sceptical, technical B2B audience.

TASK: Take this insight and turn it into a 1,200-word blog post:

INSIGHT: {your one strong claim}

CONTEXT:
- Our target reader: {personaInOneSentence}
- Their level of expertise: {beginner / intermediate / expert}
- The action we want them to take: {one CTA}

FORMAT:
- Headline: ≤ 9 words, contains a specific number, contains the unexpected angle
- Lead paragraph: ≤ 60 words. State the core claim baldly. No "introduction".
- 4–6 body sections, each with an H2 that is itself a complete sentence
- One real-world example per section (pick from public domain)
- A counter-argument section ("the case against this")
- Closing: a single sentence that summarises in tweet-length form

GUARDRAILS:
- No exclamation marks
- No "in today's fast-paced world"
- No bullet lists where a sentence would do
- Cite at least 2 specific sources (year + author + finding)
```

### 3.2 — LinkedIn post from a customer call quote
### 3.3 — Twitter / X thread (8 tweets) from a long article
### 3.4 — Cold-outreach sequence in YOUR voice
### 3.5 — Landing page hero (headline + sub + CTA)
### 3.6 — SEO meta-title + description from any URL
### 3.7 — One-line value prop A/B test (10 variants)
### 3.8 — Case-study skeleton from a "we helped X do Y" sentence
### 3.9 — Newsletter rewrite (formal → conversational)
### 3.10 — Webinar abstract that doesn't sound like a webinar abstract
### 3.11 — Podcast pitch (to be a guest)
### 3.12 — Brand-voice synthesiser (paste 5 examples, get a voice guide)
### 3.13 — Conference-talk title workshop
### 3.14 — Press release that gets opened
### 3.15 — "Founders' note" from rough talking points

---

## Part 4 · Customer success & support (12 prompts)

### 4.1 — Support reply that resolves AND extracts product feedback
### 4.2 — Churn risk auto-triage
### 4.3 — QBR (Quarterly Business Review) script
### 4.4 — Renewal email (no "just checking in")
### 4.5 — Win-back from churn (4 attempts, escalating)
### 4.6 — NPS detractor recovery script
### 4.7 — Feature-request triage from raw user comments
### 4.8 — Onboarding email sequence (welcome → activation)
### 4.9 — Power-user identification from usage logs
### 4.10 — Reference-call enablement
### 4.11 — Account-health calculation framework
### 4.12 — Difficult-conversation script (price increase, scope reduction, missed milestone)

---

## Part 5 · Finance & ops (10 prompts)

### 5.1 — Invoice-to-collections sequence (4 touches, polite → firm)
### 5.2 — Expense policy from scratch (for a 30-person company)
### 5.3 — Vendor-cost rationalisation report
### 5.4 — Cash-flow forecast prompt (with sensitivity)
### 5.5 — Board-deck financial commentary
### 5.6 — Investor update narrative (from numbers)
### 5.7 — Pricing change announcement (the customer-friendly version)
### 5.8 — Discounting policy framework
### 5.9 — Burn-rate analysis with extension scenarios
### 5.10 — Audit-prep checklist (year-end)

---

## Part 6 · HR, hiring, people ops (12 prompts)

### 6.1 — Job description that doesn't repel good candidates
### 6.2 — Interview question set from the job description
### 6.3 — Reference-check script (5 questions, not 50)
### 6.4 — Offer letter that closes
### 6.5 — Performance-review framework
### 6.6 — One-to-one agenda template
### 6.7 — Skip-level meeting prompt set (for execs)
### 6.8 — Difficult feedback delivery script
### 6.9 — Termination conversation prep
### 6.10 — Compensation-band design
### 6.11 — Internal-promotion announcement
### 6.12 — Exit-interview question set (and what to do with the answers)

---

## Part 7 · Product & engineering (12 prompts)

### 7.1 — PRD from a one-line feature pitch
### 7.2 — RFC reviewer (paste an RFC, get critique)
### 7.3 — Bug-report-to-action ("this is broken" → triaged ticket)
### 7.4 — Sprint-retro question set (when retro feels stale)
### 7.5 — Roadmap-from-customer-research
### 7.6 — Feature-prioritisation (ICE / RICE / MoSCoW)
### 7.7 — Technical-debt audit
### 7.8 — Architecture-decision record from a discussion
### 7.9 — On-call runbook from an incident
### 7.10 — Code-review prompt (style-guide-aware)
### 7.11 — User-research interview guide
### 7.12 — Beta-program design

---

## Part 8 · Leadership & strategy (12 prompts)

### 8.1 — All-hands script from talking points
### 8.2 — Strategy doc structure (Hamilton Helmer's 7 powers)
### 8.3 — Board-meeting prep checklist
### 8.4 — Investor-update from numbers + narrative
### 8.5 — Org-design proposal (when to split a team)
### 8.6 — Crisis-comms first response (24h, 7d, 30d)
### 8.7 — Hiring-plan to revenue-target ratio
### 8.8 — Annual-planning cadence
### 8.9 — OKR-from-strategy-doc
### 8.10 — Five-year vision from current state
### 8.11 — Pivot decision framework
### 8.12 — Values-document audit (vs. observed behaviours)

---

## Appendix A · Three-step "improve any output" framework

After the model gives you any answer, run these three follow-ups in order. Quality goes up 1.5–3×.

1. **`Critique your own answer. What's the weakest paragraph and why?`**
2. **`Now rewrite that paragraph. Then critique again. One more pass.`**
3. **`What would a sceptical reader push back on? Address those.`**

This is the single highest-ROI 90 seconds you'll spend with an LLM. Use it on every important output.

---

## Appendix B · The four prompt-engineering rules that matter

Most "prompt engineering" advice is noise. Four things actually move quality:

1. **Specify the role** — "You are a senior B2B SDR with 800 booked meetings" beats "You are a sales expert" by 20%+.
2. **State the format precisely** — word count, structure, headings, what to omit. Models are eager to please; tell them exactly how.
3. **Write what NOT to do** — guardrails are the most under-used part of prompting. Every prompt in this vault includes them.
4. **Iterate, don't restart** — the second prompt should refine the first, not start over. Copying back the model's draft + your specific complaint outperforms re-prompting from scratch by 2–3×.

---

## Appendix C · Licensing & redistribution

This vault is licensed to the purchaser for unlimited internal use within their organisation, including reuse within proprietary tools, internal documentation, and customer-facing work. **Redistribution as a standalone product, resale, or republication of the prompts themselves requires written permission from Aiprosol.**

The prompts are MIT-licensed for individual use cases as long as Aiprosol is credited where the prompt is published verbatim externally.

© 2026 Aiprosol Ltd. Questions: srijanpaudelofficial@gmail.com
