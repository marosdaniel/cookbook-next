import type {
  DailyRegistration,
  InsightUserRole,
  TopAuthor,
} from '../../../types/adminInsights';

export type RegistrationsChartProps = {
  data: readonly DailyRegistration[];
  seriesLabel: string;
};

export type RoleChartItem = {
  role: InsightUserRole;
  label: string;
  count: number;
};

export type RoleDonutChartProps = {
  roles: readonly RoleChartItem[];
  total: number;
};

export type DonutSegment = {
  item: RoleChartItem;
  length: number;
  offset: number;
};

export type TopAuthorsChartProps = {
  data: readonly TopAuthor[];
  seriesLabel: string;
};
