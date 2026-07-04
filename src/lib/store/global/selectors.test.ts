import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockState = {
  global: {
    locale: 'de',
    isDarkMode: true,
  },
};

vi.mock('../store', () => ({
  useAppSelector: (selector: (state: typeof mockState) => unknown) =>
    selector(mockState),
}));

import {
  selectIsDarkMode,
  selectLocale,
  useGlobal,
  useIsDarkMode,
  useLocale,
} from './selectors';

describe('global selectors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('selects locale and dark mode values', () => {
    expect(selectLocale(mockState as never)).toBe('de');
    expect(selectIsDarkMode(mockState as never)).toBe(true);
  });

  it('returns the selected global state from hooks', () => {
    expect(useLocale()).toBe('de');
    expect(useIsDarkMode()).toBe(true);
    expect(useGlobal()).toEqual(mockState.global);
  });
});
