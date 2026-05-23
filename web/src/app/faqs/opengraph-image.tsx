import { renderOG, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template';

export const alt = 'Aiprosol FAQs — 21 questions answered straight';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderOG({
    eyebrow: 'Aiprosol · FAQs',
    headlineTop: 'Pricing, onboarding,',
    headlineBottom: 'security · all answered.',
    highlights: [
      { value: '21', label: 'Questions covered' },
      { value: '7-day', label: 'Refund · digital products' },
      { value: '90-day', label: 'Reclaim guarantee · plans' },
    ],
  });
}
