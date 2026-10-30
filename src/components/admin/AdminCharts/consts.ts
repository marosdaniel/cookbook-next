import type { InsightUserRole } from '../../../types/adminInsights';

// Theme color names, so the charts follow the light and dark color scheme.
export const ROLE_CHART_COLORS: Record<InsightUserRole, string> = {
  ADMIN: 'pink.6',
  BLOGGER: 'violet.6',
  USER: 'teal.6',
};
