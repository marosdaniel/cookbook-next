import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma/prisma';
import { getSiteUrl } from '@/lib/seo/site';

export const revalidate = 3600;
export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const recipes = await prisma.recipe.findMany({
    where: {},
    select: { id: true, slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  });

  const siteUrl = getSiteUrl();

  return [
    {
      url: siteUrl,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/recipes`,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/privacy-policy`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/cookie-policy`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    ...recipes.map((recipe) => ({
      url: `${siteUrl}/recipes/${recipe.slug ?? recipe.id}`,
      lastModified: recipe.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
