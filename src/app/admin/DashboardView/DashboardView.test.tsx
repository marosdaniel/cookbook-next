import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import type { UserOverview } from '@/types/adminInsights';
import { render, screen } from '@/utils/test-utils';

vi.mock('@/components/admin/AdminCharts/AdminCharts', () => ({
  RegistrationsChart: () => <div data-testid="registrations-chart" />,
  RoleDonutChart: () => <div data-testid="roles-chart" />,
  TopAuthorsChart: () => <div data-testid="authors-chart" />,
}));

import DashboardView from './DashboardView';

const overview: UserOverview = {
  totalUsers: 6,
  newUsers7d: 2,
  newUsers30d: 4,
  usersWithRecipes: 3,
  registrations: [{ date: '2026-10-30', label: '10-30', registrations: 1 }],
  roles: [
    { role: 'ADMIN', count: 1 },
    { role: 'BLOGGER', count: 0 },
    { role: 'USER', count: 5 },
  ],
  topAuthors: [{ id: 'u1', userName: 'ada', recipes: 4 }],
  recentUsers: [
    {
      id: 'u1',
      firstName: 'Ada',
      lastName: 'Lovelace',
      userName: 'ada',
      email: 'ada@example.com',
      role: 'ADMIN',
      recipeCount: 4,
      joinedAt: '2026-10-01T08:00:00.000Z',
    },
  ],
};

// The global next-intl mock (vitest.setup.mts) returns the last segment of the
// translation key, e.g. `dashboard.recentUsers.empty` renders as `empty`.
describe('DashboardView', () => {
  it('renders the stat cards, the charts and the newest members', () => {
    render(<DashboardView overview={overview} />);

    expect(screen.getByTestId('admin-dashboard-page')).toBeInTheDocument();
    expect(screen.getAllByTestId('admin-stat-card')).toHaveLength(4);
    expect(screen.getByTestId('registrations-chart')).toBeInTheDocument();
    expect(screen.getByTestId('roles-chart')).toBeInTheDocument();
    expect(screen.getByTestId('authors-chart')).toBeInTheDocument();
    expect(screen.getByText(/@ada/)).toBeInTheDocument();
    expect(screen.getByTestId('role-badge-admin')).toBeInTheDocument();
  });

  it('shows the final value of the animated stat numbers', () => {
    render(<DashboardView overview={overview} />);

    const cards = screen.getAllByTestId('admin-stat-card');

    expect(cards[0]).toHaveTextContent('6');
    expect(cards[1]).toHaveTextContent('2');
  });

  it('shows empty states instead of the charts and lists when there is no data', () => {
    render(
      <DashboardView
        overview={{ ...overview, topAuthors: [], recentUsers: [] }}
      />,
    );

    expect(screen.queryByTestId('authors-chart')).not.toBeInTheDocument();
    expect(screen.getByText('topAuthorsEmpty')).toBeInTheDocument();
    expect(screen.getByText('empty')).toBeInTheDocument();
  });
});
