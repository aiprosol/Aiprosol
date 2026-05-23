'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { searchAllByKind, KIND_LABELS, KIND_ICONS, type SearchKind } from '@/lib/search';

function SearchInner() {
  const params = useSearchParams();
  const router = useRouter();
  const initialQuery = params.get('q') || '';

  const [query, setQuery] = useState(initialQuery);

  // Debounce URL updates so each keystroke doesn't push history
  useEffect(() => {
    const id = setTimeout(() => {
      const url = query ? `/search?q=${encodeURIComponent(query)}` : '/search';
      router.replace(url);
    }, 200);
    return () => clearTimeout(id);
  }, [query, router]);

  const grouped = useMemo(() => searchAllByKind(query), [query]);
  const totalHits = useMemo(
    () => Object.values(grouped).reduce((n, arr) => n + arr.length, 0),
    [grouped],
  );

  const order: SearchKind[] = ['product', 'service', 'case', 'blog', 'faq'];

  return (
    <div className="sr-page">
      <header className="sr-hero">
        <div className="sr-eyebrow">Site search</div>
        <h1 className="sr-h1">
          Find anything across <span className="sr-grad">Aiprosol</span>
        </h1>
        <p className="sr-sub">Products · services · blog posts · case studies · FAQs.</p>

        <div className="sr-input-wrap">
          <span className="sr-input-icon">⌕</span>
          <input
            type="text"
            placeholder="Try 'lead generation', 'pricing', 'document processing'…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button className="sr-clear" onClick={() => setQuery('')} aria-label="Clear">×</button>
          )}
        </div>

        {query && (
          <div className="sr-meta">
            {totalHits === 0
              ? `No matches for "${query}"`
              : `${totalHits} result${totalHits === 1 ? '' : 's'} for "${query}"`}
          </div>
        )}
      </header>

      {!query ? (
        <div className="sr-empty-state">
          <p>Start typing to search across the entire site.</p>
          <div className="sr-suggestions">
            {['ROI', 'pricing', 'lead generation', 'workflow', 'case study', 'guarantee'].map(s => (
              <button key={s} className="sr-suggestion" onClick={() => setQuery(s)}>{s}</button>
            ))}
          </div>
        </div>
      ) : totalHits === 0 ? (
        <div className="sr-empty-state">
          <p>Nothing matched. Try a broader term — or chat with Arora bottom-right.</p>
          <div className="sr-suggestions">
            {['automation', 'pricing', 'audit', 'plan'].map(s => (
              <button key={s} className="sr-suggestion" onClick={() => setQuery(s)}>{s}</button>
            ))}
          </div>
        </div>
      ) : (
        <div className="sr-results">
          {order.map(kind => {
            const hits = grouped[kind];
            if (hits.length === 0) return null;
            return (
              <section key={kind} className="sr-group">
                <header className="sr-group-head">
                  <span className="sr-group-icon">{KIND_ICONS[kind]}</span>
                  <h2>{KIND_LABELS[kind]}</h2>
                  <span className="sr-group-count">{hits.length}</span>
                </header>
                <div className="sr-group-list">
                  {hits.map((hit, i) => (
                    <Link key={`${kind}-${i}`} href={hit.href} className="sr-hit">
                      <div className="sr-hit-text">
                        <strong>{hit.title}</strong>
                        {hit.excerpt && <p>{hit.excerpt}</p>}
                        {hit.meta && <span className="sr-hit-meta">{hit.meta}</span>}
                      </div>
                      <span className="sr-hit-arrow">→</span>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <Styles />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="sr-page"><div className="sr-loading">Loading…</div><Styles /></div>}>
      <SearchInner />
    </Suspense>
  );
}

function Styles() {
  return (
    <style>{`
      .sr-page { background: #0A0613; color: #E5E7EB; min-height: 100vh; padding: 140px 24px 80px; font-family: 'Inter', system-ui, sans-serif; }
      @media (max-width: 640px) { .sr-page { padding: 120px 16px 60px; } }
      .sr-loading { max-width: 480px; margin: 80px auto; text-align: center; padding: 32px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 14px; color: #9CA3B5; }
      .sr-hero { max-width: 720px; margin: 0 auto 40px; text-align: center; }
      .sr-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(139, 92, 246,0.08); border: 1px solid rgba(139, 92, 246,0.25); border-radius: 999px; color: #8B5CF6; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; }
      .sr-h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(32px, 4.5vw, 48px); line-height: 1.05; margin-bottom: 14px; }
      .sr-grad { background: linear-gradient(135deg, #8B5CF6, #C084FC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .sr-sub { color: #9CA3B5; font-size: 16px; margin-bottom: 28px; }
      .sr-input-wrap { position: relative; max-width: 560px; margin: 0 auto; }
      .sr-input-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #9CA3B5; font-size: 20px; pointer-events: none; }
      .sr-input-wrap input { width: 100%; padding: 18px 48px 18px 48px; background: #13101F; border: 1px solid #2A1F3D; color: #E5E7EB; font-size: 16px; border-radius: 14px; outline: none; font-family: 'Inter', system-ui, sans-serif; transition: all 0.2s; }
      .sr-input-wrap input:focus { border-color: #8B5CF6; box-shadow: 0 0 0 4px rgba(139, 92, 246,0.15); }
      .sr-input-wrap input::placeholder { color: #4a6280; }
      .sr-clear { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); width: 32px; height: 32px; background: rgba(30,58,95,0.6); border: none; color: #E5E7EB; border-radius: 50%; cursor: pointer; font-size: 18px; }
      .sr-meta { font-size: 13px; color: #9CA3B5; margin-top: 14px; }
      .sr-empty-state { max-width: 600px; margin: 60px auto; text-align: center; }
      .sr-empty-state p { color: #9CA3B5; margin-bottom: 20px; font-size: 15px; }
      .sr-suggestions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
      .sr-suggestion { padding: 7px 14px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 999px; color: #8B5CF6; font-size: 13px; cursor: pointer; transition: all 0.2s; font-family: 'Inter', system-ui, sans-serif; }
      .sr-suggestion:hover { border-color: #8B5CF6; background: rgba(139, 92, 246,0.06); }
      .sr-results { max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 32px; }
      .sr-group { background: #13101F; border: 1px solid #2A1F3D; border-radius: 16px; overflow: hidden; }
      .sr-group-head { display: flex; align-items: center; gap: 12px; padding: 16px 20px; border-bottom: 1px solid #2A1F3D; }
      .sr-group-icon { width: 32px; height: 32px; background: rgba(139, 92, 246,0.08); border: 1px solid rgba(139, 92, 246,0.25); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; color: #8B5CF6; }
      .sr-group-head h2 { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 16px; flex: 1; }
      .sr-group-count { background: rgba(139, 92, 246,0.08); color: #8B5CF6; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; }
      .sr-group-list { display: flex; flex-direction: column; }
      .sr-hit { display: flex; align-items: center; gap: 16px; padding: 16px 20px; border-bottom: 1px solid rgba(30,58,95,0.5); text-decoration: none; color: #E5E7EB; transition: all 0.2s; }
      .sr-hit:last-child { border-bottom: none; }
      .sr-hit:hover { background: rgba(139, 92, 246,0.04); }
      .sr-hit-text { flex: 1; min-width: 0; }
      .sr-hit-text strong { display: block; font-size: 15px; margin-bottom: 4px; }
      .sr-hit-text p { color: #9CA3B5; font-size: 13px; line-height: 1.5; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
      .sr-hit-meta { font-size: 11px; color: #8B5CF6; text-transform: uppercase; letter-spacing: 0.08em; font-family: 'Space Grotesk', sans-serif; font-weight: 600; }
      .sr-hit-arrow { color: #8B5CF6; font-size: 18px; flex-shrink: 0; }
    `}</style>
  );
}
