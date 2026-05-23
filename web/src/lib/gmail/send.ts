// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · GMAIL · SEND
// Sends an outreach draft via the Gmail API using the signed-in admin's
// Gmail token (the same one wired for /inbox). The draft body becomes the
// email body, the draft subject becomes the subject, the recipient is
// supplied at send-time (admin can override per send).
// ─────────────────────────────────────────────────────────────────────────

import { getValidAccessToken } from '@/lib/google-gmail';

export type GmailSendResult =
  | { ok: true; messageId: string; threadId: string; from: string }
  | { ok: false; error: string };

type SendInput = {
  to: string;
  toName?: string;
  subject: string;
  bodyText: string;
  /** Optional: a unique identifier to prevent double-sends if the user
   *  clicks twice. Stored as the message's Message-Id header for dedup. */
  clientMessageId?: string;
};

// Build a minimal but valid RFC 5322 message. Gmail will fill in the
// rest (From header, Date, etc.) once it sees the token.
function buildRfc822(from: string, input: SendInput): string {
  const lines: string[] = [];
  lines.push(`From: ${from}`);
  lines.push(
    `To: ${input.toName ? `"${input.toName.replace(/"/g, "'")}" <${input.to}>` : input.to}`,
  );
  lines.push(`Subject: ${encodeSubject(input.subject)}`);
  lines.push('MIME-Version: 1.0');
  lines.push('Content-Type: text/plain; charset=UTF-8');
  lines.push('Content-Transfer-Encoding: 8bit');
  if (input.clientMessageId) {
    lines.push(`Message-Id: <${input.clientMessageId}@aiprosol.com>`);
  }
  lines.push(''); // blank line separates headers from body
  lines.push(input.bodyText);
  return lines.join('\r\n');
}

// RFC 2047 encode the subject if it has non-ASCII chars.
function encodeSubject(s: string): string {
  // eslint-disable-next-line no-control-regex
  if (/^[\x00-\x7F]*$/.test(s)) return s;
  const b64 = Buffer.from(s, 'utf-8').toString('base64');
  return `=?UTF-8?B?${b64}?=`;
}

// Gmail API expects base64url-encoded raw RFC 822.
function base64url(input: string): string {
  return Buffer.from(input, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function sendViaGmail(input: SendInput): Promise<GmailSendResult> {
  const ctx = await getValidAccessToken();
  if (!ctx) {
    return { ok: false, error: 'gmail-not-connected' };
  }

  const raw = buildRfc822(ctx.email, input);
  const encoded = base64url(raw);

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ctx.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: encoded }),
  });

  if (!res.ok) {
    const text = await res.text();
    return { ok: false, error: `Gmail HTTP ${res.status}: ${text.slice(0, 300)}` };
  }

  const json = (await res.json()) as { id?: string; threadId?: string };
  if (!json.id) {
    return { ok: false, error: 'Gmail API returned no message id' };
  }
  return {
    ok: true,
    messageId: json.id,
    threadId: json.threadId || json.id,
    from: ctx.email,
  };
}
