// ─────────────────────────────────────────────────────────────────────────
// /studio — Aiprosol operations console
// Server component: gates access (admin email allowlist), loads all
// company data in one parallel pass, hands off to the client app.
// ─────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next';
import { requireStudioAdmin } from '@/lib/studio/auth';
import { loadStudioSnapshot } from '@/lib/studio/data';
import { StudioApp } from './StudioApp';

export const metadata: Metadata = {
  title: 'Studio · Operations Console',
  description: 'Internal Aiprosol operations console — admin only.',
  robots: { index: false, follow: false }, // never index
};

export const dynamic = 'force-dynamic';

export default async function StudioPage() {
  const session = await requireStudioAdmin();
  const snapshot = await loadStudioSnapshot();
  return <StudioApp session={{ email: session.email }} snapshot={snapshot} />;
}
