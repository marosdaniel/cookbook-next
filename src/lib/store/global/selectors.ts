import { type RootState, useAppSelector } from '../store';

export const selectLocale = (state: RootState) => state.global.locale;
export const selectIsDarkMode = (state: RootState) => state.global.isDarkMode;

export const useLocale = () => useAppSelector(selectLocale);
export const useIsDarkMode = () => useAppSelector(selectIsDarkMode);
export const useGlobal = () =>
  useAppSelector((state: RootState) => state.global);
