import type { Metadata } from 'next';
import Link from 'next/link';
import comparisons from '@/content/comparisons.json';

export const metadata: Metadata = {
  title: 'Compare Aiprosol · vs Zapier consultants, in-house, Big 4, DIY tools',
  description:
    'Honest head-to-head comparisons. How Aiprosol differs from Zapier consultants, in-house builds, Big 4 AI consulting, and assembling your own AI tool stack.',
  alternates: { canonical: '/compare' },
  openGraph: {
    title: 'Compare Aiprosol vs alternatives',
    description: 'Honest comparisons against Zapier consultants, in-house builds, Big 4, and DIY tool stacks.',
    url: '/compare',
    type: 'website',
  },
};

export default function CompareIndexPage() {
  return (
    <div className="cmpi-page">
      <header className="cmpi-header">
        <div className="cmpi-eyebrow">Honest comparisons</div>
        <h1 className="cmpi-h1">How Aiprosol stacks up against alternatives</h1>
        <p className="cmpi-sub">
          No hand-waving. Each comparison has a side-by-side table, an explicit verdict on when each
          option wins, and FAQs to surface real edge cases. We&apos;ll tell you when an alternative
          is the better fit.
        </p>
      </header>

      <div className="cmpi-grid">
        {comparisons.map((c) => (
          <Link key={c.slug} href={`/compare/${c.slug}`} className="cmpi-card">
            <div className="cmpi-card-tag">{c.title.replace('Aiprosol vs ', '').replace('aiprosol-', '')}</div>
            <h2 className="cmpi-card-title">{c.h1}</h2>
            <p className="cmpi-card-summary">{c.summary.slice(0, 180)}{c.summary.length > 180 ? '…' : ''}</p>
            <span className="cmpi-card-link">Read the comparison →</span>
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
      .cmpi-page { max-width: 1100px; margin: 0 auto; padding: 140px 24px 80px; font-family: 'Inter', system-ui, sans-serif; color: var(--color-text); }
      @media (max-width: 640px) { .cmpi-page { padding: 110px 16px 60px; } }
      .cmpi-header { text-align: center; margin-bottom: 56px; }
      .cmpi-eyebrow { display: inline-block; padding: 6px 14px; background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.3); border-radius: 999px; color: var(--color-cyan); font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 18px; }
      .cmpi-h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(28px, 4vw, 44px); line-height: 1.08; letter-spacing: -0.02em; margin: 0 0 18px; }
      .cmpi-sub { color: var(--color-text-dim); font-size: 16px; line-height: 1.7; max-width: 680px; margin: 0 auto; }
      .cmpi-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
      @media (max-width: 720px) { .cmpi-grid { grid-template-columns: 1fr; } }
      .cmpi-card { display: flex; flex-direction: column; padding: 24px 26px; background: rgba(19,16,31,0.5); border: 1px solid var(--color-border); border-radius: 14px; text-decoration: none; color: inherit; transition: border 0.2s, transform 0.2s; }
      .cmpi-card:hover { border-color: var(--color-cyan); transform: translateY(-2px); }
      .cmpi-card-tag { font-family: 'Space Grotesk', sans-serif; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--color-cyan); margin-bottom: 10px; }
      .cmpi-card-title { font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 700; line-height: 1.3; margin: 0 0 12px; color: var(--color-text); }
      .cmpi-card-summary { color: var(--color-text-dim); font-size: 13px; line-height: 1.6; margin: 0 0 16px; flex: 1; }
      .cmpi-card-link { font-family: 'Space Grotesk', sans-serif; font-size: 12px; font-weight: 700; color: var(--color-cyan); letter-spacing: 0.04em; }
    `}</style>
  );
}
