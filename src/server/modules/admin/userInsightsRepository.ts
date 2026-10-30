import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma/prisma';

// Upper bound for the registration timestamps loaded for the daily chart.
export const REGISTRATION_SAMPLE_LIMIT = 20_000;

const USER_LIST_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  userName: true,
  email: true,
  role: true,
  createdAt: true,
  _count: { select: { recipes: true } },
} satisfies Prisma.UserSelect;

export type UserListRow = Prisma.UserGetPayload<{
  select: typeof USER_LIST_SELECT;
}>;

export const UserInsightsRepository = {
  count(where?: Prisma.UserWhereInput) {
    return prisma.user.count({ where });
  },

  countWithRecipes() {
    return prisma.user.count({ where: { recipes: { some: {} } } });
  },

  countByRole() {
    return prisma.user.groupBy({ by: ['role'], _count: { _all: true } });
  },

  findRegistrationDates(since: Date) {
    return prisma.user.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
      take: REGISTRATION_SAMPLE_LIMIT,
    });
  },

  findTopAuthors(take: number) {
    return prisma.user.findMany({
      where: { recipes: { some: {} } },
      orderBy: { recipes: { _count: 'desc' } },
      take,
      select: {
        id: true,
        userName: true,
        _count: { select: { recipes: true } },
      },
    });
  },

  findRecent(take: number) {
    return prisma.user.findMany({
      select: USER_LIST_SELECT,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take,
    });
  },

  findPage(params: { where: Prisma.UserWhereInput; skip: number; take: number }) {
    return prisma.user.findMany({
      where: params.where,
      select: USER_LIST_SELECT,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: params.skip,
      take: params.take,
    });
  },
};
