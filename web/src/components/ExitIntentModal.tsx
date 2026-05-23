'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Events, identify, track } from '@/lib/analytics';

// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · EXIT-INTENT MODAL (Next.js V3)
// Once-per-session · 8s arming delay · skipped on form-heavy routes ·
// touch-device guard. Captures email via /api/capture-lead.
// ─────────────────────────────────────────────────────────────────────────

const SESSION_KEY = 'aiprosol_exit_intent_shown';
const TRIGGER_DELAY_MS = 8000;
const TOP_THRESHOLD = 30;
const ROUTE_BLACKLIST = ['/roi-audit', '/checkout', '/contact'];

export function ExitIntentModal() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (ROUTE_BLACKLIST.some(p => pathname?.startsWith(p))) return;
    if (sessionStorage.getItem(SESSION_KEY) === '1') return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let armedAt = Date.now() + TRIGGER_DELAY_MS;

    const onLeave = (e: MouseEvent) => {
      if (Date.now() < armedAt) return;
      if (sessionStorage.getItem(SESSION_KEY) === '1') return;
      if (e.clientY <= TOP_THRESHOLD && e.relatedTarget === null) {
        sessionStorage.setItem(SESSION_KEY, '1');
        setShow(true);
        track(Events.ExitIntentShown, { path: pathname || '/' });
      }
    };

    document.addEventListener('mouseleave', onLeave);
    return () => document.removeEventListener('mouseleave', onLeave);
  }, [pathname]);

  const close = () => {
    if (!done) track(Events.ExitIntentDismissed, { path: pathname || '/' });
    setShow(false);
  };

  const submit = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/capture-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || 'Anonymous Exit-Intent',
          email,
          source: 'Exit Intent',
        }),
      });
      if (res.status === 401) {
        window.location.href = `/login?next=${encodeURIComponent(pathname || '/')}`;
        return;
      }
      if (res.ok) {
        identify(email, { source: 'exit_intent', name: name || undefined });
        track(Events.ExitIntentConverted, { path: pathname || '/' });
      }
    } catch (err) {
      console.error('Exit-intent capture failed', err);
    }
    setDone(true);
    setSubmitting(false);
    setTimeout(() => setShow(false), 2400);
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
              Drop your email and I&apos;ll send you the free 60-second ROI Audit, plus the closest
              case study to your situation. No call, no pitch — just the numbers.
            </p>
            <div className="ei-form">
              <input type="text" placeholder="Your name (optional)" value={name} onChange={e => setName(e.target.value)} disabled={submitting} />
              <input type="email" placeholder="Business email" value={email} onChange={e => setEmail(e.target.value)} disabled={submitting} autoFocus onKeyDown={e => e.key === 'Enter' && submit()} />
              <button className="ei-submit" onClick={submit} disabled={submitting || !email}>
                {submitting ? 'Sending…' : 'Send me the ROI Audit →'}
              </button>
            </div>
            <div className="ei-trust">✓ No spam · ✓ No call required · ✓ Reply STOP and I&apos;ll never email again</div>
            <button className="ei-skip" onClick={close}>Maybe later</button>
          </>
        ) : (
          <div className="ei-done">
            <div className="ei-check">✓</div>
            <h3>You&apos;re in.</h3>
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
      .ei-overlay { position: fixed; inset: 0; z-index: 250; background: rgba(5, 14, 26, 0.85); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; padding: 20px; animation: ei-fade 0.3s ease-out; font-family: 'Inter', system-ui, sans-serif; }
      @keyframes ei-fade { from { opacity: 0; } to { opacity: 1; } }
      .ei-card { position: relative; width: 460px; max-width: 100%; padding: 36px 32px; background: #13101F; border: 1px solid rgba(139, 92, 246,0.35); border-radius: 22px; box-shadow: 0 30px 80px rgba(0,0,0,0.7), 0 0 48px rgba(139, 92, 246,0.18); animation: ei-card-in 0.4s cubic-bezier(0.16, 1, 0.3, 1); color: #E5E7EB; overflow: hidden; }
      @keyframes ei-card-in { from { opacity: 0; transform: translateY(20px) scale(0.94); } to { opacity: 1; transform: translateY(0) scale(1); } }
      .ei-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, #8B5CF6, #C084FC, #8B5CF6, transparent); animation: ei-shine 3s linear infinite; }
      @keyframes ei-shine { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
      .ei-close { position: absolute; top: 14px; right: 14px; width: 32px; height: 32px; background: transparent; border: 1px solid rgba(30, 58, 95, 0.6); color: #9CA3B5; border-radius: 8px; cursor: pointer; font-size: 20px; line-height: 1; transition: all 0.2s; }
      .ei-close:hover { border-color: #8B5CF6; color: #8B5CF6; }
      .ei-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 999px; color: #F59E0B; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 16px; }
      .ei-h2 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(24px, 3vw, 30px); line-height: 1.15; margin-bottom: 12px; }
      .ei-grad { background: linear-gradient(135deg, #8B5CF6, #C084FC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .ei-sub { color: #9CA3B5; font-size: 14px; line-height: 1.65; margin-bottom: 22px; }
      .ei-form { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
      .ei-form input { width: 100%; padding: 12px 14px; background: #0A0613; border: 1px solid #2A1F3D; border-radius: 10px; color: #E5E7EB; font-size: 14px; outline: none; transition: all 0.2s; font-family: 'Inter', system-ui, sans-serif; }
      .ei-form input:focus { border-color: #8B5CF6; box-shadow: 0 0 0 3px rgba(139, 92, 246,0.15); }
      .ei-form input::placeholder { color: #4a6280; }
      .ei-submit { padding: 13px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border: none; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 14px; cursor: pointer; box-shadow: 0 0 24px rgba(139, 92, 246,0.3); transition: transform 0.2s; margin-top: 4px; }
      .ei-submit:hover:not(:disabled) { transform: translateY(-2px); }
      .ei-submit:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }
      .ei-trust { font-size: 11px; color: #9CA3B5; text-align: center; margin-bottom: 12px; }
      .ei-skip { width: 100%; padding: 8px; background: transparent; color: #4a6280; border: none; font-size: 12px; cursor: pointer; font-family: 'Inter', system-ui, sans-serif; transition: color 0.2s; }
      .ei-skip:hover { color: #9CA3B5; }
      .ei-done { text-align: center; padding: 16px 0; }
      .ei-check { width: 56px; height: 56px; margin: 0 auto 16px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 28px; box-shadow: 0 0 24px rgba(139, 92, 246,0.4); animation: ei-check-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
      @keyframes ei-check-in { from { transform: scale(0); } to { transform: scale(1); } }
      .ei-done h3 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 24px; margin-bottom: 8px; }
      .ei-done p { color: #9CA3B5; font-size: 14px; line-height: 1.6; }
    `}</style>
  );
}

export default ExitIntentModal;
