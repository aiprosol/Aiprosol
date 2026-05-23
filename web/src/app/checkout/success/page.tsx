'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getProductBySlug } from '@/lib/content';
import type { Product } from '@/types';

// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · CHECKOUT SUCCESS · /checkout/success
// Stripe redirects here with ?session_id=...&slug=...&kind=product|plan
// The slug + Tier-1 includedInBundles data drives a post-purchase upsell.
// Rule: surface the smallest-priced bundle the just-bought product belongs
// to that is priced ABOVE what they paid (next tier up only — we don't
// recommend a smaller bundle than what they just bought).
// ─────────────────────────────────────────────────────────────────────────

function pickNextTierUpsell(product?: Product): Product | undefined {
  if (!product || !product.includedInBundles || product.includedInBundles.length === 0) return undefined;
  const candidate = [...product.includedInBundles]
    .sort((a, b) => a.bundlePrice - b.bundlePrice)
    .find(b => b.bundlePrice > product.price);
  return candidate ? getProductBySlug(candidate.bundleSlug) : undefined;
}

function SuccessInner() {
  const params = useSearchParams();
  const sessionId = params.get('session_id');
  const slug = params.get('slug') || '';
  const kind = params.get('kind') || 'product';

  const purchased = useMemo(() => slug ? getProductBySlug(slug) : undefined, [slug]);
  const upsell = useMemo(() => kind === 'product' ? pickNextTierUpsell(purchased) : undefined, [purchased, kind]);

  return (
    <div className="ck-page">
      <div className="ck-wrap">
        <div className="ck-card">
          <div className="ck-check">✓</div>
          <h1>You&apos;re in.</h1>
          {purchased ? (
            <p>Payment received for <strong>{purchased.name}</strong>. A confirmation email with your download link is on its way to your inbox right now.</p>
          ) : (
            <p>Payment received. A confirmation email is on its way to your inbox — including your download link or onboarding instructions.</p>
          )}
          {sessionId && <div className="ck-session">Session: <code>{sessionId.slice(0, 24)}…</code></div>}
          <div className="ck-actions">
            {purchased ? (
              <Link href={`/products/${purchased.slug}`} className="ck-btn-primary">View your product</Link>
            ) : (
              <Link href="/" className="ck-btn-primary">Back to home</Link>
            )}
            <Link href="/digital-products" className="ck-btn-secondary">Browse more products</Link>
          </div>
        </div>

        {upsell && (
          <div className="ck-upsell">
            <div className="ck-upsell-eyebrow">⤴ One time only — bundle upgrade</div>
            <h2 className="ck-upsell-title">
              Already bought {purchased!.name}? <span className="ck-upsell-grad">Upgrade to {upsell.name}</span> for the full collection.
            </h2>
            <p className="ck-upsell-sub">{upsell.shortDescription}</p>

            <div className="ck-upsell-math">
              <div className="ck-upsell-row">
                <span className="ck-upsell-row-label">You paid today</span>
                <span className="ck-upsell-row-value">${purchased!.price}</span>
              </div>
              <div className="ck-upsell-row">
                <span className="ck-upsell-row-label">{upsell.name}</span>
                <span className="ck-upsell-row-value">${upsell.price}</span>
              </div>
              <div className="ck-upsell-row ck-upsell-row-net">
                <span className="ck-upsell-row-label">Upgrade differential</span>
                <span className="ck-upsell-row-value">${upsell.price - purchased!.price}</span>
              </div>
            </div>

            {upsell.outcomeMetrics && upsell.outcomeMetrics.length > 0 && (
              <div className="ck-upsell-metrics">
                {upsell.outcomeMetrics.slice(0, 3).map((m, i) => (
                  <div key={i} className="ck-upsell-metric">
                    <span className="ck-upsell-metric-v">{m.value}</span>
                    <span className="ck-upsell-metric-k">{m.label}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="ck-upsell-cta">
              <Link href={`/products/${upsell.slug}`} className="ck-upsell-btn">
                See what&apos;s in {upsell.name} →
              </Link>
              <p className="ck-upsell-note">
                We won&apos;t double-charge for what you already own — reply to the order email and the team will reconcile your purchase against the upgrade.
              </p>
            </div>
          </div>
        )}
      </div>
      <Styles />
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="ck-page"><div className="ck-card">Loading…</div><Styles /></div>}>
      <SuccessInner />
    </Suspense>
  );
}

function Styles() {
  return (
    <style>{`
      .ck-page { background: #0A0613; color: #E5E7EB; min-height: 100vh; padding: 140px 24px 80px; font-family: 'Inter', system-ui, sans-serif; display: flex; align-items: flex-start; justify-content: center; }
      .ck-wrap { max-width: 720px; width: 100%; display: flex; flex-direction: column; gap: 24px; }

      .ck-card { padding: 48px 32px; background: #13101F; border: 1px solid rgba(139, 92, 246,0.4); border-radius: 24px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 48px rgba(139, 92, 246,0.18); }
      .ck-check { width: 64px; height: 64px; margin: 0 auto 24px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 32px; box-shadow: 0 0 32px rgba(139, 92, 246,0.45); animation: ck-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
      @keyframes ck-pop { from { transform: scale(0); } to { transform: scale(1); } }
      .ck-card h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 32px; margin-bottom: 12px; color: #E5E7EB; }
      .ck-card p { color: #9CA3B5; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
      .ck-card p strong { color: #C084FC; }
      .ck-session { font-size: 11px; color: #4a6280; font-family: ui-monospace, monospace; margin-bottom: 24px; }
      .ck-session code { background: #0A0613; padding: 2px 8px; border-radius: 4px; }
      .ck-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
      .ck-btn-primary { padding: 12px 24px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; text-decoration: none; }
      .ck-btn-secondary { padding: 12px 24px; background: transparent; color: #E5E7EB; border: 1px solid #2A1F3D; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; text-decoration: none; transition: all 0.2s; }
      .ck-btn-secondary:hover { border-color: #8B5CF6; color: #8B5CF6; }

      .ck-upsell { padding: 32px 28px; background: linear-gradient(180deg, rgba(192,132,252,0.06), rgba(139,92,246,0.02)); border: 1px solid rgba(192,132,252,0.3); border-radius: 20px; }
      .ck-upsell-eyebrow { font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; color: #C084FC; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 10px; }
      .ck-upsell-title { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 22px; line-height: 1.3; margin-bottom: 8px; color: #E5E7EB; }
      .ck-upsell-grad { background: linear-gradient(135deg, #8B5CF6, #C084FC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .ck-upsell-sub { color: #9CA3B5; font-size: 14px; line-height: 1.6; margin-bottom: 20px; }

      .ck-upsell-math { background: #0A0613; border: 1px solid #2A1F3D; border-radius: 12px; padding: 14px 18px; margin-bottom: 20px; }
      .ck-upsell-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 13px; }
      .ck-upsell-row-label { color: #9CA3B5; }
      .ck-upsell-row-value { font-family: 'Space Grotesk', sans-serif; font-weight: 700; color: #E5E7EB; }
      .ck-upsell-row-net { border-top: 1px solid #2A1F3D; margin-top: 4px; padding-top: 10px; }
      .ck-upsell-row-net .ck-upsell-row-label { color: #C084FC; font-weight: 600; }
      .ck-upsell-row-net .ck-upsell-row-value { background: linear-gradient(135deg, #8B5CF6, #C084FC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 18px; }

      .ck-upsell-metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 22px; }
      @media (max-width: 540px) { .ck-upsell-metrics { grid-template-columns: 1fr; } }
      .ck-upsell-metric { padding: 12px; background: #0A0613; border: 1px solid #2A1F3D; border-radius: 10px; text-align: center; }
      .ck-upsell-metric-v { display: block; font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 18px; background: linear-gradient(135deg, #8B5CF6, #C084FC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .ck-upsell-metric-k { display: block; font-size: 11px; color: #9CA3B5; margin-top: 4px; line-height: 1.4; }

      .ck-upsell-cta { text-align: center; }
      .ck-upsell-btn { display: inline-block; padding: 14px 24px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; text-decoration: none; box-shadow: 0 0 24px rgba(139, 92, 246, 0.25); }
      .ck-upsell-note { color: #9CA3B5; font-size: 12px; margin-top: 12px; line-height: 1.6; }
    `}</style>
  );
}
