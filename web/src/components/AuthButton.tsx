'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface SessionState {
  authenticated: boolean;
  email?: string;
}

export function AuthButton() {
  const pathname = usePathname();
  const [state, setState] = useState<SessionState | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/me', { cache: 'no-store' })
      .then(r => r.json())
      .then((data: SessionState) => { if (!cancelled) setState(data); })
      .catch(() => { if (!cancelled) setState({ authenticated: false }); });
    return () => { cancelled = true; };
  }, [pathname]);

  if (state === null) {
    // Loading skeleton — same width as the loaded states to avoid CLS
    return <div className="h-9 w-24 rounded-lg border border-border" aria-hidden />;
  }

  if (!state.authenticated) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(pathname || '/dashboard')}`}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-text text-sm font-medium hover:border-cyan hover:text-cyan transition-colors"
      >
        Sign in
      </Link>
    );
  }

  const initial = (state.email || '?').charAt(0).toUpperCase();

  return (
    <Link
      href="/dashboard"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card text-text text-sm font-medium hover:border-cyan transition-colors"
      title={state.email}
    >
      <span className="w-7 h-7 rounded-full bg-grad text-bg font-display font-extrabold text-xs inline-flex items-center justify-center">
        {initial}
      </span>
      <span className="hidden md:inline max-w-[120px] truncate">{state.email}</span>
    </Link>
  );
}
