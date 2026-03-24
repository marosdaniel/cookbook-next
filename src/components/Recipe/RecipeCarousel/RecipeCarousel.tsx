'use client';

import { Carousel } from '@mantine/carousel';
import { Box, Skeleton, Text } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { RecipeCard } from '../RecipeCard';
import classes from './RecipeCarousel.module.css';
import type { RecipeCarouselProps } from './types';

const CAROUSEL_PROPS = {
  slideSize: { base: '90%', sm: '45%', md: '30%', lg: '23%' },
  slideGap: 'md' as const,
  withControls: true,
  emblaOptions: { containScroll: 'trimSnaps' as const },
};

const RecipeCarousel = ({
  recipes,
  loading = false,
  withFavorite = true,
  emptyMessage,
  skeletonCount = 4,
}: RecipeCarouselProps) => {
  const t = useTranslations('recipe');
  const empty = emptyMessage ?? t('empty');
  if (loading) {
    const skeletonItems = Array.from({ length: skeletonCount }, (_, i) => i);
    return (
      <Carousel {...CAROUSEL_PROPS}>
        {skeletonItems.map((item) => (
          <Carousel.Slide
            key={`carousel-skeleton-${item}`}
            className={classes.carouselSlide}
          >
            <Skeleton height={320} radius="md" />
          </Carousel.Slide>
        ))}
      </Carousel>
    );
  }

  if (recipes.length === 0) {
    return (
      <Box className={classes.emptyCarousel}>
          <Text c="dimmed" size="lg">
            {empty}
          </Text>
        </Box>
    );
  }

  const shouldLoop = recipes.length > 4;

  return (
    <Carousel
      {...CAROUSEL_PROPS}
      emblaOptions={{ ...CAROUSEL_PROPS.emblaOptions, loop: shouldLoop }}
    >
      {recipes.map((recipe) => (
        <Carousel.Slide key={recipe.id} className={classes.carouselSlide}>
          <RecipeCard recipe={recipe} withFavorite={withFavorite} />
        </Carousel.Slide>
      ))}
    </Carousel>
  );
};

export default RecipeCarousel;
