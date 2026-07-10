'use client';

import { useQuery } from '@apollo/client/react';
import {
  Combobox,
  Group,
  Loader,
  Text,
  TextInput,
  useCombobox,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { GET_LATEST_RECIPES } from '@/lib/graphql/queries';
import type { RecipeBase } from '@/types/recipe';
import { PUBLIC_ROUTES } from '@/types/routes';

const MIN_SEARCH_LENGTH = 4;
const SEARCH_LIMIT = 5;
const DEBOUNCE_MS = 800;

const searchTransition = {
  duration: 0.15,
  ease: 'easeOut',
} as const;

export const HeaderSearch = () => {
  const translate = useTranslations('headerSearch');
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchQuery, DEBOUNCE_MS);

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const trimmedSearchQuery = debouncedSearch.trim();
  const shouldSearch = trimmedSearchQuery.length >= MIN_SEARCH_LENGTH;

  const { data, loading, error } = useQuery(GET_LATEST_RECIPES, {
    variables: { limit: SEARCH_LIMIT, filter: { title: trimmedSearchQuery } },
    skip: !shouldSearch,
  });

  const recipes = useMemo(
    () => (data?.getRecipes?.recipes ?? []) as RecipeBase[],
    [data],
  );

  const hasNoResults =
    shouldSearch && !loading && !error && recipes.length === 0;

  const dropdownState = loading
    ? 'loading'
    : error
      ? 'error'
      : hasNoResults
        ? 'empty'
        : recipes.length > 0
          ? `results-${trimmedSearchQuery}`
          : 'idle';

  const handleChange = (value: string) => {
    setSearchQuery(value);
    combobox.resetSelectedOption();

    if (value.trim().length >= MIN_SEARCH_LENGTH) {
      combobox.openDropdown();
    } else {
      combobox.closeDropdown();
    }
  };

  const handleSubmit = (optionValue: string) => {
    setSearchQuery('');
    combobox.closeDropdown();
    router.push(`${PUBLIC_ROUTES.RECIPES}/${optionValue}`);
  };

  return (
    <Combobox
      store={combobox}
      withinPortal
      transitionProps={{
        transition: 'fade',
        duration: 150,
        timingFunction: 'ease',
      }}
      onOptionSubmit={handleSubmit}
    >
      <Combobox.Target>
        <TextInput
          placeholder={translate('placeholder')}
          value={searchQuery}
          onChange={(event) => handleChange(event.currentTarget.value)}
          onFocus={() => shouldSearch && combobox.openDropdown()}
          onBlur={() => combobox.closeDropdown()}
          data-testid="header-search-input"
          rightSection={
            <AnimatePresence initial={false} mode="wait">
              <motion.span
                key={loading ? 'loading' : 'idle'}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={searchTransition}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {loading ? <Loader size={18} /> : <IconSearch size={18} />}
              </motion.span>
            </AnimatePresence>
          }
          radius="xl"
          size="sm"
          w={{ base: 200, md: 300, lg: 400 }}
          display={{ base: 'none', sm: 'block' }}
        />
      </Combobox.Target>

      <Combobox.Dropdown
        display={{ base: 'none', sm: 'block' }}
        data-testid="header-search-dropdown"
      >
        <Combobox.Options>
          <AnimatePresence initial={false} mode="wait">
            {dropdownState === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={searchTransition}
              >
                <Combobox.Empty>
                  <Text size="sm" c="dimmed">
                    {translate('searching')}
                  </Text>
                </Combobox.Empty>
              </motion.div>
            )}

            {dropdownState === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={searchTransition}
              >
                <Combobox.Empty>
                  <Text size="sm" c="red">
                    {translate('searchError')}
                  </Text>
                </Combobox.Empty>
              </motion.div>
            )}

            {dropdownState === 'empty' && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={searchTransition}
              >
                <Combobox.Empty>
                  <Text size="sm" c="dimmed">
                    {translate('noResults')}
                  </Text>
                </Combobox.Empty>
              </motion.div>
            )}

            {dropdownState.startsWith('results-') && (
              <motion.div
                key={dropdownState}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: 0.035,
                      delayChildren: 0.02,
                    },
                  },
                }}
              >
                {recipes.map((recipe) => (
                  <motion.div
                    key={recipe.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={searchTransition}
                  >
                    <Combobox.Option
                      value={recipe.slug || recipe.id}
                      data-testid="header-search-option"
                    >
                      <Group>
                        <Text size="sm">{recipe.title}</Text>
                      </Group>
                    </Combobox.Option>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};
