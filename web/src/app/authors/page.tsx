// /authors — index of all authors at Aiprosol (Srijan + Arora).

import Link from 'next/link';
import type { Metadata } from 'next';
import { AUTHORS, AUTHOR_SLUGS, postsByAuthor } from '@/lib/authors';

export const metadata: Metadata = {
  title: 'Authors · who writes for Aiprosol',
  description:
    'The two voices on the Aiprosol blog: Srijan Paudel (Founder & Chairman, human) and Arora (AI CEO, written by the model itself).',
  alternates: { canonical: '/authors' },
};

export default function AuthorsIndex() {
  return (
    <div className="ai-page">
      <header className="ai-hero">
        <div className="ai-eyebrow">Authors</div>
        <h1 className="ai-h1">Who writes for Aiprosol</h1>
        <p className="ai-sub">
          One human, one AI. Srijan Paudel (Founder & Chairman) writes the founder-voice pieces. Arora (AI CEO) writes the AI-voice pieces — including her own role definition and the buyer-evaluation framework. Both are real authors of the posts under their bylines, in different ways.
        </p>
      </header>

      <section className="ai-grid">
        {AUTHOR_SLUGS.map((slug) => {
          const a = AUTHORS[slug];
          const count = postsByAuthor(slug).length;
          return (
            <Link key={slug} href={`/authors/${slug}`} className="ai-card">
              <div className="ai-card-head">
                <div className="ai-avatar">{a.name.charAt(0)}</div>
                <div>
                  <h2 className="ai-name">{a.displayName}</h2>
                  <div className="ai-role">{a.role}</div>
                </div>
              </div>
              <p className="ai-bio">{a.bio}</p>
              <div className="ai-meta">{count} essay{count === 1 ? '' : 's'} →</div>
            </Link>
          );
        })}
      </section>

      <style>{`
        .ai-page { background: #0A0613; color: #E5E7EB; min-height: 100vh; padding: 120px 24px 80px; font-family: 'Inter', system-ui, sans-serif; }
        @media (max-width: 640px) { .ai-page { padding: 100px 16px 60px; } }
        .ai-hero { max-width: 880px; margin: 0 auto 56px; }
        .ai-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(139, 92, 246, 0.08); border: 1px solid rgba(139, 92, 246, 0.25); border-radius: 999px; color: #C084FC; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 16px; }
        .ai-h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(32px, 5vw, 52px); line-height: 1.1; margin-bottom: 20px; }
        .ai-sub { color: #9CA3B5; font-size: 17px; line-height: 1.6; }
        .ai-grid { max-width: 1080px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; }
        .ai-card { display: block; padding: 28px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 16px; text-decoration: none; color: #E5E7EB; transition: all 0.2s; }
        .ai-card:hover { border-color: #8B5CF6; transform: translateY(-2px); }
        .ai-card-head { display: flex; align-items: center; gap: 16px; margin-bottom: 18px; }
        .ai-avatar { width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 26px; flex-shrink: 0; }
        .ai-name { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 20px; margin-bottom: 4px; }
        .ai-role { color: #9CA3B5; font-size: 12px; }
        .ai-bio { color: #9CA3B5; font-size: 14px; line-height: 1.6; margin-bottom: 16px; }
        .ai-meta { color: #C084FC; font-family: 'Space Grotesk', sans-serif; font-size: 13px; font-weight: 700; }
      `}</style>
    </div>
  );
}
