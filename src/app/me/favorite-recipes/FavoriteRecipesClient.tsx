'use client';
import { useQuery } from '@apollo/client/react';
import {
  Box,
  Button,
  Group,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import {
  IconHeart,
  IconHeartFilled,
  IconSearch,
  IconStar,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { EmptyState } from '@/components/EmptyState';
import {
  type RecipeCardData,
  RecipeGrid,
} from '@/components/Recipe/RecipeCard';
import StyledText from '@/components/StyledText';
import { GET_FAVORITE_RECIPES } from '@/lib/graphql/queries';
import { PUBLIC_ROUTES } from '@/types/routes';
import classes from './FavoriteRecipesClient.module.css';

const SKELETON_ITEMS = [1, 2, 3, 4, 5, 6, 7, 8];

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
}

const StatCard = ({ icon, label, value }: StatCardProps) => (
  <Paper withBorder radius="md" p="md" className={classes.statCard}>
    <Group gap="sm">
      <ThemeIcon
        size="lg"
        radius="md"
        variant="gradient"
        gradient={{ from: 'pink', to: 'violet', deg: 45 }}
      >
        {icon}
      </ThemeIcon>
      <div>
        <Text size="xl" fw={700} lh={1}>
          {value}
        </Text>
        <Text size="xs" c="dimmed" mt={2}>
          {label}
        </Text>
      </div>
    </Group>
  </Paper>
);

const FavoriteRecipesClient = () => {
  const { data: session, status } = useSession();
  const t = useTranslations('user');

  const isSessionLoading = status === 'loading';

  const { data, loading } = useQuery(GET_FAVORITE_RECIPES, {
    skip: !session?.user?.id || isSessionLoading,
    fetchPolicy: 'cache-and-network',
  });

  const recipes: RecipeCardData[] = data?.getFavoriteRecipes ?? [];
  const totalFavorites = recipes.length;

  const avgRating =
    recipes.length > 0
      ? recipes.reduce((sum, r) => sum + (r.averageRating ?? 0), 0) /
        recipes.filter((r) => (r.averageRating ?? 0) > 0).length
      : 0;
  const displayAvgRating =
    Number.isFinite(avgRating) && avgRating > 0 ? avgRating.toFixed(1) : '—';

  if (isSessionLoading || loading) {
    return (
      <Stack gap="lg" p="md" data-testid="favorite-recipes-loading">
        <Skeleton height={48} width="60%" radius="md" />
        <Skeleton height={20} width="40%" radius="sm" />
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <Skeleton height={80} radius="md" />
          <Skeleton height={80} radius="md" />
        </SimpleGrid>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }}>
          {SKELETON_ITEMS.map((item) => (
            <Skeleton key={`fav-skeleton-${item}`} height={320} radius="md" />
          ))}
        </SimpleGrid>
      </Stack>
    );
  }

  return (
    <Stack gap="xl" p="md" data-testid="favorite-recipes-page">
      <Box>
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <div>
            <Group gap="sm" align="center" mb={4}>
              <IconHeartFilled
                size={32}
                className={classes.headerIcon}
                aria-hidden
              />
              <StyledText componentType="title" gradient order={2}>
                {t('favoritesHeading')}
              </StyledText>
            </Group>
            <Text size="md" c="dimmed">
              {t('favoritesSubtitle')}
            </Text>
          </div>
          {totalFavorites > 0 && (
            <Button
              component={Link}
              href={PUBLIC_ROUTES.RECIPES}
              leftSection={<IconSearch size={18} />}
              variant="gradient"
              gradient={{ from: 'pink', to: 'violet', deg: 45 }}
              size="sm"
            >
              {t('browseRecipes')}
            </Button>
          )}
        </Group>
      </Box>

      {totalFavorites > 0 && (
        <SimpleGrid
          cols={{ base: 1, sm: 2 }}
          data-testid="favorite-recipes-stats"
        >
          <StatCard
            icon={<IconHeart size={20} />}
            label={t('totalFavorites')}
            value={totalFavorites}
          />
          <StatCard
            icon={<IconStar size={20} />}
            label={t('avgRating')}
            value={displayAvgRating}
          />
        </SimpleGrid>
      )}

      {totalFavorites === 0 ? (
        <EmptyState
          data-testid="favorite-recipes-empty"
          icon={<IconHeart size={40} />}
          iconSize={80}
          iconVariant="gradient"
          iconGradient={{ from: 'pink.3', to: 'violet.3', deg: 45 }}
          title={t('noFavoriteRecipesYet')}
          action={{
            label: t('browseRecipes'),
            component: Link,
            href: PUBLIC_ROUTES.RECIPES,
            leftSection: <IconSearch size={18} />,
            variant: 'gradient',
            gradient: { from: 'pink', to: 'violet', deg: 45 },
            size: 'lg',
            'data-testid': 'favorite-recipes-browse',
          }}
        />
      ) : (
        <RecipeGrid
          recipes={recipes}
          loading={loading}
          withFavorite
          emptyMessage={t('noFavoriteRecipesYet')}
        />
      )}
    </Stack>
  );
};

export default FavoriteRecipesClient;
