import { ImageResponse } from 'next/og';

// Shared 1200×630 OG-image template. Used by every per-page opengraph-image.tsx
// route. Pass the page-specific eyebrow, headline lines, and 3-4 highlights.
export interface OGProps {
  eyebrow: string;
  headlineTop: string;
  headlineBottom: string;
  highlights: Array<{ value: string; label: string }>;
}

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

export function renderOG(props: OGProps): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0A0613',
          display: 'flex',
          flexDirection: 'column',
          padding: '64px',
          position: 'relative',
        }}
      >
        {/* Aurora blob — same accent as homepage hero */}
        <div
          style={{
            position: 'absolute',
            top: '-200px',
            left: '-100px',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(139, 92, 246,0.25), transparent 70%)',
            filter: 'blur(40px)',
            display: 'flex',
          }}
        />

        {/* Eyebrow + Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'auto' }}>
          <div
            style={{
              fontFamily: 'system-ui',
              fontSize: '18px',
              color: '#8B5CF6',
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              fontWeight: 700,
              display: 'flex',
            }}
          >
            {props.eyebrow}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Real Aiprosol logo (the "A with arrow" mark) — fetched at OG
                render time from the live site. Replaces the placeholder
                "A-in-box" that mistakenly shipped earlier. */}
            <img
              src="https://aiprosol.com/logo.png"
              width={48}
              height={48}
              style={{ borderRadius: '10px' }}
              alt=""
            />
            <div
              style={{
                fontFamily: 'system-ui',
                fontWeight: 800,
                fontSize: '28px',
                color: '#E5E7EB',
                display: 'flex',
              }}
            >
              Aip<span style={{ color: '#8B5CF6' }}>rosol</span>
            </div>
          </div>
        </div>

        {/* Headline (two lines, second line gradient) */}
        <div
          style={{
            fontFamily: 'system-ui',
            fontWeight: 800,
            fontSize: '76px',
            lineHeight: 1.05,
            color: '#E5E7EB',
            display: 'flex',
            flexDirection: 'column',
            marginTop: '40px',
          }}
        >
          <div>{props.headlineTop}</div>
          <div
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #C084FC)',
              backgroundClip: 'text',
              color: 'transparent',
              display: 'flex',
            }}
          >
            {props.headlineBottom}
          </div>
        </div>

        {/* Highlights row */}
        <div
          style={{
            display: 'flex',
            gap: '48px',
            marginTop: '40px',
            paddingTop: '32px',
            borderTop: '1px solid #2A1F3D',
          }}
        >
          {props.highlights.map((h, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  fontFamily: 'system-ui',
                  fontWeight: 800,
                  fontSize: '42px',
                  background: 'linear-gradient(135deg, #8B5CF6, #C084FC)',
                  backgroundClip: 'text',
                  color: 'transparent',
                  lineHeight: 1,
                }}
              >
                {h.value}
              </div>
              <div
                style={{
                  fontFamily: 'system-ui',
                  fontSize: '15px',
                  color: '#9CA3B5',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginTop: '8px',
                }}
              >
                {h.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
