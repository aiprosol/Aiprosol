// ─────────────────────────────────────────────────────────────────────────
// AIPROSOL · Edge middleware
// Sets a `aiprosol_segment` cookie on every request based on three signals:
//   1. Vercel-provided geo (country code)
//   2. ?utm_source / ?utm_industry / ?utm_campaign query params
//   3. Time-of-day in the visitor's likely timezone
//
// The cookie is read server-side by `lib/personalize.ts` to reorder home
// page sections. It expires in 7 days. No personal data — just enum codes.
// ─────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  COOKIE_NAME, COOKIE_MAX_AGE,
  encodeSegment, decodeSegment,
  regionFromCountry, industryFromString,
  sourceFromUtm, daypartFromUtc,
  type VisitorSegment,
} from '@/lib/personalize';
import { getSessionFromRequest } from '@/lib/auth';

// Pages that require an authenticated session. Anything matching these
// prefixes redirects to /login?next=<path> when there's no session cookie.
const PROTECTED_PREFIXES = ['/dashboard', '/account', '/settings', '/admin'];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(p => pathname === p || pathname.startsWith(`${p}/`));
}

export const config = {
  // Only run on HTML page navigations — skip API, static, image routes
  matcher: [
    '/((?!api|_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\..*).*)',
  ],
};

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const params = url.searchParams;

  // ── Auth gate (runs before the segment logic so unauth'd users redirect early) ──
  if (isProtected(url.pathname)) {
    const session = await getSessionFromRequest(req);
    if (!session) {
      const loginUrl = new URL('/login', url.origin);
      loginUrl.searchParams.set('next', url.pathname + url.search);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── Read existing segment ──
  const existingRaw = req.cookies.get(COOKIE_NAME)?.value;
  const existing = existingRaw ? decodeSegment(existingRaw) : null;

  // ── Build a fresh segment from request signals ──
  // Vercel/Next adds geo onto the request — fall back to header for self-host
  const country =
    (req as unknown as { geo?: { country?: string } }).geo?.country ??
    req.headers.get('x-vercel-ip-country') ??
    null;
  const region = regionFromCountry(country);

  // UTM industry signal can come from a `utm_industry` param or the campaign label
  const utmIndustry = params.get('utm_industry') || params.get('utm_campaign');
  const utmSource = params.get('utm_source');
  const utmContent = params.get('utm_content');
  const referer = req.headers.get('referer');

  // First non-empty signal wins for industry
  const industry =
    industryFromString(utmIndustry) !== 'unknown' ? industryFromString(utmIndustry) :
    industryFromString(utmContent) !== 'unknown' ? industryFromString(utmContent) :
    industryFromString(referer) !== 'unknown' ? industryFromString(referer) :
    existing?.industry ?? 'unknown';

  const source = utmSource
    ? sourceFromUtm(utmSource)
    : existing?.source ?? (referer ? 'organic' : 'direct');

  const daypart = daypartFromUtc(new Date(), region);

  const fresh: VisitorSegment = {
    region,
    industry,
    source,
    daypart,
    populated: true,
  };

  const encoded = encodeSegment(fresh);
  const res = NextResponse.next();
  const cookieChanged = encoded !== existingRaw;

  // Only write cookie when value actually changed — saves a Set-Cookie roundtrip on most requests
  if (cookieChanged) {
    res.cookies.set({
      name: COOKIE_NAME,
      value: encoded,
      maxAge: COOKIE_MAX_AGE,
      httpOnly: false, // readable by client JS for personalisation reasons
      sameSite: 'lax',
      path: '/',
    });
  }

  // CDN cache override — only the homepage personalises by segment cookie
  // (HomeCases + HomeServices reorder by industry). Every other public route
  // ignores the segment entirely, so it's safe to let the Vercel edge cache
  // serve them to returning visitors. The previous default (`private,
  // no-cache, no-store`) forced a re-render on every visit even when the
  // content was identical. The override only fires when:
  //   1. The cookie didn't change (returning visitor)
  //   2. The path is NOT the homepage
  //   3. The path is NOT auth-gated
  //
  // First-time visitors still get the uncached path because Set-Cookie is
  // present. That's correct.
  const path = url.pathname;
  const isHome = path === '/';
  const isAuthGated = isProtected(path);
  if (!cookieChanged && !isHome && !isAuthGated) {
    // 2 min fresh · 10 min stale-while-revalidate · public so the CDN caches it
    res.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600');
  }

  return res;
}
