import type { NextAuthConfig } from 'next-auth';
import { AUTH_ROUTES } from '../../types/routes';
import { createIssuedAt, createTokenId } from './password';

// Explicit, testable cookie security contract instead of relying on NextAuth's
// implicit per-request "useSecureCookies" default. Mirrors that default
// (secure cookies + `__Secure-` prefix only when served over https).
export const isSecureCookieDeployment = (): boolean =>
  (process.env.NEXTAUTH_URL ?? '').startsWith('https://');

export const getSessionCookieConfig = () => {
  const secure = isSecureCookieDeployment();
  return {
    name: secure ? '__Secure-authjs.session-token' : 'authjs.session-token',
    options: {
      httpOnly: true,
      sameSite: 'lax' as const,
      path: '/',
      secure,
    },
  };
};

const isSafeRelativeCallbackUrl = (url: string | undefined): boolean => {
  if (!url) {
    return false;
  }

  const trimmedUrl = url.trim();
  if (!trimmedUrl) {
    return false;
  }

  if (trimmedUrl.startsWith('//') || trimmedUrl.startsWith('\\')) {
    return false;
  }

  if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmedUrl)) {
    return false;
  }

  return trimmedUrl.startsWith('/');
};

const getSafeCallbackUrl = (
  url: string | undefined,
  baseUrl: string,
): string => {
  return isSafeRelativeCallbackUrl(url) ? (url as string) : baseUrl;
};

export const authConfig = {
  providers: [],
  session: {
    strategy: 'jwt',
    maxAge: 14 * 24 * 60 * 60, // 14 days
  },
  cookies: {
    sessionToken: getSessionCookieConfig(),
  },
  pages: {
    signIn: AUTH_ROUTES.LOGIN,
    error: AUTH_ROUTES.LOGIN,
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      return getSafeCallbackUrl(url, baseUrl);
    },
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
