'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · CASE STUDY DEMO EMBED
//
// Drop-in slot for interactive demos on case-study pages. Reads a typed
// `demoEmbed` config from src/content/case-studies.json. Renders nothing
// if the case has no demo configured — so until we have a customer who
// agrees to share, this stays invisible.
//
// To add a demo to a case study:
//   1. Get written permission from the client
//   2. Add a `demoEmbed` field to that case in case-studies.json:
//        "demoEmbed": {
//          "type": "workflow",
//          "title": "How leads flow through their stack",
//          "nodes": [
//            { "id": "lead", "label": "Web form", "icon": "◳" },
//            { "id": "arora", "label": "Arora", "icon": "A", "primary": true },
//            { "id": "crm", "label": "HubSpot", "icon": "◰" }
//          ],
//          "edges": [["lead","arora"], ["arora","crm"]]
//        }
//   3. Or:
//        "demoEmbed": {
//          "type": "beforeAfter",
//          "title": "Sales pipeline visibility",
//          "before": { "label": "Before", "snapshot": [...] },
//          "after":  { "label": "After",  "snapshot": [...] }
//        }
//   4. Or:
//        "demoEmbed": {
//          "type": "samples",
//          "title": "Sample emails Arora drafts",
//          "items": [{ "header": "Subject: …", "body": "Hi …" }, …]
//        }
// ─────────────────────────────────────────────────────────────────────────

export type DemoEmbedConfig =
  | WorkflowDemo
  | BeforeAfterDemo
  | SamplesDemo;

interface BaseDemo { title: string; subtitle?: string }

interface WorkflowDemo extends BaseDemo {
  type: 'workflow';
  nodes: { id: string; label: string; icon: string; primary?: boolean }[];
  edges: [string, string][];
}

interface BeforeAfterDemo extends BaseDemo {
  type: 'beforeAfter';
  before: { label: string; snapshot: { k: string; v: string }[] };
  after: { label: string; snapshot: { k: string; v: string }[] };
}

interface SamplesDemo extends BaseDemo {
  type: 'samples';
  items: { header: string; body: string }[];
}

export function CaseStudyDemoEmbed({ config }: { config?: DemoEmbedConfig | null }) {
  if (!config) return null;
  return (
    <section className="cdemo">
      <div className="cdemo-eyebrow">Interactive · sanitised from real data</div>
      <h2 className="cdemo-title">{config.title}</h2>
      {config.subtitle && <p className="cdemo-sub">{config.subtitle}</p>}

      {config.type === 'workflow' && <WorkflowDemo config={config} />}
      {config.type === 'beforeAfter' && <BeforeAfterDemo config={config} />}
      {config.type === 'samples' && <SamplesDemo config={config} />}

      <Styles />
    </section>
  );
}

// ────── Workflow renderer ──────
function WorkflowDemo({ config }: { config: WorkflowDemo }) {
  const [hoveredEdge, setHoveredEdge] = useState<number | null>(null);

  // Compute a simple horizontal layout — first node leftmost, last rightmost
  const NODE_W = 160;
  const GAP = 80;
  const totalW = config.nodes.length * NODE_W + (config.nodes.length - 1) * GAP;

  const nodePositions = config.nodes.reduce<Record<string, { x: number; y: number }>>((acc, n, i) => {
    acc[n.id] = { x: i * (NODE_W + GAP) + NODE_W / 2, y: 100 };
    return acc;
  }, {});

  return (
    <div className="cdemo-workflow">
      <svg viewBox={`0 0 ${totalW} 200`} preserveAspectRatio="xMidYMid meet" className="cdemo-svg">
        {config.edges.map(([from, to], i) => {
          const a = nodePositions[from];
          const b = nodePositions[to];
          if (!a || !b) return null;
          return (
            <g
              key={`${from}-${to}`}
              onMouseEnter={() => setHoveredEdge(i)}
              onMouseLeave={() => setHoveredEdge(null)}
              style={{ cursor: 'pointer' }}
            >
              <line
                x1={a.x + NODE_W / 2 - 14} y1={a.y}
                x2={b.x - NODE_W / 2 + 14} y2={b.y}
                stroke="#8B5CF6"
                strokeWidth={hoveredEdge === i ? 2 : 1.5}
                strokeOpacity={hoveredEdge === i ? 0.9 : 0.4}
              />
              <circle r="3" fill="#C084FC">
                <animateMotion
                  dur="2s"
                  repeatCount="indefinite"
                  path={`M${a.x + NODE_W / 2 - 14},${a.y} L${b.x - NODE_W / 2 + 14},${b.y}`}
                />
              </circle>
            </g>
          );
        })}
        {config.nodes.map(n => {
          const p = nodePositions[n.id];
          return (
            <g key={n.id} transform={`translate(${p.x}, ${p.y})`}>
              <rect
                x={-NODE_W / 2} y={-30}
                width={NODE_W} height={60}
                rx={12}
                fill={n.primary ? '#8B5CF6' : 'rgba(19, 16, 31, 0.7)'}
                stroke={n.primary ? 'transparent' : 'rgba(139,92,246,0.3)'}
                strokeWidth={1}
              />
              <text
                x={-NODE_W / 2 + 18} y={4}
                fill={n.primary ? '#0A0613' : '#C084FC'}
                fontFamily="'Space Grotesk', sans-serif"
                fontSize="20"
                fontWeight="800"
              >
                {n.icon}
              </text>
              <text
                x={-NODE_W / 2 + 50} y={-2}
                fill={n.primary ? '#0A0613' : '#E5E7EB'}
                fontFamily="'Space Grotesk', sans-serif"
                fontSize="12"
                fontWeight="700"
              >
                {n.label}
              </text>
              <text
                x={-NODE_W / 2 + 50} y={14}
                fill={n.primary ? 'rgba(10,6,19,0.6)' : '#9CA3B5'}
                fontFamily="'Inter', sans-serif"
                fontSize="9"
                letterSpacing="0.06em"
              >
                {n.id.toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="cdemo-foot">Live data flow · hover an edge for context</p>
    </div>
  );
}

// ────── Before / After toggle ──────
function BeforeAfterDemo({ config }: { config: BeforeAfterDemo }) {
  const [view, setView] = useState<'before' | 'after'>('after');
  const data = view === 'before' ? config.before : config.after;
  return (
    <div className="cdemo-ba">
      <div className="cdemo-toggle">
        <button
          className={`cdemo-toggle-btn ${view === 'before' ? 'cdemo-toggle-on' : ''}`}
          onClick={() => setView('before')}
          type="button"
        >{config.before.label}</button>
        <button
          className={`cdemo-toggle-btn ${view === 'after' ? 'cdemo-toggle-on' : ''}`}
          onClick={() => setView('after')}
          type="button"
        >{config.after.label}</button>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          className="cdemo-snapshot"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.32 }}
        >
          {data.snapshot.map((row, i) => (
            <div key={i} className="cdemo-snapshot-row">
              <span className="cdemo-snapshot-k">{row.k}</span>
              <span className="cdemo-snapshot-v">{row.v}</span>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ────── Sample carousel ──────
function SamplesDemo({ config }: { config: SamplesDemo }) {
  const [idx, setIdx] = useState(0);
  const item = config.items[idx];
  const next = () => setIdx(i => (i + 1) % config.items.length);
  const prev = () => setIdx(i => (i - 1 + config.items.length) % config.items.length);

  return (
    <div className="cdemo-samples">
      <div className="cdemo-sample-frame">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.3 }}
          >
            <div className="cdemo-sample-header">{item.header}</div>
            <div className="cdemo-sample-body">{item.body}</div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="cdemo-sample-controls">
        <button onClick={prev} type="button" aria-label="Previous">←</button>
        <span>{idx + 1} of {config.items.length}</span>
        <button onClick={next} type="button" aria-label="Next">→</button>
      </div>
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      .cdemo { margin: 48px 0; padding: 32px; background: rgba(19, 16, 31, 0.55); border: 1px solid rgba(139,92,246,0.25); border-radius: 18px; backdrop-filter: blur(8px); }
      .cdemo-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(16, 185, 129, 0.06); border: 1px solid rgba(16, 185, 129, 0.3); color: #10B981; font-family: 'Space Grotesk', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; border-radius: 999px; margin-bottom: 14px; }
      .cdemo-title { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 24px; margin-bottom: 8px; }
      .cdemo-sub { color: #9CA3B5; font-size: 14px; line-height: 1.7; margin-bottom: 22px; }

      .cdemo-workflow { padding: 20px; background: rgba(0,0,0,0.18); border-radius: 14px; }
      .cdemo-svg { width: 100%; height: 200px; }
      .cdemo-foot { text-align: center; font-size: 11px; color: #6B7585; letter-spacing: 0.05em; margin-top: 10px; }

      .cdemo-ba { display: flex; flex-direction: column; gap: 18px; }
      .cdemo-toggle { display: inline-flex; gap: 4px; padding: 4px; background: rgba(0,0,0,0.3); border: 1px solid rgba(139,92,246,0.2); border-radius: 999px; align-self: flex-start; }
      .cdemo-toggle-btn { padding: 7px 16px; background: transparent; border: none; color: #9CA3B5; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 12px; letter-spacing: 0.05em; border-radius: 999px; cursor: pointer; transition: all 0.22s; }
      .cdemo-toggle-on { background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; }
      .cdemo-snapshot { display: flex; flex-direction: column; gap: 0; background: rgba(0,0,0,0.2); border: 1px solid rgba(139,92,246,0.14); border-radius: 12px; overflow: hidden; }
      .cdemo-snapshot-row { display: flex; justify-content: space-between; padding: 12px 18px; border-bottom: 1px solid rgba(139,92,246,0.08); font-size: 13px; }
      .cdemo-snapshot-row:last-child { border-bottom: 0; }
      .cdemo-snapshot-k { color: #9CA3B5; }
      .cdemo-snapshot-v { color: #E5E7EB; font-family: 'Space Grotesk', sans-serif; font-weight: 700; }

      .cdemo-samples { display: flex; flex-direction: column; gap: 14px; }
      .cdemo-sample-frame { padding: 22px; background: rgba(0,0,0,0.22); border: 1px solid rgba(139,92,246,0.16); border-radius: 12px; min-height: 200px; }
      .cdemo-sample-header { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; color: #C084FC; padding-bottom: 12px; border-bottom: 1px solid rgba(139,92,246,0.15); margin-bottom: 14px; letter-spacing: 0.04em; }
      .cdemo-sample-body { color: #C7CEDB; font-size: 14px; line-height: 1.7; white-space: pre-wrap; }
      .cdemo-sample-controls { display: flex; align-items: center; justify-content: center; gap: 14px; font-family: 'Space Grotesk', sans-serif; font-size: 11px; color: #9CA3B5; letter-spacing: 0.06em; }
      .cdemo-sample-controls button { width: 32px; height: 32px; background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.22); color: #C084FC; border-radius: 50%; cursor: pointer; font-size: 14px; transition: all 0.18s; }
      .cdemo-sample-controls button:hover { background: rgba(139,92,246,0.18); }
    `}</style>
  );
}
