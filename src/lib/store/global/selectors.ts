import { type RootState, useAppSelector } from '../store';

export const selectLocale = (state: RootState) => state.global.locale;
export const useLocale = () => useAppSelector(selectLocale);
export const useGlobal = () =>
  useAppSelector((state: RootState) => state.global);
