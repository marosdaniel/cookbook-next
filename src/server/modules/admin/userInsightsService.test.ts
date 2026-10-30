import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  assertAdminRole: vi.fn(),
  repository: {
    count: vi.fn(),
    countWithRecipes: vi.fn(),
    countByRole: vi.fn(),
    findRegistrationDates: vi.fn(),
    findTopAuthors: vi.fn(),
    findRecent: vi.fn(),
    findPage: vi.fn(),
  },
}));

vi.mock('./policy', () => ({ assertAdminRole: mocks.assertAdminRole }));
vi.mock('./userInsightsRepository', () => ({
  UserInsightsRepository: mocks.repository,
}));

import {
  buildDailySeries,
  USER_LIST_PAGE_SIZE,
  UserInsightsService,
} from './userInsightsService';

const userRow = {
  id: 'u1',
  firstName: 'Ada',
  lastName: 'Lovelace',
  userName: 'ada',
  email: 'ada@example.com',
  role: 'USER',
  createdAt: new Date('2026-10-01T08:00:00.000Z'),
  _count: { recipes: 2 },
};

describe('buildDailySeries', () => {
  const now = new Date('2026-10-30T10:00:00.000Z');

  it('returns one entry per local day, oldest first, and counts per day', () => {
    const series = buildDailySeries(
      [
        new Date('2026-10-30T09:00:00.000Z'),
        // 23:30 on Oct 29 in Budapest (UTC+1)
        new Date('2026-10-29T22:30:00.000Z'),
        new Date('2026-10-29T08:00:00.000Z'),
        // outside the three day window
        new Date('2026-10-27T12:00:00.000Z'),
      ],
      3,
      now,
    );

    expect(series).toEqual([
      { date: '2026-10-28', label: '10-28', registrations: 0 },
      { date: '2026-10-29', label: '10-29', registrations: 2 },
      { date: '2026-10-30', label: '10-30', registrations: 1 },
    ]);
  });

  it('does not skip or repeat days around a daylight saving change', () => {
    const series = buildDailySeries([], 4, new Date('2026-10-26T12:00:00.000Z'));

    expect(series.map((entry) => entry.date)).toEqual([
      '2026-10-23',
      '2026-10-24',
      '2026-10-25',
      '2026-10-26',
    ]);
  });
});

describe('UserInsightsService.getOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.assertAdminRole.mockReset();
  });

  it('rejects non-admins before touching the database', async () => {
    mocks.assertAdminRole.mockImplementation(() => {
      throw new Error('forbidden');
    });

    await expect(UserInsightsService.getOverview('USER')).rejects.toThrow(
      'forbidden',
    );
    expect(mocks.assertAdminRole).toHaveBeenCalledWith('USER');
    expect(mocks.repository.count).not.toHaveBeenCalled();
  });

  it('assembles totals, role distribution, top authors and recent users', async () => {
    mocks.repository.count
      .mockResolvedValueOnce(6)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(4);
    mocks.repository.countWithRecipes.mockResolvedValue(3);
    mocks.repository.countByRole.mockResolvedValue([
      { role: 'USER', _count: { _all: 5 } },
      { role: 'ADMIN', _count: { _all: 1 } },
    ]);
    mocks.repository.findRegistrationDates.mockResolvedValue([]);
    mocks.repository.findTopAuthors.mockResolvedValue([
      { id: 'u1', userName: 'ada', _count: { recipes: 4 } },
    ]);
    mocks.repository.findRecent.mockResolvedValue([userRow]);

    const overview = await UserInsightsService.getOverview('ADMIN');

    expect(overview.totalUsers).toBe(6);
    expect(overview.newUsers7d).toBe(2);
    expect(overview.newUsers30d).toBe(4);
    expect(overview.usersWithRecipes).toBe(3);
    expect(overview.roles).toEqual([
      { role: 'ADMIN', count: 1 },
      { role: 'BLOGGER', count: 0 },
      { role: 'USER', count: 5 },
    ]);
    expect(overview.registrations).toHaveLength(30);
    expect(overview.topAuthors).toEqual([
      { id: 'u1', userName: 'ada', recipes: 4 },
    ]);
    expect(overview.recentUsers[0]).toMatchObject({
      id: 'u1',
      recipeCount: 2,
      joinedAt: '2026-10-01T08:00:00.000Z',
    });
  });
});

describe('UserInsightsService.listUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.assertAdminRole.mockReset();
    mocks.repository.count.mockResolvedValue(45);
    mocks.repository.findPage.mockResolvedValue([userRow]);
  });

  it('trims the search, clamps the page and passes the filters on', async () => {
    const result = await UserInsightsService.listUsers('ADMIN', {
      search: '  ada  ',
      role: 'ADMIN',
      page: 9,
    });

    expect(mocks.assertAdminRole).toHaveBeenCalledWith('ADMIN');
    expect(result).toMatchObject({
      total: 45,
      page: 3,
      pageCount: 3,
      pageSize: USER_LIST_PAGE_SIZE,
      search: 'ada',
      role: 'ADMIN',
    });
    expect(result.users).toHaveLength(1);
    expect(mocks.repository.findPage).toHaveBeenCalledWith({
      where: expect.objectContaining({ role: 'ADMIN', OR: expect.any(Array) }),
      skip: 2 * USER_LIST_PAGE_SIZE,
      take: USER_LIST_PAGE_SIZE,
    });
  });

  it('ignores an unknown role and an invalid page number', async () => {
    const result = await UserInsightsService.listUsers('ADMIN', {
      role: 'HACKER',
      page: Number.NaN,
    });

    expect(result.role).toBeNull();
    expect(result.page).toBe(1);
    expect(mocks.repository.findPage).toHaveBeenCalledWith({
      where: {},
      skip: 0,
      take: USER_LIST_PAGE_SIZE,
    });
  });

  it('rejects non-admins', async () => {
    mocks.assertAdminRole.mockImplementation(() => {
      throw new Error('forbidden');
    });

    await expect(UserInsightsService.listUsers('USER', {})).rejects.toThrow(
      'forbidden',
    );
    expect(mocks.repository.count).not.toHaveBeenCalled();
  });
});
