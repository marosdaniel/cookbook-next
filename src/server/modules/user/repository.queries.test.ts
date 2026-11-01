import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    recipe: { findUnique: vi.fn() },
    follow: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock('@/lib/prisma/prisma', () => ({ prisma: prismaMock }));

import { DEFAULT_QUERY_MAX_LIMIT } from '@/server/platform/pagination';
import { UserRepository } from './repository';

describe('UserRepository CRUD and lookup methods', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('lookups', () => {
    it('findPublicById never selects the password', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });

      await UserRepository.findPublicById('u1');

      const args = prismaMock.user.findUnique.mock.calls[0][0];
      expect(args.where).toEqual({ id: 'u1' });
      expect(args.select).toHaveProperty('email');
      expect(args.select).not.toHaveProperty('password');
    });

    it('findById and findByEmail query by the given key', async () => {
      await UserRepository.findById('u1');
      await UserRepository.findByEmail('a@example.com');

      expect(prismaMock.user.findUnique).toHaveBeenNthCalledWith(1, {
        where: { id: 'u1' },
      });
      expect(prismaMock.user.findUnique).toHaveBeenNthCalledWith(2, {
        where: { email: 'a@example.com' },
      });
    });

    it('findByIdWithRecipeIdentifiers includes only recipe id and slug', async () => {
      await UserRepository.findByIdWithRecipeIdentifiers('u1');

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'u1' },
        include: { recipes: { select: { id: true, slug: true } } },
      });
    });

    it('findByUserNameOrEmailInsensitive matches either field case-insensitively', async () => {
      await UserRepository.findByUserNameOrEmailInsensitive(
        'Anna',
        'anna@example.com',
      );

      expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { userName: { equals: 'Anna', mode: 'insensitive' } },
            { email: { equals: 'anna@example.com', mode: 'insensitive' } },
          ],
        },
      });
    });
  });

  describe('favorites and follows', () => {
    it('findWithFavoriteRecipes falls back to the default limit', async () => {
      await UserRepository.findWithFavoriteRecipes('u1');

      const args = prismaMock.user.findUnique.mock.calls[0][0];
      expect(args.include.favoriteRecipes.take).toBe(DEFAULT_QUERY_MAX_LIMIT);
      expect(args.include.favoriteRecipes.orderBy).toEqual({
        createdAt: 'desc',
      });
    });

    it('findWithFavoriteRecipes uses the explicit limit when provided', async () => {
      await UserRepository.findWithFavoriteRecipes('u1', 3);

      const args = prismaMock.user.findUnique.mock.calls[0][0];
      expect(args.include.favoriteRecipes.take).toBe(3);
    });

    it('findFollowingAndCount runs the page and the count for the follower', async () => {
      prismaMock.follow.findMany.mockResolvedValue([]);
      prismaMock.follow.count.mockResolvedValue(0);

      const result = await UserRepository.findFollowingAndCount('u1', 5);

      expect(prismaMock.follow.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { followerId: 'u1' },
          take: 5,
        }),
      );
      expect(prismaMock.follow.count).toHaveBeenCalledWith({
        where: { followerId: 'u1' },
      });
      expect(result).toEqual([[], 0]);
    });

    it('findFollow, createFollow and deleteFollow use the composite key', async () => {
      await UserRepository.findFollow('a', 'b');
      await UserRepository.createFollow('a', 'b');
      await UserRepository.deleteFollow('a', 'b');

      const key = {
        followerId_followingId: { followerId: 'a', followingId: 'b' },
      };
      expect(prismaMock.follow.findUnique).toHaveBeenCalledWith({ where: key });
      expect(prismaMock.follow.create).toHaveBeenCalledWith({
        data: { followerId: 'a', followingId: 'b' },
      });
      expect(prismaMock.follow.delete).toHaveBeenCalledWith({ where: key });
    });

    it('connectFavoriteRecipe and disconnectFavoriteRecipe update the relation', async () => {
      await UserRepository.connectFavoriteRecipe('u1', 'r1');
      await UserRepository.disconnectFavoriteRecipe('u1', 'r1');

      expect(prismaMock.user.update).toHaveBeenNthCalledWith(1, {
        where: { id: 'u1' },
        data: { favoriteRecipes: { connect: { id: 'r1' } } },
      });
      expect(prismaMock.user.update).toHaveBeenNthCalledWith(2, {
        where: { id: 'u1' },
        data: { favoriteRecipes: { disconnect: { id: 'r1' } } },
      });
    });

    it('hasFavoriteRecipe returns true only when a matching user is found', async () => {
      prismaMock.user.findFirst.mockResolvedValueOnce({ id: 'u1' });
      prismaMock.user.findFirst.mockResolvedValueOnce(null);

      await expect(UserRepository.hasFavoriteRecipe('u1', 'r1')).resolves.toBe(
        true,
      );
      await expect(UserRepository.hasFavoriteRecipe('u1', 'r2')).resolves.toBe(
        false,
      );
      expect(prismaMock.user.findFirst).toHaveBeenNthCalledWith(1, {
        where: { id: 'u1', favoriteRecipes: { some: { id: 'r1' } } },
      });
    });
  });

  describe('writes', () => {
    it('createUser defaults the role to USER', async () => {
      await UserRepository.createUser({
        firstName: 'Anna',
        lastName: 'Kovacs',
        userName: 'anna_k',
        email: 'anna@example.com',
        password: 'hashed',
        locale: 'en-gb',
      });

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ role: 'USER' }),
      });
    });

    it('createUser keeps an explicitly provided role', async () => {
      await UserRepository.createUser({
        firstName: 'Anna',
        lastName: 'Kovacs',
        userName: 'anna_k',
        email: 'anna@example.com',
        password: 'hashed',
        locale: 'en-gb',
        role: 'ADMIN',
      } as Parameters<typeof UserRepository.createUser>[0]);

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ role: 'ADMIN' }),
      });
    });

    it('updatePasswordAndIncrementSession bumps sessionVersion and keeps the reset token by default', async () => {
      await UserRepository.updatePasswordAndIncrementSession('u1', 'hashed');

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { password: 'hashed', sessionVersion: { increment: 1 } },
      });
      const data = prismaMock.user.update.mock.calls[0][0].data;
      expect(data).not.toHaveProperty('resetPasswordToken');
    });

    it('updatePasswordAndIncrementSession clears the reset token when requested', async () => {
      await UserRepository.updatePasswordAndIncrementSession(
        'u1',
        'hashed',
        true,
      );

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: {
          password: 'hashed',
          sessionVersion: { increment: 1 },
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
      });
    });

    it('savePasswordResetToken stores the hashed token and its expiry by email', async () => {
      const expiresAt = new Date('2030-01-01T00:00:00Z');

      await UserRepository.savePasswordResetToken(
        'anna@example.com',
        'hashed-token',
        expiresAt,
      );

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { email: 'anna@example.com' },
        data: {
          resetPasswordToken: 'hashed-token',
          resetPasswordExpires: expiresAt,
        },
      });
    });

    it('findValidResetTokenUser only matches tokens that have not expired', async () => {
      await UserRepository.findValidResetTokenUser('hashed-token');

      expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
        where: {
          resetPasswordToken: 'hashed-token',
          resetPasswordExpires: { gt: expect.any(Date) },
        },
      });
    });

    it('updateProfile, deleteById and findRecipeById hit the matching Prisma calls', async () => {
      const profile = { firstName: 'Eva', lastName: 'Nagy', locale: 'hu-hu' };

      await UserRepository.updateProfile('u1', profile);
      await UserRepository.deleteById('u1');
      await UserRepository.findRecipeById('r1');

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: profile,
      });
      expect(prismaMock.user.delete).toHaveBeenCalledWith({
        where: { id: 'u1' },
      });
      expect(prismaMock.recipe.findUnique).toHaveBeenCalledWith({
        where: { id: 'r1' },
      });
    });
  });
});
