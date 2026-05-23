import Link from 'next/link';

export const metadata = { title: 'Checkout cancelled' };

export default function CheckoutCancelPage() {
  return (
    <div className="ck-page">
      <div className="ck-card">
        <h1>No charge made.</h1>
        <p>You cancelled at checkout — totally fine. Nothing was billed and your basket is empty.</p>
        <p className="ck-meta">If something blocked the checkout, hit reply to <a href="mailto:srijanpaudelofficial@gmail.com">srijanpaudelofficial@gmail.com</a> and Arora will help.</p>
        <div className="ck-actions">
          <Link href="/digital-products" className="ck-btn-primary">Back to products</Link>
          <Link href="/roi-audit" className="ck-btn-secondary">Run the ROI Audit instead</Link>
        </div>
      </div>
      <style>{`
        .ck-page { background: #0A0613; color: #E5E7EB; min-height: 100vh; padding: 140px 24px 80px; font-family: 'Inter', system-ui, sans-serif; display: flex; align-items: center; justify-content: center; }
        .ck-card { max-width: 520px; padding: 48px 32px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 24px; text-align: center; }
        .ck-card h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 32px; margin-bottom: 12px; }
        .ck-card p { color: #9CA3B5; font-size: 15px; line-height: 1.6; margin-bottom: 12px; }
        .ck-meta { font-size: 13px; }
        .ck-meta a { color: #8B5CF6; }
        .ck-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 16px; }
        .ck-btn-primary { padding: 12px 24px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; text-decoration: none; }
        .ck-btn-secondary { padding: 12px 24px; background: transparent; color: #E5E7EB; border: 1px solid #2A1F3D; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; text-decoration: none; transition: all 0.2s; }
        .ck-btn-secondary:hover { border-color: #8B5CF6; color: #8B5CF6; }
      `}</style>
    </div>
  );
}
