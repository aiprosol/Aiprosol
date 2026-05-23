// POST /api/auth/profile — update the signed-in user's profile.
//
// The profile lives inside the session JWT, so an update means re-issuing
// the cookie with the new payload. Email stays fixed; all other fields are
// optional and overwrite the previous values.
//
// Empty strings → field cleared. Undefined → field unchanged. The combination
// lets the settings form save partial updates without forcing the user to
// re-enter everything.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession, signSession, attachSessionCookie } from '@/lib/auth';

export const runtime = 'nodejs';

const Schema = z.object({
  name: z.string().max(80).optional(),
  company: z.string().max(80).optional(),
  role: z.string().max(60).optional(),
  industry: z.string().max(40).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'auth-required' }, { status: 401 });
  }

  let body: unknown;
  try { body = await req.json(); } catch { body = {}; }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid-profile', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // Merge: undefined keys keep current value, defined-but-empty clears it.
  const current = session.profile ?? {};
  const merged: Record<string, string | undefined> = { ...current };
  for (const [k, v] of Object.entries(parsed.data)) {
    if (v === undefined) continue;
    const trimmed = String(v).trim();
    merged[k] = trimmed ? trimmed : undefined;
  }
  // Strip empty keys so the JWT stays lean
  const profile = Object.fromEntries(
    Object.entries(merged).filter(([, v]) => Boolean(v)),
  );

  const newToken = await signSession(session.email, profile);
  const res = NextResponse.json({ ok: true, email: session.email, profile });
  attachSessionCookie(res, newToken);
  return res;
}
