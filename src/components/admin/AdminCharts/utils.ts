import { MIN_Y_MAX, Y_TICK_COUNT } from './consts';

/** Rounds the maximum up to a multiple of the tick count, so ticks are integers. */
export const getNiceMax = (value: number): number =>
  Math.max(MIN_Y_MAX, Math.ceil(value / Y_TICK_COUNT) * Y_TICK_COUNT);

export const toCssVariable = (color: string): string =>
  `var(--mantine-color-${color.replace('.', '-')})`;
