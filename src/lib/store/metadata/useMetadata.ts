'use client';

import { useApolloClient, useQuery } from '@apollo/client/react';
import { useEffect, useRef } from 'react';
import { GET_ALL_METADATA } from '@/lib/graphql/queries';
import { useAppDispatch, useAppSelector } from '../store';
import type { Metadata } from './metadata';
import { setMetadata, setMetadataError, setMetadataLoading } from './metadata';

interface GetAllMetadataResponse {
  getAllMetadata: Metadata[];
}

let hasRequestedMetadataLoad = false;

/**
 * Custom hook to fetch and manage metadata in Redux store
 * Fetches metadata from GraphQL API and populates Redux store
 * Should be called once at app initialization
 */
export const useFetchMetadata = () => {
  const dispatch = useAppDispatch();
  const isMetadataLoaded = useAppSelector((state) => state.metadata.isLoaded);
  const client = useApolloClient();
  const wasMetadataLoaded = useRef(false);

  let hasCachedMetadata = false;
  try {
    hasCachedMetadata = Boolean(
      client.readQuery<GetAllMetadataResponse>({
        query: GET_ALL_METADATA,
      }),
    );
  } catch {
    hasCachedMetadata = false;
  }

  const shouldRequestMetadata =
    !isMetadataLoaded && !hasCachedMetadata && !hasRequestedMetadataLoad;

  if (shouldRequestMetadata) {
    hasRequestedMetadataLoad = true;
  }

  const { data, loading, error, refetch } = useQuery<GetAllMetadataResponse>(
    GET_ALL_METADATA,
    {
      fetchPolicy: 'cache-first', // Use cache if available, otherwise fetch
      notifyOnNetworkStatusChange: true,
      skip: !shouldRequestMetadata,
    },
  );

  useEffect(() => {
    if (wasMetadataLoaded.current && !isMetadataLoaded) {
      hasRequestedMetadataLoad = false;
    }

    wasMetadataLoaded.current = isMetadataLoaded;
  }, [isMetadataLoaded]);

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
