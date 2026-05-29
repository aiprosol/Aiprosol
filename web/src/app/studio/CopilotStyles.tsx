// Scoped styles for the floating Studio Copilot. `cp-*` namespace, matching the
// studio's dark-violet `st-*` aesthetic. Injected once by CopilotWidget.
export function CopilotStyles() {
  return <style dangerouslySetInnerHTML={{ __html: CSS }} />;
}

const CSS = `
.cp-fab {
  position: fixed; right: 20px; bottom: 20px; z-index: 60;
  display: flex; align-items: center; gap: 8px;
  padding: 12px 18px; border-radius: 999px; border: 1px solid rgba(139,92,246,0.5);
  background: linear-gradient(135deg, #7C3AED, #8B5CF6); color: #fff;
  font-family: 'Space Grotesk', system-ui, sans-serif; font-weight: 700; font-size: 13px;
  letter-spacing: 0.04em; cursor: pointer; box-shadow: 0 10px 30px rgba(124,58,237,0.45);
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}
.cp-fab:hover { transform: translateY(-1px); box-shadow: 0 14px 36px rgba(124,58,237,0.55); }
.cp-fab-dot { width: 8px; height: 8px; border-radius: 50%; background: #34D399; box-shadow: 0 0 8px #34D399; }

.cp-panel {
  position: fixed; right: 16px; bottom: 16px; z-index: 61;
  width: 400px; max-width: calc(100vw - 32px); height: min(680px, calc(100vh - 32px));
  display: flex; flex-direction: column;
  background: rgba(17, 11, 30, 0.98); backdrop-filter: blur(8px);
  border: 1px solid rgba(139,92,246,0.35); border-radius: 14px; overflow: hidden;
  box-shadow: 0 24px 70px rgba(0,0,0,0.6); color: #E5E7EB;
  font-family: ui-sans-serif, system-ui, sans-serif;
}
.cp-header { display: flex; align-items: center; gap: 8px; padding: 12px 14px; border-bottom: 1px solid rgba(148,163,184,0.15); }
.cp-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 14px; }
.cp-sub { font-size: 10px; color: #9CA3B5; letter-spacing: 0.04em; }
.cp-header-actions { margin-left: auto; display: flex; align-items: center; gap: 6px; }
.cp-iconbtn { background: rgba(148,163,184,0.1); border: 1px solid rgba(148,163,184,0.2); color: #C4B5FD; border-radius: 7px; padding: 5px 9px; font-size: 11px; cursor: pointer; }
.cp-iconbtn:hover { background: rgba(139,92,246,0.2); }

.cp-toggle { display: flex; gap: 4px; padding: 8px 14px; border-bottom: 1px solid rgba(148,163,184,0.12); }
.cp-toggle-btn { flex: 1; padding: 6px 8px; border-radius: 7px; font-size: 11px; font-weight: 600; cursor: pointer;
  border: 1px solid rgba(148,163,184,0.2); background: rgba(148,163,184,0.06); color: #9CA3B5; }
.cp-toggle-btn.is-active { background: rgba(139,92,246,0.22); border-color: rgba(139,92,246,0.55); color: #DDD6FE; }
.cp-toggle-btn:disabled { opacity: 0.35; cursor: not-allowed; }

.cp-body { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 12px; }
.cp-empty { margin: auto; text-align: center; color: #9CA3B5; font-size: 12px; line-height: 1.6; padding: 0 20px; }

.cp-msg { display: flex; flex-direction: column; gap: 4px; max-width: 92%; }
.cp-msg.user { align-self: flex-end; align-items: flex-end; }
.cp-msg.assistant { align-self: flex-start; align-items: flex-start; }
.cp-bubble { padding: 9px 12px; border-radius: 12px; font-size: 13px; line-height: 1.5; white-space: pre-wrap; word-break: break-word; }
.cp-msg.user .cp-bubble { background: rgba(139,92,246,0.25); border: 1px solid rgba(139,92,246,0.4); border-bottom-right-radius: 4px; }
.cp-msg.assistant .cp-bubble { background: rgba(148,163,184,0.1); border: 1px solid rgba(148,163,184,0.18); border-bottom-left-radius: 4px; }

.cp-events { display: flex; flex-direction: column; gap: 3px; margin-top: 2px; }
.cp-event { font-size: 10.5px; color: #9CA3B5; font-family: ui-monospace, monospace; }
.cp-event.ok { color: #6EE7B7; }
.cp-event.err { color: #FCA5A5; }

.cp-confirm { align-self: stretch; border: 1px solid rgba(245,158,11,0.5); background: rgba(245,158,11,0.08); border-radius: 10px; padding: 11px 12px; }
.cp-confirm-hdr { font-size: 11px; font-weight: 700; color: #FCD34D; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 6px; }
.cp-confirm-item { font-size: 12px; color: #FDE68A; margin: 3px 0; }
.cp-confirm-actions { display: flex; gap: 8px; margin-top: 10px; }
.cp-btn { padding: 7px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid transparent; }
.cp-btn-approve { background: #059669; color: #fff; }
.cp-btn-approve:hover { background: #047857; }
.cp-btn-reject { background: rgba(148,163,184,0.12); color: #E5E7EB; border-color: rgba(148,163,184,0.3); }
.cp-btn-reject:hover { background: rgba(248,113,113,0.18); }

.cp-footer { border-top: 1px solid rgba(148,163,184,0.15); padding: 10px 12px; }
.cp-input { width: 100%; resize: none; background: rgba(10,6,19,0.6); border: 1px solid rgba(148,163,184,0.22); border-radius: 9px;
  color: #E5E7EB; font-family: inherit; font-size: 13px; padding: 9px 11px; line-height: 1.4; }
.cp-input:focus { outline: none; border-color: rgba(139,92,246,0.6); }
.cp-input:disabled { opacity: 0.5; }
.cp-send-row { display: flex; align-items: center; justify-content: space-between; margin-top: 7px; }
.cp-hint { font-size: 10px; color: #6B7280; }
.cp-send { padding: 7px 16px; border-radius: 8px; background: #7C3AED; color: #fff; border: none; font-weight: 700; font-size: 12px; cursor: pointer; }
.cp-send:disabled { opacity: 0.45; cursor: not-allowed; }

.cp-typing { display: inline-flex; gap: 3px; }
.cp-typing span { width: 5px; height: 5px; border-radius: 50%; background: #A78BFA; animation: cp-blink 1.2s infinite both; }
.cp-typing span:nth-child(2) { animation-delay: 0.2s; }
.cp-typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes cp-blink { 0%, 80%, 100% { opacity: 0.3; } 40% { opacity: 1; } }

.cp-history { position: absolute; inset: 0; background: rgba(17,11,30,0.99); z-index: 5; display: flex; flex-direction: column; }
.cp-history-item { padding: 11px 14px; border-bottom: 1px solid rgba(148,163,184,0.1); cursor: pointer; font-size: 12.5px; }
.cp-history-item:hover { background: rgba(139,92,246,0.12); }
.cp-history-item .cp-sub { display: block; margin-top: 2px; }
`;
