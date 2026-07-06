import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getLocaleFromCookies } from '@/lib/locale/locale.server';
import { getMetadata } from '@/lib/seo/seo';
import { RecipeService } from '@/lib/services/RecipeService';
import { PUBLIC_ROUTES } from '@/types/routes';
import RecipeDetailClient from './RecipeDetailClient';

interface RecipeDetailPageProps {
  params: Promise<{ id: string }>;
}

interface RecipeSeoFields {
  id: string;
  slug: string | null;
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
    recipe = (await RecipeService.getRecipeBySlugOrId(id)) as RecipeSeoFields;
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
  const canonicalPath = `${PUBLIC_ROUTES.RECIPES}/${recipe.slug ?? recipe.id}`;

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

  // Slug-based SEO URLs: if this recipe has a slug and was reached through
  // its raw id, redirect permanently to the canonical slug URL. Old id-based
  // links keep working because getRecipeBySlugOrId resolves both.
  const recipe = (await RecipeService.getRecipeBySlugOrId(id).catch(
    () => null,
  )) as RecipeSeoFields | null;

  if (recipe?.slug && recipe.slug !== id) {
    redirect(`${PUBLIC_ROUTES.RECIPES}/${recipe.slug}`);
  }

  return (
    <Suspense>
      <RecipeDetailClient recipeId={id} />
    </Suspense>
  );
}
