'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · ABOVE-THE-FOLD PROOF STRIP
// Slim band between the hero CTAs and the workflow visualizer. We're in our
// charter-customer phase — no named clients yet — so the "proof" is what is
// genuinely real and verifiable about the operating model, never invented
// client metrics. Each point links to the live page that backs it.
// ─────────────────────────────────────────────────────────────────────────

const PROOFS = [
  { metric: '11-role', label: 'AI C-suite running live', co: 'Watch them work · /agents', slug: '/agents' },
  { metric: 'Public', label: 'log of every agent action', co: 'Audit it · /transparency', slug: '/transparency' },
  { metric: '35 hrs/wk', label: 'reclaim or we work free', co: '90-day guarantee · /pricing', slug: '/pricing' },
  { metric: '60-sec', label: 'ROI estimate, free', co: 'Run the ROI Audit', slug: '/roi-audit' },
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
          <span className="ps-eyebrow">Live</span>
          <span className="ps-divider" aria-hidden />
        </div>
        <div className="ps-rotator" key={idx}>
          {PROOFS.map((p, i) => (
            <Link
              key={p.slug}
              href={p.slug}
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
