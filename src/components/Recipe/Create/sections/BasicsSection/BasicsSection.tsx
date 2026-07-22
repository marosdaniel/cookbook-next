'use client';

import {
  Badge,
  Box,
  Button,
  Group,
  MultiSelect,
  Paper,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IconClock,
  IconCoin,
  IconHash,
  IconPhoto,
  IconSparkles,
  IconToolsKitchen,
  IconUsers,
  IconWorld,
} from '@tabler/icons-react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { MOTION_TRANSITION } from '../../../../../lib/motion/transitions';
import { useRecipeFormContext } from '../../FormContext';
import { useFormError } from '../../hooks/useFormError';
import { DESCRIPTION_MAX_LENGTH, sectionCompletion } from '../../utils';
import type { BasicsSectionProps } from './types';
import { toNonNegativeNumberOrEmpty } from './utils';

const DEBOUNCE_MS = 300;

const BasicsSection = ({
  categories,
  levels,
  labels,
  cuisines,
  servingUnits,
  costLevels,
  dietaryFlags,
  allergens,
  equipment,
  onNext,
}: Readonly<BasicsSectionProps>) => {
  const translate = useTranslations('recipeComposer.sections.basics');
  const form = useRecipeFormContext();
  const { values, setFieldValue } = form;
  const { getFieldError, revalidateOnChange } = useFormError(form);

  const [localTitle, setLocalTitle] = useState(values.title);
  const [localDescription, setLocalDescription] = useState(values.description);

  const titleTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const descriptionTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const latestTitleRef = useRef(values.title);
  const latestDescriptionRef = useRef(values.description);

  const previousTitleRef = useRef(values.title);
  const previousDescriptionRef = useRef(values.description);

  useEffect(() => {
    const wasUpdatedExternally =
      values.title !== previousTitleRef.current &&
      values.title !== latestTitleRef.current;

    if (wasUpdatedExternally) {
      latestTitleRef.current = values.title;
      setLocalTitle(values.title);
    }

    previousTitleRef.current = values.title;
  }, [values.title]);

  useEffect(() => {
    const wasUpdatedExternally =
      values.description !== previousDescriptionRef.current &&
      values.description !== latestDescriptionRef.current;

    if (wasUpdatedExternally) {
      latestDescriptionRef.current = values.description;
      setLocalDescription(values.description);
    }

    previousDescriptionRef.current = values.description;
  }, [values.description]);

  useEffect(() => {
    return () => {
      clearTimeout(titleTimerRef.current);
      clearTimeout(descriptionTimerRef.current);
    };
  }, []);

  const handleTitleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextTitle = event.currentTarget.value;
      const delay = getFieldError('title') ? 0 : DEBOUNCE_MS;

      latestTitleRef.current = nextTitle;
      setLocalTitle(nextTitle);

      clearTimeout(titleTimerRef.current);

      titleTimerRef.current = setTimeout(() => {
        setFieldValue('title', nextTitle);
        revalidateOnChange('title');
      }, delay);
    },
    [getFieldError, revalidateOnChange, setFieldValue],
  );

  const handleDescriptionChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      const nextDescription = event.currentTarget.value;

      if (nextDescription.length > DESCRIPTION_MAX_LENGTH) {
        return;
      }

      const delay = getFieldError('description') ? 0 : DEBOUNCE_MS;

      latestDescriptionRef.current = nextDescription;
      setLocalDescription(nextDescription);

      clearTimeout(descriptionTimerRef.current);

      descriptionTimerRef.current = setTimeout(() => {
        setFieldValue('description', nextDescription);
        revalidateOnChange('description');
      }, delay);
    },
    [getFieldError, revalidateOnChange, setFieldValue],
  );

  const flushPendingTextFields = useCallback(() => {
    clearTimeout(titleTimerRef.current);
    clearTimeout(descriptionTimerRef.current);

    setFieldValue('title', latestTitleRef.current);
    setFieldValue('description', latestDescriptionRef.current);

    revalidateOnChange('title');
    revalidateOnChange('description');
  }, [revalidateOnChange, setFieldValue]);

  const handleNext = useCallback(() => {
    flushPendingTextFields();
    onNext();
  }, [flushPendingTextFields, onNext]);

  const handleNumberFieldChange = useCallback(
    (
      field:
        | 'prepTimeMinutes'
        | 'cookTimeMinutes'
        | 'restTimeMinutes'
        | 'cookingTime'
        | 'servings',
      shouldRevalidate = false,
    ) =>
      (event: ChangeEvent<HTMLInputElement>) => {
        setFieldValue(
          field,
          toNonNegativeNumberOrEmpty(event.currentTarget.value),
        );

        if (shouldRevalidate) {
          revalidateOnChange(field);
        }
      },
    [revalidateOnChange, setFieldValue],
  );

  const descriptionLength = localDescription.length;
  const completion = sectionCompletion('basics', values);
  const isComplete = completion.done === completion.total;

  const prepTime =
    typeof values.prepTimeMinutes === 'number' ? values.prepTimeMinutes : 0;
  const cookTime =
    typeof values.cookTimeMinutes === 'number' ? values.cookTimeMinutes : 0;
  const restTime =
    typeof values.restTimeMinutes === 'number' ? values.restTimeMinutes : 0;

  const totalTime = prepTime + cookTime + restTime;

  return (
    <Paper
      p={{ base: 'md', sm: 'xl' }}
      radius="lg"
      withBorder
      shadow="sm"
      data-testid="recipe-basics-section"
    >
      <Stack gap="lg">
        <Group justify="space-between" align="baseline">
          <Group gap="xs">
            <ThemeIcon
              size={32}
              radius="md"
              variant="gradient"
              gradient={{ from: 'indigo', to: 'violet' }}
            >
              <IconSparkles size={18} />
            </ThemeIcon>

            <Title order={3}>{translate('title')}</Title>
          </Group>

          <Badge variant="light" color={isComplete ? 'green' : 'gray'}>
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={`${completion.done}-${completion.total}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={MOTION_TRANSITION.fast}
                style={{ display: 'inline-block' }}
              >
                {completion.done}/{completion.total}
              </motion.span>
            </AnimatePresence>
          </Badge>
        </Group>

        <TextInput
          placeholder={translate('recipeNamePlaceholder')}
          data-testid="recipe-basics-title"
          variant="unstyled"
          size="xl"
          value={localTitle}
          onChange={handleTitleChange}
          error={getFieldError('title')}
          styles={{
            input: {
              fontSize: '1.8rem',
              fontWeight: 800,
              height: 'auto',
              padding: 0,
            },
          }}
        />

        <Box>
          <Textarea
            placeholder={translate('recipeStoryPlaceholder')}
            data-testid="recipe-basics-description"
            autosize
            minRows={3}
            variant="unstyled"
            size="lg"
            value={localDescription}
            onChange={handleDescriptionChange}
            error={getFieldError('description')}
          />

          <Text
            size="xs"
            c={
              descriptionLength > DESCRIPTION_MAX_LENGTH * 0.9
                ? 'orange'
                : 'dimmed'
            }
            ta="right"
          >
            {descriptionLength}/{DESCRIPTION_MAX_LENGTH}
          </Text>
        </Box>

        <Stack gap={4}>
          <Text fw={600} size="sm" component="div">
            <Group gap={6}>
              <IconClock size={14} />
              {translate('timeBreakdown')}
            </Group>
          </Text>

          <Group grow align="flex-start">
            <TextInput
              type="number"
              min={0}
              inputMode="numeric"
              placeholder={translate('prepTimePlaceholder')}
              data-testid="recipe-basics-prep-time"
              label={translate('prepTime')}
              value={values.prepTimeMinutes}
              onChange={handleNumberFieldChange('prepTimeMinutes')}
              error={getFieldError('prepTimeMinutes')}
              size="sm"
            />

            <TextInput
              type="number"
              min={0}
              inputMode="numeric"
              placeholder={translate('cookTimePlaceholder')}
              data-testid="recipe-basics-cook-time"
              label={translate('cookTime')}
              value={values.cookTimeMinutes}
              onChange={handleNumberFieldChange('cookTimeMinutes')}
              error={getFieldError('cookTimeMinutes')}
              size="sm"
            />

            <TextInput
              type="number"
              min={0}
              inputMode="numeric"
              placeholder={translate('restTimePlaceholder')}
              data-testid="recipe-basics-rest-time"
              label={translate('restTime')}
              value={values.restTimeMinutes}
              onChange={handleNumberFieldChange('restTimeMinutes')}
              error={getFieldError('restTimeMinutes')}
              size="sm"
            />
          </Group>

          {totalTime > 0 && (
            <Text size="xs" c="dimmed">
              {translate('totalTime')}: {totalTime} min
            </Text>
          )}
        </Stack>

        <Group grow align="flex-start">
          <Stack gap={4}>
            <Text fw={600} size="sm" component="div">
              <Group gap={6}>
                <IconClock size={14} />
                {translate('cookingTime')}
              </Group>
            </Text>

            <TextInput
              type="number"
              min={0}
              inputMode="numeric"
              placeholder={translate('cookingTimePlaceholder')}
              data-testid="recipe-basics-cooking-time"
              value={values.cookingTime}
              onChange={handleNumberFieldChange('cookingTime', true)}
              error={getFieldError('cookingTime')}
            />
          </Stack>

          <Stack gap={4}>
            <Text fw={600} size="sm" component="div">
              <Group gap={6}>
                <IconUsers size={14} />
                {translate('servings')}
              </Group>
            </Text>

            <Group grow align="flex-start">
              <TextInput
                type="number"
                min={1}
                inputMode="numeric"
                placeholder={translate('servingsPlaceholder')}
                data-testid="recipe-basics-servings"
                value={values.servings}
                onChange={handleNumberFieldChange('servings', true)}
                error={getFieldError('servings')}
              />

              <Select
                placeholder={translate('servingUnitPlaceholder')}
                data-testid="recipe-basics-serving-unit"
                data={servingUnits}
                value={values.servingUnit?.value ?? null}
                onChange={(value) => {
                  const selectedUnit =
                    servingUnits.find((unit) => unit.value === value) ?? null;

                  setFieldValue('servingUnit', selectedUnit);
                }}
                searchable
                clearable
              />
            </Group>
          </Stack>
        </Group>

        <Group grow align="flex-start">
          <Select
            label={translate('category')}
            data-testid="recipe-basics-category"
            placeholder={translate('select')}
            searchable
            data={categories}
            value={values.category?.value ?? null}
            onChange={(value) => {
              const selectedCategory =
                categories.find((category) => category.value === value) ?? null;

              setFieldValue('category', selectedCategory);
              revalidateOnChange('category');
            }}
            error={getFieldError('category')}
          />

          <Select
            label={translate('difficulty')}
            data-testid="recipe-basics-difficulty"
            placeholder={translate('select')}
            searchable
            data={levels}
            value={values.difficultyLevel?.value ?? null}
            onChange={(value) => {
              const selectedLevel =
                levels.find((level) => level.value === value) ?? null;

              setFieldValue('difficultyLevel', selectedLevel);
              revalidateOnChange('difficultyLevel');
            }}
            error={getFieldError('difficultyLevel')}
          />
        </Group>

        <Group grow align="flex-start">
          <Select
            label={translate('cuisine')}
            data-testid="recipe-basics-cuisine"
            placeholder={translate('select')}
            searchable
            clearable
            data={cuisines}
            value={values.cuisine?.value ?? null}
            onChange={(value) => {
              const selectedCuisine =
                cuisines.find((cuisine) => cuisine.value === value) ?? null;

              setFieldValue('cuisine', selectedCuisine);
            }}
            leftSection={<IconWorld size={14} />}
          />

          <Select
            label={translate('costLevel')}
            data-testid="recipe-basics-cost-level"
            placeholder={translate('select')}
            searchable
            clearable
            data={costLevels}
            value={values.costLevel?.value ?? null}
            onChange={(value) => {
              const selectedCostLevel =
                costLevels.find((costLevel) => costLevel.value === value) ??
                null;

              setFieldValue('costLevel', selectedCostLevel);
            }}
            leftSection={<IconCoin size={14} />}
          />
        </Group>

        <MultiSelect
          label={translate('tags')}
          data-testid="recipe-basics-tags"
          placeholder={translate('tagsPlaceholder')}
          searchable
          clearable
          data={labels}
          value={values.labels}
          onChange={(nextLabels) => setFieldValue('labels', nextLabels)}
          leftSection={<IconHash size={14} />}
          maxValues={5}
        />

        <Group grow align="flex-start">
          <MultiSelect
            label={translate('dietaryFlags')}
            data-testid="recipe-basics-dietary-flags"
            placeholder={translate('dietaryFlagsPlaceholder')}
            searchable
            clearable
            data={dietaryFlags}
            value={values.dietaryFlags}
            onChange={(nextFlags) => setFieldValue('dietaryFlags', nextFlags)}
          />

          <MultiSelect
            label={translate('allergens')}
            data-testid="recipe-basics-allergens"
            placeholder={translate('allergensPlaceholder')}
            searchable
            clearable
            data={allergens}
            value={values.allergens}
            onChange={(nextAllergens) =>
              setFieldValue('allergens', nextAllergens)
            }
          />
        </Group>

        <MultiSelect
          label={translate('equipment')}
          data-testid="recipe-basics-equipment"
          placeholder={translate('equipmentPlaceholder')}
          searchable
          clearable
          data={equipment}
          value={values.equipment}
          onChange={(nextEquipment) =>
            setFieldValue('equipment', nextEquipment)
          }
          leftSection={<IconToolsKitchen size={14} />}
        />

        <Group grow align="flex-start">
          <Textarea
            label={translate('tips')}
            data-testid="recipe-basics-tips"
            placeholder={translate('tipsPlaceholder')}
            autosize
            minRows={2}
            value={values.tips}
            onChange={(event) =>
              setFieldValue('tips', event.currentTarget.value)
            }
          />

          <Textarea
            label={translate('substitutions')}
            data-testid="recipe-basics-substitutions"
            placeholder={translate('substitutionsPlaceholder')}
            autosize
            minRows={2}
            value={values.substitutions}
            onChange={(event) =>
              setFieldValue('substitutions', event.currentTarget.value)
            }
          />
        </Group>

        <Group justify="flex-end" mt="xs">
          <Button
            type="button"
            variant="light"
            onClick={handleNext}
            rightSection={<IconPhoto size={16} />}
            data-testid="recipe-basics-next"
          >
            {translate('next')}
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
};

export default BasicsSection;
