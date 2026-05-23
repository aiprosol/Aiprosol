import { ImageResponse } from 'next/og';

export const alt = 'Aiprosol — Automate the boring. Scale the important.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
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
        {/* Aurora blob */}
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

        {/* Logo — real "A with arrow" mark, fetched from the live site at OG
            render time. Replaces the placeholder "A-in-box" that mistakenly
            shipped earlier. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: 'auto' }}>
          <img
            src="https://aiprosol.com/logo.png"
            width={64}
            height={64}
            style={{ borderRadius: '12px' }}
            alt=""
          />
          <div
            style={{
              fontFamily: 'system-ui',
              fontWeight: 800,
              fontSize: '36px',
              color: '#E5E7EB',
              display: 'flex',
            }}
          >
            Aip<span style={{ color: '#8B5CF6' }}>rosol</span>
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            fontFamily: 'system-ui',
            fontWeight: 800,
            fontSize: '88px',
            lineHeight: 1.05,
            color: '#E5E7EB',
            display: 'flex',
            flexDirection: 'column',
            marginTop: '40px',
          }}
        >
          <div>Automate the boring.</div>
          <div
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #C084FC)',
              backgroundClip: 'text',
              color: 'transparent',
              display: 'flex',
            }}
          >
            Scale the important.
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            gap: '40px',
            marginTop: '40px',
            paddingTop: '32px',
            borderTop: '1px solid #2A1F3D',
          }}
        >
          <Stat value="340%" label="Avg ROI" />
          <Stat value="35+" label="Hrs/wk saved" />
          <Stat value="19" label="Products" />
          <Stat value="11" label="AI Services" />
        </div>
      </div>
    ),
    { ...size },
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          fontFamily: 'system-ui',
          fontWeight: 800,
          fontSize: '44px',
          background: 'linear-gradient(135deg, #8B5CF6, #C084FC)',
          backgroundClip: 'text',
          color: 'transparent',
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: 'system-ui',
          fontSize: '16px',
          color: '#9CA3B5',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginTop: '8px',
        }}
      >
        {label}
      </div>
    </div>
  );
}
