import type { Metadata } from 'next';
import Link from 'next/link';
import howtos from '@/content/how-to.json';

export const metadata: Metadata = {
  title: 'How-To Guides · Step-by-step AI automation',
  description: '8 step-by-step guides: lead routing, business process audits, lead scoring, n8n setup, ROI calculation, customer support AI, document processing, tool selection.',
  alternates: { canonical: '/how-to' },
};

export default function HowToIndexPage() {
  return (
    <div className="hti-page">
      <header className="hti-header">
        <div className="hti-eyebrow">How-To Guides</div>
        <h1 className="hti-h1">Step-by-step guides</h1>
        <p className="hti-sub">
          The exact steps Aiprosol uses with paying clients. Pick the workflow you want to build —
          each guide is self-contained, with tools list, estimated time, and step-by-step.
        </p>
      </header>

      <div className="hti-grid">
        {howtos.map((h) => (
          <Link key={h.slug} href={`/how-to/${h.slug}`} className="hti-card">
            <h2 className="hti-card-title">{h.h1}</h2>
            <p className="hti-card-summary">{h.summary.slice(0, 160)}{h.summary.length > 160 ? '…' : ''}</p>
            <div className="hti-card-meta">
              <span>{h.steps.length} steps</span> · <span>{h.totalTime.replace('PT', '').replace('H', 'h').replace('M', 'min')}</span>
            </div>
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
      .hti-page { max-width: 1100px; margin: 0 auto; padding: 140px 24px 80px; font-family: 'Inter', system-ui, sans-serif; color: var(--color-text); }
      @media (max-width: 640px) { .hti-page { padding: 110px 16px 60px; } }
      .hti-header { text-align: center; margin-bottom: 56px; }
      .hti-eyebrow { display: inline-block; padding: 6px 14px; background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.3); border-radius: 999px; color: var(--color-cyan); font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 18px; }
      .hti-h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(28px, 4vw, 44px); line-height: 1.08; margin: 0 0 18px; }
      .hti-sub { color: var(--color-text-dim); font-size: 16px; line-height: 1.7; max-width: 620px; margin: 0 auto; }
      .hti-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(310px, 1fr)); gap: 14px; }
      .hti-card { display: flex; flex-direction: column; padding: 22px 24px; background: rgba(19,16,31,0.5); border: 1px solid var(--color-border); border-radius: 12px; text-decoration: none; color: inherit; transition: border 0.2s, transform 0.2s; }
      .hti-card:hover { border-color: var(--color-cyan); transform: translateY(-2px); }
      .hti-card-title { font-family: 'Space Grotesk', sans-serif; font-size: 16px; font-weight: 700; line-height: 1.35; color: var(--color-text); margin: 0 0 12px; }
      .hti-card-summary { color: var(--color-text-dim); font-size: 13px; line-height: 1.6; margin: 0 0 14px; flex: 1; }
      .hti-card-meta { font-size: 12px; color: var(--color-cyan); }
    `}</style>
  );
}
