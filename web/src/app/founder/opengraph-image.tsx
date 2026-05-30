import { renderOG, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template';

export const alt = 'Srijan Paudel · Founder & Chairman of Aiprosol — I chair a company run by AI';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderOG({
    eyebrow: 'Founder · Chairman · Aiprosol',
    headlineTop: 'Srijan Paudel.',
    headlineBottom: 'I chair a company run by AI.',
    highlights: [
      { value: '11', label: 'C-suite seats' },
      { value: '1', label: 'Human · me' },
      { value: '10', label: 'AI agents · Arora-led' },
    ],
  });
}
