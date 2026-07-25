'use client';

import { useQuery } from '@apollo/client/react';
import { GET_ALL_METADATA } from '@/lib/graphql/queries';
import { useAppDispatch, useAppSelector } from '../store';
import type { Metadata } from './metadata';
import { setMetadata, setMetadataError, setMetadataLoading } from './metadata';
import { useEffect } from 'react';

interface GetAllMetadataResponse {
  getAllMetadata: Metadata[];
}

/**
 * Custom hook to fetch and manage metadata in Redux store.
 * Because the Redux store is pre-seeded from the static METADATA constant at
 * startup, `isLoaded` is already `true` and the GraphQL query is always
 * skipped in normal operation.  `refetch` is retained so callers can manually
 * re-hydrate if needed (e.g. after an admin update to metadata).
 */
export const useFetchMetadata = () => {
  const dispatch = useAppDispatch();
  const isMetadataLoaded = useAppSelector((state) => state.metadata.isLoaded);

  const { data, loading, error, refetch } = useQuery<GetAllMetadataResponse>(
    GET_ALL_METADATA,
    {
      fetchPolicy: 'cache-first',
      notifyOnNetworkStatusChange: true,
      skip: isMetadataLoaded,
    },
  );

  useEffect(() => {
    dispatch(setMetadataLoading(loading));
  }, [loading, dispatch]);

  useEffect(() => {
    if (data?.getAllMetadata) {
      const metadata = data.getAllMetadata.filter((item): item is Metadata =>
        Boolean(item?.key && item?.label && item?.type && item?.name),
      );

      dispatch(setMetadata(metadata));
    }
  }, [data, dispatch]);

  useEffect(() => {
    if (error) {
      dispatch(setMetadataError(error.message));
    }
  }, [error, dispatch]);

  return {
    loading,
    error,
    refetch,
  };
};

