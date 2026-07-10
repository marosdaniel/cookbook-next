'use client';

import {
  Center,
  Container,
  Grid,
  Loader,
  Paper,
  Stack,
  Title,
} from '@mantine/core';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { BackTo } from '@/components/buttons/BackTo';
import RecipeRating from '@/components/Recipe/Rating';
import { MOTION_TRANSITION } from '@/lib/motion/transitions';
import { buildRecipeJsonLd } from '@/lib/seo/seo';
import { PUBLIC_ROUTES } from '../../../types/routes';
import { RecipeHero } from './components/RecipeHero';
import { RecipeIngredients } from './components/RecipeIngredients';
import { RecipeNotFound } from './components/RecipeNotFound';
import { RecipeSteps } from './components/RecipeSteps';
import { RecipeVideo } from './components/RecipeVideo';
import { useRecipeDetail } from './hooks/useRecipeDetail';
import type { RecipeDetailClientProps } from './types';

const RecipeDetailClient = ({
  recipeId,
}: Readonly<RecipeDetailClientProps>) => {
  const translate = useTranslations('recipeDetail');

  const {
    recipe,
    loading,
    error,
    servingMultiplier,
    adjustedServings,
    checkedIngredients,
    toggleIngredient,
    incrementServings,
    decrementServings,
    youtubeId,
    isOwner,
    sortedSteps,
  } = useRecipeDetail(recipeId);

  if (loading) {
    return (
      <Center h="60vh">
        <Loader size="lg" type="dots" />
      </Center>
    );
  }

  if (error || !recipe) {
    return <RecipeNotFound errorMessage={error?.message} />;
  }

  const recipeJsonLd = buildRecipeJsonLd(recipe);

  return (
    <Container size="xl" py="xl">
      <script type="application/ld+json">{JSON.stringify(recipeJsonLd)}</script>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={MOTION_TRANSITION.standard}
      >
        <Stack gap="xl">
          <BackTo
            href={PUBLIC_ROUTES.RECIPES}
            text={translate('backToRecipes')}
          />

          <RecipeHero recipe={recipe} isOwner={isOwner} />

          <Grid gap="xl">
            {/* Left column – Steps */}
            <Grid.Col span={{ base: 12, md: 7 }}>
              <Stack gap="xl">
                <RecipeSteps steps={sortedSteps} />

                {youtubeId && (
                  <RecipeVideo youtubeId={youtubeId} title={recipe.title} />
                )}

                {/* Rating */}
                <Paper p="lg" radius="md" withBorder>
                  <Title order={3} size="h4" mb="sm">
                    {translate('rateThisRecipe')}
                  </Title>
                  <RecipeRating
                    recipeId={recipe.id}
                    userRating={recipe.userRating ?? undefined}
                    averageRating={recipe.averageRating}
                    ratingsCount={recipe.ratingsCount}
                  />
                </Paper>
              </Stack>
            </Grid.Col>

            {/* Right column – Ingredients (sticky) */}
            <Grid.Col span={{ base: 12, md: 5 }}>
              <RecipeIngredients
                ingredients={recipe.ingredients}
                servingMultiplier={servingMultiplier}
                adjustedServings={adjustedServings}
                checkedIngredients={checkedIngredients}
                onToggleIngredient={toggleIngredient}
                onIncrementServings={incrementServings}
                onDecrementServings={decrementServings}
              />
            </Grid.Col>
          </Grid>
        </Stack>
      </motion.div>
    </Container>
  );
};

export default RecipeDetailClient;
