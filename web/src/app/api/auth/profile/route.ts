// /api/auth/profile · GET to read · POST to update.
//
// Storage model:
//   - Source of truth = public.profiles in Supabase (keyed by email).
//   - JWT cookie carries a 4-field summary (name/company/role/industry) so the
//     dashboard + ROI Audit prefill still work edge-fast without a DB hit.
//   - Every POST writes to Supabase first, then re-issues the cookie with
//     the refreshed summary.
//   - GET prefers Supabase. Falls back to the JWT summary if Supabase is
//     unavailable (DB outage, env not set in a preview deploy, etc.).
//
// Empty string in POST → field cleared. Undefined → field unchanged.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getSession,
  signSession,
  attachSessionCookie,
  type SessionProfile,
} from '@/lib/auth';
import {
  getProfileByEmail,
  upsertProfile,
  type DbProfile,
  type EditableProfile,
} from '@/lib/profiles';

export const runtime = 'nodejs';

// Validate the editable subset. URL fields get a soft sanity check — we don't
// require valid URLs (Substack lets you paste `chairmanslog.substack.com`
// without a scheme), but we cap length to keep payloads small.
const Schema = z.object({
  name:         z.string().max(80).optional(),
  company:      z.string().max(80).optional(),
  role:         z.string().max(60).optional(),
  industry:     z.string().max(40).optional(),
  picture:      z.string().max(500).optional(),
  bio:          z.string().max(600).optional(),
  timezone:     z.string().max(60).optional(),
  linkedin_url: z.string().max(200).optional(),
  twitter_url:  z.string().max(200).optional(),
  website_url:  z.string().max(200).optional(),
});

// Project a DbProfile down to the 4 fields baked into the JWT cookie.
function profileToJwtSummary(profile: DbProfile | null): SessionProfile | undefined {
  if (!profile) return undefined;
  const summary: SessionProfile = {};
  if (profile.name)     summary.name = profile.name;
  if (profile.company)  summary.company = profile.company;
  if (profile.role)     summary.role = profile.role;
  if (profile.industry) summary.industry = profile.industry;
  return Object.keys(summary).length > 0 ? summary : undefined;
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'auth-required' }, { status: 401 });
  }

  // Prefer Supabase. Fall back to JWT summary if DB unavailable.
  const dbProfile = await getProfileByEmail(session.email);
  if (dbProfile) {
    return NextResponse.json({ email: session.email, profile: dbProfile });
  }
  return NextResponse.json({
    email: session.email,
    profile: session.profile ?? {},
  });
}

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

  // Normalize: trim strings; pass empty strings through so DB clears the field.
  const patch: EditableProfile = {};
  for (const [k, v] of Object.entries(parsed.data)) {
    if (v === undefined) continue;
    (patch as Record<string, string>)[k] = String(v).trim();
  }

  // Write to Supabase (source of truth)
  const updated = await upsertProfile(session.email, patch);

  // Re-issue the JWT with the refreshed 4-field summary so edge reads stay
  // consistent without a DB hit. If Supabase wrote successfully, use its
  // return value; otherwise fall back to the merged JWT-only path so the
  // user's edit isn't silently dropped on DB downtime.
  let cookieProfile: SessionProfile | undefined;
  if (updated) {
    cookieProfile = profileToJwtSummary(updated);
  } else {
    // DB unavailable — preserve prior behaviour: merge into existing JWT profile.
    const current = session.profile ?? {};
    const merged: Record<string, string | undefined> = { ...current };
    for (const [k, v] of Object.entries(parsed.data)) {
      if (v === undefined) continue;
      if (k === 'name' || k === 'company' || k === 'role' || k === 'industry') {
        const trimmed = String(v).trim();
        merged[k] = trimmed ? trimmed : undefined;
      }
    }
    const stripped: SessionProfile = Object.fromEntries(
      Object.entries(merged).filter(([, v]) => Boolean(v)),
    ) as SessionProfile;
    cookieProfile = Object.keys(stripped).length > 0 ? stripped : undefined;
  }

  const newToken = await signSession(session.email, cookieProfile);
  const res = NextResponse.json({
    ok: true,
    email: session.email,
    profile: updated ?? cookieProfile ?? {},
    stored_in: updated ? 'supabase' : 'jwt-only',
  });
  attachSessionCookie(res, newToken);
  return res;
}
