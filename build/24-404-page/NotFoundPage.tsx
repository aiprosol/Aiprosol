// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · 404 PAGE
// Phase 5.10 · animated cyan sphere · witty copy · top 5 popular page links
// · search input · ROI Audit fallback CTA. Pure CSS animation (no Three.js
// dependency on this route to keep load fast).
// ─────────────────────────────────────────────────────────────────────────

import { useState } from 'react';

const POPULAR_LINKS = [
  { label: 'Free ROI Audit',    desc: '60 seconds, no commitment',           href: '/roi-audit' },
  { label: 'All 19 Products',   desc: 'From £17 to £997',                    href: '/digital-products' },
  { label: '11 AI Services',    desc: 'Workflow, chatbots, IDP, more',       href: '/services' },
  { label: '8 Case Studies',    desc: 'Across Legal, Real Estate, etc.',     href: '/case-studies' },
  { label: 'Managed Plans',     desc: 'Starter £997 · Growth £2,997',        href: '/pricing' },
];

const QUIPS = [
  "Looks like that page drifted off the architecture diagram.",
  "404 — automation can do many things, but it can't conjure missing pages.",
  "This URL went rogue. Here's the rest of the system, working fine.",
  "That page isn't in the catalogue (yet). Maybe automate something else?",
];

export function NotFoundPage() {
  const [search, setSearch] = useState('');
  const [quipIndex] = useState(() => Math.floor(Math.random() * QUIPS.length));

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    // Try the blog search if there's a query — feels useful even on 404
    window.location.href = `/blog?q=${encodeURIComponent(search.trim())}`;
  };

  return (
    <div className="nf-page">
      <div className="nf-stage">
        <div className="nf-orb">
          <div className="nf-orb-core">404</div>
          <div className="nf-orb-ring nf-orb-ring-1" />
          <div className="nf-orb-ring nf-orb-ring-2" />
          <div className="nf-orb-ring nf-orb-ring-3" />
          <div className="nf-orb-glow" />
          <div className="nf-orb-particle nf-orb-p-1" />
          <div className="nf-orb-particle nf-orb-p-2" />
          <div className="nf-orb-particle nf-orb-p-3" />
          <div className="nf-orb-particle nf-orb-p-4" />
          <div className="nf-orb-particle nf-orb-p-5" />
        </div>

        <div className="nf-text">
          <div className="nf-eyebrow">Page Not Found</div>
          <h1 className="nf-h1">
            You've drifted off the <span className="nf-grad">architecture</span>.
          </h1>
          <p className="nf-sub">{QUIPS[quipIndex]}</p>

          <form className="nf-search" onSubmit={onSearchSubmit}>
            <span className="nf-search-icon">⌕</span>
            <input
              type="text"
              placeholder="Search the blog or products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit">Search →</button>
          </form>

          <div className="nf-popular">
            <div className="nf-popular-label">Popular destinations</div>
            <div className="nf-popular-list">
              {POPULAR_LINKS.map(l => (
                <a key={l.href} href={l.href} className="nf-link">
                  <div className="nf-link-text">
                    <strong>{l.label}</strong>
                    <span>{l.desc}</span>
                  </div>
                  <span className="nf-link-arrow">→</span>
                </a>
              ))}
            </div>
          </div>

          <a href="/" className="nf-home">← Back to home</a>
        </div>
      </div>

      <Styles />
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      .nf-page { background: #0A1628; color: #D4E8F7; min-height: 100vh; padding: 80px 24px; font-family: 'DM Sans', system-ui, sans-serif; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
      .nf-page::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at top, rgba(0,212,255,0.06), transparent 50%), radial-gradient(ellipse at bottom right, rgba(0,255,229,0.04), transparent 50%); pointer-events: none; }

      .nf-stage { position: relative; z-index: 1; max-width: 1080px; width: 100%; display: grid; grid-template-columns: 1fr 1.2fr; gap: 64px; align-items: center; }
      @media (max-width: 1024px) { .nf-stage { grid-template-columns: 1fr; gap: 32px; } }

      /* ─── Orb ─── */
      .nf-orb { position: relative; aspect-ratio: 1; max-width: 380px; margin: 0 auto; display: flex; align-items: center; justify-content: center; }

      .nf-orb-core { position: relative; z-index: 3; width: 50%; height: 50%; border-radius: 50%; background: radial-gradient(circle at 30% 30%, #00FFE5, #00D4FF 50%, #006080 100%); display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(40px, 6vw, 64px); color: #0A1628; box-shadow: 0 0 64px rgba(0,212,255,0.5), inset 0 0 40px rgba(255,255,255,0.2); animation: nf-pulse 3s ease-in-out infinite; }
      @keyframes nf-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.04); } }

      .nf-orb-ring { position: absolute; inset: 0; border: 1px solid #00D4FF; border-radius: 50%; opacity: 0.3; animation: nf-spin 18s linear infinite; }
      .nf-orb-ring-1 { inset: 0; }
      .nf-orb-ring-2 { inset: 12%; border-color: #00FFE5; opacity: 0.45; animation-direction: reverse; animation-duration: 24s; }
      .nf-orb-ring-3 { inset: 25%; border-style: dashed; opacity: 0.5; animation-duration: 30s; }
      @keyframes nf-spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }

      .nf-orb-glow { position: absolute; inset: -20%; background: radial-gradient(circle, rgba(0,212,255,0.15), transparent 60%); border-radius: 50%; filter: blur(32px); animation: nf-glow 4s ease-in-out infinite alternate; }
      @keyframes nf-glow { from { opacity: 0.6; } to { opacity: 1; } }

      .nf-orb-particle { position: absolute; width: 4px; height: 4px; background: #00D4FF; border-radius: 50%; box-shadow: 0 0 8px #00D4FF; }
      .nf-orb-p-1 { top: 10%; left: 30%; animation: nf-orbit-1 8s linear infinite; }
      .nf-orb-p-2 { top: 80%; left: 20%; animation: nf-orbit-2 12s linear infinite; }
      .nf-orb-p-3 { top: 50%; right: 5%; animation: nf-orbit-3 10s linear infinite; background: #00FFE5; box-shadow: 0 0 8px #00FFE5; }
      .nf-orb-p-4 { top: 25%; right: 15%; animation: nf-orbit-4 14s linear infinite; }
      .nf-orb-p-5 { bottom: 15%; right: 30%; animation: nf-orbit-5 9s linear infinite; }
      @keyframes nf-orbit-1 { from { transform: rotate(0) translateX(120px) rotate(0); } to { transform: rotate(360deg) translateX(120px) rotate(-360deg); } }
      @keyframes nf-orbit-2 { from { transform: rotate(0) translateX(140px) rotate(0); } to { transform: rotate(360deg) translateX(140px) rotate(-360deg); } }
      @keyframes nf-orbit-3 { from { transform: rotate(0) translateX(100px) rotate(0); } to { transform: rotate(-360deg) translateX(100px) rotate(360deg); } }
      @keyframes nf-orbit-4 { from { transform: rotate(0) translateX(160px) rotate(0); } to { transform: rotate(360deg) translateX(160px) rotate(-360deg); } }
      @keyframes nf-orbit-5 { from { transform: rotate(0) translateX(110px) rotate(0); } to { transform: rotate(-360deg) translateX(110px) rotate(360deg); } }

      /* ─── Text ─── */
      .nf-text { max-width: 520px; }
      @media (max-width: 1024px) { .nf-text { max-width: none; text-align: center; margin: 0 auto; } }

      .nf-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.3); border-radius: 999px; color: #F59E0B; font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 16px; }
      .nf-h1 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(34px, 5vw, 52px); line-height: 1.05; margin-bottom: 16px; }
      .nf-grad { background: linear-gradient(135deg, #00D4FF, #00FFE5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .nf-sub { color: #8899AA; font-size: 17px; line-height: 1.6; margin-bottom: 28px; }

      .nf-search { display: flex; gap: 8px; margin-bottom: 32px; position: relative; }
      .nf-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #8899AA; font-size: 16px; pointer-events: none; }
      .nf-search input { flex: 1; padding: 12px 14px 12px 38px; background: #0D1F3C; border: 1px solid #1E3A5F; color: #D4E8F7; font-size: 14px; border-radius: 10px; outline: none; font-family: 'DM Sans', sans-serif; transition: border 0.2s; }
      .nf-search input:focus { border-color: #00D4FF; box-shadow: 0 0 0 3px rgba(0,212,255,0.15); }
      .nf-search button { padding: 0 20px; background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628; border: none; border-radius: 10px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; cursor: pointer; }

      .nf-popular { margin-bottom: 28px; }
      .nf-popular-label { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; color: #8899AA; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 12px; }
      .nf-popular-list { display: flex; flex-direction: column; gap: 6px; }
      .nf-link { display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 12px; text-decoration: none; color: #D4E8F7; transition: all 0.2s; }
      .nf-link:hover { border-color: #00D4FF; background: rgba(0,212,255,0.04); transform: translateX(4px); }
      .nf-link-text strong { display: block; font-size: 14px; }
      .nf-link-text span { font-size: 12px; color: #8899AA; }
      .nf-link-arrow { color: #00D4FF; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 18px; }

      .nf-home { display: inline-block; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; color: #00D4FF; text-decoration: none; }

      @media (prefers-reduced-motion: reduce) {
        .nf-orb-core, .nf-orb-ring, .nf-orb-glow, .nf-orb-particle { animation: none; }
      }
    `}</style>
  );
}

export default NotFoundPage;
