'use client';

import type { FC, PropsWithChildren } from 'react';
import { useFetchMetadata } from '@/lib/store/metadata';

/**
 * MetadataProvider component that fetches metadata on mount
 * Should be placed high in the component tree (e.g., in root layout)
 */
export const MetadataProvider: FC<PropsWithChildren> = ({ children }) => {
  useFetchMetadata();

  return <>{children}</>;
};

export default MetadataProvider;
