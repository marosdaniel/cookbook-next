import {
  Badge,
  Box,
  Group,
  Image,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IconChefHat,
  IconCoin,
  IconFlame,
  IconWorld,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import type { RecipePreviewValues } from './types';

type RecipeHeroProps = {
  values: RecipePreviewValues;
};

export const RecipeHero = ({ values }: RecipeHeroProps) => {
  const t = useTranslations('recipePreview');

  const categoryLabel = values.category?.label;
  const difficultyLabel = values.difficultyLevel?.label;
  const cuisineLabel = values.cuisine?.label;
  const costLevelLabel = values.costLevel?.label;

  return (
    <Box pos="relative" h={{ base: 280, sm: 360 }} bg="gray.1">
      {values.imgSrc ? (
        <Image
          src={values.imgSrc}
          alt={t('imageAlt')}
          h="100%"
          w="100%"
          fit="cover"
          fallbackSrc="https://placehold.co/1200x600?text=Your+Delicious+Dish"
        />
      ) : (
        <Stack h="100%" align="center" justify="center" gap="md" bg="gray.1">
          <ThemeIcon
            size={80}
            radius="50%"
            variant="light"
            color="gray"
            style={{ border: '2px dashed var(--mantine-color-gray-4)' }}
          >
            <IconChefHat size={40} />
          </ThemeIcon>

          <Text c="dimmed" fw={500}>
            {t('noCover')}
          </Text>
        </Stack>
      )}

      <Box
        pos="absolute"
        inset={0}
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.8) 100%)',
        }}
      />

      <Box
        pos="absolute"
        bottom={0}
        left={0}
        right={0}
        p={{ base: 'md', sm: 'xl' }}
      >
        <Group gap="xs" mb="xs">
          {categoryLabel && (
            <Badge
              variant="filled"
              color="rgba(255,255,255,0.2)"
              radius="sm"
              c="white"
              style={{ backdropFilter: 'blur(4px)' }}
            >
              {categoryLabel}
            </Badge>
          )}

          {difficultyLabel && (
            <Badge
              variant="filled"
              color="rgba(255,255,255,0.2)"
              radius="sm"
              c="white"
              leftSection={<IconFlame size={12} />}
              style={{ backdropFilter: 'blur(4px)' }}
            >
              {difficultyLabel}
            </Badge>
          )}

          {cuisineLabel && (
            <Badge
              variant="filled"
              color="rgba(255,255,255,0.2)"
              radius="sm"
              c="white"
              leftSection={<IconWorld size={12} />}
              style={{ backdropFilter: 'blur(4px)' }}
            >
              {cuisineLabel}
            </Badge>
          )}

          {costLevelLabel && (
            <Badge
              variant="filled"
              color="rgba(255,255,255,0.2)"
              radius="sm"
              c="white"
              leftSection={<IconCoin size={12} />}
              style={{ backdropFilter: 'blur(4px)' }}
            >
              {costLevelLabel}
            </Badge>
          )}
        </Group>

        <Title
          order={1}
          c="white"
          data-testid="recipe-preview-title"
          style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
            lineHeight: 1.1,
            textShadow: '0 2px 10px rgba(0,0,0,0.3)',
          }}
        >
          {values.title?.trim() || t('title.untitled')}
        </Title>

        {!values.title?.trim() && (
          <Text c="dimmed" size="sm" mt="xs" fs="italic" opacity={0.7}>
            {t('title.addHint')}
          </Text>
        )}
      </Box>
    </Box>
  );
};
