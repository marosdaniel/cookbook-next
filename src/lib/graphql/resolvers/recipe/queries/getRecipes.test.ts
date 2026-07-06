import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGetRecipes } = vi.hoisted(() => ({
  mockGetRecipes: vi.fn(),
}));

vi.mock('@/lib/services/RecipeService', () => ({
  RecipeService: {
    getRecipes: mockGetRecipes,
  },
}));

import { getRecipes } from './getRecipes';

describe('getRecipes resolver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates recipe listing to the recipe service', async () => {
    mockGetRecipes.mockResolvedValue({ recipes: [], totalRecipes: 0 });

    const result = await getRecipes({}, { limit: 5 });

    expect(mockGetRecipes).toHaveBeenCalledWith(5, undefined);
    expect(result).toEqual({ recipes: [], totalRecipes: 0 });
  });
});
