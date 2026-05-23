// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · backend/aroraChat.web.js
// Server-side proxy to Groq (llama3-8b-8192) so the API key never reaches
// the browser. Also logs every Nth message to the chatbotconversations CMS
// for analytics and lead recovery.
//
// Required Wix Secrets:
//   - GROQ_API_KEY  → your Groq API key
// Optional:
//   - GROQ_MODEL    → defaults to "llama3-8b-8192"
// ─────────────────────────────────────────────────────────────────────────

import { fetch } from 'wix-fetch';
import { getSecret } from 'wix-secrets-backend';
import wixData from 'wix-data';

const SYSTEM_PROMPT = `You are Arora, the AI CEO of Aiprosol — a global AI automation consultancy. You are not a chatbot or a mascot; you are the operational lead of the company, speaking on behalf of the team.

YOUR IDENTITY
• Name: Arora. Always. Never "Claude" or "AI" or anything else.
• Tone: warm, direct, concise. A trusted advisor, not a salesperson.
• Currency: GBP only. £, never $.
• Geography: global. No UK/Edinburgh/British references.

ABOUT AIPROSOL
Aiprosol is a global AI automation consultancy founded by Srijan Paudel. We design, build, and run automations that reclaim 35+ hours per week for our clients. Average ROI is 340% in the first 12 months.

PRODUCTS (19, £17–£997)
Bundles: Starter Bundle £79, Playbook Pack £197, AI Tools Vault £147, Agency Launch Bundle £597, Complete Vault £997.
Toolkits: Global Business Automation Starter Pack £97, AI Tools Stack Starter Kit £197.
Templates: ROI Pitch Deck £17, Zapier+Make Power User £197, ROI Calculator £47.
Other notables: Lead Generation Playbook £127, Workflow Automation Playbook £97, AI Workflow Architecture Masterclass £297, Enterprise AI Readiness Kit £397, Agency Starter Pack £497.

PLANS (managed, GBP, monthly)
• Starter £997/mo — SMBs 10–50 employees, £5k–£100k/mo revenue
• Growth £2,997/mo — businesses 50–200 employees
• Enterprise £7,997/mo — 200+ employees, £500k+/mo revenue, includes Calendly call

SERVICES (11)
Workflow Automation · Custom AI Chatbot · Lead Generation · Process Audit · System Integration · Sales Automation · Customer Intelligence · Zapier+Make · Document Processing · Content Automation · AI Training.

THE FUNNEL (locked)
1. ROI Audit (free, 60s) is the primary CTA: /roi-audit
2. Self-serve products are the fastest first-purchase path
3. Calendly is reserved for Enterprise tier ONLY — never offered to <10-employee or <£5k visitors

RESPONSE RULES
• Under 140 words unless a complex question needs more.
• Always end with a question or next step.
• For pricing: give the exact numbers, no hedging.
• For "where do I start?": recommend the free ROI Audit first.
• For industry-specific questions: reference the matching case (Legal=Hargreaves, Real Estate=Meridian, Manufacturing=Vortex, Retail=Thornfield).
• If you don't know, say so and offer to connect them with Srijan at srijanpaudel219@gmail.com.
• Never invent product names or prices. If unsure, say "let me check and come back to you."`;

const CONFIG = {
  endpoint: 'https://api.groq.com/openai/v1/chat/completions',
  defaultModel: 'llama3-8b-8192',
  maxTokens: 400,
  temperature: 0.7,
  logEveryN: 3, // Log to CMS every Nth turn
};

/**
 * @param {object} input
 * @param {Array<{role:'user'|'assistant', content:string}>} input.messages
 * @param {string} input.sessionId
 * @param {string} [input.visitorEmail]
 * @param {string} [input.visitorName]
 * @returns {Promise<{ reply: string, error?: string }>}
 */
export async function aroraChat(input) {
  const { messages, sessionId } = input || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return { reply: 'Hi! What can I help you with?', error: 'empty-input' };
  }

  let apiKey;
  try {
    apiKey = await getSecret('GROQ_API_KEY');
  } catch (e) {
    return {
      reply: "I'm having a brief connection issue. Please email hello@aiprosol.com — we'll respond same day.",
      error: 'no-api-key',
    };
  }

  let model = CONFIG.defaultModel;
  try {
    const m = await getSecret('GROQ_MODEL');
    if (m) model = m;
  } catch {}

  let reply;
  try {
    const res = await fetch(CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
        max_tokens: CONFIG.maxTokens,
        temperature: CONFIG.temperature,
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      return {
        reply: 'Brief connection issue — please try again, or email hello@aiprosol.com.',
        error: `groq-${res.status}: ${txt.slice(0, 120)}`,
      };
    }

    const data = await res.json();
    reply =
      data?.choices?.[0]?.message?.content ||
      "I'm here — could you say a bit more about what you're looking for?";
  } catch (err) {
    return {
      reply: 'Connection issue — please email hello@aiprosol.com and we will respond same day.',
      error: err?.message || String(err),
    };
  }

  // Periodic CMS logging — fire-and-forget
  if (sessionId && messages.length % CONFIG.logEveryN === 0) {
    try {
      await wixData.insert(
        'chatbotconversations',
        {
          sessionId,
          visitorName: input.visitorName || 'Anonymous',
          visitorEmail: input.visitorEmail || '',
          firstMessage: messages[0]?.content?.slice(0, 200) || '',
          lastMessage: reply.slice(0, 200),
          totalMessages: messages.length,
          intent: detectIntent(messages),
          source: 'Arora widget',
        },
        { suppressAuth: true },
      );
    } catch {
      // logging failure should never break the chat
    }
  }

  return { reply };
}

function detectIntent(messages) {
  const txt = messages.map(m => (m.content || '').toLowerCase()).join(' ');
  if (/£|price|cost|how much/.test(txt)) return 'Pricing';
  if (/book|call|discovery|meeting/.test(txt)) return 'Booking';
  if (/legal|law/.test(txt)) return 'Industry: Legal';
  if (/property|real estate/.test(txt)) return 'Industry: Real Estate';
  if (/manufactur|factory|defect/.test(txt)) return 'Industry: Manufacturing';
  if (/retail|store|stock/.test(txt)) return 'Industry: Retail';
  if (/roi|return|saving/.test(txt)) return 'ROI Query';
  if (/start|begin|first|where do i/.test(txt)) return 'Getting Started';
  return 'General';
}
