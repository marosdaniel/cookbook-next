import type { Prisma } from '@prisma/client';
import {
  type DailyRegistration,
  INSIGHT_USER_ROLES,
  type InsightUser,
  type InsightUserDetail,
  isInsightUserRole,
  type UserListQuery,
  type UserListResult,
  type UserOverview,
} from '@/types/adminInsights';
import { assertAdminRole } from './policy';
import {
  UserInsightsRepository,
  type UserDetailRow,
  type UserListRow,
} from './userInsightsRepository';

const DISPLAY_TIME_ZONE = 'Europe/Budapest';
const REGISTRATION_DAYS = 30;
const TOP_AUTHORS_LIMIT = 5;
const RECENT_USERS_LIMIT = 6;
const MAX_SEARCH_LENGTH = 100;
const DAY_MS = 86_400_000;

export const USER_LIST_PAGE_SIZE = 20;

const dayFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: DISPLAY_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** YYYY-MM-DD of the given instant in the Europe/Budapest time zone. */
export const toDayKey = (date: Date): string => dayFormatter.format(date);

/**
 * Builds one entry per local day for the last `days` days (oldest first),
 * counting the given registration timestamps. Days are derived from calendar
 * dates, so daylight saving changes cannot skip or duplicate a day.
 */
export const buildDailySeries = (
  dates: readonly Date[],
  days: number,
  now: Date = new Date(),
): DailyRegistration[] => {
  const [year = 1970, month = 1, day = 1] = toDayKey(now)
    .split('-')
    .map(Number);

  const keys: string[] = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    keys.push(
      new Date(Date.UTC(year, month - 1, day - offset))
        .toISOString()
        .slice(0, 10),
    );
  }

  const counts = new Map<string, number>(keys.map((key) => [key, 0]));
  for (const date of dates) {
    const key = toDayKey(date);
    const current = counts.get(key);
    if (current !== undefined) {
      counts.set(key, current + 1);
    }
  }

  return keys.map((key) => ({
    date: key,
    label: key.slice(5),
    registrations: counts.get(key) ?? 0,
  }));
};

const toInsightUser = (row: UserListRow): InsightUser => ({
  id: row.id,
  firstName: row.firstName,
  lastName: row.lastName,
  userName: row.userName,
  email: row.email,
  role: row.role,
  recipeCount: row._count.recipes,
  joinedAt: row.createdAt.toISOString(),
});

const toInsightUserDetail = (row: UserDetailRow): InsightUserDetail => ({
  ...toInsightUser(row),
  locale: row.locale,
  updatedAt: row.updatedAt.toISOString(),
  favoriteCount: row._count.favoriteRecipes,
  ratingCount: row._count.ratings,
  followerCount: row._count.followers,
  followingCount: row._count.following,
});

const buildUserWhere = (
  search: string,
  role: UserListResult['role'],
): Prisma.UserWhereInput => ({
  ...(role ? { role } : {}),
  ...(search
    ? {
        OR: [
          { userName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {}),
});

export const UserInsightsService = {
  async getOverview(role: string | undefined): Promise<UserOverview> {
    assertAdminRole(role);

    const now = new Date();
    const since7 = new Date(now.getTime() - 7 * DAY_MS);
    const since30 = new Date(now.getTime() - 30 * DAY_MS);
    // One day of slack so the first local day is always covered completely.
    const seriesStart = new Date(
      now.getTime() - (REGISTRATION_DAYS + 1) * DAY_MS,
    );

    const [
      totalUsers,
      newUsers7d,
      newUsers30d,
      usersWithRecipes,
      roleRows,
      registrationRows,
      topAuthorRows,
      recentRows,
    ] = await Promise.all([
      UserInsightsRepository.count(),
      UserInsightsRepository.count({ createdAt: { gte: since7 } }),
      UserInsightsRepository.count({ createdAt: { gte: since30 } }),
      UserInsightsRepository.countWithRecipes(),
      UserInsightsRepository.countByRole(),
      UserInsightsRepository.findRegistrationDates(seriesStart),
      UserInsightsRepository.findTopAuthors(TOP_AUTHORS_LIMIT),
      UserInsightsRepository.findRecent(RECENT_USERS_LIMIT),
    ]);

    const roleCounts = new Map(
      roleRows.map((row) => [row.role, row._count._all]),
    );

    return {
      totalUsers,
      newUsers7d,
      newUsers30d,
      usersWithRecipes,
      registrations: buildDailySeries(
        registrationRows.map((row) => row.createdAt),
        REGISTRATION_DAYS,
        now,
      ),
      roles: INSIGHT_USER_ROLES.map((userRole) => ({
        role: userRole,
        count: roleCounts.get(userRole) ?? 0,
      })),
      topAuthors: topAuthorRows.map((row) => ({
        id: row.id,
        userName: row.userName,
        recipes: row._count.recipes,
      })),
      recentUsers: recentRows.map(toInsightUser),
    };
  },

  async listUsers(
    role: string | undefined,
    query: UserListQuery,
  ): Promise<UserListResult> {
    assertAdminRole(role);

    const search = (query.search ?? '').trim().slice(0, MAX_SEARCH_LENGTH);
    const roleFilter = isInsightUserRole(query.role) ? query.role : null;
    const where = buildUserWhere(search, roleFilter);

    const total = await UserInsightsRepository.count(where);
    const pageCount = Math.max(1, Math.ceil(total / USER_LIST_PAGE_SIZE));
    const requestedPage =
      typeof query.page === 'number' && Number.isFinite(query.page)
        ? Math.floor(query.page)
        : 1;
    const page = Math.min(Math.max(requestedPage, 1), pageCount);

    const rows = await UserInsightsRepository.findPage({
      where,
      skip: (page - 1) * USER_LIST_PAGE_SIZE,
      take: USER_LIST_PAGE_SIZE,
    });

    return {
      users: rows.map(toInsightUserDetail),
      total,
      page,
      pageCount,
      pageSize: USER_LIST_PAGE_SIZE,
      search,
      role: roleFilter,
    };
  },
};
