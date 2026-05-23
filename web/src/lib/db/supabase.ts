// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · Supabase client
// Two clients:
//   - supabase: anon/publishable key, browser-safe, RLS-enforced
//   - supabaseAdmin: service-role key, server-only, bypasses RLS
//
// Both use env vars (NEXT_PUBLIC_SUPABASE_URL + the appropriate key).
// Falls back to nulls if not configured (callers must check).
// ─────────────────────────────────────────────────────────────────────────

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Browser-safe client (anon role). Used in client components + /agents page.
// RLS controls what this can read/write — currently only agent_state + agent_log.
export const supabase: SupabaseClient | null = url && anonKey
  ? createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

// Server-only admin client. Falls back to anon if service-role isn't set —
// that's safe because route-level secrets still gate the privileged endpoints.
// To bypass RLS on internal tables (tasks, drafts, partners, etc.), set
// SUPABASE_SERVICE_ROLE_KEY in env.
export const supabaseAdmin: SupabaseClient | null = url
  ? createClient(url, serviceKey || anonKey || '', {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

export function requireSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    throw new Error(
      'Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY).',
    );
  }
  return supabaseAdmin;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseAdmin);
}

export function hasServiceRole(): boolean {
  return Boolean(serviceKey);
}
