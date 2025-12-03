import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { Locale } from '../../../types/common';

type GlobalState = {
  locale: Locale;
  isDarkMode: boolean;
};

// TODO: When user authentication is implemented, initialize locale from user preferences
// Ideal solution:
// 1. If user is authenticated: use user.preferredLanguage from database
// 2. If user is not authenticated: detect from browser (navigator.language) in useEffect
// 3. Fallback to 'en' if neither is available
// This will require moving locale initialization to a client-side useEffect to avoid hydration mismatch
const initialState: GlobalState = {
  locale: 'en-gb',
  isDarkMode: false,
};

const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    // TODO: When user authentication is implemented, persist locale changes to user profile in database
    // This will ensure the user's language preference is saved across sessions and devices
    setLocale(state, action: PayloadAction<Locale>) {
      state.locale = action.payload;
    },
    setDarkMode(state, action: PayloadAction<boolean>) {
      state.isDarkMode = action.payload;
    },
  },
});

export const { setLocale, setDarkMode } = globalSlice.actions;
export const globalReducer = globalSlice.reducer;
