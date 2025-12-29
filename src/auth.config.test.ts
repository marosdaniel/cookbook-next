import type { Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import { describe, expect, it } from 'vitest';
import { authConfig } from './auth.config';

describe('authConfig', () => {
  it('should have the correct session strategy and maxAge', () => {
    expect(authConfig.session).toEqual({
      strategy: 'jwt',
      maxAge: 14 * 24 * 60 * 60,
    });
  });

  it('should have the correct pages configuration', () => {
    expect(authConfig.pages?.signIn).toBeDefined();
    expect(authConfig.pages?.error).toBeDefined();
  });

  describe('callbacks', () => {
    describe('jwt', () => {
      it('should add user data to token on sign in', async () => {
        const token = { existing: 'data' } as JWT;
        const user = {
          id: 'user-id',
          role: 'ADMIN',
          userName: 'johndoe',
          firstName: 'John',
          lastName: 'Doe',
          locale: 'hu',
          rememberMe: true,
        };

        const result = await (
          authConfig.callbacks as unknown as {
            jwt: (c: unknown) => Promise<JWT>;
          }
        ).jwt({
          token,
          user: user as unknown,
          account: null,
          profile: {},
          trigger: 'signIn',
        });

        expect(result).toEqual({
          existing: 'data',
          id: 'user-id',
          role: 'ADMIN',
          userName: 'johndoe',
          firstName: 'John',
          lastName: 'Doe',
          locale: 'hu',
          rememberMe: true,
          maxAge: 14 * 24 * 60 * 60,
        });
      });

      it('should set shorter maxAge if rememberMe is false', async () => {
        const token = {} as JWT;
        const user = {
          rememberMe: false,
        };

        const result = await (
          authConfig.callbacks as unknown as {
            jwt: (c: unknown) => Promise<JWT>;
          }
        ).jwt({
          token,
          user: user as unknown,
          account: null,
        });

        expect(result.maxAge).toBe(2 * 60 * 60);
      });

      it('should return original token if user is not provided', async () => {
        const token = { some: 'token' } as JWT;
        const result = await (
          authConfig.callbacks as unknown as {
            jwt: (c: unknown) => Promise<JWT>;
          }
        ).jwt({
          token,
          user: null,
          account: null,
        });
        expect(result).toEqual(token);
      });
    });

    describe('session', () => {
      it('should add user data from token to session', async () => {
        const session = {
          user: { name: 'Placeholder' },
          expires: '2025-01-01',
        } as Session;
        const token = {
          id: 'token-id',
          role: 'USER',
          userName: 'testuser',
          firstName: 'Test',
          lastName: 'User',
          locale: 'en-gb',
          rememberMe: true,
          maxAge: 12345,
        } as unknown as JWT;

        const result = await (
          authConfig.callbacks as unknown as {
            session: (c: unknown) => Promise<Session & { maxAge?: number }>;
          }
        ).session({
          session,
          token,
          user: {} as unknown,
          newSession: {} as unknown,
          trigger: 'update',
        });

        expect(result.user).toMatchObject({
          id: 'token-id',
          role: 'USER',
          userName: 'testuser',
          firstName: 'Test',
          lastName: 'User',
          locale: 'en-gb',
          rememberMe: true,
        });
        expect(result.maxAge).toBe(12345);
      });

      it('should use default values if token values are missing', async () => {
        const session = { user: {} } as Session;
        const token = {} as JWT;

        const result = await (
          authConfig.callbacks as unknown as {
            session: (c: unknown) => Promise<Session>;
          }
        ).session({
          session,
          token,
          user: {} as unknown,
        });

        expect(result.user).toMatchObject({
          role: 'USER',
          userName: '',
          firstName: '',
          lastName: '',
          locale: 'en-gb',
        });
      });
    });
  });
});
