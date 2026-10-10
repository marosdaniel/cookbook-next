import '@testing-library/jest-dom';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  useQuery: vi.fn(),
}));

vi.mock('@apollo/client/react', () => ({
  useQuery: (...args: unknown[]) => mocks.useQuery(...args),
}));

import { useRecipeMetadata } from './useRecipeMetadata';

describe('useRecipeMetadata', () => {
  beforeEach(() => {
    mocks.useQuery.mockReset();
  });

  it('groups the loaded items into select options per metadata type', () => {
    mocks.useQuery.mockReturnValue({
      loading: false,
      data: {
        getAllMetadata: [
          {
            key: 'soup',
            label: 'category-soup',
            type: 'CATEGORY',
            name: 'soup',
          },
          { key: 'vegan', label: 'label-vegan', type: 'LABEL', name: 'vegan' },
          { key: 'g', label: 'unit-g', type: 'UNIT', name: 'g' },
        ],
      },
    });

    const { result } = renderHook(() => useRecipeMetadata());

    expect(result.current.categories).toEqual([
      { value: 'soup', label: 'soup' },
    ]);
    expect(result.current.labels).toEqual([{ value: 'vegan', label: 'vegan' }]);
    expect(result.current.unitOptions).toEqual([{ value: 'g', label: 'g' }]);
    expect(result.current.costLevels).toEqual([]);
    expect(result.current.metadataLoading).toBe(false);
    expect(result.current.metadataLoaded).toBe(true);
  });

  it('reports loading until the first response arrives', () => {
    mocks.useQuery.mockReturnValue({ loading: true, data: undefined });

    const { result } = renderHook(() => useRecipeMetadata());

    expect(result.current.metadataLoading).toBe(true);
    expect(result.current.metadataLoaded).toBe(false);
    expect(result.current.categories).toEqual([]);
  });

  it('treats a failed load as loaded with empty options', () => {
    mocks.useQuery.mockReturnValue({ loading: false, data: undefined });

    const { result } = renderHook(() => useRecipeMetadata());

    expect(result.current.metadataLoading).toBe(false);
    expect(result.current.metadataLoaded).toBe(true);
    expect(result.current.levels).toEqual([]);
  });
});
