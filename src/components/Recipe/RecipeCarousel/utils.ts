import type { CarouselState, RecipeCarouselProps } from './types';

export const getCarouselState = (
  loading: boolean,
  recipes: RecipeCarouselProps['recipes'],
): CarouselState => {
  if (loading) {
    return 'loading';
  }

  if (recipes.length === 0) {
    return 'empty';
  }

  return 'content';
};
