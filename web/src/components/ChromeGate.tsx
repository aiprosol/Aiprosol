'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

// Hides public-site chrome (nav, footer, marketing/customer widgets) on the
// operator admin console at /studio, so it renders as a clean standalone shell.
// Children are rendered by the server layout and passed in, so this works for
// both server and client chrome components.
export function ChromeGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith('/studio')) return null;
  return <>{children}</>;
}
