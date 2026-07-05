import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPrismaTimeoutProxy } from './prismaTimeout';

describe('createPrismaTimeoutProxy', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('wraps nested delegate methods so they also receive timeout protection', async () => {
    const slowOperation = new Promise<string>((resolve) => {
      setTimeout(() => resolve('done'), 100);
    });

    const target = {
      recipe: {
        findMany: vi.fn(() => slowOperation),
      },
    };

    const wrapped = createPrismaTimeoutProxy(target, 10);
    const promise = wrapped.recipe.findMany();

    vi.advanceTimersByTime(10);

    await expect(promise).rejects.toThrow('timed out');
  });

  it('forwards the original arguments to delegated methods while preserving timeout protection', async () => {
    const findMany = vi.fn((_options?: { where?: { id: number } }) => {
      return new Promise<string>((resolve) => setTimeout(() => resolve('done'), 100));
    });

    const target = {
      recipe: {
        findMany,
      },
    };

    const wrapped = createPrismaTimeoutProxy(target, 10);
    const promise = wrapped.recipe.findMany({ where: { id: 1 } });

    vi.advanceTimersByTime(10);

    await expect(promise).rejects.toThrow('timed out');
    expect(findMany).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('wraps transaction callbacks so nested delegate calls are protected', async () => {
    const tx = {
      recipe: {
        findMany: vi.fn(() => new Promise<string>((resolve) => setTimeout(() => resolve('done'), 100))),
      },
    };

    const target = {
      $transaction: vi.fn(async (callback: (innerTx: unknown) => Promise<string>) => callback(tx)),
    };

    const wrapped = createPrismaTimeoutProxy(target, 10);
    const promise = wrapped.$transaction((innerTx: unknown) => {
      if (typeof innerTx !== 'object' || innerTx === null || !('recipe' in innerTx)) {
        return Promise.reject(new Error('invalid transaction context'));
      }

      return (innerTx as typeof tx).recipe.findMany();
    });

    vi.advanceTimersByTime(10);

    await expect(promise).rejects.toThrow('timed out');
  });
});
