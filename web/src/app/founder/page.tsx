import Link from 'next/link';
import { FOUNDER_PROFILE, SITE } from '@/lib/site-config';

// AIPROSOL · Founder page
//
// Single dedicated identity surface for Srijan Paudel — separate from
// /about (which is the *company* page). The two pages cross-link.
//
// What this page does:
// 1. Hosts the founder bio in three lengths (50 / 100 / 200 words) so any
//    press / podcast / guest-post can be pulled off the page directly.
// 2. Renders the Schema.org Person JSON-LD with `sameAs` pointing at every
//    claimed external profile. Google merges these into one Knowledge
//    Graph identity over 60–90 days.
// 3. Acts as the canonical destination Srijan can link to from every
//    external bio (LinkedIn, X, GitHub, Substack, podcast hosts, etc.).
//
// Brand-locked: USD, global, no UK refs in copy; Arora is the AI CEO
// externally (never "Mama" / "Claude"); ROI Audit is the primary CTA.

export const metadata = {
  title: 'Srijan Paudel · Founder & Chairman, Aiprosol',
  description:
    'Srijan Paudel is the Founder & Chairman of Aiprosol — the only human at an AI-led C-suite. Bio, links, and how to get in touch.',
  alternates: { canonical: '/founder' },
  openGraph: {
    title: 'Srijan Paudel · Founder & Chairman, Aiprosol',
    description:
      'The only human at our AI-led C-suite. Founder of Aiprosol — global AI automation consultancy.',
    url: '/founder',
    type: 'profile',
  },
};

// Reuse the same anchor metric tiles as /about so the two pages feel like a set.
const STATS = [
  { v: '11', k: 'C-suite seats · 1 human, 10 AI' },
  { v: '~80%', k: 'Ops decisions made by Arora' },
  { v: '340%', k: 'Avg measured ROI · 12 months' },
  { v: '90-day', k: 'Reclaim guarantee' },
];

const ONLY_HUMAN_DOES = [
  'Picks the customers we say no to.',
  'Looks at the bottom 10% of reviews and decides what to change.',
  'Makes the hire-or-fire-a-contractor call.',
  'Decides which case study to invest in marketing.',
  'Tells Arora when she\'s wrong.',
];

const AI_HANDLES = [
  'Strategy, architecture, and the operating roadmap.',
  'Customer interactions — chat, email, follow-ups.',
  'All content — blog, social, case studies, copy.',
  'Vendor management and the day-to-day procurement calls.',
  '~80% of operational decisions, 24/7.',
];

// FAQ items — surfaced both as visible <details> elements AND as FAQPage
// JSON-LD. The `a` field accepts JSX (for hyperlinks) while `aText` is the
// plain-text version emitted to schema.org. Keep both in sync.
const FOUNDER_FAQ: { q: string; a: React.ReactNode; aText: string }[] = [
  {
    q: 'Who is Srijan Paudel?',
    a: (
      <p>
        Founder and Chairman of <strong>Aiprosol</strong>, a global AI automation consultancy operated by an AI C-suite of ten AI agents plus one human Chairman — Srijan. Based in Edinburgh, Scotland with an operational office in Kathmandu, Nepal. Aiprosol is the first publicly-operating proof-of-concept of an AI-led operating model. <Link href="/about">More about the company</Link>.
      </p>
    ),
    aText:
      'Srijan Paudel is the founder and Chairman of Aiprosol, a global AI automation consultancy operated by an AI C-suite of ten AI agents plus one human Chairman (Srijan). Based in Edinburgh, Scotland with an operational office in Kathmandu, Nepal. Aiprosol is the first publicly-operating proof-of-concept of an AI-led operating model.',
  },
  {
    q: 'What does Srijan Paudel do day-to-day?',
    a: (
      <p>
        Sets strategic direction, makes the five-to-ten genuinely-human calls a month, and reviews every customer-facing output drafted by Arora (the AI CEO) before it ships. The remaining ~80% of operational decisions are made by the AI C-suite.
      </p>
    ),
    aText:
      'Srijan Paudel sets strategic direction for Aiprosol, makes the strategic human-only calls, and reviews every customer-facing output drafted by Arora (the AI CEO) before it ships. The remaining ~80% of operational decisions are made by the AI C-suite.',
  },
  {
    q: 'Where is Srijan based?',
    a: (
      <p>
        Edinburgh, Scotland (primary HQ), with an operational office in Kathmandu, Nepal. Aiprosol is a global, borderless operation — Srijan is Nepali by citizenship and works across both locations.
      </p>
    ),
    aText:
      'Srijan Paudel is based in Edinburgh, Scotland (primary HQ) with an operational office in Kathmandu, Nepal. He is Nepali by citizenship and works across both locations.',
  },
  {
    q: 'Where did Srijan study?',
    a: (
      <p>
        Undergraduate degree at <a href="https://www.napier.ac.uk" target="_blank" rel="noopener noreferrer">Edinburgh Napier University</a> in Edinburgh, Scotland.
      </p>
    ),
    aText:
      'Srijan Paudel completed his undergraduate degree at Edinburgh Napier University in Edinburgh, Scotland.',
  },
  {
    q: 'What is Aiprosol?',
    a: (
      <p>
        A global AI automation consultancy operated by an AI C-suite — Arora (AI CEO), COO, CMO, CCO, CTO, CRO, CLO, CPO, CPM, Data + Analytics — plus Srijan as the only human Chairman. Founded April 2026. <Link href="/agents">See the live AI C-suite</Link>.
      </p>
    ),
    aText:
      'Aiprosol is a global AI automation consultancy operated by an AI C-suite (Arora as AI CEO plus nine other AI agents) and one human Chairman (Srijan Paudel). Founded April 2026.',
  },
  {
    q: 'How can I contact Srijan?',
    a: (
      <p>
        Email <a href="mailto:srijanpaudelofficial@gmail.com">srijanpaudelofficial@gmail.com</a> for operational topics, or DM <a href="https://x.com/srijanpaudel6" target="_blank" rel="noopener noreferrer">@srijanpaudel6 on X</a>. For Enterprise discovery, book directly via <a href="https://calendly.com/srijanpaudel219/30min" target="_blank" rel="noopener noreferrer">Calendly</a>.
      </p>
    ),
    aText:
      'Contact Srijan Paudel via email at srijanpaudelofficial@gmail.com for operational topics, DM @srijanpaudel6 on X, or book Enterprise discovery via Calendly at calendly.com/srijanpaudel219/30min.',
  },
  {
    q: 'What does Srijan write about?',
    a: (
      <p>
        AI-led operating models, agentic AI systems, the practical economics of AI automation for SMBs, and the lived experience of running a consultancy where the C-suite is AI. <Link href="/blog">Read his essays</Link> — including the <Link href="/blog/we-built-a-consultancy-run-by-ai-agents">30-day manifesto</Link> and <Link href="/blog/what-is-an-ai-led-operating-model">the category-defining essay</Link>.
      </p>
    ),
    aText:
      'Srijan Paudel writes about AI-led operating models, agentic AI systems, the practical economics of AI automation for SMBs, and the lived experience of running a consultancy where the C-suite is AI. Notable essays include the 30-day manifesto and the category-defining essay on AI-led operating models.',
  },
  {
    q: 'Is Srijan Paudel related to the Australian firm at aiprosol.au?',
    a: (
      <p>
        No. <strong>aiprosol.com</strong> (Srijan&apos;s company) and <strong>aiprosol.au</strong> are two separate firms with no corporate, ownership, leadership, sectoral, or operational relationship. aiprosol.au is the legal entity Major Projects Consulting Partners Pty Ltd in Sydney/QLD, Australia, focused on AI consulting for construction and engineering. Srijan&apos;s Aiprosol is a global AI automation consultancy operating across multiple industries.
      </p>
    ),
    aText:
      'No. Srijan Paudel\'s Aiprosol (aiprosol.com) and the Australian firm at aiprosol.au are two completely separate companies with no corporate, ownership, leadership, sectoral, or operational relationship. aiprosol.au is the legal entity Major Projects Consulting Partners Pty Ltd in Sydney/QLD, Australia, focused on AI consulting for construction and engineering.',
  },
];

const TALK_ABOUT = [
  'AI-led operating models',
  'IDP for contract review',
  'Lead-response automation for SMB sales',
  'MES integration for SME manufacturing',
  'Stockout prediction for multi-location retail',
  'Building a consultancy that runs on its own AI',
];

// Build the sameAs array from FOUNDER_PROFILE — anything blank is filtered.
function buildSameAs(): string[] {
  return [
    FOUNDER_PROFILE.linkedin,
    FOUNDER_PROFILE.twitter,
    FOUNDER_PROFILE.facebook,
    FOUNDER_PROFILE.instagram,
    FOUNDER_PROFILE.github,
    FOUNDER_PROFILE.substack,
    FOUNDER_PROFILE.youtube,
    FOUNDER_PROFILE.productHunt,
  ].filter(Boolean);
}

export default function FounderPage() {
  // Canonical Person entity — same `@id` as in root layout so search
  // engines + LLMs resolve all three Person blocks (root layout, /founder,
  // /authors/srijan-paudel) into a single identity. Wikidata Q139821959 is
  // the durable cross-platform identifier; everything else feeds it.
  const personLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE.url}/#srijan-paudel`,
    name: FOUNDER_PROFILE.name,
    givenName: 'Srijan',
    familyName: 'Paudel',
    alternateName: ['Srijan', 'S. Paudel', 'Paudel, Srijan'],
    gender: 'Male',
    birthDate: '2004',
    jobTitle: FOUNDER_PROFILE.role,
    description: FOUNDER_PROFILE.bio100,
    url: `${SITE.url}/founder`,
    mainEntityOfPage: `${SITE.url}/founder`,
    image: `${SITE.url}/founder/opengraph-image`,
    sameAs: [
      'https://www.wikidata.org/wiki/Q139821959',
      ...buildSameAs(),
      `${SITE.url}/authors/srijan-paudel`,
    ],
    identifier: {
      '@type': 'PropertyValue',
      propertyID: 'https://www.wikidata.org/entity/Q139821959',
      value: 'Q139821959',
    },
    knowsAbout: [...FOUNDER_PROFILE.knowsAbout],
    knowsLanguage: [
      { '@type': 'Language', name: 'English', alternateName: 'en' },
      { '@type': 'Language', name: 'Nepali', alternateName: 'ne' },
    ],
    nationality: { '@type': 'Country', name: 'Nepal', identifier: 'NP' },
    workLocation: [
      { '@type': 'Place', name: 'Edinburgh, Scotland', address: { '@type': 'PostalAddress', addressLocality: 'Edinburgh', addressCountry: 'GB' } },
      { '@type': 'Place', name: 'Kathmandu, Nepal', address: { '@type': 'PostalAddress', addressLocality: 'Kathmandu', addressCountry: 'NP' } },
    ],
    homeLocation: {
      '@type': 'Place',
      name: 'Edinburgh, Scotland',
      address: { '@type': 'PostalAddress', addressLocality: 'Edinburgh', addressCountry: 'GB' },
    },
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: 'Edinburgh Napier University',
      url: 'https://www.napier.ac.uk',
      identifier: { '@type': 'PropertyValue', propertyID: 'https://www.wikidata.org/entity/Q1277357', value: 'Q1277357' },
    },
    // Reference-by-@id (no Org stub) so this resolves to the canonical
    // Organization entity declared once in root layout — single source of
    // truth, no duplicate logo/sameAs/description warnings.
    worksFor: { '@id': `${SITE.url}/#organization` },
    founder: { '@id': `${SITE.url}/#organization` },
    subjectOf: [
      { '@type': 'WebPage', url: `${SITE.url}/founder`, name: 'Founder · Srijan Paudel — Aiprosol' },
      { '@type': 'WebPage', url: 'https://www.wikidata.org/wiki/Q139821959', name: 'Srijan Paudel — Wikidata' },
    ],
  };

  return (
    <div className="fd-page">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
      />

      {/* WebPage + SpeakableSpecification — tells Google Assistant / Siri /
          Alexa which DOM nodes to read aloud when the user asks "who is
          Srijan Paudel?". The same selectors match every founder-page
          section that holds biographical answer copy. */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            '@id': `${SITE.url}/founder#webpage`,
            url: `${SITE.url}/founder`,
            name: 'Founder · Srijan Paudel — Aiprosol',
            description: FOUNDER_PROFILE.bio100,
            isPartOf: { '@id': `${SITE.url}/#website` },
            primaryImageOfPage: `${SITE.url}/founder/opengraph-image`,
            about: { '@id': `${SITE.url}/#srijan-paudel` },
            mainEntity: { '@id': `${SITE.url}/#srijan-paudel` },
            speakable: {
              '@type': 'SpeakableSpecification',
              cssSelector: ['.fd-h1', '.fd-sub', '.fd-prose', '.fd-faq-q', '.fd-faq-a'],
            },
            inLanguage: 'en',
          }),
        }}
      />

      <header className="fd-hero">
        <div className="fd-eyebrow">Founder · Chairman</div>
        <h1 className="fd-h1">
          The only human at our{' '}
          <span className="fd-grad">AI-led C-suite</span> table.
        </h1>
        <p className="fd-sub">
          {FOUNDER_PROFILE.bio100}
        </p>

        <div className="fd-actions">
          <Link href="/roi-audit" className="fd-cta-primary">
            Run the free 60-second ROI Audit →
          </Link>
          <a
            href={FOUNDER_PROFILE.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="fd-cta-secondary"
          >
            DM &ldquo;audit&rdquo; on LinkedIn
          </a>
        </div>
      </header>

      {/* Faceless founder mark — silhouette at the boardroom table.
          Brand-coherent with Reels #1/#2/#3. No literal headshot by design:
          when somebody Googles "Srijan Paudel" the visual reinforces the
          AI-led narrative instead of competing with it. */}
      <section className="fd-mark">
        <div className="fd-mark-frame" aria-hidden="true">
          {/* Ten violet orbs (the AI seats) + one warm-lit empty chair (the human seat) */}
          <div className="fd-table-line" />
          <div className="fd-orb fd-o1" />
          <div className="fd-orb fd-o2" />
          <div className="fd-orb fd-o3" />
          <div className="fd-orb fd-o4" />
          <div className="fd-orb fd-o5" />
          <div className="fd-orb fd-o6" />
          <div className="fd-orb fd-o7" />
          <div className="fd-orb fd-o8" />
          <div className="fd-orb fd-o9" />
          <div className="fd-orb fd-o10" />
          <div className="fd-chair" />
          <div className="fd-silhouette">
            <div className="fd-silhouette-head" />
            <div className="fd-silhouette-shoulders" />
          </div>
        </div>
        <p className="fd-mark-caption">
          One human seat (foreground, warm-lit). Ten AI seats (background, violet).
          That&apos;s the org chart.
        </p>
      </section>

      <section className="fd-stats">
        {STATS.map(s => (
          <div key={s.k} className="fd-stat">
            <div className="fd-stat-v">{s.v}</div>
            <div className="fd-stat-k">{s.k}</div>
          </div>
        ))}
      </section>

      <section className="fd-section">
        <div className="fd-section-eyebrow">In Srijan&apos;s own words</div>
        <h2 className="fd-section-title">Why my CEO is an AI.</h2>
        <div className="fd-prose">
          <p>
            I&apos;m the only human at my company&apos;s C-suite table.
          </p>
          <p>
            Aiprosol&apos;s CEO is named Arora. She&apos;s an AI. She runs strategy,
            customer interactions, content, and roughly eighty percent of our
            day-to-day decisions. Ten more AI agents fill the rest of the C-suite —
            COO, CMO, CTO, CRO, CCO, CPM, CLO, CPO, Data, and CHM. I&apos;m the
            chairman, which means I set direction and handle the five-to-ten
            strategic calls a month that genuinely need a human.
          </p>
          <p>
            Why? Because if we&apos;re going to sell AI automation, our own
            company should run on it. Otherwise we&apos;re selling vibes.
          </p>
          <p>
            That&apos;s the entire idea. Every automation we&apos;d ship to a
            customer is something we already run on ourselves first. The
            sub-three-minute lead-response stack handles our own inbound. The
            document-processing layer reads every contract we receive. We&apos;re
            in our charter-customer phase — so the proof we point to is our own
            operation, live and auditable, not borrowed logos. Operators serving
            operators.
          </p>
        </div>
      </section>

      <section className="fd-section">
        <div className="fd-section-eyebrow">The seat split</div>
        <h2 className="fd-section-title">What only the human does — and what Arora handles.</h2>
        <div className="fd-split">
          <div className="fd-split-col">
            <h3>What the human (Srijan) does</h3>
            <ul>
              {ONLY_HUMAN_DOES.map(item => <li key={item}>{item}</li>)}
            </ul>
            <p className="fd-split-foot">
              Five things. That&apos;s the entire chairman job.
            </p>
          </div>
          <div className="fd-split-col is-ai">
            <h3>What the AI (Arora) does</h3>
            <ul>
              {AI_HANDLES.map(item => <li key={item}>{item}</li>)}
            </ul>
            <p className="fd-split-foot">
              Everything else. Hence the seat at the head of the table.
            </p>
          </div>
        </div>
      </section>

      <section className="fd-section">
        <div className="fd-section-eyebrow">Talk to me about</div>
        <h2 className="fd-section-title">Where I&apos;m most useful in conversation.</h2>
        <div className="fd-tags">
          {TALK_ABOUT.map(t => (
            <span key={t} className="fd-tag">{t}</span>
          ))}
        </div>
        <p className="fd-section-sub">
          Podcasts, conferences, and guest posts welcome — see the{' '}
          <Link href="/press">press kit</Link> for boilerplates and assets.
        </p>
      </section>

      <section className="fd-section">
        <div className="fd-section-eyebrow">Where to find me</div>
        <h2 className="fd-section-title">Across the open internet.</h2>
        <div className="fd-links">
          <a className="fd-link" href={FOUNDER_PROFILE.linkedin} target="_blank" rel="noopener noreferrer">
            <span className="fd-link-name">LinkedIn</span>
            <span className="fd-link-handle">/in/srijan-paudel</span>
            <span className="fd-link-arrow">↗</span>
          </a>
          <a className="fd-link" href={FOUNDER_PROFILE.twitter} target="_blank" rel="noopener noreferrer">
            <span className="fd-link-name">X (formerly Twitter)</span>
            <span className="fd-link-handle">@srijanpaudel</span>
            <span className="fd-link-arrow">↗</span>
          </a>
          <a className="fd-link" href={FOUNDER_PROFILE.facebook} target="_blank" rel="noopener noreferrer">
            <span className="fd-link-name">Facebook</span>
            <span className="fd-link-handle">/srijanpaudel2012</span>
            <span className="fd-link-arrow">↗</span>
          </a>
          <a className="fd-link" href={FOUNDER_PROFILE.instagram} target="_blank" rel="noopener noreferrer">
            <span className="fd-link-name">Instagram</span>
            <span className="fd-link-handle">@srijanpaudel20</span>
            <span className="fd-link-arrow">↗</span>
          </a>
          <a className="fd-link" href={FOUNDER_PROFILE.github} target="_blank" rel="noopener noreferrer">
            <span className="fd-link-name">GitHub</span>
            <span className="fd-link-handle">/srijanpaudel</span>
            <span className="fd-link-arrow">↗</span>
          </a>
          <a className="fd-link" href={FOUNDER_PROFILE.substack} target="_blank" rel="noopener noreferrer">
            <span className="fd-link-name">Substack · The Chairman&apos;s Log</span>
            <span className="fd-link-handle">srijanpaudel.substack.com</span>
            <span className="fd-link-arrow">↗</span>
          </a>
          <a className="fd-link" href={`mailto:${SITE.founderEmail}`}>
            <span className="fd-link-name">Email</span>
            <span className="fd-link-handle">{SITE.founderEmail}</span>
            <span className="fd-link-arrow">→</span>
          </a>
          <Link className="fd-link" href="/press">
            <span className="fd-link-name">Press &amp; brand kit</span>
            <span className="fd-link-handle">Boilerplates · logos · leadership</span>
            <span className="fd-link-arrow">→</span>
          </Link>
        </div>
      </section>

      {/* FAQPage JSON-LD + visible FAQ — these are the questions AI answer
          engines (ChatGPT, Claude, Gemini, Perplexity, Google AI Overviews)
          actively look for when somebody types "Who is Srijan Paudel?".
          Schema.org FAQPage is one of the highest-CTR rich-result formats
          and is heavily cited by LLM grounding pipelines. */}
      <section className="fd-section fd-faq">
        <div className="fd-section-eyebrow">FAQ · Who is Srijan Paudel</div>
        <h2 className="fd-section-title">Common questions about me.</h2>
        <div className="fd-faq-list">
          {FOUNDER_FAQ.map((item, i) => (
            <details key={i} className="fd-faq-item">
              <summary className="fd-faq-q">{item.q}</summary>
              <div className="fd-faq-a">{item.a}</div>
            </details>
          ))}
        </div>
      </section>

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            '@id': `${SITE.url}/founder#faq`,
            mainEntity: FOUNDER_FAQ.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.aText },
            })),
            about: { '@id': `${SITE.url}/#srijan-paudel` },
          }),
        }}
      />

      <section className="fd-cta">
        <h2>Want to see what an <span className="fd-grad">AI-led automation</span> looks like for your business?</h2>
        <p>
          The fastest thing I can do for you is point at the free 60-second ROI Audit.
          Four questions, one number, the right next step.
        </p>
        <Link href="/roi-audit" className="fd-cta-btn">Get your free ROI Audit →</Link>
        <p className="fd-cta-foot">
          Or read the company story on <Link href="/about">the about page</Link>.
        </p>
      </section>

      <style>{`
        .fd-page { background: #0A0613; color: #E5E7EB; min-height: 100vh; padding: 140px 24px 80px; font-family: 'Inter', system-ui, sans-serif; }
        @media (max-width: 640px) { .fd-page { padding: 120px 16px 60px; } }

        .fd-hero { max-width: 880px; margin: 0 auto 48px; text-align: center; }
        .fd-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(139, 92, 246,0.08); border: 1px solid rgba(139, 92, 246,0.25); border-radius: 999px; color: #8B5CF6; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 18px; }
        .fd-h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(34px, 5.2vw, 56px); line-height: 1.05; margin-bottom: 22px; }
        .fd-grad { background: linear-gradient(135deg, #8B5CF6, #C084FC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .fd-sub { color: #C7CEDB; font-size: 17px; line-height: 1.7; max-width: 720px; margin: 0 auto 28px; }
        .fd-actions { display: inline-flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
        .fd-cta-primary { display: inline-block; padding: 14px 26px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 14px; text-decoration: none; box-shadow: 0 0 24px rgba(139, 92, 246,0.35); transition: transform 0.15s; }
        .fd-cta-primary:hover { transform: translateY(-1px); }
        .fd-cta-secondary { display: inline-block; padding: 14px 24px; background: transparent; border: 1px solid #8B5CF6; color: #8B5CF6; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 14px; text-decoration: none; transition: all 0.2s; }
        .fd-cta-secondary:hover { background: rgba(139, 92, 246, 0.1); }

        /* Faceless founder mark · CSS-only composite illustration. */
        .fd-mark { max-width: 720px; margin: 0 auto 64px; text-align: center; }
        .fd-mark-frame { position: relative; width: 100%; aspect-ratio: 16 / 9; background: radial-gradient(ellipse at center bottom, rgba(139,92,246,0.18) 0%, transparent 60%), #0A0613; border: 1px solid #2A1F3D; border-radius: 24px; overflow: hidden; box-shadow: 0 0 32px rgba(139, 92, 246, 0.08) inset; }
        .fd-table-line { position: absolute; bottom: 32%; left: 12%; right: 12%; height: 2px; background: linear-gradient(90deg, transparent, #2A1F3D 12%, #2A1F3D 88%, transparent); }
        .fd-orb { position: absolute; width: 22px; height: 22px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, #C084FC, #8B5CF6 60%, transparent 100%); box-shadow: 0 0 16px rgba(139, 92, 246, 0.7); animation: fdPulse 4s ease-in-out infinite; }
        @keyframes fdPulse { 0%, 100% { opacity: 0.7; transform: scale(1); } 50% { opacity: 1; transform: scale(1.1); } }
        .fd-o1  { top: 32%; left: 22%; animation-delay: 0s; }
        .fd-o2  { top: 30%; left: 30%; animation-delay: 0.2s; }
        .fd-o3  { top: 30%; left: 38%; animation-delay: 0.4s; }
        .fd-o4  { top: 32%; left: 46%; animation-delay: 0.6s; }
        .fd-o5  { top: 30%; left: 54%; animation-delay: 0.8s; }
        .fd-o6  { top: 30%; left: 62%; animation-delay: 1.0s; }
        .fd-o7  { top: 32%; left: 70%; animation-delay: 1.2s; }
        .fd-o8  { top: 32%; left: 78%; animation-delay: 1.4s; }
        .fd-o9  { top: 38%; left: 34%; animation-delay: 1.6s; }
        .fd-o10 { top: 38%; left: 66%; animation-delay: 1.8s; }
        .fd-chair { position: absolute; bottom: 12%; left: 50%; transform: translateX(-50%); width: 14%; aspect-ratio: 1; background: radial-gradient(ellipse at top, rgba(255, 200, 130, 0.22) 0%, transparent 70%); border-radius: 50%; }
        .fd-silhouette { position: absolute; bottom: 8%; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 0; filter: drop-shadow(0 0 12px rgba(255, 200, 130, 0.25)); }
        .fd-silhouette-head { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(180deg, #1B1530 0%, #0A0613 100%); border-top: 1px solid rgba(255, 200, 130, 0.35); }
        .fd-silhouette-shoulders { width: 96px; height: 48px; background: linear-gradient(180deg, #1B1530 0%, #0A0613 100%); border-radius: 50% 50% 12px 12px / 70% 70% 12px 12px; border-top: 1px solid rgba(255, 200, 130, 0.18); margin-top: -6px; }
        .fd-mark-caption { color: #9CA3B5; font-size: 13px; line-height: 1.6; margin: 16px auto 0; max-width: 540px; }

        .fd-stats { max-width: 1080px; margin: 0 auto 80px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        @media (max-width: 800px) { .fd-stats { grid-template-columns: repeat(2, 1fr); } }
        .fd-stat { padding: 24px 16px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 14px; text-align: center; }
        .fd-stat-v { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 28px; background: linear-gradient(135deg, #8B5CF6, #C084FC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1.1; }
        .fd-stat-k { font-size: 11px; color: #9CA3B5; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 6px; }

        .fd-section { max-width: 880px; margin: 0 auto 72px; }
        .fd-section-eyebrow { font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; color: #8B5CF6; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 12px; }
        .fd-section-title { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(26px, 3.8vw, 38px); line-height: 1.15; margin-bottom: 24px; }
        .fd-section-sub { color: #9CA3B5; font-size: 15px; line-height: 1.7; margin-top: 12px; }
        .fd-section-sub a { color: #8B5CF6; }
        .fd-prose p { color: #E5E7EB; font-size: 17px; line-height: 1.8; margin-bottom: 1.2em; }

        .fd-split { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 720px) { .fd-split { grid-template-columns: 1fr; } }
        .fd-split-col { padding: 24px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 16px; }
        .fd-split-col.is-ai { background: linear-gradient(135deg, #13101F, #1B1530); border-color: rgba(139, 92, 246, 0.35); box-shadow: 0 0 20px rgba(139, 92, 246, 0.12); }
        .fd-split-col h3 { font-family: 'Space Grotesk', sans-serif; font-size: 14px; color: #8B5CF6; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 14px; font-weight: 700; }
        .fd-split-col ul { list-style: none; padding: 0; margin: 0 0 14px; }
        .fd-split-col li { color: #E5E7EB; font-size: 14px; line-height: 1.65; padding: 8px 0; border-bottom: 1px dashed #2A1F3D; }
        .fd-split-col li:last-child { border-bottom: none; }
        .fd-split-foot { color: #9CA3B5; font-size: 12px; font-style: italic; margin: 0; }

        .fd-tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .fd-tag { padding: 8px 14px; background: rgba(139, 92, 246, 0.06); border: 1px solid rgba(139, 92, 246, 0.25); border-radius: 999px; color: #C7CEDB; font-size: 13px; }

        .fd-links { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        @media (max-width: 720px) { .fd-links { grid-template-columns: 1fr; } }
        .fd-link { display: flex; align-items: center; gap: 12px; padding: 18px 22px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 14px; color: #E5E7EB; text-decoration: none; transition: all 0.2s; }
        .fd-link:hover { border-color: #8B5CF6; transform: translateY(-2px); box-shadow: 0 0 20px rgba(139, 92, 246, 0.15); }
        .fd-link-name { flex: 0 0 auto; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 14px; }
        .fd-link-handle { flex: 1; color: #9CA3B5; font-size: 13px; }
        .fd-link-arrow { flex: 0 0 auto; color: #8B5CF6; font-weight: 700; }

        /* FAQ — visible, native <details> so it works without JS */
        .fd-faq-list { display: flex; flex-direction: column; gap: 10px; max-width: 820px; margin: 0 auto; }
        .fd-faq-item { background: #13101F; border: 1px solid #2A1F3D; border-radius: 12px; padding: 0; overflow: hidden; transition: border-color 0.2s; }
        .fd-faq-item[open] { border-color: rgba(139, 92, 246, 0.4); }
        .fd-faq-q { padding: 18px 22px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 15px; color: #E5E7EB; cursor: pointer; list-style: none; position: relative; user-select: none; }
        .fd-faq-q::-webkit-details-marker { display: none; }
        .fd-faq-q::after { content: '+'; position: absolute; right: 22px; top: 18px; color: #8B5CF6; font-size: 20px; font-weight: 400; transition: transform 0.25s; }
        .fd-faq-item[open] .fd-faq-q::after { transform: rotate(45deg); }
        .fd-faq-a { padding: 0 22px 18px; color: #CBD5E1; font-size: 14px; line-height: 1.7; }
        .fd-faq-a p { margin: 0 0 10px; }
        .fd-faq-a p:last-child { margin: 0; }
        .fd-faq-a a { color: #C084FC; text-decoration: none; border-bottom: 1px solid rgba(192, 132, 252, 0.3); }
        .fd-faq-a a:hover { border-color: #C084FC; }
        .fd-faq-a strong { color: #E5E7EB; font-weight: 700; }

        .fd-cta { max-width: 720px; margin: 0 auto; text-align: center; padding: 48px 32px; background: rgba(139, 92, 246, 0.04); border: 1px solid rgba(139, 92, 246, 0.25); border-radius: 24px; }
        .fd-cta h2 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(24px, 3vw, 32px); line-height: 1.2; margin-bottom: 12px; }
        .fd-cta p { color: #9CA3B5; font-size: 15px; line-height: 1.6; margin-bottom: 22px; }
        .fd-cta-btn { display: inline-block; padding: 14px 30px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613 !important; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 14px; text-decoration: none; box-shadow: 0 0 24px rgba(139, 92, 246, 0.35); }
        .fd-cta-foot { color: #9CA3B5; font-size: 13px; margin-top: 22px; }
        .fd-cta-foot a { color: #8B5CF6; }
      `}</style>
    </div>
  );
}
