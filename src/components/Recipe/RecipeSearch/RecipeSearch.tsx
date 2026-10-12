import {
  ActionIcon,
  Box,
  Button,
  Group,
  MultiSelect,
  NumberInput,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import {
  IconFilter,
  IconFilterOff,
  IconSearch,
  IconX,
} from '@tabler/icons-react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';

import { MOTION_TRANSITION } from '@/lib/motion/transitions';
import { zodResolver } from '@/lib/validation/zodResolver';
import { DEFAULT_FILTERS, recipeSearchSchema } from './consts';
import classes from './RecipeSearch.module.css';
import type { RecipeSearchFilters, RecipeSearchProps } from './types';

const RecipeSearch = ({
  initialFilters,
  onSearch,
  categoryOptions = [],
  difficultyOptions = [],
  labelOptions = [],
  loading = false,
}: RecipeSearchProps) => {
  const translate = useTranslations('recipeSearch');
  const translateValidation = useTranslations();

  const [opened, { toggle }] = useDisclosure(false);

  const form = useForm<RecipeSearchFilters>({
    mode: 'controlled',
    initialValues: initialFilters ?? DEFAULT_FILTERS,
    validate: zodResolver(recipeSearchSchema, (key) =>
      translateValidation(key),
    ),
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

  const trimmedTitle = form.values.title.trim();
  const canSearch = trimmedTitle.length >= 3;

  const filterIconColor = hasActiveFilters || opened ? 'pink' : 'gray';

  return (
    <Paper
      withBorder
      p="md"
      radius="md"
      className={classes.wrapper}
      component="form"
      onSubmit={form.onSubmit(handleSubmit)}
      data-testid="recipe-search"
    >
      <Stack gap="md">
        <Group align="flex-end" gap="sm">
          <TextInput
            flex={1}
            placeholder={translate('searchPlaceholder')}
            label={translate('recipeName')}
            leftSection={<IconSearch size={16} stroke={1.5} />}
            key={form.key('title')}
            data-testid="recipe-search-title-input"
            {...form.getInputProps('title')}
          />
          <ActionIcon
            variant={opened ? 'light' : 'subtle'}
            color={filterIconColor}
            size="lg"
            onClick={toggle}
            type="button"
            aria-label={translate('toggleFilters')}
            className={classes.filterToggleBtn}
            data-testid="recipe-search-toggle-filters"
          >
            {opened ? <IconFilterOff size={20} /> : <IconFilter size={20} />}
          </ActionIcon>
          <Button
            type="submit"
            loading={loading}
            disabled={!canSearch || loading}
            className={classes.searchBtn}
            data-testid="recipe-search-submit"
          >
            {translate('search')}
          </Button>
        </Group>

        <Box>
          <Text component="h2" fw={500} size="sm" mb="xs">
            {translate('category')}
          </Text>
          <Group
            gap="xs"
            role="group"
            aria-label={translate('category')}
            className={classes.categoryOptions}
          >
            {[
              { value: null, label: translate('allCategories') },
              ...categoryOptions,
            ].map((option) => {
              const active = form.values.categoryKey === option.value;

              return (
                <UnstyledButton
                  key={option.value ?? 'all'}
                  type="button"
                  aria-pressed={active}
                  className={classes.categoryOption}
                  onClick={() =>
                    form.setFieldValue('categoryKey', option.value)
                  }
                >
                  {active && (
                    <motion.span
                      layoutId="recipe-search-category-pill"
                      className={classes.categoryPill}
                      transition={MOTION_TRANSITION.interactive}
                      aria-hidden="true"
                    />
                  )}
                  <span className={classes.categoryOptionLabel}>
                    {option.label}
                  </span>
                </UnstyledButton>
              );
            })}
          </Group>
        </Box>

        <AnimatePresence initial={false}>
          {opened && (
            <motion.div
              key="advanced-filters"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={MOTION_TRANSITION.standard}
              style={{ overflow: 'hidden' }}
            >
              <Box pt="sm">
                <Group justify="space-between" mb="sm">
                  <Text fw={500} size="sm">
                    {translate('advancedFilters')}
                  </Text>
                  <Button
                    variant="subtle"
                    size="xs"
                    color="gray"
                    type="button"
                    onClick={handleClear}
                    rightSection={<IconX size={14} />}
                    data-testid="recipe-search-clear-filters"
                  >
                    {translate('clearFilters')}
                  </Button>
                </Group>
                <Group grow align="flex-start" className={classes.filterRow}>
                  <Select
                    label={translate('difficulty')}
                    placeholder={translate('difficultyPlaceholder')}
                    data={difficultyOptions}
                    clearable
                    key={form.key('difficultyLevelKey')}
                    data-testid="recipe-search-difficulty-select"
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
                    label={translate('labels')}
                    placeholder={translate('labelsPlaceholder')}
                    data={labelOptions}
                    clearable
                    searchable
                    key={form.key('labelKeys')}
                    data-testid="recipe-search-labels-select"
                    {...form.getInputProps('labelKeys')}
                  />
                  <NumberInput
                    label={translate('maxCookingTime')}
                    placeholder={translate('maxCookingTimePlaceholder')}
                    min={0}
                    hideControls
                    key={form.key('maxCookingTime')}
                    data-testid="recipe-search-max-time-input"
                    {...form.getInputProps('maxCookingTime')}
                  />
                </Group>

                <Button
                  fullWidth
                  type="submit"
                  loading={loading}
                  mt="md"
                  className={classes.applyBtn}
                  data-testid="recipe-search-apply-filters"
                >
                  {translate('applyFilters')}
                </Button>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Stack>
    </Paper>
  );
};

export default RecipeSearch;
