// GET /api/auth/google/callback?code=...&state=...
// Google redirects the user here after consent. We verify state, exchange the
// code for tokens, fetch userinfo, then create our session cookie.

import { NextRequest, NextResponse } from 'next/server';
import {
  verifyOAuthState,
  signSession,
  attachSessionCookie,
  sanitizeNext,
  isGoogleOAuthEnabled,
} from '@/lib/auth';

export const runtime = 'nodejs';

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token?: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name?: string;
  picture?: string;
}

function loginError(origin: string, code: string): NextResponse {
  return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(code)}`, origin));
}

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;

  if (!isGoogleOAuthEnabled()) {
    return loginError(origin, 'google-not-configured');
  }

  const code = req.nextUrl.searchParams.get('code');
  const stateRaw = req.nextUrl.searchParams.get('state');
  const oauthError = req.nextUrl.searchParams.get('error');

  if (oauthError) {
    // User declined consent or Google reported an error
    return loginError(origin, `google-${oauthError}`);
  }
  if (!code || !stateRaw) {
    return loginError(origin, 'missing-code-or-state');
  }

  const state = await verifyOAuthState(stateRaw);
  if (!state) {
    return loginError(origin, 'invalid-or-expired-state');
  }

  // ── Exchange code for tokens ──
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL || origin}/api/auth/google/callback`,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenRes.ok) {
    console.warn('[google-callback] token exchange failed', tokenRes.status, await tokenRes.text());
    return loginError(origin, 'google-token-exchange-failed');
  }

  const tokenData = (await tokenRes.json()) as GoogleTokenResponse;

  // ── Fetch userinfo ──
  const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!userRes.ok) {
    console.warn('[google-callback] userinfo failed', userRes.status);
    return loginError(origin, 'google-userinfo-failed');
  }

  const user = (await userRes.json()) as GoogleUserInfo;

  if (!user.email || !user.verified_email) {
    return loginError(origin, 'email-not-verified');
  }

  // ── Create our session ──
  const email = user.email.trim().toLowerCase();
  const sessionToken = await signSession(email);

  const next = sanitizeNext(state.next);
  const res = NextResponse.redirect(new URL(next, origin));
  attachSessionCookie(res, sessionToken);

  console.log('[google-callback] signed in', email, '→', next);
  return res;
}
