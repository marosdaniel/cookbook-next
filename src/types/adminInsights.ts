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

/**
 * Everything the admin user table and the details modal show about a user.
 * It intentionally excludes the password hash, reset tokens and the session
 * version.
 */
export type InsightUserDetail = InsightUser & {
  locale: string;
  /** ISO timestamp. */
  updatedAt: string;
  favoriteCount: number;
  ratingCount: number;
  followerCount: number;
  followingCount: number;
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
  users: InsightUserDetail[];
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
  search: string;
  role: InsightUserRole | null;
};

export type AdminUserActionError =
  | 'FORBIDDEN'
  | 'SELF_ACTION'
  | 'NOT_FOUND'
  | 'UNCHANGED'
  | 'INVALID_INPUT'
  | 'UNKNOWN';

export type AdminUserActionResult =
  | { ok: true }
  | { ok: false; error: AdminUserActionError };
