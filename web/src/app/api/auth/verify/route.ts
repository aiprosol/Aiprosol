// GET /api/auth/verify?token=...
// Validates the magic-link token, sets the session cookie, redirects to `next`.
// On successful verify, ensures a profile row exists in Supabase
// (magic-link is also an email-verification signal, so email_verified=true).

import { NextRequest, NextResponse } from 'next/server';
import { verifyMagicLink, signSession, attachSessionCookie, sanitizeNext } from '@/lib/auth';
import { ensureProfile } from '@/lib/profiles';

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

  // Persist a profile row on first sign-in. The magic-link arrived from a
  // verified inbox, so we can flip email_verified=true.
  // Non-blocking on DB failure — JWT-only flow still works.
  await ensureProfile(payload.email, {
    auth_provider: 'magic-link',
    name: payload.profile?.name,
    email_verified: true,
  });

  // Forward any profile carried in the magic-link payload into the session
  // so it survives the verify step. (Set at signup, read everywhere after.)
  const sessionToken = await signSession(payload.email, payload.profile);

  const res = NextResponse.redirect(new URL(next, url.origin));
  attachSessionCookie(res, sessionToken);
  return res;
}
