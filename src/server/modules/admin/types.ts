import type { MetadataType } from '@prisma/client';

export interface MetadataCreateDomainInput {
  type: MetadataType;
  key: string;
  translationKey: string;
}

export interface MetadataUpdateDomainInput {
  translationKey: string;
}
