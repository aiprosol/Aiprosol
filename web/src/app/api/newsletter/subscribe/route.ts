// POST /api/newsletter/subscribe
// Body: { email, source? }
//
// Separate from /api/capture-lead because newsletter subscribers are a
// distinct audience — they want digest content, not sales follow-up.
// Keeping them in their own KV namespace + their own Zapier route avoids
// polluting the lead pipeline.
//
// Storage strategy (mirrors capture-lead's pattern):
//   1. Vercel KV (key: `subscriber:<lowercase-email>`) — when configured
//   2. Zapier webhook (NEWSLETTER_ZAPIER_WEBHOOK) — when configured
//   3. console.log — always fires so dev visibility is never lost

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';

const Schema = z.object({
  email: z.string().email('Invalid email').max(200),
  source: z.string().max(60).optional().default('Footer'),
  consent: z.boolean().optional().default(true),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const source = parsed.data.source;
    const subscribedAt = new Date().toISOString();

    const record = {
      email,
      source,
      subscribedAt,
      // Newsletter-specific fields. Future: add lastEngagedAt, openRate, etc.
      status: 'subscribed' as const,
    };

    // ─── Vercel KV ───────────────────────────────────────────────
    // Separate namespace from leads — `subscriber:<email>` not `lead:<uuid>`.
    // This makes it trivial to ship a "newsletter subscribers" admin view
    // without filtering through lead noise.
    try {
      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        await fetch(`${process.env.KV_REST_API_URL}/set/subscriber:${encodeURIComponent(email)}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.KV_REST_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(record),
        });
      }
    } catch (kvErr) {
      console.warn('[newsletter] KV write failed (non-blocking):', kvErr);
    }

    // ─── Zapier webhook ──────────────────────────────────────────
    // Distinct from the lead webhook. Wire to a Zap that adds them to your
    // newsletter ESP (Resend audience, Mailchimp, ConvertKit, etc.).
    try {
      const hook = process.env.NEWSLETTER_ZAPIER_WEBHOOK;
      if (hook) {
        await fetch(hook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        });
      }
    } catch (zapErr) {
      console.warn('[newsletter] Zapier webhook failed (non-blocking):', zapErr);
    }

    // Always log — visibility in `vercel logs` even pre-KV
    console.log('[newsletter/subscribe]', { email, source });

    return NextResponse.json(
      { ok: true, email, subscribedAt },
      { status: 201, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (err) {
    console.error('[newsletter/subscribe] error', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Subscribe failed' },
      { status: 500 },
    );
  }
}
