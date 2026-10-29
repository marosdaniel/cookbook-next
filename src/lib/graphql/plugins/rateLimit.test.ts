import { Kind, parse } from 'graphql';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createInMemoryLimiter,
  getRateLimitGroupForField,
} from '@/lib/rateLimit/rateLimit';
import { enforceOperationRateLimits, rateLimitPlugin } from './rateLimit';

vi.mock('@/lib/rateLimit/rateLimit', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/lib/rateLimit/rateLimit')>();
  return {
    ...actual,
    getRateLimitGroupForField: vi.fn(actual.getRateLimitGroupForField),
  };
});

describe('rateLimitPlugin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps buckets isolated across different operation groups', async () => {
    const ratingBucket = createInMemoryLimiter(1, 60_000);
    const contentWriteBucket = createInMemoryLimiter(1, 60_000);

    vi.mocked(getRateLimitGroupForField).mockImplementation((field) => {
      if (field === 'rateRecipe') {
        return {
          group: 'rating',
          keyStrategy: 'user',
          limiter: null,
          fallbackLimiter: ratingBucket,
        };
      }
      if (field === 'createRecipe') {
        return {
          group: 'content-write',
          keyStrategy: 'user',
          limiter: null,
          fallbackLimiter: contentWriteBucket,
        };
      }
      return null;
    });

    const rateDoc = parse(
      'mutation RateRecipe($input: RatingInput!) { rateRecipe(ratingInput: $input) { id } }',
    );
    const rateOp = rateDoc.definitions.find(
      (d) => d.kind === Kind.OPERATION_DEFINITION,
    );

    const createDoc = parse(
      'mutation CreateRecipe($input: RecipeCreateInput!) { createRecipe(recipeCreateInput: $input) { id } }',
    );
    const createOp = createDoc.definitions.find(
      (d) => d.kind === Kind.OPERATION_DEFINITION,
    );

    // Exhaust rating bucket for user-1
    await expect(
      enforceOperationRateLimits(rateDoc, rateOp, 'RateRecipe', {
        userId: 'user-1',
        clientKey: '127.0.0.1',
      }),
    ).resolves.toBeUndefined();

    await expect(
      enforceOperationRateLimits(rateDoc, rateOp, 'RateRecipe', {
        userId: 'user-1',
        clientKey: '127.0.0.1',
      }),
    ).rejects.toMatchObject({
      message: 'Too many requests',
      extensions: { code: 'RATE_LIMITED', group: 'rating' },
    });

    // content-write bucket for user-1 is unaffected
    await expect(
      enforceOperationRateLimits(createDoc, createOp, 'CreateRecipe', {
        userId: 'user-1',
        clientKey: '127.0.0.1',
      }),
    ).resolves.toBeUndefined();
  });

  it('prevents operation-name spoofing by inspecting resolved root fields', async () => {
    const authBucket = createInMemoryLimiter(1, 60_000);

    vi.mocked(getRateLimitGroupForField).mockImplementation((field) => {
      if (field === 'resetPassword') {
        return {
          group: 'auth-sensitive',
          keyStrategy: 'ip',
          limiter: null,
          fallbackLimiter: authBucket,
        };
      }
      return null;
    });

    const spoofedDoc = parse(`
      mutation GetRecipes {
        resetPassword(email: "victim@example.com") {
          success
        }
      }
    `);
    const spoofedOp = spoofedDoc.definitions.find(
      (d) => d.kind === Kind.OPERATION_DEFINITION,
    );

    await expect(
      enforceOperationRateLimits(spoofedDoc, spoofedOp, 'GetRecipes', {
        clientKey: '10.0.0.1',
      }),
    ).resolves.toBeUndefined();

    const listener = await rateLimitPlugin.requestDidStart?.({} as never);
    await expect(
      listener?.didResolveOperation?.({
        document: spoofedDoc,
        operation: spoofedOp,
        operationName: 'GetRecipes',
        contextValue: { clientKey: '10.0.0.1' },
      } as never),
    ).rejects.toMatchObject({
      extensions: { code: 'RATE_LIMITED', group: 'auth-sensitive' },
    });
  });

  it('activates the in-memory fallback limiter when Redis throws', async () => {
    const failingPrimaryLimiter = {
      limit: vi.fn().mockRejectedValue(new Error('Redis connection timeout')),
    };
    const fallbackBucket = createInMemoryLimiter(1, 60_000);

    vi.mocked(getRateLimitGroupForField).mockReturnValue({
      group: 'password-change',
      keyStrategy: 'user',
      limiter: failingPrimaryLimiter,
      fallbackLimiter: fallbackBucket,
    });

    const doc = parse(
      'mutation ChangePassword($input: PasswordEditInput!) { changePassword(passwordEditInput: $input) { success } }',
    );
    const op = doc.definitions.find(
      (d) => d.kind === Kind.OPERATION_DEFINITION,
    );

    await expect(
      enforceOperationRateLimits(doc, op, 'ChangePassword', {
        userId: 'user-42',
        clientKey: '127.0.0.1',
      }),
    ).resolves.toBeUndefined();

    await expect(
      enforceOperationRateLimits(doc, op, 'ChangePassword', {
        userId: 'user-42',
        clientKey: '127.0.0.1',
      }),
    ).rejects.toMatchObject({
      extensions: { code: 'RATE_LIMITED', group: 'password-change' },
    });
  });
});
