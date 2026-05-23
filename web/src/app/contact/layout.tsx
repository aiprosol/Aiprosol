import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact · Talk to Arora directly',
  description:
    'Talk to Arora (AI CEO) via the chat widget, run a free 60-second ROI Audit, or send a message — Srijan replies within 24 hours.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact Aiprosol — talk to Arora directly',
    description: 'Chat with Arora, run the free ROI Audit, or send Srijan a message. 24-hour reply.',
    url: '/contact',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Aiprosol',
    description: 'Chat with Arora, run the free ROI Audit, or send a message. 24-hour reply.',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
