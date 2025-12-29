import { NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock next/server
vi.mock('next/server', () => ({
  NextResponse: {
    redirect: vi.fn((url: string) => ({ type: 'redirect', url })),
  },
}));

// Mock NextAuth
const mockNextAuth = vi.fn(() => ({
  auth: (fn: (req: unknown) => unknown) => (req: unknown) => fn(req),
}));

vi.mock('next-auth', () => ({
  default: mockNextAuth,
}));

describe('proxy.ts (Middleware)', () => {
  // biome-ignore lint/suspicious/noExplicitAny: middleware type is complex to mock fully
  let middleware: (req: any) => any;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Re-import to trigger initialization
    const proxyModule = await import('./proxy');
    // biome-ignore lint/suspicious/noExplicitAny: necessary cast for mock
    middleware = proxyModule.default as (req: any) => any;
  });

  it('should redirect unauthenticated users from /me routes', () => {
    const nextUrl = new URL('http://localhost:3000/me/profile');
    const req = {
      auth: null,
      nextUrl,
    };

    middleware(req);

    expect(NextResponse.redirect).toHaveBeenCalled();
    const redirectUrl = (
      NextResponse.redirect as unknown as {
        mock: {
          calls: string[][];
        };
      }
    ).mock.calls[0][0].toString();
    expect(redirectUrl).toContain('/login');
    expect(redirectUrl).toContain('callbackUrl=%2Fme%2Fprofile');
  });

  it('should not redirect authenticated users from /me routes', () => {
    const req = {
      auth: { user: { id: '1' } },
      nextUrl: new URL('http://localhost:3000/me/profile'),
    };

    const result = middleware(req);

    expect(NextResponse.redirect).not.toHaveBeenCalled();
    expect(result).toBeUndefined(); // middleware continues
  });

  it('should not redirect from non-protected routes even if unauthenticated', () => {
    const req = {
      auth: null,
      nextUrl: new URL('http://localhost:3000/'),
    };

    const result = middleware(req);

    expect(NextResponse.redirect).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });
});
