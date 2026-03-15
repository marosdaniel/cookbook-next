'use client';

import { useQuery } from '@apollo/client/react';
import { Box, Container, Group, Stack, Text, Title } from '@mantine/core';
import { IconChefHat, IconRotateClockwise2 } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { type FC, useCallback, useMemo, useState } from 'react';
import { toCleanedOptions } from '@/components/Recipe/Create/utils';
import type { RecipeCardData } from '@/components/Recipe/RecipeCard';
import { RecipeGrid } from '@/components/Recipe/RecipeCard';
import { RecipeCarousel } from '@/components/Recipe/RecipeCarousel';
import {
  RecipeSearch,
  type RecipeSearchFilters,
} from '@/components/Recipe/RecipeSearch';
import { GET_LATEST_RECIPES } from '@/lib/graphql/queries';
import { useCategories, useLabels, useLevels } from '@/lib/store/metadata';
import classes from '../HomePage.module.css';

const DEFAULT_FILTERS: RecipeSearchFilters = {
  title: '',
  categoryKey: null,
  difficultyLevelKey: null,
  labelKeys: [],
  maxCookingTime: '',
};

function buildQueryFilter(filters: RecipeSearchFilters) {
  const filter: Record<string, unknown> = {};
  if (filters.title.trim()) filter.title = filters.title.trim();
  if (filters.categoryKey) filter.categoryKey = filters.categoryKey;
  if (filters.difficultyLevelKey)
    filter.difficultyLevelKey = filters.difficultyLevelKey;
  if (filters.labelKeys.length > 0) filter.labelKeys = filters.labelKeys;
  if (filters.maxCookingTime)
    filter.maxCookingTime = Number(filters.maxCookingTime);
  return Object.keys(filter).length > 0 ? filter : undefined;
}

function isSearchActive(filters: RecipeSearchFilters) {
  return (
    filters.title.trim() !== '' ||
    filters.categoryKey !== null ||
    filters.difficultyLevelKey !== null ||
    filters.labelKeys.length > 0 ||
    filters.maxCookingTime !== ''
  );
}

const RecipesPage: FC = () => {
  const t = useTranslations('sidebar');
  const st = useTranslations('recipeSearch');
  const tMisc = useTranslations('misc');

  const [filters, setFilters] = useState<RecipeSearchFilters>(DEFAULT_FILTERS);
  const searching = isSearchActive(filters);

  const categoriesFromStore = useCategories();
  const levelsFromStore = useLevels();
  const labelsFromStore = useLabels();

  const categoryOptions = useMemo(
    () => toCleanedOptions(categoriesFromStore, tMisc),
    [categoriesFromStore, tMisc],
  );
  const difficultyOptions = useMemo(
    () => toCleanedOptions(levelsFromStore, tMisc),
    [levelsFromStore, tMisc],
  );
  const labelOptions = useMemo(
    () => toCleanedOptions(labelsFromStore, tMisc),
    [labelsFromStore, tMisc],
  );

  const { data, loading } = useQuery(GET_LATEST_RECIPES, {
    variables: {
      ...(searching ? {} : { limit: 10 }),
      filter: buildQueryFilter(filters),
    },
  });

  const recipes: RecipeCardData[] =
    (data as { getRecipes?: { recipes: RecipeCardData[] } })?.getRecipes
      ?.recipes ?? [];

  const totalRecipes: number =
    (data as { getRecipes?: { totalRecipes: number } })?.getRecipes
      ?.totalRecipes ?? 0;

  const handleSearch = useCallback((newFilters: RecipeSearchFilters) => {
    setFilters(newFilters);
  }, []);

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Box>
          <Group gap="xs" mb="xs">
            <IconChefHat size={32} color="var(--mantine-color-pink-6)" />
            <Title order={1}>{t('recipes')}</Title>
          </Group>
          <Text c="dimmed" size="lg">
            {st('pageDescription')}
          </Text>
        </Box>

        <RecipeSearch
          onSearch={handleSearch}
          initialFilters={filters}
          categoryOptions={categoryOptions}
          difficultyOptions={difficultyOptions}
          labelOptions={labelOptions}
          loading={loading}
        />

        {searching ? (
          <Box component="section">
            <Group justify="space-between" mb="md">
              <Title order={2} size="h3">
                {st('searchResults')}
              </Title>
              {!loading && (
                <Text c="dimmed" size="sm">
                  {st('totalResults', { count: totalRecipes })}
                </Text>
              )}
            </Group>
            <RecipeGrid
              loading={loading}
              recipes={recipes}
              emptyMessage={st('noResults')}
              withFavorite
            />
          </Box>
        ) : (
          <Box component="section" className={classes.section}>
            <Box className={classes.sectionHeader}>
              <Title order={2} size="h3">
                <IconRotateClockwise2
                  size={22}
                  style={{
                    marginRight: 8,
                    verticalAlign: 'middle',
                    color: 'var(--mantine-color-blue-6)',
                  }}
                />
                {st('recentlyAdded')}
              </Title>
            </Box>
            <RecipeCarousel
              loading={loading}
              recipes={recipes}
              emptyMessage={st('noRecipes')}
              withFavorite
            />
          </Box>
        )}
      </Stack>
    </Container>
  );
};

export default RecipesPage;
