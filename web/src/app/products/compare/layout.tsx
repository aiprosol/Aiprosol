import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compare products side-by-side · Aiprosol',
  description:
    'Side-by-side feature matrix of any two Aiprosol products. Compare pricing, deliverables, outcome metrics, FAQs, and bundle alternatives. Picker driven — no hard-coded comparisons.',
  alternates: { canonical: '/products/compare' },
  openGraph: {
    title: 'Compare Aiprosol products side-by-side',
    description: 'Pick any two products from the 19-product catalogue and compare them on price, deliverables, outcomes, and bundle savings.',
    url: '/products/compare',
    type: 'website',
  },
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
