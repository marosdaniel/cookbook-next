import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRecipeMetadata } from './useRecipeMetadata';

// Mock dependencies
const mockUseTranslations = vi.fn();
const mockUseCategories = vi.fn();
const mockUseLabels = vi.fn();
const mockUseLevels = vi.fn();
const mockUseUnits = vi.fn();
const mockUseMetadataLoading = vi.fn();
const mockUseMetadataLoaded = vi.fn();

vi.mock('next-intl', () => ({
  useTranslations: () => mockUseTranslations,
}));

vi.mock('@/lib/store/metadata', () => ({
  useCategories: () => mockUseCategories(),
  useLabels: () => mockUseLabels(),
  useLevels: () => mockUseLevels(),
  useUnits: () => mockUseUnits(),
  useMetadataLoading: () => mockUseMetadataLoading(),
  useMetadataLoaded: () => mockUseMetadataLoaded(),
}));

vi.mock('../utils', () => ({
  toCleanedOptions: vi.fn((items, t) => {
    if (!t) return items;
    return items.map((item) => ({
      value: item.key,
      label: t(item.key) || item.label,
    }));
  }),
}));

describe('useRecipeMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTranslations.mockImplementation((key) => key); // Default translation
    mockUseCategories.mockReturnValue([]);
    mockUseLabels.mockReturnValue([]);
    mockUseLevels.mockReturnValue([]);
    mockUseUnits.mockReturnValue([]);
    mockUseMetadataLoading.mockReturnValue(false);
    mockUseMetadataLoaded.mockReturnValue(true);
  });

  it('should return empty arrays when no metadata', () => {
    const { result } = renderHook(() => useRecipeMetadata());

    expect(result.current.categories).toEqual([]);
    expect(result.current.levels).toEqual([]);
    expect(result.current.labels).toEqual([]);
    expect(result.current.unitSuggestions).toEqual([]);
    expect(result.current.metadataLoading).toBe(false);
    expect(result.current.metadataLoaded).toBe(true);
  });

  it('should transform categories with translation', () => {
    const categoriesData = [
      { key: 'main', label: 'Main Course' },
      { key: 'dessert', label: 'Dessert' },
    ];
    mockUseCategories.mockReturnValue(categoriesData);
    mockUseTranslations.mockImplementation((key) => {
      if (key === 'main') return 'Főétel';
      if (key === 'dessert') return 'Desszert';
      return key;
    });

    const { result } = renderHook(() => useRecipeMetadata());

    expect(result.current.categories).toEqual([
      { value: 'main', label: 'Főétel' },
      { value: 'dessert', label: 'Desszert' },
    ]);
  });

  it('should transform levels without translation when not available', () => {
    const levelsData = [
      { key: 'easy', label: 'Easy' },
      { key: 'hard', label: 'Hard' },
    ];
    mockUseLevels.mockReturnValue(levelsData);
    mockUseTranslations.mockImplementation(() => ''); // No translation

    const { result } = renderHook(() => useRecipeMetadata());

    expect(result.current.levels).toEqual([
      { value: 'easy', label: 'Easy' },
      { value: 'hard', label: 'Hard' },
    ]);
  });

  it('should transform unit suggestions', () => {
    const unitsData = [
      { key: 'gram', label: 'g' },
      { key: 'liter', label: 'L' },
    ];
    mockUseUnits.mockReturnValue(unitsData);
    mockUseTranslations.mockImplementation((key) => {
      if (key === 'gram') return 'gramm';
      if (key === 'liter') return 'Liter'; // Different from key to use translation
      return '';
    });

    const { result } = renderHook(() => useRecipeMetadata());

    expect(result.current.unitSuggestions).toEqual(['gramm', 'Liter']);
  });

  it('should filter out empty unit suggestions', () => {
    const unitsData = [
      { key: 'gram', label: 'g' },
      { key: 'unknown', label: 'U' },
    ];
    mockUseUnits.mockReturnValue(unitsData);
    mockUseTranslations.mockImplementation((key) => {
      if (key === 'gram') return 'gramm';
      return ''; // No translation for unknown
    });

    const { result } = renderHook(() => useRecipeMetadata());

    expect(result.current.unitSuggestions).toEqual(['gramm']);
  });
});
