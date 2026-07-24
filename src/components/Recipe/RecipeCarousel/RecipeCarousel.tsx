'use client';

import { Carousel } from '@mantine/carousel';
import { Box, Skeleton, Text } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { RecipeCard } from '../RecipeCard';
import { CAROUSEL_PROPS, SKELETON_IDS } from './consts';
import classes from './RecipeCarousel.module.css';
import type { RecipeCarouselProps } from './types';
import { getCarouselState } from './utils';

const RecipeCarousel = ({
  recipes,
  loading = false,
  withFavorite = true,
  emptyMessage,
  skeletonCount = 4,
}: RecipeCarouselProps) => {
  const t = useTranslations('recipe');
  const empty = emptyMessage ?? t('empty');
  const state = getCarouselState(loading, recipes);
  const shouldLoop = recipes.length > 4;
  const skeletonIds = SKELETON_IDS.slice(0, skeletonCount);

  const renderLoadingState = () => (
    <Carousel {...CAROUSEL_PROPS} data-testid="recipe-carousel">
      {skeletonIds.map((skeletonId) => (
        <Carousel.Slide
          key={skeletonId}
          className={classes.carouselSlide}
          data-testid="recipe-carousel-skeleton"
        >
          <Skeleton height={320} radius="md" />
        </Carousel.Slide>
      ))}
    </Carousel>
  );

  const renderEmptyState = () => (
    <Box className={classes.emptyCarousel} data-testid="recipe-carousel-empty">
      <Text c="dimmed" size="lg">
        {empty}
      </Text>
    </Box>
  );

  const renderContentState = () => (
    <Carousel
      {...CAROUSEL_PROPS}
      emblaOptions={{
        ...CAROUSEL_PROPS.emblaOptions,
        loop: shouldLoop,
      }}
      data-testid="recipe-carousel"
    >
      {recipes.map((recipe) => (
        <Carousel.Slide
          key={recipe.id}
          className={classes.carouselSlide}
          data-testid="recipe-carousel-slide"
        >
          <RecipeCard recipe={recipe} withFavorite={withFavorite} />
        </Carousel.Slide>
      ))}
    </Carousel>
  );

  const renderCarouselState = () => {
    switch (state) {
      case 'loading':
        return renderLoadingState();

      case 'empty':
        return renderEmptyState();

      case 'content':
        return renderContentState();
    }
  };

  return (
    <div data-testid="recipe-carousel-content">{renderCarouselState()}</div>
  );
};

export default RecipeCarousel;
