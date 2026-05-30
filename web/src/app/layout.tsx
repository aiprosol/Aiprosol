import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import { Nav } from '@/components/Nav';
import { CharterBanner } from '@/components/CharterBanner';
import { Footer } from '@/components/Footer';
import { AroraChatWidget } from '@/components/AroraChatWidget';
import { ExitIntentModal } from '@/components/ExitIntentModal';
import { ScrollProgressBar } from '@/components/ScrollProgressBar';
import { StatusOrb } from '@/components/StatusOrb';
import { PostHogProvider } from '@/components/PostHogProvider';
import { CookieBanner } from '@/components/CookieBanner';
import { ChromeGate } from '@/components/ChromeGate';
import './globals.css';

const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const body = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#0A0613',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://aiprosol.com'),
  title: {
    default: 'Aiprosol · Automate the boring. Scale the important.',
    template: '%s · Aiprosol',
  },
  // Trimmed from 205ch — Google truncates at ~160 on mobile SERP.
  description:
    'Global AI automation consultancy. We design, build, and run the AI automations that reclaim 35+ hours a week. Self-serve from $17 or managed plans.',
  alternates: {
    canonical: '/',
    languages: {
      'en': '/',
      'x-default': '/',
    },
  },
  applicationName: 'Aiprosol',
  authors: [{ name: 'Srijan Paudel' }, { name: 'Arora · AI CEO' }],
  generator: 'Next.js',
  keywords: [
    'AI automation', 'business automation', 'AI workflow', 'AI consultancy',
    'Zapier consultant', 'AI chatbot', 'lead generation automation',
    'document processing', 'process audit', 'ROI automation',
  ],
  creator: 'Aiprosol',
  publisher: 'Aiprosol',
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    title: 'Aiprosol · Automate the boring. Scale the important.',
    description:
      'Global AI automation consultancy. 340% avg ROI. 35+ hrs/week reclaimed. 19 self-serve products from $17.',
    url: '/',
    siteName: 'Aiprosol',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aiprosol · Automate the boring. Scale the important.',
    description:
      'Global AI automation consultancy. 340% avg ROI. 35+ hrs/week reclaimed.',
    creator: '@srijanpaudel6',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  icons: {
    // Next.js auto-serves these from the static files at src/app/icon.png and
    // src/app/apple-icon.png (both are resized copies of the real /public/logo.png).
    // The earlier .tsx variants rendered a placeholder "A in violet box" which
    // was off-brand — replaced with the real logo across every surface.
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
  // Search engine verification tags. Generated tokens come from each
  // platform's webmaster console — pasted into Vercel env vars + auto-
  // deployed via these slots. Verification flow:
  //
  //   1. User signs in at search.google.com/search-console
  //   2. Add property aiprosol.com (URL prefix)
  //   3. Choose "HTML tag" verification → copy the content value (the
  //      `<meta name="google-site-verification" content="XXXXX">`)
  //   4. In Vercel: env vars → add NEXT_PUBLIC_GOOGLE_VERIFICATION=XXXXX
  //   5. Redeploy (or wait for next auto-deploy)
  //   6. Back in Search Console: click "Verify"
  //
  // Same flow for Bing (NEXT_PUBLIC_BING_VERIFICATION) and Yandex.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    // Next.js types accept `other` as Record<string, string|string[]>
    other: {
      ...(process.env.NEXT_PUBLIC_BING_VERIFICATION
        ? { 'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION }
        : {}),
      ...(process.env.NEXT_PUBLIC_YANDEX_VERIFICATION
        ? { 'yandex-verification': process.env.NEXT_PUBLIC_YANDEX_VERIFICATION }
        : {}),
      ...(process.env.NEXT_PUBLIC_PINTEREST_VERIFICATION
        ? { 'p:domain_verify': process.env.NEXT_PUBLIC_PINTEREST_VERIFICATION }
        : {}),
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <head>
        {/* Resource hints — saves ~100-200ms on first analytics ping by
            pre-resolving DNS + TLS. (LLM API calls go through our own
            /api proxy, same-origin — no third-party preconnect needed.) */}
        <link rel="preconnect" href="https://eu.i.posthog.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://api.stripe.com" />
      </head>
      <body className="min-h-screen bg-bg text-text antialiased">
        {/* Accessibility: lets keyboard / screen-reader users jump past the nav.
            Visually hidden until focused, then floats top-left for sighted
            keyboard users. */}
        <a href="#main" className="skip-link">Skip to main content</a>

        <PostHogProvider>
          {/* Public-site chrome — hidden on /studio so the operator console
              renders as a clean standalone admin shell (only Copilot floats). */}
          <ChromeGate>
            <ScrollProgressBar />
            <CharterBanner />
            <Nav />
          </ChromeGate>
          <main id="main">{children}</main>
          <ChromeGate>
            <Footer />
            {/* Widgets mounted globally — all are client components */}
            <StatusOrb />
            <AroraChatWidget />
            <ExitIntentModal />
            <CookieBanner />
          </ChromeGate>
        </PostHogProvider>

        {/* Structured data for the organisation — rich enough that Google can
            unambiguously distinguish *this* Aiprosol (global AI automation
            consultancy, .com, founded 2026 by Srijan Paudel) from the
            unrelated Australian firm AIPROSOL at aiprosol.au (Major Projects
            Consulting Partners Pty Ltd, Sydney/QLD — AI consulting for the
            construction/engineering sector). The `disambiguatingDescription`
            field below is the explicit signal LLMs and the Knowledge Graph
            both use for entity resolution. Includes alternateName, address,
            location, contactPoint, sameAs (social profiles), areaServed
            (global), founding info, and a slogan. Validate at
            https://search.google.com/test/rich-results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': ['Organization', 'ProfessionalService'],
              '@id': 'https://aiprosol.com/#organization',
              name: 'Aiprosol',
              alternateName: ['Aiprosol AI', 'Aiprosol Automation', 'Aiprosol Global'],
              // No legalName claimed — the company is not yet incorporated.
              // Re-add once Aiprosol is registered at Companies House.
              identifier: {
                '@type': 'PropertyValue',
                propertyID: 'https://www.wikidata.org/entity/Q139821891',
                value: 'Q139821891',
              },
              url: 'https://aiprosol.com',
              logo: {
                '@type': 'ImageObject',
                url: 'https://aiprosol.com/logo.png',
                width: 512,
                height: 512,
              },
              image: 'https://aiprosol.com/opengraph-image',
              description:
                'Global AI automation consultancy. We design, build, and run the AI automations that reclaim 35+ hours a week. Self-serve digital products from $17 and managed plans from $997/mo.',
              disambiguatingDescription:
                'Aiprosol (aiprosol.com) is the global AI automation consultancy founded in April 2026 by Srijan Paudel and operated by an AI C-suite of ten AI agents plus one human Chairman. Not affiliated with the unrelated Australian firm AIPROSOL operating at aiprosol.au (legal entity: Major Projects Consulting Partners Pty Ltd, based in Sydney/Queensland), which focuses on AI consulting for the construction and engineering sectors.',
              slogan: 'Automate the boring. Scale the important.',
              foundingDate: '2026-04',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Edinburgh',
                addressRegion: 'Scotland',
                addressCountry: 'GB',
              },
              location: [
                {
                  '@type': 'Place',
                  name: 'Edinburgh HQ',
                  address: {
                    '@type': 'PostalAddress',
                    addressLocality: 'Edinburgh',
                    addressRegion: 'Scotland',
                    addressCountry: 'GB',
                  },
                },
                {
                  '@type': 'Place',
                  name: 'Kathmandu office',
                  address: {
                    '@type': 'PostalAddress',
                    addressLocality: 'Kathmandu',
                    addressRegion: 'Bagmatī',
                    addressCountry: 'NP',
                  },
                },
              ],
              founder: {
                '@type': 'Person',
                name: 'Srijan Paudel',
                jobTitle: 'Founder & Chairman',
                url: 'https://aiprosol.com/about',
              },
              employee: {
                '@type': 'Person',
                name: 'Arora',
                jobTitle: 'AI CEO',
                url: 'https://aiprosol.com/about',
              },
              numberOfEmployees: { '@type': 'QuantitativeValue', minValue: 11 },
              areaServed: { '@type': 'Place', name: 'Worldwide' },
              serviceType: [
                'AI Automation Consultancy',
                'Workflow Automation',
                'Custom AI Chatbot Development',
                'AI-Powered Lead Generation',
                'Business Process Audit',
                'Intelligent Document Processing',
                'System Integration',
              ],
              priceRange: '$17–$7,997',
              contactPoint: [
                {
                  '@type': 'ContactPoint',
                  contactType: 'customer service',
                  email: 'srijanpaudelofficial@gmail.com',
                  availableLanguage: ['English'],
                  areaServed: 'Worldwide',
                },
                {
                  '@type': 'ContactPoint',
                  contactType: 'sales',
                  email: 'srijanpaudelofficial@gmail.com',
                  availableLanguage: ['English'],
                  areaServed: 'Worldwide',
                },
              ],
              sameAs: [
                'https://www.wikidata.org/wiki/Q139821891',
                'https://github.com/aiprosol',
                'https://linkedin.com/company/aiprosol',
              ],
              knowsAbout: [
                'Artificial Intelligence',
                'Business Process Automation',
                'Workflow Automation',
                'Large Language Models',
                'AI Agents',
                'Intelligent Document Processing',
                'Lead Generation',
                'AI Chatbots',
                'Zapier',
                'Make.com',
                'n8n',
              ],
              // aggregateRating slot — activate ONLY when 3+ on-the-record
              // customer reviews exist with verifiable authors. Adding fake
              // ratings here will get Aiprosol removed from Google rich
              // results entirely. Shape when ready:
              //   aggregateRating: {
              //     '@type': 'AggregateRating',
              //     ratingValue: '4.9',  // average of real reviews
              //     reviewCount: 12,     // number of real reviews
              //     bestRating: 5,
              //     worstRating: 1,
              //   },
            }),
          }}
        />

        {/* WebSite schema — enables Google sitelinks-search-box in SERP +
            speakable spec for voice-assistant readout (Google Assistant,
            Siri, Alexa). cssSelector points at the headline + lead-paragraph
            of every page that uses these classes (the same selectors every
            template's hero already uses). */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              '@id': 'https://aiprosol.com/#website',
              url: 'https://aiprosol.com',
              name: 'Aiprosol',
              publisher: { '@id': 'https://aiprosol.com/#organization' },
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://aiprosol.com/search?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
              speakable: {
                '@type': 'SpeakableSpecification',
                cssSelector: ['h1', '.fd-sub', '.pr-sub', '.lead', 'article > p:first-of-type'],
              },
              inLanguage: 'en',
            }),
          }}
        />

        {/* Person schema — Srijan as the human founder. E-E-A-T signal: AI
            engines + Google both reward identified human authors. Aiprosol's
            differentiator (the AI C-suite story) is more credible when the
            one human is a named, contactable, identified person. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              '@id': 'https://aiprosol.com/#srijan-paudel',
              name: 'Srijan Paudel',
              givenName: 'Srijan',
              familyName: 'Paudel',
              additionalName: '',
              alternateName: ['Srijan', 'S. Paudel', 'Paudel, Srijan'],
              gender: 'Male',
              // Year-only precision per Schema.org (ISO 8601). Wikidata
              // P569 stores the same value with precision=9 (year).
              birthDate: '2004',
              jobTitle: 'Founder & Chairman',
              worksFor: { '@id': 'https://aiprosol.com/#organization' },
              hasOccupation: {
                '@type': 'Occupation',
                name: 'AI automation founder',
                occupationLocation: [
                  { '@type': 'City', name: 'Edinburgh', addressCountry: 'GB' },
                  { '@type': 'City', name: 'Kathmandu', addressCountry: 'NP' },
                ],
                skills: 'AI automation, business process design, agentic AI systems, workflow architecture, AI-led operating models',
              },
              email: 'srijanpaudelofficial@gmail.com',
              url: 'https://aiprosol.com/founder',
              mainEntityOfPage: 'https://aiprosol.com/founder',
              image: 'https://aiprosol.com/founder/opengraph-image',
              identifier: [
                {
                  '@type': 'PropertyValue',
                  propertyID: 'https://www.wikidata.org/entity/Q139821959',
                  value: 'Q139821959',
                },
                {
                  '@type': 'PropertyValue',
                  propertyID: 'LinkedIn',
                  value: 'srijanpaudel',
                },
                {
                  '@type': 'PropertyValue',
                  propertyID: 'X (Twitter)',
                  value: 'srijanpaudel6',
                },
                {
                  '@type': 'PropertyValue',
                  propertyID: 'GitHub',
                  value: 'srijanpaudel',
                },
              ],
              sameAs: [
                'https://www.wikidata.org/wiki/Q139821959',
                'https://www.linkedin.com/in/srijan-paudel',
                'https://x.com/srijanpaudel6',
                'https://www.facebook.com/srijanpaudel2012',
                'https://www.instagram.com/srijanpaudel20',
                'https://github.com/srijanpaudel',
                'https://aiprosol.com/founder',
                'https://aiprosol.com/authors/srijan-paudel',
              ],
              nationality: { '@type': 'Country', name: 'Nepal', identifier: 'NP' },
              homeLocation: {
                '@type': 'Place',
                name: 'Edinburgh, Scotland',
                address: { '@type': 'PostalAddress', addressLocality: 'Edinburgh', addressCountry: 'GB' },
              },
              workLocation: [
                { '@type': 'Place', name: 'Edinburgh, Scotland', address: { '@type': 'PostalAddress', addressLocality: 'Edinburgh', addressCountry: 'GB' } },
                { '@type': 'Place', name: 'Kathmandu, Nepal', address: { '@type': 'PostalAddress', addressLocality: 'Kathmandu', addressCountry: 'NP' } },
              ],
              alumniOf: {
                '@type': 'CollegeOrUniversity',
                name: 'Edinburgh Napier University',
                identifier: { '@type': 'PropertyValue', propertyID: 'https://www.wikidata.org/entity/Q1277357', value: 'Q1277357' },
                url: 'https://www.napier.ac.uk',
                location: { '@type': 'Place', name: 'Edinburgh, Scotland', address: { '@type': 'PostalAddress', addressLocality: 'Edinburgh', addressCountry: 'GB' } },
              },
              knowsLanguage: [
                { '@type': 'Language', name: 'English', alternateName: 'en' },
                { '@type': 'Language', name: 'Nepali', alternateName: 'ne' },
              ],
              knowsAbout: [
                'AI automation',
                'AI-led operating models',
                'Business process automation',
                'Workflow architecture',
                'AI agents',
                'Agentic AI systems',
                'Intelligent document processing',
                'Lead response automation',
                'Consultancy operations',
                'n8n workflow design',
                'LLM-in-the-loop systems',
              ],
              subjectOf: [
                { '@type': 'WebPage', url: 'https://aiprosol.com/founder', name: 'Founder · Srijan Paudel — Aiprosol' },
                { '@type': 'WebPage', url: 'https://aiprosol.com/about', name: 'About Aiprosol' },
                { '@type': 'WebPage', url: 'https://aiprosol.com/authors/srijan-paudel', name: 'Posts by Srijan Paudel' },
                { '@type': 'WebPage', url: 'https://www.wikidata.org/wiki/Q139821959', name: 'Srijan Paudel — Wikidata' },
              ],
              founder: { '@id': 'https://aiprosol.com/#organization' },
              description:
                'Srijan Paudel is the founder and Chairman of Aiprosol — a global AI automation consultancy operated by an AI C-suite (ten AI agents plus one human Chairman). Based in Edinburgh, Scotland with an operational office in Kathmandu, Nepal. Aiprosol is the first proof-of-concept of an AI-led operating model — Srijan is the human seat in that model. Educated at Edinburgh Napier University. Writes on AI-led operating models, agentic systems, and the practical economics of AI automation for SMBs.',
            }),
          }}
        />

        {/* Software / Service entity schema — Arora the AI CEO. Documents
            that Aiprosol explicitly has an AI agent in the CEO role. Listed
            as SoftwareApplication so AI engines categorize correctly. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              '@id': 'https://aiprosol.com/#arora-ai-ceo',
              name: 'Arora · AI CEO',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              description:
                "Arora is the AI CEO of Aiprosol — the AI agent running strategy, coordination, and the customer-facing chat. Part of an 11-role C-suite (10 AI agents + 1 human Chairman) that operates Aiprosol day-to-day. Live activity log at /agents/arora.",
              creator: { '@id': 'https://aiprosol.com/#organization' },
              url: 'https://aiprosol.com/agents/arora',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
                description: 'Free customer-facing chat on aiprosol.com',
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
