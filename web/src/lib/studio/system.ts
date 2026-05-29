// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · STUDIO — system status
// Powers the System tab + the command-center home. Single place to see what's
// configured, whether the agents/DB are healthy, and recent deploys — so the
// operator stops bouncing between Vercel / Supabase / the code.
// All fetchers are defensive: a failure in one never breaks the snapshot.
// ─────────────────────────────────────────────────────────────────────────

import { isSupabaseConfigured, requireSupabaseAdmin, hasServiceRole } from '@/lib/db/supabase';

// Known env vars + what each unlocks. We only ever report PRESENCE (boolean),
// never values. `group` drives ordering/sectioning in the UI.
const KNOWN_ENV: Array<{ name: string; unlocks: string; group: 'core' | 'copilot' | 'growth' | 'outbound' | 'ops' }> = [
  { name: 'NEXT_PUBLIC_SUPABASE_URL', unlocks: 'Database (studio data + history)', group: 'core' },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', unlocks: 'Server writes (Copilot, agents, persistence)', group: 'core' },
  { name: 'SESSION_SECRET', unlocks: 'Login sessions (rotate to log everyone out)', group: 'core' },
  { name: 'GROQ_API_KEY', unlocks: 'Copilot + agents on Groq Llama', group: 'copilot' },
  { name: 'ANTHROPIC_API_KEY', unlocks: 'Copilot Claude toggle + daily brief', group: 'copilot' },
  { name: 'POSTHOG_API_KEY', unlocks: 'Funnel/analytics tab (server read)', group: 'growth' },
  { name: 'STRIPE_SECRET_KEY', unlocks: 'Revenue tab + checkout', group: 'growth' },
  { name: 'GITHUB_TOKEN', unlocks: 'Content editing (commit pricing/copy)', group: 'growth' },
  { name: 'RESEND_API_KEY', unlocks: 'Transactional email + Substack publish', group: 'outbound' },
  { name: 'LINKEDIN_ACCESS_TOKEN', unlocks: 'Publish posts to LinkedIn', group: 'outbound' },
  { name: 'LINKEDIN_AUTHOR_URN', unlocks: 'LinkedIn author identity', group: 'outbound' },
  { name: 'SUBSTACK_PUBLISH_EMAIL', unlocks: 'Publish drafts to Substack', group: 'outbound' },
  { name: 'GOOGLE_CLIENT_ID', unlocks: '"Continue with Google" login', group: 'ops' },
  { name: 'VERCEL_TOKEN', unlocks: 'Inline deploy status in this tab', group: 'ops' },
];

export type EnvItem = { name: string; set: boolean; unlocks: string; group: string };

export function envStatus(): EnvItem[] {
  return KNOWN_ENV.map((e) => ({ name: e.name, set: Boolean(process.env[e.name]), unlocks: e.unlocks, group: e.group }));
}

export type SupabaseStatus = { configured: boolean; serviceRole: boolean; ok: boolean; latencyMs: number | null; error?: string };

async function supabasePing(): Promise<SupabaseStatus> {
  if (!isSupabaseConfigured()) return { configured: false, serviceRole: false, ok: false, latencyMs: null };
  const started = Date.now();
  try {
    const db = requireSupabaseAdmin();
    const { error } = await db.from('agent_state').select('role', { count: 'exact', head: true });
    return { configured: true, serviceRole: hasServiceRole(), ok: !error, latencyMs: Date.now() - started, error: error?.message };
  } catch (err) {
    return { configured: true, serviceRole: hasServiceRole(), ok: false, latencyMs: Date.now() - started, error: err instanceof Error ? err.message : 'ping-failed' };
  }
}

export type AgentHealth = {
  agents: Array<{ role: string; health: string | null; lastRunAt: string | null }>;
  errors24h: number;
  fallbacks24h: number;
  lastRunAt: string | null;
};

async function agentHealth(): Promise<AgentHealth> {
  const empty: AgentHealth = { agents: [], errors24h: 0, fallbacks24h: 0, lastRunAt: null };
  if (!isSupabaseConfigured()) return empty;
  try {
    const db = requireSupabaseAdmin();
    const since = new Date(Date.now() - 24 * 3600_000).toISOString();
    const [statesRes, errRes, fbRes, lastRes] = await Promise.all([
      db.from('agent_state').select('role, health, last_run_at'),
      db.from('agent_log').select('id', { count: 'exact', head: true }).eq('status', 'error').gte('at', since),
      db.from('agent_log').select('id', { count: 'exact', head: true }).eq('status', 'fallback').gte('at', since),
      db.from('agent_log').select('at').order('at', { ascending: false }).limit(1).maybeSingle(),
    ]);
    return {
      agents: (statesRes.data ?? []).map((r) => ({ role: r.role, health: r.health, lastRunAt: r.last_run_at })),
      errors24h: errRes.count ?? 0,
      fallbacks24h: fbRes.count ?? 0,
      lastRunAt: lastRes.data?.at ?? null,
    };
  } catch {
    return empty;
  }
}

export type DigestFreshness = { day: string | null; ageHours: number | null; stale: boolean };

async function digestFreshness(): Promise<DigestFreshness> {
  if (!isSupabaseConfigured()) return { day: null, ageHours: null, stale: true };
  try {
    const db = requireSupabaseAdmin();
    const { data } = await db.from('daily_digest').select('day').order('day', { ascending: false }).limit(1).maybeSingle();
    if (!data?.day) return { day: null, ageHours: null, stale: true };
    const ageHours = Math.round((Date.now() - new Date(`${data.day}T00:00:00Z`).getTime()) / 3600_000);
    return { day: data.day, ageHours, stale: ageHours > 36 };
  } catch {
    return { day: null, ageHours: null, stale: true };
  }
}

export type DeployInfo = { state: string; createdAt: number; sha: string; message: string; url: string };

async function vercelDeploys(): Promise<DeployInfo[] | null> {
  const token = process.env.VERCEL_TOKEN;
  if (!token) return null;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;
  try {
    const params = new URLSearchParams({ limit: '5' });
    if (projectId) params.set('projectId', projectId);
    if (teamId) params.set('teamId', teamId);
    const res = await fetch(`https://api.vercel.com/v6/deployments?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { deployments?: Array<{ state?: string; readyState?: string; created: number; meta?: Record<string, string>; url: string }> };
    return (data.deployments ?? []).map((d) => ({
      state: d.state || d.readyState || 'unknown',
      createdAt: d.created,
      sha: (d.meta?.githubCommitSha || '').slice(0, 7),
      message: (d.meta?.githubCommitMessage || '').split('\n')[0].slice(0, 80),
      url: `https://${d.url}`,
    }));
  } catch {
    return null;
  }
}

export type SystemSnapshot = {
  env: EnvItem[];
  supabase: SupabaseStatus;
  agents: AgentHealth;
  digest: DigestFreshness;
  deploys: DeployInfo[] | null;
  fetchedAt: string;
};

export async function getSystemSnapshot(): Promise<SystemSnapshot> {
  const [supabase, agents, digest, deploys] = await Promise.all([
    supabasePing(),
    agentHealth(),
    digestFreshness(),
    vercelDeploys(),
  ]);
  return { env: envStatus(), supabase, agents, digest, deploys, fetchedAt: new Date().toISOString() };
}
