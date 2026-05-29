// GET /api/studio/decisions — the operator's pending-decision queue (admin-gated).
import { NextResponse } from 'next/server';
import { isStudioAdmin } from '@/lib/studio/auth';
import { getPendingDecisions } from '@/lib/studio/decisions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET() {
  const auth = await isStudioAdmin();
  if (!auth.ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const decisions = await getPendingDecisions();
  return NextResponse.json({ ok: true, decisions }, { headers: { 'Cache-Control': 'no-store' } });
}
