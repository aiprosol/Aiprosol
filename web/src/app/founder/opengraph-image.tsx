import { renderOG, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template';

export const alt = 'Srijan Paudel · Founder & Chairman of Aiprosol — the only human at our AI-led C-suite table';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderOG({
    eyebrow: 'Founder · Chairman · Aiprosol',
    headlineTop: 'Srijan Paudel.',
    headlineBottom: 'The only human at our AI-led C-suite table.',
    highlights: [
      { value: '11', label: 'C-suite seats' },
      { value: '1', label: 'Human · me' },
      { value: '10', label: 'AI agents · Arora-led' },
    ],
  });
}
