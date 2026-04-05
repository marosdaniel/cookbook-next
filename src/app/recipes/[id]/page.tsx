import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getLocaleFromCookies } from '@/lib/locale/locale.server';
import { getMetadata } from '@/lib/seo/seo';
import RecipeDetailClient from './RecipeDetailClient';

interface RecipeDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromCookies();
  return getMetadata(locale, 'seo', {
    titleKey: 'recipeDetailTitle',
    descriptionKey: 'recipeDetailDescription',
    fallbackTitle: 'Recipe Details',
    fallbackDescription:
      'View recipe details, ingredients and preparation steps.',
    keywordsKey: 'recipeDetailKeywords',
    fallbackKeywords: 'recipe, cooking, ingredients, meal',
    openGraph: { type: 'article' },
  });
}

export default async function RecipeDetailPage({
  params,
}: Readonly<RecipeDetailPageProps>) {
  const { id } = await params;
  return (
    <Suspense>
      <RecipeDetailClient recipeId={id} />
    </Suspense>
  );
}
