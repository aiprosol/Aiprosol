'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · HERO PROOF LINE
// Compact rotating proof element that lives INSIDE Hero Phase 1 (above the
// stats row). Gives first-time visitors a case-study reference without
// needing to scroll past the 280vh scroll-jacked hero. Auto-cycles every
// 5 seconds. Each metric deep-links to the relevant case study.
// ─────────────────────────────────────────────────────────────────────────

const PROOFS = [
  {
    metric: '78% ↓',
    label: 'contract-review hours',
    co: 'Hargreaves & Sterling (Legal)',
    slug: 'hargreaves-sterling',
  },
  {
    metric: '6 hr → 3 min',
    label: 'lead response',
    co: 'Meridian Property (Real Estate)',
    slug: 'meridian',
  },
  {
    metric: '$95k / yr',
    label: 'stockout saving',
    co: 'Thornfield Stores (Retail)',
    slug: 'thornfield',
  },
  {
    metric: '4.1% → 0.6%',
    label: 'defect rate',
    co: 'Vortex Components (Manufacturing)',
    slug: 'vortex',
  },
];

const ROTATE_MS = 5000;

export function HeroProofLine() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % PROOFS.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [paused]);

  const cur = PROOFS[idx];

  return (
    <div
      className="hpl-wrap"
      aria-live="polite"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Link href={`/case-studies/${cur.slug}`} className="hpl-pill">
        <span className="hpl-eyebrow">Real ROI</span>
        <span className="hpl-divider" aria-hidden />
        <span className="hpl-metric">{cur.metric}</span>
        <span className="hpl-label">{cur.label}</span>
        <span className="hpl-co">· {cur.co}</span>
        <span className="hpl-arrow" aria-hidden>→</span>
      </Link>

      <div className="hpl-dots" role="tablist" aria-label="Rotate proof points">
        {PROOFS.map((p, i) => (
          <button
            key={p.slug}
            role="tab"
            aria-selected={i === idx}
            aria-label={`${p.metric} ${p.label}`}
            onClick={() => setIdx(i)}
            className={`hpl-dot ${i === idx ? 'hpl-dot-on' : ''}`}
          />
        ))}
      </div>

      <style>{`
        .hpl-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          margin: 0 auto 22px;
          width: 100%;
          max-width: 760px;
        }
        .hpl-pill {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 10px 22px;
          background: rgba(19, 16, 31, 0.7);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 999px;
          backdrop-filter: blur(8px);
          text-decoration: none;
          transition: border-color 0.25s, transform 0.25s;
          font-family: 'Inter', system-ui, sans-serif;
          max-width: 100%;
        }
        .hpl-pill:hover { border-color: #C084FC; transform: translateY(-1px); }

        .hpl-eyebrow {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #C084FC;
          flex-shrink: 0;
        }
        .hpl-divider {
          width: 1px;
          height: 14px;
          background: rgba(139, 92, 246, 0.35);
          flex-shrink: 0;
        }
        .hpl-metric {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 800;
          color: #10B981;
          font-size: 14px;
          flex-shrink: 0;
        }
        .hpl-label {
          color: #E5E7EB;
          font-size: 13px;
          flex-shrink: 0;
        }
        .hpl-co {
          color: #9CA3B5;
          font-size: 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .hpl-arrow {
          color: #C084FC;
          font-weight: 700;
          font-size: 14px;
          margin-left: 4px;
          transition: transform 0.22s;
          flex-shrink: 0;
        }
        .hpl-pill:hover .hpl-arrow { transform: translateX(3px); }

        .hpl-dots {
          display: inline-flex;
          gap: 6px;
        }
        .hpl-dot {
          width: 6px;
          height: 6px;
          padding: 0;
          border: none;
          background: rgba(139, 92, 246, 0.25);
          border-radius: 50%;
          cursor: pointer;
          transition: background 0.25s, box-shadow 0.25s;
        }
        .hpl-dot:hover { background: rgba(192, 132, 252, 0.55); }
        .hpl-dot-on {
          background: #C084FC;
          box-shadow: 0 0 6px rgba(192, 132, 252, 0.7);
        }

        @media (max-width: 640px) {
          .hpl-pill { padding: 8px 14px; gap: 8px; border-radius: 16px; flex-wrap: wrap; }
          .hpl-co { display: none; }
          .hpl-eyebrow { display: none; }
          .hpl-divider { display: none; }
        }
      `}</style>
    </div>
  );
}
