'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { getFaqs, getFaqCategories } from '@/lib/content';

// FAQPage Schema.org JSON-LD lives in faqs/layout.tsx (with @id #page,
// SpeakableSpecification for voice assistants, and BreadcrumbList).
// Do not duplicate it here — Google's Rich Results Test flags duplicate
// FAQPage entities as invalid.

export default function FAQPage() {
  const allFaqs = getFaqs();
  const categories = ['All', ...getFaqCategories()];
  const [activeCat, setActiveCat] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState<string>('');

  const filtered = useMemo(() => {
    let out = allFaqs.map((f, i) => ({ ...f, id: `faq-${i}` }));
    if (activeCat !== 'All') out = out.filter(f => f.category === activeCat);
    if (search.trim()) {
      const s = search.toLowerCase();
      out = out.filter(f => f.question.toLowerCase().includes(s) || f.answer.toLowerCase().includes(s));
    }
    return out;
  }, [allFaqs, activeCat, search]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    for (const f of filtered) {
      if (!groups[f.category]) groups[f.category] = [];
      groups[f.category].push(f);
    }
    return groups;
  }, [filtered]);

  return (
    <div className="fq-page">
      <header className="fq-hero">
        <div className="fq-eyebrow">{allFaqs.length} questions · answered straight</div>
        <h1 className="fq-h1">Questions, <span className="fq-grad">answered straight</span></h1>
        <p className="fq-sub">If you don&apos;t find what you&apos;re looking for, ask Arora in the chat widget — she&apos;s available 24/7.</p>
        <div className="fq-search">
          <span className="fq-search-icon">⌕</span>
          <input
            type="text"
            placeholder="Search FAQs (e.g. 'pricing', 'cancel', 'support')…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className="fq-search-clear" onClick={() => setSearch('')}>×</button>}
        </div>
      </header>

      <div className="fq-tabs">
        {categories.map(c => (
          <button key={c} className={`fq-tab ${activeCat === c ? 'is-active' : ''}`} onClick={() => setActiveCat(c)}>{c}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="fq-state">
          <p>No FAQ matches &ldquo;{search}&rdquo;.</p>
          <p className="fq-state-sub">Ask Arora in the chat widget — she&apos;ll answer directly.</p>
        </div>
      ) : (
        <div className="fq-list">
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} className="fq-group">
              <h2 className="fq-group-title">{cat}</h2>
              <div className="fq-items">
                {items.map(item => (
                  <div key={item.id} className={`fq-item ${openId === item.id ? 'is-open' : ''}`}>
                    <button className="fq-q" onClick={() => setOpenId(openId === item.id ? '' : item.id)}>
                      <span>{item.question}</span>
                      <span className="fq-icon">+</span>
                    </button>
                    <div className="fq-a"><p>{item.answer}</p></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <section className="fq-cta">
        <h2>Still have a question?</h2>
        <p>Arora is online 24/7 in the chat widget. Or run the free 60-second ROI Audit if you&apos;re already evaluating.</p>
        <div className="fq-cta-row">
          <Link href="/roi-audit" className="fq-cta-btn">Get Free ROI Audit →</Link>
          <Link href="/services" className="fq-cta-secondary">Browse services →</Link>
        </div>
      </section>

      <Styles />
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      .fq-page { background: #0A0613; color: #E5E7EB; min-height: 100vh; padding: 140px 24px 80px; font-family: 'Inter', system-ui, sans-serif; }
      @media (max-width: 640px) { .fq-page { padding: 120px 16px 60px; } }
      .fq-hero { max-width: 720px; margin: 0 auto 40px; text-align: center; }
      .fq-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(139, 92, 246,0.08); border: 1px solid rgba(139, 92, 246,0.25); border-radius: 999px; color: #8B5CF6; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 16px; }
      .fq-h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(32px, 5vw, 52px); line-height: 1.05; margin-bottom: 16px; }
      .fq-grad { background: linear-gradient(135deg, #8B5CF6, #C084FC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .fq-sub { color: #9CA3B5; font-size: 16px; line-height: 1.6; margin-bottom: 28px; }
      .fq-search { position: relative; max-width: 560px; margin: 0 auto; }
      .fq-search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #9CA3B5; font-size: 18px; pointer-events: none; }
      .fq-search input { width: 100%; padding: 16px 48px 16px 44px; background: #13101F; border: 1px solid #2A1F3D; color: #E5E7EB; font-size: 15px; border-radius: 12px; outline: none; font-family: 'Inter', system-ui, sans-serif; transition: all 0.2s; }
      .fq-search input:focus { border-color: #8B5CF6; box-shadow: 0 0 0 4px rgba(139, 92, 246,0.15); }
      .fq-search input::placeholder { color: #4a6280; }
      .fq-search-clear { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); width: 28px; height: 28px; background: rgba(30,58,95,0.6); border: none; color: #E5E7EB; border-radius: 50%; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; }
      .fq-search-clear:hover { background: #2A1F3D; }
      .fq-tabs { max-width: 800px; margin: 0 auto 32px; display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
      .fq-tab { padding: 7px 14px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 999px; color: #9CA3B5; font-size: 13px; cursor: pointer; transition: all 0.2s; font-family: 'Inter', system-ui, sans-serif; }
      .fq-tab:hover { color: #E5E7EB; border-color: #8B5CF6; }
      .fq-tab.is-active { background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border-color: transparent; font-weight: 700; }
      .fq-state { max-width: 480px; margin: 60px auto; text-align: center; padding: 32px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 14px; color: #9CA3B5; }
      .fq-state-sub { font-size: 13px; margin-top: 8px; opacity: 0.7; }
      .fq-list { max-width: 800px; margin: 0 auto 64px; display: flex; flex-direction: column; gap: 32px; }
      .fq-group-title { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 22px; color: #8B5CF6; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid #2A1F3D; }
      .fq-items { display: flex; flex-direction: column; gap: 8px; }
      .fq-item { background: #13101F; border: 1px solid #2A1F3D; border-radius: 12px; overflow: hidden; }
      .fq-q { width: 100%; padding: 18px 22px; background: transparent; border: none; color: #E5E7EB; font-size: 15px; font-weight: 500; text-align: left; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 16px; font-family: 'Inter', system-ui, sans-serif; transition: color 0.2s; }
      .fq-q:hover { color: #8B5CF6; }
      .fq-icon { color: #8B5CF6; font-size: 22px; transition: transform 0.3s; flex-shrink: 0; }
      .fq-item.is-open .fq-icon { transform: rotate(45deg); }
      .fq-a { max-height: 0; overflow: hidden; transition: max-height 0.3s ease, padding 0.3s ease; padding: 0 22px; }
      .fq-item.is-open .fq-a { max-height: 600px; padding: 0 22px 18px; }
      .fq-a p { color: #9CA3B5; font-size: 14px; line-height: 1.7; }
      .fq-cta { max-width: 720px; margin: 0 auto; text-align: center; padding: 48px 32px; background: rgba(139, 92, 246,0.04); border: 1px solid rgba(139, 92, 246,0.25); border-radius: 24px; }
      .fq-cta h2 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 28px; margin-bottom: 8px; }
      .fq-cta p { color: #9CA3B5; font-size: 15px; margin-bottom: 24px; }
      .fq-cta-row { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
      .fq-cta-btn { padding: 14px 28px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613 !important; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 14px; text-decoration: none; box-shadow: 0 0 24px rgba(139, 92, 246,0.35); }
      .fq-cta-secondary { padding: 14px 24px; background: transparent; border: 1px solid #2A1F3D; color: #E5E7EB; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 14px; text-decoration: none; transition: all 0.2s; }
      .fq-cta-secondary:hover { border-color: #8B5CF6; color: #8B5CF6; }
    `}</style>
  );
}
