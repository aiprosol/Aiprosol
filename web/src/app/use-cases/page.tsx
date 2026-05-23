import type { Metadata } from 'next';
import Link from 'next/link';
import useCases from '@/content/use-cases.json';

export const metadata: Metadata = {
  title: 'AI Automation Use Cases · Aiprosol',
  description: 'Specific use cases Aiprosol delivers: lead generation, customer support, document processing, sales pipeline. Outcomes, metrics, and FAQs per use case.',
  alternates: { canonical: '/use-cases' },
};

export default function UseCasesIndexPage() {
  return (
    <div className="uci-page">
      <header className="uci-header">
        <div className="uci-eyebrow">Use cases</div>
        <h1 className="uci-h1">Specific workflows we automate</h1>
        <p className="uci-sub">
          The most-requested use cases across Aiprosol&apos;s ICP. Each page covers outcomes, metrics, and FAQs — pick yours.
        </p>
      </header>

      <div className="uci-grid">
        {useCases.map((u) => (
          <Link key={u.slug} href={`/use-cases/${u.slug}`} className="uci-card">
            <h2 className="uci-card-title">{u.name}</h2>
            <p className="uci-card-tagline">{u.tagline}</p>
            <div className="uci-card-metric">
              <strong>{u.metrics[0].value}</strong> · {u.metrics[0].label}
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
      .uci-page { max-width: 1100px; margin: 0 auto; padding: 140px 24px 80px; font-family: 'Inter', system-ui, sans-serif; color: var(--color-text); }
      @media (max-width: 640px) { .uci-page { padding: 110px 16px 60px; } }
      .uci-header { text-align: center; margin-bottom: 56px; }
      .uci-eyebrow { display: inline-block; padding: 6px 14px; background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.3); border-radius: 999px; color: var(--color-cyan); font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 18px; }
      .uci-h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(28px, 4vw, 44px); line-height: 1.08; margin: 0 0 18px; }
      .uci-sub { color: var(--color-text-dim); font-size: 16px; line-height: 1.7; max-width: 580px; margin: 0 auto; }
      .uci-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 14px; }
      .uci-card { display: flex; flex-direction: column; padding: 24px 26px; background: rgba(19,16,31,0.5); border: 1px solid var(--color-border); border-radius: 12px; text-decoration: none; color: inherit; transition: border 0.2s, transform 0.2s; }
      .uci-card:hover { border-color: var(--color-cyan); transform: translateY(-2px); }
      .uci-card-title { font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 700; color: var(--color-text); margin: 0 0 10px; }
      .uci-card-tagline { color: var(--color-text-dim); font-size: 13px; line-height: 1.6; margin: 0 0 16px; flex: 1; }
      .uci-card-metric { font-size: 12px; color: var(--color-cyan); }
      .uci-card-metric strong { font-family: 'Space Grotesk', sans-serif; color: var(--color-text); font-size: 14px; font-weight: 700; }
    `}</style>
  );
}
