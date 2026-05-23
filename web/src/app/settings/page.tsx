import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { DangerZone } from './DangerZone';
import { ProfileForm } from '@/components/ProfileForm';

export const metadata = { title: 'Account settings' };
export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect('/login?next=/settings');

  const memberSince = new Date(session.iat * 1000).toLocaleDateString('en-GB', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const sessionExpires = new Date(session.exp * 1000).toLocaleDateString('en-GB', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="st-page">
      <div className="st-shell">
        <div className="st-eyebrow">Account · Settings</div>
        <h1 className="st-h1">Settings</h1>
        <p className="st-sub">Manage your Aiprosol account, sign-in security, and data.</p>

        <section className="st-section">
          <h2>Profile</h2>
          <div className="st-row">
            <div className="st-row-label">Email</div>
            <div className="st-row-value">{session.email}</div>
          </div>
          <div className="st-row">
            <div className="st-row-label">Member since</div>
            <div className="st-row-value">{memberSince}</div>
          </div>
          <div className="st-row">
            <div className="st-row-label">This session expires</div>
            <div className="st-row-value">{sessionExpires}</div>
          </div>
          <p className="st-hint">
            Email address can&apos;t be changed yet — sign up with a new email if you need to switch.
          </p>

          <div style={{ marginTop: 22, paddingTop: 22, borderTop: '1px solid #2A1F3D' }}>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, color: '#C7CEDB', margin: '0 0 14px', fontWeight: 700 }}>
              Optional details
            </h3>
            <ProfileForm initial={session.profile ?? {}} />
          </div>
        </section>

        <section className="st-section">
          <h2>Sign-in security</h2>
          <div className="st-row">
            <div className="st-row-label">Method</div>
            <div className="st-row-value">Magic link or Google · no password</div>
          </div>
          <div className="st-row">
            <div className="st-row-label">Sign out</div>
            <div className="st-row-value">
              <a href="/api/auth/logout" className="st-btn-ghost">Sign out of this device</a>
            </div>
          </div>
          <p className="st-hint">
            Signing out clears the session cookie on this device only. To sign out everywhere,
            <Link href="/login/help"> reset your sessions</Link>.
          </p>
        </section>

        <section className="st-section">
          <h2>Notifications</h2>
          <p className="st-hint">
            We send you transactional emails (order confirmations, magic links, ROI reports). No marketing
            without explicit opt-in. To unsubscribe from any future newsletter, use the link at the bottom
            of any newsletter email.
          </p>
        </section>

        <section className="st-section st-danger">
          <h2>Danger zone</h2>
          <DangerZone email={session.email} />
        </section>

        <p className="st-back">
          <Link href="/dashboard">← Back to dashboard</Link>
        </p>
      </div>

      <style>{`
        .st-page { background: #0A0613; color: #E5E7EB; min-height: 100vh; padding: 140px 24px 80px; font-family: 'Inter', system-ui, sans-serif; }
        .st-shell { max-width: 720px; margin: 0 auto; }
        .st-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(139, 92, 246,0.08); border: 1px solid rgba(139, 92, 246,0.25); border-radius: 999px; color: #8B5CF6; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 18px; }
        .st-h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(28px, 4vw, 38px); line-height: 1.1; margin: 0 0 8px; }
        .st-sub { color: #9CA3B5; font-size: 15px; line-height: 1.6; margin: 0 0 32px; }
        .st-section { padding: 24px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 16px; margin-bottom: 16px; }
        .st-section h2 { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 14px; color: #8B5CF6; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 16px; }
        .st-row { display: flex; flex-wrap: wrap; gap: 12px; padding: 12px 0; border-bottom: 1px dashed #2A1F3D; }
        .st-row:last-of-type { border-bottom: none; }
        .st-row-label { flex: 0 0 200px; color: #9CA3B5; font-size: 13px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
        .st-row-value { flex: 1; color: #E5E7EB; font-size: 14px; word-break: break-word; }
        .st-hint { margin-top: 14px; color: #9CA3B5; font-size: 12px; line-height: 1.6; }
        .st-hint a { color: #8B5CF6; }
        .st-btn-ghost { display: inline-block; padding: 8px 14px; background: transparent; color: #C7CEDB; border: 1px solid #2A1F3D; border-radius: 8px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 12px; text-decoration: none; transition: all 0.2s; }
        .st-btn-ghost:hover { border-color: #8B5CF6; color: #8B5CF6; }
        .st-danger { border-color: rgba(239,68,68,0.35); }
        .st-danger h2 { color: #EF4444; }
        .st-back { margin-top: 24px; }
        .st-back a { color: #9CA3B5; font-size: 13px; text-decoration: none; }
        .st-back a:hover { color: #8B5CF6; }
      `}</style>
    </div>
  );
}
