'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getBlogPostBySlug, getBlogPosts } from '@/lib/content';

const fmtDate = (d?: string) => {
  if (!d) return '';
  try {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return '';
    return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return ''; }
};

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

interface TOCItem { id: string; text: string; level: number; }

export default function BlogDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const post = slug ? getBlogPostBySlug(slug) : undefined;
  const allPosts = getBlogPosts();
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState<string>('');
  const [toc, setToc] = useState<TOCItem[]>([]);
  const articleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const article = articleRef.current;
      if (!article) return;
      const top = article.offsetTop;
      const h = article.offsetHeight;
      const sy = window.scrollY;
      const vh = window.innerHeight;
      const start = top - vh * 0.3;
      const end = top + h - vh * 0.7;
      const pct = Math.max(0, Math.min(100, ((sy - start) / (end - start)) * 100));
      setProgress(pct);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [post]);

  useEffect(() => {
    if (!post) return;
    requestAnimationFrame(() => {
      const article = articleRef.current;
      if (!article) return;
      const heads = Array.from(article.querySelectorAll('h2, h3')) as HTMLElement[];
      const next: TOCItem[] = heads.map(h => {
        const text = h.textContent || '';
        const id = h.id || slugify(text) || '';
        if (id && !h.id) h.id = id;
        return { id, text, level: h.tagName === 'H3' ? 3 : 2 };
      });
      setToc(next.filter(i => i.id && i.text));
      const obs = new IntersectionObserver(
        entries => { for (const e of entries) if (e.isIntersecting) setActiveId(e.target.id); },
        { rootMargin: '-30% 0px -60% 0px' },
      );
      heads.forEach(h => obs.observe(h));
      return () => obs.disconnect();
    });
  }, [post]);

  const related = useMemo(() => {
    if (!post) return [];
    return allPosts
      .filter(p => p.slug !== post.slug && (p.category === post.category || allPosts.length < 6))
      .slice(0, 3);
  }, [post, allPosts]);

  if (!post) {
    return (
      <div className="bd-page">
        <div className="bd-empty">
          <h2>That article isn&apos;t on file.</h2>
          <p>Try the index — there&apos;s more there.</p>
          <Link href="/blog" className="bd-btn">View all articles →</Link>
        </div>
        <Styles />
      </div>
    );
  }

  const author = post.author || 'Arora';
  const date = fmtDate(post.publishedDate);
  const body = post.body || '';

  // BlogPosting Schema.org JSON-LD lives in blog/[slug]/layout.tsx (with
  // BlogPosting + mainEntityOfPage + BreadcrumbList + author cross-ref).
  // Do not duplicate it here.

  return (
    <div className="bd-page">
      <div className="bd-progress" style={{ width: `${progress}%` }} />
      <div className="bd-crumb">
        <Link href="/blog">← All articles</Link>
        {post.category && <span> · {post.category}</span>}
      </div>

      <header className="bd-hero">
        {post.category && <div className="bd-eyebrow">{post.category}</div>}
        <h1 className="bd-h1">{post.title}</h1>
        <div className="bd-meta">
          <span className="bd-author">
            <span className="bd-avatar">{author.charAt(0)}</span>
            <span>{author}</span>
          </span>
          {date && <><span>·</span><span>{date}</span></>}
          {post.readTime && <><span>·</span><span>{post.readTime} min read</span></>}
        </div>
      </header>

      <div className="bd-cover">
        <img src={`/api/og/blog/${slug}`} alt={post.title || 'Article'} loading="eager" />
      </div>

      <div className="bd-shell">
        <aside className="bd-toc">
          <div className="bd-toc-head">On this page</div>
          {toc.length === 0 && <div className="bd-toc-empty">No sections yet.</div>}
          {toc.map(item => (
            <a key={item.id} href={`#${item.id}`} className={`bd-toc-link ${item.level === 3 ? 'lvl-3' : ''} ${activeId === item.id ? 'is-active' : ''}`}>
              {item.text}
            </a>
          ))}
          <div className="bd-toc-cta">
            <Link href="/roi-audit" className="bd-toc-cta-btn">Get Free ROI Audit →</Link>
          </div>
        </aside>

        <article ref={articleRef} className="bd-article">
          {body.split(/\n\n+/).map((para, i) => {
            const trimmed = para.trim();
            if (/^##\s/.test(trimmed)) {
              const text = trimmed.replace(/^##\s+/, '');
              return <h2 key={i} id={slugify(text)}>{text}</h2>;
            }
            if (/^###\s/.test(trimmed)) {
              const text = trimmed.replace(/^###\s+/, '');
              return <h3 key={i} id={slugify(text)}>{text}</h3>;
            }
            if (/^[-*]\s/.test(trimmed)) {
              const items = trimmed.split(/\n/).map(l => l.replace(/^[-*]\s+/, ''));
              return <ul key={i}>{items.map((li, j) => <li key={j}>{li}</li>)}</ul>;
            }
            if (/^```/.test(trimmed)) {
              const code = trimmed.replace(/^```\w*\n?/, '').replace(/```$/, '');
              return <pre key={i}><code>{code}</code></pre>;
            }
            return <p key={i} dangerouslySetInnerHTML={{ __html: trimmed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>') }} />;
          })}
        </article>
      </div>

      <section className="bd-cta-bottom">
        <h2>Want this in your business?</h2>
        <p>The free 60-second ROI Audit gives you a personalised number — and the right next step.</p>
        <Link href="/roi-audit" className="bd-cta-btn">Get Your Free ROI Audit →</Link>
      </section>

      {related.length > 0 && (
        <section className="bd-related">
          <h2>Read next</h2>
          <div className="bd-related-grid">
            {related.map(p => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="bd-related-card">
                <div className="bd-related-img"><div className="bd-related-emoji">▾</div></div>
                <div className="bd-related-body">
                  {p.category && <span className="bd-related-cat">{p.category}</span>}
                  <h3>{p.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Styles />
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      .bd-page { background: #0A0613; color: #E5E7EB; min-height: 100vh; padding: 140px 24px 80px; font-family: 'Inter', system-ui, sans-serif; }
      @media (max-width: 640px) { .bd-page { padding: 120px 16px 60px; } }
      .bd-progress { position: fixed; top: 0; left: 0; height: 3px; background: linear-gradient(90deg, #8B5CF6, #C084FC); z-index: 100; transition: width 0.1s linear; box-shadow: 0 0 8px rgba(139, 92, 246,0.6); }
      .bd-empty { max-width: 600px; margin: 80px auto; text-align: center; padding: 48px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 18px; }
      .bd-empty h2 { font-family: 'Space Grotesk', sans-serif; font-size: 24px; margin-bottom: 12px; }
      .bd-btn { padding: 12px 24px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; text-decoration: none; }
      .bd-crumb { max-width: 880px; margin: 0 auto 24px; font-size: 13px; color: #9CA3B5; }
      .bd-crumb a { color: #8B5CF6; }
      .bd-hero { max-width: 780px; margin: 0 auto 56px; }
      .bd-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(139, 92, 246,0.08); border: 1px solid rgba(139, 92, 246,0.25); border-radius: 999px; color: #8B5CF6; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 16px; }
      .bd-h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(32px, 5vw, 52px); line-height: 1.1; margin-bottom: 20px; }
      .bd-meta { display: flex; gap: 8px; align-items: center; font-size: 13px; color: #9CA3B5; flex-wrap: wrap; }
      .bd-cover { max-width: 1080px; margin: 0 auto 56px; aspect-ratio: 21/9; background: #0A0613; border: 1px solid #2A1F3D; border-radius: 20px; overflow: hidden; }
      .bd-cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .bd-author { display: inline-flex; align-items: center; gap: 8px; }
      .bd-avatar { width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 11px; }
      .bd-shell { max-width: 1080px; margin: 0 auto 64px; display: grid; grid-template-columns: 240px 1fr; gap: 48px; align-items: start; }
      @media (max-width: 1024px) { .bd-shell { grid-template-columns: 1fr; } .bd-toc { display: none; } }
      .bd-toc { position: sticky; top: 100px; max-height: calc(100vh - 120px); overflow-y: auto; padding: 20px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 14px; }
      .bd-toc-head { font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; color: #8B5CF6; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #2A1F3D; }
      .bd-toc-empty { font-size: 12px; color: #9CA3B5; }
      .bd-toc-link { display: block; padding: 6px 10px; margin: 2px -10px; font-size: 13px; color: #9CA3B5; border-radius: 6px; line-height: 1.4; transition: all 0.2s; }
      .bd-toc-link:hover { color: #E5E7EB; background: rgba(139, 92, 246,0.04); }
      .bd-toc-link.is-active { color: #8B5CF6; background: rgba(139, 92, 246,0.08); border-left: 2px solid #8B5CF6; padding-left: 8px; }
      .bd-toc-link.lvl-3 { padding-left: 22px; font-size: 12px; }
      .bd-toc-link.lvl-3.is-active { padding-left: 20px; }
      .bd-toc-cta { margin-top: 16px; padding-top: 16px; border-top: 1px solid #2A1F3D; }
      .bd-toc-cta-btn { display: block; padding: 10px; text-align: center; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border-radius: 8px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 11px; text-decoration: none; }
      .bd-article { font-size: 17px; line-height: 1.8; color: #E5E7EB; }
      .bd-article p { margin-bottom: 1.4em; }
      .bd-article h2 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 28px; line-height: 1.2; margin: 2em 0 0.6em; padding-top: 0.4em; }
      .bd-article h3 { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 21px; line-height: 1.3; margin: 1.6em 0 0.5em; color: #8B5CF6; }
      .bd-article ul, .bd-article ol { margin: 0 0 1.4em 1.4em; }
      .bd-article li { margin-bottom: 0.5em; }
      .bd-article a { color: #8B5CF6; border-bottom: 1px solid rgba(139, 92, 246,0.4); }
      .bd-article a:hover { border-bottom-color: #8B5CF6; }
      .bd-article code { background: #13101F; border: 1px solid #2A1F3D; padding: 2px 6px; border-radius: 4px; font-size: 14px; font-family: ui-monospace, monospace; color: #C084FC; }
      .bd-article pre { background: #050310; border: 1px solid #2A1F3D; border-radius: 10px; padding: 18px; overflow-x: auto; margin: 1.4em 0; }
      .bd-article pre code { background: transparent; border: none; padding: 0; color: #E5E7EB; }
      .bd-cta-bottom { max-width: 720px; margin: 0 auto 64px; text-align: center; padding: 48px 32px; background: rgba(139, 92, 246,0.04); border: 1px solid rgba(139, 92, 246,0.25); border-radius: 24px; }
      .bd-cta-bottom h2 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 28px; margin-bottom: 8px; }
      .bd-cta-bottom p { color: #9CA3B5; font-size: 15px; margin-bottom: 24px; }
      .bd-cta-btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613 !important; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 14px; text-decoration: none; box-shadow: 0 0 24px rgba(139, 92, 246,0.35); }
      .bd-related { max-width: 1080px; margin: 0 auto; }
      .bd-related h2 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 28px; margin-bottom: 24px; text-align: center; }
      .bd-related-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
      @media (max-width: 800px) { .bd-related-grid { grid-template-columns: 1fr; } }
      .bd-related-card { display: block; background: #13101F; border: 1px solid #2A1F3D; border-radius: 14px; overflow: hidden; text-decoration: none; color: #E5E7EB; transition: all 0.3s; }
      .bd-related-card:hover { transform: translateY(-3px); border-color: #8B5CF6; }
      .bd-related-img { aspect-ratio: 16/9; background: linear-gradient(135deg, #0A0613, #1B1530); display: flex; align-items: center; justify-content: center; }
      .bd-related-emoji { font-size: 32px; opacity: 0.4; }
      .bd-related-body { padding: 18px; }
      .bd-related-cat { display: inline-block; padding: 3px 9px; background: rgba(139, 92, 246,0.08); color: #8B5CF6; border-radius: 999px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
      .bd-related-card h3 { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 15px; line-height: 1.3; }
    `}</style>
  );
}
