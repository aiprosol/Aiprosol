// POST /api/auth/logout — clear the session cookie
// GET also works for forms / direct links.

import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';

export const runtime = 'nodejs';

function buildResponse(req: NextRequest): NextResponse {
  // For GET (form-style logout link) we redirect home; for POST return JSON.
  if (req.method === 'GET') {
    const res = NextResponse.redirect(new URL('/', req.nextUrl.origin));
    clearSessionCookie(res);
    return res;
  }
  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return res;
}

export async function GET(req: NextRequest)  { return buildResponse(req); }
export async function POST(req: NextRequest) { return buildResponse(req); }
