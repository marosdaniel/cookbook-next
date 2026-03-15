import { z } from 'zod';
import type { RecipeSearchFilters } from './types';

export const DEFAULT_FILTERS: RecipeSearchFilters = {
  title: '',
  categoryKey: null,
  difficultyLevelKey: null,
  labelKeys: [],
  maxCookingTime: '',
};

/* ─── Zod validation schema ───────────────────── */

export const recipeSearchSchema = z.object({
  title: z.string().max(100),
  categoryKey: z.string().nullable(),
  difficultyLevelKey: z.string().nullable(),
  labelKeys: z.array(z.string()),
  maxCookingTime: z.union([z.number().int().positive(), z.literal('')]),
});

const PARAM_TITLE = 'q';
const PARAM_CATEGORY = 'category';
const PARAM_DIFFICULTY = 'difficulty';
const PARAM_LABELS = 'labels';
const PARAM_MAX_TIME = 'maxTime';

/** Serialize filters into URLSearchParams (omitting defaults). */
export function filtersToSearchParams(
  filters: RecipeSearchFilters,
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.title.trim()) params.set(PARAM_TITLE, filters.title.trim());
  if (filters.categoryKey) params.set(PARAM_CATEGORY, filters.categoryKey);
  if (filters.difficultyLevelKey)
    params.set(PARAM_DIFFICULTY, filters.difficultyLevelKey);
  if (filters.labelKeys.length > 0)
    params.set(PARAM_LABELS, filters.labelKeys.join(','));
  if (filters.maxCookingTime)
    params.set(PARAM_MAX_TIME, String(filters.maxCookingTime));
  return params;
}

/** Parse URLSearchParams back to RecipeSearchFilters. */
export function searchParamsToFilters(
  params: URLSearchParams,
): RecipeSearchFilters {
  const labelsRaw = params.get(PARAM_LABELS);
  const maxTimeRaw = params.get(PARAM_MAX_TIME);
  return {
    title: params.get(PARAM_TITLE) ?? '',
    categoryKey: params.get(PARAM_CATEGORY) ?? null,
    difficultyLevelKey: params.get(PARAM_DIFFICULTY) ?? null,
    labelKeys: labelsRaw ? labelsRaw.split(',').filter(Boolean) : [],
    maxCookingTime: maxTimeRaw ? Number(maxTimeRaw) : '',
  };
}

/** Returns true when at least one filter differs from defaults. */
export function isSearchActive(filters: RecipeSearchFilters): boolean {
  return (
    filters.title.trim() !== '' ||
    filters.categoryKey !== null ||
    filters.difficultyLevelKey !== null ||
    filters.labelKeys.length > 0 ||
    filters.maxCookingTime !== ''
  );
}

/** Convert client-side filters to the GraphQL RecipeFilterInput shape. */
export function buildQueryFilter(filters: RecipeSearchFilters) {
  if (!isSearchActive(filters)) return undefined;

  return {
    ...(filters.title.trim() && { title: filters.title.trim() }),
    ...(filters.categoryKey && { categoryKey: filters.categoryKey }),
    ...(filters.difficultyLevelKey && {
      difficultyLevelKey: filters.difficultyLevelKey,
    }),
    ...(filters.labelKeys.length > 0 && { labelKeys: filters.labelKeys }),
    ...(filters.maxCookingTime && {
      maxCookingTime: Number(filters.maxCookingTime),
    }),
  };
}
