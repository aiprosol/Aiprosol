// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · AGENTS — context loader
// Pulls real Supabase rows that each role should see when reasoning.
// The runner stitches this into the LLM's user message so agents stop
// fabricating activity and start referencing actual data.
//
// Read-only for now. Write-back lands in a follow-up — agents propose
// actions (e.g. "mark draft 123 as sent") but they go through a /studio
// approval queue before mutating real state.
// ─────────────────────────────────────────────────────────────────────────

import type { Role } from './types';
import { isSupabaseConfigured, requireSupabaseAdmin } from '@/lib/db/supabase';
import { getProducts } from '@/lib/content';
import { buildKpiContextMarkdown } from './kpi-rollup';

export type RoleContext = {
  role: Role;
  blocks: Array<{ heading: string; markdown: string }>;
};

// ─────────────────────────────────────────────────────────────────────────
// Per-role context — composed from Supabase tables + on-disk content.
// Each function returns 1+ markdown "blocks" that get rendered into the
// LLM's user message under a clear heading.
// ─────────────────────────────────────────────────────────────────────────

export async function loadContext(role: Role): Promise<RoleContext> {
  if (!isSupabaseConfigured()) {
    return { role, blocks: [] };
  }
  const blocks: RoleContext['blocks'] = [];

  switch (role) {
    case 'arora':
      blocks.push(...(await aroraContext()));
      break;
    case 'coo':
      blocks.push(...(await cooContext()));
      break;
    case 'cmo':
      blocks.push(...(await cmoContext()));
      break;
    case 'cco':
      blocks.push(...(await ccoContext()));
      break;
    case 'cto':
      blocks.push(...(await ctoContext()));
      break;
    case 'cro':
      blocks.push(...(await croContext()));
      break;
    case 'clo':
      blocks.push(...(await cloContext()));
      break;
    case 'cpo':
      blocks.push(...(await cpoContext()));
      break;
    case 'cpm':
      blocks.push(...(await cpmContext()));
      break;
    case 'da':
      blocks.push(...(await daContext()));
      break;
  }

  return { role, blocks };
}

// ─── Per-role loaders ────────────────────────────────────────────────

async function aroraContext() {
  const db = requireSupabaseAdmin();
  const blocks: RoleContext['blocks'] = [];

  // Open tasks across all roles
  const { data: tasks } = await db
    .from('tasks')
    .select('id, title, status, owner_role, priority, due_date')
    .in('status', ['todo', 'in_progress', 'blocked'])
    .order('priority', { ascending: false })
    .limit(6);
  if (tasks?.length) {
    blocks.push({
      heading: 'Open operational backlog (across the company)',
      markdown: tasks
        .map((t) => `- [${t.priority?.toUpperCase()}] (${t.owner_role || '?'}) ${t.title.slice(0, 70)}`)
        .join('\n'),
    });
  }

  // Recent agent log — anomalies
  const { data: errors } = await db
    .from('agent_log')
    .select('role, at, status, error')
    .eq('status', 'error')
    .order('at', { ascending: false })
    .limit(5);
  if (errors?.length) {
    blocks.push({
      heading: 'Recent agent errors (need your attention)',
      markdown: errors
        .map((e) => `- ${e.role.toUpperCase()} @ ${e.at?.slice(11, 19)}: ${e.error?.slice(0, 100)}`)
        .join('\n'),
    });
  }

  return blocks;
}

async function cooContext() {
  const db = requireSupabaseAdmin();
  const blocks: RoleContext['blocks'] = [];

  // All open tasks (COO is the operational owner)
  const { data: tasks } = await db
    .from('tasks')
    .select('id, title, status, owner_role, priority')
    .in('status', ['todo', 'in_progress', 'blocked'])
    .order('priority', { ascending: false })
    .limit(8);
  if (tasks?.length) {
    blocks.push({
      heading: 'Open tasks (company-wide backlog)',
      markdown: tasks
        .map(
          (t) =>
            `- [${t.priority?.toUpperCase()}] (${t.owner_role || '?'}) ${t.title.slice(0, 70)}`,
        )
        .join('\n'),
    });
  }

  // Recent run health
  const { data: runs } = await db
    .from('agent_log')
    .select('role, status, duration_ms, at')
    .order('at', { ascending: false })
    .limit(20);
  if (runs?.length) {
    const okCount = runs.filter((r) => r.status === 'ok').length;
    const errCount = runs.filter((r) => r.status === 'error').length;
    const avgMs = Math.round(runs.reduce((n, r) => n + (r.duration_ms || 0), 0) / runs.length);
    blocks.push({
      heading: 'Operational health (last 20 agent runs)',
      markdown: `- ${okCount}/${runs.length} OK\n- ${errCount} errors\n- avg latency ${avgMs}ms`,
    });
  }

  return blocks;
}

async function cmoContext() {
  const db = requireSupabaseAdmin();
  const blocks: RoleContext['blocks'] = [];

  // Content pipeline
  const { data: posts } = await db
    .from('linkedin_posts')
    .select('id, title, status, scheduled_for, hook, industry')
    .in('status', ['draft', 'scheduled'])
    .order('created_at', { ascending: false })
    .limit(10);
  if (posts?.length) {
    blocks.push({
      heading: 'LinkedIn content pipeline (your queue)',
      markdown: posts
        .map(
          (p) =>
            `- [${p.status}] ${p.title || '(untitled)'}${p.industry ? ` (industry: ${p.industry})` : ''}${
              p.scheduled_for ? ` — scheduled ${p.scheduled_for.slice(0, 10)}` : ''
            }`,
        )
        .join('\n'),
    });
  } else {
    blocks.push({
      heading: 'LinkedIn content pipeline',
      markdown: '- (no posts queued) — recommend drafting from Notion content calendar.',
    });
  }

  // Marketing SOPs
  const { data: sops } = await db
    .from('sops')
    .select('slug, title, category')
    .eq('category', 'marketing')
    .limit(5);
  if (sops?.length) {
    blocks.push({
      heading: 'Strategic marketing playbooks (in your library)',
      markdown: sops.map((s) => `- "${s.title}" (slug: ${s.slug})`).join('\n'),
    });
  }

  return blocks;
}

async function ccoContext() {
  const db = requireSupabaseAdmin();
  const blocks: RoleContext['blocks'] = [];

  // Active leads
  const { data: leads } = await db
    .from('leads')
    .select('id, name, company, industry, status, score')
    .in('status', ['new', 'qualified', 'contacted'])
    .order('score', { ascending: false })
    .limit(10);
  if (leads?.length) {
    blocks.push({
      heading: 'Active leads / customers',
      markdown: leads
        .map(
          (l) =>
            `- (${l.status}, score ${l.score || 0}) ${l.name || '?'} @ ${l.company || '?'} — ${l.industry || 'unknown industry'}`,
        )
        .join('\n'),
    });
  } else {
    blocks.push({
      heading: 'Active leads / customers',
      markdown: '- (none in pipeline yet) — once the ROI Audit form posts to /leads, you\'ll have material to act on.',
    });
  }

  return blocks;
}

async function ctoContext() {
  const db = requireSupabaseAdmin();
  const blocks: RoleContext['blocks'] = [];

  // CTO-owned tasks
  const { data: tasks } = await db
    .from('tasks')
    .select('id, title, status, priority, notes')
    .eq('owner_role', 'cto')
    .in('status', ['todo', 'in_progress'])
    .order('priority', { ascending: false });
  if (tasks?.length) {
    blocks.push({
      heading: 'Tech-owned tasks',
      markdown: tasks
        .map(
          (t) =>
            `- [${t.priority?.toUpperCase()}] ${t.title}${t.notes ? ` — ${t.notes.slice(0, 100)}` : ''}`,
        )
        .join('\n'),
    });
  }

  // Code error log
  const { data: errs } = await db
    .from('agent_log')
    .select('role, status, error, at')
    .eq('status', 'error')
    .order('at', { ascending: false })
    .limit(5);
  if (errs?.length) {
    blocks.push({
      heading: 'Recent code/runtime errors from agents',
      markdown: errs.map((e) => `- ${e.role.toUpperCase()}: ${e.error?.slice(0, 120)}`).join('\n'),
    });
  }

  return blocks;
}

async function croContext() {
  const db = requireSupabaseAdmin();
  const blocks: RoleContext['blocks'] = [];

  // Draft outreach you own
  const { data: drafts } = await db
    .from('outreach_drafts')
    .select('id, channel, target_segment, subject, status')
    .in('status', ['draft', 'sent'])
    .order('created_at', { ascending: false })
    .limit(8);
  if (drafts?.length) {
    const drafted = drafts.filter((d) => d.status === 'draft').length;
    const sent = drafts.filter((d) => d.status === 'sent').length;
    blocks.push({
      heading: `Outreach inventory: ${drafted} drafts, ${sent} sent`,
      markdown: drafts
        .map(
          (d) =>
            `- [${d.status}] ${d.target_segment}: "${d.subject?.slice(0, 50)}" (${d.id.slice(0, 6)})`,
        )
        .join('\n'),
    });
  }

  // Sales SOPs
  const { data: sops } = await db
    .from('sops')
    .select('slug, title')
    .eq('category', 'sales')
    .limit(5);
  if (sops?.length) {
    blocks.push({
      heading: 'Sales playbooks (you should be using these)',
      markdown: sops.map((s) => `- "${s.title}" (slug: ${s.slug})`).join('\n'),
    });
  }

  // Qualified leads to action — apply a freshness penalty so a stale
  // "contacted" lead doesn't outrank a today's "new" one. The decay is
  // mild: a 7-day-old lead drops ~10% of its score, a 30-day-old one ~35%.
  const { data: leads } = await db
    .from('leads')
    .select('id, name, company, status, score, created_at')
    .in('status', ['new', 'qualified', 'contacted'])
    .order('score', { ascending: false })
    .limit(20);
  if (leads?.length) {
    const now = Date.now();
    const ranked = leads
      .map((l) => {
        const ageDays = (now - new Date(l.created_at).getTime()) / 86_400_000;
        // Exponential decay with 30-day half-life
        const freshness = Math.pow(0.5, ageDays / 30);
        const effective = Math.round((l.score ?? 0) * freshness);
        return { ...l, ageDays, effective };
      })
      .sort((a, b) => b.effective - a.effective)
      .slice(0, 8);

    blocks.push({
      heading: 'Pipeline (sorted by score × freshness)',
      markdown: ranked
        .map(
          (l) =>
            `- [${l.status}] eff ${l.effective} (raw ${l.score}, ${Math.round(l.ageDays)}d old) — ${l.name} @ ${l.company || 'unknown co.'}`,
        )
        .join('\n'),
    });
  }

  return blocks;
}

async function cloContext() {
  const db = requireSupabaseAdmin();
  const blocks: RoleContext['blocks'] = [];

  // Legal SOPs
  const { data: sops } = await db
    .from('sops')
    .select('slug, title')
    .eq('category', 'legal')
    .limit(10);
  if (sops?.length) {
    blocks.push({
      heading: 'Legal docs / playbooks in the library',
      markdown: sops.map((s) => `- "${s.title}" (slug: ${s.slug})`).join('\n'),
    });
  }

  // Legal-owned tasks
  const { data: tasks } = await db
    .from('tasks')
    .select('id, title, status, priority, notes')
    .eq('owner_role', 'clo')
    .in('status', ['todo', 'in_progress']);
  if (tasks?.length) {
    blocks.push({
      heading: 'Legal-flagged items',
      markdown: tasks.map((t) => `- [${t.priority}] ${t.title}`).join('\n'),
    });
  }

  return blocks;
}

async function cpoContext() {
  const db = requireSupabaseAdmin();
  const blocks: RoleContext['blocks'] = [];

  // Partner pipeline
  const { data: partners } = await db
    .from('affiliate_partners')
    .select('id, name, category, status')
    .in('status', ['identified', 'researched', 'contacted', 'qualified'])
    .order('created_at', { ascending: false })
    .limit(20);
  if (partners?.length) {
    const byStatus: Record<string, number> = {};
    partners.forEach((p) => {
      byStatus[p.status] = (byStatus[p.status] || 0) + 1;
    });
    const counts = Object.entries(byStatus)
      .map(([s, n]) => `${n} ${s}`)
      .join(', ');
    blocks.push({
      heading: `Partner pipeline (${counts})`,
      markdown:
        partners
          .slice(0, 10)
          .map((p) => `- [${p.status}] ${p.name}${p.category ? ` (${p.category})` : ''}`)
          .join('\n') + (partners.length > 10 ? `\n- ... and ${partners.length - 10} more` : ''),
    });
  } else {
    blocks.push({
      heading: 'Partner pipeline',
      markdown:
        '- (empty) — Notion has the 50 identified partner names; recommend a bulk import on next cycle.',
    });
  }

  return blocks;
}

async function cpmContext() {
  // CPM has on-disk product catalogue + Supabase task feed
  const blocks: RoleContext['blocks'] = [];
  const products = getProducts();
  const sellable = products.filter((p) => (p as { available?: boolean }).available);
  const preorder = products.filter((p) => !(p as { available?: boolean }).available);

  blocks.push({
    heading: 'Product catalogue snapshot',
    markdown:
      `- Total: ${products.length}\n- Sellable now: ${sellable.length}\n- Pre-order: ${preorder.length}\n- Price range: $${Math.min(
        ...products.map((p) => p.price),
      )} → $${Math.max(...products.map((p) => p.price))}\n- Pre-order slugs: ${preorder.map((p) => p.slug).join(', ')}`,
  });

  // Note: product-level KPIs (sales, revenue per SKU) will flow in once the
  // Stripe webhook is wired. For now, point to that as an upcoming source.
  blocks.push({
    heading: 'Upcoming data sources',
    markdown:
      '- Stripe webhook → `orders` table (pending Stripe keys)\n- Gumroad sales report import (pending)',
  });

  return blocks;
}

async function daContext() {
  const db = requireSupabaseAdmin();
  const blocks: RoleContext['blocks'] = [];

  // Day-over-day rolling snapshot (auto-written by the rollup that fires
  // after this run completes — so on the first run it's empty, but every
  // subsequent run gives the agent real movement to comment on).
  const kpiSnap = await buildKpiContextMarkdown();
  blocks.push({
    heading: 'KPI snapshot (today vs yesterday)',
    markdown: kpiSnap || '- (no kpi_log rows yet — this run will seed the baseline)',
  });

  // Pipeline summary across all tables — point-in-time, raw
  const counts = await Promise.all([
    db.from('leads').select('id', { count: 'exact', head: true }),
    db.from('outreach_drafts').select('id', { count: 'exact', head: true }),
    db.from('linkedin_posts').select('id', { count: 'exact', head: true }),
    db.from('affiliate_partners').select('id', { count: 'exact', head: true }),
    db.from('tasks').select('id', { count: 'exact', head: true }),
    db.from('sops').select('id', { count: 'exact', head: true }),
  ]);
  blocks.push({
    heading: 'Cross-table counts (database health)',
    markdown:
      `- leads: ${counts[0].count ?? 0}\n- outreach_drafts: ${counts[1].count ?? 0}\n` +
      `- linkedin_posts: ${counts[2].count ?? 0}\n- affiliate_partners: ${counts[3].count ?? 0}\n` +
      `- tasks: ${counts[4].count ?? 0}\n- sops: ${counts[5].count ?? 0}`,
  });

  blocks.push({
    heading: 'Reminder for this DA run',
    markdown:
      '- After your LLM cycle completes, the runner auto-writes a daily kpi_log snapshot of all the counts above.\n' +
      '- Your job: read the deltas, name 2–4 KPIs in the JSON output, and flag any number that moved more than 20% day-over-day.',
  });

  return blocks;
}

// ─── Render to markdown for the prompt ──────────────────────────────────
export function renderContext(ctx: RoleContext): string {
  if (!ctx.blocks.length) return '';
  return ctx.blocks.map((b) => `## ${b.heading}\n${b.markdown}`).join('\n\n');
}
