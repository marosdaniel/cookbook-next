import type { PrismaClient } from '@prisma/client';
import DataLoader from 'dataloader';

/**
 * Aggregated rating data for a single recipe — returned by the ratings loader.
 */
export interface RecipeRatingData {
  averageRating: number;
  ratingsCount: number;
}

/**
 * Batches multiple `rating.aggregate` + `rating.count` calls for a list of
 * recipe IDs into a single DB round-trip.
 *
 * Instead of N queries for N recipes, we do 1 query for all recipes at once.
 */
export const createRatingsLoader = (prisma: PrismaClient) =>
  new DataLoader<string, RecipeRatingData>(async (recipeIds) => {
    const ids = [...recipeIds]; // readonly → mutable

    // Fetch all ratings for the batch of recipe IDs in one query
    const ratings = await prisma.rating.groupBy({
      by: ['recipeId'],
      where: { recipeId: { in: ids } },
      _avg: { ratingValue: true },
      _count: { ratingValue: true },
    });

    // Build a lookup map keyed by recipeId
    const ratingMap = new Map<string, RecipeRatingData>();
    for (const r of ratings) {
      ratingMap.set(r.recipeId, {
        averageRating: r._avg.ratingValue ?? 0,
        ratingsCount: r._count.ratingValue,
      });
    }

    // DataLoader requires results in the same order as the keys
    return ids.map(
      (id) => ratingMap.get(id) ?? { averageRating: 0, ratingsCount: 0 },
    );
  });

/**
 * Batches `isFavorite` checks for a specific user across multiple recipe IDs
 * into a single DB query.
 *
 * Since `isFavorite` depends on the current user, a new loader instance is
 * created per request (see route.ts context factory).
 */
export const createIsFavoriteLoader = (prisma: PrismaClient, userId: string) =>
  new DataLoader<string, boolean>(async (recipeIds) => {
    const ids = [...recipeIds];

    // Fetch only the recipes that are in the user's favorites
    const favorites = await prisma.recipe.findMany({
      where: {
        id: { in: ids },
        favoritedBy: { some: { id: userId } },
      },
      select: { id: true },
    });

    const favoriteIds = new Set(favorites.map((f) => f.id));

    return ids.map((id) => favoriteIds.has(id));
  });

/**
 * Batches `userRating` lookups for a specific user across multiple recipe IDs.
 */
export const createUserRatingLoader = (prisma: PrismaClient, userId: string) =>
  new DataLoader<string, number | null>(async (recipeIds) => {
    const ids = [...recipeIds];

    const ratings = await prisma.rating.findMany({
      where: {
        recipeId: { in: ids },
        userId,
      },
      select: { recipeId: true, ratingValue: true },
    });

    const ratingMap = new Map<string, number>();
    for (const r of ratings) {
      ratingMap.set(r.recipeId, r.ratingValue);
    }

    return ids.map((id) => ratingMap.get(id) ?? null);
  });
