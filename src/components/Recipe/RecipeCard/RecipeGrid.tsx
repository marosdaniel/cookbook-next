'use client';

import { Center, SimpleGrid, Skeleton, Stack, Text } from '@mantine/core';
import { IconMoodSad } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { MOTION_TRANSITION } from '@/lib/motion/transitions';
import RecipeCard from './RecipeCard';
import type { RecipeGridProps } from './types';

const SKELETON_ITEMS = [1, 2, 3, 4, 5, 6, 7, 8];

const RecipeGrid = ({
  recipes,
  loading = false,
  withFavorite = true,
  emptyMessage,
  columns = { base: 1, sm: 2, md: 3, lg: 4 },
}: RecipeGridProps) => {
  const t = useTranslations('recipe');
  const empty = emptyMessage ?? t('empty');
  const content = (() => {
    if (loading) {
      return (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={MOTION_TRANSITION.standard}
        >
          <SimpleGrid cols={columns} data-testid="recipe-grid">
            {SKELETON_ITEMS.map((item) => (
              <Skeleton
                key={`skeleton-${item}`}
                height={320}
                radius="md"
                data-testid="recipe-grid-skeleton"
              />
            ))}
          </SimpleGrid>
        </motion.div>
      );
    }

    if (!recipes.length) {
      return (
        <motion.div
          key="empty"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={MOTION_TRANSITION.standard}
        >
          <Center
            py="xl"
            data-testid="recipe-grid-empty"
            style={{ minHeight: 320 }}
          >
            <Stack align="center" gap="xs">
              <IconMoodSad size={48} color="var(--mantine-color-dimmed)" />
              <Text c="dimmed" size="lg">
                {empty}
              </Text>
            </Stack>
          </Center>
        </motion.div>
      );
    }

    return (
      <motion.div
        key="grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={MOTION_TRANSITION.standard}
      >
        <SimpleGrid cols={columns} data-testid="recipe-grid">
          <AnimatePresence mode="popLayout" initial={false}>
            {recipes.map((recipe) => (
              <motion.div
                key={recipe.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={MOTION_TRANSITION.standard}
              >
                <RecipeCard recipe={recipe} withFavorite={withFavorite} />
              </motion.div>
            ))}
          </AnimatePresence>
        </SimpleGrid>
      </motion.div>
    );
  })();

  return <AnimatePresence mode="wait">{content}</AnimatePresence>;
};

export default RecipeGrid;
