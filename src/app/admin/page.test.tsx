import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getSessionSafely: vi.fn(),
  getOverview: vi.fn(),
}));

vi.mock('@/lib/auth/safeSession', () => ({
  getSessionSafely: mocks.getSessionSafely,
}));
vi.mock('@/server/modules/admin/userInsightsService', () => ({
  UserInsightsService: { getOverview: mocks.getOverview },
}));
vi.mock('./DashboardView', () => ({ default: () => null }));

import AdminDashboardPage from './page';

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads the overview with the session role and passes it to the view', async () => {
    const overview = { totalUsers: 1 };
    mocks.getSessionSafely.mockResolvedValue({
      user: { id: 'a1', role: 'ADMIN' },
    });
    mocks.getOverview.mockResolvedValue(overview);

    const element = (await AdminDashboardPage()) as unknown as {
      props: { overview: unknown };
    };

    expect(mocks.getOverview).toHaveBeenCalledWith('ADMIN');
    expect(element.props.overview).toBe(overview);
  });

  it('passes an undefined role to the service when there is no session', async () => {
    mocks.getSessionSafely.mockResolvedValue(null);
    mocks.getOverview.mockResolvedValue({});

    await AdminDashboardPage();

    expect(mocks.getOverview).toHaveBeenCalledWith(undefined);
  });
});
