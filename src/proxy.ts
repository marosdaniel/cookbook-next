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
  const userRole = (req.auth?.user as { role?: UserRole })?.role;
  const { pathname } = req.nextUrl;

  // Check route authorization via centralized policy
  const routeFamily = getRouteFamilyForPath(pathname);
  const isAuthorized = canAccessRouteFamily(routeFamily, userRole);

  if (!isAuthorized) {
    const callbackPath = `${pathname}${req.nextUrl.search}`;
    const callbackUrl = encodeURIComponent(callbackPath);
    return NextResponse.redirect(
      new URL(`${AUTH_ROUTES.LOGIN}?callbackUrl=${callbackUrl}`, req.nextUrl),
    );
  }
});

export default proxy;

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
