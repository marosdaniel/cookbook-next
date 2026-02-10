import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

export interface Metadata {
  key: string;
  label: string;
  type: string;
  name: string;
}

interface MetadataState {
  categories: Metadata[];
  labels: Metadata[];
  units: Metadata[];
  levels: Metadata[];
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
}

const initialState: MetadataState = {
  categories: [],
  labels: [],
  units: [],
  levels: [],
  isLoading: false,
  isLoaded: false,
  error: null,
};

const metadataSlice = createSlice({
  name: 'metadata',
  initialState,
  reducers: {
    setMetadataLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setMetadataLoaded(state, action: PayloadAction<boolean>) {
      state.isLoaded = action.payload;
    },
    setMetadataError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setMetadata(state, action: PayloadAction<Metadata[]>) {
      const metadata = action.payload;

      // Separate metadata by type
      state.categories = metadata.filter((m) =>
        ['category', 'CATEGORY'].includes(m.type),
      );
      state.labels = metadata.filter((m) =>
        ['label', 'LABEL'].includes(m.type),
      );
      state.units = metadata.filter((m) => ['unit', 'UNIT'].includes(m.type));
      state.levels = metadata.filter((m) =>
        ['level', 'DIFFICULTY_LEVEL'].includes(m.type),
      );

      state.isLoaded = true;
      state.isLoading = false;
      state.error = null;
    },
    clearMetadata(state) {
      state.categories = [];
      state.labels = [];
      state.units = [];
      state.levels = [];
      state.isLoaded = false;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setMetadataLoading,
  setMetadataLoaded,
  setMetadataError,
  setMetadata,
  clearMetadata,
} = metadataSlice.actions;

export const metadataReducer = metadataSlice.reducer;
