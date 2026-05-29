// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · STUDIO — revenue (Stripe, read directly)
// The Stripe webhook persists nothing, so Stripe is the source of truth. We
// read recent checkout sessions (for orders + per-product breakdown) and
// active subscriptions (for MRR). Degrades to a "configure" notice if
// STRIPE_SECRET_KEY is unset. 60s in-module cache.
// ─────────────────────────────────────────────────────────────────────────

import { stripe, isStripeConfigured } from '@/lib/stripe';

export type Order = { slug: string; kind: string; amount: number; email: string | null; created: number };

export type RevenueData =
  | { configured: false }
  | {
      configured: true;
      currency: string;
      today: number;
      mtd: number;
      windowTotal: number; // total across the recent sessions we fetched
      orderCount: number;
      mrr: number;
      activeSubs: number;
      byProduct: Array<{ slug: string; amount: number; count: number }>;
      recentOrders: Order[];
      fetchedAt: string;
    };

let CACHE: { fetchedAt: number; data: RevenueData } | null = null;
const TTL_MS = 60_000;

function monthlyAmount(unit: number, interval: string | undefined): number {
  if (interval === 'year') return unit / 12;
  if (interval === 'week') return unit * 4.33;
  if (interval === 'day') return unit * 30;
  return unit; // month (or unknown → treat as monthly)
}

export async function getRevenue(): Promise<RevenueData> {
  if (!isStripeConfigured() || !stripe) return { configured: false };
  if (CACHE && Date.now() - CACHE.fetchedAt < TTL_MS) return CACHE.data;

  const now = new Date();
  const startOfTodaySec = Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 1000);
  const startOfMonthSec = Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1) / 1000);

  // Orders from recent checkout sessions (paid only). 100 is plenty pre-scale.
  const sessions = await stripe.checkout.sessions.list({ limit: 100 });
  const orders: Order[] = sessions.data
    .filter((s) => s.payment_status === 'paid' || s.status === 'complete')
    .map((s) => ({
      slug: s.metadata?.slug || 'unknown',
      kind: s.metadata?.kind || 'product',
      amount: (s.amount_total ?? 0) / 100,
      email: s.customer_email || s.customer_details?.email || null,
      created: s.created,
    }));

  const today = orders.filter((o) => o.created >= startOfTodaySec).reduce((n, o) => n + o.amount, 0);
  const mtd = orders.filter((o) => o.created >= startOfMonthSec).reduce((n, o) => n + o.amount, 0);
  const windowTotal = orders.reduce((n, o) => n + o.amount, 0);

  const byProductMap = new Map<string, { amount: number; count: number }>();
  for (const o of orders) {
    const cur = byProductMap.get(o.slug) ?? { amount: 0, count: 0 };
    cur.amount += o.amount;
    cur.count += 1;
    byProductMap.set(o.slug, cur);
  }
  const byProduct = [...byProductMap.entries()]
    .map(([slug, v]) => ({ slug, amount: v.amount, count: v.count }))
    .sort((a, b) => b.amount - a.amount);

  // MRR from active subscriptions.
  let mrr = 0;
  let activeSubs = 0;
  try {
    const subs = await stripe.subscriptions.list({ status: 'active', limit: 100 });
    activeSubs = subs.data.length;
    for (const sub of subs.data) {
      for (const item of sub.items.data) {
        const unit = (item.price.unit_amount ?? 0) / 100;
        mrr += monthlyAmount(unit, item.price.recurring?.interval) * (item.quantity ?? 1);
      }
    }
  } catch {
    /* subscriptions may be unavailable; leave mrr/activeSubs at 0 */
  }

  const data: RevenueData = {
    configured: true,
    currency: (sessions.data[0]?.currency || 'gbp').toUpperCase(),
    today,
    mtd,
    windowTotal,
    orderCount: orders.length,
    mrr: Math.round(mrr * 100) / 100,
    activeSubs,
    byProduct,
    recentOrders: orders.sort((a, b) => b.created - a.created).slice(0, 20),
    fetchedAt: new Date().toISOString(),
  };
  CACHE = { fetchedAt: Date.now(), data };
  return data;
}
