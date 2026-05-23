// AIPROSOL · Magic-link auth (passwordless)
//
// Two stateless HMAC-signed tokens, both edge-runtime safe (Web Crypto only,
// no node:crypto). Mirrors the pattern in lib/download-token.ts.
//
//   1. Magic-link token  → emailed verification, 15-min TTL
//   2. Session cookie    → kept after verify, 30-day TTL, httpOnly
//
// Token format (both):  base64url(payload).base64url(HMAC-SHA256(payload))
//
// Why stateless: no DB, works on edge runtime, single source of truth is the
// SESSION_SECRET. Magic-link tokens are replayable within the 15-min window;
// upgrade to KV-backed single-use later if needed.

import type { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'aiprosol_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;       // 30 days
const MAGIC_LINK_TTL_SECONDS = 60 * 15;               // 15 minutes
const SECRET_FALLBACK = 'aiprosol-dev-session-secret-rotate-in-production';

// Minimal profile carried inside the session JWT. Optional fields only —
// the session works fine without any of them set. Three fields are used
// across the site to personalise the experience:
//
//   name      → dashboard greeting, ROI Audit step 0, email salutation
//   company   → ROI Audit step 1, lead record
//   industry  → ROI Audit step 1 (skipped if filled), dashboard case-study pick
//
// `role` is captured for future segmentation (e.g. surfacing different
// content for Founders vs Operators) but isn't read by any UI yet.
//
// Kept inside the session JWT (not a separate KV record) for now: ~150-300
// extra bytes per cookie is the cheapest possible architecture for 3-4
// short fields. Migrate to KV when the profile grows beyond ~6 fields or
// when account-level history (orders, audits) is added.
export interface SessionProfile {
  name?: string;
  company?: string;
  role?: string;
  industry?: string;
}

export interface SessionPayload {
  email: string;
  iat: number;     // issued-at (unix seconds)
  exp: number;     // expires-at (unix seconds)
  profile?: SessionProfile;
}

export interface MagicLinkPayload {
  email: string;
  next: string;    // post-verify redirect path
  exp: number;
  profile?: SessionProfile;
}

export interface OAuthStatePayload {
  next: string;
  nonce: string;   // 16 random bytes, prevents CSRF
  exp: number;
}

function getSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[auth] SESSION_SECRET unset in production — using fallback. ROTATE IMMEDIATELY.');
    }
    return SECRET_FALLBACK;
  }
  return s;
}

// ─── b64url helpers (no Buffer — edge-safe) ──────────────────────────────

function bytesToB64url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlToBytes(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/') + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function strToBytes(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

function bytesToStr(b: Uint8Array): string {
  return new TextDecoder().decode(b);
}

// ─── HMAC primitives (Web Crypto · works in edge + node) ─────────────────

// Web Crypto's BufferSource type in TS 5.7+ no longer matches the default
// Uint8Array<ArrayBufferLike> from TextEncoder. We cast through `unknown` to
// satisfy the lib without runtime cost — Web Crypto accepts either at runtime.
async function hmacSign(payload: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    strToBytes(getSecret()) as unknown as BufferSource,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, strToBytes(payload) as unknown as BufferSource);
  return new Uint8Array(sig);
}

async function hmacVerify(payload: string, sig: Uint8Array): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    'raw',
    strToBytes(getSecret()) as unknown as BufferSource,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  return crypto.subtle.verify(
    'HMAC',
    key,
    sig as unknown as BufferSource,
    strToBytes(payload) as unknown as BufferSource,
  );
}

async function signToken(payloadObj: object): Promise<string> {
  const payloadStr = JSON.stringify(payloadObj);
  const payloadB64 = bytesToB64url(strToBytes(payloadStr));
  const sig = await hmacSign(payloadB64);
  return `${payloadB64}.${bytesToB64url(sig)}`;
}

async function verifyTokenRaw<T>(token: string): Promise<T | null> {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, sigB64] = parts;
  const sig = (() => { try { return b64urlToBytes(sigB64); } catch { return null; } })();
  if (!sig) return null;
  const ok = await hmacVerify(payloadB64, sig);
  if (!ok) return null;
  try {
    return JSON.parse(bytesToStr(b64urlToBytes(payloadB64))) as T;
  } catch {
    return null;
  }
}

// ─── Session ─────────────────────────────────────────────────────────────

export async function signSession(email: string, profile?: SessionProfile): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  // Trim profile to short, safe values before serialising — caps the cookie size.
  const trimmed: SessionProfile | undefined = profile ? {
    name: profile.name?.slice(0, 80) || undefined,
    company: profile.company?.slice(0, 80) || undefined,
    role: profile.role?.slice(0, 60) || undefined,
    industry: profile.industry?.slice(0, 40) || undefined,
  } : undefined;
  const payload: SessionPayload = {
    email,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
    ...(trimmed && Object.values(trimmed).some(Boolean) ? { profile: trimmed } : {}),
  };
  return signToken(payload);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  const payload = await verifyTokenRaw<SessionPayload>(token);
  if (!payload) return null;
  if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return null;
  if (typeof payload.email !== 'string' || !payload.email.includes('@')) return null;
  return payload;
}

/** Server-component / route-handler accessor — reads the session cookie. */
export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  return verifySession(raw);
}

/** Edge-middleware accessor — given a NextRequest. */
export async function getSessionFromRequest(req: NextRequest): Promise<SessionPayload | null> {
  const raw = req.cookies.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  return verifySession(raw);
}

/** Set the session cookie on a NextResponse. */
export function attachSessionCookie(res: NextResponse, token: string) {
  res.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_TTL_SECONDS,
    path: '/',
  });
}

/** Clear the session cookie on a NextResponse. */
export function clearSessionCookie(res: NextResponse) {
  res.cookies.set({
    name: SESSION_COOKIE,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    path: '/',
  });
}

// ─── Magic link ──────────────────────────────────────────────────────────

export async function signMagicLink(
  email: string,
  next: string,
  profile?: SessionProfile,
): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + MAGIC_LINK_TTL_SECONDS;
  const payload: MagicLinkPayload = {
    email,
    next,
    exp,
    ...(profile && Object.values(profile).some(Boolean) ? { profile } : {}),
  };
  return signToken(payload);
}

export async function verifyMagicLink(token: string): Promise<MagicLinkPayload | null> {
  const payload = await verifyTokenRaw<MagicLinkPayload>(token);
  if (!payload) return null;
  if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return null;
  if (typeof payload.email !== 'string' || !payload.email.includes('@')) return null;
  if (typeof payload.next !== 'string' || !payload.next.startsWith('/')) return null;
  return payload;
}

/** Sanitize a `next` redirect — must be a same-origin path. */
export function sanitizeNext(raw: string | null | undefined, fallback: string = '/dashboard'): string {
  if (!raw) return fallback;
  if (!raw.startsWith('/')) return fallback;
  if (raw.startsWith('//')) return fallback;          // protocol-relative
  if (raw.startsWith('/api/')) return fallback;       // never bounce into APIs
  return raw;
}

// ─── Google OAuth state token ────────────────────────────────────────────

const OAUTH_STATE_TTL_SECONDS = 60 * 10;             // 10 minutes — Google flow is fast

export async function signOAuthState(next: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + OAUTH_STATE_TTL_SECONDS;
  const nonceBytes = new Uint8Array(16);
  crypto.getRandomValues(nonceBytes);
  const nonce = bytesToB64url(nonceBytes);
  return signToken({ next, nonce, exp } satisfies OAuthStatePayload);
}

export async function verifyOAuthState(token: string): Promise<OAuthStatePayload | null> {
  const payload = await verifyTokenRaw<OAuthStatePayload>(token);
  if (!payload) return null;
  if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return null;
  if (typeof payload.next !== 'string' || !payload.next.startsWith('/')) return null;
  if (typeof payload.nonce !== 'string' || payload.nonce.length < 8) return null;
  return payload;
}

export const isGoogleOAuthEnabled = (): boolean =>
  Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
