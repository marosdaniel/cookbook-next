import { NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { UserRole } from '@/types/user';

// Mock next/server
vi.mock('next/server', () => {
  const createResponse = (type: 'redirect' | 'next', url?: URL) => {
    const headers = new Headers();
    return {
      type,
      url: url?.toString(),
      headers,
    };
  };

  return {
    NextResponse: {
      redirect: vi.fn((url: string | URL) =>
        createResponse('redirect', new URL(String(url), 'http://localhost')),
      ),
      next: vi.fn((init?: { request?: { headers?: Headers } }) => {
        const response = createResponse('next');
        if (init?.request?.headers) {
          response.headers = init.request.headers;
        }
        return response;
      }),
    },
  };
});

// Mock NextAuth
const mockNextAuth = vi.fn(() => ({
  auth: (fn: (req: unknown) => unknown) => (req: unknown) => fn(req),
}));

vi.mock('next-auth', () => ({
  default: mockNextAuth,
}));

describe('proxy.ts', () => {
  const userRole: UserRole = 'USER';
  const adminRole: UserRole = 'ADMIN';

  // biome-ignore lint/suspicious/noExplicitAny: proxy type is complex to mock fully
  let proxyFn: (req: any) => any;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Re-import to trigger initialization
    const proxyModule = await import('./proxy');
    // biome-ignore lint/suspicious/noExplicitAny: necessary cast for mock
    proxyFn = proxyModule.default as (req: any) => any;
  });

  it('should redirect unauthenticated users from /me routes', () => {
    const nextUrl = new URL('http://localhost:3000/me/profile');
    const req = {
      auth: null,
      nextUrl,
    };

    proxyFn(req);

    expect(NextResponse.redirect).toHaveBeenCalled();
    const redirectUrl = (
      NextResponse.redirect as unknown as {
        mock: {
          calls: Array<[string | URL]>;
        };
      }
    ).mock.calls[0][0].toString();
    expect(redirectUrl).toContain('/login');
    expect(redirectUrl).toContain('callbackUrl=%2Fme%2Fprofile');
  });

  it('should preserve query parameters in the callback URL for protected routes', () => {
    const nextUrl = new URL(
      'http://localhost:3000/me/profile?tab=settings&sort=asc',
    );
    const req = {
      auth: null,
      nextUrl,
    };

    proxyFn(req);

    expect(NextResponse.redirect).toHaveBeenCalled();
    const redirectUrl = (
      NextResponse.redirect as unknown as {
        mock: {
          calls: Array<[string | URL]>;
        };
      }
    ).mock.calls[0][0].toString();
    expect(redirectUrl).toContain(
      'callbackUrl=%2Fme%2Fprofile%3Ftab%3Dsettings%26sort%3Dasc',
    );
  });

  it('should not redirect authenticated users from /me routes', () => {
    const req = {
      auth: { user: { id: '1', role: userRole } },
      nextUrl: new URL('http://localhost:3000/me/profile'),
    };

    const result = proxyFn(req);

    expect(NextResponse.redirect).not.toHaveBeenCalled();
    expect(result).toBeDefined();
    expect(result?.headers).toBeDefined();
  });

  it('should allow ADMIN users to access /admin routes', () => {
    const req = {
      auth: { user: { id: '1', role: adminRole } },
      nextUrl: new URL('http://localhost:3000/admin'),
    };

    const result = proxyFn(req);

    expect(NextResponse.redirect).not.toHaveBeenCalled();
    expect(result).toBeDefined();
    expect(result?.headers).toBeDefined();
  });

  it('should reject non-admin users from /admin routes', () => {
    const nextUrl = new URL('http://localhost:3000/admin');
    const req = {
      auth: { user: { id: '1', role: userRole } },
      nextUrl,
    };

    proxyFn(req);

    expect(NextResponse.redirect).toHaveBeenCalled();
    const redirectUrl = (
      NextResponse.redirect as unknown as {
        mock: {
          calls: Array<[string | URL]>;
        };
      }
    ).mock.calls[0][0].toString();
    expect(redirectUrl).toContain('/login');
  });

  it('should not redirect from non-protected routes even if unauthenticated', () => {
    const req = {
      auth: null,
      nextUrl: new URL('http://localhost:3000/'),
    };

    const result = proxyFn(req);

    expect(NextResponse.redirect).not.toHaveBeenCalled();
    expect(result).toBeDefined();
    expect(result?.headers).toBeDefined();
  });
});
