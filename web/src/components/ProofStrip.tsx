'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · ABOVE-THE-FOLD PROOF STRIP
// Slim band that sits between the hero phase 1 CTAs and the workflow
// visualizer. Cycles through three of the strongest case-study metrics.
// Until we have signable client logos, the proof is the metrics
// themselves — each links to the relevant case study.
// ─────────────────────────────────────────────────────────────────────────

const PROOFS = [
  { metric: '78% ↓', label: 'Contract-review hours', co: 'Legal · Hargreaves & Sterling', slug: 'hargreaves-sterling' },
  { metric: '6hr → 3 min', label: 'Lead response time', co: 'Real Estate · Meridian Property', slug: 'meridian' },
  { metric: '4.1% → 0.6%', label: 'Defect rate', co: 'Manufacturing · Vortex Components', slug: 'vortex' },
  { metric: '$95k', label: 'Annual stockout saving', co: 'Retail · Thornfield Stores', slug: 'thornfield' },
];

const ROTATE_MS = 4000;

export function ProofStrip() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % PROOFS.length), ROTATE_MS);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="ps-wrap" aria-live="polite">
      <div className="ps-strip">
        <div className="ps-static">
          <span className="ps-eyebrow">Proof</span>
          <span className="ps-divider" aria-hidden />
        </div>
        <div className="ps-rotator" key={idx}>
          {PROOFS.map((p, i) => (
            <Link
              key={p.slug}
              href={`/case-studies/${p.slug}`}
              className={`ps-item ${i === idx ? 'ps-item-on' : ''}`}
              aria-hidden={i !== idx}
              tabIndex={i === idx ? 0 : -1}
            >
              <span className="ps-metric">{p.metric}</span>
              <span className="ps-label">{p.label}</span>
              <span className="ps-co">· {p.co}</span>
              <span className="ps-arrow" aria-hidden>→</span>
            </Link>
          ))}
        </div>
        <div className="ps-dots" role="tablist" aria-label="Cycle proof points">
          {PROOFS.map((p, i) => (
            <button
              key={p.slug}
              role="tab"
              aria-selected={i === idx}
              aria-label={`${p.metric} ${p.label}`}
              onClick={() => setIdx(i)}
              className={`ps-dot ${i === idx ? 'ps-dot-on' : ''}`}
            />
          ))}
        </div>
      </div>
      <style>{`
        .ps-wrap { padding: 0 24px; margin-top: -12px; margin-bottom: 24px; pointer-events: auto; }
        .ps-strip { max-width: 1100px; margin: 0 auto; padding: 12px 18px; display: flex; align-items: center; gap: 18px; background: rgba(19, 16, 31, 0.55); border: 1px solid rgba(139, 92, 246, 0.22); border-radius: 999px; backdrop-filter: blur(8px); font-family: 'Inter', system-ui, sans-serif; }
        @media (max-width: 720px) { .ps-strip { gap: 10px; padding: 10px 14px; border-radius: 16px; } }
        .ps-static { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .ps-eyebrow { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: #C084FC; }
        .ps-divider { width: 1px; height: 14px; background: rgba(139, 92, 246, 0.3); }
        .ps-rotator { position: relative; flex: 1; min-height: 22px; overflow: hidden; }
        .ps-item { position: absolute; inset: 0; display: flex; align-items: center; gap: 10px; opacity: 0; transform: translateY(8px); transition: opacity 0.4s, transform 0.4s; pointer-events: none; text-decoration: none; }
        .ps-item-on { opacity: 1; transform: translateY(0); pointer-events: auto; }
        .ps-metric { font-family: 'Space Grotesk', sans-serif; font-weight: 800; color: #10B981; font-size: 14px; }
        .ps-label { color: #E5E7EB; font-size: 13px; }
        .ps-co { color: #9CA3B5; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        @media (max-width: 720px) { .ps-co { display: none; } }
        .ps-arrow { color: #C084FC; font-weight: 700; font-size: 14px; margin-left: auto; transition: transform 0.22s; }
        .ps-item:hover .ps-arrow { transform: translateX(3px); }

        .ps-dots { display: inline-flex; gap: 6px; flex-shrink: 0; }
        .ps-dot { width: 6px; height: 6px; padding: 0; border: none; background: rgba(139, 92, 246, 0.2); border-radius: 50%; cursor: pointer; transition: all 0.25s; }
        .ps-dot:hover { background: rgba(192, 132, 252, 0.5); }
        .ps-dot-on { background: #C084FC; box-shadow: 0 0 6px #C084FC; }
      `}</style>
    </div>
  );
}
