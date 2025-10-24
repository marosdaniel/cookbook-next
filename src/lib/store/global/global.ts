import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { setStoredLocale } from '@/lib/locale';

type GlobalState = {
  locale: string;
};

const initialState: GlobalState = {
  locale: 'en',
};

const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    setLocale(state, action: PayloadAction<string>) {
      state.locale = action.payload;
      setStoredLocale(action.payload);
    },
  },
});

export const { setLocale } = globalSlice.actions;

export default globalSlice.reducer;
