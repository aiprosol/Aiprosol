// ─────────────────────────────────────────────────────────────────────────
// GET /api/studio/system — system status snapshot for the System tab.
// Admin-gated. Reports env-key presence (never values), Supabase/agent health,
// digest freshness, and recent Vercel deploys (if VERCEL_TOKEN is set).
// ─────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { isStudioAdmin } from '@/lib/studio/auth';
import { getSystemSnapshot } from '@/lib/studio/system';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET() {
  const auth = await isStudioAdmin();
  if (!auth.ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const snapshot = await getSystemSnapshot();
  return NextResponse.json({ ok: true, ...snapshot }, { headers: { 'Cache-Control': 'no-store' } });
}
