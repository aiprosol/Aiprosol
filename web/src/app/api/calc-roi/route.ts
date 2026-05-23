// ─────────────────────────────────────────────────────────────────────────
// POST /api/calc-roi — server-side ROI engine
// Replaces backend/calcROI.web.js from the Wix V2 build.
// Pure compute · no DB writes · no auth required.
// ─────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { calcROI } from '@/lib/calc-roi';

export const runtime = 'edge';

const Schema = z.object({
  employees: z.union([z.number(), z.string()]).optional(),
  manualHoursPerWeek: z.union([z.number(), z.string()]).optional(),
  hourlyCost: z.union([z.number(), z.string()]).optional(),
  monthlyRevenue: z.string().optional(),
  industry: z.string().optional(),
  primaryChallenge: z.string().optional(),
  automationExperience: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const result = calcROI(parsed.data);
    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to calculate ROI' },
      { status: 500 },
    );
  }
}
