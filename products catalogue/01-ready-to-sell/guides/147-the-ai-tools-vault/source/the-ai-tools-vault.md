# The Aiprosol AI Tools Vault

**A working operator's vault: 120+ AI tools across 14 categories. Organised, searchable, with one-line "when to pick" calls. Companion to the Comparison Guide — that's the deep-dive reference; this is the breadth library.**

Version 1.0 · 2026 · © Aiprosol Ltd

---

## How this differs from the Comparison Guide

| Comparison Guide ($67) | This Vault ($147) |
|---|---|
| 60+ tools, 5 fields each, deep | 120+ tools, 1-2 lines each, broad |
| Opinionated picks per category | Comprehensive picks INCLUDING niche |
| "Aiprosol verdict" per tool | "When to pick this over the default" |
| 9 categories | 14 categories |
| For when you're ready to commit | For when you're scoping the landscape |

If you don't already own the Comparison Guide, this Vault references its picks but stands alone.

---

## Decision shortcut — pick by job

| Job | Default pick | When to break the default |
|---|---|---|
| Build a chatbot | Intercom Fin (if on Intercom), Chatbase (if standalone) | High-volume + own data → custom on Claude API + RAG |
| Automate workflows | Make.com | Self-host → n8n; complex enterprise → Workato |
| Generate text | Claude Sonnet 4.5 | Need vision + voice → GPT-4o; need 2M context → Gemini |
| Voice agent | Vapi.ai | <100 calls/day → Bland; >1k/day → DIY on Twilio |
| Code AI | Cursor | Compliance-locked → GitHub Copilot Business |
| Image generation | Midjourney v7 | Need brand consistency → Adobe Firefly; prefer SDXL → Flux |
| Document AI | Reducto | Forms-heavy → Hyperscience; receipts only → Veryfi |
| Sales calls AI | Fathom | Already on Zoom → Otter native |
| Customer research | Tldv or Granola | Hands-off summary only → Otter |

---

# §1 · Foundation models (the brains) — 11 tools

Beyond the 7 in the Comparison Guide, these are the niche / special-purpose models worth knowing:

- **Anthropic Claude (Opus 4.6+, Sonnet 4.5, Haiku 4)** — production default
- **OpenAI GPT-4o, GPT-4.5, o1** — multimodal + reasoning
- **Google Gemini 1.5 Pro, 2.0** — long context, Workspace integration
- **Meta Llama 3.3 70B / 405B** — open weights
- **Mistral Large 2, Codestral** — EU residency
- **DeepSeek V3** — extreme value
- **Cohere Command R+** — RAG specialist
- **xAI Grok-2, Grok-3** — uncensored, Twitter integration
- **Alibaba Qwen 2.5** — strong open-weights, Asian-language strong
- **Microsoft Phi-4** — small, efficient, on-device-capable
- **Apple Intelligence (Foundation Models)** — iOS / macOS native

**When to pick which:** see Comparison Guide §1. Niche additions:
- **Grok** for X/Twitter monitoring (only one with first-party Twitter data)
- **Qwen** if your business operates in CN/JP/KR markets
- **Phi-4** for on-device deployment (regulatory or offline contexts)

---

# §2 · Customer support AI — 14 tools

**Default:** Intercom Fin (if on Intercom).

**Alternatives by category:**

- **Standalone resolver bots:** Chatbase, Voiceflow, Cohere Workspace, ChatBotKit
- **Helpdesk-native AI:** Zendesk AI Agents, Freshdesk Freddy, Help Scout AI Assist, Intercom Fin, Front AI
- **Live-chat with AI:** Tidio Lyro, Crisp, Olark
- **Voice + chat:** Cresta, Sierra
- **Internal-team AI:** Glean, Forethought (Fortune 500 internal helpdesk)

**Niche picks:**

- **Sierra** — high-end conversational agents for Fortune 500 (>$10k/month)
- **Cresta** — sales/support call AI coach (real-time)
- **Glean** — internal employee Q&A over your company knowledge base
- **Forethought** — purpose-built for high-volume support orgs (>100 agents)

---

# §3 · Workflow automation — 12 tools

**Default:** Make.com → Zapier → n8n.

**Alternatives:**

- **Mainstream:** Zapier, Make, n8n, Workato, Tray.ai, Pipedream
- **Open-source:** n8n, Activepieces, Huginn (geek-tier)
- **Enterprise:** Workato, Tray.ai, Boomi, MuleSoft (heavy)
- **Code-first:** Inngest (queue + workflow), Trigger.dev, Temporal (programmer's pick)
- **AI-native:** Relay.app, Bardeen (browser-side automation)

**When to pick which:**

- **Zapier**: smallest learning curve, biggest catalogue, weakest debugger
- **Make**: best visual debugger, mid catalogue, mid learning curve
- **n8n**: free if self-hosted, requires ops capacity
- **Workato / Tray**: enterprise scale + audit + governance + price
- **Inngest / Trigger.dev / Temporal**: when you have engineers and need code-as-config workflows
- **Relay.app**: AI-decided actions (newer pattern, watch list)

---

# §4 · Document AI — 11 tools

**Default:** Claude with vision (general purpose) → Reducto (production-grade structured extraction).

**Alternatives:**

- **General LLM with vision:** Claude (vision), GPT-4o (vision), Gemini Pro Vision
- **Specialised structured-extraction:** Reducto, Unstructured.io, Hyperscience, Rossum, Mathpix (math + scientific)
- **Receipts / expense:** Veryfi, Dext, AutoEntry
- **Contract review:** Spellbook, LawGeex, Lexion
- **Invoice OCR:** ABBYY FlexiCapture, Klippa
- **Generic OCR:** Google Document AI, Amazon Textract, Tesseract (open-source)

**Buying advice:** for any volume above 1,000 docs/month, the general-purpose LLMs (Claude/GPT-4o vision) become expensive and lossy. Move to a specialised structured-extraction tool. Below 1,000/mo, LLM vision is fine.

---

# §5 · Image generation — 14 tools

**Default:** Midjourney v7 (best aesthetic) → Flux Pro (best controllable) → DALL-E 3 (best ChatGPT integration).

- **General:** Midjourney v7, DALL-E 3, Stable Diffusion 3, Flux (Pro/Schnell), Ideogram
- **Brand-consistent:** Adobe Firefly, Recraft (vector + raster + brand kit)
- **Photo / portrait:** PhotoAI, HeadshotPro, FaceApp Pro
- **Product photography:** Pebblely, Photoroom AI
- **Logo / icon:** LogoCreator AI, Stable Diffusion + ControlNet
- **Edit existing:** Magnific (upscale + creative variation), Krea AI

---

# §6 · Video generation — 8 tools

**Default:** Runway Gen-3 (general) → Pika (motion) → Luma Dream Machine (camera moves).

- Runway Gen-3, Pika 2.0, Luma Dream Machine, Kling AI, Hailuo (Minimax), Sora (when GA), Synthesia (talking-head avatars), HeyGen (avatars + multi-lingual dub)

**When to pick which:**

- **Runway** — most polished commercial workflow
- **Pika** — best motion + control
- **Luma Dream Machine** — best for camera-style pans/zooms
- **Synthesia / HeyGen** — only when you need a person speaking on camera (training videos, internal comms, lip-sync to script)
- **Sora** — when GA, will likely be the new default for cinematic quality

---

# §7 · Voice agents — 9 tools

**Default:** Vapi.ai → DIY on Twilio + Deepgram + LLM if >1k calls/day.

- **Hosted:** Vapi.ai, Bland.ai, Retell AI, ElevenLabs Conversational AI
- **Build-your-own components:** Twilio (telephony), Deepgram / AssemblyAI (STT), ElevenLabs / Cartesia (TTS), Pipecat (orchestration)
- **Industry-specific:** Hippocratic AI (healthcare-grade)

---

# §8 · Coding assistants — 12 tools

**Default:** Cursor (production) → Claude Code (CLI) → Cline (free).

- **IDE-native:** Cursor, GitHub Copilot, Windsurf, Cody (Sourcegraph)
- **CLI:** Claude Code, Aider
- **VS Code extensions:** Cline, Roo Code (free), Continue, Tabnine
- **Web-based:** v0, Bolt.new, Replit Agent
- **Pair-coding chat:** ChatGPT, Claude.ai (slower but conversational)

**Reality:** Cursor is winning the indie/startup market. Copilot Business owns the enterprise / compliance market. Everyone else is chasing.

---

# §9 · Data + analytics AI — 10 tools

- **Notebook + AI:** Hex, Mode, Julius, Definite
- **In-chat-AI analysis:** Code Interpreter (ChatGPT, Claude), Cursor + DuckDB
- **BI with AI:** Tableau Pulse, Power BI Copilot, Sigma Computing
- **Customer-data + AI:** PostHog (with AI insights), June

---

# §10 · Sales / CRM AI — 11 tools

- **CRM with AI:** Attio, HubSpot AI, Salesforce Einstein, Pipedrive AI
- **Cold outreach:** Smartlead (volume), Instantly, Lemlist (personalisation)
- **Call AI:** Gong, Chorus (Zoom), Salesloft Conversations
- **Meeting AI:** Fathom, tldv, Granola, Otter
- **Prospect research:** Clay (data enrichment + LLM combinator)

---

# §11 · Marketing AI — 9 tools

- **Content creation:** Jasper, Copy.ai, Notion AI
- **SEO:** Surfer, Frase, Semrush AI
- **Social:** Hootsuite AI, Buffer AI Assistant
- **Brand voice:** WriterMore, Lex (writing-focused LLM client)
- **Editorial workflows:** Letterdrop, Beam AI

---

# §12 · HR + recruiting AI — 8 tools

- **ATS with AI:** Ashby, Greenhouse AI, Workable
- **AI screening:** Paradox, HireVue, Eightfold AI
- **Reference checks:** Crosschq, Checkster
- **Interview AI:** BrightHire, Pillar
- **Onboarding:** Donut (Slack)

---

# §13 · Productivity / personal AI — 12 tools

- **Note-taking:** Mem, Reflect, Obsidian + Smart Connections, Notion AI
- **Email:** Superhuman AI, Shortwave AI
- **Calendar:** Reclaim, Motion, Sunsama
- **Task / project:** Mem, Sunsama, Todoist AI
- **Meeting prep:** Read.ai, Vowel, Krisp (noise + transcription)

---

# §14 · Niche / vertical AI — 11 tools

- **Legal:** Spellbook, Harvey, Casetext (Thomson Reuters), LawGeex
- **Healthcare:** Hippocratic AI, Suki, Abridge, Nuance DAX
- **Finance / accounting:** Numeric, Trullion (audit), Pilot (bookkeeping)
- **Real estate:** ChatGPT-trained agents on listings (Lofty, Realeflow)
- **E-commerce specific:** Octopus AI (product listings), Recart (DM marketing)

---

# How to navigate the Vault — three ways

### 1. By job-to-be-done

Go to the Decision Shortcut at the top. Pick a job. Done.

### 2. By stack you're starting from

Already on HubSpot? You'll want HubSpot AI, Fin, and tools that integrate with HubSpot. Already on Salesforce? Salesforce Einstein, Gong, Salesloft — different ecosystem.

### 3. By budget

Under £200/mo total → solo / micro-business stack (see AI Tools Stack Starter Kit, §5)
£200-£1,000 → SMB stack (see Stack Kit §1, §2, §7)
£1,000+ → growth-stage stack (see Stack Kit §3, §4)

---

# Quarterly refresh policy

Buyers get the next 4 quarterly refreshes free at:

`aiprosol.com/vault-update?email={your email}`

Q3 2026 refresh will include: 15+ new entrants we're tracking, retirements, updated pricing, and a new section on agentic browsers (Multi-on, OpenAI Operator, Anthropic Computer Use).

---

# Conflicts of interest

We have **no affiliate or revenue-share** relationship with any tool listed in this vault. We pay for the tools we recommend.

Where we use a tool ourselves at Aiprosol, it's labelled. Otherwise, picks are based on:
- 15-minute capability test against a standard prompt/workflow
- Pricing-reality check (vs. marketing-page lowball)
- Public-feedback scan (G2, Reddit, HN, X over last 60 days)
- Internal-network use (whether anyone we know runs it in production)

---

## Licensing

Licensed for unlimited internal use within purchaser's organisation. Quarterly updates free for 4 quarters. Public republication of the comparison tables requires written permission. © 2026 Aiprosol Ltd.
