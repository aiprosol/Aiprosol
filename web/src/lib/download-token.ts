// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · Download tokens
//
// Stateless HMAC-signed tokens that grant temporary access to a single
// digital-product file. Issued by the Stripe webhook on
// `checkout.session.completed`, validated by /api/download/[token].
//
// Format: base64url(payload).base64url(signature)
//   payload   = JSON.stringify({ slug, file, email, exp })
//   signature = HMAC-SHA256(payload, DOWNLOAD_SECRET)
//
// No DB. No session state. Works on edge runtime. Token can't be tampered
// with (signature won't verify) and can't be replayed past exp.
// ─────────────────────────────────────────────────────────────────────────

import crypto from 'node:crypto';

export interface DownloadPayload {
  slug: string;       // product slug (must match products.json)
  file: number;       // index into deliveryFiles array (0..n)
  email: string;      // buyer email — recorded for audit
  exp: number;        // unix epoch seconds
}

const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const SECRET_FALLBACK = 'aiprosol-dev-secret-rotate-in-production-DO-NOT-USE';

function getSecret(): string {
  const s = process.env.DOWNLOAD_SECRET;
  if (!s) {
    if (process.env.NODE_ENV === 'production') {
      // Loud warning — not a throw, so dev/preview don't crash. Production
      // must set this in Vercel env vars.
      console.error('[download-token] DOWNLOAD_SECRET unset in production — using fallback. ROTATE IMMEDIATELY.');
    }
    return SECRET_FALLBACK;
  }
  return s;
}

function b64urlEncode(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(s: string): Buffer {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64');
}

export function signDownloadToken(
  payload: Omit<DownloadPayload, 'exp'>,
  ttlSeconds: number = DEFAULT_TTL_SECONDS,
): string {
  const full: DownloadPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const payloadStr = JSON.stringify(full);
  const payloadB64 = b64urlEncode(Buffer.from(payloadStr, 'utf-8'));
  const sig = crypto
    .createHmac('sha256', getSecret())
    .update(payloadB64)
    .digest();
  const sigB64 = b64urlEncode(sig);
  return `${payloadB64}.${sigB64}`;
}

export type VerifyResult =
  | { ok: true; payload: DownloadPayload }
  | { ok: false; reason: 'malformed' | 'bad-signature' | 'expired' };

export function verifyDownloadToken(token: string): VerifyResult {
  const parts = token.split('.');
  if (parts.length !== 2) return { ok: false, reason: 'malformed' };
  const [payloadB64, sigB64] = parts;

  // Recompute expected signature
  const expectedSig = crypto
    .createHmac('sha256', getSecret())
    .update(payloadB64)
    .digest();
  const givenSig = (() => {
    try { return b64urlDecode(sigB64); } catch { return null; }
  })();
  if (!givenSig) return { ok: false, reason: 'malformed' };

  // Constant-time compare to prevent timing attacks
  if (
    expectedSig.length !== givenSig.length ||
    !crypto.timingSafeEqual(expectedSig, givenSig)
  ) {
    return { ok: false, reason: 'bad-signature' };
  }

  let payload: DownloadPayload;
  try {
    payload = JSON.parse(b64urlDecode(payloadB64).toString('utf-8'));
  } catch {
    return { ok: false, reason: 'malformed' };
  }

  if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) {
    return { ok: false, reason: 'expired' };
  }

  return { ok: true, payload };
}
