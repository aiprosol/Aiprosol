// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · PRICING PAGE V2
// Phase 1.3 — 3 managed plans + comparison table + embedded ROI strip.
// Calendly only on Enterprise card. GBP. Monthly only at launch
// (annual toggle deferred to Phase 5 per the locked decisions).
// ─────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useRef, useState } from 'react';

interface Plan {
  id: 'starter' | 'growth' | 'enterprise';
  name: string;
  price: number;
  tagline: string;
  target: string;
  featured?: boolean;
  cta: string;
  ctaUrl: string;
  features: string[];
  highlight?: string;
}

const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 997,
    tagline: 'Your first managed automations',
    target: 'SMBs · 10–50 employees · £5k–£100k/mo revenue',
    cta: 'Start with Starter',
    ctaUrl: '/checkout?plan=starter',
    features: [
      'Up to 3 active automations',
      'Arora chat widget on your site',
      'Lead capture &amp; CRM sync',
      'Monthly performance report',
      '14-day onboarding',
      'Email support · 24h response',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 2997,
    tagline: 'Scale across the operation',
    target: 'Growing businesses · 50–200 employees',
    featured: true,
    highlight: 'Most popular',
    cta: 'Start with Growth',
    ctaUrl: '/checkout?plan=growth',
    features: [
      'Up to 10 active automations',
      'Custom AI chatbot trained on your data',
      'Sales &amp; marketing automation',
      'Bi-weekly strategy calls',
      'Document processing (IDP)',
      'Priority support · 4h response',
      'Quarterly automation roadmap',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 7997,
    tagline: 'Architectural-grade automation',
    target: '200+ employees · £500k+/mo revenue',
    cta: 'Talk to Enterprise',
    ctaUrl: 'https://calendly.com/srijanpaudel219/30min',
    features: [
      'Unlimited automations',
      'Dedicated AI workflow architect',
      'Full system integration',
      'Customer intelligence layer',
      'White-glove onboarding',
      'Weekly C-suite calls with Arora',
      'SLA · 1h response',
    ],
  },
];

// Comparison table rows — each row marks which plans include the feature
const COMPARE: Array<{ label: string; tip?: string; flags: [boolean, boolean, boolean] }> = [
  { label: 'Active automations', flags: [true, true, true] },
  { label: 'Arora chat widget', flags: [true, true, true] },
  { label: 'Lead capture + CRM sync', flags: [true, true, true] },
  { label: 'Custom AI chatbot', flags: [false, true, true] },
  { label: 'Sales + marketing automation', flags: [false, true, true] },
  { label: 'Document processing (IDP)', flags: [false, true, true] },
  { label: 'Customer intelligence layer', flags: [false, false, true] },
  { label: 'Full system integration', flags: [false, false, true] },
  { label: 'Dedicated workflow architect', flags: [false, false, true] },
  { label: 'Strategy calls', tip: 'How often we meet to review and plan', flags: [false, true, true] },
  { label: 'Onboarding speed', flags: [true, true, true] },
  { label: 'Support SLA', flags: [true, true, true] },
];

const SUPPORT_VALUES: Array<[string, string, string]> = [
  // [starter, growth, enterprise]
  ['1 plan', 'Quarterly roadmap', 'Custom architecture'],
  ['Bi-weekly', 'Weekly', 'Weekly + on-call'],
  ['14-day', '14-day', '3–4 wk white-glove'],
  ['24h email', '4h priority', '1h SLA'],
];

export function PricingPage() {
  return (
    <div className="pp-page">
      <header className="pp-header">
        <div className="pp-eyebrow">3 managed plans · GBP · monthly</div>
        <h1 className="pp-h1">
          When you're ready for <span className="pp-grad">done-for-you</span> automation
        </h1>
        <p className="pp-sub">
          Every plan includes Arora as your AI CEO. Onboarding starts in 14 days.
          Cancel anytime on Starter and Growth. Enterprise has a 6-month minimum.
        </p>
      </header>

      <ROIStrip />

      <section className="pp-grid">
        {PLANS.map(p => <PlanCard key={p.id} plan={p} />)}
      </section>

      <section className="pp-compare">
        <div className="pp-compare-head">
          <div></div>
          {PLANS.map(p => (
            <div key={p.id} className={`pp-compare-col ${p.featured ? 'is-featured' : ''}`}>
              <div className="pp-compare-name">{p.name}</div>
              <div className="pp-compare-price">£{p.price.toLocaleString()}<span>/mo</span></div>
            </div>
          ))}
        </div>
        {COMPARE.map((row, i) => (
          <div key={i} className="pp-compare-row">
            <div className="pp-compare-lbl">{row.label}</div>
            {row.flags.map((flag, j) => (
              <div key={j} className={`pp-compare-cell ${PLANS[j].featured ? 'is-featured' : ''}`}>
                {flag ? <span className="pp-check">✓</span> : <span className="pp-dash">—</span>}
              </div>
            ))}
          </div>
        ))}
      </section>

      <FAQ />

      <section className="pp-cta-final">
        <h2>Still unsure which plan fits?</h2>
        <p>Run the free 60-second ROI Audit — Arora picks the plan based on your actual numbers.</p>
        <a href="/roi-audit" className="pp-cta-btn">Get Your Free ROI Audit →</a>
      </section>

      <Styles />
    </div>
  );
}

// ────── Plan card ──────
function PlanCard({ plan }: { plan: Plan }) {
  const isExternal = plan.ctaUrl.startsWith('http');
  return (
    <article className={`pp-card ${plan.featured ? 'is-featured' : ''}`}>
      {plan.highlight && <div className="pp-highlight">{plan.highlight}</div>}
      <div className="pp-tier">{plan.name}</div>
      <div className="pp-tagline">{plan.tagline}</div>
      <div className="pp-price-row">
        <div className="pp-price">£{plan.price.toLocaleString()}</div>
        <div className="pp-period">/month</div>
      </div>
      <div className="pp-target">{plan.target}</div>
      <ul className="pp-features">
        {plan.features.map((f, i) => (
          <li key={i}><span className="pp-feature-check">✓</span><span dangerouslySetInnerHTML={{ __html: f }} /></li>
        ))}
      </ul>
      <a
        className="pp-cta"
        href={plan.ctaUrl}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
      >
        {plan.cta}
      </a>
      {plan.id === 'enterprise' && (
        <div className="pp-cta-note">Includes a strategy call with Srijan</div>
      )}
    </article>
  );
}

// ────── Embedded mini ROI strip ──────
function ROIStrip() {
  const [hours, setHours] = useState(40);
  const [cost, setCost] = useState(35);

  const annual = useMemo(() => Math.round(hours * 0.7 * cost * 50), [hours, cost]);

  return (
    <div className="pp-roi">
      <div className="pp-roi-eyebrow">Quick estimate</div>
      <div className="pp-roi-row">
        <div className="pp-roi-input">
          <label>Manual hrs / week</label>
          <input type="range" min={5} max={120} value={hours} onChange={e => setHours(+e.target.value)} />
          <div className="pp-roi-val">{hours} hrs</div>
        </div>
        <div className="pp-roi-input">
          <label>Avg hourly cost (£)</label>
          <input type="range" min={15} max={120} value={cost} onChange={e => setCost(+e.target.value)} />
          <div className="pp-roi-val">£{cost}</div>
        </div>
        <div className="pp-roi-result">
          <div className="pp-roi-num">£{annual.toLocaleString()}</div>
          <div className="pp-roi-lbl">Projected annual saving</div>
        </div>
      </div>
      <a href="/roi-audit" className="pp-roi-cta">Get the full report →</a>
    </div>
  );
}

// ────── FAQ ──────
const FAQ_ITEMS = [
  { q: 'Can I cancel anytime?', a: 'Yes — Starter and Growth have no minimum commitment. Enterprise has a 6-month minimum because of architectural investment, then renews month-to-month.' },
  { q: 'What\'s included in onboarding?', a: 'A discovery call (Enterprise only), a process audit, an architecture design you approve before we build, then a 14-day build sprint and go-live with monitoring. Starter and Growth are entirely self-service through the dashboard.' },
  { q: 'What if my automation breaks?', a: 'Every plan includes monitoring and Arora\'s auto-recovery layer. Most issues self-heal before you notice. SLA: 24h on Starter, 4h on Growth, 1h on Enterprise.' },
  { q: 'Can I upgrade or downgrade?', a: 'Anytime. Upgrades pro-rate immediately; downgrades take effect at the next billing cycle.' },
  { q: 'Do you offer annual billing?', a: 'Annual billing with a 15% discount is on the roadmap (Phase 5 of our V2 build). For now, monthly billing only.' },
  { q: 'What if I need more automations than my plan allows?', a: 'You can either upgrade plans or buy add-on automations à la carte. Talk to Arora in the chat widget — she\'ll quote you instantly.' },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="pp-faq">
      <div className="pp-faq-head">
        <div className="pp-eyebrow">FAQ</div>
        <h2 className="pp-faq-title">Pricing questions, answered straight</h2>
      </div>
      <div className="pp-faq-list">
        {FAQ_ITEMS.map((f, i) => (
          <div key={i} className={`pp-faq-item ${open === i ? 'is-open' : ''}`}>
            <button className="pp-faq-q" onClick={() => setOpen(open === i ? null : i)}>
              <span>{f.q}</span>
              <span className="pp-faq-icon">+</span>
            </button>
            <div className="pp-faq-a"><p>{f.a}</p></div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Styles() {
  return (
    <style>{`
      .pp-page { background: #0A1628; color: #D4E8F7; min-height: 100vh; padding: 100px 24px 80px; font-family: 'DM Sans', system-ui, sans-serif; }
      @media (max-width: 640px) { .pp-page { padding: 80px 16px 60px; } }

      .pp-header { max-width: 760px; margin: 0 auto 48px; text-align: center; }
      .pp-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(0,212,255,0.08); border: 1px solid rgba(0,212,255,0.25); border-radius: 999px; color: #00D4FF; font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; }
      .pp-h1 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(32px, 4.5vw, 48px); line-height: 1.1; margin-bottom: 14px; }
      .pp-grad { background: linear-gradient(135deg, #00D4FF, #00FFE5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      .pp-sub { color: #8899AA; font-size: 17px; line-height: 1.6; }

      /* ROI strip */
      .pp-roi { max-width: 1080px; margin: 0 auto 56px; padding: 28px; background: rgba(0,212,255,0.03); border: 1px solid rgba(0,212,255,0.18); border-radius: 18px; }
      .pp-roi-eyebrow { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; color: #00D4FF; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 16px; }
      .pp-roi-row { display: grid; grid-template-columns: 1fr 1fr 1.2fr; gap: 24px; align-items: center; }
      @media (max-width: 800px) { .pp-roi-row { grid-template-columns: 1fr; gap: 16px; } }
      .pp-roi-input label { display: block; font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; color: #8899AA; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
      .pp-roi-input input[type=range] { width: 100%; accent-color: #00D4FF; }
      .pp-roi-val { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: #00D4FF; margin-top: 4px; }
      .pp-roi-result { text-align: right; }
      @media (max-width: 800px) { .pp-roi-result { text-align: left; padding-top: 8px; border-top: 1px solid #1E3A5F; } }
      .pp-roi-num { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 36px; background: linear-gradient(135deg, #00D4FF, #00FFE5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1; }
      .pp-roi-lbl { font-size: 11px; color: #8899AA; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 4px; }
      .pp-roi-cta { display: inline-block; margin-top: 14px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 12px; color: #00D4FF; }

      /* Cards */
      .pp-grid { max-width: 1080px; margin: 0 auto 80px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; align-items: stretch; }
      @media (max-width: 1024px) { .pp-grid { grid-template-columns: 1fr; } }
      .pp-card { position: relative; padding: 32px 28px; background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 20px; display: flex; flex-direction: column; transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s; }
      .pp-card:hover { transform: translateY(-4px); border-color: #00D4FF; box-shadow: 0 0 32px rgba(0,212,255,0.2); }
      .pp-card.is-featured { border-color: #00D4FF; box-shadow: 0 0 32px rgba(0,212,255,0.3); transform: translateY(-8px); }
      @media (max-width: 1024px) { .pp-card.is-featured { transform: none; } }
      .pp-highlight { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); padding: 6px 14px; background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628; border-radius: 999px; font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; box-shadow: 0 0 14px rgba(0,212,255,0.35); }
      .pp-tier { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700; color: #00D4FF; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 8px; }
      .pp-tagline { color: #D4E8F7; font-size: 16px; margin-bottom: 16px; }
      .pp-price-row { display: flex; align-items: baseline; gap: 6px; margin-bottom: 8px; }
      .pp-price { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 48px; color: #D4E8F7; line-height: 1; }
      .pp-period { color: #8899AA; font-size: 14px; }
      .pp-target { color: #8899AA; font-size: 12px; padding-bottom: 20px; border-bottom: 1px solid #1E3A5F; margin-bottom: 20px; }
      .pp-features { list-style: none; padding: 0; margin: 0 0 24px; flex: 1; }
      .pp-features li { padding: 10px 0; display: flex; align-items: flex-start; gap: 10px; font-size: 14px; line-height: 1.5; }
      .pp-feature-check { color: #00D4FF; font-weight: 700; flex-shrink: 0; }
      .pp-cta { display: block; padding: 14px; text-align: center; background: transparent; color: #00D4FF; border: 1px solid #00D4FF; border-radius: 10px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; text-decoration: none; transition: all 0.2s; }
      .pp-card.is-featured .pp-cta { background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628; border-color: transparent; box-shadow: 0 0 14px rgba(0,212,255,0.25); }
      .pp-cta:hover { background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628; }
      .pp-cta-note { text-align: center; font-size: 11px; color: #8899AA; margin-top: 8px; }

      /* Compare table */
      .pp-compare { max-width: 1080px; margin: 0 auto 80px; background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 20px; overflow: hidden; }
      .pp-compare-head { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; padding: 24px 24px 20px; border-bottom: 1px solid #1E3A5F; }
      .pp-compare-col { text-align: center; }
      .pp-compare-col.is-featured { color: #00D4FF; }
      .pp-compare-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; letter-spacing: 0.1em; text-transform: uppercase; color: inherit; }
      .pp-compare-price { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; margin-top: 4px; }
      .pp-compare-price span { font-size: 12px; color: #8899AA; font-weight: 400; }
      .pp-compare-row { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; padding: 14px 24px; border-bottom: 1px solid rgba(30,58,95,0.5); align-items: center; }
      .pp-compare-row:last-child { border-bottom: none; }
      .pp-compare-row:hover { background: rgba(0,212,255,0.03); }
      .pp-compare-lbl { font-size: 14px; color: #D4E8F7; }
      .pp-compare-cell { text-align: center; font-size: 14px; }
      .pp-compare-cell.is-featured { background: rgba(0,212,255,0.04); }
      .pp-check { color: #00D4FF; font-weight: 700; font-size: 18px; }
      .pp-dash { color: #4a6280; }

      /* FAQ */
      .pp-faq { max-width: 800px; margin: 0 auto 80px; }
      .pp-faq-head { text-align: center; margin-bottom: 32px; }
      .pp-faq-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 32px; line-height: 1.2; margin-top: 16px; }
      .pp-faq-list { display: flex; flex-direction: column; gap: 8px; }
      .pp-faq-item { background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 12px; overflow: hidden; }
      .pp-faq-q { width: 100%; padding: 20px 24px; background: transparent; border: none; color: #D4E8F7; font-size: 15px; font-weight: 500; text-align: left; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 16px; font-family: 'DM Sans', system-ui, sans-serif; }
      .pp-faq-icon { color: #00D4FF; font-size: 22px; transition: transform 0.3s; flex-shrink: 0; }
      .pp-faq-item.is-open .pp-faq-icon { transform: rotate(45deg); }
      .pp-faq-a { max-height: 0; overflow: hidden; transition: max-height 0.3s ease, padding 0.3s ease; padding: 0 24px; }
      .pp-faq-item.is-open .pp-faq-a { max-height: 400px; padding: 0 24px 20px; }
      .pp-faq-a p { color: #8899AA; font-size: 14px; line-height: 1.7; }

      /* Final CTA */
      .pp-cta-final { max-width: 720px; margin: 0 auto; text-align: center; padding: 48px 32px; background: rgba(0,212,255,0.04); border: 1px solid rgba(0,212,255,0.25); border-radius: 24px; }
      .pp-cta-final h2 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; margin-bottom: 12px; }
      .pp-cta-final p { color: #8899AA; font-size: 16px; margin-bottom: 24px; }
      .pp-cta-btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628 !important; border-radius: 10px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; text-decoration: none; box-shadow: 0 0 24px rgba(0,212,255,0.35); }
    `}</style>
  );
}

export default PricingPage;
