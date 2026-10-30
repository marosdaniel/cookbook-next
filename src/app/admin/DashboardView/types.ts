import type { ReactNode } from 'react';
import type { UserOverview } from '../../../types/adminInsights';

export type DashboardViewProps = {
  overview: UserOverview;
};

export type PanelProps = {
  title: string;
  testId: string;
  children: ReactNode;
};
