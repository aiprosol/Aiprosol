'use client';

import { useState } from 'react';
import { InlineSpinner } from './AnimatedLogo';

// AIPROSOL · Profile editor
//
// Used inside /settings. Four optional fields — all stored inside the
// session JWT so updates re-issue the cookie. Each field is short and
// length-capped on the server side to keep the cookie under ~1 KB even
// when every field is filled.
//
// The dropdowns mirror the same vocab used by the ROI Audit form so the
// two surfaces stay in sync — if a user fills "Manufacturing" here, the
// ROI Audit prefills with the same value.

const INDUSTRIES = [
  'Professional Services',
  'Real Estate',
  'Legal',
  'Financial Services',
  'E-commerce',
  'Manufacturing',
  'Healthcare',
  'SaaS',
  'Retail',
  'Other',
];

const ROLES = [
  'Founder / CEO',
  'Operations Lead',
  'Engineering / Tech',
  'Marketing',
  'Sales',
  'Finance',
  'Consultant',
  'Other',
];

interface Profile {
  name?: string;
  company?: string;
  role?: string;
  industry?: string;
}

interface Props {
  initial: Profile;
  /** Called after a successful save with the new profile. */
  onSaved?: (profile: Profile) => void;
}

export function ProfileForm({ initial, onSaved }: Props) {
  const [profile, setProfile] = useState<Profile>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const update = (k: keyof Profile, v: string) =>
    setProfile(prev => ({ ...prev, [k]: v }));

  async function save() {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus('error');
        setError(data?.error || `HTTP ${res.status}`);
        return;
      }
      setStatus('saved');
      onSaved?.(data.profile || profile);
      // Reset the "saved" pill after 2.5s
      setTimeout(() => setStatus('idle'), 2500);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="pf-form">
      <div className="pf-row">
        <label className="pf-field">
          <span className="pf-label">Name</span>
          <input
            type="text"
            value={profile.name || ''}
            onChange={e => update('name', e.target.value)}
            placeholder="Sarah Johnson"
            className="pf-input"
            maxLength={80}
            autoComplete="name"
          />
        </label>
        <label className="pf-field">
          <span className="pf-label">Company</span>
          <input
            type="text"
            value={profile.company || ''}
            onChange={e => update('company', e.target.value)}
            placeholder="Acme Ltd"
            className="pf-input"
            maxLength={80}
            autoComplete="organization"
          />
        </label>
      </div>

      <div className="pf-row">
        <label className="pf-field">
          <span className="pf-label">Role</span>
          <select
            value={profile.role || ''}
            onChange={e => update('role', e.target.value)}
            className="pf-select"
          >
            <option value="">— Pick one —</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        <label className="pf-field">
          <span className="pf-label">Industry</span>
          <select
            value={profile.industry || ''}
            onChange={e => update('industry', e.target.value)}
            className="pf-select"
          >
            <option value="">— Pick one —</option>
            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </label>
      </div>

      <p className="pf-hint">
        Filled-in fields pre-populate the ROI Audit and let us show you the
        most relevant case studies. Nothing here is shared with third parties.
      </p>

      <div className="pf-actions">
        <button
          type="button"
          className="pf-save"
          onClick={save}
          disabled={submitting}
        >
          {submitting ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <InlineSpinner label="Saving profile" />
              Saving…
            </span>
          ) : 'Save profile'}
        </button>
        {status === 'saved' && <span className="pf-saved">✓ Saved</span>}
        {status === 'error' && error && <span className="pf-error">{error}</span>}
      </div>

      <style>{`
        .pf-form { display: flex; flex-direction: column; gap: 14px; }
        .pf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 640px) { .pf-row { grid-template-columns: 1fr; } }
        .pf-field { display: flex; flex-direction: column; gap: 6px; }
        .pf-label { font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; color: #9CA3B5; letter-spacing: 0.1em; text-transform: uppercase; }
        .pf-input, .pf-select { padding: 12px 14px; background: #0A0613; border: 1px solid #2A1F3D; border-radius: 10px; color: #E5E7EB; font-size: 14px; font-family: 'Inter', system-ui, sans-serif; outline: none; transition: border 0.2s; width: 100%; box-sizing: border-box; }
        .pf-input:focus, .pf-select:focus { border-color: #8B5CF6; box-shadow: 0 0 0 3px rgba(139,92,246,0.15); }
        .pf-input::placeholder { color: #4a6280; }
        .pf-select { appearance: none; background-image: linear-gradient(45deg, transparent 50%, #8B5CF6 50%), linear-gradient(135deg, #8B5CF6 50%, transparent 50%); background-position: calc(100% - 18px) center, calc(100% - 12px) center; background-size: 6px 6px, 6px 6px; background-repeat: no-repeat; padding-right: 32px; cursor: pointer; }
        .pf-hint { color: #9CA3B5; font-size: 12px; line-height: 1.6; margin: 4px 0 0; }
        .pf-actions { display: flex; align-items: center; gap: 14px; margin-top: 6px; }
        .pf-save { padding: 11px 22px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border: none; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 13px; cursor: pointer; box-shadow: 0 0 18px rgba(139,92,246,0.25); transition: transform 0.15s, box-shadow 0.15s; }
        .pf-save:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 0 26px rgba(139,92,246,0.4); }
        .pf-save:disabled { opacity: 0.6; cursor: not-allowed; }
        .pf-saved { font-family: 'Space Grotesk', sans-serif; font-size: 12px; font-weight: 700; color: #10B981; letter-spacing: 0.08em; text-transform: uppercase; }
        .pf-error { font-family: 'Space Grotesk', sans-serif; font-size: 12px; font-weight: 700; color: #EF4444; }
      `}</style>
    </div>
  );
}
