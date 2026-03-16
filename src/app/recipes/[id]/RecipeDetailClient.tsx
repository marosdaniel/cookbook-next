'use client';

import { useQuery } from '@apollo/client/react';
import {
  ActionIcon,
  Badge,
  Box,
  Center,
  Checkbox,
  Container,
  Grid,
  Group,
  Image,
  Loader,
  NumberInput,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconChefHat,
  IconClock,
  IconEdit,
  IconFlame,
  IconMinus,
  IconPlus,
  IconUsers,
} from '@tabler/icons-react';
import type { Route } from 'next';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import { FavoriteButton } from '@/components/buttons/FavoriteButton';
import RecipeRating from '@/components/Recipe/Rating';
import { GET_RECIPE_BY_ID } from '@/lib/graphql/queries';
import classes from './RecipeDetail.module.css';
import type { RecipeDetailClientProps, RecipeDetailData } from './types';
import { extractYoutubeId, getDifficultyColor } from './utils';

const RecipeDetailClient = ({
  recipeId,
}: Readonly<RecipeDetailClientProps>) => {
  const translate = useTranslations('recipeDetail');
  const translateMisc = useTranslations('misc');
  const { data: session } = useSession();

  /* Data */
  const { data, loading, error } = useQuery<RecipeDetailData>(
    GET_RECIPE_BY_ID,
    { variables: { id: recipeId } },
  );

  const recipe = data?.getRecipeById;

  /* Interactive state */
  const [servingMultiplier, setServingMultiplier] = useState(1);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(
    new Set(),
  );

  const adjustedServings = useMemo(
    () => (recipe ? recipe.servings * servingMultiplier : 0),
    [recipe, servingMultiplier],
  );

  const toggleIngredient = useCallback((localId: string) => {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(localId)) next.delete(localId);
      else next.add(localId);
      return next;
    });
  }, []);

  const incrementServings = useCallback(
    () => setServingMultiplier((m) => Math.min(m + 1, 20)),
    [],
  );
  const decrementServings = useCallback(
    () => setServingMultiplier((m) => Math.max(m - 1, 1)),
    [],
  );

  const youtubeId = useMemo(
    () => (recipe?.youtubeLink ? extractYoutubeId(recipe.youtubeLink) : null),
    [recipe?.youtubeLink],
  );

  const isOwner =
    !!recipe &&
    (session?.user as { id?: string } | undefined)?.id === recipe.createdBy;

  const sortedSteps = useMemo(
    () =>
      recipe
        ? [...recipe.preparationSteps].sort((a, b) => a.order - b.order)
        : [],
    [recipe],
  );

  /* ─── Loading / Error states ───────────────── */

  if (loading) {
    return (
      <Center h="60vh">
        <Loader size="lg" type="dots" />
      </Center>
    );
  }

  if (error || !recipe) {
    return (
      <Center h="60vh">
        <Stack align="center" gap="md">
          <IconChefHat size={64} color="var(--mantine-color-dimmed)" />
          <Title order={3}>{translate('notFound')}</Title>
          <Text c="dimmed">
            {error?.message ?? translate('notFoundDescription')}
          </Text>
          <Text
            component={Link}
            href={'/recipes' as Route}
            c="pink"
            fw={600}
            td="underline"
          >
            {translate('backToRecipes')}
          </Text>
        </Stack>
      </Center>
    );
  }

  /* ─── Render ───────────────────────────────── */

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Back link */}
        <Group>
          <ActionIcon
            component={Link}
            href={'/recipes' as Route}
            variant="subtle"
            color="gray"
            size="lg"
          >
            <IconArrowLeft size={20} />
          </ActionIcon>
          <Text
            component={Link}
            href={'/recipes' as Route}
            c="dimmed"
            size="sm"
          >
            {translate('backToRecipes')}
          </Text>
        </Group>

        {/* ═══ Hero Section ═══ */}
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

        {/* ═══ Main content grid ═══ */}
        <Grid gap="xl">
          {/* Left column – Steps */}
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Stack gap="xl">
              {/* Preparation Steps */}
              <Box>
                <Title order={2} size="h3" mb="lg">
                  {translate('preparationSteps')}
                </Title>
                <Stack gap="lg">
                  {sortedSteps.map((step) => (
                    <Paper
                      key={step.order}
                      p="lg"
                      radius="md"
                      withBorder
                      className={classes.stepCard}
                    >
                      <span className={classes.stepWatermark}>
                        {step.order}
                      </span>
                      <Box className={classes.stepContent}>
                        <Text size="md" lh={1.7}>
                          {step.description}
                        </Text>
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              </Box>

              {/* YouTube video */}
              {youtubeId && (
                <Box>
                  <Title order={2} size="h3" mb="md">
                    {translate('videoTitle')}
                  </Title>
                  <Box className={classes.videoWrapper}>
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
                      title={recipe.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </Box>
                </Box>
              )}

              {/* Rating */}
              <Paper p="lg" radius="md" withBorder>
                <Title order={3} size="h4" mb="sm">
                  {translate('rateThisRecipe')}
                </Title>
                <RecipeRating
                  recipeId={recipe.id}
                  userRating={recipe.userRating ?? undefined}
                  averageRating={recipe.averageRating}
                  ratingsCount={recipe.ratingsCount}
                />
              </Paper>
            </Stack>
          </Grid.Col>

          {/* Right column – Ingredients (sticky) */}
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Paper
              p="lg"
              radius="md"
              withBorder
              className={classes.ingredientsCard}
            >
              <Group justify="space-between" mb="md">
                <Title order={2} size="h3" c="pink">
                  {translate('ingredients')}
                </Title>
                <Text size="xs" c="dimmed">
                  {translate('checkedOff', {
                    count: checkedIngredients.size,
                    total: recipe.ingredients.length,
                  })}
                </Text>
              </Group>

              {/* Serving adjuster */}
              <Group gap="xs" mb="lg" justify="center">
                <Text fw={700} size="sm" tt="uppercase">
                  {translate('servings')}:
                </Text>
                <ActionIcon
                  variant="filled"
                  color="pink"
                  size="sm"
                  onClick={decrementServings}
                  disabled={servingMultiplier <= 1}
                  aria-label="Decrease servings"
                >
                  <IconMinus size={14} />
                </ActionIcon>
                <NumberInput
                  value={adjustedServings}
                  readOnly
                  hideControls
                  w={50}
                  size="xs"
                  styles={{
                    input: { textAlign: 'center', fontWeight: 700 },
                  }}
                />
                <ActionIcon
                  variant="filled"
                  color="pink"
                  size="sm"
                  onClick={incrementServings}
                  disabled={servingMultiplier >= 20}
                  aria-label="Increase servings"
                >
                  <IconPlus size={14} />
                </ActionIcon>
              </Group>

              {/* Ingredient list */}
              <Stack gap={0}>
                {recipe.ingredients.map((ing) => {
                  const checked = checkedIngredients.has(ing.localId);
                  const scaledQty = +(ing.quantity * servingMultiplier).toFixed(
                    2,
                  );
                  return (
                    <Box
                      key={ing.localId}
                      className={`${classes.ingredientItem} ${checked ? classes.ingredientChecked : ''}`}
                      onClick={() => toggleIngredient(ing.localId)}
                    >
                      <Checkbox
                        checked={checked}
                        onChange={() => toggleIngredient(ing.localId)}
                        color="pink"
                        size="sm"
                        tabIndex={-1}
                        aria-label={ing.name}
                      />
                      <Text
                        size="sm"
                        className={`${classes.ingredientText} ${checked ? classes.ingredientTextChecked : ''}`}
                      >
                        <Text component="span" fw={700}>
                          {scaledQty}
                          {ing.unit}
                        </Text>{' '}
                        {ing.name}
                      </Text>
                    </Box>
                  );
                })}
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
};

export default RecipeDetailClient;
