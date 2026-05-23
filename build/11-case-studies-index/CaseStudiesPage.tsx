// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · CASE STUDIES INDEX · /case-studies
// Phase 3.1 · pulls all 8 from `casestudies` CMS, industry filter, masonry
// grid with varied card sizes. Falls back to the 4 hero cases from the
// preview so the page is never empty.
// ─────────────────────────────────────────────────────────────────────────

import { items } from '@wix/data';
import { useWixModules } from '@wix/sdk-react';
import { useEffect, useMemo, useState } from 'react';

interface Case {
  _id: string;
  title?: string;
  companyName?: string;
  name?: string;
  industry?: string;
  slug?: string;
  headline?: string;
  summary?: string;
  description?: string;
  metric1Label?: string; metric1Value?: string;
  metric2Label?: string; metric2Value?: string;
  metric3Label?: string; metric3Value?: string;
  coverImage?: string | { stringValue: string };
  featured?: boolean;
}

const FALLBACK: Case[] = [
  {
    _id: 'fb-1', slug: 'hargreaves-sterling',
    companyName: 'Hargreaves & Sterling', industry: 'Legal',
    headline: 'Partners reclaim 45 hrs/week from contract review',
    summary: 'IDP layer pre-reads every clause that deviates from firm standards. Partners only review exceptions.',
    metric1Label: 'Review reduction', metric1Value: '78%',
    metric2Label: 'Hrs reclaimed/wk', metric2Value: '45',
    metric3Label: 'Time to ROI',     metric3Value: '3 wks',
    featured: true,
  },
  {
    _id: 'fb-2', slug: 'meridian',
    companyName: 'Meridian Property', industry: 'Real Estate',
    headline: 'Lead response 6hr → 3min, +28% conversion',
    summary: 'Instant AI qualifier responds, qualifies, books showings before competitors call back.',
    metric1Label: 'Response time', metric1Value: '6hr→3m',
    metric2Label: 'Conversion',    metric2Value: '+28%',
    metric3Label: 'Go-live',       metric3Value: '2 wks',
  },
  {
    _id: 'fb-3', slug: 'vortex',
    companyName: 'Vortex Components', industry: 'Manufacturing',
    headline: 'Defect rate 4.1% → 0.6% with vision + telemetry',
    summary: 'Real-time anomaly flagging routes parts to a quality engineer before they ship.',
    metric1Label: 'Defect rate', metric1Value: '4.1%→0.6%',
    metric2Label: 'Throughput',  metric2Value: '+34%',
    metric3Label: 'Time to ROI', metric3Value: '11 wks',
  },
  {
    _id: 'fb-4', slug: 'thornfield',
    companyName: 'Thornfield Stores', industry: 'Retail',
    headline: 'Stockouts -71%, £95k annual saving',
    summary: 'POS + supplier + forecast data fused into a demand-prediction model that auto-orders 3 weeks ahead.',
    metric1Label: 'Stockouts',     metric1Value: '-71%',
    metric2Label: 'Annual saving', metric2Value: '£95k',
    metric3Label: 'Go-live',       metric3Value: '9 wks',
  },
];

const get = (c: Case, ...keys: (keyof Case)[]) => {
  for (const k of keys) if (c[k] != null && c[k] !== '') return c[k] as any;
  return undefined;
};
const unwrapImage = (img: any): string => {
  if (!img) return '';
  if (typeof img === 'string') return img;
  if (typeof img === 'object' && img.stringValue) return img.stringValue;
  return '';
};

export function CaseStudiesPage() {
  const { query } = useWixModules(items);
  const [cases, setCases] = useState<Case[]>(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [activeIndustry, setActiveIndustry] = useState<string>('All');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await query('casestudies').limit(50).find({ suppressAuth: true });
        const cms = (res.items as Case[]) || [];
        if (mounted && cms.length > 0) setCases(cms);
      } catch {
        // keep fallback
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const industries = useMemo(() => {
    const set = new Set<string>(['All']);
    for (const c of cases) if (c.industry) set.add(c.industry);
    return Array.from(set);
  }, [cases]);

  const filtered = useMemo(() => {
    if (activeIndustry === 'All') return cases;
    return cases.filter(c => c.industry === activeIndustry);
  }, [cases, activeIndustry]);

  return (
    <div className="cs-page">
      <header className="cs-hero">
        <div className="cs-eyebrow">{cases.length} case studies · {industries.length - 1} industries</div>
        <h1 className="cs-h1">
          The numbers tell the <span className="cs-grad">whole story</span>
        </h1>
        <p className="cs-sub">
          Every engagement is engineered to prove its value financially before scope expands.
          Pick your industry to see the closest match.
        </p>
      </header>

      <div className="cs-tabs">
        {industries.map(ind => (
          <button
            key={ind}
            className={`cs-tab ${activeIndustry === ind ? 'is-active' : ''}`}
            onClick={() => setActiveIndustry(ind)}
          >
            {ind}
            <span className="cs-tab-count">
              {ind === 'All' ? cases.length : cases.filter(c => c.industry === ind).length}
            </span>
          </button>
        ))}
      </div>

      {loading && <div className="cs-loading"><span className="cs-spin" /> Loading…</div>}

      {!loading && filtered.length === 0 && (
        <div className="cs-empty">
          <p>No case studies in {activeIndustry} yet.</p>
          <button className="cs-btn" onClick={() => setActiveIndustry('All')}>Show all</button>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="cs-grid">
          {filtered.map((c, i) => <Card key={c._id} c={c} featured={i === 0 && activeIndustry === 'All'} />)}
        </div>
      )}

      <section className="cs-cta-final">
        <h2>Want this for your business?</h2>
        <p>Run the free 60-second ROI Audit — Arora pulls the case study closest to your situation.</p>
        <a className="cs-cta-btn" href="/roi-audit">Get Your Free ROI Audit →</a>
      </section>

      <Styles />
    </div>
  );
}

function Card({ c, featured }: { c: Case; featured: boolean }) {
  const company = (get(c, 'companyName', 'name', 'title') as string) || 'Case study';
  const headline = c.headline || c.summary || c.description || '';
  const summary = c.summary || c.description || '';
  const slug = c.slug || c._id;
  const image = unwrapImage(c.coverImage);

  return (
    <a href={`/case-studies/${slug}`} className={`cs-card ${featured ? 'is-featured' : ''}`}>
      {image && (
        <div className="cs-card-image">
          <img src={image} alt={company} loading="lazy" />
          <div className="cs-card-glow" />
        </div>
      )}
      <div className="cs-card-body">
        {c.industry && <div className="cs-card-industry">{c.industry}</div>}
        <h3 className="cs-card-name">{company}</h3>
        <p className="cs-card-headline">{headline}</p>
        {featured && summary && summary !== headline && <p className="cs-card-summary">{summary}</p>}
        <div className="cs-card-metrics">
          <Metric label={c.metric1Label} value={c.metric1Value} />
          <Metric label={c.metric2Label} value={c.metric2Value} />
          <Metric label={c.metric3Label} value={c.metric3Value} />
        </div>
        <span className="cs-card-link">Read case →</span>
      </div>
    </a>
  );
}

function Metric({ label, value }: { label?: string; value?: string }) {
  if (!label || !value) return null;
  return (
    <div className="cs-metric">
      <div className="cs-metric-v">{value}</div>
      <div className="cs-metric-k">{label}</div>
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      .cs-page { background: #0A1628; color: #D4E8F7; min-height: 100vh; padding: 100px 24px 80px; font-family: 'DM Sans', system-ui, sans-serif; }
      @media (max-width: 640px) { .cs-page { padding: 80px 16px 60px; } }

      .cs-hero { max-width: 760px; margin: 0 auto 48px; text-align: center; }
      .cs-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(0,212,255,0.08); border: 1px solid rgba(0,212,255,0.25); border-radius: 999px; color: #00D4FF; font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 16px; }
      .cs-h1 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(32px, 5vw, 52px); line-height: 1.05; margin-bottom: 16px; }
      .cs-grad { background: linear-gradient(135deg, #00D4FF, #00FFE5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .cs-sub { color: #8899AA; font-size: 17px; line-height: 1.6; }

      .cs-tabs { max-width: 1080px; margin: 0 auto 32px; display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
      .cs-tab { padding: 8px 16px; background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 999px; color: #8899AA; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; display: inline-flex; align-items: center; gap: 8px; }
      .cs-tab:hover { color: #D4E8F7; border-color: #00D4FF; }
      .cs-tab.is-active { background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628; border-color: transparent; font-weight: 700; box-shadow: 0 0 14px rgba(0,212,255,0.25); }
      .cs-tab-count { display: inline-flex; min-width: 20px; height: 18px; padding: 0 6px; background: rgba(0,0,0,0.18); border-radius: 999px; font-size: 10px; font-weight: 700; align-items: center; justify-content: center; }

      .cs-loading, .cs-empty { max-width: 480px; margin: 80px auto; text-align: center; padding: 32px; background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 14px; }
      .cs-spin { display: inline-block; width: 14px; height: 14px; border: 2px solid #1E3A5F; border-top-color: #00D4FF; border-radius: 50%; animation: cs-spin 0.8s linear infinite; vertical-align: middle; margin-right: 8px; }
      @keyframes cs-spin { to { transform: rotate(360deg); } }
      .cs-btn { padding: 10px 20px; background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628; border: none; border-radius: 10px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; cursor: pointer; }

      .cs-grid { max-width: 1080px; margin: 0 auto 80px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
      @media (max-width: 800px) { .cs-grid { grid-template-columns: 1fr; } }

      .cs-card { display: flex; flex-direction: column; background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 18px; overflow: hidden; text-decoration: none; color: #D4E8F7; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); position: relative; }
      .cs-card:hover { transform: translateY(-4px); border-color: #00D4FF; box-shadow: 0 0 32px rgba(0,212,255,0.2); }
      .cs-card.is-featured { grid-column: 1 / -1; flex-direction: row; min-height: 320px; border-color: #00D4FF; box-shadow: 0 0 32px rgba(0,212,255,0.15); }
      @media (max-width: 800px) { .cs-card.is-featured { flex-direction: column; min-height: 0; } }

      .cs-card-image { position: relative; aspect-ratio: 16/9; background: linear-gradient(135deg, #0A1628, #0D1F3C); overflow: hidden; }
      .cs-card.is-featured .cs-card-image { aspect-ratio: auto; flex: 1; min-height: 280px; }
      @media (max-width: 800px) { .cs-card.is-featured .cs-card-image { aspect-ratio: 16/9; min-height: 0; } }
      .cs-card-image img { width: 100%; height: 100%; object-fit: cover; }
      .cs-card-glow { position: absolute; inset: 0; background: radial-gradient(circle at 70% 30%, rgba(0,212,255,0.12), transparent 60%); pointer-events: none; }

      .cs-card-body { padding: 28px; flex: 1; display: flex; flex-direction: column; }
      .cs-card.is-featured .cs-card-body { padding: 36px 40px; justify-content: center; flex: 1.2; }
      .cs-card-industry { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; color: #00D4FF; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 8px; }
      .cs-card-name { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; margin-bottom: 8px; }
      .cs-card.is-featured .cs-card-name { font-size: 28px; }
      .cs-card-headline { color: #D4E8F7; font-size: 15px; line-height: 1.5; margin-bottom: 16px; }
      .cs-card-summary { color: #8899AA; font-size: 14px; line-height: 1.6; margin-bottom: 20px; }

      .cs-card-metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 16px 0; border-top: 1px solid rgba(30,58,95,0.6); border-bottom: 1px solid rgba(30,58,95,0.6); margin-bottom: 16px; }
      .cs-metric-v { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: #00D4FF; line-height: 1.1; }
      .cs-metric-k { font-size: 10px; color: #8899AA; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 4px; }

      .cs-card-link { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700; color: #00D4FF; letter-spacing: 0.05em; }

      .cs-cta-final { max-width: 720px; margin: 0 auto; text-align: center; padding: 48px 32px; background: rgba(0,212,255,0.04); border: 1px solid rgba(0,212,255,0.25); border-radius: 24px; }
      .cs-cta-final h2 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; margin-bottom: 8px; }
      .cs-cta-final p { color: #8899AA; font-size: 15px; margin-bottom: 24px; }
      .cs-cta-btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628 !important; border-radius: 10px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; text-decoration: none; box-shadow: 0 0 24px rgba(0,212,255,0.35); }
    `}</style>
  );
}

export default CaseStudiesPage;
