import { ActionIcon, Group, Text } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import type { Route } from 'next';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function BackLink() {
  const translate = useTranslations('recipeDetail');

  return (
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
      <Text component={Link} href={'/recipes' as Route} c="dimmed" size="sm">
        {translate('backToRecipes')}
      </Text>
    </Group>
  );
}
