import { describe, expect, it } from 'vitest';

import {
  clearMetadata,
  groupMetadata,
  metadataReducer,
  setMetadata,
  setMetadataError,
  setMetadataLoaded,
  setMetadataLoading,
} from './metadata';

describe('metadata reducer', () => {
  it('returns the initial state by default', () => {
    const state = metadataReducer(undefined, { type: '@@INIT' });

    expect(state.isLoading).toBe(false);
    expect(state.isLoaded).toBe(false);
    expect(state.error).toBeNull();
    expect(state.categories).toEqual([]);
  });

  it('updates loading and loaded flags', () => {
    const state = metadataReducer(undefined, setMetadataLoading(true));
    const nextState = metadataReducer(state, setMetadataLoaded(true));

    expect(nextState.isLoading).toBe(true);
    expect(nextState.isLoaded).toBe(true);
  });

  it('stores metadata errors', () => {
    const state = metadataReducer(undefined, setMetadataError('boom'));

    expect(state.error).toBe('boom');
  });

  it('groups metadata by type and can clear it again', () => {
    const state = metadataReducer(
      undefined,
      setMetadata([
        { key: 'cat', label: 'Cat', type: 'CATEGORY', name: 'cat' },
        { key: 'lab', label: 'Lab', type: 'LABEL', name: 'lab' },
        { key: 'unit', label: 'Unit', type: 'UNIT', name: 'unit' },
        {
          key: 'level',
          label: 'Level',
          type: 'DIFFICULTY_LEVEL',
          name: 'level',
        },
        { key: 'cuisine', label: 'Cuisine', type: 'CUISINE', name: 'cuisine' },
        {
          key: 'serving',
          label: 'Serving',
          type: 'SERVING_UNIT',
          name: 'serving',
        },
        { key: 'diet', label: 'Diet', type: 'DIET', name: 'diet' },
        {
          key: 'allergen',
          label: 'Allergen',
          type: 'ALLERGEN',
          name: 'allergen',
        },
        {
          key: 'equipment',
          label: 'Equipment',
          type: 'EQUIPMENT',
          name: 'equipment',
        },
        { key: 'cost', label: 'Cost', type: 'COST_LEVEL', name: 'cost' },
      ]),
    );

    expect(state.categories).toHaveLength(1);
    expect(state.labels).toHaveLength(1);
    expect(state.units).toHaveLength(1);
    expect(state.levels).toHaveLength(1);
    expect(state.cuisines).toHaveLength(1);
    expect(state.servingUnits).toHaveLength(1);
    expect(state.dietaryFlags).toHaveLength(1);
    expect(state.allergens).toHaveLength(1);
    expect(state.equipment).toHaveLength(1);
    expect(state.costLevels).toHaveLength(1);
    expect(state.isLoaded).toBe(true);
    expect(state.isLoading).toBe(false);

    const cleared = metadataReducer(state, clearMetadata());
    expect(cleared.categories).toEqual([]);
    expect(cleared.levels).toEqual([]);
    expect(cleared.isLoaded).toBe(false);
    expect(cleared.error).toBeNull();
  });
});

describe('groupMetadata helper', () => {
  it('buckets items into the correct typed arrays', () => {
    const result = groupMetadata([
      { key: 'cat', label: 'Cat', type: 'CATEGORY', name: 'cat' },
      { key: 'lab', label: 'Lab', type: 'LABEL', name: 'lab' },
      { key: 'unit', label: 'Unit', type: 'UNIT', name: 'unit' },
      { key: 'level', label: 'Level', type: 'DIFFICULTY_LEVEL', name: 'level' },
      { key: 'cuisine', label: 'Cuisine', type: 'CUISINE', name: 'cuisine' },
      { key: 'serving', label: 'Serving', type: 'SERVING_UNIT', name: 'serving' },
      { key: 'diet', label: 'Diet', type: 'DIET', name: 'diet' },
      { key: 'allergen', label: 'Allergen', type: 'ALLERGEN', name: 'allergen' },
      { key: 'equipment', label: 'Equipment', type: 'EQUIPMENT', name: 'equipment' },
      { key: 'cost', label: 'Cost', type: 'COST_LEVEL', name: 'cost' },
    ]);

    expect(result.categories).toHaveLength(1);
    expect(result.labels).toHaveLength(1);
    expect(result.units).toHaveLength(1);
    expect(result.levels).toHaveLength(1);
    expect(result.cuisines).toHaveLength(1);
    expect(result.servingUnits).toHaveLength(1);
    expect(result.dietaryFlags).toHaveLength(1);
    expect(result.allergens).toHaveLength(1);
    expect(result.equipment).toHaveLength(1);
    expect(result.costLevels).toHaveLength(1);
  });

  it('returns empty arrays for unknown types', () => {
    const result = groupMetadata([
      { key: 'unknown', label: 'Unknown', type: 'UNKNOWN_TYPE', name: 'unknown' },
    ]);

    expect(result.categories).toHaveLength(0);
    expect(result.labels).toHaveLength(0);
    expect(result.units).toHaveLength(0);
  });
});

