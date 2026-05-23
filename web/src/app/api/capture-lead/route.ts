// ─────────────────────────────────────────────────────────────────────────
// POST /api/capture-lead — canonical lead intake
// Replaces backend/captureLead.web.js. Computes the lead score via calcROI,
// persists to Vercel KV (when configured), and fires the Zapier webhook
// (when configured). Falls back to console.log if neither is wired —
// the route never errors solely because storage isn't set up.
// ─────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse, after } from 'next/server';
import { z } from 'zod';
import { calcROI } from '@/lib/calc-roi';
import { sendEmail, isResendConfigured } from '@/lib/resend';
import { roiReportHtml, roiReportText, roiReportSubject } from '@/lib/emails/roi-report';
import { isSupabaseConfigured, requireSupabaseAdmin } from '@/lib/db/supabase';
import { draftLeadReply } from '@/lib/leads/draft-reply';

// Node runtime so we can call Resend + Supabase without edge restrictions.
export const runtime = 'nodejs';

// Public endpoint — no sign-in required. ROI Audit, exit-intent, newsletter,
// contact form, and chat all post here anonymously. The visitor's submitted
// email is the canonical record. If they later sign in, we link by email.
const LeadSchema = z.object({
  name: z.string().min(1, 'Name required').max(120),
  email: z.string().email('Invalid email').max(200),
  company: z.string().max(120).optional().default(''),
  employees: z.union([z.string(), z.number()]).optional().default(0),
  industry: z.string().max(80).optional().default(''),
  monthlyRevenue: z.string().max(60).optional().default(''),
  manualHoursPerWeek: z.union([z.string(), z.number()]).optional().default(0),
  hourlyCost: z.union([z.string(), z.number()]).optional().default(0),
  primaryChallenge: z.string().max(400).optional().default(''),
  automationExperience: z.string().max(120).optional().default(''),
  source: z.string().max(60).optional().default('Unknown'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LeadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid lead payload', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const roi = calcROI(data);
    const leadId = crypto.randomUUID();
    const capturedAt = new Date().toISOString();

    const record = {
      leadId,
      capturedAt,
      fullName: data.name,
      email: data.email,
      companyName: data.company,
      companySize: Number(data.employees) || 0,
      industry: data.industry,
      monthlyRevenue: data.monthlyRevenue,
      manualHoursPerWeek: Number(data.manualHoursPerWeek) || 0,
      avgHourlyCost: Number(data.hourlyCost) || 0,
      primaryChallenge: data.primaryChallenge,
      automationExperience: data.automationExperience,
      leadStatus: `New Lead — ${data.source}`,
      leadScore: roi.score,
      tier: roi.tier,
      recommendedPlan: roi.planRec,
      recommendedProducts: roi.productRec,
      annualSavingProjection: roi.annualSaving,
      weeklyHoursReclaimable: roi.weeklyHrs,
      source: data.source,
    };

    // ─── Persist to Supabase `leads` table ───
    // This is the canonical lead store. The KV path below is kept as a
    // legacy fallback for projects without Supabase configured.
    try {
      if (isSupabaseConfigured()) {
        const db = requireSupabaseAdmin();
        const productList = Array.isArray(roi.productRec) ? roi.productRec.join(', ') : String(roi.productRec ?? '');
        const { error: supaErr } = await db.from('leads').insert({
          id: leadId,
          name: record.fullName,
          email: record.email,
          company: record.companyName || null,
          industry: record.industry || null,
          employees: record.companySize || null,
          monthly_revenue: record.monthlyRevenue || null,
          manual_hours_per_week: record.manualHoursPerWeek || null,
          avg_hourly_cost: record.avgHourlyCost || null,
          challenge: record.primaryChallenge || null,
          experience: record.automationExperience || null,
          recommended_plan: record.recommendedPlan || null,
          recommended_products: productList,
          status: 'new',
          source: record.source || null,
          score: record.leadScore || 0,
        });
        if (supaErr) {
          console.warn('[capture-lead] Supabase insert failed (non-blocking):', supaErr.message);
        }
      }
    } catch (supaErr) {
      console.warn('[capture-lead] Supabase insert threw (non-blocking):', supaErr);
    }

    // ─── Legacy KV path (kept for backwards-compat) ───
    try {
      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        await fetch(`${process.env.KV_REST_API_URL}/set/lead:${leadId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.KV_REST_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(record),
        });
      }
    } catch (kvErr) {
      console.warn('[capture-lead] KV write failed (non-blocking):', kvErr);
    }

    // ─── Fire CRO agent to draft a personalised reply (post-response) ───
    // Don't block the form response on this — drafting takes ~2-3s.
    // The draft lands in outreach_drafts for /studio approval.
    // `after()` keeps the function alive past the response so the work
    // actually completes on Vercel serverless (void-async would be killed).
    after(async () => {
      try {
        const result = await draftLeadReply({
          leadId,
          name: record.fullName,
          email: record.email,
          company: record.companyName,
          industry: record.industry,
          employees: record.companySize,
          manualHoursPerWeek: record.manualHoursPerWeek,
          hourlyCost: record.avgHourlyCost,
          primaryChallenge: record.primaryChallenge,
          automationExperience: record.automationExperience,
          source: data.source,
          tier: roi.tier,
          planRec: roi.planRec,
          productRec: roi.productRec,
          annualSaving: roi.annualSaving,
          weeklyHrs: roi.weeklyHrs,
          score: roi.score,
        });
        if (result.ok) {
          console.log('[capture-lead] CRO draft queued:', result.outreachDraftId, '·', result.subject);
        } else {
          console.warn('[capture-lead] CRO draft failed:', result.error);
        }
      } catch (err) {
        console.warn('[capture-lead] CRO draft threw:', err);
      }
    });

    // ─── Fire Zapier webhook when configured ───
    try {
      if (process.env.ZAPIER_LEAD_WEBHOOK) {
        await fetch(process.env.ZAPIER_LEAD_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...record, ...roi }),
        });
      }
    } catch (zapErr) {
      console.warn('[capture-lead] Zapier webhook failed (non-blocking):', zapErr);
    }

    // ─── Send the ROI Report email when source is the audit ───
    if (data.source === 'ROI Audit' && isResendConfigured()) {
      try {
        const firstName = data.name.split(' ')[0] || 'there';
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aiprosol.com';
        const emailInput = { firstName, email: data.email, result: roi, siteUrl };
        await sendEmail({
          to: data.email,
          subject: roiReportSubject(emailInput),
          html: roiReportHtml(emailInput),
          text: roiReportText(emailInput),
          tags: [
            { name: 'category', value: 'roi-report' },
            { name: 'tier', value: roi.tier },
          ],
        });
      } catch (emailErr) {
        console.warn('[capture-lead] ROI report email failed (non-blocking):', emailErr);
      }
    }

    // Always log so you can see leads in `vercel logs` even pre-KV
    console.log('[capture-lead]', {
      email: record.email,
      tier: record.tier,
      score: record.leadScore,
    });

    return NextResponse.json(
      {
        leadId,
        capturedAt,
        ...roi,
      },
      {
        status: 201,
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  } catch (err) {
    console.error('[capture-lead] error', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Lead capture failed' },
      { status: 500 },
    );
  }
}
