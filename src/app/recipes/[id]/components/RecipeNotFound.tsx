import { Center, Stack, Text, Title } from '@mantine/core';
import { IconChefHat } from '@tabler/icons-react';
import type { Route } from 'next';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { RecipeNotFoundProps } from '../types';

export const RecipeNotFound = ({
  errorMessage,
}: Readonly<RecipeNotFoundProps>) => {
  const translate = useTranslations('recipeDetail');

  return (
    <Center h="60vh">
      <Stack align="center" gap="md">
        <IconChefHat size={64} color="var(--mantine-color-dimmed)" />
        <Title order={3}>{translate('notFound')}</Title>
        <Text c="dimmed">
          {errorMessage ?? translate('notFoundDescription')}
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
};
