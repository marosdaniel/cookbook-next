import { CAROUSEL_PROPS } from './consts';
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

export const getSlideSize = (recipeCount: number) => {
  if (recipeCount <= 2) {
    return { base: '90%', sm: '60%', md: '60%', lg: '60%' };
  }

  if (recipeCount < 5) {
    return { base: '90%', sm: '45%', md: '45%', lg: '45%' };
  }

  return CAROUSEL_PROPS.slideSize;
};
