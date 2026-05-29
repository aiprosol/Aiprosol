// ─────────────────────────────────────────────────────────────────────────
// PATCH /api/studio/[resource]/[id]
// Updates a single row in one of the studio-managed tables. Admin-gated.
//
// Supported resources + updatable fields (whitelist enforced):
//   - tasks:           status, priority, notes, owner_role, due_date
//   - outreach_drafts: status, sent_at, subject, body
//   - linkedin_posts:  status, scheduled_for, published_at, title, body, industry
//   - leads:           status, score, recommended_plan, recommended_products
//   - affiliate_partners: status, contact_email, contact_name, website, notes
//
// Body: { field: value, field2: value2, ... }
// Returns: { ok: true, row: {...} } or { error: '...' }
// ─────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { isStudioAdmin } from '@/lib/studio/auth';
import { requireSupabaseAdmin } from '@/lib/db/supabase';
import { RESOURCES } from '@/lib/studio/resources';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ resource: string; id: string }> },
) {
  const auth = await isStudioAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { resource, id } = await ctx.params;
  const config = RESOURCES[resource];
  if (!config) {
    return NextResponse.json({ error: `Unknown resource: ${resource}` }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Whitelist filter — drop unknown keys
  const update: Record<string, unknown> = {};
  for (const key of config.allowed) {
    if (key in body) update[key] = body[key];
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json(
      {
        error: `No updatable fields in body. Allowed for ${resource}: ${config.allowed.join(', ')}`,
      },
      { status: 400 },
    );
  }

  // Optional: auto-stamp sent_at / published_at when status transitions
  if (resource === 'outreach' && update.status === 'sent' && !update.sent_at) {
    update.sent_at = new Date().toISOString();
  }
  if (resource === 'linkedin' && update.status === 'published' && !update.published_at) {
    update.published_at = new Date().toISOString();
  }

  const db = requireSupabaseAdmin();
  const { data, error } = await db
    .from(config.table)
    .update(update)
    .eq('id', id)
    .select('*')
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Row not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, row: data, by: auth.session?.email });
}

// Convenience: also accept POST for clients that can't send PATCH
export const POST = PATCH;
