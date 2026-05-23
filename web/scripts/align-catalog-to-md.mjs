// Align catalog whatsInside[] to match the user-edited MD claims.
// The MDs are the source of truth post-purchase; the catalog must not
// over-promise relative to them.

import fs from 'node:fs';
const PATH = './src/content/products.json';
const products = JSON.parse(fs.readFileSync(PATH, 'utf8'));

const updates = {
  'workflow-automation-playbook': {
    whatsInside: [
      '7 core patterns documented (Linear, Branching, Fan-out, Scheduled, Polling, Approval, Long-running)',
      '5 anti-patterns to avoid (Stack of band-aids, Mystery monolith, Set-and-forget, AI-as-trigger, Silent automation)',
      '10 importable n8n workflow JSON files — carefully-built v1 starters covering the 7 patterns',
      '15 additional n8n scaffolds in the same folder (bonus library you can extend)',
      'Operator\'s checklist: 23 questions to ask before shipping',
      'Migration map: manual process → automated workflow in 6 steps',
      'Build vs buy vs service decision framework',
      'Tool selection grid (Zapier vs Make vs n8n by volume + shape)',
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
      '4 lead-relevant n8n workflow starters (form-score-route, AE prep, hot-lead SLA, intent classifier)',
      'You\'re paying for the system, not 12 prebuilt workflows — patterns extend to your stack',
    ],
  },

  'global-business-automation-starter-pack': {
    whatsInside: [
      '5-step process audit framework (the one we use with Enterprise clients)',
      '30+ workflow blueprints documented across 6 areas',
      '10 importable n8n workflow starters covering the 7 core patterns',
      '15 additional n8n scaffolds in the same folder (bonus library to extend)',
      'Zapier vs Make vs n8n cost comparison spreadsheet',
      'Integration architecture mental model',
      '30-day onboarding checklist',
    ],
  },

  'ai-tools-stack-starter-kit': {
    whatsInside: [
      'Recommended stack: 14 tools × 7 categories with verdict per pick',
      '10 importable n8n integration workflow starters (Slack→AI→Notion, Gmail→Claude→Calendar, Stripe→LLM→CS, etc.)',
      '15 additional n8n scaffolds in the same folder for extension',
      'AI Tools Catalogue: 105 tools curated with CSV + JSON',
      'Budget calculator spreadsheet (monthly cost based on volume)',
      'Migration playbook (integrate alongside existing Zapier/Make/n8n + Salesforce/HubSpot)',
      'Built for 10-50 person businesses',
    ],
  },

  'the-playbook-pack': {
    whatsInside: [
      '1. Workflow Automation Playbook (full framework + n8n starter library)',
      '2. Lead Generation Automation Playbook (scoring + sequences + routing system)',
      '3. 30-Day Business Automation Challenge (30 daily exercises)',
      'Cold Outreach Library bonus (8 patterns with full templates + reply-rate baselines)',
      '10 importable n8n workflow starters demonstrating the 7 core patterns',
      '15 additional n8n scaffolds in the same folder for extension',
      'Bundle saves $74 vs buying separately ($271 total)',
    ],
  },

  '30-day-business-automation-challenge': {
    whatsInside: [
      '30 daily 15-25 minute recipes with success criteria + pitfalls',
      'Week 1: Foundation (control panel, Stripe log, Gmail classifier, CRM auto-create)',
      'Week 2: Sales + Customer (attribution, no-show prevention, follow-ups, renewals)',
      'Week 3: Operations (invoices, expenses, content, action items, weekly review)',
      'Week 4: Compounding (research, feedback, monitoring, hiring, annual review)',
      '10 importable n8n workflow starters + 15 additional scaffolds in the same folder',
      'Self-paced — work at your own speed, no time pressure',
    ],
  },

  'chatgpt-business-prompt-vault': {
    whatsInside: [
      '200 production-tested prompts in JSON + CSV + indexed Markdown',
      'Plus 76 inline prompts grouped in the printable MD/HTML guide',
      'Sales (40 in JSON / 15 in MD): outreach, discovery, follow-ups, objections, negotiation, linkedin',
      'Marketing (40 / 15): content, campaigns, email, landing pages, ads, social, SEO, video, podcast',
      'Operations (30 / 12): SOPs, meetings, decisions, status, vendors, onboarding, incidents, playbooks',
      'Finance (25 / 10) · People/HR (25 / 12) · Product (20) · Engineering (20) · CS (12)',
      'Structured JSON: id, category, subcategory, title, system, user_template, best_model, notes',
    ],
  },

  'the-ai-tools-vault': {
    whatsInside: [
      '105 AI tools curated by Aiprosol (v1 — refreshed quarterly to 200+)',
      '23 categories covered (Conversational AI, Code, Image, Video, Voice, RAG, no-code, etc.)',
      'Per-tool fields: category, summary, pricing, verdict (PICK/GOOD/WATCH/AVOID/GEM), notes',
      'CSV + JSON formats for spreadsheet + programmatic use',
      'ChatGPT Business Prompt Vault included (200 prompts in JSON + 76 inline)',
      '20+ Hidden Gems list with rationale',
      '4 Avoid categories list (categorical, not vendor-specific)',
      'Quarterly refresh via email subscription (free for buyers)',
    ],
  },

  'the-complete-vault': {
    // pre-order — bring honest numbers
    whatsInside: [
      'Every standalone Aiprosol product bundled (toolkits, templates, playbooks, guides, challenges)',
      '~280 ChatGPT business prompts (200 JSON + 76 inline) + 105 AI tools catalogue',
      '25 importable n8n workflows (10 starters + 15 scaffolds) across the playbook bundle',
      'Documented Zapier + Make recipe library (50 patterns, documentation-first)',
      '30 day-by-day implementation recipes (Automation Challenge)',
      'Enterprise readiness scorecard + RFP + 90-day plan (Enterprise Kit)',
      'Quarterly refresh deliveries auto-emailed for 12 months',
      'Private vault-holder Slack + first-access to new products',
    ],
  },
};

// Apply
let modified = 0;
for (const p of products) {
  if (updates[p.slug]) {
    if (updates[p.slug].whatsInside) p.whatsInside = updates[p.slug].whatsInside;
    modified++;
  }
}

fs.writeFileSync(PATH, JSON.stringify(products, null, 2) + '\n');

// Final integrity verification
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
console.log(`Updated ${modified} products.`);
console.log(`File refs: ${ok}/${totalRefs} exist · ${missing} missing.`);
console.log();
console.log('Final per-product summary:');
for (const p of products) {
  const fc = Array.isArray(p.deliveryFiles) ? p.deliveryFiles.length : 0;
  const ship = p.expectedShipDate ? ` · ship:${p.expectedShipDate}` : '';
  console.log(`  ${p.slug.padEnd(50)} \$${String(p.price).padEnd(4)} ${fc}f${ship}`);
}
