'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CopilotStyles } from './CopilotStyles';

// ─────────────────────────────────────────────────────────────────────────
// Floating Studio Copilot — the operator's personal assistant. Overlays every
// studio tab. Talks to /api/assistant/chat (switchable Claude/Groq, tool-use)
// and calls refresh() after any action that mutates studio data.
// ─────────────────────────────────────────────────────────────────────────

type ProviderId = 'anthropic' | 'groq';
type PendingAction = { toolCallId: string; name: string; args: Record<string, unknown>; preview: string };
type ToolEvent = { name: string; ok: boolean; summary: string };
type UIMsg = { role: 'user' | 'assistant'; content: string; toolEvents?: ToolEvent[] };
type ConvSummary = { id: string; title: string | null; provider: string; updatedAt: string };

const PROVIDER_LABEL: Record<ProviderId, string> = { anthropic: 'Claude', groq: 'Groq' };

export function CopilotWidget({ refresh, operatorEmail }: { refresh: () => void; operatorEmail: string }) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [available, setAvailable] = useState<ProviderId[]>([]);
  const [provider, setProvider] = useState<ProviderId>('anthropic');
  const [messages, setMessages] = useState<UIMsg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<PendingAction[] | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConvSummary[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const loadConversationsList = useCallback(async () => {
    try {
      const res = await fetch('/api/assistant/conversations');
      const data = await res.json();
      if (data.ok) {
        setConversations(data.conversations ?? []);
        const ids: ProviderId[] = (data.providers ?? []).map((p: { id: ProviderId }) => p.id);
        setAvailable(ids);
        setProvider((cur) => (ids.includes(cur) ? cur : ids[0] ?? 'anthropic'));
      }
    } catch {
      /* leave defaults */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (open && !loaded) void loadConversationsList();
  }, [open, loaded, loadConversationsList]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading, pending]);

  const maybeRefresh = useCallback(
    (events?: ToolEvent[]) => {
      if (events?.some((e) => e.ok && e.name !== 'query_studio')) refresh();
    },
    [refresh],
  );

  function applyResponse(data: {
    conversationId?: string;
    kind?: string;
    text?: string;
    pending?: PendingAction[];
    toolEvents?: ToolEvent[];
    error?: string;
  }, ok: boolean) {
    if (!ok || data.error) {
      const detail = data.error === 'provider-unavailable' ? `${PROVIDER_LABEL[provider]} isn't configured.` : data.error || 'Something went wrong.';
      setMessages((m) => [...m, { role: 'assistant', content: `⚠ ${detail}` }]);
      return;
    }
    if (data.conversationId) setConversationId(data.conversationId);
    setMessages((m) => [...m, { role: 'assistant', content: data.text || '(no response)', toolEvents: data.toolEvents }]);
    setPending(data.kind === 'pending_confirmation' ? data.pending ?? null : null);
    maybeRefresh(data.toolEvents);
  }

  async function send() {
    const text = input.trim();
    if (!text || loading || pending) return;
    setInput('');
    setError(null);
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setLoading(true);
    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, message: text, conversationId }),
      });
      applyResponse(await res.json(), res.ok);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: '⚠ Connection error.' }]);
    }
    setLoading(false);
  }

  async function resolve(approved: boolean) {
    if (!pending || !conversationId || loading) return;
    const decisions = pending.map((p) => ({ toolCallId: p.toolCallId, approved }));
    setPending(null);
    setLoading(true);
    setMessages((m) => [...m, { role: 'user', content: approved ? '✓ Approved' : '✗ Declined' }]);
    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, conversationId, resume: { decisions } }),
      });
      applyResponse(await res.json(), res.ok);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: '⚠ Connection error.' }]);
    }
    setLoading(false);
  }

  function newChat() {
    setMessages([]);
    setConversationId(null);
    setPending(null);
    setError(null);
    setHistoryOpen(false);
  }

  async function loadConversation(id: string) {
    setHistoryOpen(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/assistant/conversations/${id}`);
      const data = await res.json();
      if (data.ok) {
        setMessages((data.messages ?? []).map((m: UIMsg) => ({ role: m.role, content: m.content, toolEvents: m.toolEvents })));
        setConversationId(id);
        setPending(data.pending ?? null);
      }
    } catch {
      /* ignore */
    }
    setLoading(false);
  }

  if (!open) {
    return (
      <>
        <button className="cp-fab" onClick={() => setOpen(true)} aria-label="Open Copilot">
          <span className="cp-fab-dot" /> Copilot
        </button>
        <CopilotStyles />
      </>
    );
  }

  const noProviders = loaded && available.length === 0;

  return (
    <div className="cp-panel" role="dialog" aria-label="Studio Copilot">
      <div className="cp-header">
        <div>
          <div className="cp-title">Copilot</div>
          <div className="cp-sub">{operatorEmail}</div>
        </div>
        <div className="cp-header-actions">
          <button className="cp-iconbtn" onClick={() => { void loadConversationsList(); setHistoryOpen(true); }} title="History">History</button>
          <button className="cp-iconbtn" onClick={newChat} title="New chat">+ New</button>
          <button className="cp-iconbtn" onClick={() => setOpen(false)} title="Close">✕</button>
        </div>
      </div>

      <div className="cp-toggle">
        {(['anthropic', 'groq'] as ProviderId[]).map((id) => (
          <button
            key={id}
            className={`cp-toggle-btn ${provider === id ? 'is-active' : ''}`}
            disabled={loaded && !available.includes(id)}
            onClick={() => setProvider(id)}
            title={loaded && !available.includes(id) ? 'Not configured' : `Use ${PROVIDER_LABEL[id]}`}
          >
            {PROVIDER_LABEL[id]}
          </button>
        ))}
      </div>

      <div className="cp-body" ref={bodyRef}>
        {noProviders ? (
          <div className="cp-empty">No model configured. Set <code>ANTHROPIC_API_KEY</code> or <code>GROQ_API_KEY</code> to enable Copilot.</div>
        ) : messages.length === 0 && !loading ? (
          <div className="cp-empty">
            Ask me anything about the studio, or tell me to do something —
            create a task, check leads, trigger an agent, draft &amp; send outreach.
            <br /><br />Outward actions (publish, send) always ask you to confirm first.
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`cp-msg ${m.role}`}>
              <div className="cp-bubble">{m.content}</div>
              {m.toolEvents && m.toolEvents.length > 0 && (
                <div className="cp-events">
                  {m.toolEvents.map((e, j) => (
                    <div key={j} className={`cp-event ${e.ok ? 'ok' : 'err'}`}>
                      {e.ok ? '✓' : '×'} {e.name}: {e.summary}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}

        {pending && pending.length > 0 && (
          <div className="cp-confirm">
            <div className="cp-confirm-hdr">Confirm action{pending.length > 1 ? 's' : ''}</div>
            {pending.map((p) => (
              <div key={p.toolCallId} className="cp-confirm-item">→ {p.preview}</div>
            ))}
            <div className="cp-confirm-actions">
              <button className="cp-btn cp-btn-approve" onClick={() => resolve(true)} disabled={loading}>Approve</button>
              <button className="cp-btn cp-btn-reject" onClick={() => resolve(false)} disabled={loading}>Reject</button>
            </div>
          </div>
        )}

        {loading && (
          <div className="cp-msg assistant">
            <div className="cp-bubble">
              <span className="cp-typing"><span /><span /><span /></span>
            </div>
          </div>
        )}
      </div>

      <div className="cp-footer">
        <textarea
          className="cp-input"
          rows={2}
          placeholder={pending ? 'Resolve the action above first…' : 'Message Copilot…'}
          value={input}
          disabled={loading || !!pending || noProviders}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
        />
        <div className="cp-send-row">
          <span className="cp-hint">{error ? error : 'Enter to send · Shift+Enter for newline'}</span>
          <button className="cp-send" onClick={() => void send()} disabled={loading || !input.trim() || !!pending || noProviders}>
            Send
          </button>
        </div>
      </div>

      {historyOpen && (
        <div className="cp-history">
          <div className="cp-header">
            <div className="cp-title">Conversations</div>
            <div className="cp-header-actions">
              <button className="cp-iconbtn" onClick={() => setHistoryOpen(false)}>✕</button>
            </div>
          </div>
          <div className="cp-body">
            {conversations.length === 0 ? (
              <div className="cp-empty">No saved conversations yet.</div>
            ) : (
              conversations.map((c) => (
                <div key={c.id} className="cp-history-item" onClick={() => void loadConversation(c.id)}>
                  {c.title || 'Untitled'}
                  <span className="cp-sub">{PROVIDER_LABEL[(c.provider as ProviderId)] ?? c.provider} · {new Date(c.updatedAt).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <CopilotStyles />
    </div>
  );
}
