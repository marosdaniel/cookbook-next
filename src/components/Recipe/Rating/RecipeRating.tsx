'use client';

import { useMutation } from '@apollo/client/react';
import { Group, Rating, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { RATE_RECIPE } from '@/lib/graphql/mutations';
import type { RecipeRatingProps } from './types';

const RecipeRating = ({
  recipeId,
  userRating,
  averageRating,
  ratingsCount,
  readOnly = false,
}: RecipeRatingProps) => {
  const translate = useTranslations('recipe');
  const [rateRecipe, { loading }] = useMutation(RATE_RECIPE);
  const [animationKey, setAnimationKey] = useState(0);

  const handleRatingChange = async (value: number) => {
    if (readOnly || loading) return;

    try {
      await rateRecipe({
        variables: {
          ratingInput: {
            recipeId,
            ratingValue: value,
          },
        },
        // Optimistic UI could be added here, but for now let's keep it simple
        refetchQueries: ['getRecipeById'],
      });
      setAnimationKey((prev) => prev + 1);
      notifications.show({
        title: translate('ratingSuccess'),
        message: translate('ratingSuccessMessage'),
        color: 'green',
      });
    } catch (error) {
      console.error('Rating failed:', error);
      notifications.show({
        title: translate('ratingError'),
        message: translate('ratingErrorMessage'),
        color: 'red',
      });
    }
  };

  return (
    <Stack gap="xs" data-testid="recipe-rating">
      <motion.div
        key={animationKey}
        initial={false}
        animate={
          animationKey > 0 ? { scale: [1, 1.05, 1], opacity: [0.8, 1] } : {}
        }
        transition={{ duration: 0.3 }}
      >
        <Group gap="sm">
          <Rating
            value={userRating || averageRating}
            onChange={handleRatingChange}
            readOnly={readOnly || loading}
            fractions={2}
            data-testid="recipe-rating-control"
          />
          <Text size="sm" c="dimmed" data-testid="recipe-rating-count">
            ({ratingsCount} {translate('ratingsCount')})
          </Text>
        </Group>
      </motion.div>
      {userRating && (
        <Text
          size="xs"
          c="dimmed"
          style={{ fontStyle: 'italic' }}
          data-testid="recipe-rating-user-rating"
        >
          {translate('yourRating')}: {userRating}
        </Text>
      )}
    </Stack>
  );
};

export default RecipeRating;
