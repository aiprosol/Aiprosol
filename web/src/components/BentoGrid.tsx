import Link from 'next/link';

// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · BENTO GRID
// Below-hero teaser linking to ROI · Services · Products · Cases · Pricing.
// Asymmetric 5-card layout. Server Component (no client interactivity).
// ─────────────────────────────────────────────────────────────────────────

interface Card {
  href: string;
  eyebrow: string;
  title: string;
  desc?: string;
  link: string;
  span: string; // tailwind classes for grid span
}

const CARDS: Card[] = [
  {
    href: '/roi-audit',
    eyebrow: '▸ Free · 60 sec',
    title: 'Get your ROI number before you commit a dollar',
    desc: 'Personalised report. Plan + product recs based on your stage.',
    link: 'Run the audit →',
    span: 'lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3',
  },
  {
    href: '/services',
    eyebrow: '▸ 11 services',
    title: 'From manual chaos to self-running systems',
    link: 'Explore →',
    span: '',
  },
  {
    href: '/digital-products',
    eyebrow: '▸ $17 – $997',
    title: '19 self-serve toolkits',
    link: 'Browse →',
    span: '',
  },
  {
    href: '/case-studies',
    eyebrow: '▸ Proof',
    title: 'The numbers, across 7 industries',
    link: 'Read cases →',
    span: '',
  },
  {
    href: '/pricing',
    eyebrow: '▸ 3 plans · USD',
    title: "Done-for-you when you're ready",
    link: 'See pricing →',
    span: '',
  },
];

export function BentoGrid() {
  return (
    <section className="px-6 md:px-12 py-20">
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:auto-rows-[220px] gap-4">
        {CARDS.map((card, i) => (
          <Link
            key={card.href}
            href={card.href}
            className={`group relative p-7 rounded-2xl bg-card border border-border overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-cyan hover:shadow-glow-md flex flex-col justify-between ${card.span} ${
              i === 0
                ? 'border-cyan shadow-glow-sm bg-gradient-to-br from-card to-card-up'
                : ''
            }`}
          >
            {/* Hover glow */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 30% 30%, rgba(139, 92, 246,0.06), transparent 60%)',
              }}
            />

            <div className="relative">
              <div className="font-display font-bold text-[11px] text-cyan tracking-[0.12em] uppercase mb-4">
                {card.eyebrow}
              </div>
              <h3
                className={`font-display font-bold leading-tight mb-3 ${
                  i === 0 ? 'text-[clamp(28px,3vw,38px)]' : 'text-xl'
                }`}
              >
                {card.title}
              </h3>
              {card.desc && (
                <p className="text-muted text-sm leading-relaxed">
                  {card.desc}
                </p>
              )}
            </div>

            <span className="relative font-display font-bold text-xs text-cyan uppercase tracking-[0.1em] mt-4">
              {card.link}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
