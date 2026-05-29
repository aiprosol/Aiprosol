// GET /api/studio/revenue — revenue snapshot from Stripe (admin-gated).
import { NextResponse } from 'next/server';
import { isStudioAdmin } from '@/lib/studio/auth';
import { getRevenue } from '@/lib/studio/revenue';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET() {
  const auth = await isStudioAdmin();
  if (!auth.ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  try {
    const data = await getRevenue();
    return NextResponse.json({ ok: true, ...data }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : 'revenue-failed' }, { status: 502 });
  }
}
