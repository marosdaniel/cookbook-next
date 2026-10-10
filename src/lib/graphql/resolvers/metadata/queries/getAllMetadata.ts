import { MetadataService } from '@/lib/services/MetadataService';

export const getAllMetadata = async () => MetadataService.getActiveMetadata();
