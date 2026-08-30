import type { Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { authConfig, getSessionCookieConfig } from './auth.config';

const redirectCallback = authConfig.callbacks?.redirect;

describe('authConfig', () => {
  it('should have the correct session strategy and fixed maxAge', () => {
    expect(authConfig.session).toEqual({
      strategy: 'jwt',
      maxAge: 14 * 24 * 60 * 60,
    });
  });

  it('should have the correct pages configuration', () => {
    expect(authConfig.pages?.signIn).toBeDefined();
    expect(authConfig.pages?.error).toBeDefined();
  });

  describe('session cookie security contract', () => {
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('is always HttpOnly, SameSite=Lax and scoped to the root path', () => {
      const config = getSessionCookieConfig();
      expect(config.options.httpOnly).toBe(true);
      expect(config.options.sameSite).toBe('lax');
      expect(config.options.path).toBe('/');
    });

    it('uses a non-secure, unprefixed cookie name over http (e.g. local dev)', () => {
      vi.stubEnv('NEXTAUTH_URL', 'http://localhost:3000');

      const config = getSessionCookieConfig();

      expect(config.name).toBe('authjs.session-token');
      expect(config.options.secure).toBe(false);
    });

    it('uses a Secure, __Secure-prefixed cookie name over https (production)', () => {
      vi.stubEnv('NEXTAUTH_URL', 'https://cookbook-next.vercel.app');

      const config = getSessionCookieConfig();

      expect(config.name).toBe('__Secure-authjs.session-token');
      expect(config.options.secure).toBe(true);
    });

    it('applies the same contract to the wired authConfig.cookies.sessionToken', () => {
      expect(authConfig.cookies?.sessionToken).toEqual(
        getSessionCookieConfig(),
      );
    });
  });

  describe('callbacks', () => {
    describe('redirect', () => {
      it('should allow only safe relative callback URLs', async () => {
        const result = await redirectCallback?.({
          url: '/me/profile?tab=settings',
          baseUrl: 'http://localhost:3000',
        } as never);

        expect(result).toBe('/me/profile?tab=settings');
      });

      it('should reject external callback URLs', async () => {
        const result = await redirectCallback?.({
          url: 'https://evil.example.com',
          baseUrl: 'http://localhost:3000',
        } as never);

        expect(result).toBe('http://localhost:3000');
      });
    });

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
          jti: expect.any(String),
          iat: expect.any(Number),
        });
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
        } as unknown as JWT;

        const result = await (
          authConfig.callbacks as unknown as {
            session: (c: unknown) => Promise<Session>;
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
        });
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
