// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · CASE STUDY DETAIL · /case-studies/:slug
// Phase 3.2 · hero quote, the challenge, the architecture, the result,
// metrics with delta animation, customer quote, related cases.
// CMS-first with built-in fallback for the 4 hero cases.
// ─────────────────────────────────────────────────────────────────────────

import { items } from '@wix/data';
import { useWixModules } from '@wix/sdk-react';
import { useEffect, useState } from 'react';

interface Case {
  _id: string;
  slug?: string;
  companyName?: string;
  name?: string;
  industry?: string;
  headline?: string;
  challenge?: string;
  approach?: string;
  result?: string;
  quote?: string;
  quoteAuthor?: string;
  quoteRole?: string;
  toolsUsed?: string[] | string;
  metric1Label?: string; metric1Value?: string; metric1Before?: string; metric1After?: string;
  metric2Label?: string; metric2Value?: string; metric2Before?: string; metric2After?: string;
  metric3Label?: string; metric3Value?: string; metric3Before?: string; metric3After?: string;
  coverImage?: string | { stringValue: string };
  serviceUsed?: string;
}

const FALLBACK: Record<string, Case> = {
  'hargreaves-sterling': {
    _id: 'fb-1', slug: 'hargreaves-sterling',
    companyName: 'Hargreaves & Sterling', industry: 'Legal',
    headline: 'Partners reclaim 45 hrs/week from contract review',
    challenge: 'Contract review consumed 32 hours per partner per week. The firm tried two contract-management SaaS tools and an internal automation team. Neither moved the needle — partners still had to read every clause to spot deviations from the firm\'s standards.',
    approach: 'We deployed an Intelligent Document Processing layer trained on the firm\'s historical contracts. It pre-reads every incoming agreement, classifies clauses, and flags only those that deviate from the standards. Partners review the exceptions — typically 8–12% of total clauses — instead of every line.',
    result: 'In week 3 the firm hit ROI. By month 2 partner time on contract review dropped 78%. The reclaimed 45 hrs/week per partner now goes to client-facing work, which has lifted billable revenue 22% over the same period.',
    quote: '"Aiprosol pulled 45 hours a week out of partner time inside three weeks. The IDP layer paid for itself before we even finished onboarding."',
    quoteAuthor: 'James Hargreaves',
    quoteRole: 'Managing Partner',
    toolsUsed: ['Custom IDP model', 'HubSpot CRM', 'iManage DMS', 'Slack escalation', 'Make orchestration'],
    metric1Label: 'Review time',  metric1Value: '78%↓', metric1Before: '32 hrs/wk', metric1After: '7 hrs/wk',
    metric2Label: 'Hrs reclaimed', metric2Value: '45/wk', metric2Before: '0',         metric2After: '45/partner',
    metric3Label: 'Time to ROI',  metric3Value: '3 wks', metric3Before: 'Industry avg 6 mo', metric3After: '3 wks',
    serviceUsed: 'intelligent-document-processing',
  },
  meridian: {
    _id: 'fb-2', slug: 'meridian',
    companyName: 'Meridian Property', industry: 'Real Estate',
    headline: 'Lead response 6hr → 3min, +28% conversion',
    challenge: 'Average lead response time was 6 hours. By the time the agent rang back, most prospects had already booked a viewing with a competitor. The agency had tried hiring an SDR, but the cost was prohibitive against the conversion lift.',
    approach: 'An AI qualifier that responds within 60 seconds, asks the right qualifying questions, and books a viewing on the assigned agent\'s Calendly — all before the agent even knows the lead exists. Edge cases route to a human within the same channel.',
    result: 'Response time dropped from 6 hours to under 3 minutes — a step-change, not a 30% improvement. Conversion lifted 28% within 2 weeks. The agency hasn\'t hired a single new SDR; the AI handles the volume of 2.5 reps.',
    quote: '"Lead response was a known weak spot. Arora\'s qualifier dropped it from 6 hours to under 3 minutes. Conversion is up 28% and we haven\'t hired a single new SDR."',
    quoteAuthor: 'Maya Rodriguez',
    quoteRole: 'Director',
    toolsUsed: ['Custom AI agent', 'Pipedrive CRM', 'Calendly', 'Twilio SMS', 'Zapier'],
    metric1Label: 'Response time', metric1Value: '6hr→3m', metric1Before: '6 hours', metric1After: '< 3 minutes',
    metric2Label: 'Conversion',    metric2Value: '+28%',   metric2Before: '12%',     metric2After: '15.4%',
    metric3Label: 'Go-live',       metric3Value: '2 wks',  metric3Before: 'n/a',     metric3After: 'Live in 14 days',
    serviceUsed: 'custom-ai-chatbot-development',
  },
  vortex: {
    _id: 'fb-3', slug: 'vortex',
    companyName: 'Vortex Components', industry: 'Manufacturing',
    headline: 'Defect rate 4.1% → 0.6% with vision + telemetry',
    challenge: 'After a decade of process work, defect rate plateaued at 4.1%. Every defective unit shipped was a customer escalation, a return, and an internal RCA. The QC team was reactive — discovering issues days after they originated.',
    approach: 'A vision + telemetry pipeline at the line level: cameras flag visual anomalies in real time, sensors detect subtle drift in machine output, both feed an anomaly model that routes alerts to a quality engineer the moment a part exits the line. No part ships without passing this gate.',
    result: 'Defect rate dropped to 0.6% within 8 weeks of deployment. Throughput rose 34% because the line stops less often for downstream rework. Customer escalations dropped 81% in the same window.',
    quote: '"We\'ve tried three automation consultancies. Aiprosol is the only one that delivered a roadmap with real numbers attached and then actually hit them."',
    quoteAuthor: 'Daniel Chen',
    quoteRole: 'COO',
    toolsUsed: ['Custom vision model', 'AWS IoT', 'Grafana', 'PagerDuty', 'OPC-UA bridge'],
    metric1Label: 'Defect rate', metric1Value: '4.1%→0.6%', metric1Before: '4.1%', metric1After: '0.6%',
    metric2Label: 'Throughput',  metric2Value: '+34%',      metric2Before: 'baseline', metric2After: '+34%',
    metric3Label: 'Time to ROI', metric3Value: '11 wks',   metric3Before: 'n/a',  metric3After: '11 weeks',
    serviceUsed: 'intelligent-workflow-automation',
  },
  thornfield: {
    _id: 'fb-4', slug: 'thornfield',
    companyName: 'Thornfield Stores', industry: 'Retail',
    headline: 'Stockouts -71%, £95k annual saving',
    challenge: 'Stockouts cost roughly £12k/month in lost sales across 14 stores. Manual ordering relied on a buyer\'s feel for demand, and supplier lead times were unpredictable. Excess stock on slow movers tied up another £40k of working capital.',
    approach: 'POS data, supplier lead-time history, and an external demand-signal feed (weather, events, calendar) feed a forecasting model that orders 3 weeks ahead of need per SKU per store. Buyers approve in batches; the system handles the routine 80%.',
    result: 'Stockouts fell 71%. Excess stock on slow movers fell 38%, releasing £52k of working capital. Combined annual saving in year 1: £95k against a build cost recouped inside 9 weeks.',
    quote: '"The forecast accuracy is what surprised us most. We expected automation; we got a buyer that out-performs ours on the routine SKUs."',
    quoteAuthor: 'Priya Anand',
    quoteRole: 'Head of Buying',
    toolsUsed: ['Custom forecasting model', 'Lightspeed POS', 'Weather API', 'Google Calendar', 'Xero'],
    metric1Label: 'Stockouts',     metric1Value: '-71%',  metric1Before: '14% of SKUs', metric1After: '4%',
    metric2Label: 'Annual saving', metric2Value: '£95k',  metric2Before: '£12k/mo loss', metric2After: '£95k saved',
    metric3Label: 'Go-live',       metric3Value: '9 wks', metric3Before: 'n/a', metric3After: '9 weeks',
    serviceUsed: 'ai-driven-customer-intelligence',
  },
};

const RELATED: Record<string, string[]> = {
  'hargreaves-sterling': ['vortex', 'thornfield'],
  'meridian':            ['hargreaves-sterling', 'vortex'],
  'vortex':              ['thornfield', 'hargreaves-sterling'],
  'thornfield':          ['meridian', 'vortex'],
};

const getSlugFromUrl = () => {
  if (typeof window === 'undefined') return '';
  const parts = window.location.pathname.split('/').filter(Boolean);
  return parts[parts.length - 1] || '';
};
const unwrapImage = (img: any): string => {
  if (!img) return '';
  if (typeof img === 'string') return img;
  if (typeof img === 'object' && img.stringValue) return img.stringValue;
  return '';
};
const list = (v: any): string[] => {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter(Boolean);
  return String(v).split(/[,\n]/).map(s => s.trim()).filter(Boolean);
};

export function CaseStudyDetailPage() {
  const { query } = useWixModules(items);
  const [slug] = useState(getSlugFromUrl());
  const [cmsCase, setCmsCase] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await query('casestudies').limit(50).find({ suppressAuth: true });
        const found = (res.items as Case[]).find(c => c.slug === slug);
        if (mounted) setCmsCase(found || null);
      } catch {} finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [slug]);

  const c = cmsCase || FALLBACK[slug];

  if (loading && !c) {
    return <div className="csd-page"><div className="csd-loading"><span className="csd-spin" /> Loading case…</div><Styles /></div>;
  }

  if (!c) {
    return (
      <div className="csd-page">
        <div className="csd-empty">
          <h2>That case study isn't on file.</h2>
          <p>Browse all 8 in the index.</p>
          <a href="/case-studies" className="csd-btn">View all case studies →</a>
        </div>
        <Styles />
      </div>
    );
  }

  const company = c.companyName || c.name || 'Case study';
  const cover = unwrapImage(c.coverImage);
  const tools = list(c.toolsUsed);
  const relatedSlugs = RELATED[slug] || [];

  return (
    <div className="csd-page">
      <div className="csd-crumb">
        <a href="/case-studies">← All case studies</a>
        {c.industry && <span> · {c.industry}</span>}
      </div>

      <header className="csd-hero">
        <div className="csd-eyebrow">{c.industry}</div>
        <h1 className="csd-h1">{company}</h1>
        <p className="csd-headline">{c.headline}</p>
        {cover && (
          <div className="csd-cover">
            <img src={cover} alt={company} />
            <div className="csd-cover-glow" />
          </div>
        )}
      </header>

      <section className="csd-metrics">
        <MetricCard label={c.metric1Label} value={c.metric1Value} before={c.metric1Before} after={c.metric1After} />
        <MetricCard label={c.metric2Label} value={c.metric2Value} before={c.metric2Before} after={c.metric2After} />
        <MetricCard label={c.metric3Label} value={c.metric3Value} before={c.metric3Before} after={c.metric3After} />
      </section>

      {c.challenge && (
        <section className="csd-section">
          <div className="csd-section-eyebrow">The challenge</div>
          <h2 className="csd-section-title">What wasn't working</h2>
          <p className="csd-prose">{c.challenge}</p>
        </section>
      )}

      {c.approach && (
        <section className="csd-section">
          <div className="csd-section-eyebrow">The architecture</div>
          <h2 className="csd-section-title">How we solved it</h2>
          <p className="csd-prose">{c.approach}</p>
          {tools.length > 0 && (
            <div className="csd-tools">
              <div className="csd-tools-label">Stack used</div>
              <div className="csd-tools-list">
                {tools.map((t, i) => <span key={i} className="csd-tool">{t}</span>)}
              </div>
            </div>
          )}
        </section>
      )}

      {c.result && (
        <section className="csd-section csd-result">
          <div className="csd-section-eyebrow">The result</div>
          <h2 className="csd-section-title">What happened</h2>
          <p className="csd-prose">{c.result}</p>
        </section>
      )}

      {c.quote && (
        <section className="csd-quote">
          <div className="csd-quote-mark">"</div>
          <blockquote>{c.quote.replace(/^"|"$/g, '')}</blockquote>
          {(c.quoteAuthor || c.quoteRole) && (
            <div className="csd-quote-attr">
              <strong>{c.quoteAuthor}</strong>
              {c.quoteRole && <span>{c.quoteRole} · {company}</span>}
            </div>
          )}
        </section>
      )}

      {relatedSlugs.length > 0 && (
        <section className="csd-section">
          <div className="csd-section-eyebrow">More cases</div>
          <h2 className="csd-section-title">If this resonated, also read</h2>
          <div className="csd-related">
            {relatedSlugs.map(s => {
              const r = FALLBACK[s];
              if (!r) return null;
              return (
                <a key={s} href={`/case-studies/${s}`} className="csd-related-card">
                  <div className="csd-related-industry">{r.industry}</div>
                  <h3>{r.companyName}</h3>
                  <p>{r.headline}</p>
                  <span className="csd-related-link">Read →</span>
                </a>
              );
            })}
          </div>
        </section>
      )}

      <section className="csd-cta-final">
        <h2>Want a case like this in <span className="csd-grad">your business</span>?</h2>
        <p>Run the free 60-second ROI Audit — Arora maps the closest case to your numbers.</p>
        <a className="csd-cta-btn" href="/roi-audit">Get Your Free ROI Audit →</a>
      </section>

      <Styles />
    </div>
  );
}

function MetricCard({ label, value, before, after }: { label?: string; value?: string; before?: string; after?: string }) {
  if (!label || !value) return null;
  return (
    <div className="csd-metric">
      <div className="csd-metric-v">{value}</div>
      <div className="csd-metric-k">{label}</div>
      {(before || after) && (
        <div className="csd-metric-delta">
          {before && <span className="csd-before">{before}</span>}
          {before && after && <span className="csd-arrow">→</span>}
          {after && <span className="csd-after">{after}</span>}
        </div>
      )}
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      .csd-page { background: #0A1628; color: #D4E8F7; min-height: 100vh; padding: 100px 24px 80px; font-family: 'DM Sans', system-ui, sans-serif; }
      @media (max-width: 640px) { .csd-page { padding: 80px 16px 60px; } }

      .csd-crumb { max-width: 1080px; margin: 0 auto 24px; font-size: 13px; color: #8899AA; }
      .csd-crumb a { color: #00D4FF; }

      .csd-loading, .csd-empty { max-width: 600px; margin: 80px auto; text-align: center; padding: 48px; background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 18px; }
      .csd-empty h2 { font-family: 'Syne', sans-serif; font-size: 24px; margin-bottom: 12px; }
      .csd-empty p { color: #8899AA; margin-bottom: 20px; }
      .csd-spin { display: inline-block; width: 14px; height: 14px; border: 2px solid #1E3A5F; border-top-color: #00D4FF; border-radius: 50%; animation: csd-spin 0.8s linear infinite; vertical-align: middle; margin-right: 8px; }
      @keyframes csd-spin { to { transform: rotate(360deg); } }
      .csd-btn { padding: 12px 24px; background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628; border-radius: 10px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; text-decoration: none; }

      .csd-hero { max-width: 880px; margin: 0 auto 56px; text-align: center; }
      .csd-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(0,212,255,0.08); border: 1px solid rgba(0,212,255,0.25); border-radius: 999px; color: #00D4FF; font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 16px; }
      .csd-h1 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(36px, 5.5vw, 64px); line-height: 1.05; margin-bottom: 16px; }
      .csd-headline { font-size: 20px; color: #D4E8F7; line-height: 1.5; max-width: 720px; margin: 0 auto 32px; }
      .csd-cover { position: relative; aspect-ratio: 21/9; border-radius: 20px; overflow: hidden; border: 1px solid #1E3A5F; }
      .csd-cover img { width: 100%; height: 100%; object-fit: cover; }
      .csd-cover-glow { position: absolute; inset: 0; background: radial-gradient(circle at 70% 30%, rgba(0,212,255,0.15), transparent 60%); pointer-events: none; }

      .csd-metrics { max-width: 1080px; margin: 0 auto 72px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
      @media (max-width: 800px) { .csd-metrics { grid-template-columns: 1fr; } }
      .csd-metric { padding: 28px; background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 16px; text-align: center; }
      .csd-metric-v { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 36px; background: linear-gradient(135deg, #00D4FF, #00FFE5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1.1; }
      .csd-metric-k { font-size: 11px; color: #8899AA; text-transform: uppercase; letter-spacing: 0.12em; margin-top: 6px; }
      .csd-metric-delta { margin-top: 14px; padding-top: 14px; border-top: 1px solid rgba(30,58,95,0.6); display: flex; justify-content: center; align-items: center; gap: 8px; font-size: 12px; }
      .csd-before { color: #8899AA; }
      .csd-arrow { color: #00D4FF; font-weight: 700; }
      .csd-after { color: #00D4FF; font-weight: 600; }

      .csd-section { max-width: 800px; margin: 0 auto 72px; }
      .csd-result { padding: 40px; background: rgba(0,212,255,0.04); border: 1px solid rgba(0,212,255,0.25); border-radius: 20px; }
      .csd-section-eyebrow { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; color: #00D4FF; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 12px; }
      .csd-section-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(24px, 3vw, 34px); line-height: 1.2; margin-bottom: 20px; }
      .csd-prose { color: #D4E8F7; font-size: 17px; line-height: 1.75; }

      .csd-tools { margin-top: 24px; padding: 20px; background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 14px; }
      .csd-tools-label { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; color: #00D4FF; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 12px; }
      .csd-tools-list { display: flex; flex-wrap: wrap; gap: 8px; }
      .csd-tool { padding: 5px 12px; background: rgba(0,212,255,0.08); border: 1px solid rgba(0,212,255,0.25); border-radius: 999px; font-size: 12px; color: #D4E8F7; }

      .csd-quote { max-width: 800px; margin: 0 auto 72px; padding: 48px 40px; background: linear-gradient(135deg, #0D1F3C, #14284D); border: 1px solid rgba(0,212,255,0.3); border-radius: 24px; position: relative; }
      .csd-quote-mark { position: absolute; top: 8px; left: 24px; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 96px; color: rgba(0,212,255,0.18); line-height: 1; }
      .csd-quote blockquote { font-family: 'Syne', sans-serif; font-weight: 700; font-size: clamp(20px, 2.5vw, 26px); line-height: 1.5; color: #D4E8F7; font-style: italic; margin-bottom: 20px; padding-left: 8px; }
      .csd-quote-attr { display: flex; flex-direction: column; gap: 2px; padding-top: 16px; border-top: 1px solid rgba(0,212,255,0.2); }
      .csd-quote-attr strong { font-size: 14px; }
      .csd-quote-attr span { font-size: 12px; color: #8899AA; }

      .csd-related { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
      @media (max-width: 640px) { .csd-related { grid-template-columns: 1fr; } }
      .csd-related-card { padding: 24px; background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 14px; text-decoration: none; color: #D4E8F7; transition: all 0.3s; display: block; }
      .csd-related-card:hover { transform: translateY(-3px); border-color: #00D4FF; }
      .csd-related-industry { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; color: #00D4FF; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px; }
      .csd-related-card h3 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; margin-bottom: 8px; }
      .csd-related-card p { color: #8899AA; font-size: 13px; line-height: 1.5; margin-bottom: 12px; }
      .csd-related-link { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700; color: #00D4FF; }

      .csd-cta-final { max-width: 720px; margin: 0 auto; text-align: center; padding: 48px 32px; background: rgba(0,212,255,0.04); border: 1px solid rgba(0,212,255,0.25); border-radius: 24px; }
      .csd-cta-final h2 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; margin-bottom: 8px; }
      .csd-grad { background: linear-gradient(135deg, #00D4FF, #00FFE5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .csd-cta-final p { color: #8899AA; font-size: 15px; margin-bottom: 24px; }
      .csd-cta-btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628 !important; border-radius: 10px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; text-decoration: none; box-shadow: 0 0 24px rgba(0,212,255,0.35); }
    `}</style>
  );
}

export default CaseStudyDetailPage;
