import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import {
  useCategories,
  useLabels,
  useLevels,
  useMetadataLoaded,
  useMetadataLoading,
  useUnits,
} from '@/lib/store/metadata';
import { toCleanedOptions } from '../utils';

export function useRecipeMetadata() {
  const tMisc = useTranslations('misc');

  /* Metadata from Redux store */
  const categoriesFromStore = useCategories();
  const levelsFromStore = useLevels();
  const labelsFromStore = useLabels();
  const unitsFromStore = useUnits();
  const metadataLoading = useMetadataLoading();
  const metadataLoaded = useMetadataLoaded();

  const categories = useMemo(
    () => toCleanedOptions(categoriesFromStore, tMisc),
    [categoriesFromStore, tMisc],
  );
  const levels = useMemo(
    () => toCleanedOptions(levelsFromStore, tMisc),
    [levelsFromStore, tMisc],
  );
  const labels = useMemo(
    () => toCleanedOptions(labelsFromStore, tMisc),
    [labelsFromStore, tMisc],
  );
  const unitSuggestions = useMemo(
    () =>
      unitsFromStore
        .map((u) => {
          const tr = tMisc(u.key);
          return tr === u.key ? u.label : tr;
        })
        .filter(Boolean),
    [unitsFromStore, tMisc],
  );

  return {
    categories,
    levels,
    labels,
    unitSuggestions,
    metadataLoading,
    metadataLoaded,
  };
}
