import { beforeEach, describe, expect, it, vi } from 'vitest';

const { store, fakeRedis, mockUserRepository, mockDeletionRepository } =
  vi.hoisted(() => {
    const entries = new Map<string, unknown>();
    return {
      store: entries,
      fakeRedis: {
        get: vi.fn(async (key: string) => entries.get(key) ?? null),
        setex: vi.fn(async (key: string, _ttl: number, value: unknown) => {
          entries.set(key, value);
          return 'OK';
        }),
        del: vi.fn(async (key: string) => {
          entries.delete(key);
          return 1;
        }),
        incr: vi.fn(async () => 1),
      },
      mockUserRepository: {
        findByIdWithRecipeIdentifiers: vi.fn(),
        deleteById: vi.fn(),
        deleteAllUsersExcept: vi.fn(),
        deleteAllRecipesExceptAuthor: vi.fn(),
      },
      mockDeletionRepository: {
        findRecipeIdentifiersNotAuthoredBy: vi.fn(),
        findUserIdsExcept: vi.fn(),
        deleteByIdWithAudit: vi.fn(),
      },
    };
  });

vi.mock('@/lib/prisma/prisma', () => ({ prisma: {} }));
vi.mock('@/lib/redis/redis', () => ({ redis: fakeRedis }));

vi.mock('@/lib/auth/password', () => ({
  hashPassword: vi.fn(),
  verifyPassword: vi.fn(),
}));

vi.mock('@/lib/email/nodemailer', () => ({
  generateResetToken: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  sendWelcomeEmail: vi.fn(),
}));

vi.mock('./repository', () => ({ UserRepository: mockUserRepository }));
vi.mock('./deletionRepository', () => ({
  DeletionRepository: mockDeletionRepository,
}));

import { cacheKeys } from '@/server/platform/cache';
import { AccountService } from './accountService';

const seed = (...keys: string[]) => {
  for (const key of keys) {
    store.set(key, 'cached');
  }
};

const stillCached = (keys: string[]) => keys.filter((key) => store.has(key));

describe('AccountService deletion cache invalidation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store.clear();
  });

  describe('deleteUser', () => {
    it('audits an admin deleting another account and clears every related cache entry', async () => {
      mockUserRepository.findByIdWithRecipeIdentifiers.mockResolvedValue({
        id: 'user-2',
        recipes: [
          { id: 'recipe-1', slug: 'soup' },
          { id: 'recipe-2', slug: null },
        ],
      });
      mockDeletionRepository.deleteByIdWithAudit.mockResolvedValue({
        id: 'user-2',
      });
      const keys = [
        cacheKeys.userRecipes('user-2', undefined),
        cacheKeys.userFavorites('user-2', undefined),
        cacheKeys.userFollowing('user-2', undefined),
        cacheKeys.sessionVersion('user-2'),
        cacheKeys.recipeDetail('recipe-1'),
        cacheKeys.recipeLookup('recipe-1'),
        cacheKeys.recipeLookup('soup'),
        cacheKeys.recipeDetail('recipe-2'),
        cacheKeys.recipeLookup('recipe-2'),
      ];
      seed(...keys);

      await expect(
        AccountService.deleteUser('admin-1', 'ADMIN', 'user-2'),
      ).resolves.toBe(true);

      expect(mockDeletionRepository.deleteByIdWithAudit).toHaveBeenCalledWith({
        actorId: 'admin-1',
        targetId: 'user-2',
        deletedRecipeCount: 2,
      });
      expect(mockUserRepository.deleteById).not.toHaveBeenCalled();
      expect(stillCached(keys)).toEqual([]);
      expect(fakeRedis.incr).toHaveBeenCalledWith(cacheKeys.recipeListVersion);
    });

    it('does not write an admin audit entry when a user deletes their own account', async () => {
      mockUserRepository.findByIdWithRecipeIdentifiers.mockResolvedValue({
        id: 'user-1',
        recipes: [],
      });
      mockUserRepository.deleteById.mockResolvedValue({ id: 'user-1' });
      seed(cacheKeys.sessionVersion('user-1'));

      await expect(
        AccountService.deleteUser('user-1', 'USER', 'user-1'),
      ).resolves.toBe(true);

      expect(mockUserRepository.deleteById).toHaveBeenCalledWith('user-1');
      expect(mockDeletionRepository.deleteByIdWithAudit).not.toHaveBeenCalled();
      expect(store.has(cacheKeys.sessionVersion('user-1'))).toBe(false);
      expect(fakeRedis.incr).not.toHaveBeenCalled();
    });
  });

  describe('deleteAllRecipes', () => {
    it('collects identifiers before deleting and clears recipe and author caches', async () => {
      mockDeletionRepository.findRecipeIdentifiersNotAuthoredBy.mockResolvedValue(
        [
          { id: 'recipe-1', slug: 'soup', createdBy: 'user-2' },
          { id: 'recipe-2', slug: null, createdBy: 'user-2' },
        ],
      );
      mockUserRepository.deleteAllRecipesExceptAuthor.mockResolvedValue({
        count: 2,
      });
      const keys = [
        cacheKeys.recipeDetail('recipe-1'),
        cacheKeys.recipeLookup('recipe-1'),
        cacheKeys.recipeLookup('soup'),
        cacheKeys.recipeDetail('recipe-2'),
        cacheKeys.recipeLookup('recipe-2'),
        cacheKeys.userRecipes('user-2', undefined),
      ];
      seed(...keys);

      await expect(
        AccountService.deleteAllRecipes('admin-1', 'ADMIN', 'DELETE_ALL'),
      ).resolves.toBe(2);

      const collectOrder =
        mockDeletionRepository.findRecipeIdentifiersNotAuthoredBy.mock
          .invocationCallOrder[0];
      const deleteOrder =
        mockUserRepository.deleteAllRecipesExceptAuthor.mock
          .invocationCallOrder[0];
      expect(collectOrder).toBeLessThan(deleteOrder);
      expect(stillCached(keys)).toEqual([]);
      expect(fakeRedis.incr).toHaveBeenCalledWith(cacheKeys.recipeListVersion);
    });
  });

  describe('deleteAllUser', () => {
    it('clears sessions, per-user lists and recipe caches of the deleted users', async () => {
      mockDeletionRepository.findRecipeIdentifiersNotAuthoredBy.mockResolvedValue(
        [{ id: 'recipe-1', slug: 'soup', createdBy: 'user-2' }],
      );
      mockDeletionRepository.findUserIdsExcept.mockResolvedValue([
        'user-2',
        'user-3',
      ]);
      mockUserRepository.deleteAllUsersExcept.mockResolvedValue({ count: 2 });
      const keys = [
        cacheKeys.sessionVersion('user-2'),
        cacheKeys.sessionVersion('user-3'),
        cacheKeys.userRecipes('user-2', undefined),
        cacheKeys.userFavorites('user-3', undefined),
        cacheKeys.recipeDetail('recipe-1'),
        cacheKeys.recipeLookup('soup'),
      ];
      seed(...keys);

      await expect(
        AccountService.deleteAllUser('admin-1', 'ADMIN', 'DELETE_ALL'),
      ).resolves.toBe(2);

      const collectOrder =
        mockDeletionRepository.findUserIdsExcept.mock.invocationCallOrder[0];
      const deleteOrder =
        mockUserRepository.deleteAllUsersExcept.mock.invocationCallOrder[0];
      expect(collectOrder).toBeLessThan(deleteOrder);
      expect(stillCached(keys)).toEqual([]);
      expect(fakeRedis.incr).toHaveBeenCalledWith(cacheKeys.recipeListVersion);
    });
  });
});
