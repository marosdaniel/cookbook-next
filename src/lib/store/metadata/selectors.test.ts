import { describe, expect, it, vi } from 'vitest';

vi.mock('../store', () => ({
  useAppSelector: (selector: (state: unknown) => unknown) => selector({
    metadata: {
      categories: [{ key: 'cat', label: 'Cat', type: 'CATEGORY', name: 'cat' }],
      labels: [],
      units: [],
      levels: [],
      cuisines: [],
      servingUnits: [],
      dietaryFlags: [],
      allergens: [],
      equipment: [],
      costLevels: [],
      isLoading: false,
      isLoaded: true,
      error: 'oops',
    },
  }),
}));

import { useMetadata, useMetadataError } from './selectors';

describe('metadata selectors', () => {
  it('exposes the metadata slice', () => {
    expect(useMetadata()).toEqual({
      categories: [{ key: 'cat', label: 'Cat', type: 'CATEGORY', name: 'cat' }],
      labels: [],
      units: [],
      levels: [],
      cuisines: [],
      servingUnits: [],
      dietaryFlags: [],
      allergens: [],
      equipment: [],
      costLevels: [],
      isLoading: false,
      isLoaded: true,
      error: 'oops',
    });
  });

  it('reads the current error value', () => {
    expect(useMetadataError()).toBe('oops');
  });
});
