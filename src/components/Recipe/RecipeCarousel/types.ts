import type { RecipeCardData } from '../RecipeCard';

export interface RecipeCarouselProps {
  recipes: RecipeCardData[];
  loading?: boolean;
  withFavorite?: boolean;
  emptyMessage?: string;
  skeletonCount?: number;
  staticOnDesktop?: boolean;
}

export type CarouselState = 'loading' | 'empty' | 'content';
