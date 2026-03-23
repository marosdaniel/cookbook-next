import type { MetadataOption } from '../../types';

export interface BasicsSectionProps {
  categories: MetadataOption[];
  levels: MetadataOption[];
  labels: MetadataOption[];
  cuisines: MetadataOption[];
  servingUnits: MetadataOption[];
  costLevels: MetadataOption[];
  dietaryFlags: MetadataOption[];
  allergens: MetadataOption[];
  equipment: MetadataOption[];
  onNext: () => void;
}
