import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      // Allow Wix-hosted images while we still have CMS data on Wix
      { protocol: 'https', hostname: 'static.wixstatic.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  experimental: {
    optimizePackageImports: ['framer-motion', 'three'],
  },
  async redirects() {
    // Removed 2026-05-17 — consolidating brand surfaces. Redirect old URLs to
    // their canonical replacements so existing inbound links + indexed pages
    // pass ranking signal rather than 404.
    return [
      { source: '/bio',       destination: '/founder',      permanent: true },
      { source: '/now',       destination: '/agents/arora', permanent: true },
      { source: '/uses',      destination: '/about',        permanent: true },
      { source: '/team',      destination: '/agents',       permanent: true },
      { source: '/results',   destination: '/agents',       permanent: true },
      { source: '/changelog', destination: '/blog',         permanent: true },
      { source: '/affiliate', destination: '/pricing',      permanent: true },
    ];
  },
  async headers() {
    // Content-Security-Policy — practical version. Allows inline scripts/styles
    // (Next.js inlines its bootstrap + we inline JSON-LD + many components ship
    // their own <style> blocks), but locks down everything else. Tighten later
    // by switching to nonce-based once we audit every inline script.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://eu.i.posthog.com https://us-assets.i.posthog.com https://us.i.posthog.com https://js.stripe.com https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      "media-src 'self' data: blob:",
      "connect-src 'self' https://eu.i.posthog.com https://us.i.posthog.com https://api.groq.com https://api.stripe.com https://vitals.vercel-insights.com https://api.resend.com",
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self' https://checkout.stripe.com",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ];
  },
};

export default nextConfig;
