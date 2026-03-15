'use client';

import { useQuery } from '@apollo/client/react';
import { Stack, Title } from '@mantine/core';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { RecipeGrid, type RecipeCardData } from '@/components/Recipe/RecipeCard';
import { GET_FAVORITE_RECIPES } from '@/lib/graphql/queries';

const FavoriteRecipesClient = () => {
  const { data: session } = useSession();
  const t = useTranslations('user');

  const userId = (session?.user as { id?: string })?.id;

  const { data, loading } = useQuery(GET_FAVORITE_RECIPES, {
    variables: { userId },
    skip: !userId,
    fetchPolicy: 'cache-and-network',
  });

  const recipes: RecipeCardData[] =
    (data as { getFavoriteRecipes?: RecipeCardData[] })?.getFavoriteRecipes ??
    [];

  return (
    <Stack gap="lg" p="md">
      <Title order={2}>{t('favoriteRecipes')}</Title>
      <RecipeGrid
        recipes={recipes}
        loading={loading}
        withFavorite
        emptyMessage={
          t('noFavoriteRecipesYet' as never) ||
          'No favourite recipes yet. Start exploring and add recipes to your favourites!'
        }
      />
    </Stack>
  );
};

export default FavoriteRecipesClient;
