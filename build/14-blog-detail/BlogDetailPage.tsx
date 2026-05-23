// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · BLOG DETAIL · /blog/:slug
// Phase 3.4 · cover hero · reading-progress bar · sticky table of contents
// auto-built from h2/h3s · related posts · ROI Audit CTA at bottom.
// ─────────────────────────────────────────────────────────────────────────

import { items } from '@wix/data';
import { useWixModules } from '@wix/sdk-react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface Post {
  _id: string;
  slug?: string;
  title?: string;
  excerpt?: string;
  shortDescription?: string;
  description?: string;
  body?: string;
  content?: string;
  bodyHtml?: string;
  coverImage?: string | { stringValue: string };
  author?: string;
  authorName?: string;
  category?: string;
  publishedDate?: string;
  publishDate?: string;
  readTime?: number;
}

const unwrapImage = (img: any): string => {
  if (!img) return '';
  if (typeof img === 'string') return img;
  if (typeof img === 'object' && img.stringValue) return img.stringValue;
  return '';
};
const get = (p: Post, ...keys: (keyof Post)[]) => {
  for (const k of keys) if (p[k] != null && p[k] !== '') return p[k] as any;
  return undefined;
};
const fmtDate = (d?: string) => {
  if (!d) return '';
  try {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return '';
    return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return ''; }
};
const getSlugFromUrl = () => {
  if (typeof window === 'undefined') return '';
  const parts = window.location.pathname.split('/').filter(Boolean);
  return parts[parts.length - 1] || '';
};
const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

interface TOCItem { id: string; text: string; level: number; }

export function BlogDetailPage() {
  const { query } = useWixModules(items);
  const [slug] = useState(getSlugFromUrl());
  const [post, setPost] = useState<Post | null>(null);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState<string>('');
  const articleRef = useRef<HTMLDivElement>(null);

  // Load post + all (for related)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await query('blog').limit(100).find({ suppressAuth: true });
        const all = (res.items as Post[]) || [];
        const found = all.find(p => p.slug === slug || p._id === slug);
        if (mounted) {
          setAllPosts(all);
          setPost(found || null);
        }
      } catch (err) {
        console.error('Failed to load blog post', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [slug]);

  // Reading progress
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

  // Build TOC from rendered article (after content is in DOM)
  const [toc, setToc] = useState<TOCItem[]>([]);
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

      // Active heading observer
      const obs = new IntersectionObserver(
        entries => {
          for (const e of entries) {
            if (e.isIntersecting) setActiveId(e.target.id);
          }
        },
        { rootMargin: '-30% 0px -60% 0px' },
      );
      heads.forEach(h => obs.observe(h));
      return () => obs.disconnect();
    });
  }, [post]);

  const related = useMemo(() => {
    if (!post) return [];
    return allPosts
      .filter(p => p._id !== post._id && (p.category === post.category || allPosts.length < 6))
      .slice(0, 3);
  }, [post, allPosts]);

  if (loading && !post) {
    return <div className="bd-page"><div className="bd-loading"><span className="bd-spin" /> Loading article…</div><Styles /></div>;
  }
  if (!post) {
    return (
      <div className="bd-page">
        <div className="bd-empty">
          <h2>That article isn't on file.</h2>
          <p>Try the index — there are 19 to choose from.</p>
          <a href="/blog" className="bd-btn">View all articles →</a>
        </div>
        <Styles />
      </div>
    );
  }

  const cover = unwrapImage(post.coverImage);
  const author = post.author || post.authorName || 'Arora';
  const date = fmtDate(post.publishedDate || post.publishDate);
  const body = (get(post, 'bodyHtml', 'body', 'content') as string) || '';
  const isHtml = /<[a-z][\s\S]*>/i.test(body);

  return (
    <div className="bd-page">
      <div className="bd-progress" style={{ width: `${progress}%` }} />

      <div className="bd-crumb">
        <a href="/blog">← All articles</a>
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
          {date && <span>·</span>}
          {date && <span>{date}</span>}
          {post.readTime && <><span>·</span><span>{post.readTime} min read</span></>}
        </div>
      </header>

      {cover && (
        <div className="bd-cover">
          <img src={cover} alt={post.title} />
          <div className="bd-cover-glow" />
        </div>
      )}

      <div className="bd-shell">
        <aside className="bd-toc">
          <div className="bd-toc-head">On this page</div>
          {toc.length === 0 && <div className="bd-toc-empty">No sections yet.</div>}
          {toc.map(item => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`bd-toc-link ${item.level === 3 ? 'lvl-3' : ''} ${activeId === item.id ? 'is-active' : ''}`}
            >
              {item.text}
            </a>
          ))}
          <div className="bd-toc-cta">
            <a href="/roi-audit" className="bd-toc-cta-btn">Get Free ROI Audit →</a>
          </div>
        </aside>

        <article ref={articleRef} className="bd-article">
          {isHtml ? (
            <div dangerouslySetInnerHTML={{ __html: body }} />
          ) : (
            body.split(/\n\n+/).map((para, i) => {
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
              return <p key={i}>{trimmed}</p>;
            })
          )}
        </article>
      </div>

      <section className="bd-cta-bottom">
        <h2>Want this in your business?</h2>
        <p>The free 60-second ROI Audit gives you a personalised number — and the right next step.</p>
        <a href="/roi-audit" className="bd-cta-btn">Get Your Free ROI Audit →</a>
      </section>

      {related.length > 0 && (
        <section className="bd-related">
          <h2>Read next</h2>
          <div className="bd-related-grid">
            {related.map(p => {
              const img = unwrapImage(p.coverImage);
              return (
                <a key={p._id} href={`/blog/${p.slug || p._id}`} className="bd-related-card">
                  <div className="bd-related-img">
                    {img ? <img src={img} alt={p.title} loading="lazy" /> : <div className="bd-related-emoji">▾</div>}
                  </div>
                  <div className="bd-related-body">
                    {p.category && <span className="bd-related-cat">{p.category}</span>}
                    <h3>{p.title}</h3>
                  </div>
                </a>
              );
            })}
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
      .bd-page { background: #0A1628; color: #D4E8F7; min-height: 100vh; padding: 100px 24px 80px; font-family: 'DM Sans', system-ui, sans-serif; }
      @media (max-width: 640px) { .bd-page { padding: 80px 16px 60px; } }

      .bd-progress { position: fixed; top: 0; left: 0; height: 3px; background: linear-gradient(90deg, #00D4FF, #00FFE5); z-index: 100; transition: width 0.1s linear; box-shadow: 0 0 8px rgba(0,212,255,0.6); }

      .bd-loading, .bd-empty { max-width: 600px; margin: 80px auto; text-align: center; padding: 48px; background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 18px; }
      .bd-empty h2 { font-family: 'Syne', sans-serif; font-size: 24px; margin-bottom: 12px; }
      .bd-empty p { color: #8899AA; margin-bottom: 20px; }
      .bd-spin { display: inline-block; width: 14px; height: 14px; border: 2px solid #1E3A5F; border-top-color: #00D4FF; border-radius: 50%; animation: bd-spin 0.8s linear infinite; vertical-align: middle; margin-right: 8px; }
      @keyframes bd-spin { to { transform: rotate(360deg); } }
      .bd-btn { padding: 12px 24px; background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628; border-radius: 10px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; text-decoration: none; }

      .bd-crumb { max-width: 880px; margin: 0 auto 24px; font-size: 13px; color: #8899AA; }
      .bd-crumb a { color: #00D4FF; }

      .bd-hero { max-width: 780px; margin: 0 auto 32px; }
      .bd-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(0,212,255,0.08); border: 1px solid rgba(0,212,255,0.25); border-radius: 999px; color: #00D4FF; font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 16px; }
      .bd-h1 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(32px, 5vw, 52px); line-height: 1.1; margin-bottom: 20px; }
      .bd-meta { display: flex; gap: 8px; align-items: center; font-size: 13px; color: #8899AA; }
      .bd-author { display: inline-flex; align-items: center; gap: 8px; }
      .bd-avatar { width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 11px; }

      .bd-cover { max-width: 1080px; margin: 0 auto 56px; aspect-ratio: 21/9; border-radius: 20px; overflow: hidden; position: relative; border: 1px solid #1E3A5F; }
      .bd-cover img { width: 100%; height: 100%; object-fit: cover; }
      .bd-cover-glow { position: absolute; inset: 0; background: radial-gradient(circle at 70% 30%, rgba(0,212,255,0.12), transparent 60%); pointer-events: none; }

      .bd-shell { max-width: 1080px; margin: 0 auto 64px; display: grid; grid-template-columns: 240px 1fr; gap: 48px; align-items: start; }
      @media (max-width: 1024px) { .bd-shell { grid-template-columns: 1fr; } .bd-toc { display: none; } }

      .bd-toc { position: sticky; top: 100px; max-height: calc(100vh - 120px); overflow-y: auto; padding: 20px; background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 14px; }
      .bd-toc-head { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; color: #00D4FF; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #1E3A5F; }
      .bd-toc-empty { font-size: 12px; color: #8899AA; }
      .bd-toc-link { display: block; padding: 6px 10px; margin: 2px -10px; font-size: 13px; color: #8899AA; border-radius: 6px; line-height: 1.4; transition: all 0.2s; }
      .bd-toc-link:hover { color: #D4E8F7; background: rgba(0,212,255,0.04); }
      .bd-toc-link.is-active { color: #00D4FF; background: rgba(0,212,255,0.08); border-left: 2px solid #00D4FF; padding-left: 8px; }
      .bd-toc-link.lvl-3 { padding-left: 22px; font-size: 12px; }
      .bd-toc-link.lvl-3.is-active { padding-left: 20px; }
      .bd-toc-cta { margin-top: 16px; padding-top: 16px; border-top: 1px solid #1E3A5F; }
      .bd-toc-cta-btn { display: block; padding: 10px; text-align: center; background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628; border-radius: 8px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 11px; text-decoration: none; }

      /* Article body */
      .bd-article { font-size: 17px; line-height: 1.8; color: #D4E8F7; }
      .bd-article p { margin-bottom: 1.4em; }
      .bd-article h2 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; line-height: 1.2; margin: 2em 0 0.6em; padding-top: 0.4em; }
      .bd-article h3 { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 21px; line-height: 1.3; margin: 1.6em 0 0.5em; color: #00D4FF; }
      .bd-article ul, .bd-article ol { margin: 0 0 1.4em 1.4em; }
      .bd-article li { margin-bottom: 0.5em; }
      .bd-article a { color: #00D4FF; border-bottom: 1px solid rgba(0,212,255,0.4); }
      .bd-article a:hover { border-bottom-color: #00D4FF; }
      .bd-article blockquote { margin: 1.4em 0; padding: 18px 24px; background: rgba(0,212,255,0.04); border-left: 3px solid #00D4FF; border-radius: 0 10px 10px 0; font-style: italic; color: #D4E8F7; }
      .bd-article code { background: #0D1F3C; border: 1px solid #1E3A5F; padding: 2px 6px; border-radius: 4px; font-size: 14px; font-family: 'ui-monospace', monospace; color: #00FFE5; }
      .bd-article pre { background: #050E1A; border: 1px solid #1E3A5F; border-radius: 10px; padding: 18px; overflow-x: auto; margin: 1.4em 0; }
      .bd-article pre code { background: transparent; border: none; padding: 0; color: #D4E8F7; }
      .bd-article img { max-width: 100%; border-radius: 12px; margin: 1.4em 0; }
      .bd-article hr { border: none; border-top: 1px solid #1E3A5F; margin: 2em 0; }

      .bd-cta-bottom { max-width: 720px; margin: 0 auto 64px; text-align: center; padding: 48px 32px; background: rgba(0,212,255,0.04); border: 1px solid rgba(0,212,255,0.25); border-radius: 24px; }
      .bd-cta-bottom h2 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; margin-bottom: 8px; }
      .bd-cta-bottom p { color: #8899AA; font-size: 15px; margin-bottom: 24px; }
      .bd-cta-btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628 !important; border-radius: 10px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; text-decoration: none; box-shadow: 0 0 24px rgba(0,212,255,0.35); }

      .bd-related { max-width: 1080px; margin: 0 auto; }
      .bd-related h2 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; margin-bottom: 24px; text-align: center; }
      .bd-related-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
      @media (max-width: 800px) { .bd-related-grid { grid-template-columns: 1fr; } }
      .bd-related-card { display: block; background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 14px; overflow: hidden; text-decoration: none; color: #D4E8F7; transition: all 0.3s; }
      .bd-related-card:hover { transform: translateY(-3px); border-color: #00D4FF; }
      .bd-related-img { aspect-ratio: 16/9; background: linear-gradient(135deg, #0A1628, #14284D); overflow: hidden; }
      .bd-related-img img { width: 100%; height: 100%; object-fit: cover; }
      .bd-related-emoji { display: flex; align-items: center; justify-content: center; height: 100%; font-size: 32px; opacity: 0.4; }
      .bd-related-body { padding: 18px; }
      .bd-related-cat { display: inline-block; padding: 3px 9px; background: rgba(0,212,255,0.08); color: #00D4FF; border-radius: 999px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
      .bd-related-card h3 { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; line-height: 1.3; }
    `}</style>
  );
}

export default BlogDetailPage;
