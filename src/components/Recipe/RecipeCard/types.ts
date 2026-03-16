import type { RecipeCardDataBase } from '@/types/recipe';

export interface RecipeCardData extends RecipeCardDataBase {
  averageRating?: number;
  ratingsCount?: number;
  isFavorite?: boolean;
}

export interface RecipeCardProps {
  recipe: RecipeCardData;
  withFavorite?: boolean;
}

export interface RecipeGridProps {
  recipes: RecipeCardData[];
  loading?: boolean;
  withFavorite?: boolean;
  emptyMessage?: string;
  columns?: {
    base?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
}
