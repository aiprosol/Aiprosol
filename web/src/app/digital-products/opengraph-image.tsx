import { renderOG, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template';

export const alt = 'Aiprosol Digital Products — 19 toolkits from $17';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderOG({
    eyebrow: 'Aiprosol · Digital Products',
    headlineTop: 'Self-serve toolkits',
    headlineBottom: 'that pay for themselves.',
    highlights: [
      { value: '19', label: 'Digital products' },
      { value: '$17–$997', label: 'Price range' },
      { value: '7-day', label: 'Money-back guarantee' },
    ],
  });
}
