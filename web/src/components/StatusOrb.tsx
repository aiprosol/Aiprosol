'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────
// StatusOrb — fixed pill bottom-left that morphs its content as you scroll
// through the page. Reflects what Arora is "doing" given the current
// section. Inspired by aicm.store's traveling search pill, adapted for
// our automation vibe.
// ─────────────────────────────────────────────────────────────────────────

interface SectionState {
  id: string;
  label: string;
  detail: string;
  icon: string;
}

const STATES: SectionState[] = [
  { id: 'idle',      label: 'System ready',     detail: 'Arora is online',                  icon: '◉' },
  { id: 'workflow',  label: 'Routing data',     detail: '5 nodes · 4 active links',         icon: '◬' },
  { id: 'stats',     label: 'Computing ROI',    detail: '340% avg · 35h reclaimed',         icon: '⊿' },
  { id: 'services',  label: 'Service catalogue', detail: '11 services online',               icon: '◆' },
  { id: 'products',  label: 'Catalogue ready',  detail: '19 toolkits · $17 → $997',         icon: '⊟' },
  { id: 'cases',     label: 'Reading proof',    detail: '7 industries served',              icon: '⊡' },
  { id: 'testimonials', label: 'Voices',         detail: '6 operator quotes',                icon: '❝' },
  { id: 'blog',      label: 'Field notes',      detail: '6 articles · streaming',           icon: '▾' },
  { id: 'final',     label: 'Ready to ship',    detail: 'Run the audit · 60 sec',           icon: '→' },
];

export function StatusOrb() {
  const [activeIdx, setActiveIdx] = useState(0);
  const observersRef = useRef<IntersectionObserver[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Map section ids on the homepage that this orb watches
    const sectionMap: Array<{ selector: string; idx: number }> = [
      { selector: '[data-orb-section="idle"]',         idx: 0 },
      { selector: '[data-orb-section="workflow"]',     idx: 1 },
      { selector: '[data-orb-section="stats"]',        idx: 2 },
      { selector: '[data-orb-section="services"]',     idx: 3 },
      { selector: '[data-orb-section="products"]',     idx: 4 },
      { selector: '[data-orb-section="cases"]',        idx: 5 },
      { selector: '[data-orb-section="testimonials"]', idx: 6 },
      { selector: '[data-orb-section="blog"]',         idx: 7 },
      { selector: '[data-orb-section="final"]',        idx: 8 },
    ];

    const cleanups: Array<() => void> = [];
    for (const { selector, idx } of sectionMap) {
      const el = document.querySelector(selector);
      if (!el) continue;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveIdx(idx);
        },
        { rootMargin: '-40% 0px -50% 0px', threshold: 0 },
      );
      obs.observe(el);
      cleanups.push(() => obs.disconnect());
    }
    observersRef.current = [];
    return () => cleanups.forEach(fn => fn());
  }, []);

  const state = STATES[activeIdx];

  return (
    <div className="so-wrap" aria-live="polite">
      <div className="so-pill">
        <span className="so-dot" aria-hidden />
        <AnimatePresence mode="wait">
          <motion.div
            key={state.id}
            className="so-content"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="so-icon" aria-hidden>{state.icon}</span>
            <span className="so-text">
              <strong>{state.label}</strong>
              <span>{state.detail}</span>
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      <style>{`
        .so-wrap { position: fixed; bottom: 24px; left: 24px; z-index: 95; pointer-events: none; }
        .so-pill {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          background: rgba(19, 16, 31, 0.72);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(139, 92, 246, 0.35);
          border-radius: 999px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), 0 0 14px rgba(139, 92, 246, 0.18);
          font-family: 'Inter', system-ui, sans-serif;
          color: #E5E7EB;
          pointer-events: auto;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          min-width: 220px;
          max-width: 320px;
        }
        .so-pill:hover { transform: translateY(-2px); }
        .so-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10B981;
          box-shadow: 0 0 10px #10B981;
          flex-shrink: 0;
          animation: so-pulse 2s ease-in-out infinite;
        }
        @keyframes so-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
        .so-content { display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1; }
        .so-icon {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 16px;
          color: #C084FC;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .so-text { display: flex; flex-direction: column; line-height: 1.2; min-width: 0; }
        .so-text strong {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 12px;
          color: #E5E7EB;
          letter-spacing: 0.02em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .so-text span {
          font-size: 10px;
          color: #9CA3B5;
          letter-spacing: 0.05em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        @media (max-width: 720px) {
          .so-wrap { display: none; }
        }
      `}</style>
    </div>
  );
}
