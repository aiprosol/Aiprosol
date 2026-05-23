// GET /api/auth/me — returns the current session, or 401.

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({
    authenticated: true,
    email: session.email,
    issuedAt: session.iat,
    expiresAt: session.exp,
    profile: session.profile ?? {},
  });
}
