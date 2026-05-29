// ─────────────────────────────────────────────────────────────────────────
// GET  /api/assistant/conversations  → list this operator's conversations
// POST /api/assistant/conversations  → create an empty conversation
// ─────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { isStudioAdmin } from '@/lib/studio/auth';
import { availableProviders, isProviderId } from '@/lib/assistant/providers';
import { createConversation, listConversations } from '@/lib/assistant/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await isStudioAdmin();
  if (!auth.ok || !auth.session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const conversations = (await listConversations(auth.session.email)).map((c) => ({
    id: c.id,
    title: c.title,
    provider: c.model_provider,
    updatedAt: c.updated_at,
  }));
  // Tell the UI which model toggles to enable.
  return NextResponse.json({ ok: true, conversations, providers: availableProviders() });
}

export async function POST(req: NextRequest) {
  const auth = await isStudioAdmin();
  if (!auth.ok || !auth.session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let provider = 'anthropic';
  try {
    const body = (await req.json()) as { provider?: string };
    if (body.provider && isProviderId(body.provider)) provider = body.provider;
  } catch {
    /* empty body is fine */
  }

  const id = await createConversation(auth.session.email, provider, '');
  if (!id) return NextResponse.json({ error: 'persistence-unavailable' }, { status: 503 });
  return NextResponse.json({ ok: true, conversationId: id });
}
