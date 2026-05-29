// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · STUDIO — signed decision/action tokens
// Lets the operator approve/reject ONE specific gated action from an email
// link without logging in. HMAC-signed (APPROVAL_SECRET, falls back to
// SESSION_SECRET), scoped to a single {action, id, decision}, short-lived.
// Same trust model as the app's magic-links + download tokens. The /api/decide
// route is prefetch-safe (GET shows a confirm page; POST executes), so an email
// client pre-fetching the link can never trigger the action.
// ─────────────────────────────────────────────────────────────────────────

import crypto from 'node:crypto';

export type DecisionAction = 'send_outreach' | 'publish_linkedin' | 'publish_substack' | 'dispatch_project';
export type Decision = 'approve' | 'reject';

export type DecisionPayload = {
  a: DecisionAction;
  id: string;
  d: Decision;
  exp: number; // unix seconds
};

const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 3; // 3 days

function secret(): string {
  return process.env.APPROVAL_SECRET || process.env.SESSION_SECRET || 'aiprosol-dev-approval-secret-rotate-in-production';
}

function b64url(buf: Buffer | string): string {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function sign(payloadB64: string): string {
  return b64url(crypto.createHmac('sha256', secret()).update(payloadB64).digest());
}

export function signDecisionToken(p: { a: DecisionAction; id: string; d: Decision }, ttlSeconds = DEFAULT_TTL_SECONDS): string {
  const payload: DecisionPayload = { ...p, exp: Math.floor(Date.now() / 1000) + ttlSeconds };
  const payloadB64 = b64url(JSON.stringify(payload));
  return `${payloadB64}.${sign(payloadB64)}`;
}

export function verifyDecisionToken(token: string): DecisionPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, sigB64] = parts;
  // constant-time compare
  const expected = sign(payloadB64);
  if (sigB64.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sigB64), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(Buffer.from(payloadB64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')) as DecisionPayload;
    if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (!payload.a || !payload.id || (payload.d !== 'approve' && payload.d !== 'reject')) return null;
    return payload;
  } catch {
    return null;
  }
}
