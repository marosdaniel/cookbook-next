'use client';

import { useQuery } from '@apollo/client/react';
import {
  Box,
  Button,
  Center,
  Group,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import {
  IconChefHat,
  IconFlame,
  IconPlus,
  IconStar,
  IconToolsKitchen2,
} from '@tabler/icons-react';
import type { Route } from 'next';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import {
  type RecipeCardData,
  RecipeGrid,
} from '@/components/Recipe/RecipeCard';
import StyledText from '@/components/StyledText';
import { GET_RECIPES_BY_USER_ID } from '@/lib/graphql/queries';
import { PROTECTED_ROUTES } from '@/types/routes';
import classes from './MyRecipesClient.module.css';

const SKELETON_ITEMS = [1, 2, 3, 4, 5, 6, 7, 8];

interface RecipesByUserIdData {
  getRecipesByUserId: {
    recipes: RecipeCardData[];
    totalRecipes: number;
  };
}

interface StatCardProps {
  icon: React.ReactNode;
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

const MyRecipesClient = () => {
  const { data: session, status } = useSession();
  const t = useTranslations('user');

  const userId = (session?.user as { id?: string })?.id;
  const isSessionLoading = status === 'loading';

  const { data, loading } = useQuery<RecipesByUserIdData>(
    GET_RECIPES_BY_USER_ID,
    {
      variables: { userId },
      skip: !userId || isSessionLoading,
      fetchPolicy: 'cache-and-network',
    },
  );

  const recipes = data?.getRecipesByUserId?.recipes ?? [];
  const totalRecipes = data?.getRecipesByUserId?.totalRecipes ?? 0;

  const totalRatings = recipes.reduce(
    (sum, r) => sum + (r.ratingsCount ?? 0),
    0,
  );
  const avgRating =
    recipes.length > 0
      ? recipes.reduce((sum, r) => sum + (r.averageRating ?? 0), 0) /
        recipes.filter((r) => (r.averageRating ?? 0) > 0).length
      : 0;
  const displayAvgRating =
    Number.isFinite(avgRating) && avgRating > 0 ? avgRating.toFixed(1) : '—';

  if (isSessionLoading || loading) {
    return (
      <Stack gap="lg" p="md">
        <Skeleton height={48} width="60%" radius="md" />
        <Skeleton height={20} width="40%" radius="sm" />
        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          <Skeleton height={80} radius="md" />
          <Skeleton height={80} radius="md" />
          <Skeleton height={80} radius="md" />
        </SimpleGrid>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }}>
          {SKELETON_ITEMS.map((item) => (
            <Skeleton
              key={`recipe-skeleton-${item}`}
              height={320}
              radius="md"
            />
          ))}
        </SimpleGrid>
      </Stack>
    );
  }

  return (
    <Stack gap="xl" p="md">
      <Box>
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <div>
            <Group gap="sm" align="center" mb={4}>
              <IconFlame size={32} className={classes.headerIcon} aria-hidden />
              <StyledText componentType="title" gradient order={2}>
                {t('myRecipesHeading')}
              </StyledText>
            </Group>
            <Text size="md" c="dimmed">
              {t('myRecipesSubtitle')}
            </Text>
          </div>
          {totalRecipes > 0 && (
            <Button
              component={Link}
              href={PROTECTED_ROUTES.RECIPES_CREATE as Route}
              leftSection={<IconPlus size={18} />}
              variant="gradient"
              gradient={{ from: 'pink', to: 'violet', deg: 45 }}
              size="sm"
            >
              {t('createNewRecipe')}
            </Button>
          )}
        </Group>
      </Box>

      {totalRecipes > 0 && (
        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          <StatCard
            icon={<IconToolsKitchen2 size={20} />}
            label={t('totalRecipes')}
            value={totalRecipes}
          />
          <StatCard
            icon={<IconStar size={20} />}
            label={t('totalRatings')}
            value={totalRatings}
          />
          <StatCard
            icon={<IconChefHat size={20} />}
            label={t('avgRating')}
            value={displayAvgRating}
          />
        </SimpleGrid>
      )}

      {totalRecipes === 0 && !loading ? (
        <Center py={60}>
          <Stack align="center" gap="md">
            <ThemeIcon
              size={80}
              radius="xl"
              variant="gradient"
              gradient={{ from: 'pink.3', to: 'violet.3', deg: 45 }}
            >
              <IconChefHat size={40} />
            </ThemeIcon>
            <Text c="dimmed" size="lg" ta="center" maw={400}>
              {t('noMyRecipesYet')}
            </Text>
            <Button
              component={Link}
              href={PROTECTED_ROUTES.RECIPES_CREATE as Route}
              leftSection={<IconPlus size={18} />}
              variant="gradient"
              gradient={{ from: 'pink', to: 'violet', deg: 45 }}
              size="lg"
              mt="sm"
            >
              {t('createFirstRecipe')}
            </Button>
          </Stack>
        </Center>
      ) : (
        <RecipeGrid
          recipes={recipes}
          loading={loading}
          withFavorite
          emptyMessage={t('noMyRecipesYet')}
        />
      )}
    </Stack>
  );
};

export default MyRecipesClient;
