// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · backend/captureLead.web.js
// One entry point for every lead intake (ROI form, contact form,
// newsletter, exit-intent). Computes the score via calcROI, writes to the
// `leads` CMS collection, and fires the Zapier webhook for the email
// follow-up sequence.
//
// Required Wix Secrets:
//   - ZAPIER_LEAD_WEBHOOK  → optional · POST URL of the Zapier "New Lead" zap
// ─────────────────────────────────────────────────────────────────────────

import wixData from 'wix-data';
import { fetch } from 'wix-fetch';
import { getSecret } from 'wix-secrets-backend';
import { calcROI } from 'backend/calcROI.web';

/**
 * @param {object} input
 * @param {string} input.name
 * @param {string} input.email
 * @param {string} [input.company]
 * @param {number|string} [input.employees]
 * @param {string} [input.industry]
 * @param {string} [input.monthlyRevenue]
 * @param {number|string} [input.manualHoursPerWeek]
 * @param {number|string} [input.hourlyCost]
 * @param {string} [input.primaryChallenge]
 * @param {string} [input.automationExperience]
 * @param {string} [input.source]   "ROI Audit" | "Contact" | "Newsletter" | "Exit Intent"
 * @returns {Promise<{ leadId: string, ...calcROIResult }>}
 */
export async function captureLead(input) {
  if (!input || !input.email || !input.name) {
    throw new Error('captureLead: name and email are required');
  }
  if (!/\S+@\S+\.\S+/.test(input.email)) {
    throw new Error('captureLead: invalid email');
  }

  // Compute the ROI projection + lead score (used as the canonical scoring)
  const roi = await calcROI(input);

  // Build the CMS record — keep field names aligned with the existing
  // `leads` schema and the 7 fields added in the previous session.
  const record = {
    fullName: input.name,
    email: input.email,
    companyName: input.company || '',
    companySize: Number(input.employees) || 0,
    industry: input.industry || '',
    monthlyRevenue: input.monthlyRevenue || '',
    manualHoursPerWeek: Number(input.manualHoursPerWeek) || 0,
    avgHourlyCost: Number(input.hourlyCost) || 0,
    primaryChallenge: input.primaryChallenge || '',
    automationExperience: input.automationExperience || '',
    leadStatus: input.source ? `New Lead — ${input.source}` : 'New Lead',
    leadScore: roi.score,
    tier: roi.tier,
    recommendedPlan: roi.planRec,
    recommendedProducts: roi.productRec,
    annualSavingProjection: roi.annualSaving,
    weeklyHoursReclaimable: roi.weeklyHrs,
  };

  const inserted = await wixData.insert('leads', record, { suppressAuth: true });

  // Fire the Zapier webhook (best-effort — never blocks the response)
  try {
    const webhook = await getSecret('ZAPIER_LEAD_WEBHOOK').catch(() => null);
    if (webhook) {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...record, ...roi, leadId: inserted._id }),
      });
    }
  } catch (err) {
    console.warn('Zapier webhook delivery failed (non-blocking):', err?.message);
  }

  return { leadId: inserted._id, ...roi };
}
