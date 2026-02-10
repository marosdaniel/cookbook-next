'use client';

import { useQuery } from '@apollo/client/react';
import { useEffect } from 'react';
import { GET_ALL_METADATA } from '@/lib/graphql/queries';
import { useAppDispatch } from '../store';
import type { Metadata } from './metadata';
import { setMetadata, setMetadataError, setMetadataLoading } from './metadata';

interface GetAllMetadataResponse {
  getAllMetadata: Metadata[];
}

/**
 * Custom hook to fetch and manage metadata in Redux store
 * Fetches metadata from GraphQL API and populates Redux store
 * Should be called once at app initialization
 */
export const useFetchMetadata = () => {
  const dispatch = useAppDispatch();

  const { data, loading, error, refetch } = useQuery<GetAllMetadataResponse>(
    GET_ALL_METADATA,
    {
      fetchPolicy: 'cache-first', // Use cache if available, otherwise fetch
      notifyOnNetworkStatusChange: true,
    },
  );

  useEffect(() => {
    dispatch(setMetadataLoading(loading));
  }, [loading, dispatch]);

  useEffect(() => {
    if (data?.getAllMetadata) {
      dispatch(setMetadata(data.getAllMetadata));
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
