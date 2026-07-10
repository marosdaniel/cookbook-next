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

export const useRecipeMetadata = () => {
  const translateMisc = useTranslations('misc');

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
    () => toCleanedOptions(categoriesFromStore, translateMisc),
    [categoriesFromStore, translateMisc],
  );

  const levels = useMemo(
    () => toCleanedOptions(levelsFromStore, translateMisc),
    [levelsFromStore, translateMisc],
  );

  const labels = useMemo(
    () => toCleanedOptions(labelsFromStore, translateMisc),
    [labelsFromStore, translateMisc],
  );

  const unitOptions = useMemo(
    () => toCleanedOptions(unitsFromStore, translateMisc),
    [translateMisc, unitsFromStore],
  );

  const cuisines = useMemo(
    () => toCleanedOptions(cuisinesFromStore, translateMisc),
    [cuisinesFromStore, translateMisc],
  );

  const servingUnits = useMemo(
    () => toCleanedOptions(servingUnitsFromStore, translateMisc),
    [servingUnitsFromStore, translateMisc],
  );

  const dietaryFlags = useMemo(
    () => toCleanedOptions(dietaryFlagsFromStore, translateMisc),
    [dietaryFlagsFromStore, translateMisc],
  );

  const allergens = useMemo(
    () => toCleanedOptions(allergensFromStore, translateMisc),
    [allergensFromStore, translateMisc],
  );

  const equipment = useMemo(
    () => toCleanedOptions(equipmentFromStore, translateMisc),
    [equipmentFromStore, translateMisc],
  );

  const costLevels = useMemo(
    () => toCleanedOptions(costLevelsFromStore, translateMisc),
    [costLevelsFromStore, translateMisc],
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
};
