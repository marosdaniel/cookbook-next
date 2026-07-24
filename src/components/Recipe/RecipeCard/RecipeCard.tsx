'use client';

import { Badge, Box, Card, Group, Image, Rating, Text } from '@mantine/core';
import {
  IconChefHat,
  IconClock,
  IconStar,
  IconUsers,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getDifficultyColor } from '@/app/recipes/[id]/utils';
import { FavoriteButton } from '@/components/buttons/FavoriteButton';
import { PUBLIC_ROUTES } from '@/types/routes';
import classes from './RecipeCard.module.css';
import type { RecipeCardProps } from './types';

const RecipeCard = ({ recipe, withFavorite = true }: RecipeCardProps) => {
  const translate = useTranslations('misc');
  const tCommon = useTranslations();

  const {
    id,
    title,
    description,
    imgSrc,
    cookingTime,
    servings,
    category,
    difficultyLevel,
    slug,
    averageRating = 0,
    ratingsCount = 0,
    isFavorite = false,
  } = recipe;

  const difficultyColor = getDifficultyColor(difficultyLevel.key);
  const recipeHref = PUBLIC_ROUTES.RECIPE_DETAIL(slug || id);

  return (
    <Card
      component={Link}
      href={recipeHref}
      shadow="sm"
      radius="md"
      withBorder
      className={classes.card}
      padding={0}
      data-testid="recipe-card"
    >
      <Card.Section
        className={classes.imageSection}
        data-testid="recipe-card-image"
      >
        {imgSrc ? (
          <Image src={imgSrc} height={180} alt={title} fit="cover" />
        ) : (
          <Box className={classes.placeholderImage}>
            <IconChefHat size={48} color="var(--mantine-color-pink-4)" />
          </Box>
        )}
        {withFavorite && (
          <Box
            className={classes.favoriteButton}
            data-testid="recipe-card-favorite"
          >
            <FavoriteButton recipeId={id} isFavorite={isFavorite} size="sm" />
          </Box>
        )}
      </Card.Section>

      <Box p="sm" pb="md">
        <Group justify="space-between" mb={4}>
          <Badge variant="light" size="sm" className={classes.badge}>
            {translate(`category-${category.key}`)}
          </Badge>
          <Badge
            variant="light"
            color={difficultyColor}
            size="sm"
            className={classes.badge}
          >
            {translate(`level-${difficultyLevel.key}`)}
          </Badge>
        </Group>

        <Text
          fw={600}
          size="md"
          mt={4}
          className={classes.title}
          data-testid="recipe-card-title"
        >
          {title}
        </Text>

        {description && (
          <Text
            size="xs"
            c="dimmed"
            mt={4}
            className={classes.description}
            data-testid="recipe-card-description"
          >
            {description}
          </Text>
        )}

        <Group mt="sm" gap="md" data-testid="recipe-card-meta">
          <Group gap={4} className={classes.metaRow}>
            <IconClock size={14} color="var(--mantine-color-dimmed)" />
            <Text size="xs" c="dimmed">
              {cookingTime} {tCommon('units.minuteShort')}
            </Text>
          </Group>
          <Group gap={4} className={classes.metaRow}>
            <IconUsers size={14} color="var(--mantine-color-dimmed)" />
            <Text size="xs" c="dimmed">
              {servings}
            </Text>
          </Group>
        </Group>

        {ratingsCount > 0 && (
          <Group mt="xs" gap="xs" data-testid="recipe-card-rating">
            <Rating value={averageRating} readOnly fractions={2} size="xs" />
            <Group gap={2}>
              <IconStar size={12} color="var(--mantine-color-dimmed)" />
              <Text size="xs" c="dimmed">
                ({ratingsCount})
              </Text>
            </Group>
          </Group>
        )}
      </Box>
    </Card>
  );
};

export default RecipeCard;
