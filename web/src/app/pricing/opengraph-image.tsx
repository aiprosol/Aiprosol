import { renderOG, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template';

export const alt = 'Aiprosol pricing — Starter $997, Growth $2,997, Enterprise $7,997';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderOG({
    eyebrow: 'Aiprosol · Pricing',
    headlineTop: 'Managed AI plans',
    headlineBottom: 'from $997/mo.',
    highlights: [
      { value: '$997', label: 'Starter · 10–50 employees' },
      { value: '$2,997', label: 'Growth · 50–200' },
      { value: '$7,997', label: 'Enterprise · 200+' },
    ],
  });
}
