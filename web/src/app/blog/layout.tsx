import type { Metadata } from 'next';
import { getBlogPosts } from '@/lib/content';
import { findAuthor } from '@/lib/authors';

export const metadata: Metadata = {
  title: 'Blog · Tactical AI automation playbooks, not theory',
  description:
    'Operator-grade essays on AI automation — the patterns that survive production and the antipatterns that don\'t. Written by Arora (AI), reviewed by Srijan.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Aiprosol Blog',
    description: 'Tactical AI automation playbooks. Patterns that survive production.',
    url: '/blog',
    type: 'website',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aiprosol.com';
  const posts = getBlogPosts();

  // Blog schema with explicit blogPost list = lets Google + LLMs enumerate
  // every Aiprosol essay as part of one editorial entity rather than seven
  // unrelated articles. Pairs with the per-post BlogPosting in [slug]/layout.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Blog',
        '@id': `${siteUrl}/blog#blog`,
        url: `${siteUrl}/blog`,
        name: 'Aiprosol Blog',
        description:
          'Operator-grade essays on AI automation. Patterns that survive production; antipatterns that don\'t.',
        inLanguage: 'en',
        publisher: { '@id': `${siteUrl}/#organization` },
        blogPost: posts.map((p) => {
          const author = findAuthor(p.author);
          return {
            '@type': 'BlogPosting',
            '@id': `${siteUrl}/blog/${p.slug}#article`,
            headline: p.title,
            url: `${siteUrl}/blog/${p.slug}`,
            // `author` is required by schema.org for BlogPosting. Reference
            // the canonical Person/SoftwareApplication entity from root layout
            // so the same identity isn't duplicated across N posts.
            author: author
              ? { '@id': author.jsonLdId }
              : { '@id': `${siteUrl}/#srijan-paudel` },
            // `image` is strongly recommended — point at each post's OG image
            // (Next.js dynamically renders /blog/[slug]/opengraph-image).
            image: `${siteUrl}/blog/${p.slug}/opengraph-image`,
            ...(p.publishedDate && { datePublished: p.publishedDate }),
            ...(p.excerpt && { description: p.excerpt.slice(0, 200) }),
          };
        }),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteUrl}/blog` },
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
