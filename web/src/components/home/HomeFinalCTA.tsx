import Link from 'next/link';

export function HomeFinalCTA() {
  return (
    <section className="px-6 md:px-12 py-20">
      <div className="max-w-[1080px] mx-auto text-center px-8 md:px-16 py-16 rounded-3xl bg-gradient-to-br from-card to-card-up border border-cyan/30 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 30% 50%, rgba(139, 92, 246,0.10), transparent 60%), radial-gradient(circle at 70% 50%, rgba(192, 132, 252,0.08), transparent 60%)',
          }}
        />
        <div className="relative">
          <span className="eyebrow mb-4 inline-flex">Free · 60 seconds · no call</span>
          <h2 className="font-display font-extrabold text-4xl md:text-6xl leading-[1.05] mb-5">
            Ready to see <span className="text-grad">your number</span>?
          </h2>
          <p className="text-muted text-lg md:text-xl leading-relaxed mb-9 max-w-[640px] mx-auto">
            Run the free ROI Audit. Personalised report in 60 seconds.
            Plan + product recs based on your stage. No call, no pitch — just the numbers.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/roi-audit"
              className="inline-flex items-center gap-2 px-9 py-4 bg-grad text-bg rounded-lg font-display font-bold text-base shadow-glow-md hover:shadow-glow-lg hover:-translate-y-0.5 transition-all"
            >
              Get Your Free ROI Audit
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-9 py-4 border border-border rounded-lg font-display font-bold text-base text-text hover:border-cyan hover:text-cyan transition-all"
            >
              See pricing first
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
