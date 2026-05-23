// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · EXIT-INTENT MODAL
// Phase 4.3 · fires once per session when the user moves cursor toward the
// top of the viewport (suggesting tab close / address bar). Captures email
// for the ROI Audit. Writes to `leads` via captureLead backend, falls back
// to the existing createDataItem path.
// ─────────────────────────────────────────────────────────────────────────

import { items } from '@wix/data';
import { useWixModules } from '@wix/sdk-react';
import { useEffect, useState } from 'react';

let captureLeadFn: any = null;
try {
  // @ts-ignore — Wix Vibe resolves at runtime
  captureLeadFn = require('backend/captureLead.web').captureLead;
} catch {}

const SESSION_KEY = 'aiprosol_exit_intent_shown';
const TRIGGER_DELAY_MS = 8000;       // Don't fire in the first 8s on page
const TOP_THRESHOLD = 30;            // Px from top edge to count as exit
const ROUTE_BLACKLIST = ['/roi-audit', '/checkout', '/contact'];

export function ExitIntentModal() {
  const { createDataItem } = useWixModules(items);
  const [show, setShow] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Don't trigger on form-heavy pages where users are mid-flow
    if (ROUTE_BLACKLIST.some(p => window.location.pathname.startsWith(p))) return;

    // Once-per-session guard
    if (sessionStorage.getItem(SESSION_KEY) === '1') return;

    // Don't trigger on touch devices (mouse-leave is unreliable)
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let armedAt = 0;
    const arm = () => { armedAt = Date.now() + TRIGGER_DELAY_MS; };
    arm();

    const onLeave = (e: MouseEvent) => {
      if (Date.now() < armedAt) return;
      if (sessionStorage.getItem(SESSION_KEY) === '1') return;
      if (e.clientY <= TOP_THRESHOLD && e.relatedTarget === null) {
        sessionStorage.setItem(SESSION_KEY, '1');
        setShow(true);
      }
    };

    document.addEventListener('mouseleave', onLeave);
    return () => document.removeEventListener('mouseleave', onLeave);
  }, []);

  const close = () => setShow(false);

  const submit = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) return;
    setSubmitting(true);

    const payload = {
      name: name || 'Anonymous Exit-Intent',
      email,
      source: 'Exit Intent',
      industry: '',
      employees: 0,
    };

    try {
      if (captureLeadFn) {
        await captureLeadFn(payload);
      } else {
        await createDataItem({
          dataCollectionId: 'leads',
          dataItem: {
            data: {
              fullName: payload.name,
              email: payload.email,
              leadStatus: 'New Lead — Exit Intent',
              leadScore: 25,
            },
          },
          options: { suppressAuth: true },
        });
      }
      setDone(true);
      setTimeout(() => setShow(false), 2400);
    } catch (err) {
      console.error('Exit-intent capture failed', err);
      // Still show success — never penalise the user for our infra
      setDone(true);
      setTimeout(() => setShow(false), 2400);
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="ei-overlay" onClick={close}>
      <div className="ei-card" onClick={e => e.stopPropagation()}>
        <button className="ei-close" onClick={close} aria-label="Close">×</button>

        {!done ? (
          <>
            <div className="ei-eyebrow">Wait — before you go</div>
            <h2 className="ei-h2">
              Get your <span className="ei-grad">ROI number</span> in 60 seconds
            </h2>
            <p className="ei-sub">
              Drop your email and I'll send you the free 60-second ROI Audit, plus the closest
              case study to your situation. No call, no pitch — just the numbers.
            </p>

            <div className="ei-form">
              <input
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={submitting}
              />
              <input
                type="email"
                placeholder="Business email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={submitting}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && submit()}
              />
              <button
                className="ei-submit"
                onClick={submit}
                disabled={submitting || !email}
              >
                {submitting ? 'Sending…' : 'Send me the ROI Audit →'}
              </button>
            </div>

            <div className="ei-trust">
              ✓ No spam · ✓ No call required · ✓ Reply STOP and I'll never email again
            </div>

            <button className="ei-skip" onClick={close}>Maybe later</button>
          </>
        ) : (
          <div className="ei-done">
            <div className="ei-check">✓</div>
            <h3>You're in.</h3>
            <p>The audit link is on its way to {email}. Check your inbox in the next minute or two.</p>
          </div>
        )}
      </div>
      <Styles />
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      .ei-overlay { position: fixed; inset: 0; z-index: 250; background: rgba(5, 14, 26, 0.85); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; padding: 20px; animation: ei-fade 0.3s ease-out; font-family: 'DM Sans', system-ui, sans-serif; }
      @keyframes ei-fade { from { opacity: 0; } to { opacity: 1; } }

      .ei-card { position: relative; width: 460px; max-width: 100%; padding: 36px 32px; background: #0D1F3C; border: 1px solid rgba(0,212,255,0.35); border-radius: 22px; box-shadow: 0 30px 80px rgba(0,0,0,0.7), 0 0 48px rgba(0,212,255,0.18); animation: ei-card-in 0.4s cubic-bezier(0.16, 1, 0.3, 1); color: #D4E8F7; overflow: hidden; }
      @keyframes ei-card-in { from { opacity: 0; transform: translateY(20px) scale(0.94); } to { opacity: 1; transform: translateY(0) scale(1); } }
      .ei-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, #00D4FF, #00FFE5, #00D4FF, transparent); animation: ei-shine 3s linear infinite; }
      @keyframes ei-shine { from { transform: translateX(-100%); } to { transform: translateX(100%); } }

      .ei-close { position: absolute; top: 14px; right: 14px; width: 32px; height: 32px; background: transparent; border: 1px solid rgba(30, 58, 95, 0.6); color: #8899AA; border-radius: 8px; cursor: pointer; font-size: 20px; line-height: 1; transition: all 0.2s; }
      .ei-close:hover { border-color: #00D4FF; color: #00D4FF; }

      .ei-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 999px; color: #F59E0B; font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 16px; }
      .ei-h2 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(24px, 3vw, 30px); line-height: 1.15; margin-bottom: 12px; }
      .ei-grad { background: linear-gradient(135deg, #00D4FF, #00FFE5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .ei-sub { color: #8899AA; font-size: 14px; line-height: 1.65; margin-bottom: 22px; }

      .ei-form { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
      .ei-form input { width: 100%; padding: 12px 14px; background: #0A1628; border: 1px solid #1E3A5F; border-radius: 10px; color: #D4E8F7; font-size: 14px; outline: none; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
      .ei-form input:focus { border-color: #00D4FF; box-shadow: 0 0 0 3px rgba(0,212,255,0.15); }
      .ei-form input::placeholder { color: #4a6280; }
      .ei-submit { padding: 13px; background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628; border: none; border-radius: 10px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; cursor: pointer; box-shadow: 0 0 24px rgba(0,212,255,0.3); transition: transform 0.2s; margin-top: 4px; }
      .ei-submit:hover:not(:disabled) { transform: translateY(-2px); }
      .ei-submit:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }

      .ei-trust { font-size: 11px; color: #8899AA; text-align: center; margin-bottom: 12px; }
      .ei-skip { width: 100%; padding: 8px; background: transparent; color: #4a6280; border: none; font-size: 12px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: color 0.2s; }
      .ei-skip:hover { color: #8899AA; }

      .ei-done { text-align: center; padding: 16px 0; }
      .ei-check { width: 56px; height: 56px; margin: 0 auto 16px; background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; box-shadow: 0 0 24px rgba(0,212,255,0.4); animation: ei-check-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
      @keyframes ei-check-in { from { transform: scale(0); } to { transform: scale(1); } }
      .ei-done h3 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 24px; margin-bottom: 8px; }
      .ei-done p { color: #8899AA; font-size: 14px; line-height: 1.6; }
    `}</style>
  );
}

export default ExitIntentModal;
