import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGetRecipeById } = vi.hoisted(() => ({
  mockGetRecipeById: vi.fn(),
}));

vi.mock('@/lib/services/RecipeService', () => ({
  RecipeService: {
    getRecipeById: mockGetRecipeById,
  },
}));

import { getRecipeById } from './getRecipeById';

describe('getRecipeById resolver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates the lookup to the recipe service', async () => {
    mockGetRecipeById.mockResolvedValue({ id: 'recipe-1' });

    const result = await getRecipeById({}, { id: 'recipe-1' });

    expect(mockGetRecipeById).toHaveBeenCalledWith('recipe-1');
    expect(result).toEqual({ id: 'recipe-1' });
  });
});
