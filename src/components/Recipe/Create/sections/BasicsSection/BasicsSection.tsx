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
  IconHash,
  IconPhoto,
  IconSparkles,
  IconUsers,
} from '@tabler/icons-react';
import { useFormikContext } from 'formik';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useFormikError } from '../../hooks/useFormikError';
import type { RecipeFormValues } from '../../types';
import { DESCRIPTION_MAX_LENGTH, sectionCompletion } from '../../utils';
import type { BasicsSectionProps } from './types';

const DEBOUNCE_MS = 300;

const BasicsSection = ({
  categories,
  levels,
  labels,
  onNext,
}: Readonly<BasicsSectionProps>) => {
  const t = useTranslations('recipeComposer.sections.basics');
  const { values, setFieldValue } = useFormikContext<RecipeFormValues>();
  const { getFieldError, revalidateOnChange } = useFormikError();

  /* ── Local state for high-frequency text inputs ── */
  const [localTitle, setLocalTitle] = useState(values.title);
  const [localDescription, setLocalDescription] = useState(values.description);

  // Debounce timers
  const titleTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const descTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Sync FROM formik → local when formik resets (e.g. draft clear)
  const prevTitleRef = useRef(values.title);
  const prevDescRef = useRef(values.description);
  useEffect(() => {
    // Only sync if the formik value changed from outside (not from our debounce)
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
      titleTimerRef.current = setTimeout(async () => {
        await setFieldValue('title', val);
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
        descTimerRef.current = setTimeout(async () => {
          await setFieldValue('description', val);
          revalidateOnChange('description');
        }, delay);
      }
    },
    [setFieldValue, getFieldError, revalidateOnChange],
  );

  const descLength = localDescription?.length ?? 0;
  const completion = sectionCompletion('basics', values);
  const isComplete = completion.done === completion.total;

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
            <Title order={3}>{t('title')}</Title>
          </Group>
          <Badge variant="light" color={isComplete ? 'green' : 'gray'}>
            {completion.done}/{completion.total}
          </Badge>
        </Group>

        <TextInput
          placeholder={t('recipeNamePlaceholder')}
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
            placeholder={t('recipeStoryPlaceholder')}
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

        <Group grow align="flex-start">
          <Stack gap={4}>
            <Text fw={600} size="sm">
              <Group gap={6}>
                <IconClock size={14} />
                {t('cookingTime')}
              </Group>
            </Text>
            <TextInput
              placeholder={t('cookingTimePlaceholder')}
              value={values.cookingTime}
              onChange={(e) => {
                setFieldValue('cookingTime', e.target.value);
                revalidateOnChange('cookingTime');
              }}
              error={getFieldError('cookingTime')}
            />
          </Stack>
          <Stack gap={4}>
            <Text fw={600} size="sm">
              <Group gap={6}>
                <IconUsers size={14} />
                {t('servings')}
              </Group>
            </Text>
            <TextInput
              placeholder={t('servingsPlaceholder')}
              value={values.servings}
              onChange={(e) => {
                setFieldValue('servings', e.target.value);
                revalidateOnChange('servings');
              }}
              error={getFieldError('servings')}
            />
          </Stack>
        </Group>

        <Group grow align="flex-start">
          <Select
            label={t('category')}
            placeholder={t('select')}
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
            label={t('difficulty')}
            placeholder={t('select')}
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

        <MultiSelect
          label={t('tags')}
          placeholder={t('tagsPlaceholder')}
          searchable
          clearable
          data={labels}
          value={values.labels}
          onChange={(value) => setFieldValue('labels', value)}
          leftSection={<IconHash size={14} />}
          maxValues={5}
        />

        <Group justify="flex-end" mt="xs">
          <Button
            variant="light"
            onClick={onNext}
            rightSection={<IconPhoto size={16} />}
          >
            {t('next')}
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
};

export default BasicsSection;
