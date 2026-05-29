// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · LINKEDIN · publish
// Posts a text update to the configured author URN via LinkedIn's UGC API.
// Requires LINKEDIN_ACCESS_TOKEN (member token with w_member_social scope)
// and LINKEDIN_AUTHOR_URN (e.g. "urn:li:person:abcdef123").
//
// Setup:
//   1. Create an app at https://developer.linkedin.com → Products → request
//      "Share on LinkedIn" + "Sign In with LinkedIn using OpenID Connect"
//   2. Generate a member access token: developer tool → OAuth 2.0 token gen
//      → check scopes openid, profile, w_member_social → Generate
//   3. Copy the token → set LINKEDIN_ACCESS_TOKEN on Vercel
//   4. Grab author URN: GET https://api.linkedin.com/v2/userinfo with the
//      access token, take the `sub` field, prefix "urn:li:person:" → set as
//      LINKEDIN_AUTHOR_URN on Vercel
//
// Note: LinkedIn tokens expire after ~60 days for member tokens. For
// longer-lived, use Community Management API (requires approval).
// ─────────────────────────────────────────────────────────────────────────

const UGC_ENDPOINT = 'https://api.linkedin.com/v2/ugcPosts';

export type LinkedInPublishResult =
  | { ok: true; postId: string; postUrl: string }
  | { ok: false; error: string };

export function isLinkedInConfigured(): boolean {
  return Boolean(process.env.LINKEDIN_ACCESS_TOKEN && process.env.LINKEDIN_AUTHOR_URN);
}

export async function publishToLinkedIn(input: {
  body: string;
  visibility?: 'PUBLIC' | 'CONNECTIONS';
}): Promise<LinkedInPublishResult> {
  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  const author = process.env.LINKEDIN_AUTHOR_URN;
  if (!token || !author) {
    return { ok: false, error: 'linkedin-not-configured (set LINKEDIN_ACCESS_TOKEN + LINKEDIN_AUTHOR_URN)' };
  }
  if (!input.body || input.body.trim().length < 1) {
    return { ok: false, error: 'empty-body' };
  }
  if (input.body.length > 3000) {
    return { ok: false, error: 'body-exceeds-3000-chars' };
  }

  const payload = {
    author,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text: input.body },
        shareMediaCategory: 'NONE',
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': input.visibility ?? 'PUBLIC',
    },
  };

  const res = await fetch(UGC_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const detail = (await res.text()).slice(0, 400);
    return { ok: false, error: `linkedin-${res.status}: ${detail}` };
  }

  // LinkedIn returns the post URN in x-restli-id header (e.g. "urn:li:share:1234...")
  const postUrn = res.headers.get('x-restli-id') || '';
  const postId = postUrn.split(':').pop() || '';
  const postUrl = postUrn ? `https://www.linkedin.com/feed/update/${postUrn}/` : '';
  return { ok: true, postId, postUrl };
}
