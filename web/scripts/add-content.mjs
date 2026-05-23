// Append GEO content batches to /content/*.json:
//   • 4 new comparison pages (Make agency, HubSpot, Salesforce Einstein, MS Copilot)
//   • 20+ new glossary terms (target 48+ total)
//   • 8 new how-to entries (new file: how-to.json)
import fs from 'node:fs';

// ────────────────── 4 new comparisons ──────────────────────────────────
const newComparisons = [
  {
    slug: "aiprosol-vs-make-agency",
    title: "Aiprosol vs a Make.com agency",
    metaDescription: "Aiprosol vs a Make.com agency: AI-native architecture, ongoing operations, multi-tool flexibility. Where each model wins.",
    h1: "Aiprosol vs a Make.com agency — when each wins",
    summary: "Make.com agencies build scenarios end-to-end inside Make. Aiprosol designs multi-tool architectures with AI at the centre, then operates them ongoing. This page compares the two on price, scope, lock-in, and AI capability.",
    table: {
      headers: ["Dimension", "Make.com agency", "Aiprosol"],
      rows: [
        ["Pricing model", "Per-scenario fixed-fee ($500-3,000 each) or retainer ($1,500-5,000/mo)", "Self-serve from $17 OR managed plans from $997/mo"],
        ["Tool selection", "Make-first (it's their billable surface)", "Best tool per workflow (Make, Zapier, n8n, custom)"],
        ["AI integration", "Bolted on where Make's AI modules support it", "AI-native — 10 AI agents run our own ops; we design with AI in mind"],
        ["Ongoing operations", "Hand-over model; customer maintains", "We operate it for you, weekly metric review + monthly tune"],
        ["Outcomes guarantee", "Project completion", "90-day reclaim guarantee (35+ hrs/wk or we work for free)"],
        ["Time-to-value", "2-4 weeks per scenario", "Day 14 (Phase 0); Day 60 (10 workflows live on Growth plan)"],
        ["Where they're better", "Single-tool Make stack, simple iteration/aggregation needs", "Multi-tool architectures, AI-augmented workflows, ongoing operations"]
      ]
    },
    verdict: "Choose a Make.com agency when you're already deep in Make and want more scenarios built fast inside that ecosystem. Choose Aiprosol when you want a multi-tool architecture (Make + n8n + Zapier + AI), ongoing operations, and a measurable hours-reclaimed outcome guarantee.",
    faqs: [
      { q: "Is Make better than n8n or Zapier?", a: "It depends on workflow shape. Make wins on branching, iterators, aggregators, and visual debugging. Zapier wins on app integrations (5,000+) and ease for non-technical users. n8n wins on self-hosted unmetered runs. Aiprosol's Workflow Automation Playbook documents the decision matrix." },
      { q: "Can Aiprosol work alongside our existing Make scenarios?", a: "Yes — we layer alongside. Existing Make scenarios stay; we add AI-augmented workflows or migrate scenarios that are getting expensive to n8n." },
      { q: "Do we have to migrate off Make if we engage Aiprosol?", a: "No — we don't rip and replace. Migration happens only when a specific workflow's cost-per-run on Make justifies moving it to n8n self-hosted. Most customers stay multi-tool." }
    ]
  },
  {
    slug: "aiprosol-vs-hubspot-operations-hub",
    title: "Aiprosol vs HubSpot Operations Hub",
    metaDescription: "Aiprosol vs HubSpot Operations Hub: when in-product automation is enough vs. when you need cross-tool AI orchestration.",
    h1: "Aiprosol vs HubSpot Operations Hub",
    summary: "HubSpot Operations Hub is HubSpot-native automation — workflows, data sync, custom code blocks inside the HubSpot ecosystem. Aiprosol is multi-tool AI orchestration that LAYERS on top of HubSpot (or any CRM). Different scopes, often complementary, sometimes overlapping.",
    table: {
      headers: ["Dimension", "HubSpot Operations Hub", "Aiprosol"],
      rows: [
        ["Pricing", "$50-2,000/mo bundled with HubSpot tier", "Self-serve from $17 OR $997-$7,997/mo managed plans"],
        ["Scope", "Workflows inside HubSpot + data sync to/from HubSpot", "Cross-tool orchestration: HubSpot + Stripe + Slack + Notion + AI"],
        ["AI capability", "AI Email + AI Content + 'breeze' suggestions", "Full LLM-in-the-loop with Claude / GPT-4 / custom prompts"],
        ["Custom logic", "Custom code blocks (JS, Python — limited)", "Full n8n / Make / Zapier / Lambda runtime"],
        ["Lock-in", "Tied to HubSpot subscription", "Tool-agnostic; we work with what you have"],
        ["Ongoing operations", "Self-serve; you maintain", "Managed plans include operate + tune"],
        ["When it's enough", "Single-tool stack, workflows stay inside HubSpot ecosystem", "Multi-tool architecture, AI-augmented workflows, cross-vendor sync"]
      ]
    },
    verdict: "HubSpot Operations Hub is the right tool when your business runs primarily inside HubSpot and your automation needs stay inside that boundary. Aiprosol fits when you need cross-tool AI orchestration — connecting HubSpot to Stripe, Slack, Notion, your data warehouse, etc. — and want it operated for you ongoing.",
    faqs: [
      { q: "Do I need both HubSpot Ops Hub AND Aiprosol?", a: "Not always. If 80% of your workflows stay inside HubSpot, Ops Hub may be enough. Once you need cross-tool AI workflows (e.g. Stripe charge → enrich → Slack ping → Notion log), Aiprosol's value layer is much wider." },
      { q: "Can Aiprosol replace Operations Hub?", a: "Functionally for most workflows yes. But if you're already on a HubSpot tier that includes Ops Hub, keep using it for in-HubSpot work. Aiprosol adds the layer outside HubSpot." },
      { q: "How does pricing compare?", a: "Ops Hub Pro is $720/mo. Aiprosol Starter is $997/mo but includes ongoing operations + 90-day reclaim guarantee. For just-tooling cost, Ops Hub is cheaper; for design + build + operate, Aiprosol is cheaper than DIY on Ops Hub when you factor opportunity cost." }
    ]
  },
  {
    slug: "aiprosol-vs-salesforce-einstein",
    title: "Aiprosol vs Salesforce Einstein / Agentforce",
    metaDescription: "Aiprosol vs Salesforce Einstein (Agentforce): when enterprise-platform AI makes sense vs when nimble multi-tool AI consulting wins.",
    h1: "Aiprosol vs Salesforce Einstein / Agentforce",
    summary: "Salesforce Einstein (now Agentforce) is Salesforce's in-platform AI agent layer. Aiprosol is multi-tool AI orchestration that works with — or alongside — Salesforce. Different price points, different commitment models, different scopes.",
    table: {
      headers: ["Dimension", "Salesforce Einstein / Agentforce", "Aiprosol"],
      rows: [
        ["Entry price", "$2/conversation or $50-500/user/mo (varies)", "$997-$7,997/mo managed plans"],
        ["Platform requirement", "Salesforce CRM + Einstein license + Data Cloud", "Tool-agnostic — works with HubSpot, Pipedrive, Attio, or Salesforce"],
        ["Customisation depth", "Apex code + Flow + Einstein Studio prompt builder", "Full n8n / Make / Zapier / custom code, any LLM"],
        ["Time-to-deploy", "8-16 weeks (typical Salesforce consulting timeline)", "Day 14 (Phase 0); Day 60 (10 workflows live)"],
        ["Outcomes guarantee", "None standard", "90-day reclaim guarantee on managed plans"],
        ["Procurement complexity", "Salesforce MSA + Einstein addendum + security review", "30-day pilot SOW → full Enterprise contract (2-3 week cycle)"],
        ["When it's right", "Salesforce-anchored enterprise with $1M+ SFDC spend already", "Mid-market or non-Salesforce teams; multi-tool AI orchestration needs"]
      ]
    },
    verdict: "Use Salesforce Einstein when your business runs on Salesforce, you already have the platform investment, and you want AI inside that envelope. Use Aiprosol when you're not anchored to Salesforce OR you need AI workflows that span Salesforce + other tools (Slack, Notion, billing, data warehouse).",
    faqs: [
      { q: "Can Aiprosol work on top of Salesforce?", a: "Yes. We integrate via Salesforce APIs + the Apex / Bulk API. Salesforce stays as your system of record; Aiprosol adds the cross-tool AI orchestration layer on top." },
      { q: "Is Einstein better than Claude or GPT-4 inside automation?", a: "Einstein is Salesforce-tuned for in-platform use cases. For general workflows (drafting, classification, extraction) outside Salesforce, frontier models like Claude or GPT-4 are stronger and far cheaper per token." },
      { q: "What does Aiprosol cost vs. an Einstein implementation?", a: "Einstein implementation projects typically run $50-200K in services + ongoing license. Aiprosol Enterprise is $7,997/mo — ~$96K/year all-in, with ongoing operations included." }
    ]
  },
  {
    slug: "aiprosol-vs-microsoft-copilot-studio",
    title: "Aiprosol vs Microsoft Copilot Studio",
    metaDescription: "Aiprosol vs Microsoft Copilot Studio: when M365-anchored AI agents fit vs when you need multi-tool AI orchestration.",
    h1: "Aiprosol vs Microsoft Copilot Studio",
    summary: "Microsoft Copilot Studio lets enterprises build AI agents inside the M365 ecosystem (Teams, SharePoint, Outlook, Power Platform). Aiprosol is multi-tool AI orchestration not anchored to any single platform. Where each fits.",
    table: {
      headers: ["Dimension", "Microsoft Copilot Studio", "Aiprosol"],
      rows: [
        ["Platform requirement", "Microsoft 365 + Power Platform + Copilot Studio license", "Tool-agnostic — Google Workspace, M365, or any stack"],
        ["Pricing", "$200/month per tenant + per-message overage", "$997-$7,997/mo managed plans, flat fee"],
        ["Build interface", "Low-code Power Platform / Copilot Studio canvas", "Code (n8n / TS / Python) + the right tool for each workflow"],
        ["LLM choice", "GPT-4 (Azure OpenAI only)", "Claude (Anthropic) + GPT (OpenAI) + Llama via Groq — pick per task"],
        ["AI agent scope", "M365-data-aware agents (Outlook, SharePoint, Teams)", "Cross-system agents (CRM + billing + comms + data warehouse)"],
        ["Compliance", "Microsoft enterprise compliance (in-tenant data)", "SOC 2 architecture + customer-controlled cloud option"],
        ["When it's right", "M365-heavy enterprise; in-tenant data sensitivity; Microsoft procurement standard", "Mid-market / non-Microsoft-anchored teams; multi-tool AI needs"]
      ]
    },
    verdict: "Use Microsoft Copilot Studio when your enterprise runs on M365, your data is in SharePoint / OneDrive / Teams, and Microsoft is the procurement standard. Use Aiprosol when you're not M365-anchored OR you need workflows that span M365 + non-Microsoft tools.",
    faqs: [
      { q: "Can Aiprosol integrate with M365?", a: "Yes — Microsoft Graph API gives access to Outlook, SharePoint, Teams, OneDrive. We integrate alongside Copilot Studio, not as a replacement, when customers want both." },
      { q: "Why use Claude or GPT outside Azure OpenAI?", a: "Cost + flexibility. Claude is materially better on long-context reasoning. GPT-4o-mini is 10x cheaper for bulk classification work. Locking to Azure OpenAI means paying premium for both — Aiprosol uses the right model for each workflow." },
      { q: "What's the typical cost for a 100-person org?", a: "Copilot Studio: $200/mo × ~100 users = $20K/mo + overages. Aiprosol Enterprise: $7,997/mo flat, includes operations + 90-day reclaim guarantee." }
    ]
  }
];

// ────────────────── 25 new glossary terms ─────────────────────────────
const newGlossary = [
  { term: "Agent orchestration", slug: "agent-orchestration", category: "Core concepts", definition: "Agent orchestration is the design of how multiple AI agents coordinate to handle complex workflows — passing tasks, sharing context, escalating to humans. The pattern behind Aiprosol's 10-agent C-suite where each agent has a role and they coordinate via a daily cron + shared state.", longExplanation: "Orchestration design choices: (a) hierarchical (one orchestrator agent dispatches to specialist agents — used for Aiprosol's Arora-as-CEO pattern), (b) peer-to-peer (agents communicate directly via shared memory — fragile at scale), (c) pipeline (output of one feeds the next — used for document processing). All three are valid; pick based on workflow shape, latency tolerance, and audit needs.", seeAlso: ["ai-agent", "ai-automation", "workflow-automation"] },
  { term: "System prompt", slug: "system-prompt", category: "Technology", definition: "A system prompt is the initial set of instructions given to an LLM that defines its role, constraints, and behaviour. Distinct from the user prompt (the request) and example outputs (few-shot). The system prompt is the most-leveraged input for steering an LLM in production.", longExplanation: "Best practice: short, structured, behaviour-focused. Bad: 1,000-word 'mega-prompts'. Aiprosol's agents each have a system prompt of ~300 words that defines role, allowed tools, output JSON schema, and refusal cases. The system prompt is reusable; only the user prompt changes per request.", seeAlso: ["prompt-engineering", "llm", "claude"] },
  { term: "Few-shot prompting", slug: "few-shot-prompting", category: "Technology", definition: "Few-shot prompting includes 2-5 input/output examples in the prompt so the LLM learns the pattern by demonstration. Materially improves accuracy on classification, extraction, and format-sensitive tasks vs. zero-shot.", longExplanation: "The trade-off: examples consume tokens (cost + latency). Sweet spot is 3-5 diverse examples covering the edge cases. Beyond 5 examples, returns diminish and you're better off fine-tuning a smaller model. Aiprosol's 200-prompt vault uses few-shot patterns for the classification + extraction prompts where format matters.", seeAlso: ["prompt-engineering", "llm", "system-prompt"] },
  { term: "Token", slug: "token", category: "Technology", definition: "A token is the unit of text an LLM processes — roughly 0.75 words in English. 'Aiprosol' is 1 token; 'aiprosol.com' is 4 tokens. LLM pricing is per-token; LLM context windows are measured in tokens.", longExplanation: "Claude 4.5 Sonnet: 200K-token context window, ~$3/$15 per million tokens (input/output). GPT-4o-mini: 128K tokens, ~$0.15/$0.60. At Aiprosol scale (10 agents × ~2,500 tokens × daily run × 30 days) = ~750K tokens/month, well under most free-tier limits.", seeAlso: ["llm", "context-window", "prompt-engineering"] },
  { term: "Context window", slug: "context-window", category: "Technology", definition: "The context window is the maximum number of tokens an LLM can process in a single request — the combined system prompt + user prompt + conversation history + retrieved context + output. Claude 4.5: 200K tokens. GPT-4o: 128K. Gemini 2.5: 2M.", longExplanation: "Why it matters: long context = more grounding data per request = less hallucination. Aiprosol's RAG over customer playbooks fits ~150 pages in a single Claude request. For workflows hitting context limits, the pattern is: chunk + retrieve → only feed the most-relevant chunks → maintain a summary in the message thread.", seeAlso: ["llm", "rag", "token"] },
  { term: "Fine-tuning", slug: "fine-tuning", category: "Technology", definition: "Fine-tuning is training a base LLM on your domain-specific data so it performs better on your tasks without long prompts. Use cases: highly-structured outputs, brand voice, domain-specific classification.", longExplanation: "In 2026, fine-tuning is mostly unnecessary for SMBs — frontier models with RAG cover 95% of needs at lower TCO. Fine-tune only when (a) prompts are >2K tokens and you can't shorten them, (b) you need consistent brand-voice outputs in production, or (c) you're running at scale where per-token cost matters more than initial training cost.", seeAlso: ["llm", "rag", "prompt-engineering"] },
  { term: "Hallucination", slug: "hallucination", category: "Technology", definition: "Hallucination is when an LLM confidently outputs false information — fabricated citations, made-up statistics, invented quotes. The defining failure mode of LLMs and the primary risk in production deployment.", longExplanation: "Mitigations: (1) RAG so the LLM grounds answers in your data, (2) ask for confidence scores + abstention options, (3) human-in-the-loop on customer-facing outputs, (4) structured outputs with verifiable fields, (5) instruct the model to say 'I don't know' explicitly. Aiprosol's workflows never let AI ship a customer-facing email or filing without human review precisely because hallucination risk is non-zero.", seeAlso: ["llm", "rag", "human-in-the-loop"] },
  { term: "Human-in-the-loop", slug: "human-in-the-loop", category: "Core concepts", definition: "Human-in-the-loop (HITL) is the design pattern where AI produces a draft + a human reviews + approves before action. Critical for any workflow where errors have financial, legal, or reputational consequences.", longExplanation: "Aiprosol's customer-facing workflows are almost universally HITL: AI drafts replies, lead-gen emails, contract redlines; humans approve before send. The exception is internal triage (categorising tickets, scoring leads) where errors are recoverable. Patterns: Slack approval buttons, /studio review queue, email-with-approve-link.", seeAlso: ["ai-automation", "ai-agent", "approval-gate"] },
  { term: "Approval gate", slug: "approval-gate", category: "Operations", definition: "An approval gate is a workflow step that pauses for human approval before executing the next step. Critical for any automation with financial, legal, or customer-facing consequences. Implemented via Slack interactive buttons, email-with-action-link, or admin dashboard queues.", longExplanation: "Pattern: AI drafts → Slack message with Approve/Edit/Reject buttons → on approve, send; on edit, open editor; on reject, archive. Aiprosol's outreach drafts use this pattern. Add a 24h auto-archive so abandoned approvals don't pile up. Track approval rate as a KPI — if approvers are bulk-approving without reading, the gate is theatre.", seeAlso: ["human-in-the-loop", "workflow-automation", "ai-agent"] },
  { term: "JSON mode", slug: "json-mode", category: "Technology", definition: "JSON mode is a parameter that forces an LLM to return valid JSON matching a specified schema. Eliminates the 'paste JSON output' parsing fragility and unlocks structured outputs at scale. Supported by Claude, GPT-4, and most production LLMs.", longExplanation: "Without JSON mode: LLMs occasionally return malformed JSON, miss commas, add explanatory prose. With JSON mode + a Zod / Pydantic schema: outputs are guaranteed structurally valid. Aiprosol's agents all use JSON mode for their `items[]`, `kpis[]`, `alerts[]`, `proposed_tasks[]` outputs.", seeAlso: ["llm", "tool-use", "prompt-engineering"] },
  { term: "Latency", slug: "latency", category: "Operations", definition: "LLM latency is the time from API request to response. Frontier models: 2-10 seconds typical, longer for long outputs. Affects user experience for chat interfaces; less relevant for batch workflows.", longExplanation: "Strategies to reduce: (a) use streaming so the user sees tokens as they generate, (b) use smaller/faster models (Llama 3.1 8B Instant via Groq ~200ms vs Claude 4.5 Sonnet ~3-5s), (c) cache common queries, (d) parallel-call multiple models and use first response. Aiprosol's chat widget streams tokens; agent workflows tolerate 5-10s per call.", seeAlso: ["llm", "streaming", "groq"] },
  { term: "Streaming", slug: "streaming", category: "Technology", definition: "Streaming is the LLM API pattern of sending tokens to the client as they're generated, instead of waiting for the full response. Materially improves perceived latency for chat / drafting use cases.", longExplanation: "Without streaming: user clicks submit, sees nothing for 5 seconds, then full response appears. With streaming: tokens stream within 200-500ms. Implementation: server-sent events (SSE) or WebSocket. Aiprosol's chat widget uses SSE streaming for the Groq-backed Arora chat.", seeAlso: ["latency", "llm"] },
  { term: "Groq", slug: "groq", category: "Tools", definition: "Groq is an LLM inference provider offering ultra-low-latency (~200ms first-token) on open-source models (Llama, Mixtral, Gemma). Different from the Groq cloud — same company, name reuse intended.", longExplanation: "Aiprosol's 10 AI agents run on Groq for cost + speed reasons. Pricing: $0.05-$0.59 per million tokens (vs Claude $3-$15). At our usage levels, monthly cost is <$5. Trade-off: Groq's models are open-source (Llama 3.3 70B is the strongest), less accurate than frontier models like Claude on judgement-heavy tasks. We use Groq for the bulk-work agents (data, ops) and reserve Claude for customer-facing chat.", seeAlso: ["llm", "claude", "latency"] },
  { term: "MRR expansion", slug: "mrr-expansion", category: "Sales", definition: "MRR expansion is increasing recurring revenue from existing customers — upgrades, add-ons, seat expansion. Healthier than new-logo MRR because acquisition cost is zero and customer trust already established. Best SaaS businesses run 110-130% net dollar retention.", longExplanation: "Expansion triggers Aiprosol's CRO agent watches: usage hitting tier limits, accessing higher-tier features, multi-team adoption, payment increase requests. Each trigger fires a CSM Slack alert with an account summary + suggested upgrade pitch. Most expansion happens around 90-180 days after initial signup.", seeAlso: ["mrr", "churn", "managed-plan"] },
  { term: "Net Dollar Retention (NDR)", slug: "net-dollar-retention", category: "Business", definition: "Net Dollar Retention (NDR) = (starting MRR + expansion − contraction − churn) / starting MRR × 100. Measures revenue health of an existing customer cohort. Above 100% means customers grow faster than they leave; below 100% means leaky bucket.", longExplanation: "Industry benchmarks: 110% = healthy SaaS, 120% = great, 130%+ = best-in-class (Snowflake, Datadog). For consultancy / managed services like Aiprosol, NDR is measured the same way — managed-plan customers either expand (more workflows, more users) or contract (downgrade tier, fewer workflows).", seeAlso: ["mrr", "churn", "mrr-expansion"] },
  { term: "ICP (Ideal Customer Profile)", slug: "icp", category: "Sales", definition: "ICP is the named segment of customers your product serves best — defined by industry, size, revenue, role, geography, and any other firmographic + technographic signals. The single most-important sales discipline: ICP-shaped outreach converts; spray-and-pray doesn't.", longExplanation: "Aiprosol's ICP: SMBs 10-500 employees, $1M-$50M ARR, English-language ops, in our top-7 industries (Legal, Real Estate, Manufacturing, Retail, Financial Services, E-commerce, SaaS, Professional Services). The 4-component lead scoring model is calibrated to this ICP — leads outside it score under 40 by design.", seeAlso: ["lead-scoring", "lead-routing"] },
  { term: "PQL (Product-Qualified Lead)", slug: "pql", category: "Sales", definition: "PQL is a lead that's shown product behaviour indicating buying intent — used a key feature, hit a paywall, invited teammates, exceeded free-tier limits. PQL converts 5-10x better than MQL (Marketing-Qualified Lead) because behaviour is a stronger signal than form-fill.", longExplanation: "PQL scoring needs product usage data + a scoring model. Tools: Endgame, Pocus, MadKudu, or a custom model. For SaaS with self-serve onboarding, PQL is the highest-converting lead source. Aiprosol's Lead Generation Playbook covers PQL scoring as part of the 4-component model.", seeAlso: ["lead-scoring", "sales-pipeline-automation", "mrr-expansion"] },
  { term: "Drip campaign", slug: "drip-campaign", category: "Sales", definition: "A drip campaign is an automated multi-touch email sequence — 3-12 emails sent over days or weeks. Most common shapes: welcome series, lead nurture, re-engagement, post-purchase, win-back. The 5-touch Aiprosol nurture sequence is a typical example.", longExplanation: "Best practice: each touch earns the next read by providing standalone value, not just 'following up'. Implementation: Customer.io, Loops, Resend + scheduled jobs, or n8n state-machine workflow. Aiprosol typically deploys drip campaigns inside Customer.io or Loops; for low-volume work, n8n with persisted state suffices.", seeAlso: ["lead-nurture", "email-automation", "cold-outreach"] },
  { term: "Webhook signature verification", slug: "webhook-signature-verification", category: "Operations", definition: "Webhook signature verification is the security pattern of cryptographically verifying that an incoming webhook actually came from the claimed source (Stripe, GitHub, Slack). Without it, anyone can spoof your webhook endpoint and trigger arbitrary actions.", longExplanation: "Pattern: provider signs the payload with a shared secret + HMAC-SHA256; you re-compute the signature on receipt + compare. Stripe, GitHub, Slack, Calendly all support this. Always verify before acting on payload data, even in 'private' endpoints — webhook URLs leak through deployment logs, screenshots, and CI configs.", seeAlso: ["webhook", "idempotency", "workflow-automation"] },
  { term: "Cron job", slug: "cron-job", category: "Operations", definition: "A cron job is a scheduled task that runs at fixed times or intervals — every hour, every day at 9am UTC, every Monday. The backbone of polling workflows and scheduled batch operations. Aiprosol's 10 AI agents run on a daily 9am UTC cron.", longExplanation: "Cron syntax: `0 9 * * *` = every day at 9am. `*/15 * * * *` = every 15 minutes. Implementation: Vercel cron, GitHub Actions schedule, Cloudflare Workers, or n8n's scheduleTrigger node. Best practice: each cron job has a failure alert, success log, and exclusive-execution lock (so overlapping runs don't double-fire).", seeAlso: ["workflow-automation", "scheduled-sweep", "n8n"] },
  { term: "Idempotency key", slug: "idempotency-key", category: "Operations", definition: "An idempotency key is a unique identifier (typically UUID) you supply with API requests so the downstream system recognises duplicates and safely de-duplicates. Stripe, GitHub, Slack, AWS all accept idempotency keys.", longExplanation: "Why it matters: webhooks fire 1-3 times per event. Without idempotency, you create 3 customers / send 3 emails / charge 3 cards. With idempotency key per logical event: downstream API recognises the duplicate and returns the original response without re-executing. Aiprosol's Workflow Automation Playbook covers idempotency as one of 14 patterns.", seeAlso: ["idempotency", "webhook", "workflow-automation"] },
  { term: "Sales SLA", slug: "sales-sla", category: "Sales", definition: "Sales SLA (Service Level Agreement) is the internal commitment to respond to inbound leads within a set time — typically 5 minutes for hot leads, 4 hours for warm, end-of-day for cold. Measured and reported; misses trigger escalation.", longExplanation: "Aiprosol's SLA architecture: hot leads (score ≥ 85) ping AE Slack with a 5-min SLA. If no AE response in 10 min, escalate to manager Slack. If no manager response in 20 min, escalate to founder. Reps see a dashboard with their personal SLA hit-rate weekly. Reps under 85% trigger 1:1 coaching.", seeAlso: ["lead-routing", "sub-3-minute-response", "lead-scoring"] },
  { term: "Knowledge base", slug: "knowledge-base", category: "Operations", definition: "A knowledge base is the structured collection of documentation, SOPs, playbooks, and FAQs a team operates from. Modern KBs are RAG-indexed so AI can answer questions from them directly. Tools: Notion, Confluence, Mintlify, custom.", longExplanation: "For Aiprosol customers, we typically build the KB inside Notion (organisation-friendly) + index it via Supabase pgvector for RAG. AI agents (especially CCO for customer support) query the KB before drafting responses, citing specific KB pages. The KB is the single source of truth — agent answers grounded in it are auditable.", seeAlso: ["rag", "ai-agent", "vector-database"] },
  { term: "CSAT (Customer Satisfaction)", slug: "csat", category: "Business", definition: "CSAT is the % of customers who rate their experience as 'satisfied' or 'very satisfied' after an interaction — typically support tickets, calls, or onboarding. Measured post-interaction with a 1-5 or 1-10 scale.", longExplanation: "Industry benchmark: 80%+ is healthy for SaaS / managed services. Below 70% is a problem. CSAT for support tickets is the leading indicator of churn — sustained low CSAT predicts customer departure 90-180 days out. Aiprosol's CCO agent flags any customer with CSAT < 7 for retention play within 24 hours.", seeAlso: ["churn", "nps", "customer-support-automation"] },
  { term: "NPS (Net Promoter Score)", slug: "nps", category: "Business", definition: "NPS is a 0-100 scoring system measuring customer loyalty. Calculation: % of customers rating 9-10 (Promoters) − % rating 0-6 (Detractors), ignoring 7-8 (Passives). Above 30 is good, above 50 is excellent.", longExplanation: "NPS is lagging — it tells you what happened. Pair with leading indicators (usage trend, support sentiment, payment timing) for early-warning. Aiprosol surveys customers quarterly with a single 0-10 question + open-ended follow-up. Promoters get asked for referrals + reviews; Detractors get a CSM call within 7 days.", seeAlso: ["csat", "churn"] }
];

// ────────────────── 8 how-to entries (new file) ───────────────────────
const howTos = [
  {
    slug: "automate-lead-routing",
    title: "How to automate lead routing in under 3 minutes",
    metaDescription: "Step-by-step: how to build sub-3-minute lead routing with AI scoring + Slack + Calendly. Real n8n workflow included.",
    h1: "How to automate lead routing in under 3 minutes",
    summary: "The architecture: lead arrives → enrich → AI score → branch on score → route to right queue with notification. Total latency: 60-90 seconds. Conversion lift: 21x vs. 30-minute response.",
    totalTime: "PT4H",
    estCost: "$50-200/month",
    tools: ["n8n", "Slack", "Calendly", "Claude or GPT-4o-mini", "HubSpot or Pipedrive"],
    steps: [
      { name: "Capture leads at a single entry point", text: "Whichever form (Tally, Typeform, custom HTML) posts directly to a webhook URL — not async to a CRM. The webhook receives the lead in <500ms." },
      { name: "Enrich with public data (fire-and-forget)", text: "Use Clearbit, Apollo, or Twenty to enrich company size + industry + revenue. Cap at 15s timeout — if it doesn't return, proceed without it. Don't block the acknowledgment on enrichment." },
      { name: "Score the lead 0-100", text: "4-component model: FIT (40 pts: company size + revenue + industry + decision-maker title), INTENT (30: form type + hours-reported + challenge-length), ENGAGEMENT (20: pages visited + return visit + email engagement), URGENCY (10: time-based keywords)." },
      { name: "Branch on score thresholds", text: "≥85 = HOT → Slack #leads-hot with @AE-on-rota + 5-min SLA. 65-84 = WARM → SDR queue, 4-hour SLA. 40-64 = NURTURE → auto-enter 5-touch sequence. <40 = FUTURE → archive, quarterly re-score." },
      { name: "Send acknowledgment email within 90 seconds", text: "Templated email with personalisation tokens (first name, industry, estimated reclaim). Single CTA: book a call. Calendly link inline." },
      { name: "Log to CRM as the LAST step", text: "CRM write is non-blocking. If the CRM is down, the acknowledgment still went out. Sync the lead + score + segment with the CRM API; don't make the form post directly to the CRM (too slow + brittle)." },
      { name: "Set up escalation if AE doesn't respond", text: "If hot lead unread in Slack after 10 min → escalate to manager. After 20 min → escalate to founder. Build the safety net before launching." },
      { name: "Measure + tune weekly", text: "Track: median time-to-first-response (target <3 min, p95 <5 min), score distribution by segment, segment-to-SQL conversion rate. Adjust scoring weights monthly using closed-won data." }
    ],
    relatedProduct: "lead-generation-automation-playbook",
    relatedComparison: "aiprosol-vs-zapier-consultant"
  },
  {
    slug: "audit-business-processes-for-automation",
    title: "How to audit your business processes for automation",
    metaDescription: "The 5-step audit framework Aiprosol uses with Enterprise clients: catalogue tasks, triage, score impact×ease, decide tool, ship one per week.",
    h1: "How to audit your business processes for automation",
    summary: "Most businesses can reclaim 30-50 hrs/week, but only if they audit before building. This 5-step framework produces a prioritised list of automation candidates with explicit impact × ease scoring.",
    totalTime: "PT3H",
    estCost: "$0 (DIY with our $37 checklist)",
    tools: ["Spreadsheet", "Stopwatch", "Calendar review", "Aiprosol Business Process Audit Checklist ($37)"],
    steps: [
      { name: "Catalogue every recurring task", text: "For 30 days, list every task done >3 times. Note frequency (daily / weekly / monthly), duration (minutes per occurrence), and total hours/month (frequency × duration × 4)." },
      { name: "Apply Pareto cut", text: "Top 5 tasks usually consume 60-80% of recurring manual hours. Don't waste effort optimising the bottom 50%." },
      { name: "Triage each task into 4 buckets", text: "(a) Automate now — rule-based, no judgement. (b) Augment with AI — judgement needed but pattern-recognisable. (c) Human-only — relationship, strategy, creativity. (d) Eliminate — doing this at all is the bug (often 10-15% of recurring work)." },
      { name: "Score automate / augment tasks on impact × ease", text: "Impact = hours/month × hourly cost × 12 (annual savings). Ease = build hours (1 if <4 hrs, 3 if 4-16 hrs, 9 if >16 hrs). Sort by impact/ease descending — top 5 are this month's roadmap." },
      { name: "Decide tool per task", text: "Linear pipelines <100 runs/day → Zapier. Branching / iterating → Make. High-volume or state machines → n8n self-hosted. Long-running drip → dedicated SaaS (Customer.io)." },
      { name: "Ship one workflow per week for 12 weeks", text: "Resist parallel building — context-switching kills velocity. Each Monday: pick the highest-impact next task. Each Friday: review what shipped, log baseline metrics, tune next week's pick." }
    ],
    relatedProduct: "business-process-audit-checklist",
    relatedComparison: "aiprosol-vs-in-house-build"
  },
  {
    slug: "score-leads-with-ai",
    title: "How to score inbound leads with AI",
    metaDescription: "Build a 4-component AI lead scoring model: FIT + INTENT + ENGAGEMENT + URGENCY. Routing thresholds + tuning playbook included.",
    h1: "How to score inbound leads with AI",
    summary: "Classical lead scoring is rule-based and inflexible. AI-augmented scoring handles free-text fields (challenge descriptions, custom requirements) and free-form intent signals. 4-component model below.",
    totalTime: "PT6H",
    estCost: "$0-200/month",
    tools: ["Claude or GPT-4o-mini", "n8n or Zapier", "Your CRM"],
    steps: [
      { name: "Define the 4 scoring components", text: "FIT (40 pts max — firmographic fit). INTENT (30 — explicit buying signals). ENGAGEMENT (20 — behavioural). URGENCY (10 — time-based). Total 100." },
      { name: "Allocate FIT points", text: "Company size 10-500 employees (+15). Revenue $1M-$50M (+10). Industry in your top-7 ICP (+10). Title is decision-maker (+5)." },
      { name: "Allocate INTENT points", text: "Filled audit form vs. newsletter (+15). Reported manual hours ≥30/week (+10). Wrote >100 chars in challenge field (+5). Use AI to score the challenge field for specificity vs. generic." },
      { name: "Allocate ENGAGEMENT + URGENCY points", text: "Visited ≥3 pages same session (+5). Viewed pricing (+5). Return visit within 7 days (+5). Mentioned urgency keywords (+5). Currently on a competitor's tool (+5)." },
      { name: "Set routing thresholds", text: "85+ HOT: 5-min SLA, Slack-ping AE. 65-84 WARM: 4-hour SLA, SDR queue. 40-64 NURTURE: auto-sequence. 0-39 FUTURE: archive + quarterly re-score." },
      { name: "Calibrate against historical closed-won data", text: "Pull last 90 days of closed-won deals. Calculate their score at the time they entered. If your model says >85 for 80% of them, you're calibrated. If not, tune weights." },
      { name: "Re-score every quarter", text: "Closed-won data accumulates → re-tune weights monthly first 3 months, then quarterly. Track which components predict best — typically FIT does, INTENT second." }
    ],
    relatedProduct: "lead-generation-automation-playbook",
    relatedComparison: null
  },
  {
    slug: "deploy-first-n8n-workflow",
    title: "How to deploy your first n8n workflow",
    metaDescription: "Step-by-step: from sign-up to first n8n workflow running in production. Importable starter included.",
    h1: "How to deploy your first n8n workflow",
    summary: "n8n is the most cost-effective workflow orchestrator at SMB scale — unmetered runs on a $5/month VPS. This guide gets you from zero to first workflow live in under 30 minutes.",
    totalTime: "PT30M",
    estCost: "$5/month (VPS) or free (n8n.cloud trial)",
    tools: ["n8n.cloud or self-hosted n8n", "Your existing tools (Slack, Gmail, Stripe, etc.)"],
    steps: [
      { name: "Choose hosting: cloud or self-hosted", text: "Cloud: n8n.cloud free trial, then $20/month. Self-hosted: $5/month VPS (DigitalOcean, Hetzner) + Docker compose. Self-hosted wins on cost at any scale; cloud wins on zero-setup." },
      { name: "Sign up + verify email", text: "Cloud: sign up at n8n.cloud. Self-hosted: docker pull n8nio/n8n + docker-compose up. Either way, you should reach the workflows dashboard within 5 minutes." },
      { name: "Import a starter workflow", text: "Aiprosol's free starter pack includes 25 n8n .json files. Download → Workflows → Import from File → pick the matching .json (e.g. Stripe-charge-to-HubSpot.json)." },
      { name: "Connect credentials", text: "Each workflow shows 'REPLACE_ME' placeholders for credentials. Workflows → Credentials → Create new → pick the provider (Slack, Gmail, Stripe) → OAuth or API key. n8n stores these encrypted." },
      { name: "Test with sample payload", text: "Use n8n's Test mode → click Execute Workflow. Each node lights up green/red. Fix any red nodes (usually a missing field or wrong credential)." },
      { name: "Activate the workflow", text: "Toggle Active → workflow listens for triggers. Test by firing a real event (e.g. test Stripe charge). Verify the downstream action happened (CRM updated, Slack message sent)." },
      { name: "Set up failure alerts", text: "Settings → Error Workflow → create or import an error-handler workflow that posts to Slack on any execution failure. Never run a production workflow without error notifications." }
    ],
    relatedProduct: "workflow-automation-playbook",
    relatedComparison: "aiprosol-vs-zapier-consultant"
  },
  {
    slug: "calculate-roi-of-ai-automation",
    title: "How to calculate the ROI of AI automation",
    metaDescription: "Honest formula for AI automation ROI: hours reclaimed × hourly cost × annual weeks. Plus how to validate the inputs.",
    h1: "How to calculate the ROI of AI automation",
    summary: "Most ROI calculations are theatre. This is the formula Aiprosol uses with paying clients — based on measured hours BEFORE and AFTER, not vendor-pitched projections.",
    totalTime: "PT2H",
    estCost: "$0 (DIY with our $47 calculator)",
    tools: ["Spreadsheet", "Calendar review", "Aiprosol ROI Calculator ($47)"],
    steps: [
      { name: "Measure baseline manual hours BEFORE automation", text: "For each candidate workflow, measure how many hours/week the team currently spends. Use time-tracking, calendar review, or self-reported with stopwatch. Don't trust gut estimates — they over-count by ~30%." },
      { name: "Estimate post-automation hours", text: "Conservative: 70% reduction of manual time. Aggressive: 90%. Don't assume 100% — there's always edge cases requiring human handling." },
      { name: "Calculate weekly hours reclaimed", text: "Weekly hours reclaimed = baseline − post-automation. Sanity check: Aiprosol's average across clients is 35 hrs/week. If yours is materially higher or lower, double-check the inputs." },
      { name: "Calculate annual savings", text: "Annual savings = weekly hours × fully-loaded hourly cost × 50 weeks. Fully-loaded hourly cost = (annual salary × 1.4 benefits multiplier) / 2,000 hours. Don't use unloaded rate — it underestimates by 30-40%." },
      { name: "Subtract implementation cost", text: "Implementation cost = (build hours × hourly rate) + tool subscriptions for 12 months + your time investment. For Aiprosol-built: managed plan × 12 months. For DIY: 80-200 hours of internal time." },
      { name: "Compute payback in weeks", text: "Payback weeks = implementation cost / weekly savings. Most automation projects pay back in 4-12 weeks. If yours is >26 weeks, the workflow probably isn't worth automating yet." },
      { name: "Don't fake the numbers", text: "Vendor-pitched ROI assumes best case. Real ROI measures actual hours-reclaimed at days 30/60/90. Aiprosol's 90-day reclaim guarantee is based on measured deltas — that's the standard to hold any automation vendor to." }
    ],
    relatedProduct: "ai-automation-roi-calculator",
    relatedComparison: "aiprosol-vs-in-house-build"
  },
  {
    slug: "build-customer-support-ai",
    title: "How to build customer support automation that customers actually like",
    metaDescription: "Step-by-step: build AI customer support that resolves 60% of tickets while preserving brand voice + escalating edge cases to humans.",
    h1: "How to build customer support automation that customers actually like",
    summary: "Most AI support tools frustrate customers. The pattern that works: AI handles routine queries, escalates anything edge-case to humans WITH context pre-loaded. Done right, CSAT goes UP because response times go down.",
    totalTime: "PT8H",
    estCost: "$50-200/month",
    tools: ["Plain / Intercom / Help Scout / Zendesk", "Claude or GPT-4", "Your knowledge base"],
    steps: [
      { name: "Audit your historical tickets", text: "Export 200-500 recent tickets. Categorise: refund / tracking / sizing / billing / bug / feature-request / other. Identify the top 5 categories by volume — these are your automation targets." },
      { name: "Build category classifier", text: "Use a few-shot prompt that takes ticket subject + first 200 chars + ticket history → outputs one of your top 5 categories. Test on 50 held-out tickets. Target accuracy ≥90% before deploying." },
      { name: "Build response drafts for top 3 categories", text: "For each high-volume category, build a drafted response that includes: greeting (brand-voice-calibrated), specific answer (RAG over your KB), CTA. Test by feeding 20 real tickets through the draft pipeline." },
      { name: "Add confidence scoring", text: "Each response includes a confidence score (0-100). High confidence (>85): auto-send. Medium (60-85): draft + human approves with one click. Low (<60): route to human with no AI draft." },
      { name: "Add escalation triggers", text: "Sentiment analysis flags negative language → human handles, no AI draft. Mentions legal / refund threshold / executive → auto-escalate to senior support. Mentions specific accounts → priority routing." },
      { name: "Pilot on 5% of inbound for 2 weeks", text: "Don't roll out to 100% immediately. Sample 5% randomly. Measure: CSAT vs control group, time-to-first-response, escalation rate, customer feedback. Tune before expanding." },
      { name: "Roll out + monitor weekly", text: "Once pilot CSAT ≥ control CSAT, expand to 100%. Weekly review: deflection rate, escalation accuracy, brand-voice drift. Re-train on misclassified tickets monthly." }
    ],
    relatedProduct: null,
    relatedComparison: null
  },
  {
    slug: "automate-document-processing",
    title: "How to automate document processing (invoices, contracts, statements)",
    metaDescription: "Build 99%+ accurate document extraction with confidence scoring + audit trail. Replaces manual data entry without OCR pain.",
    h1: "How to automate document processing",
    summary: "Modern LLMs handle unstructured documents at 99%+ accuracy with proper architecture. This guide covers the extraction pipeline: ingest → AI extract → confidence-score → human review on edge cases → push to system of record.",
    totalTime: "PT12H",
    estCost: "$100-500/month",
    tools: ["Claude or Reducto for extraction", "Your accounting / ERP / CRM", "Audit log database"],
    steps: [
      { name: "Identify the top document type to automate", text: "Most valuable: invoices (high volume, structured), tax docs (high accuracy required), contracts (high reasoning), receipts (high volume). Start with one type; perfect that pipeline before expanding." },
      { name: "Define the extraction schema", text: "Write the JSON schema you want extracted. For invoices: vendor name, vendor address, invoice #, invoice date, due date, line items (description + quantity + unit price + total), subtotal, tax, total." },
      { name: "Build the extraction prompt", text: "System prompt: 'You are a document data extractor. Output valid JSON matching this schema: [schema]. If a field isn't present, output null. Don't hallucinate.' User prompt: 'Extract from this document: [doc text or image]'." },
      { name: "Add confidence scoring per field", text: "Ask the LLM to output confidence (0-100) per extracted field. Use Claude's structured output mode or function calling for guaranteed JSON validity." },
      { name: "Route by confidence", text: "All fields >95%: auto-post to ERP/CRM. Any field 70-95%: queue for human review with the AI's reasoning shown. Any field <70%: human handles from scratch." },
      { name: "Build the audit log", text: "Every extraction logs: input doc hash, model used, prompt sent, output JSON, confidence per field, reviewer ID (if reviewed), decision (approve/edit/reject), timestamp. Required for compliance, useful for re-training." },
      { name: "Re-train on human corrections weekly", text: "Every human edit is supervised learning data. Aggregate corrections weekly, update few-shot examples in the prompt. Track accuracy week-over-week; target 99%+ steady-state." }
    ],
    relatedProduct: null,
    relatedComparison: null
  },
  {
    slug: "pick-zapier-vs-make-vs-n8n",
    title: "How to pick Zapier vs Make vs n8n for your workflow",
    metaDescription: "Decision matrix: when Zapier wins, when Make wins, when n8n wins. Plus cost calculations at your scale.",
    h1: "How to pick Zapier vs Make vs n8n for your workflow",
    summary: "Each tool has a sweet spot. This is the decision matrix Aiprosol uses with paying clients — based on workflow shape, run volume, team technical level, and cost-per-operation.",
    totalTime: "PT1H",
    estCost: "$0",
    tools: ["The Aiprosol Tool Cost Comparison spreadsheet (free with the Starter Pack)"],
    steps: [
      { name: "Identify the workflow shape", text: "Linear pipeline (trigger → action → action). Branching (1 trigger → multiple paths). Iterating (1 trigger → for-each over array). Scheduled sweep (cron + query + per-row processing). Polling. Approval gate. Long-running state machine." },
      { name: "Estimate run volume", text: "How many times per day will this workflow fire? Counts every internal step too — a 5-step workflow firing 100 times/day = 500 'operations' on Zapier's billing." },
      { name: "Check team's technical level", text: "Non-technical (sales / ops): Zapier wins for ease. Technical-adjacent (ops with light JS): Make wins on visual + cost. Engineering (devs): n8n wins on flexibility + self-host cost." },
      { name: "Apply the cost matrix", text: "Under 100 runs/day, simple shape, non-technical team → Zapier ($20-50/mo). 100-2,000 runs/day OR branching/iterating → Make ($9-29/mo). 2,000+ runs/day OR state machines OR engineering team → n8n self-hosted ($5/mo VPS, unmetered)." },
      { name: "Check ecosystem fit", text: "Zapier: 5,000+ apps integrated, weakest niche tools usually have a Zapier integration. Make: 1,800+ apps, strong on data manipulation. n8n: 350+ official + community nodes, plus full code blocks for anything missing." },
      { name: "Stress-test edge cases", text: "What happens at 10x the expected volume? Zapier: bill jumps + rate limits hit. Make: usually still works, bill is moderate. n8n self-hosted: same VPS cost." },
      { name: "Pick one + commit for 90 days", text: "Don't tool-shop weekly. Pick based on the matrix, commit for 90 days, measure actual cost + dev time vs estimate. Re-evaluate at 90 days." }
    ],
    relatedProduct: "workflow-automation-playbook",
    relatedComparison: "aiprosol-vs-zapier-consultant"
  }
];

// Apply all
const compPath = 'src/content/comparisons.json';
const glossPath = 'src/content/glossary.json';
const howtoPath = 'src/content/how-to.json';

const comp = JSON.parse(fs.readFileSync(compPath, 'utf8'));
const gloss = JSON.parse(fs.readFileSync(glossPath, 'utf8'));
comp.push(...newComparisons);
gloss.push(...newGlossary);

fs.writeFileSync(compPath, JSON.stringify(comp, null, 2) + '\n');
fs.writeFileSync(glossPath, JSON.stringify(gloss, null, 2) + '\n');
fs.writeFileSync(howtoPath, JSON.stringify(howTos, null, 2) + '\n');

console.log(`Comparisons: ${comp.length} (added ${newComparisons.length})`);
console.log(`Glossary: ${gloss.length} (added ${newGlossary.length})`);
console.log(`How-tos: ${howTos.length} (new file)`);
