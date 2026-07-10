'use client';

import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Paper,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconChefHat,
  IconPlus,
  IconToolsKitchen2,
  IconTrash,
} from '@tabler/icons-react';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
import { MOTION_TRANSITION } from '../../../../../lib/motion/transitions';
import { useRecipeFormContext } from '../../FormContext';
import {
  type RecipeFormFieldPath,
  useFormError,
} from '../../hooks/useFormError';
import type { IngredientsSectionProps } from './types';

const IngredientsSection = ({
  unitOptions,
  onAdd,
  onBack,
  onNext,
}: Readonly<IngredientsSectionProps>) => {
  const translate = useTranslations('recipeComposer.sections.ingredients');
  const form = useRecipeFormContext();
  const { values, setFieldValue } = form;
  const { getFieldError, revalidateOnChange } = useFormError(form);

  const removeIngredient = useCallback(
    (localId: string) => {
      setFieldValue(
        'ingredients',
        values.ingredients.filter(
          (ingredient) => ingredient.localId !== localId,
        ),
      );
    },
    [setFieldValue, values.ingredients],
  );

  return (
    <Paper
      p={{ base: 'md', sm: 'xl' }}
      radius="lg"
      withBorder
      shadow="sm"
      data-testid="recipe-ingredients-section"
    >
      <Stack gap="lg">
        <Group justify="space-between" align="baseline">
          <Group gap="xs">
            <ThemeIcon
              size={32}
              radius="md"
              variant="gradient"
              gradient={{ from: 'teal', to: 'lime' }}
            >
              <IconToolsKitchen2 size={18} />
            </ThemeIcon>

            <Title order={3}>{translate('title')}</Title>
          </Group>

          <Badge
            variant="light"
            color={values.ingredients.length > 0 ? 'green' : 'red'}
          >
            {translate('itemsCount', { count: values.ingredients.length })}
          </Badge>
        </Group>

        <Button
          type="button"
          variant="light"
          leftSection={<IconPlus size={16} />}
          onClick={onAdd}
          data-testid="recipe-ingredients-add"
        >
          {translate('addIngredient')}
        </Button>

        <LayoutGroup id="recipe-composer-ingredients">
          <Stack gap="xs">
            <AnimatePresence initial={false} mode="popLayout">
              {values.ingredients.map((ingredient, index) => {
                const nameFieldPath: RecipeFormFieldPath = `ingredients[${index}].name`;
                const quantityFieldPath: RecipeFormFieldPath = `ingredients[${index}].quantity`;
                const unitFieldPath: RecipeFormFieldPath = `ingredients[${index}].unit`;
                const optionalFieldPath: RecipeFormFieldPath = `ingredients[${index}].isOptional`;
                const noteFieldPath: RecipeFormFieldPath = `ingredients[${index}].note`;

                return (
                  <motion.div
                    key={ingredient.localId}
                    layout="position"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{
                      opacity: ingredient.isOptional ? 0.75 : 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      x: -16,
                      transition: MOTION_TRANSITION.fast,
                    }}
                    transition={MOTION_TRANSITION.standard}
                  >
                    <Paper
                      withBorder
                      radius="md"
                      p="sm"
                      style={{
                        borderLeft: ingredient.name.trim()
                          ? '3px solid var(--mantine-color-teal-5)'
                          : '3px solid var(--mantine-color-gray-3)',
                        transition: 'border-color 0.2s ease',
                      }}
                    >
                      <Stack gap="xs">
                        <Group gap="xs" align="flex-start" wrap="nowrap">
                          <TextInput
                            placeholder={translate('itemName')}
                            data-testid="recipe-ingredient-name"
                            value={ingredient.name}
                            onChange={(event) => {
                              setFieldValue(
                                nameFieldPath,
                                event.currentTarget.value,
                              );
                              revalidateOnChange(nameFieldPath);
                            }}
                            error={getFieldError(nameFieldPath)}
                            style={{ flex: 2 }}
                            size="sm"
                          />

                          <TextInput
                            type="number"
                            min={0}
                            inputMode="decimal"
                            placeholder={translate('qty')}
                            data-testid="recipe-ingredient-quantity"
                            value={ingredient.quantity}
                            onChange={(event) => {
                              setFieldValue(
                                quantityFieldPath,
                                event.currentTarget.value === ''
                                  ? ''
                                  : Number(event.currentTarget.value),
                              );
                              revalidateOnChange(quantityFieldPath);
                            }}
                            error={getFieldError(quantityFieldPath)}
                            style={{ width: 70 }}
                            size="sm"
                          />

                          <Select
                            placeholder={translate('unit')}
                            data-testid="recipe-ingredient-unit"
                            data={unitOptions}
                            value={ingredient.unit || null}
                            onChange={(value) => {
                              setFieldValue(unitFieldPath, value ?? '');
                              revalidateOnChange(unitFieldPath);
                            }}
                            error={getFieldError(unitFieldPath)}
                            style={{ width: 120 }}
                            size="sm"
                            searchable
                            allowDeselect={false}
                          />

                          <ActionIcon
                            type="button"
                            color="red"
                            variant="subtle"
                            onClick={() => removeIngredient(ingredient.localId)}
                            mt={4}
                            aria-label={translate('removeIngredient', {
                              index: index + 1,
                            })}
                            data-testid="recipe-ingredient-remove"
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>

                        <Group gap="xs" align="center">
                          <Switch
                            label={translate('optional')}
                            data-testid="recipe-ingredient-optional"
                            size="xs"
                            checked={ingredient.isOptional ?? false}
                            onChange={(event) => {
                              setFieldValue(
                                optionalFieldPath,
                                event.currentTarget.checked,
                              );
                            }}
                          />

                          <TextInput
                            placeholder={translate('notePlaceholder')}
                            data-testid="recipe-ingredient-note"
                            value={ingredient.note ?? ''}
                            onChange={(event) => {
                              setFieldValue(
                                noteFieldPath,
                                event.currentTarget.value,
                              );
                            }}
                            style={{ flex: 1 }}
                            size="xs"
                            variant="unstyled"
                          />
                        </Group>
                      </Stack>
                    </Paper>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {values.ingredients.length === 0 && (
              <Paper
                withBorder
                radius="md"
                p="xl"
                style={{ borderStyle: 'dashed' }}
              >
                <Stack align="center" gap="sm">
                  <ThemeIcon size={48} radius="xl" variant="light" color="gray">
                    <IconToolsKitchen2 size={24} />
                  </ThemeIcon>

                  <Text c="dimmed" ta="center" size="sm">
                    {translate('noIngredients')}
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
            )}

            {values.ingredients.length > 0 && (
              <Button
                type="button"
                variant="subtle"
                fullWidth
                mt={4}
                style={{
                  borderTop: '1px dashed var(--mantine-color-gray-3)',
                }}
                onClick={onAdd}
                aria-label={translate('addIngredient')}
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

          <Button
            type="button"
            variant="light"
            onClick={onNext}
            rightSection={<IconChefHat size={16} />}
            data-testid="recipe-ingredients-next"
          >
            {translate('next')}
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
};

export default IngredientsSection;
