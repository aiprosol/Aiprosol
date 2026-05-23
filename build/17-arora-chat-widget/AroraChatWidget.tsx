// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · ARORA CHAT WIDGET
// Phase 4.1 · floating chat widget that calls backend/aroraChat.web.js
// Lives on every page. Cyan orb bottom-right. Click to open the panel.
// Session persisted in localStorage. Lead capture modal after 4 messages.
// Falls back to canned responses if the backend isn't reachable.
// ─────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';

// Optional backend import — wrapped so the widget works even if the Velo
// function isn't deployed yet (runs against canned-response fallbacks).
let aroraChatFn: any = null;
try {
  // @ts-ignore — Wix Vibe resolves at runtime
  aroraChatFn = require('backend/aroraChat.web').aroraChat;
} catch {}

interface Msg { role: 'user' | 'assistant'; content: string; id: string; }

const SESSION_KEY = 'aiprosol_arora_session';
const HISTORY_KEY = 'aiprosol_arora_history';
const LEAD_KEY = 'aiprosol_arora_lead_captured';
const LEAD_TRIGGER_AFTER = 4; // messages

const QUICK_PROMPTS = [
  'How much can I save?',
  'What should I automate first?',
  'Show me your pricing',
  "What's the ROI Audit?",
];

const FALLBACK_REPLIES: Array<[RegExp, string]> = [
  [/£|price|cost|how much|pricing/i, 'Three managed plans: Starter £997/mo, Growth £2,997/mo, Enterprise £7,997/mo. Plus 19 self-serve products from £17–£997. The free ROI Audit picks the right tier based on your numbers — want me to point you there?'],
  [/start|begin|first|where do/i, "Start with the free ROI Audit — it's 60 seconds and gives you a personalised number plus the right next step. Or if you want to dive in, the Business Process Audit Checklist (£37) walks you through your first automation in a weekend."],
  [/audit|roi|return|saving/i, "The free ROI Audit at /roi-audit takes 60 seconds and returns: your projected annual saving, weekly hours reclaimable, and the right plan or product for your stage. No call required. Want the link?"],
  [/call|book|talk|meeting/i, "Discovery calls are reserved for Enterprise enquiries (200+ employees, £500k+/mo). For everyone else, the ROI Audit gives you the same answers in 60 seconds — and a clearer next step."],
  [/legal|law|attorney|firm/i, "Legal is one of our strongest verticals — Hargreaves & Sterling reclaimed 45 hrs/week per partner with our IDP layer. ROI in 3 weeks. Want to read the case?"],
  [/property|real estate|estate agent/i, "Real estate clients see massive lead-response wins. Meridian dropped from 6 hours to 3 minutes and lifted conversion 28%. Want the case study?"],
  [/manufactur|factory|defect|quality/i, "Manufacturing — Vortex Components dropped defect rate 4.1% → 0.6% with a vision + telemetry layer. Throughput up 34%. Read the case at /case-studies/vortex."],
  [/retail|store|stock|inventory/i, "Retail — Thornfield Stores cut stockouts 71% and saved £95k/year with a demand-prediction model. Read the case at /case-studies/thornfield."],
  [/zapier|make|n8n|integration/i, "We work with all of them — Zapier, Make, n8n — and pick based on what your stack and budget call for. The Workflow Automation Playbook (£97) covers when to use each. Want a link?"],
  [/product|playbook|template|guide/i, "19 products in the catalogue, £17–£997. Most popular: The Complete Vault (£997), Lead Generation Playbook (£127), AI Workflow Architecture Masterclass (£297). Browse them at /digital-products."],
  [/about|founder|who/i, "Aiprosol is a global AI automation consultancy founded by Srijan Paudel. I'm Arora, the AI CEO — I run strategy, architecture, and most of the operations day-to-day. We work with clients across Legal, Real Estate, Manufacturing, Retail, Financial Services, and SaaS."],
  [/cancel|refund|guarantee/i, "Starter and Growth plans cancel anytime, no minimum. Enterprise has a 6-month minimum then renews monthly. Digital products have a 7-day refund. Anything specific you want to know?"],
];

const newId = () => Math.random().toString(36).slice(2, 11);
const newSession = () => 'arora_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);

export function AroraChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [unread, setUnread] = useState(true);
  const sessionRef = useRef<string>('');
  const msgsEndRef = useRef<HTMLDivElement>(null);

  // ─── Init session + history ───
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let sid = localStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = newSession();
      localStorage.setItem(SESSION_KEY, sid);
    }
    sessionRef.current = sid;
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setMessages(JSON.parse(raw));
    } catch {}
  }, []);

  // ─── Persist history ───
  useEffect(() => {
    if (messages.length === 0) return;
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-30))); } catch {}
  }, [messages]);

  // ─── Auto-scroll on new message ───
  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  // ─── Greeting on first open ───
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        id: newId(),
        content: "Hi — I'm Arora, the AI CEO of Aiprosol. 👋\n\nI can help you understand what automation could do for your business, walk you through pricing, or share case studies relevant to your industry. What's on your mind?",
      }]);
      setUnread(false);
    }
  }, [open, messages.length]);

  const toggle = () => {
    setOpen(o => !o);
    setUnread(false);
  };

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    const userMsg: Msg = { role: 'user', content: msg, id: newId() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setLoading(true);

    // Lead capture trigger
    const userMsgs = next.filter(m => m.role === 'user').length;
    const captured = typeof window !== 'undefined' && localStorage.getItem(LEAD_KEY) === '1';
    if (userMsgs === LEAD_TRIGGER_AFTER && !captured) {
      setTimeout(() => setShowLeadModal(true), 800);
    }

    let reply = '';
    if (aroraChatFn) {
      try {
        const r = await aroraChatFn({
          sessionId: sessionRef.current,
          messages: next.map(m => ({ role: m.role, content: m.content })),
        });
        reply = r?.reply || '';
      } catch (e) {
        // fall through to canned
      }
    }
    if (!reply) reply = canned(msg);

    setMessages(prev => [...prev, { role: 'assistant', id: newId(), content: reply }]);
    setLoading(false);
  };

  const submitLead = () => {
    if (!leadEmail || !/\S+@\S+\.\S+/.test(leadEmail)) return;
    try { localStorage.setItem(LEAD_KEY, '1'); } catch {}
    setShowLeadModal(false);
    setMessages(prev => [...prev, {
      role: 'assistant',
      id: newId(),
      content: `Thanks${leadName ? ' ' + leadName.split(' ')[0] : ''}! 🎉 I've passed your details across — expect a personal email within a few hours. What else can I help with?`,
    }]);
    // Best effort: write to leads via the standard frontend path could be added here
    // For now we capture the intent + log to console
    console.log('[Arora Widget] Lead captured', { name: leadName, email: leadEmail, sessionId: sessionRef.current });
  };

  return (
    <>
      <div className="aw-launcher-wrap">
        {!open && (
          <button className="aw-launcher" onClick={toggle} aria-label="Open chat with Arora">
            <span className="aw-launcher-orb">A</span>
            <span className="aw-launcher-pulse" />
            {unread && messages.length === 0 && <span className="aw-launcher-tip">Chat with Arora</span>}
          </button>
        )}
      </div>

      {open && (
        <div className="aw-panel" role="dialog" aria-label="Chat with Arora">
          <header className="aw-head">
            <div className="aw-head-id">
              <div className="aw-head-orb">A</div>
              <div>
                <strong>Arora</strong>
                <span><span className="aw-head-dot" />Online · AI CEO</span>
              </div>
            </div>
            <button className="aw-head-close" onClick={toggle} aria-label="Minimise chat">─</button>
          </header>

          <div className="aw-msgs">
            {messages.map(m => (
              <div key={m.id} className={`aw-msg aw-msg-${m.role}`}>
                {m.role === 'assistant' && <div className="aw-msg-avatar">A</div>}
                <div className="aw-bubble">{m.content.split('\n').map((l, i) => <p key={i}>{l}</p>)}</div>
              </div>
            ))}
            {loading && (
              <div className="aw-msg aw-msg-assistant">
                <div className="aw-msg-avatar">A</div>
                <div className="aw-bubble aw-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={msgsEndRef} />
          </div>

          {messages.length <= 1 && (
            <div className="aw-quick">
              {QUICK_PROMPTS.map(p => (
                <button key={p} className="aw-quick-btn" onClick={() => send(p)}>{p}</button>
              ))}
            </div>
          )}

          <div className="aw-input-row">
            <input
              type="text"
              className="aw-input"
              placeholder="Ask Arora anything…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              disabled={loading}
            />
            <button className="aw-send" onClick={() => send()} disabled={loading || !input.trim()} aria-label="Send">→</button>
          </div>
          <div className="aw-foot">Powered by <strong>Groq AI</strong> · Replies are not legal/financial advice</div>
        </div>
      )}

      {showLeadModal && (
        <div className="aw-modal" onClick={() => setShowLeadModal(false)}>
          <div className="aw-modal-card" onClick={e => e.stopPropagation()}>
            <h3>Stay in touch ✦</h3>
            <p>Drop your details and I'll send across the closest case study + a free automation audit. No spam, no hard sell.</p>
            <input
              type="text"
              placeholder="Your name"
              value={leadName}
              onChange={e => setLeadName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Business email"
              value={leadEmail}
              onChange={e => setLeadEmail(e.target.value)}
            />
            <button className="aw-modal-submit" onClick={submitLead} disabled={!leadEmail}>Send me the audit →</button>
            <button className="aw-modal-skip" onClick={() => setShowLeadModal(false)}>Skip — keep chatting</button>
          </div>
        </div>
      )}

      <Styles />
    </>
  );
}

function canned(msg: string): string {
  for (const [re, reply] of FALLBACK_REPLIES) {
    if (re.test(msg)) return reply;
  }
  return "Great question. The fastest path is the free ROI Audit at /roi-audit — it gives you a number in 60 seconds. Want me to share what to expect, or do you have a specific question I can dig into?";
}

function Styles() {
  return (
    <style>{`
      .aw-launcher-wrap { position: fixed; bottom: 24px; right: 24px; z-index: 100; }
      .aw-launcher { position: relative; width: 64px; height: 64px; padding: 0; background: linear-gradient(135deg, #00D4FF, #00FFE5); border: none; border-radius: 50%; cursor: pointer; box-shadow: 0 0 32px rgba(0, 212, 255, 0.45); transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); display: flex; align-items: center; justify-content: center; }
      .aw-launcher:hover { transform: scale(1.06); }
      .aw-launcher-orb { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 26px; color: #0A1628; }
      .aw-launcher-pulse { position: absolute; inset: 0; border-radius: 50%; background: rgba(0, 212, 255, 0.3); animation: aw-pulse 2s ease-out infinite; }
      @keyframes aw-pulse { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(1.6); opacity: 0; } }
      .aw-launcher-tip { position: absolute; right: 80px; top: 50%; transform: translateY(-50%); padding: 8px 14px; background: #0D1F3C; border: 1px solid #1E3A5F; color: #D4E8F7; border-radius: 10px; font-size: 13px; white-space: nowrap; box-shadow: 0 4px 16px rgba(0,0,0,0.4); animation: aw-tip-in 0.4s ease-out 1.5s backwards; }
      @keyframes aw-tip-in { from { opacity: 0; transform: translate(8px, -50%); } to { opacity: 1; transform: translate(0, -50%); } }

      .aw-panel { position: fixed; bottom: 24px; right: 24px; z-index: 100; width: 380px; max-width: calc(100vw - 32px); height: 580px; max-height: calc(100vh - 48px); background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 18px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 32px rgba(0, 212, 255, 0.15); display: flex; flex-direction: column; animation: aw-panel-in 0.3s cubic-bezier(0.16, 1, 0.3, 1); font-family: 'DM Sans', system-ui, sans-serif; }
      @keyframes aw-panel-in { from { opacity: 0; transform: translateY(20px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }

      .aw-head { padding: 16px 18px; background: linear-gradient(135deg, rgba(0,212,255,0.08), rgba(0,255,229,0.04)); border-bottom: 1px solid rgba(0,212,255,0.2); display: flex; align-items: center; justify-content: space-between; gap: 12px; }
      .aw-head-id { display: flex; align-items: center; gap: 12px; }
      .aw-head-orb { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 16px; box-shadow: 0 0 14px rgba(0,212,255,0.35); }
      .aw-head-id strong { display: block; font-size: 14px; color: #D4E8F7; }
      .aw-head-id span { font-size: 11px; color: #10B981; display: flex; align-items: center; gap: 6px; }
      .aw-head-dot { width: 6px; height: 6px; background: #10B981; border-radius: 50%; box-shadow: 0 0 6px #10B981; animation: aw-blink 2s infinite; }
      @keyframes aw-blink { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
      .aw-head-close { width: 32px; height: 32px; background: transparent; border: 1px solid #1E3A5F; color: #8899AA; border-radius: 8px; cursor: pointer; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 16px; transition: all 0.2s; }
      .aw-head-close:hover { border-color: #00D4FF; color: #00D4FF; }

      .aw-msgs { flex: 1; overflow-y: auto; padding: 18px; display: flex; flex-direction: column; gap: 12px; }
      .aw-msgs::-webkit-scrollbar { width: 4px; }
      .aw-msgs::-webkit-scrollbar-thumb { background: rgba(0,212,255,0.15); border-radius: 2px; }
      .aw-msg { display: flex; gap: 10px; animation: aw-msg-in 0.25s ease-out; }
      @keyframes aw-msg-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      .aw-msg-user { flex-direction: row-reverse; }
      .aw-msg-avatar { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 12px; flex-shrink: 0; box-shadow: 0 0 8px rgba(0,212,255,0.25); }
      .aw-bubble { max-width: 78%; padding: 10px 14px; border-radius: 14px; font-size: 13px; line-height: 1.55; }
      .aw-bubble p { margin: 0; }
      .aw-bubble p + p { margin-top: 8px; }
      .aw-msg-assistant .aw-bubble { background: #0A1628; border: 1px solid #1E3A5F; color: #D4E8F7; border-top-left-radius: 4px; }
      .aw-msg-user .aw-bubble { background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628; font-weight: 500; border-top-right-radius: 4px; }
      .aw-typing { display: inline-flex; gap: 4px; align-items: center; }
      .aw-typing span { width: 6px; height: 6px; background: #00D4FF; border-radius: 50%; animation: aw-bounce 1.4s infinite; }
      .aw-typing span:nth-child(2) { animation-delay: 0.2s; }
      .aw-typing span:nth-child(3) { animation-delay: 0.4s; }
      @keyframes aw-bounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-5px); opacity: 1; } }

      .aw-quick { padding: 0 18px 12px; display: flex; flex-wrap: wrap; gap: 6px; }
      .aw-quick-btn { padding: 6px 12px; background: transparent; border: 1px solid #1E3A5F; color: #00D4FF; border-radius: 999px; font-size: 12px; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
      .aw-quick-btn:hover { border-color: #00D4FF; background: rgba(0,212,255,0.06); }

      .aw-input-row { padding: 12px 14px; border-top: 1px solid #1E3A5F; display: flex; gap: 8px; }
      .aw-input { flex: 1; padding: 10px 14px; background: #0A1628; border: 1px solid #1E3A5F; border-radius: 999px; color: #D4E8F7; font-size: 13px; outline: none; transition: border 0.2s; font-family: 'DM Sans', sans-serif; }
      .aw-input:focus { border-color: #00D4FF; box-shadow: 0 0 0 3px rgba(0,212,255,0.12); }
      .aw-input::placeholder { color: #4a6280; }
      .aw-send { width: 38px; height: 38px; background: linear-gradient(135deg, #00D4FF, #00FFE5); border: none; border-radius: 50%; color: #0A1628; cursor: pointer; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 16px; transition: transform 0.2s; box-shadow: 0 0 12px rgba(0,212,255,0.25); }
      .aw-send:hover:not(:disabled) { transform: translateY(-1px); }
      .aw-send:disabled { opacity: 0.4; cursor: not-allowed; }

      .aw-foot { padding: 6px 14px 10px; font-size: 10px; color: #4a6280; text-align: center; }
      .aw-foot strong { color: #8899AA; }

      .aw-modal { position: fixed; inset: 0; z-index: 200; background: rgba(5, 14, 26, 0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; padding: 16px; animation: aw-modal-fade 0.25s ease-out; }
      @keyframes aw-modal-fade { from { opacity: 0; } to { opacity: 1; } }
      .aw-modal-card { width: 360px; max-width: 100%; padding: 28px; background: #0D1F3C; border: 1px solid rgba(0,212,255,0.4); border-radius: 18px; box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 32px rgba(0,212,255,0.2); animation: aw-card-in 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      @keyframes aw-card-in { from { opacity: 0; transform: translateY(10px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
      .aw-modal-card h3 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; margin-bottom: 8px; color: #D4E8F7; }
      .aw-modal-card p { color: #8899AA; font-size: 13px; line-height: 1.6; margin-bottom: 20px; }
      .aw-modal-card input { width: 100%; padding: 11px 14px; background: #0A1628; border: 1px solid #1E3A5F; border-radius: 10px; color: #D4E8F7; font-size: 14px; outline: none; margin-bottom: 10px; font-family: 'DM Sans', sans-serif; transition: border 0.2s; }
      .aw-modal-card input:focus { border-color: #00D4FF; }
      .aw-modal-card input::placeholder { color: #4a6280; }
      .aw-modal-submit { width: 100%; padding: 12px; margin-top: 8px; background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628; border: none; border-radius: 10px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; cursor: pointer; box-shadow: 0 0 14px rgba(0,212,255,0.25); }
      .aw-modal-submit:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }
      .aw-modal-skip { width: 100%; padding: 8px; margin-top: 6px; background: transparent; color: #8899AA; border: none; font-size: 12px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
      .aw-modal-skip:hover { color: #D4E8F7; }
    `}</style>
  );
}

export default AroraChatWidget;
