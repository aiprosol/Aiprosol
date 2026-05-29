// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · STUDIO COPILOT — operator memory
// Standing facts/preferences the operator tells Copilot to remember. Injected
// into the (uncached) grounding each turn so Copilot honors them. The
// remember/recall tools (tools.ts) write/read this table directly.
// ─────────────────────────────────────────────────────────────────────────

import { isSupabaseConfigured, requireSupabaseAdmin } from '@/lib/db/supabase';

export async function getOperatorMemory(email: string): Promise<Array<{ key: string; value: string }>> {
  if (!isSupabaseConfigured()) return [];
  try {
    const db = requireSupabaseAdmin();
    const { data } = await db
      .from('assistant_memory')
      .select('key, value')
      .eq('operator_email', email)
      .order('updated_at', { ascending: false })
      .limit(50);
    return (data ?? []) as Array<{ key: string; value: string }>;
  } catch {
    return [];
  }
}

export async function getOperatorMemoryText(email: string): Promise<string> {
  const rows = await getOperatorMemory(email);
  if (!rows.length) return '';
  return ['# OPERATOR MEMORY — standing facts/preferences; honor these:', ...rows.map((r) => `- ${r.key}: ${r.value}`)].join('\n');
}
