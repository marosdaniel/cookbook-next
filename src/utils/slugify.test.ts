import { describe, expect, it } from 'vitest';
import { slugify } from './slugify';

describe('slugify', () => {
  it('lowercases and converts spaces to hyphens', () => {
    expect(slugify('Pasta Carbonara')).toBe('pasta-carbonara');
  });

  it('strips diacritics from accented characters', () => {
    expect(slugify('Túrós Csusza')).toBe('turos-csusza');
    expect(slugify('Käsespätzle')).toBe('kasespatzle');
  });

  it('collapses punctuation and repeated separators into a single hyphen', () => {
    expect(slugify("Mom's  Best!! Chili & Rice")).toBe('mom-s-best-chili-rice');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify("  -Grandma's Soup-  ")).toBe('grandma-s-soup');
  });

  it('returns an empty string for input with no alphanumeric characters', () => {
    expect(slugify('!!!')).toBe('');
  });
});
