import type { Session } from 'next-auth';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGetSessionSafely, mockLoaders, mockPrisma } = vi.hoisted(() => ({
  mockGetSessionSafely: vi.fn(),
  mockLoaders: {
    createRatingsLoader: vi.fn(() => 'ratings'),
    createIsFavoriteLoader: vi.fn(() => 'isFavorite'),
    createUserRatingLoader: vi.fn(() => 'userRating'),
    createRecipeAuthorLoader: vi.fn(() => 'recipeAuthor'),
    createUserRecipesLoader: vi.fn(() => 'userRecipes'),
    createUserFavoriteRecipesLoader: vi.fn(() => 'userFavoriteRecipes'),
  },
  mockPrisma: { name: 'prisma' },
}));

vi.mock('@/lib/auth/safeSession', () => ({
  getSessionSafely: mockGetSessionSafely,
}));
vi.mock('@/lib/dataloader/loaders', () => mockLoaders);
vi.mock('@/lib/prisma/prisma', () => ({ prisma: mockPrisma }));

import { requestStorage } from '@/server/platform/requestContext';
import { createGraphQLContext } from './context';

const adminSession = {
  user: { id: 'u-1', role: 'ADMIN' },
  expires: '2099-01-01T00:00:00.000Z',
} as unknown as Session;

describe('createGraphQLContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSessionSafely.mockResolvedValue(null);
  });

  it('uses the session from the request store when present', async () => {
    const context = await requestStorage.run(
      {
        session: adminSession,
        requestId: 'req-1',
        clientKey: 'client-1',
      },
      () => createGraphQLContext(),
    );

    expect(mockGetSessionSafely).not.toHaveBeenCalled();
    expect(context).toMatchObject({
      userId: 'u-1',
      role: 'ADMIN',
      requestId: 'req-1',
      clientKey: 'client-1',
      operationName: null,
      prisma: mockPrisma,
    });
  });

  it('resolves the session itself when there is no request store', async () => {
    mockGetSessionSafely.mockResolvedValue(adminSession);

    const context = await createGraphQLContext();

    expect(mockGetSessionSafely).toHaveBeenCalledTimes(1);
    expect(context).toMatchObject({
      userId: 'u-1',
      role: 'ADMIN',
      requestId: 'unknown',
      clientKey: undefined,
    });
  });

  it('creates only the anonymous-safe loaders for anonymous requests', async () => {
    const context = await createGraphQLContext();

    expect(context.userId).toBeUndefined();
    expect(context.role).toBeUndefined();
    expect(context.loaders).toEqual({
      ratings: 'ratings',
      isFavorite: null,
      userRating: null,
      recipeAuthor: 'recipeAuthor',
      userRecipes: 'userRecipes',
      userFavoriteRecipes: 'userFavoriteRecipes',
    });
    expect(mockLoaders.createIsFavoriteLoader).not.toHaveBeenCalled();
    expect(mockLoaders.createUserRatingLoader).not.toHaveBeenCalled();
  });

  it('creates user-scoped loaders for authenticated requests', async () => {
    mockGetSessionSafely.mockResolvedValue(adminSession);

    const context = await createGraphQLContext();

    expect(mockLoaders.createIsFavoriteLoader).toHaveBeenCalledWith(
      mockPrisma,
      'u-1',
    );
    expect(mockLoaders.createUserRatingLoader).toHaveBeenCalledWith(
      mockPrisma,
      'u-1',
    );
    expect(context.loaders.isFavorite).toBe('isFavorite');
    expect(context.loaders.userRating).toBe('userRating');
  });

  it('creates fresh loaders for every request', async () => {
    await createGraphQLContext();
    await createGraphQLContext();

    expect(mockLoaders.createRatingsLoader).toHaveBeenCalledTimes(2);
  });
});
