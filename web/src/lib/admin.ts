// AIPROSOL · Admin authorisation
//
// Admin views (under /admin/*) are gated by two checks:
//   1. The visitor has a valid session cookie (middleware enforces this for
//      every /admin/* path — same as /dashboard, /settings).
//   2. The session email is in the admin allow-list below.
//
// The allow-list is hard-coded for now. When the founder count grows beyond
// one person, swap this for an ADMIN_EMAILS env var (comma-separated).

import { getSession } from './auth';

// Lowercased emails allowed into /admin/*. Compared case-insensitively.
const ADMIN_EMAILS: string[] = [
  'srijanpaudelofficial@gmail.com',
  'srijanpaudel219@gmail.com',
];

const ENV_ADMINS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map(s => s.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  const e = email.trim().toLowerCase();
  return ADMIN_EMAILS.includes(e) || ENV_ADMINS.includes(e);
}

/** Server-component helper — returns the admin session or null. */
export async function requireAdminSession() {
  const session = await getSession();
  if (!session) return null;
  if (!isAdminEmail(session.email)) return null;
  return session;
}
