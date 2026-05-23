# The AI Tools Vault

**Every AI tool we vet, ranked by use case. Updated quarterly. Includes the prompt vault and the comparison guide.**

Version 1.0 · 2026 · 105 tools curated · 23 categories · CSV + JSON formats

---

## What's in this vault

| Asset | Format | Detail |
|------|------|------|
| 105 AI tools catalogue | `ai-tools-catalogue.csv` + `ai-tools-catalogue.json` | Full list with verdict, pricing, use case, notes |
| 23 category breakdowns | This document (Part 1) | Top picks + verdict per category |
| 20+ Hidden Gems list | This document (Part 2) | Under-the-radar tools that deserve more attention |
| 4 Avoid Listings | This document (Part 3) | Tools that look great but consistently disappoint |
| ChatGPT Business Prompt Vault | Standalone product, included `.md` + `.html` + `.json` + `.csv` | 200 structured prompts (JSON) + 76 inline prompts (MD) |
| Quarterly update access | email subscription (Part 5) | Catalogue refreshed Q1, Q2, Q3, Q4 |

**Honest scope note**: The standalone Tools Vault product previously promised "545+ AI tools." This v1 ships **105 carefully-verdicted tools** across all 23 categories — every entry has a real verdict (PICK / GOOD / WATCH / AVOID / GEM) and pricing reality check. Quarterly updates add ~50 new tools per refresh. Quality of verdict over count of names.

---

## How to use the vault

Three workflows depending on need:

### Workflow A — "I need a tool for X"
1. Open `ai-tools-catalogue.csv` (or JSON)
2. Filter by Category column
3. Read the top verdicts (`PICK > GOOD > GEM > WATCH > AVOID`)
4. Pick the one that matches your scale

### Workflow B — "What's emerging?"
Read Part 2 below — the Hidden Gems list. Most won't apply to you, but 1-2 typically save 10x the cost of this vault.

### Workflow C — "Don't waste my time"
Read Part 3 below — the Avoid List. Save 4-12 hours of due-diligence time on each.

---

## Part 1 · The 23 Categories

Each category below: top pick + verdict. Full data including pricing and notes is in `ai-tools-catalogue.csv`.

| # | Category | Top pick verdict |
|---|------|------|
| 1 | Conversational AI (frontier models) | Claude for accuracy, GPT-4o for ecosystem, Gemini for free Google integration |
| 2 | Conversational AI (open source) | Llama 3.3 70B for general, Mistral for code, DeepSeek for math |
| 3 | Code generation | Claude Code for terminal, Cursor for IDE, Windsurf for distraction-free |
| 4 | Image generation | Midjourney for quality, DALL-E 3 for prompt-following, Stable Diffusion for control |
| 5 | Video generation | Runway for editing, Veo for realism, Pika for animation |
| 6 | Voice cloning | ElevenLabs for quality, Play.ht for stability, Cartesia for latency |
| 7 | Voice transcription | Deepgram for live, Whisper for batch, Otter for meetings |
| 8 | RAG / search infrastructure | LangChain for flexibility, LlamaIndex for indexing, Vellum for production |
| 9 | Vector databases | pgvector for SMB, Pinecone for scale, Weaviate for hybrid search |
| 10 | LLM hosting / inference | Groq for speed, Together for variety, Fireworks for cost |
| 11 | Workflow / automation | n8n for engineers, Make for ops teams, Zapier for non-technical |
| 12 | No-code app builders | v0 for landing pages, Lovable for full apps, Replit for prototypes |
| 13 | Form / data capture | Tally for free, Typeform for design, Fillout for logic |
| 14 | Email / outreach | Resend for API, Lemlist for cold, Customer.io for nurture |
| 15 | CRM / pipeline | HubSpot Free for marketing, Pipedrive for sales, Attio for modern |
| 16 | Customer support | Plain for B2B, Intercom for SaaS, Help Scout for inbox-style |
| 17 | Analytics / product | PostHog for everything, Amplitude for cohorts, Mixpanel if you must |
| 18 | Observability / logging | Sentry for errors, Axiom for logs, Highlight for full session |
| 19 | Document processing | Unstructured for PDFs, Mathpix for math, Reducto for tables |
| 20 | Personal productivity | Notion for wiki, Linear for tickets, Granola for meeting notes |
| 21 | Marketing / SEO | Ahrefs for research, Frase for content, AnswerThePublic for ideation |
| 22 | Financial / billing | Stripe for everything, Mercury for banking, Pulley for cap table |
| 23 | Security / compliance | 1Password for secrets, Vanta for SOC2, Drata for ISO27001 |

---

## Part 2 · 20 Hidden Gems

Tools that consistently delight but don't have the marketing budget of bigger names. Each entry: what it does, why it's underrated, when to use it.

1. **Granola** — meeting notes that read like a human wrote them
2. **Plain** — support that respects engineers
3. **Cartesia** — voice latency that actually feels real-time
4. **Reducto** — PDF table extraction that beats Claude on structured docs
5. **PostHog** — analytics + flags + recordings + experiments in one
6. **Attio** — the CRM Pipedrive would build if it started in 2024
7. **Linear** — issue tracker that respects your time
8. **Resend** — email API designed for the API-first generation
9. **Vellum** — production LLM ops without the AWS bill
10. **Mintlify** — docs that don't look like sharepoint
11. **Cal.com** — Calendly minus the lock-in
12. **Loops** — email automation that's actually fun to set up
13. **Browserbase** — headless browser API for AI agents
14. **Modal** — serverless GPUs without the overhead
15. **Mercury** — banking that gets startups
16. **Apple Notes (sync via API via shortcuts)** — underrated as a notes layer
17. **Raycast** — Spotlight + AI + scripts in one
18. **Arc / Dia** — browsers that don't fight the AI workflow
19. **Granola** (yes, twice — it's that useful)
20. **Anthropic Console** — the underrated 2-minute prompt iteration loop

---

## Part 3 · Avoid Listings (categorical, not vendor-specific)

We don't name vendors in print — a tool that's bad today might fix itself by Q3. Instead, here are the **categories** of tools currently to avoid, with reasoning:

1. **"AI sales agent" tools that send outreach autonomously** — hallucination risk + brand-tone drift. Use as agent-assisted (drafts reviewed) not agent-driven (auto-send). The 8 patterns in our Cold Outreach Library work better than any current autonomous agent.

2. **"AI customer support" tools that close tickets** — same hallucination risk applied to customers. Use AI to triage + draft replies; humans approve + send. Plain + your own GPT layer outperforms most.

3. **Single-vendor "AI suites"** — feature lock-in + variable quality across modules. Build with best-of-breed (Claude + n8n + PostHog + Plain) rather than a one-stop.

4. **Heavy enterprise BI tools at SMB scale** — $50k+/yr platforms (Looker, Tableau Enterprise) when PostHog handles 90% of SMB needs for free or $50/mo.

Find specific named vendors via the `ai-tools-catalogue.csv` Verdict column where `AVOID` is set.

---

## Part 4 · The ChatGPT Business Prompt Vault (included)

The standalone $97 product, included in this vault. Open `chatgpt-business-prompt-vault.md` (or the .html version) for the full library of business prompts organised by function.

---

## Part 5 · Quarterly updates

We refresh this vault every quarter (Jan, Apr, Jul, Oct). New tools enter the catalogue, decommissioned ones get archived, verdicts get updated based on the last 90 days of use.

To subscribe to updates, email `srijanpaudelofficial@gmail.com` with subject `Tools Vault subscription` and your Gumroad order number. Free for vault buyers. Each update is a refreshed `ai-tools-catalogue.csv` + change log of what shifted.

---

## Ship Today

Pick ONE category that's the biggest blocker in your business. Read its breakdown. Sign up for the top pick.

Don't try to refresh your whole stack today. One tool, today.

---

*Want a curated, integrated stack done for you? See aiprosol.com/services.*
