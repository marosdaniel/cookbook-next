import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockResolveAuthenticatedUser = vi.fn();
const mockEditRecipe = vi.fn();

vi.mock('@/lib/services/RecipeService', () => ({
  RecipeService: {
    editRecipe: mockEditRecipe,
  },
}));

vi.mock('../utils', () => ({
  resolveAuthenticatedUser: mockResolveAuthenticatedUser,
}));

describe('editRecipe resolver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates to the recipe service with the authenticated user and role', async () => {
    mockResolveAuthenticatedUser.mockResolvedValue({ id: 'user-1' });
    mockEditRecipe.mockResolvedValue({ id: 'recipe-1' });

    const { editRecipe } = await import('./editRecipe');

    const result = await editRecipe(
      {},
      { id: 'recipe-1', recipeEditInput: { title: 'Updated' } },
      { role: 'USER' } as never,
    );

    expect(mockResolveAuthenticatedUser).toHaveBeenCalledWith({ role: 'USER' });
    expect(mockEditRecipe).toHaveBeenCalledWith(
      'user-1',
      'USER',
      'recipe-1',
      { title: 'Updated' },
    );
    expect(result).toEqual({ id: 'recipe-1' });
  });
});
