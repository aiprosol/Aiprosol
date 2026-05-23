'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { getPricingPlans } from '@/lib/content';

// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · PRICING V3
// 3-tier card grid · live ROI slider strip · 12-row comparison table
// 6-Q FAQ accordion · final ROI Audit CTA. Calendly only on Enterprise.
// ─────────────────────────────────────────────────────────────────────────

const COMPARE: Array<{ label: string; flags: [boolean, boolean, boolean] }> = [
  { label: 'Active automations', flags: [true, true, true] },
  { label: 'Arora chat widget', flags: [true, true, true] },
  { label: 'Lead capture + CRM sync', flags: [true, true, true] },
  { label: 'Custom AI chatbot', flags: [false, true, true] },
  { label: 'Sales + marketing automation', flags: [false, true, true] },
  { label: 'Document processing (IDP)', flags: [false, true, true] },
  { label: 'Customer intelligence layer', flags: [false, false, true] },
  { label: 'Full system integration', flags: [false, false, true] },
  { label: 'Dedicated workflow architect', flags: [false, false, true] },
  { label: 'Strategy calls', flags: [false, true, true] },
  { label: 'Onboarding speed', flags: [true, true, true] },
  { label: 'Support SLA', flags: [true, true, true] },
];

const FAQ_ITEMS = [
  { q: 'Can I cancel anytime?', a: 'Yes — Starter and Growth have no minimum commitment. Enterprise has a 6-month minimum because of architectural investment, then renews month-to-month.' },
  { q: "What's included in onboarding?", a: 'A discovery call (Enterprise only), a process audit, an architecture design you approve before we build, then a 14-day build sprint and go-live with monitoring. Starter and Growth are entirely self-service through the dashboard.' },
  { q: 'What if my automation breaks?', a: "Every plan includes monitoring and Arora's auto-recovery layer. Most issues self-heal before you notice. SLA: 24h on Starter, 4h on Growth, 1h on Enterprise." },
  { q: 'Can I upgrade or downgrade?', a: 'Anytime. Upgrades pro-rate immediately; downgrades take effect at the next billing cycle.' },
  { q: 'How does annual billing work?', a: 'Annual billing saves 15% vs monthly. Charged once per year, locked at today\'s price for the duration. Cancel within the first 30 days for a full refund; after that we honour the term.' },
  { q: 'What if I need more automations than my plan allows?', a: 'You can either upgrade plans or buy add-on automations à la carte. Talk to Arora in the chat widget — she\'ll quote you instantly.' },
];

export default function PricingPage() {
  const plans = getPricingPlans();
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  // 15% discount on annual billing
  const annualMultiplier = 12 * 0.85;

  const displayPrice = (basePrice: number) =>
    billing === 'annual'
      ? Math.round(basePrice * annualMultiplier)
      : basePrice;
  const displayPeriod = billing === 'annual' ? '/year' : '/month';

  return (
    <div className="pp-page">
      <header className="pp-header">
        <div className="pp-eyebrow">3 managed plans · USD · cancel anytime</div>
        <h1 className="pp-h1">
          When you&apos;re ready for <span className="pp-grad">done-for-you</span> automation
        </h1>
        <p className="pp-sub">
          Every plan includes Arora as your AI CEO. Onboarding starts in 14 days.
          Cancel anytime on Starter and Growth. Enterprise has a 6-month minimum.
        </p>

        <div className="pp-toggle">
          <button
            className={`pp-toggle-btn ${billing === 'monthly' ? 'is-active' : ''}`}
            onClick={() => setBilling('monthly')}
          >
            Monthly
          </button>
          <button
            className={`pp-toggle-btn ${billing === 'annual' ? 'is-active' : ''}`}
            onClick={() => setBilling('annual')}
          >
            Annual <span className="pp-toggle-save">save 15%</span>
          </button>
        </div>
      </header>

      <ROIStrip />

      <section className="pp-grid">
        {plans.map(p => (
          <article key={p.id} className={`pp-card ${p.featured ? 'is-featured' : ''}`}>
            {p.highlight && <div className="pp-highlight">{p.highlight}</div>}
            <div className="pp-tier">{p.name}</div>
            <div className="pp-tagline">{p.tagline}</div>
            <div className="pp-price-row">
              <div className="pp-price">${displayPrice(p.price).toLocaleString()}</div>
              <div className="pp-period">{displayPeriod}</div>
            </div>
            {billing === 'annual' && (
              <div className="pp-savings">
                Save ${(p.price * 12 - displayPrice(p.price)).toLocaleString()}/year vs monthly
              </div>
            )}
            <div className="pp-target">{p.target}</div>
            <ul className="pp-features">
              {p.features.map((f, i) => (
                <li key={i}><span className="pp-feature-check">✓</span><span>{f}</span></li>
              ))}
            </ul>
            <Link
              className="pp-cta"
              href={`${p.ctaUrl}${billing === 'annual' ? '&billing=annual' : ''}`}
              target={p.ctaUrl.startsWith('http') ? '_blank' : undefined}
              rel={p.ctaUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {p.cta}
            </Link>
            {p.id === 'enterprise' && <div className="pp-cta-note">Includes a strategy call with Srijan</div>}
          </article>
        ))}
      </section>

      <section className="pp-compare">
        <div className="pp-compare-head">
          <div></div>
          {plans.map(p => (
            <div key={p.id} className={`pp-compare-col ${p.featured ? 'is-featured' : ''}`}>
              <div className="pp-compare-name">{p.name}</div>
              <div className="pp-compare-price">${p.price.toLocaleString()}<span>/mo</span></div>
            </div>
          ))}
        </div>
        {COMPARE.map((row, i) => (
          <div key={i} className="pp-compare-row">
            <div className="pp-compare-lbl">{row.label}</div>
            {row.flags.map((flag, j) => (
              <div key={j} className={`pp-compare-cell ${plans[j].featured ? 'is-featured' : ''}`}>
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
        <Link href="/roi-audit" className="pp-cta-btn">Get Your Free ROI Audit →</Link>
      </section>

      {/* Trust strip — links to /founder + /transparency strengthen the
          entity graph (more inbound edges → stronger Knowledge Panel
          authority) and reinforce the AI-led-operating-model proof. */}
      <section className="pp-trust-strip">
        <div className="pp-trust-card">
          <div className="pp-trust-eyebrow">Who runs it</div>
          <Link href="/founder" className="pp-trust-link">
            <strong>Meet the founder →</strong>
            <span>Srijan Paudel — Founder &amp; Chairman. The only human at our AI-led C-suite.</span>
          </Link>
        </div>
        <div className="pp-trust-card">
          <div className="pp-trust-eyebrow">How it&apos;s operated</div>
          <Link href="/transparency" className="pp-trust-link">
            <strong>Live operational transparency →</strong>
            <span>Every AI agent decision, every alert, every approval — public &amp; auto-refreshed.</span>
          </Link>
        </div>
      </section>

      <Styles />
    </div>
  );
}

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
          <label>Avg hourly cost ($)</label>
          <input type="range" min={15} max={120} value={cost} onChange={e => setCost(+e.target.value)} />
          <div className="pp-roi-val">${cost}</div>
        </div>
        <div className="pp-roi-result">
          <div className="pp-roi-lbl-top">Projected annual saving · vs. doing it manually</div>
          <div className="pp-roi-num">${annual.toLocaleString()}<span className="pp-roi-yr">/yr</span></div>
          <div className="pp-roi-lbl">Estimate · uses your inputs above. Not a price.</div>
        </div>
      </div>
      <Link href="/roi-audit" className="pp-roi-cta">Get the full report →</Link>
    </div>
  );
}

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
              <span>{f.q}</span><span className="pp-faq-icon">+</span>
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
      .pp-page { background: #0A0613; color: #E5E7EB; min-height: 100vh; padding: 140px 24px 80px; font-family: 'Inter', system-ui, sans-serif; }
      @media (max-width: 640px) { .pp-page { padding: 120px 16px 60px; } }

      .pp-header { max-width: 760px; margin: 0 auto 48px; text-align: center; }
      .pp-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(139, 92, 246,0.08); border: 1px solid rgba(139, 92, 246,0.25); border-radius: 999px; color: #8B5CF6; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; }
      .pp-h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(32px, 4.5vw, 48px); line-height: 1.1; margin-bottom: 14px; }
      .pp-grad { background: linear-gradient(135deg, #8B5CF6, #C084FC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .pp-sub { color: #9CA3B5; font-size: 17px; line-height: 1.6; margin-bottom: 28px; }
      .pp-toggle { display: inline-flex; padding: 4px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 999px; gap: 4px; }
      .pp-toggle-btn { padding: 8px 18px; background: transparent; border: none; color: #9CA3B5; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 12px; cursor: pointer; border-radius: 999px; transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px; }
      .pp-toggle-btn:hover { color: #E5E7EB; }
      .pp-toggle-btn.is-active { background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; box-shadow: 0 0 14px rgba(139, 92, 246,0.25); }
      .pp-toggle-save { padding: 2px 6px; background: rgba(16, 185, 129, 0.15); color: #10B981; border-radius: 4px; font-size: 9px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; }
      .pp-toggle-btn.is-active .pp-toggle-save { background: rgba(10, 22, 40, 0.15); color: #0A0613; }
      .pp-savings { color: #10B981; font-size: 12px; font-weight: 600; margin-bottom: 10px; }

      .pp-roi { max-width: 1080px; margin: 0 auto 56px; padding: 28px; background: rgba(139, 92, 246,0.03); border: 1px solid rgba(139, 92, 246,0.18); border-radius: 18px; }
      .pp-roi-eyebrow { font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; color: #8B5CF6; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 16px; }
      .pp-roi-row { display: grid; grid-template-columns: 1fr 1fr 1.2fr; gap: 24px; align-items: center; }
      @media (max-width: 800px) { .pp-roi-row { grid-template-columns: 1fr; gap: 16px; } }
      .pp-roi-input label { display: block; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; color: #9CA3B5; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
      .pp-roi-input input[type=range] { width: 100%; accent-color: #8B5CF6; }
      .pp-roi-val { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 14px; color: #8B5CF6; margin-top: 4px; }
      .pp-roi-result { text-align: right; }
      @media (max-width: 800px) { .pp-roi-result { text-align: left; padding-top: 8px; border-top: 1px solid #2A1F3D; } }
      .pp-roi-num { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 36px; background: linear-gradient(135deg, #8B5CF6, #C084FC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1; display: inline-flex; align-items: baseline; gap: 4px; }
      .pp-roi-yr { font-size: 14px; color: #9CA3B5; font-weight: 600; -webkit-text-fill-color: #9CA3B5; }
      .pp-roi-lbl { font-size: 11px; color: #9CA3B5; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 4px; font-style: italic; }
      .pp-roi-lbl-top { font-size: 11px; color: #C084FC; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px; font-weight: 600; }
      .pp-roi-cta { display: inline-block; margin-top: 14px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 12px; color: #8B5CF6; }

      .pp-grid { max-width: 1080px; margin: 0 auto 80px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; align-items: stretch; }
      @media (max-width: 1024px) { .pp-grid { grid-template-columns: 1fr; } }
      .pp-card { position: relative; padding: 32px 28px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 20px; display: flex; flex-direction: column; transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s; }
      .pp-card:hover { transform: translateY(-4px); border-color: #8B5CF6; box-shadow: 0 0 32px rgba(139, 92, 246,0.2); }
      .pp-card.is-featured { border-color: #8B5CF6; box-shadow: 0 0 32px rgba(139, 92, 246,0.3); transform: translateY(-8px); }
      @media (max-width: 1024px) { .pp-card.is-featured { transform: none; } }
      .pp-highlight { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); padding: 6px 14px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border-radius: 999px; font-family: 'Space Grotesk', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; box-shadow: 0 0 14px rgba(139, 92, 246,0.35); }
      .pp-tier { font-family: 'Space Grotesk', sans-serif; font-size: 12px; font-weight: 700; color: #8B5CF6; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 8px; }
      .pp-tagline { color: #E5E7EB; font-size: 16px; margin-bottom: 16px; }
      .pp-price-row { display: flex; align-items: baseline; gap: 6px; margin-bottom: 8px; }
      .pp-price { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 48px; color: #E5E7EB; line-height: 1; }
      .pp-period { color: #9CA3B5; font-size: 14px; }
      .pp-target { color: #9CA3B5; font-size: 12px; padding-bottom: 20px; border-bottom: 1px solid #2A1F3D; margin-bottom: 20px; }
      .pp-features { list-style: none; padding: 0; margin: 0 0 24px; flex: 1; }
      .pp-features li { padding: 10px 0; display: flex; align-items: flex-start; gap: 10px; font-size: 14px; line-height: 1.5; }
      .pp-feature-check { color: #8B5CF6; font-weight: 700; flex-shrink: 0; }
      .pp-cta { display: block; padding: 14px; text-align: center; background: transparent; color: #8B5CF6; border: 1px solid #8B5CF6; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; text-decoration: none; transition: all 0.2s; }
      .pp-card.is-featured .pp-cta { background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border-color: transparent; box-shadow: 0 0 14px rgba(139, 92, 246,0.25); }
      .pp-cta:hover { background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; }
      .pp-cta-note { text-align: center; font-size: 11px; color: #9CA3B5; margin-top: 8px; }

      .pp-compare { max-width: 1080px; margin: 0 auto 80px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 20px; overflow: hidden; }
      .pp-compare-head { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; padding: 24px 24px 20px; border-bottom: 1px solid #2A1F3D; }
      .pp-compare-col { text-align: center; }
      .pp-compare-col.is-featured { color: #8B5CF6; }
      .pp-compare-name { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 14px; letter-spacing: 0.1em; text-transform: uppercase; color: inherit; }
      .pp-compare-price { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 22px; margin-top: 4px; }
      .pp-compare-price span { font-size: 12px; color: #9CA3B5; font-weight: 400; }
      .pp-compare-row { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; padding: 14px 24px; border-bottom: 1px solid rgba(30,58,95,0.5); align-items: center; }
      .pp-compare-row:last-child { border-bottom: none; }
      .pp-compare-row:hover { background: rgba(139, 92, 246,0.03); }
      .pp-compare-lbl { font-size: 14px; color: #E5E7EB; }
      .pp-compare-cell { text-align: center; font-size: 14px; }
      .pp-compare-cell.is-featured { background: rgba(139, 92, 246,0.04); }
      .pp-check { color: #8B5CF6; font-weight: 700; font-size: 18px; }
      .pp-dash { color: #4a6280; }

      .pp-faq { max-width: 800px; margin: 0 auto 80px; }
      .pp-faq-head { text-align: center; margin-bottom: 32px; }
      .pp-faq-title { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 32px; line-height: 1.2; margin-top: 16px; }
      .pp-faq-list { display: flex; flex-direction: column; gap: 8px; }
      .pp-faq-item { background: #13101F; border: 1px solid #2A1F3D; border-radius: 12px; overflow: hidden; }
      .pp-faq-q { width: 100%; padding: 20px 24px; background: transparent; border: none; color: #E5E7EB; font-size: 15px; font-weight: 500; text-align: left; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 16px; font-family: 'Inter', system-ui, sans-serif; }
      .pp-faq-icon { color: #8B5CF6; font-size: 22px; transition: transform 0.3s; flex-shrink: 0; }
      .pp-faq-item.is-open .pp-faq-icon { transform: rotate(45deg); }
      .pp-faq-a { max-height: 0; overflow: hidden; transition: max-height 0.3s ease, padding 0.3s ease; padding: 0 24px; }
      .pp-faq-item.is-open .pp-faq-a { max-height: 400px; padding: 0 24px 20px; }
      .pp-faq-a p { color: #9CA3B5; font-size: 14px; line-height: 1.7; }

      .pp-cta-final { max-width: 720px; margin: 0 auto; text-align: center; padding: 48px 32px; background: rgba(139, 92, 246,0.04); border: 1px solid rgba(139, 92, 246,0.25); border-radius: 24px; }
      .pp-cta-final h2 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 28px; margin-bottom: 12px; }
      .pp-cta-final p { color: #9CA3B5; font-size: 16px; margin-bottom: 24px; }
      .pp-cta-btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613 !important; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 14px; text-decoration: none; box-shadow: 0 0 24px rgba(139, 92, 246,0.35); }

      /* Trust strip — links to /founder + /transparency */
      .pp-trust-strip { max-width: 1080px; margin: 64px auto 0; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
      @media (max-width: 768px) { .pp-trust-strip { grid-template-columns: 1fr; } }
      .pp-trust-card { background: #13101F; border: 1px solid #2A1F3D; border-radius: 16px; padding: 20px 22px; transition: all 0.2s; }
      .pp-trust-card:hover { border-color: rgba(139,92,246,0.4); transform: translateY(-2px); }
      .pp-trust-eyebrow { font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; color: #8B5CF6; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 10px; }
      .pp-trust-link { display: block; color: #E5E7EB; text-decoration: none; }
      .pp-trust-link strong { display: block; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 17px; color: #E5E7EB; margin-bottom: 6px; }
      .pp-trust-link span { display: block; color: #9CA3B5; font-size: 13px; line-height: 1.55; }
    `}</style>
  );
}
