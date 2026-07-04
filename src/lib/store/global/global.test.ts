import { describe, expect, it } from 'vitest';

import { globalReducer, setDarkMode, setLocale } from './global';

describe('global reducer', () => {
  it('uses the default state', () => {
    const state = globalReducer(undefined, { type: '@@INIT' });

    expect(state.locale).toBe('en-gb');
    expect(state.isDarkMode).toBe(false);
  });

  it('updates locale and dark mode', () => {
    const state = globalReducer(undefined, { type: '@@INIT' });
    const localeState = globalReducer(state, setLocale('de'));
    const updatedState = globalReducer(localeState, setDarkMode(true));

    expect(updatedState.locale).toBe('de');
    expect(updatedState.isDarkMode).toBe(true);
  });
});
