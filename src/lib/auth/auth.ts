import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma/prisma';
import { getRateLimitClientKey } from '@/lib/rateLimit/clientIp';
import { checkLoginRateLimit } from '@/lib/rateLimit/rateLimit';
import {
  cacheKeys,
  getCachedValue,
  SESSION_VERSION_CACHE_TTL_SECONDS,
  setCachedValue,
} from '@/server/platform/cache';
import type { Locale } from '@/types/common';
import { authConfig } from './auth.config';
import {
  hashPassword,
  needsPasswordRehash,
  verifyDummyPassword,
  verifyPassword,
} from './password';

const configuredJwt = authConfig.callbacks?.jwt;
const configuredSession = authConfig.callbacks?.session;

const resolveUserSessionVersion = async (
  userId: string,
): Promise<number | null> => {
  const cacheKey = cacheKeys.sessionVersion(userId);
  const cachedVersion = await getCachedValue<number>(cacheKey);
  if (typeof cachedVersion === 'number') {
    return cachedVersion;
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { sessionVersion: true },
  });

  if (!currentUser) {
    return null;
  }

  await setCachedValue(
    cacheKey,
    currentUser.sessionVersion,
    SESSION_VERSION_CACHE_TTL_SECONDS,
  );
  return currentUser.sessionVersion;
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt(context) {
      const token = configuredJwt
        ? await configuredJwt(context)
        : context.token;

      if (token.id) {
        const currentSessionVersion = await resolveUserSessionVersion(token.id);

        if (
          currentSessionVersion === null ||
          (token.authVersion !== undefined &&
            token.authVersion !== currentSessionVersion)
        ) {
          token.revoked = true;
        } else {
          token.authVersion = currentSessionVersion;
        }
      }

      return token;
    },
    session(context) {
      if (context.token.revoked) {
        return Promise.reject(new Error('Session has been revoked'));
      }

      return Promise.resolve(
        configuredSession ? configuredSession(context) : context.session,
      );
    },
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const normalizedEmail = (credentials.email as string)
          .trim()
          .toLowerCase();
        const plainPassword = credentials.password as string;
        const clientIp =
          request instanceof Request
            ? getRateLimitClientKey(request)
            : undefined;

        const rateLimitResult = await checkLoginRateLimit(
          normalizedEmail,
          clientIp,
        );
        if (!rateLimitResult.success) {
          throw new Error('Invalid email or password');
        }

        // Find user by normalized email
        const user = await prisma.user.findUnique({
          where: {
            email: normalizedEmail,
          },
        });

        if (!user) {
          await verifyDummyPassword(plainPassword);
          throw new Error('Invalid email or password');
        }

        // Verify password
        const isPasswordValid = await verifyPassword(
          plainPassword,
          user.password,
        );

        if (!isPasswordValid) {
          throw new Error('Invalid email or password');
        }

        if (needsPasswordRehash(user.password)) {
          try {
            const upgradedHash = await hashPassword(plainPassword);
            await prisma.user.update({
              where: { id: user.id },
              data: { password: upgradedHash },
            });
          } catch {
            // Best-effort transparent rehash; do not fail a valid login
          }
        }

        // Return user object that will be stored in session
        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userName: user.userName,
          role: user.role,
          locale: user.locale as Locale,
          sessionVersion: user.sessionVersion ?? 0,
        };
      },
    }),
  ],
});
