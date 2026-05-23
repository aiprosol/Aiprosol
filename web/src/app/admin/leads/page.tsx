import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/admin';
import { AdminLeadsTable } from './AdminLeadsTable';

export const metadata = {
  title: 'Leads · Admin',
  robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

export default async function AdminLeadsPage() {
  // Belt + braces: middleware already redirects unauthed visitors away from
  // /admin/*; this check rejects authed-but-not-admin visitors with a clean
  // not-found rather than a 403.
  const session = await requireAdminSession();
  if (!session) redirect('/dashboard');

  return (
    <div className="al-page">
      <div className="al-shell">
        <div className="al-eyebrow">Admin · Leads + subscribers</div>
        <h1 className="al-h1">Inbox</h1>
        <p className="al-sub">
          Every ROI Audit submission, contact form, exit-intent capture, and footer newsletter
          signup ends up here. Newest first.
        </p>

        <AdminLeadsTable />

        <p className="al-back">
          Signed in as <strong>{session.email}</strong> · <Link href="/dashboard">← Back to dashboard</Link>
        </p>
      </div>

      <style>{`
        .al-page { background: #0A0613; color: #E5E7EB; min-height: 100vh; padding: 140px 24px 80px; font-family: 'Inter', system-ui, sans-serif; }
        .al-shell { max-width: 1200px; margin: 0 auto; }
        .al-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(139, 92, 246,0.08); border: 1px solid rgba(139, 92, 246,0.25); border-radius: 999px; color: #8B5CF6; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 18px; }
        .al-h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(28px, 4vw, 38px); line-height: 1.1; margin: 0 0 8px; }
        .al-sub { color: #9CA3B5; font-size: 14px; line-height: 1.7; margin: 0 0 32px; max-width: 620px; }
        .al-back { margin-top: 36px; color: #9CA3B5; font-size: 12px; }
        .al-back strong { color: #C7CEDB; }
        .al-back a { color: #8B5CF6; text-decoration: none; }
        .al-back a:hover { color: #C084FC; }
      `}</style>
    </div>
  );
}
