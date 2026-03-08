'use client';

import { useMutation } from '@apollo/client/react';
import { Group, Rating, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useTranslations } from 'next-intl';
import { RATE_RECIPE } from '@/lib/graphql/mutations';
import type { RecipeRatingProps } from './types';

const RecipeRating = ({
  recipeId,
  userRating,
  averageRating,
  ratingsCount,
  readOnly = false,
}: RecipeRatingProps) => {
  const t = useTranslations('recipe');
  const [rateRecipe, { loading }] = useMutation(RATE_RECIPE);

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
      notifications.show({
        title: t('ratingSuccess'),
        message: t('ratingSuccessMessage'),
        color: 'green',
      });
    } catch (error) {
      console.error('Rating failed:', error);
      notifications.show({
        title: t('ratingError'),
        message: t('ratingErrorMessage'),
        color: 'red',
      });
    }
  };

  return (
    <Stack gap="xs">
      <Group gap="sm">
        <Rating
          value={userRating || averageRating}
          onChange={handleRatingChange}
          readOnly={readOnly || loading}
          fractions={2}
        />
        <Text size="sm" c="dimmed">
          ({ratingsCount} {t('ratingsCount')})
        </Text>
      </Group>
      {userRating && (
        <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>
          {t('yourRating')}: {userRating}
        </Text>
      )}
    </Stack>
  );
};

export default RecipeRating;
