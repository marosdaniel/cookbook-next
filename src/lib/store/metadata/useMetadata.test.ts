import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockUseQuery, mockUseApolloClient, mockReadQuery } = vi.hoisted(() => ({
  mockUseQuery: vi.fn(),
  mockUseApolloClient: vi.fn(),
  mockReadQuery: vi.fn(),
}));

vi.mock('@apollo/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@apollo/client')>();

  return {
    ...actual,
    useApolloClient: mockUseApolloClient,
  };
});

vi.mock('@apollo/client/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@apollo/client/react')>();

  return {
    ...actual,
    useApolloClient: mockUseApolloClient,
    useQuery: mockUseQuery,
  };
});

vi.mock('../store', () => ({
  useAppDispatch: () => vi.fn(),
  useAppSelector: (
    selector: (state: { metadata: { isLoaded: boolean } }) => unknown,
  ) => selector({ metadata: { isLoaded: true } }),
}));

import { useFetchMetadata } from './useMetadata';

describe('useFetchMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseApolloClient.mockReturnValue({
      readQuery: mockReadQuery,
    });
    mockReadQuery.mockReturnValue(null);
    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it('skips the metadata query once the metadata slice is already loaded in Redux', () => {
    renderHook(() => useFetchMetadata());

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ skip: true }),
    );
  });
});
