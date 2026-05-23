// ─────────────────────────────────────────────────────────────────────────
// POST /api/checkout — create a Stripe Checkout Session
// Accepts { product?: slug, plan?: 'starter'|'growth'|'enterprise', email? }
// Resolves the Stripe Price ID via lib/stripe → resolvePriceId()
// Redirects to checkout. Mode is 'payment' for products, 'subscription' for plans.
// Falls back to a Stripe-not-configured response if env vars are missing.
// ─────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { stripe, isStripeConfigured, resolvePriceId } from '@/lib/stripe';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs'; // Stripe SDK requires Node runtime

const Schema = z
  .object({
    product: z.string().max(120).optional(),
    plan: z.enum(['starter', 'growth', 'enterprise']).optional(),
    email: z.string().email().optional(),
  })
  .refine(d => d.product || d.plan, {
    message: 'Either product or plan must be provided',
  });

export async function POST(req: NextRequest) {
  try {
    // Self-serve first: anonymous checkout is allowed. Stripe Checkout collects the
    // buyer's email; we attach the session if the buyer happens to be signed in.
    const userSession = await getSession();

    if (!isStripeConfigured() || !stripe) {
      return NextResponse.json(
        {
          error: 'stripe-not-configured',
          message: 'Stripe is not yet configured. Set STRIPE_SECRET_KEY in environment to enable checkout.',
          fallbackUrl: '/contact',
        },
        { status: 503 },
      );
    }

    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'invalid-input', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { product, plan, email: bodyEmail } = parsed.data;
    // If the user is signed in, their session email wins (prevents identity spoofing).
    // Otherwise let Stripe Checkout collect the email from the buyer directly.
    const email = userSession?.email || bodyEmail || undefined;
    const slug = product || plan!;
    const priceId = await resolvePriceId(slug);
    if (!priceId) {
      return NextResponse.json(
        {
          error: 'price-not-found',
          message: `No Stripe Price ID for "${slug}". Run \`npm run seed:stripe\` to create products + prices.`,
        },
        { status: 404 },
      );
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://aiprosol.com';
    const isSubscription = Boolean(plan);

    const session = await stripe.checkout.sessions.create({
      mode: isSubscription ? 'subscription' : 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&slug=${encodeURIComponent(slug)}&kind=${isSubscription ? 'plan' : 'product'}`,
      cancel_url: `${origin}/checkout/cancel`,
      // Pre-fill only when we know who the buyer is; otherwise Stripe asks for it.
      ...(email ? { customer_email: email } : {}),
      currency: 'gbp',
      allow_promotion_codes: true,
      automatic_tax: { enabled: false }, // turn on once Stripe Tax is configured
      metadata: {
        slug,
        kind: isSubscription ? 'plan' : 'product',
        source: 'web',
        accountEmail: userSession?.email || 'guest',
      },
      ...(isSubscription
        ? {
            subscription_data: {
              metadata: { slug, kind: 'plan' },
            },
          }
        : {
            payment_intent_data: {
              metadata: { slug, kind: 'product' },
            },
          }),
    });

    return NextResponse.json({ url: session.url, id: session.id });
  } catch (err) {
    console.error('[checkout] error', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Checkout failed' },
      { status: 500 },
    );
  }
}
