import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

const {
  mockPrismaUserFindUnique,
  mockPrismaUserUpdate,
  mockCheckLoginRateLimit,
  mockGetCachedValue,
  mockSetCachedValue,
} = vi.hoisted(() => ({
  mockPrismaUserFindUnique: vi.fn(),
  mockPrismaUserUpdate: vi.fn(),
  mockCheckLoginRateLimit: vi.fn(),
  mockGetCachedValue: vi.fn(),
  mockSetCachedValue: vi.fn(),
}));

import { prisma } from '@/lib/prisma/prisma';
import {
  hashPassword,
  needsPasswordRehash,
  verifyDummyPassword,
  verifyPassword,
} from './password';

// Mock NextAuth and capture the config
let capturedConfig: unknown;
vi.mock('next-auth', () => ({
  default: vi.fn((config: unknown) => {
    capturedConfig = config;
    return {
      handlers: {},
      signIn: vi.fn(),
      signOut: vi.fn(),
      auth: vi.fn(),
    };
  }),
}));

// Mock Credentials provider
vi.mock('next-auth/providers/credentials', () => ({
  default: vi.fn((config: unknown) => config),
}));

// Mock prisma and bcrypt
vi.mock('@/lib/prisma/prisma', () => ({
  prisma: {
    user: {
      findUnique: mockPrismaUserFindUnique,
      update: mockPrismaUserUpdate,
    },
  },
}));

vi.mock('@/lib/rateLimit/rateLimit', () => ({
  checkLoginRateLimit: mockCheckLoginRateLimit,
}));

vi.mock('@/server/platform/cache', () => ({
  cacheKeys: {
    sessionVersion: (userId: string) => `session:v:${userId}`,
  },
  SESSION_VERSION_CACHE_TTL_SECONDS: 60,
  getCachedValue: mockGetCachedValue,
  setCachedValue: mockSetCachedValue,
}));

vi.mock('./password', () => ({
  verifyPassword: vi.fn(),
  verifyDummyPassword: vi.fn().mockResolvedValue(undefined),
  needsPasswordRehash: vi.fn().mockReturnValue(false),
  hashPassword: vi.fn().mockResolvedValue('$argon2id$v=19$upgraded'),
}));

describe('auth.ts', () => {
  let authorize: (credentials: unknown, request?: unknown) => Promise<unknown>;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    mockPrismaUserFindUnique.mockReset();
    mockPrismaUserUpdate.mockReset();
    mockGetCachedValue.mockResolvedValue(null);
    mockSetCachedValue.mockResolvedValue(undefined);
    mockCheckLoginRateLimit.mockResolvedValue({
      success: true,
      limit: 5,
      remaining: 4,
    });
    // Re-import to trigger NextAuth call
    await import('./auth');
    authorize = (
      capturedConfig as {
        providers: [
          { authorize: (c: unknown, req?: unknown) => Promise<unknown> },
        ];
      }
    ).providers[0].authorize;
  });

  describe('authorize', () => {
    it('should throw error if email or password missing', async () => {
      await expect(authorize({ email: '', password: '' })).rejects.toThrow(
        'Email and password are required',
      );
    });

    it('should throw error if user not found and run dummy timing verification', async () => {
      (prisma.user.findUnique as Mock).mockResolvedValue(null);
      await expect(
        authorize({ email: 'test@example.com', password: 'password' }),
      ).rejects.toThrow('Invalid email or password');
      expect(verifyDummyPassword).toHaveBeenCalledWith('password');
    });

    it('normalizes email to lowercase so User@Example.com and user@example.com match the same account', async () => {
      const mockUser = {
        id: '1',
        email: 'user@example.com',
        password: '$argon2id$v=19$hashed-password',
        firstName: 'John',
        lastName: 'Doe',
        userName: 'johndoe',
        role: 'USER',
        locale: 'en',
      };
      (prisma.user.findUnique as Mock).mockResolvedValue(mockUser);
      (verifyPassword as Mock).mockResolvedValue(true);

      await authorize({
        email: 'User@Example.com',
        password: 'password',
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'user@example.com' },
      });
    });

    it('transparently upgrades legacy bcrypt hashes to argon2 on successful login', async () => {
      const mockUser = {
        id: '1',
        email: 'user@example.com',
        password: '$2a$12$legacybcrypthash',
        firstName: 'John',
        lastName: 'Doe',
        userName: 'johndoe',
        role: 'USER',
        locale: 'en',
      };
      (prisma.user.findUnique as Mock).mockResolvedValue(mockUser);
      (verifyPassword as Mock).mockResolvedValue(true);
      (needsPasswordRehash as Mock).mockReturnValue(true);
      (hashPassword as Mock).mockResolvedValue('$argon2id$v=19$new-hash');

      await authorize({
        email: 'user@example.com',
        password: 'password',
      });

      expect(hashPassword).toHaveBeenCalledWith('password');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { password: '$argon2id$v=19$new-hash' },
      });
    });

    it('returns the same generic error when login rate limit is exceeded without leaking account existence', async () => {
      mockCheckLoginRateLimit.mockResolvedValue({
        success: false,
        limit: 5,
        remaining: 0,
      });

      await expect(
        authorize(
          { email: 'victim@example.com', password: 'password' },
          new Request('http://localhost/api/auth/callback/credentials'),
        ),
      ).rejects.toThrow('Invalid email or password');

      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('should throw error if password invalid', async () => {
      (prisma.user.findUnique as Mock).mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        password: 'hashed-password',
      });
      (verifyPassword as Mock).mockResolvedValue(false);

      await expect(
        authorize({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow('Invalid email or password');
    });

    it('should return user object on successful login', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashed-password',
        firstName: 'John',
        lastName: 'Doe',
        userName: 'johndoe',
        role: 'USER',
        locale: 'en',
      };
      (prisma.user.findUnique as Mock).mockResolvedValue(mockUser);
      (verifyPassword as Mock).mockResolvedValue(true);

      const result = await authorize({
        email: 'test@example.com',
        password: 'password',
      });

      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        userName: 'johndoe',
        role: 'USER',
        locale: 'en',
        sessionVersion: 0,
      });
    });

    it('should mark token as revoked when sessionVersion does not match DB and reject in session callback', async () => {
      const callbacks = (
        capturedConfig as {
          callbacks: {
            jwt: (ctx: unknown) => Promise<Record<string, unknown>>;
            session: (ctx: unknown) => Promise<unknown>;
          };
        }
      ).callbacks;

      (prisma.user.findUnique as Mock).mockResolvedValue({
        sessionVersion: 3,
      });

      const revokedToken = await callbacks.jwt({
        token: { id: 'user-1', authVersion: 2 },
      });
      expect(revokedToken.revoked).toBe(true);

      await expect(
        callbacks.session({
          token: revokedToken,
          session: { user: {} },
        }),
      ).rejects.toThrow('Session has been revoked');
    });

    it('serves the second jwt sessionVersion check from Redis cache without hitting Prisma', async () => {
      const callbacks = (
        capturedConfig as {
          callbacks: {
            jwt: (ctx: unknown) => Promise<Record<string, unknown>>;
          };
        }
      ).callbacks;

      // First call: cache miss -> reads DB and writes to Redis
      mockGetCachedValue.mockResolvedValueOnce(null);
      (prisma.user.findUnique as Mock).mockResolvedValueOnce({
        sessionVersion: 4,
      });

      const firstToken = await callbacks.jwt({
        token: { id: 'user-1', authVersion: 4 },
      });
      expect(firstToken.revoked).toBeUndefined();
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(mockSetCachedValue).toHaveBeenCalledWith(
        'session:v:user-1',
        4,
        60,
      );

      // Second call: cache hit -> no DB query
      mockGetCachedValue.mockResolvedValueOnce(4);
      const secondToken = await callbacks.jwt({
        token: { id: 'user-1', authVersion: 4 },
      });
      expect(secondToken.revoked).toBeUndefined();
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    });
  });
});
