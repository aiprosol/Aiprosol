import Link from 'next/link';
import { SITE } from '@/lib/site-config';

export const metadata = {
  title: 'Sign-in help · Aiprosol',
  description: 'Lost access to your email or magic link? Here\'s how to recover.',
};

export default function LoginHelpPage() {
  return (
    <div className="hp-page">
      <div className="hp-card">
        <div className="hp-eyebrow">Sign-in help</div>
        <h1>Can&apos;t sign in?</h1>
        <p className="hp-sub">
          Aiprosol uses passwordless sign-in — there&apos;s nothing to forget. But here&apos;s how
          to handle every recovery case.
        </p>

        <section className="hp-section">
          <h2>I didn&apos;t get the magic-link email</h2>
          <ul>
            <li>Check spam, promotions, and updates folders.</li>
            <li>Search for <strong>{SITE.fromEmail}</strong> (the sender) or <strong>&quot;Aiprosol&quot;</strong>.</li>
            <li>Wait 60 seconds, then <Link href="/login">request another link</Link> — old links don&apos;t cancel new ones.</li>
            <li>If your inbox provider is strict (corporate Outlook, Proofpoint, Mimecast), the email may be quarantined. Ask IT to release it.</li>
          </ul>
        </section>

        <section className="hp-section">
          <h2>The link says &quot;invalid or expired&quot;</h2>
          <p>Magic links expire after 15 minutes for security. <Link href="/login">Request a new one</Link>.</p>
        </section>

        <section className="hp-section">
          <h2>I lost access to the email I signed up with</h2>
          <p>
            Email us at <a href={`mailto:${SITE.email}`}>{SITE.email}</a> from any address you can prove
            ownership of (e.g. on the same domain). Include:
          </p>
          <ul>
            <li>The original email you signed up with</li>
            <li>Any order ID or receipt from a previous purchase</li>
            <li>The new email address you want associated</li>
          </ul>
          <p className="hp-hint">We process these manually within 24 hours.</p>
        </section>

        <section className="hp-section">
          <h2>I want to sign out everywhere</h2>
          <p>
            Sign in with the magic-link flow on the device you currently have, then go to
            <Link href="/settings"> Settings</Link> and use the <em>Sign out</em> action. Sessions on
            other devices expire after 30 days; we&apos;ll add &quot;sign out everywhere&quot; once we have
            a customer base to support it.
          </p>
        </section>

        <section className="hp-section">
          <h2>Why no password?</h2>
          <p>
            Passwords are the #1 cause of account takeovers and reset-loop fatigue. Magic links
            and Google sign-in skip both. There&apos;s nothing to forget, nothing to phish, and we never
            store anything sensitive on our end.
          </p>
        </section>

        <p className="hp-back">
          <Link href="/login">← Back to sign-in</Link>
        </p>
      </div>

      <style>{`
        .hp-page { background: #0A0613; color: #E5E7EB; min-height: 100vh; padding: 140px 24px 80px; font-family: 'Inter', system-ui, sans-serif; }
        .hp-card { max-width: 720px; margin: 0 auto; padding: 40px 36px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 20px; }
        @media (max-width: 640px) { .hp-card { padding: 32px 24px; } }
        .hp-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(139, 92, 246,0.08); border: 1px solid rgba(139, 92, 246,0.25); border-radius: 999px; color: #8B5CF6; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 18px; }
        .hp-card h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(26px, 3.5vw, 34px); line-height: 1.15; margin: 0 0 10px; }
        .hp-sub { color: #9CA3B5; font-size: 15px; line-height: 1.6; margin: 0 0 28px; }
        .hp-section { padding: 22px; background: rgba(139, 92, 246,0.04); border: 1px solid #2A1F3D; border-radius: 14px; margin-bottom: 14px; }
        .hp-section h2 { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 15px; color: #C084FC; margin: 0 0 10px; }
        .hp-section p { color: #C7CEDB; font-size: 14px; line-height: 1.7; margin: 0 0 8px; }
        .hp-section ul { color: #C7CEDB; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 18px; }
        .hp-section a { color: #8B5CF6; }
        .hp-section strong { color: #E5E7EB; }
        .hp-hint { font-size: 12px; color: #9CA3B5; font-style: italic; }
        .hp-back { margin-top: 24px; }
        .hp-back a { color: #9CA3B5; font-size: 13px; text-decoration: none; }
        .hp-back a:hover { color: #8B5CF6; }
      `}</style>
    </div>
  );
}
