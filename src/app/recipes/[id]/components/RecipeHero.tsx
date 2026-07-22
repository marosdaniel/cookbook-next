'use client';

import {
  ActionIcon,
  Badge,
  Box,
  Group,
  Image,
  Text,
  Title,
} from '@mantine/core';
import {
  IconChefHat,
  IconClock,
  IconEdit,
  IconFlame,
  IconUsers,
} from '@tabler/icons-react';
import { motion } from 'motion/react';
import type { Route } from 'next';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { FavoriteButton } from '@/components/buttons/FavoriteButton';
import { PUBLIC_ROUTES } from '@/types/routes';
import { MOTION_TRANSITION } from '../../../../lib/motion/transitions';
import classes from '../RecipeDetail.module.css';
import type { RecipeHeroProps } from '../types';
import { getDifficultyColor } from '../utils';

export const RecipeHero = ({ recipe, isOwner }: Readonly<RecipeHeroProps>) => {
  const translate = useTranslations('recipeDetail');
  const translateMisc = useTranslations('misc');

  const editHref = `${PUBLIC_ROUTES.RECIPES}/${recipe.id}/edit` as Route;

  return (
    <Box className={classes.hero} data-testid="recipe-hero">
      {recipe.imgSrc ? (
        <Image
          src={recipe.imgSrc}
          alt={recipe.title}
          className={classes.heroImage}
          data-testid="recipe-hero-image"
        />
      ) : (
        <Box
          className={classes.heroPlaceholder}
          data-testid="recipe-hero-placeholder"
        >
          <IconChefHat size={80} color="var(--mantine-color-pink-4)" />
        </Box>
      )}

      <Box className={classes.heroOverlay} />

      <motion.div
        className={classes.heroActions}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={MOTION_TRANSITION.interactive}
      >
        <Group gap="xs">
          <FavoriteButton
            recipeId={recipe.id}
            isFavorite={recipe.isFavorite ?? false}
            size="lg"
          />

          {isOwner && (
            <motion.div
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.92 }}
              transition={MOTION_TRANSITION.interactive}
              data-testid="recipe-hero-edit-action"
            >
              <ActionIcon
                component={Link}
                href={editHref}
                variant="subtle"
                color="white"
                size="lg"
                aria-label={translate('editRecipe')}
              >
                <IconEdit size={22} />
              </ActionIcon>
            </motion.div>
          )}
        </Group>
      </motion.div>

      <motion.div
        className={classes.heroContent}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={MOTION_TRANSITION.slow}
      >
        <Title
          order={1}
          className={classes.heroTitle}
          data-testid="recipe-hero-title"
        >
          {recipe.title}
        </Title>

        {recipe.description && (
          <Text
            className={classes.heroDescription}
            mt={6}
            data-testid="recipe-hero-description"
          >
            {recipe.description}
          </Text>
        )}

        <Group gap="xs" mt="sm">
          <Badge variant="light" className={classes.labelPill}>
            {translateMisc(`category-${recipe.category.key}`)}
          </Badge>

          <Badge
            variant="light"
            color={getDifficultyColor(recipe.difficultyLevel.key)}
            className={classes.labelPill}
          >
            {translateMisc(`level-${recipe.difficultyLevel.key}`)}
          </Badge>

          {recipe.labels.map((label) => (
            <Badge
              key={label.key}
              variant="filled"
              color="pink"
              className={classes.labelPill}
            >
              {translateMisc(`label-${label.key}`)}
            </Badge>
          ))}
        </Group>

        <Box className={classes.quickInfo}>
          <span className={classes.infoPill}>
            <IconClock size={16} />
            {translate('cookingTime', { time: recipe.cookingTime })}
          </span>

          <span className={classes.infoPill}>
            <IconUsers size={16} />
            {translate('servingsCount', { count: recipe.servings })}
          </span>

          {recipe.ratingsCount > 0 && (
            <span className={classes.infoPill}>
              <IconFlame size={16} />
              {recipe.averageRating.toFixed(1)} ({recipe.ratingsCount})
            </span>
          )}
        </Box>
      </motion.div>
    </Box>
  );
};
