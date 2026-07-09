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
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { GET_LATEST_RECIPES } from '@/lib/graphql/queries';
import type { RecipeBase } from '@/types/recipe';
import { PUBLIC_ROUTES } from '@/types/routes';

const MIN_SEARCH_LENGTH = 4;
const SEARCH_LIMIT = 5;
const DEBOUNCE_MS = 800;

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
        duration: 200,
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
            loading ? <Loader size={18} /> : <IconSearch size={18} />
          }
          radius="xl"
          size="sm"
          w={{ base: 200, md: 300, lg: 400 }}
          display={{ base: 'none', sm: 'block' }}
        />
      </Combobox.Target>

      <Combobox.Dropdown display={{ base: 'none', sm: 'block' }} data-testid="header-search-dropdown">
        <Combobox.Options>
          {loading && (
            <Combobox.Empty>
              <Text size="sm" c="dimmed">
                {translate('searching')}
              </Text>
            </Combobox.Empty>
          )}

          {error && (
            <Combobox.Empty>
              <Text size="sm" c="red">
                {translate('searchError')}
              </Text>
            </Combobox.Empty>
          )}

          {!loading &&
            !error &&
            recipes.map((recipe) => (
              <Combobox.Option value={recipe.slug || recipe.id} key={recipe.id} data-testid="header-search-option">
                <Group>
                  <Text size="sm">{recipe.title}</Text>
                </Group>
              </Combobox.Option>
            ))}

          {hasNoResults && (
            <Combobox.Empty>
              <Text size="sm" c="dimmed">
                {translate('noResults')}
              </Text>
            </Combobox.Empty>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};
