'use client';

import { useMutation, useQuery } from '@apollo/client/react';
import {
  Avatar,
  Box,
  Button,
  Card,
  Center,
  Group,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconChefHat,
  IconToolsKitchen2,
  IconUserHeart,
  IconUserMinus,
  IconUsers,
  IconUsersGroup,
} from '@tabler/icons-react';
import type { Route } from 'next';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
import { RecipeCarousel } from '@/components/Recipe/RecipeCarousel';
import StyledText from '@/components/StyledText';
import { UNFOLLOW_USER } from '@/lib/graphql/mutations';
import { GET_FOLLOWING } from '@/lib/graphql/queries';
import type { OperationResponse } from '@/types/graphql/responses';
import { PUBLIC_ROUTES } from '@/types/routes';
import classes from './FollowingClient.module.css';
import StatCard from './StatCard';
import type { FollowingData } from './types';
import { getInitials } from './utils';

const SKELETON_CARDS = [1, 2, 3, 4];

const FollowingClient = () => {
  const { data: session, status } = useSession();
  const translate = useTranslations('user');

  const userId = (session?.user as { id?: string })?.id;
  const isSessionLoading = status === 'loading';

  const { data, loading } = useQuery<FollowingData>(GET_FOLLOWING, {
    variables: { userId },
    skip: !userId || isSessionLoading,
    fetchPolicy: 'cache-and-network',
  });

  const [unfollowMutation] = useMutation<{
    unfollowUser: OperationResponse;
  }>(UNFOLLOW_USER);

  const handleUnfollow = useCallback(
    async (targetUserId: string) => {
      await unfollowMutation({
        variables: { targetUserId },
        refetchQueries: ['getFollowing'],
      });
    },
    [unfollowMutation],
  );

  const users = data?.getFollowing?.users ?? [];
  const totalFollowing = data?.getFollowing?.totalFollowing ?? 0;
  const totalRecipesFromFollowed = users.reduce(
    (sum, u) => sum + u.recipeCount,
    0,
  );

  if (isSessionLoading || loading) {
    return (
      <Stack gap="lg" p="md">
        <Skeleton height={48} width="60%" radius="md" />
        <Skeleton height={20} width="40%" radius="sm" />
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <Skeleton height={80} radius="md" />
          <Skeleton height={80} radius="md" />
        </SimpleGrid>
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          {SKELETON_CARDS.map((item) => (
            <Skeleton
              key={`following-skeleton-${item}`}
              height={280}
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
        <Group gap="sm" align="center" mb={4}>
          <IconUserHeart size={32} className={classes.headerIcon} aria-hidden />
          <StyledText componentType="title" gradient order={2}>
            {translate('followingHeading')}
          </StyledText>
        </Group>
        <Text size="md" c="dimmed">
          {translate('followingSubtitle')}
        </Text>
      </Box>

      {totalFollowing > 0 && (
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <StatCard
            icon={<IconUsersGroup size={20} />}
            label={translate('followingCount')}
            value={totalFollowing}
          />
          <StatCard
            icon={<IconToolsKitchen2 size={20} />}
            label={translate('followingTotalRecipes')}
            value={totalRecipesFromFollowed}
          />
        </SimpleGrid>
      )}

      {totalFollowing === 0 ? (
        <Center py={60}>
          <Stack align="center" gap="md">
            <ThemeIcon
              size={80}
              radius="xl"
              variant="gradient"
              gradient={{ from: 'pink.3', to: 'violet.3', deg: 45 }}
            >
              <IconUsers size={40} />
            </ThemeIcon>
            <Text c="dimmed" size="lg" ta="center" maw={400}>
              {translate('noFollowingYet')}
            </Text>
            <Button
              component={Link}
              href={PUBLIC_ROUTES.RECIPES as Route}
              variant="gradient"
              gradient={{ from: 'pink', to: 'violet', deg: 45 }}
              size="lg"
              mt="sm"
            >
              {translate('discoverChefs')}
            </Button>
          </Stack>
        </Center>
      ) : (
        <Stack gap="lg">
          {users.map((user) => (
            <Card
              key={user.id}
              withBorder
              radius="md"
              shadow="sm"
              className={classes.userCard}
            >
              <Stack gap="md">
                <Group justify="space-between" wrap="wrap">
                  <Group gap="md">
                    <Avatar
                      size="lg"
                      radius="xl"
                      variant="gradient"
                      gradient={{ from: 'pink', to: 'violet', deg: 135 }}
                    >
                      {getInitials(user.firstName, user.lastName)}
                    </Avatar>
                    <div>
                      <Text fw={600} size="lg">
                        {user.firstName} {user.lastName}
                      </Text>
                      <Text size="sm" c="dimmed">
                        @{user.userName}
                      </Text>
                    </div>
                  </Group>

                  <Group gap="md">
                    <Group gap={4}>
                      <IconChefHat
                        size={16}
                        color="var(--mantine-color-pink-6)"
                      />
                      <Text size="sm" fw={500}>
                        {user.recipeCount} {translate('recipes')}
                      </Text>
                    </Group>
                    <Tooltip label={translate('unfollow')}>
                      <Button
                        variant="light"
                        color="red"
                        size="xs"
                        leftSection={<IconUserMinus size={16} />}
                        className={classes.unfollowButton}
                        onClick={() => handleUnfollow(user.id)}
                      >
                        {translate('unfollow')}
                      </Button>
                    </Tooltip>
                  </Group>
                </Group>

                {user.latestRecipes.length > 0 && (
                  <Box>
                    <Text size="sm" fw={500} mb="xs" c="dimmed">
                      {translate('latestRecipes')}
                    </Text>
                    <RecipeCarousel
                      recipes={user.latestRecipes}
                      withFavorite
                      skeletonCount={3}
                    />
                  </Box>
                )}
              </Stack>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
};

export default FollowingClient;
