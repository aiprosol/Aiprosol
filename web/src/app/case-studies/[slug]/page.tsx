'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getCaseStudyBySlug, getRelatedCaseStudies } from '@/lib/content';
import { CaseStudyDemoEmbed, type DemoEmbedConfig } from '@/components/CaseStudyDemoEmbed';

export default function CaseStudyDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const c = slug ? getCaseStudyBySlug(slug) : undefined;
  const related = slug ? getRelatedCaseStudies(slug, 2) : [];

  if (!c) {
    return (
      <div className="csd-page">
        <div className="csd-empty">
          <h2>That case study isn&apos;t on file.</h2>
          <p>Browse all in the index.</p>
          <Link href="/case-studies" className="csd-btn">View all case studies →</Link>
        </div>
        <Styles />
      </div>
    );
  }

  return (
    <div className="csd-page">
      <div className="csd-crumb">
        <Link href="/case-studies">← All case studies</Link>
        <span> · {c.industry}</span>
      </div>

      <header className="csd-hero">
        <div className="csd-eyebrow">{c.industry}</div>
        <h1 className="csd-h1">{c.companyName}</h1>
        <p className="csd-headline">{c.headline}</p>
        <div className="csd-cover">
          <img src={`/api/og/case/${c.slug}`} alt={c.companyName} loading="eager" />
        </div>
      </header>

      <section className="csd-metrics">
        {c.metric1Label && c.metric1Value && (
          <div className="csd-metric">
            <div className="csd-metric-v">{c.metric1Value}</div>
            <div className="csd-metric-k">{c.metric1Label}</div>
            {(c.metric1Before || c.metric1After) && (
              <div className="csd-metric-delta">
                {c.metric1Before && <span className="csd-before">{c.metric1Before}</span>}
                {c.metric1Before && c.metric1After && <span className="csd-arrow">→</span>}
                {c.metric1After && <span className="csd-after">{c.metric1After}</span>}
              </div>
            )}
          </div>
        )}
        {c.metric2Label && c.metric2Value && (
          <div className="csd-metric">
            <div className="csd-metric-v">{c.metric2Value}</div>
            <div className="csd-metric-k">{c.metric2Label}</div>
            {(c.metric2Before || c.metric2After) && (
              <div className="csd-metric-delta">
                {c.metric2Before && <span className="csd-before">{c.metric2Before}</span>}
                {c.metric2Before && c.metric2After && <span className="csd-arrow">→</span>}
                {c.metric2After && <span className="csd-after">{c.metric2After}</span>}
              </div>
            )}
          </div>
        )}
        {c.metric3Label && c.metric3Value && (
          <div className="csd-metric">
            <div className="csd-metric-v">{c.metric3Value}</div>
            <div className="csd-metric-k">{c.metric3Label}</div>
            {(c.metric3Before || c.metric3After) && (
              <div className="csd-metric-delta">
                {c.metric3Before && <span className="csd-before">{c.metric3Before}</span>}
                {c.metric3Before && c.metric3After && <span className="csd-arrow">→</span>}
                {c.metric3After && <span className="csd-after">{c.metric3After}</span>}
              </div>
            )}
          </div>
        )}
      </section>

      {c.challenge && (
        <section className="csd-section">
          <div className="csd-section-eyebrow">The challenge</div>
          <h2 className="csd-section-title">What wasn&apos;t working</h2>
          <p className="csd-prose">{c.challenge}</p>
        </section>
      )}

      {c.approach && (
        <section className="csd-section">
          <div className="csd-section-eyebrow">The architecture</div>
          <h2 className="csd-section-title">How we solved it</h2>
          <p className="csd-prose">{c.approach}</p>
          {(c.toolsUsed?.length ?? 0) > 0 && (
            <div className="csd-tools">
              <div className="csd-tools-label">Stack used</div>
              <div className="csd-tools-list">
                {c.toolsUsed!.map((t, i) => <span key={i} className="csd-tool">{t}</span>)}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Interactive demo embed — invisible until a `demoEmbed` is added to this case in case-studies.json */}
      <CaseStudyDemoEmbed config={(c as { demoEmbed?: DemoEmbedConfig }).demoEmbed ?? null} />

      {c.result && (
        <section className="csd-section csd-result">
          <div className="csd-section-eyebrow">The result</div>
          <h2 className="csd-section-title">What happened</h2>
          <p className="csd-prose">{c.result}</p>
        </section>
      )}

      {c.quote && (
        <section className="csd-quote">
          <div className="csd-quote-mark">&ldquo;</div>
          <blockquote>{c.quote.replace(/^"|"$/g, '')}</blockquote>
          {(c.quoteAuthor || c.quoteRole) && (
            <div className="csd-quote-attr">
              <strong>{c.quoteAuthor}</strong>
              {c.quoteRole && <span>{c.quoteRole} · {c.companyName}</span>}
            </div>
          )}
        </section>
      )}

      {related.length > 0 && (
        <section className="csd-section">
          <div className="csd-section-eyebrow">More cases</div>
          <h2 className="csd-section-title">If this resonated, also read</h2>
          <div className="csd-related">
            {related.map(r => (
              <Link key={r.slug} href={`/case-studies/${r.slug}`} className="csd-related-card">
                <div className="csd-related-industry">{r.industry}</div>
                <h3>{r.companyName}</h3>
                <p>{r.headline}</p>
                <span className="csd-related-link">Read →</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="csd-cta-final">
        <h2>Want a case like this in <span className="csd-grad">your business</span>?</h2>
        <p>Run the free 60-second ROI Audit — Arora maps the closest case to your numbers.</p>
        <Link className="csd-cta-btn" href="/roi-audit">Get Your Free ROI Audit →</Link>
      </section>

      <Styles />
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      .csd-page { background: #0A0613; color: #E5E7EB; min-height: 100vh; padding: 140px 24px 80px; font-family: 'Inter', system-ui, sans-serif; }
      @media (max-width: 640px) { .csd-page { padding: 120px 16px 60px; } }
      .csd-empty { max-width: 600px; margin: 80px auto; text-align: center; padding: 48px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 18px; }
      .csd-empty h2 { font-family: 'Space Grotesk', sans-serif; font-size: 24px; margin-bottom: 12px; }
      .csd-empty p { color: #9CA3B5; margin-bottom: 20px; }
      .csd-btn { padding: 12px 24px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; text-decoration: none; }
      .csd-crumb { max-width: 1080px; margin: 0 auto 24px; font-size: 13px; color: #9CA3B5; }
      .csd-crumb a { color: #8B5CF6; }
      .csd-hero { max-width: 880px; margin: 0 auto 56px; text-align: center; }
      .csd-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(139, 92, 246,0.08); border: 1px solid rgba(139, 92, 246,0.25); border-radius: 999px; color: #8B5CF6; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 16px; }
      .csd-h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(36px, 5.5vw, 64px); line-height: 1.05; margin-bottom: 16px; }
      .csd-headline { font-size: 20px; color: #E5E7EB; line-height: 1.5; max-width: 720px; margin: 0 auto 32px; }
      .csd-cover { max-width: 1080px; margin: 32px auto 0; aspect-ratio: 21/9; border: 1px solid #2A1F3D; border-radius: 20px; overflow: hidden; background: #0A0613; }
      .csd-cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .csd-metrics { max-width: 1080px; margin: 0 auto 72px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
      @media (max-width: 800px) { .csd-metrics { grid-template-columns: 1fr; } }
      .csd-metric { padding: 28px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 16px; text-align: center; }
      .csd-metric-v { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 36px; background: linear-gradient(135deg, #8B5CF6, #C084FC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1.1; }
      .csd-metric-k { font-size: 11px; color: #9CA3B5; text-transform: uppercase; letter-spacing: 0.12em; margin-top: 6px; }
      .csd-metric-delta { margin-top: 14px; padding-top: 14px; border-top: 1px solid rgba(30,58,95,0.6); display: flex; justify-content: center; align-items: center; gap: 8px; font-size: 12px; }
      .csd-before { color: #9CA3B5; }
      .csd-arrow { color: #8B5CF6; font-weight: 700; }
      .csd-after { color: #8B5CF6; font-weight: 600; }
      .csd-section { max-width: 800px; margin: 0 auto 72px; }
      .csd-result { padding: 40px; background: rgba(139, 92, 246,0.04); border: 1px solid rgba(139, 92, 246,0.25); border-radius: 20px; }
      .csd-section-eyebrow { font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; color: #8B5CF6; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 12px; }
      .csd-section-title { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(24px, 3vw, 34px); line-height: 1.2; margin-bottom: 20px; }
      .csd-prose { color: #E5E7EB; font-size: 17px; line-height: 1.75; }
      .csd-tools { margin-top: 24px; padding: 20px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 14px; }
      .csd-tools-label { font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; color: #8B5CF6; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 12px; }
      .csd-tools-list { display: flex; flex-wrap: wrap; gap: 8px; }
      .csd-tool { padding: 5px 12px; background: rgba(139, 92, 246,0.08); border: 1px solid rgba(139, 92, 246,0.25); border-radius: 999px; font-size: 12px; color: #E5E7EB; }
      .csd-quote { max-width: 800px; margin: 0 auto 72px; padding: 48px 40px; background: linear-gradient(135deg, #13101F, #1B1530); border: 1px solid rgba(139, 92, 246,0.3); border-radius: 24px; position: relative; }
      .csd-quote-mark { position: absolute; top: 8px; left: 24px; font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 96px; color: rgba(139, 92, 246,0.18); line-height: 1; }
      .csd-quote blockquote { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: clamp(20px, 2.5vw, 26px); line-height: 1.5; color: #E5E7EB; font-style: italic; margin-bottom: 20px; padding-left: 8px; }
      .csd-quote-attr { display: flex; flex-direction: column; gap: 2px; padding-top: 16px; border-top: 1px solid rgba(139, 92, 246,0.2); }
      .csd-quote-attr strong { font-size: 14px; }
      .csd-quote-attr span { font-size: 12px; color: #9CA3B5; }
      .csd-related { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
      @media (max-width: 640px) { .csd-related { grid-template-columns: 1fr; } }
      .csd-related-card { padding: 24px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 14px; text-decoration: none; color: #E5E7EB; transition: all 0.3s; display: block; }
      .csd-related-card:hover { transform: translateY(-3px); border-color: #8B5CF6; }
      .csd-related-industry { font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; color: #8B5CF6; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px; }
      .csd-related-card h3 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 18px; margin-bottom: 8px; }
      .csd-related-card p { color: #9CA3B5; font-size: 13px; line-height: 1.5; margin-bottom: 12px; }
      .csd-related-link { font-family: 'Space Grotesk', sans-serif; font-size: 12px; font-weight: 700; color: #8B5CF6; }
      .csd-cta-final { max-width: 720px; margin: 0 auto; text-align: center; padding: 48px 32px; background: rgba(139, 92, 246,0.04); border: 1px solid rgba(139, 92, 246,0.25); border-radius: 24px; }
      .csd-cta-final h2 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 28px; margin-bottom: 8px; }
      .csd-grad { background: linear-gradient(135deg, #8B5CF6, #C084FC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .csd-cta-final p { color: #9CA3B5; font-size: 15px; margin-bottom: 24px; }
      .csd-cta-btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613 !important; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 14px; text-decoration: none; box-shadow: 0 0 24px rgba(139, 92, 246,0.35); }
    `}</style>
  );
}
