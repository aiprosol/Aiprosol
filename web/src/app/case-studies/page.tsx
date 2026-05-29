'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { getCaseStudies } from '@/lib/content';

export default function CaseStudiesPage() {
  const cases = getCaseStudies();
  const [activeIndustry, setActiveIndustry] = useState<string>('All');

  const industries = useMemo(() => {
    const set = new Set<string>(['All']);
    for (const c of cases) if (c.industry) set.add(c.industry);
    return Array.from(set);
  }, [cases]);

  const filtered = useMemo(() => {
    if (activeIndustry === 'All') return cases;
    return cases.filter(c => c.industry === activeIndustry);
  }, [cases, activeIndustry]);

  const isEmpty = cases.length === 0;

  return (
    <div className="cs-page">
      <header className="cs-hero">
        <div className="cs-eyebrow">{isEmpty ? 'Charter-customer phase' : `${cases.length} case studies · ${industries.length - 1} industries`}</div>
        <h1 className="cs-h1">
          {isEmpty ? (<>Real numbers, <span className="cs-grad">honestly earned</span></>) : (<>The numbers tell the <span className="cs-grad">whole story</span></>)}
        </h1>
        <p className="cs-sub">
          {isEmpty
            ? "We don't run invented case studies. Aiprosol is in its charter-customer phase — the first pilots are being run now, and verified, named results will be published here as they complete. In the meantime, see exactly how we measure ROI and watch the AI C-suite work live."
            : 'Every engagement is engineered to prove its value financially before scope expands. Pick your industry to see the closest match.'}
        </p>
        {isEmpty && (
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 }}>
            <Link className="cs-cta-btn" href="/how-we-measure">How we measure ROI →</Link>
            <Link className="cs-cta-btn" href="/agents" style={{ background: 'transparent', border: '1px solid rgba(139,92,246,0.4)' }}>Watch the AI C-suite live →</Link>
          </div>
        )}
      </header>

      {!isEmpty && (
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
      )}

      <div className="cs-grid">
        {filtered.map((c, i) => {
          const featured = i === 0 && activeIndustry === 'All';
          return (
            <Link key={c.slug} href={`/case-studies/${c.slug}`} className={`cs-card ${featured ? 'is-featured' : ''}`}>
              <div className="cs-card-img">
                <img src={`/api/og/case/${c.slug}`} alt={c.companyName} loading="lazy" width={640} height={360} />
              </div>
              <div className="cs-card-body">
                {c.industry && <div className="cs-card-industry">{c.industry}</div>}
                <h3 className="cs-card-name">{c.companyName}</h3>
                <p className="cs-card-headline">{c.headline}</p>
                {featured && c.summary && <p className="cs-card-summary">{c.summary}</p>}
                <div className="cs-card-metrics">
                  {c.metric1Label && c.metric1Value && (
                    <div className="cs-metric"><div className="cs-metric-v">{c.metric1Value}</div><div className="cs-metric-k">{c.metric1Label}</div></div>
                  )}
                  {c.metric2Label && c.metric2Value && (
                    <div className="cs-metric"><div className="cs-metric-v">{c.metric2Value}</div><div className="cs-metric-k">{c.metric2Label}</div></div>
                  )}
                  {c.metric3Label && c.metric3Value && (
                    <div className="cs-metric"><div className="cs-metric-v">{c.metric3Value}</div><div className="cs-metric-k">{c.metric3Label}</div></div>
                  )}
                </div>
                <span className="cs-card-link">Read case →</span>
              </div>
            </Link>
          );
        })}
      </div>

      <section className="cs-cta-final">
        <h2>Want this for your business?</h2>
        <p>Run the free 60-second ROI Audit — Arora pulls the case study closest to your situation.</p>
        <Link className="cs-cta-btn" href="/roi-audit">Get Your Free ROI Audit →</Link>
      </section>

      {/* Methodology footer — every case study is an anonymised, pilot-stage
          projection. We surface this prominently with links to /how-we-measure
          and /founder so customers can audit our claims + meet the human seat. */}
      <section className="cs-methodology">
        <div className="cs-meth-row">
          <div className="cs-meth-eyebrow">How we measure</div>
          <h3>Numbers, not vibes.</h3>
          <p>
            Every metric on this page is computed the same way — input hours × hourly cost × 50 weeks,
            with a 70% automation factor applied. The full methodology, including which assumptions
            we hold conservative and where we adjust per industry, is published in plain language.
          </p>
          <div className="cs-meth-links">
            <Link href="/how-we-measure" className="cs-meth-link">→ Full ROI methodology</Link>
            <Link href="/founder" className="cs-meth-link">→ Meet the human behind the numbers</Link>
            <Link href="/transparency" className="cs-meth-link">→ Live operational transparency</Link>
          </div>
        </div>
      </section>

      <Styles />
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      .cs-page { background: #0A0613; color: #E5E7EB; min-height: 100vh; padding: 140px 24px 80px; font-family: 'Inter', system-ui, sans-serif; }
      @media (max-width: 640px) { .cs-page { padding: 120px 16px 60px; } }
      .cs-hero { max-width: 760px; margin: 0 auto 48px; text-align: center; }
      .cs-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(139, 92, 246,0.08); border: 1px solid rgba(139, 92, 246,0.25); border-radius: 999px; color: #8B5CF6; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; }
      .cs-h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(32px, 5vw, 52px); line-height: 1.05; margin-bottom: 16px; }
      .cs-grad { background: linear-gradient(135deg, #8B5CF6, #C084FC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .cs-sub { color: #9CA3B5; font-size: 17px; line-height: 1.6; }
      .cs-tabs { max-width: 1080px; margin: 0 auto 32px; display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
      .cs-tab { padding: 8px 16px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 999px; color: #9CA3B5; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; font-family: 'Inter', system-ui, sans-serif; display: inline-flex; align-items: center; gap: 8px; }
      .cs-tab:hover { color: #E5E7EB; border-color: #8B5CF6; }
      .cs-tab.is-active { background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border-color: transparent; font-weight: 700; box-shadow: 0 0 14px rgba(139, 92, 246,0.25); }
      .cs-tab-count { display: inline-flex; min-width: 20px; height: 18px; padding: 0 6px; background: rgba(0,0,0,0.18); border-radius: 999px; font-size: 10px; font-weight: 700; align-items: center; justify-content: center; }
      .cs-grid { max-width: 1080px; margin: 0 auto 80px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
      @media (max-width: 800px) { .cs-grid { grid-template-columns: 1fr; } }
      .cs-card { display: flex; flex-direction: column; background: #13101F; border: 1px solid #2A1F3D; border-radius: 18px; overflow: hidden; text-decoration: none; color: #E5E7EB; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); position: relative; }
      .cs-card:hover { transform: translateY(-4px); border-color: #8B5CF6; box-shadow: 0 0 32px rgba(139, 92, 246,0.2); }
      .cs-card.is-featured { grid-column: 1 / -1; min-height: 280px; border-color: #8B5CF6; box-shadow: 0 0 32px rgba(139, 92, 246,0.15); display: grid; grid-template-columns: 1fr 1fr; }
      @media (max-width: 800px) { .cs-card.is-featured { grid-template-columns: 1fr; } }
      .cs-card-img { aspect-ratio: 16/9; overflow: hidden; background: #0A0613; }
      .cs-card.is-featured .cs-card-img { aspect-ratio: auto; min-height: 100%; }
      .cs-card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
      .cs-card:hover .cs-card-img img { transform: scale(1.04); }
      .cs-card-body { padding: 28px; flex: 1; display: flex; flex-direction: column; }
      .cs-card.is-featured .cs-card-body { padding: 36px 40px; }
      .cs-card-industry { font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; color: #8B5CF6; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 8px; }
      .cs-card-name { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 22px; margin-bottom: 8px; }
      .cs-card.is-featured .cs-card-name { font-size: 28px; }
      .cs-card-headline { color: #E5E7EB; font-size: 15px; line-height: 1.5; margin-bottom: 16px; }
      .cs-card-summary { color: #9CA3B5; font-size: 14px; line-height: 1.6; margin-bottom: 20px; }
      .cs-card-metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 16px 0; border-top: 1px solid rgba(30,58,95,0.6); border-bottom: 1px solid rgba(30,58,95,0.6); margin-bottom: 16px; }
      .cs-metric-v { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 18px; color: #8B5CF6; line-height: 1.1; }
      .cs-metric-k { font-size: 10px; color: #9CA3B5; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 4px; }
      .cs-card-link { font-family: 'Space Grotesk', sans-serif; font-size: 12px; font-weight: 700; color: #8B5CF6; letter-spacing: 0.05em; }
      .cs-cta-final { max-width: 720px; margin: 0 auto; text-align: center; padding: 48px 32px; background: rgba(139, 92, 246,0.04); border: 1px solid rgba(139, 92, 246,0.25); border-radius: 24px; }
      .cs-cta-final h2 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 28px; margin-bottom: 8px; }
      .cs-cta-final p { color: #9CA3B5; font-size: 15px; margin-bottom: 24px; }
      .cs-cta-btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613 !important; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 14px; text-decoration: none; box-shadow: 0 0 24px rgba(139, 92, 246,0.35); }

      /* Methodology footer with cross-links to /how-we-measure, /founder, /transparency */
      .cs-methodology { max-width: 880px; margin: 56px auto 0; padding: 32px 28px; background: rgba(139,92,246,0.04); border: 1px solid rgba(139,92,246,0.2); border-radius: 18px; }
      .cs-meth-eyebrow { font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; color: #8B5CF6; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 10px; }
      .cs-methodology h3 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 22px; line-height: 1.2; margin: 0 0 12px; color: #E5E7EB; }
      .cs-methodology p { color: #CBD5E1; font-size: 14px; line-height: 1.7; margin: 0 0 18px; }
      .cs-meth-links { display: flex; flex-wrap: wrap; gap: 18px; }
      .cs-meth-link { color: #C084FC; font-size: 14px; font-weight: 500; text-decoration: none; border-bottom: 1px solid rgba(192,132,252,0.3); transition: border-color 0.2s; }
      .cs-meth-link:hover { border-color: #C084FC; }
    `}</style>
  );
}
