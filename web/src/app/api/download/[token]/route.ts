// ─────────────────────────────────────────────────────────────────────────
// GET /api/download/[token] — serves a digital-product file behind a
// signed token issued by the Stripe webhook on purchase completion.
//
// Token verification is HMAC-only — no DB lookup needed. Tokens expire
// (default 7 days) and can be revoked by rotating DOWNLOAD_SECRET.
//
// Security model:
//   - Files live in `web/private-products/` (NOT in /public/, never served by Next directly)
//   - Path traversal blocked: we look up the path via products.json, never
//     accept a user-supplied path
//   - Buyer email is logged with each download (auditable)
// ─────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import path from 'node:path';
import fs from 'node:fs/promises';
import products from '@/content/products.json';
import { verifyDownloadToken } from '@/lib/download-token';

// Node runtime — we read from filesystem
export const runtime = 'nodejs';

interface DeliveryFile { path: string; filename: string; mime: string; }
interface ProductEntry {
  slug: string;
  available?: boolean;
  deliveryFiles?: DeliveryFile[] | null;
}

const PRODUCT_BY_SLUG: Record<string, ProductEntry> = (products as ProductEntry[])
  .reduce((acc, p) => { acc[p.slug] = p; return acc; }, {} as Record<string, ProductEntry>);

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const v = verifyDownloadToken(token);
  if (!v.ok) {
    return NextResponse.json(
      { error: v.reason },
      {
        status: v.reason === 'expired' ? 410 : 403,
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  }

  const { slug, file, email } = v.payload;
  const product = PRODUCT_BY_SLUG[slug];
  if (!product || !product.available || !product.deliveryFiles?.length) {
    return NextResponse.json(
      { error: 'product-not-available' },
      { status: 404, headers: { 'Cache-Control': 'no-store' } },
    );
  }
  const f = product.deliveryFiles[file];
  if (!f) {
    return NextResponse.json(
      { error: 'file-index-out-of-range' },
      { status: 404, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  // Resolve relative to project root. f.path is e.g. "private-products/foo.pdf"
  // — we never accept absolute paths or paths that escape via ../
  const root = process.cwd();
  const resolved = path.resolve(root, f.path);
  if (!resolved.startsWith(path.resolve(root, 'private-products') + path.sep)) {
    return NextResponse.json(
      { error: 'invalid-file-path' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  let bytes: Buffer;
  try {
    bytes = await fs.readFile(resolved);
  } catch {
    return NextResponse.json(
      { error: 'file-not-on-disk' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  // Audit log — visible in Vercel logs
  console.log(`[download] slug=${slug} file=${file} email=${email} bytes=${bytes.length}`);

  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      'Content-Type': f.mime,
      'Content-Disposition': `attachment; filename="${f.filename}"`,
      'Content-Length': String(bytes.length),
      'Cache-Control': 'private, no-store, max-age=0',
      'X-Robots-Tag': 'noindex',
    },
  });
}
