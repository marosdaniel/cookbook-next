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
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRecipeFormContext } from '../../FormContext';
import { useFormError } from '../../hooks/useFormError';
import { DESCRIPTION_MAX_LENGTH, sectionCompletion } from '../../utils';
import type { BasicsSectionProps } from './types';

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

  /* ── Local state for high-frequency text inputs ── */
  const [localTitle, setLocalTitle] = useState(values.title);
  const [localDescription, setLocalDescription] = useState(values.description);

  // Debounce timers
  const titleTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const descTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Sync FROM form → local when form values change from outside (e.g. draft clear)
  const prevTitleRef = useRef(values.title);
  const prevDescRef = useRef(values.description);
  useEffect(() => {
    // Only sync if the value changed from outside (not from our debounce)
    if (values.title !== prevTitleRef.current && values.title !== localTitle) {
      setLocalTitle(values.title);
    }
    prevTitleRef.current = values.title;
  }, [values.title, localTitle]);

  useEffect(() => {
    if (
      values.description !== prevDescRef.current &&
      values.description !== localDescription
    ) {
      setLocalDescription(values.description);
    }
    prevDescRef.current = values.description;
  }, [values.description, localDescription]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      clearTimeout(titleTimerRef.current);
      clearTimeout(descTimerRef.current);
    };
  }, []);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setLocalTitle(val);
      clearTimeout(titleTimerRef.current);
      // If there's already an error, sync immediately so the error clears at once
      const delay = getFieldError('title') ? 0 : DEBOUNCE_MS;
      titleTimerRef.current = setTimeout(() => {
        setFieldValue('title', val);
        revalidateOnChange('title');
      }, delay);
    },
    [setFieldValue, getFieldError, revalidateOnChange],
  );

  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      if (val.length <= DESCRIPTION_MAX_LENGTH) {
        setLocalDescription(val);
        clearTimeout(descTimerRef.current);
        // If there's already an error, sync immediately so the error clears at once
        const delay = getFieldError('description') ? 0 : DEBOUNCE_MS;
        descTimerRef.current = setTimeout(() => {
          setFieldValue('description', val);
          revalidateOnChange('description');
        }, delay);
      }
    },
    [setFieldValue, getFieldError, revalidateOnChange],
  );

  const descLength = localDescription?.length ?? 0;
  const completion = sectionCompletion('basics', values);
  const isComplete = completion.done === completion.total;

  // Compute total time from time fields
  const prep =
    typeof values.prepTimeMinutes === 'number' ? values.prepTimeMinutes : 0;
  const cook =
    typeof values.cookTimeMinutes === 'number' ? values.cookTimeMinutes : 0;
  const rest =
    typeof values.restTimeMinutes === 'number' ? values.restTimeMinutes : 0;
  const totalTime = prep + cook + rest;

  return (
    <Paper p={{ base: 'md', sm: 'xl' }} radius="lg" withBorder shadow="sm">
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
            {completion.done}/{completion.total}
          </Badge>
        </Group>

        <TextInput
          placeholder={translate('recipeNamePlaceholder')}
          variant="unstyled"
          size="xl"
          value={localTitle}
          onChange={handleTitleChange}
          styles={{
            input: {
              fontSize: '1.8rem',
              fontWeight: 800,
              height: 'auto',
              padding: 0,
            },
          }}
          error={getFieldError('title')}
        />

        <Box>
          <Textarea
            placeholder={translate('recipeStoryPlaceholder')}
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
            c={descLength > DESCRIPTION_MAX_LENGTH * 0.9 ? 'orange' : 'dimmed'}
            ta="right"
          >
            {descLength}/{DESCRIPTION_MAX_LENGTH}
          </Text>
        </Box>

        {/* ── Time Breakdown ── */}
        <Stack gap={4}>
          <Text fw={600} size="sm" component="div">
            <Group gap={6}>
              <IconClock size={14} />
              {translate('timeBreakdown')}
            </Group>
          </Text>
          <Group grow align="flex-start">
            <TextInput
              placeholder={translate('prepTimePlaceholder')}
              label={translate('prepTime')}
              value={values.prepTimeMinutes}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : '';
                setFieldValue('prepTimeMinutes', val);
              }}
              error={getFieldError('prepTimeMinutes')}
              size="sm"
            />
            <TextInput
              placeholder={translate('cookTimePlaceholder')}
              label={translate('cookTime')}
              value={values.cookTimeMinutes}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : '';
                setFieldValue('cookTimeMinutes', val);
              }}
              error={getFieldError('cookTimeMinutes')}
              size="sm"
            />
            <TextInput
              placeholder={translate('restTimePlaceholder')}
              label={translate('restTime')}
              value={values.restTimeMinutes}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : '';
                setFieldValue('restTimeMinutes', val);
              }}
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

        {/* ── Cookingtime (backward compat) + Servings ── */}
        <Group grow align="flex-start">
          <Stack gap={4}>
            <Text fw={600} size="sm" component="div">
              <Group gap={6}>
                <IconClock size={14} />
                {translate('cookingTime')}
              </Group>
            </Text>
            <TextInput
              placeholder={translate('cookingTimePlaceholder')}
              value={values.cookingTime}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : '';
                setFieldValue('cookingTime', val);
                revalidateOnChange('cookingTime');
              }}
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
                placeholder={translate('servingsPlaceholder')}
                value={values.servings}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : '';
                  setFieldValue('servings', val);
                  revalidateOnChange('servings');
                }}
                error={getFieldError('servings')}
              />
              <Select
                placeholder={translate('servingUnitPlaceholder')}
                data={servingUnits}
                value={values.servingUnit?.value ?? null}
                onChange={(value) => {
                  const next =
                    servingUnits.find((s) => s.value === value) ?? null;
                  setFieldValue('servingUnit', next);
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
            placeholder={translate('select')}
            searchable
            data={categories}
            value={values.category?.value ?? null}
            onChange={(value) => {
              const next = categories.find((c) => c.value === value) ?? null;
              setFieldValue('category', next);
              revalidateOnChange('category');
            }}
            error={getFieldError('category')}
          />
          <Select
            label={translate('difficulty')}
            placeholder={translate('select')}
            searchable
            data={levels}
            value={values.difficultyLevel?.value ?? null}
            onChange={(value) => {
              const next = levels.find((l) => l.value === value) ?? null;
              setFieldValue('difficultyLevel', next);
              revalidateOnChange('difficultyLevel');
            }}
            error={getFieldError('difficultyLevel')}
          />
        </Group>

        {/* ── Cuisine + Cost Level ── */}
        <Group grow align="flex-start">
          <Select
            label={translate('cuisine')}
            placeholder={translate('select')}
            searchable
            clearable
            data={cuisines}
            value={values.cuisine?.value ?? null}
            onChange={(value) => {
              const next = cuisines.find((c) => c.value === value) ?? null;
              setFieldValue('cuisine', next);
            }}
            leftSection={<IconWorld size={14} />}
          />
          <Select
            label={translate('costLevel')}
            placeholder={translate('select')}
            searchable
            clearable
            data={costLevels}
            value={values.costLevel?.value ?? null}
            onChange={(value) => {
              const next = costLevels.find((c) => c.value === value) ?? null;
              setFieldValue('costLevel', next);
            }}
            leftSection={<IconCoin size={14} />}
          />
        </Group>

        <MultiSelect
          label={translate('tags')}
          placeholder={translate('tagsPlaceholder')}
          searchable
          clearable
          data={labels}
          value={values.labels}
          onChange={(value) => setFieldValue('labels', value)}
          leftSection={<IconHash size={14} />}
          maxValues={5}
        />

        {/* ── Dietary Flags + Allergens ── */}
        <Group grow align="flex-start">
          <MultiSelect
            label={translate('dietaryFlags')}
            placeholder={translate('dietaryFlagsPlaceholder')}
            searchable
            clearable
            data={dietaryFlags}
            value={values.dietaryFlags}
            onChange={(value) => setFieldValue('dietaryFlags', value)}
          />
          <MultiSelect
            label={translate('allergens')}
            placeholder={translate('allergensPlaceholder')}
            searchable
            clearable
            data={allergens}
            value={values.allergens}
            onChange={(value) => setFieldValue('allergens', value)}
          />
        </Group>

        {/* ── Equipment ── */}
        <MultiSelect
          label={translate('equipment')}
          placeholder={translate('equipmentPlaceholder')}
          searchable
          clearable
          data={equipment}
          value={values.equipment}
          onChange={(value) => setFieldValue('equipment', value)}
          leftSection={<IconToolsKitchen size={14} />}
        />

        {/* ── Tips & Substitutions ── */}
        <Group grow align="flex-start">
          <Textarea
            label={translate('tips')}
            placeholder={translate('tipsPlaceholder')}
            autosize
            minRows={2}
            value={values.tips}
            onChange={(e) => setFieldValue('tips', e.target.value)}
          />
          <Textarea
            label={translate('substitutions')}
            placeholder={translate('substitutionsPlaceholder')}
            autosize
            minRows={2}
            value={values.substitutions}
            onChange={(e) => setFieldValue('substitutions', e.target.value)}
          />
        </Group>

        <Group justify="flex-end" mt="xs">
          <Button
            variant="light"
            onClick={onNext}
            rightSection={<IconPhoto size={16} />}
          >
            {translate('next')}
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
};

export default BasicsSection;
