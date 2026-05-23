'use client';

// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · /checkout — Stripe Checkout redirect bridge
// Reads ?product=<slug> or ?plan=<starter|growth|enterprise>, POSTs to
// /api/checkout, then redirects to the returned Stripe Session URL.
// On 503 (Stripe not configured) shows a friendly fallback CTA → /contact.
// On any other error surfaces a retry + contact path.
// Survives ad-blockers stripping query params: if no slug, shows the same
// fallback rather than a 404.
// ─────────────────────────────────────────────────────────────────────────

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { track, Events } from '@/lib/analytics';

type Status =
  | { kind: 'loading' }
  | { kind: 'redirecting' }
  | { kind: 'not-configured'; message: string }
  | { kind: 'missing-slug' }
  | { kind: 'error'; message: string };

function CheckoutInner() {
  const params = useSearchParams();
  const product = params.get('product') || undefined;
  const plan = params.get('plan') as 'starter' | 'growth' | 'enterprise' | null;
  const slug = product || plan || null;

  const [status, setStatus] = useState<Status>({ kind: 'loading' });

  useEffect(() => {
    if (!slug) {
      setStatus({ kind: 'missing-slug' });
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(product ? { product } : { plan }),
        });

        const data = await res.json().catch(() => ({}));

        if (cancelled) return;

        if (res.status === 503) {
          track(Events.CheckoutSessionFailed, { slug, reason: 'stripe-not-configured' });
          setStatus({
            kind: 'not-configured',
            message:
              data?.message ||
              "Stripe is not yet configured for this site — let's set you up directly.",
          });
          return;
        }

        if (!res.ok || !data?.url) {
          track(Events.CheckoutSessionFailed, {
            slug,
            status: res.status,
            reason: data?.error || 'unknown',
          });
          setStatus({
            kind: 'error',
            message: data?.message || data?.error || `Checkout failed (HTTP ${res.status}).`,
          });
          return;
        }

        track(Events.CheckoutSessionCreated, { slug, session_id: data.id });
        setStatus({ kind: 'redirecting' });
        window.location.href = data.url;
      } catch (err) {
        if (cancelled) return;
        track(Events.CheckoutSessionFailed, {
          slug,
          reason: err instanceof Error ? err.message : 'network-error',
        });
        setStatus({
          kind: 'error',
          message: 'Network error reaching checkout. Please try again or contact us.',
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug, product, plan]);

  return (
    <div className="ck-page">
      <div className="ck-card">
        {(status.kind === 'loading' || status.kind === 'redirecting') && (
          <>
            <div className="ck-spinner" aria-hidden="true" />
            <h1>{status.kind === 'redirecting' ? 'Redirecting to Stripe…' : 'Preparing checkout…'}</h1>
            <p>One moment while we set up your secure payment session.</p>
          </>
        )}

        {status.kind === 'not-configured' && (
          <>
            <div className="ck-icon">✦</div>
            <h1>Let&apos;s do this manually.</h1>
            <p>
              Stripe checkout isn&apos;t live yet on this site. Drop us a line and Arora will send you
              an invoice link within the hour — same price, same product, same instant delivery.
            </p>
            <div className="ck-actions">
              <Link
                href={`/contact?topic=purchase&item=${encodeURIComponent(slug || '')}`}
                className="ck-btn-primary"
              >
                Contact us to purchase →
              </Link>
              <Link href="/digital-products" className="ck-btn-secondary">
                Back to products
              </Link>
            </div>
          </>
        )}

        {status.kind === 'missing-slug' && (
          <>
            <div className="ck-icon">?</div>
            <h1>No product selected.</h1>
            <p>
              We couldn&apos;t tell which product you&apos;re trying to buy — your browser may have
              stripped the link parameters. Pick a product from the catalogue and try again.
            </p>
            <div className="ck-actions">
              <Link href="/digital-products" className="ck-btn-primary">
                Browse products
              </Link>
              <Link href="/contact" className="ck-btn-secondary">
                Contact us
              </Link>
            </div>
          </>
        )}

        {status.kind === 'error' && (
          <>
            <div className="ck-icon">!</div>
            <h1>Checkout hit a snag.</h1>
            <p>{status.message}</p>
            <div className="ck-actions">
              <Link
                href={`/contact?topic=purchase&item=${encodeURIComponent(slug || '')}`}
                className="ck-btn-primary"
              >
                Contact us to purchase →
              </Link>
              <Link href="/digital-products" className="ck-btn-secondary">
                Back to products
              </Link>
            </div>
          </>
        )}
      </div>
      <Styles />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="ck-page">
          <div className="ck-card">
            <div className="ck-spinner" aria-hidden="true" />
            <h1>Preparing checkout…</h1>
          </div>
          <Styles />
        </div>
      }
    >
      <CheckoutInner />
    </Suspense>
  );
}

function Styles() {
  return (
    <style>{`
      .ck-page { background: #0A0613; color: #E5E7EB; min-height: 100vh; padding: 140px 24px 80px; font-family: 'Inter', system-ui, sans-serif; display: flex; align-items: center; justify-content: center; }
      .ck-card { max-width: 520px; padding: 48px 32px; background: #13101F; border: 1px solid rgba(139, 92, 246,0.4); border-radius: 24px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 48px rgba(139, 92, 246,0.18); }
      .ck-icon { width: 64px; height: 64px; margin: 0 auto 24px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 32px; box-shadow: 0 0 32px rgba(139, 92, 246,0.45); }
      .ck-spinner { width: 56px; height: 56px; margin: 0 auto 24px; border: 3px solid rgba(139, 92, 246,0.18); border-top-color: #8B5CF6; border-radius: 50%; animation: ck-spin 0.8s linear infinite; }
      @keyframes ck-spin { to { transform: rotate(360deg); } }
      .ck-card h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 28px; margin-bottom: 12px; color: #E5E7EB; }
      .ck-card p { color: #9CA3B5; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
      .ck-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
      .ck-btn-primary { padding: 12px 24px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; text-decoration: none; }
      .ck-btn-secondary { padding: 12px 24px; background: transparent; color: #E5E7EB; border: 1px solid #2A1F3D; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; text-decoration: none; transition: all 0.2s; }
      .ck-btn-secondary:hover { border-color: #8B5CF6; color: #8B5CF6; }
    `}</style>
  );
}
