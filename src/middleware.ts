import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import { AUTH_ROUTES } from '@/types/routes';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Protect /me routes
  if (pathname.startsWith('/me')) {
    if (!isLoggedIn) {
      const callbackUrl = encodeURIComponent(pathname);
      return NextResponse.redirect(
        new URL(`${AUTH_ROUTES.LOGIN}?callbackUrl=${callbackUrl}`, req.nextUrl),
      );
    }
  }
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
