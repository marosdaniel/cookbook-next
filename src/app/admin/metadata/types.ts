import type { MetadataTypeName } from '@/lib/metadata/metadataTypes';
import type { MoveDirection } from './utils';

export type AdminMetadataItem = {
  id: string;
  type: MetadataTypeName;
  key: string;
  translationKey: string;
  sortOrder: number;
  isActive: boolean;
};

export type TranslationKeysByType = Record<MetadataTypeName, string[]>;

export type MetadataFormState = {
  type: MetadataTypeName;
  item: AdminMetadataItem | null;
};

export type MetadataFormValues = {
  key: string;
  translationKey: string;
};

export type MetadataFormModalProps = {
  opened: boolean;
  state: MetadataFormState | null;
  translationKeys: readonly string[];
  onClose: () => void;
};

export type MetadataAdminClientProps = {
  translationKeysByType: TranslationKeysByType;
};

export type MetadataTableProps = {
  items: readonly AdminMetadataItem[];
  disabled: boolean;
  onMove: (item: AdminMetadataItem, direction: MoveDirection) => void;
  onToggleActive: (item: AdminMetadataItem, isActive: boolean) => void;
  onEdit: (item: AdminMetadataItem) => void;
};
