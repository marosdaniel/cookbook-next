import type { MetadataOption } from '../../types';

export interface BasicsSectionProps {
  categories: MetadataOption[];
  levels: MetadataOption[];
  labels: MetadataOption[];
  onNext: () => void;
}
