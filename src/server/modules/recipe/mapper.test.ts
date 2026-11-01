import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/services/MetadataService', () => ({
  MetadataService: {},
  metadataLookupKey: vi.fn(),
}));

import { ErrorTypes } from '@/lib/validation/errorCatalog';
import { assertPresent, validateRequiredFields } from './mapper';

type ValidateInput = Parameters<typeof validateRequiredFields>[0];

const validInput = {
  title: 'Soup',
  ingredients: [{ name: 'water' }],
  preparationSteps: [{ description: 'boil' }],
  category: { key: 'soup' },
  cookingTime: 30,
  difficultyLevel: { key: 'easy' },
  servings: 2,
} as unknown as ValidateInput;

describe('assertPresent', () => {
  it('passes for non-null values, including falsy ones', () => {
    expect(() =>
      assertPresent(0, 'missing', ErrorTypes.NOT_FOUND),
    ).not.toThrow();
    expect(() =>
      assertPresent('', 'missing', ErrorTypes.NOT_FOUND),
    ).not.toThrow();
    expect(() =>
      assertPresent(false, 'missing', ErrorTypes.NOT_FOUND),
    ).not.toThrow();
  });

  it('throws the given message for null and undefined', () => {
    expect(() =>
      assertPresent(null, 'Recipe missing', ErrorTypes.NOT_FOUND),
    ).toThrow('Recipe missing');
    expect(() =>
      assertPresent(undefined, 'Recipe missing', ErrorTypes.NOT_FOUND),
    ).toThrow('Recipe missing');
  });
});

describe('validateRequiredFields', () => {
  it('accepts an input with all required fields', () => {
    expect(() => validateRequiredFields(validInput)).not.toThrow();
  });

  it.each([
    ['title', { title: '' }],
    ['ingredients', { ingredients: undefined }],
    ['preparationSteps', { preparationSteps: undefined }],
    ['category', { category: undefined }],
    ['cookingTime', { cookingTime: 0 }],
    ['difficultyLevel', { difficultyLevel: undefined }],
    ['servings', { servings: 0 }],
  ])('throws BAD_REQUEST when %s is missing', (_field, override) => {
    expect(() =>
      validateRequiredFields({ ...validInput, ...override } as ValidateInput),
    ).toThrow('All required fields must be provided');
  });
});
