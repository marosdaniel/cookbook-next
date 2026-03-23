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
  cuisines: Metadata[];
  servingUnits: Metadata[];
  dietaryFlags: Metadata[];
  allergens: Metadata[];
  equipment: Metadata[];
  costLevels: Metadata[];
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
}

const initialState: MetadataState = {
  categories: [],
  labels: [],
  units: [],
  levels: [],
  cuisines: [],
  servingUnits: [],
  dietaryFlags: [],
  allergens: [],
  equipment: [],
  costLevels: [],
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
      state.cuisines = metadata.filter((m) =>
        ['cuisine', 'CUISINE'].includes(m.type),
      );
      state.servingUnits = metadata.filter((m) =>
        ['serving_unit', 'SERVING_UNIT'].includes(m.type),
      );
      state.dietaryFlags = metadata.filter((m) =>
        ['diet', 'DIET'].includes(m.type),
      );
      state.allergens = metadata.filter((m) =>
        ['allergen', 'ALLERGEN'].includes(m.type),
      );
      state.equipment = metadata.filter((m) =>
        ['equipment', 'EQUIPMENT'].includes(m.type),
      );
      state.costLevels = metadata.filter((m) =>
        ['cost_level', 'COST_LEVEL'].includes(m.type),
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
      state.cuisines = [];
      state.servingUnits = [];
      state.dietaryFlags = [];
      state.allergens = [];
      state.equipment = [];
      state.costLevels = [];
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
