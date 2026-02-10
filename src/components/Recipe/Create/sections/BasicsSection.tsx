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
import { getIn, useFormikContext } from 'formik';
import type { RecipeFormValues, TMetadataCleaned } from '../types';
import { DESCRIPTION_MAX_LENGTH, sectionCompletion } from '../utils';

interface BasicsSectionProps {
  categories: TMetadataCleaned[];
  levels: TMetadataCleaned[];
  labels: TMetadataCleaned[];
  onNext: () => void;
}

export function BasicsSection({
  categories,
  levels,
  labels,
  onNext,
}: Readonly<BasicsSectionProps>) {
  const { values, setFieldValue, touched, errors } =
    useFormikContext<RecipeFormValues>();

  const getFieldError = (path: string): string | undefined => {
    const isTouched = Boolean(getIn(touched, path));
    const error = getIn(errors, path);
    return isTouched && typeof error === 'string' ? error : undefined;
  };

  const descLength = values.description?.length ?? 0;
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
            <Title order={3}>Basics</Title>
          </Group>
          <Badge variant="light" color={isComplete ? 'green' : 'gray'}>
            {completion.done}/{completion.total}
          </Badge>
        </Group>

        <TextInput
          placeholder="Give your recipe a catchy name..."
          variant="unstyled"
          size="xl"
          value={values.title}
          onChange={(e) => setFieldValue('title', e.target.value)}
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
            placeholder="Tell the story behind this dish. What makes it special?"
            autosize
            minRows={3}
            variant="unstyled"
            size="lg"
            value={values.description}
            onChange={(e) => {
              if (e.target.value.length <= DESCRIPTION_MAX_LENGTH) {
                setFieldValue('description', e.target.value);
              }
            }}
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
                Cooking Time (min)
              </Group>
            </Text>
            <TextInput
              placeholder="e.g. 45"
              value={values.cookingTime}
              onChange={(e) => setFieldValue('cookingTime', e.target.value)}
              error={getFieldError('cookingTime')}
            />
          </Stack>
          <Stack gap={4}>
            <Text fw={600} size="sm">
              <Group gap={6}>
                <IconUsers size={14} />
                Servings
              </Group>
            </Text>
            <TextInput
              placeholder="e.g. 4"
              value={values.servings}
              onChange={(e) => setFieldValue('servings', e.target.value)}
              error={getFieldError('servings')}
            />
          </Stack>
        </Group>

        <Group grow align="flex-start">
          <Select
            label="Category"
            placeholder="Select..."
            searchable
            data={categories}
            value={values.category?.value ?? null}
            onChange={(value) => {
              const next = categories.find((c) => c.value === value) ?? null;
              setFieldValue('category', next);
            }}
            error={getFieldError('category')}
          />
          <Select
            label="Difficulty"
            placeholder="Select..."
            searchable
            data={levels}
            value={values.difficultyLevel?.value ?? null}
            onChange={(value) => {
              const next = levels.find((l) => l.value === value) ?? null;
              setFieldValue('difficultyLevel', next);
            }}
            error={getFieldError('difficultyLevel')}
          />
        </Group>

        <MultiSelect
          label="Tags"
          placeholder="Add searchable tags..."
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
            Next: Media
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
