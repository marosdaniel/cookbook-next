import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@prisma/client', () => ({
  Prisma: { defineExtension: (extension: unknown) => extension },
}));

type AllOperations = (params: {
  args: unknown;
  query: (args: unknown) => Promise<unknown>;
}) => Promise<unknown>;

const loadAllOperations = async (timeoutMs: number): Promise<AllOperations> => {
  const { prismaTimeoutExtension } = await import('./prismaTimeout');
  const extension = prismaTimeoutExtension(timeoutMs) as unknown as {
    query: { $allOperations: AllOperations };
  };
  return extension.query.$allOperations;
};

describe('prismaTimeoutExtension', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('forwards the original args and resolves fast operations', async () => {
    const $allOperations = await loadAllOperations(10);
    const query = vi.fn(async () => 'done');

    await expect(
      $allOperations({ args: { where: { id: 1 } }, query }),
    ).resolves.toBe('done');
    expect(query).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('rejects operations that exceed the timeout', async () => {
    const $allOperations = await loadAllOperations(10);
    const query = vi.fn(
      () => new Promise<string>((resolve) => setTimeout(resolve, 100, 'done')),
    );

    const promise = $allOperations({ args: {}, query });
    const assertion = expect(promise).rejects.toThrow('timed out');

    await vi.advanceTimersByTimeAsync(10);
    await assertion;
  });

  it('propagates errors thrown by the operation', async () => {
    const $allOperations = await loadAllOperations(10);
    const query = vi.fn(async () => {
      throw new Error('boom');
    });

    await expect($allOperations({ args: {}, query })).rejects.toThrow('boom');
  });
});
