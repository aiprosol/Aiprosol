'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────
// AGENT CONSTELLATION
// Replaces the generic Three.js sphere with a live network of the 11
// C-suite roles. Arora (AI CEO) sits at the center; the other 10 satellites
// orbit her on a single ring. Cyan pulses travel from Arora to a random
// satellite every ~1.8s, and the receiving node flashes briefly. Says
// exactly what the brand says: "Built by AI. Run by AI. 11 roles."
//
// Cursor reactive: subtle parallax on the whole network, magnetic drift on
// satellites near the cursor, click anywhere on the hero background → Arora
// burst-pulses all 10 satellites in sequence (clicks on links / buttons are
// ignored so we don't fire a burst right as the user navigates away).
//
// Implementation notes after review:
// • CSS `transform: translate(...px ...px)` (not SVG attribute transforms) —
//   reliable transitions across Chrome / Firefox / Safari.
// • Arora "pop" on click runs via Web Animations API on a ref, so it never
//   interrupts the inner-circle breathing animation.
// • Cursor state is throttled by a movement-delta gate (>3 SVG units), so
//   tiny mouse jitter doesn't trigger full re-renders.
// • Lines (chords / spokes) are anchored to the static satellite positions,
//   not the drifted ones. The visual gap when a satellite is pulled is
//   small and intentional — keeps cross-browser line-attribute transitions
//   off the table entirely.
// • Parallax lives inside the parent's scroll-driven scale wrapper. That
//   coupling is sub-1% in net visual translation given PARALLAX_STRENGTH —
//   intentionally accepted to avoid restructuring the Hero.
// ─────────────────────────────────────────────────────────────────────────

type Role = { abbr: string; name: string };

const ROLES: Role[] = [
  { abbr: 'COO', name: 'Operations' },
  { abbr: 'CMO', name: 'Marketing' },
  { abbr: 'CTO', name: 'Technology' },
  { abbr: 'CRO', name: 'Revenue' },
  { abbr: 'CCO', name: 'Customer Success' },
  { abbr: 'CPM', name: 'Product' },
  { abbr: 'CLO', name: 'Legal' },
  { abbr: 'CPO', name: 'Partnerships' },
  { abbr: 'DA',  name: 'Data + Analytics' },
  { abbr: 'CHM', name: 'Chairman · Human' },
];

const R = 220;
const satellites = ROLES.map((role, i) => {
  const angle = (i / ROLES.length) * Math.PI * 2 - Math.PI / 2;
  return {
    ...role,
    x: Math.cos(angle) * R,
    y: Math.sin(angle) * R,
    isHuman: role.abbr === 'CHM',
  };
});

const CHORDS = satellites.flatMap((_, i) => [3, 4].map((step) => ({
  from: i,
  to: (i + step) % satellites.length,
})));

interface Pulse { id: number; target: number }

const PULSE_DURATION = 1400;
const MAGNET_RADIUS = 140;
const MAGNET_STRENGTH = 0.22;
const PARALLAX_STRENGTH = 0.025;
const CURSOR_DELTA_GATE = 3; // SVG units — ignore micro-jitter

export default function AgentConstellation() {
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const aroraRef = useRef<SVGGElement>(null);
  const idRef = useRef(0);
  const reducedMotionRef = useRef(false);

  // Auto pulses (background activity) + reduced-motion change listener
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = mq.matches;

    let timeout: ReturnType<typeof setTimeout> | undefined;

    const start = () => {
      if (reducedMotionRef.current) return;
      const spawn = () => {
        const target = Math.floor(Math.random() * satellites.length);
        const id = ++idRef.current;
        setPulses((prev) => [...prev, { id, target }]);
        setTimeout(() => setActiveNode(target), PULSE_DURATION - 80);
        setTimeout(() => setActiveNode((cur) => (cur === target ? null : cur)), PULSE_DURATION + 600);
        setTimeout(() => setPulses((prev) => prev.filter((p) => p.id !== id)), PULSE_DURATION + 60);
        timeout = setTimeout(spawn, 1500 + Math.random() * 900);
      };
      timeout = setTimeout(spawn, 600);
    };

    const stop = () => {
      if (timeout) clearTimeout(timeout);
      timeout = undefined;
    };

    const onChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
      if (e.matches) {
        stop();
        setPulses([]);
        setActiveNode(null);
      } else {
        start();
      }
    };

    start();
    mq.addEventListener('change', onChange);
    return () => {
      stop();
      mq.removeEventListener('change', onChange);
    };
  }, []);

  // Cursor reactivity: parallax + magnetic drift + click burst
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let raf = 0;
    let pending: { clientX: number; clientY: number } | null = null;
    let last: { x: number; y: number } | null = null;

    const flush = () => {
      raf = 0;
      if (!pending || !svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      if (rect.width === 0) return;
      const x = ((pending.clientX - rect.left) / rect.width) * 640 - 320;
      const y = ((pending.clientY - rect.top) / rect.height) * 640 - 320;
      // Delta gate — only re-render when meaningfully moved
      if (last && Math.hypot(x - last.x, y - last.y) < CURSOR_DELTA_GATE) return;
      last = { x, y };
      setCursor({ x, y });
    };

    const onMove = (e: MouseEvent) => {
      pending = { clientX: e.clientX, clientY: e.clientY };
      if (!raf) raf = requestAnimationFrame(flush);
    };

    // pointerout on documentElement is more reliable than mouseleave on window
    const onPointerOut = (e: PointerEvent) => {
      if (e.relatedTarget === null) {
        last = null;
        setCursor(null);
      }
    };

    const onClick = (e: MouseEvent) => {
      // Skip clicks on interactive elements — those are user navigation,
      // not "interact with the background art" intent.
      const t = e.target as Element | null;
      if (t?.closest('a, button, [role="button"], input, textarea, select, label')) return;

      // Pop Arora via Web Animations API — no React re-render, no breath interruption
      if (aroraRef.current && !reducedMotionRef.current) {
        aroraRef.current.animate(
          [
            { transform: 'scale(1)' },
            { transform: 'scale(1.18)', offset: 0.3 },
            { transform: 'scale(1)' },
          ],
          { duration: 520, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
        );
      }

      // Burst-fire pulses to all 10 satellites with a small ripple stagger
      satellites.forEach((_, i) => {
        setTimeout(() => {
          const id = ++idRef.current;
          setPulses((prev) => [...prev, { id, target: i }]);
          setTimeout(() => setActiveNode(i), PULSE_DURATION - 80);
          setTimeout(() => setActiveNode((cur) => (cur === i ? null : cur)), PULSE_DURATION + 600);
          setTimeout(() => setPulses((prev) => prev.filter((p) => p.id !== id)), PULSE_DURATION + 60);
        }, i * 35);
      });
    };

    window.addEventListener('mousemove', onMove);
    document.documentElement.addEventListener('pointerout', onPointerOut);
    window.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.documentElement.removeEventListener('pointerout', onPointerOut);
      window.removeEventListener('click', onClick);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Magnetic drift for a single satellite based on current cursor
  const driftFor = (sx: number, sy: number) => {
    if (!cursor) return { dx: 0, dy: 0 };
    const dx = cursor.x - sx;
    const dy = cursor.y - sy;
    const dist = Math.hypot(dx, dy);
    if (dist > MAGNET_RADIUS) return { dx: 0, dy: 0 };
    const t = 1 - dist / MAGNET_RADIUS;
    const strength = t * t * MAGNET_STRENGTH; // ease-out
    return { dx: dx * strength, dy: dy * strength };
  };

  const parallax = cursor
    ? { tx: cursor.x * PARALLAX_STRENGTH, ty: cursor.y * PARALLAX_STRENGTH }
    : { tx: 0, ty: 0 };

  // 10 keyframes (one per satellite target). Memoised — they're static after mount.
  const travelKeyframes = useMemo(
    () =>
      satellites
        .map(
          (s, i) => `
          @keyframes ac-travel-${i} {
            0%   { transform: translate(0px, 0px) scale(0.6); opacity: 0; }
            12%  { opacity: 1; transform: translate(${s.x * 0.12}px, ${s.y * 0.12}px) scale(1); }
            88%  { opacity: 1; transform: translate(${s.x * 0.92}px, ${s.y * 0.92}px) scale(1); }
            100% { transform: translate(${s.x}px, ${s.y}px) scale(0.4); opacity: 0; }
          }`,
        )
        .join('\n'),
    [],
  );

  return (
    <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
      <svg
        ref={svgRef}
        viewBox="-320 -320 640 640"
        className="w-[min(94vw,820px)] h-[min(94vw,820px)] opacity-95"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="ac-bg-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.42" />
            <stop offset="35%" stopColor="#8B5CF6" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="ac-arora-fill" cx="35%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#E0F2FE" />
            <stop offset="35%" stopColor="#22D3EE" />
            <stop offset="75%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#4C1D95" />
          </radialGradient>
          <radialGradient id="ac-arora-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.55" />
            <stop offset="60%" stopColor="#8B5CF6" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
          </radialGradient>
          <filter id="ac-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Backdrop glow (no parallax — anchors the composition) */}
        <circle r="300" fill="url(#ac-bg-glow)" />

        {/* Parallax wrapper — entire network drifts subtly with the cursor */}
        <g
          style={{
            transform: `translate(${parallax.tx}px, ${parallax.ty}px)`,
            transition: 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {/* Chord lines — anchored to static satellite positions */}
          {CHORDS.map((c, idx) => {
            const a = satellites[c.from];
            const b = satellites[c.to];
            return (
              <line
                key={`chord-${idx}`}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke="#8B5CF6" strokeOpacity="0.10" strokeWidth="1"
              />
            );
          })}

          {/* Spokes from Arora to each satellite — anchored to static positions */}
          {satellites.map((s, i) => (
            <line
              key={`spoke-${i}`}
              x1={0} y1={0} x2={s.x} y2={s.y}
              stroke={activeNode === i ? '#22D3EE' : '#8B5CF6'}
              strokeOpacity={activeNode === i ? 0.65 : 0.28}
              strokeWidth={activeNode === i ? 1.5 : 1}
              style={{ transition: 'stroke 240ms, stroke-opacity 240ms, stroke-width 240ms' }}
            />
          ))}

          {/* Travelling pulses */}
          {pulses.map((p) => (
            <g
              key={p.id}
              style={{
                animation: `ac-travel-${p.target} 1400ms cubic-bezier(0.22, 1, 0.36, 1) forwards`,
              }}
            >
              <circle r="9" fill="#22D3EE" opacity="0.25" filter="url(#ac-soft)" />
              <circle r="3.5" fill="#22D3EE" />
            </g>
          ))}

          {/* Satellite nodes + labels */}
          {satellites.map((s, i) => {
            const active = activeNode === i;
            const d = driftFor(s.x, s.y);
            return (
              <g
                key={s.abbr}
                style={{
                  transform: `translate(${s.x + d.dx}px, ${s.y + d.dy}px)`,
                  transition: 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              >
                {active && (
                  <circle r="22" fill="#22D3EE" opacity="0.18" className="ac-flash" />
                )}
                <circle
                  r={active ? 11 : 7}
                  fill="#0B0817"
                  stroke={s.isHuman ? '#22D3EE' : '#8B5CF6'}
                  strokeWidth={active ? 2 : 1.4}
                  style={{ transition: 'r 220ms ease, stroke-width 220ms' }}
                />
                <circle
                  r={active ? 4 : 2.6}
                  fill={active ? '#22D3EE' : s.isHuman ? '#22D3EE' : '#A78BFA'}
                  style={{ transition: 'r 220ms, fill 220ms' }}
                />
                <text
                  x="0"
                  y={s.y >= 0 ? 26 : -16}
                  textAnchor="middle"
                  fontSize="10"
                  fontFamily="'Space Grotesk', system-ui, sans-serif"
                  fontWeight="700"
                  letterSpacing="1.4"
                  fill={active ? '#22D3EE' : '#A78BFA'}
                  opacity={active ? 1 : 0.55}
                  style={{ transition: 'fill 220ms, opacity 220ms' }}
                >
                  {s.abbr}
                </text>
              </g>
            );
          })}

          {/* Center: Arora — pop animation runs imperatively via Web Animations API */}
          <g
            ref={aroraRef}
            style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
          >
            <circle r="74" fill="url(#ac-arora-halo)" className="ac-breath" />
            <circle r="26" fill="url(#ac-arora-fill)" className="ac-breath-tight" />
            <circle r="26" fill="none" stroke="#22D3EE" strokeOpacity="0.45" strokeWidth="0.8" />
            <text
              y={5}
              textAnchor="middle"
              fontSize="14"
              fontFamily="'Space Grotesk', system-ui, sans-serif"
              fontWeight="800"
              fill="#0B0817"
            >
              A
            </text>
            <text
              y={56}
              textAnchor="middle"
              fontSize="10"
              fontFamily="'Space Grotesk', system-ui, sans-serif"
              fontWeight="800"
              letterSpacing="3"
              fill="#22D3EE"
              opacity="0.85"
            >
              ARORA · CEO
            </text>
          </g>
        </g>

        <style>{`
          .ac-breath {
            transform-origin: center;
            transform-box: fill-box;
            animation: ac-breath 4.4s ease-in-out infinite;
          }
          .ac-breath-tight {
            transform-origin: center;
            transform-box: fill-box;
            animation: ac-breath-tight 4.4s ease-in-out infinite;
          }
          .ac-flash {
            transform-origin: center;
            transform-box: fill-box;
            animation: ac-flash 700ms ease-out forwards;
          }
          @keyframes ac-breath {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.10); opacity: 0.85; }
          }
          @keyframes ac-breath-tight {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          @keyframes ac-flash {
            0%   { transform: scale(0.4); opacity: 0.55; }
            100% { transform: scale(1.6); opacity: 0; }
          }
          ${travelKeyframes}
          @media (prefers-reduced-motion: reduce) {
            .ac-breath, .ac-breath-tight, .ac-flash { animation: none; }
          }
        `}</style>
      </svg>
    </div>
  );
}
