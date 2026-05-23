'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { calcROI, type CalcROIResult } from '@/lib/calc-roi';
import { Events, track } from '@/lib/analytics';

// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · INTERACTIVE ROI SIMULATOR
// Sliders for employees / hours-per-week / hourly cost / industry. Live
// chart shows current cost vs. with-Aiprosol cost. Tier recommendation
// morphs in real time. "Lock in this scenario" CTA pre-fills the canonical
// ROI Audit at /roi-audit.
//
// Math is identical to /api/calc-roi — uses lib/calc-roi.ts directly so we
// don't drift. No network call needed for the live preview; the API call
// only happens at "lock in" time.
// ─────────────────────────────────────────────────────────────────────────

const INDUSTRIES = [
  'Professional Services', 'Real Estate', 'Legal', 'Financial Services',
  'E-commerce', 'Manufacturing', 'Healthcare', 'SaaS', 'Other',
] as const;

// Industry benchmark — typical hours reclaimed/week per employee. Sourced
// from the INDUSTRY_NOTES in calc-roi.ts; conservative midpoint values.
const INDUSTRY_BENCHMARK_HRS: Record<string, number> = {
  'Legal': 8.5,
  'Real Estate': 6.2,
  'Manufacturing': 7.8,
  'E-commerce': 5.4,
  'Financial Services': 9.1,
  'Healthcare': 4.8,
  'SaaS': 5.9,
  'Professional Services': 7.0,
  'Other': 5.5,
};

interface Inputs {
  employees: number;
  manualHoursPerWeek: number;
  hourlyCost: number;
  industry: string;
}

const DEFAULT: Inputs = {
  employees: 25,
  manualHoursPerWeek: 18,
  hourlyCost: 45,
  industry: 'Professional Services',
};

export default function RoiSimulatorPage() {
  const [inp, setInp] = useState<Inputs>(DEFAULT);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Recompute every input change — pure, instant, no debounce needed
  const result: CalcROIResult = useMemo(
    () => calcROI({
      employees: inp.employees,
      manualHoursPerWeek: inp.manualHoursPerWeek,
      hourlyCost: inp.hourlyCost,
      industry: inp.industry,
    }),
    [inp],
  );

  const benchmark = INDUSTRY_BENCHMARK_HRS[inp.industry] ?? 6;
  const benchmarkAnnualHours = benchmark * inp.employees * 50; // 50 working weeks
  const benchmarkAnnualSaving = Math.round(benchmarkAnnualHours * inp.hourlyCost);

  // Current state cost = manual hours × employees × cost × 50 weeks
  const currentAnnualCost = Math.round(inp.manualHoursPerWeek * inp.employees * inp.hourlyCost * 50);
  // After Aiprosol — calc-roi already captures expected reduction in `annualSaving`
  const afterAnnualCost = Math.max(0, currentAnnualCost - result.annualSaving);

  const update = <K extends keyof Inputs>(k: K, v: Inputs[K]) => {
    setInp(prev => ({ ...prev, [k]: v }));
    if (!hasInteracted) {
      setHasInteracted(true);
      track('roi_audit_started', { source: 'simulator', first_field: k as string });
    }
  };

  // Pre-fill the canonical ROI Audit and route across — analytics gets a hand-off event
  const lockIn = () => {
    track(Events.HeroCtaClicked, { from: 'roi_simulator', tier: result.tier });
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams({
        employees: String(inp.employees),
        manualHours: String(inp.manualHoursPerWeek),
        hourlyCost: String(inp.hourlyCost),
        industry: inp.industry,
      });
      window.location.href = `/roi-audit?${params.toString()}`;
    }
  };

  return (
    <div className="rs-page">
      <header className="rs-header">
        <div className="rs-eyebrow">● Interactive · No email required · Live calculation</div>
        <h1 className="rs-h1">
          Move the sliders. Watch your <span className="rs-grad">ROI</span> change in real time.
        </h1>
        <p className="rs-sub">
          Same math as our paid audits — just no email gate. Drag any control to see how the savings,
          tier recommendation, and payback window respond. Lock the scenario in and we'll send you a
          full PDF report with industry benchmarks.
        </p>
      </header>

      <div className="rs-grid">
        {/* ────── LEFT — controls ────── */}
        <div className="rs-controls">
          <SliderField
            label="Team size"
            value={inp.employees}
            min={1} max={500} step={1}
            unit={inp.employees === 1 ? 'employee' : 'employees'}
            onChange={v => update('employees', v)}
            scale="log"
          />
          <SliderField
            label="Manual hours per employee, per week"
            value={inp.manualHoursPerWeek}
            min={0} max={60} step={1}
            unit="hrs/wk"
            onChange={v => update('manualHoursPerWeek', v)}
            hint="Time spent on copy-paste, data entry, status updates, repeat emails — work a junior couldn't do, but currently does."
          />
          <SliderField
            label="Average loaded hourly cost"
            value={inp.hourlyCost}
            min={15} max={250} step={5}
            unit="$/hr"
            onChange={v => update('hourlyCost', v)}
            hint="Salary + benefits + overhead, divided by ~1,800 productive hours/year."
          />

          <div className="rs-field">
            <label className="rs-field-label">Industry</label>
            <div className="rs-chips">
              {INDUSTRIES.map(ind => (
                <button
                  key={ind}
                  className={`rs-chip ${inp.industry === ind ? 'rs-chip-on' : ''}`}
                  onClick={() => update('industry', ind)}
                  type="button"
                >
                  {ind}
                </button>
              ))}
            </div>
          </div>

          <div className="rs-bench">
            <span className="rs-bench-dot" />
            <span>
              <strong>{inp.industry}</strong> firms typically reclaim
              <strong className="rs-bench-num"> {benchmark.toFixed(1)} hrs/employee/wk </strong>
              from automation — about <strong>${benchmarkAnnualSaving.toLocaleString()}</strong> a year for a team your size.
            </span>
          </div>
        </div>

        {/* ────── RIGHT — live output ────── */}
        <div className="rs-output">
          <BarChart
            current={currentAnnualCost}
            after={afterAnnualCost}
            saving={result.annualSaving}
          />

          <TierCard result={result} />

          <div className="rs-stats">
            <Stat label="Hrs reclaimed / week" value={result.weeklyHrs.toLocaleString()} />
            <Stat label="Annual saving" value={`$${result.annualSaving.toLocaleString()}`} highlight />
            <Stat label="Annual plan cost" value={`$${result.annualPlan.toLocaleString()}`} />
            <Stat
              label="Payback period"
              value={result.payback ? `${result.payback.toFixed(1)} mo` : '—'}
            />
            <Stat label="Lead score" value={`${result.score}/100`} />
            <Stat
              label="ROI"
              value={result.roi !== null ? `${Math.round(result.roi)}%` : '—'}
              highlight
            />
          </div>

          <button onClick={lockIn} className="rs-cta">
            Lock in this scenario · Get the PDF report →
          </button>
          <p className="rs-trust">No call. No spam. We'll email a 4-page report with industry benchmarks and the closest case study to your situation.</p>
        </div>
      </div>

      <Styles />
    </div>
  );
}

// ────── Slider field ──────
function SliderField({
  label, value, min, max, step = 1, unit, onChange, hint, scale = 'linear',
}: {
  label: string;
  value: number;
  min: number; max: number; step?: number;
  unit: string;
  onChange: (v: number) => void;
  hint?: string;
  scale?: 'linear' | 'log';
}) {
  // Log scale for team size — most sliders feel useless when 80% of values
  // are in 1-30 range and 20% reaches 500.
  const toSlider = (v: number) => scale === 'log' ? Math.log(v) : v;
  const fromSlider = (v: number) => scale === 'log' ? Math.exp(v) : v;
  const sliderMin = toSlider(min);
  const sliderMax = toSlider(max);
  const sliderVal = toSlider(value);
  const pct = ((sliderVal - sliderMin) / (sliderMax - sliderMin)) * 100;

  return (
    <div className="rs-field">
      <div className="rs-field-row">
        <label className="rs-field-label">{label}</label>
        <span className="rs-field-val">
          <strong>{value.toLocaleString()}</strong> {unit}
        </span>
      </div>
      <div className="rs-slider-wrap">
        <div className="rs-slider-fill" style={{ width: `${pct}%` }} />
        <input
          type="range"
          min={sliderMin}
          max={sliderMax}
          step={scale === 'log' ? 0.01 : step}
          value={sliderVal}
          onChange={e => {
            const raw = Number(e.target.value);
            const real = scale === 'log' ? Math.round(fromSlider(raw)) : raw;
            onChange(Math.max(min, Math.min(max, real)));
          }}
          className="rs-slider"
        />
      </div>
      {hint && <p className="rs-field-hint">{hint}</p>}
    </div>
  );
}

// ────── Bar chart — pure SVG, animates via CSS transitions ──────
function BarChart({ current, after, saving }: { current: number; after: number; saving: number }) {
  const max = Math.max(current, 1);
  const currentPct = (current / max) * 100;
  const afterPct = (after / max) * 100;
  return (
    <div className="rs-chart">
      <div className="rs-chart-row">
        <span className="rs-chart-label">Today's manual cost</span>
        <div className="rs-bar-track">
          <div className="rs-bar rs-bar-current" style={{ width: `${currentPct}%` }} />
          <span className="rs-bar-num">${current.toLocaleString()}</span>
        </div>
      </div>
      <div className="rs-chart-row">
        <span className="rs-chart-label">With Aiprosol</span>
        <div className="rs-bar-track">
          <div className="rs-bar rs-bar-after" style={{ width: `${afterPct}%` }} />
          <span className="rs-bar-num">${after.toLocaleString()}</span>
        </div>
      </div>
      <div className="rs-saving">
        Net annual saving · <strong>${saving.toLocaleString()}</strong>
      </div>
    </div>
  );
}

// ────── Tier recommendation card — morphs based on result.tier ──────
function TierCard({ result }: { result: CalcROIResult }) {
  const tierMeta = {
    Digital: {
      title: 'Self-serve toolkit',
      sub: result.productRec,
      cta: 'Browse the catalogue',
      href: '/digital-products',
      colour: '#10B981',
    },
    Plan: {
      title: result.planRec,
      sub: 'Managed engagement · we design, build, run',
      cta: 'See plan details',
      href: '/pricing',
      colour: '#8B5CF6',
    },
    Enterprise: {
      title: 'Enterprise',
      sub: 'Custom-scoped · dedicated team · SLAs',
      cta: 'Talk to a senior consultant',
      href: '/contact',
      colour: '#F59E0B',
    },
  } as const;
  const meta = tierMeta[result.tier];

  return (
    <div className="rs-tier" style={{ borderColor: `${meta.colour}55` }}>
      <div className="rs-tier-eyebrow" style={{ color: meta.colour }}>
        Recommended for you
      </div>
      <div className="rs-tier-title">{meta.title}</div>
      <div className="rs-tier-sub">{meta.sub}</div>
      <Link href={meta.href} className="rs-tier-cta">{meta.cta} →</Link>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rs-stat ${highlight ? 'rs-stat-on' : ''}`}>
      <div className="rs-stat-v">{value}</div>
      <div className="rs-stat-k">{label}</div>
    </div>
  );
}

// ────── Styles (scoped tag — keeps the route self-contained) ──────
function Styles() {
  return (
    <style>{`
      .rs-page { max-width: 1280px; margin: 0 auto; padding: 100px 24px 80px; font-family: 'Inter', system-ui, sans-serif; color: #E5E7EB; }
      .rs-header { text-align: center; margin-bottom: 48px; }
      .rs-eyebrow { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border: 1px solid rgba(139,92,246,0.3); background: rgba(139,92,246,0.06); color: #C084FC; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; border-radius: 999px; margin-bottom: 18px; }
      .rs-h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(32px,5vw,56px); line-height: 1.06; margin-bottom: 18px; max-width: 880px; margin-inline: auto; }
      .rs-grad { background: linear-gradient(135deg, #8B5CF6, #C084FC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .rs-sub { color: #9CA3B5; font-size: 16px; line-height: 1.7; max-width: 720px; margin: 0 auto; }

      .rs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: start; }
      @media (max-width: 1024px) { .rs-grid { grid-template-columns: 1fr; } }

      /* ─── Controls (left) ─── */
      .rs-controls { display: flex; flex-direction: column; gap: 28px; padding: 32px; background: rgba(19, 16, 31, 0.6); border: 1px solid rgba(139,92,246,0.2); border-radius: 18px; backdrop-filter: blur(8px); }
      .rs-field-row { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; }
      .rs-field-label { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; letter-spacing: 0.04em; }
      .rs-field-val { font-family: 'Space Grotesk', sans-serif; color: #C084FC; font-size: 14px; }
      .rs-field-val strong { font-size: 22px; font-weight: 800; }
      .rs-field-hint { font-size: 12px; color: #6B7585; margin-top: 8px; line-height: 1.6; }

      .rs-slider-wrap { position: relative; height: 6px; background: rgba(139,92,246,0.12); border-radius: 4px; }
      .rs-slider-fill { position: absolute; top: 0; left: 0; height: 100%; background: linear-gradient(90deg, #8B5CF6, #C084FC); border-radius: 4px; transition: width 0.15s; pointer-events: none; }
      .rs-slider { position: absolute; inset: -10px 0; width: 100%; height: 26px; appearance: none; background: transparent; cursor: grab; }
      .rs-slider::-webkit-slider-thumb { appearance: none; width: 22px; height: 22px; border-radius: 50%; background: linear-gradient(135deg, #C084FC, #F0ABFC); border: 2px solid #0A0613; box-shadow: 0 0 12px rgba(139,92,246,0.6); cursor: grab; }
      .rs-slider::-moz-range-thumb { width: 22px; height: 22px; border-radius: 50%; background: #C084FC; border: 2px solid #0A0613; box-shadow: 0 0 12px rgba(139,92,246,0.6); cursor: grab; }
      .rs-slider:active::-webkit-slider-thumb { cursor: grabbing; transform: scale(1.15); }

      .rs-chips { display: flex; flex-wrap: wrap; gap: 8px; }
      .rs-chip { padding: 7px 14px; background: transparent; border: 1px solid rgba(139,92,246,0.25); color: #9CA3B5; border-radius: 999px; font-size: 12px; font-family: 'Inter', system-ui, sans-serif; cursor: pointer; transition: all 0.18s; }
      .rs-chip:hover { border-color: #8B5CF6; color: #E5E7EB; }
      .rs-chip-on { background: rgba(139,92,246,0.18); border-color: #8B5CF6; color: #E5E7EB; box-shadow: 0 0 10px rgba(139,92,246,0.3); }

      .rs-bench { display: flex; gap: 12px; padding: 16px; border-radius: 12px; background: rgba(245, 158, 11, 0.04); border: 1px solid rgba(245, 158, 11, 0.18); font-size: 13px; line-height: 1.6; color: #C7CEDB; }
      .rs-bench-dot { flex-shrink: 0; width: 8px; height: 8px; margin-top: 6px; background: #F59E0B; border-radius: 50%; box-shadow: 0 0 8px #F59E0B; }
      .rs-bench-num { color: #F59E0B; font-family: 'Space Grotesk', sans-serif; }

      /* ─── Output (right) ─── */
      .rs-output { display: flex; flex-direction: column; gap: 22px; padding: 32px; background: rgba(19, 16, 31, 0.6); border: 1px solid rgba(139,92,246,0.2); border-radius: 18px; backdrop-filter: blur(8px); }

      .rs-chart { display: flex; flex-direction: column; gap: 14px; }
      .rs-chart-row { display: grid; grid-template-columns: 160px 1fr; gap: 14px; align-items: center; }
      .rs-chart-label { font-size: 12px; color: #9CA3B5; font-family: 'Space Grotesk', sans-serif; font-weight: 600; }
      .rs-bar-track { position: relative; height: 36px; background: rgba(139,92,246,0.06); border-radius: 8px; overflow: hidden; }
      .rs-bar { position: absolute; top: 0; left: 0; height: 100%; transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1); border-radius: 8px; }
      .rs-bar-current { background: linear-gradient(90deg, #EF4444, #F59E0B); }
      .rs-bar-after { background: linear-gradient(90deg, #10B981, #C084FC); }
      .rs-bar-num { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; color: #E5E7EB; text-shadow: 0 0 8px rgba(0,0,0,0.6); }
      .rs-saving { text-align: right; font-family: 'Space Grotesk', sans-serif; font-size: 14px; color: #9CA3B5; padding-top: 4px; }
      .rs-saving strong { color: #C084FC; font-size: 18px; margin-left: 6px; }

      .rs-tier { padding: 22px; border: 1px solid; border-radius: 14px; background: rgba(0,0,0,0.2); transition: border-color 0.4s; }
      .rs-tier-eyebrow { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 6px; transition: color 0.4s; }
      .rs-tier-title { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 22px; margin-bottom: 4px; }
      .rs-tier-sub { color: #9CA3B5; font-size: 13px; margin-bottom: 14px; line-height: 1.5; }
      .rs-tier-cta { display: inline-flex; gap: 6px; color: #C084FC; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; text-decoration: none; transition: gap 0.25s; }
      .rs-tier-cta:hover { gap: 10px; }

      .rs-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
      @media (max-width: 540px) { .rs-stats { grid-template-columns: repeat(2, 1fr); } }
      .rs-stat { padding: 12px 14px; background: rgba(139,92,246,0.04); border: 1px solid rgba(139,92,246,0.12); border-radius: 10px; }
      .rs-stat-on { background: rgba(192, 132, 252, 0.08); border-color: rgba(192, 132, 252, 0.32); }
      .rs-stat-v { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 18px; color: #E5E7EB; line-height: 1.1; }
      .rs-stat-on .rs-stat-v { color: #C084FC; }
      .rs-stat-k { font-size: 10px; color: #6B7585; letter-spacing: 0.06em; text-transform: uppercase; margin-top: 4px; }

      .rs-cta { padding: 16px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border: none; border-radius: 12px; font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 15px; cursor: pointer; box-shadow: 0 10px 28px rgba(139,92,246,0.36); transition: transform 0.22s; }
      .rs-cta:hover { transform: translateY(-2px); }
      .rs-trust { font-size: 11px; color: #6B7585; text-align: center; margin-top: -8px; }
    `}</style>
  );
}
