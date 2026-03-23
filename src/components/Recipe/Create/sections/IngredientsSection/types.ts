import type { MetadataOption } from '../../types';

export interface IngredientsSectionProps {
  unitOptions: MetadataOption[];
  onAdd: () => void;
  onBack: () => void;
  onNext: () => void;
}
