// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · STUDIO — conversion funnel (PostHog read-back)
// Events are fired client-side via src/lib/analytics.ts. This reads them back
// server-side through the PostHog Query API (HogQL) so the studio can show the
// funnel. Needs POSTHOG_API_KEY (personal) + POSTHOG_PROJECT_ID; degrades to a
// "configure" notice otherwise. 5-min in-module cache.
// ─────────────────────────────────────────────────────────────────────────

const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';

// Ordered funnel stages → the Events catalogue names (analytics.ts).
const STAGES: Array<{ event: string; label: string }> = [
  { event: '$pageview', label: 'Visits' },
  { event: 'roi_audit_started', label: 'ROI audit started' },
  { event: 'roi_audit_submitted', label: 'ROI audit submitted' },
  { event: 'product_viewed', label: 'Product viewed' },
  { event: 'product_checkout_clicked', label: 'Checkout clicked' },
  { event: 'checkout_session_created', label: 'Checkout started' },
];

export type FunnelData =
  | { configured: false }
  | {
      configured: true;
      windowDays: number;
      stages: Array<{ event: string; label: string; count: number }>;
      topPages: Array<{ path: string; views: number }>;
      fetchedAt: string;
    };

export function isFunnelConfigured(): boolean {
  return Boolean(process.env.POSTHOG_API_KEY && process.env.POSTHOG_PROJECT_ID);
}

let CACHE: { fetchedAt: number; data: FunnelData } | null = null;
const TTL_MS = 5 * 60_000;

async function hogql(query: string): Promise<unknown[][]> {
  const key = process.env.POSTHOG_API_KEY;
  const projectId = process.env.POSTHOG_PROJECT_ID;
  const res = await fetch(`${HOST}/api/projects/${projectId}/query/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: { kind: 'HogQLQuery', query } }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`posthog-${res.status}: ${txt.slice(0, 200)}`);
  }
  const json = (await res.json()) as { results?: unknown[][] };
  return json.results ?? [];
}

export async function getFunnel(windowDays = 7): Promise<FunnelData> {
  if (!isFunnelConfigured()) return { configured: false };
  if (CACHE && Date.now() - CACHE.fetchedAt < TTL_MS && CACHE.data.configured && CACHE.data.windowDays === windowDays) {
    return CACHE.data;
  }
  const eventList = STAGES.map((s) => `'${s.event}'`).join(', ');
  const [stageRows, pageRows] = await Promise.all([
    hogql(
      `SELECT event, count() AS c FROM events
       WHERE timestamp >= now() - INTERVAL ${windowDays} DAY AND event IN (${eventList})
       GROUP BY event`,
    ),
    hogql(
      `SELECT properties.$pathname AS path, count() AS c FROM events
       WHERE event = '$pageview' AND timestamp >= now() - INTERVAL ${windowDays} DAY
       GROUP BY path ORDER BY c DESC LIMIT 10`,
    ),
  ]);

  const counts = new Map<string, number>();
  for (const row of stageRows) counts.set(String(row[0]), Number(row[1]) || 0);

  const data: FunnelData = {
    configured: true,
    windowDays,
    stages: STAGES.map((s) => ({ event: s.event, label: s.label, count: counts.get(s.event) ?? 0 })),
    topPages: pageRows.map((r) => ({ path: String(r[0] ?? '/'), views: Number(r[1]) || 0 })),
    fetchedAt: new Date().toISOString(),
  };
  CACHE = { fetchedAt: Date.now(), data };
  return data;
}
