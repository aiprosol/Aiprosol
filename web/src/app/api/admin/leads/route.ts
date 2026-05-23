// GET /api/admin/leads
// Returns the most recent leads (and newsletter subscribers) for the admin
// dashboard. Auth: must have a session AND be in the admin allow-list.
//
// Without Vercel KV configured, this returns an empty list with a helpful
// `notice` field so the admin page can show a "wire up KV to see real data"
// state instead of looking broken.

import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface LeadRecord {
  leadId?: string;
  email?: string;
  fullName?: string;
  companyName?: string;
  industry?: string;
  monthlyRevenue?: string;
  source?: string;
  tier?: string;
  leadScore?: number;
  recommendedPlan?: string;
  annualSavingProjection?: number;
  capturedAt?: string;
}

interface SubscriberRecord {
  email?: string;
  source?: string;
  subscribedAt?: string;
}

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    return NextResponse.json({
      leads: [],
      subscribers: [],
      notice:
        'Vercel KV is not configured. Connect a KV store in the Vercel dashboard and set KV_REST_API_URL + KV_REST_API_TOKEN to see real data here.',
      configured: false,
    });
  }

  try {
    const auth = { Authorization: `Bearer ${token}` };

    // Scan the `lead:*` keys (UUID-suffixed) and `subscriber:*` keys (email-suffixed)
    const [leadKeysRes, subKeysRes] = await Promise.all([
      fetch(`${url}/keys/lead:*`, { headers: auth }),
      fetch(`${url}/keys/subscriber:*`, { headers: auth }),
    ]);
    const leadKeys: string[] = leadKeysRes.ok ? (await leadKeysRes.json()).result || [] : [];
    const subKeys: string[] = subKeysRes.ok ? (await subKeysRes.json()).result || [] : [];

    // Cap the result size to avoid blowing up the response
    const recentLeadKeys = leadKeys.slice(0, 100);
    const recentSubKeys = subKeys.slice(0, 100);

    // Fetch each record in parallel (cheap on KV; latency dominates)
    const leadPromises = recentLeadKeys.map(k =>
      fetch(`${url}/get/${encodeURIComponent(k)}`, { headers: auth })
        .then(r => r.ok ? r.json() : null)
        .then(j => (j?.result ? JSON.parse(j.result) as LeadRecord : null))
        .catch(() => null),
    );
    const subPromises = recentSubKeys.map(k =>
      fetch(`${url}/get/${encodeURIComponent(k)}`, { headers: auth })
        .then(r => r.ok ? r.json() : null)
        .then(j => (j?.result ? JSON.parse(j.result) as SubscriberRecord : null))
        .catch(() => null),
    );

    const [leadsRaw, subsRaw] = await Promise.all([
      Promise.all(leadPromises),
      Promise.all(subPromises),
    ]);
    const leads = leadsRaw.filter((x): x is LeadRecord => !!x);
    const subscribers = subsRaw.filter((x): x is SubscriberRecord => !!x);

    // Newest first by capturedAt / subscribedAt
    leads.sort((a, b) => (b.capturedAt || '').localeCompare(a.capturedAt || ''));
    subscribers.sort((a, b) => (b.subscribedAt || '').localeCompare(a.subscribedAt || ''));

    return NextResponse.json({
      leads,
      subscribers,
      counts: { leads: leads.length, subscribers: subscribers.length },
      configured: true,
    });
  } catch (err) {
    console.error('[admin/leads] error', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'admin-leads-failed' },
      { status: 500 },
    );
  }
}
