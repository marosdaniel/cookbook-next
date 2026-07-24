import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth/auth.config';
import {
  canAccessRouteFamily,
  getRouteFamilyForPath,
} from '@/lib/auth/routePolicies';
import { AUTH_ROUTES } from '@/types/routes';
import type { UserRole } from '@/types/user';

const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
  const nonce = Buffer.from(randomUUID()).toString('base64');

  const isDevelopment = process.env.NODE_ENV === 'development';

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://va.vercel-scripts.com${
      isDevelopment ? " 'unsafe-eval'" : ''
    }`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-nonce', nonce);

  const userRole = (req.auth?.user as { role?: UserRole })?.role;
  const { pathname } = req.nextUrl;

  const routeFamily = getRouteFamilyForPath(pathname);
  const isAuthorized = canAccessRouteFamily(routeFamily, userRole);

  if (!isAuthorized) {
    const callbackPath = `${pathname}${req.nextUrl.search}`;
    const callbackUrl = encodeURIComponent(callbackPath);

    const response = NextResponse.redirect(
      new URL(`${AUTH_ROUTES.LOGIN}?callbackUrl=${callbackUrl}`, req.nextUrl),
    );

    response.headers.set('Content-Security-Policy', csp);
    return response;
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set('Content-Security-Policy', csp);
  return response;
});

export default proxy;

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
