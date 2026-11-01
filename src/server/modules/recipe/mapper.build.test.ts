import { Prisma } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/prisma/prisma', () => ({ prisma: {} }));

import { metadataLookupKey } from '@/lib/services/MetadataService';
import { ErrorTypes } from '@/lib/validation/errorCatalog';
import {
  assertPresent,
  buildRecipeData,
  sanitizeRecipeInput,
  validateRequiredFields,
} from './mapper';

const baseInput = {
  title: 'Soup',
  ingredients: [{ localId: 'i1', name: 'Salt', unit: 'g', quantity: 1 }],
  preparationSteps: [{ description: 'Boil' }],
  category: { value: 'soup', label: 'Soup' },
  cookingTime: 20,
  difficultyLevel: { value: 'easy', label: 'Easy' },
  servings: 2,
} as never;

const baseMetadata = {
  categoryFromInput: { value: 'soup', label: 'Soup' },
  difficultyLevelFromInput: { value: 'easy', label: 'Easy' },
  labelsFromInput: [{ value: 'quick', label: 'Quick' }],
  cuisineFromInput: undefined,
  servingUnitFromInput: undefined,
  dietaryFlagsFromInput: [],
  allergensFromInput: [],
  equipmentFromInput: [],
  costLevelFromInput: undefined,
  translationKeys: new Map<string, string>([
    [metadataLookupKey('CATEGORY', 'soup'), 'Leves'],
  ]),
} as never;

describe('assertPresent', () => {
  it('throws the given error type for null and undefined', () => {
    expect(() => assertPresent(null, 'missing', ErrorTypes.NOT_FOUND)).toThrow(
      'missing',
    );
    expect(() =>
      assertPresent(undefined, 'missing', ErrorTypes.NOT_FOUND),
    ).toThrow('missing');
  });

  it('keeps falsy but present values such as 0 and empty string', () => {
    expect(() => assertPresent(0, 'x', ErrorTypes.NOT_FOUND)).not.toThrow();
    expect(() => assertPresent('', 'x', ErrorTypes.NOT_FOUND)).not.toThrow();
  });
});

describe('validateRequiredFields', () => {
  it('passes when every required field is set', () => {
    expect(() => validateRequiredFields(baseInput)).not.toThrow();
  });

  it.each(['title', 'servings', 'cookingTime'] as const)(
    'throws BAD_REQUEST when %s is missing',
    (field) => {
      const input = { ...(baseInput as object), [field]: undefined } as never;

      expect(() => validateRequiredFields(input)).toThrow(
        'All required fields must be provided',
      );
    },
  );
});

describe('sanitizeRecipeInput', () => {
  it('sanitizes ingredient and step text and maps empty notes to undefined', () => {
    const result = sanitizeRecipeInput({
      ingredients: [
        { localId: 'i1', name: '<script>x</script>Salt', unit: 'g', note: '' },
        { localId: 'i2', name: 'Pepper', unit: 'g', note: 'fresh' },
      ],
      preparationSteps: [{ description: '<img src=x onerror=1>Boil' }],
    } as never);

    expect(result.ingredients[0].name).not.toContain('<script');
    expect(result.ingredients[0].note).toBeUndefined();
    expect(result.ingredients[1].note).toBe('fresh');
    expect(result.preparationSteps[0].description).not.toContain('onerror');
  });

  it('returns empty collections when ingredients and steps are missing', () => {
    const result = sanitizeRecipeInput({ title: 'Soup' } as never);

    expect(result.ingredients).toEqual([]);
    expect(result.preparationSteps).toEqual([]);
  });
});

describe('buildRecipeData', () => {
  it('translates known metadata keys and falls back to the input label', () => {
    const data = buildRecipeData(baseInput, baseMetadata);

    expect(data.category).toEqual({
      key: 'soup',
      label: 'Leves',
      type: 'CATEGORY',
    });
    expect(data.difficultyLevel).toEqual({
      key: 'easy',
      label: 'Easy',
      type: 'DIFFICULTY_LEVEL',
    });
    expect(data.labels).toEqual([
      { key: 'quick', label: 'Quick', type: 'LABEL' },
    ]);
  });

  it('sums the provided time parts into totalTimeMinutes', () => {
    const data = buildRecipeData(
      {
        ...(baseInput as object),
        prepTimeMinutes: 5,
        cookTimeMinutes: 10,
      } as never,
      baseMetadata,
    );

    expect(data.prepTimeMinutes).toBe(5);
    expect(data.cookTimeMinutes).toBe(10);
    expect(data.restTimeMinutes).toBeNull();
    expect(data.totalTimeMinutes).toBe(15);
  });

  it('leaves totalTimeMinutes null when no time part is given', () => {
    const data = buildRecipeData(baseInput, baseMetadata);

    expect(data.totalTimeMinutes).toBeNull();
    expect(data.prepTimeMinutes).toBeNull();
  });

  it('maps absent optional metadata to Prisma.DbNull', () => {
    const data = buildRecipeData(baseInput, baseMetadata);

    expect(data.servingUnit).toBe(Prisma.DbNull);
    expect(data.cuisine).toBe(Prisma.DbNull);
    expect(data.costLevel).toBe(Prisma.DbNull);
    expect(data.dietaryFlags).toEqual([]);
  });

  it('stores an empty slug as null', () => {
    const data = buildRecipeData(
      { ...(baseInput as object), slug: '' } as never,
      baseMetadata,
    );

    expect(data.slug).toBeNull();
  });

  it('maps present optional metadata with the matching type', () => {
    const data = buildRecipeData(baseInput, {
      ...(baseMetadata as object),
      cuisineFromInput: { value: 'hu', label: 'Hungarian' },
      servingUnitFromInput: { value: 'portion', label: 'Portion' },
      costLevelFromInput: { value: 'low', label: 'Low' },
      dietaryFlagsFromInput: [{ value: 'vegan', label: 'Vegan' }],
    } as never);

    expect(data.cuisine).toEqual({
      key: 'hu',
      label: 'Hungarian',
      type: 'CUISINE',
    });
    expect(data.servingUnit).toEqual({
      key: 'portion',
      label: 'Portion',
      type: 'SERVING_UNIT',
    });
    expect(data.costLevel).toEqual({
      key: 'low',
      label: 'Low',
      type: 'COST_LEVEL',
    });
    expect(data.dietaryFlags).toEqual([
      { key: 'vegan', label: 'Vegan', type: 'DIET' },
    ]);
  });

  it('normalises empty optional text fields to null', () => {
    const data = buildRecipeData(
      { ...(baseInput as object), tips: '', substitutions: '' } as never,
      baseMetadata,
    );

    expect(data.tips).toBeNull();
    expect(data.substitutions).toBeNull();
    expect(data.seoTitle).toBeNull();
    expect(data.socialImage).toBeNull();
  });

  it('keeps provided tips and substitutions text', () => {
    const data = buildRecipeData(
      {
        ...(baseInput as object),
        tips: 'Taste it',
        substitutions: 'Use honey',
      } as never,
      baseMetadata,
    );

    expect(data.tips).toBe('Taste it');
    expect(data.substitutions).toBe('Use honey');
  });
});
