// ─────────────────────────────────────────────────────────────────────────
// /guides/[slug] — long-form pillar guides.
// Reads markdown from src/content/guides/, renders server-side, ships
// Article + LearningResource + Speakable + BreadcrumbList schema.
// Each guide is 3000-5000+ words of authority content.
// ─────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getGuides, getGuideBySlug } from '@/lib/guides';

const BASE = 'https://aiprosol.com';
type Params = { slug: string };

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export function generateStaticParams() {
  return getGuides().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const g = getGuideBySlug(slug);
  if (!g) return { title: 'Guide not found' };
  return {
    title: g.title,
    description: g.description,
    alternates: { canonical: `/guides/${g.slug}` },
    openGraph: {
      title: g.title,
      description: g.description,
      url: `/guides/${g.slug}`,
      type: 'article',
      images: [`/api/og/guide/${g.slug}`],
    },
    twitter: {
      card: 'summary_large_image',
      title: g.title,
      description: g.description,
    },
  };
}

export default async function GuidePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  // Server-side markdown rendering (matches the lightweight pattern used
  // for blog posts — paragraphs, h2/h3/h4, lists, links, code).
  type Block =
    | { type: 'h2' | 'h3' | 'h4'; text: string; id: string; key: number }
    | { type: 'p' | 'pre' | 'quote' | 'table'; text: string; key: number }
    | { type: 'ul' | 'ol'; items: string[]; key: number }
    | { type: 'hr'; key: number };

  const blocks = guide.body.split(/\n\n+/);
  const renderedBlocks: Block[] = blocks.map((para, i): Block => {
    const trimmed = para.trim();
    if (/^####\s/.test(trimmed)) {
      const text = trimmed.replace(/^####\s+/, '');
      return { type: 'h4', text, id: slugify(text), key: i };
    }
    if (/^###\s/.test(trimmed)) {
      const text = trimmed.replace(/^###\s+/, '');
      return { type: 'h3', text, id: slugify(text), key: i };
    }
    if (/^##\s/.test(trimmed)) {
      const text = trimmed.replace(/^##\s+/, '');
      return { type: 'h2', text, id: slugify(text), key: i };
    }
    if (/^---/.test(trimmed)) return { type: 'hr', key: i };
    if (/^\|/.test(trimmed)) return { type: 'table', text: trimmed, key: i };
    if (/^[-*]\s/.test(trimmed)) {
      const items = trimmed.split(/\n/).map((l) => l.replace(/^[-*]\s+/, ''));
      return { type: 'ul', items, key: i };
    }
    if (/^\d+\.\s/.test(trimmed)) {
      const items = trimmed.split(/\n/).map((l) => l.replace(/^\d+\.\s+/, ''));
      return { type: 'ol', items, key: i };
    }
    if (/^```/.test(trimmed)) {
      const code = trimmed.replace(/^```\w*\n?/, '').replace(/```$/, '');
      return { type: 'pre', text: code, key: i };
    }
    if (/^>\s/.test(trimmed)) {
      const text = trimmed.replace(/^>\s+/gm, '').replace(/\n/g, ' ');
      return { type: 'quote', text, key: i };
    }
    return { type: 'p', text: trimmed, key: i };
  });

  // Build a top-level table-of-contents from h2/h3 entries
  const toc: Array<{ id: string; text: string; level: 2 | 3 }> = [];
  for (const b of renderedBlocks) {
    if (b.type === 'h2' || b.type === 'h3') {
      toc.push({ id: b.id, text: b.text, level: b.type === 'h3' ? 3 : 2 });
    }
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Article', 'LearningResource'],
        '@id': `${BASE}/guides/${guide.slug}#article`,
        headline: guide.title,
        description: guide.description,
        url: `${BASE}/guides/${guide.slug}`,
        datePublished: guide.publishedDate,
        dateModified: guide.updatedDate,
        author: { '@id': `${BASE}/#srijan-paudel` },
        publisher: { '@id': `${BASE}/#organization` },
        mainEntityOfPage: `${BASE}/guides/${guide.slug}`,
        articleSection: 'Definitive Guide',
        wordCount: guide.body.split(/\s+/).length,
        timeRequired: `PT${guide.readTime}M`,
        educationalLevel: 'Professional',
        learningResourceType: 'Guide',
        about: { '@id': `${BASE}/#organization` },
        inLanguage: 'en',
        keywords: 'AI automation, SMB, workflow design, n8n, Zapier, Make, AI agents, ROI',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
          { '@type': 'ListItem', position: 2, name: 'Guides', item: `${BASE}/guides` },
          { '@type': 'ListItem', position: 3, name: guide.title, item: `${BASE}/guides/${guide.slug}` },
        ],
      },
      {
        '@type': 'WebPage',
        '@id': `${BASE}/guides/${guide.slug}`,
        url: `${BASE}/guides/${guide.slug}`,
        name: guide.title,
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['.gd-h1', '.gd-tagline', '.gd-body h2', '.gd-body p'],
        },
      },
      // Course entity — the definitive guides are 30-min structured learning
      // experiences with clear learning outcomes, so they qualify under
      // schema.org's Course type. Emitting Course alongside Article unlocks
      // Course-specific rich results on Google + LLM "courses on X" queries.
      {
        '@type': 'Course',
        '@id': `${BASE}/guides/${guide.slug}#course`,
        name: guide.title,
        description: guide.description,
        url: `${BASE}/guides/${guide.slug}`,
        provider: { '@id': `${BASE}/#organization` },
        educationalLevel: 'Professional',
        inLanguage: 'en',
        timeRequired: `PT${guide.readTime}M`,
        hasCourseInstance: {
          '@type': 'CourseInstance',
          courseMode: 'online',
          courseWorkload: `PT${guide.readTime}M`,
          instructor: { '@id': `${BASE}/#srijan-paudel` },
        },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url: `${BASE}/guides/${guide.slug}`,
          category: 'Free',
        },
        about: { '@id': `${BASE}/#organization` },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="gd-page">
        <header className="gd-header">
          <nav className="gd-bc">
            <Link href="/">Home</Link> · <Link href="/guides">Guides</Link> · <span>{guide.title.slice(0, 60)}{guide.title.length > 60 ? '…' : ''}</span>
          </nav>
          <div className="gd-eyebrow">Definitive Guide · {guide.readTime}-min read</div>
          <h1 className="gd-h1">{guide.title}</h1>
          <p className="gd-tagline">{guide.description}</p>
        </header>

        <div className="gd-shell">
          <aside className="gd-toc">
            <div className="gd-toc-head">On this page</div>
            {toc.map((item) => (
              <a key={item.id} href={`#${item.id}`} className={`gd-toc-link ${item.level === 3 ? 'lvl-3' : ''}`}>
                {item.text}
              </a>
            ))}
            <div className="gd-toc-cta">
              <Link href="/roi-audit" className="gd-toc-cta-btn">Free ROI Audit →</Link>
            </div>
          </aside>

          <div className="gd-body">
            {renderedBlocks.map((b) => {
              switch (b.type) {
                case 'h2': return <h2 key={b.key} id={b.id}>{b.text}</h2>;
                case 'h3': return <h3 key={b.key} id={b.id}>{b.text}</h3>;
                case 'h4': return <h4 key={b.key} id={b.id}>{b.text}</h4>;
                case 'hr': return <hr key={b.key} />;
                case 'ul': return <ul key={b.key}>{b.items.map((li, j) => <li key={j} dangerouslySetInnerHTML={{ __html: inline(li) }} />)}</ul>;
                case 'ol': return <ol key={b.key}>{b.items.map((li, j) => <li key={j} dangerouslySetInnerHTML={{ __html: inline(li) }} />)}</ol>;
                case 'pre': return <pre key={b.key}><code>{b.text}</code></pre>;
                case 'quote': return <blockquote key={b.key} dangerouslySetInnerHTML={{ __html: inline(b.text) }} />;
                case 'table': return <div key={b.key} className="gd-table-wrap" dangerouslySetInnerHTML={{ __html: tableToHtml(b.text) }} />;
                case 'p': return <p key={b.key} dangerouslySetInnerHTML={{ __html: inline(b.text) }} />;
              }
            })}
          </div>
        </div>

        <section className="gd-cta">
          <h3>Ready to put this into practice?</h3>
          <p>The free 60-second ROI Audit produces a personalised plan + recommended product.</p>
          <Link href="/roi-audit" className="gd-cta-btn">Get your free ROI Audit →</Link>
        </section>

        <Styles />
      </article>
    </>
  );
}

// Inline markdown helpers — bold, italic, code, links
function inline(s: string): string {
  return s
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\n/g, '<br>');
}

// Minimal markdown table → HTML
function tableToHtml(md: string): string {
  const lines = md.trim().split('\n');
  if (lines.length < 2) return '';
  const split = (l: string) => l.split('|').map((c) => c.trim()).filter((c, i, arr) => i > 0 && i < arr.length - 1);
  const header = split(lines[0]);
  const body = lines.slice(2).map(split);
  return (
    '<table><thead><tr>' +
    header.map((c) => `<th>${inline(c)}</th>`).join('') +
    '</tr></thead><tbody>' +
    body.map((row) => '<tr>' + row.map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') +
    '</tbody></table>'
  );
}

function Styles() {
  return (
    <style>{`
      .gd-page { background: #0A0613; color: #E5E7EB; min-height: 100vh; padding: 140px 24px 80px; font-family: 'Inter', system-ui, sans-serif; }
      @media (max-width: 640px) { .gd-page { padding: 110px 16px 60px; } }
      .gd-header { max-width: 880px; margin: 0 auto 48px; }
      .gd-bc { font-size: 12px; color: #9CA3B5; margin-bottom: 18px; }
      .gd-bc a { color: #C084FC; text-decoration: none; }
      .gd-eyebrow { display: inline-block; padding: 6px 14px; background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.3); border-radius: 999px; color: #C084FC; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 20px; }
      .gd-h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: clamp(28px, 4.5vw, 48px); line-height: 1.1; letter-spacing: -0.02em; margin: 0 0 18px; }
      .gd-tagline { font-size: 17px; color: #C7CEDB; line-height: 1.7; margin: 0; max-width: 720px; }
      .gd-shell { max-width: 1080px; margin: 0 auto; display: grid; grid-template-columns: 240px 1fr; gap: 48px; align-items: start; }
      @media (max-width: 1024px) { .gd-shell { grid-template-columns: 1fr; } .gd-toc { display: none; } }
      .gd-toc { position: sticky; top: 100px; max-height: calc(100vh - 120px); overflow-y: auto; padding: 20px; background: #13101F; border: 1px solid #2A1F3D; border-radius: 14px; }
      .gd-toc-head { font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; color: #C084FC; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #2A1F3D; }
      .gd-toc-link { display: block; padding: 6px 10px; margin: 2px -10px; font-size: 13px; color: #9CA3B5; border-radius: 6px; line-height: 1.4; text-decoration: none; }
      .gd-toc-link:hover { color: #E5E7EB; background: rgba(139,92,246,0.06); }
      .gd-toc-link.lvl-3 { padding-left: 22px; font-size: 12px; }
      .gd-toc-cta { margin-top: 16px; padding-top: 16px; border-top: 1px solid #2A1F3D; }
      .gd-toc-cta-btn { display: block; padding: 10px; text-align: center; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border-radius: 8px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 11px; text-decoration: none; }
      .gd-body { font-size: 16px; line-height: 1.8; color: #E5E7EB; }
      .gd-body p { margin: 0 0 1.4em; }
      .gd-body h2 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 28px; line-height: 1.2; margin: 2em 0 0.6em; padding-top: 0.4em; color: #FFFFFF; }
      .gd-body h3 { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 20px; line-height: 1.3; margin: 1.6em 0 0.5em; color: #C084FC; }
      .gd-body h4 { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 16px; margin: 1.4em 0 0.5em; color: #E5E7EB; }
      .gd-body ul, .gd-body ol { margin: 0 0 1.4em 1.4em; }
      .gd-body li { margin-bottom: 0.5em; }
      .gd-body a { color: #C084FC; border-bottom: 1px solid rgba(192,132,252,0.4); text-decoration: none; }
      .gd-body a:hover { border-bottom-color: #C084FC; }
      .gd-body code { background: #13101F; border: 1px solid #2A1F3D; padding: 2px 6px; border-radius: 4px; font-size: 14px; font-family: ui-monospace, monospace; color: #C084FC; }
      .gd-body pre { background: #050310; border: 1px solid #2A1F3D; border-radius: 10px; padding: 18px; overflow-x: auto; margin: 1.4em 0; }
      .gd-body pre code { background: transparent; border: 0; padding: 0; color: #E5E7EB; }
      .gd-body hr { border: 0; border-top: 1px solid rgba(139,92,246,0.18); margin: 40px 0; }
      .gd-body blockquote { padding: 14px 22px; background: rgba(139,92,246,0.06); border-left: 3px solid #8B5CF6; border-radius: 6px; margin: 22px 0; color: #C7CEDB; font-style: italic; }
      .gd-table-wrap { overflow-x: auto; margin: 1.4em 0; border: 1px solid #2A1F3D; border-radius: 10px; }
      .gd-table-wrap table { width: 100%; border-collapse: collapse; font-size: 14px; }
      .gd-table-wrap th, .gd-table-wrap td { padding: 12px 16px; text-align: left; vertical-align: top; border-bottom: 1px solid #2A1F3D; }
      .gd-table-wrap th { background: rgba(139,92,246,0.08); font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: #C084FC; }
      .gd-table-wrap tbody tr:last-child td { border-bottom: 0; }
      .gd-cta { max-width: 720px; margin: 64px auto 0; text-align: center; padding: 36px 32px; background: linear-gradient(135deg, rgba(139,92,246,0.10), rgba(192,132,252,0.10)); border: 1px solid rgba(139,92,246,0.3); border-radius: 18px; }
      .gd-cta h3 { font-family: 'Space Grotesk', sans-serif; font-size: 24px; margin: 0 0 8px; font-weight: 800; }
      .gd-cta p { color: #9CA3B5; margin: 0 0 18px; font-size: 14px; }
      .gd-cta-btn { display: inline-block; padding: 13px 28px; background: linear-gradient(135deg, #8B5CF6, #C084FC); color: #0A0613; border-radius: 10px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; text-decoration: none; font-size: 14px; }
    `}</style>
  );
}
