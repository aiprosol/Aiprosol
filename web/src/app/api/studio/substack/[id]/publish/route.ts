// ─────────────────────────────────────────────────────────────────────────
// POST /api/studio/substack/[id]/publish
// Emails a linkedin_posts row to the configured Substack publishing
// address via Resend. Substack converts inbound emails (from the
// publication owner) into drafts/sent posts based on the pub's email
// publishing settings.
//
// Setup:
//   1. Substack Settings → Publishing → Email Publishing → Enable
//   2. Copy the unique publishing email (e.g. yourname.publish@substack.com)
//   3. Set SUBSTACK_PUBLISH_EMAIL on Vercel
//   4. RESEND_FROM_EMAIL must be verified AND the same address you used to
//      create the Substack publication (Substack only accepts emails from
//      the publication owner)
//
// Body: {} (the post itself comes from the linkedin_posts row, since we
// use that table for all long-form drafts including Substack drafts).
// To distinguish Substack-targeted drafts, set industry='substack'.
// ─────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { isStudioAdmin } from '@/lib/studio/auth';
import { requireSupabaseAdmin, isSupabaseConfigured } from '@/lib/db/supabase';
import { sendEmail, isResendConfigured } from '@/lib/resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const auth = await isStudioAdmin();
  if (!auth.ok || !auth.session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'supabase-not-configured' }, { status: 503 });
  }
  if (!isResendConfigured()) {
    return NextResponse.json({ error: 'resend-not-configured' }, { status: 503 });
  }

  const substackTo = process.env.SUBSTACK_PUBLISH_EMAIL;
  if (!substackTo) {
    return NextResponse.json(
      {
        error: 'substack-not-configured',
        hint: 'Set SUBSTACK_PUBLISH_EMAIL env var on Vercel. Find it at substack.com/publish/<pub>/settings → Email Publishing.',
      },
      { status: 503 },
    );
  }

  const { id } = await ctx.params;
  const db = requireSupabaseAdmin();

  const { data: post, error: loadErr } = await db
    .from('linkedin_posts')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (loadErr || !post) {
    return NextResponse.json({ error: 'post-not-found' }, { status: 404 });
  }
  if (post.status === 'published') {
    return NextResponse.json({ error: 'already-published', publishedAt: post.published_at }, { status: 409 });
  }

  // Substack reads the email subject as the post title and the email body as
  // the post body (HTML + plaintext both accepted; HTML preserves formatting).
  const subject = post.title?.trim() || '(untitled)';
  const bodyText = [post.hook, post.body].filter((s): s is string => Boolean(s?.trim())).join('\n\n');
  const bodyHtml = bodyText
    .split('\n\n')
    .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('');

  const result = await sendEmail({
    to: substackTo,
    subject,
    html: bodyHtml,
    text: bodyText,
    tags: [{ name: 'category', value: 'substack-publish' }],
  });
  if (!result.ok) {
    return NextResponse.json({ error: 'send-failed', detail: result.error }, { status: 502 });
  }

  const { error: updErr } = await db
    .from('linkedin_posts')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
      // Mark this was Substack-published (not LinkedIn).
      // We reuse linkedin_post_url to point to the Substack pub URL once Substack confirms.
    })
    .eq('id', id);
  if (updErr) {
    return NextResponse.json(
      { ok: true, warning: 'sent-but-db-update-failed', dbError: updErr.message },
      { status: 200 },
    );
  }

  return NextResponse.json({
    ok: true,
    sentTo: substackTo,
    subject,
    note: 'Substack received the email — check substack.com/publish to confirm it became a draft.',
    by: auth.session.email,
  });
}
