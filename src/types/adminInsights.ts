export const INSIGHT_USER_ROLES = ['ADMIN', 'BLOGGER', 'USER'] as const;

export type InsightUserRole = (typeof INSIGHT_USER_ROLES)[number];

export const isInsightUserRole = (value: unknown): value is InsightUserRole =>
  typeof value === 'string' &&
  (INSIGHT_USER_ROLES as readonly string[]).includes(value);

export type DailyRegistration = {
  /** ISO date (YYYY-MM-DD) in the Europe/Budapest time zone. */
  date: string;
  /** Short axis label (MM-DD). */
  label: string;
  registrations: number;
};

export type RoleCount = {
  role: InsightUserRole;
  count: number;
};

export type TopAuthor = {
  id: string;
  userName: string;
  recipes: number;
};

export type InsightUser = {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  role: InsightUserRole;
  recipeCount: number;
  /** ISO timestamp. */
  joinedAt: string;
};

export type UserOverview = {
  totalUsers: number;
  newUsers7d: number;
  newUsers30d: number;
  usersWithRecipes: number;
  registrations: DailyRegistration[];
  roles: RoleCount[];
  topAuthors: TopAuthor[];
  recentUsers: InsightUser[];
};

export type UserListQuery = {
  search?: string;
  role?: string;
  page?: number;
};

export type UserListResult = {
  users: InsightUser[];
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
  search: string;
  role: InsightUserRole | null;
};
