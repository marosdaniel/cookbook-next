'use client';

import { useQuery } from '@apollo/client/react';
import { Box, Center, Stack, Text, Title } from '@mantine/core';
import { IconClockHour4, IconFlame } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import type { RecipeCardData } from '@/components/Recipe/RecipeCard';
import { RecipeCarousel } from '@/components/Recipe/RecipeCarousel';
import { GET_LATEST_RECIPES } from '@/lib/graphql/queries';
import classes from './HomePage.module.css';
import { MOCK_RECENTLY_VIEWED_RECIPES } from './mockRecentlyViewed';

const HomePage = () => {
  const translate = useTranslations('sidebar');
  const translateHome = useTranslations('home');

  const { data, loading } = useQuery(GET_LATEST_RECIPES, {
    variables: { limit: 10 },
  });

  const latestRecipes: RecipeCardData[] =
    (data as { getRecipes?: { recipes: RecipeCardData[] } })?.getRecipes
      ?.recipes ?? [];

  return (
    <Stack gap="xl" p="md">
      {/* Section 1: Latest Recipes */}
      <Box component="section" className={classes.section}>
        <Box className={classes.sectionHeader}>
          <Title order={1} size="h3">
            <IconFlame
              size={22}
              style={{
                marginRight: 8,
                verticalAlign: 'middle',
                color: 'var(--mantine-color-pink-6)',
              }}
            />
            {translate('latestRecipes')}
          </Title>
        </Box>
        <RecipeCarousel
          loading={loading}
          recipes={latestRecipes}
          emptyMessage={translateHome('carouselEmpty')}
          withFavorite
        />
      </Box>

      {/* Section 2: Recently Viewed (Mock) */}
      <Box component="section" className={classes.section}>
        <Box className={classes.sectionHeader}>
          <Title order={3}>
            <IconClockHour4
              size={22}
              style={{
                marginRight: 8,
                verticalAlign: 'middle',
                color: 'var(--mantine-color-grape-6)',
              }}
            />
            {translateHome('recentlyViewed')}
          </Title>
        </Box>
        <RecipeCarousel
          recipes={MOCK_RECENTLY_VIEWED_RECIPES}
          withFavorite={false}
        />
        <Center mt="xs">
          <Text size="xs" c="dimmed" fs="italic">
            {translateHome('recentlyViewedHint')}
          </Text>
        </Center>
      </Box>
    </Stack>
  );
};

export default HomePage;
