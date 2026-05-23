// Server Component — six headline numbers as a wide horizontal banner.
//
// Two of the figures (Avg ROI · Hrs/wk reclaimed) are projections, not
// trailing client averages. We label them honestly: "Projected" with a
// methodology footnote that links to /how-we-measure for the audit
// methodology. The other four are objective inventory counts, no caveat.
import Link from 'next/link';

export function StatsBanner() {
  const stats = [
    // "Projected" is in the label itself so prospects don't have to chase
    // a tiny asterisk to figure out which numbers are forecast vs. measured.
    { v: '340%',   k: 'Projected ROI · 12 mo', projected: true },
    { v: '35+',    k: 'Projected hrs/wk',      projected: true },
    { v: '$3,573', k: 'Catalogue value',     projected: false },
    { v: '19',     k: 'Digital products',    projected: false },
    { v: '11',     k: 'AI services',         projected: false },
    { v: '7',      k: 'Industries served',   projected: false },
  ];
  return (
    <section className="px-6 md:px-12 py-12">
      <div className="max-w-[1440px] mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 p-8 rounded-2xl bg-card border border-border">
        {stats.map(s => (
          <div key={s.k} className="text-center">
            <div className="font-display font-extrabold text-3xl md:text-4xl text-grad leading-none mb-1">
              {s.v}{s.projected && <sup className="text-cyan/70 text-[12px] ml-0.5 font-bold">*</sup>}
            </div>
            <div className="text-[11px] text-muted uppercase tracking-[0.1em] font-medium">{s.k}</div>
          </div>
        ))}
      </div>
      <div className="max-w-[1440px] mx-auto mt-3 text-center text-[11px] text-muted/80">
        <span className="text-cyan/70 font-bold">*</span> Projected from Stage&nbsp;1 audit data and pilot benchmarks across our toolkit.{' '}
        <Link href="/how-we-measure" className="underline hover:text-cyan transition-colors">Methodology →</Link>
      </div>
    </section>
  );
}
