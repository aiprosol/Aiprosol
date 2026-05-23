// ─────────────────────────────────────────────────────────────────────────
// POST /api/arora-chat — Groq proxy for the Arora chat widget
// Replaces backend/aroraChat.web.js. Hides the API key behind the server,
// validates inputs, falls back to canned replies if Groq is down or
// the API key isn't configured.
// ─────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ARORA_SYSTEM_PROMPT, fallbackReply, detectIntent } from '@/lib/arora-prompt';
import { getAroraGrounding } from '@/lib/arora-grounding';

// Node runtime so the grounding helper can query Supabase via the
// admin client. The visitor-perceived latency is identical — Groq's
// response time dominates, the runtime overhead is single-digit ms.
export const runtime = 'nodejs';

const ChatSchema = z.object({
  sessionId: z.string().max(100).optional(),
  visitorEmail: z.string().email().max(200).optional(),
  visitorName: z.string().max(120).optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(40),
});

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
// llama-3.3-70b-versatile is materially smarter than the old 8b model
// while still fast on Groq (sub-second first-token). Override via GROQ_MODEL.
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ChatSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid chat payload', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { messages } = parsed.data;
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMsg) {
      return NextResponse.json(
        { reply: 'Hi! What can I help you with?' },
        { status: 200 },
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      // Backend not configured — graceful degrade to canned replies.
      return NextResponse.json({
        reply: fallbackReply(lastUserMsg.content),
        mode: 'fallback',
        intent: detectIntent(messages),
      });
    }

    const model = process.env.GROQ_MODEL || DEFAULT_MODEL;

    // Live grounding — small Supabase digest cached for 60s. Failures here
    // never break the chat; the function returns a fallback string.
    const grounding = await getAroraGrounding();

    const groqRes = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: ARORA_SYSTEM_PROMPT },
          { role: 'system', content: grounding },
          ...messages,
        ],
        max_tokens: 900,
        temperature: 0.55,
        top_p: 0.9,
        frequency_penalty: 0.2,   // discourages the model from repeating itself in a single reply
        presence_penalty: 0.1,
      }),
    });

    if (!groqRes.ok) {
      const txt = await groqRes.text();
      console.warn('[arora-chat] Groq error', groqRes.status, txt.slice(0, 200));
      return NextResponse.json({
        reply: fallbackReply(lastUserMsg.content),
        mode: 'fallback',
        error: `groq-${groqRes.status}`,
        intent: detectIntent(messages),
      });
    }

    const data = (await groqRes.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const reply =
      data?.choices?.[0]?.message?.content?.trim() ||
      fallbackReply(lastUserMsg.content);

    return NextResponse.json(
      {
        reply,
        mode: 'groq',
        model,
        intent: detectIntent(messages),
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (err) {
    console.error('[arora-chat] error', err);
    return NextResponse.json(
      {
        reply: 'Connection issue — please email srijanpaudelofficial@gmail.com and we will respond same day.',
        error: err instanceof Error ? err.message : 'unknown',
      },
      { status: 200 }, // 200 so the widget still shows the reply
    );
  }
}
