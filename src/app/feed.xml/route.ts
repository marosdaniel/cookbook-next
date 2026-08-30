import { prisma } from '@/lib/prisma/prisma';
import { getSiteUrl } from '@/lib/seo/site';
import { PUBLIC_ROUTES } from '@/types/routes';

export const revalidate = 3600;

const FEED_ITEM_LIMIT = 20;
const FEED_DESCRIPTION_MAX_LENGTH = 300;

// RSS/XML requires these five characters to be escaped in text nodes and attributes.
const escapeXml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

export async function GET() {
  const siteUrl = getSiteUrl();
  const feedUrl = `${siteUrl}/feed.xml`;

  const recipes = await prisma.recipe.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: FEED_ITEM_LIMIT,
  });

  const items = recipes
    .map((recipe) => {
      const url = `${siteUrl}${PUBLIC_ROUTES.RECIPE_DETAIL(recipe.slug ?? recipe.id)}`;
      const description = recipe.description
        ? escapeXml(recipe.description.slice(0, FEED_DESCRIPTION_MAX_LENGTH))
        : '';

      return `
    <item>
      <title>${escapeXml(recipe.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${recipe.createdAt.toUTCString()}</pubDate>
      <description>${description}</description>
    </item>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Cookbook — Latest recipes</title>
    <link>${siteUrl}</link>
    <description>The newest recipes shared on Cookbook.</description>
    <language>en-gb</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}
