// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · STUDIO — catalog editing (edit-via-Git)
// Display reads the bundled JSON (always available, read-only). An edit reads
// the CURRENT file from GitHub (source of truth, avoids clobbering), applies a
// whitelisted field change, and commits → ~70s to live. Used by both the
// content API route and the Copilot `edit_content` tool.
// ─────────────────────────────────────────────────────────────────────────

import productsData from '@/content/products.json';
import servicesData from '@/content/services.json';
import { commitFile, getFileJson, isGithubConfigured } from './github';

const PRODUCTS_PATH = 'web/src/content/products.json';
const SERVICES_PATH = 'web/src/content/services.json';

// Safety whitelist — only these fields are editable from the panel/Copilot.
const PRODUCT_FIELDS = ['price', 'available', 'shortDescription', 'longDescription', 'expectedShipDate', 'name'];
const SERVICE_FIELDS = ['title', 'shortDescription', 'longDescription'];

type Row = Record<string, unknown> & { slug: string };

export function getCatalog() {
  return {
    githubConfigured: isGithubConfigured(),
    editableProductFields: PRODUCT_FIELDS,
    editableServiceFields: SERVICE_FIELDS,
    products: (productsData as Row[]).map((p) => ({
      slug: p.slug, name: p.name, price: p.price, available: p.available, category: p.category, shortDescription: p.shortDescription,
    })),
    services: (servicesData as Row[]).map((s) => ({ slug: s.slug, title: s.title, shortDescription: s.shortDescription })),
  };
}

export async function applyContentEdit(input: { type: 'product' | 'service'; slug: string; fields: Record<string, unknown> }): Promise<{ ok: boolean; sha?: string; error?: string; applied?: Record<string, unknown> }> {
  if (!isGithubConfigured()) return { ok: false, error: 'github-not-configured' };
  const isProduct = input.type === 'product';
  const allowed = isProduct ? PRODUCT_FIELDS : SERVICE_FIELDS;
  const path = isProduct ? PRODUCTS_PATH : SERVICES_PATH;

  // Read current from GitHub (source of truth); fall back to the bundled copy.
  const current = await getFileJson(path);
  const arr = (current?.json as Row[] | undefined) ?? ((isProduct ? productsData : servicesData) as Row[]);
  const next: Row[] = JSON.parse(JSON.stringify(arr));

  const idx = next.findIndex((x) => x.slug === input.slug);
  if (idx < 0) return { ok: false, error: `slug-not-found: ${input.slug}` };

  const applied: Record<string, unknown> = {};
  for (const k of allowed) {
    if (k in input.fields) {
      next[idx][k] = input.fields[k];
      applied[k] = input.fields[k];
    }
  }
  if (Object.keys(applied).length === 0) {
    return { ok: false, error: `no editable fields. allowed for ${input.type}: ${allowed.join(', ')}` };
  }

  const content = `${JSON.stringify(next, null, 2)}\n`;
  const msg = `chore(content): ${input.type} ${input.slug} — ${Object.keys(applied).join(', ')} (via studio)`;
  const res = await commitFile(path, content, msg, current?.sha);
  return { ...res, applied };
}
