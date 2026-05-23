// GET /api/auth/verify?token=...
// Validates the magic-link token, sets the session cookie, redirects to `next`.

import { NextRequest, NextResponse } from 'next/server';
import { verifyMagicLink, signSession, attachSessionCookie, sanitizeNext } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const token = url.searchParams.get('token');
  if (!token) {
    return NextResponse.redirect(new URL('/login?error=missing-token', url.origin));
  }

  const payload = await verifyMagicLink(token);
  if (!payload) {
    return NextResponse.redirect(new URL('/login?error=invalid-or-expired', url.origin));
  }

  const next = sanitizeNext(payload.next);
  // Forward any profile carried in the magic-link payload into the session
  // so it survives the verify step. (Set at signup, read everywhere after.)
  const sessionToken = await signSession(payload.email, payload.profile);

  const res = NextResponse.redirect(new URL(next, url.origin));
  attachSessionCookie(res, sessionToken);
  return res;
}
