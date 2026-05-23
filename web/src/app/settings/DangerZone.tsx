'use client';

import { useState } from 'react';

export function DangerZone({ email }: { email: string }) {
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = confirm.trim().toLowerCase() === email.toLowerCase();

  async function deleteAccount() {
    if (!ready || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/account/delete', { method: 'POST' });
      if (!res.ok) {
        setError(`Delete failed (${res.status}). Try signing out and back in.`);
        setSubmitting(false);
        return;
      }
      // Server clears the cookie and the redirect lands us at /
      window.location.href = '/?deleted=1';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      setSubmitting(false);
    }
  }

  return (
    <div>
      <p className="dz-text">
        Deleting your account immediately ends this session and removes the cookie tying you to{' '}
        <strong>{email}</strong>. We don&apos;t persist account profiles yet, so there&apos;s nothing further
        to purge — but any future order history or downloads tied to this email would also go.
      </p>
      <label className="dz-label">
        Type your email to confirm
        <input
          type="text"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          placeholder={email}
          className="dz-input"
          autoComplete="off"
          spellCheck={false}
        />
      </label>
      {error && <div className="dz-error">{error}</div>}
      <button
        type="button"
        className="dz-btn"
        disabled={!ready || submitting}
        onClick={deleteAccount}
      >
        {submitting ? 'Deleting…' : 'Permanently delete this account'}
      </button>

      <style>{`
        .dz-text { color: #C7CEDB; font-size: 13px; line-height: 1.7; margin: 0 0 14px; }
        .dz-text strong { color: #EF4444; }
        .dz-label { display: block; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #9CA3B5; margin-bottom: 6px; }
        .dz-input { display: block; width: 100%; padding: 12px 14px; background: #0A0613; border: 1px solid rgba(239,68,68,0.35); border-radius: 8px; color: #E5E7EB; font-size: 14px; outline: none; margin-top: 6px; }
        .dz-input:focus { border-color: #EF4444; box-shadow: 0 0 0 3px rgba(239,68,68,0.15); }
        .dz-error { margin-top: 10px; padding: 10px 14px; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; color: #FCA5A5; font-size: 13px; }
        .dz-btn { margin-top: 14px; padding: 12px 18px; background: transparent; color: #FCA5A5; border: 1px solid rgba(239,68,68,0.5); border-radius: 8px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; cursor: pointer; transition: all 0.2s; }
        .dz-btn:hover:not(:disabled) { background: rgba(239,68,68,0.1); border-color: #EF4444; color: #EF4444; }
        .dz-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
