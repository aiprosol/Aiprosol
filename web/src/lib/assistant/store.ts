// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · STUDIO COPILOT — persistence
// Conversations + messages over the service-role Supabase client. All helpers
// are no-op-safe when Supabase isn't configured (chat still works; history is
// just not saved). RLS is enabled with no policies → only this server path.
// ─────────────────────────────────────────────────────────────────────────

import { isSupabaseConfigured, requireSupabaseAdmin } from '@/lib/db/supabase';
import type { ChatMsg, ToolCall, ToolResultMsg } from './providers/types';
import type { PendingAction } from './loop';

export type CopilotRow = {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'tool' | 'system';
  content: string | null;
  tool_calls: { calls?: ToolCall[]; pending?: PendingAction[] } | null;
  tool_results: ToolResultMsg[] | null;
  status: 'complete' | 'pending';
  provider: string | null;
  created_at: string;
};

export type ConversationRow = {
  id: string;
  operator_email: string;
  title: string | null;
  model_provider: string;
  model_id: string | null;
  updated_at: string;
  archived: boolean;
};

export type DisplayMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolEvents?: Array<{ name: string; ok: boolean; summary: string }>;
  pending?: PendingAction[];
};

export type AppendInput = {
  role: 'user' | 'assistant' | 'tool';
  content?: string | null;
  toolCallsJson?: { calls?: ToolCall[]; pending?: PendingAction[] } | null;
  toolResultsJson?: ToolResultMsg[] | null;
  status?: 'complete' | 'pending';
  provider?: string | null;
};

export function persistenceEnabled(): boolean {
  return isSupabaseConfigured();
}

export async function createConversation(operatorEmail: string, provider: string, model: string): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const db = requireSupabaseAdmin();
  const { data, error } = await db
    .from('assistant_conversations')
    .insert({ operator_email: operatorEmail, model_provider: provider, model_id: model })
    .select('id')
    .maybeSingle();
  if (error || !data) return null;
  return data.id as string;
}

export async function getConversation(id: string, operatorEmail: string): Promise<ConversationRow | null> {
  if (!isSupabaseConfigured()) return null;
  const db = requireSupabaseAdmin();
  const { data } = await db.from('assistant_conversations').select('*').eq('id', id).maybeSingle();
  if (!data || data.operator_email !== operatorEmail) return null;
  return data as ConversationRow;
}

export async function listConversations(operatorEmail: string): Promise<ConversationRow[]> {
  if (!isSupabaseConfigured()) return [];
  const db = requireSupabaseAdmin();
  const { data } = await db
    .from('assistant_conversations')
    .select('*')
    .eq('operator_email', operatorEmail)
    .eq('archived', false)
    .order('updated_at', { ascending: false })
    .limit(50);
  return (data ?? []) as ConversationRow[];
}

export async function loadRows(conversationId: string): Promise<CopilotRow[]> {
  if (!isSupabaseConfigured()) return [];
  const db = requireSupabaseAdmin();
  const { data } = await db
    .from('assistant_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  return (data ?? []) as CopilotRow[];
}

export async function appendMessage(conversationId: string, m: AppendInput): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const db = requireSupabaseAdmin();
  await db.from('assistant_messages').insert({
    conversation_id: conversationId,
    role: m.role,
    content: m.content ?? null,
    tool_calls: m.toolCallsJson ?? null,
    tool_results: m.toolResultsJson ?? null,
    status: m.status ?? 'complete',
    provider: m.provider ?? null,
  });
}

export async function setTitle(conversationId: string, title: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const db = requireSupabaseAdmin();
  await db.from('assistant_conversations').update({ title }).eq('id', conversationId);
}

export async function touchConversation(conversationId: string, provider: string, model: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const db = requireSupabaseAdmin();
  await db
    .from('assistant_conversations')
    .update({ updated_at: new Date().toISOString(), model_provider: provider, model_id: model })
    .eq('id', conversationId);
}

export async function archiveConversation(id: string, operatorEmail: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const db = requireSupabaseAdmin();
  const conv = await getConversation(id, operatorEmail);
  if (!conv) return false;
  await db.from('assistant_conversations').update({ archived: true }).eq('id', id);
  return true;
}

/** The pending (awaiting-confirmation) assistant row, if any. */
export function findPendingAssistant(rows: CopilotRow[]): CopilotRow | null {
  for (let i = rows.length - 1; i >= 0; i--) {
    if (rows[i].role === 'assistant' && rows[i].status === 'pending') return rows[i];
  }
  return null;
}

export async function markRowComplete(rowId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const db = requireSupabaseAdmin();
  await db.from('assistant_messages').update({ status: 'complete' }).eq('id', rowId);
}

// ─── converters ──────────────────────────────────────────────────────────

/** Persisted rows → normalized history for replay to a provider. */
export function toChatMsgs(rows: CopilotRow[]): ChatMsg[] {
  const out: ChatMsg[] = [];
  for (const r of rows) {
    if (r.role === 'user') {
      out.push({ role: 'user', content: r.content ?? '' });
    } else if (r.role === 'assistant') {
      const calls = r.tool_calls?.calls;
      out.push({ role: 'assistant', content: r.content ?? '', ...(calls && calls.length ? { toolCalls: calls } : {}) });
    } else if (r.role === 'tool') {
      out.push({ role: 'tool', results: r.tool_results ?? [] });
    }
  }
  return out;
}

/** Persisted rows → UI display messages (assistant bubbles carry tool chips). */
export function toDisplayMessages(rows: CopilotRow[]): DisplayMessage[] {
  const out: DisplayMessage[] = [];
  for (const r of rows) {
    if (r.role === 'user') {
      out.push({ id: r.id, role: 'user', content: r.content ?? '' });
    } else if (r.role === 'assistant') {
      const msg: DisplayMessage = { id: r.id, role: 'assistant', content: r.content ?? '' };
      if (r.status === 'pending' && r.tool_calls?.pending?.length) msg.pending = r.tool_calls.pending;
      out.push(msg);
    } else if (r.role === 'tool') {
      const prev = out[out.length - 1];
      const events = (r.tool_results ?? []).map((tr) => ({
        name: tr.name,
        ok: !tr.isError,
        summary: (tr.content ?? '').split('\n')[0].slice(0, 160),
      }));
      if (prev && prev.role === 'assistant') prev.toolEvents = [...(prev.toolEvents ?? []), ...events];
    }
  }
  return out;
}
