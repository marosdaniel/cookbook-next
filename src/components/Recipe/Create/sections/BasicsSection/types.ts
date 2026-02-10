import type { TMetadataCleaned } from '../../types';

export interface BasicsSectionProps {
  categories: TMetadataCleaned[];
  levels: TMetadataCleaned[];
  labels: TMetadataCleaned[];
  onNext: () => void;
}
