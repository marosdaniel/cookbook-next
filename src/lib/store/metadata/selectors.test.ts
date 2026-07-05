import { describe, expect, it, vi } from 'vitest';

vi.mock('../store', () => ({
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({
      metadata: {
        categories: [
          { key: 'cat', label: 'Cat', type: 'CATEGORY', name: 'cat' },
        ],
        labels: [{ key: 'label', label: 'Label' }],
        units: [{ key: 'unit', label: 'Unit' }],
        levels: [{ key: 'level', label: 'Level' }],
        cuisines: [{ key: 'cuisine', label: 'Cuisine' }],
        servingUnits: [{ key: 'serving', label: 'Serving' }],
        dietaryFlags: [{ key: 'flag', label: 'Flag' }],
        allergens: [{ key: 'allergen', label: 'Allergen' }],
        equipment: [{ key: 'equipment', label: 'Equipment' }],
        costLevels: [{ key: 'cost', label: 'Cost' }],
        isLoading: false,
        isLoaded: true,
        error: 'oops',
      },
    }),
}));

import {
  useAllergens,
  useCategories,
  useCostLevels,
  useCuisines,
  useDietaryFlags,
  useEquipment,
  useLabels,
  useLevels,
  useMetadata,
  useMetadataError,
  useMetadataLoaded,
  useMetadataLoading,
  useServingUnits,
  useUnits,
} from './selectors';

describe('metadata selectors', () => {
  it('exposes the metadata slice', () => {
    expect(useMetadata()).toEqual({
      categories: [{ key: 'cat', label: 'Cat', type: 'CATEGORY', name: 'cat' }],
      labels: [{ key: 'label', label: 'Label' }],
      units: [{ key: 'unit', label: 'Unit' }],
      levels: [{ key: 'level', label: 'Level' }],
      cuisines: [{ key: 'cuisine', label: 'Cuisine' }],
      servingUnits: [{ key: 'serving', label: 'Serving' }],
      dietaryFlags: [{ key: 'flag', label: 'Flag' }],
      allergens: [{ key: 'allergen', label: 'Allergen' }],
      equipment: [{ key: 'equipment', label: 'Equipment' }],
      costLevels: [{ key: 'cost', label: 'Cost' }],
      isLoading: false,
      isLoaded: true,
      error: 'oops',
    });
  });

  it('returns the expected parts of the metadata state', () => {
    expect(useCategories()).toEqual([
      { key: 'cat', label: 'Cat', type: 'CATEGORY', name: 'cat' },
    ]);
    expect(useLabels()).toEqual([{ key: 'label', label: 'Label' }]);
    expect(useUnits()).toEqual([{ key: 'unit', label: 'Unit' }]);
    expect(useLevels()).toEqual([{ key: 'level', label: 'Level' }]);
    expect(useCuisines()).toEqual([{ key: 'cuisine', label: 'Cuisine' }]);
    expect(useServingUnits()).toEqual([{ key: 'serving', label: 'Serving' }]);
    expect(useDietaryFlags()).toEqual([{ key: 'flag', label: 'Flag' }]);
    expect(useAllergens()).toEqual([{ key: 'allergen', label: 'Allergen' }]);
    expect(useEquipment()).toEqual([{ key: 'equipment', label: 'Equipment' }]);
    expect(useCostLevels()).toEqual([{ key: 'cost', label: 'Cost' }]);
    expect(useMetadataLoading()).toBe(false);
    expect(useMetadataLoaded()).toBe(true);
    expect(useMetadataError()).toBe('oops');
  });
});
