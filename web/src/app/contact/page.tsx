'use client';

import { useState } from 'react';
import Link from 'next/link';
import { InlineSpinner } from '@/components/AnimatedLogo';

// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · CONTACT · /contact
// Lightweight form that POSTs to /api/capture-lead with source: "Contact".
// Self-serve first so the primary CTA still pushes toward the ROI Audit.
// ─────────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!name || !/\S+@\S+\.\S+/.test(email)) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/capture-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          company,
          primaryChallenge: message,
          source: 'Contact',
        }),
      });
      if (res.status === 401) {
        window.location.href = `/login?next=${encodeURIComponent('/contact')}`;
        return;
      }
    } catch (err) {
      console.error('Contact submission failed', err);
    }
    setDone(true);
    setSubmitting(false);
  };

  return (
    <div className="ct-page">
      <header className="ct-hero">
        <div className="ct-eyebrow">Get in touch</div>
        <h1 className="ct-h1">
          Talk to <span className="ct-grad">Arora</span> directly
        </h1>
        <p className="ct-sub">
          Most questions get answered fastest by the chat widget bottom-right or the free 60-second
          ROI Audit. If you&apos;d rather email, drop a line below — Srijan will personally reply
          within 24 hours.
        </p>
      </header>

      <div className="ct-grid">
        <div className="ct-shortcuts">
          <Link href="/roi-audit" className="ct-shortcut">
            <div className="ct-shortcut-icon">⚡</div>
            <h3>Run the free ROI Audit</h3>
            <p>60 seconds. Personalised number. The fastest path to whatever you came here for.</p>
            <span className="ct-shortcut-link">Run audit →</span>
          </Link>
          <Link href="/faqs" className="ct-shortcut">
            <div className="ct-shortcut-icon">❓</div>
            <h3>Browse FAQs</h3>
            <p>21 questions answered straight. Pricing, onboarding, security, billing.</p>
            <span className="ct-shortcut-link">View FAQs →</span>
          </Link>
          <a href="https://calendly.com/srijanpaudel219/30min" target="_blank" rel="noopener noreferrer" className="ct-shortcut">
            <div className="ct-shortcut-icon">📅</div>
            <h3>Book a strategy call</h3>
            <p>Reserved for Enterprise enquiries (200+ employees · $500k+/mo). 30 minutes.</p>
            <span className="ct-shortcut-link">Open Calendly →</span>
          </a>
        </div>

        <div className="ct-form-wrap">
          <h2 className="ct-form-title">Or send a message</h2>
          {done ? (
            <div className="ct-done">
              <div className="ct-check">✓</div>
              <h3>Message received</h3>
              <p>Srijan will reply personally within 24 hours. If it&apos;s urgent, the chat widget bottom-right is faster.</p>
            </div>
          ) : (
            <div className="ct-form">
              <div className="ct-row">
                <div className="ct-field">
                  <label>Your name *</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Sarah Johnson" />
                </div>
                <div className="ct-field">
                  <label>Email *</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="sarah@company.com" />
                </div>
              </div>
              <div className="ct-field">
                <label>Company</label>
                <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Acme Ltd" />
              </div>
              <div className="ct-field">
                <label>What&apos;s on your mind?</label>
                <textarea
                  rows={5}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="A specific question, a project you want to discuss, or just a hello."
                />
              </div>
              <button className="ct-submit" onClick={submit} disabled={submitting || !name || !email}>
                {submitting ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                    <InlineSpinner label="Sending message" />
                    Sending…
                  </span>
                ) : 'Send message →'}
              </button>
              <div className="ct-trust">✓ 24-hour reply · ✓ No spam · ✓ Reply STOP and we&apos;ll close the loop</div>
            </div>
          )}
        </div>
      </div>

      <section className="ct-meta">
        <div className="ct-meta-item">
          <div className="ct-meta-label">Email</div>
          <a href="mailto:srijanpaudelofficial@gmail.com">srijanpaudelofficial@gmail.com</a>
        </div>
        <div className="ct-meta-item">
          <div className="ct-meta-label">Founder</div>
          <a href="mailto:srijanpaudelofficial@gmail.com">srijanpaudelofficial@gmail.com</a>
        </div>
        <div className="ct-meta-item">
          <div className="ct-meta-label">Reply time</div>
          <span>24h on weekdays</span>
        </div>
      </section>

      <style>{`
        .ct-page { background: #0A0613; color: #E5E7EB; min-height: 100vh; padding: 140px 24px 80px; font-family: 'Inter', system-ui, sans-serif; }
        @media (max-width: 640px) { .ct-page { padding: 120px 16px 60px; } }
        .ct-hero { max-width: 760px; margin: 0 auto 56px; text-align: center; }
        .ct-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(139, 92, 246,0.08); border: 1px solid rgba(139, 92, 246,0.25); border-radius: 999px; color: #8B5CF6; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; }
        .ct-h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(32px, 5vw, 52px); line-height: 1.05; margin-bottom: 16px; }
        .ct-grad { background: linear-gradient(135deg, #8B5CF6, #C084FC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .ct-sub { color: #9CA3B5; font-size: 17px; line-height: 1.6; }
        .ct-grid { max-width: 1080px; margin: 0 auto 64px; display: grid; grid-template-columns: 1fr 1.4fr; gap: 32px; align-items: start; }
        @media (max-width: 1024px) { .ct-grid { grid-template-columns: 1fr; } }
        .ct-shortcuts { display: flex; flex-direction: column; gap: 12px; }
        .ct-shortcut { padding: 24px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 14px; text-decoration: none; color: #E5E7EB; transition: all 0.3s; display: block; }
        .ct-shortcut:hover { transform: translateY(-3px); border-color: #8B5CF6; box-shadow: 0 0 24px rgba(139, 92, 246,0.18); }
        .ct-shortcut-icon { width: 44px; height: 44px; border-radius: 12px; background: rgba(139, 92, 246,0.08); border: 1px solid rgba(139, 92, 246,0.25); display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 14px; }
        .ct-shortcut h3 { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 16px; margin-bottom: 8px; }
        .ct-shortcut p { color: #9CA3B5; font-size: 13px; line-height: 1.5; margin-bottom: 12px; }
        .ct-shortcut-link { font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; color: #8B5CF6; text-transform: uppercase; letter-spacing: 0.1em; }
        .ct-form-wrap { padding: 32px; background: #13101F; border: 1px solid rgba(139, 92, 246,0.25); border-radius: 20px; }
        @media (max-width: 640px) { .ct-form-wrap { padding: 24px 20px; } }
        .ct-form-title { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 24px; margin-bottom: 24px; }
        .ct-form { display: flex; flex-direction: column; gap: 16px; }
        .ct-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 640px) { .ct-row { grid-template-columns: 1fr; } }
        .ct-field { display: flex; flex-direction: column; }
        .ct-field label { font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; color: #9CA3B5; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 6px; }
        .ct-field input, .ct-field textarea { width: 100%; padding: 12px 14px; background: #0A0613; border: 1px solid #2A1F3D; color: #E5E7EB; font-size: 14px; border-radius: 10px; outline: none; font-family: 'Inter', system-ui, sans-serif; transition: border 0.2s; }
        .ct-field input:focus, .ct-field textarea:focus { border-color: #8B5CF6; box-shadow: 0 0 0 3px rgba(139, 92, 246,0.15); }
        .ct-field input::placeholder, .ct-field textarea::placeholder { color: #4a6280; }
        .ct-field textarea { resize: vertical; min-height: 120px; }
        .ct-submit { padding: 14px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border: none; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 14px; cursor: pointer; box-shadow: 0 0 24px rgba(139, 92, 246,0.3); transition: transform 0.2s; margin-top: 8px; }
        .ct-submit:hover:not(:disabled) { transform: translateY(-2px); }
        .ct-submit:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }
        .ct-trust { font-size: 11px; color: #9CA3B5; text-align: center; }
        .ct-done { text-align: center; padding: 16px 0; }
        .ct-check { width: 56px; height: 56px; margin: 0 auto 16px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 28px; box-shadow: 0 0 24px rgba(139, 92, 246,0.4); }
        .ct-done h3 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 22px; margin-bottom: 8px; }
        .ct-done p { color: #9CA3B5; font-size: 14px; line-height: 1.6; }
        .ct-meta { max-width: 1080px; margin: 0 auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding: 28px 32px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 18px; }
        @media (max-width: 640px) { .ct-meta { grid-template-columns: 1fr; padding: 20px; } }
        .ct-meta-item { text-align: center; }
        .ct-meta-label { font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; color: #9CA3B5; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 6px; }
        .ct-meta-item a, .ct-meta-item span { color: #8B5CF6; font-size: 14px; text-decoration: none; }
        .ct-meta-item a:hover { color: #C084FC; }
      `}</style>
    </div>
  );
}
