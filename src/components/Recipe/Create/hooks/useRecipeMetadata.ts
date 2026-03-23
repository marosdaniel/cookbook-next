import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import {
  useAllergens,
  useCategories,
  useCostLevels,
  useCuisines,
  useDietaryFlags,
  useEquipment,
  useLabels,
  useLevels,
  useMetadataLoaded,
  useMetadataLoading,
  useServingUnits,
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
  const cuisinesFromStore = useCuisines();
  const servingUnitsFromStore = useServingUnits();
  const dietaryFlagsFromStore = useDietaryFlags();
  const allergensFromStore = useAllergens();
  const equipmentFromStore = useEquipment();
  const costLevelsFromStore = useCostLevels();
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
  const unitOptions = useMemo(
    () => toCleanedOptions(unitsFromStore, tMisc),
    [unitsFromStore, tMisc],
  );
  const cuisines = useMemo(
    () => toCleanedOptions(cuisinesFromStore, tMisc),
    [cuisinesFromStore, tMisc],
  );
  const servingUnits = useMemo(
    () => toCleanedOptions(servingUnitsFromStore, tMisc),
    [servingUnitsFromStore, tMisc],
  );
  const dietaryFlags = useMemo(
    () => toCleanedOptions(dietaryFlagsFromStore, tMisc),
    [dietaryFlagsFromStore, tMisc],
  );
  const allergens = useMemo(
    () => toCleanedOptions(allergensFromStore, tMisc),
    [allergensFromStore, tMisc],
  );
  const equipment = useMemo(
    () => toCleanedOptions(equipmentFromStore, tMisc),
    [equipmentFromStore, tMisc],
  );
  const costLevels = useMemo(
    () => toCleanedOptions(costLevelsFromStore, tMisc),
    [costLevelsFromStore, tMisc],
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
    metadataLoading,
    metadataLoaded,
  };
}
