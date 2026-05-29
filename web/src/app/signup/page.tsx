// ─────────────────────────────────────────────────────────────────────────
// /signup → /login
// Signup is closed. Aiprosol is a single-operator console; new accounts
// aren't being provisioned. The login page handles magic-link auth for the
// existing admin allowlist (see lib/studio/auth.ts).
// ─────────────────────────────────────────────────────────────────────────

import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Sign in',
  description: 'Sign in to Aiprosol.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/login' },
};

export default function SignupClosedPage() {
  redirect('/login');
}
