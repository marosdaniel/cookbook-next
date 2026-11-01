import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockUser } = vi.hoisted(() => ({
  mockUser: {
    count: vi.fn(),
    groupBy: vi.fn(),
    findMany: vi.fn(),
  },
}));

vi.mock('@/lib/prisma/prisma', () => ({
  prisma: { user: mockUser },
}));

import {
  REGISTRATION_SAMPLE_LIMIT,
  UserInsightsRepository,
} from './userInsightsRepository';

describe('UserInsightsRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('count forwards the optional where clause', async () => {
    mockUser.count.mockResolvedValue(42);
    const since = new Date('2024-01-01');

    await expect(
      UserInsightsRepository.count({ createdAt: { gte: since } }),
    ).resolves.toBe(42);
    expect(mockUser.count).toHaveBeenCalledWith({
      where: { createdAt: { gte: since } },
    });
  });

  it('count without a where clause counts all users', async () => {
    mockUser.count.mockResolvedValue(7);

    await expect(UserInsightsRepository.count()).resolves.toBe(7);
    expect(mockUser.count).toHaveBeenCalledWith({ where: undefined });
  });

  it('countWithRecipes counts users that have at least one recipe', async () => {
    mockUser.count.mockResolvedValue(3);

    await expect(UserInsightsRepository.countWithRecipes()).resolves.toBe(3);
    expect(mockUser.count).toHaveBeenCalledWith({
      where: { recipes: { some: {} } },
    });
  });

  it('countByRole groups users by role', async () => {
    const rows = [{ role: 'USER', _count: { _all: 5 } }];
    mockUser.groupBy.mockResolvedValue(rows);

    await expect(UserInsightsRepository.countByRole()).resolves.toEqual(rows);
    expect(mockUser.groupBy).toHaveBeenCalledWith({
      by: ['role'],
      _count: { _all: true },
    });
  });

  it('findRegistrationDates loads createdAt values since the given date, capped by the sample limit', async () => {
    const since = new Date('2024-01-01');
    mockUser.findMany.mockResolvedValue([{ createdAt: since }]);

    await expect(
      UserInsightsRepository.findRegistrationDates(since),
    ).resolves.toEqual([{ createdAt: since }]);
    expect(mockUser.findMany).toHaveBeenCalledWith({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
      take: REGISTRATION_SAMPLE_LIMIT,
    });
    expect(REGISTRATION_SAMPLE_LIMIT).toBe(20_000);
  });

  it('findTopAuthors orders users with recipes by recipe count', async () => {
    mockUser.findMany.mockResolvedValue([]);

    await UserInsightsRepository.findTopAuthors(5);

    expect(mockUser.findMany).toHaveBeenCalledWith({
      where: { recipes: { some: {} } },
      orderBy: { recipes: { _count: 'desc' } },
      take: 5,
      select: {
        id: true,
        userName: true,
        _count: { select: { recipes: true } },
      },
    });
  });

  it('findRecent returns the newest users with a stable id tie-breaker', async () => {
    mockUser.findMany.mockResolvedValue([]);

    await UserInsightsRepository.findRecent(10);

    const args = mockUser.findMany.mock.calls[0][0];
    expect(args.orderBy).toEqual([{ createdAt: 'desc' }, { id: 'desc' }]);
    expect(args.take).toBe(10);
    expect(args.select).toHaveProperty('email');
    expect(args.select).not.toHaveProperty('password');
  });

  it('findPage applies skip/take and never selects sensitive fields', async () => {
    mockUser.findMany.mockResolvedValue([]);

    await UserInsightsRepository.findPage({
      where: { role: 'ADMIN' },
      skip: 20,
      take: 10,
    });

    const args = mockUser.findMany.mock.calls[0][0];
    expect(args.where).toEqual({ role: 'ADMIN' });
    expect(args.skip).toBe(20);
    expect(args.take).toBe(10);
    expect(args.orderBy).toEqual([{ createdAt: 'desc' }, { id: 'desc' }]);
    expect(args.select).toHaveProperty('locale');
    expect(args.select._count.select).toHaveProperty('followers');
    for (const forbidden of [
      'password',
      'sessionVersion',
      'resetPasswordToken',
      'resetPasswordExpires',
    ]) {
      expect(args.select).not.toHaveProperty(forbidden);
    }
  });
});
