import { Group, Paper, Stack, Text } from '@mantine/core';
import { IconClock, IconUsers } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { NO_VALUE_FALLBACK } from '../../consts';
import type { RecipePreviewValues } from './types';

type RecipeStatsProps = {
  values: RecipePreviewValues;
};

type StatCardProps = {
  label: string;
  value: string;
  icon: React.ReactNode;
};

const StatCard = ({ label, value, icon }: StatCardProps) => (
  <Paper withBorder p="sm" radius="md">
    <Stack gap={4} align="center">
      <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
        {label}
      </Text>

      <Group gap={6}>
        {icon}
        <Text fw={700}>{value}</Text>
      </Group>
    </Stack>
  </Paper>
);

export const RecipeStats = ({ values }: RecipeStatsProps) => {
  const t = useTranslations('recipePreview');

  const servingUnitLabel = values.servingUnit?.label;
  const hasTimeParts =
    Boolean(values.prepTimeMinutes) ||
    Boolean(values.cookTimeMinutes) ||
    Boolean(values.restTimeMinutes);

  return (
    <>
      <Group grow mb="xl" data-testid="recipe-preview-stats">
        <StatCard
          label={t('totalTime.label')}
          value={
            values.cookingTime ? `${values.cookingTime} m` : NO_VALUE_FALLBACK
          }
          icon={<IconClock size={18} color="var(--mantine-color-orange-6)" />}
        />

        <StatCard
          label={t('servings.label')}
          value={
            values.servings
              ? `${values.servings} ${
                  servingUnitLabel || t('servings.fallbackUnit')
                }`
              : NO_VALUE_FALLBACK
          }
          icon={<IconUsers size={18} color="var(--mantine-color-blue-6)" />}
        />
      </Group>

      {hasTimeParts && (
        <Group grow mb="md">
          {values.prepTimeMinutes ? (
            <TimePart label={t('time.prep')} value={values.prepTimeMinutes} />
          ) : null}

          {values.cookTimeMinutes ? (
            <TimePart label={t('time.cook')} value={values.cookTimeMinutes} />
          ) : null}

          {values.restTimeMinutes ? (
            <TimePart label={t('time.rest')} value={values.restTimeMinutes} />
          ) : null}
        </Group>
      )}
    </>
  );
};

type TimePartProps = {
  label: string;
  value: number;
};

const TimePart = ({ label, value }: TimePartProps) => (
  <Paper withBorder p="xs" radius="md">
    <Stack gap={2} align="center">
      <Text c="dimmed" size="xs" tt="uppercase" fw={600}>
        {label}
      </Text>

      <Text size="sm" fw={600}>
        {value} min
      </Text>
    </Stack>
  </Paper>
);
