import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free ROI Audit · 60 seconds to your personalised number',
  description:
    'A 60-second personalised ROI estimate based on your team size, automation hours, and industry. Built from 200+ Aiprosol implementations. No email required for the headline number.',
  alternates: { canonical: '/roi-audit' },
  openGraph: {
    title: 'Free 60-Second ROI Audit — Aiprosol',
    description:
      'Personalised ROI estimate in 60 seconds. Based on 200+ real implementations. No email needed.',
    url: '/roi-audit',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free 60-Second ROI Audit',
    description: 'Personalised ROI estimate from 200+ real automation implementations.',
  },
};

export default function RoiAuditLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
