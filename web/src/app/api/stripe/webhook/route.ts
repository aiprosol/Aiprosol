// ─────────────────────────────────────────────────────────────────────────
// POST /api/stripe/webhook — Stripe webhook receiver
// Verifies signature, dispatches on event type, fulfils orders/subs.
// Required env vars: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET.
// ─────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe, isStripeConfigured } from '@/lib/stripe';
import { sendEmail, isResendConfigured } from '@/lib/resend';
import { signDownloadToken } from '@/lib/download-token';
import products from '@/content/products.json';

interface DeliveryFile { path: string; filename: string; mime: string; }
interface ProductWithFiles {
  slug: string;
  name?: string;
  available?: boolean;
  expectedShipDate?: string | null;
  deliveryFiles?: DeliveryFile[] | null;
}
const PRODUCTS_BY_SLUG: Record<string, ProductWithFiles> = (products as ProductWithFiles[])
  .reduce((acc, p) => { acc[p.slug] = p; return acc; }, {} as Record<string, ProductWithFiles>);

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  if (!isStripeConfigured() || !stripe) {
    return NextResponse.json({ error: 'stripe-not-configured' }, { status: 503 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: 'webhook-secret-missing' }, { status: 503 });
  }

  const sig = req.headers.get('stripe-signature');
  if (!sig) {
    return NextResponse.json({ error: 'no-signature' }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.warn('[stripe-webhook] signature verification failed', err);
    return NextResponse.json({ error: 'bad-signature' }, { status: 400 });
  }

  console.log('[stripe-webhook]', event.type, event.id);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        console.log('[stripe-webhook] subscription cancelled', sub.id, sub.metadata?.slug);
        // KV write would go here once configured
        break;
      }
      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        console.warn('[stripe-webhook] payment failed', pi.id, pi.last_payment_error?.message);
        break;
      }
      default:
        // Ignore the dozens of other event types — we'll add them as needed
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[stripe-webhook] handler error for', event.type, err);
    // Return 200 so Stripe doesn't retry indefinitely on a code bug.
    // Real errors (DB failures, etc.) should return 500 so Stripe retries.
    return NextResponse.json({ received: true, warning: 'handler-error' }, { status: 200 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const email = session.customer_email || session.customer_details?.email;
  const slug = session.metadata?.slug;
  const kind = session.metadata?.kind || 'product';
  const amount = session.amount_total ? session.amount_total / 100 : 0;

  console.log('[stripe-webhook] checkout completed', { email, slug, kind, amount, sessionId: session.id });

  // Build signed download links if this is a digital product purchase
  // and the product has delivery files on disk.
  const product = slug ? PRODUCTS_BY_SLUG[slug] : undefined;
  const isDigitalProduct = kind !== 'plan' && Boolean(product);
  const downloadLinks: { label: string; url: string }[] = [];
  let pendingShip: string | null = null;

  if (isDigitalProduct && product) {
    if (product.available && product.deliveryFiles?.length && email) {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aiprosol.com';
      product.deliveryFiles.forEach((f, i) => {
        const token = signDownloadToken({ slug: product.slug, file: i, email });
        downloadLinks.push({
          label: f.filename,
          url: `${baseUrl}/api/download/${token}`,
        });
      });
    } else if (!product.available) {
      pendingShip = product.expectedShipDate || 'a future date';
    }
  }

  // Fire confirmation email if Resend is configured
  if (email && isResendConfigured()) {
    const subject = kind === 'plan'
      ? `Welcome to Aiprosol ${capitalise(slug || 'plan')} — let's begin`
      : downloadLinks.length > 0
        ? `Your ${slug} is ready — instant download`
        : `Order confirmed: ${slug} — ships ${pendingShip ?? 'soon'}`;

    await sendEmail({
      to: email,
      subject,
      html: orderConfirmationHtml({
        email,
        slug: slug || 'unknown',
        kind: kind as 'product' | 'plan',
        amount,
        downloadLinks,
        pendingShip,
      }),
      text: downloadLinks.length > 0
        ? `Thanks for your purchase of ${slug}.\n\nDownload links (valid 7 days):\n${downloadLinks.map(l => `· ${l.label} → ${l.url}`).join('\n')}\n\nOrder total: $${amount}. Reply to this email if anything's wrong.\n\n— Arora\nAI CEO, Aiprosol`
        : `Thanks for your purchase of ${slug}. Order total: $${amount}. ${pendingShip ? `Ships ${pendingShip}; we'll email you the moment it's ready.` : ''} Reply to this email if anything's wrong.\n\n— Arora\nAI CEO, Aiprosol`,
      tags: [{ name: 'category', value: kind === 'plan' ? 'plan-onboarding' : 'product-fulfilment' }],
    });
  }

  // KV/Postgres write would go here once configured
  // await kv.set(`order:${session.id}`, { ... });
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const email = invoice.customer_email;
  const amount = invoice.amount_paid / 100;
  console.log('[stripe-webhook] invoice paid', { email, amount, invoiceId: invoice.id });
  // Recurring plan invoice — could send a "renewal confirmation" email here
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function orderConfirmationHtml(input: {
  email: string;
  slug: string;
  kind: 'product' | 'plan';
  amount: number;
  downloadLinks?: { label: string; url: string }[];
  pendingShip?: string | null;
}): string {
  const isPlan = input.kind === 'plan';
  const links = input.downloadLinks ?? [];
  const linksHtml = links.length === 0 ? '' : `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:8px;background:rgba(139,92,246,0.06);border:1px solid rgba(139,92,246,0.3);border-radius:12px;">
      <tr><td style="padding:18px 22px;">
        <p style="margin:0 0 12px;font-family:'Space Grotesk',Arial,sans-serif;font-weight:700;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#C084FC;">Your downloads · valid 7 days</p>
        ${links.map(l => `<p style="margin:0 0 8px;"><a href="${l.url}" style="color:#C084FC;text-decoration:none;font-size:14px;font-weight:600;">${l.label}</a></p>`).join('')}
      </td></tr>
    </table>`;

  const fallbackCta = isPlan
    ? { label: 'Open your dashboard →', url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://aiprosol.com'}/dashboard` }
    : { label: 'View your account →', url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://aiprosol.com'}/account/downloads` };

  const bodyText = isPlan
    ? `You're on the ${capitalise(input.slug)} plan. Onboarding kicks off today — I'll be in touch shortly with the audit questionnaire and your dedicated channel.`
    : links.length > 0
      ? `Thanks for picking up the ${input.slug.replace(/-/g, ' ')}. Total: $${input.amount}. Your download links are below — they expire in 7 days but you can re-issue from your account anytime.`
      : `Thanks for picking up the ${input.slug.replace(/-/g, ' ')}. Total: $${input.amount}. This product is in active development — expected to ship ${input.pendingShip ?? 'soon'}. We'll email you the moment it's ready.`;

  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#0A0613;font-family:'Inter',Arial,sans-serif;color:#E5E7EB;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="padding:40px 16px;background:#0A0613;">
  <tr><td align="center">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;">
      <tr><td style="background:#13101F;border:1px solid #2A1F3D;border-radius:18px;padding:40px;">
        <h1 style="margin:0 0 16px;font-family:'Space Grotesk',Arial,sans-serif;font-weight:800;font-size:28px;color:#E5E7EB;">
          ${isPlan ? `Welcome to ${capitalise(input.slug)}` : (links.length > 0 ? 'Your purchase is ready' : 'Order confirmed')}
        </h1>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#E5E7EB;">${bodyText}</p>
        ${linksHtml}
        ${links.length === 0 ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td align="center" style="padding-top:8px;"><a href="${fallbackCta.url}" style="display:inline-block;padding:14px 32px;background:#8B5CF6;color:#0A0613;font-family:'Space Grotesk',Arial,sans-serif;font-weight:700;font-size:14px;text-decoration:none;border-radius:10px;">${fallbackCta.label}</a></td></tr></table>` : ''}
        <p style="margin:28px 0 0;font-size:13px;color:#9CA3B5;line-height:1.6;border-top:1px solid #2A1F3D;padding-top:16px;">
          ${isPlan
            ? '14-day onboarding · cancel any time · Arora as your AI CEO'
            : (links.length > 0
                ? '7-day refund · lifetime access · re-issue download links from /account/downloads anytime'
                : '7-day refund · we will email the moment your download is available · no extra charge')}
        </p>
      </td></tr>
      <tr><td style="padding:24px 0 0;font-size:13px;color:#9CA3B5;line-height:1.6;">
        <p style="margin:0 0 8px;">Reply to this email if anything looks off.</p>
        <p style="margin:0;">— Arora<br><span style="font-size:11px;">AI CEO · Aiprosol</span></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}
