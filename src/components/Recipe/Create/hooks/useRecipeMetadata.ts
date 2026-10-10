import { useQuery } from '@apollo/client/react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { GET_ALL_METADATA } from '@/lib/graphql/queries';
import {
  METADATA_TYPES,
  type MetadataTypeName,
} from '@/lib/metadata/metadataTypes';
import { toCleanedOptions } from '../utils';

type MetadataListItem = { key: string; label: string; type: string };

const NO_METADATA_ITEMS: readonly MetadataListItem[] = [];

/**
 * Select options for every metadata type, loaded from the database through
 * `getAllMetadata`. `metadataLoaded` stays true after a failed load so forms
 * render with empty lists instead of waiting forever.
 */
export const useRecipeMetadata = () => {
  const translateMisc = useTranslations('misc');

  const { data, loading } = useQuery(GET_ALL_METADATA, {
    fetchPolicy: 'cache-and-network',
  });

  const items: readonly MetadataListItem[] =
    data?.getAllMetadata ?? NO_METADATA_ITEMS;

  const optionsByType = useMemo(
    () =>
      Object.fromEntries(
        METADATA_TYPES.map((type) => [
          type,
          toCleanedOptions(
            items
              .filter((item) => item.type === type)
              .map((item) => ({ key: item.key, translationKey: item.label })),
            translateMisc,
          ),
        ]),
      ) as Record<MetadataTypeName, ReturnType<typeof toCleanedOptions>>,
    [items, translateMisc],
  );

  const hasData = data !== undefined;

  return {
    categories: optionsByType.CATEGORY,
    levels: optionsByType.DIFFICULTY_LEVEL,
    labels: optionsByType.LABEL,
    unitOptions: optionsByType.UNIT,
    cuisines: optionsByType.CUISINE,
    servingUnits: optionsByType.SERVING_UNIT,
    dietaryFlags: optionsByType.DIET,
    allergens: optionsByType.ALLERGEN,
    equipment: optionsByType.EQUIPMENT,
    costLevels: optionsByType.COST_LEVEL,
    metadataLoading: loading && !hasData,
    metadataLoaded: hasData || !loading,
  };
};
