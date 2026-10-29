import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma/prisma';
import { getRateLimitClientKey } from '@/lib/rateLimit/clientIp';
import { checkLoginRateLimit } from '@/lib/rateLimit/rateLimit';
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

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt(context) {
      const token = configuredJwt
        ? await configuredJwt(context)
        : context.token;

      if (token.id) {
        const currentUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { sessionVersion: true },
        });

        if (
          !currentUser ||
          (token.authVersion !== undefined &&
            token.authVersion !== currentUser.sessionVersion)
        ) {
          token.revoked = true;
        } else {
          token.authVersion = currentUser.sessionVersion;
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
