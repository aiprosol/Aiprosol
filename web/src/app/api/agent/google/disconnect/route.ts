// POST /api/agent/google/disconnect
// Clears the Gmail token cookie. The Google-side OAuth grant lives on
// (revocation against Google's API is a polite extra — Week 2 work).

import { NextRequest, NextResponse } from 'next/server';
import { clearGmailCookie } from '@/lib/google-gmail';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
  const res = NextResponse.redirect(new URL('/inbox?disconnected=1', origin), { status: 303 });
  clearGmailCookie(res);
  return res;
}
