// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · ROI calculation engine (pure JS, isomorphic)
// Used by the audit form (client) AND the API route (server) so the
// formula has a single source of truth. Ported from
// build/07-backend-functions/calcROI.web.js.
// ─────────────────────────────────────────────────────────────────────────

export type Tier = 'Digital' | 'Plan' | 'Enterprise';

export interface CalcROIInput {
  employees?: number | string;
  manualHoursPerWeek?: number | string;
  hourlyCost?: number | string;
  monthlyRevenue?: string;
  industry?: string;
  primaryChallenge?: string;
  automationExperience?: string;
}

export interface CalcROIResult {
  tier: Tier;
  planRec: string;
  productRec: string;            // human-readable: "Lead Generation Automation Playbook · $127"
  productRecSlug: string;        // canonical slug for /products/[slug] linking + card render
  productUpsellSlug: string | null; // next-tier-up bundle; null if no clean upsell exists
  productRecReason: string;      // 1-line reasoning: why this product for this respondent
  weeklyHrs: number;
  annualSaving: number;
  annualPlan: number;
  roi: number | null;
  payback: number | null;
  score: number;
  industryNote: string;
}

const INDUSTRY_NOTES: Record<string, string> = {
  Legal: 'Contract review automation typically reclaims 32–45 partner hours/week.',
  'Real Estate': 'Lead response automation drops time-to-contact from hours to minutes.',
  Manufacturing: 'Vision + telemetry pipelines cut defect rates by 60–85%.',
  Retail: 'Demand prediction reduces stockouts by 60–75%.',
  'E-commerce': 'Customer intelligence + cart automation typically lifts revenue 18–25%.',
  'Financial Services': 'Document processing at 99%+ accuracy with full audit trail.',
  Healthcare: 'Patient intake + records automation; HIPAA-grade architecture.',
  SaaS: 'Lead scoring + churn prediction; ICP-aligned outbound.',
  'Professional Services': 'Workflow + scheduling + comms automation reclaims 25–35 hrs/week.',
};

const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

export function calcROI(input: CalcROIInput): CalcROIResult {
  const employees = num(input.employees);
  const manualHours = num(input.manualHoursPerWeek);
  const hourlyCost = num(input.hourlyCost);
  const monthlyRevenue = String(input.monthlyRevenue ?? '');
  const industry = String(input.industry ?? '');
  const challenge = String(input.primaryChallenge ?? '');
  const experience = String(input.automationExperience ?? '');

  // Savings — roughly 70% of repetitive manual hours are automatable.
  const weeklyHrs = Math.round(manualHours * 0.7);
  const annualSaving = Math.round(weeklyHrs * hourlyCost * 50);

  // Tier (locked from Master Blueprint)
  let tier: Tier;
  if (employees < 10 || monthlyRevenue === 'Under $5k') {
    tier = 'Digital';
  } else if (
    employees > 200 ||
    monthlyRevenue === '$500k+' ||
    monthlyRevenue === '$100k – $500k'
  ) {
    tier = 'Enterprise';
  } else {
    tier = 'Plan';
  }

  let planCost = 0;
  let planRec = 'Self-serve products only';
  if (tier === 'Plan') {
    planCost = employees >= 50 ? 2997 : 997;
    planRec = employees >= 50 ? 'Growth — $2,997/mo' : 'Starter — $997/mo';
  } else if (tier === 'Enterprise') {
    planCost = 7997;
    planRec = 'Enterprise — $7,997/mo';
  }

  const annualPlan = planCost * 12;
  const roi = annualPlan > 0 ? Math.round((annualSaving / annualPlan) * 100) : null;
  const payback =
    annualPlan > 0 && annualSaving > 0
      ? Math.max(1, Math.round((annualPlan / annualSaving) * 52))
      : null;

  // Lead score (0–100)
  let score = 30;
  if (employees >= 10) score += 20;
  if (employees >= 50) score += 15;
  if (monthlyRevenue === '$100k – $500k') score += 15;
  if (monthlyRevenue === '$500k+') score += 25;
  if (manualHours >= 30) score += 10;
  if (challenge.length > 20) score += 5;
  if (experience === 'None — starting from scratch') score += 5;

  // Industry-fit multiplier — these segments have clear case-study ROI
  // and shorter time-to-close based on our positioning materials.
  // The multiplier is additive (not multiplicative) so the score stays
  // capped at 100 and the base-fit factors above still dominate.
  const HOT_INDUSTRIES = new Set(['Legal', 'Financial Services', 'SaaS', 'Real Estate']);
  const WARM_INDUSTRIES = new Set(['Professional Services', 'E-commerce', 'Healthcare']);
  if (HOT_INDUSTRIES.has(industry)) score += 10;
  else if (WARM_INDUSTRIES.has(industry)) score += 5;

  score = Math.min(100, score);

  // ─── Product recommendation engine ──────────────────────────────────────
  // Returns the catalogue slug so the UI can render a real product card
  // (price, link, outcome metrics) instead of a hard-coded label.
  //
  // Routing rules:
  // 1. Industry-led overrides FIRST — they win even at lower tiers because
  //    the product is sharper than the generic tier default.
  // 2. Tier-led defaults — the broad recommendation for each band.
  // 3. Upsell — the next bundle up from the primary. Skipped when the
  //    primary already IS the top recommendation for that tier.
  let productRecSlug: string;
  let productRecReason: string;
  let productUpsellSlug: string | null = null;

  // Industry-led overrides (only override the Digital tier — at higher tiers,
  // industry shapes the upsell, not the primary)
  if (tier === 'Digital') {
    if (industry === 'Real Estate' || industry === 'SaaS' || industry === 'Financial Services') {
      productRecSlug = 'lead-generation-automation-playbook';
      productRecReason = `Sub-3-min response is the highest-leverage starting move in ${industry}.`;
      productUpsellSlug = 'the-playbook-pack';
    } else if (industry === 'Manufacturing' || industry === 'Healthcare') {
      productRecSlug = 'business-process-audit-checklist';
      productRecReason = `Process audit first — ${industry} workflows need rigorous documentation before automation.`;
      productUpsellSlug = 'global-business-automation-starter-pack';
    } else {
      productRecSlug = 'business-process-audit-checklist';
      productRecReason = 'Start with the audit — find the highest-leverage process before building anything.';
      productUpsellSlug = 'the-starter-bundle';
    }
  } else if (tier === 'Plan' && employees < 50) {
    productRecSlug = 'lead-generation-automation-playbook';
    productRecReason = 'Highest payback at your scale — sub-3-min response converts week 1.';
    productUpsellSlug = 'the-playbook-pack';
  } else if (tier === 'Plan') {
    productRecSlug = 'ai-workflow-architecture-masterclass';
    productRecReason = 'At 50+ employees the architecture decisions matter more than the playbooks.';
    productUpsellSlug = 'the-complete-vault';
  } else {
    productRecSlug = 'enterprise-ai-readiness-assessment-kit';
    productRecReason = 'Enterprise scale needs the full readiness audit + vendor RFP grid before commitment.';
    productUpsellSlug = 'the-complete-vault';
  }

  // Build the human-readable label from the catalogue (no hard-coded strings)
  // Hard-coded fallbacks for SSR safety — the audit doesn't import products.json.
  const PRODUCT_LABELS: Record<string, string> = {
    'business-process-audit-checklist': 'Business Process Audit Checklist · $37',
    'lead-generation-automation-playbook': 'Lead Generation Automation Playbook · $127',
    'ai-workflow-architecture-masterclass': 'AI Workflow Architecture Masterclass · $297',
    'enterprise-ai-readiness-assessment-kit': 'Enterprise AI Readiness Assessment Kit · $397',
    'global-business-automation-starter-pack': 'Global Business Automation Starter Pack · $97',
    'the-starter-bundle': 'The Starter Bundle · $79',
    'the-playbook-pack': 'The Playbook Pack · $197',
    'the-complete-vault': 'The Complete Vault · $997',
  };
  const productRec = PRODUCT_LABELS[productRecSlug] ?? productRecSlug;

  return {
    tier,
    planRec,
    productRec,
    productRecSlug,
    productUpsellSlug,
    productRecReason,
    weeklyHrs,
    annualSaving,
    annualPlan,
    roi,
    payback,
    score,
    industryNote: INDUSTRY_NOTES[industry] ?? 'Significant automation potential across multiple workflows.',
  };
}
