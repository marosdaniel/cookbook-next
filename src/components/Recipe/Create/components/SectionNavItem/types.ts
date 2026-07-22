import type { ReactNode } from 'react';

export interface SectionNavItemProps {
  label: string;
  hint: string;
  icon: ReactNode;
  active: boolean;
  completionDone: number;
  completionTotal: number;
  onClick: () => void;
}
