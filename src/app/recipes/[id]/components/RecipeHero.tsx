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
import type { Route } from 'next';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { FavoriteButton } from '@/components/buttons/FavoriteButton';
import classes from '../RecipeDetail.module.css';
import type { RecipeHeroProps } from '../types';
import { getDifficultyColor } from '../utils';

export function RecipeHero({ recipe, isOwner }: Readonly<RecipeHeroProps>) {
  const translate = useTranslations('recipeDetail');
  const translateMisc = useTranslations('misc');

  return (
    <Box className={classes.hero}>
      {recipe.imgSrc ? (
        <Image
          src={recipe.imgSrc}
          alt={recipe.title}
          className={classes.heroImage}
        />
      ) : (
        <Box className={classes.heroPlaceholder}>
          <IconChefHat size={80} color="var(--mantine-color-pink-4)" />
        </Box>
      )}
      <Box className={classes.heroOverlay} />

      {/* Top-right actions */}
      <Group className={classes.heroActions} gap="xs">
        <FavoriteButton
          recipeId={recipe.id}
          isFavorite={recipe.isFavorite ?? false}
          size="lg"
        />
        {isOwner && (
          <ActionIcon
            component={Link}
            href={`/recipes/${recipe.id}/edit` as Route}
            variant="subtle"
            color="white"
            size="lg"
          >
            <IconEdit size={22} />
          </ActionIcon>
        )}
      </Group>

      {/* Hero content */}
      <Box className={classes.heroContent}>
        <Title order={1} className={classes.heroTitle}>
          {recipe.title}
        </Title>

        {recipe.description && (
          <Text className={classes.heroDescription} mt={6}>
            {recipe.description}
          </Text>
        )}

        {/* Label pills */}
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

        {/* Quick info pills */}
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
      </Box>
    </Box>
  );
}
