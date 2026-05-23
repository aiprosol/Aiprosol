'use client';

import { useEffect, useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────
// CHARTER BANNER — first-10-customer 30% off offer
// Visible site-wide above the nav. Dismissible (persists in localStorage).
// Auto-hides once 10 customers have used the code (when that data is wired).
//
// The code: FOUNDER30 — 30% off any product or first-month managed plan.
// ─────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'aiprosol_charter_dismissed_v1';

export function CharterBanner() {
  const [hidden, setHidden] = useState(true); // hidden by default to avoid hydration mismatch

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const dismissed = localStorage.getItem(STORAGE_KEY) === '1';
    setHidden(dismissed);
  }, []);

  const dismiss = () => {
    setHidden(true);
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* private mode */ }
  };

  if (hidden) return null;

  return (
    <div className="cb-bar" role="region" aria-label="Charter pricing offer">
      <div className="cb-inner">
        <span className="cb-tag">Charter Offer · first 10 customers</span>
        <span className="cb-text">
          <strong>30% off</strong> any digital product or your first month of a managed plan with code{' '}
          <code className="cb-code">FOUNDER30</code>. Limited to the first 10 paying customers.
        </span>
        <button onClick={dismiss} className="cb-close" aria-label="Dismiss charter banner">×</button>
      </div>
      <style>{`
        .cb-bar {
          position: relative; z-index: 200;
          background: linear-gradient(90deg, #8B5CF6 0%, #C084FC 100%);
          color: #0A0613;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 13px;
          padding: 8px 16px;
          border-bottom: 1px solid rgba(0,0,0,0.1);
        }
        .cb-inner {
          max-width: 1280px; margin: 0 auto;
          display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
          justify-content: center;
        }
        .cb-tag {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 10px; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.14em;
          padding: 3px 9px;
          background: rgba(10, 6, 19, 0.85);
          color: #C084FC;
          border-radius: 999px;
          white-space: nowrap;
        }
        .cb-text { font-weight: 500; }
        .cb-text strong { font-weight: 800; }
        .cb-code {
          background: rgba(10, 6, 19, 0.85);
          color: #C084FC;
          padding: 2px 8px;
          border-radius: 4px;
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.05em;
        }
        .cb-close {
          background: rgba(10, 6, 19, 0.18);
          color: #0A0613;
          border: 0;
          width: 22px; height: 22px;
          border-radius: 999px;
          font-size: 16px; line-height: 18px;
          cursor: pointer;
          margin-left: 4px;
        }
        .cb-close:hover { background: rgba(10, 6, 19, 0.35); }
        @media (max-width: 640px) {
          .cb-bar { font-size: 12px; padding: 7px 10px; }
          .cb-inner { gap: 8px; }
          .cb-tag { font-size: 9px; }
        }
      `}</style>
    </div>
  );
}
