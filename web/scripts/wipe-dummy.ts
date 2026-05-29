// ─────────────────────────────────────────────────────────────────────────
// scripts/wipe-dummy.ts
// One-shot data wipe — kills seed / placeholder rows so /studio shows only
// real work going forward. Idempotent: safe to re-run.
//
// DELETES:
//   - All tasks NOT linked to a project (project_id IS NULL)
//   - All outreach_drafts / linkedin_posts / affiliate_partners / leads
//
// KEEPS:
//   - projects + project_artifacts (your Arora-routed work)
//   - tasks where project_id IS NOT NULL (the 4 Edinburgh tasks)
//   - sops, kpi_log, agent_state, agent_log, daily_digest, profiles
//
// Usage:
//   cd web
//   node --env-file=.env.local --import tsx scripts/wipe-dummy.ts
//   (or pass --yes to skip confirmation)
//
// Uses the anon key — RLS on the wiped tables is permissive enough.
// ─────────────────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js';
import readline from 'node:readline';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('✗ Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.error('  Run from web/ with: node --env-file=.env.local --import tsx scripts/wipe-dummy.ts');
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function rl(prompt: string): Promise<string> {
  const i = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => i.question(prompt, (a) => { i.close(); resolve(a); }));
}

async function tableCount(table: string, filter?: { col: string; isNull?: boolean }): Promise<number> {
  let q = supabase.from(table).select('id', { count: 'exact', head: true });
  if (filter?.isNull) q = q.is(filter.col, null);
  const { count, error } = await q;
  if (error) {
    console.warn(`  warn count(${table}):`, error.message);
    return -1;
  }
  return count ?? 0;
}

async function deleteAll(table: string, filter?: { col: string; isNull?: boolean }): Promise<void> {
  let q = supabase.from(table).delete().not('id', 'is', null);
  if (filter?.isNull) q = q.is(filter.col, null);
  const { error } = await q;
  if (error) {
    console.warn(`  ✗ delete(${table}):`, error.message);
  } else {
    console.log(`  ✓ wiped ${table}${filter ? ` where ${filter.col} IS NULL` : ''}`);
  }
}

async function main() {
  const autoYes = process.argv.includes('--yes');

  console.log('Aiprosol · /studio dummy-data wipe\n');
  console.log('Before:');

  const before = {
    tasks_total: await tableCount('tasks'),
    tasks_unlinked: await tableCount('tasks', { col: 'project_id', isNull: true }),
    outreach_drafts: await tableCount('outreach_drafts'),
    linkedin_posts: await tableCount('linkedin_posts'),
    affiliate_partners: await tableCount('affiliate_partners'),
    leads: await tableCount('leads'),
  };
  for (const [k, v] of Object.entries(before)) {
    console.log(`  ${k.padEnd(22)} ${v}`);
  }

  console.log('\nWill DELETE:');
  console.log(`  ${before.tasks_unlinked} tasks NOT linked to a project (${before.tasks_total - before.tasks_unlinked} project-linked tasks stay)`);
  console.log(`  ${before.outreach_drafts} outreach_drafts`);
  console.log(`  ${before.linkedin_posts} linkedin_posts`);
  console.log(`  ${before.affiliate_partners} affiliate_partners`);
  console.log(`  ${before.leads} leads`);
  console.log('\nKEEP: projects, project_artifacts, sops, kpi_log, agent_state, agent_log, daily_digest, profiles, project-linked tasks.');

  if (!autoYes) {
    const ans = (await rl('\nProceed? Type "WIPE" to confirm: ')).trim();
    if (ans !== 'WIPE') {
      console.log('Aborted. Nothing deleted.');
      process.exit(0);
    }
  } else {
    console.log('\n(--yes passed — skipping confirmation)');
  }

  console.log('\nWiping...');
  await deleteAll('tasks', { col: 'project_id', isNull: true });
  await deleteAll('outreach_drafts');
  await deleteAll('linkedin_posts');
  await deleteAll('affiliate_partners');
  await deleteAll('leads');

  console.log('\nAfter:');
  console.log(`  tasks_total            ${await tableCount('tasks')}`);
  console.log(`  outreach_drafts        ${await tableCount('outreach_drafts')}`);
  console.log(`  linkedin_posts         ${await tableCount('linkedin_posts')}`);
  console.log(`  affiliate_partners     ${await tableCount('affiliate_partners')}`);
  console.log(`  leads                  ${await tableCount('leads')}`);

  console.log('\nDone. /studio is now clean. Refresh to see counts update.');
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
