'use client';

import { getIntegrations } from '@/lib/content';

interface Props {
  title?: string;
  speed?: number;
  bare?: boolean;
}

export function IntegrationsMarquee({
  title = 'Connect with everything you already use',
  speed = 40,
  bare = false,
}: Props) {
  const list = getIntegrations();
  const doubled = [...list, ...list];

  return (
    <section className="im-section">
      {!bare && (
        <div className="im-head">
          <div className="im-eyebrow">{list.length}+ integrations · API-first</div>
          <h2 className="im-title">{title}</h2>
        </div>
      )}
      <div className="im-track-wrap" aria-label="Integrations carousel">
        <div className="im-track" style={{ animationDuration: `${speed}s` }}>
          {doubled.map((i, idx) => (
            <div key={idx} className="im-logo">
              <div className="im-text-logo">{i.name}</div>
              {i.category && <span className="im-cat">{i.category}</span>}
            </div>
          ))}
        </div>
        <div className="im-fade im-fade-l" aria-hidden="true" />
        <div className="im-fade im-fade-r" aria-hidden="true" />
      </div>
      <style>{`
        .im-section { padding: 56px 0; overflow: hidden; }
        .im-head { max-width: 1080px; margin: 0 auto 32px; padding: 0 24px; text-align: center; }
        .im-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(139, 92, 246,0.08); border: 1px solid rgba(139, 92, 246,0.25); border-radius: 999px; color: #8B5CF6; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 14px; }
        .im-title { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(20px, 2.5vw, 28px); color: #E5E7EB; }
        .im-track-wrap { position: relative; width: 100%; overflow: hidden; padding: 8px 0; }
        .im-track { display: inline-flex; gap: 16px; animation: im-scroll linear infinite; padding-left: 24px; }
        .im-track-wrap:hover .im-track { animation-play-state: paused; }
        @keyframes im-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .im-logo { flex-shrink: 0; display: inline-flex; align-items: center; gap: 12px; padding: 14px 22px; background: rgba(13, 31, 60, 0.6); backdrop-filter: blur(8px); border: 1px solid #2A1F3D; border-radius: 12px; color: #E5E7EB; min-width: 180px; }
        .im-text-logo { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 16px; color: #E5E7EB; letter-spacing: -0.01em; }
        .im-cat { font-size: 10px; color: #9CA3B5; padding: 3px 8px; background: rgba(255,255,255,0.04); border-radius: 999px; text-transform: uppercase; letter-spacing: 0.08em; }
        .im-fade { position: absolute; top: 0; bottom: 0; width: 80px; pointer-events: none; }
        .im-fade-l { left: 0; background: linear-gradient(90deg, #0A0613, transparent); }
        .im-fade-r { right: 0; background: linear-gradient(270deg, #0A0613, transparent); }
        @media (prefers-reduced-motion: reduce) { .im-track { animation: none; padding-left: 24px; } }
      `}</style>
    </section>
  );
}
