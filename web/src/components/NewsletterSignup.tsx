'use client';

import { useState } from 'react';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) return;
    setSubmitting(true);
    try {
      // Dedicated newsletter endpoint — keeps subscribers out of the lead
      // pipeline so they get newsletter content, not sales follow-up.
      await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'Footer' }),
      });
    } catch {}
    setDone(true);
    setSubmitting(false);
  };

  return (
    <div className="ns-wrap">
      <h4>Field notes from the automation frontier</h4>
      <p>Twice a month. Tactical. No vendor pitches. Unsubscribe anytime.</p>
      {done ? (
        <div className="ns-done">
          <span>✓</span> You&apos;re in. First issue lands in your inbox shortly.
        </div>
      ) : (
        <div className="ns-row">
          <input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={submitting}
            onKeyDown={e => e.key === 'Enter' && submit()}
          />
          <button onClick={submit} disabled={submitting || !email}>
            {submitting ? '…' : 'Subscribe →'}
          </button>
        </div>
      )}
      <style>{`
        .ns-wrap { padding: 20px; background: rgba(139, 92, 246,0.04); border: 1px solid rgba(139, 92, 246,0.2); border-radius: 14px; }
        .ns-wrap h4 { font-family: 'Space Grotesk', sans-serif; font-size: 13px; color: #8B5CF6; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 6px; font-weight: 700; }
        .ns-wrap p { color: #9CA3B5; font-size: 12px; line-height: 1.5; margin-bottom: 12px; }
        .ns-row { display: flex; gap: 6px; }
        .ns-row input { flex: 1; padding: 9px 12px; background: #0A0613; border: 1px solid #2A1F3D; color: #E5E7EB; font-size: 13px; border-radius: 8px; outline: none; font-family: 'Inter', system-ui, sans-serif; }
        .ns-row input:focus { border-color: #8B5CF6; }
        .ns-row input::placeholder { color: #4a6280; }
        .ns-row button { padding: 0 14px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border: none; border-radius: 8px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 12px; cursor: pointer; white-space: nowrap; }
        .ns-row button:disabled { opacity: 0.4; cursor: not-allowed; }
        .ns-done { display: flex; align-items: center; gap: 8px; padding: 10px; background: rgba(139, 92, 246,0.06); border: 1px solid rgba(139, 92, 246,0.3); border-radius: 8px; font-size: 13px; color: #8B5CF6; }
        .ns-done span { width: 22px; height: 22px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; }
      `}</style>
    </div>
  );
}
