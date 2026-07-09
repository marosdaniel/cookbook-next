'use client';

import { useMutation } from '@apollo/client/react';
import { ActionIcon, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconHeart, IconHeartFilled } from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';
import {
  ADD_TO_FAVORITE_RECIPES,
  REMOVE_FROM_FAVORITE_RECIPES,
} from '@/lib/graphql/mutations';
import { sizeMap } from '../consts';
import type { FavoriteButtonProps } from './types';

const FavoriteButton = ({
  recipeId,
  isFavorite = false,
  size = 'md',
}: FavoriteButtonProps) => {
  const { data: session } = useSession();
  const translate = useTranslations('response');
  const tFav = useTranslations('favorites');
  const [optimisticFavorite, setOptimisticFavorite] = useState(isFavorite);

  const [addToFavorite, { loading: addLoading }] = useMutation(
    ADD_TO_FAVORITE_RECIPES,
  );
  const [removeFromFavorite, { loading: removeLoading }] = useMutation(
    REMOVE_FROM_FAVORITE_RECIPES,
  );

  const loading = addLoading || removeLoading;
  const userId = (session?.user as { id?: string })?.id;

  const handleToggle = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!userId || loading) return;

      const previousState = optimisticFavorite;
      setOptimisticFavorite(!previousState);

      try {
        const mutation = previousState ? removeFromFavorite : addToFavorite;
        const result = await mutation({
          variables: { userId, recipeId },
          refetchQueries: ['getFavoriteRecipes', 'getRecipeById'],
        });

        const response = previousState
          ? (
              result.data as
                | {
                    removeFromFavoriteRecipes?: {
                      success: boolean;
                      message: string;
                      messageKey?: string;
                    };
                  }
                | undefined
            )?.removeFromFavoriteRecipes
          : (
              result.data as
                | {
                    addToFavoriteRecipes?: {
                      success: boolean;
                      message: string;
                      messageKey?: string;
                    };
                  }
                | undefined
            )?.addToFavoriteRecipes;

        if (response && !response.success) {
          setOptimisticFavorite(previousState);
          notifications.show({
            title: translate('error'),
            message: translate(
              response.messageKey?.replace('response.', '') ?? 'unknownError',
            ),
            color: 'red',
          });
        }
      } catch {
        setOptimisticFavorite(previousState);
        notifications.show({
          title: translate('error'),
          message: translate('somethingWentWrong'),
          color: 'red',
        });
      }
    },
    [
      userId,
      recipeId,
      optimisticFavorite,
      loading,
      addToFavorite,
      removeFromFavorite,
      translate,
    ],
  );

  if (!userId) return null;

  const iconSize = sizeMap[size];
  const HeartIcon = optimisticFavorite ? IconHeartFilled : IconHeart;

  return (
    <Tooltip
      label={optimisticFavorite ? tFav('remove') : tFav('add')}
      withArrow
    >
      <ActionIcon
        variant="subtle"
        color={optimisticFavorite ? 'red' : 'gray'}
        onClick={handleToggle}
        loading={loading}
        aria-label={optimisticFavorite ? tFav('remove') : tFav('add')}
        size={size}
        data-testid="favorite-button"
      >
        <HeartIcon
          size={iconSize}
          style={{
            color: optimisticFavorite
              ? 'var(--mantine-color-red-6)'
              : undefined,
          }}
        />
      </ActionIcon>
    </Tooltip>
  );
};

export default FavoriteButton;
