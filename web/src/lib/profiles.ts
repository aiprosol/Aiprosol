// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · Profile data layer
//
// Reads + writes the public.profiles table in Supabase, keyed by email.
// The site's auth system uses an HMAC-signed JWT cookie (see lib/auth.ts),
// not Supabase Auth — so all profile access goes through the server-side
// admin client (SUPABASE_SERVICE_ROLE_KEY) to bypass RLS.
//
// Returns null + logs on any DB failure rather than throwing, so a missing
// or misconfigured Supabase env doesn't break the JWT-only fallback path.
// ─────────────────────────────────────────────────────────────────────────

import { supabaseAdmin, isSupabaseConfigured } from './db/supabase';

export interface DbProfile {
  id?: string;
  email: string;
  name?: string | null;
  company?: string | null;
  role?: string | null;
  industry?: string | null;
  picture?: string | null;
  bio?: string | null;
  timezone?: string | null;
  linkedin_url?: string | null;
  twitter_url?: string | null;
  website_url?: string | null;
  auth_provider?: 'magic-link' | 'google' | 'apple' | string;
  email_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Subset that the user can edit via the /settings ProfileForm.
// (id, email, timestamps, auth_provider, email_verified are server-only.)
export type EditableProfileFields =
  | 'name'
  | 'company'
  | 'role'
  | 'industry'
  | 'picture'
  | 'bio'
  | 'timezone'
  | 'linkedin_url'
  | 'twitter_url'
  | 'website_url';

export type EditableProfile = Partial<Pick<DbProfile, EditableProfileFields>>;

const TABLE = 'profiles';

/**
 * Fetch a profile by email. Returns null if not found or Supabase is unavailable.
 * Email lookup is case-insensitive (matches the lower(email) index on the table).
 */
export async function getProfileByEmail(email: string): Promise<DbProfile | null> {
  if (!isSupabaseConfigured() || !supabaseAdmin) return null;
  const normalized = email.trim().toLowerCase();
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*')
    .ilike('email', normalized)
    .maybeSingle();

  if (error) {
    console.warn('[profiles.getProfileByEmail]', error.message);
    return null;
  }
  return (data ?? null) as DbProfile | null;
}

/**
 * Upsert a profile by email. Creates the row if missing; otherwise updates
 * the supplied fields. Empty-string values clear the field.
 *
 * Returns the resulting row, or null on any failure (caller decides whether
 * to surface the error; the JWT-only fallback path still works without DB).
 */
export async function upsertProfile(
  email: string,
  fields: EditableProfile & { auth_provider?: string; email_verified?: boolean },
): Promise<DbProfile | null> {
  if (!isSupabaseConfigured() || !supabaseAdmin) return null;
  const normalized = email.trim().toLowerCase();

  // Normalise empty strings → null so the DB column actually clears.
  const sanitized: Record<string, unknown> = { email: normalized };
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined) continue;
    sanitized[k] = typeof v === 'string' && v.trim() === '' ? null : v;
  }

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .upsert(sanitized, { onConflict: 'email' })
    .select()
    .maybeSingle();

  if (error) {
    console.warn('[profiles.upsertProfile]', error.message);
    return null;
  }
  return (data ?? null) as DbProfile | null;
}

/**
 * Ensure a profile row exists for an email (used on first OAuth/magic-link
 * success). No-op if already present; otherwise creates a minimal row.
 */
export async function ensureProfile(
  email: string,
  hint: { auth_provider?: string; name?: string; picture?: string; email_verified?: boolean } = {},
): Promise<DbProfile | null> {
  const existing = await getProfileByEmail(email);
  if (existing) {
    // Light merge: only fill blanks from the hint, don't overwrite user-set values.
    const patch: EditableProfile & { email_verified?: boolean } = {};
    if (hint.name && !existing.name) patch.name = hint.name;
    if (hint.picture && !existing.picture) patch.picture = hint.picture;
    if (hint.email_verified && !existing.email_verified) patch.email_verified = true;
    if (Object.keys(patch).length === 0) return existing;
    return upsertProfile(email, patch);
  }
  return upsertProfile(email, {
    auth_provider: hint.auth_provider ?? 'magic-link',
    name: hint.name,
    picture: hint.picture,
    email_verified: hint.email_verified ?? false,
  });
}
