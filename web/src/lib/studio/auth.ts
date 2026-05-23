// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · STUDIO — access guard
// /studio is the internal operations console — only the founders can see it.
// Reuses the existing aiprosol_session cookie + email allowlist.
// ─────────────────────────────────────────────────────────────────────────

import { redirect } from 'next/navigation';
import { getSession, type SessionPayload } from '@/lib/auth';

// Allowlist of email addresses with /studio access.
// Override via STUDIO_ADMIN_EMAILS env var (comma-separated).
const DEFAULT_ADMINS = [
  'srijanpaudel219@gmail.com',
  'srijanpaudelofficial@gmail.com',
];

function adminList(): string[] {
  const env = process.env.STUDIO_ADMIN_EMAILS;
  if (env) {
    return env
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }
  return DEFAULT_ADMINS.map((e) => e.toLowerCase());
}

export async function isStudioAdmin(): Promise<{
  ok: boolean;
  session: SessionPayload | null;
  reason?: 'no-session' | 'not-admin';
}> {
  const session = await getSession();
  if (!session) return { ok: false, session: null, reason: 'no-session' };
  const email = (session.email || '').toLowerCase();
  if (!adminList().includes(email)) {
    return { ok: false, session, reason: 'not-admin' };
  }
  return { ok: true, session };
}

/** Server component helper — bounce non-admins to login or 404. */
export async function requireStudioAdmin(): Promise<SessionPayload> {
  const r = await isStudioAdmin();
  if (r.ok && r.session) return r.session;
  if (r.reason === 'no-session') {
    redirect('/login?next=/studio');
  }
  // Logged in but not on allowlist — show a generic 404 to avoid leaking
  // the existence of /studio to randos.
  redirect('/');
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminList().includes(email.toLowerCase());
}
