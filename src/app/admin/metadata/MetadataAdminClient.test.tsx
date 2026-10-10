import '@testing-library/jest-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { REORDER_METADATA, SET_METADATA_ACTIVE } from '@/lib/graphql/mutations';
import {
  METADATA_TYPES,
  type MetadataTypeName,
} from '@/lib/metadata/metadataTypes';
import { fireEvent, render, screen, within } from '@/utils/test-utils';
import type { TranslationKeysByType } from './types';

const mocks = vi.hoisted(() => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  setMetadataActive: vi.fn(),
  reorderMetadata: vi.fn(),
  defaultMutation: vi.fn(),
}));

vi.mock('@apollo/client/react', () => ({
  useQuery: (...args: unknown[]) => mocks.useQuery(...args),
  useMutation: (...args: unknown[]) => mocks.useMutation(...args),
}));

import MetadataAdminClient from './MetadataAdminClient';

const translationKeysByType = Object.fromEntries(
  METADATA_TYPES.map((type) => [type, [] as string[]]),
) as TranslationKeysByType;
translationKeysByType.CATEGORY = ['category-soup', 'category-salad'];

const categoryItems = [
  {
    id: 'cat-1',
    type: 'CATEGORY' as MetadataTypeName,
    key: 'soup',
    translationKey: 'category-soup',
    sortOrder: 10,
    isActive: true,
  },
  {
    id: 'cat-2',
    type: 'CATEGORY' as MetadataTypeName,
    key: 'salad',
    translationKey: 'category-salad',
    sortOrder: 20,
    isActive: false,
  },
];

describe('MetadataAdminClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useQuery.mockReturnValue({
      loading: false,
      data: { getAdminMetadata: categoryItems },
    });
    mocks.useMutation.mockImplementation((document: unknown) => {
      if (document === SET_METADATA_ACTIVE) {
        return [mocks.setMetadataActive, { loading: false }];
      }
      if (document === REORDER_METADATA) {
        return [mocks.reorderMetadata, { loading: false }];
      }
      return [mocks.defaultMutation, { loading: false }];
    });
  });

  it('lists the items of the first type in order', () => {
    render(
      <MetadataAdminClient translationKeysByType={translationKeysByType} />,
    );

    expect(screen.getByTestId('admin-metadata-page')).toBeInTheDocument();
    expect(screen.getByTestId('admin-metadata-row-cat-1')).toBeInTheDocument();
    expect(screen.getByTestId('admin-metadata-row-cat-2')).toBeInTheDocument();
    expect(screen.getByTestId('admin-metadata-tab-CATEGORY')).toHaveTextContent(
      '2',
    );
  });

  it('shows the empty state for a type without items', () => {
    render(
      <MetadataAdminClient translationKeysByType={translationKeysByType} />,
    );

    fireEvent.click(screen.getByTestId('admin-metadata-tab-LABEL'));

    expect(screen.getByTestId('admin-metadata-empty')).toBeInTheDocument();
  });

  it('shows skeleton rows while the first response is pending', () => {
    mocks.useQuery.mockReturnValue({ loading: true, data: undefined });

    render(
      <MetadataAdminClient translationKeysByType={translationKeysByType} />,
    );

    expect(screen.getByTestId('admin-metadata-loading')).toBeInTheDocument();
  });

  it('deactivates an item through the activation mutation', async () => {
    render(
      <MetadataAdminClient translationKeysByType={translationKeysByType} />,
    );

    const row = screen.getByTestId('admin-metadata-row-cat-1');
    fireEvent.click(within(row).getByRole('switch'));

    expect(mocks.setMetadataActive).toHaveBeenCalledWith({
      variables: { id: 'cat-1', isActive: false },
    });
  });

  it('moves an item down through the reorder mutation', () => {
    render(
      <MetadataAdminClient translationKeysByType={translationKeysByType} />,
    );

    fireEvent.click(screen.getByTestId('admin-metadata-move-down-cat-1'));

    expect(mocks.reorderMetadata).toHaveBeenCalledWith({
      variables: { type: 'CATEGORY', orderedIds: ['cat-2', 'cat-1'] },
    });
  });

  it('opens the create form for the active type', async () => {
    render(
      <MetadataAdminClient translationKeysByType={translationKeysByType} />,
    );

    fireEvent.click(screen.getByTestId('admin-metadata-create'));

    expect(
      await screen.findByTestId('admin-metadata-form'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('admin-metadata-key-input')).toBeEnabled();
  });
});
