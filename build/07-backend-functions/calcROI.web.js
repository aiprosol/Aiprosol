// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · backend/calcROI.web.js
// Server-side ROI engine. Pure function — no external calls — but lives
// on the backend so frontend code can't drift the formula and so chatbot
// + ROI form + Pricing widget can share one source of truth.
// ─────────────────────────────────────────────────────────────────────────

const INDUSTRY_NOTES = {
  'Legal':              'Contract review automation typically reclaims 32–45 partner hours/week.',
  'Real Estate':        'Lead response automation drops time-to-contact from hours to minutes.',
  'Manufacturing':      'Vision + telemetry pipelines cut defect rates by 60–85%.',
  'Retail':             'Demand prediction reduces stockouts by 60–75%.',
  'E-commerce':         'Customer intelligence + cart automation typically lifts revenue 18–25%.',
  'Financial Services': 'Document processing at 99%+ accuracy with full audit trail.',
  'Healthcare':         'Patient intake + records automation; HIPAA-grade architecture.',
  'SaaS':               'Lead scoring + churn prediction; ICP-aligned outbound.',
  'Professional Services': 'Workflow + scheduling + comms automation reclaims 25–35 hrs/week.',
};

/**
 * Run the ROI calculation and return the canonical result shape.
 * @param {object} input
 * @returns {Promise<{
 *   tier: 'Digital'|'Plan'|'Enterprise',
 *   planRec: string, productRec: string,
 *   weeklyHrs: number, annualSaving: number,
 *   annualPlan: number, roi: number|null, payback: number|null,
 *   score: number, industryNote: string
 * }>}
 */
export async function calcROI(input) {
  const employees       = num(input.employees);
  const manualHours     = num(input.manualHoursPerWeek ?? input.manualHours);
  const hourlyCost      = num(input.hourlyCost ?? input.avgHourlyCost);
  const monthlyRevenue  = String(input.monthlyRevenue || '');
  const industry        = String(input.industry || '');
  const challenge       = String(input.primaryChallenge || '');
  const experience      = String(input.automationExperience || '');

  // ─── Savings ───
  // Roughly 70% of repetitive manual hours are automatable. 50 working
  // weeks/year accounts for holiday + sick.
  const weeklyHrs    = Math.round(manualHours * 0.7);
  const annualSaving = Math.round(weeklyHrs * hourlyCost * 50);

  // ─── Tier (locked from Master Blueprint) ───
  let tier;
  if (employees < 10 || monthlyRevenue === 'Under £5k') {
    tier = 'Digital';
  } else if (employees > 200 || monthlyRevenue === '£500k+' || monthlyRevenue === '£100k – £500k') {
    tier = 'Enterprise';
  } else {
    tier = 'Plan';
  }

  let planCost = 0;
  let planRec = 'Self-serve products only';
  if (tier === 'Plan') {
    planCost = employees >= 50 ? 2997 : 997;
    planRec  = employees >= 50 ? 'Growth — £2,997/mo' : 'Starter — £997/mo';
  } else if (tier === 'Enterprise') {
    planCost = 7997;
    planRec  = 'Enterprise — £7,997/mo';
  }

  const annualPlan = planCost * 12;
  const roi        = annualPlan > 0 ? Math.round((annualSaving / annualPlan) * 100) : null;
  const payback    = (annualPlan > 0 && annualSaving > 0)
    ? Math.max(1, Math.round((annualPlan / annualSaving) * 52))
    : null;

  // ─── Lead score (0–100) ───
  let score = 30;
  if (employees >= 10) score += 20;
  if (employees >= 50) score += 15;
  if (monthlyRevenue === '£100k – £500k') score += 15;
  if (monthlyRevenue === '£500k+') score += 25;
  if (manualHours >= 30) score += 10;
  if (challenge.length > 20) score += 5;
  if (experience === 'None — starting from scratch') score += 5;
  score = Math.min(100, score);

  // ─── Product recommendation by tier ───
  let productRec;
  if (tier === 'Digital') {
    productRec = 'Business Process Audit Checklist · £37';
  } else if (tier === 'Plan' && employees < 50) {
    productRec = 'Lead Generation Automation Playbook · £127';
  } else if (tier === 'Plan') {
    productRec = 'AI Workflow Architecture Masterclass · £297';
  } else {
    productRec = 'Enterprise AI Readiness Assessment Kit · £397';
  }

  return {
    tier, planRec, productRec,
    weeklyHrs, annualSaving,
    annualPlan, roi, payback,
    score,
    industryNote: INDUSTRY_NOTES[industry] || 'Significant automation potential across multiple workflows.',
  };
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}
