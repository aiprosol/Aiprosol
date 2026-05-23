// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · Analytics — thin PostHog wrapper
//   - Single source of truth for event names (typed)
//   - No-op when NEXT_PUBLIC_POSTHOG_KEY is unset
//   - Safe to call from anywhere (server/client/edge): SSR returns silently
// ─────────────────────────────────────────────────────────────────────────

import posthog from 'posthog-js';

// Canonical event catalogue — every conversion-relevant action goes here.
// Add a new key BEFORE you start firing it; this prevents drift in dashboards.
export const Events = {
  // Hero / global
  HeroCtaClicked:        'hero_cta_clicked',
  NavCtaClicked:         'nav_cta_clicked',

  // ROI Audit funnel
  RoiAuditStarted:       'roi_audit_started',         // first input edited
  RoiAuditSubmitted:     'roi_audit_submitted',       // form POST success
  RoiAuditFailed:        'roi_audit_failed',          // form POST 4xx/5xx

  // Product / plan checkout
  ProductCheckoutClicked: 'product_checkout_clicked', // "Buy" pressed
  PlanCheckoutClicked:    'plan_checkout_clicked',    // "Start plan" pressed
  CheckoutSessionCreated: 'checkout_session_created', // /api/checkout 200
  CheckoutSessionFailed:  'checkout_session_failed',  // /api/checkout !2xx

  // Engagement
  AroraChatOpened:       'arora_chat_opened',
  AroraChatMessageSent:  'arora_chat_message_sent',
  ExitIntentShown:       'exit_intent_shown',
  ExitIntentDismissed:   'exit_intent_dismissed',
  ExitIntentConverted:   'exit_intent_converted',     // CTA inside modal clicked

  // Content
  CaseStudyViewed:       'case_study_viewed',
  ProductViewed:         'product_viewed',
  BlogPostViewed:        'blog_post_viewed',
} as const;

export type EventName = (typeof Events)[keyof typeof Events];

interface CaptureProps {
  [key: string]: string | number | boolean | null | undefined;
}

// Fire-and-forget. Safe to call before PostHog has loaded — it queues.
export function track(event: EventName, properties?: CaptureProps) {
  if (typeof window === 'undefined') return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  try {
    posthog.capture(event, properties);
  } catch {
    // Never let analytics break a conversion path
  }
}

// Identify a user once they hand over an email (lead capture, checkout).
// PostHog merges anonymous → identified history automatically.
export function identify(email: string, traits?: CaptureProps) {
  if (typeof window === 'undefined') return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  try {
    posthog.identify(email, traits);
  } catch { /* swallow */ }
}

export function isAnalyticsEnabled() {
  return Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);
}
