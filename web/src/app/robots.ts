import type { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://aiprosol.com';

// ─────────────────────────────────────────────────────────────────────────
// robots.txt
//
// GEO strategy (May 2026): we INVITE the AI crawlers. Aiprosol's
// positioning depends on showing up in Claude, ChatGPT, Perplexity,
// Google AI Overviews etc. when prospects ask "best AI automation
// consultancy" / "how to automate lead routing" / similar.
//
// Bots explicitly allowed:
//   • GPTBot          — OpenAI crawler for ChatGPT training + browse
//   • OAI-SearchBot   — OpenAI's SearchGPT/ChatGPT browse
//   • ChatGPT-User    — ChatGPT browse on behalf of a user
//   • anthropic-ai    — Claude training crawl
//   • Claude-Web      — Claude real-time web browse
//   • ClaudeBot       — Anthropic's general crawler
//   • PerplexityBot   — Perplexity's index crawler
//   • Perplexity-User — Perplexity real-time browse
//   • Google-Extended — Google AI training (Gemini)
//   • Bingbot         — Bing index → feeds ChatGPT browse
//   • CCBot           — Common Crawl → feeds most open-source LLMs
//   • Applebot-Extended — Apple Intelligence training
//   • Meta-ExternalAgent — Meta AI training
//   • Bytespider      — TikTok/ByteDance LLM training
//
// Still blocked:
//   • /api/, /studio/, /checkout/, /_next/, /admin/, /inbox/, /dashboard/,
//     /settings/, /account/ — private + admin surfaces with no SEO value.
// ─────────────────────────────────────────────────────────────────────────

export default function robots(): MetadataRoute.Robots {
  const PRIVATE = ['/api/', '/studio/', '/checkout/', '/_next/', '/admin/', '/inbox/', '/dashboard/', '/settings/', '/account/'];

  return {
    rules: [
      // Default: everyone allowed except private surfaces
      {
        userAgent: '*',
        allow: '/',
        disallow: PRIVATE,
      },
      // Explicit allow + same private-disallow for every AI crawler we care
      // about. Listing them explicitly is the GEO signal: we WANT to be in
      // their index. Some bots only honor named user-agent rules, not '*'.
      {
        userAgent: [
          'GPTBot',
          'OAI-SearchBot',
          'ChatGPT-User',
          'anthropic-ai',
          'Claude-Web',
          'ClaudeBot',
          'PerplexityBot',
          'Perplexity-User',
          'Google-Extended',
          'Googlebot',
          'Bingbot',
          'CCBot',
          'Applebot-Extended',
          'Meta-ExternalAgent',
          'Bytespider',
          'cohere-ai',
          'YouBot',
          'Diffbot',
          'Amazonbot',
        ],
        allow: '/',
        disallow: PRIVATE,
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
