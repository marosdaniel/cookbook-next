import { MetadataService } from '@/lib/services/MetadataService';

export const getMetadataByType = async (
  _: unknown,
  { type }: { type: string },
) => MetadataService.getActiveMetadata(type);
