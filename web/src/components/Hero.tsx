'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { CyclingHeadline } from './CyclingHeadline';
import { LiveAutomationTicker } from './LiveAutomationTicker';
import { HeroProofLine } from './HeroProofLine';

// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · CINEMATIC SCROLL-JACKED HERO
// 280vh tall section with sticky inner viewport. Three phases cross-fade
// as you scroll. Three.js sphere persists across phases. Inspired by the
// AICM scroll-locked search pill / Apple-style sticky reveals.
//   Phase 1 (0–33%):  Headline · CTAs · stats · live ticker
//   Phase 2 (33–66%): "Built by AI. Run by AI." · principles
//   Phase 3 (66–100%): Mini-workflow preview · "watch one fly" CTA
// ─────────────────────────────────────────────────────────────────────────

const AgentConstellation = dynamic(() => import('./AgentConstellation'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 z-0 pointer-events-none" />,
});

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 110, damping: 28, restDelta: 0.001 });

  // Phase 1 — visible 0 → 0.33
  const p1Opacity = useTransform(smooth, [0, 0.25, 0.36], [1, 1, 0]);
  const p1Y = useTransform(smooth, [0, 0.36], [0, -80]);
  const p1Blur = useTransform(smooth, [0, 0.36], [0, 8]);
  const p1Filter = useTransform(p1Blur, (v) => `blur(${v}px)`);

  // Phase 2 — visible 0.33 → 0.66
  const p2Opacity = useTransform(smooth, [0.32, 0.42, 0.6, 0.7], [0, 1, 1, 0]);
  const p2Y = useTransform(smooth, [0.32, 0.42, 0.7], [60, 0, -80]);
  const p2Blur = useTransform(smooth, [0.7, 0.78], [0, 8]);
  const p2Filter = useTransform(p2Blur, (v) => `blur(${v}px)`);

  // Phase 3 — visible 0.66 → 1.0
  const p3Opacity = useTransform(smooth, [0.65, 0.78, 1], [0, 1, 1]);
  const p3Y = useTransform(smooth, [0.65, 0.78], [60, 0]);

  // Sphere subtle scroll-driven scale (hint of motion as user scrolls)
  const sphereScale = useTransform(smooth, [0, 0.5, 1], [1, 1.15, 0.92]);

  // Indicator dots for which phase is active
  const dot1 = useTransform(smooth, [0, 0.3, 0.36], [1, 1, 0.3]);
  const dot2 = useTransform(smooth, [0.32, 0.42, 0.6, 0.7], [0.3, 1, 1, 0.3]);
  const dot3 = useTransform(smooth, [0.65, 0.78], [0.3, 1]);

  // Defer the three.js background constellation until AFTER first paint + idle.
  // It's a decorative background behind the headline; initialising it during
  // hydration steals the main thread in the LCP window (mobile LCP was 3.6s).
  // Gating it on requestIdleCallback (setTimeout fallback for Safari) keeps the
  // visual on every device but moves its heavy init off the critical path.
  // Skill rules: main-thread-budget, lazy-loading, transform-performance.
  const [showConstellation, setShowConstellation] = useState(false);
  useEffect(() => {
    const w = window as typeof window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (typeof w.requestIdleCallback === 'function') {
      const id = w.requestIdleCallback(() => setShowConstellation(true), { timeout: 2500 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = setTimeout(() => setShowConstellation(true), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      ref={sectionRef}
      data-orb-section="idle"
      className="relative"
      style={{ height: '280vh' }}
    >
      <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
        {/* Background agent constellation (subtle scale-on-scroll) */}
        <motion.div style={{ scale: sphereScale }} className="absolute inset-0">
          {showConstellation && <AgentConstellation />}
        </motion.div>

        <GridOverlay />
        <Aurora />

        {/* Phase 1 — Hero core */}
        <motion.div
          style={{ opacity: p1Opacity, y: p1Y, filter: p1Filter }}
          className="absolute inset-0 z-[2] flex items-center justify-center pt-20 pb-24 px-6 md:px-12"
        >
          <PhaseShell>
            <FadeIn delay={0}>
              <div className="eyebrow mb-7">
                <span className="w-1.5 h-1.5 bg-cyan rounded-full shadow-glow-sm animate-[pulse-cyan_2s_ease-in-out_infinite]" />
                Arora · AI CEO · Online
              </div>
            </FadeIn>

            <FadeIn delay={0.05}>
              <h1 className="hero-h1 font-display font-extrabold leading-[1.08] tracking-[-0.02em] mb-7 [text-wrap:balance] w-full">
                Automate the <CyclingHeadline />.
                <span className="hidden md:inline"><br /></span>{' '}
                Scale the <span className="text-grad">important</span>.
              </h1>
            </FadeIn>

            <FadeIn delay={0.1}>
              <p className="text-lg md:text-xl text-muted leading-[1.7] mb-10 max-w-[640px] mx-auto">
                Aiprosol designs, builds, and runs the AI automations that reclaim 35+ hours a week
                for your team — so you can stop firefighting and start scaling.
              </p>
            </FadeIn>

            <FadeIn delay={0.15}>
              {/* Single primary CTA above the fold (was two equal CTAs — splitting
                  intent hurts conversion). Secondary "Browse 19 Products" demoted
                  to a quiet text link below the primary action. */}
              <div className="flex flex-col items-center gap-3 mb-10">
                <MagneticLink href="/roi-audit" variant="primary">
                  Get Your Free ROI Audit
                  <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                </MagneticLink>
                <a
                  href="/digital-products"
                  className="text-sm text-muted hover:text-cyan transition-colors"
                >
                  Or browse the 19 self-serve products →
                </a>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <HeroProofLine />
            </FadeIn>

            {/* Stats grid removed from the hero — full numbers band lives in
                <StatsBanner /> below the fold so the hero stays focused on the
                single conversion ask above. */}

            <FadeIn delay={0.24}>
              <LiveAutomationTicker />
            </FadeIn>
          </PhaseShell>
        </motion.div>

        {/* Phase 2 — Built by AI · Run by AI */}
        <motion.div
          style={{ opacity: p2Opacity, y: p2Y, filter: p2Filter }}
          className="absolute inset-0 z-[2] flex items-center justify-center pt-20 pb-24 px-6 md:px-12"
        >
          <PhaseShell>
            <div className="eyebrow mb-7">
              <span className="w-1.5 h-1.5 bg-cyan rounded-full shadow-glow-sm animate-[pulse-cyan_2s_ease-in-out_infinite]" />
              The first AI-led consultancy
            </div>

            <h2 className="font-display font-extrabold text-[clamp(28px,6vw,76px)] leading-[1.04] mb-8 [text-wrap:balance]">
              Built by <span className="text-grad">AI</span>.{' '}
              <br />
              Run by <span className="text-grad">AI</span>.
            </h2>

            <p className="text-lg md:text-xl text-muted leading-[1.7] mb-10 max-w-[680px] mx-auto">
              Eleven C-suite roles. Ten of them AI agents, coordinated by Arora. One human chairman
              for strategic calls. Every automation we ship is one we already run inside Aiprosol itself.
            </p>

            <div className="grid grid-cols-3 gap-6 max-w-[720px] mx-auto">
              <Pillar num="01" title="Self-serve first" />
              <Pillar num="02" title="Numbers · not hype" />
              <Pillar num="03" title="90-day reclaim guarantee" href="/terms#guarantee" />
            </div>
          </PhaseShell>
        </motion.div>

        {/* Phase 3 — Watch one fly */}
        <motion.div
          style={{ opacity: p3Opacity, y: p3Y }}
          className="absolute inset-0 z-[2] flex items-center justify-center pt-20 pb-24 px-6 md:px-12"
        >
          <PhaseShell>
            <div className="eyebrow mb-7">
              <span className="w-1.5 h-1.5 bg-cyan rounded-full shadow-glow-sm animate-[pulse-cyan_2s_ease-in-out_infinite]" />
              Watch one fly
            </div>

            <h2 className="font-display font-extrabold text-[clamp(28px,6vw,76px)] leading-[1.04] mb-8 [text-wrap:balance]">
              From inbound to invoice <br />
              <span className="text-grad">in under 60 seconds</span>.
            </h2>

            <p className="text-lg text-muted leading-[1.7] mb-10 max-w-[640px] mx-auto">
              Lead lands. Arora qualifies, scores, books. CRM updated. Email sent. Calendar held.
              Slack pinged. Zero human touchpoints. Audit trail end-to-end.
            </p>

            <MiniFlow />

            <div className="mt-10 flex justify-center">
              <Link
                href="#workflow"
                className="inline-flex items-center gap-2 px-8 py-4 bg-grad text-bg rounded-[10px] font-display font-bold text-sm shadow-glow-md hover:shadow-glow-lg hover:-translate-y-0.5 transition-all"
              >
                See the full architecture <span aria-hidden>↓</span>
              </Link>
            </div>
          </PhaseShell>
        </motion.div>

        {/* Phase indicator (3 vertical dots on the right edge) */}
        <div className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 z-[5] hidden md:flex flex-col gap-3 pointer-events-none">
          <motion.span style={{ opacity: dot1 }} className="w-2 h-2 rounded-full bg-cyan shadow-glow-sm" />
          <motion.span style={{ opacity: dot2 }} className="w-2 h-2 rounded-full bg-cyan shadow-glow-sm" />
          <motion.span style={{ opacity: dot3 }} className="w-2 h-2 rounded-full bg-cyan shadow-glow-sm" />
        </div>

        {/* Scroll cue — fades out as you progress */}
        <ScrollCue smooth={smooth} />
      </div>
    </section>
  );
}

// ────── Helpers ──────

function PhaseShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-[2] max-w-[940px] mx-auto w-full text-center flex flex-col items-center">
      {children}
    </div>
  );
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  // Stagger entrance via CSS animation so SSR-rendered content is always visible.
  // This avoids the Framer "stuck at initial" hydration trap inside absolutely-positioned phases.
  return (
    <div
      className="hero-fade-in"
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

function Pillar({ num, title, href }: { num: string; title: string; href?: string }) {
  const inner = (
    <>
      <div className="font-display font-extrabold text-2xl text-grad mb-2">{num}</div>
      <div className="font-display font-bold text-sm text-text">{title}</div>
    </>
  );
  if (href) {
    return (
      <Link
        href={href}
        className="block p-5 rounded-2xl bg-card/60 backdrop-blur-md border border-border text-left hover:border-cyan transition-colors"
      >
        {inner}
      </Link>
    );
  }
  return (
    <div className="p-5 rounded-2xl bg-card/60 backdrop-blur-md border border-border text-left">
      {inner}
    </div>
  );
}

function MiniFlow() {
  return (
    <div className="flex items-center justify-center gap-3 md:gap-5 flex-wrap max-w-[760px] mx-auto">
      {[
        { l: 'Lead', i: '◳' },
        { l: 'Arora', i: 'A', primary: true },
        { l: 'CRM', i: '◰' },
        { l: 'Email', i: '✉' },
        { l: 'Booking', i: '◷' },
      ].map((node, idx) => (
        <div key={node.l} className="flex items-center gap-2 md:gap-3">
          <div
            className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl backdrop-blur-md border transition-all ${
              node.primary
                ? 'bg-grad text-bg border-transparent shadow-glow-md'
                : 'bg-card/70 border-border text-text'
            }`}
          >
            <span className={`font-display font-extrabold text-lg ${node.primary ? '' : 'text-cyan'}`}>{node.i}</span>
            <span className="text-[10px] uppercase tracking-[0.1em] font-display font-bold">{node.l}</span>
          </div>
          {idx < 4 && (
            <div className="hidden md:block">
              <FlowArrow delay={idx * 0.3} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function FlowArrow({ delay = 0 }: { delay?: number }) {
  return (
    <svg width="36" height="14" viewBox="0 0 36 14" className="opacity-70">
      <line x1="0" y1="7" x2="32" y2="7" stroke="#8B5CF6" strokeWidth="1.5" strokeOpacity="0.5" />
      <polygon points="30,3 36,7 30,11" fill="#8B5CF6" opacity="0.7" />
      {/* Animated particle along the line */}
      <circle r="2.5" fill="#C084FC">
        <animate
          attributeName="cx"
          from="0"
          to="32"
          dur="1.6s"
          begin={`${delay}s`}
          repeatCount="indefinite"
        />
        <animate
          attributeName="cy"
          values="7;7"
          dur="1.6s"
          begin={`${delay}s`}
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}

function ScrollCue({ smooth }: { smooth: MotionValue<number> }) {
  const opacity = useTransform(smooth, [0, 0.1], [1, 0]);
  return (
    <motion.div
      style={{ opacity }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[5] flex flex-col items-center gap-2 pointer-events-none"
    >
      <span className="text-[10px] text-muted uppercase tracking-[0.18em] font-display font-bold">
        Scroll
      </span>
      <span className="w-[1px] h-8 bg-gradient-to-b from-cyan to-transparent" />
    </motion.div>
  );
}

// ────── Subtle grid overlay ──────
function GridOverlay() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 z-[1] pointer-events-none"
      style={{
        backgroundImage:
          'linear-gradient(rgba(42,31,61,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(42,31,61,0.55) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
        maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
      }}
    />
  );
}

// ────── Aurora gradient blobs ──────
function Aurora() {
  return (
    <>
      <div
        aria-hidden
        className="absolute z-0 rounded-full pointer-events-none"
        style={{
          width: 700, height: 700, top: -240, left: -140,
          background: 'radial-gradient(circle, rgba(139, 92, 246,0.18), transparent 70%)',
          filter: 'blur(80px)',
          animation: 'aurora-1 22s ease-in-out infinite alternate',
        }}
      />
      <div
        aria-hidden
        className="absolute z-0 rounded-full pointer-events-none"
        style={{
          width: 600, height: 600, bottom: -180, right: -120,
          background: 'radial-gradient(circle, rgba(192, 132, 252,0.14), transparent 70%)',
          filter: 'blur(80px)',
          animation: 'aurora-2 28s ease-in-out infinite alternate',
        }}
      />
    </>
  );
}

// ────── Animated stat counter ──────
function StatCounter({ to, suffix = '', label, duration = 1600 }: {
  to: number; suffix?: string; label: string; duration?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVal(to);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const start = performance.now();
          const tick = (t: number) => {
            const p = Math.min((t - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(Math.round(to * eased));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          obs.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [to, duration]);

  return (
    <div ref={ref}>
      <div className="font-display font-extrabold text-4xl text-grad leading-none mb-1.5">
        {val}{suffix}
      </div>
      <div className="text-[11px] text-muted font-medium uppercase tracking-[0.1em]">
        {label}
      </div>
    </div>
  );
}

// ────── Magnetic link button ──────
function MagneticLink({
  href, children, variant,
}: {
  href: string;
  children: React.ReactNode;
  variant: 'primary' | 'secondary';
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [t, setT] = useState('');
  const reduced = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    reduced.current =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      window.matchMedia('(pointer: coarse)').matches;
  }, []);

  const onMove = (e: React.MouseEvent) => {
    if (reduced.current) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    if (Math.hypot(x, y) < 100) {
      setT(`translate(${x * 0.18}px, ${y * 0.18}px)`);
    }
  };

  const baseClass =
    'group inline-flex items-center gap-2.5 px-8 py-4 font-display font-bold text-sm rounded-[10px] cursor-pointer';
  const primaryClass = 'bg-grad text-bg shadow-glow-md hover:shadow-glow-lg';
  const secondaryClass =
    'bg-transparent text-text border border-border hover:border-cyan hover:text-cyan transition-colors';

  return (
    <Link
      ref={ref}
      href={href}
      className={`${baseClass} ${variant === 'primary' ? primaryClass : secondaryClass}`}
      onMouseMove={onMove}
      onMouseLeave={() => setT('')}
      style={{
        transform: t,
        transition: t ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {children}
    </Link>
  );
}
