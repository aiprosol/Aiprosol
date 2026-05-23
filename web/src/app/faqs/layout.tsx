import type { Metadata } from 'next';
import { getFaqs } from '@/lib/content';

export const metadata: Metadata = {
  title: 'FAQs · Pricing, onboarding, security & billing answered',
  description:
    'The 21 most-asked questions about Aiprosol — pricing tiers, security and compliance, what gets built in 14 days, refund policy, and when to use which product.',
  alternates: { canonical: '/faqs' },
  openGraph: {
    title: 'Aiprosol FAQs',
    description: '21 questions answered about pricing, onboarding, security and refund policy.',
    url: '/faqs',
    type: 'website',
  },
};

export default function FaqsLayout({ children }: { children: React.ReactNode }) {
  // FAQPage JSON-LD — enables Google's "People also ask" rich result.
  // Plus SpeakableSpecification so voice assistants (Siri, Alexa, Google
  // Assistant) can read the Q&A aloud directly.
  // Plus BreadcrumbList for hierarchy.
  const faqs = getFaqs();
  const BASE = 'https://aiprosol.com';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FAQPage',
        '@id': `${BASE}/faqs#page`,
        mainEntity: faqs.map(f => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.answer,
          },
        })),
      },
      {
        '@type': 'WebPage',
        '@id': `${BASE}/faqs`,
        url: `${BASE}/faqs`,
        name: 'Aiprosol FAQs',
        speakable: {
          '@type': 'SpeakableSpecification',
          // Selectors should match question + answer surfaces in the rendered DOM.
          cssSelector: ['.faq-question', '.faq-answer', 'summary', 'details p'],
          xpath: ["//*[@itemprop='name']", "//*[@itemprop='acceptedAnswer']"],
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
          { '@type': 'ListItem', position: 2, name: 'FAQs', item: `${BASE}/faqs` },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
