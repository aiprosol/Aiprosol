'use client';

import { motion, type Variants } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────
// RevealOnScroll — Framer Motion wrapper that fades + slides children up
// when they enter the viewport. Used to wrap homepage sections so the
// page feels alive on scroll instead of static-document.
// ─────────────────────────────────────────────────────────────────────────

const variants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

interface Props {
  children: React.ReactNode;
  delay?: number;
  /** Distance to trigger before element fully enters viewport (negative = earlier). Default '-80px'. */
  margin?: string;
}

export function RevealOnScroll({ children, delay = 0, margin = '-80px' }: Props) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: margin as `${number}px` }}
      variants={variants}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
