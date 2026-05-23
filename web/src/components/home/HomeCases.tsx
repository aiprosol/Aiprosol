import Link from 'next/link';
import { getCaseStudies } from '@/lib/content';
import { reorderCases, industryLabel, type VisitorSegment } from '@/lib/personalize';

export function HomeCases({ segment }: { segment?: VisitorSegment }) {
  const ordered = segment ? reorderCases(getCaseStudies(), segment) : getCaseStudies();
  const cases = ordered.slice(0, 3);
  const personalised = segment && segment.industry !== 'unknown';

  return (
    <section className="px-6 md:px-12 py-20">
      <div className="max-w-[1440px] mx-auto">
        <div className="text-center mb-12">
          <span className="eyebrow mb-4 inline-flex">
            {personalised ? `Closest to ${industryLabel(segment!.industry)}` : '7 case studies · 7 industries'}
          </span>
          <h2 className="font-display font-extrabold text-3xl md:text-5xl leading-tight mb-4">
            The numbers tell the <span className="text-grad">whole story</span>
          </h2>
          <p className="text-muted text-lg max-w-[640px] mx-auto">
            Every engagement engineered to prove its value financially before scope expands.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {cases.map(c => (
            <Link
              key={c.slug}
              href={`/case-studies/${c.slug}`}
              className="group flex flex-col rounded-2xl bg-card border border-border overflow-hidden hover:border-cyan hover:-translate-y-1 hover:shadow-glow-sm transition-all duration-300"
            >
              <div className="aspect-[16/9] overflow-hidden bg-bg-deep">
                <img
                  src={`/api/og/case/${c.slug}`}
                  alt={c.companyName}
                  loading="lazy"
                  width={640}
                  height={360}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-7 flex flex-col flex-1">
              <span className="font-display font-bold text-[11px] text-cyan uppercase tracking-[0.12em] mb-3">
                {c.industry}
              </span>
              <h3 className="font-display font-extrabold text-xl mb-3 group-hover:text-cyan transition-colors">
                {c.companyName}
              </h3>
              <p className="text-text text-sm leading-relaxed mb-5 flex-1">{c.headline}</p>
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border/60 mb-3">
                {[
                  { l: c.metric1Label, v: c.metric1Value },
                  { l: c.metric2Label, v: c.metric2Value },
                  { l: c.metric3Label, v: c.metric3Value },
                ].filter(m => m.l && m.v).map((m, i) => (
                  <div key={i}>
                    <div className="font-display font-extrabold text-base text-cyan leading-tight">{m.v}</div>
                    <div className="text-[9px] text-muted uppercase tracking-[0.08em] mt-1">{m.l}</div>
                  </div>
                ))}
              </div>
              <span className="font-display font-bold text-xs text-cyan uppercase tracking-[0.1em]">
                Read case →
              </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/case-studies"
            className="inline-flex items-center gap-2 px-8 py-4 border border-border rounded-lg font-display font-bold text-sm text-text hover:border-cyan hover:text-cyan transition-colors"
          >
            View all case studies →
          </Link>
        </div>
      </div>
    </section>
  );
}
