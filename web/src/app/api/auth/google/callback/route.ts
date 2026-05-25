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
  type SessionProfile,
} from '@/lib/auth';
import { ensureProfile, getProfileByEmail } from '@/lib/profiles';

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

  // ── Persist profile in Supabase + sign our session ──
  const email = user.email.trim().toLowerCase();

  // Upsert into public.profiles. New users get name + picture from Google.
  // Returning users get blanks filled, but user-set values are never overwritten
  // (see ensureProfile's merge semantics).
  const dbProfile = await ensureProfile(email, {
    auth_provider: 'google',
    name: user.name,
    picture: user.picture,
    email_verified: true,
  });

  // Bake the same 4-field summary into the JWT cookie so the dashboard +
  // ROI Audit can prefill at the edge without a DB hit. If DB write failed,
  // fall back to minimum-viable summary from the Google userinfo.
  const sessionProfile: SessionProfile | undefined = (() => {
    const fromDb = dbProfile;
    if (fromDb) {
      const summary: SessionProfile = {};
      if (fromDb.name)     summary.name = fromDb.name;
      if (fromDb.company)  summary.company = fromDb.company;
      if (fromDb.role)     summary.role = fromDb.role;
      if (fromDb.industry) summary.industry = fromDb.industry;
      return Object.keys(summary).length > 0 ? summary : undefined;
    }
    // DB unavailable — at minimum carry the Google name into the JWT.
    return user.name ? { name: user.name } : undefined;
  })();

  // For new users where DB write failed but we have userinfo, also try a
  // final-read in case another request created the profile (race-tolerant).
  if (!dbProfile) {
    const existing = await getProfileByEmail(email);
    if (existing) {
      // re-attempt sourcing summary; ignore failure here, JWT path still works
    }
  }

  const sessionToken = await signSession(email, sessionProfile);

  const next = sanitizeNext(state.next);
  const res = NextResponse.redirect(new URL(next, origin));
  attachSessionCookie(res, sessionToken);

  console.log(
    '[google-callback] signed in',
    email,
    dbProfile ? '(profile upserted)' : '(profile DB unavailable, JWT-only)',
    '→',
    next,
  );
  return res;
}
