import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RecipeEditInput } from '@/lib/graphql/generated/resolvers-types';
import type { GraphQLContext } from '@/types/graphql/context';

const mockResolveAuthenticatedUser = vi.fn();
const mockEditRecipe = vi.fn();
const mockNormalizeRecipeInput = vi.fn((input) => input);

vi.mock('@/lib/services/RecipeService', () => ({
  RecipeService: {
    editRecipe: mockEditRecipe,
  },
}));

vi.mock('../utils', () => ({
  normalizeRecipeInput: mockNormalizeRecipeInput,
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
    const recipeEditInput: RecipeEditInput = {
      title: 'Updated',
      ingredients: [],
      preparationSteps: [],
      category: { value: 'main', label: 'Main' },
      cookingTime: 30,
      difficultyLevel: { value: 'easy', label: 'Easy' },
      servings: 2,
    };
    const context: GraphQLContext = {
      role: 'USER',
      prisma: {} as GraphQLContext['prisma'],
      loaders: {} as GraphQLContext['loaders'],
    };

    const result = await editRecipe(
      {},
      { id: 'recipe-1', recipeEditInput },
      context,
    );

    expect(mockResolveAuthenticatedUser).toHaveBeenCalledWith(context);
    expect(mockEditRecipe).toHaveBeenCalledWith(
      'user-1',
      'USER',
      'recipe-1',
      recipeEditInput,
    );
    expect(result).toEqual({ id: 'recipe-1' });
  });
});
