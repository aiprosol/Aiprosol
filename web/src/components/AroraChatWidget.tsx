'use client';

import { useEffect, useRef, useState } from 'react';
import { Events, identify, track } from '@/lib/analytics';

// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · ARORA CHAT WIDGET (Next.js V3)
// Floating cyan orb bottom-right. Click to open the panel. Calls
// /api/arora-chat which proxies to Groq behind a hidden API key.
// Falls back to canned replies if the API errors.
// Session persisted in localStorage.
// ─────────────────────────────────────────────────────────────────────────

interface Msg { role: 'user' | 'assistant'; content: string; id: string; }

const SESSION_KEY = 'aiprosol_arora_session';
const HISTORY_KEY = 'aiprosol_arora_history';
const LEAD_KEY = 'aiprosol_arora_lead_captured';
const LEAD_TRIGGER_AFTER = 4;
const QUICK_PROMPTS = [
  'How much can I save?',
  'What should I automate first?',
  'Show me your pricing',
  "What's the ROI Audit?",
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

  useEffect(() => {
    if (messages.length === 0) return;
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-30))); } catch {}
  }, [messages]);

  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

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
    setOpen(o => {
      if (!o) track(Events.AroraChatOpened);
      return !o;
    });
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
    track(Events.AroraChatMessageSent, { length: msg.length, message_index: next.filter(m => m.role === 'user').length });

    const userMsgs = next.filter(m => m.role === 'user').length;
    const captured = typeof window !== 'undefined' && localStorage.getItem(LEAD_KEY) === '1';
    if (userMsgs === LEAD_TRIGGER_AFTER && !captured) {
      setTimeout(() => setShowLeadModal(true), 800);
    }

    let reply = '';
    try {
      const res = await fetch('/api/arora-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionRef.current,
          messages: next.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        reply = data.reply || '';
      }
    } catch {
      // fall through to default reply
    }

    if (!reply) {
      reply = "I'm having a brief connection issue — please email srijanpaudelofficial@gmail.com and we'll respond same day.";
    }

    setMessages(prev => [...prev, { role: 'assistant', id: newId(), content: reply }]);
    setLoading(false);
  };

  const submitLead = async () => {
    if (!leadEmail || !/\S+@\S+\.\S+/.test(leadEmail)) return;
    try { localStorage.setItem(LEAD_KEY, '1'); } catch {}
    // Best-effort lead capture via the canonical API
    try {
      const res = await fetch('/api/capture-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: leadName || 'Anonymous Chat Visitor',
          email: leadEmail,
          source: 'Arora Chat',
        }),
      });
      if (res.status === 401) {
        window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
      if (res.ok) {
        identify(leadEmail, { source: 'arora_chat', name: leadName || undefined });
      }
    } catch {}
    setShowLeadModal(false);
    setMessages(prev => [...prev, {
      role: 'assistant',
      id: newId(),
      content: `Thanks${leadName ? ' ' + leadName.split(' ')[0] : ''}! 🎉 I've passed your details across — expect a personal email within a few hours. What else can I help with?`,
    }]);
  };

  return (
    <>
      <div className="aw-launcher-wrap">
        {!open && (
          <button className="aw-launcher-pill" onClick={toggle} aria-label="Chat with Arora — AI CEO">
            <span className="aw-launcher-pulse" />
            <span className="aw-launcher-orb">A</span>
            <span className="aw-launcher-label">
              <strong>Ask Arora</strong>
              <span>AI CEO · Online</span>
            </span>
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
          <div className="aw-foot">Powered by <strong>Arora</strong> · Replies are not legal/financial advice</div>
        </div>
      )}

      {showLeadModal && (
        <div className="aw-modal" onClick={() => setShowLeadModal(false)}>
          <div className="aw-modal-card" onClick={e => e.stopPropagation()}>
            <h3>Stay in touch ✦</h3>
            <p>Drop your details and I&apos;ll send across the closest case study + a free automation audit. No spam, no hard sell.</p>
            <input type="text" placeholder="Your name" value={leadName} onChange={e => setLeadName(e.target.value)} />
            <input type="email" placeholder="Business email" value={leadEmail} onChange={e => setLeadEmail(e.target.value)} />
            <button className="aw-modal-submit" onClick={submitLead} disabled={!leadEmail}>Send me the audit →</button>
            <button className="aw-modal-skip" onClick={() => setShowLeadModal(false)}>Skip — keep chatting</button>
          </div>
        </div>
      )}

      <Styles />
    </>
  );
}

function Styles() {
  return (
    <style>{`
      .aw-launcher-wrap { position: fixed; bottom: 24px; right: 24px; z-index: 100; }
      .aw-launcher-pill { position: relative; padding: 12px 22px 12px 12px; background: linear-gradient(135deg, #8B5CF6, #C084FC); border: none; border-radius: 999px; cursor: pointer; box-shadow: 0 0 32px rgba(139, 92, 246, 0.45), 0 8px 24px rgba(0, 0, 0, 0.3); transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); display: inline-flex; align-items: center; gap: 12px; animation: aw-bounce 4s ease-in-out infinite; }
      .aw-launcher-pill:hover { transform: translateY(-2px) scale(1.03); }
      @keyframes aw-bounce {
        0%, 88%, 100% { transform: translateY(0); }
        92% { transform: translateY(-6px); }
        96% { transform: translateY(-2px); }
      }
      .aw-launcher-orb { width: 44px; height: 44px; border-radius: 50%; background: rgba(10, 22, 40, 0.92); border: 2px solid rgba(10, 22, 40, 0.4); display: inline-flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 22px; color: #8B5CF6; flex-shrink: 0; box-shadow: inset 0 0 12px rgba(139, 92, 246, 0.3); }
      .aw-launcher-label { display: flex; flex-direction: column; align-items: flex-start; line-height: 1.15; font-family: 'Space Grotesk', sans-serif; }
      .aw-launcher-label strong { font-size: 15px; font-weight: 800; color: #0A0613; letter-spacing: -0.01em; }
      .aw-launcher-label span { font-size: 10px; color: rgba(10, 22, 40, 0.65); font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; margin-top: 2px; }
      .aw-launcher-pulse { position: absolute; inset: 0; border-radius: 999px; background: rgba(139, 92, 246, 0.35); animation: aw-pulse 2.4s ease-out infinite; pointer-events: none; }
      @keyframes aw-pulse { 0% { transform: scale(1); opacity: 0.7; } 100% { transform: scale(1.25); opacity: 0; } }
      /* Mobile: collapse to a circular orb — the "Ask Arora · AI CEO · ONLINE"
         pill is too wide on phones and was covering form inputs on /roi-audit,
         /pricing, and /digital-products. Tap-target stays a comfortable 48px. */
      @media (max-width: 640px) {
        .aw-launcher-wrap { bottom: 18px; right: 18px; }
        .aw-launcher-pill { padding: 4px; gap: 0; border-radius: 50%; }
        .aw-launcher-orb { width: 48px; height: 48px; font-size: 22px; border-width: 2px; }
        .aw-launcher-label { display: none; }
      }
      @media (prefers-reduced-motion: reduce) {
        .aw-launcher-pill { animation: none; }
        .aw-launcher-pulse { animation: none; opacity: 0; }
      }

      .aw-panel { position: fixed; bottom: 24px; right: 24px; z-index: 100; width: 380px; max-width: calc(100vw - 32px); height: 580px; max-height: calc(100vh - 48px); background: #13101F; border: 1px solid #2A1F3D; border-radius: 18px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 32px rgba(139, 92, 246, 0.15); display: flex; flex-direction: column; animation: aw-panel-in 0.3s cubic-bezier(0.16, 1, 0.3, 1); font-family: 'Inter', system-ui, sans-serif; }
      @keyframes aw-panel-in { from { opacity: 0; transform: translateY(20px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }

      .aw-head { padding: 16px 18px; background: linear-gradient(135deg, rgba(139, 92, 246,0.08), rgba(192, 132, 252,0.04)); border-bottom: 1px solid rgba(139, 92, 246,0.2); display: flex; align-items: center; justify-content: space-between; gap: 12px; }
      .aw-head-id { display: flex; align-items: center; gap: 12px; }
      .aw-head-orb { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 16px; box-shadow: 0 0 14px rgba(139, 92, 246,0.35); }
      .aw-head-id strong { display: block; font-size: 14px; color: #E5E7EB; }
      .aw-head-id span { font-size: 11px; color: #10B981; display: flex; align-items: center; gap: 6px; }
      .aw-head-dot { width: 6px; height: 6px; background: #10B981; border-radius: 50%; box-shadow: 0 0 6px #10B981; animation: aw-blink 2s infinite; }
      @keyframes aw-blink { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
      .aw-head-close { width: 32px; height: 32px; background: transparent; border: 1px solid #2A1F3D; color: #9CA3B5; border-radius: 8px; cursor: pointer; font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 16px; transition: all 0.2s; }
      .aw-head-close:hover { border-color: #8B5CF6; color: #8B5CF6; }

      .aw-msgs { flex: 1; overflow-y: auto; padding: 18px; display: flex; flex-direction: column; gap: 12px; }
      .aw-msgs::-webkit-scrollbar { width: 4px; }
      .aw-msgs::-webkit-scrollbar-thumb { background: rgba(139, 92, 246,0.15); border-radius: 2px; }
      .aw-msg { display: flex; gap: 10px; animation: aw-msg-in 0.25s ease-out; }
      @keyframes aw-msg-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      .aw-msg-user { flex-direction: row-reverse; }
      .aw-msg-avatar { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 12px; flex-shrink: 0; box-shadow: 0 0 8px rgba(139, 92, 246,0.25); }
      .aw-bubble { max-width: 78%; padding: 10px 14px; border-radius: 14px; font-size: 13px; line-height: 1.55; }
      .aw-bubble p { margin: 0; }
      .aw-bubble p + p { margin-top: 8px; }
      .aw-msg-assistant .aw-bubble { background: #0A0613; border: 1px solid #2A1F3D; color: #E5E7EB; border-top-left-radius: 4px; }
      .aw-msg-user .aw-bubble { background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; font-weight: 500; border-top-right-radius: 4px; }
      .aw-typing { display: inline-flex; gap: 4px; align-items: center; }
      .aw-typing span { width: 6px; height: 6px; background: #8B5CF6; border-radius: 50%; animation: aw-bounce 1.4s infinite; }
      .aw-typing span:nth-child(2) { animation-delay: 0.2s; }
      .aw-typing span:nth-child(3) { animation-delay: 0.4s; }
      @keyframes aw-bounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-5px); opacity: 1; } }

      .aw-quick { padding: 0 18px 12px; display: flex; flex-wrap: wrap; gap: 6px; }
      .aw-quick-btn { padding: 6px 12px; background: transparent; border: 1px solid #2A1F3D; color: #8B5CF6; border-radius: 999px; font-size: 12px; cursor: pointer; transition: all 0.2s; font-family: 'Inter', system-ui, sans-serif; }
      .aw-quick-btn:hover { border-color: #8B5CF6; background: rgba(139, 92, 246,0.06); }

      .aw-input-row { padding: 12px 14px; border-top: 1px solid #2A1F3D; display: flex; gap: 8px; }
      .aw-input { flex: 1; padding: 10px 14px; background: #0A0613; border: 1px solid #2A1F3D; border-radius: 999px; color: #E5E7EB; font-size: 13px; outline: none; transition: border 0.2s; font-family: 'Inter', system-ui, sans-serif; }
      .aw-input:focus { border-color: #8B5CF6; box-shadow: 0 0 0 3px rgba(139, 92, 246,0.12); }
      .aw-input::placeholder { color: #4a6280; }
      .aw-send { width: 38px; height: 38px; background: linear-gradient(135deg, #8B5CF6, #C084FC); border: none; border-radius: 50%; color: #0A0613; cursor: pointer; font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 16px; transition: transform 0.2s; box-shadow: 0 0 12px rgba(139, 92, 246,0.25); }
      .aw-send:hover:not(:disabled) { transform: translateY(-1px); }
      .aw-send:disabled { opacity: 0.4; cursor: not-allowed; }

      .aw-foot { padding: 6px 14px 10px; font-size: 10px; color: #4a6280; text-align: center; }
      .aw-foot strong { color: #9CA3B5; }

      .aw-modal { position: fixed; inset: 0; z-index: 200; background: rgba(5, 14, 26, 0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; padding: 16px; animation: aw-modal-fade 0.25s ease-out; font-family: 'Inter', system-ui, sans-serif; }
      @keyframes aw-modal-fade { from { opacity: 0; } to { opacity: 1; } }
      .aw-modal-card { width: 360px; max-width: 100%; padding: 28px; background: #13101F; border: 1px solid rgba(139, 92, 246,0.4); border-radius: 18px; box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 32px rgba(139, 92, 246,0.2); animation: aw-card-in 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      @keyframes aw-card-in { from { opacity: 0; transform: translateY(10px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
      .aw-modal-card h3 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 22px; margin-bottom: 8px; color: #E5E7EB; }
      .aw-modal-card p { color: #9CA3B5; font-size: 13px; line-height: 1.6; margin-bottom: 20px; }
      .aw-modal-card input { width: 100%; padding: 11px 14px; background: #0A0613; border: 1px solid #2A1F3D; border-radius: 10px; color: #E5E7EB; font-size: 14px; outline: none; margin-bottom: 10px; font-family: 'Inter', system-ui, sans-serif; transition: border 0.2s; }
      .aw-modal-card input:focus { border-color: #8B5CF6; }
      .aw-modal-card input::placeholder { color: #4a6280; }
      .aw-modal-submit { width: 100%; padding: 12px; margin-top: 8px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border: none; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; cursor: pointer; box-shadow: 0 0 14px rgba(139, 92, 246,0.25); }
      .aw-modal-submit:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }
      .aw-modal-skip { width: 100%; padding: 8px; margin-top: 6px; background: transparent; color: #9CA3B5; border: none; font-size: 12px; cursor: pointer; font-family: 'Inter', system-ui, sans-serif; }
      .aw-modal-skip:hover { color: #E5E7EB; }
    `}</style>
  );
}

export default AroraChatWidget;
