'use client';

import '@mantine/charts/styles.css';
import { AreaChart, BarChart, DonutChart } from '@mantine/charts';
import { ColorSwatch, Group, Stack, Text } from '@mantine/core';
import { ROLE_CHART_COLORS } from './consts';
import type {
  RegistrationsChartProps,
  RoleDonutChartProps,
  TopAuthorsChartProps,
} from './types';
import { toCssVariable } from './utils';

export const RegistrationsChart = ({
  data,
  seriesLabel,
}: Readonly<RegistrationsChartProps>) => (
  <AreaChart
    h={280}
    data={[...data]}
    dataKey="label"
    series={[{ name: 'registrations', label: seriesLabel, color: 'pink.6' }]}
    curveType="monotone"
    withDots={false}
    tickLine="x"
    yAxisProps={{ allowDecimals: false }}
    data-testid="admin-registrations-chart"
  />
);

export const RoleDonutChart = ({
  roles,
  total,
}: Readonly<RoleDonutChartProps>) => (
  <Stack align="center" gap="md" data-testid="admin-roles-chart">
    <DonutChart
      size={190}
      thickness={26}
      withTooltip
      chartLabel={String(total)}
      data={roles.map((item) => ({
        name: item.label,
        value: item.count,
        color: ROLE_CHART_COLORS[item.role],
      }))}
    />
    <Group gap="md" justify="center">
      {roles.map((item) => (
        <Group key={item.role} gap={6} wrap="nowrap">
          <ColorSwatch
            size={10}
            withShadow={false}
            color={toCssVariable(ROLE_CHART_COLORS[item.role])}
          />
          <Text size="sm">
            {item.label}: {item.count}
          </Text>
        </Group>
      ))}
    </Group>
  </Stack>
);

export const TopAuthorsChart = ({
  data,
  seriesLabel,
}: Readonly<TopAuthorsChartProps>) => (
  <BarChart
    h={260}
    data={[...data]}
    dataKey="userName"
    series={[{ name: 'recipes', label: seriesLabel, color: 'violet.6' }]}
    tickLine="y"
    yAxisProps={{ allowDecimals: false }}
    data-testid="admin-authors-chart"
  />
);
