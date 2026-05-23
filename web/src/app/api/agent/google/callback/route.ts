// ─────────────────────────────────────────────────────────────────────────
// GET /api/agent/google/callback?code=...&state=...
//
// Receives the OAuth code from Google, exchanges it for access + refresh
// tokens, persists them in an HMAC-signed httpOnly cookie, then redirects
// to the `next` path encoded in `state` (defaults to /inbox).
// ─────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { verifyOAuthState } from '@/lib/auth';
import {
  exchangeCodeForTokens,
  emailFromIdToken,
  packGmailTokens,
  attachGmailCookie,
  isGmailOAuthEnabled,
} from '@/lib/google-gmail';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const origin = process.env.NEXT_PUBLIC_SITE_URL || url.origin;

  // ─── Pre-flight checks ───
  if (!isGmailOAuthEnabled()) {
    return NextResponse.redirect(new URL('/inbox?error=gmail-not-configured', origin));
  }

  const code = url.searchParams.get('code');
  const stateRaw = url.searchParams.get('state');
  const errorParam = url.searchParams.get('error');

  if (errorParam) {
    return NextResponse.redirect(new URL(`/inbox?error=${encodeURIComponent(errorParam)}`, origin));
  }
  if (!code || !stateRaw) {
    return NextResponse.redirect(new URL('/inbox?error=missing-params', origin));
  }

  // ─── Verify CSRF state ───
  const state = await verifyOAuthState(stateRaw);
  if (!state) {
    return NextResponse.redirect(new URL('/inbox?error=invalid-state', origin));
  }

  // ─── Exchange code for tokens ───
  let tokenResp: Awaited<ReturnType<typeof exchangeCodeForTokens>>;
  try {
    tokenResp = await exchangeCodeForTokens(code, origin);
  } catch (err) {
    console.error('[agent/google/callback] token exchange failed:', err);
    return NextResponse.redirect(new URL('/inbox?error=token-exchange-failed', origin));
  }

  const email = emailFromIdToken(tokenResp.id_token || '');
  if (!email) {
    return NextResponse.redirect(new URL('/inbox?error=no-email', origin));
  }

  const expiresAt = Math.floor(Date.now() / 1000) + (tokenResp.expires_in || 3600);
  const signed = await packGmailTokens({
    access_token: tokenResp.access_token,
    refresh_token: tokenResp.refresh_token,
    expires_at: expiresAt,
    email,
  });

  const res = NextResponse.redirect(new URL(`${state.next}?connected=1`, origin));
  attachGmailCookie(res, signed);
  return res;
}
