// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · FAQ PAGE · /faqs
// Phase 3.6 · 21 FAQs from CMS, real-time search, category-grouped
// accordion. Falls back to a built-in 12-question set so the page is
// never empty.
// ─────────────────────────────────────────────────────────────────────────

import { items } from '@wix/data';
import { useWixModules } from '@wix/sdk-react';
import { useEffect, useMemo, useState } from 'react';

interface FAQ {
  _id?: string;
  question?: string;
  q?: string;
  answer?: string;
  a?: string;
  category?: string;
  order?: number;
}

const FALLBACK: FAQ[] = [
  // Getting started
  { q: 'Do I need to book a call to get started?', a: 'No. Aiprosol is self-serve first. Most clients start with a digital product or the free ROI Audit, then upgrade to a managed plan when the numbers prove out. Calendly calls are reserved for Enterprise enquiries only.', category: 'Getting Started' },
  { q: 'Where should I start?', a: 'Run the free 60-second ROI Audit. It calculates your projected savings and recommends the right next step — a digital product, a managed plan, or an Enterprise call.', category: 'Getting Started' },
  { q: 'How quickly can my first automation go live?', a: 'Self-serve products are downloadable instantly and most can be implemented in 1–3 days. Starter and Growth plans go live within 14 days. Enterprise white-glove rollouts take 3–4 weeks.', category: 'Getting Started' },

  // Pricing & plans
  { q: 'How does pricing work?', a: 'Three tiers: Starter £997/mo (10–50 employees), Growth £2,997/mo (50–200), Enterprise £7,997/mo (200+). Plus 19 self-serve products from £17–£997 if you want to start there.', category: 'Pricing' },
  { q: 'Can I cancel anytime?', a: 'Yes — Starter and Growth have no minimum commitment. Enterprise has a 6-month minimum because of the architectural investment, then renews month-to-month.', category: 'Pricing' },
  { q: 'Do you charge in GBP?', a: 'Yes — all pricing is in British Pounds. We serve clients globally and bill in GBP regardless of your location.', category: 'Pricing' },
  { q: 'Can I upgrade or downgrade?', a: 'Anytime. Upgrades pro-rate immediately; downgrades take effect at the next billing cycle.', category: 'Pricing' },

  // How it works
  { q: 'What if my automation breaks?', a: 'Every managed plan includes monitoring, alerting, and Arora\'s auto-recovery layer. Most issues are auto-resolved before you\'d notice. SLA: 24h on Starter, 4h on Growth, 1h on Enterprise.', category: 'How it works' },
  { q: 'Do I need to be technical?', a: 'No — Aiprosol is built for non-technical operators. Arora handles the technical architecture; you stay focused on the business. Every automation comes with plain-English documentation and a video walkthrough.', category: 'How it works' },
  { q: 'What tools do you integrate with?', a: 'Anything with an API. Most engagements involve Make, Zapier, n8n, HubSpot, Pipedrive, ActiveCampaign, Calendly, Xero, Slack, Notion, plus the major LLM providers. If your stack isn\'t on the list, we\'ll integrate it or tell you honestly that it\'s not feasible.', category: 'How it works' },

  // About
  { q: 'Who is Arora?', a: 'Arora is the AI CEO of Aiprosol — the operational lead, not a chatbot or mascot. She handles strategy, system architecture, content, and most customer interactions. The CEO role is filled by AI by design: it\'s how we keep automations grounded in actual operating reality.', category: 'About' },
  { q: 'Who founded Aiprosol?', a: 'Srijan Paudel founded Aiprosol and serves as Chairman. Aiprosol operates as a global, borderless company with clients across multiple industries.', category: 'About' },
];

const get = (f: FAQ) => ({
  q: f.question || f.q || '',
  a: f.answer || f.a || '',
  category: f.category || 'General',
});

export function FAQPage() {
  const { query } = useWixModules(items);
  const [faqs, setFaqs] = useState<FAQ[]>(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState<string>('All');
  const [openId, setOpenId] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await query('faqs').limit(100).find({ suppressAuth: true });
        const cms = (res.items as FAQ[]) || [];
        if (mounted && cms.length > 0) {
          // Sort by order if present
          cms.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
          setFaqs(cms);
        }
      } catch {} finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>(['All']);
    for (const f of faqs) set.add(get(f).category);
    return Array.from(set);
  }, [faqs]);

  const filtered = useMemo(() => {
    let out = faqs.map((f, i) => ({ ...get(f), id: f._id || `fb-${i}` }));
    if (activeCat !== 'All') out = out.filter(f => f.category === activeCat);
    if (search.trim()) {
      const s = search.toLowerCase();
      out = out.filter(f => f.q.toLowerCase().includes(s) || f.a.toLowerCase().includes(s));
    }
    return out;
  }, [faqs, activeCat, search]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    for (const f of filtered) {
      if (!groups[f.category]) groups[f.category] = [];
      groups[f.category].push(f);
    }
    return groups;
  }, [filtered]);

  return (
    <div className="fq-page">
      <header className="fq-hero">
        <div className="fq-eyebrow">{faqs.length} questions · answered straight</div>
        <h1 className="fq-h1">
          Questions, <span className="fq-grad">answered straight</span>
        </h1>
        <p className="fq-sub">
          If you don't find what you're looking for, ask Arora in the chat widget — she's available 24/7.
        </p>
        <div className="fq-search">
          <span className="fq-search-icon">⌕</span>
          <input
            type="text"
            placeholder="Search FAQs (e.g. 'pricing', 'cancel', 'support')…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus={false}
          />
          {search && <button className="fq-search-clear" onClick={() => setSearch('')}>×</button>}
        </div>
      </header>

      <div className="fq-tabs">
        {categories.map(c => (
          <button
            key={c}
            className={`fq-tab ${activeCat === c ? 'is-active' : ''}`}
            onClick={() => setActiveCat(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {loading && <div className="fq-state"><span className="fq-spin" /> Loading FAQs…</div>}

      {!loading && filtered.length === 0 && (
        <div className="fq-state">
          <p>No FAQ matches "{search}".</p>
          <p className="fq-state-sub">Ask Arora in the chat widget — she'll answer directly.</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="fq-list">
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} className="fq-group">
              <h2 className="fq-group-title">{cat}</h2>
              <div className="fq-items">
                {items.map(item => (
                  <div key={item.id} className={`fq-item ${openId === item.id ? 'is-open' : ''}`}>
                    <button className="fq-q" onClick={() => setOpenId(openId === item.id ? '' : item.id)}>
                      <span>{item.q}</span>
                      <span className="fq-icon">+</span>
                    </button>
                    <div className="fq-a">
                      <p>{item.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <section className="fq-cta">
        <h2>Still have a question?</h2>
        <p>Arora is online 24/7 in the chat widget. Or run the free 60-second ROI Audit if you're already evaluating.</p>
        <div className="fq-cta-row">
          <a href="/roi-audit" className="fq-cta-btn">Get Free ROI Audit →</a>
          <a href="/contact" className="fq-cta-secondary">Or contact us →</a>
        </div>
      </section>

      <Styles />
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      .fq-page { background: #0A1628; color: #D4E8F7; min-height: 100vh; padding: 100px 24px 80px; font-family: 'DM Sans', system-ui, sans-serif; }
      @media (max-width: 640px) { .fq-page { padding: 80px 16px 60px; } }

      .fq-hero { max-width: 720px; margin: 0 auto 40px; text-align: center; }
      .fq-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(0,212,255,0.08); border: 1px solid rgba(0,212,255,0.25); border-radius: 999px; color: #00D4FF; font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 16px; }
      .fq-h1 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(32px, 5vw, 52px); line-height: 1.05; margin-bottom: 16px; }
      .fq-grad { background: linear-gradient(135deg, #00D4FF, #00FFE5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .fq-sub { color: #8899AA; font-size: 16px; line-height: 1.6; margin-bottom: 28px; }

      .fq-search { position: relative; max-width: 560px; margin: 0 auto; }
      .fq-search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #8899AA; font-size: 18px; pointer-events: none; }
      .fq-search input { width: 100%; padding: 16px 48px 16px 44px; background: #0D1F3C; border: 1px solid #1E3A5F; color: #D4E8F7; font-size: 15px; border-radius: 12px; outline: none; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
      .fq-search input:focus { border-color: #00D4FF; box-shadow: 0 0 0 4px rgba(0,212,255,0.15); }
      .fq-search input::placeholder { color: #4a6280; }
      .fq-search-clear { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); width: 28px; height: 28px; background: rgba(30,58,95,0.6); border: none; color: #D4E8F7; border-radius: 50%; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; }
      .fq-search-clear:hover { background: #1E3A5F; }

      .fq-tabs { max-width: 800px; margin: 0 auto 32px; display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
      .fq-tab { padding: 7px 14px; background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 999px; color: #8899AA; font-size: 13px; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
      .fq-tab:hover { color: #D4E8F7; border-color: #00D4FF; }
      .fq-tab.is-active { background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628; border-color: transparent; font-weight: 700; }

      .fq-state { max-width: 480px; margin: 60px auto; text-align: center; padding: 32px; background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 14px; color: #8899AA; }
      .fq-state-sub { font-size: 13px; margin-top: 8px; opacity: 0.7; }
      .fq-spin { display: inline-block; width: 14px; height: 14px; border: 2px solid #1E3A5F; border-top-color: #00D4FF; border-radius: 50%; animation: fq-spin 0.8s linear infinite; vertical-align: middle; margin-right: 8px; }
      @keyframes fq-spin { to { transform: rotate(360deg); } }

      .fq-list { max-width: 800px; margin: 0 auto 64px; display: flex; flex-direction: column; gap: 32px; }

      .fq-group-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; color: #00D4FF; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid #1E3A5F; }
      .fq-items { display: flex; flex-direction: column; gap: 8px; }
      .fq-item { background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 12px; overflow: hidden; }
      .fq-q { width: 100%; padding: 18px 22px; background: transparent; border: none; color: #D4E8F7; font-size: 15px; font-weight: 500; text-align: left; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 16px; font-family: 'DM Sans', sans-serif; transition: color 0.2s; }
      .fq-q:hover { color: #00D4FF; }
      .fq-icon { color: #00D4FF; font-size: 22px; transition: transform 0.3s; flex-shrink: 0; }
      .fq-item.is-open .fq-icon { transform: rotate(45deg); }
      .fq-a { max-height: 0; overflow: hidden; transition: max-height 0.3s ease, padding 0.3s ease; padding: 0 22px; }
      .fq-item.is-open .fq-a { max-height: 600px; padding: 0 22px 18px; }
      .fq-a p { color: #8899AA; font-size: 14px; line-height: 1.7; }

      .fq-cta { max-width: 720px; margin: 0 auto; text-align: center; padding: 48px 32px; background: rgba(0,212,255,0.04); border: 1px solid rgba(0,212,255,0.25); border-radius: 24px; }
      .fq-cta h2 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; margin-bottom: 8px; }
      .fq-cta p { color: #8899AA; font-size: 15px; margin-bottom: 24px; }
      .fq-cta-row { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
      .fq-cta-btn { padding: 14px 28px; background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628 !important; border-radius: 10px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; text-decoration: none; box-shadow: 0 0 24px rgba(0,212,255,0.35); }
      .fq-cta-secondary { padding: 14px 24px; background: transparent; border: 1px solid #1E3A5F; color: #D4E8F7; border-radius: 10px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; text-decoration: none; transition: all 0.2s; }
      .fq-cta-secondary:hover { border-color: #00D4FF; color: #00D4FF; }
    `}</style>
  );
}

export default FAQPage;
