import {
  Box,
  Button,
  Divider,
  Group,
  Progress,
  Stack,
  Text,
} from '@mantine/core';
import {
  IconChefHat,
  IconPhoto,
  IconPlus,
  IconSparkles,
  IconToolsKitchen2,
  IconTrash,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { memo } from 'react';
import { getProgressColor, sectionCompletion } from '../../utils';
import SectionNavItem from '../SectionNavItem';
import type { ComposerSidebarProps } from './types';

const ComposerSidebar = memo(
  ({
    activeSection,
    onSectionChange,
    values,
    completion,
    onAddIngredient,
    onAddStep,
    onReset,
    resetLabel,
  }: Readonly<ComposerSidebarProps>) => {
    const t = useTranslations('recipeCreate.sidebar');

    const sectionItems = [
      {
        key: 'basics' as const,
        label: 'Basics',
        icon: <IconSparkles size={18} />,
      },
      {
        key: 'media' as const,
        label: 'Media',
        icon: <IconPhoto size={18} />,
      },
      {
        key: 'ingredients' as const,
        label: 'Ingredients',
        icon: <IconToolsKitchen2 size={18} />,
      },
      {
        key: 'steps' as const,
        label: 'Steps',
        icon: <IconChefHat size={18} />,
      },
    ];

    return (
      <Box
        visibleFrom="md"
        w={280}
        p="sm"
        style={{
          borderRight: '1px solid var(--mantine-color-gray-2)',
          overflowY: 'auto',
          flexShrink: 0,
          height: '100%',
        }}
      >
        <Stack gap="xs">
          <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb={4}>
            {t('sectionsTitle')}
          </Text>
          {sectionItems.map((s) => {
            const sc = sectionCompletion(s.key, values);
            const hint = (() => {
              if (s.key === 'ingredients')
                return t('itemsCount', { count: values.ingredients.length });
              if (s.key === 'steps')
                return t('stepsCount', {
                  count: values.preparationSteps.length,
                });
              if (s.key === 'media')
                return values.imgSrc ? t('mediaCoverSet') : t('mediaOptional');
              return `${sc.done}/${sc.total} filled`;
            })();

            return (
              <SectionNavItem
                key={s.key}
                label={s.label}
                hint={hint}
                icon={s.icon}
                active={activeSection === s.key}
                completionDone={sc.done}
                completionTotal={sc.total}
                onClick={() => onSectionChange(s.key)}
              />
            );
          })}

          <Divider my="sm" />
          <Progress
            value={completion.percent}
            size="sm"
            radius="xl"
            color={getProgressColor(completion.percent)}
          />
          <Text size="xs" c="dimmed" ta="center">
            {t('progressPercent', { percent: completion.percent })}
          </Text>

          <Divider my="sm" />

          <Group gap="xs">
            <Button
              size="xs"
              variant="light"
              leftSection={<IconPlus size={14} />}
              onClick={() => {
                onSectionChange('ingredients');
                onAddIngredient();
              }}
              fullWidth
            >
              {t('quickAddIngredient')}
            </Button>
            <Button
              size="xs"
              variant="light"
              leftSection={<IconPlus size={14} />}
              onClick={() => {
                onSectionChange('steps');
                onAddStep();
              }}
              fullWidth
            >
              {t('quickAddStep')}
            </Button>
          </Group>

          <Divider my="sm" />

          <Button
            size="xs"
            variant="subtle"
            color="red"
            leftSection={<IconTrash size={14} />}
            onClick={onReset}
            fullWidth
          >
            {resetLabel || t('resetButton')}
          </Button>
        </Stack>
      </Box>
    );
  },
);

export default ComposerSidebar;
