import Link from 'next/link';

export const metadata = { title: 'Downloads' };

export default function DownloadsPage() {
  return (
    <div className="dl-page">
      <div className="dl-card">
        <div className="dl-eyebrow">Downloads · Coming soon</div>
        <h1>Re-downloads are sent by email</h1>
        <p>
          Every product purchase emails you a permanent download link from <strong>srijanpaudelofficial@gmail.com</strong>.
          That link doesn&apos;t expire — bookmark it, save it to your password manager, or search your inbox
          for the original order email.
        </p>

        <div className="dl-actions">
          <Link href="/contact" className="dl-btn-primary">Need help finding your download?</Link>
          <Link href="/digital-products" className="dl-btn-secondary">Browse products</Link>
        </div>

        <div className="dl-meta">
          <strong>Lost your email?</strong>
          <p>
            Reply to <a href="mailto:srijanpaudelofficial@gmail.com">srijanpaudelofficial@gmail.com</a> with the email you used to purchase.
            We resend within 24 hours. The dashboard with self-service re-downloads ships in Phase 7.
          </p>
        </div>
      </div>

      <style>{`
        .dl-page { background: #0A0613; color: #E5E7EB; min-height: 100vh; padding: 140px 24px 80px; font-family: 'Inter', system-ui, sans-serif; display: flex; align-items: center; justify-content: center; }
        .dl-card { max-width: 600px; padding: 48px 40px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 24px; text-align: center; }
        @media (max-width: 640px) { .dl-card { padding: 32px 24px; } }
        .dl-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.3); border-radius: 999px; color: #F59E0B; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 16px; }
        .dl-card h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 28px; line-height: 1.1; margin-bottom: 16px; }
        .dl-card > p { color: #9CA3B5; font-size: 15px; line-height: 1.7; margin-bottom: 28px; }
        .dl-card > p strong { color: #8B5CF6; }
        .dl-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 32px; }
        .dl-btn-primary { padding: 12px 24px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; text-decoration: none; }
        .dl-btn-secondary { padding: 12px 24px; background: transparent; color: #E5E7EB; border: 1px solid #2A1F3D; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; text-decoration: none; transition: all 0.2s; }
        .dl-btn-secondary:hover { border-color: #8B5CF6; color: #8B5CF6; }
        .dl-meta { text-align: left; padding: 20px; background: rgba(139, 92, 246,0.04); border-left: 3px solid #8B5CF6; border-radius: 0 8px 8px 0; }
        .dl-meta strong { display: block; font-family: 'Space Grotesk', sans-serif; font-size: 12px; color: #8B5CF6; margin-bottom: 6px; }
        .dl-meta p { color: #E5E7EB; font-size: 13px; line-height: 1.7; margin: 0; }
        .dl-meta a { color: #8B5CF6; }
      `}</style>
    </div>
  );
}
