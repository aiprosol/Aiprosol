// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · Design tokens (TS)
// Mirror of the @theme tokens in globals.css. Use these from JS/TS code
// (e.g., when setting Three.js material colors or canvas backgrounds).
// CSS-side uses Tailwind utilities (bg-bg, text-cyan, etc.).
// ─────────────────────────────────────────────────────────────────────────

export const COLORS = {
  bg: '#0A0613',
  bgDeep: '#050310',
  card: '#13101F',
  cardUp: '#1B1530',
  border: '#2A1F3D',
  borderUp: '#3D2F5C',
  cyan: '#8B5CF6',
  cyan2: '#C084FC',
  muted: '#9CA3B5',
  text: '#E5E7EB',
  textDim: '#C7CEDB',
  success: '#10B981',
  warn: '#F59E0B',
  error: '#EF4444',
} as const;

export const COLORS_HEX = {
  bg: 0x0A0613,
  bgDeep: 0x050E1A,
  card: 0x13101F,
  border: 0x2A1F3D,
  cyan: 0x8B5CF6,
  cyan2: 0xC084FC,
  text: 0xE5E7EB,
} as const;

export const FONTS = {
  display: 'var(--font-syne)',
  body: 'var(--font-dm-sans)',
} as const;

export const EASING = {
  out: 'cubic-bezier(0.16, 1, 0.3, 1)',
  inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;
