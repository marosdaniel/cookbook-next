import { describe, expect, it, vi } from 'vitest';

import { ErrorTypes } from '@/lib/validation/errorCatalog';

import {
  assertPresent,
  buildRecipeData,
  normalizeRecipeInput,
  resolveAuthenticatedUser,
  resolveRecipeMetadata,
  validateRequiredFields,
} from './utils';

vi.mock('@/lib/prisma/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/lib/services/MetadataService', () => ({
  MetadataService: {
    getTranslationKeyLookup: vi.fn(
      async () =>
        new Map([
          ['CATEGORY:main', 'category-main-course'],
          ['DIFFICULTY_LEVEL:easy', 'difficulty-easy'],
        ]),
    ),
  },
  metadataLookupKey: (type: string, key: string) => `${type}:${key}`,
}));

vi.mock('@/lib/validation/throwCustomError', () => ({
  throwCustomError: vi.fn((message: string, errorType: string) => {
    throw new Error(`${message}:${errorType}`);
  }),
}));

describe('recipe resolver utils', () => {
  it('assertPresent throws a custom error when a value is missing', () => {
    expect(() =>
      assertPresent(null, 'Missing', ErrorTypes.BAD_REQUEST),
    ).toThrow('Missing');
  });

  it('validateRequiredFields throws when required fields are missing', () => {
    expect(() =>
      validateRequiredFields({
        title: '',
        ingredients: [],
        preparationSteps: [],
        category: undefined as never,
        cookingTime: 0,
        difficultyLevel: undefined as never,
        servings: 0,
      }),
    ).toThrow('All required fields must be provided');
  });

  it('resolveRecipeMetadata returns the expected metadata payload', async () => {
    const metadata = await resolveRecipeMetadata({
      category: { value: 'main', label: 'Main' },
      difficultyLevel: { value: 'easy', label: 'Easy' },
      labels: [{ value: 'vegan', label: 'Vegan' }],
      cuisine: { value: 'italian', label: 'Italian' },
      servingUnit: { value: 'person', label: 'Person' },
      dietaryFlags: [{ value: 'vegan', label: 'Vegan' }],
      allergens: [{ value: 'milk', label: 'Milk' }],
      equipment: [{ value: 'oven', label: 'Oven' }],
      costLevel: { value: 'low', label: 'Low' },
    } as never);

    expect(metadata).toMatchObject({
      categoryFromInput: { value: 'main', label: 'Main' },
      difficultyLevelFromInput: { value: 'easy', label: 'Easy' },
      labelsFromInput: [{ value: 'vegan', label: 'Vegan' }],
    });
  });

  it('buildRecipeData maps metadata and sanitizes text fields', () => {
    const data = buildRecipeData(
      {
        title: '  Pasta  ',
        description: '  Tasty  ',
        ingredients: [
          { localId: '1', name: 'Pasta', quantity: 100, unit: 'g' },
        ],
        preparationSteps: [
          { localId: 'step-1', description: 'Boil', order: 1 },
        ],
        category: { value: 'main', label: 'Main' },
        difficultyLevel: { value: 'easy', label: 'Easy' },
        cookingTime: 20,
        servings: 2,
        prepTimeMinutes: 5,
        cookTimeMinutes: 10,
        restTimeMinutes: 3,
        tips: '  tip  ',
        substitutions: '  alt  ',
        slug: '  pasta-slug  ',
        seoTitle: '  Nice title  ',
        seoDescription: '  Nice description  ',
        socialImage: 'https://example.com/image.png',
      },
      {
        categoryFromInput: { value: 'main', label: 'Main' },
        difficultyLevelFromInput: { value: 'easy', label: 'Easy' },
        labelsFromInput: [
          { value: 'vegan', label: 'Vegan' },
          { value: 'custom', label: 'Custom label' },
        ],
        cuisineFromInput: undefined,
        servingUnitFromInput: undefined,
        dietaryFlagsFromInput: [],
        allergensFromInput: [],
        equipmentFromInput: [],
        costLevelFromInput: undefined,
        translationKeys: new Map([
          ['CATEGORY:main', 'category-main-course'],
          ['DIFFICULTY_LEVEL:easy', 'difficulty-easy'],
          ['LABEL:vegan', 'label-vegan'],
        ]),
      },
    );

    expect(data.title).toBe('Pasta');
    expect(data.description).toBe('Tasty');
    expect(data.totalTimeMinutes).toBe(18);
    expect(data.slug).toBe('pasta-slug');
    expect(data.tips).toBe('tip');
    expect(data.substitutions).toBe('alt');
    expect(data.seoTitle).toBe('Nice title');
    expect(data.seoDescription).toBe('Nice description');
    expect(data.category).toEqual({
      key: 'main',
      label: 'category-main-course',
      type: 'CATEGORY',
    });
    expect(data.difficultyLevel).toEqual({
      key: 'easy',
      label: 'difficulty-easy',
      type: 'DIFFICULTY_LEVEL',
    });
    expect(data.labels).toEqual([
      { key: 'vegan', label: 'label-vegan', type: 'LABEL' },
      { key: 'custom', label: 'Custom label', type: 'LABEL' },
    ]);
  });

  it('resolveAuthenticatedUser throws when context user is missing', async () => {
    await expect(
      resolveAuthenticatedUser({ userId: undefined } as never),
    ).rejects.toMatchObject({
      message: expect.stringContaining('Unauthenticated'),
    });
  });

  it('resolveAuthenticatedUser returns the user when found', async () => {
    const { prisma } = await import('@/lib/prisma/prisma');
    const mockUser = {
      id: 'u1',
      firstName: '',
      lastName: '',
      userName: '',
      email: '',
      password: '',
      locale: '',
      role: 'ADMIN' as const,
      sessionVersion: 0,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
    await expect(
      resolveAuthenticatedUser({ userId: 'u1' } as never),
    ).resolves.toEqual(mockUser);
  });

  describe('normalizeRecipeInput', () => {
    const baseInput = {
      title: 'Soup',
      description: null,
      ingredients: [
        { name: 'Water', quantity: 1, unit: 'l', isOptional: null, note: null },
      ],
      preparationSteps: [{ description: 'Boil', order: 1 }],
      category: { value: 'main', label: 'Main' },
      labels: null,
      cookingTime: 20,
      difficultyLevel: { value: 'easy', label: 'Easy' },
      servings: 2,
      imgSrc: null,
      youtubeLink: null,
      dietaryFlags: null,
      allergens: null,
      equipment: null,
      costLevel: null,
      tips: null,
      substitutions: null,
      slug: null,
      seoTitle: null,
      seoDescription: null,
      socialImage: null,
    };

    it('replaces nullable optional fields with undefined', () => {
      const result = normalizeRecipeInput(baseInput as never);

      expect(result.description).toBeUndefined();
      expect(result.labels).toBeUndefined();
      expect(result.imgSrc).toBeUndefined();
      expect(result.youtubeLink).toBeUndefined();
      expect(result.dietaryFlags).toBeUndefined();
      expect(result.tips).toBeUndefined();
      expect(result.slug).toBeUndefined();
      expect(result.ingredients).toEqual([
        {
          name: 'Water',
          quantity: 1,
          unit: 'l',
          isOptional: undefined,
          note: undefined,
        },
      ]);
    });

    it('keeps provided values and maps metadata lists', () => {
      const result = normalizeRecipeInput({
        ...baseInput,
        description: 'Warm',
        labels: [{ value: 'vegan', label: 'Vegan' }],
        allergens: [{ value: 'milk', label: 'Milk' }],
        tips: 'Season well',
      } as never);

      expect(result.description).toBe('Warm');
      expect(result.labels).toEqual([{ value: 'vegan', label: 'Vegan' }]);
      expect(result.allergens).toEqual([{ value: 'milk', label: 'Milk' }]);
      expect(result.tips).toBe('Season well');
    });

    it('throws when an ingredient entry is missing', () => {
      expect(() =>
        normalizeRecipeInput({
          ...baseInput,
          ingredients: [null],
        } as never),
      ).toThrow('Ingredient 1 must be provided');
    });

    it('throws when a preparation step entry is missing', () => {
      expect(() =>
        normalizeRecipeInput({
          ...baseInput,
          preparationSteps: [{ description: 'Boil', order: 1 }, null],
        } as never),
      ).toThrow('Preparation step 2 must be provided');
    });

    it('throws when a label entry is missing', () => {
      expect(() =>
        normalizeRecipeInput({
          ...baseInput,
          labels: [null],
        } as never),
      ).toThrow('Label item 1 must be provided');
    });
  });
});
