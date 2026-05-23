'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { getBlogPosts, getBlogCategories } from '@/lib/content';

const PAGE_SIZE = 9;

const fmtDate = (d?: string) => {
  if (!d) return '';
  try {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return '';
    return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return ''; }
};

export default function BlogListPage() {
  const posts = getBlogPosts();
  const categories = ['All', ...getBlogCategories()];

  const [activeCat, setActiveCat] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let out = posts;
    if (activeCat !== 'All') out = out.filter(p => p.category === activeCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(p =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.excerpt || '').toLowerCase().includes(q),
      );
    }
    return out;
  }, [posts, activeCat, search]);

  const featured = filtered.find(p => p.featured) || filtered[0];
  const rest = filtered.filter(p => p.slug !== featured?.slug);
  const pageCount = Math.max(1, Math.ceil(rest.length / PAGE_SIZE));
  const paged = rest.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="bl-page">
      <header className="bl-hero">
        <div className="bl-eyebrow">{posts.length} articles · field notes from the automation frontier</div>
        <h1 className="bl-h1">Tactical playbooks, <span className="bl-grad">not theory</span></h1>
        <p className="bl-sub">Every post is something we&apos;ve shipped or learned the hard way. Filtered by what actually moves a number.</p>
      </header>

      <div className="bl-controls">
        <div className="bl-tabs">
          {categories.map(c => (
            <button key={c} className={`bl-tab ${activeCat === c ? 'is-active' : ''}`} onClick={() => { setActiveCat(c); setPage(1); }}>{c}</button>
          ))}
        </div>
        <div className="bl-search">
          <span className="bl-search-icon">⌕</span>
          <input type="text" placeholder="Search articles…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bl-state">
          <p>No articles match those filters.</p>
          <button className="bl-btn" onClick={() => { setActiveCat('All'); setSearch(''); }}>Show all</button>
        </div>
      ) : (
        <>
          {featured && (
            <Link href={`/blog/${featured.slug}`} className="bl-featured">
              <div className="bl-featured-image">
                <img src={`/api/og/blog/${featured.slug}`} alt={featured.title || 'Article'} loading="eager" width={1280} height={720} fetchPriority="high" />
              </div>
              <div className="bl-featured-body">
                <div className="bl-featured-meta">
                  <span className="bl-featured-tag">Featured</span>
                  {featured.category && <span className="bl-featured-cat">{featured.category}</span>}
                </div>
                <h2>{featured.title}</h2>
                <p>{featured.excerpt}</p>
                <div className="bl-featured-foot">
                  <span>{featured.author || 'Arora'}</span>
                  {fmtDate(featured.publishedDate) && <span>· {fmtDate(featured.publishedDate)}</span>}
                  {featured.readTime && <span>· {featured.readTime} min read</span>}
                  <span className="bl-featured-link">Read →</span>
                </div>
              </div>
            </Link>
          )}

          {paged.length > 0 && (
            <div className="bl-grid">
              {paged.map(p => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="bl-card">
                  <div className="bl-card-image">
                    <img src={`/api/og/blog/${p.slug}`} alt={p.title || 'Article'} loading="lazy" width={640} height={360} />
                  </div>
                  <div className="bl-card-body">
                    {p.category && <span className="bl-card-cat">{p.category}</span>}
                    <h3>{p.title}</h3>
                    <p>{p.excerpt}</p>
                    <div className="bl-card-foot">
                      <span>{p.author || 'Arora'}</span>
                      {p.readTime && <span>· {p.readTime} min</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {pageCount > 1 && (
            <div className="bl-pages">
              <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>← Prev</button>
              <span>Page {page} of {pageCount}</span>
              <button disabled={page === pageCount} onClick={() => setPage(p => Math.min(pageCount, p + 1))}>Next →</button>
            </div>
          )}
        </>
      )}

      <Styles />
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      .bl-page { background: #0A0613; color: #E5E7EB; min-height: 100vh; padding: 140px 24px 80px; font-family: 'Inter', system-ui, sans-serif; }
      @media (max-width: 640px) { .bl-page { padding: 120px 16px 60px; } }
      .bl-hero { max-width: 760px; margin: 0 auto 48px; text-align: center; }
      .bl-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(139, 92, 246,0.08); border: 1px solid rgba(139, 92, 246,0.25); border-radius: 999px; color: #8B5CF6; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; }
      .bl-h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(32px, 5vw, 52px); line-height: 1.05; margin-bottom: 16px; }
      .bl-grad { background: linear-gradient(135deg, #8B5CF6, #C084FC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .bl-sub { color: #9CA3B5; font-size: 17px; line-height: 1.6; }
      .bl-controls { max-width: 1080px; margin: 0 auto 32px; display: flex; gap: 16px; align-items: center; flex-wrap: wrap; justify-content: center; }
      .bl-tabs { display: flex; flex-wrap: wrap; gap: 8px; }
      .bl-tab { padding: 7px 14px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 999px; color: #9CA3B5; font-size: 13px; cursor: pointer; transition: all 0.2s; font-family: 'Inter', system-ui, sans-serif; }
      .bl-tab:hover { color: #E5E7EB; border-color: #8B5CF6; }
      .bl-tab.is-active { background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border-color: transparent; font-weight: 700; }
      .bl-search { position: relative; min-width: 280px; }
      .bl-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #9CA3B5; pointer-events: none; }
      .bl-search input { width: 100%; padding: 10px 14px 10px 38px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 10px; color: #E5E7EB; font-size: 13px; outline: none; transition: border 0.2s; }
      .bl-search input:focus { border-color: #8B5CF6; box-shadow: 0 0 0 3px rgba(139, 92, 246,0.15); }
      .bl-state { max-width: 480px; margin: 60px auto; text-align: center; padding: 32px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 14px; color: #9CA3B5; }
      .bl-btn { padding: 10px 20px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border: none; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; cursor: pointer; margin-top: 12px; }
      .bl-featured { display: grid; grid-template-columns: 1fr 1fr; gap: 0; max-width: 1080px; margin: 0 auto 32px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 20px; overflow: hidden; text-decoration: none; color: #E5E7EB; transition: all 0.3s; }
      .bl-featured:hover { border-color: #8B5CF6; box-shadow: 0 0 32px rgba(139, 92, 246,0.18); }
      @media (max-width: 800px) { .bl-featured { grid-template-columns: 1fr; } }
      .bl-featured-image { aspect-ratio: 16/10; background: #0A0613; overflow: hidden; }
      .bl-featured-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
      .bl-featured:hover .bl-featured-image img { transform: scale(1.04); }
      .bl-featured-body { padding: 36px 40px; display: flex; flex-direction: column; justify-content: center; }
      .bl-featured-meta { display: flex; gap: 8px; margin-bottom: 14px; }
      .bl-featured-tag { padding: 4px 10px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border-radius: 999px; font-family: 'Space Grotesk', sans-serif; font-size: 10px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }
      .bl-featured-cat { padding: 4px 10px; background: rgba(139, 92, 246,0.08); color: #8B5CF6; border: 1px solid rgba(139, 92, 246,0.25); border-radius: 999px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }
      .bl-featured-body h2 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(22px, 2.5vw, 30px); line-height: 1.2; margin-bottom: 14px; }
      .bl-featured-body p { color: #9CA3B5; font-size: 15px; line-height: 1.7; margin-bottom: 20px; }
      .bl-featured-foot { display: flex; gap: 8px; align-items: center; font-size: 12px; color: #9CA3B5; flex-wrap: wrap; }
      .bl-featured-link { margin-left: auto; color: #8B5CF6; font-family: 'Space Grotesk', sans-serif; font-weight: 700; }
      .bl-grid { max-width: 1080px; margin: 0 auto 40px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
      @media (max-width: 1024px) { .bl-grid { grid-template-columns: repeat(2, 1fr); } }
      @media (max-width: 640px) { .bl-grid { grid-template-columns: 1fr; } }
      .bl-card { background: #13101F; border: 1px solid #2A1F3D; border-radius: 14px; overflow: hidden; text-decoration: none; color: #E5E7EB; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column; }
      .bl-card:hover { transform: translateY(-3px); border-color: #8B5CF6; box-shadow: 0 0 24px rgba(139, 92, 246,0.18); }
      .bl-card-image { aspect-ratio: 16/9; background: #0A0613; overflow: hidden; }
      .bl-card-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
      .bl-card:hover .bl-card-image img { transform: scale(1.05); }
      .bl-card-body { padding: 22px; display: flex; flex-direction: column; flex: 1; }
      .bl-card-cat { padding: 3px 10px; background: rgba(139, 92, 246,0.08); color: #8B5CF6; border: 1px solid rgba(139, 92, 246,0.25); border-radius: 999px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; align-self: flex-start; margin-bottom: 12px; }
      .bl-card h3 { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 17px; line-height: 1.3; margin-bottom: 10px; }
      .bl-card p { color: #9CA3B5; font-size: 13px; line-height: 1.6; flex: 1; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
      .bl-card-foot { margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(30,58,95,0.5); display: flex; gap: 8px; font-size: 11px; color: #9CA3B5; }
      .bl-pages { max-width: 1080px; margin: 0 auto; display: flex; align-items: center; justify-content: center; gap: 16px; }
      .bl-pages button { padding: 10px 16px; background: #13101F; border: 1px solid #2A1F3D; color: #E5E7EB; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 12px; cursor: pointer; transition: all 0.2s; }
      .bl-pages button:hover:not(:disabled) { border-color: #8B5CF6; color: #8B5CF6; }
      .bl-pages button:disabled { opacity: 0.3; cursor: not-allowed; }
      .bl-pages span { color: #9CA3B5; font-size: 13px; }
    `}</style>
  );
}
