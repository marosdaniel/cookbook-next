import type { NextAuthConfig } from 'next-auth';
import { AUTH_ROUTES } from '../../types/routes';
import { createIssuedAt, createTokenId } from './password';

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
        token.id = user.id;
        token.role = user.role;
        token.userName = user.userName;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.locale = user.locale;
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
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
