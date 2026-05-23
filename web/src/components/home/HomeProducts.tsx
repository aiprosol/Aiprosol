import Link from 'next/link';
import { getProducts } from '@/lib/content';

// Show the 6 most "anchor" products: top bundle, top playbook, top toolkit, etc.
const FEATURED_SLUGS = [
  'the-complete-vault',
  'lead-generation-automation-playbook',
  'ai-workflow-architecture-masterclass',
  'business-process-audit-checklist',
  'workflow-automation-playbook',
  'enterprise-ai-readiness-assessment-kit',
];

export function HomeProducts() {
  const all = getProducts();
  const featured = FEATURED_SLUGS
    .map(slug => all.find(p => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <section className="px-6 md:px-12 py-20 bg-bg-deep">
      <div className="max-w-[1440px] mx-auto">
        <div className="text-center mb-12">
          <span className="eyebrow mb-4 inline-flex">19 self-serve products · $17 – $997</span>
          <h2 className="font-display font-extrabold text-3xl md:text-5xl leading-tight mb-4">
            Toolkits that <span className="text-grad">pay for themselves</span>
          </h2>
          <p className="text-muted text-lg max-w-[640px] mx-auto">
            Instant download. Implement in a weekend. Most clients see ROI inside the first week.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {featured.map(p => (
            <Link
              key={p.slug}
              href={`/products/${p.slug}`}
              className="group flex flex-col p-6 rounded-2xl bg-card border border-border hover:border-cyan hover:-translate-y-1 hover:shadow-glow-sm transition-all duration-300"
            >
              <div className="aspect-[16/9] rounded-lg overflow-hidden border border-border mb-5 bg-bg-deep">
                <img
                  src={`/api/og/product/${p.slug}`}
                  alt={p.name}
                  loading="lazy"
                  width={640}
                  height={360}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <span className="inline-block w-fit px-2.5 py-0.5 rounded-full bg-cyan/8 text-cyan text-[10px] font-bold uppercase tracking-[0.1em] font-display mb-3">
                {p.category}
              </span>
              <h3 className="font-display font-bold text-base leading-snug mb-2 min-h-[42px] group-hover:text-cyan transition-colors">
                {p.name}
              </h3>
              <p className="text-muted text-sm leading-relaxed flex-1 mb-4 line-clamp-2">{p.shortDescription}</p>
              <div className="flex justify-between items-center pt-3 border-t border-border/50">
                <span className="font-display font-extrabold text-2xl text-grad">${p.price}</span>
                <span className="font-display font-bold text-xs text-cyan uppercase tracking-[0.1em]">
                  Buy now →
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/digital-products"
            className="inline-flex items-center gap-2 px-8 py-4 border border-border rounded-lg font-display font-bold text-sm text-text hover:border-cyan hover:text-cyan transition-colors"
          >
            Browse all 19 products →
          </Link>
        </div>
      </div>
    </section>
  );
}
