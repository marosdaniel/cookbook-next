import { describe, expect, it } from 'vitest';

import {
  clearMetadata,
  metadataReducer,
  setMetadata,
  setMetadataError,
  setMetadataLoaded,
  setMetadataLoading,
} from './metadata';

describe('metadata reducer', () => {
  it('returns the initial state by default', () => {
    const state = metadataReducer(undefined, { type: '@@INIT' });

    expect(state.isLoading).toBe(false);
    expect(state.isLoaded).toBe(false);
    expect(state.error).toBeNull();
    expect(state.categories).toEqual([]);
  });

  it('updates loading and loaded flags', () => {
    const state = metadataReducer(undefined, setMetadataLoading(true));
    const nextState = metadataReducer(state, setMetadataLoaded(true));

    expect(nextState.isLoading).toBe(true);
    expect(nextState.isLoaded).toBe(true);
  });

  it('stores metadata errors', () => {
    const state = metadataReducer(undefined, setMetadataError('boom'));

    expect(state.error).toBe('boom');
  });

  it('groups metadata by type and can clear it again', () => {
    const state = metadataReducer(
      undefined,
      setMetadata([
        { key: 'cat', label: 'Cat', type: 'CATEGORY', name: 'cat' },
        { key: 'lab', label: 'Lab', type: 'LABEL', name: 'lab' },
        { key: 'unit', label: 'Unit', type: 'UNIT', name: 'unit' },
      ]),
    );

    expect(state.categories).toHaveLength(1);
    expect(state.labels).toHaveLength(1);
    expect(state.units).toHaveLength(1);
    expect(state.isLoaded).toBe(true);
    expect(state.isLoading).toBe(false);

    const cleared = metadataReducer(state, clearMetadata());
    expect(cleared.categories).toEqual([]);
    expect(cleared.isLoaded).toBe(false);
  });
});
