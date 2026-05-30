'use client';

import { useState } from 'react';

// "Notify me when it launches" — email capture for pre-launch products.
// Posts to the existing newsletter endpoint, tagged by product so we can build
// a per-product waitlist. We never charge for a product that hasn't shipped.
export default function NotifyMe({ slug, shipDate }: { slug: string; shipDate?: string | null }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || state === 'loading') return;
    setState('loading');
    try {
      const r = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: `preorder:${slug}` }),
      });
      setState(r.ok ? 'done' : 'error');
    } catch {
      setState('error');
    }
  }

  if (state === 'done') {
    return (
      <div style={{ color: '#6EE7B7', fontSize: 15, fontWeight: 600, padding: '10px 0' }}>
        ✓ You&apos;re on the list — we&apos;ll email you the moment it launches{shipDate ? ` (${shipDate})` : ''}.
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        aria-label="Email for launch notification"
        style={{ flex: '1 1 220px', minWidth: 200, padding: '13px 16px', borderRadius: 10, border: '1px solid #2A1F3D', background: '#13101F', color: '#E5E7EB', fontSize: 15, outline: 'none' }}
      />
      <button
        type="submit"
        disabled={state === 'loading'}
        style={{ padding: '13px 22px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 15, color: '#0A0613', background: 'linear-gradient(135deg, #8B5CF6, #C084FC)', boxShadow: '0 0 22px rgba(139,92,246,0.3)', whiteSpace: 'nowrap' }}
      >
        {state === 'loading' ? 'Adding…' : '🔔 Notify me'}
      </button>
      {state === 'error' && <span style={{ color: '#FCA5A5', fontSize: 13, width: '100%' }}>Something went wrong — please try again.</span>}
    </form>
  );
}
