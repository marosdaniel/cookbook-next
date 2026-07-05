import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockResolveAuthenticatedUser = vi.fn();
const mockDeleteRecipe = vi.fn();

vi.mock('@/lib/services/RecipeService', () => ({
  RecipeService: {
    deleteRecipe: mockDeleteRecipe,
  },
}));

vi.mock('../utils', () => ({
  resolveAuthenticatedUser: mockResolveAuthenticatedUser,
}));

describe('deleteRecipe resolver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates to the recipe service with the authenticated user and role', async () => {
    mockResolveAuthenticatedUser.mockResolvedValue({ id: 'user-1' });
    mockDeleteRecipe.mockResolvedValue(true);

    const { deleteRecipe } = await import('./deleteRecipe');

    const result = await deleteRecipe({}, { id: 'recipe-1' }, {
      role: 'ADMIN',
    } as never);

    expect(mockResolveAuthenticatedUser).toHaveBeenCalledWith({
      role: 'ADMIN',
    });
    expect(mockDeleteRecipe).toHaveBeenCalledWith(
      'user-1',
      'ADMIN',
      'recipe-1',
    );
    expect(result).toBe(true);
  });
});
