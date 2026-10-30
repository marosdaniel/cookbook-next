import type { InsightUserRole } from '../../../types/adminInsights';
import { toCssVariable } from './utils';

export const ROLE_CHART_COLORS: Record<InsightUserRole, string> = {
  // Theme color names, so the charts follow the light and dark color scheme.
  ADMIN: 'pink.6',
  BLOGGER: 'violet.6',
  USER: 'teal.6',
};

export const AREA_WIDTH = 640;
export const AREA_HEIGHT = 280;
export const AREA_MARGIN = { top: 12, right: 12, bottom: 28, left: 32 };

export const GRID_COLOR = 'var(--mantine-color-default-border)';
export const TEXT_COLOR = 'var(--mantine-color-dimmed)';
export const PINK = toCssVariable('pink.6');
export const VIOLET = toCssVariable('violet.6');

export const Y_TICK_COUNT = 4;
export const MIN_Y_MAX = 4;
export const MAX_X_LABELS = 6;

export const DONUT_SIZE = 190;
export const DONUT_THICKNESS = 26;
export const DONUT_RADIUS = (DONUT_SIZE - DONUT_THICKNESS) / 2;
export const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;
