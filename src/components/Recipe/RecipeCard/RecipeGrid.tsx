'use client';

import { SimpleGrid, Skeleton } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconMoodSad } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { EmptyState } from '@/components/EmptyState';
import { MOTION_TRANSITION } from '@/lib/motion/transitions';
import { listItemVariants, listVariants } from '@/lib/motion/variants';
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
  const isDesktop = useMediaQuery('(min-width: 48em)');

  const content = (() => {
    if (loading) {
      return (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={MOTION_TRANSITION.fast}
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
          transition={MOTION_TRANSITION.fast}
        >
          <EmptyState
            data-testid="recipe-grid-empty"
            icon={<IconMoodSad size={48} color="var(--mantine-color-dimmed)" />}
            title={empty}
          />
        </motion.div>
      );
    }

    return (
      <motion.div
        key="grid"
        variants={listVariants}
        initial="hidden"
        animate="visible"
        exit={{ opacity: 0 }}
        transition={MOTION_TRANSITION.fast}
      >
        <SimpleGrid cols={columns} data-testid="recipe-grid">
          <AnimatePresence mode="popLayout" initial={false}>
            {recipes.map((recipe) => (
              <motion.div
                key={recipe.id}
                layout={Boolean(isDesktop)}
                variants={listItemVariants}
                exit={{
                  opacity: 0,
                  scale: 0.96,
                  transition: MOTION_TRANSITION.fast,
                }}
                whileTap={{ scale: 0.98 }}
              >
                <RecipeCard recipe={recipe} withFavorite={withFavorite} />
              </motion.div>
            ))}
          </AnimatePresence>
        </SimpleGrid>
      </motion.div>
    );
  })();

  return (
    <AnimatePresence mode="wait" initial={false}>
      {content}
    </AnimatePresence>
  );
};

export default RecipeGrid;
