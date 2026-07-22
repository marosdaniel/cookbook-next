import { describe, expect, it } from 'vitest';
import { SECTION_ITEMS } from './consts';

describe('SECTION_ITEMS', () => {
  it('exposes the composer sections in the expected order', () => {
    expect(SECTION_ITEMS.map((item) => item.key)).toEqual([
      'basics',
      'media',
      'ingredients',
      'steps',
    ]);
    expect(SECTION_ITEMS.map((item) => item.labelKey)).toEqual([
      'basics',
      'media',
      'ingredients',
      'steps',
    ]);
  });
});
