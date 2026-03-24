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
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { GET_LATEST_RECIPES } from '@/lib/graphql/queries';
import { useTranslations } from 'next-intl';
import type { RecipeBase } from '@/types/recipe';

export function HeaderSearch() {
  const t = useTranslations('headerSearch');
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchQuery, 800);
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });
  const [isFocused, setIsFocused] = useState(false);

  const shouldSearch = debouncedSearch.length >= 4;

  const { data, loading } = useQuery<{
    getRecipes?: { recipes: RecipeBase[] };
  }>(GET_LATEST_RECIPES, {
    variables: {
      limit: 5,
      filter: { title: debouncedSearch },
    },
    skip: !shouldSearch,
  });

  useEffect(() => {
    if (!shouldSearch) {
      combobox.closeDropdown();
    } else if (isFocused && loading) {
      combobox.openDropdown();
    }
  }, [shouldSearch, loading, isFocused, combobox]);

  const recipes = data?.getRecipes?.recipes || [];
  const hasNoResults = shouldSearch && !loading && recipes.length === 0;

  const options = recipes.map((recipe: RecipeBase) => (
    <Combobox.Option value={recipe.slug || recipe.id} key={recipe.id}>
      <Group>
        <Text size="sm">{recipe.title}</Text>
      </Group>
    </Combobox.Option>
  ));

  return (
    <Combobox
      onOptionSubmit={(optionValue) => {
        setSearchQuery('');
        combobox.closeDropdown();
        router.push(`/recipes/${optionValue}` as Route);
      }}
      store={combobox}
      withinPortal={true}
      transitionProps={{ transition: 'fade', duration: 200, timingFunction: 'ease' }}
    >
      <Combobox.Target>
        <TextInput
          placeholder={t('placeholder')}
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.currentTarget.value);
            combobox.resetSelectedOption();
            if (event.currentTarget.value.length < 4) {
               combobox.closeDropdown();
            } else if (recipes.length > 0) {
               combobox.openDropdown();
            }
          }}
          onClick={() => {
            if (shouldSearch && recipes.length > 0) {
              combobox.openDropdown();
            }
          }}
          onFocus={() => {
            setIsFocused(true);
            if (shouldSearch && recipes.length > 0) {
              combobox.openDropdown();
            }
          }}
          onBlur={() => {
            setIsFocused(false);
            combobox.closeDropdown();
          }}
          rightSection={loading ? <Loader size={18} /> : <IconSearch size={18} />}
          radius="xl"
          size="sm"
          w={{ base: 200, md: 300, lg: 400 }}
          display={{ base: 'none', sm: 'block' }}
        />
      </Combobox.Target>

      <Combobox.Dropdown display={{ base: 'none', sm: 'block' }}>
        <Combobox.Options>
          {loading && (
            <Combobox.Empty>
              <Text size="sm" c="dimmed">
                {t('searching')}
              </Text>
            </Combobox.Empty>
          )}

          {!loading && options.length > 0 && options}

          {hasNoResults && (
            <Combobox.Empty>
              <Text size="sm" c="dimmed">
                {t('noResults')}
              </Text>
            </Combobox.Empty>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
