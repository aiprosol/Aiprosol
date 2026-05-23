// AIPROSOL · Resend wrapper for transactional email.
//
// FROM must be a domain Resend can verify (aiprosol.com with DKIM/SPF).
// Gmail addresses can't be used as FROM — Resend will reject them. While
// domain mail is being set up, customer REPLIES route to Gmail via reply_to.

import { SITE } from './site-config';

const apiKey = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM_EMAIL || `Arora at Aiprosol <${SITE.fromEmail}>`;

export const isResendConfigured = (): boolean => Boolean(apiKey);

interface SendInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  tags?: Array<{ name: string; value: string }>;
}

/**
 * Sends a single transactional email via Resend's REST API.
 * Returns { ok: true } on success, { ok: false, error } on failure.
 * Does not throw — non-blocking by design.
 */
export async function sendEmail(input: SendInput): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!apiKey) {
    console.log('[email] RESEND_API_KEY not configured — would send:', input.subject, '→', input.to);
    return { ok: false, error: 'no-api-key' };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
        reply_to: input.replyTo || SITE.email,
        tags: input.tags,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.warn('[email] Resend error', res.status, body.slice(0, 200));
      return { ok: false, error: `resend-${res.status}` };
    }

    const data = (await res.json()) as { id?: string };
    return { ok: true, id: data.id };
  } catch (err) {
    console.warn('[email] Resend exception', err);
    return { ok: false, error: err instanceof Error ? err.message : 'unknown' };
  }
}
