'use client';

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
  Tooltip,
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
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo } from 'react';
import { MOTION_TRANSITION } from '../../../../../lib/motion/transitions';
import { useRecipeFormContext } from '../../FormContext';
import { useFormError } from '../../hooks/useFormError';
import { getPublishButtonState } from '../../utils';
import type { StepsSectionProps } from './types';

type StepDirection = 'up' | 'down';

const StepsSection = ({
  onAdd,
  onBack,
  onSubmit,
  isSubmitting,
  submitLabel,
}: Readonly<StepsSectionProps>) => {
  const translate = useTranslations('recipeComposer.sections.steps');
  const form = useRecipeFormContext();
  const { values, setFieldValue } = form;
  const { getFieldError, revalidateOnChange } = useFormError(form);

  const publishButtonState = useMemo(
    () => getPublishButtonState(values),
    [values],
  );

  const sortedSteps = useMemo(
    () =>
      [...values.preparationSteps].sort(
        (firstStep, secondStep) =>
          (firstStep.order ?? 0) - (secondStep.order ?? 0),
      ),
    [values.preparationSteps],
  );

  const setOrderedSteps = useCallback(
    (steps: typeof values.preparationSteps) => {
      setFieldValue(
        'preparationSteps',
        steps.map((step, index) => ({
          ...step,
          order: index + 1,
        })),
      );
    },
    [setFieldValue],
  );

  const removeStep = useCallback(
    (localId: string) => {
      const remainingSteps = sortedSteps.filter(
        (step) => step.localId !== localId,
      );

      setOrderedSteps(remainingSteps);
    },
    [setOrderedSteps, sortedSteps],
  );

  const moveStep = useCallback(
    (localId: string, direction: StepDirection) => {
      const currentIndex = sortedSteps.findIndex(
        (step) => step.localId === localId,
      );

      if (currentIndex === -1) {
        return;
      }

      const targetIndex =
        direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      if (targetIndex < 0 || targetIndex >= sortedSteps.length) {
        return;
      }

      const reorderedSteps = [...sortedSteps];
      [reorderedSteps[currentIndex], reorderedSteps[targetIndex]] = [
        reorderedSteps[targetIndex],
        reorderedSteps[currentIndex],
      ];

      setOrderedSteps(reorderedSteps);
    },
    [setOrderedSteps, sortedSteps],
  );

  const handleStepChange = useCallback(
    (localId: string, description: string) => {
      const stepIndex = values.preparationSteps.findIndex(
        (step) => step.localId === localId,
      );

      if (stepIndex === -1) {
        return;
      }

      const fieldPath = `preparationSteps[${stepIndex}].description`;

      setFieldValue(fieldPath, description);
      revalidateOnChange(fieldPath);
    },
    [revalidateOnChange, setFieldValue, values.preparationSteps],
  );

  const getStepError = useCallback(
    (localId: string) => {
      const stepIndex = values.preparationSteps.findIndex(
        (step) => step.localId === localId,
      );

      if (stepIndex === -1) {
        return undefined;
      }

      return getFieldError(`preparationSteps[${stepIndex}].description`);
    },
    [getFieldError, values.preparationSteps],
  );

  return (
    <Paper
      p={{ base: 'md', sm: 'xl' }}
      radius="lg"
      withBorder
      shadow="sm"
      data-testid="recipe-steps-section"
    >
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

            <Title order={3}>{translate('title')}</Title>
          </Group>

          <Badge
            variant="light"
            color={sortedSteps.length > 0 ? 'green' : 'red'}
          >
            {translate('stepsCount', { count: sortedSteps.length })}
          </Badge>
        </Group>

        <Button
          type="button"
          variant="light"
          leftSection={<IconPlus size={16} />}
          onClick={onAdd}
          data-testid="recipe-steps-add"
        >
          {translate('addStep')}
        </Button>

        <LayoutGroup id="recipe-editor-steps">
          <Stack gap="xs">
            {sortedSteps.length === 0 ? (
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
                    {translate('emptyState')}
                  </Text>

                  <Button
                    type="button"
                    variant="light"
                    size="xs"
                    onClick={onAdd}
                    leftSection={<IconPlus size={14} />}
                  >
                    {translate('addFirst')}
                  </Button>
                </Stack>
              </Paper>
            ) : (
              <AnimatePresence initial={false} mode="popLayout">
                {sortedSteps.map((step, index) => (
                  <motion.div
                    key={step.localId}
                    layout="position"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{
                      opacity: 0,
                      x: -16,
                      transition: MOTION_TRANSITION.fast,
                    }}
                    transition={MOTION_TRANSITION.standard}
                  >
                    <Group align="flex-start" wrap="nowrap">
                      <ThemeIcon
                        size={24}
                        radius="50%"
                        variant="light"
                        color="gray"
                        mt={4}
                      >
                        <Text size="xs" fw={700}>
                          {index + 1}
                        </Text>
                      </ThemeIcon>

                      <Textarea
                        placeholder={translate('stepPlaceholder', {
                          index: index + 1,
                        })}
                        data-testid="recipe-step-textarea"
                        autosize
                        minRows={2}
                        value={step.description}
                        onChange={(event) =>
                          handleStepChange(step.localId, event.target.value)
                        }
                        error={getStepError(step.localId)}
                        style={{ flex: 1 }}
                      />

                      <Stack gap={4}>
                        <ActionIcon
                          type="button"
                          variant="subtle"
                          size="sm"
                          disabled={index === 0}
                          onClick={() => moveStep(step.localId, 'up')}
                          aria-label={translate('moveUp', {
                            index: index + 1,
                          })}
                          data-testid="recipe-step-move-up"
                        >
                          <IconArrowUp size={14} />
                        </ActionIcon>

                        <ActionIcon
                          type="button"
                          variant="subtle"
                          size="sm"
                          disabled={index === sortedSteps.length - 1}
                          onClick={() => moveStep(step.localId, 'down')}
                          aria-label={translate('moveDown', {
                            index: index + 1,
                          })}
                          data-testid="recipe-step-move-down"
                        >
                          <IconArrowDown size={14} />
                        </ActionIcon>

                        <ActionIcon
                          type="button"
                          variant="subtle"
                          color="red"
                          size="sm"
                          onClick={() => removeStep(step.localId)}
                          aria-label={translate('removeStep', {
                            index: index + 1,
                          })}
                          data-testid="recipe-step-remove"
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Stack>
                    </Group>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {sortedSteps.length > 0 && (
              <Button
                type="button"
                variant="subtle"
                fullWidth
                mt={4}
                style={{
                  borderTop: '1px dashed var(--mantine-color-gray-3)',
                }}
                onClick={onAdd}
                aria-label={translate('addStep')}
              >
                <IconPlus size={16} />
              </Button>
            )}
          </Stack>
        </LayoutGroup>

        <Group justify="space-between" mt="xs">
          <Button
            type="button"
            variant="subtle"
            color="gray"
            onClick={onBack}
            leftSection={<IconArrowLeft size={16} />}
          >
            {translate('back')}
          </Button>

          <Tooltip
            label={publishButtonState.missingFields.join(', ')}
            disabled={!publishButtonState.disabled}
            withArrow
            multiline
          >
            <span>
              <Button
                type="button"
                color="dark"
                loading={isSubmitting}
                onClick={onSubmit}
                leftSection={<IconWand size={16} />}
                disabled={publishButtonState.disabled}
                data-testid="recipe-steps-publish"
              >
                {submitLabel ?? translate('publish')}
              </Button>
            </span>
          </Tooltip>
        </Group>
      </Stack>
    </Paper>
  );
};

export default StepsSection;
