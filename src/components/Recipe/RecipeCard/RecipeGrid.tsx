'use client';

import { Center, SimpleGrid, Skeleton, Stack, Text } from '@mantine/core';
import { IconMoodSad } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import RecipeCard from './RecipeCard';
import type { RecipeGridProps } from './types';

const SKELETON_ITEMS = [1, 2, 3, 4, 5, 6, 7, 8];

const RecipeGrid = ({
  recipes,
  loading = false,
  withFavorite = true,
  emptyMessage,
  columns = { base: 1, sm: 2, md: 3, lg: 4 },
}: RecipeGridProps) => {
  const t = useTranslations('recipe');
  const empty = emptyMessage ?? t('empty');
  if (loading) {
    return (
      <SimpleGrid cols={columns}>
        {SKELETON_ITEMS.map((item) => (
          <Skeleton key={`skeleton-${item}`} height={320} radius="md" />
        ))}
      </SimpleGrid>
    );
  }

  if (!recipes.length) {
    return (
      <Center py="xl">
        <Stack align="center" gap="xs">
          <IconMoodSad size={48} color="var(--mantine-color-dimmed)" />
          <Text c="dimmed" size="lg">
            {empty}
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <SimpleGrid cols={columns}>
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          withFavorite={withFavorite}
        />
      ))}
    </SimpleGrid>
  );
};

export default RecipeGrid;
