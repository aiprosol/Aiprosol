import Link from 'next/link';

// Reusable legal page renderer for /terms, /privacy, /cookies, /refund-policy.

interface Section { heading: string; body: string; }
interface LegalDoc { slug: string; title: string; lastUpdated: string; sections: Section[]; }

export const LEGALS: Record<string, LegalDoc> = {
  terms: {
    slug: 'terms', title: 'Terms of Service', lastUpdated: '2026-05-07',
    sections: [
      { heading: '1. Acceptance', body: 'By using aiprosol.com (the "Service") or purchasing any product or plan from Aiprosol ("we", "us"), you agree to these Terms. If you do not agree, do not use the Service.' },
      { heading: '2. The Service', body: 'Aiprosol provides AI automation consultancy services, digital products, and managed automation plans. The scope of any specific engagement is defined in the relevant order, statement of work, or plan description.' },
      { heading: '3. Accounts', body: 'You are responsible for any account credentials you create. Notify us immediately of any unauthorised access. We may suspend accounts that violate these Terms.' },
      { heading: '4. Payments', body: 'All fees are in USD unless otherwise stated. Digital products are charged once. Managed plans are billed monthly in advance. Failed payments may result in suspension after 7 days.' },
      { heading: '5. Cancellation & refunds', body: 'Digital products: 7-day money-back guarantee, no questions asked. Starter and Growth plans: cancel any time, takes effect at the next billing cycle. Enterprise plans: 6-month minimum then month-to-month. See our Refund Policy at /refund-policy for full detail.' },
      { heading: '6. Acceptable use', body: 'You may not use the Service to (a) violate any law, (b) infringe intellectual property, (c) generate harmful content, (d) abuse rate limits, or (e) reverse-engineer or resell our technology except as a permitted affiliate.' },
      { heading: '7. Intellectual property', body: 'We retain ownership of our software, frameworks, and methodologies. You retain ownership of your data, inputs, and any derived outputs specific to your business. Anything we build for you under a managed plan is licensed to you in perpetuity.' },
      { heading: '8. Confidentiality', body: 'We treat all client data and business information as confidential. We do not train any third-party model on your data without explicit consent. Enterprise plans include a custom DPA.' },
      { heading: '9. Limitation of liability', body: 'To the maximum extent permitted by law, our liability is capped at the fees paid in the preceding 12 months. We are not liable for indirect or consequential damages.' },
      { heading: '10. Guarantees', body: 'Our 90-day reclaim guarantee on managed plans (35+ hrs/week reclaimed or we work for free) applies to clients who provide the documented inputs and access in a timely manner. Outcome guarantees do not apply if the client materially modifies the architecture without our involvement.' },
      { heading: '11. Termination', body: 'Either party may terminate any plan in line with the cancellation terms above. We may terminate immediately for material breach.' },
      { heading: '12. Governing law', body: 'These Terms are governed by the laws of England and Wales. Disputes are subject to the exclusive jurisdiction of the courts of England and Wales.' },
      { heading: '13. Contact', body: 'For any question about these Terms: srijanpaudelofficial@gmail.com.' },
    ],
  },
  privacy: {
    slug: 'privacy', title: 'Privacy Policy', lastUpdated: '2026-05-07',
    sections: [
      { heading: '1. What we collect', body: 'We collect information you provide directly (name, email, company, payment details), information from your use of the Service (page views, actions, IP, device), and information from third parties (auth providers, payment processors).' },
      { heading: '2. Why we collect it', body: 'To deliver the Service, process payments, communicate with you, improve the product, prevent abuse, and comply with legal obligations.' },
      { heading: '3. Lawful basis', body: 'We process personal data on the basis of contract performance (where you are a customer), legitimate interests (where lawful and not overridden by your rights), consent (for marketing communications), and legal obligation.' },
      { heading: '4. Sharing', body: 'We share data with payment processors (Stripe), email providers (Resend), analytics (Google Analytics), and our third-party LLM API providers (under enterprise-tier Zero-Data-Retention contracts where available). Each processor is contractually bound to confidentiality and a current list is available on request.' },
      { heading: '5. Retention', body: 'Customer data is retained for the duration of your relationship plus 6 years for accounting purposes. Marketing data is retained until you unsubscribe.' },
      { heading: '6. Your rights', body: 'You have the right to access, correct, delete, restrict processing, object, and port your personal data. To exercise any of these, email srijanpaudelofficial@gmail.com.' },
      { heading: '7. International transfers', body: 'Where data is transferred outside the UK/EEA, we rely on Standard Contractual Clauses or equivalent safeguards.' },
      { heading: '8. Security', body: 'We use industry-standard encryption in transit and at rest. Access is role-based and audited. Enterprise plans support custom DPAs and security reviews.' },
      { heading: '9. Cookies', body: 'See our Cookie Policy at /cookies.' },
      { heading: '10. Children', body: 'The Service is not directed at children under 16. We do not knowingly collect data from children.' },
      { heading: '11. Updates', body: 'We may update this policy. Material changes will be notified by email at least 30 days before they take effect.' },
      { heading: '12. Contact', body: 'Data Protection enquiries: srijanpaudelofficial@gmail.com.' },
    ],
  },
  cookies: {
    slug: 'cookies', title: 'Cookie Policy', lastUpdated: '2026-05-07',
    sections: [
      { heading: '1. What cookies we use', body: 'Essential cookies (session management, security), analytics cookies (usage tracking, only with consent), functional cookies (remembering preferences), and marketing cookies (only with consent, for retargeting).' },
      { heading: '2. Your choice', body: 'You can accept or decline non-essential cookies via the consent banner on first visit. You can change your preferences anytime via the cookie settings link in the footer.' },
      { heading: '3. Third-party cookies', body: 'Some pages may load cookies from Google Analytics, LinkedIn (insight tag), and Stripe (payment processing). These are subject to their own policies.' },
      { heading: '4. How long', body: 'Session cookies expire when you close your browser. Persistent cookies expire after a defined period (typically 30 days to 12 months depending on purpose).' },
      { heading: '5. Browser controls', body: 'You can disable cookies entirely via your browser settings. The Service may not function fully without essential cookies.' },
      { heading: '6. Contact', body: 'Cookie questions: srijanpaudelofficial@gmail.com.' },
    ],
  },
  'refund-policy': {
    slug: 'refund-policy', title: 'Refund Policy', lastUpdated: '2026-05-07',
    sections: [
      { heading: 'Digital products', body: '7-day no-questions-asked refund window. Reply to your order email within 7 days of purchase and we\'ll process the refund within 5 business days. Refunds are issued to the original payment method.' },
      { heading: 'Starter & Growth plans', body: 'Cancel anytime — takes effect at the end of the current billing cycle. No refunds on the current month, but no early-termination fees either.' },
      { heading: 'Enterprise plans', body: '6-month minimum because of architectural investment. After the minimum, cancel anytime with 30 days\' notice. Pro-rated refunds available only if Aiprosol fails to deliver the contracted scope.' },
      { heading: 'The 90-day guarantee', body: 'If a managed plan fails to reclaim 35+ hours/week within 90 days of go-live (and you have provided the documented inputs and access on time), we will work for free until you do. This is in addition to, not instead of, your cancellation rights.' },
      { heading: 'Disputes', body: 'If you believe a refund decision is incorrect, email srijanpaudelofficial@gmail.com with your order details. We respond within 3 business days.' },
    ],
  },
};

export function LegalPage({ slug }: { slug: keyof typeof LEGALS }) {
  const doc = LEGALS[slug];
  if (!doc) return null;

  return (
    <div className="lg-page">
      <div className="lg-shell">
        <header className="lg-head">
          <div className="lg-eyebrow">Aiprosol Legal</div>
          <h1 className="lg-title">{doc.title}</h1>
          <div className="lg-meta">Last updated: {doc.lastUpdated}</div>
        </header>

        <nav className="lg-nav">
          {Object.values(LEGALS).map(d => (
            <Link key={d.slug} href={`/${d.slug}`} className={`lg-nav-link ${d.slug === slug ? 'is-active' : ''}`}>
              {d.title}
            </Link>
          ))}
        </nav>

        <article className="lg-article">
          {doc.sections.map((s, i) => {
            // Heading-derived anchor — kebab-case + numbers stripped
            // ("10. Guarantees" → "guarantees"). Lets us deep-link
            // /terms#guarantees from the Hero pillar etc.
            const id = s.heading
              .toLowerCase()
              .replace(/^[\d.]+\s*/, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, '');
            // Special-case: also expose a stable `#guarantee` alias so
            // existing links from Hero/Pillar don't break if heading text changes.
            const aliasGuarantee = id === 'guarantees';
            return (
              <section key={i} id={id} className="lg-section">
                {aliasGuarantee && <span id="guarantee" />}
                <h2>{s.heading}</h2>
                <p>{s.body}</p>
              </section>
            );
          })}
          <div className="lg-disclaimer">
            <strong>Note:</strong> This document is provided for transparency. For specific advice, contact <a href="mailto:srijanpaudelofficial@gmail.com">srijanpaudelofficial@gmail.com</a>.
          </div>
        </article>
      </div>
      <style>{`
        .lg-page { background: #0A0613; color: #E5E7EB; min-height: 100vh; padding: 140px 24px 80px; font-family: 'Inter', system-ui, sans-serif; }
        @media (max-width: 640px) { .lg-page { padding: 120px 16px 60px; } }
        .lg-shell { max-width: 800px; margin: 0 auto; }
        .lg-head { margin-bottom: 32px; }
        .lg-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(139, 92, 246,0.08); border: 1px solid rgba(139, 92, 246,0.25); border-radius: 999px; color: #8B5CF6; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 14px; }
        .lg-title { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(32px, 4.5vw, 48px); line-height: 1.1; margin-bottom: 8px; }
        .lg-meta { font-size: 12px; color: #9CA3B5; }
        .lg-nav { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 1px solid #2A1F3D; }
        .lg-nav-link { padding: 7px 14px; background: #13101F; border: 1px solid #2A1F3D; color: #9CA3B5; border-radius: 999px; text-decoration: none; font-size: 12px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; transition: all 0.2s; }
        .lg-nav-link:hover { color: #8B5CF6; border-color: #8B5CF6; }
        .lg-nav-link.is-active { background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border-color: transparent; }
        .lg-article { display: flex; flex-direction: column; gap: 28px; }
        .lg-section h2 { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 19px; color: #8B5CF6; margin-bottom: 8px; }
        .lg-section p { color: #E5E7EB; font-size: 15px; line-height: 1.75; }
        .lg-disclaimer { margin-top: 16px; padding: 18px 20px; background: rgba(245,158,11,0.04); border: 1px solid rgba(245,158,11,0.25); border-radius: 12px; color: #E5E7EB; font-size: 13px; line-height: 1.6; }
        .lg-disclaimer strong { color: #F59E0B; }
        .lg-disclaimer a { color: #8B5CF6; }
      `}</style>
    </div>
  );
}
