// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · LEADS · draft-reply
// When a lead lands via /api/capture-lead, this helper:
//   1. Calls Groq with a focused prompt to draft a personalised reply
//   2. Writes the result into outreach_drafts with a back-reference to the lead
//
// Fire-and-forget pattern: the form returns immediately, the draft is
// generated in the background. /studio surfaces the draft for the user
// to approve + send manually (until Gmail send is wired).
// ─────────────────────────────────────────────────────────────────────────

import { isSupabaseConfigured, requireSupabaseAdmin } from '@/lib/db/supabase';

type LeadInput = {
  leadId: string;
  name: string;
  email: string;
  company: string;
  industry: string;
  employees: number;
  manualHoursPerWeek: number;
  hourlyCost: number;
  primaryChallenge: string;
  automationExperience: string;
  source: string;
  // From calcROI
  tier: string;
  planRec: string;
  productRec: string[] | string;
  annualSaving: number | string;
  weeklyHrs: number | string;
  score: number;
};

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.1-8b-instant'; // 8b is plenty for single-email drafting

const SYSTEM_PROMPT = `You are the CRO, Aiprosol's AI Chief Revenue Officer. Your job right now is to draft a personalised follow-up email to a lead who just submitted the ROI Audit form.

# RULES
- Address the lead by first name only.
- Reference 2-3 SPECIFIC numbers from their submission (hours saved, projected $ saving, their industry).
- Recommend the specific plan/products that Aiprosol calculated for them.
- Open with the SINGLE biggest opportunity you see in their data.
- End with a clear next step: book a 30-min discovery call (link: https://calendly.com/srijanpaudel219/30min) OR start with a self-serve product link.
- Voice: warm, direct, like a trusted advisor who's already done the work.
- Length: 120-200 words. Never longer.
- Currency: USD ($), never £ or anything else.
- Sign-off: "Srijan / Aiprosol — AI Automation Consultancy"
- Do NOT promise specific outcomes (their numbers vary). Reference the AVERAGE from the ROI engine.

# OUTPUT FORMAT
Return ONLY a JSON object with this exact shape:
{
  "subject": "subject line under 60 chars, personalised with their company name",
  "body": "the email body (with \\n line breaks, no HTML tags)"
}
No prose before or after the JSON.`;

export type DraftReplyResult = {
  ok: boolean;
  outreachDraftId?: string;
  subject?: string;
  bodyPreview?: string;
  error?: string;
};

export async function draftLeadReply(lead: LeadInput): Promise<DraftReplyResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return { ok: false, error: 'GROQ_API_KEY not configured' };
  }
  if (!isSupabaseConfigured()) {
    return { ok: false, error: 'Supabase not configured' };
  }

  const userMsg = `# NEW LEAD JUST SUBMITTED THE ROI AUDIT — DRAFT A FOLLOW-UP

## Lead details
- Name: ${lead.name}
- Email: ${lead.email}
- Company: ${lead.company || '(not provided)'}
- Industry: ${lead.industry || '(not provided)'}
- Team size: ${lead.employees} employees
- Manual hours per week: ${lead.manualHoursPerWeek}
- Average hourly cost: $${lead.hourlyCost}
- Their primary challenge: ${lead.primaryChallenge || '(none stated)'}
- Automation experience: ${lead.automationExperience || '(not stated)'}
- Source: ${lead.source}

## Aiprosol's recommendation (computed)
- Lead tier: ${lead.tier}
- Recommended plan: ${lead.planRec}
- Recommended products: ${Array.isArray(lead.productRec) ? lead.productRec.join(', ') : lead.productRec}
- Projected annual saving: $${lead.annualSaving}
- Projected weekly hours reclaimable: ${lead.weeklyHrs}
- Lead score (0-100): ${lead.score}

Draft the reply email now in JSON.`;

  // Call Groq
  let subject: string;
  let body: string;
  try {
    const res = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL_LEAD_REPLY || DEFAULT_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMsg },
        ],
        temperature: 0.55,
        max_tokens: 700,
        response_format: { type: 'json_object' },
      }),
    });
    if (!res.ok) {
      return { ok: false, error: `Groq HTTP ${res.status}: ${(await res.text()).slice(0, 200)}` };
    }
    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = json.choices?.[0]?.message?.content;
    if (!content) return { ok: false, error: 'Groq returned empty content' };
    const parsed = JSON.parse(content) as { subject?: string; body?: string };
    if (!parsed.subject || !parsed.body) {
      return { ok: false, error: 'LLM JSON missing subject or body' };
    }
    subject = String(parsed.subject).slice(0, 200);
    body = String(parsed.body);
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }

  // Write to outreach_drafts
  try {
    const db = requireSupabaseAdmin();
    const { data, error } = await db
      .from('outreach_drafts')
      .insert({
        channel: 'gmail',
        target_segment: 'new_lead_followup',
        subject,
        body,
        status: 'draft',
        notion_id: `lead:${lead.leadId}`, // reuse notion_id field as back-reference
      })
      .select('id')
      .maybeSingle();
    if (error) {
      return { ok: false, error: `Supabase insert failed: ${error.message}` };
    }
    return {
      ok: true,
      outreachDraftId: data?.id,
      subject,
      bodyPreview: body.slice(0, 120),
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
