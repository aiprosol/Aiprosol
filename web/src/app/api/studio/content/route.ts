// ─────────────────────────────────────────────────────────────────────────
// GET   /api/studio/content — products + services catalog (admin-gated).
// PATCH /api/studio/content — edit one product/service field set → commit to
//        main (deploys in ~70s). Body: { type:'product'|'service', slug, fields }
// ─────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isStudioAdmin } from '@/lib/studio/auth';
import { getCatalog, applyContentEdit } from '@/lib/studio/content-edit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET() {
  const auth = await isStudioAdmin();
  if (!auth.ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  return NextResponse.json({ ok: true, ...getCatalog() }, { headers: { 'Cache-Control': 'no-store' } });
}

const patchSchema = z.object({
  type: z.enum(['product', 'service']),
  slug: z.string().min(1).max(120),
  fields: z.record(z.string(), z.unknown()),
});

export async function PATCH(req: NextRequest) {
  const auth = await isStudioAdmin();
  if (!auth.ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  let body;
  try {
    body = patchSchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json({ error: 'invalid-body', detail: err instanceof Error ? err.message : 'bad' }, { status: 400 });
  }
  const res = await applyContentEdit(body);
  if (!res.ok) return NextResponse.json({ ok: false, error: res.error }, { status: res.error === 'github-not-configured' ? 503 : 400 });
  return NextResponse.json({ ok: true, sha: res.sha, applied: res.applied });
}
