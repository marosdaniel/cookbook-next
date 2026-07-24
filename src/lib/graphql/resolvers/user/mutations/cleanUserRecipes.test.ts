import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockThrowCustomError } = vi.hoisted(() => ({
  mockThrowCustomError: vi.fn(),
}));

vi.mock('@/lib/validation/throwCustomError', () => ({
  throwCustomError: mockThrowCustomError,
}));

import { cleanUserRecipes } from './cleanUserRecipes';

describe('cleanUserRecipes resolver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws a not-found error when the requested user does not exist', async () => {
    mockThrowCustomError.mockImplementation(() => {
      throw new Error('not-found');
    });

    const prisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
    };

    await expect(
      cleanUserRecipes({}, { userId: 'user-1' }, {
        prisma,
      } as never),
    ).rejects.toThrow('not-found');

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      include: { recipes: true },
    });
    expect(mockThrowCustomError).toHaveBeenCalled();
  });

  it('returns true when the user exists and the cleanup check passes', async () => {
    const prisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue({ id: 'user-1', recipes: [] }),
      },
    };

    const result = await cleanUserRecipes({}, { userId: 'user-1' }, {
      prisma,
    } as never);

    expect(result).toBe(true);
  });
});
