'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { InlineSpinner } from '@/components/AnimatedLogo';

const ERROR_LABELS: Record<string, string> = {
  'missing-token': 'That sign-in link was missing its token. Try again.',
  'invalid-or-expired': 'That sign-in link is invalid or expired. Request a new one.',
  'google-not-configured': 'Google sign-in isn\'t set up on this site yet. Use email instead.',
  'missing-code-or-state': 'Google sign-in came back without a valid response. Try again.',
  'invalid-or-expired-state': 'Google sign-in took too long. Try again.',
  'google-token-exchange-failed': 'Google sign-in failed during token exchange. Try again.',
  'google-userinfo-failed': 'Google sign-in succeeded but we couldn\'t read your profile. Try again.',
  'email-not-verified': 'Your Google email isn\'t verified. Verify it with Google first.',
  'google-access_denied': 'You declined the Google permissions. No problem — use email instead.',
};

interface Props {
  mode?: 'signin' | 'signup';
  googleEnabled?: boolean;
}

export function LoginForm({ mode = 'signin', googleEnabled = false }: Props) {
  const params = useSearchParams();
  const next = params.get('next') || '/dashboard';
  const errorParam = params.get('error');
  const initialError = errorParam ? ERROR_LABELS[errorParam] || 'Sign-in failed. Try again.' : null;

  const isSignup = mode === 'signup';
  const heading = isSignup ? 'Create your account' : 'Sign in';
  const subheading = isSignup
    ? 'No password. We\'ll email you a magic link — click it and you\'re in.'
    : 'Magic link, no password. Enter your email and we\'ll send you a one-time sign-in link.';
  const submitLabel = isSignup ? 'Create account →' : 'Send sign-in link →';
  const altLink = isSignup
    ? { href: '/login', label: 'Already have an account? Sign in' }
    : { href: '/signup', label: "New here? Create an account" };

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [devLink, setDevLink] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.details?.fieldErrors?.email?.[0] || data?.error || 'Sign-in failed');
        return;
      }
      setSent(true);
      if (data.devLink) setDevLink(data.devLink);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="lg-page">
      <div className="lg-card">
        <div className="lg-eyebrow">Aiprosol · {isSignup ? 'Sign up' : 'Sign in'}</div>

        {!sent ? (
          <>
            <h1>{heading}</h1>
            <p className="lg-sub">{subheading}</p>

            {googleEnabled && (
              <>
                <a
                  href={`/api/auth/google?next=${encodeURIComponent(next)}`}
                  className="lg-google"
                >
                  <GoogleGlyph />
                  Continue with Google
                </a>
                <div className="lg-divider"><span>or with email</span></div>
              </>
            )}

            <form onSubmit={handleSubmit} className="lg-form">
              <label className="lg-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={submitting}
                className="lg-input"
                data-ph-mask
              />
              {error && <div className="lg-error">{error}</div>}
              <button type="submit" disabled={submitting || !email} className="lg-btn">
                {submitting ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                    <InlineSpinner label="Sending magic link" />
                    Sending…
                  </span>
                ) : submitLabel}
              </button>
            </form>

            <p className="lg-meta">
              {isSignup
                ? 'No account is created until you click the magic link in your email. We don\'t store passwords.'
                : "No account yet? Same flow — entering your email creates one. We don't store passwords."}
            </p>

            <p className="lg-back">
              <Link href={altLink.href}>{altLink.label}</Link>
              <span className="lg-back-sep"> · </span>
              <Link href="/login/help">Lost access?</Link>
              <span className="lg-back-sep"> · </span>
              <Link href="/">← Back to homepage</Link>
            </p>
          </>
        ) : (
          <>
            <h1>Check your inbox</h1>
            <p className="lg-sub">
              We just sent a sign-in link to <strong>{email}</strong>. It expires in 15 minutes.
            </p>
            <div className="lg-meta">
              <strong>Didn&apos;t get it?</strong>
              <ul style={{ margin: '8px 0 0 18px', padding: 0 }}>
                <li>Check spam &amp; promotions.</li>
                <li>Search for &quot;srijanpaudelofficial@gmail.com&quot;.</li>
                <li>Wait 60 seconds, then <button type="button" className="lg-link" onClick={() => { setSent(false); setDevLink(null); }}>try again</button>.</li>
              </ul>
            </div>

            {devLink && (
              <div className="lg-devlink">
                <strong>Dev mode</strong>
                <p style={{ margin: '6px 0 8px' }}>
                  Resend isn&apos;t configured locally, so here&apos;s the link directly:
                </p>
                <a href={devLink} className="lg-link" style={{ wordBreak: 'break-all' }}>
                  {devLink}
                </a>
              </div>
            )}

            <p className="lg-back">
              <Link href="/login/help">Lost access to this email?</Link>
              <span className="lg-back-sep"> · </span>
              <Link href="/">← Back to homepage</Link>
            </p>
          </>
        )}
      </div>

      <style>{`
        .lg-page { background: #0A0613; color: #E5E7EB; min-height: 100vh; padding: 140px 24px 80px; font-family: 'Inter', system-ui, sans-serif; display: flex; align-items: center; justify-content: center; }
        .lg-card { width: 100%; max-width: 480px; padding: 40px 36px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 20px; }
        @media (max-width: 640px) { .lg-card { padding: 32px 24px; } }
        .lg-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(139, 92, 246,0.08); border: 1px solid rgba(139, 92, 246,0.25); border-radius: 999px; color: #8B5CF6; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 18px; }
        .lg-card h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(26px, 3.4vw, 32px); line-height: 1.15; margin-bottom: 10px; }
        .lg-sub { color: #9CA3B5; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
        .lg-google { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px 16px; background: #fff; color: #1f2937; border: 1px solid #d1d5db; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 14px; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; text-decoration: none; margin-bottom: 14px; }
        .lg-google:hover { transform: translateY(-1px); box-shadow: 0 8px 22px rgba(0,0,0,0.35); }
        .lg-google svg { width: 18px; height: 18px; flex-shrink: 0; }
        .lg-divider { display: flex; align-items: center; gap: 10px; margin: 4px 0 14px; color: #9CA3B5; font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; }
        .lg-divider::before, .lg-divider::after { content: ''; flex: 1; height: 1px; background: #2A1F3D; }
        .lg-form { display: flex; flex-direction: column; gap: 12px; }
        .lg-label { font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #9CA3B5; }
        .lg-input { padding: 14px 16px; background: #0A0613; border: 1px solid #2A1F3D; border-radius: 10px; color: #E5E7EB; font-size: 15px; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
        .lg-input:focus { border-color: #8B5CF6; box-shadow: 0 0 0 3px rgba(139,92,246,0.15); }
        .lg-input:disabled { opacity: 0.6; }
        .lg-btn { padding: 14px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border: none; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 14px; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; box-shadow: 0 0 18px rgba(139,92,246,0.25); margin-top: 4px; }
        .lg-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 0 28px rgba(139,92,246,0.4); }
        .lg-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .lg-error { padding: 10px 14px; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; color: #FCA5A5; font-size: 13px; }
        .lg-meta { margin-top: 24px; padding: 14px 16px; background: rgba(139,92,246,0.04); border-left: 3px solid #8B5CF6; border-radius: 0 8px 8px 0; color: #C7CEDB; font-size: 13px; line-height: 1.6; }
        .lg-meta strong { display: block; font-family: 'Space Grotesk', sans-serif; color: #8B5CF6; font-size: 12px; margin-bottom: 4px; }
        .lg-meta li { margin: 4px 0; }
        .lg-link { background: none; border: none; padding: 0; color: #8B5CF6; cursor: pointer; text-decoration: underline; font: inherit; }
        .lg-back { margin-top: 20px; font-size: 13px; line-height: 1.7; }
        .lg-back a { color: #9CA3B5; text-decoration: none; }
        .lg-back a:hover { color: #8B5CF6; }
        .lg-back-sep { color: #2A1F3D; }
        .lg-devlink { margin-top: 18px; padding: 14px 16px; background: rgba(245,158,11,0.05); border: 1px solid rgba(245,158,11,0.3); border-radius: 8px; color: #E5E7EB; font-size: 12px; }
        .lg-devlink strong { display: block; color: #F59E0B; font-family: 'Space Grotesk', sans-serif; letter-spacing: 0.1em; text-transform: uppercase; font-size: 10px; }
      `}</style>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.6-5.6C33.7 6.2 29.1 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 18.9 13 24 13c3.1 0 5.8 1.2 7.9 3l5.6-5.6C33.7 6.2 29.1 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5 0 9.5-1.9 12.9-5l-6-4.9c-1.9 1.4-4.3 2.3-6.9 2.3-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39.5 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.4 5.6l6 4.9C40.5 35.7 44 30.4 44 24c0-1.3-.1-2.4-.4-3.5z"/>
    </svg>
  );
}
