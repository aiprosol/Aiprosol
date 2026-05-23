'use client';

import { useEffect, useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────
// LiveAutomationTicker — projected workload model.
// NOT a real-time meter. The number is the cumulative-runs estimate from
// our pilot benchmarks, animated up at a slow rate so visitors get a sense
// of scale. Honestly labelled as "Projected" so a refresh doesn't give a
// trust-busting "wait, the live counter went down" effect. We will swap
// to a real meter once we have a backend writing to Vercel KV. See
// /how-we-measure for the formula.
// ─────────────────────────────────────────────────────────────────────────

const SEED = 42381;

export function LiveAutomationTicker() {
  const [count, setCount] = useState(SEED);
  const [tick, setTick] = useState(false);

  useEffect(() => {
    let mounted = true;
    const schedule = () => {
      const delay = 8000 + Math.random() * 7000; // 8–15s
      const timer = setTimeout(() => {
        if (!mounted) return;
        const inc = 1 + Math.floor(Math.random() * 4); // +1 to +4
        setCount(c => c + inc);
        setTick(true);
        setTimeout(() => mounted && setTick(false), 600);
        schedule();
      }, delay);
      return timer;
    };
    const t = schedule();
    return () => {
      mounted = false;
      clearTimeout(t);
    };
  }, []);

  return (
    <div className="lat-pill">
      <span className={`lat-dot ${tick ? 'lat-dot-pulse' : ''}`} aria-hidden />
      <span className="lat-label">Projected</span>
      <span className="lat-divider" aria-hidden />
      <span className="lat-count">
        <strong>{count.toLocaleString()}</strong>
        {' '}
        <span className="lat-tail">cumulative runs · pilot benchmarks</span>
      </span>
      <style>{`
        .lat-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 16px;
          background: rgba(19, 16, 31, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 999px;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 13px;
          color: #C7CEDB;
          box-shadow: 0 0 14px rgba(139, 92, 246, 0.15);
        }
        .lat-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #F59E0B;
          box-shadow: 0 0 8px #F59E0B;
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .lat-dot-pulse { transform: scale(1.6); }
        .lat-label {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #F59E0B;
        }
        .lat-divider {
          width: 1px;
          height: 14px;
          background: rgba(139, 92, 246, 0.3);
        }
        .lat-count strong {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          color: #C084FC;
          font-variant-numeric: tabular-nums;
          margin-right: 6px;
        }
        .lat-tail {
          color: #9CA3B5;
        }
        @media (max-width: 640px) {
          .lat-tail { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .lat-dot-pulse { transform: none; }
        }
      `}</style>
    </div>
  );
}
