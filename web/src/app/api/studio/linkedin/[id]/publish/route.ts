// ─────────────────────────────────────────────────────────────────────────
// POST /api/studio/linkedin/[id]/publish
// Publishes a linkedin_posts row to LinkedIn. Admin-gated.
// Falls back to "draft only" if LINKEDIN_ACCESS_TOKEN isn't set yet — the
// row stays as draft so the chairman can copy-paste manually.
// ─────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { isStudioAdmin } from '@/lib/studio/auth';
import { requireSupabaseAdmin, isSupabaseConfigured } from '@/lib/db/supabase';
import { publishToLinkedIn, isLinkedInConfigured } from '@/lib/linkedin/publish';

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
  if (!isLinkedInConfigured()) {
    return NextResponse.json(
      {
        error: 'linkedin-not-configured',
        hint: 'Set LINKEDIN_ACCESS_TOKEN + LINKEDIN_AUTHOR_URN env vars on Vercel. See web/src/lib/linkedin/publish.ts for setup steps.',
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

  // Build the actual post body — title + hook + body, joined with two newlines
  // Filter out empty parts so we don't end up with leading whitespace.
  const parts = [post.title, post.hook, post.body].filter((s): s is string => Boolean(s?.trim()));
  const fullBody = parts.join('\n\n').slice(0, 3000);

  const result = await publishToLinkedIn({ body: fullBody, visibility: 'PUBLIC' });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  const { error: updErr } = await db
    .from('linkedin_posts')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (updErr) {
    return NextResponse.json(
      { ok: true, warning: 'published-but-db-update-failed', postUrl: result.postUrl, dbError: updErr.message },
      { status: 200 },
    );
  }

  return NextResponse.json({
    ok: true,
    postId: result.postId,
    postUrl: result.postUrl,
    by: auth.session.email,
  });
}
