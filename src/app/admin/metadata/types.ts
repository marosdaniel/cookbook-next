import type { MetadataTypeName } from '@/lib/metadata/metadataTypes';

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
