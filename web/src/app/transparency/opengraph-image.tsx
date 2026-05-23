import { renderOG, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template';

export const alt = 'Aiprosol Live Operational Transparency — every AI agent decision, public, refreshed every minute';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderOG({
    eyebrow: 'Live · Refreshes every 60s',
    headlineTop: 'Every decision an AI agent',
    headlineBottom: 'made at Aiprosol today.',
    highlights: [
      { value: '10', label: 'AI agents' },
      { value: '24h', label: 'rolling window' },
      { value: 'Public', label: 'no auth gate' },
    ],
  });
}
