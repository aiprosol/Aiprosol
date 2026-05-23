import { renderOG, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template';

export const alt = 'About Aiprosol — Built by AI. Run by AI. Audited by humans.';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderOG({
    eyebrow: 'Aiprosol · About',
    headlineTop: 'Built by AI.',
    headlineBottom: 'Run by AI.',
    highlights: [
      { value: '11', label: 'C-suite roles · 10 AI + 1 human' },
      { value: 'CEO', label: 'Arora · AI operational lead' },
      { value: '2026', label: 'Founded' },
    ],
  });
}
