import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { METADATA_DEFINITIONS } from '@/lib/metadata/definitions';
import { toCleanedOptions } from '../utils';

export const useRecipeMetadata = () => {
  const translateMisc = useTranslations('misc');

  const categories = useMemo(
    () =>
      toCleanedOptions(
        METADATA_DEFINITIONS.filter((m) => m.type === 'CATEGORY'),
        translateMisc,
      ),
    [translateMisc],
  );

  const levels = useMemo(
    () =>
      toCleanedOptions(
        METADATA_DEFINITIONS.filter((m) => m.type === 'DIFFICULTY_LEVEL'),
        translateMisc,
      ),
    [translateMisc],
  );

  const labels = useMemo(
    () =>
      toCleanedOptions(
        METADATA_DEFINITIONS.filter((m) => m.type === 'LABEL'),
        translateMisc,
      ),
    [translateMisc],
  );

  const unitOptions = useMemo(
    () =>
      toCleanedOptions(
        METADATA_DEFINITIONS.filter((m) => m.type === 'UNIT'),
        translateMisc,
      ),
    [translateMisc],
  );

  const cuisines = useMemo(
    () =>
      toCleanedOptions(
        METADATA_DEFINITIONS.filter((m) => m.type === 'CUISINE'),
        translateMisc,
      ),
    [translateMisc],
  );

  const servingUnits = useMemo(
    () =>
      toCleanedOptions(
        METADATA_DEFINITIONS.filter((m) => m.type === 'SERVING_UNIT'),
        translateMisc,
      ),
    [translateMisc],
  );

  const dietaryFlags = useMemo(
    () =>
      toCleanedOptions(
        METADATA_DEFINITIONS.filter((m) => m.type === 'DIET'),
        translateMisc,
      ),
    [translateMisc],
  );

  const allergens = useMemo(
    () =>
      toCleanedOptions(
        METADATA_DEFINITIONS.filter((m) => m.type === 'ALLERGEN'),
        translateMisc,
      ),
    [translateMisc],
  );

  const equipment = useMemo(
    () =>
      toCleanedOptions(
        METADATA_DEFINITIONS.filter((m) => m.type === 'EQUIPMENT'),
        translateMisc,
      ),
    [translateMisc],
  );

  const costLevels = useMemo(
    () =>
      toCleanedOptions(
        METADATA_DEFINITIONS.filter((m) => m.type === 'COST_LEVEL'),
        translateMisc,
      ),
    [translateMisc],
  );

  return {
    categories,
    levels,
    labels,
    unitOptions,
    cuisines,
    servingUnits,
    dietaryFlags,
    allergens,
    equipment,
    costLevels,
    metadataLoading: false,
    metadataLoaded: true,
  };
};
