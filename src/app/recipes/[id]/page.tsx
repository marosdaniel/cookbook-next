import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { cache, Suspense } from 'react';
import { getLocaleFromCookies } from '@/lib/locale/locale.server';
import { buildRecipeJsonLd, getMetadata } from '@/lib/seo/seo';
import { getSiteUrl } from '@/lib/seo/site';
import { RecipeService } from '@/lib/services/RecipeService';
import type { RecipeDetail } from '@/types/recipe';
import { PUBLIC_ROUTES } from '@/types/routes';
import RecipeDetailClient from './RecipeDetailClient';

interface RecipeDetailPageProps {
  params: Promise<{ id: string }>;
}

const SEO_DESCRIPTION_MAX_LENGTH = 160;

const getRecipe = cache((id: string) => RecipeService.getRecipeBySlugOrId(id));

const isRecipeNotFoundError = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'extensions' in error &&
  typeof error.extensions === 'object' &&
  error.extensions !== null &&
  'code' in error.extensions &&
  error.extensions.code === 'NOT_FOUND';

type RecipeLookupResult = Omit<RecipeDetail, 'preparationSteps'> & {
  createdAt?: Date;
  updatedAt?: Date;
  preparationSteps: Array<{
    id?: string;
    localId?: string;
    description: string;
    order: number;
  }>;
};

const toInitialRecipe = (recipe: RecipeLookupResult): RecipeDetail => ({
  id: recipe.id,
  slug: recipe.slug,
  title: recipe.title,
  description: recipe.description,
  seoTitle: recipe.seoTitle,
  seoDescription: recipe.seoDescription,
  socialImage: recipe.socialImage,
  imgSrc: recipe.imgSrc,
  cookingTime: recipe.cookingTime,
  servings: recipe.servings,
  youtubeLink: recipe.youtubeLink,
  createdBy: recipe.createdBy,
  category: recipe.category,
  difficultyLevel: recipe.difficultyLevel,
  labels: recipe.labels,
  ingredients: recipe.ingredients,
  preparationSteps: recipe.preparationSteps.map((step) => ({
    localId: step.localId ?? step.id ?? `${step.order}`,
    description: step.description,
    order: step.order,
  })),
  prepTimeMinutes: recipe.prepTimeMinutes,
  cookTimeMinutes: recipe.cookTimeMinutes,
  restTimeMinutes: recipe.restTimeMinutes,
  totalTimeMinutes: recipe.totalTimeMinutes,
  servingUnit: recipe.servingUnit,
  cuisine: recipe.cuisine,
  dietaryFlags: recipe.dietaryFlags,
  allergens: recipe.allergens,
  equipment: recipe.equipment,
  costLevel: recipe.costLevel,
  tips: recipe.tips,
  substitutions: recipe.substitutions,
  averageRating: 0,
  ratingsCount: 0,
  userRating: null,
  isFavorite: false,
});

export async function generateMetadata({
  params,
}: RecipeDetailPageProps): Promise<Metadata> {
  const locale = await getLocaleFromCookies();
  const { id } = await params;

  let recipe: RecipeLookupResult;
  try {
    recipe = (await getRecipe(id)) as RecipeLookupResult;
  } catch (error) {
    if (isRecipeNotFoundError(error)) {
      return {
        title: 'Recipe not found',
        robots: { index: false, follow: false },
      };
    }

    throw error;
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
  let recipe: RecipeLookupResult;
  try {
    recipe = (await getRecipe(id)) as RecipeLookupResult;
  } catch (error) {
    if (isRecipeNotFoundError(error)) {
      notFound();
    }

    throw error;
  }

  if (recipe?.slug && recipe.slug !== id) {
    permanentRedirect(`${PUBLIC_ROUTES.RECIPES}/${recipe.slug}`);
  }

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be emitted as script text.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildRecipeJsonLd(
              toInitialRecipe(recipe),
              `${getSiteUrl()}${PUBLIC_ROUTES.RECIPES}/${recipe.slug ?? recipe.id}`,
              { createdAt: recipe.createdAt, updatedAt: recipe.updatedAt },
            ),
          ).replaceAll('<', String.raw`\u003c`),
        }}
      />
      <Suspense>
        <RecipeDetailClient
          recipeId={id}
          initialRecipe={toInitialRecipe(recipe)}
        />
      </Suspense>
    </>
  );
}
