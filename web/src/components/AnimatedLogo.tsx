'use client';

import Image from 'next/image';
import { ParticleLogo } from './ParticleLogo';

// AIPROSOL · Animated logo loaders
//
// Three visual contexts share the same brand mark but render differently:
//
//   size="sm" → inline button spinner (24px)
//     Static logo with a reveal + pulse. Particles would be invisible at
//     this size, so we keep it minimal.
//
//   size="md" → route-level loader (180px)
//     ParticleLogo — violet particles converge to form the A, hold, dissolve,
//     and re-form. Cycles until the route is ready.
//
//   size="lg" → long-wait overlay (260px)
//     Same ParticleLogo at a larger canvas — more dramatic for waits of
//     1-3+ seconds where personality matters (e.g. ROI Audit submit).
//
// Reduced motion: ParticleLogo internally falls back to a static logo.
// InlineSpinner's pulse animation is disabled via @media.

type Size = 'sm' | 'md' | 'lg';

interface Props {
  size?: Size;
  /** Suppress the violet halo behind the logo (used for the sm/button variant). */
  noGlow?: boolean;
  /** Accessibility label — read aloud by screen readers. */
  label?: string;
}

const PX: Record<Size, number> = { sm: 24, md: 180, lg: 260 };

export function AnimatedLogo({ size = 'md', noGlow = false, label = 'Loading' }: Props) {
  const px = PX[size];

  // sm uses the simple animated logo — particles can't be read at 24px.
  if (size === 'sm') {
    return (
      <div
        className="aip-load-sm-wrap"
        style={{ width: px, height: px }}
        role="status"
        aria-label={label}
      >
        <Image
          src="/logo.png"
          alt=""
          width={px}
          height={px}
          priority
          className="aip-load-sm-img"
        />
        <style>{`
          .aip-load-sm-wrap {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            line-height: 0;
          }
          .aip-load-sm-img {
            border-radius: 28%;
            animation:
              aip-load-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) both,
              aip-load-pulse 1.6s ease-in-out 0.6s infinite;
          }
          @keyframes aip-load-reveal {
            0%   { clip-path: inset(100% 0 0 0); opacity: 0; transform: scale(0.86); }
            60%  { opacity: 1; }
            100% { clip-path: inset(0 0 0 0);   opacity: 1; transform: scale(1); }
          }
          @keyframes aip-load-pulse {
            0%, 100% { transform: scale(1);    filter: brightness(1); }
            50%      { transform: scale(1.04); filter: brightness(1.18); }
          }
          @media (prefers-reduced-motion: reduce) {
            .aip-load-sm-img { animation: none; }
          }
        `}</style>
      </div>
    );
  }

  // md and lg use the particle animation
  return (
    <div
      style={{
        position: 'relative',
        width: px,
        height: px,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      role="status"
      aria-label={label}
    >
      {!noGlow && (
        <>
          <span
            aria-hidden
            style={{
              position: 'absolute',
              inset: '-22%',
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(139, 92, 246, 0.32) 0%, rgba(139, 92, 246, 0.10) 45%, transparent 70%)',
              animation: 'aip-load-glow 3s ease-in-out infinite',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
          <style>{`
            @keyframes aip-load-glow {
              0%, 100% { opacity: 0.55; transform: scale(0.96); }
              50%      { opacity: 1;    transform: scale(1.08); }
            }
            @media (prefers-reduced-motion: reduce) {
              [aria-label="${label}"] > span[aria-hidden] { animation: none; opacity: 0.6; }
            }
          `}</style>
        </>
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <ParticleLogo size={px} density={size === 'lg' ? 420 : 280} />
      </div>
    </div>
  );
}

/**
 * RouteLoader · Tier 1 — full-screen loader for route navigations.
 * Wraps the particle ParticleLogo with the brand background + a label.
 */
export function RouteLoader({ message = 'Loading' }: { message?: string }) {
  return (
    <div className="rl-page" role="status" aria-live="polite">
      <AnimatedLogo size="md" label={message} />
      <div className="rl-label">{message}</div>
      <style>{`
        .rl-page {
          background: #0A0613;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 28px;
          font-family: 'Space Grotesk', system-ui, sans-serif;
        }
        .rl-label {
          color: #9CA3B5;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          animation: rl-dot 1.6s ease-in-out infinite;
        }
        @keyframes rl-dot {
          0%, 100% { opacity: 0.7; }
          50%      { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .rl-label { animation: none; }
        }
      `}</style>
    </div>
  );
}

/**
 * InlineSpinner · Tier 2 — tiny logo used inside buttons / inline next to text.
 * 24px — particles wouldn't read at this size, so it stays static-pulse.
 */
export function InlineSpinner({ label = 'Loading' }: { label?: string }) {
  return <AnimatedLogo size="sm" noGlow label={label} />;
}

/**
 * LongWaitOverlay · Tier 3 — full-screen overlay for waits over ~1s where
 * personality helps. Cycles Arora-voiced status copy underneath the particle
 * animation.
 */
const DEFAULT_MESSAGES = [
  'Asking Arora…',
  'Computing your ROI…',
  'Drafting your report…',
  'Almost there…',
];

export function LongWaitOverlay({
  messages = DEFAULT_MESSAGES,
  visible = true,
}: {
  messages?: string[];
  visible?: boolean;
}) {
  if (!visible) return null;
  return (
    <div className="lw-overlay" role="status" aria-live="polite">
      <div className="lw-card">
        <AnimatedLogo size="lg" label={messages[0]} />
        <div className="lw-messages">
          {messages.map((m, i) => (
            <div
              key={i}
              className="lw-msg"
              style={{ animationDelay: `${i * 1400}ms` }}
            >
              {m}
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .lw-overlay {
          position: fixed;
          inset: 0;
          background: rgba(10, 6, 19, 0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 300;
          font-family: 'Space Grotesk', system-ui, sans-serif;
          animation: lw-fade-in 0.3s ease-out;
        }
        @keyframes lw-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .lw-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 36px;
          padding: 48px;
        }
        .lw-messages {
          position: relative;
          height: 28px;
          min-width: 280px;
          text-align: center;
        }
        .lw-msg {
          position: absolute;
          inset: 0;
          color: #C7CEDB;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          opacity: 0;
          animation: lw-cycle ${DEFAULT_MESSAGES.length * 1400}ms infinite;
        }
        @keyframes lw-cycle {
          0%, 14% { opacity: 0; transform: translateY(8px); }
          18%, 28% { opacity: 1; transform: translateY(0); }
          32%, 100% { opacity: 0; transform: translateY(-8px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .lw-overlay { animation: none; }
          .lw-msg { animation: none; opacity: 1; transform: none; position: static; }
          .lw-messages { height: auto; }
          .lw-msg:not(:first-child) { display: none; }
        }
      `}</style>
    </div>
  );
}
