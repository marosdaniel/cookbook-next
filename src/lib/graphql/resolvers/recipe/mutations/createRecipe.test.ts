import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GraphQLContext } from '@/types/graphql/context';
import type { RecipeCreateInput } from '../types';
import { createRecipe } from './createRecipe';

const { mockResolveAuthenticatedUser, mockCreateRecipe } = vi.hoisted(() => ({
  mockResolveAuthenticatedUser: vi.fn(),
  mockCreateRecipe: vi.fn(),
}));

vi.mock('@/lib/services/RecipeService', () => ({
  RecipeService: {
    createRecipe: mockCreateRecipe,
  },
}));

vi.mock('../utils', () => ({
  resolveAuthenticatedUser: mockResolveAuthenticatedUser,
}));

describe('createRecipe resolver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('resolves the authenticated user and delegates recipe creation', async () => {
    mockResolveAuthenticatedUser.mockResolvedValue({ id: 'user-1' });
    mockCreateRecipe.mockResolvedValue({ id: 'recipe-1' });

    const recipeCreateInput: RecipeCreateInput = {
      title: 'Soup',
      ingredients: [],
      preparationSteps: [],
      category: { value: 'main', label: 'Main' },
      cookingTime: 20,
      difficultyLevel: { value: 'easy', label: 'Easy' },
      servings: 2,
    };
    const context: GraphQLContext = {
      userId: 'user-1',
      prisma: {} as GraphQLContext['prisma'],
      loaders: {} as GraphQLContext['loaders'],
    };

    const result = await createRecipe({}, { recipeCreateInput }, context);

    expect(mockResolveAuthenticatedUser).toHaveBeenCalled();
    expect(mockCreateRecipe).toHaveBeenCalledWith('user-1', recipeCreateInput);
    expect(result).toEqual({ id: 'recipe-1' });
  });
});
