// ─────────────────────────────────────────────────────────────────────────
// GET    /api/assistant/conversations/[id]  → full thread for display
// PATCH  /api/assistant/conversations/[id]  → { title } rename
// DELETE /api/assistant/conversations/[id]  → soft-archive
// All operator-scoped (a conversation is only visible to its operator_email).
// ─────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { isStudioAdmin } from '@/lib/studio/auth';
import {
  archiveConversation,
  findPendingAssistant,
  getConversation,
  loadRows,
  setTitle,
  toDisplayMessages,
} from '@/lib/assistant/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await isStudioAdmin();
  if (!auth.ok || !auth.session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await ctx.params;
  const conv = await getConversation(id, auth.session.email);
  if (!conv) return NextResponse.json({ error: 'not-found' }, { status: 404 });

  const rows = await loadRows(id);
  const pending = findPendingAssistant(rows);
  return NextResponse.json({
    ok: true,
    conversation: { id: conv.id, title: conv.title, provider: conv.model_provider },
    messages: toDisplayMessages(rows),
    pending: pending?.tool_calls?.pending ?? null,
  });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await isStudioAdmin();
  if (!auth.ok || !auth.session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await ctx.params;
  const conv = await getConversation(id, auth.session.email);
  if (!conv) return NextResponse.json({ error: 'not-found' }, { status: 404 });

  let body: { title?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid-json' }, { status: 400 });
  }
  const title = (body.title ?? '').trim().slice(0, 120);
  if (!title) return NextResponse.json({ error: 'title-required' }, { status: 400 });
  await setTitle(id, title);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await isStudioAdmin();
  if (!auth.ok || !auth.session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await ctx.params;
  const ok = await archiveConversation(id, auth.session.email);
  if (!ok) return NextResponse.json({ error: 'not-found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
