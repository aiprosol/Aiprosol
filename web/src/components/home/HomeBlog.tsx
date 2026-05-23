import Link from 'next/link';
import { getBlogPosts } from '@/lib/content';

export function HomeBlog() {
  const posts = getBlogPosts().slice(0, 3);
  return (
    <section className="px-6 md:px-12 py-20 bg-bg-deep">
      <div className="max-w-[1440px] mx-auto">
        <div className="text-center mb-12">
          <span className="eyebrow mb-4 inline-flex">Field notes</span>
          <h2 className="font-display font-extrabold text-3xl md:text-5xl leading-tight mb-4">
            From the <span className="text-grad">automation frontier</span>
          </h2>
          <p className="text-muted text-lg max-w-[640px] mx-auto">
            Tactical playbooks. Real numbers. Things we&apos;ve shipped or learned the hard way.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {posts.map(p => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden hover:border-cyan hover:-translate-y-1 hover:shadow-glow-sm transition-all duration-300"
            >
              <div className="aspect-[16/9] overflow-hidden bg-bg-deep">
                <img
                  src={`/api/og/blog/${p.slug}`}
                  alt={p.title || 'Article'}
                  loading="lazy"
                  width={640}
                  height={360}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6 flex flex-col flex-1">
                {p.category && (
                  <span className="inline-block w-fit px-2.5 py-0.5 rounded-full bg-cyan/8 text-cyan text-[10px] font-bold uppercase tracking-[0.1em] mb-3 font-display">
                    {p.category}
                  </span>
                )}
                <h3 className="font-display font-bold text-lg leading-snug mb-3 group-hover:text-cyan transition-colors">
                  {p.title}
                </h3>
                <p className="text-muted text-sm leading-relaxed flex-1 line-clamp-3">{p.excerpt}</p>
                <div className="mt-4 pt-3 border-t border-border/60 flex items-center gap-2 text-xs text-muted">
                  <span>{p.author || 'Arora'}</span>
                  {p.readTime && <span>· {p.readTime} min read</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-8 py-4 border border-border rounded-lg font-display font-bold text-sm text-text hover:border-cyan hover:text-cyan transition-colors"
          >
            Read more articles →
          </Link>
        </div>
      </div>
    </section>
  );
}
