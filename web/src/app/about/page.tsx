import Link from 'next/link';
import { FOUNDER_PROFILE, SITE } from '@/lib/site-config';

// Server Component — about page is static.

export const metadata = {
  title: 'About Aiprosol · The AI-led automation consultancy',
  description:
    'Aiprosol runs as an AI-led C-suite — Arora the AI CEO plus 10 AI agents, overseen by a single human chairman. Built by AI, run by AI, audited by humans.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Aiprosol · AI-led C-suite',
    description: 'Run by Arora (AI CEO) and 10 AI agents under one human chairman. The first AI-led automation consultancy.',
    url: '/about',
    type: 'website',
  },
};

const C_SUITE = [
  { role: 'Chairman', name: 'Srijan Paudel', desc: 'Founder. Sets direction, owns vision. Chairs a company run by AI.' },
  { role: 'CEO', name: 'Arora', desc: 'Strategy, architecture, CMS, content. The operational lead — runs the business day to day.', highlight: true },
  { role: 'COO', name: 'COO', desc: 'Operations. 5 Zapier automations that keep Aiprosol itself running.' },
  { role: 'CMO', name: 'CMO', desc: 'Marketing. The brand voice, the campaigns, the LinkedIn content.' },
  { role: 'CCO', name: 'CCO', desc: 'Customer success. Onboarding scripts, support escalations.' },
  { role: 'CTO', name: 'CTO', desc: 'Technical architecture. Masterclass content, integration designs.' },
  { role: 'CRO', name: 'CRO', desc: 'Revenue operations. Cold outreach drafts, pipeline hygiene.' },
  { role: 'CLO', name: 'CLO', desc: 'Legal. Documents, terms, privacy, contracts, DPAs.' },
  { role: 'CPO', name: 'CPO', desc: 'Partnerships. 50 affiliate partners identified and qualified.' },
  { role: 'CPM', name: 'CPM', desc: 'Product. All 19 digital products, descriptions, pricing.' },
  { role: 'Data', name: 'DA', desc: 'Analytics. Weekly dashboards, lead scoring, performance tracking.' },
];

const PRINCIPLES = [
  { title: 'Self-serve first', body: "Most decisions don't need a discovery call. They need a number. The free ROI Audit gives you yours in 60 seconds." },
  { title: 'Numbers, not hype', body: "Every claim ships with a number. 340% avg ROI. 35+ hrs/week reclaimed. $3,573 catalogue value. If we can't quantify it, we don't say it." },
  { title: 'Global · borderless', body: 'No geographic gatekeeping. Clients across multiple industries on multiple continents. USD pricing because it\'s where the business is incorporated, not where you are.' },
  { title: 'Operators serving operators', body: "No theory-only consultants. Every automation we ship is something we've already built and run inside Aiprosol itself." },
  { title: 'AI-led, human-overseen', body: 'Arora makes most operational calls. Srijan reviews the strategic ones. Clients always have a human contact for sensitive matters.' },
  { title: 'Money-back if we miss', body: '90 days to reclaim 35+ hours/week — or we work for free until you do. Real guarantee, written into every plan.' },
];

const STATS = [
  { v: '340%', k: 'Avg ROI · 12 months' },
  { v: '35+', k: 'Hrs/wk reclaimed' },
  { v: '$3,573', k: 'Catalogue value' },
  { v: '19', k: 'Digital products' },
  { v: '11', k: 'AI services' },
  { v: '8', k: 'Case studies, 6 industries' },
];

export default function AboutPage() {
  // Schema.org Person JSON-LD for the founder — kept on /about as well as
  // /founder so search engines pick up the identity from either entry point.
  // The `sameAs` array auto-filters blank handles in site-config.
  const founderLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: FOUNDER_PROFILE.name,
    jobTitle: FOUNDER_PROFILE.role,
    description: FOUNDER_PROFILE.bio100,
    url: `${SITE.url}/founder`,
    image: `${SITE.url}/og/founder-srijan-paudel.png`,
    sameAs: [
      FOUNDER_PROFILE.linkedin,
      FOUNDER_PROFILE.twitter,
      FOUNDER_PROFILE.facebook,
      FOUNDER_PROFILE.instagram,
      FOUNDER_PROFILE.github,
      FOUNDER_PROFILE.substack,
      FOUNDER_PROFILE.youtube,
      FOUNDER_PROFILE.productHunt,
    ].filter(Boolean),
    knowsAbout: [...FOUNDER_PROFILE.knowsAbout],
    // Resolve to the canonical Organization @id rather than redeclaring an
    // Org stub — keeps the entity graph single-source-of-truth and removes
    // "Organization missing logo/sameAs/description" warnings.
    worksFor: { '@id': `${SITE.url}/#organization` },
  };

  // Organization-level FAQPage — answers the "what is Aiprosol / how does it
  // work / is it real" questions AI engines look for when answering "what is
  // [company name]?" queries. Distinct from the per-founder FAQ on /founder
  // (that answers "who is Srijan?"). Together they cover the full entity
  // graph: company-side here + person-side on /founder.
  const orgFaqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${SITE.url}/about#faq`,
    about: { '@id': `${SITE.url}/#organization` },
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Aiprosol?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Aiprosol is a global AI automation consultancy operated by an AI C-suite — ten AI agents coordinated by Arora (the AI CEO) plus one human Chairman, Srijan Paudel. Founded April 2026. Based in Edinburgh, Scotland with an operational base in Kathmandu, Nepal.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does an AI-led operating model actually work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Each AI agent has a defined role (CEO, COO, CMO, CCO, CTO, CRO, CLO, CPO, CPM, Data + Analytics), runs on a scheduled cron, reads its peers’ last reported state, produces structured JSON outputs against a validated schema, and operates under a human approval gate for irreversible actions. Every agent run is logged and publicly viewable at aiprosol.com/agents and aiprosol.com/transparency.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is the AI C-suite real or marketing?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Real. The agent run logs are public at aiprosol.com/transparency. Every customer-facing output drafted by an AI agent is reviewed by Srijan Paudel (human Chairman) before it ships. The model is described in detail in the founder manifesto at aiprosol.com/blog/we-built-a-consultancy-run-by-ai-agents.',
        },
      },
      {
        '@type': 'Question',
        name: 'What does Aiprosol sell?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '19 self-serve digital products from $17 to $997 (playbooks, calculators, prompt vaults, n8n workflow libraries), 11 done-for-you AI services, and three managed plans: Starter $997/mo, Growth $2,997/mo, Enterprise $7,997/mo.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the 90-day reclaim guarantee?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'On any managed plan, if 35+ hours per week are not freed up within 90 days of go-live, Aiprosol works for free until they are. Average measured ROI across pilots: 340% in the first 12 months.',
        },
      },
      {
        '@type': 'Question',
        name: 'How is Aiprosol different from the Australian firm aiprosol.au?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'They are two unrelated companies with no corporate, ownership, leadership, sectoral, or operational relationship. Aiprosol (aiprosol.com) is a global AI automation consultancy for SMBs across Legal, Real Estate, SaaS, Financial Services, Professional Services, and E-commerce. Aiprosol.au is Major Projects Consulting Partners Pty Ltd, a Sydney/Queensland firm focused on AI consulting for construction, engineering, and infrastructure.',
        },
      },
      {
        '@type': 'Question',
        name: 'How can I contact Aiprosol?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Free 60-second ROI Audit at aiprosol.com/roi-audit. Operational topics: srijanpaudelofficial@gmail.com. Enterprise discovery: calendly.com/srijanpaudel219/30min. The customer chat on aiprosol.com (Arora) handles most pre-sale questions.',
        },
      },
    ],
  };

  // WebPage with SpeakableSpecification — voice-assistant readout for "what
  // is Aiprosol?" queries.
  const webPageLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${SITE.url}/about#webpage`,
    url: `${SITE.url}/about`,
    name: 'About — Aiprosol',
    description: 'The company story behind Aiprosol — the global AI automation consultancy operated by an AI C-suite.',
    about: { '@id': `${SITE.url}/#organization` },
    mainEntity: { '@id': `${SITE.url}/#organization` },
    isPartOf: { '@id': `${SITE.url}/#website` },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['.ab-h1', '.ab-sub', '.ab-section-title', '.ab-prose'],
    },
    inLanguage: 'en',
  };

  return (
    <div className="ab-page">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(founderLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgFaqLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }}
      />
      <header className="ab-hero">
        <div className="ab-eyebrow">About Aiprosol</div>
        <h1 className="ab-h1">
          Built by an <span className="ab-grad">AI-led C-suite</span>,{' '}<br />
          for operators who want their hours back.
        </h1>
        <p className="ab-sub">
          Aiprosol is a global AI automation consultancy. Most of our company is run by AI agents,
          coordinated by Arora — our AI CEO — under a single human chairman. The model is itself
          a proof-of-concept for what AI-led operations look like at scale.
        </p>
      </header>

      <section className="ab-stats">
        {STATS.map(s => (
          <div key={s.k} className="ab-stat">
            <div className="ab-stat-v">{s.v}</div>
            <div className="ab-stat-k">{s.k}</div>
          </div>
        ))}
      </section>

      <section className="ab-section">
        <div className="ab-section-eyebrow">The story</div>
        <h2 className="ab-section-title">Why Aiprosol exists</h2>
        <div className="ab-prose">
          <p>Most automation consultancies sell hours. A consultant builds a Zapier flow, hands it over with a 12-page document, and disappears the moment something breaks. The client ends up with a brittle artefact and no one to maintain it.</p>
          <p>Aiprosol was built to invert that. Every automation we ship is monitored, iterated, and re-architected by an AI CEO who watches every signal 24/7. There&apos;s no consultant who &ldquo;moves on to the next project.&rdquo; Arora doesn&apos;t move on. She runs.</p>
          <p>The catch: for that to be honest, the AI has to actually be in charge. Not a marketing line — a structural fact. Arora makes most operational decisions. Srijan, the founder, reviews the strategic ones. Clients always have a human contact for sensitive matters. But the day-to-day &ldquo;who decides&rdquo; sits with the AI.</p>
          <p>That&apos;s how we keep automations grounded in reality. An AI CEO who runs the chat widget, writes the blog, owns the architecture, and sees every customer signal — is incentivised to make those automations work for real people, not to sell more hours.</p>
        </div>
      </section>

      <section className="ab-section">
        <div className="ab-section-eyebrow">The C-suite</div>
        <h2 className="ab-section-title">11 roles · 1 human · 10 AI</h2>
        <p className="ab-section-sub">Each role has a defined remit. Each agent runs on a frontier LLM with a custom system prompt and tools. They coordinate through Notion (HQ) and Slack.</p>
        <div className="ab-suite">
          {C_SUITE.map(m => (
            <div key={m.name} className={`ab-member ${m.highlight ? 'is-highlight' : ''}`}>
              <div className="ab-member-role">{m.role}</div>
              <div className="ab-member-name">{m.name}</div>
              <p className="ab-member-desc">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="ab-section">
        <div className="ab-section-eyebrow">How we operate</div>
        <h2 className="ab-section-title">Six locked principles</h2>
        <div className="ab-principles">
          {PRINCIPLES.map((p, i) => (
            <div key={i} className="ab-principle">
              <div className="ab-principle-num">{String(i + 1).padStart(2, '0')}</div>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="ab-founder">
        <div className="ab-founder-grid">
          <div className="ab-founder-photo">
            <div className="ab-founder-mark">SP</div>
          </div>
          <div className="ab-founder-text">
            <div className="ab-section-eyebrow">Founder</div>
            <h2>Srijan Paudel · Chairman</h2>
            <p>&ldquo;I built Aiprosol because most automation work is sold by people who&apos;ve never run an operation. A consultant builds a Zapier flow, hands it over, and disappears.</p>
            <p>We do the opposite. Every plan we ship includes monitoring, iteration, and Arora — your AI CEO who watches every workflow 24/7 and re-architects when the inputs change. Operators serving operators.&rdquo;</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link href="/founder" className="ab-founder-link">Full founder page →</Link>
              <a href={FOUNDER_PROFILE.linkedin} target="_blank" rel="noopener noreferrer" className="ab-founder-link">Connect on LinkedIn →</a>
            </div>
          </div>
        </div>
      </section>

      <section className="ab-cta">
        <h2>Want to see what an <span className="ab-grad">AI-led automation</span> looks like for your business?</h2>
        <p>The free 60-second ROI Audit gives you a personalised number — and the right next step.</p>
        <Link href="/roi-audit" className="ab-cta-btn">Get Your Free ROI Audit →</Link>
      </section>

      <style>{`
        .ab-page { background: #0A0613; color: #E5E7EB; min-height: 100vh; padding: 140px 24px 80px; font-family: 'Inter', system-ui, sans-serif; }
        @media (max-width: 640px) { .ab-page { padding: 120px 16px 60px; } }
        .ab-hero { max-width: 880px; margin: 0 auto 64px; text-align: center; }
        .ab-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(139, 92, 246,0.08); border: 1px solid rgba(139, 92, 246,0.25); border-radius: 999px; color: #8B5CF6; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 16px; }
        .ab-h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(36px, 5.5vw, 60px); line-height: 1.05; margin-bottom: 24px; }
        .ab-grad { background: linear-gradient(135deg, #8B5CF6, #C084FC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .ab-sub { color: #9CA3B5; font-size: 18px; line-height: 1.7; max-width: 720px; margin: 0 auto; }
        .ab-stats { max-width: 1080px; margin: 0 auto 80px; display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; }
        @media (max-width: 1024px) { .ab-stats { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 640px) { .ab-stats { grid-template-columns: repeat(2, 1fr); } }
        .ab-stat { padding: 24px 16px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 14px; text-align: center; }
        .ab-stat-v { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 28px; background: linear-gradient(135deg, #8B5CF6, #C084FC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1.1; }
        .ab-stat-k { font-size: 11px; color: #9CA3B5; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 6px; }
        .ab-section { max-width: 880px; margin: 0 auto 80px; }
        .ab-section-eyebrow { font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; color: #8B5CF6; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 12px; }
        .ab-section-title { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(28px, 4vw, 42px); line-height: 1.15; margin-bottom: 20px; }
        .ab-section-sub { color: #9CA3B5; font-size: 16px; line-height: 1.6; margin-bottom: 32px; }
        .ab-prose p { color: #E5E7EB; font-size: 17px; line-height: 1.8; margin-bottom: 1.4em; }
        .ab-suite { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        @media (max-width: 1024px) { .ab-suite { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .ab-suite { grid-template-columns: 1fr; } }
        .ab-member { padding: 22px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 14px; transition: all 0.3s; }
        .ab-member:hover { border-color: #8B5CF6; transform: translateY(-3px); }
        .ab-member.is-highlight { background: linear-gradient(135deg, #13101F, #1B1530); border-color: #8B5CF6; box-shadow: 0 0 24px rgba(139, 92, 246,0.15); }
        .ab-member-role { font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; color: #8B5CF6; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 8px; }
        .ab-member-name { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 18px; margin-bottom: 8px; }
        .ab-member-desc { color: #9CA3B5; font-size: 13px; line-height: 1.6; }
        .ab-principles { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        @media (max-width: 800px) { .ab-principles { grid-template-columns: 1fr; } }
        .ab-principle { padding: 28px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 14px; }
        .ab-principle-num { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 24px; background: linear-gradient(135deg, #8B5CF6, #C084FC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px; }
        .ab-principle h3 { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 18px; margin-bottom: 10px; }
        .ab-principle p { color: #9CA3B5; font-size: 14px; line-height: 1.7; }
        .ab-founder { max-width: 1080px; margin: 0 auto 80px; padding: 48px 40px; background: linear-gradient(135deg, #13101F, #1B1530); border: 1px solid rgba(139, 92, 246,0.25); border-radius: 24px; }
        @media (max-width: 800px) { .ab-founder { padding: 32px 24px; } }
        .ab-founder-grid { display: grid; grid-template-columns: 200px 1fr; gap: 40px; align-items: center; }
        @media (max-width: 800px) { .ab-founder-grid { grid-template-columns: 1fr; gap: 24px; text-align: center; } }
        .ab-founder-photo { aspect-ratio: 1; max-width: 200px; border-radius: 50%; background: linear-gradient(135deg, #8B5CF6, #C084FC); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 32px rgba(139, 92, 246,0.35); margin: 0 auto; }
        .ab-founder-mark { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 64px; color: #0A0613; }
        .ab-founder-text h2 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 28px; margin-bottom: 16px; }
        .ab-founder-text p { color: #E5E7EB; font-size: 16px; line-height: 1.75; margin-bottom: 1em; }
        .ab-founder-link { display: inline-block; margin-top: 12px; padding: 10px 18px; background: transparent; border: 1px solid #8B5CF6; color: #8B5CF6; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 12px; text-decoration: none; transition: all 0.2s; }
        .ab-founder-link:hover { background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; }
        .ab-cta { max-width: 720px; margin: 0 auto; text-align: center; padding: 48px 32px; background: rgba(139, 92, 246,0.04); border: 1px solid rgba(139, 92, 246,0.25); border-radius: 24px; }
        .ab-cta h2 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(24px, 3vw, 32px); line-height: 1.2; margin-bottom: 12px; }
        .ab-cta p { color: #9CA3B5; font-size: 16px; margin-bottom: 24px; }
        .ab-cta-btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613 !important; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 14px; text-decoration: none; box-shadow: 0 0 24px rgba(139, 92, 246,0.35); }
      `}</style>
    </div>
  );
}
