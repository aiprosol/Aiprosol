// GET /api/studio/funnel — conversion funnel from PostHog (admin-gated).
import { NextRequest, NextResponse } from 'next/server';
import { isStudioAdmin } from '@/lib/studio/auth';
import { getFunnel } from '@/lib/studio/funnel';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const auth = await isStudioAdmin();
  if (!auth.ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const days = Math.min(90, Math.max(1, Number(req.nextUrl.searchParams.get('days')) || 7));
  try {
    const data = await getFunnel(days);
    return NextResponse.json({ ok: true, ...data }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : 'funnel-failed' }, { status: 502 });
  }
}
