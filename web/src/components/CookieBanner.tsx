'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { readConsent, writeConsent } from '@/lib/consent';

// AIPROSOL · Cookie consent banner
//
// Renders only when consent is 'unknown'. Floats at the bottom of the
// viewport. Two clear actions: Accept · Decline. Single link to /cookies
// for the full policy.
//
// The PostHogProvider checks readConsent() on mount and only initialises
// when status === 'accepted'. It also listens for the 'aiprosol:consent'
// event so a click on Accept activates analytics without a page reload.

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Defer one tick so SSR + initial hydration match (always render nothing
    // until we know the client-side consent state).
    const t = setTimeout(() => {
      setShow(readConsent() === 'unknown');
    }, 50);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  const accept = () => { writeConsent('accepted'); setShow(false); };
  const decline = () => { writeConsent('declined'); setShow(false); };

  return (
    <div
      className="cb-wrap"
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
    >
      <div className="cb-card">
        <div className="cb-body">
          <div className="cb-eyebrow">Cookies</div>
          <p className="cb-text">
            We use a small set of cookies for analytics and session insights so we can keep
            improving Aiprosol. Nothing personal is shared with third parties beyond what&apos;s
            described in our{' '}
            <Link href="/cookies" className="cb-link">Cookie Policy</Link>.
          </p>
        </div>
        <div className="cb-actions">
          <button type="button" className="cb-decline" onClick={decline}>Decline</button>
          <button type="button" className="cb-accept" onClick={accept}>Accept</button>
        </div>
      </div>
      <style>{`
        .cb-wrap {
          position: fixed;
          bottom: 18px;
          left: 18px;
          right: 18px;
          z-index: 200;
          display: flex;
          justify-content: center;
          pointer-events: none;
          animation: cb-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes cb-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cb-card {
          pointer-events: auto;
          max-width: 720px;
          width: 100%;
          padding: 18px 22px;
          background: rgba(19, 16, 31, 0.97);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(139, 92, 246, 0.35);
          border-radius: 16px;
          box-shadow: 0 18px 42px rgba(0, 0, 0, 0.55), 0 0 32px rgba(139, 92, 246, 0.15);
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 18px;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .cb-body { flex: 1 1 360px; min-width: 0; }
        .cb-eyebrow {
          display: inline-block;
          padding: 3px 10px;
          background: rgba(139, 92, 246, 0.12);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 999px;
          color: #C084FC;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .cb-text {
          color: #C7CEDB;
          font-size: 13px;
          line-height: 1.6;
          margin: 0;
        }
        .cb-link { color: #8B5CF6; text-decoration: underline; }
        .cb-link:hover { color: #C084FC; }
        .cb-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }
        .cb-decline, .cb-accept {
          padding: 10px 18px;
          border-radius: 10px;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .cb-decline {
          background: transparent;
          color: #C7CEDB;
          border: 1px solid #2A1F3D;
        }
        .cb-decline:hover { color: #E5E7EB; border-color: #8B5CF6; }
        .cb-accept {
          background: linear-gradient(135deg, #8B5CF6, #C084FC);
          color: #0A0613;
          border: none;
          box-shadow: 0 0 18px rgba(139, 92, 246, 0.3);
        }
        .cb-accept:hover { transform: translateY(-1px); box-shadow: 0 0 26px rgba(139, 92, 246, 0.45); }
        @media (max-width: 640px) {
          .cb-wrap { bottom: 12px; left: 12px; right: 12px; }
          .cb-card { padding: 16px 18px; gap: 14px; }
          .cb-actions { width: 100%; }
          .cb-decline, .cb-accept { flex: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .cb-wrap { animation: none; }
          .cb-accept:hover, .cb-decline:hover { transform: none; }
        }
      `}</style>
    </div>
  );
}
