// ─────────────────────────────────────────────────────────────────────────
// POST /api/studio/outreach/[id]/send
// Body: { to?: string, toName?: string }
// 1. Loads the draft from Supabase
// 2. Resolves the recipient (body `to` > draft.recipient_email > linked lead.email)
// 3. Sends via Gmail API as the signed-in admin
// 4. Updates the draft: status='sent', sent_at=now, gmail_message_id, sent_by
// ─────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { isStudioAdmin } from '@/lib/studio/auth';
import { requireSupabaseAdmin } from '@/lib/db/supabase';
import { sendViaGmail } from '@/lib/gmail/send';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const auth = await isStudioAdmin();
  if (!auth.ok || !auth.session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { id } = await ctx.params;
  let body: { to?: string; toName?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* allow empty body — use stored recipient if available */
  }

  const db = requireSupabaseAdmin();

  // Load draft
  const { data: draft, error: loadErr } = await db
    .from('outreach_drafts')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (loadErr || !draft) {
    return NextResponse.json({ error: 'draft-not-found' }, { status: 404 });
  }
  if (draft.status === 'sent') {
    return NextResponse.json({ error: 'already-sent', sentAt: draft.sent_at, gmailId: draft.gmail_message_id }, { status: 409 });
  }

  // Resolve recipient: explicit body.to > stored recipient_email > linked lead email
  let to = body.to?.trim() || draft.recipient_email?.trim() || '';
  let toName = body.toName?.trim() || draft.recipient_name?.trim() || undefined;

  if (!to && draft.notion_id?.startsWith('lead:')) {
    const leadId = draft.notion_id.slice(5);
    const { data: lead } = await db
      .from('leads')
      .select('email, name')
      .eq('id', leadId)
      .maybeSingle();
    if (lead?.email) {
      to = lead.email;
      toName = toName || lead.name || undefined;
    }
  }

  if (!to) {
    return NextResponse.json(
      { error: 'no-recipient', message: 'Need a "to" email — supply in request body or set draft.recipient_email' },
      { status: 400 },
    );
  }

  // Send via Gmail
  const result = await sendViaGmail({
    to,
    toName,
    subject: draft.subject || '(no subject)',
    bodyText: draft.body,
    clientMessageId: `draft-${draft.id}`,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  // Persist send state
  const { error: updErr } = await db
    .from('outreach_drafts')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
      recipient_email: to,
      recipient_name: toName ?? null,
      gmail_message_id: result.messageId,
      gmail_thread_id: result.threadId,
      sent_by: auth.session.email,
    })
    .eq('id', id);

  if (updErr) {
    // Sent but state not persisted — surface this clearly
    return NextResponse.json(
      {
        ok: true,
        warning: 'email-sent-but-state-update-failed',
        messageId: result.messageId,
        threadId: result.threadId,
        from: result.from,
        to,
        updateError: updErr.message,
      },
      { status: 200 },
    );
  }

  return NextResponse.json({
    ok: true,
    messageId: result.messageId,
    threadId: result.threadId,
    from: result.from,
    to,
    sentBy: auth.session.email,
  });
}
