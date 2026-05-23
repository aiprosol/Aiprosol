'use client';

import { useEffect } from 'react';
import Link from 'next/link';

// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · Route-level error boundary
// Catches unhandled errors in any page and renders this fallback.
// ─────────────────────────────────────────────────────────────────────────

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[error.tsx] caught', error);
  }, [error]);

  return (
    <div className="er-page">
      <div className="er-card">
        <div className="er-eyebrow">Something broke</div>
        <h1>An unexpected error happened.</h1>
        <p>
          The page tripped on something I couldn&apos;t recover from. The team has been alerted.
          Try the buttons below — and if the issue persists, drop a line to{' '}
          <a href="mailto:srijanpaudelofficial@gmail.com">srijanpaudelofficial@gmail.com</a>.
        </p>
        {error.digest && (
          <div className="er-digest">
            Error reference: <code>{error.digest}</code>
          </div>
        )}
        <div className="er-actions">
          <button className="er-btn-primary" onClick={() => reset()}>Try again</button>
          <Link href="/" className="er-btn-secondary">Back to home</Link>
        </div>
      </div>
      <style>{`
        .er-page { background: #0A0613; color: #E5E7EB; min-height: 100vh; padding: 140px 24px 80px; font-family: 'Inter', system-ui, sans-serif; display: flex; align-items: center; justify-content: center; }
        .er-card { max-width: 520px; padding: 48px 32px; background: #13101F; border: 1px solid rgba(239,68,68,0.3); border-radius: 24px; text-align: center; }
        .er-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.3); border-radius: 999px; color: #EF4444; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 16px; }
        .er-card h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(24px, 3.5vw, 32px); margin-bottom: 16px; line-height: 1.1; }
        .er-card p { color: #9CA3B5; font-size: 15px; line-height: 1.6; margin-bottom: 20px; }
        .er-card a { color: #8B5CF6; }
        .er-digest { display: inline-block; padding: 8px 14px; background: rgba(139, 92, 246,0.04); border: 1px solid rgba(139, 92, 246,0.2); border-radius: 8px; font-size: 12px; color: #9CA3B5; margin-bottom: 24px; }
        .er-digest code { color: #8B5CF6; font-family: ui-monospace, monospace; }
        .er-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .er-btn-primary { padding: 12px 24px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border: none; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; cursor: pointer; }
        .er-btn-secondary { padding: 12px 24px; background: transparent; color: #E5E7EB; border: 1px solid #2A1F3D; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; text-decoration: none; transition: all 0.2s; }
        .er-btn-secondary:hover { border-color: #8B5CF6; color: #8B5CF6; }
      `}</style>
    </div>
  );
}
