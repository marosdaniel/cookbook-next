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
import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { type FC, useCallback, useMemo } from 'react';
import { toCleanedOptions } from '@/components/Recipe/Create/utils';
import type { RecipeCardData } from '@/components/Recipe/RecipeCard';
import { RecipeGrid } from '@/components/Recipe/RecipeCard';
import { RecipeCarousel } from '@/components/Recipe/RecipeCarousel';
import RecipeSearch, {
  buildQueryFilter,
  filtersToSearchParams,
  isSearchActive,
  type RecipeSearchFilters,
  searchParamsToFilters,
} from '@/components/Recipe/RecipeSearch';
import { GET_LATEST_RECIPES } from '@/lib/graphql/queries';
import { useCategories, useLabels, useLevels } from '@/lib/store/metadata';
import classes from '../HomePage.module.css';

const RecipesPage: FC = () => {
  const translateSidebar = useTranslations('sidebar');
  const translateRecipeSearch = useTranslations('recipeSearch');
  const translateMisc = useTranslations('misc');

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // --- URL → filters (single source of truth) ---
  const filtersFromUrl = useMemo(
    () => searchParamsToFilters(searchParams),
    [searchParams],
  );

  const searching = isSearchActive(filtersFromUrl);

  // --- Metadata → select options ---
  const categoriesFromStore = useCategories();
  const levelsFromStore = useLevels();
  const labelsFromStore = useLabels();

  const categoryOptions = useMemo(
    () => toCleanedOptions(categoriesFromStore, translateMisc),
    [categoriesFromStore, translateMisc],
  );
  const difficultyOptions = useMemo(
    () => toCleanedOptions(levelsFromStore, translateMisc),
    [levelsFromStore, translateMisc],
  );
  const labelOptions = useMemo(
    () => toCleanedOptions(labelsFromStore, translateMisc),
    [labelsFromStore, translateMisc],
  );

  // --- GraphQL query driven by URL filters ---
  const { data, loading } = useQuery(GET_LATEST_RECIPES, {
    variables: {
      ...(searching ? {} : { limit: 10 }),
      filter: buildQueryFilter(filtersFromUrl),
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
      const params = filtersToSearchParams(filters);
      const qs = params.toString();
      const url = qs ? `${pathname}?${qs}` : pathname;
      router.replace(url as Route, { scroll: false });
    },
    [router, pathname],
  );

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Box>
          <Group gap="xs" mb="xs">
            <IconChefHat size={32} color="var(--mantine-color-pink-6)" />
            <Title order={1}>{translateSidebar('recipes')}</Title>
          </Group>
          <Text c="dimmed" size="lg">
            {translateRecipeSearch('pageDescription')}
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
                    {translateRecipeSearch('searchResults')}
                  </Title>
                </Group>
                {!loading && (
                  <Text c="dimmed" size="sm">
                    {translateRecipeSearch('totalResults', {
                      count: totalRecipes,
                    })}
                  </Text>
                )}
              </Group>
              <RecipeGrid
                loading={loading}
                recipes={recipes}
                emptyMessage={translateRecipeSearch('noResults')}
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
                {translateRecipeSearch('recentlyAdded')}
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
                    {translateRecipeSearch('noRecipes')}
                  </Text>
                </Stack>
              </Center>
            ) : (
              <RecipeCarousel
                loading={loading}
                recipes={recipes}
                emptyMessage={translateRecipeSearch('noRecipes')}
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
