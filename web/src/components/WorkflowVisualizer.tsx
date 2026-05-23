'use client';

import { useEffect, useRef, useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────
// WorkflowVisualizer — animated node-based diagram showing how an
// automation flows: inbound → Arora qualifier → CRM → Email → Booking.
// Pulses run along the connecting lines as data packets. Pauses when
// off-screen for performance.
// ─────────────────────────────────────────────────────────────────────────

interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
  sub: string;
  icon: string;
  active?: boolean; // gets the violet glow + brighter border
}

const NODES: Node[] = [
  { id: 'lead', x: 100, y: 200, label: 'Lead Form', sub: 'Inbound capture', icon: '◳' },
  { id: 'arora', x: 380, y: 200, label: 'Arora AI', sub: 'Qualifies + scores', icon: 'A', active: true },
  { id: 'crm', x: 660, y: 100, label: 'CRM', sub: 'Record + assign', icon: '◰' },
  { id: 'email', x: 660, y: 200, label: 'Email Reply', sub: 'Personalised in 60s', icon: '✉' },
  { id: 'book', x: 660, y: 300, label: 'Booking', sub: 'Calendar slot held', icon: '◷' },
];

interface Edge {
  from: string;
  to: string;
  delay: number;
}

const EDGES: Edge[] = [
  { from: 'lead', to: 'arora', delay: 0 },
  { from: 'arora', to: 'crm', delay: 0.3 },
  { from: 'arora', to: 'email', delay: 0.6 },
  { from: 'arora', to: 'book', delay: 0.9 },
];

const NODE_W = 180;
const NODE_H = 80;

export function WorkflowVisualizer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => setVisible(e.isIntersecting),
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const nodeMap = new Map(NODES.map(n => [n.id, n]));

  return (
    <section className="wv-section">
      <div className="wv-container" ref={containerRef}>
        <div className="wv-head">
          <span className="wv-eyebrow">Live system architecture</span>
          <h2 className="wv-title">
            See an automation <span className="text-grad">in flight</span>
          </h2>
          <p className="wv-sub">
            Every Aiprosol engagement runs on a graph like this. Inbound on the left, outcomes on the right,
            Arora orchestrating the middle. Watch the data flow.
          </p>
        </div>

        <div className="wv-stage">
          <svg
            viewBox="0 0 880 400"
            preserveAspectRatio="xMidYMid meet"
            className="wv-svg"
            aria-label="Animated workflow diagram"
          >
            <defs>
              <linearGradient id="wv-line" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#C084FC" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.3" />
              </linearGradient>
              <radialGradient id="wv-orb" cx="30%" cy="30%">
                <stop offset="0%" stopColor="#C084FC" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#4C1D95" />
              </radialGradient>
              <filter id="wv-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Connection paths (rendered first so they sit behind nodes) */}
            {EDGES.map(edge => {
              const from = nodeMap.get(edge.from)!;
              const to = nodeMap.get(edge.to)!;
              const x1 = from.x + NODE_W / 2;
              const y1 = from.y;
              const x2 = to.x - NODE_W / 2;
              const y2 = to.y;
              const midX = (x1 + x2) / 2;
              const d = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
              return (
                <g key={`${edge.from}-${edge.to}`}>
                  {/* Static line */}
                  <path
                    d={d}
                    fill="none"
                    stroke="url(#wv-line)"
                    strokeWidth="1.5"
                  />
                  {/* Flowing particles */}
                  {visible && !reduced && (
                    <>
                      <circle
                        r="5"
                        fill="#C084FC"
                        filter="url(#wv-glow)"
                        opacity="0.95"
                      >
                        <animateMotion
                          dur="2.6s"
                          repeatCount="indefinite"
                          path={d}
                          begin={`${edge.delay}s`}
                        />
                      </circle>
                      <circle
                        r="3"
                        fill="#8B5CF6"
                        opacity="0.6"
                      >
                        <animateMotion
                          dur="2.6s"
                          repeatCount="indefinite"
                          path={d}
                          begin={`${edge.delay + 1.3}s`}
                        />
                      </circle>
                    </>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {NODES.map(node => (
              <g key={node.id} transform={`translate(${node.x - NODE_W / 2}, ${node.y - NODE_H / 2})`}>
                {/* Glow halo for active node */}
                {node.active && (
                  <rect
                    x="-8"
                    y="-8"
                    width={NODE_W + 16}
                    height={NODE_H + 16}
                    rx="18"
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="1"
                    opacity="0.3"
                  >
                    <animate
                      attributeName="opacity"
                      values="0.2;0.5;0.2"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </rect>
                )}
                {/* Card */}
                <rect
                  width={NODE_W}
                  height={NODE_H}
                  rx="14"
                  fill="#13101F"
                  stroke={node.active ? '#8B5CF6' : '#2A1F3D'}
                  strokeWidth={node.active ? '1.5' : '1'}
                />
                {/* Icon panel */}
                <rect
                  x="14"
                  y={(NODE_H - 48) / 2}
                  width="48"
                  height="48"
                  rx="11"
                  fill={node.active ? 'url(#wv-orb)' : 'rgba(139, 92, 246, 0.1)'}
                  stroke={node.active ? 'transparent' : 'rgba(139, 92, 246, 0.3)'}
                  strokeWidth="1"
                />
                <text
                  x={14 + 24}
                  y={(NODE_H - 48) / 2 + 30}
                  textAnchor="middle"
                  fill={node.active ? '#0A0613' : '#C084FC'}
                  fontFamily="Space Grotesk, sans-serif"
                  fontWeight="800"
                  fontSize="22"
                >
                  {node.icon}
                </text>
                {/* Labels */}
                <text
                  x="76"
                  y={NODE_H / 2 - 5}
                  fill="#E5E7EB"
                  fontFamily="Space Grotesk, sans-serif"
                  fontWeight="700"
                  fontSize="14"
                >
                  {node.label}
                </text>
                <text
                  x="76"
                  y={NODE_H / 2 + 13}
                  fill="#9CA3B5"
                  fontFamily="Inter, sans-serif"
                  fontSize="11"
                >
                  {node.sub}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Legend strip below */}
        <div className="wv-legend">
          <div className="wv-legend-item">
            <span className="wv-legend-dot wv-legend-dot-1" />
            <span><strong>Sub-3-min</strong> response</span>
          </div>
          <div className="wv-legend-item">
            <span className="wv-legend-dot wv-legend-dot-2" />
            <span><strong>Lead score</strong> attached</span>
          </div>
          <div className="wv-legend-item">
            <span className="wv-legend-dot wv-legend-dot-3" />
            <span><strong>Booking confirmed</strong> automatically</span>
          </div>
          <div className="wv-legend-item">
            <span className="wv-legend-dot wv-legend-dot-4" />
            <span><strong>Audit trail</strong> end-to-end</span>
          </div>
        </div>
      </div>

      <style>{`
        .wv-section { padding: 60px 0 80px; position: relative; }
        .wv-container { max-width: 1080px; margin: 0 auto; padding: 0 24px; }
        .wv-head { text-align: center; margin-bottom: 36px; }
        .wv-eyebrow {
          display: inline-block;
          padding: 4px 12px;
          background: rgba(139, 92, 246, 0.08);
          border: 1px solid rgba(139, 92, 246, 0.25);
          border-radius: 999px;
          color: #8B5CF6;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 16px;
        }
        .wv-title {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 800;
          font-size: clamp(28px, 4vw, 44px);
          line-height: 1.1;
          color: #E5E7EB;
          margin-bottom: 12px;
        }
        .wv-sub {
          color: #9CA3B5;
          font-size: 16px;
          line-height: 1.6;
          max-width: 640px;
          margin: 0 auto;
        }
        .wv-stage {
          padding: 28px;
          background: rgba(19, 16, 31, 0.5);
          border: 1px solid #2A1F3D;
          border-radius: 24px;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          margin-bottom: 24px;
          position: relative;
          overflow: hidden;
        }
        .wv-stage::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.08), transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(192, 132, 252, 0.06), transparent 50%);
          pointer-events: none;
        }
        .wv-svg { width: 100%; height: auto; display: block; max-height: 380px; }
        .wv-legend {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        @media (max-width: 800px) { .wv-legend { grid-template-columns: repeat(2, 1fr); } }
        .wv-legend-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          background: #13101F;
          border: 1px solid #2A1F3D;
          border-radius: 10px;
          font-size: 12px;
          color: #C7CEDB;
        }
        .wv-legend-item strong { color: #C084FC; font-weight: 700; }
        .wv-legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
          box-shadow: 0 0 8px currentColor;
        }
        .wv-legend-dot-1 { background: #8B5CF6; color: #8B5CF6; }
        .wv-legend-dot-2 { background: #C084FC; color: #C084FC; }
        .wv-legend-dot-3 { background: #A78BFA; color: #A78BFA; }
        .wv-legend-dot-4 { background: #D946EF; color: #D946EF; }
      `}</style>
    </section>
  );
}
