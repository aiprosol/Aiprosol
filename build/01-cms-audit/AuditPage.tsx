// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · CMS AUDIT PAGE
// Phase 0 of V2.0 build · drops at /_audit
// Queries every CMS collection, prints schema + counts + known issues.
// One-time use: confirms field names so the Phase 0 fixes can be exact.
// Remove this route after Phase 0 ships.
// ─────────────────────────────────────────────────────────────────────────

import { items } from '@wix/data';
import { useWixModules } from '@wix/sdk-react';
import { useEffect, useState } from 'react';

const COLLECTIONS = [
  'digitalproducts',
  'aiservices',
  'blog',
  'casestudies',
  'faqs',
  'pricingplans',
  'testimonials',
  'integrations',
  'teammembers',
  'leads',
  'bookings',
  'newsletter',
  'affiliatepartners',
  'chatbotconversations',
];

interface CollectionReport {
  id: string;
  status: 'ok' | 'error';
  count?: number;
  fields?: string[];
  sample?: Record<string, unknown>;
  issues?: Array<{ field: string; kind: string; count: number; note?: string }>;
  uniqueCategories?: string[];
  error?: string;
}

interface AuditReport {
  ranAt: string;
  totalItems: number;
  totalIssues: number;
  collections: CollectionReport[];
}

export function AuditPage() {
  const { query } = useWixModules(items);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState('');
  const [copied, setCopied] = useState(false);

  const runAudit = async () => {
    setRunning(true);
    setReport(null);
    const collections: CollectionReport[] = [];
    let totalItems = 0;
    let totalIssues = 0;

    for (const id of COLLECTIONS) {
      setProgress(`Querying ${id}…`);
      try {
        const res = await query(id).limit(1000).find({ suppressAuth: true });
        const list = res.items || [];
        const count = list.length;
        totalItems += count;

        const fields = list.length > 0 ? Object.keys(list[0]) : [];
        const sample = list[0] ? truncate(list[0]) : undefined;
        const issues: CollectionReport['issues'] = [];

        // Blog: hunt for stringValue-wrapped coverImage
        if (id === 'blog' && list.length > 0) {
          const broken = list.filter(
            (it: any) =>
              it.coverImage &&
              typeof it.coverImage === 'object' &&
              'stringValue' in it.coverImage,
          );
          if (broken.length) {
            issues.push({
              field: 'coverImage',
              kind: 'stringValue-wrapped',
              count: broken.length,
              note: 'PUT bulk fix needed — Phase 0 wave 2',
            });
          }
        }

        // Digital products: capture unique category values for filter alignment
        let uniqueCategories: string[] | undefined;
        if (id === 'digitalproducts' && list.length > 0) {
          const cats = new Set<string>();
          for (const it of list as any[]) {
            const candidates = [it.category, it.productCategory, it.cat, it.type];
            for (const c of candidates) {
              if (typeof c === 'string' && c.trim()) cats.add(c.trim());
            }
          }
          uniqueCategories = Array.from(cats).sort();
          if (uniqueCategories.length === 0) {
            issues.push({
              field: 'category',
              kind: 'no-category-field-found',
              count,
              note: 'Filter cannot work without a category field',
            });
          }
        }

        totalIssues += issues.length;
        collections.push({ id, status: 'ok', count, fields, sample, issues, uniqueCategories });
      } catch (err: any) {
        collections.push({
          id,
          status: 'error',
          error: err?.message || String(err),
        });
        totalIssues += 1;
      }
    }

    const r: AuditReport = {
      ranAt: new Date().toISOString(),
      totalItems,
      totalIssues,
      collections,
    };
    console.log('═══ AIPROSOL CMS AUDIT ═══');
    console.log(JSON.stringify(r, null, 2));
    setReport(r);
    setProgress('');
    setRunning(false);
  };

  useEffect(() => { runAudit(); }, []);

  const copyJson = async () => {
    if (!report) return;
    await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={S.page}>
      <div style={S.container}>
        <header style={S.header}>
          <div style={S.eyebrow}>● Phase 0 · CMS Audit</div>
          <h1 style={S.h1}>
            Aiprosol <span style={S.grad}>health check</span>
          </h1>
          <p style={S.sub}>
            14 collections · field discovery · known-issue scan. Output is
            console-logged and copy-paste ready.
          </p>
        </header>

        <div style={S.toolbar}>
          <button style={S.btnPrimary} onClick={runAudit} disabled={running}>
            {running ? '⟳ Running…' : '↻ Re-run audit'}
          </button>
          <button style={S.btnSecondary} onClick={copyJson} disabled={!report}>
            {copied ? '✓ Copied' : '⎘ Copy as JSON'}
          </button>
          {progress && <span style={S.progress}>{progress}</span>}
        </div>

        {report && (
          <>
            <div style={S.summaryGrid}>
              <Stat label="Collections" value={String(report.collections.length)} />
              <Stat label="Total items" value={String(report.totalItems)} />
              <Stat
                label="Issues found"
                value={String(report.totalIssues)}
                tone={report.totalIssues > 0 ? 'warn' : 'ok'}
              />
              <Stat label="Ran at" value={new Date(report.ranAt).toLocaleTimeString()} />
            </div>

            <div style={S.list}>
              {report.collections.map(c => <Row key={c.id} c={c} />)}
            </div>

            <details style={S.json}>
              <summary style={S.jsonSummary}>▼ Raw JSON output</summary>
              <pre style={S.pre}>{JSON.stringify(report, null, 2)}</pre>
            </details>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, tone = 'ok' }: { label: string; value: string; tone?: 'ok' | 'warn' }) {
  return (
    <div style={S.stat}>
      <div style={{ ...S.statValue, color: tone === 'warn' ? '#F59E0B' : '#00D4FF' }}>{value}</div>
      <div style={S.statLabel}>{label}</div>
    </div>
  );
}

function Row({ c }: { c: CollectionReport }) {
  const hasIssues = (c.issues && c.issues.length > 0) || c.status === 'error';
  return (
    <div style={{ ...S.row, borderColor: hasIssues ? '#F59E0B' : '#1E3A5F' }}>
      <div style={S.rowHead}>
        <code style={S.rowId}>{c.id}</code>
        {c.status === 'ok' ? (
          <span style={S.rowMeta}>{c.count ?? 0} items · {c.fields?.length ?? 0} fields</span>
        ) : (
          <span style={{ ...S.rowMeta, color: '#EF4444' }}>error: {c.error}</span>
        )}
      </div>
      {c.fields && c.fields.length > 0 && (
        <div style={S.fields}>
          {c.fields.map(f => <span key={f} style={S.fieldChip}>{f}</span>)}
        </div>
      )}
      {c.uniqueCategories && c.uniqueCategories.length > 0 && (
        <div style={S.cats}>
          <strong style={S.catsLabel}>Unique categories ({c.uniqueCategories.length}):</strong>{' '}
          {c.uniqueCategories.map(cat => <code key={cat} style={S.catChip}>{cat}</code>)}
        </div>
      )}
      {c.issues && c.issues.length > 0 && (
        <div style={S.issues}>
          {c.issues.map((iss, i) => (
            <div key={i} style={S.issue}>
              ⚠ <strong>{iss.field}</strong> · {iss.kind} · {iss.count} affected
              {iss.note && <em style={S.issueNote}> — {iss.note}</em>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function truncate(item: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(item)) {
    if (typeof v === 'string' && v.length > 80) out[k] = v.slice(0, 80) + '…';
    else if (v && typeof v === 'object') out[k] = '[object]';
    else out[k] = v;
  }
  return out;
}

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#0A1628',
    color: '#D4E8F7',
    fontFamily: "'DM Sans', system-ui, sans-serif",
    padding: '48px 24px',
  },
  container: { maxWidth: 1080, margin: '0 auto' },
  header: { marginBottom: 40 },
  eyebrow: {
    display: 'inline-block',
    padding: '4px 12px',
    background: 'rgba(0, 212, 255, 0.08)',
    border: '1px solid rgba(0, 212, 255, 0.25)',
    borderRadius: 999,
    color: '#00D4FF',
    fontFamily: "'Syne', sans-serif",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  h1: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800,
    fontSize: 44,
    lineHeight: 1.1,
    marginBottom: 8,
  },
  grad: {
    background: 'linear-gradient(135deg, #00D4FF, #00FFE5)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  sub: { color: '#8899AA', fontSize: 16, maxWidth: 600 },
  toolbar: { display: 'flex', gap: 12, alignItems: 'center', marginBottom: 32 },
  btnPrimary: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #00D4FF, #00FFE5)',
    color: '#0A1628',
    border: 'none',
    borderRadius: 10,
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: 13,
    cursor: 'pointer',
    boxShadow: '0 0 32px rgba(0, 212, 255, 0.35)',
  },
  btnSecondary: {
    padding: '12px 24px',
    background: 'transparent',
    color: '#D4E8F7',
    border: '1px solid #1E3A5F',
    borderRadius: 10,
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: 13,
    cursor: 'pointer',
  },
  progress: { color: '#8899AA', fontSize: 13 },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    marginBottom: 32,
  },
  stat: {
    background: '#0D1F3C',
    border: '1px solid #1E3A5F',
    borderRadius: 14,
    padding: 20,
  },
  statValue: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 32 },
  statLabel: {
    color: '#8899AA',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginTop: 4,
  },
  list: { display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 },
  row: {
    background: '#0D1F3C',
    border: '1px solid #1E3A5F',
    borderRadius: 14,
    padding: 20,
  },
  rowHead: { display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 12 },
  rowId: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: 16,
    color: '#00D4FF',
  },
  rowMeta: { color: '#8899AA', fontSize: 13 },
  fields: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  fieldChip: {
    padding: '3px 10px',
    background: '#0A1628',
    border: '1px solid #1E3A5F',
    borderRadius: 999,
    fontSize: 11,
    color: '#D4E8F7',
    fontFamily: 'ui-monospace, monospace',
  },
  cats: { marginTop: 12, fontSize: 13, color: '#D4E8F7' },
  catsLabel: { color: '#00FFE5' },
  catChip: {
    display: 'inline-block',
    margin: '4px 6px 0 0',
    padding: '2px 8px',
    background: 'rgba(0, 212, 255, 0.08)',
    border: '1px solid rgba(0, 212, 255, 0.25)',
    borderRadius: 6,
    color: '#00D4FF',
    fontSize: 11,
    fontFamily: 'ui-monospace, monospace',
  },
  issues: { marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 },
  issue: {
    padding: '8px 12px',
    background: 'rgba(245, 158, 11, 0.08)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    borderRadius: 8,
    fontSize: 13,
    color: '#F59E0B',
  },
  issueNote: { color: '#8899AA', fontStyle: 'italic' },
  json: {
    background: '#050E1A',
    border: '1px solid #1E3A5F',
    borderRadius: 14,
    padding: 20,
  },
  jsonSummary: {
    cursor: 'pointer',
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: 13,
    color: '#00D4FF',
    marginBottom: 12,
  },
  pre: {
    fontFamily: 'ui-monospace, monospace',
    fontSize: 11,
    lineHeight: 1.6,
    color: '#A8BDD2',
    overflowX: 'auto',
    whiteSpace: 'pre',
  },
};

export default AuditPage;
