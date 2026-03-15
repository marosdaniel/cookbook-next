import type { RecipeCardData } from '../RecipeCard';

export interface RecipeCarouselProps {
  recipes: RecipeCardData[];
  loading?: boolean;
  withFavorite?: boolean;
  emptyMessage?: string;
  skeletonCount?: number;
}
