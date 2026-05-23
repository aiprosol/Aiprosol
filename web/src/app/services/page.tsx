import Link from 'next/link';
import { getServices } from '@/lib/content';

// Server Component — static data, no client interactivity needed.

export const metadata = {
  title: 'AI Services · 11 done-for-you automations',
  description:
    '11 AI services from Aiprosol — workflow automation, custom chatbots, lead gen, document processing. Each engineered to prove ROI within weeks.',
  alternates: { canonical: '/services' },
  openGraph: {
    title: 'AI Services · Aiprosol',
    description: '11 AI services — workflow automation, chatbots, lead gen, document processing. Done-for-you, ROI in weeks.',
    url: '/services',
    type: 'website',
  },
};

export default function ServicesPage() {
  const services = getServices();

  return (
    <div className="sl-page">
      <header className="sl-hero">
        <div className="sl-eyebrow">11 AI Services · across 6 industries</div>
        <h1 className="sl-h1">
          From <span className="sl-grad">manual chaos</span>{' '}<br />
          to self-running systems
        </h1>
        <p className="sl-sub">
          Pick the service that matches the bottleneck. Each one is engineered to prove its value
          financially within weeks, not quarters.
        </p>
      </header>

      <div className="sl-grid">
        {services.map(s => (
          <Link key={s.slug} href={`/services/${s.slug}`} className="sl-card">
            <div className="sl-card-img">
              <img src={`/api/og/service/${s.slug}`} alt={s.title} loading="lazy" width={640} height={360} />
            </div>
            <div className="sl-card-body">
              <h3>{s.title}</h3>
              <p>{s.shortDescription}</p>
              <div className="sl-card-foot">
                <span className={`sl-tier sl-tier-${s.planMatch}`}>{s.planMatch} tier</span>
                <span className="sl-link">Learn more →</span>
              </div>
            </div>
          </Link>
        ))}

        {/* Final card pointing back to ROI Audit */}
        <Link href="/roi-audit" className="sl-card sl-card-cta">
          <div className="sl-card-icon">🚀</div>
          <h3>Not sure which fits?</h3>
          <p>Take the free ROI Audit — Arora recommends the exact service, plan, or product based on your numbers.</p>
          <span className="sl-link">Run the audit →</span>
        </Link>
      </div>

      <section className="sl-cta-final">
        <h2>Want this in your business?</h2>
        <p>Run the free 60-second ROI Audit — Arora confirms which service is the right place to start.</p>
        <Link href="/roi-audit" className="sl-cta-btn">Get Your Free ROI Audit →</Link>
      </section>

      <style>{`
        .sl-page { background: #0A0613; color: #E5E7EB; min-height: 100vh; padding: 140px 24px 80px; font-family: 'Inter', system-ui, sans-serif; }
        @media (max-width: 640px) { .sl-page { padding: 120px 16px 60px; } }

        .sl-hero { max-width: 760px; margin: 0 auto 56px; text-align: center; }
        .sl-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(139, 92, 246,0.08); border: 1px solid rgba(139, 92, 246,0.25); border-radius: 999px; color: #8B5CF6; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; }
        .sl-h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(32px, 5vw, 56px); line-height: 1.05; margin-bottom: 16px; }
        .sl-grad { background: linear-gradient(135deg, #8B5CF6, #C084FC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .sl-sub { color: #9CA3B5; font-size: 17px; line-height: 1.6; }

        .sl-grid { max-width: 1280px; margin: 0 auto 80px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        @media (max-width: 1024px) { .sl-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .sl-grid { grid-template-columns: 1fr; } }

        .sl-card { display: flex; flex-direction: column; background: #13101F; border: 1px solid #2A1F3D; border-radius: 16px; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); position: relative; overflow: hidden; text-decoration: none; color: inherit; }
        .sl-card:hover { transform: translateY(-4px); border-color: #8B5CF6; box-shadow: 0 0 24px rgba(139, 92, 246,0.18); }
        .sl-card-img { aspect-ratio: 16/9; background: #0A0613; overflow: hidden; }
        .sl-card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        .sl-card:hover .sl-card-img img { transform: scale(1.05); }
        .sl-card-body { padding: 22px; flex: 1; display: flex; flex-direction: column; }
        .sl-card-cta { background: linear-gradient(135deg, rgba(139, 92, 246,0.05), rgba(192, 132, 252,0.03)); border-color: rgba(139, 92, 246,0.4); padding: 28px; }

        .sl-card-icon { width: 56px; height: 56px; border-radius: 14px; background: rgba(139, 92, 246,0.08); border: 1px solid rgba(139, 92, 246,0.25); display: flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 20px; }
        .sl-card h3 { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 18px; line-height: 1.25; margin-bottom: 12px; color: #E5E7EB; }
        .sl-card p { color: #9CA3B5; font-size: 14px; line-height: 1.6; flex: 1; margin-bottom: 18px; }
        .sl-card-foot { display: flex; justify-content: space-between; align-items: center; padding-top: 14px; border-top: 1px solid rgba(30,58,95,0.5); }
        .sl-tier { font-family: 'Space Grotesk', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 8px; border-radius: 999px; }
        .sl-tier-starter { background: rgba(139, 92, 246,0.08); color: #8B5CF6; }
        .sl-tier-growth { background: rgba(192, 132, 252,0.08); color: #C084FC; }
        .sl-tier-enterprise { background: rgba(245,158,11,0.08); color: #F59E0B; }
        .sl-link { font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; color: #8B5CF6; text-transform: uppercase; letter-spacing: 0.08em; }

        .sl-cta-final { max-width: 720px; margin: 0 auto; text-align: center; padding: 48px 32px; background: rgba(139, 92, 246,0.04); border: 1px solid rgba(139, 92, 246,0.25); border-radius: 24px; }
        .sl-cta-final h2 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 28px; margin-bottom: 8px; }
        .sl-cta-final p { color: #9CA3B5; font-size: 15px; margin-bottom: 24px; }
        .sl-cta-btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 14px; text-decoration: none; box-shadow: 0 0 24px rgba(139, 92, 246,0.35); }
      `}</style>
    </div>
  );
}
