import { items } from '@wix/data';
import { useWixModules } from '@wix/sdk-react';
import { useState } from 'react';

export function ROIAuditPage() {

  // ── TOP LEVEL HOOKS — NEVER MOVE THESE ──────────────────────
  const { createDataItem } = useWixModules(items);

  // ── STATE ────────────────────────────────────────────────────
  const [screen, setScreen] = useState('form');
  const [report, setReport] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', company: '', employees: '',
    industry: '', revenue: '', hoursLost: '',
    hourlyCost: '', challenge: '', experience: ''
  });

  const update = (field, value) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  // ── SUBMIT ───────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      alert('Please enter your name and email');
      return;
    }
    setScreen('loading');
    try {
      // 1. Save to CMS
      await createDataItem({
        dataCollectionId: 'leads',
        dataItem: {
          data: {
            fullName: formData.name,
            email: formData.email,
            companyName: formData.company,
            companySize: Number(formData.employees) || 0,
            industry: formData.industry,
            monthlyRevenue: formData.revenue,
            manualHoursPerWeek: Number(formData.hoursLost) || 0,
            avgHourlyCost: Number(formData.hourlyCost) || 0,
            primaryChallenge: formData.challenge,
            automationExperience: formData.experience,
            leadStatus: 'New Lead — ROI Report',
            leadScore: 70
          }
        },
        options: { suppressAuth: true }
      });

      // 2. Generate AI report
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `You are Arora CEO of Aiprosol AI automation consultancy. Analyse this business and return a personalised report. Return ONLY valid JSON no extra text no markdown.

RECOMMENDATION RULES:
- employees under 10 OR revenue under 5k = type is "digital". No plan. showCall false.
- employees 10 to 50 OR revenue 5k to 100k = type is "plan". Recommend Starter or Growth plan.
- employees over 50 OR revenue over 100k = type is "enterprise". showCall true.

DIGITAL PRODUCTS AVAILABLE:
Business Process Audit Checklist £37, AI Automation ROI Calculator £47, 30-Day Automation Challenge £47, AI Tools Comparison Guide £67, Workflow Automation Playbook £97, ChatGPT Prompt Vault £97, Global Automation Starter Pack £97, Lead Generation Playbook £127, Starter Bundle £79, Playbook Pack £197, AI Tools Vault £147, Zapier Make Bundle £197, AI Tools Stack Kit £197, Agency Launch Bundle £597, Architecture Masterclass £297, Enterprise Readiness Kit £397, Agency Starter Pack £497, Complete Vault £997

SERVICE PLANS: Starter £997/month, Growth £2997/month, Enterprise £7997/month

CLIENT:
Name: ${formData.name}
Company: ${formData.company}
Employees: ${formData.employees}
Revenue: ${formData.revenue}
Industry: ${formData.industry}
Hours lost per week: ${formData.hoursLost}
Hourly cost: £${formData.hourlyCost}
Challenge: ${formData.challenge}
Experience: ${formData.experience}

Return this exact JSON:
{"hoursLost":0,"monthlyCost":0,"monthlySavings":0,"paybackWeeks":0,"opportunities":["string","string","string"],"type":"digital","products":[{"name":"string","price":0,"why":"string"}],"plan":null,"showCall":false,"callReason":null,"note":"string"}`
          }]
        })
      });

      const data = await res.json();
      const generated = JSON.parse(data.content[0].text);
      setReport(generated);
      setScreen('report');

    } catch (err) {
      console.error(err);
      alert('Something went wrong. Please try again.');
      setScreen('form');
    }
  };

  // ── STYLES ───────────────────────────────────────────────────
  const S = {
    page: { background: '#0A1628', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#fff' },
    card: { background: '#0D1F3C', border: '1px solid #1E3A5F', borderRadius: '12px', padding: '24px' },
    cardCyan: { background: '#0D1F3C', border: '1px solid #00D4FF', borderRadius: '12px', padding: '24px' },
    label: { color: '#E8F4FD', fontSize: '13px', display: 'block', marginBottom: '6px', fontWeight: 500 },
    input: { width: '100%', background: '#0A1628', border: '1px solid #1E3A5F', borderRadius: '6px', padding: '10px 12px', color: '#fff', fontSize: '14px', boxSizing: 'border-box', outline: 'none' },
    select: { width: '100%', background: '#0A1628', border: '1px solid #1E3A5F', borderRadius: '6px', padding: '10px 12px', color: '#fff', fontSize: '14px', boxSizing: 'border-box' },
    textarea: { width: '100%', background: '#0A1628', border: '1px solid #1E3A5F', borderRadius: '6px', padding: '10px 12px', color: '#fff', fontSize: '14px', boxSizing: 'border-box', resize: 'none' },
    btnPrimary: { background: '#00D4FF', color: '#0A1628', border: 'none', borderRadius: '8px', padding: '14px 28px', fontWeight: 700, fontSize: '16px', cursor: 'pointer', width: '100%' },
    btnOutline: { display: 'inline-block', background: 'transparent', color: '#00D4FF', border: '2px solid #00D4FF', padding: '10px 24px', borderRadius: '6px', fontWeight: 600, fontSize: '14px', textDecoration: 'none' },
    btnBuy: { display: 'inline-block', background: '#00D4FF', color: '#0A1628', padding: '8px 16px', borderRadius: '6px', fontWeight: 700, fontSize: '13px', textDecoration: 'none', marginTop: '8px' },
    tag: { background: '#00D4FF', color: '#0A1628', padding: '3px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, display: 'inline-block' },
    tagSmall: { background: 'rgba(0,212,255,0.15)', color: '#00D4FF', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 },
    muted: { color: '#8899AA' },
    cyan: { color: '#00D4FF' },
    grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' },
  };

  // ── LOADING SCREEN ───────────────────────────────────────────
  if (screen === 'loading') {
    return (
      <div style={{ ...S.page, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <div style={{ fontSize: '48px' }}>⚡</div>
        <h2 style={{ ...S.cyan, fontSize: '24px', margin: 0 }}>Arora is analysing your business...</h2>
        <p style={{ ...S.muted, margin: 0 }}>Calculating your automation ROI — about 5 seconds</p>
        <div style={{ width: '200px', height: '3px', background: '#1E3A5F', borderRadius: '2px', overflow: 'hidden', marginTop: '8px' }}>
          <div style={{ width: '60%', height: '100%', background: '#00D4FF', borderRadius: '2px', animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }`}</style>
      </div>
    );
  }

  // ── REPORT SCREEN ────────────────────────────────────────────
  if (screen === 'report' && report) {
    return (
      <div style={{ ...S.page, padding: '40px 20px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ ...S.tagSmall, marginBottom: '16px', display: 'inline-block' }}>PERSONALISED AUTOMATION REPORT</div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 8px 0' }}>
              Your report for <span style={S.cyan}>{formData.company || formData.name}</span>
            </h1>
            <p style={{ ...S.muted, margin: 0, fontSize: '14px' }}>Generated by Arora, CEO of Aiprosol</p>
          </div>

          {/* 3 Big Numbers */}
          <div style={S.grid3}>
            {[
              { label: 'Hours Lost Per Week', value: `${report.hoursLost} hrs`, color: '#FF4444' },
              { label: 'Monthly Cost of Manual Work', value: `£${report.monthlyCost?.toLocaleString()}`, color: '#FF8C00' },
              { label: 'Potential Monthly Savings', value: `£${report.monthlySavings?.toLocaleString()}`, color: '#00C851' },
            ].map((s, i) => (
              <div key={i} style={{ ...S.card, textAlign: 'center' }}>
                <div style={{ color: s.color, fontSize: '28px', fontWeight: 800 }}>{s.value}</div>
                <div style={{ ...S.muted, fontSize: '12px', marginTop: '6px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Opportunities */}
          <div style={{ ...S.card, marginBottom: '20px' }}>
            <h3 style={{ ...S.cyan, marginTop: 0, marginBottom: '16px' }}>🎯 Your Top 3 Automation Opportunities</h3>
            {report.opportunities?.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '10px', alignItems: 'flex-start' }}>
                <span style={{ background: '#00D4FF', color: '#0A1628', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                <span style={{ color: '#E8F4FD', fontSize: '14px', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>

          {/* Arora Note */}
          <div style={{ ...S.cardCyan, marginBottom: '24px' }}>
            <div style={{ ...S.cyan, fontWeight: 700, marginBottom: '8px' }}>👩‍💼 Arora's Note for {formData.company || formData.name}</div>
            <p style={{ color: '#E8F4FD', fontStyle: 'italic', margin: 0, lineHeight: 1.7, fontSize: '14px' }}>"{report.note}"</p>
          </div>

          {/* Recommendation */}
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>📦 What We Recommend For You</h2>

          {/* DIGITAL PRODUCTS */}
          {report.type === 'digital' && (
            <div style={{ marginBottom: '24px' }}>
              <p style={{ ...S.muted, fontSize: '14px', marginBottom: '16px' }}>Based on your profile — available instantly, no call needed:</p>
              {report.products?.map((p, i) => (
                <div key={i} style={{ ...S.card, border: i === 0 ? '2px solid #00D4FF' : '1px solid #1E3A5F', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    {i === 0 && <div style={{ ...S.tagSmall, marginBottom: '8px' }}>BEST MATCH</div>}
                    <div style={{ fontWeight: 700, fontSize: '15px', marginTop: i === 0 ? '6px' : '0' }}>{p.name}</div>
                    <div style={{ ...S.muted, fontSize: '13px', marginTop: '4px' }}>{p.why}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ ...S.cyan, fontSize: '22px', fontWeight: 800 }}>£{p.price}</div>
                    <a href="/digital-vault" style={S.btnBuy}>Get Instant Access →</a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SERVICE PLAN */}
          {report.type === 'plan' && report.plan && (
            <div style={{ ...S.card, border: '2px solid #00D4FF', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={S.tag}>{report.plan.name} Plan</div>
                  <div style={{ fontWeight: 700, fontSize: '16px', marginTop: '12px' }}>Done-for-you automation system</div>
                  <div style={{ ...S.muted, fontSize: '13px', marginTop: '6px' }}>{report.plan.why}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ ...S.cyan, fontSize: '26px', fontWeight: 800 }}>£{report.plan.price}</div>
                  <div style={{ ...S.muted, fontSize: '12px' }}>/month</div>
                </div>
              </div>
              <a href="/pricing" style={{ display: 'inline-block', background: '#00D4FF', color: '#0A1628', padding: '12px 28px', borderRadius: '8px', fontWeight: 700, fontSize: '15px', textDecoration: 'none', marginTop: '16px' }}>
                View Plan & Get Started →
              </a>
            </div>
          )}

          {/* ENTERPRISE */}
          {report.type === 'enterprise' && report.plan && (
            <div style={{ ...S.card, border: '2px solid #00D4FF', marginBottom: '24px' }}>
              <div style={S.tag}>Enterprise Plan</div>
              <div style={{ fontWeight: 700, fontSize: '16px', marginTop: '12px' }}>Custom AI Transformation Programme</div>
              <div style={{ ...S.muted, fontSize: '13px', marginTop: '6px', marginBottom: '12px' }}>{report.plan.why}</div>
              <div style={{ ...S.cyan, fontSize: '26px', fontWeight: 800 }}>
                £{report.plan.price}<span style={{ ...S.muted, fontSize: '14px', fontWeight: 400 }}>/month</span>
              </div>
            </div>
          )}

          {/* DISCOVERY CALL — only when needed */}
          {report.showCall && (
            <div style={{ ...S.card, marginBottom: '24px' }}>
              <div style={{ fontWeight: 700, marginBottom: '8px', fontSize: '16px' }}>
                {report.type === 'enterprise' ? '📞 This needs a custom approach' : '🤔 Not sure which option is right?'}
              </div>
              <div style={{ ...S.muted, fontSize: '14px', marginBottom: '16px' }}>
                {report.callReason || 'Book a free 30-minute call and we will walk you through the best option for you.'}
              </div>
              <a href="https://calendly.com/srijanpaudel219/30min" target="_blank" style={S.btnOutline}>
                Book a Free 30-Min Call
              </a>
            </div>
          )}

          {/* Payback */}
          <p style={{ ...S.muted, fontSize: '13px', textAlign: 'center', marginTop: '8px' }}>
            ⚡ Estimated payback period: <strong style={S.cyan}>{report.paybackWeeks} weeks</strong>
          </p>

        </div>
      </div>
    );
  }

  // ── FORM SCREEN ──────────────────────────────────────────────
  return (
    <div style={{ ...S.page, padding: '40px 20px' }}>
      <div style={{ maxWidth: '520px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ ...S.tagSmall, marginBottom: '12px', display: 'inline-block' }}>FREE ROI AUDIT</div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px 0' }}>
            Find out what automation is<br /><span style={S.cyan}>worth to your business</span>
          </h1>
          <p style={{ ...S.muted, margin: 0, fontSize: '14px' }}>Fill in your details and Arora will instantly generate your personalised report.</p>
        </div>

        {/* Form */}
        <div style={S.card}>

          {/* Text inputs */}
          {[
            { label: 'Your full name *', field: 'name', type: 'text', placeholder: 'e.g. John Smith' },
            { label: 'Email address *', field: 'email', type: 'email', placeholder: 'e.g. john@company.com' },
            { label: 'Company name', field: 'company', type: 'text', placeholder: 'e.g. Smith & Co' },
            { label: 'Number of employees', field: 'employees', type: 'number', placeholder: 'e.g. 5' },
            { label: 'Hours lost to manual work per week', field: 'hoursLost', type: 'number', placeholder: 'e.g. 20' },
            { label: 'Average staff hourly cost (£)', field: 'hourlyCost', type: 'number', placeholder: 'e.g. 15' },
          ].map((f, i) => (
            <div key={i} style={{ marginBottom: '14px' }}>
              <label style={S.label}>{f.label}</label>
              <input
                type={f.type}
                placeholder={f.placeholder}
                value={formData[f.field]}
                onChange={e => update(f.field, e.target.value)}
                style={S.input}
              />
            </div>
          ))}

          {/* Industry */}
          <div style={{ marginBottom: '14px' }}>
            <label style={S.label}>Industry</label>
            <select value={formData.industry} onChange={e => update('industry', e.target.value)} style={S.select}>
              <option value="">Select your industry</option>
              {['Professional Services', 'E-commerce', 'Healthcare', 'Real Estate', 'Food & Hospitality', 'Education', 'Manufacturing', 'Marketing Agency', 'Finance', 'Other']
                .map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          {/* Revenue */}
          <div style={{ marginBottom: '14px' }}>
            <label style={S.label}>Monthly revenue</label>
            <select value={formData.revenue} onChange={e => update('revenue', e.target.value)} style={S.select}>
              <option value="">Select revenue range</option>
              {['Under £5k', '£5k–£20k', '£20k–£50k', '£50k–£100k', '£100k–£500k', 'Over £500k']
                .map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          {/* Experience */}
          <div style={{ marginBottom: '14px' }}>
            <label style={S.label}>Automation experience</label>
            <select value={formData.experience} onChange={e => update('experience', e.target.value)} style={S.select}>
              <option value="">Select experience level</option>
              {['None — never used automation', 'Some — tried a few tools', 'Experienced — running automations already']
                .map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          {/* Challenge */}
          <div style={{ marginBottom: '20px' }}>
            <label style={S.label}>Your biggest business challenge</label>
            <textarea
              placeholder="e.g. We spend too much time on manual invoicing and chasing payments"
              value={formData.challenge}
              onChange={e => update('challenge', e.target.value)}
              rows={3}
              style={S.textarea}
            />
          </div>

          {/* Submit */}
          <button onClick={handleSubmit} style={S.btnPrimary}>
            Get My Free ROI Report →
          </button>

          <p style={{ ...S.muted, fontSize: '12px', textAlign: 'center', marginTop: '12px', marginBottom: 0 }}>
            Free. No credit card. No obligation.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ROIAuditPage;
