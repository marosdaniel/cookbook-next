import {
  Box,
  Button,
  Divider,
  Group,
  Progress,
  Stack,
  Text,
} from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { memo } from 'react';
import { getProgressColor, sectionCompletion } from '../../utils';
import SectionNavItem from '../SectionNavItem';
import { SECTION_ITEMS } from './consts';
import type { ComposerSidebarProps } from './types';
import { getSectionHint } from './utils';

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

    return (
      <Box
        visibleFrom="md"
        w={280}
        p="sm"
        data-testid="recipe-composer-sidebar"
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
          {SECTION_ITEMS.map(({ key, labelKey, Icon }) => {
            const sectionState = sectionCompletion(key, values);

            return (
              <SectionNavItem
                key={key}
                label={t(`sections.${labelKey}`)}
                hint={getSectionHint(key, sectionState, values, t)}
                icon={<Icon size={18} />}
                active={activeSection === key}
                completionDone={sectionState.done}
                completionTotal={sectionState.total}
                onClick={() => onSectionChange(key)}
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
