export interface ComposerHeaderProps {
  title: string;
  onBack: () => void;
  completion: { done: number; total: number; percent: number };
  lastSavedLabel: string;
  onSave: () => void;
  onPreview: () => void;
  onPublish: () => void;
  publishLoading: boolean;
  submitLabel: string;
}
