// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · Wix Data API export script
// Pulls every collection from the existing Wix CMS and dumps to JSON.
// Run via: npm run migrate:wix
//
// Required env vars (in .env.local):
//   WIX_API_KEY      — generate in Wix Dashboard → Headless Settings
//   WIX_SITE_ID      — fb912f58-d70f-4919-bb13-a4b5761de943
//   WIX_ACCOUNT_ID   — find in Wix Dashboard → Account
// ─────────────────────────────────────────────────────────────────────────

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const COLLECTIONS = [
  'digitalproducts',
  'aiservices',
  'pricingplans',
  'casestudies',
  'blog',
  'faqs',
  'testimonials',
  'integrations',
  'teammembers',
  'leads',
  'bookings',
  'newsletter',
  'affiliatepartners',
  'chatbotconversations',
];

interface WixQueryResponse {
  dataItems: Array<{ id: string; data: Record<string, unknown> }>;
  pagingMetadata?: { count: number; offset: number; total: number };
}

async function exportCollection(name: string, apiKey: string, siteId: string) {
  const url = 'https://www.wixapis.com/wix-data/v2/items/query';
  const headers = {
    'Authorization': apiKey,
    'wix-site-id': siteId,
    'Content-Type': 'application/json',
  };

  const all: Array<{ id: string; data: Record<string, unknown> }> = [];
  let offset = 0;
  const pageSize = 100;

  while (true) {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        dataCollectionId: name,
        query: { paging: { limit: pageSize, offset } },
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error(`✗ ${name} failed: ${res.status} ${txt.slice(0, 200)}`);
      return null;
    }

    const data = (await res.json()) as WixQueryResponse;
    if (!data.dataItems || data.dataItems.length === 0) break;
    all.push(...data.dataItems);

    if (data.dataItems.length < pageSize) break;
    offset += pageSize;
  }

  return all;
}

async function main() {
  const apiKey = process.env.WIX_API_KEY;
  const siteId = process.env.WIX_SITE_ID || 'fb912f58-d70f-4919-bb13-a4b5761de943';

  if (!apiKey) {
    console.error('✗ WIX_API_KEY missing in .env.local');
    console.error('  Generate one at: https://manage.wix.com/account/api-keys');
    process.exit(1);
  }

  const outDir = join(process.cwd(), 'migrate', 'exports');
  mkdirSync(outDir, { recursive: true });

  console.log('═══ AIPROSOL · WIX EXPORT ═══');
  console.log(`Site: ${siteId}`);
  console.log(`Output: ${outDir}\n`);

  const summary: Record<string, number | string> = {};

  for (const col of COLLECTIONS) {
    process.stdout.write(`  ${col.padEnd(28)} `);
    const items = await exportCollection(col, apiKey, siteId);
    if (items === null) {
      summary[col] = 'ERROR';
      continue;
    }
    const path = join(outDir, `${col}.json`);
    // Strip the {id, data: {...}} wrapper for a clean array
    const clean = items.map(it => ({ _id: it.id, ...it.data }));
    writeFileSync(path, JSON.stringify(clean, null, 2));
    console.log(`${clean.length} items → ${col}.json`);
    summary[col] = clean.length;
  }

  writeFileSync(
    join(outDir, '_summary.json'),
    JSON.stringify({ ranAt: new Date().toISOString(), summary }, null, 2),
  );

  console.log('\n═══ DONE ═══');
  console.log('Next step: review the JSON files, then transform into src/content/ shape:');
  console.log('  - products.json (from digitalproducts)');
  console.log('  - services.json (from aiservices)');
  console.log('  - case-studies.json (from casestudies)');
  console.log('  - blog/*.mdx (from blog)');
  console.log('  - faqs.json, testimonials.json, integrations.json (1:1)');
  console.log('  - leads, bookings, newsletter — these become Vercel KV at runtime, not static');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
