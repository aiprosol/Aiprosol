'use client';

import { useEffect, useRef } from 'react';

// AIPROSOL · Particle-A loading animation
//
// Cinematic loader: violet particles emerge scattered, ease into a perfect
// reproduction of the Aiprosol "A" logo, hold for a beat, then dissolve
// outward in random directions. Cycles until unmounted (i.e. until the
// parent loading state ends).
//
// Implementation:
//   1. Loads /logo.png onto an offscreen canvas
//   2. Samples pixel data to find every "white" pixel (the A glyph against
//      the black background) at a configurable step
//   3. Creates N particles, each with a position + a target sampled from
//      the A shape
//   4. Runs a 4-phase loop on requestAnimationFrame:
//        gather   → particles ease toward their A-shape targets
//        hold     → particles sit on their targets with tiny jitter
//        disperse → particles fly outward with random velocity
//        scatter  → instant respawn at random positions
//   5. Respects prefers-reduced-motion — falls back to static logo render
//
// All rendering happens client-side; the canvas is hidden until the image
// has loaded so the user never sees an empty box.

interface ParticleLogoProps {
  /** Square canvas size in CSS px. Don't go below ~80 — particles need room. */
  size?: number;
  /** Approximate particle count. Capped by available pixels in the logo. */
  density?: number;
  /** Brand colour for the particles. */
  color?: string;
  /** Secondary colour — used for a subset of particles so the swarm has depth. */
  colorAccent?: string;
}

interface Particle {
  x: number;   // current x in CSS px
  y: number;   // current y in CSS px
  tx: number;  // target x (from logo sample)
  ty: number;  // target y
  vx: number;  // velocity x (used in disperse phase)
  vy: number;  // velocity y
  size: number;
  color: string;
}

type Phase = 'gather' | 'hold' | 'disperse' | 'scatter';

const PHASE_DURATION_MS: Record<Phase, number> = {
  gather: 1400,
  hold: 1100,
  disperse: 1100,
  scatter: 300,
};

export function ParticleLogo({
  size = 180,
  density = 320,
  color = '#8B5CF6',
  colorAccent = '#C084FC',
}: ParticleLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Reduced motion → skip the animation entirely, leave the canvas blank.
    // A static <img> fallback is rendered as a sibling for this case.
    const reduced = typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    let animationId = 0;
    let particles: Particle[] = [];
    let phase: Phase = 'scatter';
    let phaseStart = performance.now();
    let isMounted = true;

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = '/logo.png';

    img.onload = () => {
      if (!isMounted) return;

      // ── Sample the logo PNG to extract A-shape pixel positions ──
      const offscreen = document.createElement('canvas');
      offscreen.width = size;
      offscreen.height = size;
      const octx = offscreen.getContext('2d');
      if (!octx) return;
      octx.drawImage(img, 0, 0, size, size);
      const pixels = octx.getImageData(0, 0, size, size).data;

      // Scan at a step that yields ~density target points.
      // The Aiprosol logo is white "A" on a black/dark background — we want
      // pixels that are bright (high R+G+B) and opaque.
      const targets: Array<{ x: number; y: number }> = [];
      const step = Math.max(2, Math.floor(Math.sqrt((size * size) / (density * 2))));
      for (let y = 0; y < size; y += step) {
        for (let x = 0; x < size; x += step) {
          const i = (y * size + x) * 4;
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const a = pixels[i + 3];
          // "Bright + opaque" — the white A shape.
          if (a > 128 && r + g + b > 480) {
            targets.push({ x, y });
          }
        }
      }

      if (targets.length === 0) {
        // Fallback — sampling failed (unlikely). Bail out, leave canvas empty.
        return;
      }

      // ── Create particles, each mapped to a target ──
      const count = Math.min(density, targets.length);
      particles = new Array(count).fill(0).map((_, i) => {
        const t = targets[Math.floor((i / count) * targets.length)];
        return {
          x: Math.random() * size,
          y: Math.random() * size,
          tx: t.x,
          ty: t.y,
          vx: 0,
          vy: 0,
          size: 1.2 + Math.random() * 1.4,
          color: Math.random() < 0.3 ? colorAccent : color,
        };
      });

      phaseStart = performance.now();
      phase = 'gather';

      // ── Animation loop ──
      const tick = (now: number) => {
        if (!isMounted) return;
        const elapsed = now - phaseStart;

        // ── Phase transition ──
        if (elapsed >= PHASE_DURATION_MS[phase]) {
          phaseStart = now;
          phase =
            phase === 'gather' ? 'hold'
            : phase === 'hold' ? 'disperse'
            : phase === 'disperse' ? 'scatter'
            : 'gather';

          if (phase === 'scatter') {
            // Instant respawn at random positions
            for (const p of particles) {
              p.x = Math.random() * size;
              p.y = Math.random() * size;
              p.vx = 0;
              p.vy = 0;
            }
          } else if (phase === 'disperse') {
            // Give each particle outward velocity from the centre, plus jitter
            const cx = size / 2;
            const cy = size / 2;
            for (const p of particles) {
              const dx = p.x - cx;
              const dy = p.y - cy;
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;
              const speed = 1.5 + Math.random() * 2.5;
              p.vx = (dx / dist) * speed + (Math.random() - 0.5) * 0.8;
              p.vy = (dy / dist) * speed + (Math.random() - 0.5) * 0.8;
            }
          }
        }

        // ── Update + render ──
        ctx.clearRect(0, 0, size, size);

        for (const p of particles) {
          if (phase === 'gather') {
            // Ease toward target — exponential approach
            const dx = p.tx - p.x;
            const dy = p.ty - p.y;
            p.x += dx * 0.085;
            p.y += dy * 0.085;
          } else if (phase === 'hold') {
            // Sit at target with a tiny jitter so the A doesn't look frozen
            p.x = p.tx + (Math.random() - 0.5) * 0.7;
            p.y = p.ty + (Math.random() - 0.5) * 0.7;
          } else if (phase === 'disperse') {
            p.x += p.vx;
            p.y += p.vy;
            // Gentle friction so particles slow as they exit the frame
            p.vx *= 0.985;
            p.vy *= 0.985;
          }
          // scatter phase doesn't move — positions were randomised on transition

          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, p.size, p.size);
        }

        animationId = requestAnimationFrame(tick);
      };

      animationId = requestAnimationFrame(tick);
    };

    return () => {
      isMounted = false;
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [size, density, color, colorAccent]);

  return (
    <div style={{ position: 'relative', width: size, height: size, lineHeight: 0 }}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ display: 'block', width: size, height: size }}
      />
      {/* Static fallback shown only to reduced-motion users. The canvas
          above is blank in that case, so the img takes the visible slot. */}
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" width={size} height={size} style={{ position: 'absolute', inset: 0, borderRadius: '18%' }} />
      </noscript>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          canvas[aria-hidden="true"] { display: none !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .particle-reduced-fallback { display: block !important; }
        }
      `}</style>
      {/* JS-rendered reduced-motion fallback. canvas hidden via media query;
          this img stays visible. Both share the same square footprint. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="particle-reduced-fallback"
        src="/logo.png"
        alt=""
        width={size}
        height={size}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '18%',
          display: 'none',
          // The media query above flips display:block for reduced-motion users
        }}
      />
    </div>
  );
}
