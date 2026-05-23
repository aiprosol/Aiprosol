// AIPROSOL · Cookie + analytics consent utility
//
// GDPR / UK-DPA requires opt-in before any non-essential tracking. Because
// PostHog session-recording captures keystrokes, page interactions, and
// pointer paths, it sits firmly in "non-essential" territory.
//
// This module is the single source of truth for whether the visitor has
// granted consent. Three states:
//
//   'unknown'   — no decision yet → show the banner, BLOCK PostHog init
//   'accepted'  — opted in → safe to initialise PostHog
//   'declined'  — opted out → keep PostHog inert; still allow the site to function
//
// Persistence:
//   - Stored in a same-site, 365-day cookie named `aiprosol_consent`
//   - Also mirrored to localStorage for fast client-side reads
//   - Cookie is read by middleware / server code; localStorage by widgets

export type ConsentStatus = 'unknown' | 'accepted' | 'declined';

export const CONSENT_COOKIE = 'aiprosol_consent';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year
const LOCAL_KEY = 'aiprosol_consent_v1';

/** Read the current consent status from the browser (client only). */
export function readConsent(): ConsentStatus {
  if (typeof document === 'undefined') return 'unknown';
  try {
    const ls = localStorage.getItem(LOCAL_KEY);
    if (ls === 'accepted' || ls === 'declined') return ls;
  } catch {}
  // Fallback to cookie
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]+)`),
  );
  if (match) {
    const v = decodeURIComponent(match[1]);
    if (v === 'accepted' || v === 'declined') return v;
  }
  return 'unknown';
}

/** Write consent to both localStorage and cookie. */
export function writeConsent(status: 'accepted' | 'declined'): void {
  if (typeof document === 'undefined') return;
  try { localStorage.setItem(LOCAL_KEY, status); } catch {}
  document.cookie = [
    `${CONSENT_COOKIE}=${status}`,
    `Path=/`,
    `Max-Age=${COOKIE_MAX_AGE_SECONDS}`,
    `SameSite=Lax`,
    location.protocol === 'https:' ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');
  // Notify other components in the same tab
  window.dispatchEvent(new CustomEvent('aiprosol:consent', { detail: status }));
}

/** Subscribe to consent changes in the current tab. */
export function onConsentChange(handler: (status: ConsentStatus) => void): () => void {
  const fn = (e: Event) => {
    const detail = (e as CustomEvent<ConsentStatus>).detail;
    handler(detail);
  };
  window.addEventListener('aiprosol:consent', fn);
  return () => window.removeEventListener('aiprosol:consent', fn);
}
