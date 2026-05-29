// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · STUDIO — autonomous revenue loop
// Inbound-first: every new ROI-audit lead gets a warm, personalized follow-up
// DRAFTED automatically (CRO persona via the LLM) into outreach_drafts. Those
// then surface in the Decision Inbox for one-tap send. Idempotent — a lead that
// already has a follow-up draft is skipped. NOT cold spam: these people came to
// us via the free audit.
// ─────────────────────────────────────────────────────────────────────────

import { isSupabaseConfigured, requireSupabaseAdmin } from '@/lib/db/supabase';
import { availableProviders, getProvider } from '@/lib/assistant/providers';

const CRO_FOLLOWUP_SYSTEM = `You are Aiprosol's CRO writing ONE warm, high-trust follow-up email to someone who just completed our free ROI automation audit. Aiprosol is a global, self-serve-first AI automation company — honest, specific, never salesy or generic, no hype. Reference their actual audit numbers naturally. We are early/pre-revenue — be genuine, not boastful. End with a single soft CTA (reply, or grab a short call). 90–150 words. This is NOT cold outreach — they came to us.`;

export async function draftFollowupsForNewLeads(limit = 5): Promise<{ drafted: number; skipped: number }> {
  if (!isSupabaseConfigured()) return { drafted: 0, skipped: 0 };
  const providers = availableProviders();
  if (!providers.length) return { drafted: 0, skipped: 0 };
  // Groq is fast + cheap for drafting; prefer it, fall back to whatever's set.
  const provider = getProvider(providers.find((p) => p.id === 'groq')?.id ?? providers[0].id);
  const db = requireSupabaseAdmin();

  const since = new Date(Date.now() - 7 * 24 * 3600_000).toISOString();
  const { data: leadRows } = await db
    .from('leads')
    .select('id, name, email, company, industry, employees, monthly_revenue, manual_hours_per_week, avg_hourly_cost, status, score, created_at')
    .gte('created_at', since)
    .order('score', { ascending: false })
    .limit(limit * 4);

  const leads = (leadRows ?? []).filter((l) => l.email && !['won', 'lost', 'dead'].includes(l.status));
  if (!leads.length) return { drafted: 0, skipped: 0 };

  // Skip leads that already have a follow-up draft (linked via notion_id=lead:<id>).
  const keys = leads.map((l) => `lead:${l.id}`);
  const { data: existing } = await db.from('outreach_drafts').select('notion_id').in('notion_id', keys);
  const have = new Set((existing ?? []).map((e) => e.notion_id));
  const todo = leads.filter((l) => !have.has(`lead:${l.id}`)).slice(0, limit);

  let drafted = 0;
  let skipped = 0;
  for (const lead of todo) {
    try {
      const user =
        `Lead: ${lead.name || 'there'} at ${lead.company || 'their company'} (${lead.industry || 'industry n/a'}).\n` +
        `Audit signals — employees: ${lead.employees ?? '?'}, manual hours/week: ${lead.manual_hours_per_week ?? '?'}, ` +
        `avg hourly cost: ${lead.avg_hourly_cost ?? '?'}, monthly revenue: ${lead.monthly_revenue ?? '?'}.\n\n` +
        `Write the follow-up. The FIRST line must be "Subject: <subject>", then a blank line, then the email body.`;
      const res = await provider.send({ system: CRO_FOLLOWUP_SYSTEM, messages: [{ role: 'user', content: user }], tools: [], maxTokens: 500 });
      const text = (res.assistantText || '').trim();
      const m = text.match(/^subject:\s*(.+)$/im);
      const subject = (m ? m[1].trim() : 'Following up on your Aiprosol ROI audit').slice(0, 200);
      const body = (m ? text.replace(/^subject:\s*.+$/im, '').trim() : text).trim();
      if (body.length < 40) { skipped++; continue; }

      const { error } = await db.from('outreach_drafts').insert({
        channel: 'gmail',
        target_segment: 'roi-audit-leads',
        subject,
        body,
        status: 'draft',
        recipient_email: lead.email,
        recipient_name: lead.name ?? null,
        notion_id: `lead:${lead.id}`,
        sent_by: 'cro',
      });
      if (error) { skipped++; continue; }
      drafted++;
    } catch {
      skipped++;
    }
  }
  return { drafted, skipped };
}
