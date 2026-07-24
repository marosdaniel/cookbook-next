'use client';

import { useMutation } from '@apollo/client/react';
import { ActionIcon, Tooltip } from '@mantine/core';
import { IconHeart, IconHeartFilled } from '@tabler/icons-react';
import { motion, useAnimationControls } from 'motion/react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import type { MouseEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  ADD_TO_FAVORITE_RECIPES,
  REMOVE_FROM_FAVORITE_RECIPES,
} from '@/lib/graphql/mutations';
import { showErrorNotification } from '@/utils/notifications';
import { sizeMap } from '../consts';
import type { FavoriteButtonProps } from './types';

const FAVORITE_TRANSITION = {
  duration: 0.24,
  ease: 'easeOut',
} as const;

const FavoriteButton = ({
  recipeId,
  isFavorite = false,
  size = 'md',
}: FavoriteButtonProps) => {
  const { data: session } = useSession();
  const translate = useTranslations('response');
  const tFav = useTranslations('favorites');

  const [optimisticFavorite, setOptimisticFavorite] = useState(isFavorite);
  const iconControls = useAnimationControls();
  const burstControls = useAnimationControls();

  const [addToFavorite, { loading: addLoading }] = useMutation(
    ADD_TO_FAVORITE_RECIPES,
  );
  const [removeFromFavorite, { loading: removeLoading }] = useMutation(
    REMOVE_FROM_FAVORITE_RECIPES,
  );

  const loading = addLoading || removeLoading;
  const userId = (session?.user as { id?: string })?.id;

  useEffect(() => {
    setOptimisticFavorite(isFavorite);
  }, [isFavorite]);

  const runSuccessAnimation = useCallback(
    async (wasFavorite: boolean) => {
      if (wasFavorite) {
        await iconControls.start({
          opacity: [0.55, 1],
          scale: [0.94, 1],
          transition: FAVORITE_TRANSITION,
        });

        return;
      }

      await Promise.all([
        iconControls.start({
          scale: [0.8, 1.22, 1],
          transition: FAVORITE_TRANSITION,
        }),
        burstControls.start({
          opacity: [0, 0.65, 0],
          scale: [0.65, 1.5],
          transition: {
            duration: 0.36,
            ease: 'easeOut',
          },
        }),
      ]);
    },
    [burstControls, iconControls],
  );

  const handleToggle = useCallback(
    async (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (!userId || loading) {
        return;
      }

      const previousState = optimisticFavorite;
      setOptimisticFavorite(!previousState);

      try {
        const mutation = previousState ? removeFromFavorite : addToFavorite;

        const result = await mutation({
          variables: { userId, recipeId },
          refetchQueries: ['getFavoriteRecipes', 'getRecipeById'],
          awaitRefetchQueries: true,
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

        if (!response?.success) {
          setOptimisticFavorite(previousState);

          showErrorNotification(
            translate('error'),
            translate(
              response?.messageKey?.replace('response.', '') ?? 'unknownError',
            ),
          );

          return;
        }

        await runSuccessAnimation(previousState);
      } catch {
        setOptimisticFavorite(previousState);

        showErrorNotification(
          translate('error'),
          translate('somethingWentWrong'),
        );
      }
    },
    [
      addToFavorite,
      loading,
      optimisticFavorite,
      recipeId,
      removeFromFavorite,
      runSuccessAnimation,
      translate,
      userId,
    ],
  );

  if (!userId) {
    return null;
  }

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
        aria-pressed={optimisticFavorite}
        size={size}
        data-testid="favorite-button"
      >
        <span
          style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: iconSize,
            height: iconSize,
          }}
        >
          <motion.span
            aria-hidden="true"
            animate={burstControls}
            initial={{ opacity: 0, scale: 0.65 }}
            style={{
              position: 'absolute',
              inset: -4,
              border: '1.5px solid var(--mantine-color-red-5)',
              borderRadius: '50%',
              pointerEvents: 'none',
            }}
          />

          <motion.span
            animate={iconControls}
            initial={false}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HeartIcon
              size={iconSize}
              style={{
                color: optimisticFavorite
                  ? 'var(--mantine-color-red-6)'
                  : undefined,
              }}
            />
          </motion.span>
        </span>
      </ActionIcon>
    </Tooltip>
  );
};

export default FavoriteButton;
