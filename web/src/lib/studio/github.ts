// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · STUDIO — GitHub commit helper (edit-via-Git CMS)
// Reads/writes a file on `main` via the GitHub Contents API. A commit to main
// triggers the Vercel bridge → the change is live in ~70s. Needs GITHUB_TOKEN
// (a fine-grained PAT with Contents:read+write on the repo). GITHUB_REPO
// defaults to the live repo.
// ─────────────────────────────────────────────────────────────────────────

const REPO = process.env.GITHUB_REPO || 'aiprosol/Aiprosol';
const API = 'https://api.github.com';

export function isGithubConfigured(): boolean {
  return Boolean(process.env.GITHUB_TOKEN);
}

function headers() {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'User-Agent': 'aiprosol-studio',
  };
}

/** Fetch a file's current JSON content + blob sha from main. */
export async function getFileJson(path: string): Promise<{ json: unknown; sha: string } | null> {
  if (!process.env.GITHUB_TOKEN) return null;
  try {
    const res = await fetch(`${API}/repos/${REPO}/contents/${encodeURIComponent(path)}?ref=main`, { headers: headers() });
    if (!res.ok) return null;
    const j = (await res.json()) as { content?: string; sha?: string };
    if (!j.content || !j.sha) return null;
    const decoded = Buffer.from(j.content, 'base64').toString('utf8');
    return { json: JSON.parse(decoded), sha: j.sha };
  } catch {
    return null;
  }
}

/** Commit (create/update) a file on main. */
export async function commitFile(path: string, content: string, message: string, sha?: string): Promise<{ ok: boolean; sha?: string; error?: string }> {
  if (!process.env.GITHUB_TOKEN) return { ok: false, error: 'github-not-configured' };
  try {
    const res = await fetch(`${API}/repos/${REPO}/contents/${encodeURIComponent(path)}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({
        message,
        content: Buffer.from(content, 'utf8').toString('base64'),
        branch: 'main',
        ...(sha ? { sha } : {}),
      }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      return { ok: false, error: `github-${res.status}: ${t.slice(0, 200)}` };
    }
    const j = (await res.json()) as { commit?: { sha?: string } };
    return { ok: true, sha: j.commit?.sha };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'commit-failed' };
  }
}
