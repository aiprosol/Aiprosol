import type { Metadata } from 'next';
import Link from 'next/link';
import industries from '@/content/industries.json';

export const metadata: Metadata = {
  title: 'AI Automation by Industry · Aiprosol',
  description: 'AI automation tailored to your industry: Legal, Real Estate, Financial Services, SaaS, Professional Services, E-commerce. Industry-specific use cases, compliance, and ROI benchmarks.',
  alternates: { canonical: '/industries' },
};

export default function IndustriesIndexPage() {
  return (
    <div className="indi-page">
      <header className="indi-header">
        <div className="indi-eyebrow">Industries</div>
        <h1 className="indi-h1">AI automation by industry</h1>
        <p className="indi-sub">
          Same architecture, different workflows. Each industry has its own compliance,
          integrations, and ROI benchmarks — pick yours.
        </p>
      </header>

      <div className="indi-grid">
        {industries.map((ind) => (
          <Link key={ind.slug} href={`/industries/${ind.slug}`} className="indi-card">
            <div className="indi-card-name">{ind.name}</div>
            <h2 className="indi-card-h">{ind.hero.tagline}</h2>
            <div className="indi-card-metric">{ind.metrics[0].value} {ind.metrics[0].label.toLowerCase()}</div>
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
      .indi-page { max-width: 1100px; margin: 0 auto; padding: 140px 24px 80px; font-family: 'Inter', system-ui, sans-serif; color: var(--color-text); }
      @media (max-width: 640px) { .indi-page { padding: 110px 16px 60px; } }
      .indi-header { text-align: center; margin-bottom: 56px; }
      .indi-eyebrow { display: inline-block; padding: 6px 14px; background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.3); border-radius: 999px; color: var(--color-cyan); font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 18px; }
      .indi-h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(28px, 4vw, 44px); line-height: 1.08; margin: 0 0 18px; }
      .indi-sub { color: var(--color-text-dim); font-size: 16px; line-height: 1.7; max-width: 580px; margin: 0 auto; }
      .indi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; }
      .indi-card { display: flex; flex-direction: column; padding: 22px 24px; background: rgba(19,16,31,0.5); border: 1px solid var(--color-border); border-radius: 12px; text-decoration: none; color: inherit; transition: border 0.2s, transform 0.2s; }
      .indi-card:hover { border-color: var(--color-cyan); transform: translateY(-2px); }
      .indi-card-name { font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--color-cyan); margin-bottom: 12px; }
      .indi-card-h { font-family: 'Space Grotesk', sans-serif; font-size: 15px; font-weight: 700; line-height: 1.45; color: var(--color-text); margin: 0 0 14px; }
      .indi-card-metric { font-size: 12px; color: var(--color-text-dim); }
    `}</style>
  );
}
