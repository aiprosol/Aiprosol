// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · Site config — nav, footer, social, legal
// One source of truth. Everything renders from here.
// ─────────────────────────────────────────────────────────────────────────

// Email config — temporary state while aiprosol.com domain mail is being set up.
// `email` and `founderEmail` are PUBLIC (footer, dashboard, contact links, replies).
// `fromEmail` is the technical sender for Resend (still needs DKIM/SPF on aiprosol.com).
// Swap email + founderEmail back to @aiprosol.com once Google Workspace / M365 is live.
export const SITE = {
  name: 'Aiprosol',
  tagline: 'Automate the boring. Scale the important.',
  url: 'https://aiprosol.com',
  email: 'srijanpaudelofficial@gmail.com',
  founderEmail: 'srijanpaudelofficial@gmail.com',
  fromEmail: 'hello@aiprosol.com',
  calendly: 'https://calendly.com/srijanpaudel219/30min',
  founder: 'Srijan Paudel',
  aiCEO: 'Arora',
} as const;

// Founder profile · single source of truth for the /founder page,
// Schema.org Person JSON-LD, and any cross-internet identity surface.
// Personal handles, NOT the company's. Update here whenever a new
// platform gets claimed — the sameAs array on /founder picks these up
// automatically and Google starts collapsing the identities into one
// Knowledge Graph card after ~60–90 days.
export const FOUNDER_PROFILE = {
  name: 'Srijan Paudel',
  role: 'Founder & Chairman',
  company: 'Aiprosol',
  tagline: 'The only human at our AI-led C-suite table.',
  bio50:
    'Srijan Paudel is the Founder & Chairman of Aiprosol, a global AI automation consultancy that runs as an AI-led C-suite — Arora the AI CEO plus ten AI agents under a single human seat. Aiprosol\'s customers reclaim 35+ hours a week with a 90-day guarantee.',
  bio100:
    'Srijan Paudel is the Founder & Chairman of Aiprosol, a global AI automation consultancy headquartered nowhere and run from anywhere. He\'s the only human at the company\'s C-suite table — operational leadership belongs to Arora, an AI CEO who runs strategy, customer interactions, and ~80% of day-to-day decisions, supported by ten AI agents across COO, CMO, CTO, CRO, CCO, CPM, CLO, CPO, DA, and CHM roles. Aiprosol\'s customers — including legal, real estate, manufacturing, and retail teams — reclaim an average of 35+ hours a week, backed by a 90-day money-back guarantee.',
  // Personal social handles. Some may not yet exist — they\'re aspirational
  // anchors for the sameAs array and will start working the moment Srijan
  // claims each handle. (See build/FOUNDER-BRAND-CHAIRMAN.md §3.)
  linkedin: 'https://www.linkedin.com/in/srijan-paudel',
  twitter: 'https://x.com/srijanpaudel6',
  facebook: 'https://www.facebook.com/srijanpaudel2012',
  instagram: 'https://www.instagram.com/srijanpaudel20',
  github: 'https://github.com/srijanpaudel',
  substack: 'https://srijanpaudel.substack.com',
  youtube: '',           // not active yet — left blank, sameAs filters it out
  productHunt: '',       // claim later
  knowsAbout: [
    'AI automation',
    'AI-led operating models',
    'Intelligent document processing',
    'Lead response automation',
    'MES integration for manufacturing',
    'Stockout prediction for retail',
    'Workflow automation',
    'Agentic AI systems',
  ],
} as const;

// Top nav — kept tight (7 items max). "Agents" promotes the killer
// differentiator (live AI C-suite); "About" moved to the footer Company
// group where it logically lives. ROI Audit is the primary CTA on the
// right of the nav, not a regular link.
export const NAV_LINKS = [
  { href: '/services', label: 'Services' },
  { href: '/digital-products', label: 'Products' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/agents', label: 'Agents' },
  { href: '/case-studies', label: 'Cases' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
] as const;

export const FOOTER_LINKS = [
  {
    title: 'Solutions',
    links: [
      { href: '/services', label: 'AI Services (11)' },
      { href: '/digital-products', label: 'Digital Products (19)' },
      { href: '/use-cases', label: 'Use Cases' },
      { href: '/industries', label: 'By Industry' },
      { href: '/pricing', label: 'Managed Plans' },
      { href: '/roi-audit', label: 'Free ROI Audit' },
      { href: '/roi-simulator', label: 'ROI Simulator' },
      { href: '/inbox', label: 'Arora Inbox · Beta' },
    ],
  },
  {
    title: 'Proof',
    links: [
      { href: '/agents', label: 'Live AI C-Suite' },
      { href: '/transparency', label: 'Operational Transparency · live' },
      { href: '/how-we-measure', label: 'How We Measure ROI' },
      { href: '/compare', label: 'Compare Aiprosol vs…' },
      { href: '/case-studies', label: 'Case Studies' },
      { href: '/guides', label: 'Definitive Guides' },
      { href: '/how-to', label: 'How-To Guides' },
      { href: '/blog', label: 'Blog' },
      { href: '/glossary', label: 'AI Automation Glossary' },
      { href: '/faqs', label: 'FAQs' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/founder', label: 'Founder · Srijan Paudel' },
      { href: '/press', label: 'Press & Brand Kit' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/terms', label: 'Terms' },
      { href: '/privacy', label: 'Privacy' },
      { href: '/cookies', label: 'Cookies' },
      { href: '/refund-policy', label: 'Refund Policy' },
    ],
  },
] as const;

export const SOCIAL = {
  linkedin: 'https://linkedin.com/company/aiprosol',
  // No dedicated @aiprosol handle on X — that belongs to the unrelated AU
  // firm. Founder X (@srijanpaudel6) doubles as the brand voice for now.
  twitter: 'https://x.com/srijanpaudel6',
  github: 'https://github.com/aiprosol',
} as const;
