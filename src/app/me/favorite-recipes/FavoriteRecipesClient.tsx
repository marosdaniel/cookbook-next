'use client';

import { useQuery } from '@apollo/client/react';
import { Stack, Title } from '@mantine/core';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import {
  type RecipeCardData,
  RecipeGrid,
} from '@/components/Recipe/RecipeCard';
import { GET_FAVORITE_RECIPES } from '@/lib/graphql/queries';

const FavoriteRecipesClient = () => {
  const { data: session, status } = useSession();
  const translate = useTranslations('user');

  const userId = (session?.user as { id?: string })?.id;

  const isSessionLoading = status === 'loading';

  const { data, loading } = useQuery(GET_FAVORITE_RECIPES, {
    variables: { userId },
    skip: !userId || isSessionLoading,
    fetchPolicy: 'cache-and-network',
  });

  const recipes: RecipeCardData[] =
    (data as { getFavoriteRecipes?: RecipeCardData[] })?.getFavoriteRecipes ??
    [];

  return (
    <Stack gap="lg" p="md">
      <Title order={2}>{translate('favoriteRecipes')}</Title>
      <RecipeGrid
        recipes={recipes}
        loading={loading}
        withFavorite
        emptyMessage={translate('noFavoriteRecipesYet' as never)}
      />
    </Stack>
  );
};

export default FavoriteRecipesClient;
