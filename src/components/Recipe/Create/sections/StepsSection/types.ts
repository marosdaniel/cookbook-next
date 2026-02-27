export interface StepsSectionProps {
  onAdd: () => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitLabel?: string;
}
