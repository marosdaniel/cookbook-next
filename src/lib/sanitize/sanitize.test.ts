import { describe, expect, it } from 'vitest';

import { sanitizeOptional, sanitizeText } from './sanitize';

describe('sanitizeText', () => {
  it('removes tags and trims whitespace', () => {
    expect(sanitizeText('<strong>Hello</strong>  ')).toBe('Hello');
  });

  it('returns an empty string for values that contain only tags', () => {
    expect(sanitizeText('<p><span></span></p>')).toBe('');
  });
});

describe('sanitizeOptional', () => {
  it('returns undefined for nullish values', () => {
    expect(sanitizeOptional(null)).toBeUndefined();
    expect(sanitizeOptional(undefined)).toBeUndefined();
  });

  it('sanitizes string values', () => {
    expect(sanitizeOptional('<em>World</em>')).toBe('World');
  });
});
