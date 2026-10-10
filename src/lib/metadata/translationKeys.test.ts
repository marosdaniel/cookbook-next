import { describe, expect, it } from 'vitest';
import de from '@/locales/de.json';
import enGb from '@/locales/en-gb.json';
import hu from '@/locales/hu.json';
import {
  getAvailableTranslationKeys,
  getAvailableTranslationKeysByType,
} from './translationKeys';

const localeMiscs = [enGb, hu, de].map((messages) =>
  Object.keys(messages.misc),
);

describe('translationKeys', () => {
  it('returns only keys with the type prefix that exist in every locale', async () => {
    const keys = await getAvailableTranslationKeys('CATEGORY');

    expect(keys).toContain('category-soup');
    expect(keys.every((key) => key.startsWith('category-'))).toBe(true);
    expect(
      keys.every((key) =>
        localeMiscs.every((miscKeys) => miscKeys.includes(key)),
      ),
    ).toBe(true);
  });

  it('returns keys sorted alphabetically', async () => {
    const keys = await getAvailableTranslationKeys('UNIT');

    expect(keys).toContain('unit-g');
    expect(keys).toEqual([...keys].sort());
  });

  it('builds the list for every metadata type', async () => {
    const byType = await getAvailableTranslationKeysByType();

    expect(Object.keys(byType).sort()).toEqual(
      [
        'ALLERGEN',
        'CATEGORY',
        'COST_LEVEL',
        'CUISINE',
        'DIET',
        'DIFFICULTY_LEVEL',
        'EQUIPMENT',
        'LABEL',
        'SERVING_UNIT',
        'UNIT',
      ].sort(),
    );
    expect(byType.SERVING_UNIT).toContain('serving-unit-person');
    expect(byType.COST_LEVEL).toContain('cost-level-low');
  });
});
