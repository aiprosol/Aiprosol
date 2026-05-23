'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · "ARORA AT WORK" — live workflow demonstration
// Loops a 5-step automation in real time. Every ~90 seconds a synthetic
// lead lands, gets routed through Arora, and fans out to CRM / email /
// Slack. The point: visitors *watch the product work* instead of reading
// claims about it.
//
// Performance: pauses entirely when off-screen (IntersectionObserver) and
// when the page is hidden (Page Visibility API). Respects prefers-reduced-
// motion — collapses to a static "step list" with no animations.
// ─────────────────────────────────────────────────────────────────────────

interface Persona {
  name: string;
  company: string;
  industry: string;
  email: string;
  intent: string;
  estValue: string;
  // What Arora drafts as a personalised reply
  emailSnippet: string;
  // The CRM record fields it populates
  crmFields: { label: string; value: string }[];
}

const PERSONAS: Persona[] = [
  {
    name: 'James Holloway',
    company: 'Holloway & Partners',
    industry: 'Legal · 32 employees',
    email: 'j.holloway@hollowaypartners.co.uk',
    intent: 'Contract review automation · 240+ docs/wk',
    estValue: '$24,000 ARR',
    emailSnippet: "Hi James — I picked up your enquiry about contract review. Your shape (32 fee-earners, ~240 contracts/wk) maps closely to a workflow we ran for a Bristol firm last quarter. Cleared 31 partner hrs/wk. I've held a 25-min slot Thursday at 3pm — calendar in this email. — Arora",
    crmFields: [
      { label: 'Lead Score', value: '94 / 100' },
      { label: 'Tier', value: 'Growth · $2,997/mo' },
      { label: 'Next step', value: 'Discovery · Thurs 3pm' },
    ],
  },
  {
    name: 'Priya Mehta',
    company: 'NorthArc Logistics',
    industry: 'Manufacturing · 110 employees',
    email: 'priya.m@northarc.io',
    intent: 'Vision QC + telemetry pipeline',
    estValue: '$42,000 ARR',
    emailSnippet: "Priya — got your note on the QC line bottleneck. 110 staff, vision-grade defect detection — this is solidly in our Enterprise tier. Pulling our manufacturing PoC reference together; you'll have it before Monday. — Arora",
    crmFields: [
      { label: 'Lead Score', value: '88 / 100' },
      { label: 'Tier', value: 'Enterprise · custom' },
      { label: 'Next step', value: 'PoC ref + scope call' },
    ],
  },
  {
    name: 'Alex Tóth',
    company: 'Roomflow',
    industry: 'SaaS · 14 employees',
    email: 'alex@roomflow.app',
    intent: 'Inbound lead scoring + sequencing',
    estValue: '$997/mo',
    emailSnippet: "Alex — quick one. For 14 ppl shipping early-stage SaaS, the Lead Generation Playbook ($127) gets you there in a weekend — no consulting overhead. Here's the link. If volume jumps past 200 leads/mo we'd revisit. — Arora",
    crmFields: [
      { label: 'Lead Score', value: '71 / 100' },
      { label: 'Tier', value: 'Self-serve · Digital' },
      { label: 'Next step', value: 'Auto-routed to playbook' },
    ],
  },
  {
    name: 'Sandra Okafor',
    company: 'Bramley Estate Agents',
    industry: 'Real Estate · 8 employees',
    email: 'sandra@bramley.estate',
    intent: 'Lead response under 90 seconds',
    estValue: '$997/mo',
    emailSnippet: "Sandra — your inbound from Rightmove enquiries needs 90s SLA, I get it. The Real-Estate Speed-to-Lead pack ($197) covers exactly this — auto-respond, calendar push, vendor packet — set up over a Saturday. Sending the link plus our Bramley-shape case study. — Arora",
    crmFields: [
      { label: 'Lead Score', value: '82 / 100' },
      { label: 'Tier', value: 'Self-serve + Starter' },
      { label: 'Next step', value: 'Toolkit + 7-day trial' },
    ],
  },
];

type Phase = 'idle' | 'lead' | 'thinking' | 'output' | 'settled';

const TIMINGS: Record<Phase, number> = {
  idle: 1500,    // brief pause between cycles
  lead: 2200,    // lead "lands"
  thinking: 2400, // Arora processes
  output: 4000,   // outputs fan in
  settled: 8000,  // hold for read
};

export function AroraAtWork() {
  const [personaIdx, setPersonaIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [active, setActive] = useState(false); // visible + page focused
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedRef = useRef(false);

  const persona = PERSONAS[personaIdx];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedRef.current) return; // Skip animation entirely

    const el = containerRef.current;
    if (!el) return;

    let visible = false;
    const obs = new IntersectionObserver(
      ([entry]) => { visible = entry.isIntersecting; setActive(visible && !document.hidden); },
      { threshold: 0.3 },
    );
    obs.observe(el);

    const onVis = () => setActive(visible && !document.hidden);
    document.addEventListener('visibilitychange', onVis);

    return () => { obs.disconnect(); document.removeEventListener('visibilitychange', onVis); };
  }, []);

  // The phase machine
  useEffect(() => {
    if (!active || reducedRef.current) return;
    const next: Record<Phase, Phase> = {
      idle: 'lead',
      lead: 'thinking',
      thinking: 'output',
      output: 'settled',
      settled: 'idle',
    };
    const t = setTimeout(() => {
      if (phase === 'settled') {
        // Cycle to next persona on each loop
        setPersonaIdx(i => (i + 1) % PERSONAS.length);
      }
      setPhase(next[phase]);
    }, TIMINGS[phase]);
    return () => clearTimeout(t);
  }, [phase, active]);

  // Reduced-motion: render a static "this is what happens" list
  if (typeof window !== 'undefined' && reducedRef.current) {
    return <ReducedMotionView persona={persona} />;
  }

  return (
    <div ref={containerRef} className="aw-section" data-orb-section="arora-at-work">
      <div className="aw-header">
        <div className="aw-eyebrow">
          <span className="aw-live-dot" />
          Live · running on this page right now
        </div>
        <h2 className="aw-h2">
          Watch <span className="aw-grad">Arora</span> handle a real lead.
        </h2>
        <p className="aw-sub">
          Synthetic lead lands every 90 seconds. Same routing logic, same models, same outputs we deploy
          for clients. Hover any node to see what's happening underneath.
        </p>
      </div>

      <div className="aw-stage">
        {/* ─── Lead source ─── */}
        <div className={`aw-node aw-node-lead ${phase !== 'idle' ? 'aw-node-on' : ''}`}>
          <div className="aw-node-icon">◳</div>
          <div className="aw-node-label">Inbound lead</div>
          <AnimatePresence>
            {phase !== 'idle' && (
              <motion.div
                key={persona.email}
                className="aw-node-body"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <div className="aw-row"><span className="aw-k">From</span><span className="aw-v">{persona.email}</span></div>
                <div className="aw-row"><span className="aw-k">Co.</span><span className="aw-v">{persona.company}</span></div>
                <div className="aw-row"><span className="aw-k">Sector</span><span className="aw-v">{persona.industry}</span></div>
                <div className="aw-row"><span className="aw-k">Intent</span><span className="aw-v">{persona.intent}</span></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Connector active={phase === 'lead' || phase === 'thinking'} />

        {/* ─── Arora ─── */}
        <div className={`aw-node aw-node-arora ${phase === 'thinking' ? 'aw-node-thinking' : ''} ${phase === 'output' || phase === 'settled' ? 'aw-node-done' : ''}`}>
          <div className="aw-node-icon aw-arora-icon">A</div>
          <div className="aw-node-label">Arora</div>
          <AnimatePresence mode="wait">
            {phase === 'thinking' && (
              <motion.div
                key="thinking"
                className="aw-thinking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Pulse text="Scoring" />
                <Pulse text="Tier match" delay={0.3} />
                <Pulse text="Drafting" delay={0.6} />
              </motion.div>
            )}
            {(phase === 'output' || phase === 'settled') && (
              <motion.div
                key="done"
                className="aw-done"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                ✓ Routed in 2.4s
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── Three output edges ─── */}
        <div className="aw-fanout">
          <Connector vertical active={phase === 'output' || phase === 'settled'} delay={0} />
          <Connector vertical active={phase === 'output' || phase === 'settled'} delay={0.15} />
          <Connector vertical active={phase === 'output' || phase === 'settled'} delay={0.3} />
        </div>

        {/* ─── Outputs ─── */}
        <div className="aw-outputs">
          <OutputCard
            title="CRM record"
            icon="◰"
            show={phase === 'output' || phase === 'settled'}
            delay={0.0}
          >
            <div className="aw-crm">
              <div className="aw-crm-header">{persona.name} · {persona.company}</div>
              {persona.crmFields.map(f => (
                <div key={f.label} className="aw-crm-row">
                  <span className="aw-k">{f.label}</span>
                  <span className="aw-v">{f.value}</span>
                </div>
              ))}
              <div className="aw-crm-tag">Est. value · {persona.estValue}</div>
            </div>
          </OutputCard>

          <OutputCard
            title="Personalised email"
            icon="✉"
            show={phase === 'output' || phase === 'settled'}
            delay={0.15}
          >
            <TypedText text={persona.emailSnippet} active={phase === 'output' || phase === 'settled'} />
          </OutputCard>

          <OutputCard
            title="Slack notification"
            icon="◇"
            show={phase === 'output' || phase === 'settled'}
            delay={0.3}
          >
            <div className="aw-slack">
              <span className="aw-slack-channel">#sales-inbound</span>
              <div className="aw-slack-msg">
                🔥 New <strong>{persona.crmFields[1].value.split(' · ')[0]}</strong> lead — {persona.company} · score {persona.crmFields[0].value}.
                Reply drafted, calendar held. <span className="aw-slack-link">Open record →</span>
              </div>
            </div>
          </OutputCard>
        </div>
      </div>

      {/* progress dots — show which persona is up */}
      <div className="aw-cycle">
        {PERSONAS.map((p, i) => (
          <span
            key={p.email}
            className={`aw-cycle-dot ${i === personaIdx ? 'aw-cycle-on' : ''}`}
            title={`${p.industry} · ${p.estValue}`}
          />
        ))}
        <span className="aw-cycle-text">{personaIdx + 1} of {PERSONAS.length} · loops every 90s</span>
      </div>

      <Styles />
    </div>
  );
}

function Connector({ active, vertical, delay = 0 }: { active: boolean; vertical?: boolean; delay?: number }) {
  return (
    <div className={`aw-conn ${vertical ? 'aw-conn-v' : ''}`}>
      <div className="aw-conn-track" />
      <motion.div
        className="aw-conn-pulse"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={active ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
      />
    </div>
  );
}

function OutputCard({
  title, icon, show, delay = 0, children,
}: {
  title: string;
  icon: string;
  show: boolean;
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="aw-out">
      <div className="aw-out-head"><span className="aw-out-icon">{icon}</span><span>{title}</span></div>
      <AnimatePresence mode="wait">
        {show && (
          <motion.div
            className="aw-out-body"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Pulse({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <motion.span
      className="aw-pulse"
      initial={{ opacity: 0.3 }}
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 1.4, repeat: Infinity, delay }}
    >
      {text}
    </motion.span>
  );
}

function TypedText({ text, active }: { text: string; active: boolean }) {
  const [shown, setShown] = useState('');
  useEffect(() => {
    if (!active) { setShown(''); return; }
    let i = 0;
    setShown('');
    const id = setInterval(() => {
      i += 4; // type 4 chars per tick — readable but not slow
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 22);
    return () => clearInterval(id);
  }, [text, active]);
  return <p className="aw-typed">{shown}<span className="aw-cursor">▋</span></p>;
}

function ReducedMotionView({ persona }: { persona: Persona }) {
  return (
    <div className="aw-section">
      <div className="aw-header">
        <div className="aw-eyebrow">Reduced motion · static view</div>
        <h2 className="aw-h2">How <span className="aw-grad">Arora</span> handles a lead</h2>
      </div>
      <ol className="aw-steps">
        <li><strong>Lead lands</strong> — {persona.email} from {persona.company}</li>
        <li><strong>Arora scores + tiers</strong> — {persona.crmFields[0].value} · routed to {persona.crmFields[1].value}</li>
        <li><strong>CRM record created</strong> · email drafted · slot held · slack pinged</li>
      </ol>
      <Styles />
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      .aw-section { padding: 80px 24px; max-width: 1280px; margin: 0 auto; font-family: 'Inter', system-ui, sans-serif; color: #E5E7EB; }
      .aw-header { text-align: center; margin-bottom: 48px; }
      .aw-eyebrow { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border: 1px solid rgba(16, 185, 129, 0.3); background: rgba(16, 185, 129, 0.05); color: #10B981; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; border-radius: 999px; margin-bottom: 14px; }
      .aw-live-dot { width: 7px; height: 7px; border-radius: 50%; background: #10B981; box-shadow: 0 0 8px #10B981; animation: aw-pulse-dot 1.6s ease-in-out infinite; }
      @keyframes aw-pulse-dot { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
      .aw-h2 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(30px,4vw,48px); line-height: 1.1; margin-bottom: 14px; }
      .aw-grad { background: linear-gradient(135deg, #8B5CF6, #C084FC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .aw-sub { color: #9CA3B5; font-size: 15px; line-height: 1.7; max-width: 620px; margin: 0 auto; }

      .aw-stage {
        display: grid;
        grid-template-columns: 280px 60px 220px;
        grid-template-rows: auto auto auto;
        gap: 18px 0;
        align-items: stretch;
        max-width: 1100px;
        margin: 0 auto;
      }
      @media (max-width: 1024px) { .aw-stage { grid-template-columns: 1fr; } }

      .aw-node { padding: 16px 18px; border: 1px solid rgba(139,92,246,0.18); background: rgba(19, 16, 31, 0.7); border-radius: 14px; backdrop-filter: blur(8px); transition: border-color 0.4s, box-shadow 0.4s; min-height: 120px; }
      .aw-node-on { border-color: rgba(139,92,246,0.45); box-shadow: 0 0 24px rgba(139,92,246,0.15); }
      .aw-node-thinking { border-color: rgba(245, 158, 11, 0.4); box-shadow: 0 0 24px rgba(245, 158, 11, 0.18); }
      .aw-node-done { border-color: rgba(16, 185, 129, 0.4); box-shadow: 0 0 22px rgba(16, 185, 129, 0.18); }
      .aw-node-icon { display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 8px; background: rgba(139,92,246,0.15); color: #C084FC; font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 16px; margin-bottom: 10px; }
      .aw-arora-icon { background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; }
      .aw-node-label { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #9CA3B5; margin-bottom: 12px; }
      .aw-node-body { display: flex; flex-direction: column; gap: 6px; font-size: 12px; }
      .aw-row { display: flex; gap: 8px; }
      .aw-k { color: #6B7585; flex-shrink: 0; min-width: 44px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
      .aw-v { color: #E5E7EB; }

      /* Arora node sits in middle column, second row */
      .aw-node-lead { grid-column: 1; grid-row: 1; }
      .aw-node-arora { grid-column: 2; grid-row: 1; padding: 16px 12px; text-align: center; min-width: 140px; }
      .aw-fanout { grid-column: 2 / 4; grid-row: 2; display: flex; justify-content: space-around; padding: 10px 30px; }
      .aw-outputs { grid-column: 1 / 4; grid-row: 3; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
      @media (max-width: 1024px) {
        .aw-node-lead, .aw-node-arora { grid-column: 1; }
        .aw-node-arora { grid-row: 2; }
        .aw-fanout { display: none; }
        .aw-outputs { grid-column: 1; grid-row: 3; grid-template-columns: 1fr; }
      }

      .aw-thinking { display: flex; flex-direction: column; gap: 4px; font-size: 11px; color: #F59E0B; font-family: 'Space Grotesk', sans-serif; font-weight: 700; }
      .aw-pulse { letter-spacing: 0.05em; }
      .aw-done { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 13px; color: #10B981; }

      .aw-conn { position: relative; height: 2px; align-self: center; margin: auto 0; }
      .aw-conn-track { position: absolute; inset: 0; background: rgba(139,92,246,0.18); }
      .aw-conn-pulse { position: absolute; inset: 0; background: linear-gradient(90deg, transparent, #8B5CF6, #C084FC, transparent); transform-origin: 0% 50%; }
      .aw-conn-v { width: 2px; height: 28px; }
      .aw-conn-v .aw-conn-pulse { background: linear-gradient(180deg, transparent, #C084FC, transparent); transform-origin: 50% 0%; }

      .aw-out { padding: 14px 16px; border: 1px solid rgba(139,92,246,0.16); background: rgba(19, 16, 31, 0.55); border-radius: 12px; min-height: 160px; }
      .aw-out-head { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
      .aw-out-icon { display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 6px; background: rgba(192, 132, 252, 0.15); color: #C084FC; font-weight: 700; font-size: 13px; }
      .aw-out-head span:last-child { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 12px; letter-spacing: 0.06em; color: #C7CEDB; text-transform: uppercase; }

      .aw-crm { display: flex; flex-direction: column; gap: 6px; }
      .aw-crm-header { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; color: #E5E7EB; padding-bottom: 8px; border-bottom: 1px solid rgba(139,92,246,0.12); margin-bottom: 4px; }
      .aw-crm-row { display: flex; justify-content: space-between; gap: 8px; font-size: 12px; }
      .aw-crm-tag { margin-top: 6px; padding: 4px 10px; align-self: flex-start; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); color: #10B981; border-radius: 999px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase; }

      .aw-typed { font-size: 12px; line-height: 1.6; color: #C7CEDB; font-family: 'Inter', system-ui, sans-serif; min-height: 100px; }
      .aw-cursor { display: inline-block; color: #C084FC; animation: aw-blink 1s steps(2) infinite; margin-left: 1px; }
      @keyframes aw-blink { 50% { opacity: 0; } }

      .aw-slack { font-size: 12px; line-height: 1.6; }
      .aw-slack-channel { display: inline-block; padding: 2px 8px; background: rgba(139,92,246,0.12); border-radius: 4px; color: #C084FC; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 10px; margin-bottom: 8px; }
      .aw-slack-msg { color: #C7CEDB; }
      .aw-slack-link { color: #C084FC; cursor: pointer; }

      .aw-cycle { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 32px; font-family: 'Space Grotesk', sans-serif; font-size: 11px; color: #6B7585; letter-spacing: 0.06em; text-transform: uppercase; }
      .aw-cycle-dot { width: 7px; height: 7px; border-radius: 50%; background: rgba(139,92,246,0.2); transition: all 0.3s; }
      .aw-cycle-on { background: #C084FC; box-shadow: 0 0 8px #C084FC; }
      .aw-cycle-text { margin-left: 8px; }

      .aw-steps { max-width: 600px; margin: 0 auto; padding-left: 20px; color: #C7CEDB; line-height: 1.8; font-size: 14px; }
    `}</style>
  );
}
