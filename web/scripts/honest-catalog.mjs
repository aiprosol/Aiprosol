// Rewrite product catalog to: (a) match what's actually delivered, (b) apply
// price changes, (c) add charter offer flag, (d) add ship dates to pre-orders,
// (e) sync deliveryFiles to all real assets.

import fs from 'node:fs';
const PATH = './src/content/products.json';
const products = JSON.parse(fs.readFileSync(PATH, 'utf8'));

const f = (path, filename, mime) => ({ path, filename, mime });

// All 25 real n8n workflow files
const n8nDir = './private-products/n8n-workflows';
const n8nAll = fs.readdirSync(n8nDir).sort().map(name => f(
  `private-products/n8n-workflows/${name}`,
  name,
  name.endsWith('.json') ? 'application/json' : 'text/markdown',
));

// Lead-specific n8n files (4)
const n8nLead = n8nAll.filter(x =>
  x.filename.includes('-sales-form-score-route') ||
  x.filename.includes('-sales-cold-reply') ||
  x.filename.includes('-sales-calendly-ai-prep') ||
  x.filename.includes('-sales-stripe-charge') ||
  x.filename.includes('-sales-lead-inactive') ||
  x.filename.includes('-sales-hot-lead') ||
  x.filename.includes('-sales-closed-won')
);

const MD_HTML = (slug, displayName) => [
  f(`private-products/${slug}.md`, `Aiprosol-${displayName}.md`, 'text/markdown'),
  f(`private-products/${slug}.html`, `Aiprosol-${displayName}.html`, 'text/html'),
];

// ─────────────────────────────────────────────────────────────────────────
// Per-product updates: whatsInside (catalog promise) + deliveryFiles (real)
// + price (if changed)
// ─────────────────────────────────────────────────────────────────────────

const updates = {
  // ── Live products ────────────────────────────────────────────────────

  'automation-roi-pitch-deck-template': {
    // No change to scope — pptx is comprehensive
  },

  'business-process-audit-checklist': {
    // No change — md + html match promise
  },

  'ai-automation-roi-calculator': {
    // No change — xlsx delivers
  },

  '30-day-business-automation-challenge': {
    whatsInside: [
      '30 daily 15-25 minute recipes with success criteria + pitfalls',
      'Week 1: Foundation (control panel, Stripe log, Gmail classifier, CRM auto-create)',
      'Week 2: Sales + Customer (attribution, no-show prevention, follow-ups, renewals)',
      'Week 3: Operations (invoices, expenses, content, action items, weekly review)',
      'Week 4: Compounding (research, feedback, monitoring, hiring, annual review)',
      '25 importable n8n workflow JSON files from the master starter library',
      'Self-paced — work at your own speed, no time pressure',
    ],
    deliveryFiles: [
      ...MD_HTML('30-day-business-automation-challenge', '30-Day-Automation-Challenge'),
      ...n8nAll,
    ],
  },

  'ai-tools-master-comparison-guide-2026': {
    shortDescription: 'Every AI tool we vet, ranked by use case across 23 categories. Verdict, pricing, free tier, integrations. CSV + JSON + HTML.',
    whatsInside: [
      '105 AI tools curated by Aiprosol (v1 — refreshed quarterly to 200+)',
      '23 categories covered (Conversational AI, Code, Image, Video, Voice, RAG, no-code, etc.)',
      'Per-tool fields: category, summary, pricing, verdict, notes',
      'CSV format (spreadsheet manipulation) + JSON (programmatic use)',
      'HTML viewer for quick browse',
      '2026 trend notes: emerging, plateauing, consolidating segments',
      'Quarterly refresh via email subscription (free for buyers)',
    ],
    deliveryFiles: [
      ...MD_HTML('ai-tools-master-comparison-guide-2026', 'AI-Tools-Comparison-Guide-2026'),
      f('private-products/ai-tools-catalogue.csv', 'Aiprosol-AI-Tools-Catalogue.csv', 'text/csv'),
      f('private-products/ai-tools-catalogue.json', 'Aiprosol-AI-Tools-Catalogue.json', 'application/json'),
    ],
  },

  'global-business-automation-starter-pack': {
    whatsInside: [
      '5-step process audit framework (the one we use with Enterprise clients)',
      '30+ workflow blueprints documented across 6 areas',
      '25 importable n8n starter workflows covering the 7 core patterns',
      'Zapier vs Make vs n8n cost comparison spreadsheet',
      'Integration architecture mental model',
      '30-day onboarding checklist',
    ],
    deliveryFiles: [
      ...MD_HTML('global-business-automation-starter-pack', 'Global-Business-Automation-Starter-Pack'),
      f('private-products/tool-cost-comparison.xlsx', 'Aiprosol-Tool-Cost-Comparison.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
      ...n8nAll,
    ],
  },

  'the-starter-bundle': {
    // No change — bundle README + 3 underlying products
  },

  'workflow-automation-playbook': {
    whatsInside: [
      '7 core patterns documented (Linear, Branching, Fan-out, Scheduled, Polling, Approval, Long-running)',
      '5 anti-patterns to avoid (Stack of band-aids, Mystery monolith, Set-and-forget, AI-as-trigger, Silent automation)',
      '25 importable n8n workflow JSON files (Sales 7 · CS 6 · Ops 4 · Finance 3 · Marketing 3 · People 2)',
      'Operator\'s checklist: 23 questions to ask before shipping',
      'Migration map: manual process → automated workflow in 6 steps',
      'Build vs buy vs service decision framework',
      'Tool selection grid (Zapier vs Make vs n8n by volume + shape)',
    ],
    deliveryFiles: [
      ...MD_HTML('workflow-automation-playbook', 'Workflow-Automation-Playbook'),
      ...n8nAll,
    ],
  },

  'lead-generation-automation-playbook': {
    whatsInside: [
      '4-component lead scoring model with point allocations (FIT 40 + INTENT 30 + ENGAGEMENT 20 + URGENCY 10)',
      'Sub-3-minute response architecture (full system blueprint)',
      '5-touch nurture email sequence with subjects + body + send timing',
      '8-pattern cold outreach library with full templates + reply-rate baselines',
      'Routing decision tree + 5-min SLA infrastructure',
      'Weekly closed-loop iteration system + dashboard spec',
      '7 lead-relevant n8n workflows (capture, score, route, AE prep, hot SLA, re-engagement, intent classifier)',
    ],
    deliveryFiles: [
      ...MD_HTML('lead-generation-automation-playbook', 'Lead-Generation-Automation-Playbook'),
      ...MD_HTML('cold-outreach-library', 'Cold-Outreach-Library'),
      ...n8nLead,
    ],
  },

  'chatgpt-business-prompt-vault': {
    whatsInside: [
      '200 production-tested prompts in JSON + CSV + indexed Markdown',
      'Sales (40 prompts): outreach, discovery, follow-ups, objections, proposals, negotiation, linkedin',
      'Marketing (40): content, campaigns, email, landing pages, ads, social, SEO, video, podcast, research',
      'Operations (30): SOPs, meetings, decisions, status, vendors, onboarding, incidents, playbooks',
      'Finance (25): modeling, reporting, budgeting, fundraising, cash, accounting, compliance, forecasting',
      'People/HR (25): hiring, onboarding, performance, feedback, compensation, policies, engagement, culture',
      'Product (20) + Engineering (20): PRDs, ADRs, research, releases, metrics, code review, testing, security',
      'Structured JSON: id, category, subcategory, title, system, user_template, best_model, notes',
    ],
    deliveryFiles: [
      ...MD_HTML('chatgpt-business-prompt-vault', 'ChatGPT-Business-Prompt-Vault'),
      f('private-products/chatgpt-business-prompts.json', 'Aiprosol-ChatGPT-Business-Prompts.json', 'application/json'),
      f('private-products/chatgpt-business-prompts.csv', 'Aiprosol-ChatGPT-Business-Prompts.csv', 'text/csv'),
      f('private-products/chatgpt-business-prompts-index.md', 'Aiprosol-Prompts-Index.md', 'text/markdown'),
    ],
  },

  'the-ai-tools-vault': {
    price: 67,  // ⬇ from $147 to $67 — honest v1 scope
    shortDescription: 'Every AI tool we vet, ranked by use case. Updated quarterly. 105 tools in v1, growing to 200+. Includes the Prompt Vault.',
    whatsInside: [
      '105 AI tools curated by Aiprosol (v1 — refreshed quarterly to 200+)',
      '23 categories covered (Conversational AI, Code, Image, Video, Voice, RAG, no-code, etc.)',
      'Per-tool fields: category, summary, pricing, verdict (PICK/GOOD/WATCH/AVOID/GEM), notes',
      'CSV + JSON formats for spreadsheet + programmatic use',
      'ChatGPT Business Prompt Vault included (200 prompts)',
      'Hidden Gems list (20+) with rationale',
      'Avoid categories list with reasoning',
      'Quarterly refresh via email subscription (free for buyers)',
    ],
    deliveryFiles: [
      ...MD_HTML('the-ai-tools-vault', 'AI-Tools-Vault'),
      f('private-products/ai-tools-catalogue.csv', 'Aiprosol-AI-Tools-Catalogue.csv', 'text/csv'),
      f('private-products/ai-tools-catalogue.json', 'Aiprosol-AI-Tools-Catalogue.json', 'application/json'),
      ...MD_HTML('chatgpt-business-prompt-vault', 'ChatGPT-Business-Prompt-Vault'),
      f('private-products/chatgpt-business-prompts.json', 'Aiprosol-Prompts.json', 'application/json'),
      f('private-products/chatgpt-business-prompts.csv', 'Aiprosol-Prompts.csv', 'text/csv'),
    ],
  },

  'zapier-make-power-user-bundle': {
    price: 147,  // ⬇ from $197 to $147 — documentation-first scope
    shortDescription: 'Documentation-first bundle: 50 documented Zapier + Make recipes with patterns, gotchas, decision matrix. Build in your own account in 5-15 min each.',
    whatsInside: [
      '25 fully-detailed Zapier recipes (step-by-step build guides — assemble in 10-15 min each)',
      '25 fully-detailed Make.com recipes (modules, mappings, filters)',
      '22-row Zapier vs Make decision matrix',
      '14-pattern operator\'s playbook (dedupe, idempotency, soft-fail, rate-limit handling)',
      'When-to-skip-both → n8n decision tree',
      'Documentation-first by design (no .blueprint files — those break when SaaS APIs evolve)',
    ],
    deliveryFiles: MD_HTML('zapier-make-power-user-bundle', 'Zapier-Make-Power-User-Bundle'),
  },

  'enterprise-ai-readiness-assessment-kit': {
    whatsInside: [
      'Readiness Scorecard XLSX (120 questions × 12 dimensions, auto-aggregating, with chart)',
      'Vendor Selection RFP DOCX (40-criteria grid + 10-item contract red-flag checklist)',
      '90-Day Implementation Plan PPTX (14 slides covering Phase 0 → Phase 2)',
      'Built for orgs with 100-5,000 employees · $10M-$500M revenue',
      '30-minute scoring-call credit with the Aiprosol team (redeem within 90 days)',
    ],
    deliveryFiles: [
      ...MD_HTML('enterprise-ai-readiness-assessment-kit', 'Enterprise-AI-Readiness-Kit'),
      f('private-products/enterprise-readiness-scorecard.xlsx', 'Aiprosol-Enterprise-Readiness-Scorecard.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
      f('private-products/enterprise-vendor-rfp-template.docx', 'Aiprosol-Vendor-RFP-Template.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
      f('private-products/enterprise-90-day-implementation-plan.pptx', 'Aiprosol-90-Day-Implementation-Plan.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'),
    ],
  },

  'ai-tools-stack-starter-kit': {
    whatsInside: [
      'Recommended stack: 14 tools × 7 categories with verdict per pick (this guide)',
      '25 importable n8n integration workflow starters covering the common AI patterns',
      'AI Tools Catalogue: 105 tools curated with CSV + JSON',
      'Budget calculator spreadsheet (monthly cost based on volume)',
      'Migration playbook (integrate alongside existing Zapier/Make/n8n + Salesforce/HubSpot)',
      'Built for 10-50 person businesses',
    ],
    deliveryFiles: [
      ...MD_HTML('ai-tools-stack-starter-kit', 'AI-Tools-Stack-Starter-Kit'),
      f('private-products/tco-calculator.xlsx', 'Aiprosol-TCO-Calculator.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
      f('private-products/ai-tools-catalogue.csv', 'Aiprosol-AI-Tools-Catalogue.csv', 'text/csv'),
      ...n8nAll,
    ],
  },

  'the-playbook-pack': {
    whatsInside: [
      '1. Workflow Automation Playbook + the master n8n starter library',
      '2. Lead Generation Automation Playbook + 7 lead-relevant n8n workflows + Cold Outreach Library',
      '3. 30-Day Business Automation Challenge',
      '25 importable n8n workflows shared across the three playbooks',
      'Cold Outreach Library bonus (8 patterns with full templates + reply-rate baselines)',
      'Bundle saves $74 vs buying separately ($271 total)',
    ],
    deliveryFiles: [
      ...MD_HTML('the-playbook-pack', 'Playbook-Pack-README'),
      ...MD_HTML('workflow-automation-playbook', 'Workflow-Automation-Playbook'),
      ...MD_HTML('lead-generation-automation-playbook', 'Lead-Generation-Automation-Playbook'),
      ...MD_HTML('30-day-business-automation-challenge', '30-Day-Automation-Challenge'),
      ...MD_HTML('cold-outreach-library', 'Cold-Outreach-Library'),
      ...n8nAll,
    ],
  },

  // ── Pre-order products: add expected ship date + honest scope ────────

  'the-agency-launch-bundle': {
    expectedShipDate: '2026-Q3',
    shortDescription: 'Pre-order · Expected Q3 2026 · Delivery toolkit for AI automation agencies: proposals, SOWs, runbooks, white-label assets, ops SOPs.',
  },

  'the-complete-vault': {
    expectedShipDate: '2026-Q4',
    shortDescription: 'Pre-order · Expected Q4 2026 · Every Aiprosol self-serve product bundled. Quarterly refreshes for 12 months. Private buyer Slack.',
  },

  'ai-workflow-architecture-masterclass': {
    expectedShipDate: '2026-Q3',
    shortDescription: 'Pre-order · Expected Q3 2026 · 5-hour video course on AI workflow architecture. 10 modules, worksheets, group office hours, alumni Slack.',
  },

  'the-ai-automation-agency-starter-pack': {
    expectedShipDate: '2026-Q4',
    shortDescription: 'Pre-order · Expected Q4 2026 · Build an AI automation agency: discovery scripts, proposal templates, pricing models, SOPs, financial models, marketing playbook.',
  },
};

// Apply updates
let modified = 0;
for (const p of products) {
  if (updates[p.slug]) {
    const u = updates[p.slug];
    if (u.price !== undefined) p.price = u.price;
    if (u.shortDescription !== undefined) p.shortDescription = u.shortDescription;
    if (u.whatsInside !== undefined) p.whatsInside = u.whatsInside;
    if (u.deliveryFiles !== undefined) p.deliveryFiles = u.deliveryFiles;
    if (u.expectedShipDate !== undefined) p.expectedShipDate = u.expectedShipDate;
    modified++;
  }
}

fs.writeFileSync(PATH, JSON.stringify(products, null, 2) + '\n');

// Verify integrity
let totalRefs = 0, ok = 0, missing = 0;
for (const p of products) {
  if (Array.isArray(p.deliveryFiles)) {
    for (const f of p.deliveryFiles) {
      totalRefs++;
      if (fs.existsSync(f.path)) ok++;
      else { missing++; console.log(`  MISSING ${p.slug} → ${f.path}`); }
    }
  }
}
console.log(`Updated ${modified} of ${products.length} products.`);
console.log(`File refs: ${ok}/${totalRefs} exist, ${missing} missing.`);
console.log();
console.log('Per-product summary:');
for (const p of products) {
  const fc = Array.isArray(p.deliveryFiles) ? p.deliveryFiles.length : 0;
  const ship = p.expectedShipDate ? ` · ship:${p.expectedShipDate}` : '';
  console.log(`  ${p.slug.padEnd(50)} \$${String(p.price).padEnd(4)} ${fc}f${ship}`);
}
