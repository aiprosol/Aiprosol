// ─────────────────────────────────────────────────────────────────────────
// /authors/[slug] — Author archive page
// Aggregates every blog post by a single author under one URL. Strengthens
// the per-author entity (Srijan or Arora) and gives both Google and LLMs a
// canonical surface for "Srijan Paudel's writing" / "Arora's writing".
// ─────────────────────────────────────────────────────────────────────────

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AUTHOR_SLUGS, getAuthor, postsByAuthor } from '@/lib/authors';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return AUTHOR_SLUGS.map((slug) => ({ slug }));
}

type Params = { slug: string };

const fmtDate = (d?: string) => {
  if (!d) return '';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '';
  return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

export default async function AuthorPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const author = getAuthor(slug);
  if (!author) notFound();

  const posts = postsByAuthor(author.slug);

  return (
    <div className="au-page">
      <header className="au-hero">
        <div className="au-eyebrow">{author.type === 'Person' ? 'Author · Human' : 'Author · AI Agent'}</div>
        <div className="au-head">
          <div className="au-avatar">{author.name.charAt(0)}</div>
          <div className="au-head-text">
            <h1 className="au-h1">{author.displayName}</h1>
            <div className="au-role">{author.role} · Aiprosol</div>
          </div>
        </div>
        <p className="au-bio">{author.longBio}</p>

        <div className="au-links">
          <Link href={author.homepage} className="au-link-primary">
            {author.type === 'Person' ? 'Founder page' : 'Agent activity'} →
          </Link>
          {author.externalLinks.map((l) => (
            <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="au-link">
              {l.label} ↗
            </a>
          ))}
        </div>
      </header>

      <section className="au-section">
        <h2 className="au-h2">
          {posts.length === 0
            ? `No posts by ${author.displayName} yet`
            : `${posts.length} ${posts.length === 1 ? 'essay' : 'essays'} by ${author.displayName}`}
        </h2>

        {posts.length > 0 && (
          <div className="au-posts">
            {posts.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="au-post">
                {p.category && <span className="au-cat">{p.category}</span>}
                <h3 className="au-post-title">{p.title}</h3>
                {p.excerpt && <p className="au-excerpt">{p.excerpt}</p>}
                <div className="au-meta">
                  {p.publishedDate && <span>{fmtDate(p.publishedDate)}</span>}
                  {p.readTime && <span>· {p.readTime} min read</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Styles />
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      .au-page { background: #0A0613; color: #E5E7EB; min-height: 100vh; padding: 120px 24px 80px; font-family: 'Inter', system-ui, sans-serif; }
      @media (max-width: 640px) { .au-page { padding: 100px 16px 60px; } }
      .au-hero { max-width: 880px; margin: 0 auto 56px; }
      .au-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(139, 92, 246, 0.08); border: 1px solid rgba(139, 92, 246, 0.25); border-radius: 999px; color: #C084FC; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 16px; }
      .au-head { display: flex; align-items: center; gap: 20px; margin-bottom: 24px; }
      .au-avatar { width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 32px; flex-shrink: 0; }
      .au-head-text { flex: 1; min-width: 0; }
      .au-h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(28px, 5vw, 44px); line-height: 1.1; letter-spacing: -0.015em; margin-bottom: 6px; }
      .au-role { color: #9CA3B5; font-size: 14px; }
      .au-bio { font-size: 16px; line-height: 1.7; color: #9CA3B5; margin-bottom: 24px; max-width: 720px; }
      .au-links { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
      .au-link-primary { display: inline-block; padding: 10px 18px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; text-decoration: none; }
      .au-link { display: inline-block; padding: 10px 16px; background: transparent; border: 1px solid #2A1F3D; color: #E5E7EB; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 600; font-size: 13px; text-decoration: none; transition: border-color 0.2s; }
      .au-link:hover { border-color: #8B5CF6; color: #C084FC; }
      .au-section { max-width: 880px; margin: 0 auto; }
      .au-h2 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 22px; margin-bottom: 24px; color: #C084FC; }
      .au-posts { display: flex; flex-direction: column; gap: 12px; }
      .au-post { display: block; padding: 24px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 14px; text-decoration: none; color: #E5E7EB; transition: all 0.2s; }
      .au-post:hover { border-color: #8B5CF6; transform: translateY(-1px); }
      .au-cat { display: inline-block; padding: 3px 10px; background: rgba(139, 92, 246, 0.08); color: #C084FC; border-radius: 999px; font-family: 'Space Grotesk', sans-serif; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px; }
      .au-post-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 19px; line-height: 1.3; margin-bottom: 10px; }
      .au-excerpt { color: #9CA3B5; font-size: 14px; line-height: 1.6; margin-bottom: 12px; }
      .au-meta { color: #6B7280; font-size: 12px; display: flex; gap: 6px; }
    `}</style>
  );
}
