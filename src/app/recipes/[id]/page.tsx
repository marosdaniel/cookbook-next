import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getLocaleFromCookies } from '@/lib/locale/locale.server';
import { getMetadata } from '@/lib/seo/seo';
import { RecipeService } from '@/lib/services/RecipeService';
import RecipeDetailClient from './RecipeDetailClient';

interface RecipeDetailPageProps {
  params: Promise<{ id: string }>;
}

interface RecipeSeoFields {
  id: string;
  title: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  socialImage: string | null;
  imgSrc: string | null;
}

const SEO_DESCRIPTION_MAX_LENGTH = 160;

export async function generateMetadata({
  params,
}: RecipeDetailPageProps): Promise<Metadata> {
  const locale = await getLocaleFromCookies();
  const { id } = await params;

  let recipe: RecipeSeoFields;
  try {
    recipe = (await RecipeService.getRecipeById(id)) as RecipeSeoFields;
  } catch {
    return {
      title: 'Recipe not found',
      robots: { index: false, follow: false },
    };
  }

  const fallback = await getMetadata(locale, 'seo', {
    titleKey: 'recipeDetailTitle',
    descriptionKey: 'recipeDetailDescription',
    fallbackTitle: 'Recipe Details',
    fallbackDescription:
      'View recipe details, ingredients and preparation steps.',
    keywordsKey: 'recipeDetailKeywords',
    fallbackKeywords: 'recipe, cooking, ingredients, meal',
    openGraph: { type: 'article' },
  });

  const title = recipe.seoTitle?.trim()
    ? `${recipe.seoTitle} | Cookbook`
    : `${recipe.title} | Cookbook`;
  const description =
    recipe.seoDescription?.trim() ||
    recipe.description?.slice(0, SEO_DESCRIPTION_MAX_LENGTH) ||
    (typeof fallback.description === 'string'
      ? fallback.description
      : undefined);
  const image = recipe.socialImage ?? recipe.imgSrc ?? undefined;
  const canonicalPath = `/recipes/${recipe.id}`;

  return {
    title,
    description,
    keywords: fallback.keywords,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonicalPath,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: { card: 'summary_large_image', title, description },
  };
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
