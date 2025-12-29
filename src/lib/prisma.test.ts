import { describe, expect, it, vi } from 'vitest';

vi.mock('@prisma/client', () => {
  return {
    PrismaClient: class {
      $connect = vi.fn();
    },
  };
});

describe('prisma', () => {
  it('should export a prisma instance', async () => {
    // Import the prisma instance AFTER mocking
    const { prisma } = await import('./prisma');
    expect(prisma).toBeDefined();
  });

  it('should reuse the global instance in development', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    // Clear cache if needed, but given the structure we can just check if it's attached to global
    const { prisma } = await import('./prisma');
    expect((globalThis as unknown as Record<string, unknown>).prisma).toBe(
      prisma,
    );

    vi.unstubAllEnvs();
  });
});
