import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/utils/test-utils';

type ChartSeries = { name: string; label: string; color: string };

type ChartMockProps = {
  data: unknown[];
  series: ChartSeries[];
  dataKey: string;
  'data-testid'?: string;
};

type DonutMockProps = {
  data: { name: string; value: number; color: string }[];
  chartLabel?: string;
};

// Recharts needs a measured container, which does not exist in happy-dom, so
// the Mantine chart components are replaced with simple probes.
vi.mock('@mantine/charts', () => ({
  AreaChart: (props: ChartMockProps) => (
    <div
      data-testid={props['data-testid']}
      data-kind="area"
      data-points={props.data.length}
      data-key={props.dataKey}
      data-series={props.series[0].name}
      data-series-label={props.series[0].label}
    />
  ),
  BarChart: (props: ChartMockProps) => (
    <div
      data-testid={props['data-testid']}
      data-kind="bar"
      data-points={props.data.length}
      data-key={props.dataKey}
      data-series={props.series[0].name}
      data-series-label={props.series[0].label}
    />
  ),
  DonutChart: (props: DonutMockProps) => (
    <div data-testid="donut" data-label={props.chartLabel}>
      {props.data.map((item) => (
        <span key={item.name} data-color={item.color}>
          {item.name}={item.value}
        </span>
      ))}
    </div>
  ),
}));

import {
  RegistrationsChart,
  RoleDonutChart,
  TopAuthorsChart,
} from './AdminCharts';

describe('AdminCharts', () => {
  it('passes the daily registrations to the area chart', () => {
    render(
      <RegistrationsChart
        seriesLabel="New users"
        data={[
          { date: '2026-10-29', label: '10-29', registrations: 0 },
          { date: '2026-10-30', label: '10-30', registrations: 3 },
        ]}
      />,
    );

    const chart = screen.getByTestId('admin-registrations-chart');

    expect(chart).toHaveAttribute('data-kind', 'area');
    expect(chart).toHaveAttribute('data-points', '2');
    expect(chart).toHaveAttribute('data-key', 'label');
    expect(chart).toHaveAttribute('data-series', 'registrations');
    expect(chart).toHaveAttribute('data-series-label', 'New users');
  });

  it('renders the registrations chart for an empty data set', () => {
    render(<RegistrationsChart seriesLabel="New users" data={[]} />);

    expect(screen.getByTestId('admin-registrations-chart')).toHaveAttribute(
      'data-points',
      '0',
    );
  });

  it('maps roles to donut segments with theme colors and shows the total', () => {
    render(
      <RoleDonutChart
        total={6}
        roles={[
          { role: 'ADMIN', label: 'Admin', count: 1 },
          { role: 'BLOGGER', label: 'Blogger', count: 0 },
          { role: 'USER', label: 'User', count: 5 },
        ]}
      />,
    );

    const donut = screen.getByTestId('donut');

    expect(screen.getByTestId('admin-roles-chart')).toBeInTheDocument();
    expect(donut).toHaveAttribute('data-label', '6');
    expect(donut.querySelector('[data-color="pink.6"]')).toHaveTextContent(
      'Admin=1',
    );
    expect(donut.querySelector('[data-color="teal.6"]')).toHaveTextContent(
      'User=5',
    );
  });

  it('lists every role with its count in the legend', () => {
    render(
      <RoleDonutChart
        total={0}
        roles={[{ role: 'USER', label: 'User', count: 0 }]}
      />,
    );

    expect(screen.getByText('User: 0')).toBeInTheDocument();
  });

  it('passes the top authors to the bar chart', () => {
    render(
      <TopAuthorsChart
        seriesLabel="Recipes"
        data={[
          { id: 'u1', userName: 'ada', recipes: 4 },
          { id: 'u2', userName: 'bob', recipes: 2 },
        ]}
      />,
    );

    const chart = screen.getByTestId('admin-authors-chart');

    expect(chart).toHaveAttribute('data-kind', 'bar');
    expect(chart).toHaveAttribute('data-points', '2');
    expect(chart).toHaveAttribute('data-key', 'userName');
    expect(chart).toHaveAttribute('data-series', 'recipes');
  });
});
