'use client';

import { useEffect, useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { readConsent, onConsentChange } from '@/lib/consent';

// ─────────────────────────────────────────────────────────────────────────
// PostHogProvider — gated by cookie consent.
//
// Behaviour:
//   - On mount, read consent status.
//   - If 'accepted' → init PostHog immediately.
//   - If 'unknown' or 'declined' → keep PostHog inert.
//   - Listens for 'aiprosol:consent' events so accepting via the banner
//     activates analytics without a page reload.
//
// No-op when NEXT_PUBLIC_POSTHOG_KEY is missing.
// ─────────────────────────────────────────────────────────────────────────

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';

function bootPostHog() {
  if (!KEY) return;
  if (typeof window === 'undefined') return;
  // Idempotent — calling init twice is a no-op after the first
  posthog.init(KEY, {
    api_host: HOST,
    capture_pageview: false, // We do this manually below for App Router
    capture_pageleave: true,
    person_profiles: 'identified_only', // Only create profiles after identify()
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: '[data-ph-mask]',
    },
    loaded: ph => {
      if (process.env.NODE_ENV === 'development') ph.debug(false);
    },
  });
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (readConsent() === 'accepted') {
      bootPostHog();
      setEnabled(true);
    }
    const unsub = onConsentChange((status) => {
      if (status === 'accepted') {
        bootPostHog();
        setEnabled(true);
      } else if (status === 'declined') {
        // Stop any in-flight tracking. opt_out_capturing is safe even if not initialised.
        try { posthog.opt_out_capturing(); } catch {}
        setEnabled(false);
      }
    });
    return unsub;
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <PageviewTracker enabled={enabled} />
      </Suspense>
      {children}
    </>
  );
}

function PageviewTracker({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!enabled) return;
    if (!KEY) return;
    if (typeof window === 'undefined') return;
    const url =
      window.location.origin +
      pathname +
      (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    posthog.capture('$pageview', { $current_url: url });
  }, [pathname, searchParams, enabled]);

  return null;
}
