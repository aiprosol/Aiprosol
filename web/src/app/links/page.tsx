import Link from 'next/link';
import { FOUNDER_PROFILE, SITE } from '@/lib/site-config';

// AIPROSOL · /links — Srijan's link-in-bio hub
//
// The single destination for his Instagram/Facebook bio link (those apps allow
// only one link). Drives to the locked primary CTA (ROI Audit) first, then the
// rest of the funnel, then his socials. Mobile-first — most clicks arrive from
// inside the IG/FB app. Self-contained server component; not in nav/footer
// (external-entry page). Reuses FOUNDER_PROFILE + SITE so links never drift.
//
// Brand-locked: borderless (no geography), ROI Audit is the primary CTA,
// pre-incorporation (no "Ltd"), no fabricated metrics.

export const metadata = {
  title: 'Srijan Paudel · Founder & Chairman, Aiprosol',
  description: FOUNDER_PROFILE.bio50,
  alternates: { canonical: '/links' },
  openGraph: {
    title: 'Srijan Paudel · Founder & Chairman, Aiprosol',
    description: 'The only human at our AI-led C-suite. Start with a free ROI Audit.',
    url: '/links',
    type: 'profile',
    images: [`${SITE.url}/founder/opengraph-image`],
  },
};

// Funnel buttons — ROI Audit first (primary CTA per brand locks), then the rest.
const LINKS: { label: string; href: string; sub?: string; primary?: boolean }[] = [
  { label: '⚡ Free 60-second ROI Audit', href: '/roi-audit', sub: 'See where AI gives you your week back', primary: true },
  { label: 'Explore AI Services', href: '/services' },
  { label: 'Digital Products', href: '/digital-products' },
  { label: 'Why my CEO is an AI', href: '/founder' },
  { label: 'Meet the AI C-suite', href: '/agents' },
];

// Personal socials — pulled from the single source of truth; blanks auto-drop.
const SOCIALS: { label: string; href: string }[] = [
  { label: 'LinkedIn', href: FOUNDER_PROFILE.linkedin },
  { label: 'X', href: FOUNDER_PROFILE.twitter },
  { label: 'Facebook', href: FOUNDER_PROFILE.facebook },
  { label: 'Instagram', href: FOUNDER_PROFILE.instagram },
  { label: 'GitHub', href: FOUNDER_PROFILE.github },
  { label: 'Substack', href: FOUNDER_PROFILE.substack },
  { label: 'Email', href: `mailto:${SITE.founderEmail}` },
].filter((s) => Boolean(s.href));

export default function LinksPage() {
  return (
    <main className="lk-wrap">
      <div className="lk-card">
        {/* Avatar — monogram placeholder. To use a real headshot: drop a square
            image at /public/srijan.jpg and replace this block with
            <img className="lk-avatar" src="/srijan.jpg" alt="Srijan Paudel" />. */}
        <div className="lk-avatar" aria-hidden="true">SP</div>

        <h1 className="lk-name">Srijan Paudel</h1>
        <div className="lk-role">Founder &amp; Chairman · Aiprosol</div>
        <p className="lk-tag">The only human at our AI-led C-suite table.</p>

        <nav className="lk-links" aria-label="Aiprosol links">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={l.primary ? 'lk-btn lk-btn-primary' : 'lk-btn'}
            >
              <span className="lk-btn-label">{l.label}</span>
              {l.sub ? <span className="lk-btn-sub">{l.sub}</span> : null}
            </Link>
          ))}
        </nav>

        <div className="lk-socials" aria-label="Social profiles">
          {SOCIALS.map((s) => {
            const external = s.href.startsWith('http');
            return (
              <a
                key={s.label}
                href={s.href}
                className="lk-social"
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {s.label}
              </a>
            );
          })}
        </div>

        <footer className="lk-foot">
          <Link href="/" className="lk-foot-brand">Aiprosol</Link>
          <span className="lk-foot-tag">{SITE.tagline}</span>
        </footer>
      </div>

      <style>{`
        .lk-wrap {
          min-height: 100vh;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 56px 20px 64px;
          background:
            radial-gradient(60% 50% at 50% 0%, rgba(139, 92, 246, 0.16), transparent 70%),
            radial-gradient(40% 40% at 85% 20%, rgba(192, 132, 252, 0.08), transparent 70%),
            #0A0613;
          color: #E5E7EB;
          font-family: Inter, system-ui, -apple-system, sans-serif;
        }
        .lk-card {
          width: 100%;
          max-width: 480px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .lk-avatar {
          width: 96px; height: 96px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 800; font-size: 32px; letter-spacing: 0.04em;
          color: #0A0613;
          background: linear-gradient(135deg, #8B5CF6, #C084FC);
          box-shadow: 0 0 40px rgba(139, 92, 246, 0.4);
          object-fit: cover;
        }
        .lk-name {
          margin: 18px 0 0;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 800; font-size: 26px; line-height: 1.15;
        }
        .lk-role {
          margin-top: 6px;
          font-size: 14px; font-weight: 600; color: #C084FC;
          font-family: 'Space Grotesk', sans-serif;
        }
        .lk-tag {
          margin: 12px 0 0;
          font-size: 14px; line-height: 1.6; color: #9CA3B5;
          max-width: 340px;
        }
        .lk-links {
          width: 100%;
          display: flex; flex-direction: column; gap: 12px;
          margin-top: 30px;
        }
        .lk-btn {
          display: flex; flex-direction: column; align-items: center; gap: 2px;
          padding: 16px 20px;
          background: #13101F;
          border: 1px solid #2A1F3D;
          border-radius: 14px;
          color: #E5E7EB;
          text-decoration: none;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700; font-size: 15px;
          transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
        }
        .lk-btn:hover {
          transform: translateY(-2px);
          border-color: #8B5CF6;
          box-shadow: 0 8px 30px rgba(139, 92, 246, 0.18);
        }
        .lk-btn-primary {
          background: linear-gradient(135deg, #8B5CF6, #C084FC);
          border-color: transparent;
          color: #0A0613;
          box-shadow: 0 0 30px rgba(139, 92, 246, 0.35);
        }
        .lk-btn-primary:hover {
          box-shadow: 0 10px 38px rgba(139, 92, 246, 0.5);
          border-color: transparent;
        }
        .lk-btn-label { display: block; }
        .lk-btn-sub {
          font-family: Inter, sans-serif;
          font-weight: 500; font-size: 12px;
          color: rgba(10, 6, 19, 0.75);
        }
        .lk-btn:not(.lk-btn-primary) .lk-btn-sub { color: #9CA3B5; }
        .lk-socials {
          display: flex; flex-wrap: wrap; justify-content: center; gap: 8px;
          margin-top: 26px;
        }
        .lk-social {
          padding: 8px 14px;
          border: 1px solid #2A1F3D;
          border-radius: 999px;
          color: #C7CEDB;
          font-size: 13px; font-weight: 600;
          text-decoration: none;
          transition: border-color 0.18s ease, color 0.18s ease, background 0.18s ease;
        }
        .lk-social:hover {
          border-color: #8B5CF6;
          color: #fff;
          background: rgba(139, 92, 246, 0.08);
        }
        .lk-foot {
          margin-top: 36px;
          display: flex; flex-direction: column; gap: 4px;
          font-size: 12px; color: #6B7280;
        }
        .lk-foot-brand {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 800; font-size: 15px; color: #E5E7EB;
          text-decoration: none; letter-spacing: 0.02em;
        }
        .lk-foot-tag { color: #6B7280; }
      `}</style>
    </main>
  );
}
