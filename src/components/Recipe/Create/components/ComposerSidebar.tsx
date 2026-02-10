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
import type { ComposerSection, RecipeFormValues } from '../types';
import { sectionCompletion } from '../utils';
import { SectionNavItem } from './SectionNavItem';

interface ComposerSidebarProps {
  activeSection: ComposerSection;
  onSectionChange: (section: ComposerSection) => void;
  values: RecipeFormValues;
  completion: { done: number; total: number; percent: number };
  onAddIngredient: () => void;
  onAddStep: () => void;
  onResetDraft: () => void;
}

export function ComposerSidebar({
  activeSection,
  onSectionChange,
  values,
  completion,
  onAddIngredient,
  onAddStep,
  onResetDraft,
}: ComposerSidebarProps) {
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
          Sections
        </Text>
        {sectionItems.map((s) => {
          const sc = sectionCompletion(s.key, values);
          let hint = `${sc.done}/${sc.total} filled`;

          if (s.key === 'ingredients') {
            hint = `${values.ingredients.length} items`;
          } else if (s.key === 'steps') {
            hint = `${values.preparationSteps.length} steps`;
          } else if (s.key === 'media') {
            hint = values.imgSrc ? 'Cover set' : 'Optional';
          }

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
          color={completion.percent === 100 ? 'teal' : 'blue'}
        />
        <Text size="xs" c="dimmed" ta="center">
          {completion.percent}% complete
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
            Quick add ingredient
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
            Quick add step
          </Button>
        </Group>

        <Divider my="sm" />

        <Button
          size="xs"
          variant="subtle"
          color="red"
          leftSection={<IconTrash size={14} />}
          onClick={onResetDraft}
          fullWidth
        >
          Clear draft
        </Button>
      </Stack>
    </Box>
  );
}
