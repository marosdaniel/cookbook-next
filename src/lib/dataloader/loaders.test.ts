import { describe, expect, it, vi } from 'vitest';
import {
  createRecipeAuthorLoader,
  createUserFavoriteRecipesLoader,
  createUserRecipesLoader,
} from './loaders';

describe('data loaders', () => {
  it('batches recipe author lookups into a single query', async () => {
    const findMany = vi.fn().mockResolvedValue([
      { id: 'user-1', firstName: 'Ada', lastName: 'Lovelace', userName: 'ada' },
      {
        id: 'user-2',
        firstName: 'Grace',
        lastName: 'Hopper',
        userName: 'grace',
      },
    ]);

    const prisma = {
      user: { findMany },
    } as never;

    const loader = createRecipeAuthorLoader(prisma);

    const [firstAuthor, secondAuthor] = await Promise.all([
      loader.load('user-1'),
      loader.load('user-2'),
    ]);

    expect(findMany).toHaveBeenCalledTimes(1);
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { in: ['user-1', 'user-2'] } },
        select: { id: true, firstName: true, lastName: true, userName: true },
      }),
    );
    expect(firstAuthor?.id).toBe('user-1');
    expect(secondAuthor?.id).toBe('user-2');
  });

  it('batches user recipe lists into a single query', async () => {
    const findMany = vi.fn().mockResolvedValue([
      {
        id: 'user-1',
        recipes: [
          { id: 'recipe-1', createdBy: 'user-1' },
          { id: 'recipe-2', createdBy: 'user-1' },
        ],
      },
      { id: 'user-2', recipes: [] },
    ]);

    const prisma = {
      user: { findMany },
    } as never;

    const loader = createUserRecipesLoader(prisma);

    const [firstRecipes, secondRecipes] = await Promise.all([
      loader.load('user-1'),
      loader.load('user-2'),
    ]);

    expect(findMany).toHaveBeenCalledTimes(1);
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { in: ['user-1', 'user-2'] } },
      }),
    );
    expect(firstRecipes).toHaveLength(2);
    expect(secondRecipes).toHaveLength(0);
  });

  it('batches favorite recipe lists into a single query', async () => {
    const findMany = vi.fn().mockResolvedValue([
      {
        id: 'user-1',
        favoriteRecipes: [{ id: 'recipe-1', createdBy: 'user-1' }],
      },
      { id: 'user-2', favoriteRecipes: [] },
    ]);

    const prisma = {
      user: { findMany },
    } as never;

    const loader = createUserFavoriteRecipesLoader(prisma);

    const [firstRecipes, secondRecipes] = await Promise.all([
      loader.load('user-1'),
      loader.load('user-2'),
    ]);

    expect(findMany).toHaveBeenCalledTimes(1);
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { in: ['user-1', 'user-2'] } },
      }),
    );
    expect(firstRecipes).toHaveLength(1);
    expect(secondRecipes).toHaveLength(0);
  });
});
