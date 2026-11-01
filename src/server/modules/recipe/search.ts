import { Prisma } from '@prisma/client';
import { decodeCursor, encodeCursor } from '@/server/platform/pagination';
import type { RecipeFilterInput } from './types';

export interface CreatedAtCursor {
  createdAt: string;
  id: string;
}

export interface SearchScoreCursor {
  score: number;
  id: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isCreatedAtCursor = (value: unknown): value is CreatedAtCursor =>
  isRecord(value) &&
  typeof value.createdAt === 'string' &&
  typeof value.id === 'string' &&
  !Number.isNaN(Date.parse(value.createdAt));

const isSearchScoreCursor = (value: unknown): value is SearchScoreCursor =>
  isRecord(value) &&
  typeof value.score === 'number' &&
  Number.isFinite(value.score) &&
  typeof value.id === 'string' &&
  value.id !== '';

export const encodeCreatedAtCursor = (cursor: {
  createdAt: Date;
  id: string;
}): string =>
  encodeCursor({
    createdAt: cursor.createdAt.toISOString(),
    id: cursor.id,
  });

export const decodeCreatedAtCursor = (
  cursor: string | undefined,
): CreatedAtCursor | null => decodeCursor(cursor, isCreatedAtCursor);

export const encodeSearchScoreCursor = (cursor: SearchScoreCursor): string =>
  encodeCursor({
    score: Number(cursor.score.toFixed(6)),
    id: cursor.id,
  });

export const decodeSearchScoreCursor = (
  cursor: string | undefined,
): SearchScoreCursor | null => decodeCursor(cursor, isSearchScoreCursor);

export interface TrigramSearchRow {
  id: string;
  score: number;
  totalCount: number;
}

export const buildTrigramSearchFilterClauses = (
  filter?: RecipeFilterInput,
): Prisma.Sql[] => {
  const clauses: Prisma.Sql[] = [];
  if (!filter) return clauses;

  if (filter.categoryKey) {
    clauses.push(Prisma.sql`r.category->>'key' = ${filter.categoryKey}`);
  }
  if (filter.difficultyLevelKey) {
    clauses.push(
      Prisma.sql`r."difficultyLevel"->>'key' = ${filter.difficultyLevelKey}`,
    );
  }
  if (filter.cuisineKey) {
    clauses.push(Prisma.sql`r.cuisine->>'key' = ${filter.cuisineKey}`);
  }
  if (filter.costLevelKey) {
    clauses.push(Prisma.sql`r."costLevel"->>'key' = ${filter.costLevelKey}`);
  }
  if (filter.maxCookingTime) {
    clauses.push(Prisma.sql`r."cookingTime" <= ${filter.maxCookingTime}`);
  }
  if (filter.labelKeys && filter.labelKeys.length > 0) {
    const jsonPayload = JSON.stringify(
      filter.labelKeys.map((key) => ({ key })),
    );
    clauses.push(Prisma.sql`r.labels @> ${jsonPayload}::jsonb`);
  }
  if (filter.dietaryFlagKeys && filter.dietaryFlagKeys.length > 0) {
    const jsonPayload = JSON.stringify(
      filter.dietaryFlagKeys.map((key) => ({ key })),
    );
    clauses.push(Prisma.sql`r."dietaryFlags" @> ${jsonPayload}::jsonb`);
  }
  if (filter.allergenKeys && filter.allergenKeys.length > 0) {
    const jsonPayload = JSON.stringify(
      filter.allergenKeys.map((key) => ({ key })),
    );
    clauses.push(Prisma.sql`r.allergens @> ${jsonPayload}::jsonb`);
  }
  if (filter.equipmentKeys && filter.equipmentKeys.length > 0) {
    const jsonPayload = JSON.stringify(
      filter.equipmentKeys.map((key) => ({ key })),
    );
    clauses.push(Prisma.sql`r.equipment @> ${jsonPayload}::jsonb`);
  }

  return clauses;
};

export const buildTrigramSearchQuery = (opts: {
  searchTerm: string;
  filter?: RecipeFilterInput;
  cursor?: SearchScoreCursor | null;
  take?: number;
}): Prisma.Sql => {
  const { searchTerm, filter, cursor, take } = opts;
  const filterClauses = buildTrigramSearchFilterClauses(filter);
  const additionalWhere =
    filterClauses.length > 0
      ? Prisma.sql`AND ${Prisma.join(filterClauses, ' AND ')}`
      : Prisma.empty;

  const cursorWhere = cursor
    ? Prisma.sql`WHERE (score < ${cursor.score}::float8 OR (score = ${cursor.score}::float8 AND id < ${cursor.id}))`
    : Prisma.empty;

  const limitClause = take ? Prisma.sql`LIMIT ${take}` : Prisma.empty;

  return Prisma.sql`
    WITH scored AS (
      SELECT
        r.id,
        ROUND(
          GREATEST(
            similarity(r.title, ${searchTerm}),
            similarity(COALESCE(r.description, ''), ${searchTerm}),
            similarity(COALESCE(r.tips, ''), ${searchTerm}),
            similarity(COALESCE(r.substitutions, ''), ${searchTerm}),
            COALESCE((
              SELECT MAX(similarity(i.name, ${searchTerm}))
              FROM ingredients i
              WHERE i."recipeId" = r.id AND i.name % ${searchTerm}
            ), 0)
          )::numeric,
          6
        )::float8 AS score,
        COUNT(*) OVER()::int AS "totalCount"
      FROM recipes r
      WHERE (
        r.title % ${searchTerm}
        OR COALESCE(r.description, '') % ${searchTerm}
        OR COALESCE(r.tips, '') % ${searchTerm}
        OR COALESCE(r.substitutions, '') % ${searchTerm}
        OR EXISTS (
          SELECT 1 FROM ingredients i
          WHERE i."recipeId" = r.id AND i.name % ${searchTerm}
        )
      )
      ${additionalWhere}
    )
    SELECT id, score, "totalCount"
    FROM scored
    ${cursorWhere}
    ORDER BY score DESC, id DESC
    ${limitClause}
  `;
};
