// /authors/[slug] — metadata + JSON-LD layout
// Person (Srijan) or SoftwareApplication (Arora) schema referenced by @id to
// the root-layout entities. ItemList of authored posts. BreadcrumbList.

import type { Metadata } from 'next';
import { AUTHOR_SLUGS, getAuthor, postsByAuthor, type AuthorSlug } from '@/lib/authors';

export function generateStaticParams() {
  return AUTHOR_SLUGS.map((slug) => ({ slug }));
}

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const author = getAuthor(slug);
  if (!author) return { title: 'Author not found' };
  return {
    title: `${author.displayName} · author archive`,
    description: author.bio,
    alternates: { canonical: `/authors/${slug}` },
    openGraph: {
      title: `${author.displayName} · author archive · Aiprosol`,
      description: author.bio,
      url: `/authors/${slug}`,
      type: 'profile',
      images: [{ url: author.image, width: 1200, height: 630, alt: author.displayName }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${author.displayName} · Aiprosol`,
      description: author.bio,
      creator: `@${author.twitter}`,
      images: [author.image],
    },
  };
}

export default async function AuthorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const author = getAuthor(slug);
  if (!author) return <>{children}</>;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aiprosol.com';
  const posts = postsByAuthor(slug as AuthorSlug);

  // Entity reference — Person or SoftwareApplication, both already declared
  // in root layout with the same @id.
  const authorEntity = {
    '@type': author.type,
    '@id': author.jsonLdId,
    name: author.displayName,
    description: author.longBio,
    url: `${siteUrl}${author.homepage}`,
    image: author.image.startsWith('http') ? author.image : `${siteUrl}${author.image}`,
    ...(author.wikidataId && {
      identifier: {
        '@type': 'PropertyValue',
        propertyID: `https://www.wikidata.org/entity/${author.wikidataId}`,
        value: author.wikidataId,
      },
      sameAs: [
        `https://www.wikidata.org/wiki/${author.wikidataId}`,
        ...author.externalLinks.filter((l) => l.url.startsWith('http')).map((l) => l.url),
      ],
    }),
    ...(!author.wikidataId && {
      sameAs: author.externalLinks.filter((l) => l.url.startsWith('http')).map((l) => l.url),
    }),
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        // ProfilePage is the schema.org-recommended page type for an
        // author / individual archive (more specific than CollectionPage).
        // Adding CollectionPage in the @type union preserves the "archive
        // of items" semantics while signalling profile-page intent to AI
        // answer engines, which preferentially extract ProfilePage when
        // answering "who is X?" questions.
        '@type': ['ProfilePage', 'CollectionPage'],
        '@id': `${siteUrl}/authors/${slug}#page`,
        url: `${siteUrl}/authors/${slug}`,
        name: `${author.displayName} · author archive · Aiprosol`,
        description: author.bio,
        about: { '@id': author.jsonLdId },
        mainEntity: { '@id': author.jsonLdId },
        publisher: { '@id': `${siteUrl}/#organization` },
        inLanguage: 'en',
      },
      // Always re-declare the author entity here too, so this URL stands alone
      // when consumed without the root layout.
      authorEntity,
      {
        '@type': 'ItemList',
        '@id': `${siteUrl}/authors/${slug}#itemlist`,
        name: `Essays by ${author.displayName}`,
        numberOfItems: posts.length,
        itemListElement: posts.map((p, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          url: `${siteUrl}/blog/${p.slug}`,
          item: {
            '@type': 'BlogPosting',
            '@id': `${siteUrl}/blog/${p.slug}#article`,
            headline: p.title,
            url: `${siteUrl}/blog/${p.slug}`,
            ...(p.publishedDate && { datePublished: p.publishedDate }),
            ...(p.excerpt && { description: p.excerpt.slice(0, 200) }),
            author: { '@id': author.jsonLdId },
            publisher: { '@id': `${siteUrl}/#organization` },
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'Authors', item: `${siteUrl}/authors` },
          { '@type': 'ListItem', position: 3, name: author.displayName, item: `${siteUrl}/authors/${slug}` },
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
