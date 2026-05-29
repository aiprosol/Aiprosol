// ─────────────────────────────────────────────────────────────────────────
// GET|POST /api/decide?token=… — one-tap decision from the Decision Inbox email.
// AUTH = the signed token (no login). PREFETCH-SAFE: GET renders a confirm page
// with NO side effect; the human clicks Confirm which POSTs and executes. So an
// email client pre-fetching the link can never trigger an action.
// Approve reuses the tested confirm-tool handlers; reject archives/cancels.
// ─────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured, requireSupabaseAdmin } from '@/lib/db/supabase';
import { verifyDecisionToken, type DecisionPayload } from '@/lib/studio/action-token';
import { TOOL_MAP, type ToolContext } from '@/lib/assistant/tools';
import { routeProject } from '@/lib/agents/arora-router';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function page(title: string, body: string, status = 200): NextResponse {
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title} · Aiprosol</title>
<style>
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:radial-gradient(60% 50% at 50% 0%,rgba(139,92,246,0.14),transparent 70%),#0A0613;color:#E5E7EB;font-family:Inter,system-ui,sans-serif;padding:24px;}
  .card{max-width:480px;width:100%;background:linear-gradient(160deg,#13101F,#0E0A1C);border:1px solid #2A1F3D;border-radius:16px;padding:32px;box-shadow:0 24px 70px rgba(0,0,0,0.5);}
  h1{font-family:'Space Grotesk',system-ui,sans-serif;font-size:20px;margin:0 0 8px;}
  p{font-size:14px;line-height:1.6;color:#C7CEDB;margin:0 0 16px;}
  .sum{font-size:13px;color:#9CA3B5;background:rgba(139,92,246,0.06);border:1px solid rgba(139,92,246,0.25);border-radius:10px;padding:12px 14px;margin:0 0 20px;white-space:pre-wrap;}
  .btn{display:inline-block;padding:12px 22px;border-radius:10px;font-weight:700;font-size:14px;border:none;cursor:pointer;text-decoration:none;font-family:inherit;}
  .go{background:linear-gradient(135deg,#7C3AED,#8B5CF6);color:#fff;}
  .cancel{color:#9CA3B5;margin-left:14px;font-size:13px;text-decoration:none;}
  .ok{color:#6EE7B7;} .err{color:#FCA5A5;}
  a.link{color:#C084FC;}
</style></head><body><div class="card">${body}</div></body></html>`;
  return new NextResponse(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}

async function describe(p: DecisionPayload): Promise<{ label: string; terminal: boolean }> {
  if (!isSupabaseConfigured()) return { label: `${p.a} ${p.id}`, terminal: false };
  const db = requireSupabaseAdmin();
  try {
    if (p.a === 'send_outreach') {
      const { data } = await db.from('outreach_drafts').select('subject, status').eq('id', p.id).maybeSingle();
      return { label: `Send outreach — "${data?.subject || p.id}"`, terminal: data?.status === 'sent' };
    }
    if (p.a === 'publish_linkedin' || p.a === 'publish_substack') {
      const { data } = await db.from('linkedin_posts').select('title, status').eq('id', p.id).maybeSingle();
      return { label: `Publish ${p.a === 'publish_substack' ? 'to Substack' : 'to LinkedIn'} — "${data?.title || p.id}"`, terminal: data?.status === 'published' };
    }
    if (p.a === 'dispatch_project') {
      const { data } = await db.from('projects').select('title, status').eq('id', p.id).maybeSingle();
      return { label: `Dispatch project — "${data?.title || p.id}"`, terminal: !!data && data.status !== 'briefed' };
    }
  } catch {
    /* ignore */
  }
  return { label: `${p.a} ${p.id}`, terminal: false };
}

async function execute(p: DecisionPayload): Promise<{ ok: boolean; message: string }> {
  const ctx: ToolContext = {
    operatorEmail: process.env.BRIEF_EMAIL || process.env.RESEND_DIGEST_TO || 'operator@aiprosol.com',
    db: requireSupabaseAdmin(),
  };

  if (p.d === 'reject') {
    try {
      if (p.a === 'send_outreach') await ctx.db.from('outreach_drafts').update({ status: 'archived' }).eq('id', p.id);
      else if (p.a === 'publish_linkedin' || p.a === 'publish_substack') await ctx.db.from('linkedin_posts').update({ status: 'archived' }).eq('id', p.id);
      else if (p.a === 'dispatch_project') await ctx.db.from('projects').update({ status: 'cancelled' }).eq('id', p.id);
      return { ok: true, message: 'Declined. Archived — it won’t go out.' };
    } catch (err) {
      return { ok: false, message: err instanceof Error ? err.message : 'reject-failed' };
    }
  }

  // approve
  try {
    if (p.a === 'dispatch_project') {
      const r = await routeProject(p.id);
      return r.ok
        ? { ok: true, message: `Dispatched. Arora decomposed it into ${r.decomposition?.tasks?.length ?? 0} task(s).` }
        : { ok: false, message: r.error || 'router-failed' };
    }
    const tool = TOOL_MAP.get(p.a);
    if (!tool) return { ok: false, message: `Unknown action: ${p.a}` };
    const parsed = tool.parameters.safeParse({ id: p.id });
    if (!parsed.success) return { ok: false, message: 'invalid action target' };
    const res = await tool.run(parsed.data, ctx);
    return { ok: res.ok, message: res.summary };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'action-failed' };
  }
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') || '';
  const p = verifyDecisionToken(token);
  if (!p) return page('Link expired', `<h1>Link expired or invalid</h1><p>This decision link is no longer valid. Open the <a class="link" href="/studio">studio Inbox</a> to act on it.</p>`, 400);
  const { label, terminal } = await describe(p);
  if (terminal && p.d === 'approve') {
    return page('Already done', `<h1 class="ok">Already done</h1><p>${label} — this was already actioned. Nothing to do.</p><p><a class="link" href="/studio">Open studio →</a></p>`);
  }
  const verb = p.d === 'approve' ? 'Confirm' : 'Confirm decline';
  return page('Confirm', `
    <h1>${verb}</h1>
    <div class="sum">${label}</div>
    <form method="POST" action="/api/decide">
      <input type="hidden" name="token" value="${token}" />
      <button class="btn go" type="submit">${p.d === 'approve' ? '✓ Confirm' : '✗ Confirm decline'}</button>
      <a class="cancel" href="/studio">Cancel</a>
    </form>`);
}

export async function POST(req: NextRequest) {
  let token = '';
  try {
    const form = await req.formData();
    token = String(form.get('token') || '');
  } catch {
    token = req.nextUrl.searchParams.get('token') || '';
  }
  const p = verifyDecisionToken(token);
  if (!p) return page('Link expired', `<h1>Link expired or invalid</h1><p>Open the <a class="link" href="/studio">studio Inbox</a> to act on it.</p>`, 400);
  if (!isSupabaseConfigured()) return page('Unavailable', `<h1 class="err">Unavailable</h1><p>Storage isn’t configured.</p>`, 503);

  const r = await execute(p);
  return page(r.ok ? 'Done' : 'Failed', `
    <h1 class="${r.ok ? 'ok' : 'err'}">${r.ok ? '✓ Done' : '✗ Couldn’t complete'}</h1>
    <p>${r.message}</p>
    <p><a class="link" href="/studio">Open studio →</a></p>`);
}
