// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · Stripe seed script
// One-shot: creates a Stripe Product + Price for every entry in
// products.json and pricing-plans.json. Writes the resulting Price IDs to
// src/content/stripe-prices.json so the /api/checkout route can resolve them.
//
// Idempotent — running again finds existing Products by metadata.slug and
// only creates Prices that don't yet exist.
//
// Usage:
//   STRIPE_SECRET_KEY=sk_test_... npx tsx migrate/seed-stripe.ts
// or:
//   npm run seed:stripe
// ─────────────────────────────────────────────────────────────────────────

import { writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import Stripe from 'stripe';

interface Product {
  slug: string;
  name: string;
  price: number;
  category?: string;
  shortDescription?: string;
}

interface Plan {
  id: 'starter' | 'growth' | 'enterprise';
  name: string;
  price: number;
  tagline?: string;
}

async function main() {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    console.error('✗ STRIPE_SECRET_KEY missing in env. Set it in .env.local or pass inline:');
    console.error('  STRIPE_SECRET_KEY=sk_test_... npx tsx migrate/seed-stripe.ts');
    process.exit(1);
  }

  const stripe = new Stripe(apiKey, { apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion });

  // Load local catalogues
  const productsPath = join(process.cwd(), 'src', 'content', 'products.json');
  const plansPath = join(process.cwd(), 'src', 'content', 'pricing-plans.json');
  const products = JSON.parse(readFileSync(productsPath, 'utf-8')) as Product[];
  const plans = JSON.parse(readFileSync(plansPath, 'utf-8')) as Plan[];

  console.log('═══ AIPROSOL · STRIPE SEED ═══');
  console.log(`Found ${products.length} products + ${plans.length} plans\n`);

  const priceMap: Record<string, string> = {};

  // ─── Products (one-time payments) ───
  for (const p of products) {
    process.stdout.write(`  ${p.slug.padEnd(48)} `);
    try {
      // Find or create the Product by metadata.slug
      const existingList = await stripe.products.search({ query: `metadata['slug']:'${p.slug}'`, limit: 1 });
      let productId: string;
      if (existingList.data.length > 0) {
        productId = existingList.data[0].id;
      } else {
        const created = await stripe.products.create({
          name: p.name,
          description: p.shortDescription?.slice(0, 500),
          metadata: { slug: p.slug, kind: 'product', category: p.category || '' },
        });
        productId = created.id;
      }

      // Find or create the Price
      const prices = await stripe.prices.list({ product: productId, limit: 5, active: true });
      const matching = prices.data.find(pr => pr.unit_amount === p.price * 100 && pr.currency === 'gbp' && pr.type === 'one_time');
      let priceId: string;
      if (matching) {
        priceId = matching.id;
      } else {
        const newPrice = await stripe.prices.create({
          product: productId,
          unit_amount: p.price * 100,
          currency: 'gbp',
          metadata: { slug: p.slug, kind: 'product' },
        });
        priceId = newPrice.id;
      }

      priceMap[p.slug] = priceId;
      console.log(`✓  £${p.price}  ${priceId}`);
    } catch (err) {
      console.log('✗ ' + (err instanceof Error ? err.message : String(err)));
    }
  }

  console.log('');

  // ─── Plans (monthly subscriptions) ───
  for (const plan of plans) {
    process.stdout.write(`  ${plan.id.padEnd(48)} `);
    try {
      const existingList = await stripe.products.search({ query: `metadata['slug']:'${plan.id}'`, limit: 1 });
      let productId: string;
      if (existingList.data.length > 0) {
        productId = existingList.data[0].id;
      } else {
        const created = await stripe.products.create({
          name: `Aiprosol ${plan.name}`,
          description: plan.tagline?.slice(0, 500),
          metadata: { slug: plan.id, kind: 'plan' },
        });
        productId = created.id;
      }

      const prices = await stripe.prices.list({ product: productId, limit: 5, active: true });
      const matching = prices.data.find(
        pr =>
          pr.unit_amount === plan.price * 100 &&
          pr.currency === 'gbp' &&
          pr.recurring?.interval === 'month',
      );
      let priceId: string;
      if (matching) {
        priceId = matching.id;
      } else {
        const newPrice = await stripe.prices.create({
          product: productId,
          unit_amount: plan.price * 100,
          currency: 'gbp',
          recurring: { interval: 'month' },
          metadata: { slug: plan.id, kind: 'plan' },
        });
        priceId = newPrice.id;
      }

      priceMap[plan.id] = priceId;
      console.log(`✓  £${plan.price}/mo  ${priceId}`);
    } catch (err) {
      console.log('✗ ' + (err instanceof Error ? err.message : String(err)));
    }
  }

  // Write the price map
  const outPath = join(process.cwd(), 'src', 'content', 'stripe-prices.json');
  writeFileSync(outPath, JSON.stringify(priceMap, null, 2));
  console.log(`\n✓ Wrote ${Object.keys(priceMap).length} price IDs → src/content/stripe-prices.json`);
  console.log('  Now `/api/checkout` can resolve any slug to a Stripe Price.');
  console.log('  Configure Stripe webhook → ' + (process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com') + '/api/stripe/webhook');
  console.log('  Set STRIPE_WEBHOOK_SECRET to the value Stripe shows you.\n');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
