import { renderOG, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template';

export const alt = 'Aiprosol AI Services — 11 done-for-you automations';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderOG({
    eyebrow: 'Aiprosol · 11 AI Services',
    headlineTop: 'From manual chaos',
    headlineBottom: 'to self-running systems.',
    highlights: [
      { value: '11', label: 'AI services' },
      { value: '14d', label: 'Onboarding' },
      { value: '340%', label: 'Avg projected ROI' },
    ],
  });
}
