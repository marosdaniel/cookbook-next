import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

export interface Metadata {
  key: string;
  label: string;
  type: string;
  name: string;
}

export interface MetadataState {
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

/**
 * Groups a flat metadata array into typed buckets.
 * Used both by the `setMetadata` reducer and for store preloading from
 * the static METADATA constant — so the bucketing logic lives in one place.
 */
export const groupMetadata = (
  items: Metadata[],
): Omit<MetadataState, 'isLoading' | 'isLoaded' | 'error'> => ({
  categories: items.filter((m) => ['category', 'CATEGORY'].includes(m.type)),
  labels: items.filter((m) => ['label', 'LABEL'].includes(m.type)),
  units: items.filter((m) => ['unit', 'UNIT'].includes(m.type)),
  levels: items.filter((m) =>
    ['level', 'DIFFICULTY_LEVEL'].includes(m.type),
  ),
  cuisines: items.filter((m) => ['cuisine', 'CUISINE'].includes(m.type)),
  servingUnits: items.filter((m) =>
    ['serving_unit', 'SERVING_UNIT'].includes(m.type),
  ),
  dietaryFlags: items.filter((m) => ['diet', 'DIET'].includes(m.type)),
  allergens: items.filter((m) =>
    ['allergen', 'ALLERGEN'].includes(m.type),
  ),
  equipment: items.filter((m) =>
    ['equipment', 'EQUIPMENT'].includes(m.type),
  ),
  costLevels: items.filter((m) =>
    ['cost_level', 'COST_LEVEL'].includes(m.type),
  ),
});

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
      Object.assign(state, groupMetadata(action.payload));
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
