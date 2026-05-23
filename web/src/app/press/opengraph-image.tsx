import { renderOG, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template';

export const alt = 'Press & Brand Kit · Aiprosol — boilerplate, logos, colours, leadership';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderOG({
    eyebrow: 'Aiprosol · Press & Brand',
    headlineTop: 'Everything you need',
    headlineBottom: 'to file the story.',
    highlights: [
      { value: '3', label: 'Boilerplate lengths' },
      { value: '6', label: 'Quotable customers' },
      { value: '24h', label: 'Press reply window' },
    ],
  });
}
