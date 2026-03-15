'use client';

import { useQuery } from '@apollo/client/react';
import { Box, Container, Stack, Title, Text, Group } from '@mantine/core';
import { IconRotateClockwise2, IconChefHat } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import type { FC } from 'react';
import { RecipeCarousel } from '@/components/Recipe/RecipeCarousel';
import type { RecipeCardData } from '@/components/Recipe/RecipeCard';
import { GET_LATEST_RECIPES } from '@/lib/graphql/queries';
import classes from '../HomePage.module.css';

const RecipesPage: FC = () => {
  const t = useTranslations('sidebar');
  const commonT = useTranslations('common');

  const { data, loading } = useQuery(GET_LATEST_RECIPES, {
    variables: { limit: 10 },
  });

  const latestRecipes: RecipeCardData[] =
    (data as { getRecipes?: { recipes: RecipeCardData[] } })?.getRecipes
      ?.recipes ?? [];

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Box>
          <Group gap="xs" mb="xs">
            <IconChefHat size={32} color="var(--mantine-color-pink-6)" />
            <Title order={1}>{t('recipes')}</Title>
          </Group>
          <Text c="dimmed" size="lg">
            Explore our community's culinary creations and find your next favorite meal.
          </Text>
        </Box>

        {/* Section: Recently Added */}
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
              Recently Added Recipes
            </Title>
          </Box>
          <RecipeCarousel
            loading={loading}
            recipes={latestRecipes}
            emptyMessage="No recipes found. Try creating the first one!"
            withFavorite
          />
        </Box>

        {/* You could add more sections here in the future, like Trending or Categories */}
      </Stack>
    </Container>
  );
};

export default RecipesPage;
