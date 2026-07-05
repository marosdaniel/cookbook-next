import { describe, expect, it, vi } from 'vitest';

import { ErrorTypes } from '@/lib/validation/errorCatalog';

import {
  assertPresent,
  buildRecipeData,
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

vi.mock('@/lib/validation/throwCustomError', () => ({
  throwCustomError: vi.fn((message: string, errorType: string) => {
    throw new Error(`${message}:${errorType}`);
  }),
}));

describe('recipe resolver utils', () => {
  it('assertPresent throws a custom error when a value is missing', () => {
    expect(() => assertPresent(null, 'Missing', ErrorTypes.BAD_REQUEST)).toThrow('Missing');
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
        ingredients: [{ localId: '1', name: 'Pasta', quantity: 100, unit: 'g' }],
        preparationSteps: [{ description: 'Boil', order: 1 }],
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
      } ,
      {
        categoryFromInput: { value: 'main', label: 'Main' },
        difficultyLevelFromInput: { value: 'easy', label: 'Easy' },
        labelsFromInput: [],
        cuisineFromInput: undefined,
        servingUnitFromInput: undefined,
        dietaryFlagsFromInput: [],
        allergensFromInput: [],
        equipmentFromInput: [],
        costLevelFromInput: undefined,
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
  });

  it('resolveAuthenticatedUser throws when context user is missing', async () => {
    await expect(resolveAuthenticatedUser({ userId: undefined } as never)).rejects.toThrow('Unauthenticated');
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
      resetPasswordToken: null,
      resetPasswordExpires: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
    await expect(resolveAuthenticatedUser({ userId: 'u1' } as never)).resolves.toEqual(mockUser);
  });
});
