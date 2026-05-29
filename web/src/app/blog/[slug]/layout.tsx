import type { Metadata } from 'next';
import { getBlogPosts, getBlogPostBySlug } from '@/lib/content';
import { findAuthor } from '@/lib/authors';

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) {
    return {
      title: 'Article not found',
      description: 'This article is no longer available. Browse the Aiprosol blog.',
    };
  }
  const excerpt =
    (post as { excerpt?: string }).excerpt ||
    (post as { summary?: string }).summary ||
    (post as { description?: string }).description ||
    '';
  // Meta descriptions should stay under ~160 chars (Google truncates beyond
  // that). Truncate on a word boundary with an ellipsis rather than a hard
  // 200-char cut that ran over the limit + chopped mid-word. Applies to every
  // blog post, not just long ones.
  const description = (() => {
    const MAX = 155;
    if (excerpt.length <= MAX) return excerpt;
    const cut = excerpt.slice(0, MAX);
    const lastSpace = cut.lastIndexOf(' ');
    return (lastSpace > 40 ? cut.slice(0, lastSpace) : cut).replace(/[\s.,;:—-]+$/, '') + '…';
  })();
  const image =
    (post as { coverImage?: string }).coverImage ||
    (post as { image?: string }).image ||
    `/api/og/post/${slug}`;
  // Resolve per-post twitter:creator from the post's author. We don't yet own
  // an @aiprosol company handle on X (that handle belongs to the unrelated
  // Australian firm aiprosol.au), so until a dedicated brand handle is
  // claimed, @srijanpaudel6 doubles as the founder + brand voice. Drop the
  // `site` field entirely rather than emit a misleading claim.
  const author = findAuthor(post.author);
  const creator = author ? `@${author.twitter}` : '@srijanpaudel6';
  return {
    title: post.title,
    description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description,
      url: `/blog/${slug}`,
      type: 'article',
      images: [{ url: image, width: 1280, height: 720, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: [image],
      creator,
    },
  };
}

export function generateStaticParams() {
  return getBlogPosts().map((p) => ({ slug: p.slug }));
}

export default async function BlogPostLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return <>{children}</>;

  // Article JSON-LD — enables Google Discover + Article carousel eligibility.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aiprosol.com';
  const p = post as {
    excerpt?: string;
    summary?: string;
    description?: string;
    coverImage?: string;
    image?: string;
    publishedAt?: string;
    updatedAt?: string;
    date?: string;
    author?: string | { name?: string };
    readingTime?: number | string;
  };
  const description = p.excerpt || p.summary || p.description || '';
  const image = p.coverImage || p.image || `${siteUrl}/api/og/post/${slug}`;
  const datePublished = p.publishedAt || p.date || new Date().toISOString();
  const dateModified = p.updatedAt || datePublished;
  const authorName =
    typeof p.author === 'string'
      ? p.author
      : (p.author && typeof p.author === 'object' && p.author.name) || 'Arora';

  // Resolve author to either the Srijan Person entity or the Arora
  // SoftwareApplication entity (both already declared in root layout).
  // Falls back to a literal Person ref for any other author names.
  const isSrijan = /srijan|paudel/i.test(authorName);
  const isArora = /arora/i.test(authorName);
  const authorRef = isSrijan
    ? { '@id': `${siteUrl}/#srijan-paudel` }
    : isArora
      ? { '@id': `${siteUrl}/#arora-ai-ceo` }
      : { '@type': 'Person', name: authorName };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${siteUrl}/blog/${slug}#article`,
        headline: post.title,
        description,
        image: image.startsWith('http') ? image : `${siteUrl}${image}`,
        datePublished,
        dateModified,
        url: `${siteUrl}/blog/${slug}`,
        // schema.org's preferred lighter form — URL string instead of nested WebPage
        mainEntityOfPage: `${siteUrl}/blog/${slug}`,
        author: authorRef,
        publisher: { '@id': `${siteUrl}/#organization` },
        inLanguage: 'en',
        articleSection: 'AI Automation',
        // Cross-reference the canonical entities the article is about.
        // about[] + mentions[] are the two fields AI engines (Perplexity,
        // ChatGPT, Gemini grounding) use to determine what an article
        // documents. Pointing at our canonical Org + Person + AI-CEO @ids
        // anchors every post to the central entity graph.
        about: [
          { '@id': `${siteUrl}/#organization` },
        ],
        mentions: [
          { '@id': `${siteUrl}/#organization` },
          { '@id': `${siteUrl}/#srijan-paudel` },
          { '@id': `${siteUrl}/#arora-ai-ceo` },
        ],
        // Speakable selectors — voice-assistant readout for "read me [post title]"
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['h1', 'article p:first-of-type', 'article h2'],
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteUrl}/blog` },
          { '@type': 'ListItem', position: 3, name: post.title, item: `${siteUrl}/blog/${slug}` },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
