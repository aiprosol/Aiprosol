import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getCaseStudies } from '@/lib/content';
import { getProfileByEmail } from '@/lib/profiles';

export const metadata = { title: 'Dashboard' };
export const dynamic = 'force-dynamic';

// Industry → case-study slug mapping. NOTE: case-studies.json is empty during
// the charter-customer phase, so featuredCase resolves to undefined and the
// spotlight is hidden (guarded below). This map is dormant until REAL, named
// case studies exist — do not point it at illustrative/fabricated slugs.
const INDUSTRY_TO_CASE: Record<string, string> = {
  'Legal': 'hargreaves-sterling',
  'Real Estate': 'meridian',
  'Manufacturing': 'vortex',
  'Retail': 'thornfield',
  // Reasonable adjacencies
  'Financial Services': 'hargreaves-sterling', // doc-heavy compliance work
  'Professional Services': 'hargreaves-sterling',
  'E-commerce': 'thornfield',
  'SaaS': 'meridian',                          // lead-response wins
  'Healthcare': 'hargreaves-sterling',         // doc + intake
  'Other': 'hargreaves-sterling',
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login?next=/dashboard');
  }

  // Prefer Supabase (full picture, bio, etc.); fall back to JWT summary for
  // the 4 core fields if DB is unavailable so the dashboard never blanks out.
  const dbProfile = await getProfileByEmail(session.email);
  const profile = dbProfile ?? session.profile ?? {};
  const firstName = (profile.name || session.email).split(/\s|@/)[0];
  const initial = (profile.name || session.email).charAt(0).toUpperCase();
  const pictureUrl = dbProfile?.picture || null;
  const memberSince = new Date(session.iat * 1000).toLocaleDateString('en-GB', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  // Pick a case study to surface — industry-relevant if the user has one.
  // During the charter phase getCaseStudies() is empty, so this resolves to
  // undefined and the spotlight below is hidden.
  const cases = getCaseStudies();
  const caseSlug = (profile.industry && INDUSTRY_TO_CASE[profile.industry]) || 'hargreaves-sterling';
  const featuredCase = cases.find(c => c.slug === caseSlug) || cases[0];
  const industryLabel = profile.industry || 'your stage';

  return (
    <div className="db-page">
      <div className="db-card">
        <div className="db-eyebrow">Account</div>

        <div className="db-head">
          {pictureUrl ? (
            // Real OAuth avatar — referrerPolicy=no-referrer because Google's
            // CDN sometimes 403s requests with a strict referrer.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={pictureUrl}
              alt={`${firstName}'s avatar`}
              className="db-avatar db-avatar-img"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="db-avatar">{initial}</div>
          )}
          <div>
            <h1>Welcome back, {firstName}.</h1>
            <p className="db-email">{session.email}</p>
            <p className="db-meta-line">
              Signed in since {memberSince}
              {profile.company && <> · <span style={{ color: '#C7CEDB' }}>{profile.company}</span></>}
              {profile.role && <> · {profile.role}</>}
            </p>
          </div>
        </div>

        <p className="db-intro">
          Run the ROI Audit, browse the catalogue, manage your downloads — every action below is now logged
          to your account so we can resend, follow up, or pick up where you left off.
        </p>

        {/* Personalised case-study spotlight — shown when the user has an
            industry on file (or via the fallback mapping above). */}
        {featuredCase && (
          <Link href={`/case-studies/${featuredCase.slug}`} className="db-spotlight">
            <div className="db-spot-eyebrow">
              {profile.industry ? `Most relevant to ${industryLabel}` : 'Highest-impact result so far'}
            </div>
            <div className="db-spot-headline">
              {featuredCase.companyName || (featuredCase as { client?: string }).client} ·{' '}
              <span className="db-spot-metric">
                {featuredCase.metric1Value || featuredCase.headline || '—'}
              </span>
            </div>
            <div className="db-spot-cta">Read the case →</div>
          </Link>
        )}

        <div className="db-grid">
          <Link href="/roi-audit" className="db-tile">
            <div className="db-tile-icon">⚡</div>
            <h3>Run an ROI Audit</h3>
            <p>{profile.industry ? 'Your industry is pre-filled. 60 seconds.' : '60-second audit. Numbers tailored to your inputs.'}</p>
          </Link>
          <Link href="/digital-products" className="db-tile">
            <div className="db-tile-icon">▤</div>
            <h3>Browse products</h3>
            <p>19 digital products, $17 to $997.</p>
          </Link>
          <Link href="/services" className="db-tile">
            <div className="db-tile-icon">◈</div>
            <h3>See services</h3>
            <p>11 AI services with case studies.</p>
          </Link>
          <Link href="/pricing" className="db-tile">
            <div className="db-tile-icon">$</div>
            <h3>Compare plans</h3>
            <p>Starter · Growth · Enterprise.</p>
          </Link>
          <Link href="/account/downloads" className="db-tile">
            <div className="db-tile-icon">⬇</div>
            <h3>Downloads</h3>
            <p>Re-download products you&apos;ve purchased.</p>
          </Link>
          <Link href="/contact" className="db-tile">
            <div className="db-tile-icon">✉</div>
            <h3>Get help</h3>
            <p>Ask Arora — 24h reply.</p>
          </Link>
          <Link href="/settings" className="db-tile">
            <div className="db-tile-icon">⚙</div>
            <h3>Settings</h3>
            <p>Profile, sign-in, danger zone.</p>
          </Link>
        </div>

        <div className="db-footer">
          <div className="db-meta">
            <strong>Order history &amp; ROI audit history</strong>
            <p>
              Coming next — once we&apos;ve persisted purchases and audits to your account, this dashboard becomes
              the one stop for everything you do at Aiprosol.
              {!profile.industry && (
                <> Want a faster ROI Audit? <Link href="/settings">Fill in your profile</Link> — it pre-fills the form.</>
              )}
            </p>
          </div>
          <a href="/api/auth/logout" className="db-logout">Sign out</a>
        </div>
      </div>

      <style>{`
        .db-page { background: #0A0613; color: #E5E7EB; min-height: 100vh; padding: 140px 24px 80px; font-family: 'Inter', system-ui, sans-serif; display: flex; align-items: center; justify-content: center; }
        .db-card { width: 100%; max-width: 880px; padding: 44px 40px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 24px; }
        @media (max-width: 640px) { .db-card { padding: 32px 24px; } }
        .db-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(139, 92, 246,0.08); border: 1px solid rgba(139, 92, 246,0.25); border-radius: 999px; color: #8B5CF6; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 18px; }
        .db-head { display: flex; align-items: center; gap: 18px; margin-bottom: 20px; }
        .db-avatar { width: 60px; height: 60px; border-radius: 16px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; display: inline-flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 26px; flex-shrink: 0; box-shadow: 0 0 24px rgba(139,92,246,0.35); }
        .db-avatar-img { object-fit: cover; background: #13101F; }
        .db-card h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(26px, 3.4vw, 32px); line-height: 1.1; margin: 0 0 6px; }
        .db-email { color: #C7CEDB; font-size: 15px; margin: 0 0 4px; word-break: break-all; }
        .db-meta-line { color: #9CA3B5; font-size: 12px; margin: 0; }
        .db-intro { color: #9CA3B5; font-size: 14px; line-height: 1.7; margin: 0 0 22px; }
        .db-spotlight { display: block; padding: 22px 26px; background: linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(192, 132, 252, 0.04)); border: 1px solid rgba(139, 92, 246, 0.35); border-radius: 16px; text-decoration: none; color: inherit; margin-bottom: 26px; transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s; }
        .db-spotlight:hover { transform: translateY(-2px); border-color: #8B5CF6; box-shadow: 0 0 28px rgba(139, 92, 246, 0.25); }
        .db-spot-eyebrow { font-family: 'Space Grotesk', sans-serif; font-size: 10px; font-weight: 700; color: #C084FC; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 8px; }
        .db-spot-headline { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 18px; line-height: 1.3; color: #E5E7EB; margin-bottom: 8px; }
        .db-spot-metric { background: linear-gradient(135deg, #8B5CF6, #C084FC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .db-spot-cta { font-family: 'Space Grotesk', sans-serif; font-size: 12px; font-weight: 700; color: #8B5CF6; letter-spacing: 0.08em; }
        .db-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 32px; }
        @media (max-width: 800px) { .db-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .db-grid { grid-template-columns: 1fr; } }
        .db-tile { padding: 22px; background: #0A0613; border: 1px solid #2A1F3D; border-radius: 14px; text-decoration: none; color: #E5E7EB; transition: all 0.2s; display: block; }
        .db-tile:hover { border-color: #8B5CF6; transform: translateY(-2px); }
        .db-tile-icon { width: 40px; height: 40px; background: rgba(139, 92, 246,0.08); border: 1px solid rgba(139, 92, 246,0.25); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; color: #8B5CF6; margin-bottom: 12px; }
        .db-tile h3 { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 14px; margin: 0 0 4px; }
        .db-tile p { color: #9CA3B5; font-size: 12px; line-height: 1.5; margin: 0; }
        .db-footer { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 16px; padding-top: 20px; border-top: 1px solid #2A1F3D; }
        .db-meta { flex: 1; min-width: 280px; padding: 16px; background: rgba(139, 92, 246,0.04); border-left: 3px solid #8B5CF6; border-radius: 0 8px 8px 0; }
        .db-meta strong { display: block; font-family: 'Space Grotesk', sans-serif; font-size: 12px; color: #8B5CF6; margin-bottom: 4px; }
        .db-meta p { color: #C7CEDB; font-size: 13px; line-height: 1.6; margin: 0; }
        .db-meta a { color: #8B5CF6; }
        .db-logout { padding: 10px 16px; color: #9CA3B5; border: 1px solid #2A1F3D; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 12px; text-decoration: none; transition: all 0.2s; align-self: center; }
        .db-logout:hover { color: #EF4444; border-color: #EF4444; }
      `}</style>
    </div>
  );
}
