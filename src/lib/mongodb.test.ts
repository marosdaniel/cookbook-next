import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('mongodb', () => {
  return {
    MongoClient: class {
      connect = vi.fn().mockResolvedValue({});
    },
  };
});

describe('mongodb', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should throw error if MONGODB_URI is missing', async () => {
    vi.stubEnv('MONGODB_URI', '');

    await expect(import('./mongodb')).rejects.toThrow(
      'Please add your Mongo URI to .env.local',
    );
    vi.unstubAllEnvs();
  });

  it('should export mongoClient promise and getClient function', async () => {
    vi.stubEnv('MONGODB_URI', 'mongodb://localhost:27017/test');

    const { mongoClient, getClient } = await import('./mongodb');

    expect(mongoClient).toBeInstanceOf(Promise);
    expect(getClient).toBeInstanceOf(Function);

    const client = await getClient();
    expect(client).toBeDefined();
    vi.unstubAllEnvs();
  });

  it('should reuse global promise in development', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('MONGODB_URI', 'mongodb://localhost:27017/test');

    const { mongoClient } = await import('./mongodb');
    expect(
      (globalThis as unknown as Record<string, unknown>)._mongoClientPromise,
    ).toBe(mongoClient);

    // Import again should return the same promise
    const { mongoClient: mongoClient2 } = await import('./mongodb');
    expect(mongoClient2).toBe(mongoClient);
    vi.unstubAllEnvs();
  });
});
