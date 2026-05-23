// GET /api/auth/google?next=/dashboard
// Starts the Google OAuth flow. Redirects the visitor to Google's consent screen.

import { NextRequest, NextResponse } from 'next/server';
import { signOAuthState, sanitizeNext, isGoogleOAuthEnabled } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  if (!isGoogleOAuthEnabled()) {
    return NextResponse.redirect(
      new URL('/login?error=google-not-configured', req.nextUrl.origin),
    );
  }

  const next = sanitizeNext(req.nextUrl.searchParams.get('next'));
  const state = await signOAuthState(next);

  const origin = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/google/callback`;

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID!);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid email profile');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('prompt', 'select_account');
  authUrl.searchParams.set('access_type', 'online');

  return NextResponse.redirect(authUrl);
}
