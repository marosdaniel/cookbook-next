import type { RecipeSearchFilters } from './types';

export const DEFAULT_FILTERS: RecipeSearchFilters = {
  title: '',
  categoryKey: null,
  difficultyLevelKey: null,
  labelKeys: [],
  maxCookingTime: '',
};
