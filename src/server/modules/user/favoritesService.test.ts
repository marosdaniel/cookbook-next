import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockUserRepository, mockInvalidateCacheScope } = vi.hoisted(() => ({
  mockUserRepository: {
    findWithFavoriteRecipes: vi.fn(),
    findById: vi.fn(),
    findRecipeById: vi.fn(),
    hasFavoriteRecipe: vi.fn(),
    connectFavoriteRecipe: vi.fn(),
    disconnectFavoriteRecipe: vi.fn(),
  },
  mockInvalidateCacheScope: vi.fn(),
}));

vi.mock('./repository', () => ({ UserRepository: mockUserRepository }));

vi.mock('@/server/platform/cache', () => ({
  cached: vi.fn(async ({ load }: { load: () => Promise<unknown> }) => load()),
  cacheKeys: { userFavorites: (userId: string) => `favorites:${userId}` },
  DETAIL_CACHE_TTL_SECONDS: 60,
  invalidateCacheScope: mockInvalidateCacheScope,
}));

import { FavoritesService } from './favoritesService';

const OWNER_ID = 'user-1';
const OTHER_ID = 'user-2';
const RECIPE_ID = 'recipe-1';

describe('FavoritesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserRepository.findById.mockResolvedValue({ id: OWNER_ID });
    mockUserRepository.findRecipeById.mockResolvedValue({ id: RECIPE_ID });
    mockUserRepository.hasFavoriteRecipe.mockResolvedValue(false);
  });

  describe('getFavoriteRecipes', () => {
    it('returns all favorites when no limit is given', async () => {
      const favorites = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
      mockUserRepository.findWithFavoriteRecipes.mockResolvedValue({
        favoriteRecipes: favorites,
      });

      await expect(
        FavoritesService.getFavoriteRecipes(OWNER_ID),
      ).resolves.toEqual(favorites);
    });

    it('applies the requested limit on read', async () => {
      mockUserRepository.findWithFavoriteRecipes.mockResolvedValue({
        favoriteRecipes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
      });

      await expect(
        FavoritesService.getFavoriteRecipes(OWNER_ID, 2),
      ).resolves.toEqual([{ id: 'a' }, { id: 'b' }]);
    });

    it('throws NOT_FOUND when the user does not exist', async () => {
      mockUserRepository.findWithFavoriteRecipes.mockResolvedValue(null);

      await expect(
        FavoritesService.getFavoriteRecipes(OWNER_ID),
      ).rejects.toMatchObject({
        extensions: { code: 'NOT_FOUND' },
      });
    });
  });

  describe('addToFavoriteRecipes', () => {
    it('adds the recipe and invalidates the favorites cache', async () => {
      const result = await FavoritesService.addToFavoriteRecipes(
        OWNER_ID,
        'USER',
        OWNER_ID,
        RECIPE_ID,
      );

      expect(result.isOk()).toBe(true);
      expect(mockUserRepository.connectFavoriteRecipe).toHaveBeenCalledWith(
        OWNER_ID,
        RECIPE_ID,
      );
      expect(mockInvalidateCacheScope).toHaveBeenCalledWith({
        favoriteUserId: OWNER_ID,
      });
    });

    it('lets an admin add favorites for another user', async () => {
      const result = await FavoritesService.addToFavoriteRecipes(
        'admin-1',
        'ADMIN',
        OTHER_ID,
        RECIPE_ID,
      );

      expect(result.isOk()).toBe(true);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(OTHER_ID);
    });

    it('rejects a non-admin acting on another user', async () => {
      const result = await FavoritesService.addToFavoriteRecipes(
        OWNER_ID,
        'USER',
        OTHER_ID,
        RECIPE_ID,
      );

      expect(result._unsafeUnwrapErr()).toMatchObject({
        code: 'FORBIDDEN',
        reason: 'UNAUTHORIZED',
      });
      expect(mockUserRepository.connectFavoriteRecipe).not.toHaveBeenCalled();
    });

    it('returns USER_NOT_FOUND when the target user is missing', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const result = await FavoritesService.addToFavoriteRecipes(
        OWNER_ID,
        'USER',
        OWNER_ID,
        RECIPE_ID,
      );

      expect(result._unsafeUnwrapErr()).toMatchObject({
        code: 'NOT_FOUND',
        reason: 'USER_NOT_FOUND',
      });
    });

    it('returns RECIPE_NOT_FOUND when the recipe is missing', async () => {
      mockUserRepository.findRecipeById.mockResolvedValue(null);

      const result = await FavoritesService.addToFavoriteRecipes(
        OWNER_ID,
        'USER',
        OWNER_ID,
        RECIPE_ID,
      );

      expect(result._unsafeUnwrapErr()).toMatchObject({
        code: 'NOT_FOUND',
        reason: 'RECIPE_NOT_FOUND',
      });
    });

    it('returns ALREADY_FAVORITE when the recipe is already saved', async () => {
      mockUserRepository.hasFavoriteRecipe.mockResolvedValue(true);

      const result = await FavoritesService.addToFavoriteRecipes(
        OWNER_ID,
        'USER',
        OWNER_ID,
        RECIPE_ID,
      );

      expect(result._unsafeUnwrapErr()).toMatchObject({
        code: 'BAD_REQUEST',
        reason: 'ALREADY_FAVORITE',
      });
      expect(mockUserRepository.connectFavoriteRecipe).not.toHaveBeenCalled();
      expect(mockInvalidateCacheScope).not.toHaveBeenCalled();
    });
  });

  describe('removeFromFavoriteRecipes', () => {
    beforeEach(() => {
      mockUserRepository.hasFavoriteRecipe.mockResolvedValue(true);
    });

    it('removes the recipe and invalidates the favorites cache', async () => {
      const result = await FavoritesService.removeFromFavoriteRecipes(
        OWNER_ID,
        'USER',
        OWNER_ID,
        RECIPE_ID,
      );

      expect(result.isOk()).toBe(true);
      expect(mockUserRepository.disconnectFavoriteRecipe).toHaveBeenCalledWith(
        OWNER_ID,
        RECIPE_ID,
      );
      expect(mockInvalidateCacheScope).toHaveBeenCalledWith({
        favoriteUserId: OWNER_ID,
      });
    });

    it('lets an admin remove favorites for another user', async () => {
      const result = await FavoritesService.removeFromFavoriteRecipes(
        'admin-1',
        'ADMIN',
        OTHER_ID,
        RECIPE_ID,
      );

      expect(result.isOk()).toBe(true);
    });

    it('rejects a non-admin acting on another user', async () => {
      const result = await FavoritesService.removeFromFavoriteRecipes(
        OWNER_ID,
        'USER',
        OTHER_ID,
        RECIPE_ID,
      );

      expect(result._unsafeUnwrapErr()).toMatchObject({
        code: 'FORBIDDEN',
        reason: 'UNAUTHORIZED',
      });
      expect(
        mockUserRepository.disconnectFavoriteRecipe,
      ).not.toHaveBeenCalled();
    });

    it('returns USER_NOT_FOUND when the target user is missing', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const result = await FavoritesService.removeFromFavoriteRecipes(
        OWNER_ID,
        'USER',
        OWNER_ID,
        RECIPE_ID,
      );

      expect(result._unsafeUnwrapErr()).toMatchObject({
        reason: 'USER_NOT_FOUND',
      });
    });

    it('returns RECIPE_NOT_FOUND when the recipe is missing', async () => {
      mockUserRepository.findRecipeById.mockResolvedValue(null);

      const result = await FavoritesService.removeFromFavoriteRecipes(
        OWNER_ID,
        'USER',
        OWNER_ID,
        RECIPE_ID,
      );

      expect(result._unsafeUnwrapErr()).toMatchObject({
        reason: 'RECIPE_NOT_FOUND',
      });
    });

    it('returns NOT_IN_FAVORITES when the recipe is not saved', async () => {
      mockUserRepository.hasFavoriteRecipe.mockResolvedValue(false);

      const result = await FavoritesService.removeFromFavoriteRecipes(
        OWNER_ID,
        'USER',
        OWNER_ID,
        RECIPE_ID,
      );

      expect(result._unsafeUnwrapErr()).toMatchObject({
        code: 'BAD_REQUEST',
        reason: 'NOT_IN_FAVORITES',
      });
      expect(
        mockUserRepository.disconnectFavoriteRecipe,
      ).not.toHaveBeenCalled();
    });
  });
});
