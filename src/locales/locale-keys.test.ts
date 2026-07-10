import { describe, expect, it } from 'vitest';

import de from './de.json';
import enGb from './en-gb.json';

const getValue = (source: Record<string, unknown>, key: string) =>
  key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }

    return undefined;
  }, source);

describe('locale translations', () => {
  it.each([
    ['de', de, 'recipeCreate.headerTitle'],
    ['de', de, 'recipeCreate.submitLabel'],
    ['de', de, 'recipeCreate.resetLabel'],
    ['de', de, 'home.carouselEmpty'],
    ['de', de, 'home.recentlyViewed'],
    ['de', de, 'home.recentlyViewedHint'],
    ['de', de, 'units.minuteShort'],
    ['en-gb', enGb, 'recipeCreate.headerTitle'],
    ['en-gb', enGb, 'recipeCreate.submitLabel'],
    ['en-gb', enGb, 'recipeCreate.resetLabel'],
  ])('keeps the %s translation key %s available', (_locale, source, key) => {
    expect(getValue(source as Record<string, unknown>, key)).toBeDefined();
    expect(getValue(source as Record<string, unknown>, key)).not.toBe('');
  });
});
