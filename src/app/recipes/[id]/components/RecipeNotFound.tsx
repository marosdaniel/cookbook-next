'use client';

import { Center, Stack, Text, Title } from '@mantine/core';
import { IconChefHat } from '@tabler/icons-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { PUBLIC_ROUTES } from '@/types/routes';
import { MOTION_TRANSITION } from '../../../../lib/motion/transitions';
import type { RecipeNotFoundProps } from '../types';

export const RecipeNotFound = ({
  errorMessage,
}: Readonly<RecipeNotFoundProps>) => {
  const translate = useTranslations('recipeDetail');

  return (
    <Center h="60vh">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={MOTION_TRANSITION.slow}
      >
        <Stack align="center" gap="md">
          <IconChefHat size={64} color="var(--mantine-color-dimmed)" />

          <Title order={3}>{translate('notFound')}</Title>

          <Text c="dimmed">
            {errorMessage ?? translate('notFoundDescription')}
          </Text>

          <Text
            component={Link}
            href={PUBLIC_ROUTES.RECIPES}
            c="pink"
            fw={600}
            td="underline"
          >
            {translate('backToRecipes')}
          </Text>
        </Stack>
      </motion.div>
    </Center>
  );
};
