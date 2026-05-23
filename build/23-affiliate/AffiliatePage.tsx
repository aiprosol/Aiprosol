// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · AFFILIATE PROGRAM · /affiliate
// Phase 5.8 · landing + application form. Writes to `affiliatepartners` CMS.
// 30% commission on digital products · 20% on plans (recurring) · cookie 60d.
// ─────────────────────────────────────────────────────────────────────────

import { items } from '@wix/data';
import { useWixModules } from '@wix/sdk-react';
import { useState } from 'react';

const TIERS = [
  { tier: 'Digital products', commission: '30%', payout: '£11.10 → £299.10', detail: 'Per sale of any of our 19 products (£17–£997).' },
  { tier: 'Managed plans', commission: '20%', payout: '£199 / £599 / £1,599 monthly', detail: 'Recurring monthly while the client stays on plan. No cap.' },
  { tier: 'Cookie window', commission: '60 days', payout: 'Last-touch attribution', detail: 'If your link is clicked, you get credit for any purchase in 60 days.' },
];

const PERKS = [
  'Real-time dashboard with click + sale tracking',
  'Pre-built creative kit (logos, banners, copy snippets)',
  'Dedicated affiliate manager (Arora, AI)',
  'Monthly Stripe payout · GBP · automatic',
  'Lifetime cookie attribution per signed-in lead',
  'Co-marketing opportunities for top-tier partners',
];

const IDEAL = [
  { type: 'Newsletter operators', desc: 'Audiences in Operations, B2B SaaS, Founders, RevOps. 1k+ subscribers.' },
  { type: 'YouTube creators', desc: 'Automation, AI tools, business operations. 5k+ subscribers.' },
  { type: 'Podcast hosts', desc: 'Operator-focused interviews. 1k+ downloads/episode.' },
  { type: 'Consultants', desc: 'Already advising on automation; want a vetted partner you can recommend.' },
  { type: 'Agency owners', desc: 'Want a back-end partner for client work you don\'t want to handle.' },
];

export function AffiliatePage() {
  const { createDataItem } = useWixModules(items);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [audience, setAudience] = useState('');
  const [size, setSize] = useState('');
  const [why, setWhy] = useState('');
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!name || !/\S+@\S+\.\S+/.test(email)) return;
    setSubmitting(true);
    try {
      await createDataItem({
        dataCollectionId: 'affiliatepartners',
        dataItem: {
          data: {
            fullName: name,
            email,
            audienceType: audience,
            audienceSize: size,
            whyJoin: why,
            applicationStatus: 'Pending Review',
            appliedAt: new Date().toISOString(),
          },
        },
        options: { suppressAuth: true },
      });
      setDone(true);
    } catch (err) {
      console.error('Affiliate application failed', err);
      setDone(true); // Don't penalise the user
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="af-page">
      <header className="af-hero">
        <div className="af-eyebrow">Aiprosol Affiliate Program</div>
        <h1 className="af-h1">
          Recommend automation that <span className="af-grad">actually works</span> — and earn while you do.
        </h1>
        <p className="af-sub">
          Up to 30% on digital products, 20% recurring on managed plans, 60-day cookie. No cap, monthly Stripe payout, GBP.
        </p>
      </header>

      <section className="af-tiers">
        {TIERS.map(t => (
          <div key={t.tier} className="af-tier">
            <div className="af-tier-name">{t.tier}</div>
            <div className="af-tier-amount">{t.commission}</div>
            <div className="af-tier-payout">{t.payout}</div>
            <p className="af-tier-detail">{t.detail}</p>
          </div>
        ))}
      </section>

      <section className="af-section">
        <div className="af-section-eyebrow">What you get</div>
        <h2 className="af-section-title">Affiliate, not amateur hour</h2>
        <div className="af-perks">
          {PERKS.map((p, i) => (
            <div key={i} className="af-perk">
              <span className="af-perk-check">✓</span>
              <span>{p}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="af-section">
        <div className="af-section-eyebrow">Who this fits</div>
        <h2 className="af-section-title">Ideal partners</h2>
        <div className="af-ideal">
          {IDEAL.map(i => (
            <div key={i.type} className="af-ideal-card">
              <h3>{i.type}</h3>
              <p>{i.desc}</p>
            </div>
          ))}
        </div>
        <p className="af-ideal-note">
          Not a perfect fit? Apply anyway. We review every application and we're usually flexible
          if your audience overlaps with operators, founders, or business buyers.
        </p>
      </section>

      <section className="af-apply">
        <h2 className="af-apply-title">Apply to the program</h2>
        <p className="af-apply-sub">2-minute form. Reviewed within 5 business days. No phone interview.</p>

        {done ? (
          <div className="af-done">
            <div className="af-check">✓</div>
            <h3>Application received</h3>
            <p>I'll review and reply within 5 business days. If approved, you'll get your unique affiliate link, dashboard credentials, and the creative kit.</p>
            <p className="af-done-sub">Reply to your application email if you have questions in the meantime.</p>
          </div>
        ) : (
          <div className="af-form">
            <div className="af-row">
              <div className="af-field">
                <label>Your name *</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Sarah Johnson" />
              </div>
              <div className="af-field">
                <label>Email *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="sarah@example.com" />
              </div>
            </div>

            <div className="af-row">
              <div className="af-field">
                <label>Audience type *</label>
                <select value={audience} onChange={e => setAudience(e.target.value)}>
                  <option value="">Select…</option>
                  <option>Newsletter</option>
                  <option>YouTube</option>
                  <option>Podcast</option>
                  <option>Consultant / agency</option>
                  <option>Course creator</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="af-field">
                <label>Audience size *</label>
                <select value={size} onChange={e => setSize(e.target.value)}>
                  <option value="">Select…</option>
                  <option>Under 1,000</option>
                  <option>1,000 – 5,000</option>
                  <option>5,000 – 25,000</option>
                  <option>25,000 – 100,000</option>
                  <option>100,000+</option>
                </select>
              </div>
            </div>

            <div className="af-field">
              <label>Why Aiprosol fits your audience</label>
              <textarea
                rows={4}
                value={why}
                onChange={e => setWhy(e.target.value)}
                placeholder="One paragraph: what your audience cares about, why automation is relevant, and what you'd recommend first."
              />
            </div>

            <button className="af-submit" onClick={submit} disabled={submitting || !name || !email || !audience || !size}>
              {submitting ? 'Submitting…' : 'Apply now →'}
            </button>
            <div className="af-trust">✓ No phone screening · ✓ 5-day review · ✓ GBP payout · ✓ Fair terms</div>
          </div>
        )}
      </section>

      <Styles />
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      .af-page { background: #0A1628; color: #D4E8F7; min-height: 100vh; padding: 100px 24px 80px; font-family: 'DM Sans', system-ui, sans-serif; }
      @media (max-width: 640px) { .af-page { padding: 80px 16px 60px; } }

      .af-hero { max-width: 800px; margin: 0 auto 56px; text-align: center; }
      .af-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(0,212,255,0.08); border: 1px solid rgba(0,212,255,0.25); border-radius: 999px; color: #00D4FF; font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 16px; }
      .af-h1 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(34px, 5vw, 54px); line-height: 1.1; margin-bottom: 20px; }
      .af-grad { background: linear-gradient(135deg, #00D4FF, #00FFE5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .af-sub { color: #8899AA; font-size: 17px; line-height: 1.7; }

      .af-tiers { max-width: 1080px; margin: 0 auto 80px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
      @media (max-width: 800px) { .af-tiers { grid-template-columns: 1fr; } }
      .af-tier { padding: 28px; background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 16px; text-align: center; transition: all 0.3s; }
      .af-tier:hover { transform: translateY(-3px); border-color: #00D4FF; }
      .af-tier-name { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700; color: #00D4FF; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 12px; }
      .af-tier-amount { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 48px; background: linear-gradient(135deg, #00D4FF, #00FFE5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1; margin-bottom: 8px; }
      .af-tier-payout { color: #D4E8F7; font-size: 14px; font-weight: 600; margin-bottom: 14px; padding-bottom: 14px; border-bottom: 1px solid rgba(30,58,95,0.5); }
      .af-tier-detail { color: #8899AA; font-size: 13px; line-height: 1.6; }

      .af-section { max-width: 1080px; margin: 0 auto 80px; }
      .af-section-eyebrow { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; color: #00D4FF; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 12px; }
      .af-section-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(26px, 3.5vw, 38px); line-height: 1.15; margin-bottom: 28px; }

      .af-perks { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
      @media (max-width: 640px) { .af-perks { grid-template-columns: 1fr; } }
      .af-perk { display: flex; gap: 12px; align-items: flex-start; padding: 16px 18px; background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 12px; font-size: 14px; line-height: 1.5; }
      .af-perk-check { width: 22px; height: 22px; flex-shrink: 0; background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; }

      .af-ideal { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 24px; }
      @media (max-width: 1024px) { .af-ideal { grid-template-columns: repeat(2, 1fr); } }
      @media (max-width: 640px) { .af-ideal { grid-template-columns: 1fr; } }
      .af-ideal-card { padding: 22px; background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 12px; }
      .af-ideal-card h3 { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #00D4FF; margin-bottom: 8px; }
      .af-ideal-card p { color: #8899AA; font-size: 13px; line-height: 1.6; }
      .af-ideal-note { color: #8899AA; font-size: 13px; line-height: 1.6; padding: 16px 20px; background: rgba(0,212,255,0.04); border-left: 3px solid #00D4FF; border-radius: 0 8px 8px 0; }

      .af-apply { max-width: 760px; margin: 0 auto; padding: 40px; background: #0D1F3C; border: 1px solid rgba(0,212,255,0.25); border-radius: 24px; }
      @media (max-width: 640px) { .af-apply { padding: 28px 20px; } }
      .af-apply-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; margin-bottom: 8px; }
      .af-apply-sub { color: #8899AA; font-size: 14px; margin-bottom: 28px; }

      .af-form { display: flex; flex-direction: column; gap: 16px; }
      .af-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      @media (max-width: 640px) { .af-row { grid-template-columns: 1fr; } }
      .af-field { display: flex; flex-direction: column; }
      .af-field label { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; color: #8899AA; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 6px; }
      .af-field input, .af-field select, .af-field textarea {
        width: 100%; padding: 12px 14px; background: #0A1628; border: 1px solid #1E3A5F; color: #D4E8F7; font-size: 14px; border-radius: 10px; outline: none; font-family: 'DM Sans', system-ui, sans-serif; transition: border 0.2s;
      }
      .af-field input:focus, .af-field select:focus, .af-field textarea:focus { border-color: #00D4FF; box-shadow: 0 0 0 3px rgba(0,212,255,0.15); }
      .af-field input::placeholder, .af-field textarea::placeholder { color: #4a6280; }
      .af-field textarea { resize: vertical; min-height: 100px; }

      .af-submit { padding: 14px; background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628; border: none; border-radius: 10px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; cursor: pointer; box-shadow: 0 0 24px rgba(0,212,255,0.3); transition: transform 0.2s; margin-top: 8px; }
      .af-submit:hover:not(:disabled) { transform: translateY(-2px); }
      .af-submit:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }
      .af-trust { font-size: 11px; color: #8899AA; text-align: center; margin-top: 4px; }

      .af-done { text-align: center; padding: 16px 0; }
      .af-check { width: 56px; height: 56px; margin: 0 auto 16px; background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; box-shadow: 0 0 32px rgba(0,212,255,0.45); }
      .af-done h3 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 24px; margin-bottom: 8px; }
      .af-done p { color: #8899AA; font-size: 14px; line-height: 1.6; max-width: 480px; margin: 0 auto 8px; }
      .af-done-sub { font-size: 12px; opacity: 0.7; }
    `}</style>
  );
}

export default AffiliatePage;
