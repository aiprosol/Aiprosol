import type { Metadata } from 'next';
import Link from 'next/link';
import { getGuides } from '@/lib/guides';

export const metadata: Metadata = {
  title: 'Definitive Guides · Aiprosol',
  description: 'Long-form authority guides on AI automation. The 5-step audit, 7 core patterns, 5 anti-patterns, ROI maths, 90-day deployment plan — written by operators who ship.',
  alternates: { canonical: '/guides' },
};

export default function GuidesIndexPage() {
  const guides = getGuides();
  return (
    <div className="gdi-page">
      <header className="gdi-header">
        <div className="gdi-eyebrow">Definitive Guides</div>
        <h1 className="gdi-h1">Long-form authority content</h1>
        <p className="gdi-sub">
          The deep guides. Each is a 30+ minute operating manual on a specific aspect of AI
          automation — read once, refer back for years.
        </p>
      </header>

      <div className="gdi-grid">
        {guides.map((g) => (
          <Link key={g.slug} href={`/guides/${g.slug}`} className="gdi-card">
            <div className="gdi-card-meta">{g.readTime}-min read · Updated {g.updatedDate}</div>
            <h2 className="gdi-card-title">{g.title}</h2>
            <p className="gdi-card-desc">{g.description}</p>
            <span className="gdi-card-link">Read the guide →</span>
          </Link>
        ))}
      </div>

      <Styles />
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      .gdi-page { max-width: 1100px; margin: 0 auto; padding: 140px 24px 80px; font-family: 'Inter', system-ui, sans-serif; color: var(--color-text); }
      @media (max-width: 640px) { .gdi-page { padding: 110px 16px 60px; } }
      .gdi-header { text-align: center; margin-bottom: 56px; }
      .gdi-eyebrow { display: inline-block; padding: 6px 14px; background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.3); border-radius: 999px; color: var(--color-cyan); font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 18px; }
      .gdi-h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(28px, 4vw, 44px); line-height: 1.08; margin: 0 0 18px; }
      .gdi-sub { color: var(--color-text-dim); font-size: 16px; line-height: 1.7; max-width: 620px; margin: 0 auto; }
      .gdi-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
      .gdi-card { display: flex; flex-direction: column; padding: 28px 32px; background: rgba(19,16,31,0.5); border: 1px solid var(--color-border); border-radius: 14px; text-decoration: none; color: inherit; transition: border 0.2s, transform 0.2s; }
      .gdi-card:hover { border-color: var(--color-cyan); transform: translateY(-2px); }
      .gdi-card-meta { font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--color-cyan); margin-bottom: 12px; }
      .gdi-card-title { font-family: 'Space Grotesk', sans-serif; font-size: 22px; font-weight: 700; line-height: 1.25; color: var(--color-text); margin: 0 0 12px; }
      .gdi-card-desc { color: var(--color-text-dim); font-size: 14px; line-height: 1.7; margin: 0 0 18px; }
      .gdi-card-link { font-family: 'Space Grotesk', sans-serif; font-size: 12px; font-weight: 700; color: var(--color-cyan); letter-spacing: 0.04em; }
    `}</style>
  );
}
