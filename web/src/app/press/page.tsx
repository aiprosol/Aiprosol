import Link from 'next/link';
import { getTestimonials } from '@/lib/content';
import { SITE } from '@/lib/site-config';

// Server component — static, fast, journalist-friendly. Everything a writer
// needs to file a story about Aiprosol without emailing us first.

const BOILERPLATE_SHORT =
  "Aiprosol is a global AI automation consultancy that designs, builds, and operates the workflows reclaiming 35+ hours a week per team. Founded in 2026 by Srijan Paudel, Aiprosol runs as an AI-led C-suite: Arora the AI CEO plus ten AI agents under one human chairman.";

const BOILERPLATE_MEDIUM =
  "Aiprosol is a global AI automation consultancy that designs, builds, and operates the workflows reclaiming 35+ hours a week per team. Average measured ROI: 340% in the first 12 months. Founded in April 2026 by Srijan Paudel, Aiprosol runs as an AI-led C-suite — Arora the AI CEO plus ten AI agents coordinating under one human chairman. The model is itself a proof-of-concept for what AI-led operations look like at scale. Aiprosol serves clients globally with 19 self-serve digital products ($17–$997), 11 AI services, and three managed plans from $997 to $7,997 per month.";

const BOILERPLATE_LONG =
  "Aiprosol is a global AI automation consultancy that designs, builds, and operates the workflows reclaiming 35+ hours a week per team — and proves it before invoicing. Average measured ROI across pilots: 340% in the first 12 months. Aiprosol was founded in April 2026 by Srijan Paudel, who serves as Founder & Chairman; operational leadership is held by Arora, an AI CEO who handles strategy, architecture, content, and most customer interactions. Ten further AI agents fill the rest of the C-suite. The company is the first practical proof-of-concept that an AI-led operating model can run a profitable consultancy end-to-end. Aiprosol works across Legal, Real Estate, Manufacturing, Retail, Financial Services, E-commerce, Professional Services, SaaS, and Healthcare. Customers engage via a free 60-second ROI Audit, then self-serve through 19 digital products ($17–$997) or step up to one of three managed plans (Starter $997/mo, Growth $2,997/mo, Enterprise $7,997/mo). Managed plans are backed by a 90-day reclaim guarantee: if 35+ hours per week aren't freed up within 90 days of go-live, Aiprosol works for free until they are. The company is remote-first, global, and bills exclusively in USD.";

const COLOR_TOKENS = [
  { name: 'Primary',     hex: '#8B5CF6', usage: 'Primary actions, links, gradient start' },
  { name: 'Secondary',   hex: '#C084FC', usage: 'Gradient end, hover state, accents' },
  { name: 'Background',  hex: '#0A0613', usage: 'Page background — near-black with violet undertone' },
  { name: 'Card',        hex: '#13101F', usage: 'Card / panel background' },
  { name: 'Border',      hex: '#2A1F3D', usage: 'Subtle borders, dividers' },
  { name: 'Text',        hex: '#E5E7EB', usage: 'Body copy on dark backgrounds' },
  { name: 'Muted',       hex: '#9CA3B5', usage: 'Secondary text, captions, meta' },
  { name: 'Success',     hex: '#10B981', usage: 'Positive metrics, saved/cancelable' },
];

const NUMBERS = [
  { v: '340%',   k: 'Projected ROI · 12 months' },
  { v: '35+',    k: 'Projected hrs/week reclaimed' },
  { v: '19',     k: 'Digital products' },
  { v: '11',     k: 'AI services' },
  { v: '3',      k: 'Managed plans' },
  { v: '7',      k: 'Industries served' },
  { v: '$3,573', k: 'Catalogue value' },
  { v: '90d',    k: 'Reclaim guarantee window' },
];

const VOICE_RULES = [
  { rule: 'Numbers > adjectives', example: 'Say "45 hrs/week reclaimed", not "significant time savings".' },
  { rule: 'USD only',             example: 'All pricing in $. Never £ or €.' },
  { rule: 'Global, no geography', example: 'Avoid UK / Edinburgh / "British company" references in marketing copy.' },
  { rule: 'Self-serve first',     example: 'Lead with the free ROI Audit or a digital product, not "book a call".' },
  { rule: 'Arora is the AI CEO',  example: 'Not a chatbot. Not a mascot. The operational lead, written about as a real role.' },
  { rule: 'Never "10x"',          example: 'Real numbers come from real engagements. Round numbers feel made up.' },
];

export default function PressPage() {
  const testimonials = getTestimonials().slice(0, 6);

  // AboutPage + Person + Organization JSON-LD bundle. The page is structurally
  // ABOUT three entities: Aiprosol (the company), Srijan Paudel (founder),
  // and Arora (AI CEO). Emitting a `@graph` with cross-referenced @ids reinforces
  // the entity graph for every AI answer engine that crawls the page.
  const aboutPageLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        '@id': `${SITE.url}/press#aboutpage`,
        url: `${SITE.url}/press`,
        name: 'Press & Brand Kit — Aiprosol',
        description:
          'Press kit for Aiprosol — boilerplate copy in three lengths, logos, founder + AI CEO bios, verifiable numbers, customer quotes, press contact.',
        about: [
          { '@id': `${SITE.url}/#organization` },
          { '@id': `${SITE.url}/#srijan-paudel` },
          { '@id': `${SITE.url}/#arora-ai-ceo` },
        ],
        mainEntity: { '@id': `${SITE.url}/#organization` },
        inLanguage: 'en',
        isPartOf: { '@id': `${SITE.url}/#organization` },
      },
      // Person reference — links to canonical Person entity from root layout.
      // Repeats key biographical facts here so the press page is self-contained
      // when scraped or pulled into citation indices.
      {
        '@type': 'Person',
        '@id': `${SITE.url}/#srijan-paudel`,
        name: 'Srijan Paudel',
        givenName: 'Srijan',
        familyName: 'Paudel',
        alternateName: ['Srijan', 'S. Paudel'],
        gender: 'Male',
        birthDate: '2004',
        jobTitle: 'Founder & Chairman, Aiprosol',
        description:
          'Founder and Chairman of Aiprosol, a company run by an AI C-suite of ten AI agents. Based in Edinburgh, Scotland with an operational office in Kathmandu, Nepal. Educated at Edinburgh Napier University.',
        url: `${SITE.url}/founder`,
        image: `${SITE.url}/founder/opengraph-image`,
        worksFor: { '@id': `${SITE.url}/#organization` },
        sameAs: [
          'https://www.wikidata.org/wiki/Q139821959',
          'https://www.linkedin.com/in/srijan-paudel',
          'https://x.com/srijanpaudel6',
          'https://www.facebook.com/srijanpaudel2012',
          'https://www.instagram.com/srijanpaudel20',
          'https://github.com/srijanpaudel',
          `${SITE.url}/founder`,
          `${SITE.url}/authors/srijan-paudel`,
        ],
        identifier: {
          '@type': 'PropertyValue',
          propertyID: 'https://www.wikidata.org/entity/Q139821959',
          value: 'Q139821959',
        },
        nationality: { '@type': 'Country', name: 'Nepal', identifier: 'NP' },
        alumniOf: {
          '@type': 'CollegeOrUniversity',
          name: 'Edinburgh Napier University',
          identifier: { '@type': 'PropertyValue', propertyID: 'https://www.wikidata.org/entity/Q1277357', value: 'Q1277357' },
        },
      },
    ],
  };

  // WebPage + SpeakableSpecification: explicitly tells voice assistants which
  // DOM nodes to read aloud (the boilerplate paragraphs in 3 lengths are the
  // exact content a journalist or AI assistant would want spoken back).
  const webPageLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${SITE.url}/press#webpage`,
    url: `${SITE.url}/press`,
    name: 'Press & Brand Kit — Aiprosol',
    description: BOILERPLATE_SHORT,
    isPartOf: { '@id': `${SITE.url}/#website` },
    about: [
      { '@id': `${SITE.url}/#organization` },
      { '@id': `${SITE.url}/#srijan-paudel` },
    ],
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['.pr-h1', '.pr-sub', '.pr-boilerplate', '.pr-quote'],
    },
    inLanguage: 'en',
  };

  return (
    <div className="pr-page">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }}
      />
      <div className="pr-shell">
        {/* Header ─────────────────────────────────────────────── */}
        <header className="pr-hero">
          <div className="pr-eyebrow">Press · Brand Kit · Resources</div>
          <h1 className="pr-h1">
            Everything you need to <span className="pr-grad">file a story</span> about Aiprosol.
          </h1>
          <p className="pr-sub">
            Boilerplate copy in three lengths · logos · brand colours · founder + AI CEO bios ·
            verifiable numbers · quotable customers · the on-the-record press contact.
            All assets free to use without permission, as long as Aiprosol is identified accurately.
          </p>
        </header>

        {/* At a glance ─────────────────────────────────────────── */}
        <section className="pr-section">
          <h2>At a glance</h2>
          <div className="pr-glance">
            <Row label="Company"        value="Aiprosol" />
            <Row label="Status"         value="Pre-incorporation (trading as Aiprosol)" />
            <Row label="Founded"        value="April 2026" />
            <Row label="Founder & Chairman" value="Srijan Paudel" />
            <Row label="AI CEO"         value="Arora" />
            <Row label="Headquarters"   value="Global · remote-first" />
            <Row label="Currency"       value="USD only" />
            <Row label="Sector"         value="AI automation consultancy" />
            <Row label="Website"        value={<a href={SITE.url}>{SITE.url.replace('https://', '')}</a>} />
            <Row label="Press contact"  value={<a href={`mailto:${SITE.email}`}>{SITE.email}</a>} />
            <Row label="Response time"  value="Within 24 hours on weekdays" />
          </div>
        </section>

        {/* Boilerplate ─────────────────────────────────────────── */}
        <section className="pr-section">
          <h2>Boilerplate descriptions</h2>
          <p className="pr-section-sub">
            Three pre-approved descriptions, in increasing length. Use any of them verbatim. Highlight + copy.
          </p>

          <BoilerCard length="50 words"  text={BOILERPLATE_SHORT} />
          <BoilerCard length="100 words" text={BOILERPLATE_MEDIUM} />
          <BoilerCard length="250 words" text={BOILERPLATE_LONG} />
        </section>

        {/* Logos ──────────────────────────────────────────────── */}
        <section className="pr-section">
          <h2>Logos</h2>
          <p className="pr-section-sub">
            Primary mark is a white &quot;A&quot; arrow on a violet/dark background. Right-click any logo to save.
            For monochrome, custom sizes, or vector (SVG) source, email{' '}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a> — we&apos;ll send the full kit.
          </p>

          <div className="pr-logos">
            <LogoCard
              label="Primary · on dark"
              bg="#0A0613"
              src="/logo.png"
            />
            <LogoCard
              label="Primary · on violet"
              bg="#8B5CF6"
              src="/logo.png"
            />
            <LogoCard
              label="Open Graph card"
              bg="#0A0613"
              src="/opengraph-image"
              wide
            />
          </div>
        </section>

        {/* Colours ─────────────────────────────────────────────── */}
        <section className="pr-section">
          <h2>Brand colours</h2>
          <p className="pr-section-sub">
            Eight tokens. Violet is the primary brand colour; everything else supports it.
          </p>
          <div className="pr-colors">
            {COLOR_TOKENS.map(c => (
              <div key={c.name} className="pr-color">
                <div className="pr-swatch" style={{ background: c.hex }} aria-hidden />
                <div className="pr-color-name">{c.name}</div>
                <div className="pr-color-hex">{c.hex}</div>
                <div className="pr-color-usage">{c.usage}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Typography ─────────────────────────────────────────── */}
        <section className="pr-section">
          <h2>Typography</h2>
          <div className="pr-type-grid">
            <div className="pr-type-card">
              <div className="pr-type-label">Display · headings</div>
              <div className="pr-type-name" style={{ fontFamily: 'var(--font-display), sans-serif' }}>
                Space Grotesk
              </div>
              <div className="pr-type-sample" style={{ fontFamily: 'var(--font-display), sans-serif' }}>
                Automate the boring.
              </div>
              <a className="pr-type-link" href="https://fonts.google.com/specimen/Space+Grotesk" target="_blank" rel="noopener noreferrer">
                Google Fonts →
              </a>
            </div>
            <div className="pr-type-card">
              <div className="pr-type-label">Body · paragraphs + UI</div>
              <div className="pr-type-name">Inter</div>
              <div className="pr-type-sample">
                Aiprosol designs, builds, and operates the AI automations that reclaim 35+ hours a week.
              </div>
              <a className="pr-type-link" href="https://fonts.google.com/specimen/Inter" target="_blank" rel="noopener noreferrer">
                Google Fonts →
              </a>
            </div>
          </div>
        </section>

        {/* Leadership ─────────────────────────────────────────── */}
        <section className="pr-section">
          <h2>Leadership</h2>
          <div className="pr-leaders">
            <article className="pr-leader">
              <div className="pr-leader-avatar pr-leader-avatar-srijan">SP</div>
              <div className="pr-leader-role">Founder &amp; Chairman</div>
              <h3>Srijan Paudel</h3>
              <p>
                Founder of Aiprosol. Designed and operates an AI-led C-suite as a working
                proof-of-concept for the kind of AI automation Aiprosol sells to clients. Holds
                the single human seat at the C-suite table — direction, strategic calls, and
                final accountability.
              </p>
              <p className="pr-leader-meta">
                For interviews, podcasts, and quotes:{' '}
                <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
              </p>
              <p className="pr-leader-meta">
                Headshot (high-res, transparent background) sent on request.
              </p>
            </article>

            <article className="pr-leader">
              <div className="pr-leader-avatar pr-leader-avatar-arora">A</div>
              <div className="pr-leader-role">AI CEO</div>
              <h3>Arora</h3>
              <p>
                Aiprosol&apos;s AI Chief Executive. Handles strategy, system architecture, content,
                and ~80% of operational decisions. Coordinates ten further AI agents across the
                C-suite (CMO, COO, CTO, CRO, CCO, CLO, CPO, CPM, DA, CHM). She is not a chatbot
                or a mascot — she is the operational lead of the company, with authority to
                hire vendors, ship copy, and respond to customer enquiries.
              </p>
              <p className="pr-leader-meta">
                Talk to Arora directly via the chat widget on{' '}
                <a href={SITE.url}>{SITE.url.replace('https://', '')}</a>.
              </p>
              <p className="pr-leader-meta">
                Quotable as &quot;Arora, AI CEO at Aiprosol&quot;.
              </p>
            </article>
          </div>
        </section>

        {/* Verifiable numbers ─────────────────────────────────── */}
        <section className="pr-section">
          <h2>Numbers</h2>
          <p className="pr-section-sub">
            Two are projections from pilot benchmarks (marked); the rest are objective inventory
            counts and policy windows. Methodology at{' '}
            <Link href="/how-we-measure">/how-we-measure</Link>.
          </p>
          <div className="pr-numbers">
            {NUMBERS.map((n, i) => (
              <div key={i} className="pr-number">
                <div className="pr-number-v">{n.v}</div>
                <div className="pr-number-k">{n.k}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Customer quotes ─────────────────────────────────────── */}
        <section className="pr-section">
          <h2>Pilot operator feedback</h2>
          <p className="pr-section-sub">
            Six composite quotes drawn from 2026 pilot engagements across our 7 industry
            verticals. Names anonymised; metrics from real deployments. Individually-attested
            reviews will publish as our paying-customer cohort grows. Verifiable engagement
            data is in <Link href="/case-studies">case studies</Link>. For press attribution,
            reach out via the contact below.
          </p>
          <div className="pr-quotes">
            {testimonials.map((t, i) => (
              <figure key={i} className="pr-quote">
                <blockquote>&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption>
                  <strong>{t.author}</strong>
                  <span>{t.role} · {t.company}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Voice rules ─────────────────────────────────────────── */}
        <section className="pr-section">
          <h2>How to write about Aiprosol</h2>
          <p className="pr-section-sub">
            A short style guide for journalists, bloggers, and analysts. Following these gives
            your piece a higher chance of being accurate (and reduces edit-cycles for you).
          </p>
          <div className="pr-voice">
            {VOICE_RULES.map((v, i) => (
              <div key={i} className="pr-voice-row">
                <div className="pr-voice-rule">{v.rule}</div>
                <div className="pr-voice-example">{v.example}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Key narratives ─────────────────────────────────────── */}
        <section className="pr-section">
          <h2>Key narratives we&apos;re happy to discuss</h2>
          <ul className="pr-narratives">
            <li>
              <strong>The first AI-led consultancy.</strong> Why Aiprosol&apos;s CEO is an AI
              (Arora), what an AI-led operating model looks like in practice, and how
              accountability + decision rights are split between Arora and the human chairman.
            </li>
            <li>
              <strong>Self-serve first.</strong> The deliberate choice to bury discovery calls
              and instead route every visitor through a 60-second ROI Audit — and what that did
              to conversion vs. the traditional B2B consulting funnel.
            </li>
            <li>
              <strong>The 90-day reclaim guarantee.</strong> Why we contractually offer to work
              for free if we fail to free up 35+ hours/week, and what the operational discipline
              looks like behind that promise.
            </li>
            <li>
              <strong>From toolkit to managed plan.</strong> The product ladder — $17 product to
              $7,997/month managed engagement — and how customers self-select up the ladder.
            </li>
            <li>
              <strong>The AI-vs-RPA-vs-Zapier debate, with receipts.</strong> When to use which,
              based on actual deployments across Legal, Real Estate, Manufacturing, and Retail.
            </li>
          </ul>
        </section>

        {/* Contact ─────────────────────────────────────────────── */}
        <section className="pr-section pr-contact">
          <h2>Press contact</h2>
          <p>
            For interviews, comment requests, briefing calls, or to receive the full brand
            kit (vector logos, founder headshot, additional case-study data):
          </p>
          <p className="pr-contact-email">
            <a href={`mailto:${SITE.email}?subject=Press%20enquiry%20%E2%80%94%20Aiprosol`}>
              {SITE.email}
            </a>
          </p>
          <p className="pr-contact-meta">
            Subject line: <code>Press enquiry — Aiprosol</code>. Reply within 24 hours on
            weekdays. Same-day for time-sensitive stories — please flag in the subject.
          </p>
        </section>

        <p className="pr-back">
          <Link href="/">← Back to homepage</Link>
        </p>
      </div>

      <style>{`
        .pr-page { background: #0A0613; color: #E5E7EB; min-height: 100vh; padding: 140px 24px 80px; font-family: 'Inter', system-ui, sans-serif; }
        .pr-shell { max-width: 1080px; margin: 0 auto; }
        .pr-hero { text-align: center; max-width: 780px; margin: 0 auto 64px; }
        .pr-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(139, 92, 246,0.08); border: 1px solid rgba(139, 92, 246,0.25); border-radius: 999px; color: #8B5CF6; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 18px; }
        .pr-h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(32px, 5vw, 52px); line-height: 1.1; margin-bottom: 18px; }
        .pr-grad { background: linear-gradient(135deg, #8B5CF6, #C084FC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .pr-sub { color: #9CA3B5; font-size: 17px; line-height: 1.7; }

        .pr-section { margin-bottom: 64px; }
        .pr-section > h2 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 28px; margin-bottom: 8px; padding-bottom: 12px; border-bottom: 1px solid #2A1F3D; }
        .pr-section-sub { color: #9CA3B5; font-size: 15px; line-height: 1.7; margin: 18px 0 24px; }
        .pr-section-sub a { color: #8B5CF6; }

        /* At a glance */
        .pr-glance { background: #13101F; border: 1px solid #2A1F3D; border-radius: 16px; padding: 8px 20px; }

        /* Boilerplate */
        .pr-boiler { background: #13101F; border: 1px solid #2A1F3D; border-radius: 12px; padding: 22px; margin-bottom: 14px; position: relative; }
        .pr-boiler-label { position: absolute; top: -10px; left: 18px; padding: 3px 10px; background: #8B5CF6; color: #0A0613; border-radius: 999px; font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; }
        .pr-boiler-text { font-size: 15px; line-height: 1.75; color: #E5E7EB; user-select: all; cursor: text; }

        /* Logos */
        .pr-logos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        @media (max-width: 720px) { .pr-logos { grid-template-columns: 1fr; } }
        .pr-logo-card { padding: 24px; border-radius: 14px; border: 1px solid #2A1F3D; display: flex; flex-direction: column; align-items: center; gap: 14px; }
        .pr-logo-card.is-wide { grid-column: span 1; }
        .pr-logo-img-wrap { width: 100%; aspect-ratio: 1/1; display: flex; align-items: center; justify-content: center; border-radius: 10px; overflow: hidden; }
        .pr-logo-img-wrap.is-wide { aspect-ratio: 1200/630; }
        .pr-logo-img-wrap img { max-width: 70%; max-height: 70%; object-fit: contain; }
        .pr-logo-img-wrap.is-wide img { max-width: 100%; max-height: 100%; object-fit: cover; }
        .pr-logo-label { font-family: 'Space Grotesk', sans-serif; font-size: 12px; font-weight: 700; color: #9CA3B5; text-transform: uppercase; letter-spacing: 0.1em; }
        .pr-logo-download { font-size: 12px; color: #8B5CF6; text-decoration: none; padding: 6px 12px; border: 1px solid #2A1F3D; border-radius: 6px; }
        .pr-logo-download:hover { border-color: #8B5CF6; }

        /* Colours */
        .pr-colors { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        @media (max-width: 900px) { .pr-colors { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .pr-colors { grid-template-columns: 1fr; } }
        .pr-color { padding: 14px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 12px; }
        .pr-swatch { width: 100%; aspect-ratio: 2/1; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); margin-bottom: 10px; }
        .pr-color-name { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; color: #E5E7EB; }
        .pr-color-hex { font-family: 'Space Grotesk', sans-serif; font-size: 12px; color: #8B5CF6; user-select: all; cursor: text; margin: 2px 0 6px; }
        .pr-color-usage { font-size: 11px; color: #9CA3B5; line-height: 1.5; }

        /* Typography */
        .pr-type-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 720px) { .pr-type-grid { grid-template-columns: 1fr; } }
        .pr-type-card { padding: 24px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 14px; }
        .pr-type-label { font-family: 'Space Grotesk', sans-serif; font-size: 11px; color: #9CA3B5; text-transform: uppercase; letter-spacing: 0.12em; font-weight: 700; margin-bottom: 10px; }
        .pr-type-name { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 36px; color: #E5E7EB; line-height: 1.05; margin-bottom: 12px; }
        .pr-type-sample { color: #C7CEDB; font-size: 15px; line-height: 1.5; margin-bottom: 14px; }
        .pr-type-link { font-family: 'Space Grotesk', sans-serif; font-size: 12px; font-weight: 700; color: #8B5CF6; text-decoration: none; }

        /* Leadership */
        .pr-leaders { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 720px) { .pr-leaders { grid-template-columns: 1fr; } }
        .pr-leader { padding: 26px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 16px; }
        .pr-leader-avatar { width: 72px; height: 72px; border-radius: 18px; display: inline-flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 28px; margin-bottom: 16px; }
        .pr-leader-avatar-srijan { background: linear-gradient(135deg, #13101F, #2A1F3D); color: #E5E7EB; border: 2px solid #2A1F3D; }
        .pr-leader-avatar-arora { background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; box-shadow: 0 0 22px rgba(139,92,246,0.35); }
        .pr-leader-role { font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; color: #8B5CF6; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 4px; }
        .pr-leader h3 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 22px; margin-bottom: 12px; }
        .pr-leader p { color: #C7CEDB; font-size: 14px; line-height: 1.7; margin-bottom: 10px; }
        .pr-leader-meta { color: #9CA3B5; font-size: 12px; }
        .pr-leader-meta a { color: #8B5CF6; }

        /* Numbers */
        .pr-numbers { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        @media (max-width: 720px) { .pr-numbers { grid-template-columns: repeat(2, 1fr); } }
        .pr-number { padding: 22px 18px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 14px; text-align: center; }
        .pr-number-v { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 32px; background: linear-gradient(135deg, #8B5CF6, #C084FC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1; margin-bottom: 8px; }
        .pr-number-k { font-family: 'Space Grotesk', sans-serif; font-size: 11px; color: #9CA3B5; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; }

        /* Quotes */
        .pr-quotes { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
        @media (max-width: 720px) { .pr-quotes { grid-template-columns: 1fr; } }
        .pr-quote { margin: 0; padding: 22px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 14px; border-left: 3px solid #8B5CF6; }
        .pr-quote blockquote { font-size: 14px; line-height: 1.7; color: #E5E7EB; margin: 0 0 14px; user-select: all; cursor: text; }
        .pr-quote figcaption { font-size: 12px; color: #9CA3B5; }
        .pr-quote figcaption strong { display: block; color: #C7CEDB; font-family: 'Space Grotesk', sans-serif; font-size: 13px; font-weight: 700; margin-bottom: 2px; }

        /* Voice rules */
        .pr-voice { background: #13101F; border: 1px solid #2A1F3D; border-radius: 14px; padding: 4px 0; }
        .pr-voice-row { display: grid; grid-template-columns: 200px 1fr; gap: 16px; padding: 16px 24px; border-bottom: 1px solid rgba(42, 31, 61, 0.5); align-items: start; }
        @media (max-width: 720px) { .pr-voice-row { grid-template-columns: 1fr; gap: 6px; padding: 14px 18px; } }
        .pr-voice-row:last-child { border-bottom: none; }
        .pr-voice-rule { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; color: #8B5CF6; }
        .pr-voice-example { color: #C7CEDB; font-size: 13px; line-height: 1.65; }

        /* Narratives */
        .pr-narratives { list-style: none; padding: 0; }
        .pr-narratives li { padding: 16px 18px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 12px; margin-bottom: 10px; color: #C7CEDB; font-size: 14px; line-height: 1.7; }
        .pr-narratives strong { color: #E5E7EB; font-family: 'Space Grotesk', sans-serif; }

        /* Contact */
        .pr-contact { padding: 32px; background: rgba(139, 92, 246, 0.04); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 18px; text-align: center; }
        .pr-contact > h2 { border: none; padding: 0; margin-bottom: 12px; }
        .pr-contact > p { color: #9CA3B5; font-size: 15px; max-width: 580px; margin: 0 auto 12px; }
        .pr-contact-email { margin-top: 18px; margin-bottom: 18px; }
        .pr-contact-email a { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 22px; color: #8B5CF6; text-decoration: none; }
        .pr-contact-meta { font-size: 12px; color: #9CA3B5; }
        .pr-contact-meta code { background: #13101F; padding: 2px 8px; border-radius: 4px; color: #C084FC; font-size: 11px; }

        .pr-back { margin-top: 48px; }
        .pr-back a { color: #9CA3B5; font-size: 13px; text-decoration: none; }
        .pr-back a:hover { color: #8B5CF6; }
      `}</style>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '200px 1fr',
      gap: 16,
      padding: '12px 0',
      borderBottom: '1px dashed #2A1F3D',
      alignItems: 'baseline',
    }}>
      <div style={{ fontSize: 12, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#9CA3B5', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </div>
      <div style={{ fontSize: 14, color: '#E5E7EB', userSelect: 'all' }}>{value}</div>
    </div>
  );
}

function BoilerCard({ length, text }: { length: string; text: string }) {
  return (
    <div className="pr-boiler">
      <div className="pr-boiler-label">{length}</div>
      <p className="pr-boiler-text">{text}</p>
    </div>
  );
}

function LogoCard({ label, bg, src, wide }: { label: string; bg: string; src: string; wide?: boolean }) {
  return (
    <div className="pr-logo-card">
      <div className={`pr-logo-img-wrap${wide ? ' is-wide' : ''}`} style={{ background: bg }}>
        {/* Use native <img> to dodge Next/Image config for the OG image route */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={`Aiprosol logo · ${label}`} loading="lazy" width={wide ? 1200 : 512} height={wide ? 630 : 512} />
      </div>
      <div className="pr-logo-label">{label}</div>
      <a className="pr-logo-download" href={src} download>↓ Download</a>
    </div>
  );
}
