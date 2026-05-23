// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · ROI AUDIT V2
// Phase 1.2 · 4-step wizard with animated transitions, live calculation
// preview, animated bar-chart report, tier-routed CTAs.
//
// Step flow:
//   0 · Identity (name, email, company)
//   1 · Business (industry, employees, monthly revenue)
//   2 · Pain (manual hours, hourly cost, challenge, experience)
//   3 · Report (animated counters, bar chart, tier CTA, email-me option)
//
// Backend: calls captureLead from backend/captureLead.web.js, which writes
// the lead, computes the score, fires the Zapier webhook.
// Falls back to local calc if the backend isn't deployed yet.
// ─────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useRef, useState } from 'react';

// Optional backend imports — wrapped so the page works even if the Velo
// functions aren't deployed yet.
let captureLeadFn: any = null;
try {
  // @ts-ignore — Wix Vibe resolves this at runtime
  captureLeadFn = require('backend/captureLead.web').captureLead;
} catch {}

// ────── Types ──────
interface FormData {
  name: string;
  email: string;
  company: string;
  industry: string;
  employees: string;
  monthlyRevenue: string;
  manualHours: string;
  hourlyCost: string;
  primaryChallenge: string;
  automationExperience: string;
}

interface ROIResult {
  tier: 'Digital' | 'Plan' | 'Enterprise';
  planRec: string;
  productRec: string;
  weeklyHrs: number;
  annualSaving: number;
  annualPlan: number;
  roi: number | null;
  payback: number | null;
  score: number;
  industryNote: string;
  leadId?: string;
}

const INDUSTRIES = [
  'Professional Services', 'Real Estate', 'Legal', 'Financial Services',
  'E-commerce', 'Manufacturing', 'Healthcare', 'SaaS', 'Other',
];
const REVENUES = [
  'Under £5k', '£5k – £25k', '£25k – £100k', '£100k – £500k', '£500k+',
];
const CHALLENGES = [
  'Lead response too slow', 'Manual data entry everywhere',
  'Customer support overload', 'Sales pipeline opaque',
  'Document processing bottleneck', 'Reporting takes forever', 'Other',
];
const EXPERIENCES = [
  'None — starting from scratch',
  'Some — using Zapier or similar',
  'Advanced — already running custom workflows',
];

const STEPS = ['Identity', 'Business', 'Pain', 'Report'] as const;

// ────── Local fallback calculation (mirrors backend/calcROI.web.js) ──────
function calcLocal(d: FormData): ROIResult {
  const employees = +d.employees || 0;
  const hours = +d.manualHours || 0;
  const cost = +d.hourlyCost || 0;
  const weeklyHrs = Math.round(hours * 0.7);
  const annualSaving = Math.round(weeklyHrs * cost * 50);

  let tier: ROIResult['tier'];
  if (employees < 10 || d.monthlyRevenue === 'Under £5k') tier = 'Digital';
  else if (employees > 200 || ['£500k+', '£100k – £500k'].includes(d.monthlyRevenue)) tier = 'Enterprise';
  else tier = 'Plan';

  let planCost = 0;
  let planRec = 'Self-serve products only';
  if (tier === 'Plan') {
    planCost = employees >= 50 ? 2997 : 997;
    planRec = employees >= 50 ? 'Growth — £2,997/mo' : 'Starter — £997/mo';
  } else if (tier === 'Enterprise') {
    planCost = 7997;
    planRec = 'Enterprise — £7,997/mo';
  }
  const annualPlan = planCost * 12;
  const roi = annualPlan > 0 ? Math.round((annualSaving / annualPlan) * 100) : null;
  const payback = (annualPlan > 0 && annualSaving > 0)
    ? Math.max(1, Math.round((annualPlan / annualSaving) * 52))
    : null;

  let score = 30;
  if (employees >= 10) score += 20;
  if (employees >= 50) score += 15;
  if (d.monthlyRevenue === '£100k – £500k') score += 15;
  if (d.monthlyRevenue === '£500k+') score += 25;
  if (hours >= 30) score += 10;
  if (d.primaryChallenge.length > 20) score += 5;
  score = Math.min(100, score);

  let productRec;
  if (tier === 'Digital') productRec = 'Business Process Audit Checklist · £37';
  else if (tier === 'Plan' && employees < 50) productRec = 'Lead Generation Automation Playbook · £127';
  else if (tier === 'Plan') productRec = 'AI Workflow Architecture Masterclass · £297';
  else productRec = 'Enterprise AI Readiness Assessment Kit · £397';

  const notes: Record<string, string> = {
    Legal: 'Contract review automation typically reclaims 32–45 partner hours/week.',
    'Real Estate': 'Lead response automation drops time-to-contact from hours to minutes.',
    Manufacturing: 'Vision + telemetry pipelines cut defect rates by 60–85%.',
    Retail: 'Demand prediction reduces stockouts by 60–75%.',
    'E-commerce': 'Customer intelligence + cart automation typically lifts revenue 18–25%.',
    'Financial Services': 'Document processing at 99%+ accuracy with full audit trail.',
    Healthcare: 'Patient intake + records automation; HIPAA-grade architecture.',
    SaaS: 'Lead scoring + churn prediction; ICP-aligned outbound.',
    'Professional Services': 'Workflow + scheduling + comms automation reclaims 25–35 hrs/week.',
  };

  return {
    tier, planRec, productRec, weeklyHrs, annualSaving, annualPlan, roi, payback, score,
    industryNote: notes[d.industry] || 'Significant automation potential across multiple workflows.',
  };
}

// ────── Animated number ──────
function AnimNum({ to, prefix = '', suffix = '', dur = 1400 }: { to: number; prefix?: string; suffix?: string; dur?: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(to * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [to, dur]);
  return <>{prefix}{v.toLocaleString()}{suffix}</>;
}

// ────── Main page ──────
export function ROIAuditPage() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [submitting, setSubmitting] = useState(false);
  const [report, setReport] = useState<ROIResult | null>(null);
  const [emailMeChecked, setEmailMeChecked] = useState(true);

  const [data, setData] = useState<FormData>({
    name: '', email: '', company: '',
    industry: '', employees: '', monthlyRevenue: '',
    manualHours: '', hourlyCost: '',
    primaryChallenge: '', automationExperience: '',
  });

  const update = (k: keyof FormData, v: string) =>
    setData(prev => ({ ...prev, [k]: v }));

  const canAdvance = useMemo(() => {
    if (step === 0) return data.name.trim().length > 1 && /\S+@\S+\.\S+/.test(data.email);
    if (step === 1) return !!(data.industry && data.employees && data.monthlyRevenue);
    if (step === 2) return !!(data.manualHours && data.hourlyCost);
    return true;
  }, [step, data]);

  // Live preview calculation (always runs, even mid-form)
  const livePreview = useMemo(() => {
    if (!data.manualHours || !data.hourlyCost) return null;
    return calcLocal(data);
  }, [data]);

  const next = () => { setDirection(1); setStep(s => Math.min(3, s + 1)); };
  const back = () => { setDirection(-1); setStep(s => Math.max(0, s - 1)); };

  const generate = async () => {
    setSubmitting(true);
    let result: ROIResult;

    try {
      if (captureLeadFn) {
        const r = await captureLeadFn({
          name: data.name,
          email: data.email,
          company: data.company,
          employees: data.employees,
          industry: data.industry,
          monthlyRevenue: data.monthlyRevenue,
          manualHoursPerWeek: data.manualHours,
          hourlyCost: data.hourlyCost,
          primaryChallenge: data.primaryChallenge,
          automationExperience: data.automationExperience,
          source: 'ROI Audit',
        });
        result = r;
      } else {
        result = calcLocal(data);
      }
    } catch (err) {
      console.warn('captureLead failed, falling back to local calc', err);
      result = calcLocal(data);
    }

    setReport(result);
    setSubmitting(false);
    setDirection(1);
    setStep(3);
  };

  return (
    <div className="ra-page">
      <header className="ra-header">
        <div className="ra-eyebrow">● Free · No call required · 60 seconds</div>
        <h1 className="ra-h1">
          See your ROI <span className="ra-grad">before</span> you commit a pound
        </h1>
        <p className="ra-sub">
          Arora analyses your inputs and returns an instant report — your projected savings,
          the right plan for your stage, and the products that fit.
        </p>
      </header>

      <div className="ra-progress">
        {STEPS.map((label, i) => (
          <div key={label} className="ra-progress-item">
            <div className={`ra-progress-dot ${i === step ? 'is-active' : ''} ${i < step ? 'is-done' : ''}`}>
              {i < step ? '✓' : i + 1}
            </div>
            <div className="ra-progress-label">{label}</div>
            {i < STEPS.length - 1 && <div className={`ra-progress-line ${i < step ? 'is-done' : ''}`} />}
          </div>
        ))}
      </div>

      <div className="ra-shell">
        <div
          key={step}
          className={`ra-card ra-anim-${direction === 1 ? 'in-right' : 'in-left'}`}
        >
          {step === 0 && <IdentityStep d={data} u={update} />}
          {step === 1 && <BusinessStep d={data} u={update} />}
          {step === 2 && <PainStep d={data} u={update} preview={livePreview} />}
          {step === 3 && report && <ReportScreen r={report} d={data} emailMe={emailMeChecked} setEmailMe={setEmailMeChecked} />}
        </div>

        {step < 3 && (
          <div className="ra-nav">
            {step > 0 ? (
              <button className="ra-back" onClick={back}>← Back</button>
            ) : <span />}
            {step < 2 ? (
              <button className="ra-next" onClick={next} disabled={!canAdvance}>
                Next →
              </button>
            ) : (
              <button className="ra-next ra-next-final" onClick={generate} disabled={!canAdvance || submitting}>
                {submitting ? <><span className="ra-spinner" /> Generating…</> : 'Generate My Report →'}
              </button>
            )}
          </div>
        )}
      </div>

      <Styles />
    </div>
  );
}

// ────── Step 0 · Identity ──────
function IdentityStep({ d, u }: { d: FormData; u: (k: keyof FormData, v: string) => void }) {
  return (
    <div className="ra-step">
      <div className="ra-step-eyebrow">Step 1 of 3</div>
      <h2 className="ra-step-title">Who's the report for?</h2>
      <p className="ra-step-sub">No spam. No call. Just your personalised report — and a follow-up only if you ask for one.</p>

      <div className="ra-row">
        <Field label="Your name" required>
          <input value={d.name} onChange={e => u('name', e.target.value)} placeholder="Sarah Johnson" autoFocus />
        </Field>
        <Field label="Email" required>
          <input type="email" value={d.email} onChange={e => u('email', e.target.value)} placeholder="sarah@company.com" />
        </Field>
      </div>
      <Field label="Company (optional)">
        <input value={d.company} onChange={e => u('company', e.target.value)} placeholder="Acme Ltd" />
      </Field>
    </div>
  );
}

// ────── Step 1 · Business ──────
function BusinessStep({ d, u }: { d: FormData; u: (k: keyof FormData, v: string) => void }) {
  return (
    <div className="ra-step">
      <div className="ra-step-eyebrow">Step 2 of 3</div>
      <h2 className="ra-step-title">Tell me about your business</h2>
      <p className="ra-step-sub">This shapes which case studies and product recommendations apply to you.</p>

      <Field label="Industry" required>
        <div className="ra-chips">
          {INDUSTRIES.map(i => (
            <button
              key={i}
              type="button"
              className={`ra-chip ${d.industry === i ? 'is-on' : ''}`}
              onClick={() => u('industry', i)}
            >
              {i}
            </button>
          ))}
        </div>
      </Field>

      <div className="ra-row">
        <Field label="Employees" required>
          <input type="number" min={1} value={d.employees} onChange={e => u('employees', e.target.value)} placeholder="25" />
        </Field>
        <Field label="Monthly revenue" required>
          <select value={d.monthlyRevenue} onChange={e => u('monthlyRevenue', e.target.value)}>
            <option value="">Select…</option>
            {REVENUES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
      </div>
    </div>
  );
}

// ────── Step 2 · Pain ──────
function PainStep({ d, u, preview }: { d: FormData; u: (k: keyof FormData, v: string) => void; preview: ROIResult | null }) {
  return (
    <div className="ra-step">
      <div className="ra-step-eyebrow">Step 3 of 3</div>
      <h2 className="ra-step-title">Where's the time going?</h2>
      <p className="ra-step-sub">Be honest with the numbers — they only inform your projection.</p>

      <div className="ra-row">
        <Field label="Manual hours per week" required hint="Across the team — repetitive, copy-paste, follow-up work">
          <input type="number" min={0} value={d.manualHours} onChange={e => u('manualHours', e.target.value)} placeholder="40" />
        </Field>
        <Field label="Avg hourly cost (£)" required hint="Loaded cost: salary + overhead">
          <input type="number" min={0} value={d.hourlyCost} onChange={e => u('hourlyCost', e.target.value)} placeholder="35" />
        </Field>
      </div>

      <Field label="Primary challenge">
        <div className="ra-chips">
          {CHALLENGES.map(c => (
            <button
              key={c}
              type="button"
              className={`ra-chip ${d.primaryChallenge === c ? 'is-on' : ''}`}
              onClick={() => u('primaryChallenge', c)}
            >
              {c}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Automation experience">
        <div className="ra-chips">
          {EXPERIENCES.map(x => (
            <button
              key={x}
              type="button"
              className={`ra-chip ${d.automationExperience === x ? 'is-on' : ''}`}
              onClick={() => u('automationExperience', x)}
            >
              {x}
            </button>
          ))}
        </div>
      </Field>

      {preview && (
        <div className="ra-preview">
          <div className="ra-preview-eyebrow">Live preview</div>
          <div className="ra-preview-row">
            <div>
              <div className="ra-preview-num">£{preview.annualSaving.toLocaleString()}</div>
              <div className="ra-preview-lbl">Projected annual saving</div>
            </div>
            <div>
              <div className="ra-preview-num">{preview.weeklyHrs} hrs</div>
              <div className="ra-preview-lbl">/week reclaimable</div>
            </div>
          </div>
          <div className="ra-preview-note">Hit "Generate My Report" for the full breakdown — including the right plan for your stage.</div>
        </div>
      )}
    </div>
  );
}

// ────── Step 3 · Report ──────
function ReportScreen({
  r, d, emailMe, setEmailMe,
}: {
  r: ROIResult;
  d: FormData;
  emailMe: boolean;
  setEmailMe: (b: boolean) => void;
}) {
  const fullName = d.name.split(' ')[0] || 'there';
  const tierCTA = useMemo(() => {
    if (r.tier === 'Enterprise') {
      return {
        label: 'Book a strategy call → /calendly',
        url: 'https://calendly.com/srijanpaudel219/30min',
        external: true,
      };
    }
    if (r.tier === 'Plan') {
      return { label: 'See pricing plans →', url: '/pricing', external: false };
    }
    return { label: 'Browse digital products →', url: '/digital-products', external: false };
  }, [r.tier]);

  return (
    <div className="ra-step ra-report">
      <div className="ra-report-header">
        <div className="ra-report-avatar">A</div>
        <div>
          <div className="ra-report-from">Generated by Arora · AI CEO</div>
          <div className="ra-report-meta">For {fullName} · {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
        <div className={`ra-tier-badge ra-tier-${r.tier.toLowerCase()}`}>{r.tier} Tier</div>
      </div>

      <div className="ra-report-headline">
        <h2>
          You can reclaim <span className="ra-grad"><AnimNum to={r.weeklyHrs} suffix=" hrs" /></span>{' '}
          a week and save{' '}
          <span className="ra-grad"><AnimNum to={r.annualSaving} prefix="£" /></span> a year.
        </h2>
        <p className="ra-report-note">{r.industryNote}</p>
      </div>

      <div className="ra-metrics">
        <Metric label="Hrs/week reclaimed" value={`${r.weeklyHrs}`} />
        <Metric label="Annual saving" value={`£${r.annualSaving.toLocaleString()}`} />
        <Metric label="ROI (12-mo)" value={r.roi != null ? `${r.roi}%` : '—'} />
        <Metric label="Payback" value={r.payback != null ? `${r.payback} wks` : '—'} />
      </div>

      <Bars current={+d.manualHours || 0} reclaimed={r.weeklyHrs} />

      <div className="ra-recs">
        <div className="ra-rec">
          <div className="ra-rec-eyebrow">Recommended path</div>
          <div className="ra-rec-body">
            <strong>{r.planRec}</strong>
            <span> · best fit for {(+d.employees) || 'your'} employees, {d.monthlyRevenue || 'your stage'}</span>
          </div>
        </div>
        <div className="ra-rec">
          <div className="ra-rec-eyebrow">Quick win</div>
          <div className="ra-rec-body"><strong>{r.productRec}</strong> · ship value before any plan</div>
        </div>
      </div>

      <label className="ra-emailme">
        <input type="checkbox" checked={emailMe} onChange={e => setEmailMe(e.target.checked)} />
        <span>Email this report to <strong>{d.email}</strong> for reference</span>
      </label>

      <div className="ra-cta">
        <a
          className="ra-cta-btn"
          href={tierCTA.url}
          target={tierCTA.external ? '_blank' : undefined}
          rel={tierCTA.external ? 'noopener noreferrer' : undefined}
        >
          {tierCTA.label}
        </a>
        <a className="ra-cta-secondary" href="/case-studies">See how others did it →</a>
      </div>

      <div className="ra-trust">
        ▸ Lead score: <strong>{r.score}/100</strong> &nbsp;·&nbsp; Saved to your secure record &nbsp;·&nbsp; Reply to your email to chat with Arora directly
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="ra-metric">
      <div className="ra-metric-v">{value}</div>
      <div className="ra-metric-k">{label}</div>
    </div>
  );
}

function Bars({ current, reclaimed }: { current: number; reclaimed: number }) {
  const max = Math.max(current, 1);
  const remaining = Math.max(current - reclaimed, 0);
  return (
    <div className="ra-bars">
      <div className="ra-bars-row">
        <span className="ra-bars-lbl">Today</span>
        <div className="ra-bar-track">
          <div className="ra-bar-fill ra-bar-current" style={{ width: '100%' }}>
            <span>{current} hrs/wk manual</span>
          </div>
        </div>
      </div>
      <div className="ra-bars-row">
        <span className="ra-bars-lbl">After Aiprosol</span>
        <div className="ra-bar-track">
          <div className="ra-bar-fill ra-bar-after" style={{ width: `${(remaining / max) * 100}%` }}>
            {remaining > 0 && <span>{remaining} hrs/wk left</span>}
          </div>
          <div className="ra-bar-tag" style={{ left: `${(remaining / max) * 100}%` }}>
            ↓ {reclaimed} hrs reclaimed
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="ra-field">
      <label className="ra-label">
        {label}
        {required && <span className="ra-req">*</span>}
      </label>
      {children}
      {hint && <div className="ra-hint">{hint}</div>}
    </div>
  );
}

// ────── Styles ──────
function Styles() {
  return (
    <style>{`
      .ra-page { background: #0A1628; color: #D4E8F7; min-height: 100vh; padding: 100px 24px 80px; font-family: 'DM Sans', system-ui, sans-serif; }
      @media (max-width: 640px) { .ra-page { padding: 80px 16px 60px; } }

      .ra-header { max-width: 720px; margin: 0 auto 40px; text-align: center; }
      .ra-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(0, 212, 255, 0.08); border: 1px solid rgba(0, 212, 255, 0.25); border-radius: 999px; color: #00D4FF; font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; }
      .ra-h1 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(28px, 4.5vw, 48px); line-height: 1.1; margin-bottom: 12px; }
      .ra-grad { background: linear-gradient(135deg, #00D4FF, #00FFE5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      .ra-sub { color: #8899AA; font-size: 16px; line-height: 1.6; }

      .ra-progress { max-width: 720px; margin: 0 auto 32px; display: flex; align-items: center; justify-content: center; }
      .ra-progress-item { display: flex; align-items: center; }
      .ra-progress-item:last-child .ra-progress-line { display: none; }
      .ra-progress-dot { width: 32px; height: 32px; border-radius: 50%; background: #0D1F3C; border: 1px solid #1E3A5F; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; color: #8899AA; transition: all 0.3s; }
      .ra-progress-dot.is-active { background: linear-gradient(135deg, #00D4FF, #00FFE5); border-color: transparent; color: #0A1628; box-shadow: 0 0 14px rgba(0,212,255,0.5); }
      .ra-progress-dot.is-done { background: rgba(0,212,255,0.15); border-color: #00D4FF; color: #00D4FF; }
      .ra-progress-line { width: 64px; height: 2px; background: #1E3A5F; margin: 0 8px; transition: background 0.3s; }
      .ra-progress-line.is-done { background: #00D4FF; }
      .ra-progress-label { display: none; }
      @media (min-width: 640px) { .ra-progress-label { display: block; margin-left: 8px; margin-right: 8px; font-size: 12px; color: #8899AA; font-family: 'Syne', sans-serif; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; } }

      .ra-shell { max-width: 720px; margin: 0 auto; }
      .ra-card { background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 24px; padding: 40px; margin-bottom: 16px; box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4); position: relative; overflow: hidden; }
      @media (max-width: 640px) { .ra-card { padding: 28px 20px; } }

      @keyframes ra-in-right { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
      @keyframes ra-in-left  { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
      .ra-anim-in-right { animation: ra-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      .ra-anim-in-left  { animation: ra-in-left 0.4s cubic-bezier(0.16, 1, 0.3, 1); }

      .ra-step-eyebrow { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; color: #00D4FF; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 8px; }
      .ra-step-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 26px; line-height: 1.2; margin-bottom: 8px; }
      .ra-step-sub { color: #8899AA; font-size: 14px; margin-bottom: 28px; }

      .ra-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
      @media (max-width: 640px) { .ra-row { grid-template-columns: 1fr; } }

      .ra-field { margin-bottom: 16px; display: flex; flex-direction: column; }
      .ra-label { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; color: #8899AA; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px; display: flex; gap: 4px; }
      .ra-req { color: #00D4FF; }
      .ra-hint { font-size: 12px; color: #8899AA; margin-top: 6px; }
      .ra-field input, .ra-field select {
        width: 100%; padding: 12px 14px;
        background: #0A1628; border: 1px solid #1E3A5F;
        color: #D4E8F7; border-radius: 10px;
        font-family: 'DM Sans', system-ui, sans-serif; font-size: 14px;
        outline: none; transition: border 0.2s, box-shadow 0.2s;
      }
      .ra-field input:focus, .ra-field select:focus { border-color: #00D4FF; box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.15); }
      .ra-field input::placeholder { color: #4a6280; }

      .ra-chips { display: flex; flex-wrap: wrap; gap: 8px; }
      .ra-chip { padding: 8px 14px; background: #0A1628; border: 1px solid #1E3A5F; border-radius: 999px; color: #D4E8F7; font-size: 13px; cursor: pointer; transition: all 0.15s; font-family: 'DM Sans', system-ui, sans-serif; }
      .ra-chip:hover { border-color: #00D4FF; color: #00D4FF; }
      .ra-chip.is-on { background: linear-gradient(135deg, #00D4FF, #00FFE5); border-color: transparent; color: #0A1628; font-weight: 700; }

      .ra-preview { margin-top: 24px; padding: 20px; background: rgba(0,212,255,0.05); border: 1px solid rgba(0,212,255,0.25); border-radius: 14px; }
      .ra-preview-eyebrow { font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700; color: #00D4FF; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 12px; }
      .ra-preview-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 12px; }
      .ra-preview-num { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; background: linear-gradient(135deg, #00D4FF, #00FFE5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .ra-preview-lbl { font-size: 11px; color: #8899AA; text-transform: uppercase; letter-spacing: 0.1em; }
      .ra-preview-note { font-size: 12px; color: #8899AA; }

      .ra-nav { display: flex; justify-content: space-between; align-items: center; padding: 0 8px; }
      .ra-back { padding: 12px 20px; background: transparent; border: 1px solid #1E3A5F; color: #D4E8F7; border-radius: 10px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; cursor: pointer; transition: all 0.2s; }
      .ra-back:hover { border-color: #00D4FF; color: #00D4FF; }
      .ra-next { padding: 14px 28px; background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628; border: none; border-radius: 10px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 0 14px rgba(0,212,255,0.25); display: inline-flex; align-items: center; gap: 8px; }
      .ra-next:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 0 24px rgba(0,212,255,0.4); }
      .ra-next:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }
      .ra-next-final { padding: 14px 32px; }
      .ra-spinner { width: 14px; height: 14px; border: 2px solid rgba(10,22,40,0.3); border-top-color: #0A1628; border-radius: 50%; animation: ra-spin 0.8s linear infinite; }
      @keyframes ra-spin { to { transform: rotate(360deg); } }

      /* ───── Report ───── */
      .ra-report { padding: 0; }
      .ra-report-header { display: flex; align-items: center; gap: 14px; padding: 20px; background: rgba(0,212,255,0.04); border-bottom: 1px solid rgba(0,212,255,0.15); border-radius: 24px 24px 0 0; margin: -40px -40px 24px; }
      @media (max-width: 640px) { .ra-report-header { margin: -28px -20px 20px; padding: 16px; flex-wrap: wrap; } }
      .ra-report-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #00D4FF, #00FFE5); display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 800; color: #0A1628; }
      .ra-report-from { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; }
      .ra-report-meta { font-size: 11px; color: #8899AA; }
      .ra-tier-badge { margin-left: auto; padding: 6px 12px; border-radius: 999px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; }
      .ra-tier-digital { background: rgba(0,212,255,0.1); color: #00D4FF; border: 1px solid rgba(0,212,255,0.3); }
      .ra-tier-plan { background: rgba(0,255,229,0.1); color: #00FFE5; border: 1px solid rgba(0,255,229,0.3); }
      .ra-tier-enterprise { background: rgba(245,158,11,0.1); color: #F59E0B; border: 1px solid rgba(245,158,11,0.3); }

      .ra-report-headline { margin-bottom: 28px; }
      .ra-report-headline h2 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(22px, 3vw, 30px); line-height: 1.25; margin-bottom: 12px; }
      .ra-report-note { color: #8899AA; font-size: 14px; line-height: 1.6; }

      .ra-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px; }
      @media (max-width: 640px) { .ra-metrics { grid-template-columns: repeat(2, 1fr); } }
      .ra-metric { background: #0A1628; border: 1px solid #1E3A5F; border-radius: 12px; padding: 16px; text-align: center; }
      .ra-metric-v { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; background: linear-gradient(135deg, #00D4FF, #00FFE5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1.2; margin-bottom: 4px; }
      .ra-metric-k { font-size: 10px; color: #8899AA; text-transform: uppercase; letter-spacing: 0.1em; }

      .ra-bars { background: #0A1628; border: 1px solid #1E3A5F; border-radius: 14px; padding: 20px; margin-bottom: 28px; }
      .ra-bars-row { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
      .ra-bars-row:last-child { margin-bottom: 0; }
      .ra-bars-lbl { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; color: #8899AA; text-transform: uppercase; letter-spacing: 0.08em; min-width: 96px; }
      .ra-bar-track { flex: 1; height: 32px; background: rgba(30,58,95,0.4); border-radius: 8px; position: relative; overflow: visible; }
      .ra-bar-fill { height: 100%; border-radius: 8px; display: flex; align-items: center; padding: 0 12px; font-size: 12px; font-weight: 600; color: #0A1628; animation: ra-fill 1s cubic-bezier(0.16, 1, 0.3, 1); }
      @keyframes ra-fill { from { width: 0 !important; } }
      .ra-bar-current { background: linear-gradient(90deg, rgba(245,158,11,0.4), rgba(245,158,11,0.7)); color: #F59E0B; }
      .ra-bar-after   { background: linear-gradient(90deg, #00D4FF, #00FFE5); }
      .ra-bar-tag { position: absolute; top: -22px; padding: 2px 8px; background: #00D4FF; color: #0A1628; border-radius: 4px; font-size: 10px; font-weight: 700; transform: translateX(-50%); white-space: nowrap; }

      .ra-recs { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
      @media (max-width: 640px) { .ra-recs { grid-template-columns: 1fr; } }
      .ra-rec { padding: 16px; background: #0A1628; border-left: 3px solid #00D4FF; border-radius: 10px; }
      .ra-rec-eyebrow { font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700; color: #00D4FF; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px; }
      .ra-rec-body { font-size: 13px; line-height: 1.5; }
      .ra-rec-body strong { color: #D4E8F7; }
      .ra-rec-body span { color: #8899AA; }

      .ra-emailme { display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: rgba(0,212,255,0.05); border: 1px solid rgba(0,212,255,0.2); border-radius: 10px; cursor: pointer; margin-bottom: 24px; font-size: 13px; }
      .ra-emailme input { width: 18px; height: 18px; accent-color: #00D4FF; cursor: pointer; }

      .ra-cta { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 20px; }
      .ra-cta-btn { padding: 14px 28px; background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628 !important; border-radius: 10px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; text-decoration: none; box-shadow: 0 0 24px rgba(0,212,255,0.35); transition: transform 0.2s; display: inline-flex; align-items: center; gap: 8px; }
      .ra-cta-btn:hover { transform: translateY(-2px); }
      .ra-cta-secondary { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; color: #00D4FF; text-decoration: none; }

      .ra-trust { font-size: 11px; color: #8899AA; padding-top: 16px; border-top: 1px solid #1E3A5F; }
      .ra-trust strong { color: #00D4FF; }
    `}</style>
  );
}

export default ROIAuditPage;
