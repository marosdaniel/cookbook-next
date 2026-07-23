import type { Metadata } from 'next';
import { getLocaleMessages } from '@/lib/locale/locale';
import type { RecipeDetail } from '@/types/recipe';
import type { AuthMessages } from '../../types/common';

/**
 * Helper to build SEO metadata for any page using localized messages.
 *
 * @param locale    - locale string read from the cookie
 * @param namespace - the key in the messages object (e.g. 'seo', 'auth', 'user')
 * @param opts      - keys to look up and fallback values
 */
export const getMetadata = async (
  locale: string,
  namespace: string,
  opts: {
    titleKey: string;
    descriptionKey: string;
    fallbackTitle: string;
    fallbackDescription: string;
    titleTemplate?: string; // Optional template like "%s | Cookbook"
    canonicalPath?: string;
    keywordsKey?: string;
    fallbackKeywords?: string;
    robots?: {
      index?: boolean;
      follow?: boolean;
    };
    openGraph?: {
      type?: 'website' | 'article';
    };
  },
): Promise<Metadata> => {
  const messages = await getLocaleMessages(locale);
  const data = (messages[namespace] ?? {}) as Record<string, string>;

  const title =
    typeof data[opts.titleKey] === 'string'
      ? data[opts.titleKey]
      : opts.fallbackTitle;
  const description =
    typeof data[opts.descriptionKey] === 'string'
      ? data[opts.descriptionKey]
      : opts.fallbackDescription;

  const finalTitle = opts.titleTemplate
    ? opts.titleTemplate.replace('%s', title)
    : `${title} | Cookbook`;

  const keywords =
    opts.keywordsKey && typeof data[opts.keywordsKey] === 'string'
      ? data[opts.keywordsKey]
      : opts.fallbackKeywords;

  return {
    title: finalTitle,
    description,
    ...(keywords === undefined ? {} : { keywords }),
    ...(opts.robots === undefined ? {} : { robots: opts.robots }),
    ...(opts.canonicalPath === undefined
      ? {}
      : { alternates: { canonical: opts.canonicalPath } }),
    openGraph: {
      title: finalTitle,
      description,
      type: opts.openGraph?.type ?? 'website',
      ...(opts.canonicalPath === undefined ? {} : { url: opts.canonicalPath }),
    },
    twitter: {
      card: 'summary',
      title: finalTitle,
      description,
    },
  };
};

/**
 * Helper to build SEO metadata for auth‑related pages.
 *
 * @param locale - locale string read from the cookie
 * @param opts   - keys to look up in the `auth` namespace and fallback values
 */
export const getAuthMetadata = async (
  locale: string,
  opts: {
    titleKey: keyof AuthMessages;
    descriptionKey: keyof AuthMessages;
    fallbackTitle: string;
    fallbackDescription: string;
  },
): Promise<Metadata> => {
  return getMetadata(locale, 'auth', {
    ...opts,
    titleKey: String(opts.titleKey),
    descriptionKey: String(opts.descriptionKey),
  });
};

export const buildRecipeJsonLd = (
  recipe: RecipeDetail,
  url?: string,
  dates?: { createdAt?: Date; updatedAt?: Date },
) => {
  const ingredientList = recipe.ingredients
    .map((ingredient) => {
      const quantity = Number(ingredient.quantity);
      const amount = Number.isFinite(quantity) ? quantity : 1;
      const unit = ingredient.unit?.trim() ? `${ingredient.unit} ` : '';
      const name = ingredient.name?.trim() ?? '';

      return `${amount} ${unit}${name}`.trim();
    })
    .filter(Boolean);

  const instructions = recipe.preparationSteps
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((step) => ({
      '@type': 'HowToStep' as const,
      text: step.description,
    }));

  const totalTimeMinutes =
    recipe.totalTimeMinutes ?? recipe.cookTimeMinutes ?? recipe.cookingTime;
  const prepTimeMinutes = recipe.prepTimeMinutes ?? undefined;
  const cookTimeMinutes = recipe.cookTimeMinutes ?? recipe.cookingTime;

  const formatDuration = (minutes?: number | null) => {
    if (minutes === undefined || minutes === null || minutes <= 0) {
      return undefined;
    }

    return `PT${minutes}M`;
  };

  const aggregateRating =
    recipe.ratingsCount > 0 && Number.isFinite(recipe.averageRating)
      ? {
          '@type': 'AggregateRating' as const,
          ratingValue: recipe.averageRating,
          ratingCount: recipe.ratingsCount,
        }
      : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    description: recipe.description ?? undefined,
    image: recipe.socialImage ?? recipe.imgSrc ?? undefined,
    url,
    datePublished: dates?.createdAt?.toISOString(),
    dateModified: dates?.updatedAt?.toISOString(),
    recipeYield: String(recipe.servings ?? 1),
    totalTime: formatDuration(totalTimeMinutes),
    prepTime: formatDuration(prepTimeMinutes),
    cookTime: formatDuration(cookTimeMinutes),
    recipeIngredient: ingredientList,
    recipeInstructions: instructions,
    keywords: recipe.labels?.map((label) => label.label).join(', '),
    aggregateRating,
  };
};
