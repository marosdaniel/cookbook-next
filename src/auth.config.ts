import type { NextAuthConfig } from 'next-auth';
import type { Locale } from '@/types/common';
import { AUTH_ROUTES } from './types/routes';

export const authConfig = {
  providers: [],
  session: {
    strategy: 'jwt',
    maxAge: 14 * 24 * 60 * 60, // 14 days
  },
  pages: {
    signIn: AUTH_ROUTES.LOGIN,
    error: AUTH_ROUTES.LOGIN,
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add user data to token on sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.userName = user.userName;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.locale = user.locale;
        token.rememberMe = user.rememberMe;
        token.maxAge = user.rememberMe ? 14 * 24 * 60 * 60 : 2 * 60 * 60;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user data from token to session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role ??
          'USER') as import('@prisma/client').UserRole;
        session.user.userName = (token.userName as string) ?? '';
        session.user.firstName = (token.firstName as string) ?? '';
        session.user.lastName = (token.lastName as string) ?? '';
        session.user.locale = (token.locale as Locale) ?? 'en-gb';
        session.user.rememberMe = token.rememberMe as boolean;
        session.maxAge = token.maxAge as number;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
