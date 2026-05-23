// POST /api/account/delete — end the current session.
// We don't persist user profiles yet, so "delete" today is just clearing the
// session cookie. When KV-backed user records land, this route will also
// purge the user row, downloads, and any leads keyed off this email.

import { NextResponse } from 'next/server';
import { getSession, clearSessionCookie } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'not-signed-in' }, { status: 401 });
  }

  console.log('[account/delete] account end requested for', session.email);

  const res = NextResponse.json({ ok: true, email: session.email });
  clearSessionCookie(res);
  return res;
}
