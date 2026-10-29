import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
}));

vi.mock('@/lib/auth/auth', () => ({ auth: mocks.auth }));

vi.mock('@/server/platform/logger', () => ({
  logger: { warn: mocks.warn, debug: mocks.debug },
}));

import { getSessionSafely } from './safeSession';

describe('getSessionSafely', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the session when a user is signed in', async () => {
    const session = { user: { id: 'u1', role: 'USER' } };
    mocks.auth.mockResolvedValue(session);

    await expect(getSessionSafely()).resolves.toBe(session);
  });

  it('returns null when there is no session or no user id', async () => {
    mocks.auth.mockResolvedValueOnce(null);
    await expect(getSessionSafely()).resolves.toBeNull();

    mocks.auth.mockResolvedValueOnce({ user: {} });
    await expect(getSessionSafely()).resolves.toBeNull();
  });

  it('treats a revoked session as anonymous without a warning', async () => {
    mocks.auth.mockRejectedValue(new Error('Session has been revoked'));

    await expect(getSessionSafely()).resolves.toBeNull();
    expect(mocks.debug).toHaveBeenCalledTimes(1);
    expect(mocks.warn).not.toHaveBeenCalled();
  });

  it('logs unexpected failures and treats the request as anonymous', async () => {
    const failure = new Error('database unavailable');
    mocks.auth.mockRejectedValue(failure);

    await expect(getSessionSafely()).resolves.toBeNull();
    expect(mocks.warn).toHaveBeenCalledWith(
      { err: failure },
      expect.stringContaining('treating request as anonymous'),
    );
  });
});
