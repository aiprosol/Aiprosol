// ─────────────────────────────────────────────────────────────────────────
// GET /api/agent/gmail/list?max=10
//
// Returns the most-recent INBOX messages with parsed From / Subject / Snippet.
// Used by /inbox page after the user has connected. Pure read — no drafts.
// ─────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { getValidAccessToken } from '@/lib/google-gmail';

export const runtime = 'nodejs';

interface GmailHeader { name: string; value: string }
interface GmailMessageMeta {
  id: string;
  threadId: string;
  snippet?: string;
  internalDate?: string;
  payload?: { headers?: GmailHeader[] };
  labelIds?: string[];
}

function headerOf(msg: GmailMessageMeta, name: string): string {
  const h = msg.payload?.headers?.find(x => x.name?.toLowerCase() === name.toLowerCase());
  return h?.value || '';
}

export async function GET(req: NextRequest) {
  const ctx = await getValidAccessToken();
  if (!ctx) {
    return NextResponse.json({ connected: false }, { status: 401 });
  }

  const max = Math.max(1, Math.min(50, parseInt(req.nextUrl.searchParams.get('max') || '10', 10)));

  // ─── Step 1: list message IDs ───
  const listUrl = new URL('https://gmail.googleapis.com/gmail/v1/users/me/messages');
  listUrl.searchParams.set('maxResults', String(max));
  listUrl.searchParams.set('labelIds', 'INBOX');

  const listRes = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${ctx.accessToken}` },
  });
  if (!listRes.ok) {
    const body = await listRes.text();
    console.error('[agent/gmail/list] list failed:', listRes.status, body);
    return NextResponse.json({ error: 'Gmail list failed', status: listRes.status }, { status: 502 });
  }
  const listJson = await listRes.json();
  const ids: { id: string; threadId: string }[] = listJson.messages || [];

  // ─── Step 2: fetch metadata for each (parallel) ───
  const messages: GmailMessageMeta[] = await Promise.all(
    ids.map(async ({ id }) => {
      const url = new URL(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}`);
      url.searchParams.set('format', 'metadata');
      url.searchParams.append('metadataHeaders', 'From');
      url.searchParams.append('metadataHeaders', 'Subject');
      url.searchParams.append('metadataHeaders', 'Date');
      const r = await fetch(url, { headers: { Authorization: `Bearer ${ctx.accessToken}` } });
      return r.json();
    }),
  );

  const out = messages.map(m => ({
    id: m.id,
    threadId: m.threadId,
    from: headerOf(m, 'From'),
    subject: headerOf(m, 'Subject'),
    date: headerOf(m, 'Date'),
    snippet: m.snippet || '',
    unread: m.labelIds?.includes('UNREAD') || false,
  }));

  return NextResponse.json({
    connected: true,
    email: ctx.email,
    count: out.length,
    messages: out,
  });
}
