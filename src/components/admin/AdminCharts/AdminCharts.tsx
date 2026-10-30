'use client';

import { ColorSwatch, Group, Stack, Text } from '@mantine/core';
import { useId } from 'react';
import {
  AREA_HEIGHT,
  AREA_MARGIN,
  AREA_WIDTH,
  DONUT_CIRCUMFERENCE,
  DONUT_RADIUS,
  DONUT_SIZE,
  DONUT_THICKNESS,
  GRID_COLOR,
  MAX_X_LABELS,
  PINK,
  ROLE_CHART_COLORS,
  TEXT_COLOR,
  VIOLET,
  Y_TICK_COUNT,
} from './consts';
import type {
  DonutSegment,
  RegistrationsChartProps,
  RoleDonutChartProps,
  TopAuthorsChartProps,
} from './types';
import { getNiceMax, toCssVariable } from './utils';

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

export const RoleDonutChart = ({
  roles,
  total,
}: Readonly<RoleDonutChartProps>) => {
  const sum = roles.reduce((acc, item) => acc + item.count, 0);
  const center = DONUT_SIZE / 2;

  const segments: DonutSegment[] = [];
  let offset = 0;

  for (const item of roles) {
    const length = sum > 0 ? (item.count / sum) * DONUT_CIRCUMFERENCE : 0;

    segments.push({ item, length, offset });
    offset += length;
  }

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
            .map((segment) => (
              <circle
                key={segment.item.role}
                cx={center}
                cy={center}
                r={DONUT_RADIUS}
                fill="none"
                stroke={toCssVariable(ROLE_CHART_COLORS[segment.item.role])}
                strokeWidth={DONUT_THICKNESS}
                strokeDasharray={`${segment.length} ${DONUT_CIRCUMFERENCE - segment.length}`}
                strokeDashoffset={-segment.offset}
              >
                <title>{`${segment.item.label}: ${segment.item.count}`}</title>
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
