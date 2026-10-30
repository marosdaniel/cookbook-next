import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@/utils/test-utils';
import {
  RegistrationsChart,
  RoleDonutChart,
  TopAuthorsChart,
} from './AdminCharts';

describe('AdminCharts', () => {
  it('renders the registrations chart with a tooltip for every day', () => {
    const { container } = render(
      <RegistrationsChart
        seriesLabel="New users"
        data={[
          { date: '2026-10-29', label: '10-29', registrations: 0 },
          { date: '2026-10-30', label: '10-30', registrations: 3 },
        ]}
      />,
    );

    expect(screen.getByTestId('admin-registrations-chart')).toBeInTheDocument();
    expect(container.querySelectorAll('circle')).toHaveLength(2);
    expect(container.textContent).toContain('10-30: 3');
  });

  it('renders an empty registrations chart without crashing', () => {
    render(<RegistrationsChart seriesLabel="New users" data={[]} />);

    expect(screen.getByTestId('admin-registrations-chart')).toBeInTheDocument();
  });

  it('draws a donut segment only for roles that have users', () => {
    const { container } = render(
      <RoleDonutChart
        total={6}
        roles={[
          { role: 'ADMIN', label: 'Admin', count: 1 },
          { role: 'BLOGGER', label: 'Blogger', count: 0 },
          { role: 'USER', label: 'User', count: 5 },
        ]}
      />,
    );

    expect(screen.getByTestId('admin-roles-chart')).toBeInTheDocument();
    // Track circle plus two non-empty segments.
    expect(container.querySelectorAll('circle')).toHaveLength(3);
    expect(screen.getByText('User: 5')).toBeInTheDocument();
  });

  it('renders only the donut track when nobody is registered', () => {
    const { container } = render(
      <RoleDonutChart
        total={0}
        roles={[{ role: 'USER', label: 'User', count: 0 }]}
      />,
    );

    expect(container.querySelectorAll('circle')).toHaveLength(1);
  });

  it('renders a bar for every author', () => {
    render(
      <TopAuthorsChart
        seriesLabel="Recipes"
        data={[
          { id: 'u1', userName: 'ada', recipes: 4 },
          { id: 'u2', userName: 'bob', recipes: 2 },
        ]}
      />,
    );

    expect(screen.getByTestId('admin-authors-chart')).toBeInTheDocument();
    expect(screen.getByText('@ada')).toBeInTheDocument();
    expect(screen.getByLabelText('bob: 2 Recipes')).toBeInTheDocument();
  });
});
