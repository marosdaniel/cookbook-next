import type { ReactNode } from 'react';
import type { RecipePreviewValues } from '../types';

export type RecipeStatsProps = {
  values: RecipePreviewValues;
};

export type StatCardProps = {
  label: string;
  value: string;
  icon: ReactNode;
};

export type TimePartProps = {
  label: string;
  value: number;
};
