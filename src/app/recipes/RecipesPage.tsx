'use client';

import { useQuery } from '@apollo/client/react';
import {
  Box,
  Center,
  Container,
  Group,
  Stack,
  Text,
  Title,
  Transition,
} from '@mantine/core';
import {
  IconChefHat,
  IconMoodSmile,
  IconRotateClockwise2,
  IconSearch,
} from '@tabler/icons-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { type FC, useCallback, useMemo, useState } from 'react';
import { toCleanedOptions } from '@/components/Recipe/Create/utils';
import type { RecipeCardData } from '@/components/Recipe/RecipeCard';
import { RecipeGrid } from '@/components/Recipe/RecipeCard';
import { RecipeCarousel } from '@/components/Recipe/RecipeCarousel';
import {
  filtersToSearchParams,
  isSearchActive,
  RecipeSearch,
  type RecipeSearchFilters,
  searchParamsToFilters,
} from '@/components/Recipe/RecipeSearch';
import { GET_LATEST_RECIPES } from '@/lib/graphql/queries';
import { useCategories, useLabels, useLevels } from '@/lib/store/metadata';
import classes from '../HomePage.module.css';

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

const RecipesPage: FC = () => {
  const t = useTranslations('sidebar');
  const st = useTranslations('recipeSearch');
  const tMisc = useTranslations('misc');

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // --- URL → filters (initial + committed state) ---
  const filtersFromUrl = useMemo(
    () => searchParamsToFilters(searchParams),
    [searchParams],
  );

  // "committed" = what's in the URL / used for the query
  const [committedFilters, setCommittedFilters] =
    useState<RecipeSearchFilters>(filtersFromUrl);

  const searching = isSearchActive(committedFilters);

  // --- Metadata → select options ---
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

  // --- GraphQL query driven by committed filters ---
  const { data, loading } = useQuery(GET_LATEST_RECIPES, {
    variables: {
      ...(searching ? {} : { limit: 10 }),
      filter: buildQueryFilter(committedFilters),
    },
  });

  const recipes: RecipeCardData[] =
    (data as { getRecipes?: { recipes: RecipeCardData[] } })?.getRecipes
      ?.recipes ?? [];

  const totalRecipes: number =
    (data as { getRecipes?: { totalRecipes: number } })?.getRecipes
      ?.totalRecipes ?? 0;

  // --- Handlers ---
  const handleSearch = useCallback(
    (filters: RecipeSearchFilters) => {
      setCommittedFilters(filters);

      // Sync URL
      const params = filtersToSearchParams(filters);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

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
          initialFilters={filtersFromUrl}
          onSearch={handleSearch}
          categoryOptions={categoryOptions}
          difficultyOptions={difficultyOptions}
          labelOptions={labelOptions}
          loading={loading}
        />

        <Transition
          mounted={searching}
          transition="fade"
          duration={200}
          exitDuration={150}
        >
          {(styles) => (
            <Box component="section" style={styles}>
              <Group justify="space-between" mb="md">
                <Group gap="xs">
                  <IconSearch size={20} color="var(--mantine-color-pink-6)" />
                  <Title order={2} size="h3">
                    {st('searchResults')}
                  </Title>
                </Group>
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
          )}
        </Transition>

        {!searching && (
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
            {recipes.length === 0 && !loading ? (
              <Center py="xl">
                <Stack align="center" gap="xs">
                  <IconMoodSmile
                    size={48}
                    color="var(--mantine-color-dimmed)"
                  />
                  <Text c="dimmed" size="lg" ta="center">
                    {st('noRecipes')}
                  </Text>
                </Stack>
              </Center>
            ) : (
              <RecipeCarousel
                loading={loading}
                recipes={recipes}
                emptyMessage={st('noRecipes')}
                withFavorite
              />
            )}
          </Box>
        )}
      </Stack>
    </Container>
  );
};

export default RecipesPage;
