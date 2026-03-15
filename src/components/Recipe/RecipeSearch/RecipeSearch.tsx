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
import { useDisclosure } from '@mantine/hooks';
import {
  IconFilter,
  IconFilterOff,
  IconSearch,
  IconX,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { DEFAULT_FILTERS } from './consts';
import classes from './RecipeSearch.module.css';
import type {
  FilterKey,
  FilterValue,
  RecipeSearchFilters,
  RecipeSearchProps,
} from './types';

export const RecipeSearch = ({
  onSearch,
  initialFilters,
  categoryOptions = [],
  difficultyOptions = [],
  labelOptions = [],
  loading = false,
}: RecipeSearchProps) => {
  const t = useTranslations('recipeSearch');

  const [filters, setFilters] = useState<RecipeSearchFilters>(
    initialFilters || DEFAULT_FILTERS,
  );

  const [opened, { toggle }] = useDisclosure(false);

  const handleFilterChange = (key: FilterKey, value: FilterValue) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters(DEFAULT_FILTERS);
    onSearch(DEFAULT_FILTERS);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const hasActiveFilters =
    filters.categoryKey ||
    filters.difficultyLevelKey ||
    filters.labelKeys.length > 0 ||
    filters.maxCookingTime;

  const filterIconColor = hasActiveFilters || opened ? 'pink' : 'gray';

  return (
    <Paper withBorder p="md" radius="md" className={classes.wrapper}>
      <Stack gap="md">
        <Group align="flex-end" gap="sm">
          <TextInput
            flex={1}
            placeholder={t('searchPlaceholder')}
            label={t('recipeName')}
            leftSection={<IconSearch size={16} stroke={1.5} />}
            value={filters.title}
            onChange={(e) => handleFilterChange('title', e.currentTarget.value)}
            onKeyDown={handleKeyDown}
          />
          <ActionIcon
            variant={opened ? 'light' : 'subtle'}
            color={filterIconColor}
            size="lg"
            onClick={toggle}
            aria-label={t('toggleFilters')}
            className={classes.filterToggleBtn}
          >
            {opened ? <IconFilterOff size={20} /> : <IconFilter size={20} />}
          </ActionIcon>
          <Button
            onClick={handleSearch}
            loading={loading}
            className={classes.searchBtn}
          >
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
                value={filters.categoryKey}
                onChange={(val) => handleFilterChange('categoryKey', val)}
                clearable
              />
              <Select
                label={t('difficulty')}
                placeholder={t('difficultyPlaceholder')}
                data={difficultyOptions}
                value={filters.difficultyLevelKey}
                onChange={(val) =>
                  handleFilterChange('difficultyLevelKey', val)
                }
                clearable
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
                value={filters.labelKeys}
                onChange={(val) => handleFilterChange('labelKeys', val)}
                clearable
                searchable
              />
              <NumberInput
                label={t('maxCookingTime')}
                placeholder={t('maxCookingTimePlaceholder')}
                min={0}
                value={filters.maxCookingTime}
                onChange={(val) => handleFilterChange('maxCookingTime', val)}
                hideControls
              />
            </Group>

            <Button
              fullWidth
              onClick={handleSearch}
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
