// ─────────────────────────────────────────────────────────────────────────
// GET  /api/studio/agents/config — per-agent override state (admin-gated).
// POST /api/studio/agents/config — upsert { role, system_prompt_override?, enabled? }.
// A prompt override replaces the persona; the runner re-appends OUTPUT_FORMAT.
// ─────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isStudioAdmin } from '@/lib/studio/auth';
import { isSupabaseConfigured, requireSupabaseAdmin } from '@/lib/db/supabase';
import { ROLES, ROLE_META, type Role } from '@/lib/agents/types';
import { listAgentConfigs } from '@/lib/agents/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await isStudioAdmin();
  if (!auth.ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const configs = await listAgentConfigs();
  const agents = ROLES.map((role) => {
    const c = configs[role];
    return {
      role,
      title: ROLE_META[role].title,
      domain: ROLE_META[role].domain,
      cadenceHrs: ROLE_META[role].cadenceHrs,
      enabled: c ? c.enabled : true,
      override: c?.system_prompt_override ?? null,
    };
  });
  return NextResponse.json({ ok: true, agents }, { headers: { 'Cache-Control': 'no-store' } });
}

const postSchema = z.object({
  role: z.enum(ROLES as unknown as [Role, ...Role[]]),
  system_prompt_override: z.string().max(20000).nullable().optional(),
  enabled: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const auth = await isStudioAdmin();
  if (!auth.ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'supabase-not-configured' }, { status: 503 });
  let body;
  try {
    body = postSchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json({ error: 'invalid-body', detail: err instanceof Error ? err.message : 'bad' }, { status: 400 });
  }
  const update: Record<string, unknown> = { role: body.role, updated_at: new Date().toISOString() };
  if ('system_prompt_override' in body) update.system_prompt_override = body.system_prompt_override ?? null;
  if (typeof body.enabled === 'boolean') update.enabled = body.enabled;

  const db = requireSupabaseAdmin();
  const { error } = await db.from('agent_config').upsert(update, { onConflict: 'role' });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
