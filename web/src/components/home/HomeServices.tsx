import Link from 'next/link';
import { getServices } from '@/lib/content';
import { reorderServices, industryLabel, type VisitorSegment } from '@/lib/personalize';

export function HomeServices({ segment }: { segment?: VisitorSegment }) {
  const ordered = segment ? reorderServices(getServices(), segment) : getServices();
  const services = ordered.slice(0, 6);
  const personalised = segment && segment.industry !== 'unknown';

  return (
    <section className="px-6 md:px-12 py-20">
      <div className="max-w-[1440px] mx-auto">
        <div className="text-center mb-12">
          <span className="eyebrow mb-4 inline-flex">
            {personalised ? `Top picks for ${industryLabel(segment!.industry)}` : '11 AI services'}
          </span>
          <h2 className="font-display font-extrabold text-3xl md:text-5xl leading-tight mb-4">
            From <span className="text-grad">manual chaos</span> to self-running systems
          </h2>
          <p className="text-muted text-lg max-w-[640px] mx-auto">
            Pick the bottleneck. We design, build, and run the automation that fixes it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {services.map(s => (
            <Link
              key={s.slug}
              href={`/services/${s.slug}`}
              className="group p-7 rounded-2xl bg-card border border-border hover:border-cyan hover:-translate-y-1 hover:shadow-glow-sm transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan/8 border border-cyan/25 flex items-center justify-center text-2xl mb-5">
                {s.icon}
              </div>
              <h3 className="font-display font-bold text-lg mb-3 group-hover:text-cyan transition-colors">{s.title}</h3>
              <p className="text-muted text-sm leading-relaxed mb-4">{s.shortDescription}</p>
              <span className="font-display font-bold text-xs text-cyan uppercase tracking-[0.1em]">
                {s.planMatch} tier · learn more →
              </span>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-8 py-4 border border-border rounded-lg font-display font-bold text-sm text-text hover:border-cyan hover:text-cyan transition-colors"
          >
            View all 11 services →
          </Link>
        </div>
      </div>
    </section>
  );
}
