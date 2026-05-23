'use client';

import { useEffect } from 'react';

// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · Global error boundary
// Catches errors that escape the layout itself (rare). Must include
// its own <html>/<body> because the layout failed.
// ─────────────────────────────────────────────────────────────────────────

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[global-error] caught', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#0A0613', color: '#E5E7EB', fontFamily: 'system-ui, sans-serif', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 480, padding: 40, textAlign: 'center' }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>System failure</h1>
          <p style={{ color: '#9CA3B5', marginBottom: 24, lineHeight: 1.6 }}>
            Something at the root level broke — the page couldn&apos;t even render. We&apos;ve logged it.
            Try refreshing, or email <a href="mailto:srijanpaudelofficial@gmail.com" style={{ color: '#8B5CF6' }}>srijanpaudelofficial@gmail.com</a>.
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #8B5CF6, #C084FC)',
              color: '#0A0613',
              border: 'none',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
