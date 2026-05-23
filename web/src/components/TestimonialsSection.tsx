'use client';

import { getTestimonials } from '@/lib/content';
import type { Testimonial } from '@/types';

interface Props {
  title?: string;
  speed?: number;
  bare?: boolean;
}

export function TestimonialsSection({
  title = "Trust isn't claimed. It's measured.",
  speed = 60,
  bare = false,
}: Props) {
  const list = getTestimonials();
  const doubled = [...list, ...list];

  return (
    <section className="ts-section">
      {!bare && (
        <div className="ts-head">
          <div className="ts-eyebrow">Pilot operator feedback</div>
          <h2 className="ts-title">{title}</h2>
        </div>
      )}
      <div className="ts-track-wrap">
        <div className="ts-track" style={{ animationDuration: `${speed}s` }}>
          {doubled.map((t, i) => <Card key={i} t={t} />)}
        </div>
        <div className="ts-fade ts-fade-l" aria-hidden="true" />
        <div className="ts-fade ts-fade-r" aria-hidden="true" />
      </div>
      {!bare && (
        <p className="ts-disclaimer">
          Composite quotes drawn from 2026 pilot engagements across our 7 industry verticals.
          Names anonymised; metrics from real deployments. We&apos;ll publish individually-attested
          reviews as our paying-customer cohort grows — verifiable case-study numbers are
          already in the <a href="/case-studies">case studies</a>.
        </p>
      )}
      <Styles />
    </section>
  );
}

function Card({ t }: { t: Testimonial }) {
  const initials = t.author.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="ts-card">
      <div className="ts-stars" aria-label={`${t.rating ?? 5} out of 5 stars`}>
        {'★'.repeat(Math.max(1, Math.min(5, t.rating ?? 5)))}
      </div>
      <blockquote className="ts-quote">{t.quote}</blockquote>
      <div className="ts-author">
        <div className="ts-avatar"><span>{initials}</span></div>
        <div className="ts-author-text">
          <strong>{t.author}</strong>
          <span>{t.role}{t.role && t.company && ' · '}{t.company}</span>
        </div>
      </div>
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      .ts-section { padding: 80px 0; overflow: hidden; }
      .ts-head { max-width: 760px; margin: 0 auto 40px; padding: 0 24px; text-align: center; }
      .ts-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(139, 92, 246,0.08); border: 1px solid rgba(139, 92, 246,0.25); border-radius: 999px; color: #8B5CF6; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 16px; }
      .ts-title { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(28px, 4vw, 44px); line-height: 1.15; }
      .ts-disclaimer { max-width: 720px; margin: 24px auto 0; padding: 0 24px; color: #9CA3B5; font-size: 12px; line-height: 1.7; text-align: center; }
      .ts-disclaimer a { color: #8B5CF6; text-decoration: underline; }
      .ts-disclaimer a:hover { color: #C084FC; }
      .ts-track-wrap { position: relative; padding: 4px 0; overflow: hidden; }
      .ts-track { display: inline-flex; gap: 20px; animation: ts-scroll linear infinite; padding-left: 24px; }
      .ts-track-wrap:hover .ts-track { animation-play-state: paused; }
      @keyframes ts-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      .ts-card { flex-shrink: 0; width: 380px; padding: 28px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 18px; display: flex; flex-direction: column; box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
      .ts-stars { color: #8B5CF6; font-size: 16px; margin-bottom: 16px; letter-spacing: 0.1em; }
      .ts-quote { font-size: 15px; line-height: 1.7; color: #E5E7EB; font-style: italic; margin-bottom: 20px; flex: 1; }
      .ts-author { display: flex; align-items: center; gap: 12px; padding-top: 16px; border-top: 1px solid rgba(30,58,95,0.6); }
      .ts-avatar { width: 40px; height: 40px; border-radius: 50%; overflow: hidden; background: linear-gradient(135deg, #8B5CF6, #C084FC); display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; font-weight: 800; color: #0A0613; font-size: 14px; flex-shrink: 0; }
      .ts-author-text strong { display: block; font-size: 14px; }
      .ts-author-text span { font-size: 12px; color: #9CA3B5; }
      .ts-fade { position: absolute; top: 0; bottom: 0; width: 80px; pointer-events: none; }
      .ts-fade-l { left: 0; background: linear-gradient(90deg, #0A0613, transparent); }
      .ts-fade-r { right: 0; background: linear-gradient(270deg, #0A0613, transparent); }
      @media (prefers-reduced-motion: reduce) { .ts-track { animation: none; padding-left: 24px; } }
    `}</style>
  );
}
