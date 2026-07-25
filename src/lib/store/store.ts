import { configureStore } from '@reduxjs/toolkit';
import {
  type TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from 'react-redux';
import { METADATA } from '@/lib/data/metadata';
import { globalReducer } from './global';
import { groupMetadata, metadataReducer } from './metadata';

/**
 * Pre-compute the metadata buckets from the static METADATA constant so the
 * slice starts fully populated. This eliminates the getAllMetadata GraphQL call
 * entirely — the resolver returns this same constant, so there is nothing to
 * fetch at runtime.
 */
const preloadedMetadata = {
  ...groupMetadata(METADATA),
  isLoading: false,
  isLoaded: true,
  error: null,
};

export const store = configureStore({
  reducer: {
    global: globalReducer,
    metadata: metadataReducer,
  },
  preloadedState: {
    metadata: preloadedMetadata,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

