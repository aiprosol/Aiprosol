# Aiprosol — Brand Voice + Style Guide

**Owner:** Srijan Paudel
**Updated:** 2026-05-21
**Use:** Single source of truth for tone, vocabulary, formatting, and copy patterns. Every customer-facing surface — site copy, blog posts, agent prompts, press kit, social posts, sales emails, support replies — must align with this guide. Conflicts with anything below should be raised before publishing, not after.

---

## 1. Core voice — three words

**Operator-grade. Honest. Specific.**

Decode:

- **Operator-grade** — we write the way a senior operator (CFO, head of ops, COO) reads. Numbers first, jargon second, generalities never. The reader should never have to re-read a sentence to decode it.
- **Honest** — we say what we know, flag what we don't, name what failed. Anything that sounds like marketing because it's not measured is removed before publishing.
- **Specific** — concrete dollar figures, hour counts, days, percentages. "We saved time" is forbidden; "We reclaimed 35 hours/week" is required.

If any output doesn't pass all three, it doesn't ship.

---

## 2. Tone rules — what we sound like (and don't)

### We sound like

- A senior operator who's seen the failure modes and writes from the scar tissue.
- Direct. Three sentences where five would do.
- Honest about uncertainty. "We don't know yet" is allowed; "We think but haven't proven" is preferred to "We've found".
- Mildly opinionated. Our recommendations have a default; we'll tell you the exception.
- Confident in our wins, transparent about our misses.

### We don't sound like

- A consulting deck ("synergize", "leverage", "best-in-class", "world-class", "innovative", "cutting-edge", "transformative", "next-generation", "industry-leading"). All banned. No exceptions.
- A hype-merchant ("game-changing", "10x", "revolutionary", "disruptive"). Banned.
- A press release ("excited to announce", "thrilled to share", "we believe"). Banned.
- A chatbot ("As an AI...", "Sure! I'd be happy to help...", "Great question!"). Banned.
- A startup-Twitter founder ("just shipped 🚀", "love to see it 🔥", "based"). Banned in customer-facing copy. OK on Srijan's personal X but use sparingly.
- A management consultant ("paradigm shift", "blue ocean", "value proposition"). Banned.
- A marketer ("hack", "secret", "unlock the power of", "reach your full potential"). Banned.

---

## 3. Vocabulary — explicit allow/deny list

### ✅ Allowed (use these)

| Use | Instead of |
|---|---|
| reclaim hours | save time |
| automation | AI |
| frontier LLM | Claude / GPT-4 / Sonnet / etc. (brand independence) |
| budget LLM | GPT-4o-mini etc. |
| open-source LLM | Llama etc. |
| LLM provider | Anthropic / OpenAI / Groq (brand independence) |
| AI C-suite | "AI team" |
| customer | client (we sell to customers, not clients; lower friction word) |
| operator | "user" (for our audience — operators run businesses) |
| ship | "launch", "release" |
| deploy | "roll out" |
| workflow | "process" (process = humans; workflow = automation-ready) |
| audit | "review" (audit implies measurement) |
| measured | "proven" (we measure things; proof is what others say) |
| operating model | "business model" (different precision) |
| 90-day reclaim guarantee | "money-back guarantee" |
| ROI | (use sparingly; "hours reclaimed" or "dollar savings" preferred) |

### ❌ Banned (never use)

**Hype words** — disruptive · revolutionary · game-changing · next-gen · cutting-edge · best-in-class · world-class · transformative · innovative · paradigm shift · 10x · synergize · leverage · enable · empower · supercharge · hack · secret · unlock · power of · reach your full potential

**Filler verbs** — utilize (use "use") · facilitate (use "do") · ascertain (use "find out") · commence (use "start") · terminate (use "end")

**Brand mentions to strip** — Claude · Anthropic · Llama · Groq (we are model-independent; see brand-independence work in repo)

**Vague qualifiers** — many · several · various · significant · substantial · numerous · plenty of · a lot of · countless

**Marketing tells** — "industry-leading" · "trusted by" (without specific names) · "the only" (without proof) · "world's first" · "the future of"

**Tone breakers** — "as an AI", "I'd be happy to", "great question", "happy to help", "exciting news"

---

## 4. Numbers — when and how to cite

### Required

- Every claim of impact ships with a number. "Saves hours" → "Saves 35 hours/week". "High accuracy" → "99%+ accuracy".
- Time-bound where applicable. "340% ROI" → "340% ROI in the first 12 months".
- Sample-size-aware. If N=5, say "across 5 pilot engagements" not "across our customer base".

### Forbidden

- "Up to X" — almost always a lie. Use the average or the median.
- "X+" without context — "200+ prompts" is fine because the catalogue says 200. "200+ hours saved" is meaningless.
- Round numbers that pattern-match marketing (e.g. "10x") — use the real number even if it's "9.4x" or "11.2x".
- "Multi-million" / "seven-figure" — use the actual figure or don't cite.

### Currency

- **USD only, always.** $17, $997, $7,997. Never £, €, ¥, ₹.
- No "K" or "M" suffix in body copy. "$50,000" not "$50K". "Approx" if it's rough.
- In dashboards / headers, "K" + "M" is allowed for space reasons.

### Dates + times

- ISO format in tables and code: 2026-05-21
- Long-form in body copy: "21 May 2026" (UK convention since the company is UK-incorporated)
- Time of day: 24-hour for ops references (09:00 UTC); 12-hour for marketing copy if shorter
- Don't say "soon"; give the actual date or window ("by end of Q3 2026")

---

## 5. Formatting conventions

### Headings

- One H1 per page. Always.
- H2 for major sections (4-8 per long-form page)
- H3 for sub-sections under H2
- H4+ rarely needed. If you need H5, refactor.
- Title case for H1 + H2 (proper nouns + content words capitalized). Sentence case for H3+ — easier to scan.
- No emoji in headings. (One exception: per-section icon in a UI table of contents is OK.)

### Lists

- Use `-` for unordered, not `*` or `•`
- Use `1.` for ordered
- Capitalize first word of each list item
- End each list item with a period if it's a sentence, no period if it's a phrase
- Don't mix sentences + phrases in the same list — pick one and stick with it

### Tables

- Always include a header row
- Left-align text columns, right-align numbers
- If a table has more than 6 rows or 4 columns, it probably wants to be a chart instead

### Emphasis

- **Bold** for the most important phrase in a paragraph — at most ONE per paragraph
- *Italics* for terms-of-art on first use, or for actual emphasis (rare)
- `Code formatting` for: file paths, API endpoints, exact strings the user will type, variable names, command names
- No ALL CAPS in body copy (CTAs in UI are fine — "GET STARTED")
- No `~~strikethrough~~` in customer-facing copy

### Punctuation

- Em dashes — like this — for parenthetical thought. Spaces around em dashes are our house style.
- Oxford comma always (apples, oranges, and bananas)
- One space after periods, not two
- Sentence-ending periods only when the sentence is a sentence — bullet phrases get no period
- Use straight quotes in body copy (`"` not `"`). Most editors auto-correct; if you see curly quotes copied in from somewhere, fix them.

### Links

- Inline links over reference-style. `[anchor](url)` directly in flow.
- Anchor text describes the destination. NEVER "click here". NEVER "this link".
- External links open in new tab; internal links open same tab (UI behaviour, not markdown convention)

---

## 6. Patterns we lean on

### The opener

Lead with the specific. Open with the number, the failure, or the conclusion. NOT with context.

❌ "Many businesses today are looking to AI..."
✅ "We removed automation for cold-outreach research notes. Reply rate dropped below the control."

### The honest-failure paragraph

Every long-form piece must include at least one paragraph that's a concrete failure — what we tried, why it failed, what we changed. This is the operator-grade signal. Marketing copy never includes failures; we always do.

### The verifiable artifact

Every claim about Aiprosol's own operations links to the public surface that proves it. "10 AI agents coordinated by Arora" → links to /agents. "All agent runs are logged" → links to /transparency. "90-day reclaim guarantee" → links to /pricing#guarantee.

### The trade-off paragraph

When we recommend something, we tell you the case where the recommendation is wrong. "Use n8n if you have any engineering capacity. If you don't, Zapier is better. The decision matrix is in [link]."

### The exit ramp

Every CTA mentions the alternative. "Run the free ROI audit. If you'd rather just browse first, the digital products start at $17." Never pressure; always present the path.

---

## 7. Channel-specific overrides

### Site copy (aiprosol.com)

- USD only, global framing (no UK/Edinburgh references in body copy)
- Arora is the AI CEO. Never "chatbot", never "assistant", never "Mama".
- Currency-pricing visible everywhere ($17–$7,997 range)

### Blog posts

- 1,500–3,000 words for canon posts
- 800–1,500 words for tactical posts
- Always have a TL;DR at the top (2-3 sentences max)
- Always end with a single specific CTA (not a list of three)

### Email (outbound / sales / customer)

- Subject line ≤60 characters
- Body 3-7 sentences max in prospecting emails
- One ask per email, never two
- Sign with first name only ("— Srijan")

### Social — X / LinkedIn

- X: tweets ≤220 chars (leaves room for thread number + sigs)
- LinkedIn: opener line must be punchy enough to make people click "see more"
- Both: lead with a specific number or specific failure, not a question
- No hashtags on X (look spammy); 1-3 hashtags on LinkedIn max

### Agent prompts (server-side, the agent C-suite)

- System prompts always include the BRAND INDEPENDENCE HARD RULE (no Claude/GPT/etc. in output)
- Voice rules from this guide apply to every customer-facing output any agent drafts
- Agent self-identification: never "AI assistant", always the role title ("the CRO drafted this")

### Press kit + pitches

- Boilerplate has 3 lengths (50 / 100 / 200 / 500 words) — always use the right length for the surface
- Always include the disambiguation paragraph (aiprosol.com vs aiprosol.au)
- Always link to the live agent dashboard as the single strongest proof point

### Customer-facing communication (when AI agent is replying)

- Agent attribution is required: "— The CCO *(an AI agent in Aiprosol's C-suite, reviewed by Srijan Paudel before sending)*"
- The transparency about who/what is replying is a brand asset, not a confession

---

## 8. Brand-specific lexicon

### Always capitalize these exactly

- Aiprosol (never AIprosol, never AiProSol, never Ai Pro Sol)
- Arora (the AI CEO — capitalized always, like any name)
- the C-suite (not C-Suite, not c-suite)
- the COO, the CMO, the CCO, the CTO, the CRO, the CLO, the CPO, the CPM, the DA (with "the" — they're roles, not names)

### Never refer to AI agents by

- "Bot", "chatbot", "assistant" (these reduce the dignity of the role; we treat AI agents as actual operators)
- A first name (only Arora has one — keep it that way for now)

### How we describe Aiprosol externally

- First time in any piece: "Aiprosol, the global AI automation consultancy operated by an AI C-suite"
- Subsequent references: "Aiprosol" or "we" or "the company"
- Never "the team" (implies humans). Always "the C-suite" or "the agents".

### How we describe Srijan externally

- First time: "Srijan Paudel, founder and Chairman of Aiprosol"
- Subsequent: "Srijan" (in conversational copy) or "Paudel" (in journalistic / encyclopedic copy)
- Never "the CEO" — he is Chairman; Arora is CEO

### How we describe ourselves to AI engines / Wikipedia

- "Global AI automation consultancy founded April 2026 by Srijan Paudel"
- "Operated by an AI C-suite of ten AI agents plus one human Chairman"
- "The first publicly-operating proof-of-concept of an AI-led operating model"

---

## 9. Disambiguation

There is a separate Australian firm at `aiprosol.au` (Major Projects Consulting Partners Pty Ltd, Sydney/Queensland). Whenever Aiprosol is mentioned in a context where confusion is possible — press kit, Wikipedia draft, llms.txt, customer docs — include the disambiguation paragraph. Boilerplate version:

> Aiprosol (aiprosol.com) is the global AI automation consultancy founded April 2026 by Srijan Paudel, operated by an AI C-suite. Not affiliated with the unrelated Australian firm at aiprosol.au (Major Projects Consulting Partners Pty Ltd, Sydney/Queensland), which focuses on AI consulting for construction, engineering, and infrastructure.

---

## 10. Review checklist (apply before any customer-facing output ships)

Before any blog post / email / social post / agent output ships, verify:

- [ ] No banned hype words (§3)
- [ ] No banned brand mentions (Claude/Anthropic/etc. in self-attribution)
- [ ] Every impact claim has a number
- [ ] At least one verifiable artifact link (where applicable)
- [ ] USD only; no £/€
- [ ] One H1, sequential H2-H6
- [ ] No ALL CAPS in body
- [ ] No emoji in headings
- [ ] Em dash convention (spaces around — like this)
- [ ] No "click here" / "this link" anchor text
- [ ] Subject line ≤60 chars (email only)
- [ ] Agent attribution included if drafted by an agent
- [ ] One ask, not multiple (CTAs)
- [ ] Disambiguation paragraph if context is ambiguous

If any item fails, fix before publishing. No exceptions.

---

## 11. Examples — before / after

### Example 1 — Hero copy

**Before (rejected):**
> "Aiprosol is a world-class, cutting-edge AI automation consultancy that empowers businesses to unlock the power of AI and reach their full potential through innovative, transformative solutions."

**After (ships):**
> "We design, build, and run the AI automations that reclaim 35+ hours a week per team. Average measured ROI: 340% in the first 12 months. Backed by a 90-day reclaim guarantee."

### Example 2 — Email opener

**Before (rejected):**
> "Hi {first_name}, I hope this email finds you well! I'm excited to share an opportunity that I think you'll love."

**After (ships):**
> "{first_name}, you said in your ROI audit that you're losing 40 hours/week to manual lead routing. We have three workflows that solve exactly that. Want me to walk you through them on a 20-min call?"

### Example 3 — Blog opener

**Before (rejected):**
> "In today's fast-paced business environment, AI automation has emerged as a transformative force..."

**After (ships):**
> "Most AI automation consultancies in 2026 are vibes. The good ones look the same as the bad ones from the outside. This is the seven-criteria framework Aiprosol uses to tell them apart."

### Example 4 — Failure paragraph (required in long-form)

**Bad (omits failure):**
> "Our agent system is highly reliable and produces consistent results."

**Good (operator-grade):**
> "We removed AI-written podcast scripts after week 3 — they sounded synthetic, the listener-completion rate halved, and no amount of prompt engineering fixed the underlying problem. We also removed auto-publishing to social: within two weeks the voice had drifted enough that long-time followers DM'd asking who'd taken over the account."

---

## 12. Versioning

| v | Date | Changes |
|---|---|---|
| 0.1 | 2026-05-21 | Initial guide consolidating voice rules scattered across blog posts, agent prompts, /press, /founder, OUTRANK-PLAYBOOK |

Review cadence: every 90 days, or when a contributor flags an unresolved conflict. Owner: Srijan Paudel.
