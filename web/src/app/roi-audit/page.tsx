'use client';

import { Children, cloneElement, isValidElement, useEffect, useId, useMemo, useRef, useState } from 'react';
import { calcROI, type CalcROIResult } from '@/lib/calc-roi';
import { Events, identify, track } from '@/lib/analytics';
import { LongWaitOverlay, InlineSpinner } from '@/components/AnimatedLogo';

// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · ROI AUDIT V3 (Next.js port)
// 4-step wizard · slide transitions · live preview · animated bar chart
// · tier-routed CTA · email-me checkbox.
// Submits to POST /api/capture-lead which persists + scores + fires Zapier.
// Falls back to local calc if the API errors.
// ─────────────────────────────────────────────────────────────────────────

const INDUSTRIES = ['Professional Services', 'Real Estate', 'Legal', 'Financial Services', 'E-commerce', 'Manufacturing', 'Healthcare', 'SaaS', 'Other'];
const REVENUES = ['Under $5k', '$5k – $25k', '$25k – $100k', '$100k – $500k', '$500k+'];
const CHALLENGES = ['Lead response too slow', 'Manual data entry everywhere', 'Customer support overload', 'Sales pipeline opaque', 'Document processing bottleneck', 'Reporting takes forever', 'Other'];
const EXPERIENCES = ['None — starting from scratch', 'Some — using Zapier or similar', 'Advanced — already running custom workflows'];
const STEPS = ['Identity', 'Business', 'Pain', 'Report'] as const;

interface FormData {
  name: string; email: string; company: string;
  industry: string; employees: string; monthlyRevenue: string;
  manualHours: string; hourlyCost: string;
  primaryChallenge: string; automationExperience: string;
}

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

export default function ROIAuditPage() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [submitting, setSubmitting] = useState(false);
  const [report, setReport] = useState<CalcROIResult | null>(null);
  const [emailMe, setEmailMe] = useState(true);

  const [data, setData] = useState<FormData>({
    name: '', email: '', company: '',
    industry: '', employees: '', monthlyRevenue: '',
    manualHours: '', hourlyCost: '',
    primaryChallenge: '', automationExperience: '',
  });

  // Pre-fill from /roi-simulator handoff (?employees=&manualHours=&hourlyCost=&industry=)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    const patch: Partial<FormData> = {};
    const e = sp.get('employees'); if (e) patch.employees = e;
    const mh = sp.get('manualHours'); if (mh) patch.manualHours = mh;
    const hc = sp.get('hourlyCost'); if (hc) patch.hourlyCost = hc;
    const ind = sp.get('industry'); if (ind) patch.industry = ind;
    if (Object.keys(patch).length > 0) {
      setData(prev => ({ ...prev, ...patch }));
      track(Events.RoiAuditStarted, { first_field: 'simulator_handoff', source: 'simulator' });
      startedRef.current = true;
    }
  }, []);

  // Pre-fill from session profile when signed in. Falls back silently for
  // anonymous visitors. Fields the user has already typed take precedence.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/me', { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : null))
      .then((me: { authenticated?: boolean; email?: string; profile?: { name?: string; company?: string; industry?: string } } | null) => {
        if (cancelled || !me?.authenticated) return;
        setData(prev => ({
          ...prev,
          name: prev.name || me.profile?.name || '',
          email: prev.email || me.email || '',
          company: prev.company || me.profile?.company || '',
          industry: prev.industry || me.profile?.industry || '',
        }));
      })
      .catch(() => { /* anonymous visitor — fine */ });
    return () => { cancelled = true; };
  }, []);

  const startedRef = useRef(false);
  const update = (k: keyof FormData, v: string) => {
    if (!startedRef.current) {
      startedRef.current = true;
      track(Events.RoiAuditStarted, { first_field: k });
    }
    setData(prev => ({ ...prev, [k]: v }));
  };

  const canAdvance = useMemo(() => {
    if (step === 0) return data.name.trim().length > 1 && /\S+@\S+\.\S+/.test(data.email);
    if (step === 1) return !!(data.industry && data.employees && data.monthlyRevenue);
    if (step === 2) return !!(data.manualHours && data.hourlyCost);
    return true;
  }, [step, data]);

  const livePreview = useMemo(() => {
    if (!data.manualHours || !data.hourlyCost) return null;
    return calcROI({
      employees: data.employees,
      manualHoursPerWeek: data.manualHours,
      hourlyCost: data.hourlyCost,
      monthlyRevenue: data.monthlyRevenue,
      industry: data.industry,
      primaryChallenge: data.primaryChallenge,
      automationExperience: data.automationExperience,
    });
  }, [data]);

  const next = () => { setDirection(1); setStep(s => Math.min(3, s + 1)); };
  const back = () => { setDirection(-1); setStep(s => Math.max(0, s - 1)); };

  const generate = async () => {
    setSubmitting(true);
    let result: CalcROIResult;
    let apiOk = false;
    try {
      const res = await fetch('/api/capture-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        }),
      });
      if (res.status === 401) {
        window.location.href = `/login?next=${encodeURIComponent('/roi-audit')}`;
        return;
      }
      if (res.ok) {
        result = await res.json();
        apiOk = true;
      } else {
        throw new Error(`API ${res.status}`);
      }
    } catch (err) {
      console.warn('captureLead failed, falling back to local calc', err);
      result = calcROI({
        employees: data.employees,
        manualHoursPerWeek: data.manualHours,
        hourlyCost: data.hourlyCost,
        monthlyRevenue: data.monthlyRevenue,
        industry: data.industry,
        primaryChallenge: data.primaryChallenge,
        automationExperience: data.automationExperience,
      });
    }
    // Identify the visitor + track the canonical conversion
    identify(data.email, {
      name: data.name,
      company: data.company || undefined,
      industry: data.industry || undefined,
      employees: data.employees || undefined,
    });
    track(apiOk ? Events.RoiAuditSubmitted : Events.RoiAuditFailed, {
      industry: data.industry,
      employees: data.employees,
      monthly_revenue_band: data.monthlyRevenue,
      manual_hours: Number(data.manualHours) || undefined,
      hourly_cost: Number(data.hourlyCost) || undefined,
      tier: result?.tier,
      weekly_hrs: result?.weeklyHrs,
      annual_saving: result?.annualSaving,
      annual_plan: result?.annualPlan,
      roi: result?.roi ?? undefined,
      score: result?.score,
    });
    setReport(result);
    setSubmitting(false);
    setDirection(1);
    setStep(3);
  };

  return (
    <div className="ra-page">
      {/* Tier 3 loader — covers the 1-3s window while the audit is being
          calculated, captured to KV, and emailed via Resend. Personality
          tier — cycles Arora-voiced status copy under the logo. */}
      <LongWaitOverlay
        visible={submitting}
        messages={[
          'Asking Arora…',
          'Calibrating your industry benchmarks…',
          'Computing your ROI…',
          'Drafting your report…',
        ]}
      />
      <header className="ra-header">
        <div className="ra-eyebrow">● Free · No call required · 60 seconds</div>
        <h1 className="ra-h1">
          See your ROI <span className="ra-grad">before</span> you commit a dollar
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
        <div key={step} className={`ra-card ra-anim-${direction === 1 ? 'in-right' : 'in-left'}`}>
          {step === 0 && (
            <div className="ra-step">
              <div className="ra-step-eyebrow">Step 1 of 4</div>
              <h2 className="ra-step-title">Who&apos;s the report for?</h2>
              <p className="ra-step-sub">No spam. No call. Just your personalised report — and a follow-up only if you ask for one.</p>
              <div className="ra-row">
                <Field label="Your name" required>
                  <input value={data.name} onChange={e => update('name', e.target.value)} placeholder="Sarah Johnson" autoFocus />
                </Field>
                <Field label="Email" required>
                  <input type="email" value={data.email} onChange={e => update('email', e.target.value)} placeholder="sarah@company.com" />
                </Field>
              </div>
              <Field label="Company (optional)">
                <input value={data.company} onChange={e => update('company', e.target.value)} placeholder="Acme Ltd" />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="ra-step">
              <div className="ra-step-eyebrow">Step 2 of 4</div>
              <h2 className="ra-step-title">Tell me about your business</h2>
              <p className="ra-step-sub">This shapes which case studies and product recommendations apply to you.</p>
              <Field label="Industry" required>
                <div className="ra-chips">
                  {INDUSTRIES.map(i => (
                    <button key={i} type="button" className={`ra-chip ${data.industry === i ? 'is-on' : ''}`} onClick={() => update('industry', i)}>{i}</button>
                  ))}
                </div>
              </Field>
              <div className="ra-row">
                <Field label="Employees" required>
                  <input type="number" min={1} value={data.employees} onChange={e => update('employees', e.target.value)} placeholder="25" />
                </Field>
                <Field label="Monthly revenue" required>
                  <select value={data.monthlyRevenue} onChange={e => update('monthlyRevenue', e.target.value)}>
                    <option value="">Select…</option>
                    {REVENUES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </Field>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="ra-step">
              <div className="ra-step-eyebrow">Step 3 of 4</div>
              <h2 className="ra-step-title">Where&apos;s the time going?</h2>
              <p className="ra-step-sub">Be honest with the numbers — they only inform your projection.</p>
              <div className="ra-row">
                <Field label="Manual hours per week" required hint="Across the team — repetitive, copy-paste, follow-up work">
                  <input type="number" min={0} value={data.manualHours} onChange={e => update('manualHours', e.target.value)} placeholder="40" />
                </Field>
                <Field label="Avg hourly cost ($)" required hint="Loaded cost: salary + overhead">
                  <input type="number" min={0} value={data.hourlyCost} onChange={e => update('hourlyCost', e.target.value)} placeholder="35" />
                </Field>
              </div>
              <Field label="Primary challenge">
                <div className="ra-chips">
                  {CHALLENGES.map(c => (
                    <button key={c} type="button" className={`ra-chip ${data.primaryChallenge === c ? 'is-on' : ''}`} onClick={() => update('primaryChallenge', c)}>{c}</button>
                  ))}
                </div>
              </Field>
              <Field label="Automation experience">
                <div className="ra-chips">
                  {EXPERIENCES.map(x => (
                    <button key={x} type="button" className={`ra-chip ${data.automationExperience === x ? 'is-on' : ''}`} onClick={() => update('automationExperience', x)}>{x}</button>
                  ))}
                </div>
              </Field>
              {livePreview && (
                <div className="ra-preview">
                  <div className="ra-preview-eyebrow">Live preview</div>
                  <div className="ra-preview-row">
                    <div>
                      <div className="ra-preview-num">${livePreview.annualSaving.toLocaleString()}</div>
                      <div className="ra-preview-lbl">Projected annual saving</div>
                    </div>
                    <div>
                      <div className="ra-preview-num">{livePreview.weeklyHrs} hrs</div>
                      <div className="ra-preview-lbl">/week reclaimable</div>
                    </div>
                  </div>
                  <div className="ra-preview-note">Hit &quot;Generate My Report&quot; for the full breakdown — including the right plan for your stage.</div>
                </div>
              )}
            </div>
          )}

          {step === 3 && report && <Report r={report} d={data} emailMe={emailMe} setEmailMe={setEmailMe} />}
        </div>

        {step < 3 && (
          <div className="ra-nav">
            {step > 0 ? <button className="ra-back" onClick={back}>← Back</button> : <span />}
            {step < 2 ? (
              <button className="ra-next" onClick={next} disabled={!canAdvance}>Next →</button>
            ) : (
              <button className="ra-next ra-next-final" onClick={generate} disabled={!canAdvance || submitting}>
                {submitting ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                    <InlineSpinner label="Generating ROI report" />
                    Generating…
                  </span>
                ) : 'Generate My Report →'}
              </button>
            )}
          </div>
        )}
      </div>

      <Styles />
    </div>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  // Generate a unique id once per Field render and inject it into the first
  // form-control child so the <label htmlFor> binding is programmatic. This
  // fixes the a11y "form controls without labels" violation across every
  // input on the page — accessibility audit catches it as missing label.
  const fieldId = useId();
  const childrenWithId = Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    const t = (child as React.ReactElement).type;
    if (t === 'input' || t === 'select' || t === 'textarea') {
      const props = (child as React.ReactElement).props as { id?: string };
      if (!props.id) {
        return cloneElement(child as React.ReactElement<{ id: string; 'aria-label': string }>, {
          id: fieldId,
          'aria-label': label,
        });
      }
    }
    return child;
  });
  return (
    <div className="ra-field">
      <label htmlFor={fieldId} className="ra-label">{label}{required && <span className="ra-req">*</span>}</label>
      {childrenWithId}
      {hint && <div className="ra-hint">{hint}</div>}
    </div>
  );
}

function Report({ r, d, emailMe, setEmailMe }: { r: CalcROIResult; d: FormData; emailMe: boolean; setEmailMe: (b: boolean) => void }) {
  const fullName = d.name.split(' ')[0] || 'there';
  const tierCTA = useMemo(() => {
    if (r.tier === 'Enterprise') return { label: 'Book a strategy call →', url: 'https://calendly.com/srijanpaudel219/30min', external: true };
    if (r.tier === 'Plan') return { label: 'See pricing plans →', url: '/pricing', external: false };
    return { label: 'Browse digital products →', url: '/digital-products', external: false };
  }, [r.tier]);

  const current = +d.manualHours || 0;
  const remaining = Math.max(current - r.weeklyHrs, 0);
  const max = Math.max(current, 1);

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
          You can reclaim <span className="ra-grad"><AnimNum to={r.weeklyHrs} suffix=" hrs" /></span> a week and save{' '}
          <span className="ra-grad"><AnimNum to={r.annualSaving} prefix="$" /></span> a year.
        </h2>
        <p className="ra-report-note">{r.industryNote}</p>
      </div>

      <div className="ra-metrics">
        <div className="ra-metric"><div className="ra-metric-v">{r.weeklyHrs}</div><div className="ra-metric-k">Hrs/week reclaimed</div></div>
        <div className="ra-metric"><div className="ra-metric-v">${r.annualSaving.toLocaleString()}</div><div className="ra-metric-k">Annual saving</div></div>
        <div className="ra-metric"><div className="ra-metric-v">{r.roi != null ? `${r.roi}%` : '—'}</div><div className="ra-metric-k">ROI (12-mo)</div></div>
        <div className="ra-metric"><div className="ra-metric-v">{r.payback != null ? `${r.payback} wks` : '—'}</div><div className="ra-metric-k">Payback</div></div>
      </div>

      <div className="ra-bars">
        <div className="ra-bars-row">
          <span className="ra-bars-lbl">Today</span>
          <div className="ra-bar-track"><div className="ra-bar-fill ra-bar-current" style={{ width: '100%' }}><span>{current} hrs/wk manual</span></div></div>
        </div>
        <div className="ra-bars-row">
          <span className="ra-bars-lbl">After Aiprosol</span>
          <div className="ra-bar-track">
            <div className="ra-bar-fill ra-bar-after" style={{ width: `${(remaining / max) * 100}%` }}>
              {remaining > 0 && <span>{remaining} hrs/wk left</span>}
            </div>
            <div className="ra-bar-tag" style={{ left: `${(remaining / max) * 100}%` }}>↓ {r.weeklyHrs} hrs reclaimed</div>
          </div>
        </div>
      </div>

      <div className="ra-recs">
        <div className="ra-rec">
          <div className="ra-rec-eyebrow">Recommended path</div>
          <div className="ra-rec-body"><strong>{r.planRec}</strong><span> · best fit for {(+d.employees) || 'your'} employees, {d.monthlyRevenue || 'your stage'}</span></div>
        </div>
        <div className="ra-rec">
          <div className="ra-rec-eyebrow">Quick win — buy today</div>
          <div className="ra-rec-body">
            <a className="ra-rec-link" href={`/products/${r.productRecSlug}`}>
              <strong>{r.productRec}</strong>
            </a>
            <span className="ra-rec-reason"> · {r.productRecReason}</span>
          </div>
        </div>
        {r.productUpsellSlug && r.productUpsellSlug !== r.productRecSlug && (
          <div className="ra-rec ra-rec-upsell">
            <div className="ra-rec-eyebrow">Or go deeper</div>
            <div className="ra-rec-body">
              <a className="ra-rec-link" href={`/products/${r.productUpsellSlug}`}>
                <strong>{(r.productUpsellSlug === 'the-complete-vault') ? 'The Complete Vault · $997' : (r.productUpsellSlug === 'the-playbook-pack') ? 'The Playbook Pack · $197' : (r.productUpsellSlug === 'the-starter-bundle') ? 'The Starter Bundle · $79' : (r.productUpsellSlug === 'global-business-automation-starter-pack') ? 'Global Business Automation Starter Pack · $97' : r.productUpsellSlug}</strong>
              </a>
              <span className="ra-rec-reason"> · bundles the primary recommendation with the next-tier deliverables for higher leverage.</span>
            </div>
          </div>
        )}
      </div>

      <div className="ra-emailme">
        <span className="ra-emailme-icon">✉</span>
        <span>A full PDF copy of this report is on its way to <strong>{d.email}</strong> — check your inbox within 60 seconds. Reply to that email anytime to chat with Arora directly.</span>
      </div>

      <div className="ra-cta">
        <a className="ra-cta-btn" href={tierCTA.url} target={tierCTA.external ? '_blank' : undefined} rel={tierCTA.external ? 'noopener noreferrer' : undefined}>
          {tierCTA.label}
        </a>
        <a className="ra-cta-secondary" href="/case-studies">See how others did it →</a>
      </div>

      <div className="ra-trust">
        ▸ Lead score: <strong>{r.score}/100</strong> &nbsp;·&nbsp; Recorded · {emailMe ? 'email queued' : 'email opt-out'}
      </div>
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      .ra-page { background: #0A0613; color: #E5E7EB; min-height: 100vh; padding: 140px 24px 80px; font-family: 'Inter', system-ui, sans-serif; }
      @media (max-width: 640px) { .ra-page { padding: 120px 16px 60px; } }
      .ra-header { max-width: 720px; margin: 0 auto 40px; text-align: center; }
      .ra-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(139, 92, 246,0.08); border: 1px solid rgba(139, 92, 246,0.25); border-radius: 999px; color: #8B5CF6; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; }
      .ra-h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(28px, 4.5vw, 48px); line-height: 1.1; margin-bottom: 12px; }
      .ra-grad { background: linear-gradient(135deg, #8B5CF6, #C084FC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .ra-sub { color: #9CA3B5; font-size: 16px; line-height: 1.6; }

      .ra-progress { max-width: 720px; margin: 0 auto 32px; display: flex; align-items: center; justify-content: center; }
      .ra-progress-item { display: flex; align-items: center; }
      .ra-progress-item:last-child .ra-progress-line { display: none; }
      .ra-progress-dot { width: 32px; height: 32px; border-radius: 50%; background: #13101F; border: 1px solid #2A1F3D; display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; color: #9CA3B5; transition: all 0.3s; }
      .ra-progress-dot.is-active { background: linear-gradient(135deg, #8B5CF6, #C084FC); border-color: transparent; color: #0A0613; box-shadow: 0 0 14px rgba(139, 92, 246,0.5); }
      .ra-progress-dot.is-done { background: rgba(139, 92, 246,0.15); border-color: #8B5CF6; color: #8B5CF6; }
      .ra-progress-line { width: 64px; height: 2px; background: #2A1F3D; margin: 0 8px; transition: background 0.3s; }
      .ra-progress-line.is-done { background: #8B5CF6; }
      .ra-progress-label { display: none; }
      @media (min-width: 640px) { .ra-progress-label { display: block; margin-left: 8px; margin-right: 8px; font-size: 12px; color: #9CA3B5; font-family: 'Space Grotesk', sans-serif; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; } }

      .ra-shell { max-width: 720px; margin: 0 auto; }
      .ra-card { background: #13101F; border: 1px solid #2A1F3D; border-radius: 24px; padding: 40px; margin-bottom: 16px; box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4); position: relative; overflow: hidden; }
      @media (max-width: 640px) { .ra-card { padding: 28px 20px; } }

      @keyframes ra-in-right { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
      @keyframes ra-in-left  { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
      .ra-anim-in-right { animation: ra-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      .ra-anim-in-left  { animation: ra-in-left 0.4s cubic-bezier(0.16, 1, 0.3, 1); }

      .ra-step-eyebrow { font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; color: #8B5CF6; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 8px; }
      .ra-step-title { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 26px; line-height: 1.2; margin-bottom: 8px; }
      .ra-step-sub { color: #9CA3B5; font-size: 14px; margin-bottom: 28px; }

      .ra-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
      @media (max-width: 640px) { .ra-row { grid-template-columns: 1fr; } }

      .ra-field { margin-bottom: 16px; display: flex; flex-direction: column; }
      .ra-label { font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; color: #9CA3B5; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px; display: flex; gap: 4px; }
      .ra-req { color: #8B5CF6; }
      .ra-hint { font-size: 12px; color: #9CA3B5; margin-top: 6px; }
      .ra-field input, .ra-field select { width: 100%; padding: 12px 14px; background: #0A0613; border: 1px solid #2A1F3D; color: #E5E7EB; border-radius: 10px; font-family: 'Inter', system-ui, sans-serif; font-size: 14px; outline: none; transition: border 0.2s, box-shadow 0.2s; }
      .ra-field input:focus, .ra-field select:focus { border-color: #8B5CF6; box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15); }
      .ra-field input::placeholder { color: #4a6280; }

      .ra-chips { display: flex; flex-wrap: wrap; gap: 8px; }
      .ra-chip { padding: 8px 14px; background: #0A0613; border: 1px solid #2A1F3D; border-radius: 999px; color: #E5E7EB; font-size: 13px; cursor: pointer; transition: all 0.15s; font-family: 'Inter', system-ui, sans-serif; }
      .ra-chip:hover { border-color: #8B5CF6; color: #8B5CF6; }
      .ra-chip.is-on { background: linear-gradient(135deg, #8B5CF6, #C084FC); border-color: transparent; color: #0A0613; font-weight: 700; }

      .ra-preview { margin-top: 24px; padding: 20px; background: rgba(139, 92, 246,0.05); border: 1px solid rgba(139, 92, 246,0.25); border-radius: 14px; }
      .ra-preview-eyebrow { font-family: 'Space Grotesk', sans-serif; font-size: 10px; font-weight: 700; color: #8B5CF6; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 12px; }
      .ra-preview-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 12px; }
      .ra-preview-num { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 28px; background: linear-gradient(135deg, #8B5CF6, #C084FC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .ra-preview-lbl { font-size: 11px; color: #9CA3B5; text-transform: uppercase; letter-spacing: 0.1em; }
      .ra-preview-note { font-size: 12px; color: #9CA3B5; }

      .ra-nav { display: flex; justify-content: space-between; align-items: center; padding: 0 8px; }
      .ra-back { padding: 12px 20px; background: transparent; border: 1px solid #2A1F3D; color: #E5E7EB; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; cursor: pointer; transition: all 0.2s; }
      .ra-back:hover { border-color: #8B5CF6; color: #8B5CF6; }
      .ra-next { padding: 14px 28px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border: none; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 0 14px rgba(139, 92, 246,0.25); display: inline-flex; align-items: center; gap: 8px; }
      .ra-next:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 0 24px rgba(139, 92, 246,0.4); }
      .ra-next:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }
      .ra-next-final { padding: 14px 32px; }
      .ra-spinner { width: 14px; height: 14px; border: 2px solid rgba(10,22,40,0.3); border-top-color: #0A0613; border-radius: 50%; animation: ra-spin 0.8s linear infinite; }
      @keyframes ra-spin { to { transform: rotate(360deg); } }

      .ra-report { padding: 0; }
      .ra-report-header { display: flex; align-items: center; gap: 14px; padding: 20px; background: rgba(139, 92, 246,0.04); border-bottom: 1px solid rgba(139, 92, 246,0.15); border-radius: 24px 24px 0 0; margin: -40px -40px 24px; }
      @media (max-width: 640px) { .ra-report-header { margin: -28px -20px 20px; padding: 16px; flex-wrap: wrap; } }
      .ra-report-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #8B5CF6, #C084FC); display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; font-weight: 800; color: #0A0613; }
      .ra-report-from { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 14px; }
      .ra-report-meta { font-size: 11px; color: #9CA3B5; }
      .ra-tier-badge { margin-left: auto; padding: 6px 12px; border-radius: 999px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; }
      .ra-tier-digital { background: rgba(139, 92, 246,0.1); color: #8B5CF6; border: 1px solid rgba(139, 92, 246,0.3); }
      .ra-tier-plan { background: rgba(192, 132, 252,0.1); color: #C084FC; border: 1px solid rgba(192, 132, 252,0.3); }
      .ra-tier-enterprise { background: rgba(245,158,11,0.1); color: #F59E0B; border: 1px solid rgba(245,158,11,0.3); }

      .ra-report-headline { margin-bottom: 28px; }
      .ra-report-headline h2 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(22px, 3vw, 30px); line-height: 1.25; margin-bottom: 12px; }
      .ra-report-note { color: #9CA3B5; font-size: 14px; line-height: 1.6; }

      .ra-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px; }
      @media (max-width: 640px) { .ra-metrics { grid-template-columns: repeat(2, 1fr); } }
      .ra-metric { background: #0A0613; border: 1px solid #2A1F3D; border-radius: 12px; padding: 16px; text-align: center; }
      .ra-metric-v { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 22px; background: linear-gradient(135deg, #8B5CF6, #C084FC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1.2; margin-bottom: 4px; }
      .ra-metric-k { font-size: 10px; color: #9CA3B5; text-transform: uppercase; letter-spacing: 0.1em; }

      .ra-bars { background: #0A0613; border: 1px solid #2A1F3D; border-radius: 14px; padding: 20px; margin-bottom: 28px; }
      .ra-bars-row { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
      .ra-bars-row:last-child { margin-bottom: 0; }
      .ra-bars-lbl { font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; color: #9CA3B5; text-transform: uppercase; letter-spacing: 0.08em; min-width: 96px; }
      .ra-bar-track { flex: 1; height: 32px; background: rgba(30,58,95,0.4); border-radius: 8px; position: relative; overflow: visible; }
      .ra-bar-fill { height: 100%; border-radius: 8px; display: flex; align-items: center; padding: 0 12px; font-size: 12px; font-weight: 600; color: #0A0613; animation: ra-fill 1s cubic-bezier(0.16, 1, 0.3, 1); }
      @keyframes ra-fill { from { width: 0 !important; } }
      .ra-bar-current { background: linear-gradient(90deg, rgba(245,158,11,0.4), rgba(245,158,11,0.7)); color: #F59E0B; }
      .ra-bar-after { background: linear-gradient(90deg, #8B5CF6, #C084FC); }
      .ra-bar-tag { position: absolute; top: -22px; padding: 2px 8px; background: #8B5CF6; color: #0A0613; border-radius: 4px; font-size: 10px; font-weight: 700; transform: translateX(-50%); white-space: nowrap; }

      .ra-recs { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
      @media (max-width: 640px) { .ra-recs { grid-template-columns: 1fr; } }
      .ra-rec { padding: 16px; background: #0A0613; border-left: 3px solid #8B5CF6; border-radius: 10px; }
      .ra-rec-upsell { border-left-color: #C084FC; background: linear-gradient(180deg, rgba(192,132,252,0.04), rgba(192,132,252,0.01)); grid-column: 1 / -1; }
      .ra-rec-eyebrow { font-family: 'Space Grotesk', sans-serif; font-size: 10px; font-weight: 700; color: #8B5CF6; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px; }
      .ra-rec-upsell .ra-rec-eyebrow { color: #C084FC; }
      .ra-rec-body { font-size: 13px; line-height: 1.5; }
      .ra-rec-body strong { color: #E5E7EB; }
      .ra-rec-body span { color: #9CA3B5; }
      .ra-rec-link { color: inherit; text-decoration: none; border-bottom: 1px solid rgba(192,132,252,0.3); transition: border-color 0.2s; }
      .ra-rec-link:hover { border-color: #C084FC; }
      .ra-rec-reason { font-size: 12px; }

      .ra-emailme { display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: rgba(139, 92, 246,0.05); border: 1px solid rgba(139, 92, 246,0.2); border-radius: 10px; cursor: pointer; margin-bottom: 24px; font-size: 13px; }
      .ra-emailme input { width: 18px; height: 18px; accent-color: #8B5CF6; cursor: pointer; }

      .ra-cta { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 20px; }
      .ra-cta-btn { padding: 14px 28px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613 !important; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 14px; text-decoration: none; box-shadow: 0 0 24px rgba(139, 92, 246,0.35); transition: transform 0.2s; display: inline-flex; align-items: center; gap: 8px; }
      .ra-cta-btn:hover { transform: translateY(-2px); }
      .ra-cta-secondary { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; color: #8B5CF6; text-decoration: none; }

      .ra-trust { font-size: 11px; color: #9CA3B5; padding-top: 16px; border-top: 1px solid #2A1F3D; }
      .ra-trust strong { color: #8B5CF6; }
    `}</style>
  );
}
