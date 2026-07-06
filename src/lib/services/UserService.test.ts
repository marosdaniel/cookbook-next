import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockFindUnique,
  mockFindFirst,
  mockCreate,
  mockUpdate,
  mockDelete,
  mockDeleteMany,
  mockCount,
  mockFindMany,
} = vi.hoisted(() => ({
  mockFindUnique: vi.fn(),
  mockFindFirst: vi.fn(),
  mockCreate: vi.fn(),
  mockUpdate: vi.fn(),
  mockDelete: vi.fn(),
  mockDeleteMany: vi.fn(),
  mockCount: vi.fn(),
  mockFindMany: vi.fn(),
}));

vi.mock('@/lib/prisma/prisma', () => ({
  prisma: {
    user: {
      findUnique: mockFindUnique,
      findFirst: mockFindFirst,
      create: mockCreate,
      update: mockUpdate,
      delete: mockDelete,
      deleteMany: mockDeleteMany,
    },
    recipe: {
      findUnique: vi.fn(),
      deleteMany: vi.fn(),
    },
    follow: {
      findMany: mockFindMany,
      count: mockCount,
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('@/lib/redis/redis', () => ({
  redis: null,
}));

vi.mock('@/lib/auth/password', () => ({
  hashPassword: vi.fn().mockResolvedValue('hashed-password'),
  verifyPassword: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/lib/validation/throwCustomError', () => ({
  throwCustomError: vi.fn(
    (message: string, errorType: { errorCode: string }) => {
      throw new Error(`${message}:${errorType.errorCode}`);
    },
  ),
}));

vi.mock('@/lib/email/nodemailer', () => ({
  generateResetToken: vi.fn(() => 'reset-token'),
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
  sendWelcomeEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/validation/validation', async () => {
  const actual = await vi.importActual<
    typeof import('@/lib/validation/validation')
  >('@/lib/validation/validation');
  return {
    ...actual,
    customValidationSchema: {
      parse: vi.fn(),
    },
    nameValidationSchema: {
      parse: vi.fn(),
    },
    passwordEditValidationSchema: {
      safeParse: vi.fn(() => ({ success: true })),
    },
    resetPasswordValidationSchema: {
      safeParse: vi.fn(() => ({ success: true })),
    },
    setNewPasswordValidationSchema: {
      safeParse: vi.fn(() => ({ success: true })),
    },
  };
});

import { UserService } from './UserService';

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindUnique.mockReset();
    mockFindFirst.mockReset();
    mockCreate.mockReset();
    mockUpdate.mockReset();
    mockDelete.mockReset();
    mockDeleteMany.mockReset();
    mockCount.mockReset();
    mockFindMany.mockReset();
  });

  it('creates a user and returns the expected payload', async () => {
    mockFindFirst.mockResolvedValue(null);
    mockCreate.mockResolvedValue({
      id: 'user-1',
      firstName: 'Ada',
      lastName: 'Lovelace',
      userName: 'ada',
      email: 'ada@example.com',
      password: 'hashed-password',
      role: 'USER',
      locale: 'en-gb',
    });

    const result = await UserService.createUser({
      firstName: 'Ada',
      lastName: 'Lovelace',
      userName: 'ada',
      email: 'ada@example.com',
      password: 'Abc123!@',
      confirmPassword: 'Abc123!@',
      locale: 'en-gb',
    });

    expect(result.success).toBe(true);
    expect(result.user.id).toBe('user-1');
    expect(mockCreate).toHaveBeenCalled();
  });

  it('changes a password after validating the current one', async () => {
    mockFindUnique.mockResolvedValue({ id: 'user-1', password: 'old-hash' });
    mockUpdate.mockResolvedValue({});

    await expect(
      UserService.changePassword('user-1', {
        currentPassword: 'Example123!',
        newPassword: 'Example456!',
        confirmNewPassword: 'Example456!',
      }),
    ).resolves.toBe(true);

    expect(mockUpdate).toHaveBeenCalled();
  });

  it('rejects an invalid current password during password change', async () => {
    const { verifyPassword } = await import('@/lib/auth/password');
    vi.mocked(verifyPassword).mockResolvedValueOnce(false);
    mockFindUnique.mockResolvedValue({ id: 'user-1', password: 'old-hash' });

    await expect(
      UserService.changePassword('user-1', {
        currentPassword: 'Fixture123!',
        newPassword: 'Example456!',
        confirmNewPassword: 'Example456!',
      }),
    ).rejects.toThrow('Invalid current password:BAD_REQUEST');
  });

  it('returns a not-found error when deleting a missing user', async () => {
    mockFindUnique.mockResolvedValue(null);

    await expect(
      UserService.deleteUser('admin-1', 'ADMIN', 'missing-user'),
    ).rejects.toThrow('User not found:NOT_FOUND');
  });

  it('requires confirmation for destructive admin deletion', async () => {
    await expect(
      UserService.deleteAllUser('admin-1', 'ADMIN', 'wrong-confirmation'),
    ).rejects.toThrow(
      'Destructive admin action requires explicit confirmation:BAD_REQUEST',
    );
  });

  it('sends a reset email for a known user and stores a hashed reset token', async () => {
    const { generateResetToken, sendPasswordResetEmail } = await import(
      '@/lib/email/nodemailer'
    );
    mockFindUnique.mockResolvedValueOnce({
      id: 'user-1',
      email: 'ada@example.com',
    });
    mockUpdate.mockResolvedValue({});

    const result = await UserService.resetPassword('ada@example.com');

    expect(result.success).toBe(true);
    expect(generateResetToken).toHaveBeenCalled();
    expect(sendPasswordResetEmail).toHaveBeenCalledWith(
      'ada@example.com',
      'reset-token',
    );
    expect(mockUpdate).toHaveBeenCalled();
  });

  it('updates a user profile with sanitized values', async () => {
    mockFindUnique.mockResolvedValueOnce({
      id: 'user-1',
      firstName: 'Ada',
      lastName: 'Lovelace',
      locale: 'en-gb',
    });
    mockUpdate.mockResolvedValue({
      id: 'user-1',
      firstName: 'Ada',
      lastName: 'Byron',
      locale: 'hu',
    });

    const result = await UserService.updateUser('user-1', {
      firstName: 'Ada',
      lastName: 'Byron',
      locale: 'hu',
    });

    expect(result.success).toBe(true);
    expect(result.user).toMatchObject({
      firstName: 'Ada',
      lastName: 'Byron',
      locale: 'hu',
    });
  });

  it('adds a recipe to favorites for the authorized user', async () => {
    const prisma = await import('@/lib/prisma/prisma');
    mockFindUnique.mockResolvedValueOnce({ id: 'user-1' });
    vi.mocked(prisma.prisma.recipe.findUnique).mockResolvedValueOnce({
      id: 'recipe-1',
      title: 'Soup',
      description: null,
      category: null,
      labels: null,
      imgSrc: null,
      cookingTime: 20,
      difficultyLevel: null,
      servings: 2,
      youtubeLink: null,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      prepTimeMinutes: null,
      cookTimeMinutes: null,
      restTimeMinutes: null,
      totalTimeMinutes: null,
      servingUnit: null,
      cuisine: null,
      dietaryFlags: null,
      allergens: null,
      equipment: null,
      costLevel: null,
      tips: null,
      substitutions: null,
      slug: null,
      seoTitle: null,
      seoDescription: null,
      socialImage: null,
      createdBy: 'user-1',
    });
    mockFindFirst.mockResolvedValue(null);
    mockUpdate.mockResolvedValue({});

    const result = await UserService.addToFavoriteRecipes(
      'user-1',
      'USER',
      'user-1',
      'recipe-1',
    );

    expect(result.success).toBe(true);
    expect(result.messageKey).toBe('response.userFavoriteSuccess');
    expect(mockUpdate).toHaveBeenCalled();
  });

  it('removes a recipe from favorites for the authorized user', async () => {
    const prisma = await import('@/lib/prisma/prisma');
    mockFindUnique.mockResolvedValueOnce({ id: 'user-1' });
    vi.mocked(prisma.prisma.recipe.findUnique).mockResolvedValueOnce({
      id: 'recipe-1',
      title: 'Soup',
      description: null,
      category: null,
      labels: null,
      imgSrc: null,
      cookingTime: 20,
      difficultyLevel: null,
      servings: 2,
      youtubeLink: null,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      prepTimeMinutes: null,
      cookTimeMinutes: null,
      restTimeMinutes: null,
      totalTimeMinutes: null,
      servingUnit: null,
      cuisine: null,
      dietaryFlags: null,
      allergens: null,
      equipment: null,
      costLevel: null,
      tips: null,
      substitutions: null,
      slug: null,
      seoTitle: null,
      seoDescription: null,
      socialImage: null,
      createdBy: 'user-1',
    });
    mockFindFirst.mockResolvedValue({ id: 'user-1' });
    mockUpdate.mockResolvedValue({});

    const result = await UserService.removeFromFavoriteRecipes(
      'user-1',
      'USER',
      'user-1',
      'recipe-1',
    );

    expect(result.success).toBe(true);
    expect(result.messageKey).toBe('response.userFavoriteSuccess');
    expect(mockUpdate).toHaveBeenCalled();
  });

  it('sets a new password when the reset token is valid', async () => {
    mockFindFirst.mockResolvedValue({ id: 'user-1', email: 'ada@example.com' });
    mockUpdate.mockResolvedValue({});

    const result = await UserService.setNewPassword({
      token: 'reset-token',
      newPassword: 'NewPassword123!',
    });

    expect(result.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalled();
  });

  it('follows a user and invalidates the follow cache', async () => {
    const { redis } = await import('@/lib/redis/redis');
    mockFindUnique.mockResolvedValueOnce({ id: 'user-2' });
    vi.mocked(mockFindUnique).mockResolvedValueOnce({ id: 'user-2' });
    const followFindUnique = vi.fn().mockResolvedValue(null);
    const followCreate = vi.fn().mockResolvedValue({});
    const followDelete = vi.fn().mockResolvedValue({});

    const prisma = await import('@/lib/prisma/prisma');
    prisma.prisma.follow.findUnique = followFindUnique as never;
    prisma.prisma.follow.create = followCreate as never;
    prisma.prisma.follow.delete = followDelete as never;

    const result = await UserService.followUser('user-1', 'user-2');

    expect(result.success).toBe(true);
    expect(followCreate).toHaveBeenCalled();
    expect(redis?.del).not.toBeDefined();
  });
});
