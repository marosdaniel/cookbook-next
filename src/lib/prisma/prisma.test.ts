import { beforeEach, describe, expect, it, vi } from 'vitest';

const PrismaNeonSpy = vi.fn();

vi.mock('@prisma/adapter-neon', () => ({
  PrismaNeon: class {
    constructor(public options: { connectionString: string }) {
      PrismaNeonSpy(options);
    }
  },
}));

vi.mock('@prisma/client', () => {
  return {
    PrismaClient: class {
      $connect = vi.fn();
      public isMock = true;
    },
  };
});

describe('prisma', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    // Clean up global prisma instance to ensure a fresh state for each test
    delete (globalThis as unknown as Record<string, unknown>).prisma;
  });

  it('should export a prisma instance', async () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://user:pass@localhost:5432/db');
    const { prisma } = await import('./prisma');
    expect(prisma).toBeDefined();
    expect((prisma as unknown as { isMock: boolean }).isMock).toBe(true);
  });

  it('should reuse the global instance in development', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('DATABASE_URL', 'postgresql://user:pass@localhost:5432/db');

    const { prisma: prisma1 } = await import('./prisma');

    // In development, it should be attached to globalThis
    expect((globalThis as unknown as Record<string, unknown>).prisma).toBe(
      prisma1,
    );

    // Re-importing should return the same instance from globalThis
    vi.resetModules();
    const { prisma: prisma2 } = await import('./prisma');
    expect(prisma2).toBe(prisma1);

    vi.unstubAllEnvs();
  });

  it('should NOT reuse the global instance in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('DATABASE_URL', 'postgresql://user:pass@localhost:5432/db');

    const { prisma } = await import('./prisma');
    expect(prisma).toBeDefined();

    // In production, it should NOT be attached to globalThis
    expect(
      (globalThis as unknown as Record<string, unknown>).prisma,
    ).toBeUndefined();

    vi.unstubAllEnvs();
  });

  it('should initialize PrismaNeon with DATABASE_URL', async () => {
    const dbUrl = 'postgresql://test-user:test-pass@neon.db/test-repo';
    vi.stubEnv('DATABASE_URL', dbUrl);

    await import('./prisma');

    expect(PrismaNeonSpy).toHaveBeenCalledWith({ connectionString: dbUrl });
  });
});
