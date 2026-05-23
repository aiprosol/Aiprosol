// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · SERVICE DETAIL PAGE
// Phase 2.3 · /services/:slug — pulls a single service from the
// `aiservices` CMS, renders hero + benefits + how it works + plan match +
// industry case studies + FAQ. Falls back to a built-in service map when
// CMS doesn't have full content yet so every URL still renders.
// ─────────────────────────────────────────────────────────────────────────

import { items } from '@wix/data';
import { useWixModules } from '@wix/sdk-react';
import { useEffect, useMemo, useState } from 'react';

interface Service {
  _id: string;
  title?: string;
  name?: string;
  serviceName?: string;
  slug?: string;
  category?: string;
  shortDescription?: string;
  longDescription?: string;
  description?: string;
  icon?: string;
  benefits?: string[] | string;
  process?: string[] | string;
  faqs?: Array<{ q: string; a: string }>;
  planMatch?: string; // 'starter' | 'growth' | 'enterprise'
  caseStudyKeys?: string[];
  image?: string;
  heroImage?: string;
}

// ─── Built-in service map (fallback content for the 11 blueprint services)
// ─── Keys are slugs the CMS should also use.
const SERVICE_MAP: Record<string, Partial<Service>> = {
  'intelligent-workflow-automation': {
    title: 'Intelligent Workflow Automation',
    icon: '⚙️',
    shortDescription: 'Transform manual processes into self-running AI systems operating 24/7.',
    benefits: [
      'Eliminate copy-paste, follow-up, and chasing',
      'Reduce processing time by 60–90%',
      'Self-healing workflows with monitoring + alerting',
      'Documented + auditable, end-to-end',
    ],
    process: [
      'Process audit — we map every step of your current workflow',
      'Architecture design — you approve before we build',
      'Build & test — fully documented, in your stack',
      'Go live + monitor — Arora watches for drift',
    ],
    planMatch: 'growth',
    caseStudyKeys: ['vortex'],
  },
  'custom-ai-chatbot-development': {
    title: 'Custom AI Chatbot Development',
    icon: '💬',
    shortDescription: 'Bespoke AI assistant trained on your business — handles leads, support, bookings.',
    benefits: [
      'Trained on your knowledge base, tone, and policies',
      'Qualifies leads before a human touches them',
      'Books meetings without back-and-forth',
      'Handles 24/7 with measurable conversion lift',
    ],
    process: [
      'Discovery — content sources, tone, escalation paths',
      'Build — model selection, knowledge ingestion, persona',
      'Test — adversarial conversations + edge cases',
      'Deploy — embed on site, integrate with CRM, monitor',
    ],
    planMatch: 'growth',
    caseStudyKeys: ['meridian'],
  },
  'ai-powered-lead-generation': {
    title: 'AI-Powered Lead Generation',
    icon: '🎯',
    shortDescription: 'Automated lead machine — captures, scores, and delivers qualified prospects.',
    benefits: [
      'ICP-aligned outbound at scale',
      'Lead scoring on every inbound',
      'Sub-3-minute response time',
      'Pipeline visibility in your existing CRM',
    ],
    process: [
      'ICP definition + signal selection',
      'Outbound + inbound architecture',
      'Scoring engine + CRM sync',
      'Iterate weekly on conversion data',
    ],
    planMatch: 'starter',
    caseStudyKeys: ['meridian'],
  },
  'business-process-audit-roadmap': {
    title: 'Business Process Audit & Automation Roadmap',
    icon: '🗺️',
    shortDescription: 'Know exactly where to automate, in what order, and with what ROI.',
    benefits: [
      'Workflow inventory across the team',
      'Per-process ROI projection',
      'Sequenced 90-day roadmap',
      'Risk + dependency mapping',
    ],
    process: [
      'Stakeholder interviews + workflow mapping',
      'Time + cost measurement',
      'Opportunity ranking + roadmap',
      'Hand-off or implementation',
    ],
    planMatch: 'starter',
    caseStudyKeys: ['hargreaves', 'thornfield'],
  },
  'seamless-system-integration': {
    title: 'Seamless System Integration',
    icon: '🔗',
    shortDescription: 'Connect every tool into one unified data ecosystem.',
    benefits: [
      'Single source of truth across CRM, billing, support',
      'Eliminate duplicate data entry',
      'Real-time sync + audit trail',
      'API-first — works with any modern stack',
    ],
    process: [
      'System inventory + data flow mapping',
      'Integration design + middleware selection',
      'Build + test + cutover',
      'Monitoring + ongoing maintenance',
    ],
    planMatch: 'enterprise',
    caseStudyKeys: ['thornfield'],
  },
  'ai-sales-automation': {
    title: 'AI Sales Automation',
    icon: '📈',
    shortDescription: 'Automate every stage of the pipeline from first touch to signed contract.',
    benefits: [
      'Faster follow-ups, more touchpoints, better timing',
      'Auto-personalised outreach at scale',
      'Pipeline hygiene without rep effort',
      'Forecast accuracy improves with more data',
    ],
    process: [
      'Pipeline audit + leak detection',
      'Sequence design + content generation',
      'CRM + email + dialer integration',
      'Iteration loop on response rates',
    ],
    planMatch: 'growth',
    caseStudyKeys: ['meridian'],
  },
  'ai-driven-customer-intelligence': {
    title: 'AI-Driven Customer Intelligence',
    icon: '🧠',
    shortDescription: 'Predict churn, find upsell, personalise every interaction.',
    benefits: [
      'Churn signals 30–90 days early',
      'Upsell opportunity scoring',
      'Personalised journeys at scale',
      'Cross-sell paths surfaced automatically',
    ],
    process: [
      'Data audit + segmentation',
      'Model training + validation',
      'Action layer + integration with comms tools',
      'Continuous learning + feedback loop',
    ],
    planMatch: 'enterprise',
    caseStudyKeys: ['meridian', 'thornfield'],
  },
  'zapier-make-automation-setup': {
    title: 'Zapier & Make Automation Setup',
    icon: '⚡',
    shortDescription: 'Production-ready automations deployed in days, fully documented.',
    benefits: [
      'No half-built workflows',
      'Error handling + retry logic',
      'Documented + handed over to your team',
      'Cost-optimised across tasks',
    ],
    process: [
      'Workflow specification',
      'Build in Zapier or Make',
      'Test + edge cases',
      'Documentation + handover',
    ],
    planMatch: 'starter',
    caseStudyKeys: ['hargreaves'],
  },
  'intelligent-document-processing': {
    title: 'Intelligent Document Processing',
    icon: '📄',
    shortDescription: 'AI reads, interprets, and processes any document type at 99%+ accuracy.',
    benefits: [
      'Invoices, contracts, applications, forms',
      '99%+ accuracy with exception routing',
      'Audit trail for compliance',
      'Drops document handling time by 80–95%',
    ],
    process: [
      'Document type analysis + sample collection',
      'Model selection + extraction logic',
      'Exception handling + human-in-the-loop',
      'Production deployment + monitoring',
    ],
    planMatch: 'growth',
    caseStudyKeys: ['hargreaves'],
  },
  'ai-content-marketing-automation': {
    title: 'AI Content & Marketing Automation',
    icon: '✍️',
    shortDescription: 'Automated content production, scheduling, and distribution.',
    benefits: [
      'Brand-consistent content at volume',
      'Multi-channel scheduling',
      'Performance feedback loop',
      'SEO + paid + organic in one system',
    ],
    process: [
      'Brand voice capture + style guide',
      'Content engine build',
      'Distribution + measurement',
      'Iterate on what converts',
    ],
    planMatch: 'growth',
    caseStudyKeys: [],
  },
  'ai-training-enablement': {
    title: 'AI Training & Enablement',
    icon: '🎓',
    shortDescription: 'Team training programmes for AI adoption and automation literacy.',
    benefits: [
      'Department-tailored curricula',
      'Hands-on labs, not theory',
      'Adoption metrics + reporting',
      'Internal champions identified',
    ],
    process: [
      'Skills baseline assessment',
      'Curriculum design',
      'Live + async delivery',
      'Adoption follow-through',
    ],
    planMatch: 'enterprise',
    caseStudyKeys: [],
  },
};

const CASE_STUDIES: Record<string, { name: string; industry: string; metric: string; href: string }> = {
  hargreaves: { name: 'Hargreaves & Sterling', industry: 'Legal', metric: '78% review reduction · 45 hrs/wk reclaimed', href: '/case-studies/hargreaves-sterling' },
  meridian:   { name: 'Meridian Property',     industry: 'Real Estate', metric: 'Lead response 6hr → 3min · +28% conversion', href: '/case-studies/meridian' },
  vortex:     { name: 'Vortex Components',     industry: 'Manufacturing', metric: 'Defect rate 4.1% → 0.6% · +34% throughput', href: '/case-studies/vortex' },
  thornfield: { name: 'Thornfield Stores',     industry: 'Retail', metric: 'Stockouts -71% · £95k annual saving', href: '/case-studies/thornfield' },
};

const PLAN_INFO: Record<string, { name: string; price: number; tag: string }> = {
  starter:    { name: 'Starter',    price: 997,  tag: 'Best fit · 10–50 employees' },
  growth:     { name: 'Growth',     price: 2997, tag: 'Best fit · 50–200 employees' },
  enterprise: { name: 'Enterprise', price: 7997, tag: 'Best fit · 200+ employees' },
};

const get = <T,>(s: any, ...keys: string[]): T | undefined => {
  for (const k of keys) if (s?.[k] != null && s[k] !== '') return s[k];
  return undefined;
};
const getSlugFromUrl = () => {
  if (typeof window === 'undefined') return '';
  const parts = window.location.pathname.split('/').filter(Boolean);
  return parts[parts.length - 1] || '';
};
const normaliseList = (v?: string | string[]): string[] => {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter(Boolean);
  return v.split(/\r?\n|•|·/).map(s => s.trim().replace(/^[-*]\s*/, '')).filter(Boolean);
};

export function ServiceDetailPage() {
  const { query } = useWixModules(items);
  const [cmsService, setCmsService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [slug] = useState(getSlugFromUrl());

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await query('aiservices').limit(50).find({ suppressAuth: true });
        const found = (res.items as Service[]).find(s => s.slug === slug);
        if (mounted) setCmsService(found || null);
      } catch {
        // ignore — fallback to built-in map
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [slug]);

  // Merge CMS data on top of the built-in fallback
  const fallback = SERVICE_MAP[slug] || null;
  const service = cmsService || fallback;

  if (loading && !fallback) {
    return <div className="sd-page"><div className="sd-loading"><span className="sd-spinner" />Loading…</div><Styles /></div>;
  }

  if (!service) {
    return (
      <div className="sd-page">
        <div className="sd-empty">
          <h2>That service isn't on the menu.</h2>
          <p>You'll find all 11 in the catalogue.</p>
          <a href="/services" className="sd-btn">View all services →</a>
        </div>
        <Styles />
      </div>
    );
  }

  const title = (get<string>(service, 'title', 'name', 'serviceName')) || 'Service';
  const desc  = (get<string>(service, 'longDescription', 'description', 'shortDescription')) || '';
  const icon  = service.icon || '✨';
  const benefits = normaliseList(service.benefits);
  const process  = normaliseList(service.process);
  const planMatch = service.planMatch || 'growth';
  const plan = PLAN_INFO[planMatch] || PLAN_INFO.growth;
  const cases = (service.caseStudyKeys || []).map(k => CASE_STUDIES[k]).filter(Boolean);

  return (
    <div className="sd-page">
      <div className="sd-crumb">
        <a href="/services">← All services</a>
      </div>

      <header className="sd-hero">
        <div className="sd-hero-icon">{icon}</div>
        <div className="sd-eyebrow">AI Service · {planMatch.charAt(0).toUpperCase() + planMatch.slice(1)} tier</div>
        <h1 className="sd-h1">{title}</h1>
        {desc && <p className="sd-sub">{desc}</p>}
        <div className="sd-cta-row">
          <a href="/roi-audit" className="sd-btn-primary">See ROI for your business →</a>
          <a href="/pricing" className="sd-btn-secondary">View pricing</a>
        </div>
      </header>

      {benefits.length > 0 && (
        <section className="sd-section">
          <div className="sd-section-eyebrow">What you get</div>
          <h2 className="sd-section-title">Outcomes, not deliverables</h2>
          <div className="sd-benefits">
            {benefits.map((b, i) => (
              <div key={i} className="sd-benefit">
                <span className="sd-benefit-check">✓</span>
                <p>{b}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {process.length > 0 && (
        <section className="sd-section">
          <div className="sd-section-eyebrow">How it works</div>
          <h2 className="sd-section-title">{process.length} steps · transparent end-to-end</h2>
          <ol className="sd-process">
            {process.map((step, i) => (
              <li key={i}>
                <div className="sd-step-num">{String(i + 1).padStart(2, '0')}</div>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="sd-plan">
        <div className="sd-plan-side">
          <div className="sd-section-eyebrow">Plan match</div>
          <h2 className="sd-section-title">{plan.name} — £{plan.price.toLocaleString()}/mo</h2>
          <p className="sd-plan-tag">{plan.tag}. This service is included.</p>
          <a href="/pricing" className="sd-btn-primary">See full plan details →</a>
        </div>
        <div className="sd-plan-card">
          <div className="sd-plan-name">{plan.name}</div>
          <div className="sd-plan-price">£{plan.price.toLocaleString()}<span>/month</span></div>
          <ul>
            <li>✓ {title} included</li>
            <li>✓ Onboarding within 14 days</li>
            <li>✓ Cancel anytime{planMatch === 'enterprise' ? ' after 6-month minimum' : ''}</li>
            <li>✓ Arora as your AI CEO</li>
          </ul>
        </div>
      </section>

      {cases.length > 0 && (
        <section className="sd-section">
          <div className="sd-section-eyebrow">Proof</div>
          <h2 className="sd-section-title">Where this service has shipped</h2>
          <div className="sd-cases">
            {cases.map((c, i) => (
              <a key={i} href={c.href} className="sd-case">
                <div className="sd-case-industry">{c.industry}</div>
                <h3>{c.name}</h3>
                <p>{c.metric}</p>
                <span className="sd-case-link">Read case →</span>
              </a>
            ))}
          </div>
        </section>
      )}

      <section className="sd-section">
        <div className="sd-section-eyebrow">FAQ</div>
        <h2 className="sd-section-title">Quick questions</h2>
        <ServiceFAQ service={title} planMatch={planMatch} />
      </section>

      <section className="sd-cta-final">
        <h2>Want this in your business?</h2>
        <p>Run the free 60-second ROI Audit — Arora confirms whether {title} is the right place to start.</p>
        <a href="/roi-audit" className="sd-cta-btn">Get Your Free ROI Audit →</a>
      </section>

      <Styles />
    </div>
  );
}

function ServiceFAQ({ service, planMatch }: { service: string; planMatch: string }) {
  const [open, setOpen] = useState<number | null>(0);
  const faqs = useMemo(() => [
    { q: `How long until ${service} is running in our business?`, a: planMatch === 'enterprise' ? 'Enterprise rollouts take 3–4 weeks for the architectural design + build. Most clients see first wins in week 2.' : 'Starter and Growth tiers go live within 14 days. Most clients see first wins in week 1.' },
    { q: 'Do we need to change our existing tools?', a: 'No. Aiprosol works with your existing CRM, billing, support, and email stack. We integrate, not replace. If a tool is genuinely holding you back, we\'ll tell you — and recommend an alternative — but that\'s rare.' },
    { q: 'Who owns the system after it\'s built?', a: 'You do. All workflows, prompts, and integrations live in your accounts. We never lock you in. The managed plan covers ongoing operation, monitoring, and iteration.' },
    { q: 'What if our requirements change?', a: 'Iteration is built into every plan. Starter gets a quarterly roadmap review, Growth gets bi-weekly, Enterprise gets weekly. Adjustments come out of plan capacity unless they require new architecture.' },
    { q: 'Is our data secure?', a: 'All data stays in your tools. Aiprosol\'s middleware uses encrypted tokens, rotates keys, and ships with full audit logging. Enterprise tier includes SOC 2 commitments and a custom DPA.' },
  ], [service, planMatch]);
  return (
    <div className="sd-faq-list">
      {faqs.map((f, i) => (
        <div key={i} className={`sd-faq-item ${open === i ? 'is-open' : ''}`}>
          <button className="sd-faq-q" onClick={() => setOpen(open === i ? null : i)}>
            <span>{f.q}</span><span className="sd-faq-icon">+</span>
          </button>
          <div className="sd-faq-a"><p>{f.a}</p></div>
        </div>
      ))}
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      .sd-page { background: #0A1628; color: #D4E8F7; min-height: 100vh; padding: 100px 24px 80px; font-family: 'DM Sans', system-ui, sans-serif; }
      @media (max-width: 640px) { .sd-page { padding: 80px 16px 60px; } }

      .sd-crumb { max-width: 1080px; margin: 0 auto 24px; font-size: 13px; color: #8899AA; }
      .sd-crumb a { color: #00D4FF; }

      .sd-loading, .sd-empty { max-width: 600px; margin: 80px auto; text-align: center; padding: 48px; background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 18px; }
      .sd-empty h2 { font-family: 'Syne', sans-serif; font-size: 24px; margin-bottom: 12px; }
      .sd-spinner { display: inline-block; width: 16px; height: 16px; margin-right: 8px; border: 2px solid #1E3A5F; border-top-color: #00D4FF; border-radius: 50%; animation: sd-spin 0.8s linear infinite; vertical-align: middle; }
      @keyframes sd-spin { to { transform: rotate(360deg); } }

      .sd-hero { max-width: 760px; margin: 0 auto 64px; text-align: center; }
      .sd-hero-icon { display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px; background: rgba(0,212,255,0.08); border: 1px solid rgba(0,212,255,0.25); border-radius: 22px; font-size: 40px; margin-bottom: 24px; box-shadow: 0 0 32px rgba(0,212,255,0.2); }
      .sd-eyebrow { display: inline-block; padding: 4px 12px; background: rgba(0,212,255,0.08); border: 1px solid rgba(0,212,255,0.25); border-radius: 999px; color: #00D4FF; font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 16px; }
      .sd-h1 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(32px, 4.5vw, 52px); line-height: 1.05; margin-bottom: 20px; }
      .sd-sub { color: #8899AA; font-size: 18px; line-height: 1.7; margin-bottom: 28px; }
      .sd-cta-row { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
      .sd-btn-primary { padding: 14px 28px; background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628; border-radius: 10px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; text-decoration: none; box-shadow: 0 0 24px rgba(0,212,255,0.3); transition: transform 0.2s; display: inline-flex; align-items: center; gap: 6px; }
      .sd-btn-primary:hover { transform: translateY(-2px); }
      .sd-btn-secondary { padding: 14px 28px; background: transparent; color: #D4E8F7; border: 1px solid #1E3A5F; border-radius: 10px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; text-decoration: none; transition: all 0.2s; }
      .sd-btn-secondary:hover { border-color: #00D4FF; color: #00D4FF; }
      .sd-btn { padding: 12px 24px; background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628; border-radius: 10px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; text-decoration: none; }

      .sd-section { max-width: 1080px; margin: 0 auto 72px; }
      .sd-section-eyebrow { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; color: #00D4FF; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 12px; }
      .sd-section-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(24px, 3vw, 36px); line-height: 1.2; margin-bottom: 28px; }

      .sd-benefits { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
      @media (max-width: 640px) { .sd-benefits { grid-template-columns: 1fr; } }
      .sd-benefit { display: flex; align-items: flex-start; gap: 14px; padding: 18px 20px; background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 12px; }
      .sd-benefit-check { width: 28px; height: 28px; flex-shrink: 0; background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; box-shadow: 0 0 12px rgba(0,212,255,0.3); }
      .sd-benefit p { font-size: 14px; line-height: 1.6; }

      .sd-process { list-style: none; padding: 0; margin: 0; counter-reset: step; }
      .sd-process li { display: flex; gap: 20px; padding: 20px; background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 12px; margin-bottom: 12px; align-items: center; }
      .sd-step-num { width: 48px; height: 48px; flex-shrink: 0; background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 16px; box-shadow: 0 0 14px rgba(0,212,255,0.25); }
      .sd-process p { font-size: 14px; line-height: 1.6; }

      .sd-plan { max-width: 1080px; margin: 0 auto 72px; display: grid; grid-template-columns: 1.4fr 1fr; gap: 32px; align-items: center; padding: 40px; background: rgba(0,212,255,0.03); border: 1px solid rgba(0,212,255,0.18); border-radius: 20px; }
      @media (max-width: 1024px) { .sd-plan { grid-template-columns: 1fr; padding: 28px; } }
      .sd-plan-tag { color: #8899AA; font-size: 14px; margin-bottom: 18px; }
      .sd-plan-card { padding: 28px; background: #0A1628; border: 1px solid #00D4FF; border-radius: 16px; box-shadow: 0 0 24px rgba(0,212,255,0.15); }
      .sd-plan-name { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; color: #00D4FF; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 8px; }
      .sd-plan-price { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 38px; color: #D4E8F7; line-height: 1; margin-bottom: 18px; }
      .sd-plan-price span { font-size: 14px; color: #8899AA; font-weight: 400; }
      .sd-plan-card ul { list-style: none; padding: 0; margin: 0; }
      .sd-plan-card li { padding: 8px 0; font-size: 13px; color: #D4E8F7; }
      .sd-plan-card li::first-letter { color: #00D4FF; }

      .sd-cases { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
      @media (max-width: 640px) { .sd-cases { grid-template-columns: 1fr; } }
      .sd-case { display: block; padding: 24px; background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 14px; text-decoration: none; color: #D4E8F7; transition: all 0.3s; }
      .sd-case:hover { transform: translateY(-3px); border-color: #00D4FF; box-shadow: 0 0 24px rgba(0,212,255,0.18); }
      .sd-case-industry { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; color: #00D4FF; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 8px; }
      .sd-case h3 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; margin-bottom: 12px; }
      .sd-case p { color: #8899AA; font-size: 14px; line-height: 1.5; margin-bottom: 14px; }
      .sd-case-link { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700; color: #00D4FF; }

      .sd-faq-list { display: flex; flex-direction: column; gap: 8px; }
      .sd-faq-item { background: #0D1F3C; border: 1px solid #1E3A5F; border-radius: 12px; overflow: hidden; }
      .sd-faq-q { width: 100%; padding: 18px 22px; background: transparent; border: none; color: #D4E8F7; font-size: 15px; font-weight: 500; text-align: left; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 16px; font-family: 'DM Sans', sans-serif; }
      .sd-faq-icon { color: #00D4FF; font-size: 20px; transition: transform 0.3s; flex-shrink: 0; }
      .sd-faq-item.is-open .sd-faq-icon { transform: rotate(45deg); }
      .sd-faq-a { max-height: 0; overflow: hidden; transition: max-height 0.3s ease, padding 0.3s ease; padding: 0 22px; }
      .sd-faq-item.is-open .sd-faq-a { max-height: 400px; padding: 0 22px 18px; }
      .sd-faq-a p { color: #8899AA; font-size: 14px; line-height: 1.7; }

      .sd-cta-final { max-width: 720px; margin: 0 auto; text-align: center; padding: 48px 32px; background: rgba(0,212,255,0.04); border: 1px solid rgba(0,212,255,0.25); border-radius: 24px; }
      .sd-cta-final h2 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; margin-bottom: 8px; }
      .sd-cta-final p { color: #8899AA; font-size: 14px; margin-bottom: 24px; }
      .sd-cta-btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #00D4FF, #00FFE5); color: #0A1628 !important; border-radius: 10px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; text-decoration: none; box-shadow: 0 0 24px rgba(0,212,255,0.35); }
    `}</style>
  );
}

export default ServiceDetailPage;
