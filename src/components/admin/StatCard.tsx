'use client';

import { Group, Paper, Text, ThemeIcon } from '@mantine/core';
import clsx from 'clsx';
import { animate, useReducedMotion } from 'motion/react';
import { type CSSProperties, type ReactNode, useEffect, useState } from 'react';
import classes from './admin.module.css';

const COUNT_UP_DURATION_SECONDS = 0.8;
const REVEAL_STEP_MS = 70;

type AnimatedNumberProps = {
  value: number;
  locale: string;
};

const AnimatedNumber = ({ value, locale }: Readonly<AnimatedNumberProps>) => {
  const reduceMotion = useReducedMotion();
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (reduceMotion) {
      setDisplayed(value);
      return undefined;
    }

    const controls = animate(0, value, {
      duration: COUNT_UP_DURATION_SECONDS,
      ease: 'easeOut',
      onUpdate: (latest) => setDisplayed(Math.round(latest)),
    });

    return () => controls.stop();
  }, [value, reduceMotion]);

  return <>{new Intl.NumberFormat(locale).format(displayed)}</>;
};

type StatCardProps = {
  label: string;
  value: number;
  hint?: string;
  icon: ReactNode;
  locale: string;
  index?: number;
};

export const StatCard = ({
  label,
  value,
  hint,
  icon,
  locale,
  index = 0,
}: Readonly<StatCardProps>) => (
  <Paper
    withBorder
    p="md"
    radius="md"
    shadow="xs"
    className={clsx(classes.statCard, classes.reveal)}
    style={{ '--reveal-delay': `${index * REVEAL_STEP_MS}ms` } as CSSProperties}
    data-testid="admin-stat-card"
  >
    <Group justify="space-between" align="flex-start" wrap="nowrap">
      <div>
        <Text size="xs" tt="uppercase" fw={700} c="dimmed">
          {label}
        </Text>
        <Text className={classes.statValue}>
          <AnimatedNumber value={value} locale={locale} />
        </Text>
      </div>
      <ThemeIcon variant="light" color="pink" size={40} radius="md">
        {icon}
      </ThemeIcon>
    </Group>
    {hint ? (
      <Text size="xs" c="dimmed" mt="xs">
        {hint}
      </Text>
    ) : null}
  </Paper>
);
