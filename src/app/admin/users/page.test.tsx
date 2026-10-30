import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getSessionSafely: vi.fn(),
  listUsers: vi.fn(),
}));

vi.mock('@/lib/auth/safeSession', () => ({
  getSessionSafely: mocks.getSessionSafely,
}));
vi.mock('@/server/modules/admin/userInsightsService', () => ({
  UserInsightsService: { listUsers: mocks.listUsers },
}));
vi.mock('./UsersView', () => ({ default: () => null }));

import AdminUsersPage from './page';

describe('AdminUsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSessionSafely.mockResolvedValue({
      user: { id: 'a1', role: 'ADMIN' },
    });
    mocks.listUsers.mockResolvedValue({ users: [] });
  });

  it('passes the search parameters and the session role to the service', async () => {
    await AdminUsersPage({
      searchParams: Promise.resolve({ q: 'ada', role: 'ADMIN', page: '2' }),
    });

    expect(mocks.listUsers).toHaveBeenCalledWith('ADMIN', {
      search: 'ada',
      role: 'ADMIN',
      page: 2,
    });
  });

  it('uses the first value of repeated parameters and no page by default', async () => {
    await AdminUsersPage({
      searchParams: Promise.resolve({ q: ['ada', 'bob'] }),
    });

    expect(mocks.listUsers).toHaveBeenCalledWith('ADMIN', {
      search: 'ada',
      role: undefined,
      page: undefined,
    });
  });
});
