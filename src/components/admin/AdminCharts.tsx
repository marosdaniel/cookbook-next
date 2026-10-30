'use client';

import { ColorSwatch, Group, Stack, Text } from '@mantine/core';
import { useId } from 'react';
import type {
  DailyRegistration,
  InsightUserRole,
  TopAuthor,
} from '@/types/adminInsights';

// Theme color names, so the charts follow the light and dark color scheme.
const ROLE_CHART_COLORS: Record<InsightUserRole, string> = {
  ADMIN: 'pink.6',
  BLOGGER: 'violet.6',
  USER: 'teal.6',
};

const toCssVariable = (color: string): string =>
  `var(--mantine-color-${color.replace('.', '-')})`;

const GRID_COLOR = 'var(--mantine-color-default-border)';
const TEXT_COLOR = 'var(--mantine-color-dimmed)';
const PINK = toCssVariable('pink.6');
const VIOLET = toCssVariable('violet.6');

const Y_TICK_COUNT = 4;
const MIN_Y_MAX = 4;
const MAX_X_LABELS = 6;

/** Rounds the maximum up to a multiple of the tick count, so ticks are integers. */
const getNiceMax = (value: number): number =>
  Math.max(MIN_Y_MAX, Math.ceil(value / Y_TICK_COUNT) * Y_TICK_COUNT);

type RegistrationsChartProps = {
  data: readonly DailyRegistration[];
  seriesLabel: string;
};

const AREA_WIDTH = 640;
const AREA_HEIGHT = 280;
const AREA_MARGIN = { top: 12, right: 12, bottom: 28, left: 32 };

export const RegistrationsChart = ({
  data,
  seriesLabel,
}: Readonly<RegistrationsChartProps>) => {
  const gradientId = useId();
  const innerWidth = AREA_WIDTH - AREA_MARGIN.left - AREA_MARGIN.right;
  const innerHeight = AREA_HEIGHT - AREA_MARGIN.top - AREA_MARGIN.bottom;
  const baseline = AREA_MARGIN.top + innerHeight;
  const max = getNiceMax(Math.max(0, ...data.map((d) => d.registrations)));
  const lastIndex = data.length - 1;

  const getX = (index: number): number =>
    lastIndex > 0
      ? AREA_MARGIN.left + (index / lastIndex) * innerWidth
      : AREA_MARGIN.left + innerWidth / 2;
  const getY = (value: number): number =>
    AREA_MARGIN.top + innerHeight - (value / max) * innerHeight;

  const points = data.map((item, index) => ({
    x: getX(index),
    y: getY(item.registrations),
    item,
  }));
  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`)
    .join(' ');
  const areaPath =
    points.length > 0
      ? `${linePath} L${points[points.length - 1].x} ${baseline} L${points[0].x} ${baseline} Z`
      : '';
  const labelStep = Math.max(1, Math.ceil(data.length / MAX_X_LABELS));
  const ticks = Array.from(
    { length: Y_TICK_COUNT + 1 },
    (_, index) => (max / Y_TICK_COUNT) * index,
  );

  return (
    <svg
      viewBox={`0 0 ${AREA_WIDTH} ${AREA_HEIGHT}`}
      width="100%"
      height={AREA_HEIGHT}
      preserveAspectRatio="none"
      role="img"
      aria-label={seriesLabel}
      data-testid="admin-registrations-chart"
    >
      <title>{seriesLabel}</title>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={PINK} stopOpacity={0.35} />
          <stop offset="100%" stopColor={PINK} stopOpacity={0.02} />
        </linearGradient>
      </defs>

      {ticks.map((tick) => (
        <g key={tick}>
          <line
            x1={AREA_MARGIN.left}
            x2={AREA_WIDTH - AREA_MARGIN.right}
            y1={getY(tick)}
            y2={getY(tick)}
            stroke={GRID_COLOR}
            strokeDasharray="3 3"
          />
          <text
            x={AREA_MARGIN.left - 6}
            y={getY(tick)}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize={11}
            fill={TEXT_COLOR}
          >
            {tick}
          </text>
        </g>
      ))}

      {areaPath ? <path d={areaPath} fill={`url(#${gradientId})`} /> : null}
      {linePath ? (
        <path
          d={linePath}
          fill="none"
          stroke={PINK}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ) : null}

      {points.map((point, index) => (
        <g key={point.item.date}>
          <circle cx={point.x} cy={point.y} r={8} fill="transparent">
            <title>{`${point.item.label}: ${point.item.registrations}`}</title>
          </circle>
          {index % labelStep === 0 ? (
            <text
              x={point.x}
              y={AREA_HEIGHT - 8}
              textAnchor="middle"
              fontSize={11}
              fill={TEXT_COLOR}
            >
              {point.item.label}
            </text>
          ) : null}
        </g>
      ))}
    </svg>
  );
};

type RoleChartItem = {
  role: InsightUserRole;
  label: string;
  count: number;
};

type RoleDonutChartProps = {
  roles: readonly RoleChartItem[];
  total: number;
};

const DONUT_SIZE = 190;
const DONUT_THICKNESS = 26;
const DONUT_RADIUS = (DONUT_SIZE - DONUT_THICKNESS) / 2;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

export const RoleDonutChart = ({
  roles,
  total,
}: Readonly<RoleDonutChartProps>) => {
  const sum = roles.reduce((acc, item) => acc + item.count, 0);
  const center = DONUT_SIZE / 2;

  const segments = roles.reduce<
    { item: RoleChartItem; length: number; offset: number }[]
  >((acc, item) => {
    const offset = acc.reduce((used, segment) => used + segment.length, 0);
    const length = sum > 0 ? (item.count / sum) * DONUT_CIRCUMFERENCE : 0;

    return [...acc, { item, length, offset }];
  }, []);

  return (
    <Stack align="center" gap="md" data-testid="admin-roles-chart">
      <svg
        viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}
        width={DONUT_SIZE}
        height={DONUT_SIZE}
        role="img"
        aria-label={roles.map((r) => `${r.label}: ${r.count}`).join(', ')}
      >
        <circle
          cx={center}
          cy={center}
          r={DONUT_RADIUS}
          fill="none"
          stroke={GRID_COLOR}
          strokeWidth={DONUT_THICKNESS}
        />
        <g transform={`rotate(-90 ${center} ${center})`}>
          {segments
            .filter((segment) => segment.length > 0)
            .map(({ item, length, offset }) => (
              <circle
                key={item.role}
                cx={center}
                cy={center}
                r={DONUT_RADIUS}
                fill="none"
                stroke={toCssVariable(ROLE_CHART_COLORS[item.role])}
                strokeWidth={DONUT_THICKNESS}
                strokeDasharray={`${length} ${DONUT_CIRCUMFERENCE - length}`}
                strokeDashoffset={-offset}
              >
                <title>{`${item.label}: ${item.count}`}</title>
              </circle>
            ))}
        </g>
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={28}
          fontWeight={700}
          fill="currentColor"
        >
          {total}
        </text>
      </svg>
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
};

type TopAuthorsChartProps = {
  data: readonly TopAuthor[];
  seriesLabel: string;
};

export const TopAuthorsChart = ({
  data,
  seriesLabel,
}: Readonly<TopAuthorsChartProps>) => {
  const max = Math.max(1, ...data.map((author) => author.recipes));

  return (
    <Stack gap="sm" data-testid="admin-authors-chart" aria-label={seriesLabel}>
      {data.map((author) => (
        <div key={author.id}>
          <Group justify="space-between" wrap="nowrap" mb={4}>
            <Text size="sm" truncate>
              @{author.userName}
            </Text>
            <Text size="sm" fw={600}>
              {author.recipes}
            </Text>
          </Group>
          <div
            role="img"
            aria-label={`${author.userName}: ${author.recipes} ${seriesLabel}`}
            style={{
              height: 10,
              borderRadius: 5,
              background: GRID_COLOR,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${(author.recipes / max) * 100}%`,
                height: '100%',
                borderRadius: 5,
                background: `linear-gradient(90deg, ${PINK}, ${VIOLET})`,
              }}
            />
          </div>
        </div>
      ))}
    </Stack>
  );
};
