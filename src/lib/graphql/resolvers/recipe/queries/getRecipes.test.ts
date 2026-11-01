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

    expect(mockGetRecipes).toHaveBeenCalledWith(5, undefined, undefined);
    expect(result).toEqual({ recipes: [], totalRecipes: 0 });
  });

  it('forwards filter and cursor arguments to the recipe service', async () => {
    mockGetRecipes.mockResolvedValue({ recipes: [], totalRecipes: 0 });
    const filter = { category: 'main' };

    await getRecipes({}, { limit: 10, after: 'cursor-1', filter } as never);

    expect(mockGetRecipes).toHaveBeenCalledWith(10, filter, 'cursor-1');
  });

  it('passes undefined for omitted arguments', async () => {
    mockGetRecipes.mockResolvedValue({ recipes: [], totalRecipes: 0 });

    await getRecipes({}, {});

    expect(mockGetRecipes).toHaveBeenCalledWith(
      undefined,
      undefined,
      undefined,
    );
  });
});
