import type { NextAuthConfig } from 'next-auth';
import { createIssuedAt, createTokenId } from './password';
import { AUTH_ROUTES } from '../../types/routes';

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
      if (user) {
        const sessionMaxAge = user.rememberMe ? 14 * 24 * 60 * 60 : 2 * 60 * 60;
        token.id = user.id;
        token.role = user.role;
        token.userName = user.userName;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.locale = user.locale;
        token.rememberMe = user.rememberMe;
        token.maxAge = sessionMaxAge;
        token.jti = createTokenId();
        token.iat = createIssuedAt();
      }
      return token;
    },
    async session({ session, token }) {
      // Add user data from token to session
      if (token && session.user) {
        session.user.id = token.id ?? '';
        session.user.role = token.role ?? 'USER';
        session.user.userName = token.userName ?? '';
        session.user.firstName = token.firstName ?? '';
        session.user.lastName = token.lastName ?? '';
        session.user.locale = token.locale ?? 'en-gb';
        session.user.rememberMe = token.rememberMe ?? false;
        session.maxAge = token.maxAge ?? 2 * 60 * 60; // 2 hours
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
