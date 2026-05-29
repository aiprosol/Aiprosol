// POST /api/auth/login
// Body: { email, next? }
// Sends a magic-link email. In dev (no Resend), returns the link inline so
// the dev can paste it manually.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { signMagicLink, sanitizeNext } from '@/lib/auth';
import { isAdminEmail } from '@/lib/studio/auth';
import { sendEmail, isResendConfigured } from '@/lib/resend';
import { magicLinkSubject, magicLinkHtml, magicLinkText } from '@/lib/emails/magic-link';

export const runtime = 'nodejs';

const Schema = z.object({
  email: z.string().email('Invalid email').max(200),
  next: z.string().max(200).optional(),
  // Optional profile fields — captured at signup if the user provides them.
  // All trimmed + length-capped before being baked into the magic-link token.
  profile: z.object({
    name: z.string().max(80).optional(),
    company: z.string().max(80).optional(),
    role: z.string().max(60).optional(),
    industry: z.string().max(40).optional(),
  }).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'invalid-input', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const next = sanitizeNext(parsed.data.next);
    const profile = parsed.data.profile;

    // Single-operator lockdown: only emails on the studio admin allowlist
    // can request a magic link. Anyone else gets a polite refusal so the
    // form just looks closed without leaking which addresses are valid.
    if (!isAdminEmail(email)) {
      return NextResponse.json(
        { error: 'signup-closed', message: 'Sign-in is restricted. Contact srijanpaudelofficial@gmail.com if you need access.' },
        { status: 403 },
      );
    }

    const token = await signMagicLink(email, next, profile);
    const origin =
      req.headers.get('origin') ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      `http://${req.headers.get('host') || 'localhost:3000'}`;
    const link = `${origin}/api/auth/verify?token=${encodeURIComponent(token)}`;

    let emailSent = false;
    if (isResendConfigured()) {
      const result = await sendEmail({
        to: email,
        subject: magicLinkSubject(),
        html: magicLinkHtml({ link, siteUrl: origin, expiresIn: '15 minutes' }),
        text: magicLinkText({ link, siteUrl: origin, expiresIn: '15 minutes' }),
        tags: [{ name: 'category', value: 'magic-link' }],
      });
      emailSent = result.ok;
    }

    // Dev visibility: log the link so the dev console can copy-paste it.
    // We always log, regardless of Resend config, because Resend can also fail.
    console.log('[auth/login] magic link for', email, '→', link);

    const showDevLink = process.env.NODE_ENV !== 'production' && !emailSent;

    return NextResponse.json(
      {
        ok: true,
        emailSent,
        ...(showDevLink ? { devLink: link } : {}),
      },
      { status: 200 },
    );
  } catch (err) {
    console.error('[auth/login] error', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Login failed' },
      { status: 500 },
    );
  }
}
