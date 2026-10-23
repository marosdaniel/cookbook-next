'use client';

import { Carousel } from '@mantine/carousel';
import { Box, Skeleton, Text } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { RecipeCard } from '../RecipeCard';
import { CAROUSEL_PROPS, SKELETON_IDS } from './consts';
import classes from './RecipeCarousel.module.css';
import type { RecipeCarouselProps } from './types';
import { getCarouselState, getSlideSize } from './utils';

const RecipeCarousel = ({
  recipes,
  loading = false,
  withFavorite = true,
  emptyMessage,
  skeletonCount = 4,
  staticOnDesktop = false,
}: RecipeCarouselProps) => {
  type EmblaApi = Parameters<NonNullable<Carousel.Props['getEmblaApi']>>[0];

  const t = useTranslations('recipe');
  const translateHome = useTranslations('home');
  const [emblaApi, setEmblaApi] = useState<EmblaApi | null>(null);
  const empty = emptyMessage ?? t('empty');
  const state = getCarouselState(loading, recipes);
  const shouldLoop = recipes.length > 1;
  const slideSize = getSlideSize(recipes.length);
  const skeletonIds = SKELETON_IDS.slice(0, skeletonCount);
  const useStaticDesktopGrid =
    staticOnDesktop && recipes.length <= 2 && state === 'content';

  const handleNextControlClick = () => {
    if (!emblaApi) {
      return;
    }

    const snapCount = emblaApi.scrollSnapList().length;
    if (snapCount > 1) {
      emblaApi.scrollTo((emblaApi.selectedScrollSnap() + 1) % snapCount);
    }
  };

  const handlePreviousControlClick = () => {
    if (!emblaApi) {
      return;
    }

    const snapCount = emblaApi.scrollSnapList().length;
    if (snapCount > 1) {
      emblaApi.scrollTo(
        (emblaApi.selectedScrollSnap() - 1 + snapCount) % snapCount,
      );
    }
  };

  const renderLoadingState = () => (
    <Carousel
      {...CAROUSEL_PROPS}
      withControls={false}
      data-testid="recipe-carousel"
    >
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
    <>
      {useStaticDesktopGrid && (
        <Box
          className={classes.desktopRecipeGrid}
          data-testid="recipe-carousel-static-grid"
        >
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              withFavorite={withFavorite}
            />
          ))}
        </Box>
      )}
      <Box
        className={useStaticDesktopGrid ? classes.mobileCarousel : undefined}
      >
        <Box className={classes.carouselWrapper}>
          <Carousel
            {...CAROUSEL_PROPS}
            slideSize={slideSize}
            withControls={false}
            getEmblaApi={setEmblaApi}
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
                <RecipeCard
                  recipe={recipe}
                  withFavorite={withFavorite}
                  withTransitions={!useStaticDesktopGrid}
                />
              </Carousel.Slide>
            ))}
          </Carousel>
          {shouldLoop && (
            <>
              <button
                aria-label={translateHome('previousRecipe')}
                className={`${classes.carouselArrow} ${classes.previousArrow}`}
                onClick={handlePreviousControlClick}
                type="button"
              >
                <IconChevronLeft size={18} stroke={2} />
              </button>
              <button
                aria-label={translateHome('nextRecipe')}
                className={`${classes.carouselArrow} ${classes.nextArrow}`}
                onClick={handleNextControlClick}
                type="button"
              >
                <IconChevronRight size={18} stroke={2} />
              </button>
            </>
          )}
        </Box>
      </Box>
    </>
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
