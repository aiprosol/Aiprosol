// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · INTEGRATIONS MARQUEE
// Phase 2.4 · horizontal auto-scrolling logo strip with pause-on-hover.
// Embeds anywhere — homepage trust bar, services page footer, etc.
// Pulls from the `integrations` CMS, falls back to a built-in list of 12
// so the strip never renders empty.
// ─────────────────────────────────────────────────────────────────────────

import { items } from '@wix/data';
import { useWixModules } from '@wix/sdk-react';
import { useEffect, useState } from 'react';

interface Integration {
  _id?: string;
  name?: string;
  title?: string;
  logo?: string;
  logoUrl?: string;
  url?: string;
  category?: string;
}

// Fallback list — used if the CMS query is empty or fails. Logos are
// inline SVG/text so the marquee doesn't depend on external assets.
const FALLBACK: Integration[] = [
  { name: 'Zapier', category: 'Automation' },
  { name: 'Make', category: 'Automation' },
  { name: 'n8n', category: 'Automation' },
  { name: 'HubSpot', category: 'CRM' },
  { name: 'Pipedrive', category: 'CRM' },
  { name: 'ActiveCampaign', category: 'Marketing' },
  { name: 'Salesforce', category: 'CRM' },
  { name: 'Calendly', category: 'Scheduling' },
  { name: 'Slack', category: 'Comms' },
  { name: 'Notion', category: 'Workspace' },
  { name: 'Airtable', category: 'Database' },
  { name: 'Stripe', category: 'Payments' },
  { name: 'Xero', category: 'Accounting' },
  { name: 'Google Workspace', category: 'Productivity' },
  { name: 'Microsoft 365', category: 'Productivity' },
];

interface Props {
  /** Optional title above the marquee. Defaults to a standard line. */
  title?: string;
  /** Animation speed in seconds (full loop). Default 40s. Higher = slower. */
  speed?: number;
  /** Hide the title, render just the strip. */
  bare?: boolean;
}

export function IntegrationsMarquee({
  title = 'Connect with everything you already use',
  speed = 40,
  bare = false,
}: Props) {
  const { query } = useWixModules(items);
  const [list, setList] = useState<Integration[]>(FALLBACK);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await query('integrations').limit(50).find({ suppressAuth: true });
        const cms = (res.items as Integration[]) || [];
        if (mounted && cms.length > 0) setList(cms);
      } catch {
        // Keep fallback
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Duplicate the list so the loop is seamless
  const doubled = [...list, ...list];

  return (
    <section className="im-section">
      {!bare && (
        <div className="im-head">
          <div className="im-eyebrow">10+ integrations · API-first</div>
          <h2 className="im-title">{title}</h2>
        </div>
      )}
      <div className="im-track-wrap" aria-label="Integrations carousel">
        <div className="im-track" style={{ animationDuration: `${speed}s` }}>
          {doubled.map((i, idx) => (
            <Logo key={idx} integration={i} />
          ))}
        </div>
        <div className="im-fade im-fade-l" aria-hidden="true" />
        <div className="im-fade im-fade-r" aria-hidden="true" />
      </div>

      <Styles />
    </section>
  );
}

function Logo({ integration }: { integration: Integration }) {
  const name = integration.name || integration.title || 'Integration';
  const logo = integration.logo || integration.logoUrl;
  const url = integration.url;

  const Inner = (
    <div className="im-logo">
      {logo ? (
        <img src={logo} alt={name} loading="lazy" />
      ) : (
        <div className="im-text-logo">{name}</div>
      )}
      {integration.category && <span className="im-cat">{integration.category}</span>}
    </div>
  );

  return url ? (
    <a className="im-logo-link" href={url} target="_blank" rel="noopener noreferrer">{Inner}</a>
  ) : Inner;
}

function Styles() {
  return (
    <style>{`
      .im-section { padding: 64px 0; background: transparent; overflow: hidden; }
      .im-head { max-width: 1080px; margin: 0 auto 32px; padding: 0 24px; text-align: center; }
      .im-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(0,212,255,0.08); border: 1px solid rgba(0,212,255,0.25); border-radius: 999px; color: #00D4FF; font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 14px; }
      .im-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(20px, 2.5vw, 28px); color: #D4E8F7; }

      .im-track-wrap { position: relative; width: 100%; overflow: hidden; padding: 8px 0; }
      .im-track { display: inline-flex; gap: 24px; animation: im-scroll linear infinite; padding-left: 24px; }
      .im-track-wrap:hover .im-track { animation-play-state: paused; }
      @keyframes im-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }

      .im-logo, .im-logo-link { flex-shrink: 0; display: inline-flex; align-items: center; gap: 12px; padding: 14px 22px; background: rgba(13, 31, 60, 0.6); backdrop-filter: blur(8px); border: 1px solid #1E3A5F; border-radius: 12px; color: #D4E8F7; text-decoration: none; transition: all 0.3s; min-width: 160px; }
      .im-logo-link:hover { border-color: #00D4FF; background: rgba(0, 212, 255, 0.05); transform: translateY(-2px); box-shadow: 0 0 18px rgba(0,212,255,0.18); }
      .im-logo img { width: 32px; height: 32px; object-fit: contain; }
      .im-text-logo { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #D4E8F7; letter-spacing: -0.01em; }
      .im-cat { font-size: 10px; color: #8899AA; padding: 3px 8px; background: rgba(255,255,255,0.04); border-radius: 999px; text-transform: uppercase; letter-spacing: 0.08em; }

      .im-fade { position: absolute; top: 0; bottom: 0; width: 80px; pointer-events: none; }
      .im-fade-l { left: 0; background: linear-gradient(90deg, #0A1628, transparent); }
      .im-fade-r { right: 0; background: linear-gradient(270deg, #0A1628, transparent); }

      @media (prefers-reduced-motion: reduce) {
        .im-track { animation: none; padding-left: 24px; }
      }
    `}</style>
  );
}

export default IntegrationsMarquee;
