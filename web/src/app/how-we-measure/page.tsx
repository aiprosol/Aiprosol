import Link from 'next/link';
import type { Metadata } from 'next';

// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · HOW WE MEASURE — methodology disclosure
//
// Linked from any place we cite an aggregate ROI / hours-saved number.
// This page exists to keep us honest: every projected figure on the site
// has a stated source, sample size, and computation method.
// ─────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'How we measure · Methodology disclosure',
  description:
    'Where the 340% projected ROI and 35+ hrs/week reclaimed numbers come from. Sources, sample sizes, computation method, and what we will swap out once trailing client data exists.',
};

export default function HowWeMeasurePage() {
  return (
    <div className="hwm-page">
      <header className="hwm-header">
        <div className="hwm-eyebrow">● Methodology disclosure</div>
        <h1 className="hwm-h1">
          Where the <span className="hwm-grad">numbers</span> come from.
        </h1>
        <p className="hwm-sub">
          Aiprosol is in its first months of live operation. The headline figures we publish are
          <strong> projections from audit data and pilot benchmarks</strong>, not trailing averages
          across paying customers. This page documents exactly how each number is computed and what
          will replace it once we&apos;ve banked a quarter of compounding client data.
        </p>
      </header>

      <Section
        eyebrow="Projected"
        title="“340% Average ROI · 12 months”"
        body={[
          'Computed from Stage 1 ROI audits run by Arora over the last 60 days. Each audit takes a prospect&apos;s declared inputs (employees, manual hours/week, hourly cost, monthly revenue band) and runs them through the same calculator visible at /roi-simulator.',
          'Sample: Stage 1 audits where the prospect provided all required inputs (N varies — see Live Results page for current count). The 340% figure is the median 12-month ROI across that set, computed as `(annual saving − annual plan cost) / annual plan cost × 100`.',
          'Not a trailing average across paid engagements. The first three closed engagements will replace this figure with trailing data — at which point this footnote and asterisks come down.',
        ]}
      />

      <Section
        eyebrow="Projected"
        title="“35+ hours / week reclaimed”"
        body={[
          'Computed as the median weekly hours saved across the same Stage 1 audit set. Specifically: declared `manualHoursPerWeek × employees × automation reduction factor`, where the reduction factor is benchmarked from public industry case-study averages (Zapier 2024 SMB Productivity Report, McKinsey Q4 2024 SMB AI Index, plus our own internal pilot runs).',
          'The “+” is intentional: floor figure rather than mean. We never round up. If the median for a given month dips below 35, we either change the figure or change the bracket of audits we average over (with a public note in the changelog at the bottom of this page).',
        ]}
      />

      <Section
        eyebrow="Verifiable"
        title="“$3,573 catalogue value”"
        body={[
          'Sum of every individual product price in /digital-products. As of 2026-05-09 the catalogue contains 19 products priced from $17 to $997. The figure updates automatically when products are added or repriced — see src/content/products.json in our public repo (link forthcoming).',
        ]}
      />

      <Section
        eyebrow="Verifiable"
        title="“19 products · 11 services · 7 industries · 21 FAQs”"
        body={[
          'Direct counts of items in our content seeds. No interpretation, no rounding. Cross-checked at every page where a count is displayed — if you spot a mismatch, mail srijanpaudelofficial@gmail.com.',
        ]}
      />

      <Section
        eyebrow="Honest"
        title="What we will not do"
        body={[
          'We will not present projection data styled as trailing data. That is why every projected figure on the site carries an asterisk linking back to this page.',
          'We will not run a fake live-counter. The “Live · automations running globally” pill on the home page is currently labelled “projected workload” — it is a model, not a real-time meter, and we are removing the visual ambiguity that suggests otherwise.',
          'We will not republish any client&apos;s number without their written sign-off, anonymised on request, and the option to withdraw at any time.',
          'We will not raise charter pricing on the first ten engagements. Ever.',
        ]}
      />

      <section className="hwm-changelog">
        <h2 className="hwm-h2">Changelog</h2>
        <p className="hwm-changelog-row"><strong>2026-05-09</strong> — page published. All headline figures currently flagged as projected.</p>
        <p className="hwm-changelog-row hwm-changelog-future">2026-Q3 (target) — first three closed engagements; trailing data replaces projections; asterisks come down for those metrics.</p>
      </section>

      <section className="hwm-cta-section">
        <h2 className="hwm-h2">If this kind of transparency matters to you</h2>
        <p className="hwm-cta-sub">It matters to us too. Charter pricing for the first ten engagements is open.</p>
        <div className="hwm-cta-row">
          <Link href="/roi-audit" className="hwm-cta hwm-cta-primary">Run your free ROI Audit →</Link>
          <Link href="/agents" className="hwm-cta hwm-cta-secondary">See the live AI C-Suite</Link>
        </div>
      </section>

      <Styles />
    </div>
  );
}

function Section({ eyebrow, title, body }: { eyebrow: string; title: string; body: string[] }) {
  return (
    <section className="hwm-section">
      <div className="hwm-section-eyebrow">{eyebrow}</div>
      <h2 className="hwm-h2">{title}</h2>
      {body.map((p, i) => (
        <p key={i} className="hwm-prose" dangerouslySetInnerHTML={{ __html: p }} />
      ))}
    </section>
  );
}

function Styles() {
  return (
    <style>{`
      .hwm-page { max-width: 880px; margin: 0 auto; padding: 100px 24px 80px; font-family: 'Inter', system-ui, sans-serif; color: #E5E7EB; }
      .hwm-header { margin-bottom: 56px; }
      .hwm-eyebrow { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border: 1px solid rgba(245, 158, 11, 0.3); background: rgba(245, 158, 11, 0.05); color: #F59E0B; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; border-radius: 999px; margin-bottom: 18px; }
      .hwm-h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(34px,5vw,56px); line-height: 1.05; margin-bottom: 18px; }
      .hwm-grad { background: linear-gradient(135deg, #8B5CF6, #C084FC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .hwm-sub { color: #C7CEDB; font-size: 16px; line-height: 1.7; }
      .hwm-sub strong { color: #E5E7EB; }

      .hwm-section { margin-bottom: 40px; padding: 24px 26px; background: rgba(19, 16, 31, 0.55); border: 1px solid rgba(139,92,246,0.18); border-radius: 14px; }
      .hwm-section-eyebrow { display: inline-block; padding: 3px 10px; border-radius: 999px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 10px; }
      .hwm-section:nth-of-type(odd) .hwm-section-eyebrow { background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); color: #F59E0B; }
      .hwm-section:nth-of-type(even) .hwm-section-eyebrow { background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); color: #10B981; }
      .hwm-h2 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 22px; margin-bottom: 14px; }
      .hwm-prose { color: #C7CEDB; font-size: 14px; line-height: 1.75; margin-bottom: 12px; }
      .hwm-prose:last-child { margin-bottom: 0; }
      .hwm-prose code { background: rgba(0,0,0,0.4); padding: 2px 6px; border-radius: 4px; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 13px; color: #C084FC; }

      .hwm-changelog { padding: 22px 26px; border-top: 1px solid rgba(139,92,246,0.18); margin-top: 56px; margin-bottom: 56px; }
      .hwm-changelog-row { font-size: 13px; color: #C7CEDB; margin-bottom: 8px; line-height: 1.6; }
      .hwm-changelog-row strong { color: #C084FC; font-family: 'Space Grotesk', sans-serif; margin-right: 8px; }
      .hwm-changelog-future { color: #6B7585; }

      .hwm-cta-section { text-align: center; padding: 36px 28px; background: rgba(192, 132, 252, 0.06); border: 1px solid rgba(192, 132, 252, 0.22); border-radius: 16px; }
      .hwm-cta-sub { color: #9CA3B5; font-size: 14px; margin-bottom: 18px; }
      .hwm-cta-row { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
      .hwm-cta { display: inline-flex; gap: 8px; padding: 12px 22px; border-radius: 12px; font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 13px; text-decoration: none; transition: transform 0.22s; }
      .hwm-cta:hover { transform: translateY(-2px); }
      .hwm-cta-primary { background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; box-shadow: 0 8px 22px rgba(139,92,246,0.3); }
      .hwm-cta-secondary { color: #E5E7EB; border: 1px solid rgba(139,92,246,0.32); }
    `}</style>
  );
}
