import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma/prisma';
import type { Locale } from '@/types/common';
import { authConfig } from './auth.config';
import { verifyPassword } from './password';

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
    async session(context) {
      if (context.token.revoked) {
        throw new Error('Session has been revoked');
      }

      return configuredSession ? configuredSession(context) : context.session;
    },
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        });

        if (!user) {
          throw new Error('Invalid email or password');
        }

        // Verify password
        const isPasswordValid = await verifyPassword(
          credentials.password as string,
          user.password,
        );

        if (!isPasswordValid) {
          throw new Error('Invalid email or password');
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
