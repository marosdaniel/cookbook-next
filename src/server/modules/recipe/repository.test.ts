import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/prisma/prisma', () => ({
  prisma: {},
}));

import { buildWhereClause } from './repository';

describe('RecipeRepository buildWhereClause', () => {
  it('maps all filter keys including cuisine, costLevel, dietaryFlags, allergens, and equipment', () => {
    const where = buildWhereClause({
      categoryKey: 'main-course',
      difficultyLevelKey: 'easy',
      cuisineKey: 'italian',
      costLevelKey: 'budget',
      labelKeys: ['quick'],
      dietaryFlagKeys: ['vegan'],
      allergenKeys: ['gluten-free'],
      equipmentKeys: ['oven'],
      maxCookingTime: 45,
    });

    expect(where).toEqual({
      category: { path: ['key'], equals: 'main-course' },
      difficultyLevel: { path: ['key'], equals: 'easy' },
      cuisine: { path: ['key'], equals: 'italian' },
      costLevel: { path: ['key'], equals: 'budget' },
      labels: { array_contains: [{ key: 'quick' }] },
      dietaryFlags: { array_contains: [{ key: 'vegan' }] },
      allergens: { array_contains: [{ key: 'gluten-free' }] },
      equipment: { array_contains: [{ key: 'oven' }] },
      cookingTime: { lte: 45 },
    });
  });
});
