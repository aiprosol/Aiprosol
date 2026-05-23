// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · ABOUT PAGE · /about
// Phase 5.9 · Arora origin · the C-suite of AI · Srijan's mission · the
// locked principles · brand stats. Animated reveal-on-scroll sections.
// ─────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';

const C_SUITE = [
  { role: 'Chairman', name: 'Srijan Paudel', desc: 'Founder. Sets direction, owns vision. The only human seat at the C-suite table.' },
  { role: 'CEO', name: 'Arora', desc: 'Strategy, architecture, CMS, content. The operational lead — runs the business day to day.', highlight: true },
  { role: 'COO', name: 'Uncle COO', desc: 'Operations. 5 Zapier automations that keep Aiprosol itself running.' },
  { role: 'CMO', name: 'Aunt CMO', desc: 'Marketing. The 29 LinkedIn posts, the brand voice, the campaigns.' },
  { role: 'CCO', name: 'Cousin Claude', desc: 'Customer success. Onboarding scripts, support escalations.' },
  { role: 'CTO', name: 'Claude CTO', desc: 'Technical architecture. Masterclass content, integration designs.' },
  { role: 'CRO', name: 'Claude CRO', desc: 'Revenue operations. Cold outreach drafts, pipeline hygiene.' },
  { role: 'CLO', name: 'Claude CLO', desc: 'Legal. 11 documents — terms, privacy, contracts, DPAs.' },
  { role: 'CPO', name: 'Claude CPO', desc: 'Partnerships. 50 affiliate partners identified and qualified.' },
  { role: 'CPM', name: 'Claude CPM', desc: 'Product. All 19 digital products, descriptions, pricing.' },
  { role: 'Data', name: 'Claude DA', desc: 'Analytics. Weekly dashboards, lead scoring, performance tracking.' },
];

const PRINCIPLES = [
  { title: 'Self-serve first', body: 'Most decisions don\'t need a discovery call. They need a number. The free ROI Audit gives you yours in 60 seconds.' },
  { title: 'Numbers, not hype', body: 'Every claim ships with a number. 340% avg ROI. 35+ hrs/week reclaimed. £3,573 catalogue value. If we can\'t quantify it, we don\'t say it.' },
  { title: 'Global · borderless', body: 'No geographic gatekeeping. Clients across multiple industries on multiple continents. GBP pricing because it\'s where the business is incorporated, not where you are.' },
  { title: 'Operators serving operators', body: 'No theory-only consultants. Every automation we ship is something we\'ve already built and run inside Aiprosol itself.' },
  { title: 'AI-led, human-overseen', body: 'Arora makes most operational calls. Srijan reviews the strategic ones. Clients always have a human contact for sensitive matters.' },
  { title: 'Money-back if we miss', body: '90 days to reclaim 35+ hours/week — or we work for free until you do. Real guarantee, written into every plan.' },
];

const STATS = [
  { v: '340%', k: 'Avg ROI · 12 months' },
  { v: '35+', k: 'Hrs/wk reclaimed' },
  { v: '£3,573', k: 'Catalogue value' },
  { v: '19', k: 'Digital products' },
  { v: '11', k: 'AI services' },
  { v: '8', k: 'Case studies, 6 industries' },
];

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function RevealSection({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} className={`ab-reveal ${visible ? 'is-in' : ''}`} style={style}>
      {children}
    </div>
  );
}

export function AboutPage() {
  return (
    <div className="ab-page">
      <header className="ab-hero">
        <div className="ab-eyebrow">About Aiprosol</div>
        <h1 className="ab-h1">
          Built by an <span className="ab-grad">AI-led C-suite</span>,<br />
          for operators who want their hours back.
        </h1>
        <p className="ab-sub">
          Aiprosol is a global AI automation consultancy. Most of our company is run by AI agents,
          coordinated by Arora — our AI CEO — under a single human chairman. The model is itself
          a proof-of-concept for what AI-led operations look like at scale.
        </p>
      </header>

      <RevealSection>
        <section className="ab-stats">
          {STATS.map(s => (
            <div key={s.k} className="ab-stat">
              <div className="ab-stat-v">{s.v}</div>
              <div className="ab-stat-k">{s.k}</div>
            </div>
          ))}
        </section>
      </RevealSection>

      <RevealSection>
        <section className="ab-section">
          <div className="ab-section-eyebrow">The story</div>
          <h2 className="ab-section-title">Why Aiprosol exists</h2>
          <div className="ab-prose">
            <p>
              Most automation consultancies sell hours. A consultant builds a Zapier flow, hands it
              over with a 12-page document, and disappears the moment something breaks. The client
              ends up with a brittle artefact and no one to maintain it.
            </p>
            <p>
              Aiprosol was built to invert that. Every automation we ship is monitored, iterated, and
              re-architected by an AI CEO who watches every signal 24/7. There's no consultant who
              "moves on to the next project." Arora doesn't move on. She runs.
            </p>
            <p>
              The catch: for that to be honest, the AI has to actually be in charge. Not a marketing
              line — a structural fact. Arora makes most operational decisions. Srijan, the founder,
              reviews the strategic ones. Clients always have a human contact for sensitive matters.
              But the day-to-day "who decides" sits with the AI.
            </p>
            <p>
              That's how we keep automations grounded in reality. An AI CEO who runs the chat widget,
              writes the blog, owns the architecture, and sees every customer signal — is incentivised
              to make those automations work for real people, not to sell more hours.
            </p>
          </div>
        </section>
      </RevealSection>

      <RevealSection>
        <section className="ab-section">
          <div className="ab-section-eyebrow">The C-suite</div>
          <h2 className="ab-section-title">11 roles · 1 human · 10 AI</h2>
          <p className="ab-section-sub">
            Each role has a defined remit. Each agent is run by Claude with a custom system prompt
            and tools. They coordinate through Notion (HQ) and Slack.
          </p>
          <div className="ab-suite">
            {C_SUITE.map(m => (
              <div key={m.name} className={`ab-member ${m.highlight ? 'is-highlight' : ''}`}>
                <div className="ab-member-role">{m.role}</div>
                <div className="ab-member-name">{m.name}</div>
                <p className="ab-member-desc">{m.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </RevealSection>

      <RevealSection>
        <section className="ab-section">
          <div className="ab-section-eyebrow">How we operate</div>
          <h2 className="ab-section-title">Six locked principles</h2>
          <div className="ab-principles">
            {PRINCIPLES.map((p, i) => (
              <div key={i} className="ab-principle">
                <div className="ab-principle-num">{String(i + 1).padStart(2, '0')}</div>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </div>
            ))}
          </div>
        </section>
      </RevealSection>

      <RevealSection>
        <section className="ab-founder">
          <div className="ab-founder-grid">
            <div className="ab-founder-photo">
              <div className="ab-founder-mark">SP</div>
            </div>
            <div className="ab-founder-text">
              <div className="ab-section-eyebrow">Founder</div>
              <h2>Srijan Paudel · Chairman</h2>
              <p>
                "I built Aiprosol because most automation work is sold by people who've never run an
                operation. A consultant builds a Zapier flow, hands it over, and disappears.
              </p>
              <p>
                We do the opposite. Every plan we ship includes monitoring, iteration, and Arora —
                your AI CEO who watches every workflow 24/7 and re-architects when the inputs change.
                Operators serving operators."
              </p>
              <a href="https://linkedin.com/in/srijan-paudel" target="_blank" rel="noopener noreferrer" className="ab-founder-link">
                Connect on LinkedIn →
              </a>
            </div>
          </div>
        </section>
      </RevealSection>

      <RevealSection>
        <section className="ab-cta">
          <h2>Want to see what an <span className="ab-grad">AI-led automation</span> looks like for your business?</h2>
          <p>The free 60-second ROI Audit gives you a personalised number — and the right next step.</p>
          <a href="/roi-audit" className="ab-cta-btn">Get Your Free ROI Audit →</a>
        </section>
      </RevealSection>

      <Styles />
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      .ab-page { background: #0A1628; color: #D4E8F7; min-height: 100vh; padding: 100px 24px 80px; font-family: 'DM Sans', system-ui, sans-serif; }
      @media (max-width: 640px) { .ab-page { padding: 80px 16px 60px; } }

      .ab-reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1); }
      .ab-reveal.is-in { opacity: 1; transform: translateY(0); }

      .ab-hero { max-width: 880px; margin: 0 auto 64px; text-align: center; }
      .ab-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(0,212,255,0.08); border: 1px solid rgba(0,212,255,0.25); border-radius: 999px; color: #00D4FF; font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 16px; }
      .ab-h1 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(36px, 5.5vw, 60px); line-height: 1.05; margin-bottom: 24px; }
      .ab-grad { background: linear-gradient(135deg, #00D4FF, #00FFE5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .ab-sub { color: #8899AA; font-size: 18px; line-height: 1.7; max-width: 720px; margin: 0 auto; }

      .ab-stats { max-width: 1080px; margin: 0 auto 80px; display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; }
      @media (max-width: 1024px) { .ab-stats { grid-template-columns: repeat(3, 1fr); } }
      @media (max-width: 640px) { .ab-stats { grid-template-columns: repeat(2, 1fr); } }
      .ab-stat { padding: 24px 16px; background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 14px; text-align: center; }
      .ab-stat-v { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; background: linear-gradient(135deg, #00D4FF, #00FFE5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1.1; }
      .ab-stat-k { font-size: 11px; color: #8899AA; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 6px; }

      .ab-section { max-width: 880px; margin: 0 auto 80px; }
      .ab-section-eyebrow { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; color: #00D4FF; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 12px; }
      .ab-section-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(28px, 4vw, 42px); line-height: 1.15; margin-bottom: 20px; }
      .ab-section-sub { color: #8899AA; font-size: 16px; line-height: 1.6; margin-bottom: 32px; }
      .ab-prose p { color: #D4E8F7; font-size: 17px; line-height: 1.8; margin-bottom: 1.4em; }

      .ab-suite { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
      @media (max-width: 1024px) { .ab-suite { grid-template-columns: repeat(2, 1fr); } }
      @media (max-width: 640px) { .ab-suite { grid-template-columns: 1fr; } }
      .ab-member { padding: 22px; background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 14px; transition: all 0.3s; }
      .ab-member:hover { border-color: #00D4FF; transform: translateY(-3px); }
      .ab-member.is-highlight { background: linear-gradient(135deg, #0D1F3C, #14284D); border-color: #00D4FF; box-shadow: 0 0 24px rgba(0,212,255,0.15); }
      .ab-member-role { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; color: #00D4FF; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 8px; }
      .ab-member-name { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; margin-bottom: 8px; }
      .ab-member-desc { color: #8899AA; font-size: 13px; line-height: 1.6; }

      .ab-principles { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
      @media (max-width: 800px) { .ab-principles { grid-template-columns: 1fr; } }
      .ab-principle { padding: 28px; background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 14px; }
      .ab-principle-num { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 24px; background: linear-gradient(135deg, #00D4FF, #00FFE5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px; }
      .ab-principle h3 { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 18px; margin-bottom: 10px; }
      .ab-principle p { color: #8899AA; font-size: 14px; line-height: 1.7; }

      .ab-founder { max-width: 1080px; margin: 0 auto 80px; padding: 48px 40px; background: linear-gradient(135deg, #0D1F3C, #14284D); border: 1px solid rgba(0,212,255,0.25); border-radius: 24px; }
      @media (max-width: 800px) { .ab-founder { padding: 32px 24px; } }
      .ab-founder-grid { display: grid; grid-template-columns: 200px 1fr; gap: 40px; align-items: center; }
      @media (max-width: 800px) { .ab-founder-grid { grid-template-columns: 1fr; gap: 24px; text-align: center; } }
      .ab-founder-photo { aspect-ratio: 1; max-width: 200px; border-radius: 50%; background: linear-gradient(135deg, #00D4FF, #00FFE5); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 32px rgba(0,212,255,0.35); margin: 0 auto; }
      .ab-founder-mark { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 64px; color: #0A1628; }
      .ab-founder-text h2 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; margin-bottom: 16px; }
      .ab-founder-text p { color: #D4E8F7; font-size: 16px; line-height: 1.75; margin-bottom: 1em; }
      .ab-founder-link { display: inline-block; margin-top: 12px; padding: 10px 18px; background: transparent; border: 1px solid #00D4FF; color: #00D4FF; border-radius: 10px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 12px; text-decoration: none; transition: all 0.2s; }
      .ab-founder-link:hover { background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628; }

      .ab-cta { max-width: 720px; margin: 0 auto; text-align: center; padding: 48px 32px; background: rgba(0,212,255,0.04); border: 1px solid rgba(0,212,255,0.25); border-radius: 24px; }
      .ab-cta h2 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(24px, 3vw, 32px); line-height: 1.2; margin-bottom: 12px; }
      .ab-cta p { color: #8899AA; font-size: 16px; margin-bottom: 24px; }
      .ab-cta-btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628 !important; border-radius: 10px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; text-decoration: none; box-shadow: 0 0 24px rgba(0,212,255,0.35); }
    `}</style>
  );
}

export default AboutPage;
