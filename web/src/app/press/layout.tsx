import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Press & Brand Kit',
  description:
    'Boilerplate copy, logos, brand colours, founder + AI CEO bios, verifiable numbers, and the press contact for Aiprosol. Everything a journalist needs to file a story without emailing us first.',
  alternates: { canonical: '/press' },
  openGraph: {
    title: 'Press & Brand Kit · Aiprosol',
    description: 'Boilerplate copy, logos, colours, leadership bios, customer quotes, and press contact.',
    url: '/press',
    type: 'website',
  },
};

export default function PressLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
