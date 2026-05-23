// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · BLOG LIST · /blog
// Phase 3.3 · featured post hero · category filter · search · grid · paged
// Pulls from `blog` CMS, handles the stringValue-wrapped coverImage either
// way (so it renders even before Phase 0.5 fix runs).
// ─────────────────────────────────────────────────────────────────────────

import { items } from '@wix/data';
import { useWixModules } from '@wix/sdk-react';
import { useEffect, useMemo, useState } from 'react';

interface Post {
  _id: string;
  slug?: string;
  title?: string;
  excerpt?: string;
  shortDescription?: string;
  description?: string;
  coverImage?: string | { stringValue: string };
  author?: string;
  authorName?: string;
  category?: string;
  publishedDate?: string;
  publishDate?: string;
  readTime?: number;
  featured?: boolean;
}

const PAGE_SIZE = 9;

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
    return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return ''; }
};

export function BlogListPage() {
  const { query } = useWixModules(items);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await query('blog').limit(100).find({ suppressAuth: true });
        if (mounted) setPosts((res.items as Post[]) || []);
      } catch (err) {
        console.error('Failed to load blog', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>(['All']);
    for (const p of posts) if (p.category) set.add(p.category);
    return Array.from(set);
  }, [posts]);

  const filtered = useMemo(() => {
    let out = posts;
    if (activeCat !== 'All') out = out.filter(p => p.category === activeCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(p =>
        (p.title || '').toLowerCase().includes(q) ||
        (get(p, 'excerpt', 'shortDescription', 'description') as string || '').toLowerCase().includes(q),
      );
    }
    return out;
  }, [posts, activeCat, search]);

  const featured = filtered.find(p => p.featured) || filtered[0];
  const rest = filtered.filter(p => p._id !== featured?._id);

  const pageCount = Math.max(1, Math.ceil(rest.length / PAGE_SIZE));
  const paged = rest.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [activeCat, search]);

  return (
    <div className="bl-page">
      <header className="bl-hero">
        <div className="bl-eyebrow">{posts.length} articles · field notes from the automation frontier</div>
        <h1 className="bl-h1">
          Tactical playbooks, <span className="bl-grad">not theory</span>
        </h1>
        <p className="bl-sub">
          Every post is something we've shipped or learned the hard way. Filtered by what actually moves a number.
        </p>
      </header>

      <div className="bl-controls">
        <div className="bl-tabs">
          {categories.map(c => (
            <button
              key={c}
              className={`bl-tab ${activeCat === c ? 'is-active' : ''}`}
              onClick={() => setActiveCat(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="bl-search">
          <span className="bl-search-icon">⌕</span>
          <input
            type="text"
            placeholder="Search articles…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading && <div className="bl-state"><span className="bl-spin" /> Loading articles…</div>}

      {!loading && filtered.length === 0 && (
        <div className="bl-state">
          <p>No articles match those filters.</p>
          <button className="bl-btn" onClick={() => { setActiveCat('All'); setSearch(''); }}>Show all</button>
        </div>
      )}

      {!loading && featured && (
        <FeaturedCard post={featured} />
      )}

      {!loading && paged.length > 0 && (
        <div className="bl-grid">
          {paged.map(p => <PostCard key={p._id} post={p} />)}
        </div>
      )}

      {pageCount > 1 && (
        <div className="bl-pages">
          <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>← Prev</button>
          <span>Page {page} of {pageCount}</span>
          <button disabled={page === pageCount} onClick={() => setPage(p => Math.min(pageCount, p + 1))}>Next →</button>
        </div>
      )}

      <Styles />
    </div>
  );
}

function FeaturedCard({ post }: { post: Post }) {
  const img = unwrapImage(post.coverImage);
  const slug = post.slug || post._id;
  return (
    <a href={`/blog/${slug}`} className="bl-featured">
      <div className="bl-featured-image">
        {img ? <img src={img} alt={post.title} /> : <div className="bl-featured-emoji">▾</div>}
        <div className="bl-featured-glow" />
      </div>
      <div className="bl-featured-body">
        <div className="bl-featured-meta">
          <span className="bl-featured-tag">Featured</span>
          {post.category && <span className="bl-featured-cat">{post.category}</span>}
        </div>
        <h2>{post.title}</h2>
        <p>{(get(post, 'excerpt', 'shortDescription', 'description') as string) || ''}</p>
        <div className="bl-featured-foot">
          <span>{post.author || post.authorName || 'Arora'}</span>
          <span>· {fmtDate(post.publishedDate || post.publishDate)}</span>
          {post.readTime && <span>· {post.readTime} min read</span>}
          <span className="bl-featured-link">Read →</span>
        </div>
      </div>
    </a>
  );
}

function PostCard({ post }: { post: Post }) {
  const img = unwrapImage(post.coverImage);
  const slug = post.slug || post._id;
  return (
    <a href={`/blog/${slug}`} className="bl-card">
      <div className="bl-card-image">
        {img ? <img src={img} alt={post.title} loading="lazy" /> : <div className="bl-card-emoji">▾</div>}
      </div>
      <div className="bl-card-body">
        {post.category && <span className="bl-card-cat">{post.category}</span>}
        <h3>{post.title}</h3>
        <p>{(get(post, 'excerpt', 'shortDescription', 'description') as string) || ''}</p>
        <div className="bl-card-foot">
          <span>{post.author || post.authorName || 'Arora'}</span>
          {post.readTime && <span>· {post.readTime} min</span>}
        </div>
      </div>
    </a>
  );
}

function Styles() {
  return (
    <style>{`
      .bl-page { background: #0A1628; color: #D4E8F7; min-height: 100vh; padding: 100px 24px 80px; font-family: 'DM Sans', system-ui, sans-serif; }
      @media (max-width: 640px) { .bl-page { padding: 80px 16px 60px; } }

      .bl-hero { max-width: 760px; margin: 0 auto 48px; text-align: center; }
      .bl-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(0,212,255,0.08); border: 1px solid rgba(0,212,255,0.25); border-radius: 999px; color: #00D4FF; font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 16px; }
      .bl-h1 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(32px, 5vw, 52px); line-height: 1.05; margin-bottom: 16px; }
      .bl-grad { background: linear-gradient(135deg, #00D4FF, #00FFE5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .bl-sub { color: #8899AA; font-size: 17px; line-height: 1.6; }

      .bl-controls { max-width: 1080px; margin: 0 auto 32px; display: flex; gap: 16px; align-items: center; flex-wrap: wrap; justify-content: center; }
      .bl-tabs { display: flex; flex-wrap: wrap; gap: 8px; }
      .bl-tab { padding: 7px 14px; background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 999px; color: #8899AA; font-size: 13px; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
      .bl-tab:hover { color: #D4E8F7; border-color: #00D4FF; }
      .bl-tab.is-active { background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628; border-color: transparent; font-weight: 700; }

      .bl-search { position: relative; min-width: 280px; }
      .bl-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #8899AA; pointer-events: none; }
      .bl-search input { width: 100%; padding: 10px 14px 10px 38px; background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 10px; color: #D4E8F7; font-size: 13px; outline: none; transition: border 0.2s; }
      .bl-search input:focus { border-color: #00D4FF; box-shadow: 0 0 0 3px rgba(0,212,255,0.15); }

      .bl-state { max-width: 480px; margin: 60px auto; text-align: center; padding: 32px; background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 14px; color: #8899AA; }
      .bl-spin { display: inline-block; width: 14px; height: 14px; border: 2px solid #1E3A5F; border-top-color: #00D4FF; border-radius: 50%; animation: bl-spin 0.8s linear infinite; vertical-align: middle; margin-right: 8px; }
      @keyframes bl-spin { to { transform: rotate(360deg); } }
      .bl-btn { padding: 10px 20px; background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628; border: none; border-radius: 10px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; cursor: pointer; margin-top: 12px; }

      /* Featured */
      .bl-featured { display: grid; grid-template-columns: 1fr 1fr; gap: 0; max-width: 1080px; margin: 0 auto 32px; background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 20px; overflow: hidden; text-decoration: none; color: #D4E8F7; transition: all 0.3s; }
      .bl-featured:hover { border-color: #00D4FF; box-shadow: 0 0 32px rgba(0,212,255,0.18); }
      @media (max-width: 800px) { .bl-featured { grid-template-columns: 1fr; } }
      .bl-featured-image { position: relative; aspect-ratio: 16/10; background: linear-gradient(135deg, #0A1628, #14284D); overflow: hidden; }
      .bl-featured-image img { width: 100%; height: 100%; object-fit: cover; }
      .bl-featured-emoji { display: flex; align-items: center; justify-content: center; height: 100%; font-size: 64px; opacity: 0.4; }
      .bl-featured-glow { position: absolute; inset: 0; background: radial-gradient(circle at 70% 30%, rgba(0,212,255,0.12), transparent 60%); pointer-events: none; }
      .bl-featured-body { padding: 36px 40px; display: flex; flex-direction: column; justify-content: center; }
      .bl-featured-meta { display: flex; gap: 8px; margin-bottom: 14px; }
      .bl-featured-tag { padding: 4px 10px; background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628; border-radius: 999px; font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }
      .bl-featured-cat { padding: 4px 10px; background: rgba(0,212,255,0.08); color: #00D4FF; border: 1px solid rgba(0,212,255,0.25); border-radius: 999px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }
      .bl-featured-body h2 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(22px, 2.5vw, 30px); line-height: 1.2; margin-bottom: 14px; }
      .bl-featured-body p { color: #8899AA; font-size: 15px; line-height: 1.7; margin-bottom: 20px; }
      .bl-featured-foot { display: flex; gap: 8px; align-items: center; font-size: 12px; color: #8899AA; flex-wrap: wrap; }
      .bl-featured-link { margin-left: auto; color: #00D4FF; font-family: 'Syne', sans-serif; font-weight: 700; }

      /* Grid */
      .bl-grid { max-width: 1080px; margin: 0 auto 40px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
      @media (max-width: 1024px) { .bl-grid { grid-template-columns: repeat(2, 1fr); } }
      @media (max-width: 640px) { .bl-grid { grid-template-columns: 1fr; } }

      .bl-card { background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 14px; overflow: hidden; text-decoration: none; color: #D4E8F7; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column; }
      .bl-card:hover { transform: translateY(-3px); border-color: #00D4FF; box-shadow: 0 0 24px rgba(0,212,255,0.18); }
      .bl-card-image { aspect-ratio: 16/9; background: linear-gradient(135deg, #0A1628, #0D1F3C); overflow: hidden; }
      .bl-card-image img { width: 100%; height: 100%; object-fit: cover; }
      .bl-card-emoji { display: flex; align-items: center; justify-content: center; height: 100%; font-size: 36px; opacity: 0.4; }
      .bl-card-body { padding: 22px; display: flex; flex-direction: column; flex: 1; }
      .bl-card-cat { padding: 3px 10px; background: rgba(0,212,255,0.08); color: #00D4FF; border: 1px solid rgba(0,212,255,0.25); border-radius: 999px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; align-self: flex-start; margin-bottom: 12px; }
      .bl-card h3 { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 17px; line-height: 1.3; margin-bottom: 10px; }
      .bl-card p { color: #8899AA; font-size: 13px; line-height: 1.6; flex: 1; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
      .bl-card-foot { margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(30,58,95,0.5); display: flex; gap: 8px; font-size: 11px; color: #8899AA; }

      .bl-pages { max-width: 1080px; margin: 0 auto; display: flex; align-items: center; justify-content: center; gap: 16px; }
      .bl-pages button { padding: 10px 16px; background: #0D1F3C; border: 1px solid #1E3A5F; color: #D4E8F7; border-radius: 10px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 12px; cursor: pointer; transition: all 0.2s; }
      .bl-pages button:hover:not(:disabled) { border-color: #00D4FF; color: #00D4FF; }
      .bl-pages button:disabled { opacity: 0.3; cursor: not-allowed; }
      .bl-pages span { color: #8899AA; font-size: 13px; }
    `}</style>
  );
}

export default BlogListPage;
