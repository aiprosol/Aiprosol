// ─────────────────────────────────────────────────────────────────────────
// GET /api/agent/google/start?next=/inbox
//
// Starts the Arora Inbox Gmail OAuth flow. Redirects the user to Google's
// consent screen for gmail.readonly + gmail.compose scopes. Different from
// /api/auth/google (which is for site sign-in via openid/email/profile).
// ─────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { signOAuthState, sanitizeNext } from '@/lib/auth';
import { buildGmailAuthUrl, isGmailOAuthEnabled } from '@/lib/google-gmail';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  if (!isGmailOAuthEnabled()) {
    return NextResponse.redirect(
      new URL('/inbox?error=gmail-not-configured', req.nextUrl.origin),
    );
  }

  const next = sanitizeNext(req.nextUrl.searchParams.get('next'), '/inbox');
  const state = await signOAuthState(next);
  const origin = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
  return NextResponse.redirect(buildGmailAuthUrl(state, origin));
}
