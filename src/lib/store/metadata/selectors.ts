import { useAppSelector } from '../store';

export const useMetadata = () => useAppSelector((state) => state.metadata);

export const useCategories = () =>
  useAppSelector((state) => state.metadata.categories);

export const useLabels = () => useAppSelector((state) => state.metadata.labels);

export const useUnits = () => useAppSelector((state) => state.metadata.units);

export const useLevels = () => useAppSelector((state) => state.metadata.levels);

export const useCuisines = () =>
  useAppSelector((state) => state.metadata.cuisines);

export const useServingUnits = () =>
  useAppSelector((state) => state.metadata.servingUnits);

export const useDietaryFlags = () =>
  useAppSelector((state) => state.metadata.dietaryFlags);

export const useAllergens = () =>
  useAppSelector((state) => state.metadata.allergens);

export const useEquipment = () =>
  useAppSelector((state) => state.metadata.equipment);

export const useCostLevels = () =>
  useAppSelector((state) => state.metadata.costLevels);

export const useMetadataLoading = () =>
  useAppSelector((state) => state.metadata.isLoading);

export const useMetadataLoaded = () =>
  useAppSelector((state) => state.metadata.isLoaded);

export const useMetadataError = () =>
  useAppSelector((state) => state.metadata.error);
