import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  Textarea,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IconArrowDown,
  IconArrowLeft,
  IconArrowUp,
  IconChefHat,
  IconPlus,
  IconTrash,
  IconWand,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useFormikContext } from 'formik';
import { useFormikError } from '../../hooks/useFormikError';
import type { RecipeFormValues } from '../../types';
import type { StepsSectionProps } from './types';

const StepsSection = ({
  onAdd,
  onBack,
  onSubmit,
  isSubmitting,
}: Readonly<StepsSectionProps>) => {
  const t = useTranslations('recipeComposer.sections.steps');
  const { values, setFieldValue } = useFormikContext<RecipeFormValues>();
  const { getFieldError } = useFormikError();

  const removeStep = (idx: number) => {
    const next = values.preparationSteps.filter((_, i) => i !== idx);
    const reordered = next.map((s, i) => ({ ...s, order: i + 1 }));
    setFieldValue('preparationSteps', reordered);
  };

  const moveStep = (idx: number, direction: 'up' | 'down') => {
    const next = [...values.preparationSteps];
    const target = direction === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    const reordered = next.map((s, i) => ({ ...s, order: i + 1 }));
    setFieldValue('preparationSteps', reordered);
  };

  return (
    <Paper p={{ base: 'md', sm: 'xl' }} radius="lg" withBorder shadow="sm">
      <Stack gap="lg">
        <Group justify="space-between" align="baseline">
          <Group gap="xs">
            <ThemeIcon
              size={32}
              radius="md"
              variant="gradient"
              gradient={{ from: 'orange', to: 'red' }}
            >
              <IconChefHat size={18} />
            </ThemeIcon>
            <Title order={3}>{t('title')}</Title>
          </Group>
          <Badge
            variant="light"
            color={values.preparationSteps.length ? 'green' : 'red'}
          >
            {t('stepsCount', { count: values.preparationSteps.length })}
          </Badge>
        </Group>

        <Button
          variant="light"
          leftSection={<IconPlus size={16} />}
          onClick={onAdd}
        >
          {t('addStep')}
        </Button>

        <Stack gap="xs">
          {values.preparationSteps.length === 0 && (
            <Paper
              withBorder
              radius="md"
              p="xl"
              style={{ borderStyle: 'dashed' }}
            >
              <Stack align="center" gap="sm">
                <ThemeIcon size={48} radius="xl" variant="light" color="gray">
                  <IconChefHat size={24} />
                </ThemeIcon>
                <Text c="dimmed" ta="center" size="sm">
                  {t('emptyState')}
                </Text>
                <Button
                  variant="light"
                  size="xs"
                  onClick={onAdd}
                  leftSection={<IconPlus size={14} />}
                >
                  {t('addFirst')}
                </Button>
              </Stack>
            </Paper>
          )}

          {values.preparationSteps
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((step, idx) => (
              <Group key={step.localId ?? idx} align="flex-start" wrap="nowrap">
                <ThemeIcon
                  size={24}
                  radius="50%"
                  variant="light"
                  color="gray"
                  mt={4}
                >
                  <Text size="xs" fw={700}>
                    {idx + 1}
                  </Text>
                </ThemeIcon>
                <Textarea
                  placeholder={t('stepPlaceholder', { index: idx + 1 })}
                  autosize
                  minRows={2}
                  value={step.description}
                  onChange={(e) =>
                    setFieldValue(
                      `preparationSteps[${idx}].description`,
                      e.target.value,
                    )
                  }
                  error={getFieldError(`preparationSteps[${idx}].description`)}
                  style={{ flex: 1 }}
                />
                <Stack gap={4}>
                  <ActionIcon
                    variant="subtle"
                    size="sm"
                    disabled={idx === 0}
                    onClick={() => moveStep(idx, 'up')}
                  >
                    <IconArrowUp size={14} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    size="sm"
                    disabled={idx === values.preparationSteps.length - 1}
                    onClick={() => moveStep(idx, 'down')}
                  >
                    <IconArrowDown size={14} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    size="sm"
                    onClick={() => removeStep(idx)}
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                </Stack>
              </Group>
            ))}

          {values.preparationSteps.length > 0 && (
            <Button
              variant="subtle"
              fullWidth
              style={{
                borderTop: '1px dashed var(--mantine-color-gray-3)',
              }}
              onClick={onAdd}
              mt={4}
            >
              <IconPlus size={16} />
            </Button>
          )}
        </Stack>

        <Group justify="space-between" mt="xs">
          <Button
            variant="subtle"
            color="gray"
            onClick={onBack}
            leftSection={<IconArrowLeft size={16} />}
          >
            {t('back')}
          </Button>
          <Button
            color="dark"
            loading={isSubmitting}
            onClick={onSubmit}
            leftSection={<IconWand size={16} />}
          >
            {t('publish')}
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
};

export default StepsSection;
