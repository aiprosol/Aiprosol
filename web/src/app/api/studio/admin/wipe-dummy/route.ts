// ─────────────────────────────────────────────────────────────────────────
// POST /api/studio/admin/wipe-dummy
// One-shot dummy-data wipe. Admin-gated. Runs server-side with the
// service-role key, so RLS doesn't block the deletes.
//
// Body: { confirm: "WIPE" }
//
// DELETES:
//   - tasks where project_id IS NULL
//   - all rows in outreach_drafts / linkedin_posts / affiliate_partners / leads
//
// Returns before/after counts for visibility.
// ─────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { isStudioAdmin } from '@/lib/studio/auth';
import { requireSupabaseAdmin, isSupabaseConfigured } from '@/lib/db/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const TABLES_FULL_WIPE = ['outreach_drafts', 'linkedin_posts', 'affiliate_partners', 'leads'] as const;

export async function POST(req: NextRequest) {
  const auth = await isStudioAdmin();
  if (!auth.ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'supabase-not-configured' }, { status: 503 });
  }

  let body: { confirm?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid-json' }, { status: 400 });
  }
  if (body.confirm !== 'WIPE') {
    return NextResponse.json({ error: 'confirmation-required', hint: 'send { "confirm": "WIPE" }' }, { status: 400 });
  }

  const db = requireSupabaseAdmin();

  async function count(table: string, unlinkedOnly = false): Promise<number> {
    let q = db.from(table).select('id', { count: 'exact', head: true });
    if (unlinkedOnly) q = q.is('project_id', null);
    const { count } = await q;
    return count ?? 0;
  }

  const before = {
    tasks_total: await count('tasks'),
    tasks_unlinked: await count('tasks', true),
    outreach_drafts: await count('outreach_drafts'),
    linkedin_posts: await count('linkedin_posts'),
    affiliate_partners: await count('affiliate_partners'),
    leads: await count('leads'),
  };

  const errors: Array<{ table: string; error: string }> = [];

  // 1) Tasks: delete only project_id IS NULL
  {
    const { error } = await db.from('tasks').delete().is('project_id', null);
    if (error) errors.push({ table: 'tasks', error: error.message });
  }
  // 2) Full-table wipes
  for (const t of TABLES_FULL_WIPE) {
    const { error } = await db.from(t).delete().not('id', 'is', null);
    if (error) errors.push({ table: t, error: error.message });
  }

  const after = {
    tasks_total: await count('tasks'),
    outreach_drafts: await count('outreach_drafts'),
    linkedin_posts: await count('linkedin_posts'),
    affiliate_partners: await count('affiliate_partners'),
    leads: await count('leads'),
  };

  return NextResponse.json({
    ok: errors.length === 0,
    before,
    after,
    errors,
    by: auth.session?.email,
  });
}
