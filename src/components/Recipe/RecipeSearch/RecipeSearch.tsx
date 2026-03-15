import {
  ActionIcon,
  Box,
  Button,
  Collapse,
  Group,
  MultiSelect,
  NumberInput,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import {
  IconFilter,
  IconFilterOff,
  IconSearch,
  IconX,
} from '@tabler/icons-react';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useTranslations } from 'next-intl';
import { DEFAULT_FILTERS, recipeSearchSchema } from './consts';
import classes from './RecipeSearch.module.css';
import type { RecipeSearchFilters, RecipeSearchProps } from './types';

export const RecipeSearch = ({
  initialFilters,
  onSearch,
  categoryOptions = [],
  difficultyOptions = [],
  labelOptions = [],
  loading = false,
}: RecipeSearchProps) => {
  const t = useTranslations('recipeSearch');

  const [opened, { toggle }] = useDisclosure(false);

  const form = useForm<RecipeSearchFilters>({
    mode: 'controlled',
    initialValues: initialFilters ?? DEFAULT_FILTERS,
    // biome-ignore lint/suspicious/noExplicitAny: Type mismatch between zodResolver and Mantine form values
    validate: zodResolver(recipeSearchSchema) as any,
    validateInputOnBlur: true,
  });

  const handleSubmit = (values: RecipeSearchFilters) => {
    onSearch(values);
  };

  const handleClear = () => {
    form.setValues(DEFAULT_FILTERS);
    form.clearErrors();
    onSearch(DEFAULT_FILTERS);
  };

  const hasActiveFilters =
    form.values.categoryKey ||
    form.values.difficultyLevelKey ||
    form.values.labelKeys.length > 0 ||
    form.values.maxCookingTime;

  const filterIconColor = hasActiveFilters || opened ? 'pink' : 'gray';

  return (
    <Paper
      withBorder
      p="md"
      radius="md"
      className={classes.wrapper}
      component="form"
      onSubmit={form.onSubmit(handleSubmit)}
    >
      <Stack gap="md">
        <Group align="flex-end" gap="sm">
          <TextInput
            flex={1}
            placeholder={t('searchPlaceholder')}
            label={t('recipeName')}
            leftSection={<IconSearch size={16} stroke={1.5} />}
            key={form.key('title')}
            {...form.getInputProps('title')}
          />
          <ActionIcon
            variant={opened ? 'light' : 'subtle'}
            color={filterIconColor}
            size="lg"
            onClick={toggle}
            type="button"
            aria-label={t('toggleFilters')}
            className={classes.filterToggleBtn}
          >
            {opened ? <IconFilterOff size={20} /> : <IconFilter size={20} />}
          </ActionIcon>
          <Button type="submit" loading={loading} className={classes.searchBtn}>
            {t('search')}
          </Button>
        </Group>

        <Collapse expanded={opened}>
          <Box pt="sm">
            <Group justify="space-between" mb="sm">
              <Text fw={500} size="sm">
                {t('advancedFilters')}
              </Text>
              <Button
                variant="subtle"
                size="xs"
                color="gray"
                type="button"
                onClick={handleClear}
                rightSection={<IconX size={14} />}
              >
                {t('clearFilters')}
              </Button>
            </Group>
            <Group grow align="flex-start" className={classes.filterRow}>
              <Select
                label={t('category')}
                placeholder={t('categoryPlaceholder')}
                data={categoryOptions}
                clearable
                key={form.key('categoryKey')}
                {...form.getInputProps('categoryKey')}
              />
              <Select
                label={t('difficulty')}
                placeholder={t('difficultyPlaceholder')}
                data={difficultyOptions}
                clearable
                key={form.key('difficultyLevelKey')}
                {...form.getInputProps('difficultyLevelKey')}
              />
            </Group>
            <Group
              grow
              align="flex-start"
              mt="sm"
              className={classes.filterRow}
            >
              <MultiSelect
                label={t('labels')}
                placeholder={t('labelsPlaceholder')}
                data={labelOptions}
                clearable
                searchable
                key={form.key('labelKeys')}
                {...form.getInputProps('labelKeys')}
              />
              <NumberInput
                label={t('maxCookingTime')}
                placeholder={t('maxCookingTimePlaceholder')}
                min={0}
                hideControls
                key={form.key('maxCookingTime')}
                {...form.getInputProps('maxCookingTime')}
              />
            </Group>

            <Button
              fullWidth
              type="submit"
              loading={loading}
              mt="md"
              className={classes.applyBtn}
            >
              {t('applyFilters')}
            </Button>
          </Box>
        </Collapse>
      </Stack>
    </Paper>
  );
};
