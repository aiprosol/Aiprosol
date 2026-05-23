// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · TESTIMONIALS SECTION
// Phase 3.5 · embeddable section · auto-scroll horizontal track with
// pause-on-hover · pulls from `testimonials` CMS with fallback list.
// Embed in HomePage between bento and FAQ, or under any page section.
// ─────────────────────────────────────────────────────────────────────────

import { items } from '@wix/data';
import { useWixModules } from '@wix/sdk-react';
import { useEffect, useState } from 'react';

interface Testimonial {
  _id?: string;
  quote?: string;
  text?: string;
  author?: string;
  authorName?: string;
  name?: string;
  role?: string;
  position?: string;
  company?: string;
  companyName?: string;
  rating?: number;
  avatar?: string;
  avatarUrl?: string;
}

const FALLBACK: Testimonial[] = [
  {
    quote: 'Aiprosol pulled 45 hours a week out of partner time inside three weeks. The IDP layer paid for itself before we even finished onboarding.',
    author: 'James Hargreaves', role: 'Managing Partner', company: 'Hargreaves & Sterling', rating: 5,
  },
  {
    quote: "Lead response was a known weak spot. Arora's qualifier dropped it from 6 hours to under 3 minutes. Conversion is up 28% and we haven't hired a single new SDR.",
    author: 'Maya Rodriguez', role: 'Director', company: 'Meridian Property', rating: 5,
  },
  {
    quote: "We've tried three automation consultancies. Aiprosol is the only one that delivered a roadmap with real numbers attached and then actually hit them.",
    author: 'Daniel Chen', role: 'COO', company: 'Vortex Components', rating: 5,
  },
  {
    quote: 'The £127 lead-gen playbook alone made us our money back in week one. We then upgraded to Growth and never looked back.',
    author: 'Priya Anand', role: 'Founder', company: 'Lumen Studio', rating: 5,
  },
  {
    quote: 'Worth every penny. Most automation consultants sell you a Zapier flow and disappear — Aiprosol stayed and iterated until the numbers worked.',
    author: 'Marcus Webb', role: 'Operations Lead', company: 'Helix Industries', rating: 5,
  },
  {
    quote: 'Arora as the AI CEO is the best decision we made this year. She handles the routine 80% so my team can focus on the 20% that actually moves revenue.',
    author: 'Sofia Reyes', role: 'CEO', company: 'Apex Talent', rating: 5,
  },
];

interface Props {
  /** Override the headline */
  title?: string;
  /** Loop speed in seconds. Default 60s. Higher = slower. */
  speed?: number;
  /** Hide the title block */
  bare?: boolean;
}

export function TestimonialsSection({
  title = "Trust isn't claimed. It's measured.",
  speed = 60,
  bare = false,
}: Props) {
  const { query } = useWixModules(items);
  const [list, setList] = useState<Testimonial[]>(FALLBACK);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await query('testimonials').limit(50).find({ suppressAuth: true });
        const cms = (res.items as Testimonial[]) || [];
        if (mounted && cms.length > 0) setList(cms);
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  const doubled = [...list, ...list];

  return (
    <section className="ts-section">
      {!bare && (
        <div className="ts-head">
          <div className="ts-eyebrow">From the operators</div>
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
      <Styles />
    </section>
  );
}

function Card({ t }: { t: Testimonial }) {
  const quote = (t.quote || t.text || '').replace(/^"|"$/g, '');
  const author = t.author || t.authorName || t.name || 'Anonymous';
  const role = t.role || t.position || '';
  const company = t.company || t.companyName || '';
  const rating = t.rating || 5;
  const avatar = t.avatar || t.avatarUrl;
  const initials = author.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="ts-card">
      <div className="ts-stars" aria-label={`${rating} out of 5 stars`}>
        {'★'.repeat(Math.max(1, Math.min(5, rating)))}
      </div>
      <blockquote className="ts-quote">{quote}</blockquote>
      <div className="ts-author">
        <div className="ts-avatar">
          {avatar ? <img src={avatar} alt={author} /> : <span>{initials}</span>}
        </div>
        <div className="ts-author-text">
          <strong>{author}</strong>
          <span>{role}{role && company && ' · '}{company}</span>
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
      .ts-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(0,212,255,0.08); border: 1px solid rgba(0,212,255,0.25); border-radius: 999px; color: #00D4FF; font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 16px; }
      .ts-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(28px, 4vw, 44px); line-height: 1.15; }

      .ts-track-wrap { position: relative; padding: 4px 0; overflow: hidden; }
      .ts-track { display: inline-flex; gap: 20px; animation: ts-scroll linear infinite; padding-left: 24px; }
      .ts-track-wrap:hover .ts-track { animation-play-state: paused; }
      @keyframes ts-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }

      .ts-card { flex-shrink: 0; width: 380px; padding: 28px; background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 18px; display: flex; flex-direction: column; box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
      .ts-stars { color: #00D4FF; font-size: 16px; margin-bottom: 16px; letter-spacing: 0.1em; }
      .ts-quote { font-size: 15px; line-height: 1.7; color: #D4E8F7; font-style: italic; margin-bottom: 20px; flex: 1; }
      .ts-author { display: flex; align-items: center; gap: 12px; padding-top: 16px; border-top: 1px solid rgba(30,58,95,0.6); }
      .ts-avatar { width: 40px; height: 40px; border-radius: 50%; overflow: hidden; background: linear-gradient(135deg, #00D4FF, #00FFE5); display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 800; color: #0A1628; font-size: 14px; flex-shrink: 0; }
      .ts-avatar img { width: 100%; height: 100%; object-fit: cover; }
      .ts-author-text strong { display: block; font-size: 14px; }
      .ts-author-text span { font-size: 12px; color: #8899AA; }

      .ts-fade { position: absolute; top: 0; bottom: 0; width: 80px; pointer-events: none; }
      .ts-fade-l { left: 0; background: linear-gradient(90deg, #0A1628, transparent); }
      .ts-fade-r { right: 0; background: linear-gradient(270deg, #0A1628, transparent); }

      @media (prefers-reduced-motion: reduce) {
        .ts-track { animation: none; padding-left: 24px; }
      }
    `}</style>
  );
}

export default TestimonialsSection;
