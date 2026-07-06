import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGetRecipeBySlugOrId } = vi.hoisted(() => ({
  mockGetRecipeBySlugOrId: vi.fn(),
}));

vi.mock('@/lib/services/RecipeService', () => ({
  RecipeService: {
    getRecipeBySlugOrId: mockGetRecipeBySlugOrId,
  },
}));

import { getRecipeById } from './getRecipeById';

describe('getRecipeById resolver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates the lookup to the recipe service', async () => {
    mockGetRecipeBySlugOrId.mockResolvedValue({ id: 'recipe-1' });

    const result = await getRecipeById({}, { id: 'recipe-1' });

    expect(mockGetRecipeBySlugOrId).toHaveBeenCalledWith('recipe-1');
    expect(result).toEqual({ id: 'recipe-1' });
  });
});
