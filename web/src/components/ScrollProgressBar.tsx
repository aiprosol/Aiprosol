'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────
// ScrollProgressBar — fixed 3px bar at the top with a violet→fuchsia→violet
// gradient that fills as you scroll the page. Spring-smoothed for buttery
// motion. Mounted once globally in layout.tsx.
// ─────────────────────────────────────────────────────────────────────────

export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <>
      <motion.div
        aria-hidden
        style={{ scaleX: smooth, transformOrigin: '0% 50%' }}
        className="fixed top-0 left-0 right-0 h-[3px] z-[200] pointer-events-none"
      >
        <div className="h-full w-full bg-gradient-to-r from-[#8B5CF6] via-[#D946EF] via-50% to-[#8B5CF6] shadow-[0_0_12px_rgba(139,92,246,0.6)]" />
      </motion.div>
      {/* Subtle leading glow that follows the head of the bar */}
      <motion.div
        aria-hidden
        style={{ scaleX: smooth, transformOrigin: '0% 50%' }}
        className="fixed top-0 left-0 right-0 h-[3px] z-[199] pointer-events-none"
      >
        <div className="h-full w-full bg-gradient-to-r from-transparent via-transparent to-[#F0ABFC]/80" />
      </motion.div>
    </>
  );
}
