// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · GET /api/og/[kind]/[slug]
// Programmatic image generator. Renders a 1200×630 futuristic visual for
// any product / service / case / blog slug. Used inline as <img src=...>
// on every card + hero across the site, replacing emoji placeholders.
// Edge runtime · cached aggressively at the CDN.
// ─────────────────────────────────────────────────────────────────────────

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import {
  getProductBySlug,
  getServiceBySlug,
  getCaseStudyBySlug,
  getBlogPostBySlug,
} from '@/lib/content';
import comparisons from '@/content/comparisons.json';
import glossary from '@/content/glossary.json';
import industries from '@/content/industries.json';
import useCases from '@/content/use-cases.json';
import howtos from '@/content/how-to.json';
import guidesMeta from '@/content/guides-meta.json';

export const runtime = 'edge';

interface Resolved {
  title: string;
  subtitle: string;
  icon: string;
  badge: string;
  hue: { primary: string; secondary: string; deep: string };
}

const PURPLE = { primary: '#8B5CF6', secondary: '#C084FC', deep: '#4C1D95' };
const VIOLET_DEEP = { primary: '#7C3AED', secondary: '#A78BFA', deep: '#3B0764' };
const FUCHSIA = { primary: '#D946EF', secondary: '#F0ABFC', deep: '#86198F' };
const INDIGO = { primary: '#6366F1', secondary: '#A5B4FC', deep: '#312E81' };

// Stable slug → palette mapping so the same item always renders the same hue
function hueFor(slug: string) {
  const palettes = [PURPLE, VIOLET_DEEP, FUCHSIA, INDIGO];
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return palettes[h % palettes.length];
}

function resolve(kind: string, slug: string): Resolved | null {
  const hue = hueFor(slug);

  if (kind === 'product') {
    const p = getProductBySlug(slug);
    if (!p) return null;
    return {
      title: p.name,
      subtitle: p.shortDescription || '',
      icon: p.icon || '◆',
      badge: `$${p.price} · ${p.category}`,
      hue,
    };
  }
  if (kind === 'service') {
    const s = getServiceBySlug(slug);
    if (!s) return null;
    return {
      title: s.title,
      subtitle: s.shortDescription,
      icon: s.icon,
      badge: `${s.planMatch.charAt(0).toUpperCase() + s.planMatch.slice(1)} Tier`,
      hue,
    };
  }
  if (kind === 'case') {
    const c = getCaseStudyBySlug(slug);
    if (!c) return null;
    return {
      title: c.companyName,
      subtitle: c.headline,
      icon: '◆',
      badge: c.industry,
      hue,
    };
  }
  if (kind === 'blog') {
    const b = getBlogPostBySlug(slug);
    if (!b) return null;
    return {
      title: b.title || '',
      subtitle: b.excerpt || '',
      icon: '▾',
      badge: b.category || 'Article',
      hue,
    };
  }
  if (kind === 'compare') {
    const c = comparisons.find((x) => x.slug === slug);
    if (!c) return null;
    return {
      title: c.title,
      subtitle: c.summary?.slice(0, 140) || '',
      icon: '↔',
      badge: 'Comparison',
      hue,
    };
  }
  if (kind === 'glossary') {
    const g = glossary.find((x) => x.slug === slug);
    if (!g) return null;
    return {
      title: g.term,
      subtitle: g.definition.slice(0, 160),
      icon: '☰',
      badge: 'Glossary · ' + g.category,
      hue,
    };
  }
  if (kind === 'industry') {
    const i = industries.find((x) => x.slug === slug);
    if (!i) return null;
    return {
      title: `AI Automation for ${i.name}`,
      subtitle: i.hero.tagline,
      icon: '◇',
      badge: 'Industry',
      hue,
    };
  }
  if (kind === 'use-case') {
    const u = useCases.find((x) => x.slug === slug);
    if (!u) return null;
    return {
      title: u.name,
      subtitle: u.tagline,
      icon: '◬',
      badge: 'Use Case',
      hue,
    };
  }
  if (kind === 'how-to') {
    const h = howtos.find((x) => x.slug === slug);
    if (!h) return null;
    return {
      title: h.h1,
      subtitle: h.summary.slice(0, 160),
      icon: '⟶',
      badge: 'How-To Guide',
      hue,
    };
  }
  if (kind === 'guide') {
    const g = guidesMeta.find((x) => x.slug === slug);
    if (!g) return null;
    return {
      title: g.title,
      subtitle: g.description.slice(0, 160),
      icon: '◈',
      badge: `Definitive Guide · ${g.readTime} min`,
      hue,
    };
  }
  return null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ kind: string; slug: string }> },
) {
  const { kind, slug } = await params;
  const data = resolve(kind, slug);

  if (!data) {
    return new Response('Not Found', { status: 404 });
  }

  const { title, subtitle, icon, badge, hue } = data;
  const truncatedTitle = title.length > 80 ? title.slice(0, 80) + '…' : title;
  const truncatedSubtitle = subtitle.length > 130 ? subtitle.slice(0, 130) + '…' : subtitle;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0A0613',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Aurora gradient blob 1 */}
        <div
          style={{
            position: 'absolute',
            top: -200,
            left: -100,
            width: 700,
            height: 700,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${hue.primary}55, transparent 70%)`,
            filter: 'blur(60px)',
            display: 'flex',
          }}
        />
        {/* Aurora gradient blob 2 */}
        <div
          style={{
            position: 'absolute',
            bottom: -150,
            right: -100,
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${hue.secondary}33, transparent 70%)`,
            filter: 'blur(60px)',
            display: 'flex',
          }}
        />
        {/* Grid overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(42, 31, 61, 0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(42, 31, 61, 0.6) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            opacity: 0.5,
            display: 'flex',
          }}
        />
        {/* Subtle radial vignette */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at center, transparent 30%, rgba(10, 6, 19, 0.6) 100%)',
            display: 'flex',
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            padding: 64,
            width: '100%',
            height: '100%',
          }}
        >
          {/* Top row: logo + badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  border: `2px solid ${hue.primary}`,
                  borderRadius: 11,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 30,
                  color: hue.primary,
                }}
              >
                A
              </div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 28,
                  color: '#E5E7EB',
                  display: 'flex',
                }}
              >
                Aip<span style={{ color: hue.primary }}>rosol</span>
              </div>
            </div>
            {badge && (
              <div
                style={{
                  display: 'flex',
                  padding: '10px 20px',
                  background: `${hue.primary}22`,
                  border: `1.5px solid ${hue.primary}`,
                  borderRadius: 999,
                  color: hue.primary,
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                {badge}
              </div>
            )}
          </div>

          {/* Main row: orb + text */}
          <div
            style={{
              display: 'flex',
              flex: 1,
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 56,
              marginTop: 36,
            }}
          >
            {/* Text */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 22,
                maxWidth: 640,
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 60,
                  lineHeight: 1.05,
                  color: '#E5E7EB',
                  letterSpacing: '-0.015em',
                  display: 'flex',
                }}
              >
                {truncatedTitle}
              </div>
              {truncatedSubtitle && (
                <div
                  style={{
                    fontSize: 22,
                    color: '#9CA3B5',
                    lineHeight: 1.45,
                    display: 'flex',
                  }}
                >
                  {truncatedSubtitle}
                </div>
              )}
            </div>

            {/* Orb with concentric rings */}
            <div
              style={{
                position: 'relative',
                width: 320,
                height: 320,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {/* Outer ring */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  border: `1px solid ${hue.primary}66`,
                  borderRadius: '50%',
                  display: 'flex',
                }}
              />
              {/* Middle ring */}
              <div
                style={{
                  position: 'absolute',
                  inset: 28,
                  border: `1px solid ${hue.secondary}99`,
                  borderRadius: '50%',
                  display: 'flex',
                }}
              />
              {/* Inner glow */}
              <div
                style={{
                  position: 'absolute',
                  inset: 60,
                  borderRadius: '50%',
                  background: `radial-gradient(circle at 30% 30%, ${hue.secondary}, ${hue.primary} 50%, ${hue.deep} 100%)`,
                  boxShadow: `0 0 80px ${hue.primary}cc`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 110,
                }}
              >
                {icon}
              </div>
              {/* Orbital particles */}
              <div
                style={{
                  position: 'absolute',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: hue.secondary,
                  top: 8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: hue.primary,
                  bottom: 28,
                  right: 36,
                  display: 'flex',
                }}
              />
            </div>
          </div>

          {/* Bottom row: tagline */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              fontSize: 16,
              color: '#9CA3B5',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            <span style={{ width: 32, height: 1, background: hue.primary, display: 'flex' }} />
            <span>Automate the boring · Scale the important</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        // Cache aggressively · regenerate weekly
        'Cache-Control': 'public, max-age=604800, s-maxage=604800, immutable',
      },
    },
  );
}
