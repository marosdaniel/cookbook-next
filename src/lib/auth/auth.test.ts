import bcrypt from 'bcrypt';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { prisma } from '@/lib/prisma/prisma';

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
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('bcrypt', () => ({
  default: {
    compare: vi.fn(),
  },
}));

describe('auth.ts', () => {
  let authorize: (credentials: unknown) => Promise<unknown>;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    // Re-import to trigger NextAuth call
    await import('./auth');
    authorize = (
      capturedConfig as {
        providers: [{ authorize: (c: unknown) => Promise<unknown> }];
      }
    ).providers[0].authorize;
  });

  describe('authorize', () => {
    it('should throw error if email or password missing', async () => {
      await expect(authorize({ email: '', password: '' })).rejects.toThrow(
        'Email and password are required',
      );
    });

    it('should throw error if user not found', async () => {
      (prisma.user.findUnique as Mock).mockResolvedValue(null);
      await expect(
        authorize({ email: 'test@example.com', password: 'password' }),
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw error if password invalid', async () => {
      (prisma.user.findUnique as Mock).mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        password: 'hashed-password',
      });
      (bcrypt.compare as Mock).mockResolvedValue(false);

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
      (bcrypt.compare as Mock).mockResolvedValue(true);

      const result = await authorize({
        email: 'test@example.com',
        password: 'password',
        rememberMe: 'true',
      });

      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        userName: 'johndoe',
        role: 'USER',
        locale: 'en',
        rememberMe: true,
      });
    });

    it('should handle rememberMe as "on"', async () => {
      (prisma.user.findUnique as Mock).mockResolvedValue({
        id: '1',
        password: 'hp',
      });
      (bcrypt.compare as Mock).mockResolvedValue(true);

      const result = (await authorize({
        email: 'a@b.com',
        password: 'p',
        rememberMe: 'on',
      })) as { rememberMe: boolean };
      expect(result.rememberMe).toBe(true);
    });
  });
});
