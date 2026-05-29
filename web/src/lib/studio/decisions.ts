// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · STUDIO — pending decisions
// Scans Supabase for everything awaiting the operator's call and turns each
// into a decision with one-tap approve/reject URLs (signed action tokens).
// Powers the Decision Inbox email + the in-studio Inbox tab.
// ─────────────────────────────────────────────────────────────────────────

import { isSupabaseConfigured, requireSupabaseAdmin } from '@/lib/db/supabase';
import { signDecisionToken, type DecisionAction } from './action-token';

export type PendingDecision = {
  kind: 'outreach' | 'linkedin' | 'substack' | 'project' | 'task' | 'ops';
  id: string;
  title: string;
  summary: string;
  action: DecisionAction | null; // null → informational (review in studio)
  approveUrl?: string;
  rejectUrl?: string;
  approveToken?: string;
  rejectToken?: string;
  approveLabel?: string;
  rejectLabel?: string;
};

function baseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://aiprosol.com';
}

function urls(action: DecisionAction, id: string) {
  const b = baseUrl();
  const approveToken = signDecisionToken({ a: action, id, d: 'approve' });
  const rejectToken = signDecisionToken({ a: action, id, d: 'reject' });
  return {
    approveToken,
    rejectToken,
    approveUrl: `${b}/api/decide?token=${approveToken}`,
    rejectUrl: `${b}/api/decide?token=${rejectToken}`,
  };
}

const excerpt = (s: string | null | undefined, n = 140) => (s ?? '').replace(/\s+/g, ' ').trim().slice(0, n);

export async function getPendingDecisions(): Promise<PendingDecision[]> {
  if (!isSupabaseConfigured()) return [];
  const db = requireSupabaseAdmin();
  const out: PendingDecision[] = [];

  try {
    const [drafts, posts, projects, reviews, agentsRes] = await Promise.all([
      db.from('outreach_drafts').select('id, subject, body, target_segment, recipient_email').eq('status', 'draft').order('created_at', { ascending: false }).limit(10),
      db.from('linkedin_posts').select('id, title, hook, body, industry').in('status', ['draft', 'scheduled']).order('created_at', { ascending: false }).limit(10),
      db.from('projects').select('id, title, brief, assigned_by').eq('status', 'briefed').eq('assigned_by', 'arora').order('created_at', { ascending: false }).limit(6),
      db.from('tasks').select('id, title, owner_role, deliverable_type').eq('status', 'review').order('created_at', { ascending: false }).limit(10),
      db.from('agent_state').select('role, health, last_run_at').neq('health', 'ok').limit(10),
    ]);

    for (const d of drafts.data ?? []) {
      out.push({
        kind: 'outreach',
        id: d.id,
        title: `Send outreach: ${d.subject || '(no subject)'}`,
        summary: `${d.recipient_email ? `To ${d.recipient_email}. ` : ''}${excerpt(d.body)}`,
        action: 'send_outreach',
        approveLabel: 'Send',
        rejectLabel: 'Archive',
        ...urls('send_outreach', d.id),
      });
    }
    for (const p of posts.data ?? []) {
      const isSub = (p.industry || '').toLowerCase().includes('substack');
      const action: DecisionAction = isSub ? 'publish_substack' : 'publish_linkedin';
      out.push({
        kind: isSub ? 'substack' : 'linkedin',
        id: p.id,
        title: `Publish ${isSub ? 'to Substack' : 'to LinkedIn'}: ${p.title || excerpt(p.hook, 60) || '(untitled)'}`,
        summary: excerpt(p.body),
        action,
        approveLabel: 'Publish',
        rejectLabel: 'Archive',
        ...urls(action, p.id),
      });
    }
    for (const pr of projects.data ?? []) {
      out.push({
        kind: 'project',
        id: pr.id,
        title: `Arora proposes: ${pr.title}`,
        summary: excerpt(pr.brief, 180),
        action: 'dispatch_project',
        approveLabel: 'Dispatch',
        rejectLabel: 'Cancel',
        ...urls('dispatch_project', pr.id),
      });
    }
    for (const t of reviews.data ?? []) {
      out.push({
        kind: 'task',
        id: t.id,
        title: `Review deliverable: ${t.title}`,
        summary: `${t.owner_role?.toUpperCase() || 'agent'} shipped a ${t.deliverable_type || 'deliverable'} — review it in the studio.`,
        action: null, // judgment-heavy; review in studio rather than one-tap
      });
    }
    for (const a of (agentsRes.data ?? []) as Array<{ role: string; health: string | null }>) {
      out.push({
        kind: 'ops',
        id: a.role,
        title: `Re-run ${a.role.toUpperCase()} — last run ${a.health || 'unknown'}`,
        summary: `This agent's last cycle was "${a.health}". Re-run it now, or dismiss.`,
        action: 'rerun_agent',
        approveLabel: 'Re-run',
        rejectLabel: 'Dismiss',
        ...urls('rerun_agent', a.role),
      });
    }
  } catch (err) {
    console.warn('[decisions] scan failed:', err);
  }

  return out;
}
