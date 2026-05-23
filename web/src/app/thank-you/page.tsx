import Link from 'next/link';

export const metadata = {
  title: 'Thank you',
  description: 'Thank you. Your action is logged and any next-steps have been emailed to you.',
  alternates: { canonical: '/thank-you' },
  robots: { index: false, follow: true },
};

// Generic "thank you" landing — used by cold-outreach email replies and any
// non-checkout success states. Checkout-specific success lives at
// /checkout/success which carries the Stripe session_id and renders the
// download link.

export default function ThankYouPage() {
  return (
    <div className="ty-page">
      <div className="ty-card">
        <div className="ty-eyebrow">✓ Received</div>
        <h1>Thank you.</h1>
        <p className="ty-sub">
          Your action has been recorded. If a next step was promised — a follow-up email,
          a report, a download link — it&apos;s on its way to your inbox. Check spam if it
          doesn&apos;t land within 60 seconds.
        </p>
        <div className="ty-grid">
          <Link href="/roi-audit" className="ty-tile">
            <div className="ty-icon">⚡</div>
            <h3>Run an ROI Audit</h3>
            <p>60 seconds. Your projected savings + the right next step.</p>
          </Link>
          <Link href="/digital-products" className="ty-tile">
            <div className="ty-icon">▤</div>
            <h3>Browse products</h3>
            <p>19 self-serve toolkits from $17 to $997.</p>
          </Link>
          <Link href="/pricing" className="ty-tile">
            <div className="ty-icon">$</div>
            <h3>Compare plans</h3>
            <p>Starter · Growth · Enterprise. Cancel any month.</p>
          </Link>
        </div>
        <p className="ty-meta">
          Need anything? <a href="mailto:srijanpaudelofficial@gmail.com">srijanpaudelofficial@gmail.com</a>
        </p>
      </div>

      <style>{`
        .ty-page { background: #0A0613; color: #E5E7EB; min-height: 100vh; padding: 140px 24px 80px; font-family: 'Inter', system-ui, sans-serif; display: flex; align-items: center; justify-content: center; }
        .ty-card { width: 100%; max-width: 720px; padding: 48px 40px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 24px; text-align: center; }
        @media (max-width: 640px) { .ty-card { padding: 32px 24px; } }
        .ty-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 999px; color: #10B981; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 18px; }
        .ty-card h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(36px, 5vw, 52px); line-height: 1.1; margin: 0 0 14px; }
        .ty-sub { color: #9CA3B5; font-size: 16px; line-height: 1.7; margin: 0 0 36px; max-width: 540px; margin-left: auto; margin-right: auto; }
        .ty-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 32px; }
        @media (max-width: 640px) { .ty-grid { grid-template-columns: 1fr; } }
        .ty-tile { padding: 22px; background: #0A0613; border: 1px solid #2A1F3D; border-radius: 14px; text-decoration: none; color: #E5E7EB; transition: all 0.2s; text-align: left; }
        .ty-tile:hover { border-color: #8B5CF6; transform: translateY(-2px); }
        .ty-icon { width: 40px; height: 40px; background: rgba(139, 92, 246,0.08); border: 1px solid rgba(139, 92, 246,0.25); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; color: #8B5CF6; margin-bottom: 12px; }
        .ty-tile h3 { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 14px; margin: 0 0 4px; }
        .ty-tile p { color: #9CA3B5; font-size: 12px; line-height: 1.5; margin: 0; }
        .ty-meta { color: #9CA3B5; font-size: 13px; }
        .ty-meta a { color: #8B5CF6; }
      `}</style>
    </div>
  );
}
