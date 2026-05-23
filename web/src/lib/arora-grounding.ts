// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · ARORA — live grounding for the chat widget
// Pulls compact "what's true right now" facts from Supabase so Arora can
// reference real pipeline state when a visitor asks. Cached for 60s
// in-memory so back-to-back chats don't hammer the DB.
// ─────────────────────────────────────────────────────────────────────────

import { isSupabaseConfigured, requireSupabaseAdmin } from '@/lib/db/supabase';
import { readKpiTimeseries } from '@/lib/agents/kpi-rollup';

type Grounding = {
  fetchedAt: number;
  text: string;
};

let CACHE: Grounding | null = null;
const TTL_MS = 60_000;

export async function getAroraGrounding(): Promise<string> {
  if (CACHE && Date.now() - CACHE.fetchedAt < TTL_MS) {
    return CACHE.text;
  }
  const text = await buildGrounding();
  CACHE = { fetchedAt: Date.now(), text };
  return text;
}

async function buildGrounding(): Promise<string> {
  if (!isSupabaseConfigured()) {
    return [
      '# LIVE PIPELINE CONTEXT',
      '_(Supabase not configured — answer from static knowledge only.)_',
    ].join('\n');
  }

  try {
    const db = requireSupabaseAdmin();

    const [leadsCount24h, draftsOpen, postsQueued, partnersTotal, sopsTotal, latestDigest, kpis] = await Promise.all([
      db.from('leads').select('id', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 24 * 3600_000).toISOString()),
      db.from('outreach_drafts').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
      db.from('linkedin_posts').select('id', { count: 'exact', head: true }).in('status', ['draft', 'scheduled']),
      db.from('affiliate_partners').select('id', { count: 'exact', head: true }),
      db.from('sops').select('id', { count: 'exact', head: true }),
      db.from('daily_digest').select('day, subject, items_count, alerts_count').order('day', { ascending: false }).limit(1).maybeSingle(),
      readKpiTimeseries(2),
    ]);

    const lines: string[] = [];
    lines.push('# LIVE PIPELINE CONTEXT (snapshot from Supabase)');
    lines.push(`Updated: ${new Date().toISOString()}`);
    lines.push('');
    lines.push('## What\'s in our system right now');
    lines.push(`- New leads (last 24h): ${leadsCount24h.count ?? 0}`);
    lines.push(`- Outreach drafts awaiting send: ${draftsOpen.count ?? 0}`);
    lines.push(`- LinkedIn posts queued: ${postsQueued.count ?? 0}`);
    lines.push(`- Affiliate partners in pipeline: ${partnersTotal.count ?? 0}`);
    lines.push(`- Playbooks (SOPs) we operate from: ${sopsTotal.count ?? 0}`);

    if (latestDigest.data) {
      lines.push('');
      lines.push('## Yesterday\'s digest headline');
      lines.push(`- ${latestDigest.data.day}: ${latestDigest.data.subject}`);
    }

    if (kpis.length) {
      const movers = kpis.filter((k) => k.delta !== 0).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 4);
      if (movers.length) {
        lines.push('');
        lines.push('## What moved today (day-over-day)');
        for (const k of movers) {
          const sym = k.delta > 0 ? '↑' : '↓';
          lines.push(`- ${k.metric}: ${k.latest}${k.unit ? ' ' + k.unit : ''} (${sym}${k.delta > 0 ? '+' : ''}${k.delta})`);
        }
      }
    }

    lines.push('');
    lines.push('## How to use this');
    lines.push('- If a visitor asks "are you actually using AI?" — yes, all 10 agents above run automatically.');
    lines.push('- If they ask "how many leads do you have?" — share the new-leads-24h number above, not a made-up one.');
    lines.push('- If they ask "what\'s in your content pipeline?" — reference the LinkedIn posts queued number.');
    lines.push('- Never invent specific company names, dollar figures, or case studies that aren\'t in this context.');
    lines.push('- These numbers are SMALL — we\'re early. Be honest about that. "We\'re early — that\'s why I can give you a free ROI audit" beats inventing fake traction.');

    return lines.join('\n');
  } catch (err) {
    console.warn('[arora-grounding] failed:', err);
    return '# LIVE PIPELINE CONTEXT\n_(data fetch failed — fall back to static knowledge.)_';
  }
}
