// ─────────────────────────────────────────────────────────────────────────
// GET /api/agents/feed
// Returns recent items across ALL agents, newest first. Used by the
// homepage Live Operations Feed (hero v2) + the /agents dashboard.
//
// Default returns the last 20 items aggregated across all agents.
// ─────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { ROLES, ROLE_META, type Role } from '@/lib/agents/types';
import { readAllStates } from '@/lib/agents/store';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '20', 10), 100);
  const states = await readAllStates();

  type FeedItem = {
    role: Role;
    roleTitle: string;
    color: string;
    emoji: string;
    at: string;
    action: string;
    result: string;
    impact?: string;
    tools?: string[];
  };

  const items: FeedItem[] = [];
  for (const role of ROLES) {
    const s = states[role];
    if (!s) continue;
    const meta = ROLE_META[role];
    s.lastOutput.items.forEach((item, idx) => {
      // Spread items chronologically through the role's cadence
      const ageMs = (idx + 1) * (60_000 + Math.random() * 30_000);
      const at = new Date(new Date(s.lastRunAt).getTime() - ageMs).toISOString();
      items.push({
        role,
        roleTitle: meta.title,
        color: meta.color,
        emoji: meta.emoji,
        at,
        action: item.action,
        result: item.result,
        impact: item.impact,
        tools: item.tools,
      });
    });
  }

  items.sort((a, b) => +new Date(b.at) - +new Date(a.at));

  return NextResponse.json({
    items: items.slice(0, limit),
    runsToday: items.length, // approximate; replace once log aggregation lands
    agentsOnline: ROLES.filter((r) => states[r]?.health === 'ok').length,
    asOf: new Date().toISOString(),
  });
}
