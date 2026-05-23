// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · GOOGLE GMAIL OAUTH (Arora Inbox)
//
// Separate from /api/auth/google/* which uses openid/email/profile for site
// sign-in. This module handles the *agent* OAuth for the Founder's Inbox
// Triage Agent ($97/mo) — scopes are gmail.readonly + gmail.compose.
//
// Token storage (v1): httpOnly cookie signed with SESSION_SECRET.
// 4KB cookie cap is plenty for {access_token, refresh_token, exp, email}.
// Week 2+ will move tokens to Supabase row-level encrypted at rest.
// ─────────────────────────────────────────────────────────────────────────

import type { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const GMAIL_TOKEN_COOKIE = 'aiprosol_gmail';
const GMAIL_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 90;     // 90 days (refresh token lifetime guardrail)

// Gmail scopes — restricted, need test-user listing in Cloud Console until app verified
export const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/userinfo.email',     // so callback knows whose inbox
];

export interface GmailTokens {
  access_token: string;
  refresh_token?: string;     // only present on first auth (or when forced via prompt=consent)
  expires_at: number;          // unix seconds
  email: string;               // signed-in Google account email
}

export const isGmailOAuthEnabled = (): boolean =>
  Boolean(process.env.GOOGLE_OAUTH_CLIENT_ID && process.env.GOOGLE_OAUTH_CLIENT_SECRET);

// ─── Build the consent URL ───
//
// access_type=offline + prompt=consent on first auth so we always get a
// refresh_token. Subsequent re-auths use prompt=select_account to make
// account-switching easy without re-consenting.
export function buildGmailAuthUrl(state: string, origin: string, forceConsent = true): string {
  const redirectUri =
    process.env.GOOGLE_OAUTH_REDIRECT_URI ||
    `${origin}/api/agent/google/callback`;

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', process.env.GOOGLE_OAUTH_CLIENT_ID!);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', GMAIL_SCOPES.join(' '));
  url.searchParams.set('state', state);
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('prompt', forceConsent ? 'consent' : 'select_account');
  url.searchParams.set('include_granted_scopes', 'true');
  return url.toString();
}

// ─── Exchange auth code → tokens ───
export async function exchangeCodeForTokens(
  code: string,
  origin: string,
): Promise<{ access_token: string; refresh_token?: string; expires_in: number; id_token: string }> {
  const redirectUri =
    process.env.GOOGLE_OAUTH_REDIRECT_URI ||
    `${origin}/api/agent/google/callback`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${body}`);
  }
  return res.json();
}

// ─── Refresh an expired access token ───
export async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Refresh failed: ${res.status} ${body}`);
  }
  return res.json();
}

// ─── Extract email from id_token without external JWT lib ───
// id_token is base64url(header).base64url(payload).base64url(sig)
// We trust it because we just received it via TLS from Google's token endpoint
// in response to a code WE issued. No need to verify sig here.
export function emailFromIdToken(idToken: string): string {
  const parts = idToken.split('.');
  if (parts.length !== 3) return '';
  const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  const pad = payload.length % 4 === 0 ? '' : '='.repeat(4 - (payload.length % 4));
  try {
    const json = JSON.parse(atob(payload + pad));
    return typeof json.email === 'string' ? json.email : '';
  } catch {
    return '';
  }
}

// ─── HMAC-signed cookie storage (reuses SESSION_SECRET) ───
// Same pattern as lib/auth.ts but separate cookie so user sign-in and
// agent OAuth can coexist independently.

function getSecret(): string {
  return process.env.SESSION_SECRET || 'aiprosol-dev-session-secret-rotate-in-production';
}

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

async function hmac(payload: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(getSecret()) as unknown as BufferSource,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload) as unknown as BufferSource);
  return new Uint8Array(sig);
}

export async function packGmailTokens(t: GmailTokens): Promise<string> {
  const payloadStr = JSON.stringify(t);
  const payloadB64 = bytesToB64url(new TextEncoder().encode(payloadStr));
  const sig = await hmac(payloadB64);
  return `${payloadB64}.${bytesToB64url(sig)}`;
}

export async function unpackGmailTokens(raw: string): Promise<GmailTokens | null> {
  const parts = raw.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, sigB64] = parts;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(getSecret()) as unknown as BufferSource,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  const sig = (() => { try { return b64urlToBytes(sigB64); } catch { return null; } })();
  if (!sig) return null;
  const ok = await crypto.subtle.verify(
    'HMAC',
    key,
    sig as unknown as BufferSource,
    new TextEncoder().encode(payloadB64) as unknown as BufferSource,
  );
  if (!ok) return null;

  try {
    const json = JSON.parse(new TextDecoder().decode(b64urlToBytes(payloadB64)));
    if (typeof json.access_token !== 'string') return null;
    if (typeof json.expires_at !== 'number') return null;
    if (typeof json.email !== 'string') return null;
    return json as GmailTokens;
  } catch {
    return null;
  }
}

/** Read tokens from the cookie jar (server components + route handlers). */
export async function getGmailTokens(): Promise<GmailTokens | null> {
  const jar = await cookies();
  const raw = jar.get(GMAIL_TOKEN_COOKIE)?.value;
  if (!raw) return null;
  return unpackGmailTokens(raw);
}

/** Read tokens, refreshing if expired. Returns null if not connected. */
export async function getValidAccessToken(): Promise<{ accessToken: string; email: string } | null> {
  const tokens = await getGmailTokens();
  if (!tokens) return null;

  const now = Math.floor(Date.now() / 1000);
  if (tokens.expires_at > now + 60) {
    return { accessToken: tokens.access_token, email: tokens.email };
  }
  if (!tokens.refresh_token) return null;     // no way to refresh

  try {
    const refreshed = await refreshAccessToken(tokens.refresh_token);
    // NOTE: caller is responsible for re-persisting via attachGmailCookie if
    // they care about the new expiry. For Week 1 we accept that the next
    // request will refresh again — keeps the route handlers simple.
    return { accessToken: refreshed.access_token, email: tokens.email };
  } catch {
    return null;
  }
}

export function attachGmailCookie(res: NextResponse, signedValue: string) {
  res.cookies.set({
    name: GMAIL_TOKEN_COOKIE,
    value: signedValue,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: GMAIL_TOKEN_TTL_SECONDS,
    path: '/',
  });
}

export function clearGmailCookie(res: NextResponse) {
  res.cookies.set({
    name: GMAIL_TOKEN_COOKIE,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    path: '/',
  });
}
