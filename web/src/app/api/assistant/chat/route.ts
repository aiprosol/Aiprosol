// ─────────────────────────────────────────────────────────────────────────
// POST /api/assistant/chat — Studio Copilot turn (operator-only)
// Body (new turn):  { provider, message, conversationId? }
// Body (resume):    { provider, conversationId, resume: { decisions: [{toolCallId, approved}] } }
// Returns: { conversationId, kind: 'final'|'pending_confirmation', text, pending?, toolEvents, provider, model, persisted }
// ─────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isStudioAdmin } from '@/lib/studio/auth';
import { isSupabaseConfigured, requireSupabaseAdmin } from '@/lib/db/supabase';
import { getProvider, isProviderId } from '@/lib/assistant/providers';
import type { ToolResultMsg } from '@/lib/assistant/providers/types';
import { COPILOT_SYSTEM_PROMPT } from '@/lib/assistant/prompt';
import { getOperatorGrounding } from '@/lib/assistant/operator-grounding';
import { getOperatorMemoryText } from '@/lib/assistant/memory';
import { runLoop, executeToolCall, toEvent, type ToolEvent } from '@/lib/assistant/loop';
import { TOOL_MAP, type ToolContext } from '@/lib/assistant/tools';
import { generateTitle } from '@/lib/assistant/title';
import {
  appendMessage,
  createConversation,
  findPendingAssistant,
  getConversation,
  loadRows,
  markRowComplete,
  setTitle,
  toChatMsgs,
  touchConversation,
} from '@/lib/assistant/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const bodySchema = z.object({
  conversationId: z.string().uuid().optional(),
  provider: z.string(),
  message: z.string().min(1).max(8000).optional(),
  resume: z
    .object({ decisions: z.array(z.object({ toolCallId: z.string(), approved: z.boolean() })).min(1).max(12) })
    .optional(),
});

export async function POST(req: NextRequest) {
  const auth = await isStudioAdmin();
  if (!auth.ok || !auth.session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'supabase-not-configured' }, { status: 503 });

  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json({ error: 'invalid-body', detail: err instanceof Error ? err.message : 'bad' }, { status: 400 });
  }

  if (!isProviderId(parsed.provider)) return NextResponse.json({ error: 'unknown-provider' }, { status: 400 });
  const provider = getProvider(parsed.provider);
  if (!provider.available()) {
    return NextResponse.json({ error: 'provider-unavailable', provider: parsed.provider }, { status: 400 });
  }
  if (!parsed.message && !parsed.resume) {
    return NextResponse.json({ error: 'message-or-resume-required' }, { status: 400 });
  }

  const operatorEmail = auth.session.email;
  const ctx: ToolContext = { operatorEmail, db: requireSupabaseAdmin() };
  const model = provider.modelId();
  const system = COPILOT_SYSTEM_PROMPT;
  const [baseGrounding, memoryText] = await Promise.all([
    getOperatorGrounding(Date.now()),
    getOperatorMemoryText(operatorEmail),
  ]);
  const grounding = [baseGrounding, memoryText].filter(Boolean).join('\n\n');

  let conversationId = parsed.conversationId ?? null;
  const preEvents: ToolEvent[] = [];

  // ── RESUME: operator approved/declined a pending confirmation ──────────
  if (parsed.resume) {
    if (!conversationId) return NextResponse.json({ error: 'conversationId-required' }, { status: 400 });
    const conv = await getConversation(conversationId, operatorEmail);
    if (!conv) return NextResponse.json({ error: 'conversation-not-found' }, { status: 404 });

    const pending = findPendingAssistant(await loadRows(conversationId));
    if (!pending || !pending.tool_calls?.calls?.length) {
      return NextResponse.json({ error: 'no-pending-confirmation' }, { status: 409 });
    }

    const decisions = parsed.resume.decisions;
    const results: ToolResultMsg[] = [];
    for (const call of pending.tool_calls.calls) {
      const tool = TOOL_MAP.get(call.name);
      if (tool?.risk === 'confirm') {
        const decision = decisions.find((d) => d.toolCallId === call.id);
        if (decision?.approved) {
          results.push(await executeToolCall(call, ctx));
        } else {
          results.push({ toolCallId: call.id, name: call.name, content: 'Operator declined this action.', isError: true });
        }
      } else {
        // A safe tool that rode along in the same batch — execute it now.
        results.push(await executeToolCall(call, ctx));
      }
    }
    for (const r of results) preEvents.push(toEvent(r));

    await appendMessage(conversationId, { role: 'tool', toolResultsJson: results, status: 'complete' });
    await markRowComplete(pending.id);
  } else {
    // ── NEW TURN ─────────────────────────────────────────────────────────
    if (conversationId) {
      const conv = await getConversation(conversationId, operatorEmail);
      if (!conv) return NextResponse.json({ error: 'conversation-not-found' }, { status: 404 });
      // Safeguard: a still-pending confirmation + a fresh message → supersede
      // the pending actions (decline) so every tool_use keeps a tool_result.
      const pending = findPendingAssistant(await loadRows(conversationId));
      if (pending?.tool_calls?.calls?.length) {
        const declined: ToolResultMsg[] = pending.tool_calls.calls.map((c) => ({
          toolCallId: c.id,
          name: c.name,
          content: 'Superseded — operator sent a new message instead of confirming.',
          isError: true,
        }));
        await appendMessage(conversationId, { role: 'tool', toolResultsJson: declined, status: 'complete' });
        await markRowComplete(pending.id);
      }
    } else {
      conversationId = await createConversation(operatorEmail, provider.id, model);
      if (!conversationId) return NextResponse.json({ error: 'conversation-create-failed' }, { status: 500 });
      await setTitle(conversationId, generateTitle(parsed.message ?? ''));
    }
    await appendMessage(conversationId, { role: 'user', content: parsed.message ?? '' });
  }

  // ── Run the loop on the rebuilt history ────────────────────────────────
  const history = toChatMsgs(await loadRows(conversationId));
  let result;
  try {
    result = await runLoop({ provider, system, grounding, history, ctx });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[assistant/chat] loop error', msg);
    return NextResponse.json({ error: 'provider-error', detail: msg, conversationId }, { status: 502 });
  }

  for (const m of result.newMessages) await appendMessage(conversationId, m);
  await touchConversation(conversationId, provider.id, model);

  return NextResponse.json(
    {
      conversationId,
      kind: result.kind,
      text: result.text,
      pending: result.kind === 'pending_confirmation' ? result.pending : undefined,
      toolEvents: [...preEvents, ...result.toolEvents],
      provider: provider.id,
      model,
      persisted: true,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
