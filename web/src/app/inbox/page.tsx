// ─────────────────────────────────────────────────────────────────────────
// /inbox · Arora Inbox · Founder's Inbox Triage Agent (Week 1 scaffold)
//
// Server component. Reads the Gmail token cookie and:
//   • if NOT connected → shows "Connect Gmail" CTA pointing at /api/agent/google/start
//   • if connected     → shows account email + the 10 most-recent INBOX subjects
//                        fetched via /api/agent/gmail/list
//
// Week 2 adds: classification, draft generation, daily cron, beta-founder seats.
// ─────────────────────────────────────────────────────────────────────────

import { headers } from 'next/headers';
import Link from 'next/link';
import { getGmailTokens, isGmailOAuthEnabled } from '@/lib/google-gmail';

export const dynamic = 'force-dynamic';      // never cache — depends on cookie

interface GmailMessage {
  id: string;
  from: string;
  subject: string;
  date: string;
  snippet: string;
  unread: boolean;
}

async function fetchInbox(): Promise<{ email: string; messages: GmailMessage[] } | null> {
  const hdrs = await headers();
  const host = hdrs.get('host') || 'localhost:3000';
  const proto = hdrs.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https');
  const cookie = hdrs.get('cookie') || '';

  const res = await fetch(`${proto}://${host}/api/agent/gmail/list?max=10`, {
    headers: { cookie },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const json = await res.json();
  if (!json.connected) return null;
  return { email: json.email, messages: json.messages };
}

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; disconnected?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const enabled = isGmailOAuthEnabled();
  const tokens = enabled ? await getGmailTokens() : null;
  const data = tokens ? await fetchInbox() : null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-10">
        <p className="text-xs font-display font-bold uppercase tracking-[0.18em] text-cyan mb-2">
          ▸ Arora Inbox · beta
        </p>
        <h1 className="text-4xl font-display font-bold mb-3">Founder's Inbox Triage</h1>
        <p className="text-muted leading-relaxed">
          Connect your Gmail and Arora reads your inbox every morning, classifies what
          matters, and drafts replies for you to approve. Nothing sends without your click.
        </p>
      </div>

      {sp.error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-300">
          Auth error: <code>{sp.error}</code>. Try again or contact support.
        </div>
      )}
      {sp.disconnected && (
        <div className="mb-6 rounded-xl border border-border bg-card p-4 text-sm text-muted">
          Disconnected. Token cleared from this device.
        </div>
      )}

      {!enabled && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-muted">
            Gmail OAuth not configured. Set <code>GOOGLE_OAUTH_CLIENT_ID</code> and{' '}
            <code>GOOGLE_OAUTH_CLIENT_SECRET</code> in your environment.
          </p>
        </div>
      )}

      {enabled && !tokens && (
        <div className="rounded-2xl border border-cyan/30 bg-gradient-to-br from-card to-card-up p-8 text-center">
          <p className="text-muted mb-6">
            Beta is currently invite-only. You must be added as a test user in the
            Aiprosol Google Cloud project to authorize.
          </p>
          <Link
            href="/api/agent/google/start?next=/inbox"
            className="inline-block rounded-xl bg-cyan px-6 py-3 font-display font-bold text-sm uppercase tracking-[0.1em] text-bg hover:opacity-90 transition"
          >
            Connect Gmail →
          </Link>
          <p className="mt-4 text-xs text-muted">
            Scopes: read messages · create drafts. We never send without your tap.
          </p>
        </div>
      )}

      {enabled && tokens && (
        <div>
          <div className="mb-6 flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-muted">Connected as</p>
              <p className="font-display font-bold text-cyan">{tokens.email}</p>
            </div>
            <form action="/api/agent/google/disconnect" method="post">
              <button className="text-xs font-display font-bold uppercase tracking-[0.1em] text-muted hover:text-red-400 transition">
                Disconnect
              </button>
            </form>
          </div>

          {!data && (
            <p className="text-muted text-sm">Fetching inbox…</p>
          )}

          {data && data.messages.length === 0 && (
            <p className="text-muted text-sm">Inbox empty (or all archived).</p>
          )}

          {data && data.messages.length > 0 && (
            <div className="space-y-2">
              <p className="mb-3 text-xs uppercase tracking-[0.12em] text-muted">
                Last {data.messages.length} messages · raw view · classification arrives in Week 2
              </p>
              {data.messages.map(m => (
                <div
                  key={m.id}
                  className={`rounded-xl border p-4 transition ${
                    m.unread ? 'border-cyan/30 bg-card-up' : 'border-border bg-card'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-3 mb-1">
                    <p className="font-display font-bold text-sm truncate" title={m.from}>
                      {m.from || '(no sender)'}
                    </p>
                    <p className="shrink-0 text-xs text-muted">{m.date}</p>
                  </div>
                  <p className="text-sm mb-1 truncate" title={m.subject}>
                    {m.subject || '(no subject)'}
                  </p>
                  <p className="text-xs text-muted line-clamp-2">{m.snippet}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
